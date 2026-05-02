import { Router } from "express";
import {
  getCertificates,
  generateCertificate,
  getCertificateById,
  deleteCertificate,
  verifyCertificate,
} from "../controllers/certificate.controller.js";
import isAuth from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = Router();

router.use(maintenanceCheck);

// All require auth
router.use(isAuth);

// GET /api/certificates - list
router.get("/", getCertificates);

// POST /api/certificates/generate
router.post("/generate", generateCertificate);

// GET /api/certificates/:id
router.get("/:id", getCertificateById);

// DELETE /api/certificates/:id (optional)
router.delete("/:id", deleteCertificate);

// GET /api/certificates/verify/:id (public)
router.get("/verify/:id", verifyCertificate);

export default router;
