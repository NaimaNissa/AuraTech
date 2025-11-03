import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../lib/orderService';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Your Live PayPal Client ID - confirmed from dashboard
const PAYPAL_CLIENT_ID = 'AfIKN_uTLh6n04vCgjvlvmCkl7KpgJolXt0XsmLMDgLSDAv1ZfCFgPbJBNWsR2Pc1dECgghywJyCJtzt';

const WorkingPayPalButton = ({ 
  shippingInfo, 
  shippingCost, 
  onOrderSuccess, 
  onOrderError,
  className = "" 
}) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [loading, setLoading] = useState(true);
  const buttonContainerRef = useRef(null);
  const paypalButtonsRef = useRef(null);
  
  // Detect if running in production (Vercel/Netlify) or localhost
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // Calculate order total including shipping and tax
  const calculateOrderTotal = () => {
    const subtotal = getTotalPrice();
    const tax = (subtotal + shippingCost) * 0.08; // 8% tax
    return (subtotal + shippingCost + tax).toFixed(2);
  };

  // Load PayPal SDK manually
  useEffect(() => {
    if (!items.length || !currentUser) return;

    console.log('💳 Loading PayPal SDK manually...');
    console.log('💳 Client ID:', PAYPAL_CLIENT_ID.substring(0, 20) + '...');

    // Check if PayPal SDK is already loaded
    if (window.paypal && window.paypal.Buttons) {
      console.log('✅ PayPal SDK already loaded');
      setPaypalLoaded(true);
      setLoading(false);
      return;
    }

    // Remove any existing PayPal scripts
    const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
    existingScripts.forEach(script => {
      console.log('🗑️ Removing existing PayPal script:', script.src);
      script.remove();
    });

    // Create new script element
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture&components=buttons,marks&enable-funding=card`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ PayPal SDK script loaded');
      
      // Wait for PayPal SDK to be fully initialized
      const checkPayPalReady = () => {
        if (window.paypal && typeof window.paypal.Buttons === 'function') {
          console.log('✅ PayPal SDK fully initialized!');
          console.log('✅ window.paypal.Buttons available');
          setPaypalLoaded(true);
          setLoading(false);
          setPaypalError(null);
        } else if (window.paypal && window.paypal.Buttons) {
          // Sometimes it's in a different structure, check for paypal.Buttons
          console.log('✅ PayPal SDK initialized (alternative structure)');
          setPaypalLoaded(true);
          setLoading(false);
          setPaypalError(null);
        } else {
          // Retry after a short delay
          console.log('⏳ Waiting for PayPal SDK to initialize...');
          setTimeout(checkPayPalReady, 100);
        }
      };
      
      // Start checking
      checkPayPalReady();
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (!paypalLoaded && !window.paypal) {
          console.error('❌ PayPal SDK timeout - SDK not initialized after 5 seconds');
          setPaypalError('PayPal SDK failed to initialize. Please refresh the page.');
          setLoading(false);
        }
      }, 5000);
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load PayPal SDK:', error);
      console.error('❌ Script URL:', script.src);
      setPaypalError('Failed to load PayPal SDK. Please check your network connection and try again.');
      setLoading(false);
      setPaypalLoaded(false);
    };

    // Add script to document
    document.body.appendChild(script);
    console.log('📜 PayPal script added to DOM');

    // Cleanup
    return () => {
      const script = document.querySelector(`script[src*="${PAYPAL_CLIENT_ID}"]`);
      if (script) {
        script.remove();
      }
    };
  }, [items.length, currentUser]);

  // Initialize PayPal buttons when SDK is loaded
  useEffect(() => {
    if (!paypalLoaded || !buttonContainerRef.current) return;
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address) return;

    // Wait for PayPal SDK to be ready with polling
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max (50 * 100ms)
    
    const waitForPayPal = setInterval(() => {
      retryCount++;
      
      if (!window.paypal) {
        if (retryCount >= maxRetries) {
          clearInterval(waitForPayPal);
          console.error('❌ window.paypal not available after timeout');
          setPaypalError('PayPal SDK failed to initialize. Please refresh the page.');
        }
        return;
      }

      // Check if Buttons is available - try multiple possible locations
      let paypalButtons = null;
      
      if (typeof window.paypal.Buttons === 'function') {
        paypalButtons = window.paypal.Buttons;
      } else if (window.paypal.buttons && typeof window.paypal.buttons === 'function') {
        paypalButtons = window.paypal.buttons;
      } else if (window.paypal.default && typeof window.paypal.default.Buttons === 'function') {
        paypalButtons = window.paypal.default.Buttons;
      }

      if (paypalButtons) {
        clearInterval(waitForPayPal);
        console.log('✅ PayPal Buttons function found!');
        console.log('window.paypal structure:', Object.keys(window.paypal));
        
        // Initialize buttons
        initializeButtons(paypalButtons);
      } else if (retryCount >= maxRetries) {
        clearInterval(waitForPayPal);
        console.error('❌ PayPal Buttons not available after timeout');
        console.error('window.paypal:', window.paypal);
        console.error('Available keys:', Object.keys(window.paypal || {}));
        if (window.paypal) {
          console.error('window.paypal.Buttons type:', typeof window.paypal.Buttons);
          console.error('window.paypal.Buttons value:', window.paypal.Buttons);
        }
        setPaypalError('PayPal Buttons API not available. Please refresh the page.');
      }
    }, 100);

    return () => clearInterval(waitForPayPal);
  }, [paypalLoaded, shippingInfo, shippingCost, items, initializeButtons]);

  // Function to initialize PayPal buttons
  const initializeButtons = React.useCallback((buttonsFunction) => {
    if (!buttonContainerRef.current) return;

    console.log('🔄 Initializing PayPal buttons...');

    // Clear existing buttons
    buttonContainerRef.current.innerHTML = '';

    try {
      const orderTotal = calculateOrderTotal();
      const subtotal = getTotalPrice();
      const tax = (subtotal + shippingCost) * 0.08;

      console.log('✅ Creating PayPal buttons instance...');
      console.log('💰 Order total:', orderTotal);

      // Create PayPal buttons using the passed function
      paypalButtonsRef.current = buttonsFunction({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 45,
          tagline: true
        },

        // Create PayPal order
        createOrder: (data, actions) => {
          console.log('🔄 Creating PayPal order...');
          console.log('💰 Order total:', orderTotal);

          return actions.order.create({
            purchase_units: [{
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
        onApprove: async (data, actions) => {
          try {
            setIsProcessing(true);
            setOrderStatus(null);
            console.log('✅ PayPal payment approved:', data.orderID);

            // Capture the payment
            const details = await actions.order.capture();
            console.log('💰 Payment captured successfully:', details);

            // Validate payment was successful
            if (details.status !== 'COMPLETED') {
              throw new Error(`Payment not completed. Status: ${details.status}`);
            }

            // Create order in our database ONLY after successful payment
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
              description: `Order via PayPal - ${items.length} items`,
              note: `PayPal Transaction ID: ${details.id}, Status: ${details.status}`,
              productImage: items[0]?.image || '',
              productColor: items[0]?.color || 'Default',
              paymentMethod: 'paypal',
              paymentStatus: 'completed',
              paypalTransactionId: details.id
            };

            console.log('📦 Creating order in database...');
            const order = await createOrder(orderData);
            console.log('📦 Order created:', order.orderId);

            // Clear cart
            clearCart();

            // Set success status
            setOrderStatus('success');
            
            // Call success callback
            if (onOrderSuccess) {
              onOrderSuccess(order, details);
            }

            // Show success message
            alert(`Payment completed successfully!\n\nOrder ID: ${order.orderId}\nPayPal Transaction: ${details.id}\n\nThank you for your purchase!`);

          } catch (error) {
            console.error('❌ Error processing PayPal payment:', error);
            setOrderStatus('error');
            
            if (onOrderError) {
              onOrderError(error);
            }
            
            alert(`Payment processing failed: ${error.message}\n\nPlease try again or contact support.`);
          } finally {
            setIsProcessing(false);
          }
        },

        // Handle errors
        onError: (err) => {
          console.error('❌ PayPal error:', err);
          setOrderStatus('error');
          setIsProcessing(false);
          
          if (onOrderError) {
            onOrderError(err);
          }
          
          alert('Payment failed. Please try again or contact support if the problem persists.');
        },

        // Handle cancellation
        onCancel: (data) => {
          console.log('🚫 PayPal payment cancelled:', data);
          setOrderStatus(null);
        }

      }).render(buttonContainerRef.current).then(() => {
        console.log('✅ PayPal buttons rendered successfully');
      }).catch((error) => {
        console.error('❌ PayPal buttons failed to render:', error);
        setPaypalError('Failed to render PayPal buttons. Please refresh the page.');
      });

    } catch (error) {
      console.error('❌ Error initializing PayPal buttons:', error);
      setPaypalError(`Failed to initialize PayPal buttons: ${error.message}. Please refresh the page.`);
    }
  }, [items, shippingInfo, shippingCost, getTotalPrice, clearCart, onOrderSuccess, onOrderError]);

  // Don't render if no items or user not logged in
  if (!items.length || !currentUser) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {!items.length ? 'Please add items to your cart first.' : 'Please sign in to continue with payment.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Validate shipping info
  if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Please complete all shipping information before proceeding with payment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Loading State */}
      {loading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading PayPal checkout...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {paypalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {paypalError}
          </AlertDescription>
        </Alert>
      )}

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

      {/* PayPal Buttons Container */}
      {paypalLoaded && (
        <div className="relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Processing payment...</span>
              </div>
            </div>
          )}
          
          {/* PayPal button container */}
          <div ref={buttonContainerRef} id="paypal-button-container"></div>
        </div>
      )}

      {/* Payment Options Info */}
      {paypalLoaded && (
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>💳 Pay with PayPal or use your debit/credit card</p>
          <p>🔒 Secure payment processing by PayPal</p>
          <p>📧 You'll receive an email confirmation after payment</p>
          <p>💰 Order total: ${calculateOrderTotal()} (includes tax and shipping)</p>
          {isProduction ? (
            <p className="text-green-600 font-medium">✅ Production environment - Full PayPal functionality enabled</p>
          ) : (
            <p className="text-blue-600 font-medium">⚠️ Development mode - Deploy to Vercel for full PayPal functionality</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkingPayPalButton;
