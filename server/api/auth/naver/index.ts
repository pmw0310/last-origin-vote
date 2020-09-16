import { DefaultState, Context } from 'koa';
import Router from 'koa-router';
import passport from 'koa-passport';
import User from '../../../models/user';

const router = new Router<DefaultState, Context>();

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
        } else {
            const count = await User.count({});

            const user = new User({
                _id: ctx.state.user.id,
                nickname: ctx.state.user._json.nickname,
                profileImage: ctx.state.user._json.profile_image,
                authority: count === 0 ? 'admin' : 'user',
            });
            await user.save();
        }
        // ctx.cookies.set('access_token', ctx.state.user.token, {
        //     httpOnly: true,
        //     maxAge: 1000 * 60 * 60 * 12,
        // });
        ctx.redirect('/');
    },
);

router.get('/logout', async (ctx: Context) => {
    console.log('logout');
    ctx.cookies.set('access_token');
    ctx.redirect('/');
});

export default router;
