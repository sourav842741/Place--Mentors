import express from "express";
const router = express.Router();

import { submitContactForm } from "../controllers/contact.controller.js";

router.post("/", submitContactForm);

export default router;

