import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardShippingCosts, getDashboardCountries } from '../lib/countryShippingService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { 
  ArrowLeft, 
  Lock, 
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle,
  Loader2
} from 'lucide-react';
import AuraTechPayPalButton from '../components/AuraTechPayPalButton';

export default function CheckoutPage({ onNavigate }) {
  const { items, getTotalPrice, createOrderFromCart, clearCart } = useCart();
  const { currentUser } = useAuth();
  
  console.log('🛒 CheckoutPage - Cart items:', items);
  console.log('🛒 CheckoutPage - Items length:', items?.length);
  console.log('🛒 CheckoutPage - Current user:', currentUser);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    contact: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [dashboardShippingCosts, setDashboardShippingCosts] = useState({});
  const [dashboardCountries, setDashboardCountries] = useState([]);
  const [loadingShippingData, setLoadingShippingData] = useState(true);

  // Load dashboard shipping costs and countries
  useEffect(() => {
    const loadShippingData = async () => {
      try {
        setLoadingShippingData(true);
        console.log('🚚 Loading shipping data from dashboard...');
        
        const [costs, countries] = await Promise.all([
          getDashboardShippingCosts(),
          getDashboardCountries()
        ]);
        
        console.log('🚚 Dashboard shipping costs loaded:', costs);
        console.log('🚚 Dashboard countries loaded:', countries);
        
        setDashboardShippingCosts(costs);
        setDashboardCountries(countries);
        
        // Set default country if available
        if (countries.length > 0 && !shippingInfo.country) {
          const defaultCountry = countries.find(c => c.name === 'United States') || countries[0];
          setShippingInfo(prev => ({ ...prev, country: defaultCountry.name }));
        }
        
      } catch (error) {
        console.error('❌ Error loading shipping data:', error);
        // Keep fallback costs if dashboard fails
      } finally {
        setLoadingShippingData(false);
      }
    };
    
    loadShippingData();
  }, []);

  // Calculate shipping cost based on dashboard settings
  useEffect(() => {
    const calculateShipping = () => {
      const country = shippingInfo.country;
      const countryKey = country.toLowerCase();
      const costData = dashboardShippingCosts[countryKey];
      
      console.log('🚚 Calculating shipping for:', country, 'Key:', countryKey);
      console.log('🚚 Cost data found:', costData);
      
      if (costData && costData.isActive) {
        setShippingCost(costData.cost);
        console.log('✅ Using dashboard shipping cost:', costData.cost);
      } else {
        // Fallback to default costs if not found in dashboard
        let cost = 0;
        if (country === 'United States') {
          cost = 0;
        } else if (country === 'Canada') {
          cost = 15;
        } else if (country === 'United Kingdom') {
          cost = 20;
        } else if (['Germany', 'France', 'Italy', 'Spain'].includes(country)) {
          cost = 25;
        } else if (country === 'Australia') {
          cost = 30;
        } else if (['Bangladesh', 'India', 'Pakistan'].includes(country)) {
          cost = 35;
        } else {
          cost = 40;
        }
        setShippingCost(cost);
        console.log('⚠️ Using fallback shipping cost:', cost);
      }
    };
    
    if (!loadingShippingData) {
      calculateShipping();
    }
  }, [shippingInfo.country, dashboardShippingCosts, loadingShippingData]);

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayPalSuccess = async (orderData) => {
    try {
      setIsProcessing(true);
      
      // Validate required fields
      if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.contact || 
          !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || 
          !shippingInfo.zipCode || !shippingInfo.country) {
        alert('Please fill in all required shipping information fields.');
        setIsProcessing(false);
        return;
      }
      
      const customerInfo = {
        ...shippingInfo,
        shippingCost: shippingCost,
        paymentMethod: 'paypal',
        paymentId: orderData.paymentId
      };
      
      await createOrderFromCart(customerInfo);
      setOrderSuccess(true);
      
      // Redirect to orders page after 3 seconds
      setTimeout(() => {
        onNavigate('orders');
      }, 3000);
      
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Order creation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualOrder = async () => {
    try {
      setIsProcessing(true);
      
      // Validate required fields
      if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.contact || 
          !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || 
          !shippingInfo.zipCode || !shippingInfo.country) {
        alert('Please fill in all required shipping information fields.');
        setIsProcessing(false);
        return;
      }
      
      const customerInfo = {
        ...shippingInfo,
        shippingCost: shippingCost,
        paymentMethod: 'manual',
        note: 'Manual payment - customer will be contacted for payment details'
      };
      
      await createOrderFromCart(customerInfo);
      setOrderSuccess(true);
      
      // Redirect to orders page after 3 seconds
      setTimeout(() => {
        onNavigate('orders');
      }, 3000);
      
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Order creation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your order has been placed and you will receive a confirmation email shortly.
            </p>
            <Button onClick={() => onNavigate('orders')} className="w-full">
              View Your Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug: Show cart status
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-4">
              Add some items to your cart before checking out.
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Debug: Items = {JSON.stringify(items)}
            </div>
            <Button onClick={() => onNavigate('products')} className="w-full">
                  Continue Shopping
                </Button>
            </CardContent>
          </Card>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('cart')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <div className="text-sm text-gray-500 mt-2">
            Debug: {items.length} items in cart
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                    <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                  <Label htmlFor="contact">Phone Number *</Label>
                    <Input
                    id="contact"
                    value={shippingInfo.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                      id="address"
                      value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your full address"
                      required
                    />
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                    <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                        required
                      />
                    </div>
                    <div>
                    <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                        required
                      />
                    </div>
                    <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="Enter ZIP code"
                        required
                      />
                    </div>
                  </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  {loadingShippingData ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading shipping options...
                    </div>
                  ) : (
                    <select
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {dashboardCountries.length > 0 ? (
                        dashboardCountries.map((country) => (
                          <option key={country.id} value={country.name}>
                            {country.name} - ${country.cost} shipping
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="United States">United States - $0 shipping</option>
                          <option value="Canada">Canada - $15 shipping</option>
                          <option value="United Kingdom">United Kingdom - $20 shipping</option>
                          <option value="Germany">Germany - $25 shipping</option>
                          <option value="France">France - $25 shipping</option>
                          <option value="Italy">Italy - $25 shipping</option>
                          <option value="Spain">Spain - $25 shipping</option>
                          <option value="Australia">Australia - $30 shipping</option>
                          <option value="Bangladesh">Bangladesh - $35 shipping</option>
                          <option value="India">India - $35 shipping</option>
                          <option value="Pakistan">Pakistan - $35 shipping</option>
                          <option value="Other">Other - $40 shipping</option>
                        </>
                      )}
                    </select>
                  )}
                  {dashboardCountries.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Shipping costs updated from dashboard settings
                    </p>
                  )}
                </div>
                </CardContent>
              </Card>

            {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
              <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                        <div className="w-5 h-5 bg-blue-600 rounded mr-2 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        PayPal (PayPal Account or Debit/Credit Card)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual" className="flex items-center cursor-pointer">
                          <Building className="h-5 w-5 mr-2" />
                        Manual Payment (Contact for Payment Details)
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
              <Card>
                <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                </CardHeader>
              <CardContent>
                <div className="space-y-4">
                      {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                          <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping ({shippingInfo.country})</span>
                      <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>

            {/* Payment Section */}
            <Card>
              <CardContent className="pt-6">
                {paymentMethod === 'paypal' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">💳 PayPal Payment</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>Development Mode:</strong> PayPal works best when deployed to production with HTTPS.
                      </p>
                      <p className="text-sm text-blue-700">
                        For local testing, you can use the manual payment option below, or deploy to Vercel/Netlify for full PayPal functionality.
                      </p>
                  </div>
                    <AuraTechPayPalButton
                      items={items}
                      shippingInfo={shippingInfo}
                      shippingCost={shippingCost}
                      onOrderSuccess={handlePayPalSuccess}
                      onOrderError={(error) => {
                        console.error('PayPal order error:', error);
                        alert('Payment failed. Please try again.');
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        You will be contacted for payment details after placing your order.
                      </p>
                  </div>
                    <Button
                      onClick={handleManualOrder}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
