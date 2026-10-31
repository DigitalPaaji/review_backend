"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const database_1 = require("../helper/database");
const ClientSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    active: {
        type: Boolean,
        default: true,
    },
    businessName: {
        type: String,
        required: true,
        trim: true,
    },
    placeId: {
        type: String,
        trim: true,
    },
    googleUrl: {
        type: String,
        trim: true,
    },
    hasGeneratedQr: {
        type: Boolean,
        default: false,
    },
    savedQrUrl: {
        type: String,
        default: "",
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    reviews: [
        { rating: {
                type: Number
            },
            text: {
                type: String
            },
            time: {
                type: Date
            }
        }
    ]
}, {
    timestamps: true,
});
const Client = database_1.reviewDB.models.Client ||
    database_1.reviewDB.model("Client", ClientSchema);
exports.default = Client;
//# sourceMappingURL=clientModel.js.map