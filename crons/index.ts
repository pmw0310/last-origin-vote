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

(async () => {
    try {
        await mongooseConnect();

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

                const date = new Date();
                date.setDate(date.getDate() - 7);
                date.setHours(0, 0, 0, 0);

                const oldData = await StatsModel.find({
                    type: StatsType.LINK,
                    createdAt: { $lte: date },
                })
                    .select('_id')
                    .exec();

                if (oldData.length > 0) {
                    await StatsModel.deleteMany({
                        _id: oldData.map((id) => id),
                    });
                }

                break;
        }

        await mongooseDisconnect();
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
