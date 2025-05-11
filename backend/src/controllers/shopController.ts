import { Request, Response, NextFunction } from 'express';
import Shop, { IShop } from '../model/Shop';
import Product from '../model/Product'; // For populating products

// Create a new shop
export const createShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, type, tokenName, tokenSymbol, ownerWalletAddress } = req.body;

    if (!name || !description || !type || !tokenName || !tokenSymbol || !ownerWalletAddress) {
      return res.status(400).json({ message: 'All fields are required (name, description, type, tokenName, tokenSymbol, ownerWalletAddress)' });
    }

    const existingShop = await Shop.findOne({ ownerWalletAddress });
    if (existingShop) {
      return res.status(400).json({ message: 'A shop already exists for this wallet address.' });
    }
    
    let logoPath;
    if (req.file) { // 'logo' is the field name for multer
      logoPath = `/uploads/${req.file.filename}`;
    }

    const shop = new Shop({
      name,
      description,
      type,
      tokenName,
      tokenSymbol,
      ownerWalletAddress,
      logo: logoPath, // Save the path
    });

    const savedShop = await shop.save();
    res.status(201).json(savedShop);
  } catch (error) {
    next(error);
  }
};

// Get all shops
export const getAllShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shops = await Shop.find().select('-products'); // Exclude full product details for listing
    res.status(200).json(shops);
  } catch (error) {
    next(error);
  }
};

// Get a single shop by ID with its products
export const getShopById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Shop ID is required' });
    }
    
    const shop = await Shop.findById(id).populate('products');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.status(200).json(shop);
  } catch (error) {
    next(error);
  }
};