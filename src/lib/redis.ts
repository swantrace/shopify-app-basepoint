import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, { connectTimeout: 100000 });

export default redis;
