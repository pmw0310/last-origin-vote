import Koa, { DefaultState, Context } from 'koa';
// import morgan from 'koa-morgan';
import mount from 'koa-mount';
import Router from 'koa-router';
import Bodyparser from 'koa-bodyparser';
// import proxy from 'koa-proxies';
import helmet from 'koa-helmet';
import passport from 'koa-passport';
import { Strategy, Profile } from 'passport-naver';
import { ApolloServer } from 'apollo-server-koa';
import mongoose from 'mongoose';
import next from 'next';

import { schema } from './graphql';
import api from './api';
import User from './models/user';

const port = parseInt(process.env.PORT || '4000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

function renderNext(route: string) {
    return async (ctx: Context) => {
        ctx.res.statusCode = 200;
        ctx.respond = false;

        app.render(ctx.req, ctx.res, route, {
            ...((ctx.request && ctx.request.body) || {}),
            ...ctx.params,
            ...ctx.query,
        });
    };
}

app.prepare().then(() => {
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
            const user = await User.verify(ctx);
            return { user };
        },
    });
    apolloServer.applyMiddleware({ app: server });

    mongoose
        .connect(process.env.MONGODB_URI as string, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((e) => {
            console.error(e);
        });

    router.get('/', renderNext('/'));
    router.use('/api', api.routes());

    router.get('/test', async (ctx: Context) => {
        // const accessToken = ctx.cookies.get('access_token') as string;
        // const refreshToken = ctx.cookies.get('refresh_token') as string;
        // console.log('accessToken', accessToken);
        // console.log('refreshToken', refreshToken);
        const user = await User.verify(ctx);

        ctx.body = user;
    });

    server
        .use(Bodyparser())
        .use(helmet())
        .use(router.routes())
        .use(router.allowedMethods())
        .use(passport.initialize())
        // .use(morgan('combined'))
        .use(
            mount('/', async (ctx: Context) => {
                ctx.respond = false;
                handle(ctx.req, ctx.res);
            }),
        );

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
        // console.log(process.env.MONGODB_HOST);
    });
});
