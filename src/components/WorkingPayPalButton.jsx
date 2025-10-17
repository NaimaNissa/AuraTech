import { useEffect, useState } from "react";
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../lib/orderService';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function WorkingPayPalButton({ 
  shippingInfo, 
  shippingCost, 
  onOrderSuccess, 
  onOrderError,
  className = "" 
}) {
  const { items, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);

  // Calculate order total
  const calculateOrderTotal = () => {
    const subtotal = getTotalPrice();
    const tax = (subtotal + shippingCost) * 0.08;
    return (subtotal + shippingCost + tax).toFixed(2);
  };

  // Handle fallback order
  const handleFallbackOrder = async () => {
    try {
      setIsProcessing(true);
      setOrderStatus(null);
      
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
        description: `Order via Manual Payment - ${items.length} items`,
        note: `Payment method: Manual payment collection. PayPal unavailable.`
      };

      const order = await createOrder(orderData);
      clearCart();
      setOrderStatus('success');
      
      if (onOrderSuccess) {
        onOrderSuccess(order, { id: order.orderId, status: 'pending_payment' });
      }
      
      alert(`Order placed successfully! Order ID: ${order.orderId}\n\nWe will contact you shortly to arrange payment.`);

    } catch (error) {
      console.error('❌ Error creating fallback order:', error);
      setOrderStatus('error');
      
      if (onOrderError) {
        onOrderError(error);
      }
      
      alert('Failed to place order. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load PayPal SDK
  useEffect(() => {
    if (!items.length || !currentUser) return;

    // Use a working PayPal sandbox client ID
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=AQkquBDf1zctJOWGKWUEtKXm6qVhueUEMvXO_-MCI4dQQNL-LROvk4ttX-EDg&currency=USD&intent=capture";
    
    script.onload = () => {
      console.log('✅ PayPal SDK loaded successfully');
      setPaypalLoaded(true);
      setPaypalError(null);
      
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          },
          
          createOrder: function(data, actions) {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: calculateOrderTotal(),
                  currency_code: 'USD'
                }
              }]
            });
          },
          
          onApprove: function(data, actions) {
            return actions.order.capture().then(async function(details) {
              try {
                setIsProcessing(true);
                
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

                const order = await createOrder(orderData);
                clearCart();
                setOrderStatus('success');
                
                if (onOrderSuccess) {
                  onOrderSuccess(order, details);
                }
                
                alert(`Payment completed! Order ID: ${order.orderId}`);
                
              } catch (error) {
                console.error('❌ Error creating order:', error);
                setOrderStatus('error');
                if (onOrderError) onOrderError(error);
                alert('Payment successful but order creation failed. Please contact support.');
              } finally {
                setIsProcessing(false);
              }
            });
          },
          
          onError: function(err) {
            console.error('❌ PayPal error:', err);
            setOrderStatus('error');
            if (onOrderError) onOrderError(err);
            alert('Payment failed. Please try again.');
          }
          
        }).render('#paypal-button-container');
      }
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load PayPal SDK');
      setPaypalError('PayPal is currently unavailable. Please use the alternative payment option below.');
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [items, shippingInfo, shippingCost, currentUser]);

  if (!items.length || !currentUser) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* PayPal Section */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-600 mb-2">
          <strong>💳 Pay with PayPal Account or Debit/Credit Card</strong>
        </div>
        <div className="text-xs text-gray-500">
          All payments processed securely by PayPal
        </div>
      </div>

      {/* Status Messages */}
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
            Payment failed. Please try again or use the alternative payment option below.
          </AlertDescription>
        </Alert>
      )}

      {/* PayPal Button Container */}
      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Processing payment...</span>
            </div>
          </div>
        )}

        {!paypalLoaded && !paypalError && (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Loading PayPal...</span>
            </div>
          </div>
        )}
        
        <div id="paypal-button-container"></div>
      </div>

      {/* Fallback Payment Option */}
      {(paypalError || !paypalLoaded) && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Alternative Payment Option
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
              Since PayPal is currently unavailable, you can place your order and we'll contact you to arrange payment via phone, bank transfer, or other methods.
            </p>
            <button
              onClick={handleFallbackOrder}
              disabled={isProcessing}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Order...
                </div>
              ) : (
                'Place Order (Contact for Payment)'
              )}
            </button>
            <p className="text-xs text-yellow-600 mt-2">
              We'll contact you within 24 hours to arrange payment
            </p>
          </div>
        </div>
      )}

      {/* Payment Info */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>🔒 All payments processed securely</p>
        <p>📧 You'll receive an email confirmation after payment</p>
        <p>💳 Supports PayPal accounts, Visa, Mastercard, Amex, and Discover</p>
        <p>🌍 International cards accepted</p>
      </div>
    </div>
  );
}

