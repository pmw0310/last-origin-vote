import { createUnionType, ClassType } from 'type-graphql';
import { Character, CharacterInterface } from './character';
import { Group, GroupInterface } from './group';
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

export const BasicInputUnion = createUnionType<
    [ClassType<Character>, ClassType<Group>]
>({
    name: 'BasicUnion',
    types: () => [CharacterInterface, GroupInterface],
    resolveType: (value) => {
        if (value.basicType === BasicDataType.CHARACTER) {
            return CharacterInterface;
        }
        if (value.basicType === BasicDataType.GROUP) {
            return GroupInterface;
        }
        return undefined;
    },
});
