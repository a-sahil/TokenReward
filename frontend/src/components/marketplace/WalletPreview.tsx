
import React from 'react';
import { Button } from '@/components/ui/button';

const WalletPreview = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-xl overflow-hidden border border-border shadow-lg">
          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Your Crypto Reward Wallet</h2>
                <p className="text-muted-foreground mb-6">
                  Easily manage all your earned shop tokens in one place. Track balances, earn rewards, 
                  and spend tokens across multiple stores. Your loyalty programs, reimagined with blockchain.
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-accent mr-2"></div>
                    <span>Track all your token balances in one place</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-accent-teal mr-2"></div>
                    <span>Redeem rewards across participating stores</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-accent mr-2"></div>
                    <span>Connect any Solana wallet to get started</span>
                  </li>
                </ul>
                
                <Button className="bg-accent hover:bg-accent/80 text-foreground neon-border">
                  Connect Wallet
                </Button>
              </div>
              
              <div className="md:w-1/2">
                <div className="bg-primary rounded-lg overflow-hidden border border-border shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium">Token Balances</h3>
                      <p className="text-sm text-muted-foreground">Your loyalty rewards</p>
                    </div>
                    <div className="bg-accent/20 rounded-full px-3 py-1">
                      <span className="text-sm text-accent">Connected</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-card/40 rounded-lg border border-border flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
                          <span className="text-xs font-medium text-accent">TCH</span>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium">TechToken</h4>
                          <p className="text-xs text-muted-foreground">TechGadgets</p>
                        </div>
                      </div>
                      <span className="text-accent-teal">250 TCH</span>
                    </div>
                    
                    <div className="p-3 bg-card/40 rounded-lg border border-border flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-accent-teal/30 flex items-center justify-center">
                          <span className="text-xs font-medium text-accent-teal">FOOD</span>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium">FoodToken</h4>
                          <p className="text-xs text-muted-foreground">GourmetEats</p>
                        </div>
                      </div>
                      <span className="text-accent-teal">120 FOOD</span>
                    </div>
                    
                    <div className="p-3 bg-card/40 rounded-lg border border-border flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
                          <span className="text-xs font-medium text-accent">STYL</span>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium">StyleCoin</h4>
                          <p className="text-xs text-muted-foreground">Urban Fashion</p>
                        </div>
                      </div>
                      <span className="text-accent-teal">85 STYL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WalletPreview;
