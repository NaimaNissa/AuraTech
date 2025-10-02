import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  LogOut,
  Package
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar({ onNavigate, onSearch, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const { getTotalItems } = useCart();

  // Handle scroll effect for transparent navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      onNavigate('products');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out');
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  // Dynamic navbar styling based on page and scroll
  const getNavbarStyle = () => {
    if (currentPage === 'home') {
      return {
        backgroundColor: isScrolled ? 'rgba(121, 130, 1, 0.95)' : 'rgba(121, 130, 1, 0.1)',
        backdropFilter: isScrolled ? 'blur(10px)' : 'blur(20px)',
        borderBottom: isScrolled ? '1px solid rgba(250, 226, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease-in-out',
        boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
      };
    }
    return {
      backgroundColor: 'rgb(121, 130, 1)',
      borderBottom: '1px solid rgba(250, 226, 68, 0.2)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    };
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm" style={getNavbarStyle()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo - Left Side */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-3 text-2xl font-bold transition-all duration-300" style={{color: '#FFFFFF'}}
            >
              <img src="/logo-aura.png" alt="AuraTech" className="h-16 w-auto" />
              <span>AuraTech</span>
            </button>
          </div>

          {/* Everything Else - Right Side */}
          <div className="flex-1 flex justify-end items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  style={{
                    color: currentPage === item.id ? '#FFFFFF' : '#FFFFFF',
                    backgroundColor: currentPage === item.id ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = currentPage === item.id ? 'rgba(255, 255, 255, 0.15)' : 'transparent';
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex max-w-xs lg:max-w-sm">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 w-full"
                  />
                </div>
              </form>
            </div>

            {/* Cart */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 transition-all duration-300 hover:scale-105" style={{color: '#FFFFFF'}}
            >
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </button>

            {/* User Menu */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentUser.displayName || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => onNavigate('auth')} size="sm">
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 transition-all duration-300" style={{color: '#FFFFFF'}}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t backdrop-blur-sm" style={{
            backgroundColor: currentPage === 'home' ? 'rgba(121, 130, 1, 0.95)' : 'rgb(121, 130, 1)',
            borderTopColor: currentPage === 'home' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(250, 226, 68, 0.2)'
          }}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 w-full"
                  />
                </div>
              </form>

              {/* Mobile Navigation Items */}
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-all duration-300"
                  style={{
                    color: currentPage === item.id ? '#FFFFFF' : '#FFFFFF',
                    backgroundColor: currentPage === item.id ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

