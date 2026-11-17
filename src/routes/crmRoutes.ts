import express from "express";
import { verifyAdmin } from "../middleware/VerifyAgencyAdmin";
import { createPackage, deleteClient, DeletePackage, deleteReview, getAllClient, getAllFormUser, getAllpackage, getAllUser, getReviews, loginAdminUser, toggleClient, updatePackage, updatePackageStatus } from "../controller/crmController";

const routes = express.Router()


routes.get("/getall",verifyAdmin,getAllClient)
routes.get("/get/:id",verifyAdmin,getReviews)
routes.delete("/delete/:id",verifyAdmin,deleteClient)
routes.delete("/single/delete/:id",verifyAdmin,deleteReview)
routes.patch("/client/status/:id",verifyAdmin,toggleClient)


routes.get("/user/get",verifyAdmin,getAllUser)


/////form   ////


routes.get("/form-user/get",verifyAdmin,getAllFormUser)
routes.get("/form-user/get/:id",verifyAdmin,loginAdminUser)
routes.post("/form-package/create",verifyAdmin,createPackage)
routes.get("/form-package/get",verifyAdmin,getAllpackage)
routes.put("/form-package/status/:id",verifyAdmin,updatePackageStatus)
routes.delete("/form-package/delete/:id",verifyAdmin,DeletePackage)
routes.put("/form-package/update/:id",verifyAdmin,updatePackage)


export default routes