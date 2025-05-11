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