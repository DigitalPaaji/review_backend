import { NextFunction, Request, Response } from "express";
import Client from "../models/clientModel";
import { randomInt } from "node:crypto";
import sendSms from "../helper/sendSms";
import redisClient from "../helper/redisServer";
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
import { IReview } from "../models/reviewsModel";


export const SendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, password, businessName,name } = req.body;

    // 1. Required field validation
    if (
      !name ||
      !phone ||
      !password ||
      !businessName ||
      typeof phone !== "string" ||
      typeof password !== "string" ||
      typeof businessName !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name ,Phone, password and business name are required.",
      });
    }

    // 2. Length validation
    if (
      phone.length > 12 ||
      businessName.length > 150 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    // 3. Phone validation (India)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    // 4. Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // 5. Business name validation
    if (!businessName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business name is required.",
      });
    }

    // 6. Check existing client
    const alreadyExists = await Client.findOne({ phone });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "An account with this Phone Number already exists.",
      });
    }

    // 7. Generate OTP
    const otp = randomInt(100000, 1000000).toString();

    const cacheKey = `review-client-verify:${phone}`;

    // 8. Save OTP in Redis for 5 minutes
    await redisClient.set(cacheKey, otp, {
      EX: 300,
    });

    // 9. Send OTP using Authkey
    const smsResult = await sendSms(phone, otp);

    if (!smsResult.success) {

      await redisClient.del(cacheKey);

      return res.status(502).json({
        success: false,
        message: "Unable to send OTP. Please try again.",
      });
    }

    // 10. Success response
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });

  } catch (error) {
    next(error);
  }
};


export const verifyOtp= async(req:Request,res:Response,next:NextFunction)=>{
    try {
const {name,phone,password,businessName,otp} = req.body;
   if (!name || !phone || !password || !businessName || !otp) {
      return res.status(400).json(
        {
          success: false,
          message: "Name ,Email, password , business name and Otp are required.",
        },
        
      );
    }

     if (
      phone.length > 12 ||
      name.length > 50 ||
      businessName.length > 150 ||
      password.length > 128
    ) {
      return res.status(400).json(
        {
          success: false,
          message: "One or more fields exceed the allowed length.",
        },
      
      );
    }

     if (password.length < 5) {
      return res.status(400).json(
        {
          success: false,
          message: "Password must be at least 8 characters long.",
        },
        
      );
    }


    const alreadyExists = await Client.findOne({ phone });

    if (alreadyExists) {
      return res.status(409).json(
        {
          success: false,
          message: "An account with this Phone Number already exists.",
        },
       
      );
    }

    const cacheKey = `review-client-verify:${phone}`;
   
   const getOtp = await redisClient.get(cacheKey)

    if(!getOtp){
     return res.status(409).json(
        {
          success: false,
          message: "Expired Otp.",
        })
    }
  if(getOtp.toString() !==otp.toString() ){

  return res.status(409).json(
        {
          success: false,
          message: "Invalied Otp.",
        })

  }

  const hashPassword  = await bcrypt.hash(password,10)

const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + 365);

await Client.create({name,
    phone,password:hashPassword,businessName,expiryDate
})


 await redisClient.del(cacheKey)
return res.status(201).json({
    success:true,message:"Client Created"
})

        
    } catch (error) {
        next(error)
    }
}


export const loginClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and password are required.",
      });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    const findClient = await Client.findOne({ phone }).select("+password");

    if (!findClient) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password.",
      });
    }

    const comparePassword = await bcrypt.compare(
      password,
      findClient.password
    );

    if (!comparePassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password.",
      });
    }


    const token = JWT.sign(
      { id: findClient._id },
      process.env.JWT_SECRET!,
      { expiresIn: "90d" }
    );


    res.cookie("client_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 90 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
   
    });

  } catch (error) {
    console.log(error)
    next(error);
  }
};


export const logout= async( req: Request,res: Response,next: NextFunction)=>{
try {
  

 res.clearCookie("client_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successfully",
    });




} catch (error) {
  next(error)
}
}



export const verifyClient = async(req: Request,res: Response,next: NextFunction) =>{
try {
    const client = req.user;

    return res.status(200).json({success:true,client})

} catch (error) {
    next(error)
}
}




const TIME_ZONE = "Asia/Kolkata";

const getIndiaDateKey = (date: Date): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
};

const getIndiaStartOfDay = (dateKey: string): Date => {
  // India is UTC+5:30
  return new Date(
    new Date(`${dateKey}T00:00:00.000Z`).getTime() -
      330 * 60 * 1000
  );
};

const getDateLabel = (date: Date): string => {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
  }).format(date);
};

