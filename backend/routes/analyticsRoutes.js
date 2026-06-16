import express from 'express';
import {
  getDashboardStats,
  getChartData,
  getAIInsights,
  getSalesReports,
} from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/charts', protect, admin, getChartData);
router.get('/insights', protect, admin, getAIInsights);
router.get('/report', protect, admin, getSalesReports);

export default router;
