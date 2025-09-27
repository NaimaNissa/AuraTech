export const products = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 1199,
    originalPrice: 1299,
    category: "smartphones",
    brand: "Apple",
    rating: 4.8,
    reviews: 1250,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    description: "Latest iPhone with titanium design and advanced camera system",
    inStock: true,
    features: ["A17 Pro chip", "48MP camera", "Titanium design"]
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    price: 1099,
    originalPrice: 1199,
    category: "smartphones",
    brand: "Samsung",
    rating: 4.7,
    reviews: 980,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
    description: "Premium Android phone with S Pen and AI features",
    inStock: true,
    features: ["S Pen included", "200MP camera", "AI features"]
  },
  {
    id: 3,
    name: "MacBook Pro 16-inch",
    price: 2499,
    originalPrice: 2699,
    category: "laptops",
    brand: "Apple",
    rating: 4.9,
    reviews: 750,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
    description: "Powerful laptop for professionals with M3 Pro chip",
    inStock: true,
    features: ["M3 Pro chip", "16-inch display", "22-hour battery"]
  },
  {
    id: 4,
    name: "Dell XPS 13",
    price: 999,
    originalPrice: 1199,
    category: "laptops",
    brand: "Dell",
    rating: 4.6,
    reviews: 650,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    description: "Ultra-portable laptop with stunning display",
    inStock: true,
    features: ["13.4-inch display", "Intel Core i7", "Ultra-portable"]
  },
  {
    id: 5,
    name: "Sony WH-1000XM5",
    price: 349,
    originalPrice: 399,
    category: "audio",
    brand: "Sony",
    rating: 4.8,
    reviews: 2100,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
    description: "Industry-leading noise canceling headphones",
    inStock: true,
    features: ["30-hour battery", "Noise canceling", "Hi-Res audio"]
  },
  {
    id: 6,
    name: "AirPods Pro 2",
    price: 229,
    originalPrice: 249,
    category: "audio",
    brand: "Apple",
    rating: 4.7,
    reviews: 1800,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400",
    description: "Wireless earbuds with adaptive transparency",
    inStock: true,
    features: ["Active noise canceling", "Spatial audio", "MagSafe charging"]
  },
  {
    id: 7,
    name: "Apple Watch Series 9",
    price: 399,
    originalPrice: 429,
    category: "wearables",
    brand: "Apple",
    rating: 4.6,
    reviews: 920,
    image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400",
    description: "Advanced smartwatch with health monitoring",
    inStock: true,
    features: ["Health monitoring", "Always-on display", "Water resistant"]
  },
  {
    id: 8,
    name: "Samsung Galaxy Watch 6",
    price: 299,
    originalPrice: 329,
    category: "wearables",
    brand: "Samsung",
    rating: 4.5,
    reviews: 680,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    description: "Smart watch with comprehensive health tracking",
    inStock: true,
    features: ["Sleep tracking", "GPS", "Water resistant"]
  },
  {
    id: 9,
    name: "Canon EOS R5",
    price: 3899,
    originalPrice: 4199,
    category: "cameras",
    brand: "Canon",
    rating: 4.9,
    reviews: 450,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400",
    description: "Professional mirrorless camera with 8K video",
    inStock: true,
    features: ["45MP sensor", "8K video", "In-body stabilization"]
  },
  {
    id: 10,
    name: "Sony A7 IV",
    price: 2499,
    originalPrice: 2699,
    category: "cameras",
    brand: "Sony",
    rating: 4.8,
    reviews: 380,
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
    description: "Full-frame mirrorless camera for creators",
    inStock: true,
    features: ["33MP sensor", "4K 60p video", "Real-time tracking"]
  },
  {
    id: 11,
    name: "PlayStation 5",
    price: 499,
    originalPrice: 549,
    category: "gaming",
    brand: "Sony",
    rating: 4.7,
    reviews: 3200,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
    description: "Next-gen gaming console with ray tracing",
    inStock: false,
    features: ["Ray tracing", "3D audio", "Ultra-fast SSD"]
  },
  {
    id: 12,
    name: "Xbox Series X",
    price: 499,
    originalPrice: 549,
    category: "gaming",
    brand: "Microsoft",
    rating: 4.6,
    reviews: 2800,
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400",
    description: "Most powerful Xbox console ever",
    inStock: true,
    features: ["4K gaming", "Quick Resume", "Smart Delivery"]
  }
];

export const categories = [
  { id: "all", name: "All Products", count: products.length },
  { id: "smartphones", name: "Smartphones", count: products.filter(p => p.category === "smartphones").length },
  { id: "laptops", name: "Laptops", count: products.filter(p => p.category === "laptops").length },
  { id: "audio", name: "Audio", count: products.filter(p => p.category === "audio").length },
  { id: "wearables", name: "Wearables", count: products.filter(p => p.category === "wearables").length },
  { id: "cameras", name: "Cameras", count: products.filter(p => p.category === "cameras").length },
  { id: "gaming", name: "Gaming", count: products.filter(p => p.category === "gaming").length }
];

export const brands = [
  "All Brands",
  "Apple",
  "Samsung",
  "Sony",
  "Dell",
  "Canon",
  "Microsoft"
];

export const priceRanges = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-500", label: "Under $500", min: 0, max: 500 },
  { id: "500-1000", label: "$500 - $1000", min: 500, max: 1000 },
  { id: "1000-2000", label: "$1000 - $2000", min: 1000, max: 2000 },
  { id: "over-2000", label: "Over $2000", min: 2000, max: Infinity }
];

