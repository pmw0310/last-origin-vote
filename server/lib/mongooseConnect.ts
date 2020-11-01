import mongoose from 'mongoose';

const mongooseConnect = async (): Promise<void> => {
    await mongoose.connect(`${process.env.MONGODB_URI as string}/lastorigin`, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    console.log('Connected to MongoDB');
};

export const mongooseDisconnect = async (): Promise<void> => {
    await mongoose.disconnect();
    console.warn('Disconnect to MongoDB');
};

export default mongooseConnect;
