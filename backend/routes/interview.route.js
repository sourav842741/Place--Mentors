import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import maintenanceCheck from "../middlewares/maintenanceCheck.js"
import { analyzeResume, finishInterview, generateQuestion, getInterviewReport, getMyInterviews, submitAnswer } from "../controllers/interview.controller.js"




const interviewRouter = express.Router()

interviewRouter.post("/resume", maintenanceCheck, isAuth, upload.single("resume"), analyzeResume)
interviewRouter.post("/generate-questions", maintenanceCheck, isAuth, generateQuestion)
interviewRouter.post("/submit-answer", maintenanceCheck, isAuth, submitAnswer)
interviewRouter.post("/finish", maintenanceCheck, isAuth, finishInterview)

interviewRouter.get("/get-interview", maintenanceCheck, isAuth, getMyInterviews)
interviewRouter.get("/report/:id", maintenanceCheck, isAuth, getInterviewReport)



export default interviewRouter
