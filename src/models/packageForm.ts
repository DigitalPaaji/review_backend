import { Schema } from "mongoose";
import { reviewDB } from "../helper/database";


const packageSchema = new Schema({
    title: {
      type: String,
      required: [true, "Package title is required"],
      unique: true,
      trim: true,
    },
      formLimit: {
      type: Number,
      required: [true, "Form limit is required"],
      min: [1, "Form limit must be at least 1"],
      default: 1,
    },
 
       fields: {
      type: Number,
      required: [true, "Field limit is required"],
      min: [-1, "Invalid field limit"],
      default: 5,
      // -1 means unlimited
      validate: {
        validator: (value: number) =>
          value === -1 || value >= 1,
        message: "Fields must be -1 (unlimited) or at least 1",
      },
    },
     price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
     active: {
      type: Boolean,
      default: true,
    },

},{
    timestamps:true
})



const FormPackage = (reviewDB.models.FormPackage ) ||
  reviewDB.model("FormPackage", packageSchema);

  export default FormPackage;
  

