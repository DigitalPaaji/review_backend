import mongoose from "mongoose";
import { Schema } from "mongoose";
import { reviewDB } from "../helper/database";




const FormDataSchema = new Schema({
    formId:{
       type: Schema.Types.ObjectId,
      ref: "FormPage",
      required: true,
      index: true,
    },
    userId:{
         type: Schema.Types.ObjectId,
      ref: "FormAdmin",
      required: true,
      index: true,
    },

    submissionData: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
      userAgent: {
  type: String,
  trim: true,
},
 ipAddress: {
      type: String,
    },
       status: {
      type: String,
      enum: ["new", "read", "archived"],
      default: "new",
    },
},{timestamps:true})




const FormdataLeads = (reviewDB.models.FormPageData ) ||
  reviewDB.model("FormPageData", FormDataSchema);


  export default FormdataLeads
