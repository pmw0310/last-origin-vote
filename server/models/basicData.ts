import { Document, PaginateModel, Schema, Types, model } from 'mongoose';
import { likeStatsSchema, likeStatsTypeModel } from './like';

import enumToArray from '../lib/enumToArray';
import mongoosePaginate from 'mongoose-paginate-v2';

export enum BasicDataType {
    CHARACTER = 'CHARACTER',
    GROUP = 'GROUP',
    SKIN = 'SKIN',
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

export interface SkinModel extends Document, BasicData {
    skinCharId: string | Types.ObjectId;
}

export enum CharacterGrade {
    B = 1,
    A = 2,
    S = 3,
    SS = 4,
}

export enum CharacterType {
    LIGHT = 1,
    FLYING = 2,
    HEAVY = 3,
}

export enum CharacterRole {
    ASSAULT = 1,
    SUPPORT = 2,
    DEFENDER = 3,
}

const BasicDataSchema = new Schema<CharacterModel | GroupModel | SkinModel>({
    name: {
        type: String,
        index: true,
        unique: true,
    },
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
        required: true,
    },

    charNumber: { type: Number },
    charGroupId: { type: Types.ObjectId },
    charGrade: {
        type: Number,
        enum: enumToArray(CharacterGrade),
    },
    charLastGrade: {
        type: Number,
        enum: enumToArray(CharacterGrade),
    },
    charType: {
        type: Number,
        enum: enumToArray(CharacterType),
    },
    charRole: {
        type: Number,
        enum: enumToArray(CharacterRole),
    },
    charClass: String,
    charArm: String,
    charStature: { type: Number, min: 0 },
    charWeight: { type: Number, min: 0 },
    charIsAgs: Boolean,
    skinCharId: { type: Types.ObjectId },
});

BasicDataSchema.plugin(mongoosePaginate);

export default model<
    CharacterModel | GroupModel,
    PaginateModel<CharacterModel | GroupModel>
>('BasicData', BasicDataSchema, 'basicdata');
