import { model, Schema } from "mongoose";
import { reviewDB } from "../helper/database";

const formFieldSchema = new Schema(
  {
    

    label: {
      type: String,
      required: true,
      trim: true,
    },


    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "email",
        "number",
        "phone",
        "password",
        "url",
        "date",
        "time",
        "datetime",
        "month",
        "week",
        "color",
        "select",
        "radio",
        "checkbox",
        "paragraph",
        "divider",
      ],
      required: true,
    },

    placeholder: {
      type: String,
      default: "",
    },

   

    helpText: {
      type: String,
      default: "",
    },

    required: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    readOnly: {
      type: Boolean,
      default: false,
    },

    // Select, Radio, Checkbox options
    options: [{type:String}],

    
  },
  { _id: true }
);


const FormPageSchema= new Schema({
     title: {
      type: String,
      required: true,
      trim: true,
    },
      slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
   description: {
      type: String,
      default: "",
    },
    bannerImage:{
      type:String,
      default:null
    },
      fields: {
      type: [formFieldSchema],
      default: [],
    },
   leadEmail:{
      type: String,
      trim: true,
   },

    status: {
      type: String,
      enum: ["draft", "published", "inactive"],
      default: "published",
    },
    formcolors:{
      bg_form:{type:String,default:"#F7F7F8"},
      label_form:{type:String,default:"#364153"},
      title_form:{type:String,default:"#252525"},
    },
    consents:[{type:String}],
    media:{
      type:String,
      enum:["null","email","whatsapp","SMS"],
      default:"null",
    },  
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "FormAdmin",
    },
},{
    timestamps: true,
  })


const FormPage =(reviewDB.models.FormPage ) ||
  reviewDB.model("FormPage", FormPageSchema);


// model("FormPage",FormPageSchema)
export default FormPage;
