// frontend/src/pages/JoinSellerPage.tsx
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createShop, addProductToShop } from '@/services/api';
import { useWallet } from '@solana/wallet-adapter-react';
import { Link, useNavigate } from 'react-router-dom';

const JoinSellerPage = () => {
  const { toast } = useToast();
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [createdShopId, setCreatedShopId] = useState<string | null>(null);
  const [createdMintAddress, setCreatedMintAddress] = useState<string | null>(null); // New state
  const [mintTxSignature, setMintTxSignature] = useState<string | null>(null); // New state

  const [isSubmittingShop, setIsSubmittingShop] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  const [shopData, setShopData] = useState({
    name: '',
    description: 'A great shop on TokenMarket!',
    logo: null as File | null,
    type: '',
    tokenName: '',
    tokenSymbol: '',
  });

  const [productData, setProductData] = useState({
    name: '',
    image: null as File | null,
    price: '',
    rating: '5',
    tokenReward: '',
  });

  useEffect(() => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Solana wallet to create a shop.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [connected, toast]);

  const handleShopInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setShopData({ ...shopData, [name]: value });
  };

  const handleShopLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShopData({ ...shopData, logo: e.target.files ? e.target.files[0] : null });
  };

  const handleStepOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast({ title: "Wallet Not Connected", description: "Please connect your Solana wallet to create a shop.", variant: "destructive" });
      return;
    }
    if (!shopData.name || !shopData.type || !shopData.tokenName || !shopData.tokenSymbol || !shopData.description) {
      toast({ title: "Missing Shop Fields", description: "Please fill in all required shop fields.", variant: "destructive" });
      return;
    }

    setIsSubmittingShop(true);
    const formData = new FormData();
    formData.append('name', shopData.name);
    formData.append('description', shopData.description);
    formData.append('type', shopData.type);
    formData.append('tokenName', shopData.tokenName);
    formData.append('tokenSymbol', shopData.tokenSymbol.toUpperCase());
    formData.append('ownerWalletAddress', publicKey.toBase58());
    if (shopData.logo) {
      formData.append('logo', shopData.logo);
    }

    try {
      const newShopResponse = await createShop(formData);
      const shopIdFromResult = newShopResponse.id || newShopResponse._id;
      if (!shopIdFromResult) {
        throw new Error("Shop created but ID was not returned.");
      }
      setCreatedShopId(shopIdFromResult);
      setCreatedMintAddress(newShopResponse.mintAddress); // Store mint address
      setMintTxSignature(newShopResponse.mintTransactionSignature); // Store mint tx signature

      toast({ 
        title: "Shop Created!", 
        description: (
          <div>
            <p>Your shop's loyalty token mint: {newShopResponse.mintAddress}</p>
            <a 
              href={`https://explorer.solana.com/address/${newShopResponse.mintAddress}?cluster=devnet`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View Mint on Explorer
            </a>
            <p className="mt-2">Now add your first product.</p>
          </div>
        ),
        duration: 10000 
      });
      setStep(2);
    } catch (error: any) {
      toast({ title: "Shop Creation Failed", description: error.message || "Could not create shop. Check if a shop already exists for this wallet.", variant: "destructive" });
    } finally {
      setIsSubmittingShop(false);
    }
  };
  // ... (rest of the component remains the same for product handling)
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "file" && e.target.files) {
      setProductData({ ...productData, [name]: e.target.files[0] });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleStepTwoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdShopId) {
      toast({ title: "Error", description: "Shop ID not found. Please go back.", variant: "destructive" });
      return;
    }
    if (!productData.name || !productData.price || !productData.tokenReward) {
      toast({ title: "Missing Product Fields", description: "Please fill in Product Name, Price, and Token Reward.", variant: "destructive" });
      return;
    }

    setIsSubmittingProduct(true);
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('price', productData.price);
    formData.append('rating', productData.rating);
    formData.append('tokenReward', productData.tokenReward);
    if (productData.image) {
      formData.append('image', productData.image);
    }

    try {
      await addProductToShop(createdShopId, formData);
      toast({ title: "Product Added!", description: `${productData.name} is now listed. You can add more or go to your shop.`, duration: 4000 });
      setProductData({ name: '', image: null, price: '', rating: '5', tokenReward: '' }); // Reset form
    } catch (error: any) {
      toast({ title: "Product Add Failed", description: error.message || "Could not add product.", variant: "destructive" });
    } finally {
      setIsSubmittingProduct(false);
    }
  };
  
    const renderStarRating = () => (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={star}
              checked={parseInt(productData.rating) === star}
              onChange={handleProductInputChange}
              className="hidden"
            />
            <span className={`text-2xl ${star <= parseInt(productData.rating) ? 'text-yellow-400' : 'text-gray-400'}`}>
              ★
            </span>
          </label>
        ))}
      </div>
    );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Join as a Seller</h1>
          <p className="text-center text-muted-foreground mb-8">
            {!publicKey ? "Connect your wallet to get started." : (step === 1 ? "Create your shop profile." : `Adding products to ${shopData.name || 'your new shop'}`)}
          </p>

          {!publicKey && (
            <div className="text-center py-10 bg-card rounded-lg border border-border">
                <p className="mb-4 text-lg">Please connect your Solana wallet to register as a seller.</p>
                <p className="text-sm text-muted-foreground">The "Connect Wallet" button is in the navigation bar.</p>
            </div>
          )}
          
          {publicKey && (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {step === 1 ? (
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-medium mb-6">Step 1: Create Your Shop</h2>
                  {/* ... form for shop details ... */}
                  <form onSubmit={handleStepOneSubmit}>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="shopName" className="block text-sm font-medium mb-1">Shop Name <span className="text-red-500">*</span></label>
                        <input type="text" id="shopName" name="name" value={shopData.name} onChange={handleShopInputChange} required className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-accent"/>
                      </div>
                      <div>
                        <label htmlFor="shopDescription" className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
                        <textarea id="shopDescription" name="description" value={shopData.description} onChange={handleShopInputChange} required rows={3} className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-accent"></textarea>
                      </div>
                      <div>
                        <label htmlFor="shopLogo" className="block text-sm font-medium mb-1">Shop Logo (Optional)</label>
                        <input type="file" id="shopLogo" name="logo" accept="image/*" onChange={handleShopLogoChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-input file:bg-background file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"/>
                        <p className="text-xs text-muted-foreground mt-1">Recommended: Square image, max 5MB.</p>
                      </div>
                      <div>
                        <label htmlFor="shopType" className="block text-sm font-medium mb-1">Shop Type <span className="text-red-500">*</span></label>
                        <select id="shopType" name="type" value={shopData.type} onChange={handleShopInputChange} required className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-accent">
                          <option value="">Select type</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Online Groceries">Online Groceries</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Online Food Order">Online Food Order</option>
                          <option value="Home & Living">Home & Living</option>
                          <option value="Garden & Plants">Garden & Plants</option>
                          <option value="Art & Collectibles">Art & Collectibles</option>
                          <option value="Services">Services</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                       <div>
                        <label htmlFor="tokenName" className="block text-sm font-medium mb-1">Loyalty Token Name <span className="text-red-500">*</span></label>
                        <input type="text" id="tokenName" name="tokenName" placeholder="e.g., MyShop Rewards" value={shopData.tokenName} onChange={handleShopInputChange} required className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-accent"/>
                      </div>
                       <div>
                        <label htmlFor="tokenSymbol" className="block text-sm font-medium mb-1">Token Symbol (3-5 Chars) <span className="text-red-500">*</span></label>
                        <input type="text" id="tokenSymbol" name="tokenSymbol" placeholder="e.g., MSR" minLength={3} maxLength={5} value={shopData.tokenSymbol} onChange={(e) => setShopData({...shopData, tokenSymbol: e.target.value.toUpperCase()})} required className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-accent"/>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Button type="submit" className="w-full bg-accent hover:bg-accent/80 text-foreground" disabled={isSubmittingShop || !connected}>
                        {isSubmittingShop ? 'Creating Shop...' : 'Create Shop & Add Products'}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium">Step 2: Add Products</h2>
                    {shopData.name && (
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Shop:</p>
                            <p className="text-sm font-semibold text-accent-teal">{shopData.name}</p>
                        </div>
                    )}
                  </div>
                  {/* Display Mint Address and Explorer Link if available */}
                  {createdMintAddress && (
                    <div className="mb-4 p-3 bg-muted rounded-md border border-input">
                      <p className="text-sm font-medium">Loyalty Token Minted!</p>
                      <p className="text-xs text-muted-foreground">Mint Address: {createdMintAddress}</p>
                      {mintTxSignature && (
                         <p className="text-xs text-muted-foreground">Mint Tx: {mintTxSignature.substring(0,10)}...</p>
                      )}
                      <a 
                        href={`https://explorer.solana.com/address/${createdMintAddress}?cluster=devnet`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-accent-teal hover:underline"
                      >
                        View on Devnet Explorer
                      </a>
                    </div>
                  )}
                  <form onSubmit={handleStepTwoSubmit}>
                    {/* ... form for product details ... */}
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="productName" className="block text-sm font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
                        <input type="text" id="productName" name="name" value={productData.name} onChange={handleProductInputChange} required className="w-full px-4 py-2 bg-background border border-input rounded-md"/>
                      </div>
                      <div>
                        <label htmlFor="productImage" className="block text-sm font-medium mb-1">Product Image (Optional)</label>
                        <input type="file" id="productImage" name="image" accept="image/*" onChange={handleProductInputChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-input file:bg-background file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"/>
                         <p className="text-xs text-muted-foreground mt-1">Max 5MB.</p>
                      </div>
                      <div>
                        <label htmlFor="productPrice" className="block text-sm font-medium mb-1">Price (USD) <span className="text-red-500">*</span></label>
                        <input type="number" id="productPrice" name="price" value={productData.price} onChange={handleProductInputChange} min="0.01" step="0.01" required className="w-full px-4 py-2 bg-background border border-input rounded-md"/>
                      </div>
                      <div>
                        <label htmlFor="tokenReward" className="block text-sm font-medium mb-1">Token Reward per Purchase <span className="text-red-500">*</span></label>
                        <input type="number" id="tokenReward" name="tokenReward" value={productData.tokenReward} onChange={handleProductInputChange} min="0" step="1" required className="w-full px-4 py-2 bg-background border border-input rounded-md"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Star Rating (Optional)</label>
                        {renderStarRating()}
                      </div>
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={isSubmittingProduct}>Back to Shop Details</Button>
                      <Button type="submit" className="flex-1 bg-accent hover:bg-accent/80 text-foreground" disabled={isSubmittingProduct}>
                        {isSubmittingProduct ? 'Adding Product...' : 'Add This Product'}
                      </Button>
                    </div>
                    <div className="mt-6 text-center">
                        <Button variant="link" onClick={() => navigate(`/shops/${createdShopId}`)} className="text-accent-teal" disabled={!createdShopId}>
                            Finish & View My Shop
                        </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JoinSellerPage;    