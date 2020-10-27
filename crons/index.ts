import dotenv from 'dotenv-flow';
import mongooseConnect, { mongooseDisconnect } from './lib/mongooseConnect';
import character from './models/character';

dotenv.config();

console.log('test: ' + process.argv[2]);

(async () => {
    try {
        await mongooseConnect();
        const a = await character.find();
        console.log(a);
        await mongooseDisconnect();
        process.exit();
    } catch (e) {
        process.exit(1);
    }
})();
