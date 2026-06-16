import express from 'express';
import { getCustomerByMobile } from '../controllers/customerController.js';

const router = express.Router();

router.route('/:mobile')
  .get(getCustomerByMobile);

export default router;
