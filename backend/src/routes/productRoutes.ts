import express from 'express';
import upload from '../middleware/uploadMiddleware'; // For product image upload
import { addProduct, getProductsByShop } from '../controllers/productController'; 

const router = express.Router();

router.post('/shop/:shopId', upload.single('image'), addProduct); 

// GET /api/products/shop/:shopId - Get all products for a shop
router.get('/shop/:shopId', getProductsByShop);

export default router;