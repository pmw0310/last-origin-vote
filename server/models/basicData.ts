import { Document, Schema, model, Types, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import enumToArray from '../lib/enumToArray';
import { LinkStatsTypeModel, LinkStatsSchema } from './like';

export enum BasicDataType {
    CHARACTER = 'CHARACTER',
    GROUP = 'GROUP',
}

export interface BasicData {
    name: string;
    profileImage: string;
    createdAt: Date;
    updateAt: Date;
    tag: string[];
    description?: string;
    likeStats: LinkStatsTypeModel;
    basicType: BasicDataType;
}

export interface CharacterModel extends Document, BasicData {
    number: number;
    groupId: string | Types.ObjectId;
    grade: CharacterGrade;
    lastGrade?: CharacterGrade;
    type?: CharacterType;
    role?: CharacterRole;
    class?: string;
    arm?: string;
    stature: number;
    weight: number;
}

export interface GroupModel extends Document, BasicData {}

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

const BasicDataSchema = new Schema<CharacterModel | GroupModel>({
    name: { type: String, index: true },
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
    number: { type: Number, index: true },
    groupId: { type: Types.ObjectId },
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
    stature: { type: Number, default: 0, min: 0 },
    weight: { type: Number, default: 0, min: 0 },
    description: String,
    likeStats: { type: LinkStatsSchema },
});

BasicDataSchema.plugin(mongoosePaginate);

export default model<
    CharacterModel | GroupModel,
    PaginateModel<CharacterModel | GroupModel>
>('BasicData', BasicDataSchema);
