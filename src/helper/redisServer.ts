import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  RESP: 2,
});
redisClient.on("error", (err: Error) => {
  console.error("Redis Error:", err);
});
redisClient.on("ready", () => {
  console.log("Redis connected successfully");
});

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};


export default redisClient; 