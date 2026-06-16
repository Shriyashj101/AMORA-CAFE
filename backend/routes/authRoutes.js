import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  getEmployees,
  deleteEmployee,
  resetEmployeePassword,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', protect, admin, registerUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/employees').get(protect, admin, getEmployees);
router.route('/employees/:id').delete(protect, admin, deleteEmployee);
router.route('/employees/:id/password').put(protect, admin, resetEmployeePassword);

export default router;
