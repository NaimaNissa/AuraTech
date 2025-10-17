import React, { useState } from 'react';
import { PayPalButtons, PayPalMarks } from '@paypal/react-paypal-js';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../lib/orderService';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const PayPalCheckoutButton = ({ 
  shippingInfo, 
  shippingCost, 
  onOrderSuccess, 
  onOrderError,
  className = "" 
}) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null); // 'success', 'error', null

  // Calculate order total including shipping and tax
  const calculateOrderTotal = () => {
    const subtotal = getTotalPrice();
    const tax = (subtotal + shippingCost) * 0.08; // 8% tax
    return (subtotal + shippingCost + tax).toFixed(2);
  };

  // Create order on PayPal
  const createPayPalOrder = (data, actions) => {
    console.log('🔄 Creating PayPal order...');
    
    const orderTotal = calculateOrderTotal();
    const subtotal = getTotalPrice();
    const tax = (subtotal + shippingCost) * 0.08;

    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: orderTotal,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: subtotal.toFixed(2)
              },
              shipping: {
                currency_code: 'USD',
                value: shippingCost.toFixed(2)
              },
              tax_total: {
                currency_code: 'USD',
                value: tax.toFixed(2)
              }
            }
          },
          items: items.map(item => ({
            name: item.name,
            unit_amount: {
              currency_code: 'USD',
              value: item.price.toFixed(2)
            },
            quantity: item.quantity.toString(),
            category: 'PHYSICAL_GOODS'
          })),
          shipping: {
            name: {
              full_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`
            },
            address: {
              address_line_1: shippingInfo.address,
              admin_area_2: shippingInfo.city,
              admin_area_1: shippingInfo.state,
              postal_code: shippingInfo.zipCode,
              country_code: shippingInfo.country === 'United States' ? 'US' : 
                          shippingInfo.country === 'Canada' ? 'CA' :
                          shippingInfo.country === 'United Kingdom' ? 'GB' :
                          shippingInfo.country === 'Australia' ? 'AU' : 'US'
            }
          }
        }
      ],
      application_context: {
        shipping_preference: 'SET_PROVIDED_ADDRESS'
      }
    });
  };

  // Handle successful PayPal payment
  const onApprove = async (data, actions) => {
    try {
      setIsProcessing(true);
      setOrderStatus(null);
      console.log('✅ PayPal payment approved:', data);

      // Capture the payment
      const details = await actions.order.capture();
      console.log('💰 Payment captured:', details);

      // Create order in our database
      const orderData = {
        fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        email: shippingInfo.email,
        contact: shippingInfo.phone,
        address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`,
        productName: items.map(item => `${item.name} (${item.quantity}x)`).join(', '),
        quantity: items.reduce((total, item) => total + item.quantity, 0),
        price: getTotalPrice(),
        totalPrice: calculateOrderTotal(),
        shippingCost: shippingCost,
        description: `Order via PayPal - ${items.length} items`,
        note: `PayPal Transaction ID: ${details.id}`
      };

      // Create order in Firebase
      const order = await createOrder(orderData);
      console.log('📦 Order created in database:', order);

      // Clear cart
      clearCart();

      // Set success status
      setOrderStatus('success');
      
      // Call success callback
      if (onOrderSuccess) {
        onOrderSuccess(order, details);
      }

    } catch (error) {
      console.error('❌ Error processing PayPal payment:', error);
      setOrderStatus('error');
      
      if (onOrderError) {
        onOrderError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle PayPal errors
  const onError = (err) => {
    console.error('❌ PayPal error:', err);
    setOrderStatus('error');
    
    if (onOrderError) {
      onOrderError(err);
    }
  };

  // Handle cancellation
  const onCancel = (data) => {
    console.log('🚫 PayPal payment cancelled:', data);
    setOrderStatus(null);
  };

  // Don't render if no items or user not logged in
  if (!items.length || !currentUser) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* PayPal Marks - Shows PayPal branding */}
      <div className="text-center">
        <PayPalMarks />
      </div>

      {/* Order Status Messages */}
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
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Payment failed. Please try again or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      )}

      {/* PayPal Buttons */}
      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Processing payment...</span>
            </div>
          </div>
        )}
        
        <PayPalButtons
          createOrder={createPayPalOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 45,
            tagline: true
          }}
          fundingSource={undefined} // Allow both PayPal and cards
        />
      </div>

      {/* Payment Options Info */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>💳 Pay with PayPal or use your debit/credit card</p>
        <p>🔒 Secure payment processing by PayPal</p>
        <p>📧 You'll receive an email confirmation after payment</p>
      </div>
    </div>
  );
};

export default PayPalCheckoutButton;
