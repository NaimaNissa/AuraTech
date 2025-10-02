import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from './firebase';

// Transform Firebase product data to match the expected format
const transformProduct = (firebaseProduct) => {
  // Map Firebase category field - handle both "category" and "Catergory" 
  const getCategory = (product) => {
    // Check for both possible field names in your database
    if (product.category && product.category !== '') {
      // Map "Phones" to "smartphones" for consistency
      const cat = product.category.toLowerCase();
      if (cat === 'phones' || cat === 'phone') return 'smartphones';
      return cat;
    }
    if (product.Catergory && product.Catergory !== '') {
      const cat = product.Catergory.toLowerCase();
      if (cat === 'phones' || cat === 'phone') return 'smartphones';
      return cat;
    }
    return 'uncategorized';
  };

  // Extract brand from product name if not provided
  const getBrand = (product) => {
    if (product.brand && product.brand !== '') return product.brand;
    
    // Try to extract brand from product name
    const name = (product.productname || '').toLowerCase();
    if (name.includes('iphone') || name.includes('apple')) return 'Apple';
    if (name.includes('samsung')) return 'Samsung';
    if (name.includes('google') || name.includes('pixel')) return 'Google';
    if (name.includes('oneplus')) return 'OnePlus';
    if (name.includes('xiaomi')) return 'Xiaomi';
    if (name.includes('huawei')) return 'Huawei';
    
    return 'Unknown Brand';
  };

  return {
    id: firebaseProduct.productID || firebaseProduct.id,
    name: firebaseProduct.productname || firebaseProduct.name || 'Unnamed Product',
    price: parseFloat(firebaseProduct.Price) || 0,
    originalPrice: parseFloat(firebaseProduct.originalPrice) || parseFloat(firebaseProduct.Price) || 0,
    category: getCategory(firebaseProduct),
    brand: getBrand(firebaseProduct),
    rating: parseFloat(firebaseProduct.rating) || 4.5,
    reviews: parseInt(firebaseProduct.reviews) || Math.floor(Math.random() * 500) + 50,
    image: firebaseProduct.productImg || firebaseProduct.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
    description: firebaseProduct.Description || firebaseProduct.description || 'Premium quality product with excellent features',
    inStock: parseInt(firebaseProduct.Quantity) > 0,
    quantity: parseInt(firebaseProduct.Quantity) || 0,
    features: firebaseProduct.KeyFeatures ? firebaseProduct.KeyFeatures.split(',').map(f => f.trim()).filter(f => f) : ['High Quality', 'Premium Design', 'Latest Technology'],
    colors: firebaseProduct.Colors ? firebaseProduct.Colors.split(',').map(c => c.trim()).filter(c => c) : [],
    createdAt: firebaseProduct.createdAt,
    updatedAt: firebaseProduct.updatedAt
  };
};

// Get all products from Firebase
export const getAllProducts = async () => {
  try {
    console.log('🔥 Fetching products from Firebase (products collection)...');
    // Use the same collection name as the dashboard
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`📦 Found ${snapshot.size} products in Firebase`);
    
    const products = [];
    snapshot.forEach((doc) => {
      const productData = { id: doc.id, ...doc.data() };
      console.log('📄 Product data:', productData);
      products.push(transformProduct(productData));
    });
    
    console.log('✅ Transformed products:', products);
    return products;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    console.error('Error details:', error.code, error.message);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (productId) => {
  try {
    console.log('🔍 Fetching product with ID:', productId);
    
    // Query by productID field instead of document ID
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('productID', '==', productId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const productData = { id: doc.id, ...doc.data() };
      console.log('✅ Found product:', productData);
      return transformProduct(productData);
    } else {
      console.log('❌ Product not found with productID:', productId);
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (category) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    
    const products = [];
    snapshot.forEach((doc) => {
      const productData = { id: doc.id, ...doc.data() };
      products.push(transformProduct(productData));
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Search products
export const searchProducts = async (searchTerm) => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const products = [];
    const searchLower = searchTerm.toLowerCase();
    
    snapshot.forEach((doc) => {
      const productData = { id: doc.id, ...doc.data() };
      const transformedProduct = transformProduct(productData);
      
      // Search in name, description, and brand
      if (
        transformedProduct.name.toLowerCase().includes(searchLower) ||
        transformedProduct.description.toLowerCase().includes(searchLower) ||
        transformedProduct.brand.toLowerCase().includes(searchLower)
      ) {
        products.push(transformedProduct);
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Get categories from Categories collection and count products
export const getCategories = async () => {
  try {
    // Get categories from Categories collection
    const categoriesRef = collection(db, 'Categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    // Get all products to count them
    const products = await getAllProducts();
    
    const categories = [
      { id: "all", name: "All Products", count: products.length }
    ];
    
    // Process each category document
    categoriesSnapshot.forEach((doc) => {
      const categoryData = doc.data();
      
      // Check each category field (Camera, Phone, Tablets)
      if (categoryData.Camera !== undefined) {
        const cameraCount = products.filter(p => p.category === 'cameras').length;
        if (cameraCount > 0) {
          categories.push({
            id: 'cameras',
            name: 'Cameras',
            count: cameraCount
          });
        }
      }
      
      if (categoryData.Phone !== undefined) {
        const phoneCount = products.filter(p => p.category === 'smartphones' || p.category === 'phone').length;
        if (phoneCount > 0) {
          categories.push({
            id: 'smartphones',
            name: 'Smartphones', 
            count: phoneCount
          });
        }
      }
      
      if (categoryData.Tablets !== undefined) {
        const tabletCount = products.filter(p => p.category === 'tablets').length;
        if (tabletCount > 0) {
          categories.push({
            id: 'tablets',
            name: 'Tablets',
            count: tabletCount
          });
        }
      }
    });
    
    // Remove duplicates and return
    const uniqueCategories = categories.filter((category, index, self) => 
      index === self.findIndex(c => c.id === category.id)
    );
    
    return uniqueCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to product-based categories
    const products = await getAllProducts();
    return [
      { id: "all", name: "All Products", count: products.length },
      { id: "cameras", name: "Cameras", count: products.filter(p => p.category === 'cameras').length },
      { id: "smartphones", name: "Smartphones", count: products.filter(p => p.category === 'smartphones').length },
      { id: "tablets", name: "Tablets", count: products.filter(p => p.category === 'tablets').length }
    ];
  }
};

// Get brands from products
export const getBrands = async () => {
  try {
    const products = await getAllProducts();
    const brandSet = new Set();
    
    products.forEach(product => {
      if (product.brand && product.brand !== 'Unknown Brand') {
        brandSet.add(product.brand);
      }
    });
    
    return ['All Brands', ...Array.from(brandSet).sort()];
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};
