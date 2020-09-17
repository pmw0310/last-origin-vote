import { DefaultState, Context } from 'koa';
import Router from 'koa-router';
import passport from 'koa-passport';
import User from '../../../models/user';

const router = new Router<DefaultState, Context>();

// const setCookise = (
//     ctx: Context,
//     accessToken: string,
//     refreshToken: string,
// ): void => {
// ctx.cookies.set('access_token', accessToken, {
//     httpOnly: true,
//     maxAge: 1000 * 60 * 10,
// });

// ctx.cookies.set('refresh_token', refreshToken, {
//     httpOnly: true,
//     maxAge: 1000 * 60 * 60 * 24 * 14,
// });

//     console.log('accessToken', accessToken);
//     console.log('refreshToken', refreshToken);
// };

router.get('/', passport.authenticate('naver', { session: false }));

router.get(
    '/callback',
    passport.authenticate('naver', {
        session: false,
        failureRedirect: '/end',
    }),
    async (ctx: Context) => {
        const exists = await User.findOne({
            _id: ctx.state.user.id,
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
                _id: ctx.state.user.id,
                nickname: ctx.state.user._json.nickname,
                profileImage: ctx.state.user._json.profile_image,
                authority: count === 0 ? 'admin' : 'user',
            });
            await user.save();

            user.generateAccessToken(ctx);
            await user.generateRefreshToken(ctx);
        }

        ctx.redirect('/');
    },
);

router.get('/logout', async (ctx: Context) => {
    console.log('logout');
    ctx.cookies.set('access_token', '', {
        httpOnly: true,
        maxAge: 1000 * 60 * 10,
    });

    ctx.cookies.set('refresh_token', '', {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    });
    ctx.redirect('/');
});

export default router;
