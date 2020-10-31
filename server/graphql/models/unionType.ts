import { createUnionType, ClassType } from 'type-graphql';
import { Character } from './character';
import { Group } from './group';
import { BasicDataType } from '../../models/basicData';

export const BasicUnion = createUnionType<
    [ClassType<Character>, ClassType<Group>]
>({
    name: 'BasicUnion',
    types: () => [Character, Group],
    resolveType: (value) => {
        if (value.basicType === BasicDataType.CHARACTER) {
            return Character;
        }
        if (value.basicType === BasicDataType.GROUP) {
            return Group;
        }
        return undefined;
    },
});
