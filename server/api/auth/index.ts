import { DefaultState, Context } from 'koa';
import Router from 'koa-router';
import naver from './naver';

const router = new Router<DefaultState, Context>();

router.use('/naver', naver.routes());
router.get('/logout', async (ctx: Context) => {
    console.log('logout');
    ctx.cookies.set('access_token', '', {
        httpOnly: true,
    });

    ctx.cookies.set('refresh_token', '', {
        httpOnly: true,
    });
    ctx.redirect('/');
});

export default router;
