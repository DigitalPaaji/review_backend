"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const database_1 = require("../helper/database");
const employSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profile: {
        type: Number,
    },
    lastlogin: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true
    },
    access: [String],
    role: {
        type: String,
        enum: ["admin", "emp", "agency", "client"],
        default: "emp"
    }
}, {
    timestamps: true
});
const Emp = database_1.crmDB.model("employee", employSchema);
exports.default = Emp;
//# sourceMappingURL=agencyAdminMode.js.map