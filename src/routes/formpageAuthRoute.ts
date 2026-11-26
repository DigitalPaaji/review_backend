import express from "express";
import { createForm, deleteForm, getAllData, getAllForm, GetDashboardData, getFormLeads, getMyForm, loginFormAdmin, logout, SendOtpFormAdmin, updateForm, verifyForm_Admin, verifyOtpFormAdmin } from "../controller/formAdminController";
import { VerifyFormAdmin } from "../middleware/verifyFormAdmin";
import { upload } from "../helper/UploadMulterImages";
import { getbyToken } from "../controller/crmController";
const routes = express.Router()

routes.post("/account-requests",SendOtpFormAdmin)
routes.post("/verify-otp",verifyOtpFormAdmin)
routes.post("/login",loginFormAdmin)
routes.get("/logout",VerifyFormAdmin,logout)
routes.get("/verify",VerifyFormAdmin,verifyForm_Admin)
routes.post("/create",VerifyFormAdmin,upload.fields([{name:"logo",maxCount:1},{name:"banner",maxCount:1}]),createForm)
routes.get("/getallform",VerifyFormAdmin,getAllForm)
routes.get("/get/:id",VerifyFormAdmin,getMyForm)
routes.put("/updated/:id",VerifyFormAdmin,upload.fields([{name:"logo",maxCount:1},{name:"banner",maxCount:1}]),updateForm)
routes.delete("/delete/:id",VerifyFormAdmin,deleteForm)
routes.get("/leads/:id",VerifyFormAdmin,getFormLeads)

routes.get("/dashboard",VerifyFormAdmin,GetDashboardData)
routes.get("/getfull-data",VerifyFormAdmin,getAllData)
routes.put("/getbytoken",getbyToken)



export default routes 