
export interface Shop {
  id: string;
  name: string;
  logo: string;
  description: string;
  type: string;
  tokenName: string;
  tokenSymbol: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  tokenReward: number;
  shopId: string;
}

export const mockShops: Shop[] = [
  {
    id: "shop-1",
    name: "TechGadgets",
    logo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=64&h=64&q=80",
    description: "The latest tech products with exclusive token rewards",
    type: "Electronics",
    tokenName: "TechToken",
    tokenSymbol: "TCH",
    products: [
      {
        id: "product-1",
        name: "Wireless Earbuds Pro",
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&h=300&q=80",
        price: 129.99,
        rating: 4.5,
        tokenReward: 50,
        shopId: "shop-1"
      },
      {
        id: "product-2",
        name: "Smart Watch Series 5",
        image: "https://images.unsplash.com/photo-1617043786394-ae98c63c3e0d?auto=format&fit=crop&w=300&h=300&q=80",
        price: 249.99,
        rating: 4.8,
        tokenReward: 100,
        shopId: "shop-1"
      },
      {
        id: "product-3",
        name: "Ultra HD Webcam",
        image: "https://images.unsplash.com/photo-1629429407759-01cd3d7cfb38?auto=format&fit=crop&w=300&h=300&q=80",
        price: 89.99,
        rating: 4.2,
        tokenReward: 35,
        shopId: "shop-1"
      }
    ]
  },
  {
    id: "shop-2",
    name: "FreshGrocer",
    logo: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=64&h=64&q=80",
    description: "Farm-fresh produce delivered to your door",
    type: "Online Groceries",
    tokenName: "FreshCoin",
    tokenSymbol: "FRSH",
    products: [
      {
        id: "product-4",
        name: "Organic Vegetable Box",
        image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=300&h=300&q=80",
        price: 39.99,
        rating: 4.7,
        tokenReward: 20,
        shopId: "shop-2"
      },
      {
        id: "product-5",
        name: "Premium Fruit Basket",
        image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=300&h=300&q=80",
        price: 49.99,
        rating: 4.6,
        tokenReward: 25,
        shopId: "shop-2"
      }
    ]
  },
  {
    id: "shop-3",
    name: "Urban Fashion",
    logo: "https://images.unsplash.com/photo-1589363360147-a43c012ae749?auto=format&fit=crop&w=64&h=64&q=80",
    description: "Trendy clothing with sustainable materials",
    type: "Fashion",
    tokenName: "StyleCoin",
    tokenSymbol: "STYL",
    products: [
      {
        id: "product-6",
        name: "Premium Denim Jacket",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=300&h=300&q=80",
        price: 129.99,
        rating: 4.3,
        tokenReward: 65,
        shopId: "shop-3"
      },
      {
        id: "product-7",
        name: "Eco-friendly Sneakers",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&h=300&q=80",
        price: 89.99,
        rating: 4.4,
        tokenReward: 45,
        shopId: "shop-3"
      }
    ]
  },
  {
    id: "shop-4",
    name: "GourmetEats",
    logo: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=64&h=64&q=80",
    description: "Restaurant-quality meals delivered to your home",
    type: "Online Food Order",
    tokenName: "FoodToken",
    tokenSymbol: "FOOD",
    products: [
      {
        id: "product-8",
        name: "Gourmet Meal Kit for Two",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&h=300&q=80",
        price: 59.99,
        rating: 4.9,
        tokenReward: 30,
        shopId: "shop-4"
      },
      {
        id: "product-9",
        name: "Artisan Dessert Box",
        image: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&w=300&h=300&q=80",
        price: 35.99,
        rating: 4.7,
        tokenReward: 18,
        shopId: "shop-4"
      }
    ]
  },
  {
    id: "shop-5",
    name: "HomeStyles",
    logo: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=64&h=64&q=80",
    description: "Beautiful home decor and furniture",
    type: "Home & Living",
    tokenName: "HomeToken",
    tokenSymbol: "HOME",
    products: [
      {
        id: "product-10",
        name: "Minimalist Desk Lamp",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&h=300&q=80",
        price: 89.99,
        rating: 4.4,
        tokenReward: 45,
        shopId: "shop-5"
      },
      {
        id: "product-11",
        name: "Scandinavian Coffee Table",
        image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=300&h=300&q=80",
        price: 299.99,
        rating: 4.6,
        tokenReward: 150,
        shopId: "shop-5"
      }
    ]
  },
  {
    id: "shop-6",
    name: "GreenThumb",
    logo: "https://images.unsplash.com/photo-1627393100177-b4297e79a5be?auto=format&fit=crop&w=64&h=64&q=80",
    description: "Indoor and outdoor plants for any space",
    type: "Garden & Plants",
    tokenName: "GreenToken",
    tokenSymbol: "GRN",
    products: [
      {
        id: "product-12",
        name: "Indoor Plant Collection",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=300&h=300&q=80",
        price: 69.99,
        rating: 4.5,
        tokenReward: 35,
        shopId: "shop-6"
      },
      {
        id: "product-13",
        name: "Ceramic Plant Pot Set",
        image: "https://images.unsplash.com/photo-1591958911259-bee2173bdccc?auto=format&fit=crop&w=300&h=300&q=80",
        price: 49.99,
        rating: 4.3,
        tokenReward: 25,
        shopId: "shop-6"
      }
    ]
  }
];

export interface CartItem extends Product {
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tokenRewards: number;
}
