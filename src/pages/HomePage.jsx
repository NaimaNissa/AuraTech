import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch, 
  Camera, 
  Gamepad2,
  Tablet,
  Truck,
  Shield,
  CreditCard,
  ArrowRight,
  Star,
  Loader2
} from 'lucide-react';
import { getCategoriesData } from '../data/products';
import { getLatestReviews } from '../lib/reviewService';
import { getCategoriesWithProductCounts } from '../lib/categoryService';

export default function HomePage({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const features = [
    {
      icon: <Truck className="h-8 w-8" style={{color: '#D4AF37'}} />,
      title: "Free Worldwide Shipping",
      description: "Free shipping on orders over $50"
    },
    {
      icon: <Shield className="h-8 w-8" style={{color: '#E6D200'}} />,
      title: "Secure Payment",
      description: "100% secure payment processing"
    },
    {
      icon: <CreditCard className="h-8 w-8" style={{color: '#B8860B'}} />,
      title: "Easy Returns",
      description: "30-day return policy"
    }
  ];

  // Icon mapping for categories
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'smartphones': <Smartphone className="h-12 w-12" />,
      'phone': <Smartphone className="h-12 w-12" />,
      'laptops': <Laptop className="h-12 w-12" />,
      'audio': <Headphones className="h-12 w-12" />,
      'wearables': <Watch className="h-12 w-12" />,
      'cameras': <Camera className="h-12 w-12" />,
      'camera': <Camera className="h-12 w-12" />,
      'tablets': <Tablet className="h-12 w-12" />,
      'gaming': <Gamepad2 className="h-12 w-12" />
    };
    return iconMap[categoryName.toLowerCase()] || <Smartphone className="h-12 w-12" />;
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        console.log('📁 Loading categories from database...');
        
        // Try to load from database first
        try {
          const categoriesData = await getCategoriesWithProductCounts();
          if (categoriesData && categoriesData.length > 0) {
            console.log('✅ Loaded categories from database:', categoriesData);
            console.log('🔍 Homepage category IDs:', categoriesData.map(cat => cat.id));
            console.log('🔍 Homepage category names:', categoriesData.map(cat => cat.name));
            // Map database categories to display format
            const displayCategories = categoriesData.map(cat => ({
              icon: cat.icon || getCategoryIcon(cat.name.toLowerCase()),
              name: cat.name,
              count: `${cat.count || 0}+ Products`,
              id: cat.id
            }));
            console.log('📁 Mapped display categories:', displayCategories);
            setCategories(displayCategories);
            return;
          }
        } catch (dbError) {
          console.log('⚠️ Database categories failed, using fallback:', dbError.message);
        }
        
        // Fallback to static categories
        console.log('📁 Using fallback static categories...');
        const firebaseCategories = getCategoriesData();
        const displayCategories = firebaseCategories
          .filter(cat => cat.id !== 'all')
          .map(cat => ({
            icon: getCategoryIcon(cat.id),
            name: cat.name,
            count: `${cat.count}+ Products`,
            id: cat.id
          }));
        setCategories(displayCategories);
      } catch (error) {
        console.error('❌ Error loading categories:', error);
        // Fallback to default categories
        setCategories([
          { icon: <Smartphone className="h-12 w-12" />, name: "Smartphones", count: "150+ Products" },
          { icon: <Tablet className="h-12 w-12" />, name: "Tablets", count: "80+ Products" },
          { icon: <Camera className="h-12 w-12" />, name: "Cameras", count: "90+ Products" },
          { icon: <Laptop className="h-12 w-12" />, name: "Laptops", count: "80+ Products" },
          { icon: <Headphones className="h-12 w-12" />, name: "Audio", count: "200+ Products" },
          { icon: <Gamepad2 className="h-12 w-12" />, name: "Gaming", count: "300+ Products" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const latestReviews = await getLatestReviews(5);
        setReviews(latestReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
        // Fallback to default testimonials if no reviews found
        setReviews([
          {
            customerName: "Sarah Johnson",
            rating: 5,
            comment: "Amazing quality products and fast shipping. Highly recommended!",
            productName: "Premium Tech"
          },
          {
            customerName: "Mike Chen",
            rating: 5,
            comment: "Great customer service and competitive prices. Will shop again!",
            productName: "Smart Devices"
          },
          {
            customerName: "Emily Davis",
            rating: 5,
            comment: "Love the variety of tech products. Found exactly what I needed.",
            productName: "Tech Accessories"
          }
        ]);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadCategories();
    loadReviews();
  }, []);

  // Use real reviews from database, fallback to testimonials if none available
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      customerName: "Sarah Johnson",
      rating: 5,
      comment: "Amazing quality products and fast shipping. Highly recommended!",
      productName: "Premium Tech"
    },
    {
      customerName: "Mike Chen",
      rating: 5,
      comment: "Great customer service and competitive prices. Will shop again!",
      productName: "Smart Devices"
    },
    {
      customerName: "Emily Davis",
      rating: 5,
      comment: "Love the variety of tech products. Found exactly what I needed.",
      productName: "Tech Accessories"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with New Banner */}
      <section className="hero-banner text-white relative overflow-hidden -mt-16 pt-16" style={{minHeight: '100vh'}}>
        {/* Banner Background */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/Banner.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundColor: '#2D5016', // Fallback forest green
            backgroundBlendMode: 'normal'
          }}
        >
          {/* Responsive overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30 sm:bg-black/25 md:bg-black/20"></div>
        </div>
        
        {/* Content - Responsive Layout */}
        <div className="hero-content relative z-10 flex items-center justify-center md:justify-end" style={{minHeight: '100vh'}}>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
            {/* Mobile: Center aligned, Desktop: Right aligned */}
            <div className="flex justify-center md:justify-end">
              <div className="text-center md:text-right w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-3 md:mb-4 animate-fade-in leading-tight">
                  <span className="text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>AuraTech</span>
                </h1>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 animate-fade-in leading-tight">
                  <span className="text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>Expand Your Horizon</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2 sm:px-0" style={{color: 'rgba(255, 255, 255, 0.95)', textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>
                  Discover a refined world of curated tech. Find and define your own aura.
                </p>
                <Button 
                  onClick={() => onNavigate('products')}
                  size="lg"
                  className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl border border-white/30 w-full sm:w-auto"
                  style={{background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', backdropFilter: 'blur(15px)'}}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  Discover Excellence
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of technology products across different categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-6 text-center">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <Loader2 className="h-12 w-12 animate-spin" style={{color: '#D4AF37'}} />
                    </div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              categories.map((category, index) => (
                <Card 
                  key={index} 
                  className="p-3 sm:p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105"
                  onClick={() => onNavigate('products', category.id)}
                >
                  <CardContent className="pt-3 sm:pt-4 md:pt-6">
                    <div className="flex justify-center mb-2 sm:mb-3 md:mb-4 transition-all duration-300" style={{color: '#D4AF37'}}>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                        {category.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{category.count}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-16" style={{background: 'linear-gradient(180deg, #FFFFFF 0%, #FEFDF8 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About <span style={{color: '#fdfceeff'}}>Aura</span><span style={{color: '#fcfbf9ff'}}>Tech</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                AuraTech is your premier destination for cutting-edge technology products. 
                We curate the finest tech innovations with an aura of excellence, 
                bringing you premium quality at competitive prices.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our mission is to make advanced technology accessible to everyone, 
                everywhere. From smartphones to smart homes, we've got you covered.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full" style={{background: 'linear-gradient(45deg, #E6D200 0%, #D4AF37 100)'}}></div>
                  <span className="text-gray-700">Global shipping to 150+ countries</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full" style={{background: 'linear-gradient(45deg, #E6D200 0%, #D4AF37 100)'}}></div>
                  <span className="text-gray-700">24/7 customer support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full" style={{background: 'linear-gradient(45deg, #E6D200 0%, #D4AF37 100)'}}></div>
                  <span className="text-gray-700">Quality guarantee on all products</span>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* Laptop Image with Website Preview */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                {/* Laptop Frame */}
                <div className="relative bg-gray-800 rounded-t-lg p-4">
                  <div className="bg-gray-700 rounded-sm h-2 w-16 mx-auto mb-2"></div>
                  <div className="bg-gray-700 rounded-sm h-1 w-8 mx-auto"></div>
                </div>
                
                {/* Laptop Screen */}
                <div className="relative bg-white rounded-b-lg overflow-hidden" style={{aspectRatio: '16/10'}}>
                  {/* Website Preview */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100">
                    {/* Browser Header */}
                    <div className="bg-gray-200 h-8 flex items-center px-3 space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="bg-white rounded px-2 py-1 text-xs text-gray-600 ml-4 flex-1 text-center">
                        auratech.com
                      </div>
                    </div>
                    
                    {/* Website Content Preview */}
                    <div className="p-4 space-y-3">
                      {/* Header */}
                      <div className="h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded"></div>
                      
                      {/* Navigation */}
                      <div className="flex space-x-2">
                        <div className="h-2 bg-gray-300 rounded w-16"></div>
                        <div className="h-2 bg-gray-300 rounded w-20"></div>
                        <div className="h-2 bg-gray-300 rounded w-14"></div>
                        <div className="h-2 bg-gray-300 rounded w-18"></div>
                      </div>
                      
                      {/* Hero Section */}
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-400 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-400 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                      </div>
                      
                      {/* Product Cards */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded p-2 shadow-sm">
                          <div className="h-8 bg-gray-200 rounded mb-1"></div>
                          <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                        </div>
                        <div className="bg-white rounded p-2 shadow-sm">
                          <div className="h-8 bg-gray-200 rounded mb-1"></div>
                          <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Glare Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent pointer-events-none"></div>
                </div>
                
                {/* Laptop Base */}
                <div className="bg-gray-800 h-2 rounded-b-lg"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-white text-sm">✨</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white text-xs">💻</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Don't just take our word for it
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviewsLoading ? (
              // Loading skeleton for reviews
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="p-6">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              displayReviews.map((review, index) => (
              <Card key={index} className="p-4 sm:p-6">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex mb-3 sm:mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 italic">"{review.comment}"</p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">- {review.customerName}</p>
                      {review.productName && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded self-start sm:self-auto">
                          {review.productName}
                        </span>
                      )}
                    </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 text-white relative" style={{background: 'linear-gradient(90deg, rgb(121, 130, 1) 0%, rgb(184, 134, 11) 50%, rgb(121, 130, 1) 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Ready to Upgrade Your Tech?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8" style={{color: 'rgba(255, 255, 255, 0.95)'}}>
            Join thousands of satisfied customers worldwide
          </p>
          <Button 
            onClick={() => onNavigate('products')}
            size="lg"
            className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl border border-white/30 w-full sm:w-auto"
            style={{background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', backdropFilter: 'blur(10px)'}}
          >
            Begin Your Journey
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

