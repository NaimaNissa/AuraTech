import { getAllProducts, getCategories, getBrands } from '../lib/productService';

// This will be populated with Firebase data
let products = [];
let categories = [];
let brands = [];

// Initialize data from Firebase
export const initializeProducts = async () => {
  try {
    products = await getAllProducts();
    categories = await getCategories();
    brands = await getBrands();
    return { products, categories, brands };
  } catch (error) {
    console.error('Error initializing products:', error);
    // Fallback to empty arrays if Firebase fails
    return { products: [], categories: [], brands: [] };
  }
};

// Get products (will be populated from Firebase)
export const getProducts = () => products;

// Get categories (will be populated from Firebase)
export const getCategoriesData = () => categories;

// Get brands (will be populated from Firebase)
export const getBrandsData = () => brands;

// Refresh data from Firebase
export const refreshProducts = async () => {
  return await initializeProducts();
};

// Static price ranges (these don't change)
export const priceRanges = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-500", label: "Under $500", min: 0, max: 500 },
  { id: "500-1000", label: "$500 - $1000", min: 500, max: 1000 },
  { id: "1000-2000", label: "$1000 - $2000", min: 1000, max: 2000 },
  { id: "over-2000", label: "Over $2000", min: 2000, max: Infinity }
];

