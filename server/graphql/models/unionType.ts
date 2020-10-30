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
        if (
            value.basicType === BasicDataType.CHARACTER ||
            'number' in value ||
            'groupId' in value ||
            'group' in value ||
            'grade' in value ||
            'lastGrade' in value ||
            'type' in value ||
            'role' in value ||
            'class' in value ||
            'arm' in value ||
            'stature' in value ||
            'weight' in value
        ) {
            return Character;
        }
        if (value.basicType === BasicDataType.GROUP || 'character' in value) {
            return Group;
        }
        return undefined;
    },
});
