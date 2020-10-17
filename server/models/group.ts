import { Document, Schema, model, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

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

GroupSchema.plugin(mongoosePaginate);

export default model<GroupTypeModel, PaginateModel<GroupTypeModel>>(
    'Group',
    GroupSchema,
);
