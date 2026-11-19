import express from "express";
import { verifyAdmin } from "../middleware/VerifyAgencyAdmin";
import { CreateLeadRate, createPackage, deleteClient, deleteLeadRate, DeletePackage, deleteReview, getAdminUser, getAllClient, getAllFormUser, getAllLeadRate, getAllpackage, getAllUser, getReviews, loginAdminUser, toggleClient, upDateLeadRate, updatePackage, updatePackageStatus, updatFormUser } from "../controller/crmController";

const routes = express.Router()


routes.get("/getall",verifyAdmin,getAllClient)
routes.get("/get/:id",verifyAdmin,getReviews)
routes.delete("/delete/:id",verifyAdmin,deleteClient)
routes.delete("/single/delete/:id",verifyAdmin,deleteReview)
routes.patch("/client/status/:id",verifyAdmin,toggleClient)


routes.get("/user/get",verifyAdmin,getAllUser)


/////form     ////


routes.get("/form-user/get",verifyAdmin,getAllFormUser)
routes.get("/form-user/get/:id",verifyAdmin,loginAdminUser)
routes.get("/form-user/getsingle/:id",verifyAdmin,getAdminUser)
routes.put("/form-user/update/:id",verifyAdmin,updatFormUser)
routes.post("/form-package/create",verifyAdmin,createPackage)
routes.get("/form-package/get",verifyAdmin,getAllpackage)
routes.put("/form-package/status/:id",verifyAdmin,updatePackageStatus)
routes.delete("/form-package/delete/:id",verifyAdmin,DeletePackage)
routes.put("/form-package/update/:id",verifyAdmin,updatePackage)
routes.post("/form-leadrate/create",verifyAdmin,CreateLeadRate)
routes.get("/form-leadrate/get",verifyAdmin,getAllLeadRate)
routes.put("/form-leadrate/update/:id",verifyAdmin,upDateLeadRate)
routes.delete("/form-leadrate/delete/:id",verifyAdmin,deleteLeadRate)



export default routes