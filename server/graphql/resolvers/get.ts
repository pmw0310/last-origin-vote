/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    registerEnumType,
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
import { Types, FilterQuery, PaginateOptions } from 'mongoose';
import { Character } from '../models/character';
import { Group } from '../models/group';
import BasicDataModel, {
    CharacterModel,
    GroupModel,
    BasicDataType,
} from '../../models/basicData';
import { PageInfo } from '../relayStylePagination';
import { BasicUnion } from '../models/unionType';
import {
    CharacterGrade,
    CharacterType,
    CharacterRole,
} from '../../models/basicData';

enum FocusType {
    ALL = 'ALL',
    CHARACTER = 'CHARACTER',
    GROUP = 'GROUP',
}

enum SortType {
    NAME = 'NAME',
    NUMBER = 'NUMBER',
    STATURE = 'STATURE',
    WEIGHT = 'WEIGHT',
    GRADE = 'GRADE',
    LAST_GRADE = 'LAST_GRADE',
}

enum OrderType {
    ASC = 'ASC',
    DESC = 'DESC',
}

registerEnumType(FocusType, {
    name: 'FocusType',
    description: '검색 타입',
});

registerEnumType(SortType, {
    name: 'SortType',
    description: '정렬 타임',
});

registerEnumType(OrderType, {
    name: 'OrderType',
    description: '정렬 순서 타임',
});

@ObjectType()
class GetEdges {
    @Field(() => BasicUnion, { nullable: false })
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
    @Field(() => [BasicUnion])
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
        defaultValue: SortType.NAME,
        description: '정렬 타입',
    })
    sort?: SortType = SortType.NAME;
    @Field(() => OrderType, {
        defaultValue: OrderType.ASC,
        description: '정렬 순서 타입',
    })
    order?: OrderType.ASC;
}

@Resolver()
export default class GetResolver {
    @Query(() => GetRelayStylePagination)
    async get(
        @Args()
        { ids, page, endCursor, search, limit, sort, focus, order }: GetArgs,
    ): Promise<GetRelayStylePagination | undefined> {
        let query: FilterQuery<CharacterModel | GroupModel> = {};

        switch (focus) {
            case FocusType.CHARACTER:
                query = { ...query, type: BasicDataType.CHARACTER };
                break;
            case FocusType.GROUP:
                query = { ...query, type: BasicDataType.GROUP };
                break;
        }

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

        const options: PaginateOptions = { limit };

        if (page) {
            options.page = page;
        }

        const orderType: string = (order as string).toLocaleLowerCase();

        switch (sort) {
            case SortType.NAME:
                options.sort = { name: orderType };
                break;
            case SortType.NUMBER:
                options.sort = { charNumber: orderType, name: 'asc' };
                break;
            case SortType.STATURE:
                options.sort = { charStature: orderType, name: 'asc' };
                break;
            case SortType.WEIGHT:
                options.sort = { charWeight: orderType, name: 'asc' };
                break;
            case SortType.GRADE:
                options.sort = { charGradeOrder: orderType, name: 'asc' };
                break;
            case SortType.LAST_GRADE:
                options.sort = { charLastGradeOrder: orderType, name: 'asc' };
                break;
        }

        const {
            docs,
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage,
            totalPages,
        } = await BasicDataModel.paginate(query, options);

        const data = new GetRelayStylePagination();

        data.edges = docs.map<GetEdges>((d) => ({
            node: {
                ...d,
                charGrade: (d as CharacterModel).charGrade
                    ? CharacterGrade[(d as CharacterModel).charGrade as number]
                    : undefined,
                charLastGrade: (d as CharacterModel).charLastGrade
                    ? CharacterGrade[
                          (d as CharacterModel).charLastGrade as number
                      ]
                    : undefined,
                charType: (d as CharacterModel).charType
                    ? CharacterType[(d as CharacterModel).charType as number]
                    : undefined,
                charRole: (d as CharacterModel).charRole
                    ? CharacterRole[(d as CharacterModel).charRole as number]
                    : undefined,
            },
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

        console.log('test', data.edges[0].node);

        return data;
    }
}
