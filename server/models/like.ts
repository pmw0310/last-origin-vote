import { Document, Schema, Types, model } from 'mongoose';

export interface LinkTypeModel extends Document {
    user: string;
    target: string;
    like: -1 | 1;
    updateAt?: Date;
}

export interface likeStatsTypeModel {
    like: number;
    updateAt?: Date;
}

export const likeStatsSchema = new Schema<likeStatsTypeModel>(
    {
        like: {
            type: Number,
            default: 0,
        },
        updateAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false },
);

const LinkSchema = new Schema<LinkTypeModel>({
    user: { type: String, index: true, required: true },
    target: { type: Types.ObjectId, index: true, required: true },
    like: { type: Number, enum: [-1, 1], required: true },
    updateAt: {
        type: Date,
        default: Date.now,
    },
});

export default model<LinkTypeModel>('Link', LinkSchema, 'link');
