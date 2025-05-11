// frontend/src/components/marketplace/FeaturedShops.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ShopCard from './ShopCard';
import { mockShops as initialMockShops } from '@/data/mockData';
import { getAllShops } from '@/services/api';
import { Shop } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedShops = () => {
  const [combinedFeaturedShops, setCombinedFeaturedShops] = useState<Shop[]>(initialMockShops.slice(0,3));
  const [loadingApi, setLoadingApi] = useState(true);

  useEffect(() => {
    const fetchApiShopsAndCombine = async () => {
      try {
        setLoadingApi(true);
        const apiShops = await getAllShops();
        const allShops = [...initialMockShops, ...(apiShops || [])];
        const uniqueShopsMap = new Map<string, Shop>();
        allShops.forEach(shop => uniqueShopsMap.set(shop.id, shop));
        
        // For featured, you might want a specific strategy, e.g., newest API shops + some mocks
        // For simplicity here, just take the first 3 unique ones.
        setCombinedFeaturedShops(Array.from(uniqueShopsMap.values()).slice(0, 3));

      } catch (error) {
        console.error("Failed to fetch API shops for featured section, using mocks:", error);
        setCombinedFeaturedShops(initialMockShops.slice(0, 3)); // Fallback to only mocks
      } finally {
        setLoadingApi(false);
      }
    };
    fetchApiShopsAndCombine();
  }, []);

  const displayShops = loadingApi ? initialMockShops.slice(0,3) : combinedFeaturedShops;

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
        
        {loadingApi && displayShops.length === 0 && ( // Show skeletons only if no initial mocks and API is loading
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-md p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
                 <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-[80px]" />
                    <Skeleton className="h-8 w-[120px]" />
                  </div>
              </div>
            ))}
          </div>
        )}

        {displayShops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayShops.map((shop) => (
              <ShopCard key={shop.id || shop.name} shop={shop} />
            ))}
          </div>
        )}
        
        {!loadingApi && displayShops.length === 0 && (
            <p className="text-center text-muted-foreground">No featured shops available right now.</p>
        )}

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