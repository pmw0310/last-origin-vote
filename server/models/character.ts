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
    NONE = 'NONE',
    B = 'B',
    A = 'A',
    S = 'S',
    SS = 'SS',
}

export enum CharacterType {
    NONE = 'NONE',
    LIGHT = 'LIGHT',
    FLYING = 'FLYING',
    HEAVY = 'HEAVY',
}

export enum CharacterRole {
    NONE = 'NONE',
    ASSAULT = 'ASSAULT',
    SUPPORT = 'SUPPORT',
    DEFENDER = 'DEFENDER',
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
        type: String,
        enum: enumToArray(CharacterGrade),
        default: CharacterGrade.NONE,
    },
    lastGrade: {
        type: String,
        enum: enumToArray(CharacterGrade),
        default: CharacterGrade.NONE,
    },
    type: {
        type: String,
        enum: enumToArray(CharacterType),
        default: CharacterType.NONE,
    },
    role: {
        type: String,
        enum: enumToArray(CharacterRole),
        default: CharacterRole.NONE,
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
