import { Document, Schema, model, Types, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import enumToArray from '../lib/enumToArray';
import { likeStatsTypeModel, likeStatsSchema } from './like';

export enum BasicDataType {
    CHARACTER = 'CHARACTER',
    GROUP = 'GROUP',
}

interface BasicData {
    name: string;
    profileImage: string;
    createdAt: Date;
    updateAt: Date;
    tag: string[];
    description?: string;
    likeStats: likeStatsTypeModel;
    type: BasicDataType;
}

export interface CharacterModel extends Document, BasicData {
    charNumber: number;
    charGroupId: string | Types.ObjectId;
    charGrade: CharacterGrade;
    charLastGrade?: CharacterGrade;
    charType?: CharacterType;
    charRole?: CharacterRole;
    charClass?: string;
    charArm?: string;
    charStature: number;
    charWeight: number;
    charIsAgs: boolean;
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
    description: String,
    likeStats: { type: likeStatsSchema, default: {} },
    type: {
        type: String,
        enum: enumToArray(BasicDataType),
        index: true,
    },

    charNumber: { type: Number },
    charGroupId: { type: Types.ObjectId },
    charGrade: {
        type: String,
        enum: enumToArray(CharacterGrade),
    },
    charLastGrade: {
        type: String,
        enum: enumToArray(CharacterGrade),
    },
    charType: {
        type: String,
        enum: enumToArray(CharacterType),
    },
    charRole: {
        type: String,
        enum: enumToArray(CharacterRole),
    },
    charClass: String,
    charArm: String,
    charStature: { type: Number, min: 0 },
    charWeight: { type: Number, min: 0 },
    charIsAgs: Boolean,
});

BasicDataSchema.plugin(mongoosePaginate);

export default model<
    CharacterModel | GroupModel,
    PaginateModel<CharacterModel | GroupModel>
>('BasicData', BasicDataSchema);
