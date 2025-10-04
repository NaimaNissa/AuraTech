import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import SignInPrompt from '@/components/SignInPrompt';
import ImageZoomModal from '@/components/ImageZoomModal';
import { getProductById } from '@/lib/productService';
import { getProductReviews, createReview, calculateProductRating, canCustomerReviewProduct } from '@/lib/reviewService';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  Share2, 
  Plus,
  Minus,
  ShoppingCart,
  Check,
  Loader2
} from 'lucide-react';

export default function ProductDetailsPage({ productId, onNavigate }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Review system state
  const [reviews, setReviews] = useState([]);
  const [productRating, setProductRating] = useState({ averageRating: 0, totalReviews: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [canReview, setCanReview] = useState({ canReview: false, reason: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  const { addItem } = useCart();
  const { currentUser } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [signInAction, setSignInAction] = useState('cart');
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);

  // Fetch product data from Firebase
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('No product ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching product details for ID:', productId);
        const productData = await getProductById(productId);
        console.log('✅ Product data loaded:', productData);
        
        setProduct(productData);
        
        // Set default color if colors are available
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        
        // Load reviews and rating
        await loadProductReviews(productId);
        
        // Check if current user can review this product
        if (currentUser?.email) {
          const reviewEligibility = await canCustomerReviewProduct(currentUser.email, productId);
          setCanReview(reviewEligibility);
        }
        
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, currentUser]);

  // Load product reviews
  const loadProductReviews = async (productId) => {
    try {
      setIsLoadingReviews(true);
      console.log('🔄 Loading reviews for product ID:', productId);
      console.log('🔄 Product ID type:', typeof productId);
      console.log('🔄 Product ID value:', productId);
      
      const [reviewsData, ratingData] = await Promise.all([
        getProductReviews(productId),
        calculateProductRating(productId)
      ]);
      
      console.log('📊 Reviews data received:', reviewsData);
      console.log('📊 Rating data received:', ratingData);
      console.log('📊 Reviews count:', reviewsData.length);
      console.log('📊 Average rating:', ratingData.averageRating);
      
      setReviews(reviewsData);
      setProductRating(ratingData);
      console.log('✅ Reviews loaded successfully:', reviewsData.length, 'reviews, Rating:', ratingData.averageRating);
    } catch (error) {
      console.error('❌ Error loading reviews:', error);
      console.error('❌ Error stack:', error.stack);
      // Set empty state on error
      setReviews([]);
      setProductRating({ averageRating: 0, totalReviews: 0 });
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!currentUser?.email || !product) return;
    
    try {
      setIsSubmittingReview(true);
      
      const reviewData = {
        productId: product.id,
        productName: product.name,
        customerName: currentUser.displayName || currentUser.email.split('@')[0],
        customerEmail: currentUser.email,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      };
      
      const newReview = await createReview(reviewData);
      
      // Add the new review to the local state immediately
      setReviews(prevReviews => [newReview, ...prevReviews]);
      
      // Update the product rating immediately
      const newTotalReviews = reviews.length + 1;
      const newAverageRating = ((productRating.averageRating * reviews.length) + reviewForm.rating) / newTotalReviews;
      setProductRating({
        averageRating: newAverageRating,
        totalReviews: newTotalReviews
      });
      
      // Reload reviews to ensure consistency (in case of any issues)
      await loadProductReviews(product.id);
      
      // Reset form and hide it
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      
      // Update review eligibility
      const reviewEligibility = await canCustomerReviewProduct(currentUser.email, product.id);
      setCanReview(reviewEligibility);
      
      console.log('✅ Review submitted successfully');
    } catch (error) {
      console.error('❌ Error submitting review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Get color data from product's colorImages field
  const getColorData = () => {
    if (!product) {
      return {
        default: {
          name: 'Default',
          images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
          price: 0
        }
      };
    }

    // Use the colorImages from the product data if available
    if (product.colorImages && Object.keys(product.colorImages).length > 0) {
      console.log('🎨 Using colorImages from product data:', product.colorImages);
      return product.colorImages;
    }

    // Fallback: create default color data from colors array
    if (!product.colors || product.colors.length === 0) {
      console.log('🎨 No colors found, using default');
      return {
        default: {
          name: 'Default',
          images: [product.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
          price: product.price || 0
        }
      };
    }

    console.log('🎨 Creating fallback color data from colors array:', product.colors);
    const colorData = {};
    product.colors.forEach((color) => {
      const colorKey = color.toLowerCase().replace(/\s+/g, '');
      const baseImage = product.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop';
      
      colorData[colorKey] = {
        name: color,
        images: [baseImage], // Start with single image, can be expanded in dashboard
        price: product.price || 0
      };
    });
    
    return colorData;
  };

  const colorData = getColorData();
  const currentColorKey = selectedColor ? selectedColor.toLowerCase().replace(/\s+/g, '') : Object.keys(colorData)[0];
  const currentColorData = colorData[currentColorKey] || colorData[Object.keys(colorData)[0]];
  const currentPrice = currentColorData?.price || product?.price || 0;

  const getCurrentImages = () => {
    if (!product) return [];
    
    // Get images for the selected color
    const colorData = getColorData();
    const currentColorKey = selectedColor ? selectedColor.toLowerCase().replace(/\s+/g, '') : Object.keys(colorData)[0];
    const currentColorData = colorData[currentColorKey];
    
    console.log('🖼️ Getting current images:', {
      selectedColor,
      currentColorKey,
      currentColorData,
      availableColors: Object.keys(colorData)
    });
    
    if (currentColorData && currentColorData.images && currentColorData.images.length > 0) {
      console.log('✅ Found images for color:', currentColorData.images.length, 'images');
      return currentColorData.images;
    }
    
    // Fallback to product images or default
    const fallbackImages = product.images || [product.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'];
    console.log('⚠️ Using fallback images:', fallbackImages.length, 'images');
    return fallbackImages;
  };

  // Handle color change with image reset
  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedImageIndex(0); // Reset to first image when color changes
    console.log('🎨 Color changed to:', color);
  };

  const handleImageClick = (index) => {
    setZoomImageIndex(index);
    setShowZoomModal(true);
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => {
      const newQuantity = prev + change;
      const maxQuantity = product?.quantity || 999;
      return Math.max(1, Math.min(newQuantity, maxQuantity));
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.image,
      brand: product.brand,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity
    };
    
    const success = addItem(cartItem, () => {
      setSignInAction('cart');
      setShowSignInPrompt(true);
    });
    
    if (success) {
      console.log('✅ Added to cart:', cartItem);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (!currentUser) {
      setSignInAction('wishlist');
      setShowSignInPrompt(true);
      return;
    }

    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.image,
      brand: product.brand
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(wishlistItem);
    }
  };

  const handleShare = () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: `Check out this ${product.name} from AuraTech!`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Product link copied to clipboard!');
      }).catch(() => {
        // Final fallback: show URL
        prompt('Copy this link to share:', window.location.href);
      });
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (!currentUser) {
      setSignInAction('cart');
      setShowSignInPrompt(true);
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.image,
      brand: product.brand,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity
    };
    
    const success = addItem(cartItem, () => {
      setSignInAction('cart');
      setShowSignInPrompt(true);
    });
    
    if (success) {
      // Navigate directly to cart
      onNavigate('cart');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => onNavigate('products')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-gray-600 mb-4">Product not found</p>
          <Button onClick={() => onNavigate('products')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button 
              onClick={() => onNavigate('products')}
              className="hover:text-gray-900 transition-colors"
            >
              Products
            </button>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in"
              onClick={() => handleImageClick(selectedImageIndex)}
            >
              <img
                src={getCurrentImages()[selectedImageIndex]}
                alt={`${product.name} - ${selectedColor || 'default'}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {getCurrentImages().map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index 
                      ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            
            {/* Image Counter and Color Info */}
            <div className="text-center space-y-1">
              <div className="text-sm text-gray-600">
                {selectedImageIndex + 1} of {getCurrentImages().length} images
              </div>
              {selectedColor && (
                <div className="text-xs text-gray-500">
                  Color: {selectedColor}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  {product.brand}
                </Badge>
                <Badge variant="outline" className="border-blue-200 text-blue-800 bg-blue-50">
                  {product.category || 'Uncategorized'}
                </Badge>
                {product.discount > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    {product.discount}% OFF
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  ${currentPrice}
                </span>
                {product.originalPrice > currentPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Price varies by color selection
              </p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Color: {selectedColor || 'Default'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => {
                    const colorKey = color.toLowerCase().replace(/\s+/g, '');
                    const colorDataForColor = colorData[colorKey];
                    const imageCount = colorDataForColor?.images?.length || 0;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleColorChange(color)}
                        className={`relative px-4 py-2 border rounded-lg font-medium transition-all ${
                          selectedColor === color
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{color}</span>
                          {imageCount > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              selectedColor === color
                                ? 'bg-white bg-opacity-20 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {imageCount} image{imageCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {selectedColor === color && (
                          <Check className="absolute -top-1 -right-1 h-4 w-4 text-white bg-gray-900 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection - Only show if sizes are available */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Size: {selectedSize}
                </h3>
                <div className="flex space-x-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Quantity {product.quantity > 0 && `(${product.quantity} available)`}
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 border border-gray-200 rounded-lg min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.quantity}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {!product.inStock && (
                <p className="text-sm text-red-600">Out of stock</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.inStock 
                    ? `Add to Cart - $${(currentPrice * quantity).toFixed(2)}`
                    : 'Out of Stock'
                  }
                </Button>
                
                <Button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now - ${(currentPrice * quantity).toFixed(2)}
                </Button>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className={`flex-1 border-gray-200 hover:bg-gray-50 ${
                    isInWishlist(product.id) ? 'bg-red-50 border-red-200 text-red-600' : ''
                  }`}
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  {isInWishlist(product.id) ? 'In Wishlist' : 'Wishlist'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {product.features.length} feature{product.features.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
              {product.features.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No features listed for this product.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Product Description */}
        <div className="mt-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Product Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Customer Reviews
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => loadProductReviews(product.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={isLoadingReviews}
                  >
                    <Loader2 className={`h-4 w-4 ${isLoadingReviews ? 'animate-spin' : ''}`} />
                    {isLoadingReviews ? 'Loading...' : 'Refresh'}
                  </Button>
                  {currentUser && canReview.canReview && (
                    <Button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      variant="outline"
                    >
                      Write a Review
                    </Button>
                  )}
                </div>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(productRating.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">
                  {productRating.averageRating.toFixed(1)}
                </span>
                <span className="text-gray-600">
                  ({productRating.totalReviews} review{productRating.totalReviews !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
                    
                    {/* Star Rating */}
                    <div className="mb-4">
                      <Label className="block mb-2">Rating</Label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className="p-1"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewForm.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                      <Label htmlFor="review-comment">Your Review</Label>
                      <Textarea
                        id="review-comment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview}
                        className="flex-1"
                      >
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Review'
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowReviewForm(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review Eligibility Message */}
              {currentUser && !canReview.canReview && (
                <Alert className="mb-6">
                  <AlertDescription>
                    {canReview.reason}
                  </AlertDescription>
                </Alert>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {isLoadingReviews ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      No reviews yet. Be the first to review this product!
                    </p>
                    {currentUser && canReview.canReview && (
                      <Button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Write the First Review
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 mb-4">
                      Showing {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </div>
                    {reviews.map((review) => (
                      <Card key={review.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-semibold text-gray-900">{review.customerName}</span>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    ✓ Verified Purchase
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {new Date(review.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {review.comment && (
                            <div className="mt-3">
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>
                          )}
                          
                          {review.helpful > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-500">
                                👍 {review.helpful} people found this helpful
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Sign In Prompt */}
      <SignInPrompt
        isOpen={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
        onNavigate={onNavigate}
        action={signInAction}
      />
      
      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        images={getCurrentImages()}
        currentIndex={zoomImageIndex}
        onIndexChange={setZoomImageIndex}
      />
    </div>
  );
}