export const getDashboadData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as { _id?: string } | undefined;

    if (!user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const client = await Client.findById(user._id)
      .select("name businessName reviews active hasGeneratedQr savedQrUrl expiryDate").populate("reviews")
  

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }
console.log(client)
    const reviews = (client.reviews as unknown as IReview[])
      .filter((review : IReview) => review?.createdAt && !Number.isNaN(new Date(review.createdAt).getTime()))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const now = new Date();
    const todayKey = getIndiaDateKey(now);
    const currentMonthKey = todayKey.slice(0, 7);

    // Today's reviews
    const todayReviews = reviews.filter(
      (review) => getIndiaDateKey(new Date(review.createdAt)) === todayKey
    );

    // This month's reviews
    const thisMonthReviews = reviews.filter(
      (review) =>
        getIndiaDateKey(new Date(review.createdAt)).slice(0, 7) ===
        currentMonthKey
    );

    // Average rating
    const totalRating = reviews.reduce(
      (total, review) => total + Number(review.rating || 0),
      0
    );

    const averageRating =
      reviews.length > 0
        ? Number((totalRating / reviews.length).toFixed(1))
        : 0;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: reviews.filter(
        (review) => Number(review.rating) === rating
      ).length,
    }));

    // Last 7 days chart data
    const todayStart = getIndiaStartOfDay(todayKey);

    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(
        todayStart.getTime() - (6 - index) * 24 * 60 * 60 * 1000
      );

      const key = getIndiaDateKey(date);

      const count = reviews.filter(
        (review) => getIndiaDateKey(new Date(review.createdAt)) === key
      ).length;

      return {
        date: key,
        label: getDateLabel(date),
        reviews: count,
      };
    });

    // Last 30 days total
    const last30DaysStart = new Date(
      todayStart.getTime() - 29 * 24 * 60 * 60 * 1000
    );

    const last30DaysReviews = reviews.filter((review) => {
      const reviewTime = new Date(review.createdAt).getTime();

      return (
        reviewTime >= last30DaysStart.getTime() &&
        reviewTime <= now.getTime()
      );
    });

    // Recent reviews
    const recentReviews = reviews.slice(0, 5).map((review) => ({
      rating: review.rating,
      text: review.text,
      time: review.createdAt,
    }));

    // Today's reviews list
    const todayReviewsList = todayReviews.map((review) => ({
      rating: review.rating,
      text: review.text,
      time: review.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",

      client: {
        name: client.name,
        businessName: client.businessName,
        active: client.active,
        hasGeneratedQr: client.hasGeneratedQr,
        savedQrUrl: client.savedQrUrl,
        expiryDate: client.expiryDate,
      },

      stats: {
        totalReviews: reviews.length,
        todayReviews: todayReviews.length,
        thisMonthReviews: thisMonthReviews.length,
        last30DaysReviews: last30DaysReviews.length,
        averageRating,
        fiveStarReviews: ratingDistribution.find(
          (item) => item.rating === 5
        )?.count || 0,
        fourStarReviews: ratingDistribution.find(
          (item) => item.rating === 4
        )?.count || 0,
      },

      charts: {
        last7Days,
        ratingDistribution,
      },

      todayReviews: todayReviewsList,
      recentReviews,
    });
  } catch (error) {
    next(error);
  }
};


export const fullsetup = async(req: Request,res: Response,next: NextFunction)=>{
    try {
        const {googleUrl,placeId,location,industry,services,description} = req.body
             const user = req.user
        if(!googleUrl || !placeId || !location || !industry || !services){
         return res.status(400).json({success:false,message:"Required all fielda"})}


      const client = await Client.findById(user?._id)

       if(!client){return res.status(400).json({success:false,message:"Required all fielda"})}
    
  const params = new URLSearchParams({
        business: client.businessName || "",
        location,
        industry,
        services,
        desc: description,
        placeid: placeId || "",
        googleurl: googleUrl || "",
        expires: String(client.expiryDate),
        uid:String(client._id),
        
      });


         client.placeId=placeId
         client.googleUrl=googleUrl
         client.hasGeneratedQr=true
         client.savedQrUrl=`${process.env.QRCODE_URL}?${params.toString()}`
         
        client.save();


        return res.status(200).json({success:true,client})

    } catch (error) {
        next(error)
    }
}



export const UpdateProfile = async(req: Request,res: Response,next: NextFunction)=>{
  try {
    const user = req.user;
    const {name,email,phone,businessName,placeId,googleUrl,password,location,industry,services,description} = req.body



     const client = await Client.findById(user?._id);

 if(!client){
return res.status(200).json({
  success:false,message:"Client not Found"
})
 }
 

client.name=name
client.email=email
client.phone=phone
client.businessName=businessName
client.placeId=placeId
client.googleUrl=googleUrl
if(password){
const hashpass = await bcrypt.hash(password,10)
  client.password=hashpass
}

  const params = new URLSearchParams({
        business: client.businessName || "",
        location,
        industry,
        services,
        desc: description,
        placeid: placeId || "",
        googleurl: googleUrl || "",
        expires: String(client.expiryDate),
        uid:String(client._id),
        
      });

client.savedQrUrl=`${process.env.QRCODE_URL}?${params.toString()}`
await client.save()


return res.status(200).json({success:true,client})





  } catch (error) {
    
  }
}



