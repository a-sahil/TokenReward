import express from 'express';
import { createShop, getAllShops, getShopById } from '../controllers/shopController';
import upload from '../middleware/uploadMiddleware'; // For logo upload

const router = express.Router();

// POST /api/shops - Create a new shop (logo is optional file upload)
router.post('/', upload.single('logo'), createShop);

// GET /api/shops - Get all shops
router.get('/', getAllShops);

// GET /api/shops/:id - Get a single shop by ID
router.get('/:id', getShopById);

export default router;