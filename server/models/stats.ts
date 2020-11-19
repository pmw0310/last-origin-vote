/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Schema, model } from 'mongoose';

import enumToArray from '../lib/enumToArray';

export enum StatsType {
    LINK = 'LINK',
    LIKE_RANKING = 'LIKE_RANKING',
}

export interface StatsTypeModel extends Document {
    data: Array<any>;
    type: StatsType;
    createdAt?: Date;
}

export const StatsSchema = new Schema<StatsTypeModel>({
    data: { type: [Schema.Types.Mixed] },
    type: {
        type: String,
        enum: enumToArray(StatsType),
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default model<StatsTypeModel>('Stats', StatsSchema, 'stats');
