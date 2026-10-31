"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyClient = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const clientModel_1 = __importDefault(require("../models/clientModel"));
const VerifyClient = async (req, res, next) => {
    try {
        const token = req.cookies.client_token;
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decode || !decode?.id) {
            throw new Error("Token not Found");
        }
        const client = await clientModel_1.default.findOne({ _id: decode.id, active: true }).select("-reviews");
        if (!client) {
            throw new Error("Client not Found");
        }
        req.user = client;
        next();
        //  return res.status(200).json({data:client})
    }
    catch (error) {
        return res.status(500).json({
            success: false, message: "Invalid"
        });
    }
};
exports.VerifyClient = VerifyClient;
//# sourceMappingURL=verifyClient.js.map