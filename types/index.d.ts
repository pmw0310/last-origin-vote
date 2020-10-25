declare module 'Module' {
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
        notLike: number;
    };

    export interface CharacterInterface {
        name?: string;
        profileImage?: string;
        tag?: string[];
        number?: number;
        groupId?: string;
        grade?: string;
        lastGrade?: string;
        type?: string;
        role?: string;
        class?: string;
        arm?: string;
        stature?: number;
        weight?: number;
        description?: string;
        id?: string;
        createdAt?: number | Date;
        updateAt?: number | Date;
        group?: GroupInterface;
        likeStats?: LikeStats;
        like?: -1 | 0 | 1;
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
        likeStats?: LikeStats;
        like?: -1 | 0 | 1;
    }

    // enum CharacterGrade {
    //     B = 1,
    //     A,
    //     S,
    //     SS,
    // }

    // enum CharacterType {
    //     LIGHT = 1,
    //     FLYING,
    //     HEAVY,
    // }

    // enum CharacterRole {
    //     ASSAULT = 1,
    //     SUPPORT,
    //     DEFEND,
    // }
}
