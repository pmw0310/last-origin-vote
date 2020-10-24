import { Document, Schema, Types, model } from 'mongoose';

export interface LinkTypeModel extends Document {
    user: string;
    target: string;
    type: string;
    link: -1 | 0 | 1;
    updateAt: Date;
}

const LinkSchema = new Schema<LinkTypeModel>({
    user: { type: Types.ObjectId, index: true, required: true },
    target: { type: Types.ObjectId, index: true, required: true },
    type: { type: String, enum: ['CHARACTER', 'GROUP'], required: true },
    link: { type: Number, enum: [-1, 0, 1], required: true },
    updateAt: {
        type: Date,
        default: Date.now,
    },
});

export default model<LinkTypeModel>('User', LinkSchema);
