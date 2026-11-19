import { Schema } from "mongoose";
import { reviewDB } from "../helper/database";

const leadRateSchema= new Schema({
  leadRateName:{
        type:String,
        enum:["null","email","whatsapp","SMS"],
        unique:true,
    },
    amount:{
        type:Number,
        required:true
    }

},{
    timestamps:true
})



const LeadRate= (reviewDB.models.LeadRate ) ||
  reviewDB.model("LeadRate", leadRateSchema);

  export default LeadRate;