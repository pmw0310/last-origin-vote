import { Context, DefaultState } from 'koa';

import Router from 'koa-router';
import { delCache } from '../../lib/redis';
import naver from './naver';

const router = new Router<DefaultState, Context>();
const domain = (process.env.APP_DOMAIN as string) || 'localhost';

router.use('/naver', naver.routes());
router.get('/logout', async (ctx: Context) => {
    const token = ctx.cookies.get('refresh_token');
    if (token) {
        delCache(`token_${token}`);
    }
    ctx.cookies.set('access_token', '', {
        httpOnly: true,
        domain,
    });

    ctx.cookies.set('refresh_token', '', {
        httpOnly: true,
        domain,
    });
    ctx.redirect(process.env.APP_URI as string);
});

export default router;
