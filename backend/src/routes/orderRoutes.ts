// backend/src/routes/orderRoutes.ts
import express from 'express';
import { finalizeOrder } from '../controllers/orderController';

const router = express.Router();

// POST /api/orders/finalize - Finalize an order after payment
router.post('/finalize', finalizeOrder);

export default router;