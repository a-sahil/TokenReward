
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shop } from '@/data/mockData';

interface ShopCardProps {
  shop: Shop;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border hover:border-accent transition-all duration-300 group">
      <div className="p-4 flex items-center">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={shop.logo} 
            alt={shop.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-3">
          <h3 className="font-medium text-foreground group-hover:text-accent-teal transition-colors">
            {shop.name}
          </h3>
          <span className="text-xs text-muted-foreground">{shop.type}</span>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <p className="text-sm text-muted-foreground mb-4 h-12 overflow-hidden">
          {shop.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Rewards</span>
            <span className="text-sm text-accent">{shop.tokenSymbol} Token</span>
          </div>
          <Link to={`/shops/${shop.id}`}>
            <Button variant="outline" size="sm" className="border-accent hover:bg-accent/10 hover:text-accent-teal">
              View Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
