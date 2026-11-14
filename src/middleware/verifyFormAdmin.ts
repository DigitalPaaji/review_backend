import type { NextFunction, Request, Response } from "express";
import JWT from "jsonwebtoken"
import Client from "../models/clientModel";
import FormAdmin from "../models/FormAdmin";

export const VerifyFormAdmin = async(req:Request,res:Response,next:NextFunction)=>{
try {
 const token = req.cookies.form_admin_token
   const decode =  JWT.verify(token,process.env.JWT_SECRET!) as any
  if(!decode || !decode?.id){
    throw new Error("Token not Found")
  }

   const formAdmin = await FormAdmin.findOne({_id:decode.id,active:true}).populate("formPage","title")

if(!formAdmin){
 throw new Error("Admin not Found")
}
    req.form = formAdmin
    
    next()

//  return res.status(200).json({data:client})
} catch (error) {
    return res.status(500).json({
        success:false,message:"Invalid"
    })
}
}