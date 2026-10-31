import type { NextFunction, Request, Response } from "express";
import JWT from "jsonwebtoken"
import Emp from "../models/agencyAdminMode";


 export const verifyAdmin = async(req: Request,res: Response,next: NextFunction)=>{
try {
    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }
      const token = authHeader.split(" ")[1];

    
     const decoded = JWT.verify(
      token,
      process.env.JWT_SECRET2 as string
    ) as any;


       if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
         }
        const user = await Emp.findById(decoded.id);
    
        if (!user || user.role !=="admin") {
          return res.status(404).json({
            success: false,
            message: "Admin not found",
          });
        }
      

           (req as any).user = user;

    next();


} catch (error) {
  console.log(error)
      return res.status(401).json({
      success: false,
      message: "Unauthorized or token expired",
    });
}
}


