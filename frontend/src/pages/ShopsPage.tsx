// frontend/src/pages/ShopsPage.tsx
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ShopCard from '@/components/marketplace/ShopCard';
import { mockShops as initialMockShops } from '@/data/mockData'; // Original mock data
import { getAllShops } from '@/services/api'; // We will still fetch API shops
import { Shop } from '@/data/mockData';
import { Skeleton } from '@/components/ui/skeleton';

const ShopsPage = () => {
  const [apiShops, setApiShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiShops = async () => {
      try {
        setLoading(true);
        const data = await getAllShops();
        setApiShops(data || []); // Ensure it's an array
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load new shops from server.');
        setApiShops([]); // Clear API shops on error
        console.error("API Error fetching shops:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApiShops();
  }, []);

  // Combine mock shops and API shops.
  // Simple approach: concatenate and remove duplicates by ID.
  // More sophisticated merging might be needed if IDs can overlap meaningfully.
  const combinedShops = React.useMemo(() => {
    const allShops = [...initialMockShops, ...apiShops];
    const uniqueShopsMap = new Map<string, Shop>();
    allShops.forEach(shop => {
      // Prioritize API shops if IDs match, or if mock shops don't have a real backend ID.
      // This assumes backend 'id' is preferred over mock 'id' if they were to clash.
      // Or simply, if API returns a shop, it's the "more real" version.
      // If your mock shops have IDs that might clash with real _id from mongo,
      // you'll need a more robust merging/deduplication strategy.
      // For now, we assume mock IDs are distinct or will be "overwritten" by API data.
      // A simple Set based on 'id' for deduplication:
      uniqueShopsMap.set(shop.id, shop);
    });
    return Array.from(uniqueShopsMap.values());
  }, [apiShops]);


  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Explore Shops</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Discover unique stores and earn exclusive tokens with every purchase
          </p>
        </div>

        {loading && apiShops.length === 0 && ( // Show skeletons only if API shops are still loading AND we don't have them yet
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(initialMockShops.length + 3)].map((_, i) => ( // Skeleton for mocks + potential API
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

        {error && <p className="text-center text-red-500 my-4">Notice: {error} Showing available shops.</p>}

        {(!loading || combinedShops.length > 0) && combinedShops.length === 0 && (
          <p className="text-center text-muted-foreground">No shops available at the moment.</p>
        )}

        {combinedShops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {combinedShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShopsPage;