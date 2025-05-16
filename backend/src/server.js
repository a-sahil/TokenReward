"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./config/db"));
const shopRoutes_1 = __importDefault(require("./routes/shopRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const rewardRoutes_1 = __importDefault(require("./routes/rewardRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Connect to Database
(0, db_1.default)();
// Middlewares
app.use((0, cors_1.default)()); // Enable CORS for all routes
app.use(body_parser_1.default.json()); // For parsing application/json
app.use(body_parser_1.default.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// Serve static files from the 'uploads' directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
// API Routes
app.get('/api', (req, res) => {
    res.send('TokenMarket API Running');
});
app.use('/api/shops', shopRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/rewards', rewardRoutes_1.default); // Add this
app.use('/api/orders', orderRoutes_1.default); // Add this
// Error Handler Middleware (should be last)
app.use(errorHandler_1.default);
app.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
    console.log(`Uploaded files will be served from: http://localhost:${port}/uploads`);
});
