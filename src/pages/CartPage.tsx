
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  
  const handleQuantityChange = (productId: string, change: number, currentQuantity: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };
  
  if (cart.items.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Start shopping to add items to your cart.
          </p>
          <Link to="/shops">
            <Button className="bg-accent hover:bg-accent/80 text-foreground">
              Browse Shops
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <ul className="divide-y divide-border">
                {cart.items.map((item) => (
                  <li key={item.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-24 h-24 mb-4 sm:mb-0 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      
                      <div className="sm:ml-6 flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        
                        <div className="mt-1 flex items-center text-sm text-muted-foreground">
                          <p>${item.price.toFixed(2)} each</p>
                          <span className="ml-4 text-accent text-xs font-medium">
                            Earn {item.tokenReward * item.quantity} tokens
                          </span>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center border border-border rounded-md">
                            <button
                              className="px-3 py-1 text-muted-foreground hover:text-foreground"
                              onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                            >
                              -
                            </button>
                            <span className="px-3 py-1">{item.quantity}</span>
                            <button
                              className="px-3 py-1 text-muted-foreground hover:text-foreground"
                              onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            className="text-red-500 text-sm hover:text-red-400"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Token rewards</span>
                  <span className="text-accent">{cart.tokenRewards} tokens</span>
                </div>
              </div>
              
              <Button
                className="w-full bg-accent hover:bg-accent/80 text-foreground"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>
              
              <div className="mt-4">
                <Link to="/shops" className="text-sm text-accent hover:text-accent-teal">
                  ← Continue shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
