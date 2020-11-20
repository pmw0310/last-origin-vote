import 'reflect-metadata';

import Koa, { Context, DefaultState, Next } from 'koa';
// import { RateLimit } from 'koa2-ratelimit';
import { Profile, Strategy } from 'passport-naver';
import User, { UserTypeModel } from './models/user';
import { existsSync, mkdirSync } from 'fs';
import {
    getCache,
    init as redisInit,
    removeAllCache,
    setCache,
} from './lib/redis';

import { ApolloServer } from 'apollo-server-koa';
import Bodyparser from 'koa-bodyparser';
// import morgan from 'koa-morgan';
import Router from 'koa-router';
import api from './api';
import authChecker from './lib/authChecker';
import cors from '@koa/cors';
import { graphqlUploadKoa } from 'graphql-upload';
// import proxy from 'koa-proxies';
import helmet from 'koa-helmet';
import mongooseConnect from './lib/mongooseConnect';
import next from 'next';
import passport from 'koa-passport';
import path from 'path';
import { schema } from './graphql';
import staticServe from 'koa-static-server';
import url from 'url';

const profileDir: string = path.normalize(`${__dirname}/../assets/profile`);
!existsSync(profileDir) && mkdirSync(profileDir);

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function renderAndCache(ctx: Context, next: Next) {
    const parsedUrl = url.parse(ctx.url, true);
    const { query, pathname, path } = parsedUrl;
    const cacheKey = `html_${path}`;

    const cache = await getCache(cacheKey);

    if (cache) {
        console.log('use html cache', path);
        ctx.body = cache;
        await next();
        ctx.respond = false;
        return;
    }
    try {
        const html = await app.renderToHTML(
            ctx.req,
            ctx.res,
            pathname as string,
            query,
        );
        if (ctx.res.statusCode === 200 && html) {
            await setCache(cacheKey, html, 1000 * 60 * 15);
        }
        ctx.body = html;
        await next();
        ctx.respond = false;
    } catch (err) {
        app.renderError(err, ctx.req, ctx.res, pathname as string, query);
    }
}

const authCheck = (roles: Array<string>) => async (
    ctx: Context,
    next: Next,
) => {
    const { user, error } = await User.verify(ctx);
    if (error) {
        ctx.redirect('/');
    }

    const auth = authChecker(user as UserTypeModel, roles);
    if (auth) {
        return await next();
    }
    ctx.redirect('/');
};

(async () => {
    await app.prepare();

    await redisInit();
    removeAllCache();

    const uri = (process.env.URI as string) || 'http://localhost:4000';
    const port = parseInt(process.env.PORT || '4000', 10);

    const server = new Koa();
    // server.use(
    //     RateLimit.middleware({
    //         interval: { min: 1 },
    //         max: 150,
    //     }),
    // );
    const router = new Router<DefaultState, Context>();
    const apolloServer = new ApolloServer({
        schema,
        debug: dev,
        introspection: dev,
        playground: dev
            ? {
                  settings: {
                      'request.credentials': 'same-origin',
                  },
              }
            : false,
        context: async ({ ctx }) => {
            const currentUser = await User.verify(ctx);
            return { currentUser };
        },
    });
    apolloServer.applyMiddleware({ app: server });

    try {
        await mongooseConnect();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    router.get('/', renderAndCache);
    router.get('/ranking', renderAndCache);
    router.get('/character/add', authCheck(['set']), renderAndCache);
    router.get('/character/:id', authCheck(['set']), renderAndCache);
    router.get('/group/add', authCheck(['set']), renderAndCache);
    router.get('/group/:id', authCheck(['set']), renderAndCache);
    router.use('/api', api.routes());
    router.get('/(.*)', async (ctx: Context) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
    });

    server
        .use(async (ctx: Context, next: Next) => {
            ctx.res.statusCode = 200;
            await next();
        })
        .use(cors({ origin: uri, allowMethods: 'GET,POST' }))
        .use(Bodyparser())
        .use(helmet())
        .use(
            helmet.contentSecurityPolicy({
                directives: {
                    baseUri: [uri],
                    connectSrc: [uri],
                    imgSrc: [
                        uri,
                        'data:',
                        'https://via.placeholder.com',
                        'https://phinf.pstatic.net',
                        'https://ssl.pstatic.net',
                    ],
                    scriptSrc: ["'unsafe-eval'", uri],
                    mediaSrc: ["'none'"],
                    objectSrc: ["'none'"],
                },
            }),
        )
        .use(
            staticServe({
                rootDir: path.normalize(`${__dirname}/../assets/public`),
                rootPath: '/public',
                index: '',
                maxage: 2592000000,
            }),
        )
        .use(
            staticServe({
                rootDir: profileDir,
                rootPath: '/profile',
                index: '',
                maxage: 2592000000,
            }),
        )
        .use(router.routes())
        .use(router.allowedMethods())
        .use(passport.initialize())
        .use(graphqlUploadKoa({ maxFileSize: 16777216, maxFiles: 1 }));

    passport.use(
        new Strategy(
            {
                clientID: process.env.NAVER_CLIENT_ID as string,
                clientSecret: process.env.NAVER_CLIENT_SECRET as string,
                callbackURL: `${uri}/api/auth/naver/callback`,
            },
            (
                _accessToken: string,
                _refreshToken: string,
                profile: Profile,
                done: (error: null, user: Profile) => void,
            ): void => {
                process.nextTick(async () => {
                    return done(null, profile);
                });
            },
        ),
    );

    server.listen(port, () => {
        console.log(`> Next on ${uri}`);
        console.log(`> GraphQL on ${uri}${apolloServer.graphqlPath}`);
    });
})();
