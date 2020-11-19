/* eslint-disable @typescript-eslint/no-explicit-any */

import { Ctx, Field, ID, InterfaceType, registerEnumType } from 'type-graphql';
import { BasicDataType } from '../../models/basicData';
import { LikeData } from './like';
import LikeModels from '../../models/like';
import { UserVerifyResult } from '../../models/user';

registerEnumType(BasicDataType, {
    name: 'BasicDataType',
    description: '베이스 타입',
});

export class BasicDataInput {
    name?: string;
    profileImage?: string;
    tag?: string[];
    description?: string;
    type!: BasicDataType;
}

@InterfaceType({ isAbstract: true })
export class BasicData implements BasicDataInput {
    @Field({
        description: '이름',
        nullable: true,
    })
    name?: string;
    @Field({
        description: '프로필 이미지 url',
        nullable: true,
    })
    profileImage?: string;
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
    @Field(() => BasicDataType, {
        description: '베이스 타입',
        nullable: false,
    })
    type!: BasicDataType;

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
            });

            return data ? (data.like as number) : 0;
        } catch (e) {
            return 0;
        }
    }
}
