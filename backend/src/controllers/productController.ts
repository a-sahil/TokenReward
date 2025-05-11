import { Request, Response, NextFunction } from 'express';
import Product from '../model/Product';
import Shop from '../model/Shop';
import mongoose from 'mongoose'; // Import mongoose for ObjectId check

export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.params;
    console.log('[addProduct] Received shopId param:', shopId);

    if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) { // Validate shopId
        console.error('[addProduct] Invalid Shop ID format:', shopId);
        return res.status(400).json({ message: 'Valid Shop ID is required.' });
    }

    const { name, price, rating, tokenReward } = req.body;

    if (name === undefined || price === undefined || tokenReward === undefined) {
        return res.status(400).json({ message: 'Name, price, and tokenReward are required' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      console.log(`[addProduct] Shop not found for ID: ${shopId}`);
      return res.status(404).json({ message: 'Shop not found to add product to.' });
    }
    console.log(`[addProduct] Found shop: ${shop.name}`);

    let imagePath;
    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
    }

    const newProduct = new Product({ // Renamed to newProduct for clarity
      name,
      price: parseFloat(price),
      rating: rating !== undefined ? parseFloat(rating) : 0,
      tokenReward: parseInt(tokenReward, 10),
      shopId: shop._id, // Explicitly use shop._id which is an ObjectId
      image: imagePath,
    });

    const savedProduct = await newProduct.save();
    console.log(`[addProduct] Product saved with ID: ${savedProduct._id}`);

    if (!shop.products) {
        shop.products = [];
    }
    shop.products.push(savedProduct._id); // savedProduct._id is an ObjectId
    
    console.log(`[addProduct] Shop products before final save:`, shop.products.map(p => p.toString()));
    await shop.save(); // Save the shop with the new product reference
    console.log(`[addProduct] Shop ${shop.name} saved successfully with new product ${savedProduct.name}.`);

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('[addProduct] Error in addProduct:', error);
    next(error);
  }
};

// Get all products for a specific shop (can also be done via shopController.getShopById with populate)
export const getProductsByShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.params;
    if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
        return res.status(400).json({ message: 'Valid Shop ID is required.' });
    }
    const products = await Product.find({ shopId });
    // No need to check if !products, find returns [] if none found
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};