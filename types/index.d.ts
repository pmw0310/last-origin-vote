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
        state: boolean;
    };

    export interface CharacterInterface {
        name?: string;
        profileImage?: string;
        tag?: string[];
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
}
