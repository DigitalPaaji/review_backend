import "dotenv/config";
import express from "express";
import type { Request, Response }  from "express";
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"

import { connectDatabases } from "./helper/database";
import { connectRedis } from "./helper/redisServer";
import errorHandler from "./helper/errorHandler";

import ClinetAuth from "./routes/authRoutes"
import reviewAuth from "./routes/reviewAuth"


import userRoutes from "./routes/userRoutes"



import crmRoutes from "./routes/crmRoutes"




const app = express()
const allowedOrigins = [
  ...(process.env.FRONTEND_URL?.split(",") || []),
  "app://-",
].map((origin) => origin.trim());


app.use(cors({
  origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (Electron / server-side requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,               
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],

  })) 
    app.use(cookieParser())


    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.get("/ping",async(req:Request,res:Response)=>{return res.status(200).send("Pong")})






    app.use("/api/v1/client/auth",ClinetAuth)
    
    
    app.use("/api/v1/review",reviewAuth)
    
    
    ///crm
    app.use("/api/v1/crm/review",crmRoutes)
    
    
    //userr
    app.use("/api/v1/user",userRoutes)






    app.use(errorHandler) 


    const PORT: number = Number(process.env.PORT) || 8000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabases();
 await connectRedis()
     app.listen(PORT,()=>{
        console.log(`http://localhost:${PORT}`)
    });

   
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();