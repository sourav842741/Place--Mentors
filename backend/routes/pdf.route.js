import express from "express"
import isAuth from "../middlewares/isAuth.js"

import { pdfDownload } from "../controllers/pdf.controller.js"



const pdfRouter = express.Router()


pdfRouter.post("/generate-pdf",isAuth,pdfDownload)

export default pdfRouter