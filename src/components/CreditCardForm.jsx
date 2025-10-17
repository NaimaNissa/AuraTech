import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CreditCard, Lock, Shield, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const CreditCardForm = ({ 
  shippingInfo, 
  shippingCost, 
  onOrderSuccess, 
  onOrderError,
  className = "" 
}) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'United States'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [errors, setErrors] = useState({});

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!cardData.cardNumber.replace(/\s/g, '').match(/^\d{13,19}$/)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!cardData.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!cardData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!cardData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }
    
    if (!cardData.billingAddress.trim()) {
      newErrors.billingAddress = 'Please enter billing address';
    }
    
    if (!cardData.billingCity.trim()) {
      newErrors.billingCity = 'Please enter billing city';
    }
    
    if (!cardData.billingState.trim()) {
      newErrors.billingState = 'Please enter billing state';
    }
    
    if (!cardData.billingZip.trim()) {
      newErrors.billingZip = 'Please enter billing zip code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Detect card type
  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    return 'Card';
  };

  // Process payment
  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setOrderStatus(null);

    try {
      // Simulate payment processing
      console.log('💳 Processing credit card payment...');
      
      // In a real implementation, you would:
      // 1. Send card data to your payment processor (Stripe, Square, etc.)
      // 2. Handle the response
      // 3. Create order in your database
      
      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment success
      const paymentResult = {
        transactionId: 'TXN_' + Date.now(),
        cardType: getCardType(cardData.cardNumber),
        last4: cardData.cardNumber.slice(-4),
        amount: (shippingInfo.total || 0).toFixed(2)
      };

      console.log('✅ Payment successful:', paymentResult);
      setOrderStatus('success');
      
      if (onOrderSuccess) {
        onOrderSuccess(paymentResult);
      }

    } catch (error) {
      console.error('❌ Payment failed:', error);
      setOrderStatus('error');
      
      if (onOrderError) {
        onOrderError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>🔒 Secure Payment:</strong> Your card information is encrypted and processed securely. We never store your full card details.
        </AlertDescription>
      </Alert>

      {/* Card Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit/Debit Card Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  cardNumber: formatCardNumber(e.target.value) 
                }))}
                className={errors.cardNumber ? 'border-red-500' : ''}
                maxLength={19}
              />
              {cardData.cardNumber && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600">
                  {getCardType(cardData.cardNumber)}
                </div>
              )}
            </div>
            {errors.cardNumber && (
              <p className="text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  expiryDate: formatExpiryDate(e.target.value) 
                }))}
                className={errors.expiryDate ? 'border-red-500' : ''}
                maxLength={5}
              />
              {errors.expiryDate && (
                <p className="text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  cvv: e.target.value.replace(/\D/g, '') 
                }))}
                className={errors.cvv ? 'border-red-500' : ''}
                maxLength={4}
              />
              {errors.cvv && (
                <p className="text-sm text-red-600">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              value={cardData.cardholderName}
              onChange={(e) => setCardData(prev => ({ 
                ...prev, 
                cardholderName: e.target.value 
              }))}
              className={errors.cardholderName ? 'border-red-500' : ''}
            />
            {errors.cardholderName && (
              <p className="text-sm text-red-600">{errors.cardholderName}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billingAddress">Address</Label>
            <Input
              id="billingAddress"
              type="text"
              placeholder="123 Main Street"
              value={cardData.billingAddress}
              onChange={(e) => setCardData(prev => ({ 
                ...prev, 
                billingAddress: e.target.value 
              }))}
              className={errors.billingAddress ? 'border-red-500' : ''}
            />
            {errors.billingAddress && (
              <p className="text-sm text-red-600">{errors.billingAddress}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingCity">City</Label>
              <Input
                id="billingCity"
                type="text"
                placeholder="New York"
                value={cardData.billingCity}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  billingCity: e.target.value 
                }))}
                className={errors.billingCity ? 'border-red-500' : ''}
              />
              {errors.billingCity && (
                <p className="text-sm text-red-600">{errors.billingCity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingState">State</Label>
              <Input
                id="billingState"
                type="text"
                placeholder="NY"
                value={cardData.billingState}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  billingState: e.target.value 
                }))}
                className={errors.billingState ? 'border-red-500' : ''}
              />
              {errors.billingState && (
                <p className="text-sm text-red-600">{errors.billingState}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingZip">ZIP Code</Label>
              <Input
                id="billingZip"
                type="text"
                placeholder="10001"
                value={cardData.billingZip}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  billingZip: e.target.value 
                }))}
                className={errors.billingZip ? 'border-red-500' : ''}
              />
              {errors.billingZip && (
                <p className="text-sm text-red-600">{errors.billingZip}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingCountry">Country</Label>
              <Select 
                value={cardData.billingCountry} 
                onValueChange={(value) => setCardData(prev => ({ 
                  ...prev, 
                  billingCountry: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <div className="space-y-4">
        {orderStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Your order has been placed and you will receive a confirmation email shortly.
            </AlertDescription>
          </Alert>
        )}

        {orderStatus === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              Payment failed. Please check your card information and try again.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Pay Securely
            </div>
          )}
        </Button>

        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>🔒 Your payment information is encrypted and secure</p>
          <p>💳 We accept Visa, Mastercard, American Express, and Discover</p>
        </div>
      </div>
    </div>
  );
};

export default CreditCardForm;
