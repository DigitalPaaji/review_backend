import { model, Schema } from "mongoose";
import { reviewDB } from "../helper/database";

const formFieldSchema = new Schema(
  {
    fieldId: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
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
        "range",
        "file",
        "image",
        "select",
        "radio",
        "checkbox",
        "toggle",
        "hidden",
        "heading",
        "paragraph",
        "divider",
      ],
      required: true,
    },

    placeholder: {
      type: String,
      default: "",
    },

    defaultValue: {
      type: Schema.Types.Mixed,
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
    options: [
      {
        label: String,
        value: String,
      },
    ],

    // Input validation
    validation: {
      min: Number,
      max: Number,
      minLength: Number,
      maxLength: Number,
      pattern: String,
      accept: String,
      multiple: {
        type: Boolean,
        default: false,
      },
    },


    size: {
      width: {
        type: Number,
        default: 12, // 1-12 grid columns
        min: 1,
        max: 12,
      },

      height: {
        type: Number,
        default: 44,
        min: 1,
      },

      unit: {
        type: String,
        enum: ["px", "rem", "%"],
        default: "px",
      },

      rows: {
        type: Number,
        default: 4,
      },
    },

 
    style: {
      backgroundColor: String,
      textColor: String,
      borderColor: String,
      borderRadius: Number,
      fontSize: Number,
      fontWeight: String,
      alignment: {
        type: String,
        enum: ["left", "center", "right"],
        default: "left",
      },
    },

    order: {
      type: Number,
      default: 0,
    },
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
 settings: {
      columns: {
        type: Number,
        default: 12,
        min: 1,
        max: 12,
      },

      backgroundColor: {
        type: String,
        default: "#ffffff",
      },

      formWidth: {
        type: Number,
        default: 700,
      },

      formAlignment: {
        type: String,
        enum: ["left", "center", "right"],
        default: "center",
      },

      submitButtonText: {
        type: String,
        default: "Submit",
      },

      submitButtonColor: {
        type: String,
        default: "#2563eb",
      },

      successMessage: {
        type: String,
        default: "Form submitted successfully!",
      },
    },

    status: {
      type: String,
      enum: ["draft", "published", "inactive"],
      default: "published",
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
