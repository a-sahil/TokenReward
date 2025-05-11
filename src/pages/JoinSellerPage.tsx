
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const JoinSellerPage = () => {
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [shopData, setShopData] = useState({
    name: '',
    location: '',
    logo: null as File | null,
    businessType: '',
  });
  
  const [productData, setProductData] = useState({
    name: '',
    image: null as File | null,
    price: '',
    rating: 5,
  });
  
  const handleStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!shopData.name || !shopData.businessType) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (Shop Name and Business Type)",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Shop created successfully!",
      description: "Now you can add your first product to your shop.",
      duration: 3000,
    });
    
    setStep(2);
  };
  
  const handleStepTwoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!productData.name || !productData.price) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (Product Name and Price)",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Product added successfully!",
      description: "Your product has been listed in your shop.",
      duration: 3000,
    });
    
    // Reset product form
    setProductData({
      name: '',
      image: null,
      price: '',
      rating: 5,
    });
  };
  
  const handleShopInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShopData({
      ...shopData,
      [name]: value,
    });
  };
  
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files ? fileInput.files[0] : null;
      setProductData({
        ...productData,
        [name]: file,
      });
    } else {
      setProductData({
        ...productData,
        [name]: value,
      });
    }
  };
  
  const handleShopLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setShopData({
      ...shopData,
      logo: file,
    });
  };
  
  const renderStarRating = () => {
    const rating = parseInt(productData.rating.toString(), 10) || 5;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={star}
              checked={rating === star}
              onChange={handleProductInputChange}
              className="hidden"
            />
            <span className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-400'}`}>
              ★
            </span>
          </label>
        ))}
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Join as a Seller</h1>
          <p className="text-center text-muted-foreground mb-8">
            Create your shop and start selling products on our marketplace.
          </p>
          
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {step === 1 ? (
              <div className="p-6">
                <h2 className="text-xl font-medium mb-6">Step 1: Create Your Shop</h2>
                
                <form onSubmit={handleStepOneSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Shop Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={shopData.name}
                        onChange={handleShopInputChange}
                        required
                        className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={shopData.location}
                        onChange={handleShopInputChange}
                        className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="logo" className="block text-sm font-medium mb-1">
                        Upload Logo
                      </label>
                      <input
                        type="file"
                        id="logo"
                        name="logo"
                        accept="image/*"
                        onChange={handleShopLogoChange}
                        className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended size: 256x256 pixels
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium mb-1">
                        Business Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={shopData.businessType}
                        onChange={handleShopInputChange}
                        required
                        className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="">Select a business type</option>
                        <option value="Grocery">Grocery</option>
                        <option value="Food">Food</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Home & Living">Home & Living</option>
                        <option value="Garden & Plants">Garden & Plants</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/80 text-foreground"
                    >
                      Create Shop
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">Step 2: Add Your First Product</h2>
                  <div className="flex items-center">
                    <span className="text-sm mr-2 text-accent-teal">Shop:</span>
                    <span className="text-sm font-semibold">{shopData.name}</span>
                  </div>
                </div>
                
                <form onSubmit={handleStepTwoSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="productName" className="block text-sm font-medium mb-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="productName"
                        name="name"
                        value={productData.name}
                        onChange={handleProductInputChange}
                        required
                        className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="productImage" className="block text-sm font-medium mb-1">
                        Product Image
                      </label>
                      <input
                        type="file"
                        id="productImage"
                        name="image"
                        accept="image/*"
                        onChange={handleProductInputChange}
                        className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="productPrice" className="block text-sm font-medium mb-1">
                        Price in USD <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="productPrice"
                        name="price"
                        value={productData.price}
                        onChange={handleProductInputChange}
                        min="0.01"
                        step="0.01"
                        required
                        className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Star Rating
                      </label>
                      {renderStarRating()}
                    </div>
                  </div>
                  
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Back to Shop Details
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-accent hover:bg-accent/80 text-foreground"
                    >
                      Add Product
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JoinSellerPage;
