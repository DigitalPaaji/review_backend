import type { NextFunction, Request, Response } from "express";
import User from "../models/normaluserAdmin";
import Client from "../models/clientModel";
import JWT from "jsonwebtoken"

export const createUser= async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {name ,email,phonenumber,text,clientId,rating} = req.body;
        const client = await Client.findById(clientId)
       if(!client){
         return res.status(404).json({success:false,message:"Client not Found "})
       }
const time = new Date(Date.now());


   const fullReview = {
            text,
            rating,
            time,
            client:clientId
         }



        let  findAllready = await User.findOne({phonenumber});
        if(findAllready){

        
          findAllready.reviews =[...findAllready.reviews,fullReview]
           await  findAllready.save();

        }else{

           findAllready= await User.create({
        name ,email,phonenumber,reviews:[fullReview]
           })
        }


           const fullReviewClinet = {
            text,
            rating,
            time,
            user:findAllready._id
         }

       
client.reviews.push(fullReviewClinet)

await client.save()


    const token = JWT.sign(
      { id: findAllready._id },
      process.env.JWT_SECRET!,
      { expiresIn: "90d" }
    );


    res.cookie("review_user", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 90 * 24 * 60 * 60 * 1000,
      path: "/",
    });
 return res.status(201).json({success:true,message:"Add Data"})

    } catch (error) {
        next(error)
    }
}


export const getUser = async(req:Request,res:Response,next:NextFunction)=>{
    try {
         const token = req.cookies.review_user;
         if(!token){return  res.status(400).json({ success:false,message:"Not login" })}  
         
           const decode =  JWT.verify(token,process.env.JWT_SECRET!) as any
           if(!decode || !decode?.id){
             throw new Error("Token not Found")
           }

           const user = await User.findById(decode.id).select("name")
            
           if(!user){
             throw new Error("Client not Found")
           }
           
           return res.status(200).json({success:true,user})

    } catch (error) {
        next(error)
    }
}