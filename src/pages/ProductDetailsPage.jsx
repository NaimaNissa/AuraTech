import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  ShoppingCart,
  Check
} from 'lucide-react';

export default function ProductDetailsPage({ productId, onNavigate }) {
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Sample product data - in real app, this would come from API
  const product = {
    id: productId || '1',
    name: 'AuraTech Premium Wireless Headphones',
    brand: 'AuraTech',
    rating: 4.8,
    reviewCount: 1247,
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    description: 'Experience premium sound quality with our flagship wireless headphones. Featuring advanced noise cancellation, 30-hour battery life, and luxurious comfort.',
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Quick charge (5 min = 3 hours)',
      'Premium leather ear cups',
      'Bluetooth 5.2 connectivity',
      'Voice assistant integration'
    ],
    colors: {
      black: {
        name: 'Midnight Black',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'
        ],
        price: 299.99
      },
      gold: {
        name: 'Champagne Gold',
        images: [
          'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800',
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
          'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800'
        ],
        price: 329.99
      },
      silver: {
        name: 'Platinum Silver',
        images: [
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'
        ],
        price: 319.99
      },
      navy: {
        name: 'Deep Navy',
        images: [
          'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800',
          'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800',
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'
        ],
        price: 309.99
      }
    },
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    shipping: 'Free shipping on orders over $50',
    warranty: '2-year manufacturer warranty',
    returnPolicy: '30-day return policy'
  };

  const currentColorData = product.colors[selectedColor];
  const currentPrice = currentColorData.price;

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedImageIndex(0); // Reset to first image when color changes
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', {
      productId: product.id,
      color: selectedColor,
      size: selectedSize,
      quantity
    });
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={currentColorData.images[selectedImageIndex]}
                alt={`${product.name} - ${currentColorData.name}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {currentColorData.images.map((image, index) => (
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
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  {product.brand}
                </Badge>
                {product.discount > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    {product.discount}% OFF
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Color: {currentColorData.name}
              </h3>
              <div className="flex space-x-3">
                {Object.entries(product.colors).map(([colorKey, colorData]) => (
                  <button
                    key={colorKey}
                    onClick={() => handleColorChange(colorKey)}
                    className={`relative p-1 rounded-full border-2 transition-all ${
                      selectedColor === colorKey
                        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        backgroundColor: colorKey === 'black' ? '#000000' :
                                        colorKey === 'gold' ? '#D4AF37' :
                                        colorKey === 'silver' ? '#C0C0C0' :
                                        '#1E3A8A'
                      }}
                    />
                    {selectedColor === colorKey && (
                      <Check className="absolute -top-1 -right-1 h-4 w-4 text-white bg-gray-900 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
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

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 border border-gray-200 rounded-lg min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-lg font-semibold"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart - ${(currentPrice * quantity).toFixed(2)}
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipping & Warranty */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="h-4 w-4" />
                <span>{product.shipping}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>{product.warranty}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <RotateCcw className="h-4 w-4" />
                <span>{product.returnPolicy}</span>
              </div>
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
        </div>
      </div>
    </div>
  );
}
