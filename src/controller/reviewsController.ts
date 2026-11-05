import type { NextFunction, Request, Response } from "express";
import OpenAI from "openai";
import Client from "../models/clientModel";
import User from "../models/normaluserAdmin";
import mongoose from "mongoose";
import Review from "../models/reviewsModel";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 25000,
  maxRetries: 0,
});



function getErrorStatus(error : any) {
  const status = Number(error?.status);

  if (status === 401 || status === 403) return status;
  if (status === 429) return 429;
  if ([400, 404, 422].includes(status)) return status;
  if (status === 408 || error?.name === "APIConnectionTimeoutError") {
    return 504;
  }

  return 502;
}



export const generateReview = async(req:Request,res:Response,next:NextFunction)=>{
    try {
const {businessName,location,description,services,industry, stars} = req.body
       

if (!process.env.OPENAI_API_KEY) {
      return res.status(404).json(
        { success: false, error: "OPENAI_API_KEY is not configured." });
    }
const rating = Number(stars);
 if (!businessName) {
      return res.status(404).json(
        { success: false, error: "Business name is required." });
    }
 if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(404).json(
        { success: false, error: "Star rating must be between 1 and 5." }
      );
    }


const prompt=`
Return ONLY valid JSON.

The response must be an object in exactly this format:
{
  "reviews": [
    "Review 1",
    "Review 2",
    "Review 3",
    "Review 4",
    "Review 5"
  ]
}
  data is :Location: ${location || "Not specified"}
Industry: ${industry || "Not specified"}
Description: ${description || "Not specified"}
Services: ${services || "Not specified"}

Requested rating: ${rating}/5

IMPORTANT:
These are review DRAFTS/SUGGESTIONS for customers.
Do not pretend that you personally visited the business.
Do not invent highly specific facts that were not provided.
Do not mention that you are an AI.
Do not use marketing language.
Do not use hashtags.
Do not use emojis unless they naturally fit the customer's tone.


make review accoding to rating (1-5):${rating}
1. Generate exactly 5 different review options.
2. Each review should be approximately 20-25 words.
3. Make them sound like different real customers.
4. send review like noraml people shear .
`

const prompqt = `
You are an expert at writing realistic customer feedback for local businesses.

IMPORTANT:
These are review DRAFTS/SUGGESTIONS for customers.
Do not pretend that you personally visited the business.
Do not invent highly specific facts that were not provided.
Do not mention that you are an AI.
Do not use marketing language.
Do not use hashtags.
Do not use emojis unless they naturally fit the customer's tone.
language hinglish 

Business: ${businessName.trim()}
Location: ${location || "Not specified"}
Industry: ${industry || "Not specified"}
Description: ${description || "Not specified"}
Services: ${services || "Not specified"}

Requested rating: ${rating}/5




1. Generate exactly 5 different review options.
2. Each review should be approximately 20-25 words.
3. Every review must be relevant to the business.
4. Use the business name naturally where appropriate, but do not repeat it excessively.
5. Avoid making all five reviews sound alike but make sure all reviews must be as per the perspective of a customer giving genuine and honest review in casual tone.
6. Vary sentence structure and vocabulary.
7. Make them sound like different real customers.
8. Do not include quotation marks around the review itself.
9. Do not mention information that is not provided in the business details.
10. Match the selected star rating accurately.
11. Do not create fake specific employee names, prices, dates or transactions.
12. Do not make medical, legal, financial or safety claims unless explicitly supplied.
13. Give final review not any option like he/she. Don't give editable one just give end review to copy and paste
OUTPUT REQUIREMENT:

Return ONLY valid JSON.

The response must be an object in exactly this format:

{
  "reviews": [
    "Review 1",
    "Review 2",
    "Review 3",
    "Review 4",
    "Review 5"
  ]
}
`
 let response;


   try {
      response = await openai.chat.completions.create({
        
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
       

        messages: [
          // {
          //   role: "system",
          //   content:systemPrompt      },
          {
            role: "user",
            content: prompt,
          },
        ],
     
        max_completion_tokens: 1200,
        response_format: {
          type: "json_object",
        },
      });
    } catch (error : any) {
      console.error("[OPENAI API ERROR]", {
        status: error.status,
        code: error.code,
        type: error.type,
        message: error.message,
      });

      const status = getErrorStatus(error);

      const message =
        status === 401
          ? "OpenAI API key is invalid or unauthorized."
          : status === 403
            ? "OpenAI access is forbidden. Check your project permissions."
            : status === 429
              ? "OpenAI rate limit or quota exceeded. Check your API billing and usage limits."
              : status === 504
                ? "OpenAI request timed out. Please try again."
                : "OpenAI could not generate reviews. Please try again.";

      return res.status(300).json(
        {
          success: false,
          source: "openai",
          error: message,
          ...(process.env.NODE_ENV === "development"
            ? { details: error.message }
            : {}),
        },
     
      );
    }


  const rawText = response.choices?.[0]?.message?.content;



if (!rawText) {
      console.error("[OPENAI ERROR] Empty response", {
        finishReason: response.choices?.[0]?.finish_reason,
      });

      return res.status(502).json(
        {
          success: false,
          source: "openai",
          error: "OpenAI returned an empty response. Please try again.",
        },
      );
    }

    let parsed;
       

 try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("[OPENAI ERROR] Invalid JSON response");

      return res.status(502).json(
        {
          success: false,
          source: "openai",
          error: "OpenAI returned an invalid response. Please try again.",
        }
      );
    }

if (
      !Array.isArray(parsed.reviews) ||
      parsed.reviews.length !== 5 ||
      !parsed.reviews.every(
        (review : any) =>
          typeof review === "string" &&
          review.trim().length > 0 &&
          review.trim().length <= 1500
      )
    ) {
      console.error("[OPENAI ERROR] Invalid reviews structure");

      return res.status(502).json(
        {
          success: false,
          source: "openai",
          error: "OpenAI returned invalid review data. Please try again.",
        }
      );
    }

    return res.status(200).json({
      success: true,
      source: "openai",
      reviews: parsed.reviews.map((review: any) => review.trim()),
      business: {
        name: businessName,
        location,
        industry,
        stars: rating,
      },
    });

    } catch (error) {
        next(error)
    }
}






export const addReview = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const clientId = req.params.id;
        const {rating=5,text="",userId} = req.body
         
     
        
            const [client, user] = await Promise.all([
      Client.findById(clientId),
      User.findById(userId),
    ]);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

        const fullReview = {text,rating,client:new mongoose.Types.ObjectId(clientId as string),user:user._id}
    
            const reviewCreat =   await Review.create(fullReview)


         client.reviews.push(reviewCreat._id)
         user.reviews.push(reviewCreat._id)
          await Promise.all([
      client.save(),
      user.save(),
    ]);


   return res.status(200).json({success:true})



         

        



    } catch (error) {
        next(error)
    }
}





export const getMyReviews = async(req:Request,res:Response,next:NextFunction)=>{
  try {
       const user = req.user;


const client = await Client.findById(user?._id).populate({
  path: "reviews",
  populate: {
    path: "user",
    select: "name email phonenumber", // Optional: select only necessary fields
  },
});

       if(!client){return res.status(502).json({success: false,message:"client not found"})}
    
       return res.status(200).json({success:true,reviews:client.reviews})

  } catch (error) {
    next(error)
  }
}

