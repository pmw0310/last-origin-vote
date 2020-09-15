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

import { generateToken } from './lib/token';
import { schema } from './graphql';
import api from './api';

type naverUser = {
    id: string;
    token: string;
};

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
        playground: dev,
    });
    apolloServer.applyMiddleware({ app: server });

    mongoose
        .connect(process.env.MONGODB_URI as string, {
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
                done: (error: null, user: naverUser) => void,
            ): void => {
                process.nextTick(async () => {
                    const token = await generateToken(profile);

                    const user: naverUser = {
                        id: profile.id,
                        token,
                    };

                    return done(null, user);
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
