import { Document, Model, Schema, connection, model } from 'mongoose';
import { decrypt, encrypt } from '../lib/aes256cbc';
import {
    delCache,
    existsCache,
    getCache,
    getCacheDate,
    setCache,
} from '../lib/redis';
import jwt, { VerifyErrors } from 'jsonwebtoken';

import { Context } from 'koa';
import autoIncrement from 'mongoose-auto-increment';
import { uid } from 'rand-token';

// const domain = (process.env.APP_DOMAIN as string) || 'localhost';

export interface UserTypeModel extends Document {
    _id: string;
    uid: number;
    nickname?: string;
    profileImage?: string;
    createdAt: Date;
    authority: string[];
    generateAccessToken: (ctx: Context) => string;
    generateRefreshToken: (ctx: Context) => Promise<string>;
}

export interface UserVerifyResult {
    error?: string | undefined;
    user?: UserTypeModel | undefined;
}

export interface UserStaticsModel extends Model<UserTypeModel> {
    verify: (ctx: Context) => Promise<UserVerifyResult>;
}

const UserSchema = new Schema<UserTypeModel>({
    _id: String,
    uid: {
        type: Number,
        unique: true,
        index: true,
    },
    nickname: String,
    profileImage: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    authority: {
        type: [String],
        required: true,
        default: [],
    },
});

UserSchema.methods.generateAccessToken = function (ctx: Context): string {
    const token = encrypt(
        jwt.sign(
            {
                _id: this._id,
                uid: this.uid,
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: 60 * 10,
            },
        ),
    );

    if (ctx) {
        ctx.cookies.set('access_token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 10,
            // domain: 'https://lov.blackolf.com',
            sameSite: 'lax',
            // secure: process.env.NODE_ENV === 'production',
            // signed: true,
            overwrite: true,
        });
    }

    return token;
};

UserSchema.methods.generateRefreshToken = async function (
    ctx: Context,
): Promise<string> {
    let token: string;

    while (true) {
        try {
            token = uid(32);
            const key = `token_${token}`;

            if (await existsCache(key)) {
                continue;
            }

            await setCache(key, this._id.toString(), 1000 * 60 * 60 * 24);
            break;
        } catch {
            console.warn('retry generate token');
        }
    }

    if (ctx) {
        ctx.cookies.set('refresh_token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            // domain: 'https://lov.blackolf.com',
            sameSite: 'lax',
            // secure: process.env.NODE_ENV === 'production',
            // signed: true,
            overwrite: true,
        });
    }

    return token;
};

UserSchema.statics.verify = async function (
    ctx: Context,
): Promise<UserVerifyResult> {
    const accessToken = ctx.cookies.get('access_token');
    const refreshToken = ctx.cookies.get('refresh_token');

    type JwtVerify<T> = {
        error: VerifyErrors | null;
        decoded: T | undefined;
    };

    type Access = {
        _id: string;
        uid: number;
        exp: number;
    };

    const jwtVerify = <T>(
        token: string,
        secret: string,
    ): Promise<JwtVerify<T>> => {
        return new Promise((resolve) => {
            jwt.verify(token, secret, (error, decoded) => {
                return resolve({ error, decoded: decoded as T | undefined });
            });
        });
    };

    try {
        if (accessToken) {
            const accessTokenVerify = await jwtVerify<Access>(
                decrypt(accessToken as string),
                process.env.JWT_SECRET as string,
            );

            if (accessTokenVerify.error) {
                return { error: accessTokenVerify.error.message };
            }

            const { _id, uid, exp } = accessTokenVerify.decoded as Access;
            const user: UserTypeModel = await this.findOne({ _id, uid });
            const now = Math.floor(Date.now() * 0.001);
            if (exp - now < 60 * 5) {
                await user.generateAccessToken(ctx);
            }

            return { user };
        } else if (refreshToken) {
            const key = `token_${refreshToken}`;
            const id: string = (await getCache(key)) as string;

            if (!id) {
                return { error: 'token modulation' };
            }

            const user: UserTypeModel = await this.findById(id);

            if (!user) {
                return { error: 'not find user' };
            }

            const time = await getCacheDate(key);

            if (time) {
                const exp = new Date(time).getTime();
                const now = Date.now();

                if (exp - now < 1000 * 60 * 60) {
                    delCache(key);
                    await user.generateRefreshToken(ctx);
                }
            } else {
                return { error: 'token modulation' };
            }

            user.generateAccessToken(ctx);
            return { user };
        }
    } catch (e) {
        console.error(e);
        return { error: 'code error' };
    }

    return { error: 'tokenless' };
};

autoIncrement.initialize(connection);
UserSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'uid',
    startAt: 1,
    increment: 1,
});

export default model<UserTypeModel, UserStaticsModel>(
    'User',
    UserSchema,
    'user',
);
