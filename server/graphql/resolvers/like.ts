/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Resolver,
    Mutation,
    Field,
    ObjectType,
    Int,
    ID,
    ArgsType,
    Args,
    Ctx,
    registerEnumType,
} from 'type-graphql';
import { Min, Max } from 'class-validator';
import db, { PaginateModel } from 'mongoose';
import LikeModels from '../../models/like';
import { UserVerifyResult } from '../../models/user';
import CharacterModels from '../../models/character';
import GroupModels from '../../models/group';

enum TargetType {
    CHARACTER = 'CHARACTER',
    GROUP = 'GROUP',
}

registerEnumType(TargetType, {
    name: 'TargetType',
    description: '타겟 타입',
});

@ObjectType()
export class Like {
    @Field(() => ID, {
        name: 'id',
        description: 'ID',
        nullable: true,
    })
    _id?: string;
    @Field(() => ID, {
        description: '유저 ID',
        nullable: true,
    })
    user?: string;
    @Field(() => ID, {
        description: '타겟 ID',
        nullable: true,
    })
    target?: string;
    @Field(() => TargetType, {
        description: '타겟 타입',
        nullable: true,
    })
    type?: TargetType;
    @Field(() => Int, {
        description: '(0:선택안함, 1:좋아요, -1:싫어요)',
        nullable: false,
    })
    @Min(-1)
    @Max(1)
    link!: number;
    @Field({
        description: '수정일',
        nullable: true,
    })
    updateAt?: Date;
}

@ObjectType()
export class LikeData {
    @Field(() => Int, { description: '좋아요', nullable: false })
    like!: number;
    @Field(() => Int, { description: '싫어요', nullable: false })
    notLike!: number;
}

@ArgsType()
class SetLikeArgs {
    @Field(() => ID, {
        description: '타겟 ID',
        nullable: false,
    })
    target!: string;
    @Field(() => TargetType, {
        description: '타겟 타입',
        nullable: false,
    })
    type!: TargetType;
    @Field(() => Int, {
        description: '(1:좋아요, -1:싫어요)',
        nullable: false,
    })
    @Min(-1)
    @Max(1)
    like!: -1 | 1;
}

@Resolver()
export default class GroupResolver {
    @Mutation(() => LikeData)
    async setLike(
        @Args() { target, type, like }: SetLikeArgs,
        @Ctx() ctx: { currentUser: UserVerifyResult },
    ): Promise<LikeData> {
        const user = ctx.currentUser.user?._id;

        if (!user) {
            throw Error('not current user');
        }

        let setLike: number = 0;
        let setNotLike: number = 0;

        const session = await db.startSession();
        session.startTransaction();

        const likeRes = await LikeModels.findOne({
            user,
            target,
            type,
        });

        try {
            if (likeRes) {
                if (likeRes.like === like) {
                    await LikeModels.findByIdAndRemove(likeRes.id)
                        .session(session)
                        .exec();
                    switch (like) {
                        case 1:
                            setLike = -1;
                            break;
                        case -1:
                            setNotLike = -1;
                            break;
                    }
                } else {
                    likeRes.like = like;
                    likeRes.updateAt = new Date();
                    await likeRes.save({ session });
                    switch (like) {
                        case 1:
                            setLike = 1;
                            setNotLike = -1;
                            break;
                        case -1:
                            setLike = -1;
                            setNotLike = 1;
                            break;
                    }
                }
            } else {
                const newLink = new LikeModels({
                    user,
                    target,
                    type: type.toString(),
                    like: like,
                });
                await newLink.save({ session });
                switch (like) {
                    case 1:
                        setLike = 1;
                        break;
                    case -1:
                        setNotLike = 1;
                        break;
                }
            }

            let models: PaginateModel<any>;

            switch (type) {
                case TargetType.CHARACTER:
                    models = CharacterModels;
                    break;
                case TargetType.GROUP:
                    models = GroupModels;
                    break;
            }

            const data = await models.findById(target).exec();

            if (!data) {
                throw new Error('not find character');
            }

            data.likeStats.like += setLike;
            data.likeStats.notLike += setNotLike;
            data.likeStats.updateAt = new Date();
            await data.save({ session });
            await session.commitTransaction();
            session.endSession();
            return {
                like: data.likeStats.like,
                notLike: data.likeStats.notLike,
            };
        } catch (e) {
            await session.abortTransaction();
            session.endSession();
            throw new Error('error set like');
        }
    }
}
