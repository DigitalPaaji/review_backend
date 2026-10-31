import type { NextFunction, Request, Response } from "express";
import JWT from "jsonwebtoken"
import Client from "../models/clientModel";

export const VerifyClient = async(req:Request,res:Response,next:NextFunction)=>{
try {
 const token = req.cookies.client_token
   const decode =  JWT.verify(token,process.env.JWT_SECRET!) as any
  if(!decode || !decode?.id){
    throw new Error("Token not Found")
  }

   const client = await Client.findOne({_id:decode.id,active:true}).select("-reviews")

if(!client){
 throw new Error("Client not Found")
}
    req.user = client
    
    next()

//  return res.status(200).json({data:client})
} catch (error) {
    return res.status(500).json({
        success:false,message:"Invalid"
    })
}
}