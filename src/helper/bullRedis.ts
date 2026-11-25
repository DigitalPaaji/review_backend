import IORedis from "ioredis";

const bullRedis = new IORedis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
  }
);

bullRedis.on("connect", () => {
  console.log("BullMQ Redis connecting...");
});

bullRedis.on("ready", () => {
  console.log("BullMQ Redis connected!");
});

bullRedis.on("error", (err) => {
  console.error("BullMQ Redis Error:", err);
});

export default bullRedis;