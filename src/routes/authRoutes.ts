import express from "express";
import { fullsetup, getDashboadData, loginClient, logout, SendOtp, UpdateProfile, verifyClient, verifyOtp } from "../controller/createClients";
import { VerifyClient } from "../middleware/verifyClient";

const routes = express.Router()


routes.post("/account-requests",SendOtp)
routes.post("/verify-otp",verifyOtp)
routes.post("/login",loginClient)
routes.get("/logout",VerifyClient,logout)
routes.get("/verify",VerifyClient,verifyClient)
routes.get("/dashboard",VerifyClient,getDashboadData)
routes.put("/fullsetup",VerifyClient,fullsetup)
routes.put("/update-profile",VerifyClient,UpdateProfile)

     


export default routes      


