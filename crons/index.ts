/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from 'dotenv-flow';
import mongooseConnect, { mongooseDisconnect } from './lib/mongooseConnect';
import BasicDataModel from './models/basicData';
import StatsModel, { StatsType } from './models/stats';

const arg = process.argv[2];

if (!arg) {
    console.log('last-origin-crons  [like]');
    process.exit();
}

dotenv.config();

const removeOldData = async (type: StatsType, date: Date): Promise<void> => {
    const oldData = await StatsModel.find({
        type,
        createdAt: { $lte: date },
    })
        .select('_id')
        .exec();

    if (oldData.length > 0) {
        await StatsModel.deleteMany({
            _id: oldData.map((id) => id),
        });
    }
};

(async () => {
    try {
        await mongooseConnect();

        console.time('crons');
        switch (arg) {
            case 'like':
                const data = await BasicDataModel.aggregate()
                    .project({
                        _id: 1,
                        type: 1,
                        like: { $ifNull: ['$likeStats.like', 0] },
                        notLike: { $ifNull: ['$likeStats.notLike', 0] },
                        likeGrade: {
                            $ifNull: [
                                {
                                    $add: [
                                        '$likeStats.like',
                                        {
                                            $multiply: [
                                                '$likeStats.notLike',
                                                -1,
                                            ],
                                        },
                                    ],
                                },
                                0,
                            ],
                        },
                    })
                    .exec();

                const stats = new StatsModel({
                    type: StatsType.LINK,
                    data,
                });
                await stats.save();

                const ranking = new StatsModel({
                    type: StatsType.LIKE_RANKING,
                    data: [],
                });

                for (const data of stats.data) {
                    const rank = await BasicDataModel.find({
                        type: data.type,
                        _id: { $ne: data._id },
                        'likeStats.like': { $gt: data.likeGrade },
                    })
                        .countDocuments()
                        .exec();

                    ranking.data.push({
                        _id: data._id,
                        type: data.type,
                        ranking: rank + 1,
                        like: data.like,
                        notLike: data.notLike,
                    });
                }
                await ranking.save();

                const linkDate = new Date();
                linkDate.setDate(linkDate.getDate() - 7);
                linkDate.setHours(0, 0, 0, 0);

                const rankingDate = new Date();
                rankingDate.setHours(rankingDate.getHours() - 2, 0, 0, 0);

                await removeOldData(StatsType.LINK, linkDate);
                await removeOldData(StatsType.LIKE_RANKING, rankingDate);

                break;
        }
        console.timeEnd('crons');

        await mongooseDisconnect();
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
