import { Router } from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import isAuth from "../middlewares/isAuth.js";
import {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTask,
  shareTask,
  getPublicTask,
} from "../controllers/task.controller.js";

const router = Router();

router.use(isAuth);

// Private routes - only for task owner
router.post("/create", asyncHandler(createTask));
router.get("/my", asyncHandler(getMyTasks));
router.put("/:id", asyncHandler(updateTask));
router.delete("/:id", asyncHandler(deleteTask));
router.patch("/:id/toggle", asyncHandler(toggleTask));
router.post("/:id/share", asyncHandler(shareTask));

// Public route - anyone can view
router.get("/public/:shareId", asyncHandler(getPublicTask));

export default router;

