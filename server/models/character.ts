import { Document, Schema, model } from 'mongoose';

export interface CharacterTypeModel extends Document {
    name?: string;
    profileImage?: string;
    data?: CharacterData;
    createdAt?: Date;
    tag?: string[];
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

export interface CharacterData {
    number: number;
    unit: string;
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

const CharacterSchema = new Schema<CharacterTypeModel>({
    name: String,
    profileImage: String,
    data: Object,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    tag: {
        type: [String],
        default: [],
    },
});

export default model<CharacterTypeModel>('Character', CharacterSchema);
