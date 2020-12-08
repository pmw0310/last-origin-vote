import 'reflect-metadata';

import Koa, { Context, DefaultState } from 'koa';
// import { RateLimit } from 'koa2-ratelimit';
import { Profile, Strategy } from 'passport-naver';
import { existsSync, mkdirSync } from 'fs';
import { init as redisInit, removeAllCache } from './lib/redis';

import { ApolloServer } from 'apollo-server-koa';
import Bodyparser from 'koa-bodyparser';
// import morgan from 'koa-morgan';
import Router from 'koa-router';
import User from './models/user';
import api from './api';
import cors from '@koa/cors';
import dotenv from 'dotenv-flow';
import { graphqlUploadKoa } from 'graphql-upload';
// import proxy from 'koa-proxies';
// import helmet from 'koa-helmet';
import mongooseConnect from './lib/mongooseConnect';
import passport from 'koa-passport';
import path from 'path';
import { schema } from './graphql';
import staticServe from 'koa-static-server';

dotenv.config();

const profileDir: string = path.normalize(`${__dirname}/../assets/profile`);
!existsSync(profileDir) && mkdirSync(profileDir);

const dev = process.env.NODE_ENV !== 'production';

(async () => {
    await redisInit();
    removeAllCache();

    const appUri = (process.env.APP_URI as string) || 'http://localhost:4000';
    const port = parseInt(process.env.PORT || '4001', 10);

    const server = new Koa();
    // server.use(
    //     RateLimit.middleware({
    //         interval: { min: 1 },
    //         max: 150,
    //     }),
    // );

    // server.proxy = true;
    // server.keys = ['test'];

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
    apolloServer.applyMiddleware({
        app: server,
        cors: {
            origin: appUri,
            credentials: true,
        },
    });

    try {
        await mongooseConnect();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    router.use('/api', api.routes());

    server
        .use(
            cors({
                origin: appUri,
                credentials: true,
            }),
        )
        .use(Bodyparser())
        // .use(helmet())
        // .use(
        //     helmet.contentSecurityPolicy({
        //         directives: {
        //             baseUri: [appUri],
        //             connectSrc: [appUri],
        //             imgSrc: [
        //                 appUri,
        //                 'data:',
        //                 'https://via.placeholder.com',
        //                 'https://phinf.pstatic.net',
        //                 'https://ssl.pstatic.net',
        //             ],
        //             scriptSrc: ["'unsafe-eval'", appUri],
        //             mediaSrc: ["'none'"],
        //             objectSrc: ["'none'"],
        //         },
        //     }),
        // )
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
                callbackURL: process.env.NAVER_CLIENT_CALLBACK as string,
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
        console.log(
            `> GraphQL on http://localhost:${port}${apolloServer.graphqlPath}`,
        );
    });
})();
