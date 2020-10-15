declare module 'Module' {
    export interface UserInterface {
        id?: string;
        uid?: number;
        nickname?: string;
        profileImage?: string;
        createdAt?: number | Date;
        authority?: string[];
    }

    export interface CharacterInterface {
        name?: string;
        profileImage?: string;
        tag?: string[];
        number?: number;
        groupId?: string;
        grade?: CharacterGrade;
        lastGrade?: CharacterGrade;
        type?: CharacterType;
        role?: CharacterRole;
        class?: string;
        arm?: string;
        stature?: number;
        weight?: number;
        description?: string;
        id?: string;
        createdAt?: number | Date;
        updateAt?: number | Date;
        group?: GroupInterface;
    }

    export interface GroupInterface {
        name?: string;
        image?: string;
        tag?: string[];
        description?: string;
        id?: string;
        createdAt?: number | Date;
        updateAt?: number | Date;
        character?: CharacterInterface[];
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
}
