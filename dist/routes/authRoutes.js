"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const createClients_1 = require("../controller/createClients");
const verifyClient_1 = require("../middleware/verifyClient");
const routes = express_1.default.Router();
routes.post("/account-requests", createClients_1.SendOtp);
routes.post("/verify-otp", createClients_1.verifyOtp);
routes.post("/login", createClients_1.loginClient);
routes.get("/logout", verifyClient_1.VerifyClient, createClients_1.logout);
routes.get("/verify", verifyClient_1.VerifyClient, createClients_1.verifyClient);
routes.get("/dashboard", verifyClient_1.VerifyClient, createClients_1.getDashboadData);
routes.put("/fullsetup", verifyClient_1.VerifyClient, createClients_1.fullsetup);
routes.put("/update-profile", verifyClient_1.VerifyClient, createClients_1.UpdateProfile);
exports.default = routes;
//# sourceMappingURL=authRoutes.js.map