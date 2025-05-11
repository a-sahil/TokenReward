
import React from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { toast } = useToast();
  
  const handleAddToCart = () => {
    onAddToCart();
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
  };
  
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <span key={i} className="text-yellow-400">
                ★
              </span>
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <span key={i} className="text-yellow-400">
                ★
              </span>
            );
          } else {
            return (
              <span key={i} className="text-gray-400">
                ★
              </span>
            );
          }
        })}
        <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
      </div>
    );
  };
  
  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border hover:border-accent transition-all duration-300 group">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-800">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover transition-transform group-hover:scale-105"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-foreground group-hover:text-accent-teal transition-colors truncate">
          {product.name}
        </h3>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
          {renderStarRating(product.rating)}
        </div>
        
        <div className="mt-3 bg-accent/10 rounded px-2 py-1 inline-flex items-center">
          <span className="text-xs font-medium text-accent">
            Earn {product.tokenReward} tokens
          </span>
        </div>
        
        <Button 
          onClick={handleAddToCart}
          className="w-full mt-4 bg-accent hover:bg-accent/80 text-foreground"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
