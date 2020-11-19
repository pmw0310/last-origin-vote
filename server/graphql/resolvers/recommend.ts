/* eslint-disable @typescript-eslint/no-explicit-any */

import { Arg, Ctx, Query, Resolver } from 'type-graphql';

import BasicDataModel from '../../models/basicData';
import { BasicUnion } from '../models/unionType';
import { Character } from '../models/character';
import { Group } from '../models/group';
import LikeModels from '../../models/like';
import { UserVerifyResult } from '../../models/user';

@Resolver()
export default class RecommendResolver {
    @Query(() => [BasicUnion])
    async recommend(
        @Arg('limit', () => Number, { defaultValue: 10 }) limit: number,
        @Ctx()
        ctx: {
            currentUser: UserVerifyResult;
        },
    ): Promise<Array<Character | Group>> {
        const user = ctx.currentUser.user?._id;

        const date = new Date();
        date.setDate(date.getDate() - 12);
        date.setHours(0, 0, 0, 0);

        const newData = await BasicDataModel.find({ createdAt: { $gte: date } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();

        if (newData.length < limit) {
            let data: Array<any>;

            if (user) {
                const like = await LikeModels.find({ user })
                    .select({ _id: 0, target: 1 })
                    .lean()
                    .exec();

                data = await BasicDataModel.find({
                    createdAt: { $lt: date },
                })
                    .nin(
                        '_id',
                        like.map((t) => t.target),
                    )
                    .lean()
                    .exec();
            } else {
                data = await BasicDataModel.find({
                    createdAt: { $lt: date },
                })
                    .lean()
                    .exec();
            }

            const count = limit - newData.length;

            if (data.length > count) {
                const set = new Set<number>();
                const sendData = [...newData];

                while (set.size < count) {
                    set.add(Math.floor(Math.random() * data.length));
                }

                set.forEach((index) => {
                    sendData.push(data[index]);
                });

                return sendData;
            }

            return [...newData, ...data];
        }

        return newData;
    }
}
