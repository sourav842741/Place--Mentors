import express from "express"
import isAuth from "../middlewares/isAuth.js"
import maintenanceCheck from "../middlewares/maintenanceCheck.js"
import { createOrder, verifyPayment } from "../controllers/payment.controller.js"



const paymentRouter = express.Router()

paymentRouter.post("/order" , maintenanceCheck, isAuth , createOrder )
paymentRouter.post("/verify" , maintenanceCheck, isAuth , verifyPayment )


export default paymentRouter
