import type { NextFunction, Request, Response } from "express";
import Client from "../models/clientModel";
import User from "../models/normaluserAdmin";
import Review from "../models/reviewsModel";
import FormAdmin from "../models/FormAdmin";
import JWT from "jsonwebtoken"
import redisClient from "../helper/redisServer";
import FormPackage from "../models/packageForm";
import LeadRate from "../models/FormLeadRate";


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
         const client = await Client.findById(ClientId).populate({
  path: "reviews",
  populate: {
    path: "user",
    select: "name email phonenumber", 
  },
});

    if(!client){
        return res.status(404).json({success:false,message:"Client Not found"})
    }

    return res.status(200).json({success:true,client});






    } catch (error) {
        next(error)
    }
}

export const deleteClient= async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const clientId = req.params.id;
        const client = await Client.findByIdAndDelete(clientId)

        return res.status(200).json({success:true})
           


    } catch (error) {
        next(error)
    }
}




export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  
    const reviewId = req.params.id;

     const review = await Review.findById(reviewId);
   if(!review){
    return res.status(401).json({success:false,message:"Review not found"})
   }

   const [client ,user ] =  await Promise.all([
         Client.findById(review.client),
         User.findById(review.user)
])


 if (!client || !user) {
      return res.status(404).json({
        success: false,
        message: "Client or User not found",
      });
    }

client.reviews = client.reviews.filter(
  (id) => id.toString() !== review._id.toString()
);

user.reviews = user.reviews.filter(
  (id) => id.toString() !== review._id.toString()
);

  await Promise.all([
      client.save(),
      user.save(),
      Review.findByIdAndDelete(review._id),
    ]);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};

export const toggleClient =async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const clientId = req.params.id;
   const {active} = req.body
    
      await Client.findByIdAndUpdate(clientId,{active})

        return res.status(200).json({success:true,message:"Updated"})

  } catch (error) {
    next(error)
  }
}



