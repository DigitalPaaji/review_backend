import  type { NextFunction, Request, Response } from "express";


const errorHandler  = (err : any, req:Request, res:Response, next:NextFunction)=>{
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
     res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
}


export default errorHandler;