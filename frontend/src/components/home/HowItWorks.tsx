
import React from 'react';

interface StepProps {
  number: number;
  title: string;
  description: string;
  isLast?: boolean;
}

const Step: React.FC<StepProps> = ({ number, title, description, isLast = false }) => {
  return (
    <div className="relative flex flex-col items-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-foreground font-bold text-glow">
        {number}
      </div>
      
      {!isLast && (
        <div className="absolute top-12 h-full w-0.5 bg-gradient-to-b from-accent to-transparent"></div>
      )}
      
      <h3 className="mt-6 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-center text-muted-foreground">{description}</p>
    </div>
  );
};

const HowItWorks = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Earning and using loyalty tokens has never been easier. Just shop as usual and watch your rewards grow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <Step 
            number={1}
            title="Shop and Purchase"
            description="Simply make purchases at any participating marketplace store like you normally would."
          />
          
          <Step 
            number={2}
            title="Earn Tokens"
            description="Automatically earn loyalty tokens with every purchase based on the store's reward policy."
          />
          
          <Step 
            number={3}
            title="Redeem Rewards"
            description="Use your earned tokens for discounts, exclusive items, or convert them to other cryptocurrencies."
            isLast
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
