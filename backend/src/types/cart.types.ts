// backend/src/types/shared.types.ts

// This represents the structure of product data as it's relevant for orders/cart logic,
// distinct from the Mongoose model which includes DB-specific fields.
export interface ProductDTO {
  id: string; // Product's unique identifier (could be MongoDB _id as string)
  name: string;
  image: string; // URL or path to the image
  price: number;
  rating: number;
  tokenReward: number;
  shopId: string; // The MongoDB ObjectId of the shop this product belongs to, as a string
}

export interface CartItemDTO extends ProductDTO {
  quantity: number;
}

// Interface for the request body of the finalizeOrder endpoint
export interface FinalizeOrderRequestBodyDTO {
  paymentTransactionSignature: string;
  cartItems: CartItemDTO[]; // Array of cart items
  payerWalletAddress: string; // User's wallet that made the payment
}