import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import connectDB from './config/db';
import shopRoutes from './routes/shopRoutes';
import productRoutes from './routes/productRoutes';
import errorHandler from './middleware/errorHandler';
import rewardRoutes from './routes/rewardRoutes';
import orderRoutes from './routes/orderRoutes';


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middlewares
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


// API Routes
app.get('/api', (req: Request, res: Response) => {
  res.send('TokenMarket API Running');
});
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rewards', rewardRoutes); // Add this
app.use('/api/orders', orderRoutes); // Add this

// Error Handler Middleware (should be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
  console.log(`Uploaded files will be served from: http://localhost:${port}/uploads`);
});