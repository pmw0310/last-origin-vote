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
    async character?(): Promise<Character[] | undefined> {
        const char = await CharacterModels.find({ groupId: this._id });
        return char as Character[];
    }
}

@ArgsType()
class GroupListArgs {
    @Field(() => Int, { defaultValue: 1 })
    @Min(1)
    page?: number;
    @Field(() => Int, { defaultValue: 10 })
    @Min(1)
    limit?: number;
    @Field(() => [String], { name: 'ids', nullable: true, defaultValue: [] })
    ids?: string[];
}

@Resolver()
export default class GroupResolver {
    @Query(() => [Group])
    async getGroup(
        @Args() { page, limit, ids }: GroupListArgs,
    ): Promise<Group[]> {
        const query: FilterQuery<GroupTypeModel> = {};

        if (ids && ids.length > 0) {
            query._id = {
                $in: ids?.map((id) => Types.ObjectId(id)),
            };
        }

        const group = await GroupModels.find(query)
            .sort({ _id: -1 })
            .limit(limit as number)
            .skip(((page as number) - 1) * (limit as number))
            .lean()
            .exec();

        return group as Group[];
    }

    @Authorized('group')
    @Mutation(() => Group)
    async addGroup(@Arg('data') data: GroupInterface): Promise<Group> {
        try {
            const group = new GroupModels(data);
            await group.save();
            return group;
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
    @Mutation(() => Group)
    async updateGroup(
        @Arg('id', () => ID, { nullable: false }) id: string,
        @Arg('data', { nullable: false }) data: GroupInterface,
    ): Promise<Group> {
        try {
            const update = { $set: { ...data, updateAt: new Date() } };
            const group = await GroupModels.findByIdAndUpdate(id, update, {
                new: true,
            }).exec();

            if (!group) {
                throw new Error('update failure');
            }

            return group as Group;
        } catch (e) {
            throw new Error('update failure');
        }
    }
}
