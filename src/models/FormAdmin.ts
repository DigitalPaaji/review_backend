
import mongoose, { Schema, Types, Model } from "mongoose";
import { reviewDB } from "../helper/database";

// Status type
export type FormAdminStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";


// FormAdmin interface


export interface IFormAdmin {
  phone: string;
  email?: string;
  name: string;
  password: string;
  active: boolean;
  formpageLimit: number;
  status: FormAdminStatus;
  formPage: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  wallet_amount:Number;
  sendLead:string;
}



const formAdminSchema = new Schema<IFormAdmin>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
   name:{
    type: String,
      lowercase: true,
      trim: true,
   required: true,
      
},
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
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

    formpageLimit: {
      type: Number,
      default: 1,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "APPROVED",
    },

    formPage: [
      {
        type: Schema.Types.ObjectId,
        ref: "FormPage",
      },
    ],
  
   wallet_amount:{
   type:Number,
   default:0
    },
    sendLead:{
      type:String,
      enum:["null","email","whatsapp","SMS"],
      default:"null"
    }
    








  //  package:{
  //   ptype:{
  //     type:mongoose.Schema.Types.ObjectId,
  //     ref:"FormPackage"
  //   },
  //   p_validity
  //  }


  },
  {
    timestamps: true,
  }
);

// Model
const FormAdmin: Model<IFormAdmin> =
  (reviewDB.models.FormAdmin as Model<IFormAdmin>) ||
  reviewDB.model<IFormAdmin>("FormAdmin", formAdminSchema);

export default FormAdmin;
