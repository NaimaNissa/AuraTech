import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import ContactPage from './pages/ContactPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigation = (page, data = null) => {
    if (page === 'about') {
      // Navigate to home page and scroll to about section
      setCurrentPage('home');
      setTimeout(() => {
        const aboutSection = document.getElementById('about-section');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (page === 'product-details' && data) {
      // Set the product ID for product details page
      setSearchQuery(data);
      setCurrentPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigation} />;
      case 'auth':
        return <AuthPage />;
      case 'products':
        return <ProductsPage searchQuery={searchQuery} onNavigate={handleNavigation} />;
      case 'product-details':
        return <ProductDetailsPage productId={searchQuery} onNavigate={handleNavigation} />;
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
      default:
        return <HomePage onNavigate={handleNavigation} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <Navbar 
            onNavigate={handleNavigation} 
            onSearch={handleSearch}
            currentPage={currentPage}
          />
          {renderPage()}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
