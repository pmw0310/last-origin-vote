/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Args,
    ArgsType,
    Field,
    ID,
    Int,
    ObjectType,
    Query,
    Resolver,
    registerEnumType,
} from 'type-graphql';
import BasicDataModel, {
    BasicDataType,
    CharacterModel,
    GroupModel,
} from '../../models/basicData';
import { FilterQuery, PaginateOptions, Types } from 'mongoose';

import { BasicUnion } from '../models/unionType';
import { Character } from '../models/character';
import { Group } from '../models/group';
import { Min } from 'class-validator';
import { PageInfo } from '../relayStylePagination';

enum FocusType {
    ALL = 'ALL',
    CHARACTER = 'CHARACTER',
    GROUP = 'GROUP',
}

enum OrderType {
    ASC = 'ASC',
    DESC = 'DESC',
}

registerEnumType(FocusType, {
    name: 'FocusType',
    description: '검색 타입',
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
    focus: FocusType = FocusType.ALL;
    @Field({
        nullable: true,
        description: '검색할 문자 (이름, 태그)',
    })
    search?: string;
    @Field({
        defaultValue: 'name',
        description: '정렬 타입',
    })
    sort: string = 'name';
    @Field(() => OrderType, {
        defaultValue: OrderType.ASC,
        description: '정렬 순서 타입',
    })
    order: OrderType = OrderType.ASC;
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
        options.sort = {};
        (options.sort as any)[sort] = orderType;

        const {
            docs,
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage,
            totalPages,
        } = await BasicDataModel.paginate(query, options);

        const data = new GetRelayStylePagination();
        data.edges = [];

        for (const doc of docs) {
            data.edges.push({ node: doc, cursor: doc.id });
        }

        data.pageInfo = {
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage,
            totalPages,
            endCursor: docs.length > 0 ? docs[docs.length - 1].id : undefined,
        };

        return data;
    }
}
