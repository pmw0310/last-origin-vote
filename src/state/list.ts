import { Type } from '../module';
import { atom } from 'recoil';

export enum Order {
    ASC = 'ASC',
    DESC = 'DESC',
}
export enum Sort {
    name = 'name',
    charNumber = 'charNumber',
    charGrade = 'charGrade',
    charStature = 'charStature',
    charWeight = 'charWeight',
}

export interface option {
    search: string;
    page: number;
    order: Order;
    focus: Type;
    sort: Sort;
}

export const listOption = atom<option>({
    key: 'list/option',
    default: {
        search: '',
        page: 1,
        order: Order.ASC,
        focus: Type.CHARACTER,
        sort: Sort.name,
    },
});
