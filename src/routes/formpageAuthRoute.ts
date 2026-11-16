import express from "express";
import { createForm, deleteForm, GetDashboardData, getFormLeads, getMyForm, loginFormAdmin, logout, SendOtpFormAdmin, updateForm, verifyForm_Admin, verifyOtpFormAdmin } from "../controller/formAdminController";
import { VerifyFormAdmin } from "../middleware/verifyFormAdmin";
import { upload } from "../helper/UploadMulterImages";
const routes = express.Router()

routes.post("/account-requests",SendOtpFormAdmin)
routes.post("/verify-otp",verifyOtpFormAdmin)
routes.post("/login",loginFormAdmin)
routes.get("/logout",VerifyFormAdmin,logout)
routes.get("/verify",VerifyFormAdmin,verifyForm_Admin)
routes.post("/create",VerifyFormAdmin,upload.single("banner"),createForm)
routes.get("/get/:id",VerifyFormAdmin,getMyForm)
routes.put("/updated/:id",VerifyFormAdmin,upload.single("banner"),updateForm)
routes.delete("/delete/:id",VerifyFormAdmin,deleteForm)
routes.get("/leads/:id",VerifyFormAdmin,getFormLeads)

routes.get("/dashboard",VerifyFormAdmin,GetDashboardData)




export default routes 