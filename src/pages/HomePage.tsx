
import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/hero/HeroSection';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedShops from '@/components/marketplace/FeaturedShops';
import WalletPreview from '@/components/marketplace/WalletPreview';

const HomePage = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorks />
      <FeaturedShops />
      <WalletPreview />
    </Layout>
  );
};

export default HomePage;
