/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Resolver,
    Mutation,
    Field,
    Int,
    ID,
    ArgsType,
    Args,
    Ctx,
} from 'type-graphql';
import { Min, Max } from 'class-validator';
import db from 'mongoose';
import LikeModels from '../../models/like';
import { UserVerifyResult } from '../../models/user';
import BasicDataModel from '../../models/basicData';
import { LikeData } from '../models/like';

@ArgsType()
class SetLikeArgs {
    @Field(() => ID, {
        description: '타겟 ID',
        nullable: false,
    })
    target!: string;
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
        @Args() { target, like }: SetLikeArgs,
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

            const data = await BasicDataModel.findById(target).exec();

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
