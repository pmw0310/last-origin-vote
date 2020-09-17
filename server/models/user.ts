import { Context } from 'koa';
import { Document, Schema, model, connection, Model } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { uid } from 'rand-token';
import bcrypt from 'bcrypt';
import jwt, { VerifyErrors } from 'jsonwebtoken';

export interface UserTypeModel extends Document {
    _id: string;
    uid: number;
    token?: string;
    nickname?: string;
    profileImage?: string;
    createdAt: number;
    authority: string[];
    generateAccessToken: (ctx?: Context) => string;
    generateRefreshToken: (ctx?: Context) => Promise<string>;
}

export interface UserStaticsModel extends Model<UserTypeModel> {
    verify: (ctx: Context) => Promise<unknown>;
}

const UserSchema = new Schema<UserTypeModel>({
    _id: String,
    uid: {
        type: Number,
        unique: true,
        index: true,
    },
    token: String,
    nickname: String,
    profileImage: String,
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    authority: {
        type: String,
        required: true,
        enum: ['user', 'admin'],
        default: 'user',
    },
});

UserSchema.methods.generateAccessToken = function (ctx?: Context): string {
    const token = jwt.sign(
        {
            _id: this._id,
            uid: this.uid,
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: 60 * 10,
        },
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
    ctx?: Context,
): Promise<string> {
    this.token = uid(16);
    await this.save();

    const token = jwt.sign(
        {
            token: this.token,
            key: await bcrypt.hash(this.createdAt.toString(), 10),
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: '14d',
        },
    );

    if (ctx) {
        ctx.cookies.set('refresh_token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 14,
        });
    }

    return token;
};

UserSchema.statics.verify = async function (ctx: Context) {
    const accessToken = ctx.cookies.get('access_token') as string;
    const refreshToken = ctx.cookies.get('refresh_token') as string;

    type JwtVerify = {
        error: VerifyErrors | null;
        decoded: User | Refresh | undefined;
    };

    type User = {
        _id: string;
        uid: number;
    };

    type Refresh = {
        token: string;
        key: string;
        exp: number;
    };

    const { _id: userId, uid: userUid } = jwt.decode(accessToken) as User;
    const user = await this.findOne({ _id: userId });

    const jwtVerify = (token: string, secret: string): Promise<JwtVerify> => {
        return new Promise((resolve) => {
            jwt.verify(token, secret, (error, decoded) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return resolve({ error, decoded: decoded as any });
            });
        });
    };

    const accessTokenVerify = await jwtVerify(
        accessToken,
        process.env.JWT_SECRET as string,
    );

    if (accessTokenVerify.error) {
        if (accessTokenVerify.error.name === 'TokenExpiredError') {
            if (userId !== user._id || userUid !== user.uid) {
                return { error: 403, user: undefined };
            }

            const refreshTokenVerify = await jwtVerify(
                refreshToken,
                process.env.JWT_SECRET as string,
            );

            if (refreshTokenVerify.error) {
                if (accessTokenVerify.error.name === 'TokenExpiredError') {
                    const decode = jwt.decode(refreshToken);
                    const dc: Refresh = decode as Refresh;

                    if (
                        dc.token !== user.token ||
                        !(await bcrypt.compare(
                            user.createdAt.toString(),
                            dc.key,
                        ))
                    ) {
                        return { error: 403, user: undefined };
                    }

                    await user.generateRefreshToken(ctx);
                }
            }

            const now = Math.floor(Date.now() * 0.001);
            if (
                (refreshTokenVerify.decoded as Refresh).exp - now <
                60 * 60 * 24
            ) {
                await user.generateRefreshToken(ctx);
            }

            user.generateAccessToken(ctx);

            return { error: undefined, user };
        }
        return { error: 403, user: undefined };
    }

    const dc: User = accessTokenVerify.decoded as User;

    if (dc._id === user._id && dc.uid === user.uid) {
        return { error: undefined, user };
    }

    return { error: 403, user: undefined };
};

export default model<UserTypeModel, UserStaticsModel>('User', UserSchema);

autoIncrement.initialize(connection);
UserSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'uid',
    startAt: 1,
    increment: 1,
});
