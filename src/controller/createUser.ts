import type { NextFunction, Request, Response } from "express";
import User from "../models/normaluserAdmin";
import Client from "../models/clientModel";
import JWT from "jsonwebtoken"
import Review from "../models/reviewsModel";

export const createUser= async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {name ,email,phonenumber,text,clientId,rating} = req.body;
     if (!name || !phonenumber || !clientId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required information",
      });
    }

        const client = await Client.findById(clientId)
       if(!client){
         return res.status(404).json({success:false,message:"Client not Found "})
       }
 


 



           let user = await User.findOne({ phonenumber });
        if (!user) {
          user = await User.create({
          name,
        email,
        phonenumber,
      });
    }
const review = await Review.create({
      text,
      rating,

      client: client._id,
      user: user._id,
    });
  
 client.reviews.push(review._id);
    user.reviews.push(review._id);


           await Promise.all([
      client.save(),
      user.save(),
    ]);


    const token = JWT.sign(
      { id: user._id },
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