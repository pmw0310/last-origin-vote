declare module 'Module' {
    export interface UserInterface {
        id: string;
        uid: string;
        nickname?: string;
        profileImage?: string;
        createdAt: number;
        authority: string[];
    }

    export interface CharacterInterface {
        name?: string;
        profileImage?: string;
        tag?: string[];
        number?: number;
        unit?: string;
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
        createdAt?: Date;
        updateAt?: Date;
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
