import express from "express";
import { verifyAdmin } from "../middleware/VerifyAgencyAdmin";
import { getAllClient, getReviews } from "../controller/crmController";

const routes = express.Router()


routes.get("/getall",verifyAdmin,getAllClient)
routes.get("/get/:id",verifyAdmin,getReviews)


export default routes