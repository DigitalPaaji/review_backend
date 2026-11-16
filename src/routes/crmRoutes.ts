import express from "express";
import { verifyAdmin } from "../middleware/VerifyAgencyAdmin";
import { deleteClient, deleteReview, getAllClient, getAllFormUser, getAllUser, getReviews, loginAdminUser, toggleClient } from "../controller/crmController";

const routes = express.Router()


routes.get("/getall",verifyAdmin,getAllClient)
routes.get("/get/:id",verifyAdmin,getReviews)
routes.delete("/delete/:id",verifyAdmin,deleteClient)
routes.delete("/single/delete/:id",verifyAdmin,deleteReview)
routes.patch("/client/status/:id",verifyAdmin,toggleClient)


routes.get("/user/get",verifyAdmin,getAllUser)
routes.get("/form-user/get",verifyAdmin,getAllFormUser)
routes.get("/form-user/get/:id",verifyAdmin,loginAdminUser)



export default routes