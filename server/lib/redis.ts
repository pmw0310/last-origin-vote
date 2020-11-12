import redis from 'redis';
import dotenv from 'dotenv-flow';
dotenv.config();

const client = redis.createClient({
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD
        ? (process.env.REDIS_PASSWORD as string)
        : undefined,
    db: 0,
});

export const getAsync = (key: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        client.get(key, (error, value) => {
            if (error) reject(error);
            resolve(value);
        });
    });
};

export const setAsync = (key: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        client.set(key, value, (error) => {
            if (error) reject(error);
            resolve();
        });
    });
};

export default client;
