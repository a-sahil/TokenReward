
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Cart } from '@/data/mockData';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    tokenRewards: 0,
  });
  
  useEffect(() => {
    // Calculate subtotal and token rewards whenever cart items change
    const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const tokenRewards = cart.items.reduce((total, item) => total + item.tokenReward * item.quantity, 0);
    
    setCart(prev => ({
      ...prev,
      subtotal,
      tokenRewards
    }));
  }, [cart.items]);
  
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      // Check if the product is already in the cart
      const existingItem = prevCart.items.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if already in cart
        return {
          ...prevCart,
          items: prevCart.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        // Add new item to cart
        return {
          ...prevCart,
          items: [...prevCart.items, { ...product, quantity: 1 }],
        };
      }
    });
  };
  
  const removeFromCart = (productId: string) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter(item => item.id !== productId),
    }));
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      ),
    }));
  };
  
  const clearCart = () => {
    setCart({
      items: [],
      subtotal: 0,
      tokenRewards: 0,
    });
  };
  
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};
