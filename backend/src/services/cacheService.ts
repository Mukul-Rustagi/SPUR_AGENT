import { createClient } from "redis";
import crypto from "crypto";

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redisClient !== null) {
    return redisClient;
  }

  const REDIS_URL = process.env.REDIS_URL;
  const REDIS_USERNAME = process.env.REDIS_USERNAME;
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
  const REDIS_HOST = process.env.REDIS_HOST;
  const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined;

  if (!REDIS_URL && !REDIS_HOST) {
    return null;
  }

  try {
    let client;
    if (REDIS_URL) {
      client = createClient({ url: REDIS_URL });
    } else if (REDIS_HOST && REDIS_PORT) {
      client = createClient({
        username: REDIS_USERNAME || "default",
        password: REDIS_PASSWORD,
        socket: {
          host: REDIS_HOST,
          port: REDIS_PORT,
        },
      });
    } else {
      return null;
    }
    
    client.on("error", (err) => {
      console.error("Redis Client Error:", err.message);
    });

    await client.connect();
    redisClient = client;
    return redisClient;
  } catch (error: any) {
    console.error("Redis connection failed:", error.message);
    redisClient = null;
    return null;
  }
}

export class CacheService {
  private readonly TTL = 3600; // 1 hour

  private getCacheKey(userMessage: string): string {
    const normalized = userMessage.toLowerCase().trim();
    const hash = crypto.createHash("sha256").update(normalized).digest("hex");
    return `chat:${hash}`;
  }

  async get(userMessage: string): Promise<string | null> {
    try {
      const client = await getRedisClient();
      if (!client) return null;

      const key = this.getCacheKey(userMessage);
      const cached = await client.get(key);
      return cached;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(userMessage: string, reply: string): Promise<void> {
    try {
      const client = await getRedisClient();
      if (!client) return;

      const key = this.getCacheKey(userMessage);
      await client.setEx(key, this.TTL, reply);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }
}

export const cacheService = new CacheService();

