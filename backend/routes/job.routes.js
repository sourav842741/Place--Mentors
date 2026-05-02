import express from "express";
import {
  getJobs,
  getJobById,
  getLatestJobs,
  getRemoteJobs,
  syncJobsManually,
} from "../controllers/job.controller.js";

const router = express.Router();

router.get("/", getJobs);
router.get("/latest", getLatestJobs);
router.get("/remote", getRemoteJobs);
router.get("/:id", getJobById);
router.get("/sync", syncJobsManually); // manual trigger

export default router;
