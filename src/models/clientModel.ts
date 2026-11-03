import mongoose, { Schema, Document, Model } from "mongoose";
import { reviewDB } from "../helper/database";





export interface IClient extends Document {
  name: string;
  phone: string;
  email?: string;
  password: string;
  active: boolean;
  businessName: string;
  placeId?: string;
  googleUrl?: string;
  hasGeneratedQr: boolean;
  savedQrUrl: string;
  expiryDate: Date;
  createdAt: Date;
  reviews:mongoose.Types.ObjectId[]
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
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
    reviews:[{type:mongoose.Schema.Types.ObjectId,ref:"Review"}]
  },
  {
    timestamps: true,
  }
);

const Client: Model<IClient> =
  (reviewDB.models.Client as Model<IClient>) ||
  reviewDB.model<IClient>("Client", ClientSchema);

export default Client;