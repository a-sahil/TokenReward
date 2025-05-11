// backend/src/app.ts
import express, { Express, Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import shopRoutes from './routes/shopRoutes';
import productRoutes from './routes/productRoutes';
import errorHandler from './middleware/errorHandler';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => res.send('TokenMarket API Running'));
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);

app.use(errorHandler);

export default app;