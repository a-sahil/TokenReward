"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const shopRoutes_1 = __importDefault(require("./routes/shopRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.get('/', (req, res) => res.send('TokenMarket API Running'));
app.use('/api/shops', shopRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use(errorHandler_1.default);
exports.default = app;
