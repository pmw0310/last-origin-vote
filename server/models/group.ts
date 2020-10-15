import { Document, Schema, model } from 'mongoose';

export interface GroupTypeModel extends Document {
    name?: string;
    image?: string;
    createdAt: Date;
    updateAt: Date;
    tag: string[];
    description?: string;
}

const GroupSchema = new Schema<GroupTypeModel>({
    name: String,
    image: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updateAt: {
        type: Date,
        default: Date.now,
    },
    tag: {
        type: [String],
        default: [],
    },
    description: String,
});

export default model<GroupTypeModel>('Group', GroupSchema);
