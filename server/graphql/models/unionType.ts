import { ClassType, createUnionType } from 'type-graphql';

import { BasicDataType } from '../../models/basicData';
import { Character } from './character';
import { Group } from './group';
import { Skin } from './skin';

export const BasicUnion = createUnionType<
    [ClassType<Character>, ClassType<Group>, ClassType<Skin>]
>({
    name: 'BasicUnion',
    types: () => [Character, Group, Skin],
    resolveType: (value) => {
        if (value.type === BasicDataType.CHARACTER) {
            return Character;
        }
        if (value.type === BasicDataType.GROUP) {
            return Group;
        }
        if (value.type === BasicDataType.SKIN) {
            return Skin;
        }
        return undefined;
    },
});
