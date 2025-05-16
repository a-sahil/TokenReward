"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware")); // For product image upload
const productController_1 = require("../controllers/productController");
const router = express_1.default.Router();
router.post('/shop/:shopId', uploadMiddleware_1.default.single('image'), productController_1.addProduct);
// GET /api/products/shop/:shopId - Get all products for a shop
router.get('/shop/:shopId', productController_1.getProductsByShop);
exports.default = router;
