import express from "express";
import { verifyAdmin } from "../middleware/VerifyAgencyAdmin";
import { deleteClient, deleteReview, getAllClient, getAllUser, getReviews, toggleClient } from "../controller/crmController";

const routes = express.Router()


routes.get("/getall",verifyAdmin,getAllClient)
routes.get("/get/:id",verifyAdmin,getReviews)
routes.delete("/delete/:id",verifyAdmin,deleteClient)
routes.delete("/single/delete/:id",verifyAdmin,deleteReview)
routes.patch("/client/status/:id",verifyAdmin,toggleClient)


//  

routes.get("/user/get",verifyAdmin,getAllUser)



export default routes