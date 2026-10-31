import express from "express";
import { addReview, generateReview, getMyReviews } from "../controller/reviewsController";
import { VerifyClient } from "../middleware/verifyClient";

const routes = express.Router()

routes.post("/generate",generateReview)
routes.post("/add/:id",addReview)
routes.get("/getreviews",VerifyClient,getMyReviews)





export default  routes
