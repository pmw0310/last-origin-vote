import 'reflect-metadata';

import Koa, { DefaultState, Context, Next } from 'koa';
import cors from '@koa/cors';
// import morgan from 'koa-morgan';
import Router from 'koa-router';
import Bodyparser from 'koa-bodyparser';
import staticServe from 'koa-static-server';
// import proxy from 'koa-proxies';
import helmet from 'koa-helmet';
import passport from 'koa-passport';
// import { RateLimit } from 'koa2-ratelimit';
import { Strategy, Profile } from 'passport-naver';
import { ApolloServer } from 'apollo-server-koa';
import { graphqlUploadKoa } from 'graphql-upload';
import mongooseConnect from './lib/mongooseConnect';
import next from 'next';
import LruCache from 'lru-cache';
import url from 'url';

import { schema } from './graphql';
import api from './api';
import User, { UserTypeModel } from './models/user';
import authChecker from './lib/authChecker';
import { getAsync, setAsync } from './lib/redis';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const profileDir: string = path.normalize(`${__dirname}/../assets/profile`);
!existsSync(profileDir) && mkdirSync(profileDir);

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const ssrCache = new LruCache({
    max: 100,
    maxAge: 1000 * 60 * 10,
});

async function renderAndCache(ctx: Context, next: Next) {
    const parsedUrl = url.parse(ctx.url, true);
    const { query, pathname, path: cacheKey } = parsedUrl;
    if (ssrCache.has(cacheKey)) {
        console.log('use cache', cacheKey);
        ctx.body = ssrCache.get(cacheKey);
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
        if (ctx.res.statusCode === 200) {
            ssrCache.set(cacheKey, html);
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
    router.get('/stats', renderAndCache);
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
        .use(cors())
        .use(Bodyparser())
        .use(helmet())
        .use(
            helmet.contentSecurityPolicy({
                directives: {
                    baseUri: [uri],
                    connectSrc: [uri],
                    imgSrc: [
                        uri,
                        'https://via.placeholder.com',
                        'https://res-5.cloudinary.com',
                        'data:',
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

    await setAsync('test', 'aa1');
    const test = await getAsync('test');
    console.log(test);

    server.listen(port, () => {
        console.log(`> Next on ${uri}`);
        console.log(`> GraphQL on ${uri}${apolloServer.graphqlPath}`);
    });
})();
