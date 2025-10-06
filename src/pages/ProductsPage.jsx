import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import SignInPrompt from '../components/SignInPrompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Heart,
  Grid3X3,
  List,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import { 
  getProducts, 
  getCategoriesData, 
  getBrandsData, 
  priceRanges, 
  initializeProducts 
} from '../data/products';
import { getActiveCategories } from '@/lib/categoryService';

export default function ProductsPage({ searchQuery = '', selectedCategory: initialCategory = '', onNavigate }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const { addItem } = useCart();
  const { currentUser } = useAuth();

  // Initialize products from Firebase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load products and brands from existing system
        const { products: firebaseProducts, brands: firebaseBrands } = await initializeProducts();
        console.log('✅ Loaded products from Firebase:', firebaseProducts.length);
        console.log('🔍 Sample products with categories:', firebaseProducts.slice(0, 3).map(p => ({
          name: p.name,
          category: p.category,
          categoryType: typeof p.category,
          rawData: p.rawData?.category || p.rawData?.Catergory
        })));
        setProducts(firebaseProducts);
        setBrands(firebaseBrands);
        setFilteredProducts(firebaseProducts);
        
        // Load categories from database
        try {
          console.log('📁 Loading categories for product filtering...');
          const categoriesData = await getActiveCategories();
          if (categoriesData && categoriesData.length > 0) {
            console.log('✅ Loaded categories from database:', categoriesData);
            console.log('🔍 Sample category data:', categoriesData[0]);
            console.log('🔍 All category IDs:', categoriesData.map(cat => cat.id));
            console.log('🔍 All category names:', categoriesData.map(cat => cat.name));
            
            // Create a mapping of category IDs to names for reference
            const categoryIdToName = {};
            categoriesData.forEach(cat => {
              categoryIdToName[cat.id] = cat.name;
            });
            console.log('🗺️ Category ID to Name mapping:', categoryIdToName);
            
            // Map database categories to display format and calculate counts
            const displayCategories = categoriesData.map(cat => {
              const count = firebaseProducts.filter(product => {
                const productCategory = product.category?.toLowerCase();
                const categoryId = cat.id?.toLowerCase();
                const categoryName = cat.name?.toLowerCase();
                const rawCategory = product.rawData?.category || product.rawData?.Catergory;
                
                console.log('🔍 COUNTING - Product:', product.name, 'Category:', productCategory, 'Raw:', rawCategory, 'Against ID:', categoryId, 'Name:', categoryName);
                
                // Check if product category matches category ID or name (same logic as filtering)
                const matches = productCategory === categoryId || 
                       productCategory === categoryName ||
                       (rawCategory && (rawCategory.toLowerCase() === categoryId || rawCategory.toLowerCase() === categoryName)) ||
                       (productCategory && categoryName && productCategory.includes(categoryName));
                
                if (matches) {
                  console.log('✅ COUNTING MATCH:', product.name, '→', cat.name);
                }
                
                return matches;
              }).length;
              
              console.log('📊 Category count for', cat.name, ':', count);
              
              return {
                id: cat.id,
                name: cat.name,
                count: count
              };
            });
            
            // Add "All Products" option
            const allCategories = [
              { id: "all", name: "All Products", count: firebaseProducts.length },
              ...displayCategories.filter(cat => cat.count > 0) // Only show categories with products
            ];
            
            console.log('✅ Processed categories:', allCategories);
            console.log('🔍 Sample products with categories:', firebaseProducts.slice(0, 3).map(p => ({ name: p.name, category: p.category })));
            console.log('🔍 ALL PRODUCTS WITH CATEGORIES:', firebaseProducts.map(p => ({ name: p.name, category: p.category, type: typeof p.category })));
            setCategories(allCategories);
          } else {
            console.log('⚠️ No categories found, using fallback');
            // Fallback to static categories
            const { categories: firebaseCategories } = await initializeProducts();
            setCategories(firebaseCategories);
          }
        } catch (categoryError) {
          console.log('⚠️ Category loading failed, using fallback:', categoryError.message);
          // Fallback to static categories
          const { categories: firebaseCategories } = await initializeProducts();
          setCategories(firebaseCategories);
        }
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (initialCategory) {
      console.log('🏠 Homepage navigation - Setting selected category:', initialCategory);
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    console.log('🔄 FILTERING EFFECT TRIGGERED:', {
      selectedCategory,
      productsCount: products.length,
      categoriesCount: categories.length,
      localSearchQuery
    });
    
    // Don't filter if categories aren't loaded yet
    if (categories.length === 0 && selectedCategory !== 'all') {
      console.log('⏳ Waiting for categories to load before filtering...');
      setFilteredProducts([]);
      return;
    }
    
    let filtered = [...products];

    // Filter by search query
    if (localSearchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(localSearchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      console.log('🔍 Filtering by category:', selectedCategory);
      console.log('🔍 Available products:', products.length);
      console.log('🔍 Available categories:', categories);
      console.log('🔍 Selected category data:', categories.find(cat => cat.id === selectedCategory));
      
      // EMERGENCY DEBUG: Show all products and their categories
      console.log('🚨 EMERGENCY DEBUG - ALL PRODUCTS WITH CATEGORIES:');
      products.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          name: product.name,
          category: product.category,
          categoryType: typeof product.category,
          categoryLength: product.category?.length,
          rawCategory: product.rawData?.category || product.rawData?.Catergory,
          allFields: Object.keys(product).filter(key => key.toLowerCase().includes('categor'))
        });
      });
      
      console.log('🔍 SELECTED CATEGORY DEBUG:', {
        selectedCategory,
        selectedCategoryType: typeof selectedCategory,
        selectedCategoryLength: selectedCategory?.length,
        categoriesAvailable: categories.map(cat => ({ id: cat.id, name: cat.name }))
      });
      
      filtered = filtered.filter(product => {
        const productCategory = product.category?.toLowerCase();
        const selectedCategoryLower = selectedCategory.toLowerCase();
        
        console.log('🔍 FILTERING - Product:', product.name, 'Category:', productCategory, 'Type:', typeof productCategory, 'Selected:', selectedCategoryLower);
        
        // Get the selected category data
        const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
        if (!selectedCategoryData) {
          console.log('❌ Selected category data not found:', selectedCategory);
          console.log('🔍 Available categories:', categories.map(cat => ({ id: cat.id, name: cat.name })));
          return false;
        }
        
        const categoryId = selectedCategoryData.id?.toLowerCase();
        const categoryName = selectedCategoryData.name?.toLowerCase();
        
        console.log('🔍 FILTERING - Checking against:', { categoryId, categoryName, productCategory });
        
        // Try multiple matching strategies
        let matches = false;
        
        // Strategy 1: Direct category match (most common case)
        if (productCategory === categoryId || productCategory === categoryName) {
          matches = true;
          console.log('✅ Strategy 1 - Direct match:', product.name);
        }
        
        // Strategy 2: Check raw data fields (for products with category IDs)
        if (!matches) {
          const rawCategory = product.rawData?.category || product.rawData?.Catergory;
          if (rawCategory) {
            const rawCategoryLower = rawCategory.toLowerCase();
            if (rawCategoryLower === categoryId || rawCategoryLower === categoryName) {
              matches = true;
              console.log('✅ Strategy 2 - Raw data match:', product.name, 'Raw category:', rawCategory);
            }
          }
        }
        
        // Strategy 3: Check if product category is the selected category ID (case insensitive)
        if (!matches && productCategory === selectedCategoryLower) {
          matches = true;
          console.log('✅ Strategy 3 - Selected category ID match:', product.name);
        }
        
        // Strategy 4: Check if raw category matches selected category ID (case insensitive)
        if (!matches) {
          const rawCategory = product.rawData?.category || product.rawData?.Catergory;
          if (rawCategory && rawCategory.toLowerCase() === selectedCategoryLower) {
            matches = true;
            console.log('✅ Strategy 4 - Raw category ID match:', product.name, 'Raw category:', rawCategory);
          }
        }
        
        // Strategy 5: Partial match (last resort)
        if (!matches && productCategory && categoryName && productCategory.includes(categoryName)) {
          matches = true;
          console.log('✅ Strategy 5 - Partial match:', product.name);
        }
        
        if (matches) {
          console.log('✅ FILTERING MATCH:', product.name, 'Category:', productCategory, 'Matches:', { categoryId, categoryName });
          return true;
        }
        
        console.log('❌ No category match for:', product.name);
        return false;
      });
      console.log('🔍 Filtered products count:', filtered.length);
      console.log('🔍 Filtered products:', filtered.map(p => ({ name: p.name, category: p.category })));
      console.log('🔍 FILTERING COMPLETE - Original count:', products.length, 'Filtered count:', filtered.length);
      
      // If no products found, log detailed debugging info and show all products temporarily for debugging
      if (filtered.length === 0 && selectedCategory !== 'all') {
        console.log('❌ NO PRODUCTS FOUND for category:', selectedCategory);
        console.log('🔍 Available categories:', categories.map(cat => ({ id: cat.id, name: cat.name })));
        console.log('🔍 All products with categories:', products.map(p => ({ 
          name: p.name, 
          category: p.category, 
          rawCategory: p.rawData?.category || p.rawData?.Catergory 
        })));
        console.log('🔍 Selected category data:', categories.find(cat => cat.id === selectedCategory));
        
        // No products found for this category - this is expected behavior
        console.log('ℹ️ No products found for category:', selectedCategory);
      }
    }

    // Filter by brand
    if (selectedBrand !== 'All Brands') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // Filter by price range
    if (selectedPriceRange !== 'all') {
      const priceRange = priceRanges.find(range => range.id === selectedPriceRange);
      if (priceRange) {
        filtered = filtered.filter(product => 
          product.price >= priceRange.min && product.price <= priceRange.max
        );
      }
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, categories, localSearchQuery, selectedCategory, selectedBrand, selectedPriceRange, sortBy]);

  const handleAddToCart = (product) => {
    const success = addItem(product, () => {
      setShowSignInPrompt(true);
    });
    
    if (success) {
      console.log('✅ Added to cart:', product);
    }
  };

  const handleBuyNow = (product) => {
    // Navigate to product details page first
    onNavigate('product-details', product.id);
  };

  const ProductCard = ({ product }) => (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => {
        if (onNavigate) {
          // Navigate to product details with product ID
          onNavigate('product-details', product.id);
        }
      }}
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!product.inStock && (
          <Badge className="absolute top-2 left-2 bg-red-500">Out of Stock</Badge>
        )}
        {product.originalPrice > product.price && (
          <Badge className="absolute top-2 right-2 bg-green-500">
            Save ${product.originalPrice - product.price}
          </Badge>
        )}
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>
      </div>
      <CardContent className="p-3 sm:p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-2">{product.brand}</p>
        </div>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium">{product.rating}</span>
            <span className="ml-1 text-sm text-gray-500">({product.reviews})</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-blue-600">${product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>

        <div className="space-y-2">
        <Button 
          onClick={() => handleAddToCart(product)}
          disabled={!product.inStock}
          className="w-full"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
          
          <Button 
            onClick={() => handleBuyNow(product)}
            disabled={!product.inStock}
            className="w-full bg-green-600 hover:bg-green-700"
            size="sm"
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ProductListItem = ({ product }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-48 h-48">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded"
            />
            {!product.inStock && (
              <Badge className="absolute top-2 left-2 bg-red-500">Out of Stock</Badge>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.brand}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
              </button>
            </div>
            
            <div className="flex items-center mb-3">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 font-medium">{product.rating}</span>
              <span className="ml-1 text-gray-500">({product.reviews} reviews)</span>
            </div>

            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {product.features.map((feature, index) => (
                <Badge key={index} variant="secondary">{feature}</Badge>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
                )}
              </div>
              
              <div className="flex space-x-2">
              <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                disabled={!product.inStock}
                  className="flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
                
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyNow(product);
                  }}
                  disabled={!product.inStock}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Brand Filter */}
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.id} value={range.id}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Indicator */}
          {selectedCategory !== 'all' && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Filtering by category:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear filter
                </Button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
              {selectedCategory !== 'all' && (
                <span className="ml-2 text-blue-600">
                  in {categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}
                </span>
              )}
            </p>
          </div>
        </div>


        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No products found</p>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredProducts.map((product) => 
              viewMode === 'grid' ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <ProductListItem key={product.id} product={product} />
              )
            )}
          </div>
        )}
      </div>
      
      {/* Sign In Prompt */}
      <SignInPrompt
        isOpen={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
        onNavigate={onNavigate}
        action="cart"
      />
    </div>
  );
}

