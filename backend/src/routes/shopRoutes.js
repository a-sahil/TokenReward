"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shopController_1 = require("../controllers/shopController");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware")); // For logo upload
const router = express_1.default.Router();
// POST /api/shops - Create a new shop (logo is optional file upload)
router.post('/', uploadMiddleware_1.default.single('logo'), shopController_1.createShop);
// GET /api/shops - Get all shops
router.get('/', shopController_1.getAllShops);
// GET /api/shops/:id - Get a single shop by ID
router.get('/:id', shopController_1.getShopById);
exports.default = router;
