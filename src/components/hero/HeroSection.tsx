
import React from 'react';
import { Link } from 'react-router-dom';
import Globe3D from './Globe3D';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background to-primary/30 pt-16 pb-20 sm:pt-24 sm:pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(143,0,255,0.15),transparent_50%)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
        {/* Content */}
        <div className="text-center lg:text-left lg:w-1/2 z-10 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="block text-foreground">Rewarding Every</span>
            <span className="block mt-2 text-accent-teal text-glow-teal">Purchase – Seamlessly</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto lg:mx-0">
            Shop at your favorite stores and earn crypto rewards automatically. A blockchain-powered 
            marketplace where every transaction builds your loyalty tokens.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link to="/shops">
              <Button size="lg" className="bg-accent hover:bg-accent/80 text-foreground neon-border">
                Explore Shops
              </Button>
            </Link>
            <Link to="/join">
              <Button size="lg" variant="outline" className="border-accent-teal text-accent-teal hover:bg-accent-teal/10">
                Join as Seller
              </Button>
            </Link>
          </div>
        </div>
        
        {/* 3D Globe */}
        <div className="lg:w-1/2 h-[300px] sm:h-[400px] lg:h-[500px] mt-10 lg:mt-0 animate-float">
          <Globe3D />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
