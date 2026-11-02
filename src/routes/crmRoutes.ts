import express from "express";
import { verifyAdmin } from "../middleware/VerifyAgencyAdmin";
import { deleteClient, getAllClient, getReviews } from "../controller/crmController";

const routes = express.Router()


routes.get("/getall",verifyAdmin,getAllClient)
routes.get("/get/:id",verifyAdmin,getReviews)
routes.delete("/delete/:id",verifyAdmin,deleteClient)


export default routes