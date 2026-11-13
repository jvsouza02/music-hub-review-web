import 'server-only';

import { createClient, type RedisClientType } from 'redis';

type RedisGlobal = typeof globalThis & {
  musicHubRedis?: RedisClientType;
  musicHubRedisConnection?: Promise<RedisClientType>;
};

const redisGlobal = globalThis as RedisGlobal;

function createRedisClient(): RedisClientType {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error('REDIS_URL is not configured.');
  }

  const client = createClient({
    url: redisUrl,
  });

  client.on('error', () => {
    console.error('[Redis] Connection error.');
  });

  return client;
}

const redis = redisGlobal.musicHubRedis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  redisGlobal.musicHubRedis = redis;
}

export async function getRedisClient(): Promise<RedisClientType> {
  if (redis.isOpen) {
    return redis;
  }

  let connection = redisGlobal.musicHubRedisConnection;

  if (!connection) {
    connection = redis.connect();

    redisGlobal.musicHubRedisConnection = connection;

    try {
      await connection;
    } finally {
      if (redisGlobal.musicHubRedisConnection === connection) {
        delete redisGlobal.musicHubRedisConnection;
      }
    }
  } else {
    await connection;
  }

  return redis;
}
