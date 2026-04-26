import express from "express";
import validate from "../middlewares/validate.js";
import { submitContactForm as submitContactFormSchema } from "../validators/contact.validator.js";
import { submitContactForm } from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/", validate(submitContactFormSchema), submitContactForm);

export default router;
