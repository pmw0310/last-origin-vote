import { Document, Schema, Types, model } from 'mongoose';

export interface LinkTypeModel extends Document {
    user: string;
    target: string;
    like: -1 | 1;
    updateAt?: Date;
}

export interface LinkStatsTypeModel {
    like: number;
    notLike: number;
    updateAt?: Date;
}

export const LinkStatsSchema = new Schema<LinkStatsTypeModel>(
    {
        like: {
            type: Number,
            default: 0,
            index: true,
        },
        notLike: {
            type: Number,
            default: 0,
            index: true,
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

export default model<LinkTypeModel>('Link', LinkSchema);
