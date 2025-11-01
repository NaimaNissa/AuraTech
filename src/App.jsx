import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import PayPalProvider from './components/PayPalProvider';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SimpleCheckoutPage from './pages/SimpleCheckoutPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import ContactPage from './pages/ContactPage';
import WishlistPage from './pages/WishlistPage';
import PayPalTest from './components/PayPalTest';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [productId, setProductId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [shippingData, setShippingData] = useState(null);

  // Initialize page from URL on app load
  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
    if (path === '/' || path === '') {
      setCurrentPage('home');
    } else if (path === '/products') {
      setCurrentPage('products');
      const search = urlParams.get('search');
      if (search) {
        setSearchQuery(search);
      }
    } else if (path.startsWith('/product/')) {
      const id = path.split('/product/')[1];
      setCurrentPage('product-details');
      setProductId(id);
    } else if (path === '/cart') {
      setCurrentPage('cart');
    } else if (path === '/checkout') {
      setCurrentPage('checkout');
    } else if (path === '/auth') {
      setCurrentPage('auth');
    } else if (path === '/profile') {
      setCurrentPage('profile');
    } else if (path === '/orders') {
      setCurrentPage('orders');
    } else if (path === '/contact') {
      setCurrentPage('contact');
    } else if (path === '/wishlist') {
      setCurrentPage('wishlist');
    } else if (path === '/paypal-test') {
      setCurrentPage('paypal-test');
    }
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      
      if (path === '/' || path === '') {
        setCurrentPage('home');
        setProductId('');
        setSearchQuery('');
      } else if (path === '/products') {
        setCurrentPage('products');
        setProductId('');
        const search = urlParams.get('search');
        if (search) {
          setSearchQuery(search);
        } else {
          setSearchQuery('');
        }
      } else if (path.startsWith('/product/')) {
        const id = path.split('/product/')[1];
        setCurrentPage('product-details');
        setProductId(id);
        setSearchQuery('');
      } else if (path === '/cart') {
        setCurrentPage('cart');
        setProductId('');
        setSearchQuery('');
      } else if (path === '/checkout') {
        setCurrentPage('checkout');
        setProductId('');
        setSearchQuery('');
      } else if (path === '/auth') {
        setCurrentPage('auth');
        setProductId('');
        setSearchQuery('');
      } else if (path === '/profile') {
        setCurrentPage('profile');
        setProductId('');
        setSearchQuery('');
      } else if (path === '/orders') {
        setCurrentPage('orders');
        setProductId('');
        setSearchQuery('');
      } else if (path === '/contact') {
        setCurrentPage('contact');
        setProductId('');
        setSearchQuery('');
      } else if (path === '/wishlist') {
        setCurrentPage('wishlist');
        setProductId('');
        setSearchQuery('');
      } else if (path === '/paypal-test') {
        setCurrentPage('paypal-test');
        setProductId('');
        setSearchQuery('');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigation = (page, data = null) => {
    if (page === 'about') {
      // Navigate to home page and scroll to about section
      setCurrentPage('home');
      window.history.pushState({}, '', '/');
      setTimeout(() => {
        const aboutSection = document.getElementById('about-section');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (page === 'product-details' && data) {
      // Set the product ID for product details page
      setProductId(data);
      setCurrentPage(page);
      window.history.pushState({}, '', `/product/${data}`);
    } else if (page === 'checkout' && data) {
      // Set shipping data for checkout page
      setShippingData(data);
      setCurrentPage(page);
      window.history.pushState({}, '', '/checkout');
    } else if (page === 'products' && data) {
      // Set category filter for products page
      setSelectedCategory(data);
      setCurrentPage(page);
      window.history.pushState({}, '', '/products');
    } else {
      setCurrentPage(page);
      // Clear product ID when navigating away from product details
      if (page !== 'product-details') {
        setProductId('');
      }
      // Clear search query when navigating away from products
      if (page !== 'products') {
        setSearchQuery('');
      }
      // Clear category filter when navigating away from products
      if (page !== 'products') {
        setSelectedCategory('');
      }
      // Clear shipping data when navigating away from checkout
      if (page !== 'checkout') {
        setShippingData(null);
      }
      
      // Update URL based on page
      switch (page) {
        case 'home':
          window.history.pushState({}, '', '/');
          break;
        case 'products':
          window.history.pushState({}, '', '/products');
          break;
        case 'cart':
          window.history.pushState({}, '', '/cart');
          break;
        case 'checkout':
          window.history.pushState({}, '', '/checkout');
          break;
        case 'auth':
          window.history.pushState({}, '', '/auth');
          break;
        case 'profile':
          window.history.pushState({}, '', '/profile');
          break;
        case 'orders':
          window.history.pushState({}, '', '/orders');
          break;
        case 'contact':
          window.history.pushState({}, '', '/contact');
          break;
        case 'wishlist':
          window.history.pushState({}, '', '/wishlist');
          break;
        default:
          window.history.pushState({}, '', '/');
      }
    }
  };


  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigation} />;
      case 'auth':
        return <AuthPage onNavigate={handleNavigation} />;
      case 'products':
        return <ProductsPage searchQuery={searchQuery} selectedCategory={selectedCategory} onNavigate={handleNavigation} />;
      case 'product-details':
        return <ProductDetailsPage productId={productId} onNavigate={handleNavigation} />;
      case 'cart':
        return (
          <ProtectedRoute>
            <CartPage onNavigate={handleNavigation} />
          </ProtectedRoute>
        );
        case 'checkout':
          return (
            <ProtectedRoute>
              <CheckoutPage onNavigate={handleNavigation} />
            </ProtectedRoute>
          );
      case 'contact':
        return <ContactPage onNavigate={handleNavigation} />;
        case 'wishlist':
          return (
            <ProtectedRoute>
              <WishlistPage onNavigate={handleNavigation} />
            </ProtectedRoute>
          );
        case 'orders':
          return (
            <ProtectedRoute>
              <OrdersPage onNavigate={handleNavigation} />
            </ProtectedRoute>
          );
        case 'profile':
          return (
            <ProtectedRoute>
              <ProfilePage onNavigate={handleNavigation} />
            </ProtectedRoute>
          );
        case 'paypal-test':
          return <PayPalTest />;
        default:
          return <HomePage onNavigate={handleNavigation} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <PayPalProvider>
        <div className="App">
          <Navbar 
            onNavigate={handleNavigation} 
            currentPage={currentPage}
          />
          {renderPage()}
        </div>
          </PayPalProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