export const getAllUser = async(req:Request,res:Response,next:NextFunction)=>{
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
      
      ];
    }

    const [user, total] = await Promise.all([
      User.aggregate([
  { $match: filter },
  {
    $addFields: {
      reviewsCount: { $size: { $ifNull: ["$reviews", []] } },
    },
  },
  { $project: { reviews: 0 } },
  { $sort: { createdAt: -1 } },
  { $skip: skip },
  { $limit: limit },
]),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
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





export const getAllFormUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      100
    );

    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim().toUpperCase();
    const active = String(req.query.active || "").trim().toLowerCase();

    const skip = (page - 1) * limit;

    const filter: any = {};

    // Search by name, email or phone
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Filter by approval status
    const allowedStatuses = [
      "APPROVED",
      "PENDING",
      "REJECTED",
      "BLOCKED",
    ];

    if (status && allowedStatuses.includes(status)) {
      filter.status = status;
    }

    // Filter by active / inactive
    if (active === "true") {
      filter.active = true;
    } else if (active === "false") {
      filter.active = false;
    }

    const [formUser, totalFormUser] = await Promise.all([
      FormAdmin.find(filter)
        .select("phone name email active formpageLimit status createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      FormAdmin.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalFormUser / limit);

    return res.status(200).json({
      success: true,
      message: "Clients fetched successfully",
      formUser,
      pagination: {
        total: totalFormUser,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginAdminUser =async(req:Request,res:Response,next:NextFunction)=>{
try {
  
const clientId = req.params.id;
const client = await FormAdmin.findById(clientId)

if(!client){
  return res.status(401).json({success:false,message:"User not Found"})
}


 const token = JWT.sign(
      { id: client._id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

 
 await redisClient.set("crm-admin-acess-form-user",token,{
  EX:60
 })
const url = `${process.env.ADMIN_LOGIN_URL1}/addverify/${token}`

return res.status(200).json({success:true,url})


} catch (error) {
  next(error)
}

}


export const getAdminUser =async(req:Request,res:Response,next:NextFunction)=>{
try {
  
const clientId = req.params.id;
const client = await FormAdmin.findById(clientId)

if(!client){
  return res.status(401).json({success:false,message:"User not Found"})
}



return res.status(200).json({success:true,client})


} catch (error) {
  next(error)
}

}


const SEND_LEAD_OPTIONS = ['null', 'email', 'whatsapp', 'SMS']
const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']

// Only these fields can be updated from the admin edit page
const ALLOWED_FIELDS = [
  'name',
  'phone',
  'sendLead',
  'status',
  'active',
  'formpageLimit',
  'wallet_amount',
] as const



export const updatFormUser = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const clientId = req.params.id;

const client = await FormAdmin.findById(clientId)

 if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' })
    }

     const updates: Record<string, any> = {}
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' })
    }

    // 4. Validate each field
    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || !updates.name.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required' })
      }
      updates.name = updates.name.trim()
    }

    if (updates.phone !== undefined) {
      const phone = String(updates.phone).trim()
      if (!/^\d{10}$/.test(phone)) {
        return res
          .status(400)
          .json({ success: false, message: 'Phone must be a 10 digit number' })
      }
      // check duplicate phone on another client
      const exists = await FormAdmin.findOne({ phone, _id: { $ne: clientId } })
      if (exists) {
        return res
          .status(409)
          .json({ success: false, message: 'Phone already in use' })
      }
      updates.phone = phone
    }

    if (updates.sendLead !== undefined && !SEND_LEAD_OPTIONS.includes(updates.sendLead)) {
      return res.status(400).json({
        success: false,
        message: `sendLead must be one of: ${SEND_LEAD_OPTIONS.join(', ')}`,
      })
    }

    if (updates.status !== undefined && !STATUS_OPTIONS.includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${STATUS_OPTIONS.join(', ')}`,
      })
    }

    if (updates.active !== undefined && typeof updates.active !== 'boolean') {
      return res
        .status(400)
        .json({ success: false, message: 'active must be true or false' })
    }

    if (updates.formpageLimit !== undefined) {
      const limit = Number(updates.formpageLimit)
      if (!Number.isInteger(limit) || limit < 0) {
        return res.status(400).json({
          success: false,
          message: 'formpageLimit must be a non-negative whole number',
        })
      }
      updates.formpageLimit = limit
    }

    if (updates.wallet_amount !== undefined) {
      const amount = Number(updates.wallet_amount)
      if (Number.isNaN(amount) || amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'wallet_amount must be a non-negative number',
        })
      }
      updates.wallet_amount = amount
    }

    // 5. Apply updates and save
    client.set(updates)
    await client.save()

    return res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      client,
    })

  } catch (error) {
    next(error)
  }
}


export const getbyToken= async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const {token} = req.body;
   
     
    const getToken = await redisClient.get("crm-admin-acess-form-user")
     
     if(!getToken){
     return res.status(401).json({success:false,mesasge:"Token expire"})
     }
      
 if(getToken.toString() !== token){
  return res.status(401).json({success:false,mesasge:"Token expire"})
 }

    const  {id} = await JWT.verify(token,process.env.JWT_SECRET!) as any
const client = await FormAdmin.findById(id)
if(!client){
  return res.status(401).json({success:false,message:"User not Found"})
}
      const newtoken = JWT.sign({ id:client._id }, process.env.JWT_SECRET!, {
           expiresIn: "90d",
         });
     
       await redisClient.del("crm-admin-acess-form-user")

         res.cookie("form_admin_token", newtoken, {
           httpOnly: true,
           secure: process.env.NODE_ENV === "production",
           sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
           maxAge: 90 * 24 * 60 * 60 * 1000,
           path: "/",
         });




      
    return res.status(200).json({success:true})

  } catch (error) {
      next(error)
  }
}



export const createPackage =async(req:Request,res:Response,next:NextFunction)=>{
  try {

    const {title ,formLimit,fields,price,description} = req.body
   if(!title.trim() || !formLimit || !fields){
    return res.status(401).json({success:false,message:"Title ,Form Limit ,Fields limit and price are required"})
   }



       const allReadyPackage = await FormPackage.findOne({title:title.trim()})  
         if(allReadyPackage){
             return res.status(200).json({success:true,message:"Title Allready exist"})
         }
        const packageform = await FormPackage.create({title ,formLimit,fields,price,description})
       return res.status(201).json({success:true,message:"Package Created",package:packageform})

  } catch (error) {
    next(error)
  }
}


export const getAllpackage = async(req:Request,res:Response,next:NextFunction)=>{
  try {
   const allpackage = await FormPackage.find();


   return res.status(200).json({success:true,allpackage})

    

  } catch (error) {
    next(error)
  }
}

export const updatePackageStatus = async(req:Request,res:Response,next:NextFunction)=>{
try {
  const packageID = req.params.id;
  const {active} = req.body
 const getPackage = await FormPackage.findById(packageID);

 if(!getPackage){
  return res.status(401).json({success:false,message:"Package not found"})
 }

 getPackage.active = active

 await getPackage.save()
return res.status(200).json({success:true,message:"Package Update"})
} catch (error) {
  next(error)
}
}


export const DeletePackage=async(req:Request,res:Response,next:NextFunction)=>{
try {
    const packageID = req.params.id;
 
 const getPackage = await FormPackage.findByIdAndDelete(packageID);

 if(!getPackage){
  return res.status(401).json({success:false,message:"Package not found"})
 }

  return res.status(200).json({success:true,message:"Package Delete"})
} catch (error) {
  next(error)
}
  
}


export const updatePackage = async(req:Request,res:Response,next:NextFunction)=>{
try {
  const packageID = req.params.id;
  const {title,formLimit,fields,price,description} = req.body;
    if(!title.trim() || !formLimit || !fields ){
    return res.status(401).json({success:false,message:"Title ,Form Limit ,Fields limit and price are required"})
   }
 const getPackage = await FormPackage.findById(packageID);

 if(!getPackage){
  return res.status(401).json({success:false,message:"Package not found"})
 }

 getPackage.title = title
 getPackage.formLimit = formLimit
 getPackage.fields = fields
 getPackage.price = price
 getPackage.description = description

 await getPackage.save()
return res.status(200).json({success:true,message:"Package Update"})
} catch (error) {
  next(error)
}
}



export const CreateLeadRate=async(req:Request,res:Response,next:NextFunction)=>{
try {
  const {leadRateName,amount}=req.body

  const isExist = await LeadRate.exists({leadRateName})
if (isExist) {
  return res.status(400).json({
    success: false,
    message: "Lead rate already exists",
  });
}

   const leadRate = await LeadRate.create({leadRateName,amount})

  return res.status(201).json({
    success: true,
  leadRate
  });




} catch (error) {
  next(error)
}
}

export const getAllLeadRate=async(req:Request,res:Response,next:NextFunction)=>{
  try {
    
    const allLead = await LeadRate.find()
         
return res.status(200).json({success:true,allLead})

  } catch (error) {
    next(error)
  }
}

export const upDateLeadRate = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    
const leadRateId = req.params.id;
const {leadRateName,amount}=req.body

const leadrate = await LeadRate.findById(leadRateId);
   if(!leadrate){return res.status(200).json({success:false,message:"Lead rate not found"})}

  leadrate.leadRateName=leadRateName
  leadrate.amount=amount
  await leadrate.save();

return res.status(200).json({success:true,message:"Updates"})

  } catch (error) {
    next(error)
  }
}


export const deleteLeadRate= async(req:Request,res:Response,next:NextFunction)=>{
  try {
const leadRateId = req.params.id; 

   const leadrate = await LeadRate.findByIdAndDelete(leadRateId);
   if(!leadrate){return res.status(200).json({success:false,message:"Lead rate not found"})}

  return res.status(200).json({success:true,message:"Lead Rate Deleted"})
  } catch (error) {
    next(error)
  }
}