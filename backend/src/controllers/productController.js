"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByShop = exports.addProduct = void 0;
const Product_1 = __importDefault(require("../model/Product"));
const Shop_1 = __importDefault(require("../model/Shop"));
const mongoose_1 = __importDefault(require("mongoose"));
// This must be exported
const addProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId } = req.params;
        console.log('[addProduct] Received shopId param:', shopId);
        if (!shopId || !mongoose_1.default.Types.ObjectId.isValid(shopId)) {
            console.error('[addProduct] Invalid Shop ID format:', shopId);
            return res.status(400).json({ message: 'Valid Shop ID is required.' });
        }
        const shop = yield Shop_1.default.findById(shopId);
        if (!shop || !shop.mintAddress) {
            return res.status(404).json({ message: 'Shop or shop token mint not found.' });
        }
        const { name, price, rating, tokenReward } = req.body;
        if (name === undefined || price === undefined || tokenReward === undefined) {
            return res.status(400).json({ message: 'Name, price, and tokenReward are required' });
        }
        if (!shop) {
            console.log(`[addProduct] Shop not found for ID: ${shopId}`);
            return res.status(404).json({ message: 'Shop not found to add product to.' });
        }
        console.log(`[addProduct] Found shop: ${shop.name}`);
        let imagePath;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }
        const newProduct = new Product_1.default({
            name,
            price: parseFloat(price),
            rating: rating !== undefined ? parseFloat(rating) : 0,
            tokenReward: parseInt(tokenReward, 10),
            shopId: shop._id,
            image: imagePath,
        });
        const savedProduct = yield newProduct.save();
        console.log(`[addProduct] Product saved with ID: ${savedProduct._id}`);
        if (!shop.products) {
            shop.products = [];
        }
        shop.products.push(savedProduct._id);
        console.log(`[addProduct] Shop products before final save:`, shop.products.map(p => p.toString()));
        yield shop.save();
        console.log(`[addProduct] Shop ${shop.name} saved successfully with new product ${savedProduct.name}.`);
        res.status(201).json(savedProduct);
    }
    catch (error) {
        console.error('[addProduct] Error in addProduct:', error);
        next(error);
    }
});
exports.addProduct = addProduct;
// This must also be exported if used
const getProductsByShop = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId } = req.params;
        if (!shopId || !mongoose_1.default.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ message: 'Valid Shop ID is required.' });
        }
        const products = yield Product_1.default.find({ shopId });
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
});
exports.getProductsByShop = getProductsByShop;
