import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft,
  CreditCard,
  MapPin,
  Loader2
} from 'lucide-react';
import { getShippingCostForCountry, getAllCountries } from '../lib/shippingService';
import { getDashboardCountries, getDashboardShippingCosts } from '../lib/countryShippingService';

export default function CartPage({ onNavigate }) {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [shippingCost, setShippingCost] = useState(0);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [countries, setCountries] = useState([]);

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        console.log('🌍 Loading countries from dashboard...');
        const dashboardCountries = await getDashboardCountries();
        
        if (dashboardCountries && dashboardCountries.length > 0) {
          console.log('✅ Loaded countries from dashboard:', dashboardCountries.length);
          setCountries(dashboardCountries.map(country => country.name));
        } else {
          console.log('⚠️ No dashboard countries found, using fallback');
          const fallbackCountries = getAllCountries();
          setCountries(fallbackCountries);
        }
      } catch (error) {
        console.error('❌ Error loading dashboard countries:', error);
        const fallbackCountries = getAllCountries();
        setCountries(fallbackCountries);
      }
    };
    loadCountries();
  }, []);

  // Load shipping cost when country changes
  useEffect(() => {
    const loadShippingCost = async () => {
      if (!selectedCountry) return;
      
      setIsLoadingShipping(true);
      try {
        console.log('🚚 Loading shipping cost for:', selectedCountry);
        
        // Try to get cost from dashboard first
        const dashboardCosts = await getDashboardShippingCosts();
        const countryKey = selectedCountry.toLowerCase();
        
        if (dashboardCosts[countryKey] && dashboardCosts[countryKey].isActive) {
          const cost = dashboardCosts[countryKey].cost;
          setShippingCost(cost);
          console.log('✅ Dashboard shipping cost for', selectedCountry, ':', cost);
        } else {
          // Fallback to existing service
          const cost = await getShippingCostForCountry(selectedCountry);
          setShippingCost(cost.cost || 0);
          console.log('📋 Fallback shipping cost for', selectedCountry, ':', cost.cost);
        }
      } catch (error) {
        console.error('❌ Error loading shipping cost:', error);
        setShippingCost(0);
      } finally {
        setIsLoadingShipping(false);
      }
    };

    loadShippingCost();
  }, [selectedCountry]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Button onClick={() => onNavigate('products')} size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('products')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">{getTotalItems()} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Cart Items</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600">{item.brand}</p>
                      <p className="text-blue-600 font-semibold">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min="0"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Country Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Country
                  </label>
                  <Select value={selectedCountry} onValueChange={handleCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping to {selectedCountry}</span>
                    <span className="flex items-center gap-1">
                      {isLoadingShipping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(getTotalPrice() + shippingCost)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => onNavigate('checkout', { 
                      shippingCountry: selectedCountry, 
                      shippingCost: shippingCost 
                    })}
                    className="w-full" 
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate('products')}
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </div>

                {/* Promo Code */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Promo Code</h4>
                  <div className="flex space-x-2">
                    <Input placeholder="Enter code" />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="pt-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure checkout guaranteed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

