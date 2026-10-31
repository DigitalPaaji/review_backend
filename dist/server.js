"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./helper/database");
const redisServer_1 = require("./helper/redisServer");
const errorHandler_1 = __importDefault(require("./helper/errorHandler"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const reviewAuth_1 = __importDefault(require("./routes/reviewAuth"));
const app = (0, express_1.default)();
const allowedOrigins = [
    ...(process.env.FRONTEND_URL?.split(",") || []),
    "app://-",
].map((origin) => origin.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests without an Origin header
        // (Electron / server-side requests)
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/ping", async (req, res) => { return res.status(200).send("Pong"); });
app.use("/api/v1/client/auth", authRoutes_1.default);
app.use("/api/v1/review", reviewAuth_1.default);
app.use(errorHandler_1.default);
const PORT = Number(process.env.PORT) || 8000;
const startServer = async () => {
    try {
        await (0, database_1.connectDatabases)();
        await (0, redisServer_1.connectRedis)();
        app.listen(PORT, () => {
            console.log(`http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map