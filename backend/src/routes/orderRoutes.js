"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/orderRoutes.ts
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const router = express_1.default.Router();
// POST /api/orders/finalize - Finalize an order after payment
router.post('/finalize', orderController_1.finalizeOrder);
exports.default = router;
