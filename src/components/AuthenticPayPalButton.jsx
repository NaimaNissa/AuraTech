import { useEffect, useState } from "react";
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../lib/orderService';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AuthenticPayPalButton({ 
  shippingInfo, 
  shippingCost, 
  onOrderSuccess, 
  onOrderError,
  className = "" 
}) {
  const { items, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null); // 'success', 'error', null
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Calculate order total including shipping and tax
  const calculateOrderTotal = () => {
    const subtotal = getTotalPrice();
    const tax = (subtotal + shippingCost) * 0.08; // 8% tax
    return (subtotal + shippingCost + tax).toFixed(2);
  };

  // Handle fallback order (when PayPal fails)
  const handleFallbackOrder = async () => {
    try {
      setIsProcessing(true);
      setOrderStatus(null);
      
      console.log('🔄 Creating fallback order...');
      
      // Create order in our system without PayPal payment
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
        description: `Order via Fallback Payment - ${items.length} items`,
        note: `Payment method: Contact customer for payment details. PayPal unavailable.`
      };

      const order = await createOrder(orderData);
      console.log('✅ Fallback order created successfully:', order);
      
      // Clear cart
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

  // Retry loading PayPal SDK
  const retryPayPalLoad = () => {
    if (retryCount < 3) {
      setIsRetrying(true);
      setPaypalError(null);
      setRetryCount(prev => prev + 1);
      
      // Remove existing script
      const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Reload after a short delay
      setTimeout(() => {
        loadPayPalSDK();
        setIsRetrying(false);
      }, 1000);
    }
  };

  // Load PayPal SDK function
  const loadPayPalSDK = () => {
    console.log('🔄 Loading PayPal SDK... (attempt', retryCount + 1, ')');
    
    // Try with a simpler URL first (without some parameters that might cause issues)
    const script = document.createElement("script");
    
    // Use a working PayPal sandbox client ID for testing
    // This is a valid sandbox client ID that should work
    const clientId = 'sb'; // PayPal sandbox client ID
    
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&enable-funding=card&components=buttons`;
    
    script.addEventListener("load", () => {
      console.log('✅ PayPal SDK loaded successfully');
      setPaypalLoaded(true);
      setPaypalError(null);
      setRetryCount(0);
      
      if (window.paypal && items.length > 0) {
        console.log('🔄 Initializing PayPal buttons...');
        initializePayPalButtons();
      } else {
        console.log('⚠️ PayPal SDK loaded but conditions not met:', { 
          hasPaypal: !!window.paypal, 
          itemsLength: items.length 
        });
      }
    });

    script.addEventListener("error", (event) => {
      console.error('❌ Failed to load PayPal SDK (attempt', retryCount + 1, ')');
      console.error('❌ Error details:', event);
      setPaypalLoaded(false);
      
      if (retryCount < 2) {
        setPaypalError(`Loading PayPal... (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          retryPayPalLoad();
        }, 2000);
      } else {
        setPaypalError('PayPal is currently unavailable. This may be due to an invalid client ID or PayPal service issues. Please contact support or try again later.');
      }
    });

    document.body.appendChild(script);
  };

  // Initialize PayPal buttons
  const initializePayPalButtons = () => {
    try {
      window.paypal.Buttons({
        style: { 
          layout: "vertical", 
          color: "blue", 
          shape: "rect", 
          label: "paypal",
          height: 50,
          tagline: true
        },
        
        // Create PayPal order
        createOrder: function (data, actions) {
          console.log('🔄 Creating PayPal order...');
          const orderTotal = calculateOrderTotal();
          console.log('💰 Order total:', orderTotal);
          
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: orderTotal,
                currency_code: 'USD'
              },
              description: `Order from AuraTech - ${items.length} item(s)`
            }],
            application_context: {
              shipping_preference: 'NO_SHIPPING'
            }
          });
        },

        // Handle payment approval
        onApprove: function (data, actions) {
          console.log('✅ PayPal payment approved:', data);
          setIsProcessing(true);
          setOrderStatus(null);
          
          return actions.order.capture().then(async function (details) {
            console.log('💰 Payment captured:', details);
            
            try {
              // Create order in our system
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
              console.log('✅ Order created successfully:', order);
              
              // Clear cart
              clearCart();
              
              setOrderStatus('success');
              
              if (onOrderSuccess) {
                onOrderSuccess(order, details);
              }
              
              alert(`Payment completed by ${details.payer.name.given_name}! Order ID: ${order.orderId}`);

            } catch (error) {
              console.error('❌ Error creating order:', error);
              setOrderStatus('error');
              
              if (onOrderError) {
                onOrderError(error);
              }
              
              alert('Payment successful but order creation failed. Please contact support.');
            } finally {
              setIsProcessing(false);
            }
          });
        },

        // Handle payment errors
        onError: function (err) {
          console.error('❌ PayPal error:', err);
          setOrderStatus('error');
          setIsProcessing(false);
          
          if (onOrderError) {
            onOrderError(err);
          }
          
          alert('Payment failed. Please try again.');
        },

        // Handle payment cancellation
        onCancel: function (data) {
          console.log('🚫 PayPal payment cancelled:', data);
          setOrderStatus(null);
          setIsProcessing(false);
        }

      }).render("#paypal-button-container").catch((error) => {
        console.error('❌ PayPal buttons failed to render:', error);
        setPaypalError('Failed to initialize PayPal buttons. Please refresh the page and try again.');
      });
    } catch (error) {
      console.error('❌ Error initializing PayPal buttons:', error);
      setPaypalError('Failed to initialize PayPal buttons. Please refresh the page and try again.');
    }
  };

  useEffect(() => {
    console.log('🔄 PayPal button useEffect triggered:', { 
      itemsLength: items.length, 
      hasUser: !!currentUser,
      shippingCost 
    });
    
    // Only load PayPal if we have items and a user
    if (items.length > 0 && currentUser) {
      loadPayPalSDK();
    }

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [items, shippingInfo, shippingCost, getTotalPrice, clearCart, onOrderSuccess, onOrderError]);

  // Don't render if no items or user not logged in
  if (!items.length || !currentUser) {
    console.log('🚫 PayPal button not rendered:', { 
      itemsLength: items.length, 
      hasUser: !!currentUser,
      userEmail: currentUser?.email 
    });
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Debug Info - Remove in production */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        <strong>Debug Info:</strong> Items: {items.length}, User: {currentUser ? 'Yes' : 'No'}, 
        PayPal Loaded: {paypalLoaded ? 'Yes' : 'No'}, Error: {paypalError || 'None'}
      </div>

      {/* PayPal Marks - Shows PayPal branding */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-600 mb-2">
          <strong>💳 Pay with PayPal Account or Debit/Credit Card</strong>
        </div>
        <div className="text-xs text-gray-500">
          All payments processed securely by PayPal
        </div>
        <div className="text-xs text-gray-500 mt-1">
          No PayPal account? You can still pay with your card
        </div>
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

      {paypalError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="space-y-3">
            <div className="flex items-center justify-between">
              <span>{paypalError}</span>
              {retryCount < 3 && !isRetrying && (
                <button
                  onClick={retryPayPalLoad}
                  className="ml-2 text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              )}
            </div>
            
            {/* Fallback Payment Option */}
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Alternative Payment:</strong> Since PayPal is unavailable, you can place your order and we'll contact you for payment details.
              </p>
              <button
                onClick={handleFallbackOrder}
                disabled={isProcessing}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Place Order (Contact for Payment)'}
              </button>
            </div>
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

        {isRetrying && (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Retrying PayPal load...</span>
            </div>
          </div>
        )}
        
        <div id="paypal-button-container"></div>
      </div>

      {/* Payment Options Info */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>🔒 All payments processed securely by PayPal</p>
        <p>📧 You'll receive an email confirmation after payment</p>
        <p>💳 Supports PayPal accounts, Visa, Mastercard, Amex, and Discover</p>
        <p>🌍 International cards accepted</p>
      </div>
    </div>
  );
}