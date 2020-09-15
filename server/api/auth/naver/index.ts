import { DefaultState, Context } from 'koa';
import Router from 'koa-router';
import passport from 'koa-passport';

const router = new Router<DefaultState, Context>();

router.get('/', passport.authenticate('naver', { session: false }));

router.get(
    '/callback',
    passport.authenticate('naver', {
        session: false,
        failureRedirect: '/end',
    }),
    (ctx: Context) => {
        ctx.cookies.set('access_token', ctx.state.user.token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 12,
        });
        ctx.redirect('/');
    },
);

router.get('/logout', async (ctx: Context) => {
    console.log('logout');
    ctx.cookies.set('access_token');
    ctx.redirect('/');
});

export default router;
