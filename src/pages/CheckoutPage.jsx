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
import { Alert, AlertDescription } from '../components/ui/alert';
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
  Loader2,
  XCircle,
  AlertCircle,
  Check
} from 'lucide-react';
import WorkingPayPalButton from '../components/WorkingPayPalButton';
import { verifyAddress } from '../lib/addressVerificationService';

export default function CheckoutPage({ onNavigate }) {
  const { items, getTotalPrice, getTotalTax, createOrderFromCart, clearCart } = useCart();
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
    country: '' // Will be set from dashboard countries
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [dashboardShippingCosts, setDashboardShippingCosts] = useState({});
  const [dashboardCountries, setDashboardCountries] = useState([]);
  const [loadingShippingData, setLoadingShippingData] = useState(true);
  
  // Address verification state
  const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);
  const [addressVerification, setAddressVerification] = useState(null);
  const [isAddressVerified, setIsAddressVerified] = useState(false);

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
        
        // Set default country from dashboard (first country available)
        if (countries.length > 0) {
          // Only set default if no country is currently selected, or if current country is not in dashboard
          const currentCountryExists = countries.find(c => c.name === shippingInfo.country);
          if (!shippingInfo.country || !currentCountryExists) {
            const defaultCountry = countries[0]; // Use first country from dashboard
            console.log('🔄 Setting default country from dashboard:', defaultCountry.name);
            setShippingInfo(prev => ({ ...prev, country: defaultCountry.name }));
          }
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
  // When country is selected in shipping information, look up cost from dashboard
  useEffect(() => {
    if (!shippingInfo.country) {
      console.log('⚠️ No country selected');
      setShippingCost(0);
      return;
    }
    
    console.log('🔄🔄🔄 CALCULATING SHIPPING COST');
    console.log('📍 Selected country:', shippingInfo.country);
    console.log('📊 Dashboard countries available:', dashboardCountries.length);
    console.log('📊 Dashboard countries:', dashboardCountries);
    console.log('📊 Dashboard costs available:', Object.keys(dashboardShippingCosts).length);
    
    // First priority: Find cost from dashboardCountries (same source as dropdown)
    if (dashboardCountries.length > 0) {
      const countryKey = shippingInfo.country.toLowerCase().trim();
      console.log('🔑 Looking for country key:', countryKey);
      
      const countryMatch = dashboardCountries.find(c => {
        const cName = c.name.toLowerCase().trim();
        const match = cName === countryKey;
        console.log(`  Comparing: "${cName}" === "${countryKey}" → ${match}`);
        if (match) {
          console.log(`  ✅ MATCH FOUND! Country: ${c.name}, Cost: ${c.cost}`);
        }
        return match;
      });
      
      if (countryMatch) {
        console.log('✅ Found country match:', countryMatch);
        if (countryMatch.cost !== undefined && countryMatch.cost !== null) {
          const cost = parseFloat(countryMatch.cost);
          if (!isNaN(cost)) {
            console.log('✅✅✅ SETTING SHIPPING COST:', cost, 'for', countryMatch.name);
            setShippingCost(cost);
            return;
          } else {
            console.log('❌ Cost is NaN:', countryMatch.cost);
          }
        } else {
          console.log('❌ Country match found but cost is undefined/null:', countryMatch);
        }
      } else {
        console.log('❌ No match found in dashboardCountries for:', shippingInfo.country);
        console.log('📋 Available countries:', dashboardCountries.map(c => `${c.name} (${c.cost})`));
      }
    } else {
      console.log('⚠️ dashboardCountries is empty, waiting for data to load...');
    }
    
    // Second priority: Try to get cost from dashboardShippingCosts
    if (Object.keys(dashboardShippingCosts).length > 0) {
      const countryKey = shippingInfo.country.toLowerCase().trim();
      console.log('🔍 Looking in dashboardShippingCosts for:', countryKey);
      const costData = dashboardShippingCosts[countryKey];
      console.log('  Result:', costData);
      
      if (costData && costData.isActive && costData.cost !== undefined && costData.cost !== null) {
        const cost = parseFloat(costData.cost);
        if (!isNaN(cost)) {
          console.log('✅✅✅ SETTING SHIPPING COST FROM dashboardShippingCosts:', cost, 'for', shippingInfo.country);
          setShippingCost(cost);
          return;
        }
      } else {
        console.log('❌ No active cost data found in dashboardShippingCosts for:', countryKey);
        console.log('📋 Available keys:', Object.keys(dashboardShippingCosts));
      }
    }
    
    // Fallback to default costs if no match found
    console.log('⚠️ No match found in dashboard data, using fallback costs');
    let cost = 0;
    if (shippingInfo.country === 'United States') {
      cost = 0;
    } else if (shippingInfo.country === 'Canada') {
      cost = 15;
    } else if (shippingInfo.country === 'United Kingdom') {
      cost = 20;
    } else if (['Germany', 'France', 'Italy', 'Spain'].includes(shippingInfo.country)) {
      cost = 25;
    } else if (shippingInfo.country === 'Australia') {
      cost = 30;
    } else if (['Bangladesh', 'India', 'Pakistan'].includes(shippingInfo.country)) {
      cost = 35;
    } else {
      cost = 40;
    }
    console.log('⚠️ Using fallback shipping cost:', cost, 'for', shippingInfo.country);
    setShippingCost(cost);
  }, [shippingInfo.country, dashboardCountries, dashboardShippingCosts]);

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
    // Reset verification when address changes
    if (['address', 'city', 'state', 'zipCode', 'country'].includes(field)) {
      setIsAddressVerified(false);
      setAddressVerification(null);
    }
    // The useEffect will automatically update shipping cost when country changes
  };

  // Verify address
  const handleVerifyAddress = async () => {
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode || !shippingInfo.country) {
      alert('Please fill in all address fields before verifying.');
      return;
    }

    setIsVerifyingAddress(true);
    try {
      const result = await verifyAddress({
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country
      });

      setAddressVerification(result);
      setIsAddressVerified(result.isValid);

      if (!result.isValid && result.suggestions && result.suggestions.length > 0) {
        // Show suggestion to user
        console.log('📍 Address verification result:', result);
      }
    } catch (error) {
      console.error('❌ Address verification error:', error);
      alert('Failed to verify address. Please try again.');
    } finally {
      setIsVerifyingAddress(false);
    }
  };

  // Accept suggested address
  const handleAcceptSuggestedAddress = (suggestedAddress) => {
    // Parse the suggested address and update shipping info
    // This is a simplified version - you might want to use a more sophisticated parser
    const parts = suggestedAddress.split(',').map(p => p.trim());
    
    // Try to extract components (this is basic - Google's API provides better structured data)
    if (addressVerification?.verifiedAddress) {
      const verified = addressVerification.verifiedAddress;
      setShippingInfo(prev => ({
        ...prev,
        address: verified.street || prev.address,
        city: verified.city || prev.city,
        state: verified.state || prev.state,
        zipCode: verified.zipCode || prev.zipCode,
        country: verified.country || prev.country
      }));
      setIsAddressVerified(true);
      setAddressVerification(prev => ({ ...prev, isValid: true }));
    }
  };

  // Check if shipping form is incomplete
  const isShippingFormIncomplete = !shippingInfo.fullName || 
                                    !shippingInfo.email || 
                                    !shippingInfo.contact ||
                                    !shippingInfo.address || 
                                    !shippingInfo.city || 
                                    !shippingInfo.state || 
                                    !shippingInfo.zipCode ||
                                    !shippingInfo.country;

  // Check if address needs verification
  const needsAddressVerification = shippingInfo.address && 
                                   shippingInfo.city && 
                                   shippingInfo.state && 
                                   shippingInfo.zipCode && 
                                   shippingInfo.country && 
                                   !isAddressVerified;

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

      // Check address verification
      if (needsAddressVerification) {
        const verify = window.confirm(
          'Your address has not been verified. An invalid address may result in delivery issues. ' +
          'Would you like to verify your address before proceeding, or continue anyway?'
        );
        if (!verify) {
          setIsProcessing(false);
          return;
        }
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
      
      // Validate required fields with detailed message
      const missingFields = [];
      if (!shippingInfo.fullName) missingFields.push('Full Name');
      if (!shippingInfo.email) missingFields.push('Email');
      if (!shippingInfo.contact) missingFields.push('Phone Number');
      if (!shippingInfo.address) missingFields.push('Address');
      if (!shippingInfo.city) missingFields.push('City');
      if (!shippingInfo.state) missingFields.push('State');
      if (!shippingInfo.zipCode) missingFields.push('ZIP Code');
      if (!shippingInfo.country) missingFields.push('Country');
      
      if (missingFields.length > 0) {
        const missingFieldsStr = missingFields.join(', ');
        alert(`Please complete all shipping information before proceeding.\n\nMissing fields: ${missingFieldsStr}`);
        setIsProcessing(false);
        return;
      }

      // Check address verification
      if (needsAddressVerification) {
        const verify = window.confirm(
          'Your address has not been verified. An invalid address may result in delivery issues. ' +
          'Would you like to verify your address before proceeding, or continue anyway?'
        );
        if (!verify) {
          setIsProcessing(false);
          return;
        }
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
  const tax = getTotalTax();
  const total = subtotal + tax + shippingCost;

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
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="address">Address *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyAddress}
                      disabled={isVerifyingAddress || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode || !shippingInfo.country}
                      className="text-xs"
                    >
                      {isVerifyingAddress ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3 mr-1" />
                          Verify Address
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your full address"
                    required
                    className={addressVerification && !addressVerification.isValid ? 'border-red-300' : isAddressVerified ? 'border-green-300' : ''}
                  />
                  
                  {/* Address Verification Status */}
                  {addressVerification && (
                    <div className={`mt-2 p-3 rounded-lg text-sm ${
                      addressVerification.isValid 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                    }`}>
                      <div className="flex items-start gap-2">
                        {addressVerification.isValid ? (
                          <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-1">{addressVerification.message}</p>
                          {addressVerification.formattedAddress && (
                            <p className="text-xs opacity-90 mb-2">
                              Verified: {addressVerification.formattedAddress}
                            </p>
                          )}
                          {!addressVerification.isValid && addressVerification.suggestions && addressVerification.suggestions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1">Suggested address:</p>
                              <div className="bg-white p-2 rounded border border-yellow-300">
                                <p className="text-xs mb-2">{addressVerification.suggestions[0]}</p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAcceptSuggestedAddress(addressVerification.suggestions[0])}
                                  className="text-xs h-7"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Use This Address
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isAddressVerified && (
                    <div className="mt-2 flex items-center gap-2 text-green-600 text-xs">
                      <CheckCircle className="h-4 w-4" />
                      <span>Address verified</span>
                    </div>
                  )}
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
                    {tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping cost</span>
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
                    <WorkingPayPalButton
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
                    {isShippingFormIncomplete && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Please complete all shipping information before proceeding with payment.</strong>
                          <br />
                          Please fill in all required fields in the shipping form above.
                        </AlertDescription>
                      </Alert>
                    )}
                    {needsAddressVerification && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          <strong>Address not verified.</strong>
                          <br />
                          Please verify your address using the "Verify Address" button above to ensure accurate delivery.
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        You will be contacted for payment details after placing your order.
                      </p>
                    </div>
                    <Button
                      onClick={handleManualOrder}
                      disabled={isProcessing || isShippingFormIncomplete}
                      className={`w-full ${isShippingFormIncomplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isProcessing ? 'Processing...' : isShippingFormIncomplete ? 'Complete Shipping Information First' : 'Place Order'}
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
