import { useEffect, useState } from "react";
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../lib/orderService';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuraTechPayPalButton({ 
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

  // Calculate order total including shipping and tax
  const calculateOrderTotal = () => {
    const subtotal = getTotalPrice();
    const tax = (subtotal + shippingCost) * 0.08; // 8% tax
    return (subtotal + shippingCost + tax).toFixed(2);
  };

  // Handle fallback order (manual payment)
  const handleFallbackOrder = async () => {
    try {
      setIsProcessing(true);
      setOrderStatus(null);
      
      console.log('🔄 Creating fallback order...');
      console.log('🔄 Cart items:', items);
      console.log('🔄 Shipping info:', shippingInfo);
      console.log('🔄 Shipping cost:', shippingCost);
      
      // Create order for each item in cart
      const orders = [];
      for (const item of items) {
        const orderData = {
          fullName: shippingInfo.fullName,
          email: shippingInfo.email,
          contact: shippingInfo.contact,
          address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: (item.price * item.quantity) + shippingCost, // Include shipping in total
          shippingCost: shippingCost,
          description: item.description || `${item.name} - ${item.brand || 'AuraTech'}`,
          note: 'Manual payment - customer will be contacted for payment details',
          paymentMethod: 'manual',
          paymentStatus: 'pending',
          productImage: item.image, // Include product image
          productColor: item.color || 'Default' // Include product color
        };
        
        console.log('🔄 Creating order for item:', item.name, 'with data:', orderData);
        console.log('🔄 Item image being passed:', item.image);
        console.log('🔄 ProductImage field:', orderData.productImage);
        const order = await createOrder(orderData);
        console.log('✅ Order created successfully:', order);
        orders.push(order);
      }
      
      // Clear cart after successful order creation
      clearCart();
      
      console.log('✅ Fallback order created successfully:', orders);
      setOrderStatus('success');
      
      // Call success callback
      if (onOrderSuccess) {
        onOrderSuccess({
          orders: orders,
          paymentMethod: 'manual',
          paymentId: 'manual-' + Date.now()
        });
      }
      
    } catch (error) {
      console.error('❌ Fallback order creation failed:', error);
      setOrderStatus('error');
      if (onOrderError) {
        onOrderError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Load PayPal SDK with AuraTech business client ID
  useEffect(() => {
    if (!items.length || !currentUser) return;

    console.log('🔄 Loading AuraTech PayPal SDK...');
    
    // Check if we're on HTTPS (required for PayPal)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.log('⚠️ PayPal requires HTTPS for production. Using manual payment fallback.');
      setPaypalError('PayPal requires HTTPS for secure payments. Please use the manual payment option below.');
      return;
    }
    
    // Remove any existing PayPal scripts
    const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
    existingScripts.forEach(script => script.remove());

    // Create new script with AuraTech business client ID
    const script = document.createElement("script");
    // Use sandbox mode for development, live mode for production
    const isDevelopment = window.location.hostname === 'localhost';
    const clientId = isDevelopment 
      ? 'AfIKN_uTLh6n04vCgjvlvmCkl7KpgJolXt0XsmLMDgLSDAv1ZfCFgPbJBNWsR2Pc1dECgghywJyCJtzt' // Your live client ID
      : 'AfIKN_uTLh6n04vCgjvlvmCkl7KpgJolXt0XsmLMDgLSDAv1ZfCFgPbJBNWsR2Pc1dECgghywJyCJtzt';
    
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&enable-funding=card`;
    
    script.onload = () => {
      console.log('✅ AuraTech PayPal SDK loaded successfully');
      setPaypalLoaded(true);
      setPaypalError(null);
      
      if (window.paypal) {
        console.log('🔄 Initializing AuraTech PayPal buttons...');
        
        // Clear any existing buttons
        const container = document.getElementById('auratech-paypal-button-container');
        if (container) {
          container.innerHTML = '';
        }
        
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 50,
            tagline: true
          },
          
          // Create PayPal order
          createOrder: function(data, actions) {
            console.log('🔄 Creating AuraTech PayPal order...');
            const orderTotal = calculateOrderTotal();
            console.log('💰 Order total:', orderTotal);
            
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: orderTotal,
                  currency_code: 'USD',
                  breakdown: {
                    item_total: {
                      currency_code: 'USD',
                      value: getTotalPrice().toFixed(2)
                    },
                    shipping: {
                      currency_code: 'USD',
                      value: shippingCost.toFixed(2)
                    },
                    tax_total: {
                      currency_code: 'USD',
                      value: ((getTotalPrice() + shippingCost) * 0.08).toFixed(2)
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
                    full_name: shippingInfo.fullName
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
              }],
              application_context: {
                shipping_preference: 'SET_PROVIDED_ADDRESS'
              }
            });
          },
          
          // Handle payment approval
          onApprove: function(data, actions) {
            console.log('✅ AuraTech PayPal payment approved:', data);
            setIsProcessing(true);
            setOrderStatus(null);
            
            return actions.order.capture().then(async function(details) {
              console.log('💰 AuraTech payment captured:', details);
              
              try {
                // Create order in AuraTech system
                const orderData = {
                  fullName: shippingInfo.fullName,
                  email: shippingInfo.email,
                  contact: shippingInfo.contact,
                  address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`,
                  productName: items.map(item => `${item.name} (${item.quantity}x)`).join(', '),
                  quantity: items.reduce((total, item) => total + item.quantity, 0),
                  price: getTotalPrice(),
                  totalPrice: calculateOrderTotal(),
                  shippingCost: shippingCost,
                  description: `AuraTech Order via PayPal - ${items.length} items`,
                  note: `PayPal Transaction ID: ${details.id}`,
                  productImage: items[0]?.image || '', // Include first item's image
                  productColor: items[0]?.color || 'Default' // Include first item's color
                };

                const order = await createOrder(orderData);
                console.log('✅ AuraTech order created successfully:', order);
                
                // Clear cart
                clearCart();
                
                setOrderStatus('success');
                
                if (onOrderSuccess) {
                  onOrderSuccess(order, details);
                }
                
                alert(`Payment completed successfully! Order ID: ${order.orderId}\n\nThank you for choosing AuraTech!`);

              } catch (error) {
                console.error('❌ Error creating AuraTech order:', error);
                setOrderStatus('error');
                
                if (onOrderError) {
                  onOrderError(error);
                }
                
                alert('Payment successful but order creation failed. Please contact AuraTech support.');
              } finally {
                setIsProcessing(false);
              }
            });
          },
          
          // Handle payment errors
          onError: function(err) {
            console.error('❌ AuraTech PayPal error:', err);
            setOrderStatus('error');
            setIsProcessing(false);
            
            if (onOrderError) {
              onOrderError(err);
            }
            
            alert('Payment failed. Please try again or contact AuraTech support.');
          },
          
          // Handle payment cancellation
          onCancel: function(data) {
            console.log('🚫 AuraTech PayPal payment cancelled:', data);
            setOrderStatus(null);
            setIsProcessing(false);
          }
          
        }).render('#auratech-paypal-button-container').catch((error) => {
          console.error('❌ AuraTech PayPal buttons failed to render:', error);
          setPaypalError('Failed to initialize PayPal buttons. Please refresh the page and try again.');
        });
      }
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load AuraTech PayPal SDK:', error);
      console.error('❌ Client ID being used:', 'AfIKN_uTLh6n04vCgjvlvmCkl7KpgJolXt0XsmLMDgLSDAv1ZfCFgPbJBNWsR2Pc1dECgghywJyCJtzt');
      console.error('❌ Error details:', error);
      
      // Try with a test client ID to see if it's a client ID issue
      console.log('🔄 Trying with PayPal test client ID...');
      const testScript = document.createElement("script");
      testScript.src = `https://www.paypal.com/sdk/js?client-id=test&currency=USD&intent=capture`;
      
      testScript.onload = () => {
        console.log('✅ PayPal test client ID works - your client ID may be invalid');
        setPaypalError('Your PayPal client ID appears to be invalid. Please check your PayPal Developer Console and verify the client ID is correct and active.');
      };
      
      testScript.onerror = (testError) => {
        console.error('❌ Even test client ID failed:', testError);
        setPaypalError('PayPal service is currently unavailable. This may be a network issue or PayPal service outage. Please try again later or contact support.');
      };
      
      document.body.appendChild(testScript);
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
      {/* Debug Info */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        <strong>Debug:</strong> Items: {items.length}, User: {currentUser ? 'Yes' : 'No'}, 
        PayPal Loaded: {paypalLoaded ? 'Yes' : 'No'}, Error: {paypalError || 'None'}
      </div>

      {/* AuraTech PayPal Header */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-600 mb-2">
          <strong>💳 Pay with PayPal Account or Debit/Credit Card</strong>
        </div>
        <div className="text-xs text-gray-500">
          Secure payment processing by PayPal for AuraTech
        </div>
        <div className="text-xs text-gray-500 mt-1">
          No PayPal account? You can still pay with your card through PayPal
        </div>
      </div>

      {/* Order Status Messages */}
      {orderStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment successful! Your AuraTech order has been placed and you will receive a confirmation email shortly.
          </AlertDescription>
        </Alert>
      )}

      {orderStatus === 'error' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Payment failed. Please try again or contact AuraTech support if the problem persists.
          </AlertDescription>
        </Alert>
      )}

      {paypalError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="space-y-3">
            <div>{paypalError}</div>
            
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
              <span className="font-medium">Processing AuraTech payment...</span>
            </div>
          </div>
        )}

        {!paypalLoaded && !paypalError && (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Loading AuraTech PayPal...</span>
            </div>
          </div>
        )}
        
        <div id="auratech-paypal-button-container"></div>
      </div>

      {/* Manual Order Option - Always Available */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Need Help with Payment?</h4>
        <p className="text-sm text-blue-700 mb-3">
          Having trouble with PayPal? You can always place your order and we'll help you with payment.
        </p>
        <button
          onClick={handleFallbackOrder}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Place Order (Manual Payment)'}
        </button>
        <p className="text-xs text-blue-600 mt-2">
          We'll send you payment instructions via email after order confirmation.
        </p>
      </div>

      {/* Payment Options Info */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>🔒 All payments processed securely by PayPal for AuraTech</p>
        <p>📧 You'll receive an email confirmation after payment</p>
        <p>💳 Supports PayPal accounts, Visa, Mastercard, Amex, and Discover</p>
        <p>🌍 International cards accepted worldwide</p>
        <p>🏢 Powered by AuraTech Business PayPal Account</p>
      </div>
    </div>
  );
}
