
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/marketplace/ProductCard';
import { mockShops } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

const ShopPage = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const { addToCart } = useCart();
  
  const shop = mockShops.find(s => s.id === shopId);
  
  if (!shop) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Shop Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find the shop you're looking for.
          </p>
          <Link to="/shops">
            <Button>Back to Shops</Button>
          </Link>
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
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img 
                src={shop.logo} 
                alt={shop.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold">{shop.name}</h1>
              <div className="flex items-center mt-1">
                <span className="text-muted-foreground">{shop.type}</span>
                <div className="mx-2 w-1 h-1 rounded-full bg-muted-foreground"></div>
                <span className="text-accent">{shop.tokenName} ({shop.tokenSymbol})</span>
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-muted-foreground max-w-3xl">
            {shop.description}
          </p>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Products</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shop.products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={() => addToCart(product)} 
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
