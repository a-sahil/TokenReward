import express from 'express';
import { addProduct, getProductsByShop } from '../controllers/productController';
import upload from '../middleware/uploadMiddleware'; // For product image upload

const router = express.Router();

// POST /api/products/shop/:shopId - Add a new product to a shop (image is optional file upload)
router.post('/shop/:shopId', upload.single('image'), addProduct);

// GET /api/products/shop/:shopId - Get all products for a shop
router.get('/shop/:shopId', getProductsByShop);

export default router;