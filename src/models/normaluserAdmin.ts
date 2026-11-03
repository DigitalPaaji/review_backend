import mongoose, { Document, Model, Schema } from "mongoose";
import { reviewDB } from "../helper/database";


export interface IUser extends Document{
  name:string;
  email:string;
  phonenumber:string; 
   reviews:mongoose.Types.ObjectId[]
}

const users = new Schema({
name:{
    type:String,
    required:true,
    trim:true,
},
   email:{
   type:String,
    required:true,
    trim:true},

   phonenumber:{
    type:String,
    required:true,
    unique:true,
    trim:true
   },
  reviews:[{type:mongoose.Schema.Types.ObjectId,ref:"Review"}]


},{
    timestamps:true
})

const User: Model<IUser> =
  (reviewDB.models.User as Model<IUser>) ||
  reviewDB.model<IUser>("User", users);

export default User;

