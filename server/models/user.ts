import { Context } from 'koa';
import { Document, Schema, model, connection, Model } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { uid } from 'rand-token';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { encrypt, decrypt } from '../lib/aes256cbc';

export interface UserTypeModel extends Document {
    _id: string;
    uid: number;
    token?: string;
    tokenMaxAge?: Date;
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
    token: {
        type: String,
        unique: true,
        index: true,
    },
    tokenMaxAge: Date,
    nickname: String,
    profileImage: String,
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
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
        });
    }

    return token;
};

UserSchema.methods.generateRefreshToken = async function (
    ctx: Context,
): Promise<string> {
    while (true) {
        try {
            this.token = uid(16);
            this.tokenMaxAge = new Date();
            this.tokenMaxAge.setDate(this.tokenMaxAge.getDate() + 1);
            await this.save();
            break;
        } catch {
            console.warn('retry generate token');
        }
    }

    if (ctx) {
        ctx.cookies.set('refresh_token', this.token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
        });
    }

    return this.token;
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
            const user: UserTypeModel = await this.findOne({
                token: refreshToken as string,
            });

            if (!user) {
                return { error: 'token modulation' };
            }

            const exp = (user.tokenMaxAge as Date).getTime();
            const now = Date.now();

            if (exp < now) {
                return { error: 'token timeout' };
            } else if (exp - now < 60 * 60) {
                await user.generateRefreshToken(ctx);
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
