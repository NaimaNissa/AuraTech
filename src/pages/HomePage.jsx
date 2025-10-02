import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import bannerImage from '/Banner.png';

export default function HomePage({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const firebaseCategories = getCategoriesData();
        // Filter out "All Products" and map to display format
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
        console.error('Error loading categories:', error);
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

    loadCategories();
  }, []);

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Amazing quality products and fast shipping. Highly recommended!"
    },
    {
      name: "Mike Chen",
      rating: 5,
      comment: "Great customer service and competitive prices. Will shop again!"
    },
    {
      name: "Emily Davis",
      rating: 5,
      comment: "Love the variety of tech products. Found exactly what I needed."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with New Banner */}
      <section className="text-white relative overflow-hidden min-h-screen -mt-16 pt-16">
        {/* Banner Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bannerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#2D3748' // Fallback color
          }}
        >
          {/* Light overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Content - Right Aligned */}
        <div className="relative z-10 flex items-center min-h-screen">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex justify-end">
              <div className="text-right max-w-md lg:max-w-lg xl:max-w-xl pr-8 sm:pr-12 lg:pr-16">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 animate-fade-in leading-tight">
                  <span className="text-white" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8)'}}>AuraTech</span>
                </h1>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 animate-fade-in leading-tight">
                  <span className="text-white" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8)'}}>Expand Your Horizon</span>
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl mb-8 leading-relaxed" style={{color: 'rgba(255, 255, 255, 0.95)', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                  Discover a refined world of curated tech. Find and define your own aura.
                </p>
                <Button 
                  onClick={() => onNavigate('products')}
                  size="lg"
                  className="text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl border border-white/30"
                  style={{background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', backdropFilter: 'blur(15px)'}}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  Discover Excellence
                  <ArrowRight className="ml-2 h-5 w-5" />
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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
                  className="p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105"
                  onClick={() => onNavigate('products')}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4 transition-all duration-300" style={{color: '#D4AF37'}}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count}</p>
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
            <div className="rounded-xl p-8 shadow-sm border" style={{background: 'linear-gradient(135deg, #FEFDF8 0%, #FDF9E8 100%)', borderColor: '#E6D200'}}>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold" style={{color: '#D4AF37'}}>10K+</div>
                    <div className="text-gray-600">Happy Customers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold" style={{color: '#E6D200'}}>1000+</div>
                    <div className="text-gray-600">Products</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold" style={{color: '#B8860B'}}>150+</div>
                    <div className="text-gray-600">Countries</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold" style={{color: '#D4AF37'}}>99%</div>
                    <div className="text-gray-600">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <p className="font-semibold text-gray-900">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-white relative" style={{background: 'linear-gradient(90deg, rgb(121, 130, 1) 0%, rgb(184, 134, 11) 50%, rgb(121, 130, 1) 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Upgrade Your Tech?
          </h2>
          <p className="text-xl mb-8" style={{color: 'rgba(255, 255, 255, 0.95)'}}>
            Join thousands of satisfied customers worldwide
          </p>
          <Button 
            onClick={() => onNavigate('products')}
            size="lg"
            className="text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl border border-white/30"
            style={{background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', backdropFilter: 'blur(10px)'}}
          >
            Begin Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

