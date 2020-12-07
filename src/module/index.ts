export interface UserInterface {
    id?: string;
    uid?: number;
    nickname?: string;
    profileImage?: string;
    createdAt?: number | Date;
    authority?: string[];
}

export type LikeStats = {
    like: number;
    state: boolean;
};

export enum Type {
    CHARACTER = 'CHARACTER',
    GROUP = 'GROUP',
    SKIN = 'SKIN',
}

export interface BasicInterface {
    id?: string;
    name?: string;
    profileImage?: string;
    createdAt?: number;
    updateAt?: number;
    tag?: string[];
    description?: string;
    likeStats?: LikeStats;
    type?: Type;
    like?: 0 | 1;
}

export interface CharacterInterface extends BasicInterface {
    charNumber?: number;
    charGroupId?: string;
    charGrade?: number;
    charLastGrade?: number;
    charType?: number;
    charRole?: number;
    charClass?: string;
    charArm?: string;
    charStature?: number;
    charWeight?: number;
    charIsAgs?: boolean;
    group?: GroupInterface;
    skin?: SkinInterface[];
}

export interface GroupInterface extends BasicInterface {
    member?: CharacterInterface;
}

export interface SkinInterface extends BasicInterface {
    skinCharId?: string;
    character?: CharacterInterface;
}
