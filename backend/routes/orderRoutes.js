import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  getOrders,
} from '../controllers/orderController.js';
import { protect, staff } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(addOrderItems)
  .get(protect, staff, getOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(protect, staff, updateOrderStatus);

export default router;
