import { Context, DefaultState } from 'koa';

import Router from 'koa-router';
import bcrypt from 'bcrypt';
import passport from 'koa-passport';
import { setCache } from '../../../lib/redis';

const router = new Router<DefaultState, Context>();

router.get('/', passport.authenticate('naver', { session: false }));

router.get(
    '/callback',
    passport.authenticate('naver', {
        session: false,
    }),
    async (ctx: Context) => {
        const id = `naver::${ctx.state.user.id}`;
        const nickname = ctx.state.user._json.nickname;
        const profileImage = ctx.state.user._json.profile_image;

        const hash = await bcrypt.hash(`${id}+${Date.now()}`, 10);

        await setCache(
            `hash_${hash}`,
            { id, nickname, profileImage },
            1000 * 60,
        );

        ctx.redirect(`${process.env.APP_URI as string}/auth?auth=${hash}`);
    },
);

export default router;
