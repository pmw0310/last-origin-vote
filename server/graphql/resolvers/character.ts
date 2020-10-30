/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Resolver,
    Mutation,
    Field,
    ObjectType,
    InputType,
    InterfaceType,
    Int,
    ID,
    Authorized,
    registerEnumType,
    Arg,
    Ctx,
} from 'type-graphql';
import { Types } from 'mongoose';
import BasicDataModel, {
    CharacterGrade,
    CharacterType,
    CharacterRole,
    BasicDataType,
} from '../../models/basicData';
import { UserVerifyResult } from '../../models/user';
import LikeModels from '../../models/like';
import { Group } from './group';
import { LikeData } from './like';

registerEnumType(CharacterGrade, {
    name: 'CharacterGrade',
    description: '케릭터 등급',
});

registerEnumType(CharacterType, {
    name: 'CharacterType',
    description: '케릭터 타입',
});

registerEnumType(CharacterRole, {
    name: 'CharacterRole',
    description: '케릭터 역할',
});

@InterfaceType()
@InputType('CharacterInput')
export class CharacterInterface {
    @Field({
        description: '이름',
        nullable: true,
    })
    name?: string;
    @Field({
        description: '프로필 url',
        nullable: true,
    })
    profileImage?: string;
    @Field(() => [String], {
        description: '태그',
        nullable: 'itemsAndList',
        defaultValue: [],
    })
    tag?: string[];
    @Field(() => Int, {
        description: '번호',
        nullable: true,
    })
    number?: number;
    @Field(() => ID, {
        description: '부대 ID',
        nullable: true,
    })
    groupId?: string;
    @Field(() => CharacterGrade, {
        description: '등급',
        nullable: true,
    })
    grade?: CharacterGrade;
    @Field(() => CharacterGrade, {
        description: '최종 등급',
        nullable: true,
    })
    lastGrade?: CharacterGrade;
    @Field(() => CharacterType, {
        description: '타입',
        nullable: true,
    })
    type?: CharacterType;
    @Field(() => CharacterRole, {
        description: '역할',
        nullable: true,
    })
    role?: CharacterRole;
    @Field({
        description: '클레스',
        nullable: true,
    })
    class?: string;
    @Field({
        description: '무장',
        nullable: true,
    })
    arm?: string;
    @Field(() => Int, {
        description: '신장',
        nullable: true,
    })
    stature?: number;
    @Field(() => Int, {
        description: '체중',
        nullable: true,
    })
    weight?: number;
    @Field({
        description: '설명',
        nullable: true,
    })
    description?: string;
    @Field(() => BasicDataType, {
        description: '베이스 타입',
        nullable: true,
    })
    basicType?: BasicDataType;
}

@ObjectType({ implements: CharacterInterface })
export class Character extends CharacterInterface {
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
    @Field(() => Group, {
        description: '소속된 부대 정보',
        nullable: true,
    })
    async group?(): Promise<Group | undefined> {
        let groupId = this.groupId;
        if (!groupId) {
            groupId = (this as any)._doc.groupId;
        }
        if (!groupId) {
            return;
        }
        const group = await BasicDataModel.findById(groupId).exec();
        return group as Group;
    }
    @Field(() => LikeData, {
        description: '좋아요 정보',
        nullable: true,
    })
    likeStats?: LikeData;
    @Field(() => Number, {
        description:
            '사용자가 선택한 좋아요 정보 (0: 선택안함, 1: 좋아요, -1: 싫어요)',
        nullable: true,
    })
    async like?(
        @Ctx() ctx: { currentUser: UserVerifyResult },
    ): Promise<number> {
        const user = ctx.currentUser.user?._id;

        if (!user) {
            return 0;
        }

        let target = this._id;
        if (!target) {
            target = (this as any)._doc._id;
        }

        try {
            const data = await LikeModels.findOne({
                user,
                target,
                type: 'CHARACTER',
            });

            return data ? (data.like as number) : 0;
        } catch (e) {
            return 0;
        }
    }
}

@Resolver()
export default class CharacterResolver {
    @Authorized('character')
    @Mutation(() => Boolean)
    async addCharacter(
        @Arg('data') data: CharacterInterface,
    ): Promise<boolean> {
        try {
            const char = new CharacterModels({
                ...data,
                groupId: data.groupId
                    ? Types.ObjectId(data.groupId)
                    : undefined,
                group: undefined,
            });
            await char.save();
            return true;
        } catch (e) {
            throw new Error('generation failure');
        }
    }

    @Authorized('character')
    @Mutation(() => Boolean)
    async removeCharacter(
        @Arg('id', () => ID, { nullable: false }) id: string,
    ): Promise<boolean> {
        try {
            await CharacterModels.findByIdAndRemove(id).exec();
            return true;
        } catch (e) {
            throw new Error('update failure');
        }
    }

    @Authorized('character')
    @Mutation(() => Boolean)
    async updateCharacter(
        @Arg('id', () => ID, { nullable: false }) id: string,
        @Arg('data', { nullable: false }) data: CharacterInterface,
    ): Promise<boolean> {
        try {
            const update = {
                $set: {
                    ...data,
                    groupId: data.groupId
                        ? ((Types.ObjectId(data.groupId) as unknown) as string)
                        : undefined,
                    group: undefined,
                },
            };
            const char = await CharacterModels.findByIdAndUpdate(id, update, {
                new: true,
            }).exec();

            if (!char) {
                throw new Error('update failure');
            }

            return true;
        } catch (e) {
            throw new Error('update failure');
        }
    }
}
