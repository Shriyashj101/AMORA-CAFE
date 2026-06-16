import express from 'express';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getInventory)
  .post(protect, admin, createInventoryItem);

router.route('/:id')
  .put(protect, admin, updateInventoryItem)
  .delete(protect, admin, deleteInventoryItem);

export default router;
