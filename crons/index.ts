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
                const data = await BasicDataModel.find()
                    .exists('likeStats', true)
                    .select(
                        '_id type likeStats likeStats.like likeStats.notLike',
                    );
                const stats = new StatsModel({
                    type: StatsType.LINK,
                    data,
                });
                await stats.save();

                const oldData = await StatsModel.find({ type: StatsType.LINK })
                    .sort('-createdAt')
                    .skip(30)
                    .select('_id')
                    .exec();

                if (oldData.length > 0) {
                    await StatsModel.deleteMany({
                        _id: oldData.map((id) => id),
                    });
                }

                // const compareData = await StatsModel.find({
                //     type: StatsType.LINK,
                // })
                //     .sort('-createdAt')
                //     .limit(2)
                //     .sort('-data.like')
                //     .exec();

                // console.log(compareData);

                break;
        }

        await mongooseDisconnect();
        process.exit();
    } catch (e) {
        process.exit(1);
    }
})();
