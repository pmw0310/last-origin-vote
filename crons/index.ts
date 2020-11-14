/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from 'dotenv-flow';
import mongooseConnect, { mongooseDisconnect } from './lib/mongooseConnect';
import BasicDataModel from './models/basicData';
import StatsModel, { StatsType } from './models/stats';
import path from 'path';
import url from 'url';
import fs from 'fs';
import { get } from 'https';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

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
                    const rank = await StatsModel.aggregate([
                        {
                            $match: { type: StatsType.LINK },
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
                                _id: false,
                                type: '$last.data.type',
                                likeGrade: '$last.data.likeGrade',
                            },
                        },
                        {
                            $match: {
                                type: data.type,
                                likeGrade: { $gt: data.likeGrade },
                            },
                        },
                        {
                            $count: 'rank',
                        },
                        {
                            $project: {
                                rank: { $add: ['$rank', 1] },
                            },
                        },
                    ]).exec();

                    ranking.data.push({
                        _id: data._id,
                        type: data.type,
                        ranking: rank[0] ? rank[0].rank : 1,
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
            case 'test':
                const test = await BasicDataModel.findOne().exec();
                // console.log(test);

                if (!test?.profileImage) {
                    break;
                }

                const parsed = url.parse(test?.profileImage as string);

                const file = fs.createWriteStream(
                    path.normalize(
                        `${__dirname}/../assets/profile/${path.basename(
                            parsed.pathname as string,
                        )}`,
                    ),
                );

                await new Promise<void>((resolve, reject) => {
                    get(test?.profileImage as string, {}, (response): void => {
                        response.pipe(file);
                        file.on('finish', async () => {
                            resolve();
                        }).on('error', () => {
                            reject();
                        });
                    });
                });
                break;

            case 'webp':
                await imagemin(
                    [
                        path.normalize(
                            `${__dirname}/../assets/profile/*.{jpg,png}`,
                        ),
                    ],
                    {
                        destination: path.normalize(
                            `${__dirname}/../assets/profile`,
                        ),
                        plugins: [imageminWebp({ quality: 90 })],
                    },
                );
                await imagemin(
                    [
                        path.normalize(
                            `${__dirname}/../assets/public/*.{jpg,png}`,
                        ),
                    ],
                    {
                        destination: path.normalize(
                            `${__dirname}/../assets/public`,
                        ),
                        plugins: [imageminWebp({ quality: 90 })],
                    },
                );
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
