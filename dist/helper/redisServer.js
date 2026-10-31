"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    RESP: 2,
});
redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});
redisClient.on("ready", () => {
    console.log("Redis connected successfully");
});
const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};
exports.connectRedis = connectRedis;
exports.default = redisClient;
//# sourceMappingURL=redisServer.js.map