import 'reflect-metadata';

import Koa, { DefaultState, Context, Next } from 'koa';
// import morgan from 'koa-morgan';
import Router from 'koa-router';
import Bodyparser from 'koa-bodyparser';
import staticServe from 'koa-static';
// import proxy from 'koa-proxies';
import helmet from 'koa-helmet';
import passport from 'koa-passport';
import { Strategy, Profile } from 'passport-naver';
import { ApolloServer } from 'apollo-server-koa';
import { graphqlUploadKoa } from 'graphql-upload';
import mongoose from 'mongoose';
import next from 'next';
import { existsSync, mkdirSync } from 'fs';
import LruCache from 'lru-cache';
import url from 'url';

import { schema } from './graphql';
import api from './api';
import User from './models/user';

const dir: string = __dirname + '/upload';
!existsSync(dir) && mkdirSync(dir);

const port = parseInt(process.env.PORT || '4000', 10);
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

(async () => {
    await app.prepare();

    const server = new Koa();
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
        await mongoose.connect(process.env.MONGODB_URI as string, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        console.log('Connected to MongoDB');
    } catch (e) {
        console.error(e);
    }

    router.get('/', renderAndCache);
    router.get('/a', renderAndCache);
    router.get('/b', renderAndCache);
    router.get('/char/add', renderAndCache);
    router.use('/api', api.routes());
    router.get('/(.*)', async (ctx: Context) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
    });

    if (dev) {
        server.use(staticServe(`${__dirname}/upload`));
    }

    server
        .use(async (ctx: Context, next: Next) => {
            ctx.res.statusCode = 200;
            await next();
        })
        .use(Bodyparser())
        .use(helmet())
        .use(router.routes())
        .use(router.allowedMethods())
        .use(passport.initialize())
        .use(graphqlUploadKoa({ maxFileSize: 16777216, maxFiles: 1 }));

    passport.use(
        new Strategy(
            {
                clientID: process.env.NAVER_CLIENT_ID as string,
                clientSecret: process.env.NAVER_CLIENT_SECRET as string,
                callbackURL: `http://localhost:${port}/api/auth/naver/callback`,
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
        console.log(`> Next on http://localhost:${port}`);
        console.log(
            `> GraphQL on http://localhost:${port}${apolloServer.graphqlPath}`,
        );
    });
})();
