import { useState, useEffect, useRef } from 'react';
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
import TypewriterText from '../components/TypewriterText';

export default function HomePage({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const videoRef = useRef(null);

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
        // No demo reviews - just set empty array if error occurs
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadCategories();
    loadReviews();

    // Ensure video always loops and plays
    const setupVideo = () => {
      const videoElement = document.getElementById('about-video');
      if (videoElement) {
        videoElement.loop = true;
        videoElement.muted = true; // Ensure muted for autoplay
        
        // Debug: Log all video events
        videoElement.addEventListener('loadstart', () => {
          console.log('🔄 Video load started');
        });
        
        videoElement.addEventListener('loadeddata', () => {
          console.log('✅ Video data loaded');
          // Force play after data is loaded
          videoElement.play().catch(err => {
            console.error('Play error:', err);
          });
        });
        
        videoElement.addEventListener('canplay', () => {
          // Ensure video plays when it can
          videoElement.play().catch(() => {});
        });
        
        videoElement.addEventListener('error', (e) => {
          console.error('❌ Video error:', e);
          console.error('Error code:', videoElement.error?.code);
          console.error('Error message:', videoElement.error?.message);
          console.error('Current sources:', Array.from(videoElement.querySelectorAll('source')).map(s => s.src));
          console.error('💡 Make sure Vid12.mp4 is in the public folder!');
        });
        
        videoElement.addEventListener('ended', () => {
          videoElement.currentTime = 0;
          videoElement.play();
        });
        
        // Try to play immediately
        videoElement.play().catch(err => {
          console.log('Initial play failed (may need user interaction):', err);
        });
      }
    };

    // Setup video after a short delay to ensure DOM is ready
    const timer = setTimeout(setupVideo, 100);
    
    // Also use ref to ensure video plays
    if (videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      video.loop = true;
      video.play().catch(err => {
        console.log('Initial ref play attempt:', err);
      });
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Additional useEffect to ensure video plays when component mounts
  useEffect(() => {
    const ensureVideoPlays = () => {
      if (videoRef.current) {
        const video = videoRef.current;
        // Set properties
        video.muted = true;
        video.loop = true;
        video.setAttribute('autoplay', 'true');
        
        // Check if video is ready
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA
          console.log('🎬 Video is ready, attempting to play...');
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('✅ Video started playing via useEffect!');
              })
              .catch(error => {
                console.error('❌ Video play promise error:', error);
                console.error('Error name:', error.name);
                // Try again with exponential backoff
                let attempts = 0;
                const tryPlay = () => {
                  attempts++;
                  video.muted = true;
                  video.play()
                    .then(() => console.log('✅ Video playing after retry!'))
                    .catch(err => {
                      if (attempts < 10) {
                        setTimeout(tryPlay, 300 * attempts);
                      } else {
                        console.error('❌ All play attempts exhausted');
                      }
                    });
                };
                setTimeout(tryPlay, 500);
              });
          }
        } else {
          // Wait for video to be ready
          video.addEventListener('canplay', () => {
            video.play().catch(err => console.error('Canplay play error:', err));
          }, { once: true });
        }
      }
    };
    
    // Try immediately
    ensureVideoPlays();
    
    // Also try after delays
    const timer1 = setTimeout(ensureVideoPlays, 500);
    const timer2 = setTimeout(ensureVideoPlays, 1000);
    const timer3 = setTimeout(ensureVideoPlays, 2000);
    
    // Use Intersection Observer to play when section is visible
    const aboutSection = document.getElementById('about-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            const video = videoRef.current;
            video.muted = true;
            video.loop = true;
            video.currentTime = 0; // Reset to start
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  // Video is playing - no need to log
                })
                .catch(err => {
                  console.error('❌ IntersectionObserver play error:', err);
                  console.error('Error name:', err.name);
                });
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px' }
    );
    
    if (aboutSection) {
      observer.observe(aboutSection);
    }
    
    // Periodic check to ensure video is playing - silent check
    const playCheckInterval = setInterval(() => {
      if (videoRef.current) {
        const video = videoRef.current;
        if (video.paused && video.readyState >= 2) {
          video.muted = true;
          video.loop = true;
          video.play().catch(() => {}); // Silent fail
        }
      }
    }, 3000); // Check every 3 seconds (less frequent)
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(playCheckInterval);
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  // Use only real reviews from database - no demo reviews
  const displayReviews = reviews;

  // Scroll animation setup
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-on-scroll');
          // Optional: unobserve after animation to improve performance
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Observe all sections with scroll animations
      const sections = document.querySelectorAll('section.scroll-animate');
      const cards = document.querySelectorAll('.feature-card.scroll-animate, .category-card.scroll-animate');
      
      sections.forEach((section) => observer.observe(section));
      cards.forEach((card) => observer.observe(card));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [categories, displayReviews]); // Re-run when data loads

  // Global click handler to unlock video autoplay
  useEffect(() => {
    const handleUserInteraction = () => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.muted = true;
        videoRef.current.play().catch(err => {
          console.log('User interaction play attempt:', err);
        });
      }
    };

    // Add event listeners for user interaction
    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Force video to play on mount - most aggressive approach
  useEffect(() => {
    const forcePlayVideo = () => {
      const video = videoRef.current;
      if (video) {
        // Set all required attributes
        video.setAttribute('muted', 'true');
        video.setAttribute('autoplay', 'true');
        video.setAttribute('loop', 'true');
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        video.loop = true;
        
        // Try to play immediately
        const attemptPlay = () => {
          if (video.readyState >= 1) { // HAVE_METADATA or better
            video.play()
              .then(() => {
                console.log('✅✅✅ VIDEO IS NOW PLAYING!');
              })
              .catch(err => {
                console.error('❌ Play failed:', err);
                // Retry after short delay
                setTimeout(attemptPlay, 100);
              });
          } else {
            // Wait for video to load
            video.addEventListener('loadedmetadata', attemptPlay, { once: true });
          }
        };
        
        attemptPlay();
      }
    };

    // Try multiple times with delays
    forcePlayVideo();
    setTimeout(forcePlayVideo, 100);
    setTimeout(forcePlayVideo, 500);
    setTimeout(forcePlayVideo, 1000);
  }, []);

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
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
                  <span 
                    className="text-white inline-block hero-title" 
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      animation: 'slideInUp 0.8s ease-out 0.2s forwards, glow 3s ease-in-out 1s infinite, float 4s ease-in-out 2s infinite',
                      opacity: 0
                    }}
                  >
                    AuraTech
                  </span>
                </h1>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight">
                  <span 
                    className="text-white inline-block hero-subtitle" 
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      animation: 'slideInUp 0.8s ease-out 0.6s forwards, float 4s ease-in-out 2.5s infinite',
                      opacity: 0
                    }}
                  >
                    Expand Your Horizon
                  </span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2 sm:px-0" style={{color: 'rgba(255, 255, 255, 0.95)', textShadow: '1px 1px 3px rgba(0,0,0,0.8)', minHeight: '3em'}}>
                  <TypewriterText 
                    text="Discover a refined world of curated tech. Find and define your own aura."
                    speed={50}
                  />
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
      <section className="py-16 bg-white scroll-animate scroll-fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`text-center p-6 hover:shadow-xl transition-all duration-300 feature-card scroll-animate scroll-scale scroll-stagger-${index + 1}`}
                style={{
                  transform: 'translateY(0)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4 feature-icon-wrapper">
                    <div className="feature-icon">
                    {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 transition-colors duration-300 hover:text-yellow-600">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 scroll-animate scroll-fade-up">
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
                  className={`p-3 sm:p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105 category-card scroll-animate scroll-scale scroll-stagger-${(index % 6) + 1}`}
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
      <section 
        id="about-section" 
        className="py-16 relative overflow-hidden scroll-animate scroll-fade-up" 
        style={{ minHeight: '600px' }}
        onClick={(e) => {
          // Unlock video play on user interaction
          if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(err => console.error('Click play error:', err));
          }
        }}
      >
        {/* Background Video - Vid12 as banner */}
        <video
          ref={videoRef}
          id="about-video"
          src="/Vid12.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            zIndex: 1,
            pointerEvents: 'none',
            backgroundColor: 'transparent',
            opacity: 1,
            visibility: 'visible',
            display: 'block',
            transform: 'scaleX(-1)' // Mirror effect - horizontal flip
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={(e) => {
            const video = e.target;
            video.muted = true;
            video.loop = true;
            video.style.opacity = '1';
            video.style.visibility = 'visible';
            console.log('✅ Video loaded - dimensions:', video.videoWidth, 'x', video.videoHeight);
            video.play().catch(() => {});
          }}
          onCanPlay={(e) => {
            const video = e.target;
            video.style.opacity = '1';
            video.style.visibility = 'visible';
            console.log('✅ Video can play - making visible');
          }}
          onEnded={(e) => {
            e.target.currentTime = 0;
            e.target.play();
          }}
          onError={(e) => {
            console.error('❌ Video error:', e.target.error);
            // Hide video if it fails to load
            e.target.style.display = 'none';
          }}
        />
        
        {/* Fallback gradient background if video fails to load - BEHIND video */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" style={{ zIndex: 0 }}></div>
        
        {/* Lighter overlay for better text readability - video should be visible through this */}
        <div className="absolute inset-0 bg-black/30" style={{ zIndex: 2 }}></div>
        
        {/* Content - Centered */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 about-section-title" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
              About <span style={{color: '#fdfceeff'}}>Aura</span><span style={{color: '#fcfbf9ff'}}>Tech</span>
            </h2>
            <p className="text-lg md:text-xl text-white mb-6 about-section-text mx-auto max-w-3xl mt-8 md:mt-10" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>
              A collection inspired by the adorable Instax mini. Get ready for dreamy aesthetics, pretty photography, and capturing all the sweet moments in life. Think pastel vibes, cozy memories, and instant photo fun.
            </p>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce z-30">
          <span className="text-white text-sm">✨</span>
        </div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse z-30">
          <span className="text-white text-xs">💻</span>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 scroll-animate scroll-fade-up">
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
            ) : displayReviews.length > 0 ? (
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
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg">No reviews yet. Be the first to leave a review!</p>
              </div>
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

