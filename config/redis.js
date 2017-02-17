'use strict';

import RedisClient from 'ioredis';

// let connectionDetails;
import config from '../server-config';

const redisUrl = config.redis.REDIS_URL;

const redis = new RedisClient(redisUrl, {
  dropBufferSupport: true,
  retryStrategy: function retryStrategy (times, isRecursive) {
    // Exponential with a minimum of 2 seconds
    if (times > 20) {
      console.error('Redis Connection: Tried connecting more than 20 times. Giving up.');
      return new Error('Redis Connection: Maximum number of connection retries (20) reached.');
    }
    if (times <= 1) return 20;
    const retryAfter = Math.round(Math.min(retryStrategy(times - 1, true) * 1.5 ,10000));
    if (!isRecursive) console.error(`Redis Connection: Attempt ${times} failed. Retrying after ${retryAfter} ms.`);
    return retryAfter;
  }
});


const {host, port} = redis.connector.options;

redis.on('connect', () => {
  console.log(`Connected to redis client at ${host}:${port}`);
});

redis.on('ready', () => {
  console.log('Redis server ready');
});

redis.on('error', () => {
  console.log('There was an error connecting to redis');
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

process.on('SIGINT', () => {
  redis.disconnect();
});


export default redis;