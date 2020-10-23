/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Resolver,
    Mutation,
    Field,
    ObjectType,
    InputType,
    InterfaceType,
    ID,
    Authorized,
    Arg,
} from 'type-graphql';
import GroupModels from '../../models/group';
import CharacterModels from '../../models/character';
import { Character } from './character';

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

@Resolver()
export default class GroupResolver {
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
