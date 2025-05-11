
import React from 'react';
import { Link } from 'react-router-dom';
import ShopCard from './ShopCard';
import { mockShops } from '@/data/mockData';
import { Button } from '@/components/ui/button';

const FeaturedShops = () => {
  // Display only 3 featured shops
  const featuredShops = mockShops.slice(0, 3);
  
  return (
    <section className="py-16 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Featured Shops</h2>
          <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Discover unique stores and earn exclusive tokens with every purchase.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link to="/shops">
            <Button className="bg-accent hover:bg-accent/80 text-foreground">
              View All Shops
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedShops;
