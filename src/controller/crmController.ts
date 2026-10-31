import type { NextFunction, Request, Response } from "express";
import Client from "../models/clientModel";



export const getAllClient = async(req:Request,res:Response,next:NextFunction)=>{
try {
  const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const search = String(req.query.search || "").trim();

    const skip = (page - 1) * limit;


  const filter: any = {};

    if (search) {
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { businessName: searchRegex },
      ];
    }

    const [clients, total] = await Promise.all([
      Client.find(filter).select("-reviews")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Client.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Clients fetched successfully",
      clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
    
} catch (error) {
    next(error)
}
}


export const getReviews = async(req:Request,res:Response,next:NextFunction)=>{
    try {
         const ClientId = req.params.id;
         const client = await Client.findById(ClientId);

    if(!client){
        return res.status(404).json({success:false,message:"Client Not found"})
    }

    return res.status(200).json({success:true,client});

    




    } catch (error) {
        next(error)
    }
}