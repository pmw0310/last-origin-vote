declare module 'Module' {
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
}
