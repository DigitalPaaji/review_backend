import mongoose, { Document, Model, Schema } from "mongoose";
import { reviewDB } from "../helper/database";

export interface IReview extends Document{
    rating: number;
     text: string;
     client:mongoose.Types.ObjectId;
     user:mongoose.Types.ObjectId;
 createdAt: Date;
  updatedAt: Date;
}


const reviewsSchema = new Schema<IReview>({

       rating:{
          type:Number
        },
        text:{
          type:String
        },
      
        user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
        },
        client:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"Client"
              }
},{timestamps:true})



const Review: Model<IReview> =
  (reviewDB.models.Review as Model<IReview>) ||
  reviewDB.model<IReview>("Review", reviewsSchema);

export default Review;

