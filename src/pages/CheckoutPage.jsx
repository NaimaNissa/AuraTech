import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { calculateCountryShippingCost, getCountryShippingOptions, validateInternationalAddress } from '../lib/countryShippingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CreditCard, 
  ArrowLeft, 
  Lock, 
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle
} from 'lucide-react';

export default function CheckoutPage({ onNavigate, shippingData }) {
  const { items, getTotalPrice, getTotalItems, createOrderFromCart } = useCart();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [shippingCost, setShippingCost] = useState(shippingData?.shippingCost || 0);
  const [shippingCountry, setShippingCountry] = useState(shippingData?.shippingCountry || 'United States');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: currentUser?.displayName?.split(' ')[0] || '',
    lastName: currentUser?.displayName?.split(' ')[1] || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    saveCard: false
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    
    // Recalculate shipping when address-related fields change
    if (['address', 'city', 'state', 'zipCode', 'country'].includes(field)) {
      // Debounce the calculation to avoid too many API calls
      setTimeout(() => {
        calculateShippingForAddress();
      }, 500);
    }
  };

  // Calculate shipping when component mounts or when address is complete
  useEffect(() => {
    if (shippingInfo.address && shippingInfo.city && shippingInfo.state) {
      calculateShippingForAddress();
    }
  }, [shippingInfo.address, shippingInfo.city, shippingInfo.state, shippingInfo.zipCode, shippingInfo.country]);

  const calculateShippingForAddress = async () => {
    // If shipping cost is already set from cart, don't recalculate
    if (shippingData?.shippingCost !== undefined) {
      console.log('🚚 Using shipping cost from cart:', shippingData.shippingCost);
      return;
    }

    const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`.trim();
    
    if (!shippingInfo.address || !shippingInfo.city) {
      setShippingCost(0);
      setShippingOptions([]);
      return;
    }

    try {
      setIsCalculatingShipping(true);
      const orderTotal = getTotalPrice();
      
      console.log('🚚 Calculating shipping for:', fullAddress);
      const options = await getCountryShippingOptions(fullAddress, orderTotal);
      
      setShippingOptions(options);
      
      // Set default shipping option
      const defaultOption = options.find(opt => opt.id === 'standard') || options[0];
      if (defaultOption) {
        setSelectedShipping(defaultOption.id);
        setShippingCost(defaultOption.cost);
      }
      
      console.log('✅ Shipping options loaded:', options);
    } catch (error) {
      console.error('❌ Error calculating shipping:', error);
      setShippingCost(5.99); // Fallback shipping cost
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleShippingOptionChange = (optionId) => {
    setSelectedShipping(optionId);
    const selectedOption = shippingOptions.find(opt => opt.id === optionId);
    if (selectedOption) {
      setShippingCost(selectedOption.cost);
    }
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);
      setOrderError(null);
      
      // Prepare customer information
      const customerInfo = {
        fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        email: shippingInfo.email,
        contact: shippingInfo.phone,
        address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`,
        shippingCost: shippingCost,
        note: `Payment method: ${paymentMethod}. Shipping: ${selectedShipping}`
      };
      
      // Create orders in Firebase
      const orders = await createOrderFromCart(customerInfo);
      
      setOrderPlaced(true);
    } catch (error) {
      console.error('❌ Error placing order:', error);
      console.error('❌ Error details:', error.message, error.code);
      console.error('❌ Customer info:', customerInfo);
      console.error('❌ Cart items:', items);
      setOrderError(`Failed to place order: ${error.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No items to checkout</h2>
            <p className="text-gray-600 mb-8">Your cart is empty. Add some items first.</p>
            <Button onClick={() => onNavigate('products')} size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your order. You will receive a confirmation email shortly.
              </p>
              <div className="space-y-3">
                <Button onClick={() => onNavigate('home')} size="lg">
                  Continue Shopping
                </Button>
                <div>
                  <Button variant="outline" onClick={() => onNavigate('orders')}>
                    View Orders
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
            onClick={() => onNavigate('cart')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleShippingChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleShippingChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleShippingChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => handleShippingChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleShippingChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => handleShippingChange('state', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Options */}
                  {shippingOptions.length > 0 && (
                    <div className="space-y-3">
                      <Label>Shipping Options</Label>
                      {isCalculatingShipping ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">Calculating shipping...</p>
                        </div>
                      ) : (
                        <RadioGroup value={selectedShipping} onValueChange={handleShippingOptionChange}>
                          {shippingOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <div className="flex-1">
                                <Label htmlFor={option.id} className="flex justify-between items-center cursor-pointer">
                                  <div>
                                    <span className="font-medium">{option.name}</span>
                                    <p className="text-sm text-gray-600">{option.description}</p>
                                    <p className="text-xs text-gray-500">{option.deliveryDays} business days</p>
                                  </div>
                                  <span className="font-semibold">
                                    {option.cost === 0 ? 'Free' : formatPrice(option.cost)}
                                  </span>
                                </Label>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    </div>
                  )}

                  <Button onClick={() => setStep(2)} className="w-full">
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card" className="flex items-center cursor-pointer">
                          <CreditCard className="h-5 w-5 mr-2" />
                          Credit/Debit Card
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                          <div className="w-5 h-5 bg-blue-600 rounded mr-2"></div>
                          PayPal
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                        <Label htmlFor="bank-transfer" className="flex items-center cursor-pointer">
                          <Building className="h-5 w-5 mr-2" />
                          Bank Transfer
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'credit-card' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          value={paymentInfo.cardName}
                          onChange={(e) => handlePaymentChange('cardName', e.target.value)}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveCard"
                          checked={paymentInfo.saveCard}
                          onCheckedChange={(checked) => handlePaymentChange('saveCard', checked)}
                        />
                        <Label htmlFor="saveCard">Save card for future purchases</Label>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-blue-800 mb-4">You will be redirected to PayPal to complete your payment.</p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Continue with PayPal
                      </Button>
                    </div>
                  )}

                  {paymentMethod === 'bank-transfer' && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Bank:</strong> AuraTech Bank</p>
                        <p><strong>Account Number:</strong> 1234567890</p>
                        <p><strong>Routing Number:</strong> 987654321</p>
                        <p><strong>Reference:</strong> Your order number will be provided</p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back to Shipping
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1">
                      Review Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-4">Order Items</h4>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                      <p>{shippingInfo.address}</p>
                      <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                      <p>{shippingInfo.email}</p>
                      <p>{shippingInfo.phone}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div>
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {paymentMethod.replace('-', ' ')}
                    </p>
                  </div>

                  {orderError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{orderError}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={isProcessing}>
                      Back to Payment
                    </Button>
                    <Button onClick={handlePlaceOrder} className="flex-1" disabled={isProcessing}>
                      <Lock className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? "text-green-600" : ""}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(getTotalPrice() + shippingCost)}</span>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Lock className="h-4 w-4" />
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

