/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Resolver,
    Query,
    Mutation,
    Field,
    ObjectType,
    InputType,
    InterfaceType,
    Int,
    ID,
    Authorized,
    Arg,
    Args,
    ArgsType,
} from 'type-graphql';
import GroupModels, { GroupTypeModel } from '../../models/group';
import CharacterModels from '../../models/character';
import { Character } from './character';
import RelayStylePagination, { Edges } from '../relayStylePagination';
import { Min } from 'class-validator';
import { Types, FilterQuery } from 'mongoose';

@InterfaceType()
@InputType('GroupInput')
export class GroupInterface {
    @Field({
        description: '이름',
        nullable: true,
    })
    name?: string;
    @Field({
        description: '이미지 url',
        nullable: true,
    })
    image?: string;
    @Field(() => [String], {
        description: '태그',
        nullable: 'itemsAndList',
        defaultValue: [],
    })
    tag?: string[];
    @Field({
        description: '설명',
        nullable: true,
    })
    description?: string;
}

@ObjectType({ implements: GroupInterface })
export class Group extends GroupInterface {
    @Field(() => ID, {
        name: 'id',
        description: 'ID',
        nullable: true,
    })
    _id?: string;
    @Field({
        description: '생성일',
        nullable: true,
    })
    createdAt?: Date;
    @Field({
        description: '수정일',
        nullable: true,
    })
    updateAt?: Date;

    @Field(() => [Character], {
        description: '소속된 케릭터 정보',
        nullable: true,
    })
    async character?(): Promise<Character[]> {
        let id = this._id;
        if (!id) {
            id = (this as any)._doc._id;
        }
        const char = await CharacterModels.find({
            groupId: id,
        }).exec();
        return char as Character[];
    }
}

@ObjectType()
class GroupEdges extends Edges(Group) {}

@ObjectType()
class GroupRelayStylePagination extends RelayStylePagination(
    Group,
    GroupEdges,
) {}

@ArgsType()
class GroupListArgs {
    @Field(() => Int, { defaultValue: 1, nullable: true })
    @Min(1)
    page?: number = 1;
    @Field(() => Int, { defaultValue: 10, nullable: true })
    @Min(1)
    limit?: number = 10;
    @Field(() => [String], { name: 'ids', nullable: true, defaultValue: [] })
    ids?: string[];
}

@Resolver()
export default class GroupResolver {
    @Query(() => GroupRelayStylePagination)
    async getGroup(
        @Args() { page, limit, ids }: GroupListArgs,
    ): Promise<GroupRelayStylePagination> {
        const query: FilterQuery<GroupTypeModel> = {};

        if (ids && ids.length > 0) {
            query._id = {
                $in: ids?.map((id) => Types.ObjectId(id)),
            };
        }

        const {
            docs,
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage,
            totalPages,
        } = await GroupModels.paginate(query, { page, limit });

        const group = new GroupRelayStylePagination();

        group.edges = docs.map<GroupEdges>((d) => ({
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
    }

    @Authorized('group')
    @Mutation(() => Boolean)
    async addGroup(@Arg('data') data: GroupInterface): Promise<boolean> {
        try {
            const group = new GroupModels(data);
            await group.save();
            return true;
        } catch (e) {
            throw new Error('generation failure');
        }
    }

    @Authorized('group')
    @Mutation(() => Boolean)
    async removeGroup(
        @Arg('id', () => ID, { nullable: false }) id: string,
    ): Promise<boolean> {
        try {
            await GroupModels.findByIdAndRemove(id).exec();
            return true;
        } catch (e) {
            throw new Error('update failure');
        }
    }

    @Authorized('group')
    @Mutation(() => Boolean)
    async updateGroup(
        @Arg('id', () => ID, { nullable: false }) id: string,
        @Arg('data', { nullable: false })
        data: GroupInterface,
    ): Promise<boolean> {
        try {
            const update = { $set: { ...data, updateAt: new Date() } };
            const group = await GroupModels.findByIdAndUpdate(id, update, {
                new: true,
            }).exec();

            if (!group) {
                throw new Error('update failure');
            }
            return true;
        } catch (e) {
            throw new Error('update failure');
        }
    }
}
