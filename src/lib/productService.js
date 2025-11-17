import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  updateDoc,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { generateSampleColorImages } from './colorImageUtils';

// Cache for category ID to name mapping
let categoryIdToNameCache = null;
let categoryCacheExpiry = 0;

// Load category ID to name mapping
const loadCategoryMapping = async () => {
  const now = Date.now();
  if (categoryIdToNameCache && now < categoryCacheExpiry) {
    return categoryIdToNameCache;
  }
  
  try {
    console.log('📁 Loading category mapping from database...');
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    
    const mapping = {};
    snapshot.forEach((doc) => {
      const categoryData = doc.data();
      mapping[doc.id] = categoryData.name;
    });
    
    categoryIdToNameCache = mapping;
    categoryCacheExpiry = now + (5 * 60 * 1000); // Cache for 5 minutes
    
    console.log('✅ Loaded category mapping:', mapping);
    console.log('🔍 Category mapping details:', Object.entries(mapping).map(([id, name]) => ({ id, name })));
    return mapping;
  } catch (error) {
    console.error('❌ Error loading category mapping:', error);
    return {};
  }
};

// Transform Firebase product data to match the expected format
const transformProduct = (firebaseProduct) => {
  // Map Firebase category field - handle both "category" and "Catergory" 
  const getCategory = (product) => {
    console.log('🔍 Getting category for product:', {
      id: product.productID || product.id,
      name: product.productname || product.name,
      category: product.category,
      Catergory: product.Catergory,
      allFields: Object.keys(product)
    });
    
  // Check for both possible field names in your database
  if (product.category && product.category !== '' && typeof product.category === 'string') {
    console.log('✅ Found category field:', product.category);
    return product.category; // Return as-is, let the mapping function handle it
  } else {
    console.log('⚠️ No category field or empty category:', product.category);
  }
    
    // Fallback to other possible field names
    if (product.Catergory && product.Catergory !== '' && typeof product.Catergory === 'string') {
      console.log('✅ Found Catergory field:', product.Catergory);
      return product.Catergory; // Return as-is, let the mapping function handle it
    } else {
      console.log('⚠️ No Catergory field or empty:', product.Catergory);
    }
    
    // If no valid category found, try to infer from product name
    const name = (product.productname || product.name || '').toLowerCase();
    console.log('🔍 Trying to infer category from product name:', name);
    
    // More comprehensive category inference
    if (name.includes('phone') || name.includes('iphone') || name.includes('samsung') || 
        name.includes('galaxy') || name.includes('pixel') || name.includes('oneplus') ||
        name.includes('xiaomi') || name.includes('huawei') || name.includes('oppo') ||
        name.includes('vivo') || name.includes('realme') || name.includes('mobile')) {
      console.log('✅ Inferred category: smartphones');
      return 'smartphones';
    }
    if (name.includes('laptop') || name.includes('macbook') || name.includes('computer') ||
        name.includes('notebook') || name.includes('ultrabook') || name.includes('gaming laptop')) {
      console.log('✅ Inferred category: laptops');
      return 'laptops';
    }
    if (name.includes('camera') || name.includes('canon') || name.includes('nikon') ||
        name.includes('sony') || name.includes('fujifilm') || name.includes('olympus') ||
        name.includes('panasonic') || name.includes('leica') || name.includes('dslr') ||
        name.includes('mirrorless') || name.includes('photography')) {
      console.log('✅ Inferred category: cameras');
      return 'cameras';
    }
    if (name.includes('tablet') || name.includes('ipad') || name.includes('android tablet') ||
        name.includes('surface') || name.includes('kindle')) {
      console.log('✅ Inferred category: tablets');
      return 'tablets';
    }
    if (name.includes('headphone') || name.includes('headset') || name.includes('speaker') || 
        name.includes('audio') || name.includes('sound') || name.includes('earphone') ||
        name.includes('earbud') || name.includes('airpods') || name.includes('beats') ||
        name.includes('bose') || name.includes('sony') || name.includes('jbl')) {
      console.log('✅ Inferred category: audio');
      return 'audio';
    }
    if (name.includes('game') || name.includes('gaming') || name.includes('console') ||
        name.includes('controller') || name.includes('playstation') || name.includes('xbox') ||
        name.includes('nintendo') || name.includes('switch') || name.includes('steam')) {
      console.log('✅ Inferred category: gaming');
      return 'gaming';
    }
    if (name.includes('watch') || name.includes('smartwatch') || name.includes('fitness') ||
        name.includes('band') || name.includes('tracker') || name.includes('wearable')) {
      console.log('✅ Inferred category: wearables');
      return 'wearables';
    }
    
    console.log('⚠️ No valid category found, using default: uncategorized');
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

// Generate default features based on product category and name
const generateDefaultFeatures = (product) => {
  const name = (product.productname || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const brand = getBrand(product);
  
  const defaultFeatures = [];
  
  // Brand-specific features
  if (brand === 'Apple') {
    defaultFeatures.push('Apple Ecosystem Integration', 'Premium Build Quality', 'iOS Operating System');
  } else if (brand === 'Samsung') {
    defaultFeatures.push('Samsung Galaxy Features', 'Android Operating System', 'Premium Display Technology');
  } else if (brand === 'Google') {
    defaultFeatures.push('Google Services Integration', 'Pure Android Experience', 'AI-Powered Features');
  }
  
  // Category-specific features
  if (category.includes('phone') || category.includes('smartphone')) {
    defaultFeatures.push('High-Resolution Camera', 'Fast Processor', 'Long Battery Life', '5G Connectivity');
  } else if (category.includes('laptop') || category.includes('computer')) {
    defaultFeatures.push('High-Performance Processor', 'Large Storage Capacity', 'Long Battery Life', 'Fast Charging');
  } else if (category.includes('camera')) {
    defaultFeatures.push('High-Resolution Sensor', 'Optical Image Stabilization', '4K Video Recording', 'Professional Controls');
  } else if (category.includes('tablet')) {
    defaultFeatures.push('Large Touch Display', 'Portable Design', 'Long Battery Life', 'Multi-Tasking Capability');
  } else if (category.includes('audio') || category.includes('headphone')) {
    defaultFeatures.push('High-Quality Sound', 'Noise Cancellation', 'Wireless Connectivity', 'Comfortable Design');
  } else if (category.includes('gaming')) {
    defaultFeatures.push('High-Performance Graphics', 'Fast Response Time', 'Ergonomic Design', 'Customizable Controls');
  }
  
  // Generic features if no specific ones found
  if (defaultFeatures.length === 0) {
    defaultFeatures.push('High Quality Materials', 'Premium Design', 'Latest Technology', 'Reliable Performance');
  }
  
  // Add some generic features
  defaultFeatures.push('1 Year Warranty', 'Customer Support');
  
  return defaultFeatures.slice(0, 8); // Limit to 8 features max
};

  // Parse color images from Firebase data
  const getColorImages = (firebaseProduct) => {
    // Check if colorImages field exists in Firebase
    if (firebaseProduct.colorImages && typeof firebaseProduct.colorImages === 'object') {
      return firebaseProduct.colorImages;
    }
    
    // If no color images stored, generate sample images for demonstration
    const colors = firebaseProduct.Colors ? firebaseProduct.Colors.split(',').map(c => c.trim()).filter(c => c) : [];
    
    if (colors.length > 0) {
      // Create a temporary product object for the utility function
      const tempProduct = {
        colors: colors,
        image: firebaseProduct.productImg || firebaseProduct.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
        price: parseFloat(firebaseProduct.Price) || 0
      };
      
      return generateSampleColorImages(tempProduct);
    }
    
    // Fallback for products without colors
    return {
      default: {
        name: 'Default',
        images: [firebaseProduct.productImg || firebaseProduct.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
        price: parseFloat(firebaseProduct.Price) || 0
      }
    };
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
    features: firebaseProduct.KeyFeatures ? firebaseProduct.KeyFeatures.split(',').map(f => f.trim()).filter(f => f) : generateDefaultFeatures(firebaseProduct),
    colors: firebaseProduct.Colors ? firebaseProduct.Colors.split(',').map(c => c.trim()).filter(c => c) : [],
    colorImages: getColorImages(firebaseProduct), // New field for color-based images
    tax: firebaseProduct.tax || [], // Tax array: [{quantity: number, taxAmount: number}]
    // Store the raw Firebase data for color-based images
    rawData: firebaseProduct,
    createdAt: firebaseProduct.createdAt,
    updatedAt: firebaseProduct.updatedAt
  };
};

// Transform product with category mapping
const transformProductWithCategoryMapping = async (firebaseProduct, categoryMapping) => {
  const transformed = transformProduct(firebaseProduct);
  
  console.log('🔍 TRANSFORMING PRODUCT:', {
    name: transformed.name,
    originalCategory: transformed.category,
    categoryMapping: categoryMapping
  });
  
  // Check if the category is a category ID that needs mapping
  if (transformed.category && categoryMapping[transformed.category]) {
    const categoryName = categoryMapping[transformed.category];
    console.log('🔄 Mapping category ID to name:', transformed.category, '→', categoryName);
    transformed.category = categoryName.toLowerCase();
  } else if (transformed.category) {
    console.log('🔍 Category is not an ID or not found in mapping, keeping as is:', transformed.category);
  } else {
    console.log('⚠️ No category found for product:', transformed.name);
  }
  
  console.log('✅ FINAL TRANSFORMED PRODUCT:', {
    name: transformed.name,
    finalCategory: transformed.category
  });
  
  return transformed;
};

// Get all products from Firebase
export const getAllProducts = async () => {
  try {
    console.log('🔥 Fetching products from Firebase (products collection)...');
    
    // Load category mapping
    const categoryMapping = await loadCategoryMapping();
    
    // Use the same collection name as the dashboard
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`📦 Found ${snapshot.size} products in Firebase`);
    
    const products = [];
    for (const doc of snapshot.docs) {
      const productData = { id: doc.id, ...doc.data() };
      console.log('📄 Product data:', productData);
      const transformedProduct = await transformProductWithCategoryMapping(productData, categoryMapping);
      products.push(transformedProduct);
    }
    
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
    
    // Load category mapping
    const categoryMapping = await loadCategoryMapping();
    
    // First try to query by productID field
    const productsRef = collection(db, 'products');
    let q = query(productsRef, where('productID', '==', productId));
    let snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const productData = { id: doc.id, ...doc.data() };
      console.log('✅ Found product by productID:', productData);
      return await transformProductWithCategoryMapping(productData, categoryMapping);
    }
    
    // If not found by productID, try by document ID
    console.log('🔍 Trying to find by document ID...');
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const productData = { id: docSnap.id, ...docSnap.data() };
      console.log('✅ Found product by document ID:', productData);
      return await transformProductWithCategoryMapping(productData, categoryMapping);
    }
    
    console.log('❌ Product not found with ID:', productId);
    throw new Error('Product not found');
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

// Update product color images
export const updateProductColorImages = async (productId, colorImages) => {
  try {
    console.log('🎨 Updating color images for product:', productId);
    
    // First try to find by productID field
    const productsRef = collection(db, 'products');
    let q = query(productsRef, where('productID', '==', productId));
    let snapshot = await getDocs(q);
    
    let docRef;
    if (!snapshot.empty) {
      docRef = doc(db, 'products', snapshot.docs[0].id);
    } else {
      // Try by document ID
      docRef = doc(db, 'products', productId);
    }
    
    await updateDoc(docRef, {
      colorImages: colorImages,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Color images updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating color images:', error);
    throw error;
  }
};

// Add image to specific color
export const addColorImage = async (productId, colorName, imageUrl) => {
  try {
    console.log('📸 Adding image to color:', colorName, 'for product:', productId);
    
    // Get current product data
    const product = await getProductById(productId);
    const colorKey = colorName.toLowerCase().replace(/\s+/g, '');
    
    // Get current color images
    let colorImages = product.colorImages || {};
    
    // Initialize color if it doesn't exist
    if (!colorImages[colorKey]) {
      colorImages[colorKey] = {
        name: colorName,
        images: [],
        price: product.price
      };
    }
    
    // Check if we already have 10 images (max limit)
    if (colorImages[colorKey].images.length >= 10) {
      throw new Error('Maximum 10 images allowed per color');
    }
    
    // Add new image
    colorImages[colorKey].images.push(imageUrl);
    
    // Update in Firebase
    await updateProductColorImages(productId, colorImages);
    
    console.log('✅ Image added successfully');
    return true;
  } catch (error) {
    console.error('❌ Error adding color image:', error);
    throw error;
  }
};

// Remove image from specific color
export const removeColorImage = async (productId, colorName, imageIndex) => {
  try {
    console.log('🗑️ Removing image from color:', colorName, 'at index:', imageIndex);
    
    // Get current product data
    const product = await getProductById(productId);
    const colorKey = colorName.toLowerCase().replace(/\s+/g, '');
    
    // Get current color images
    let colorImages = product.colorImages || {};
    
    if (!colorImages[colorKey] || !colorImages[colorKey].images[imageIndex]) {
      throw new Error('Image not found');
    }
    
    // Remove image
    colorImages[colorKey].images.splice(imageIndex, 1);
    
    // Update in Firebase
    await updateProductColorImages(productId, colorImages);
    
    console.log('✅ Image removed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error removing color image:', error);
    throw error;
  }
};

// Reorder images for a specific color
export const reorderColorImages = async (productId, colorName, newImageOrder) => {
  try {
    console.log('🔄 Reordering images for color:', colorName);
    
    // Get current product data
    const product = await getProductById(productId);
    const colorKey = colorName.toLowerCase().replace(/\s+/g, '');
    
    // Get current color images
    let colorImages = product.colorImages || {};
    
    if (!colorImages[colorKey]) {
      throw new Error('Color not found');
    }
    
    // Update image order
    colorImages[colorKey].images = newImageOrder;
    
    // Update in Firebase
    await updateProductColorImages(productId, colorImages);
    
    console.log('✅ Images reordered successfully');
    return true;
  } catch (error) {
    console.error('❌ Error reordering color images:', error);
    throw error;
  }
};
