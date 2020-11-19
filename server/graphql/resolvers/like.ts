/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Args,
    ArgsType,
    Ctx,
    Field,
    ID,
    Int,
    Mutation,
    Query,
    Resolver,
} from 'type-graphql';
import { LikeData, LikeRankingData } from '../models/like';
import StatsModels, { StatsType } from '../../models/stats';

import { ApolloError } from 'apollo-server-koa';
import BasicDataModel from '../../models/basicData';
import { BasicDataType } from '../../models/basicData';
import LikeModels from '../../models/like';
import { Min } from 'class-validator';
import { UserVerifyResult } from '../../models/user';
import db from 'mongoose';

@ArgsType()
class SetLikeArgs {
    @Field(() => ID, {
        description: '타겟 ID',
        nullable: false,
    })
    target!: string;
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
        description: '검색할 문자 (이름, 태그)',
        defaultValue: '',
    })
    search: string = '';
}

@Resolver()
export default class GroupResolver {
    @Mutation(() => LikeData)
    async setLike(
        @Args() { target }: SetLikeArgs,
        @Ctx() ctx: { currentUser: UserVerifyResult },
    ): Promise<LikeData> {
        const user = ctx.currentUser.user?._id;

        if (!user) {
            throw Error('not current user');
        }

        let setLike: number = 0;

        const session = await db.startSession();
        session.startTransaction();

        const likeRes = await LikeModels.findOne({
            user,
            target,
        });

        try {
            if (likeRes) {
                if (likeRes.like === 1) {
                    await LikeModels.findByIdAndRemove(likeRes.id)
                        .session(session)
                        .exec();
                    setLike = -1;
                } else {
                    likeRes.like = 1;
                    likeRes.updateAt = new Date();
                    await likeRes.save({ session });
                    setLike = 1;
                }
            } else {
                const newLink = new LikeModels({
                    user,
                    target,
                    like: 1,
                });
                await newLink.save({ session });
                setLike = 1;
            }

            const data = await BasicDataModel.findById(target).exec();

            if (!data) {
                throw new ApolloError('not find data');
            } else if (!data.likeStats) {
                data.likeStats = { like: 0 };
            }

            data.likeStats.like += setLike;
            data.likeStats.updateAt = new Date();
            await data.save({ session });
            await session.commitTransaction();
            session.endSession();
            return {
                state: setLike === 1,
                like: data.likeStats.like,
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
        const skip: number = (page - 1) * limit;
        const dataAggregations: any[] = [
            {
                $match: { type: StatsType.LIKE_RANKING },
            },
            {
                $sort: { createdAt: 1 },
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
                    like: '$last.data.like',
                    notLike: '$last.data.notLike',
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
                    from: 'basicdata',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'data',
                },
            },
            {
                $project: {
                    _id: false,
                    ranking: true,
                    like: true,
                    notLike: true,
                    data: { $arrayElemAt: ['$data', 0] },
                },
            },
            {
                $project: {
                    ranking: true,
                    like: true,
                    notLike: true,
                    data: true,
                    find: {
                        $concat: [
                            '$data.name',
                            ' ',
                            {
                                $reduce: {
                                    input: '$data.tag',
                                    initialValue: '',
                                    in: { $concat: ['$$value', ' ', '$$this'] },
                                },
                            },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    data: {
                        $push: {
                            ranking: '$ranking',
                            data: '$data',
                            find: '$find',
                            like: '$like',
                            notLike: '$notLike',
                        },
                    },
                },
            },
            {
                $project: {
                    _id: false,
                    data: search
                        ? {
                              $filter: {
                                  input: '$data',
                                  cond: {
                                      $regexMatch: {
                                          input: '$$this.find',
                                          regex: search,
                                          options: 'i',
                                      },
                                  },
                              },
                          }
                        : true,
                },
            },
            {
                $project: {
                    data: { $slice: ['$data', skip, limit] },
                    count: { $size: '$data' },
                },
            },
        ];
        const data = await StatsModels.aggregate(dataAggregations).exec();
        const count: number = data[0].count;
        const totalPages: number = Math.ceil(count / limit);

        return {
            likeRanking: data[0].data,
            pageInfo: {
                totalPages: totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: skip > 0,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null,
            },
        };
    }
}
