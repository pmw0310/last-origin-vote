import Koa from 'koa';
// import morgan from 'koa-morgan';
import mount from 'koa-mount';
import Router from 'koa-router';
import Bodyparser from 'koa-bodyparser';
// import proxy from 'koa-proxies';
import helmet from 'koa-helmet';
import passport from 'koa-passport';
// import CSRF from 'koa-csrf';
import { Strategy, Profile } from 'passport-naver';
import { ApolloServer } from 'apollo-server-koa';
import mongoose from 'mongoose';
import next from 'next';
// import { readFileSync } from 'fs';

import { generateToken } from './lib/token';
import typeDefs from './graphql/schema/typeDefs.graphql';

// const t = readFileSync(`${__dirname}/t.json`, 'utf-8');
// console.log(t);

type naverUser = {
    id: string;
    token: string;
};

const port = parseInt(process.env.PORT || '4000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

function renderNext(route: string) {
    return async (ctx: Koa.Context) => {
        ctx.res.statusCode = 200;
        ctx.respond = false;

        app.render(ctx.req, ctx.res, route, {
            ...((ctx.request && ctx.request.body) || {}),
            ...ctx.params,
            ...ctx.query,
        });
    };
}

// const typeDefs = gql`
//     type Query {
//         hello: String
//     }
// `;

const resolvers = {
    Query: {
        hello: () => 'Hello world!',
    },
};

app.prepare().then(() => {
    const server = new Koa();
    const router = new Router<Koa.DefaultState, Koa.Context>();
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    router.get('/naver', passport.authenticate('naver', { session: false }));

    router.get(
        '/naver/callback',
        passport.authenticate('naver', {
            session: false,
            failureRedirect: '/end',
        }),
        (ctx: Koa.Context) => {
            ctx.cookies.set('access_token', ctx.state.user.token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 12,
            });
            ctx.redirect('/');
        },
    );

    router.get('/logout', async (ctx: Koa.Context) => {
        console.log('logout');
        ctx.cookies.set('access_token');
        ctx.redirect('/');
    });

    server
        .use(Bodyparser())
        .use(helmet())
        .use(router.routes())
        .use(router.allowedMethods())
        .use(passport.initialize())
        // .use(morgan('combined'))
        // .use(
        // 	new CSRF({
        // 		invalidTokenMessage: 'Invalid CSRF token',
        // 		invalidTokenStatusCode: 403,
        // 		excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
        // 		disableQuery: false,
        // 	}),
        // )
        .use(
            mount('/', async (ctx: Koa.Context) => {
                ctx.respond = false;
                handle(ctx.req, ctx.res);
            }),
        );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    passport.use(
        new Strategy(
            {
                clientID: process.env.NAVER_CLIENT_ID as string,
                clientSecret: process.env.NAVER_CLIENT_SECRET as string,
                callbackURL: `http://localhost:${port}/naver/callback`,
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
