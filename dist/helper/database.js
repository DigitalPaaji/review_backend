"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabases = exports.crmDB = exports.reviewDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.reviewDB = mongoose_1.default.createConnection(process.env.DATABASE_URL);
exports.crmDB = mongoose_1.default.createConnection(process.env.DB_URL);
const connectDatabases = async () => {
    try {
        await Promise.all([
            exports.reviewDB.asPromise(),
            exports.crmDB.asPromise(),
        ]);
        console.log("Learning database connected");
        console.log("CRM database connected");
    }
    catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};
exports.connectDatabases = connectDatabases;
//# sourceMappingURL=database.js.map