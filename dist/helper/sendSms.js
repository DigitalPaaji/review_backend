"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const sendSms = async (mobile, otp) => {
    try {
        const response = await axios_1.default.get("https://api.authkey.io/request", {
            params: {
                authkey: process.env.AUTHKEY_API_KEY,
                mobile,
                country_code: "91",
                sid: process.env.AUTHKEY_OTP_SID,
                otp,
            },
            timeout: 15000,
        });
        console.log("Authkey Response:", response.data);
        // Do not assume HTTP 200 means SMS was accepted.
        // Confirm the actual success response from Authkey.
        return {
            success: true,
            data: response.data,
        };
    }
    catch (error) {
        console.error("Authkey Error:", error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data || error.message,
        };
    }
};
exports.default = sendSms;
//# sourceMappingURL=sendSms.js.map