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
const allowedOrigins = [
  'http://localhost:8080',
   'http://localhost:8080/shops', // Vite default dev port, adjust if different
  'http://localhost:5173', // Common alternative Vite dev port
  'https://token-reward.vercel.app/', // REPLACE THIS with your actual deployed frontend URL
  // Add any other origins you need to support (e.g., staging)
];

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // or if the origin is in the allowedOrigins list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // OPTIONS is important for preflight requests
  allowedHeaders: "Content-Type,Authorization,X-Requested-With", // Add any custom headers your frontend sends
  credentials: true, // If you send cookies or use sessions (might not be needed for token auth)
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions)); // ← Add this line here
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