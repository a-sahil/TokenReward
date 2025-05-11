// frontend/src/pages/ShopPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/marketplace/ProductCard';
import { mockShops as initialMockShops } from '@/data/mockData';
import { getShopById, getBackendUrl } from '@/services/api';
import { Shop as ShopInterface, Product as ProductInterface } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ShopPage = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const { addToCart } = useCart();
  
  const [shopDetails, setShopDetails] = useState<ShopInterface | null>(null);
  const [products, setProducts] = useState<ProductInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) {
      setError('Shop ID is missing.');
      setLoading(false);
      return;
    }
    // Critical: Prevent API call if shopId is literally "undefined" string
    if (shopId === "undefined") {
        console.error("Shop ID is 'undefined', redirecting to shops list.");
        setError("Invalid shop URL.");
        setLoading(false);
        // Optionally redirect:
        // setTimeout(() => navigate('/shops'), 100); 
        return; 
    }

    const fetchShopData = async () => {
      try {
        setLoading(true);
        // Try fetching from API
        const apiShopData = await getShopById(shopId);
        setShopDetails(apiShopData);
        setProducts(apiShopData.products || []);
        setError(null);
      } catch (apiErr: any) {
        console.warn(`API failed to fetch shop ${shopId}, trying mock data:`, apiErr.message);
        // Fallback to mock data if API fails or shop not found in API
        const mockShop = initialMockShops.find(s => s.id === shopId);
        if (mockShop) {
          setShopDetails(mockShop);
          setProducts(mockShop.products || []);
          setError(null); // Or set a specific "showing mock" message
        } else {
          setError('Shop not found.');
          setShopDetails(null);
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shopId,]);

  const logoUrl = shopDetails?.logo && shopDetails.logo.startsWith('/uploads/')
                  ? getBackendUrl(shopDetails.logo)
                  : shopDetails?.logo || '/placeholder.svg';

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
           <Skeleton className="h-6 w-32 mb-4" />
           <div className="flex items-center mt-4 mb-8">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="ml-4 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-12 w-full max-w-3xl mb-6" />
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg shadow-md p-4 space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-6 w-1/3" />
                    </div>
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
        </div>
      </Layout>
    );
  }
  
  if (error && !shopDetails) { // Only show full error if no shop data at all
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Link to="/shops">
            <Button>Back to Shops</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!shopDetails) { // Should be caught by error state if API and mock fail
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Shop Not Found</h1>
          <Link to="/shops"><Button>Back to Shops</Button></Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/shops" className="text-accent hover:text-accent-teal mb-4 inline-flex items-center">
            ← Back to Shops
          </Link>
          
          <div className="flex items-center mt-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
              <img 
                src={logoUrl} 
                alt={shopDetails.name} 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
              />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold">{shopDetails.name}</h1>
              <div className="flex items-center mt-1">
                <span className="text-muted-foreground">{shopDetails.type}</span>
                <div className="mx-2 w-1 h-1 rounded-full bg-muted-foreground"></div>
                <span className="text-accent">{shopDetails.tokenName} ({shopDetails.tokenSymbol})</span>
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-muted-foreground max-w-3xl">
            {shopDetails.description}
          </p>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Products</h2>
        
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onAddToCart={() => addToCart(product)} 
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">This shop has no products yet.</p>
        )}
      </div>
    </Layout>
  );
};

export default ShopPage;