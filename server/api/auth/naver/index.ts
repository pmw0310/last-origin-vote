import { Context, DefaultState, Next } from 'koa';

import Router from 'koa-router';
import User from '../../../models/user';
import passport from 'koa-passport';

const router = new Router<DefaultState, Context>();

router.get('/', passport.authenticate('naver', { session: false }));

router.get(
    '/callback',
    passport.authenticate('naver', {
        session: false,
    }),
    async (ctx: Context, next: Next) => {
        ctx.url = process.env.APP_URI as string;

        const exists = await User.findOne({
            _id: `naver::${ctx.state.user.id}`,
        });

        if (exists) {
            exists.nickname = ctx.state.user._json.nickname;
            exists.profileImage = ctx.state.user._json.profile_image;
            await exists.save();

            exists.generateAccessToken(ctx);
            await exists.generateRefreshToken(ctx);
        } else {
            const count = await User.count({});

            const user = new User({
                _id: `naver::${ctx.state.user.id}`,
                nickname: ctx.state.user._json.nickname,
                profileImage: ctx.state.user._json.profile_image,
            });

            if (count === 0) {
                user.authority = ['admin'];
            }
            await user.save();

            user.generateAccessToken(ctx);
            await user.generateRefreshToken(ctx);
        }

        const accessToken = ctx.cookies.get('access_token');
        const refreshToken = ctx.cookies.get('refresh_token');
        ctx.body = `${accessToken}, ${refreshToken}`;

        // ctx.redirect(process.env.APP_URI as string);

        await next();
    },
);

export default router;
