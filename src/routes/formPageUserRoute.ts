import express from "express";
import { SubmitedForm, getForm } from "../controller/formAdminController";
const routes = express.Router()


routes.get("/get/:slug",getForm)
routes.post("/submit",SubmitedForm)

export default routes 