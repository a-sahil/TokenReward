import { CartItem } from "@/data/mockData";

// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getBackendUrl = (path = '') => {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return `${base}${path}`;
}


// --- Shop API ---
export const getAllShops = async () => {
  const response = await fetch(`${API_BASE_URL}/shops`);
  if (!response.ok) {
    throw new Error('Failed to fetch shops');
  }
  return response.json();
};

export const getShopById = async (shopId: string) => {
  const response = await fetch(`${API_BASE_URL}/shops/${shopId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Shop not found or API error' }));
    throw new Error(errorData.message || 'Failed to fetch shop details');
  }
  return response.json();
};

export const createShop = async (shopData: FormData) => { // FormData for file upload
  const response = await fetch(`${API_BASE_URL}/shops`, {
    method: 'POST',
    body: shopData, // Multer handles FormData on the backend
    // Headers are set automatically by fetch for FormData
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create shop' }));
    throw new Error(errorData.message || 'Failed to create shop');
  }
  return response.json();
};


// --- Product API ---
export const addProductToShop = async (shopId: string, productData: FormData) => { // FormData for file upload
  const response = await fetch(`${API_BASE_URL}/products/shop/${shopId}`, {
    method: 'POST',
    body: productData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to add product' }));
    throw new Error(errorData.message || 'Failed to add product');
  }
  return response.json();
};

// frontend/src/services/api.ts
// ... (getAllShops, getShopById, createShop, addProductToShop) ...

// --- Reward API ---
interface ClaimRewardPayload {
  claimId: string; // Now takes claimId
  userWalletAddress: string; // Wallet attempting the claim
}

interface ClaimRewardResponse {
  message: string;
  transactionSignature: string;
  claimId: string;
  recipient: string;
  mint: string;
  amount: string;
}
// (claimReward function stays the same as in the previous backend update for it)
export const claimReward = async (payload: ClaimRewardPayload): Promise<ClaimRewardResponse> => {
  const response = await fetch(`${API_BASE_URL}/rewards/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to claim reward' }));
    throw new Error(errorData.message || 'Failed to claim reward');
  }
  return response.json();
};

// --- Order API ---
interface FinalizeOrderPayload {
    paymentTransactionSignature: string;
    cartItems: Array<CartItem & { shopId: string }>; // Assuming CartItem is defined or imported
    payerWalletAddress: string;
}

interface FinalizeOrderResponseClaimDetail {
    claimId: string;
    shopName: string;
    tokenSymbol?: string;
    amount: number;
}
  
interface FinalizeOrderResponse {
    message: string;
    claims: FinalizeOrderResponseClaimDetail[];
}
  
export const finalizeOrder = async (payload: FinalizeOrderPayload): Promise<FinalizeOrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders/finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to finalize order' }));
      throw new Error(errorData.message || 'Failed to finalize order');
    }
    return response.json();
};