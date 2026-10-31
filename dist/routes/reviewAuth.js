"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewsController_1 = require("../controller/reviewsController");
const verifyClient_1 = require("../middleware/verifyClient");
const routes = express_1.default.Router();
routes.post("/generate", reviewsController_1.generateReview);
routes.post("/add/:id", reviewsController_1.addReview);
routes.get("/getreviews", verifyClient_1.VerifyClient, reviewsController_1.getMyReviews);
exports.default = routes;
//# sourceMappingURL=reviewAuth.js.map