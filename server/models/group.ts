import { Document, Schema, model, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { LinkStatsTypeModel, LinkStatsSchema } from './like';

export interface GroupTypeModel extends Document {
    name?: string;
    image?: string;
    createdAt: Date;
    updateAt: Date;
    tag: string[];
    description?: string;
    linkStats: LinkStatsTypeModel;
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
    likeStats: { type: LinkStatsSchema },
});

GroupSchema.plugin(mongoosePaginate);

export default model<GroupTypeModel, PaginateModel<GroupTypeModel>>(
    'Group',
    GroupSchema,
);
