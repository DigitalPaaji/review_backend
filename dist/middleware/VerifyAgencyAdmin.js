"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const agencyAdminMode_1 = __importDefault(require("../models/agencyAdminMode"));
const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET2);
        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        const user = await agencyAdminMode_1.default.findById(decoded.id);
        if (!user || user.role !== "admin") {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Unauthorized or token expired",
        });
    }
};
exports.verifyAdmin = verifyAdmin;
//# sourceMappingURL=VerifyAgencyAdmin.js.map