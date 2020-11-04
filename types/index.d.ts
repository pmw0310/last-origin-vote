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
        charNumber?: number;
        charGroupId?: string;
        charGrade?: CharacterGrade;
        charLastGrade?: CharacterGrade;
        charType?: CharacterType;
        charRole?: CharacterRole;
        charClass?: string;
        charArm?: string;
        charStature?: number;
        charWeight?: number;
        charIsAgs?: boolean;
        description?: string;
        id?: string;
        createdAt?: number | Date;
        updateAt?: number | Date;
        group?: GroupInterface;
        likeStats?: LikeStats;
        like?: -1 | 0 | 1;
        type: 'CHARACTER' | 'GROUP';
    }

    export interface GroupInterface {
        name?: string;
        profileImage?: string;
        tag?: string[];
        description?: string;
        id?: string;
        createdAt?: number | Date;
        updateAt?: number | Date;
        character?: CharacterInterface[];
        likeStats?: LikeStats;
        like?: -1 | 0 | 1;
        type: 'CHARACTER' | 'GROUP';
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
