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
import { Types, FilterQuery, PaginateModel, PaginateOptions } from 'mongoose';
import { Character } from './character';
import { Group } from './group';
import CharacterModels, { CharacterTypeModel } from '../../models/character';
import GroupModels, { GroupTypeModel } from '../../models/group';
import { PageInfo } from '../relayStylePagination';

enum FocusType {
    ALL = 'ALL',
    CHARACTER = 'CHARACTER',
    GROUP = 'GROUP',
}

enum SortType {
    NUMBER = 'NUMBER',
    LIKE = 'LIKE',
    NOT_LIKE = 'NOT_LIKE',
}

registerEnumType(FocusType, {
    name: 'FocusType',
    description: '검색 타입',
});

registerEnumType(SortType, {
    name: 'SortType',
    description: '정렬 타임',
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
    @Field(() => ID, {
        nullable: true,
        description: '마지막 ID 페이지와 혼용 불가능',
    })
    endCursor?: string;
    @Field(() => Int, { nullable: true, description: '페이지' })
    @Min(1)
    page?: number;
    @Field(() => Int, { defaultValue: 10, description: '불러올 수량' })
    @Min(1)
    limit: number = 10;
    @Field(() => [String], {
        nullable: true,
        description: '검색할 아이디',
    })
    ids: string[] = [];
    @Field(() => FocusType, {
        defaultValue: FocusType.ALL,
        description: '검색할 타입',
    })
    focus?: FocusType = FocusType.ALL;
    @Field({
        nullable: true,
        description: '검색할 문자 (이름, 태그)',
    })
    search?: string;
    @Field(() => SortType, {
        defaultValue: SortType.NUMBER,
        description: '정렬 타입',
    })
    sort?: SortType = SortType.NUMBER;
}

const getData = async ({
    limit,
    page,
    endCursor,
    ids,
    search,
    focus,
    sort,
}: GetArgs): Promise<GetRelayStylePagination> => {
    let query: FilterQuery<CharacterTypeModel | GroupTypeModel> = {};
    if (ids.length > 0) {
        query = {
            ...query,
            _id: {
                ...query._id,
                $in: ids?.map((id) => Types.ObjectId(id)),
            },
        };
    }
    if (!page && endCursor) {
        query = {
            ...query,
            _id: { ...query._id, $gt: Types.ObjectId(endCursor) },
        };
    }
    if (search) {
        const reg = new RegExp(search, 'i');
        query = {
            ...query,
            $or: [{ name: { $regex: reg } }, { tag: { $regex: reg } }],
        };
    }

    let models: PaginateModel<any>;

    switch (focus) {
        case FocusType.CHARACTER:
            models = CharacterModels;
            break;
        case FocusType.GROUP:
            models = GroupModels;
            break;
        default:
            throw new Error(`unusable focus type: ${focus}`);
    }

    const options: PaginateOptions = { limit };

    if (page) {
        options.page = page;
    }
    switch (sort) {
        case SortType.NUMBER:
            options.sort = { number: 'asc', name: 'asc' };
            break;
        case SortType.LIKE:
            options.sort = { ['likeStats.like']: 'desc', name: 'asc' };
            break;
        case SortType.NOT_LIKE:
            options.sort = { ['likeStats.notLike']: 'desc', name: 'asc' };
            break;
    }

    const {
        docs,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        totalPages,
    } = await models.paginate(query, options);

    const data = new GetRelayStylePagination();

    data.edges = docs.map<GetEdges>((d) => ({
        node: d,
        cursor: d.id,
    }));

    data.pageInfo = {
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        totalPages,
        endCursor: docs.length > 0 ? docs[docs.length - 1].id : undefined,
    };

    return data;
};

@Resolver()
export default class GetResolver {
    @Query(() => GetRelayStylePagination)
    async get(
        @Args() getArgs: GetArgs,
    ): Promise<GetRelayStylePagination | undefined> {
        switch (getArgs.focus) {
            case FocusType.ALL:
                const char = await getData({
                    ...getArgs,
                    focus: FocusType.CHARACTER,
                });
                if (char.pageInfo?.hasNextPage) {
                    char.pageInfo.totalPages = undefined;
                    char.pageInfo.nextPage = undefined;
                    char.pageInfo.prevPage = undefined;
                    char.pageInfo.hasPrevPage = undefined;
                    return char;
                }
                const group = await getData({
                    ...getArgs,
                    focus: FocusType.GROUP,
                });
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
            case FocusType.CHARACTER:
                return await getData(getArgs);
            case FocusType.GROUP:
                return await getData(getArgs);
        }

        throw new Error(`unusable focus type: ${getArgs.focus}`);
    }
}
