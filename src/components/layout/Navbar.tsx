
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from 'lucide-react';
import WalletConnectButton from '../wallet/WalletConnectButton';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-foreground mr-1">Token</span>
              <span className="text-xl font-bold text-accent-teal text-glow-teal">Market</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/shops" className="text-foreground/80 hover:text-foreground transition-colors">
                Explore Shops
              </Link>
              <Link to="/join" className="text-foreground/80 hover:text-foreground transition-colors">
                Become a Seller
              </Link>
              <WalletConnectButton />
              <Link to="/cart" className="p-2 rounded-full bg-background border border-border hover:border-accent-teal transition-colors">
                <ShoppingCart size={18} className="text-foreground/80 hover:text-accent-teal" />
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="p-2 rounded-full bg-background border border-border hover:border-accent-teal mr-2">
              <ShoppingCart size={18} className="text-foreground/80 hover:text-accent-teal" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-foreground"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
            <Link
              to="/shops"
              className="block px-3 py-2 rounded-md text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explore Shops
            </Link>
            <Link
              to="/join"
              className="block px-3 py-2 rounded-md text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Become a Seller
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-accent text-accent hover:bg-accent/20"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
