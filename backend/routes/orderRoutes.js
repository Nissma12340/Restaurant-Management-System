import express from 'express';
import {
  getAllOrders,
  createOrder,
  updateOrderStatus
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getAllOrders);
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus);

export default router;
