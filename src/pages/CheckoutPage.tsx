
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    walletAddress: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate payment processing
    setIsProcessing(true);
    
    setTimeout(() => {
      toast({
        title: "Payment successful!",
        description: `Your order has been placed and you've earned ${cart.tokenRewards} tokens.`,
      });
      
      clearCart();
      navigate('/');
      setIsProcessing(false);
    }, 2000);
  };
  
  if (cart.items.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">No Items to Checkout</h1>
          <p className="text-muted-foreground mb-8">
            Your cart is empty. Add some items before proceeding to checkout.
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
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-medium mb-6">Billing Information</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="walletAddress" className="block text-sm font-medium mb-1">
                      Wallet Address (for token rewards)
                    </label>
                    <input
                      type="text"
                      id="walletAddress"
                      name="walletAddress"
                      value={formData.walletAddress}
                      onChange={handleInputChange}
                      placeholder="Solana wallet address"
                      required
                      className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-base font-medium mb-4">Payment Method</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-border rounded-md p-4 flex items-center">
                      <input
                        type="radio"
                        id="creditCard"
                        name="paymentMethod"
                        defaultChecked
                        className="mr-3"
                      />
                      <label htmlFor="creditCard" className="flex-1">
                        Credit / Debit Card
                      </label>
                      <div className="flex gap-1">
                        <div className="w-8 h-6 bg-gray-500 rounded"></div>
                        <div className="w-8 h-6 bg-blue-500 rounded"></div>
                        <div className="w-8 h-6 bg-red-500 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="border border-border rounded-md p-4 flex items-center opacity-50">
                      <input
                        type="radio"
                        id="crypto"
                        name="paymentMethod"
                        disabled
                        className="mr-3"
                      />
                      <label htmlFor="crypto" className="flex-1">
                        Pay with Crypto (Coming Soon)
                      </label>
                      <div className="flex gap-1">
                        <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                        <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>
              
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                </div>
                
                <ul className="space-y-3 max-h-60 overflow-auto">
                  {cart.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
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
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </Button>
              
              <div className="mt-4">
                <Link to="/cart" className="text-sm text-accent hover:text-accent-teal">
                  ← Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
