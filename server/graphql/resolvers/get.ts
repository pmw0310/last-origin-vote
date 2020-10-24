/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    createUnionType,
    registerEnumType,
    ClassType,
    ObjectType,
    Field,
    Int,
    ID,
    Resolver,
    Query,
    Args,
    ArgsType,
} from 'type-graphql';
import { Min } from 'class-validator';
import { Types, FilterQuery } from 'mongoose';
import { Character } from './character';
import { Group } from './group';
import CharacterModels, { CharacterTypeModel } from '../../models/character';
import GroupModels, { GroupTypeModel } from '../../models/group';
import { PageInfo } from '../relayStylePagination';

enum FocusType {
    ALL = 'ALL',
    CHARACTERL = 'CHARACTERL',
    GROUP = 'GROUP',
}

registerEnumType(FocusType, {
    name: 'FocusType',
    description: '케릭터 등급',
});

export const GetUnion = createUnionType<
    [ClassType<Character>, ClassType<Group>]
>({
    name: 'GetResult',
    types: () => [Character, Group],
    resolveType: (value) => {
        if (
            'profileImage' in value ||
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
        if ('image' in value || 'character' in value) {
            return Group;
        }
        return undefined;
    },
});

@ObjectType()
class GetEdges {
    @Field(() => GetUnion, { nullable: false })
    node!: Character | Group;
    @Field(() => ID, { nullable: false })
    cursor!: string;
}

@ObjectType()
class GetRelayStylePagination {
    @Field(() => [GetEdges])
    edges?: GetEdges[];
    @Field(() => PageInfo)
    pageInfo?: PageInfo;
    @Field(() => [GetUnion])
    data?(): Array<Character | Group> {
        const data = this.edges?.map<Character | Group>((e: any) => e.node);
        return data ? data : [];
    }
}

@ArgsType()
class GetArgs {
    @Field(() => ID, { nullable: true, description: '마지막 ID' })
    endCursor?: string;
    @Field(() => Int, { defaultValue: 10, description: '불러올 수량' })
    @Min(1)
    limit: number = 10;
    @Field(() => [String], {
        name: 'ids',
        nullable: true,
        description: '검색할 아이디',
    })
    ids: string[] = [];
    @Field(() => FocusType, {
        defaultValue: FocusType.ALL,
        description: '검색할 타입',
    })
    focus?: FocusType = FocusType.ALL;
}

const getCharacter = async (
    limit: number,
    endCursor?: string,
    ids: Array<string> = [],
): Promise<GetRelayStylePagination> => {
    let charQuery: FilterQuery<CharacterTypeModel> = {};
    if (ids.length > 0) {
        charQuery = {
            ...charQuery,
            _id: {
                ...charQuery._id,
                $in: ids?.map((id) => Types.ObjectId(id)),
            },
        };
    }
    if (endCursor) {
        charQuery = {
            ...charQuery,
            _id: { ...charQuery._id, $gt: Types.ObjectId(endCursor) },
        };
    }

    const {
        docs,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        totalPages,
    } = await CharacterModels.paginate(charQuery, { limit });

    const char = new GetRelayStylePagination();

    char.edges = docs.map<GetEdges>((d) => ({
        node: d as Character,
        cursor: d.id,
    }));

    char.pageInfo = {
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        totalPages,
        endCursor: docs.length > 0 ? docs[docs.length - 1].id : undefined,
    };

    return char;
};

const getGroup = async (
    limit: number,
    endCursor?: string,
    ids: Array<string> = [],
): Promise<GetRelayStylePagination> => {
    let groupQuery: FilterQuery<GroupTypeModel> = {};
    if (ids.length > 0) {
        groupQuery = {
            ...groupQuery,
            _id: {
                ...groupQuery._id,
                $in: ids?.map((id) => Types.ObjectId(id)),
            },
        };
    }
    if (endCursor) {
        groupQuery = {
            ...groupQuery,
            _id: {
                ...groupQuery._id,
                $gt: Types.ObjectId(endCursor),
            },
        };
    }

    const {
        docs,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        totalPages,
    } = await GroupModels.paginate(groupQuery, { limit });

    const group = new GetRelayStylePagination();

    group.edges = docs.map<GetEdges>((d) => ({
        node: d as Group,
        cursor: d.id,
    }));

    group.pageInfo = {
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        totalPages,
        endCursor: docs.length > 0 ? docs[docs.length - 1].id : undefined,
    };

    return group;
};

@Resolver()
export default class GetResolver {
    @Query(() => GetRelayStylePagination)
    async get(
        @Args() { limit, ids, endCursor, focus }: GetArgs,
    ): Promise<GetRelayStylePagination | undefined> {
        switch (focus) {
            case FocusType.ALL:
                const char = await getCharacter(limit, endCursor, ids);
                if (char.pageInfo?.hasNextPage) {
                    char.pageInfo.totalPages = undefined;
                    char.pageInfo.nextPage = undefined;
                    char.pageInfo.prevPage = undefined;
                    char.pageInfo.hasPrevPage = undefined;
                    return char;
                }
                const group = await getGroup(
                    limit - (char.edges as GetEdges[]).length,
                    undefined,
                    ids,
                );
                const get = new GetRelayStylePagination();
                get.edges = [
                    ...(char.edges as GetEdges[]),
                    ...(group.edges as GetEdges[]),
                ];
                get.pageInfo = {
                    hasNextPage: group.pageInfo?.hasNextPage as boolean,
                    endCursor: group.pageInfo?.endCursor as string,
                };
                return get;
            case FocusType.CHARACTERL:
                return await getCharacter(limit, endCursor, ids);
            case FocusType.GROUP:
                return await getGroup(limit, endCursor, ids);
        }

        new Error(`unknown focus type: ${focus}`);
    }
}
