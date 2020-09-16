import { Document, Schema, model, connection } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { uid } from 'rand-token';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface UserTypeModel extends Document {
    _id: string;
    uid: number;
    token?: string;
    nickname?: string;
    profileImage?: string;
    createdAt: number;
    authority: string[];
    generateAccessToken: () => string;
    generateRefreshToken: () => string;
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

UserSchema.methods.generateAccessToken = function (): string {
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
    return token;
};

UserSchema.methods.generateRefreshToken = function (): string {
    this.token = uid(16);

    const token = jwt.sign(
        {
            token: this.token,
            key: bcrypt.hash(this.createdAt.toString(), 10),
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: '14d',
        },
    );

    return token;
};

export default model<UserTypeModel>('User', UserSchema);

autoIncrement.initialize(connection);
UserSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'uid',
    startAt: 1,
    increment: 1,
});
