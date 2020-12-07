import { LikeStats } from '../module';
import { atom } from 'recoil';

export type likeDataType = { [id: string]: LikeStats };

export const likeAtom = atom<likeDataType>({
    key: 'like',
    default: {},
});
