import { Document, model, Schema } from "mongoose";
import { crmDB } from "../helper/database";

interface IEmp extends Document{
name : string;
email : string;
password : string;
profile : number;
lastlogin:Date;
active:Boolean;
access: string[];
role: "emp" |"admin" |"agency"
}



const employSchema = new Schema<IEmp>({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
          type:String,
        required:true,
    },
   profile:{
    type:Number,
   },
   lastlogin:{
    type:Date
   },
   active:{
    type:Boolean,
    default:true
   },

 access:[String],


   role:{
    type:String,
    enum:["admin","emp","agency","client"],
    default:"emp"
   }
},{
    timestamps:true
})



const Emp =  crmDB.model<IEmp>("employee",employSchema)

export default Emp;


