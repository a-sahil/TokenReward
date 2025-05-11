
import React from 'react';
import Layout from '@/components/layout/Layout';
import ShopCard from '@/components/marketplace/ShopCard';
import { mockShops } from '@/data/mockData';

const ShopsPage = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Explore Shops</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Discover unique stores and earn exclusive tokens with every purchase
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ShopsPage;
