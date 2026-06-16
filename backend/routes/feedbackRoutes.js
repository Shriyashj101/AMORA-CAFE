import express from 'express';
import {
  submitFeedback,
  getFeedback,
} from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(submitFeedback)
  .get(protect, admin, getFeedback);

export default router;
