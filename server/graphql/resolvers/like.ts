/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Resolver,
    Mutation,
    Query,
    Field,
    Int,
    ID,
    ArgsType,
    Args,
    Ctx,
} from 'type-graphql';
import { Min, Max } from 'class-validator';
import db from 'mongoose';
import { ApolloError } from 'apollo-server-koa';
import LikeModels from '../../models/like';
import StatsModels, { StatsType } from '../../models/stats';
import { UserVerifyResult } from '../../models/user';
import BasicDataModel from '../../models/basicData';
import { LikeData, LikeRankingData } from '../models/like';
import { BasicDataType } from '../../models/basicData';

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

@ArgsType()
class LikeRankingArgs {
    @Field(() => Int, { defaultValue: 1, description: '페이지' })
    @Min(1)
    page: number = 1;
    @Field(() => Int, { defaultValue: 5, description: '불러올 수량' })
    @Min(1)
    limit: number = 5;
    @Field(() => BasicDataType, {
        defaultValue: BasicDataType.CHARACTER,
        description: '검색할 타입',
    })
    focus: BasicDataType = BasicDataType.CHARACTER;
    @Field({
        nullable: true,
        description: '검색할 문자 (이름, 태그)',
    })
    search?: string;
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
                throw new ApolloError('not find data');
            } else if (!data.likeStats) {
                data.likeStats = { like: 0, notLike: 0 };
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
            console.error(e);
            throw new ApolloError('error set like');
        }
    }

    @Query(() => LikeRankingData)
    async likeRanking(
        @Args() { page, limit, focus, search }: LikeRankingArgs,
    ): Promise<LikeRankingData> {
        const countAggregations: any[] = [
            {
                $match: { type: StatsType.LIKE_RANKING },
            },
            {
                $group: {
                    _id: null,
                    last: { $last: '$$ROOT' },
                },
            },
            {
                $unwind: '$last.data',
            },
            {
                $match: { 'last.data.type': focus },
            },
            {
                $count: 'count',
            },
        ];

        const dataAggregations: any[] = [
            {
                $match: { type: StatsType.LIKE_RANKING },
            },
            {
                $group: {
                    _id: null,
                    last: { $last: '$$ROOT' },
                },
            },
            {
                $unwind: '$last.data',
            },
            {
                $project: {
                    _id: '$last.data._id',
                    type: '$last.data.type',
                    ranking: '$last.data.ranking',
                },
            },
            {
                $match: { type: focus },
            },
            {
                $sort: { ranking: 1 },
            },
            {
                $lookup: {
                    from: 'basicdatas',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'data',
                },
            },
            {
                $project: {
                    _id: false,
                    ranking: true,
                    data: { $arrayElemAt: ['$data', 0] },
                },
            },
        ];

        if (search) {
            dataAggregations.push({
                $match: {
                    'data.name': {
                        $regex: search,
                        $options: 'i',
                    },
                },
            });
        }

        const countData = await StatsModels.aggregate(countAggregations).exec();
        const skip: number = (page - 1) * limit;
        const data = await StatsModels.aggregate(dataAggregations)
            .skip(skip)
            .limit(limit)
            .exec();
        const count: number = countData[0].count;
        const totalPages: number = Math.ceil(count / limit);

        return {
            likeRanking: data,
            pageInfo: {
                totalPages: search ? 1 : totalPages,
                hasNextPage: search ? false : page < totalPages,
                hasPrevPage: search ? false : skip > 0,
                prevPage: search ? null : page > 1 ? page - 1 : null,
                nextPage: search ? null : page < totalPages ? page + 1 : null,
            },
        };
    }
}
