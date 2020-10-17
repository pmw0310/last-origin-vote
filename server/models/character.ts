import { Document, Schema, model, Types, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import enumToArray from '../lib/enumToArray';

export interface CharacterTypeModel extends Document {
    name?: string;
    profileImage?: string;
    createdAt: Date;
    updateAt: Date;
    tag: string[];
    number: number;
    groupId: string;
    grade: CharacterGrade;
    lastGrade?: CharacterGrade;
    type: CharacterType;
    role: CharacterRole;
    class?: string;
    arm?: string;
    stature?: number;
    weight?: number;
    description?: string;
}

export enum CharacterGrade {
    B = 1,
    A,
    S,
    SS,
}

export enum CharacterType {
    LIGHT = 1,
    FLYING,
    HEAVY,
}

export enum CharacterRole {
    ASSAULT = 1,
    SUPPORT,
    DEFEND,
}

const CharacterSchema = new Schema<CharacterTypeModel>({
    name: String,
    profileImage: String,
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
    number: Number,
    groupId: { type: Types.ObjectId, index: true },
    grade: {
        type: Number,
        enum: enumToArray(CharacterGrade),
    },
    lastGrade: {
        type: Number,
        enum: enumToArray(CharacterGrade),
    },
    type: {
        type: Number,
        enum: enumToArray(CharacterType),
    },
    role: {
        type: Number,
        enum: enumToArray(CharacterRole),
    },
    class: String,
    arm: String,
    stature: Number,
    weight: Number,
    description: String,
});

CharacterSchema.plugin(mongoosePaginate);

export default model<CharacterTypeModel, PaginateModel<CharacterTypeModel>>(
    'Character',
    CharacterSchema,
);
