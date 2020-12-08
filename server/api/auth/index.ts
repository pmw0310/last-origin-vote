import { Context, DefaultState, Next } from 'koa';
import { delCache, getCache } from '../../lib/redis';

import Router from 'koa-router';
import User from '../../models/user';
import naver from './naver';

const router = new Router<DefaultState, Context>();
const domain = (process.env.APP_DOMAIN as string) || 'localhost';

router.use('/naver', naver.routes());

router.get('/login', async (ctx: Context, next: Next) => {
    const hash = `hash_${ctx.query.auth}`;

    type UserData = {
        id: string;
        nickname: string;
        profileImage: string;
    };

    const userData: UserData = (await getCache(hash)) as UserData;

    if (!userData) {
        ctx.status = 400;
        return next();
    }

    await delCache(hash);

    const exists = await User.findOne({
        _id: userData.id,
    });

    if (exists) {
        exists.nickname = userData.nickname;
        exists.profileImage = userData.profileImage;
        await exists.save();

        exists.generateAccessToken(ctx);
        await exists.generateRefreshToken(ctx);
    } else {
        const count = await User.count({});

        const user = new User({
            _id: userData.id,
            nickname: userData.nickname,
            profileImage: userData.profileImage,
        });

        if (count === 0) {
            user.authority = ['admin'];
        }
        await user.save();

        user.generateAccessToken(ctx);
        await user.generateRefreshToken(ctx);
    }
    ctx.status = 200;
    return next();
});

router.get('/logout', async (ctx: Context) => {
    const token = ctx.cookies.get('refresh_token');
    if (token) {
        delCache(`token_${token}`);
    }
    ctx.cookies.set('access_token', '', {
        httpOnly: true,
        domain,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        overwrite: true,
    });

    ctx.cookies.set('refresh_token', '', {
        httpOnly: true,
        domain,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        overwrite: true,
    });
    ctx.redirect(process.env.APP_URI as string);
});

export default router;
