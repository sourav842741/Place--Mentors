import { Router } from "express";
import { 
  fetchNews,
  getAllNews, 
  getNewsByTag, 
  getNewsByCompany, 
  getNewsDashboardStats 
} from "../controllers/news.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

// ============== PUBLIC ROUTES ==============
router.get('/', getAllNews);
router.get('/stats', getNewsDashboardStats);
router.get('/tag/:tag', getNewsByTag);
router.get('/company/:company', getNewsByCompany);

// ============== ADMIN ROUTES ==============
router.post('/fetch', isAuth, fetchNews); // Manual trigger

export default router;

