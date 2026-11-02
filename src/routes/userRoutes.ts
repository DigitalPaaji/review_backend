import express from "express";
import { createUser, getUser } from "../controller/createUser";
const routes = express.Router()
 

routes.get("/get",getUser)
routes.post("/create",createUser)



export default routes;

