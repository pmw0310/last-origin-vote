/* eslint-disable @typescript-eslint/no-explicit-any */
import redis from 'redis';
import dotenv from 'dotenv-flow';
dotenv.config();

interface redisHash {
    [key: string]: string | number | boolean;
}

const client = redis.createClient({
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD
        ? (process.env.REDIS_PASSWORD as string)
        : undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', () => {
    console.error('redis error');
    process.exit(1);
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

export const existsAsync = (...args: string[]): Promise<number> => {
    return new Promise((resolve, reject) => {
        client.exists(args, (error, ex) => {
            if (error) reject(error);
            resolve(ex);
        });
    });
};

export const hmsetAsync = (key: string, hash: redisHash): Promise<void> => {
    return new Promise(function (resolve, reject) {
        const hm: Array<any> = [key];

        for (const h in hash) {
            hm.push(h);
            hm.push(hash[h].toString());
        }

        client.hmset(hm as any, (error: unknown) => {
            if (error) reject(error);
            resolve();
        });
        resolve();
    });
};

export const hgetallAsync = (
    key: string,
    original: boolean = false,
): Promise<redisHash | null> => {
    return new Promise((resolve, reject) => {
        client.hgetall(key, (error, value) => {
            if (error) reject(error);

            const hash = value as redisHash;

            if (!original && value) {
                for (const k in hash) {
                    const value = hash[k];
                    const num = Number(value);
                    if (isFinite(num)) {
                        hash[k] = num;
                    } else if (value === 'true') {
                        hash[k] = true;
                    } else if (value === 'false') {
                        hash[k] = false;
                    }
                }
            }

            resolve(value);
        });
    });
};

const cacheExists = (data: redisHash) => {
    try {
        if (!data || Number(data?.__cachedate) < Date.now()) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
};

const isCache = async (key: string): Promise<boolean> => {
    return new Promise(function (resolve, reject) {
        client.sismember('__cache', key, (error, value) => {
            if (error) reject();
            resolve(value === 1);
        });
    });
};

export const getCache = async (
    key: string,
): Promise<string | number | boolean | redisHash | null> => {
    try {
        const cache = await isCache(key);
        if (!cache) return null;
        const data = await hgetallAsync(key);

        if (!data || !cacheExists(data)) {
            delCache(key);
            return null;
        }

        if (data?.__onevalue) {
            return data.__onevalue;
        }

        delete data?.__cachedate;
        return data;
    } catch (e) {
        return null;
    }
};

export const getCacheDate = async (key: string): Promise<number | null> => {
    try {
        const cache = await isCache(key);
        if (!cache) return null;
        const data = await hgetallAsync(key, true);

        if (!data || !cacheExists(data)) {
            delCache(key);
            return null;
        }

        return Number(data?.__cachedate);
    } catch (e) {
        return null;
    }
};

export const setCache = async (
    key: string,
    value: string | redisHash,
    maxAge: number = 600000,
): Promise<void> => {
    const __cachedate = Date.now() + maxAge;

    await hmsetAsync(
        key,
        typeof value === 'string'
            ? {
                  __onevalue: value,
                  __cachedate,
              }
            : { ...value, __cachedate },
    );
    client.sadd('__cache', key);
};

export const existsCache = async (key: string): Promise<boolean> => {
    try {
        const cache = await isCache(key);
        if (!cache) return false;
        const data = await hgetallAsync(key, true);
        if (!data || !cacheExists(data)) {
            delCache(key);
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
};

export const delCache = (key: string): void => {
    client.del(key);
    client.spop(key);
};

export const removeAllCache = (): void => {
    client.smembers('__cache', (err, set) => {
        if (err) return;
        for (const s of set) {
            delCache(s);
        }
    });
};

export default client;
