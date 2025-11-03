import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../lib/orderService';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Your Live PayPal Client ID
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
  const initializedRef = useRef(false);
  
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // Calculate order total
  const calculateOrderTotal = () => {
    const subtotal = getTotalPrice();
    const tax = (subtotal + shippingCost) * 0.08;
    return (subtotal + shippingCost + tax).toFixed(2);
  };

  // Load PayPal SDK
  useEffect(() => {
    if (!items.length || !currentUser) return;
    if (initializedRef.current) return;

    console.log('💳 Loading PayPal SDK...');

    // Check if already loaded
    if (window.paypal && typeof window.paypal.Buttons === 'function') {
      console.log('✅ PayPal SDK already loaded');
      setPaypalLoaded(true);
      setLoading(false);
      initializedRef.current = true;
      return;
    }

    // Remove existing scripts
    document.querySelectorAll('script[src*="paypal.com/sdk"]').forEach(s => s.remove());

    // Create script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ PayPal script loaded');
      
      // Wait for SDK to initialize
      let attempts = 0;
      const checkReady = setInterval(() => {
        attempts++;
        
        if (window.paypal && typeof window.paypal.Buttons === 'function') {
          clearInterval(checkReady);
          console.log('✅ PayPal SDK ready');
          setPaypalLoaded(true);
          setLoading(false);
          initializedRef.current = true;
        } else if (attempts > 50) {
          clearInterval(checkReady);
          console.error('❌ PayPal SDK timeout');
          setPaypalError('PayPal failed to initialize. Please refresh.');
          setLoading(false);
        }
      }, 100);
    };

    script.onerror = () => {
      console.error('❌ PayPal script failed to load');
      setPaypalError('Failed to load PayPal. Please refresh.');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      initializedRef.current = false;
    };
  }, [items.length, currentUser]);

  // Initialize buttons when ready
  useEffect(() => {
    if (!paypalLoaded || !buttonContainerRef.current || initializedRef.current === false) return;
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address) return;
    if (!window.paypal || typeof window.paypal.Buttons !== 'function') return;

    // Prevent duplicate initialization
    if (buttonContainerRef.current.innerHTML.trim() !== '') return;

    console.log('🔄 Creating PayPal buttons...');

    const orderTotal = calculateOrderTotal();
    const subtotal = getTotalPrice();
    const tax = (subtotal + shippingCost) * 0.08;

    try {
      paypalButtonsRef.current = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 45
        },

        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: orderTotal,
                breakdown: {
                  item_total: { currency_code: 'USD', value: subtotal.toFixed(2) },
                  shipping: { currency_code: 'USD', value: shippingCost.toFixed(2) },
                  tax_total: { currency_code: 'USD', value: tax.toFixed(2) }
                }
              },
              items: items.map(item => ({
                name: item.name,
                unit_amount: { currency_code: 'USD', value: item.price.toFixed(2) },
                quantity: item.quantity.toString(),
                category: 'PHYSICAL_GOODS'
              })),
              shipping: {
                name: { full_name: shippingInfo.fullName },
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
            }]
          });
        },

        onApprove: async (data, actions) => {
          try {
            setIsProcessing(true);
            const details = await actions.order.capture();
            
            if (details.status !== 'COMPLETED') {
              throw new Error(`Payment not completed. Status: ${details.status}`);
            }

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
              note: `PayPal Transaction ID: ${details.id}`,
              productImage: items[0]?.image || '',
              productColor: items[0]?.color || 'Default',
              paymentMethod: 'paypal',
              paymentStatus: 'completed',
              paypalTransactionId: details.id
            };

            const order = await createOrder(orderData);
            clearCart();
            setOrderStatus('success');
            
            if (onOrderSuccess) {
              onOrderSuccess(order, details);
            }

            alert(`Payment completed!\n\nOrder ID: ${order.orderId}\nTransaction: ${details.id}\n\nThank you!`);

          } catch (error) {
            console.error('❌ Payment error:', error);
            setOrderStatus('error');
            if (onOrderError) onOrderError(error);
            alert(`Payment failed: ${error.message}`);
          } finally {
            setIsProcessing(false);
          }
        },

        onError: (err) => {
          console.error('❌ PayPal error:', err);
          setOrderStatus('error');
          setIsProcessing(false);
          if (onOrderError) onOrderError(err);
          alert('Payment failed. Please try again.');
        },

        onCancel: () => {
          console.log('🚫 Payment cancelled');
          setOrderStatus(null);
        }

      });

      paypalButtonsRef.current.render(buttonContainerRef.current).then(() => {
        console.log('✅ PayPal buttons rendered');
      }).catch((error) => {
        console.error('❌ Render error:', error);
        setPaypalError('Failed to render buttons. Please refresh.');
      });

    } catch (error) {
      console.error('❌ Init error:', error);
      setPaypalError(`Error: ${error.message}. Please refresh.`);
    }
  }, [paypalLoaded, shippingInfo, shippingCost, items, getTotalPrice, clearCart, onOrderSuccess, onOrderError]);

  // Don't render if no items or user
  if (!items.length || !currentUser) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {!items.length ? 'Please add items to cart first.' : 'Please sign in to continue.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Validate shipping
  if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Please complete all shipping information.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {loading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading PayPal checkout...</AlertDescription>
        </Alert>
      )}

      {paypalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{paypalError}</AlertDescription>
        </Alert>
      )}

      {orderStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment successful! Order placed.
          </AlertDescription>
        </Alert>
      )}

      {orderStatus === 'error' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Payment failed. Please try again.</AlertDescription>
        </Alert>
      )}

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
          <div ref={buttonContainerRef} id="paypal-button-container"></div>
        </div>
      )}

      {paypalLoaded && (
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>💳 Pay with PayPal or card</p>
          <p>🔒 Secure payment by PayPal</p>
          <p>💰 Total: ${calculateOrderTotal()} (includes tax & shipping)</p>
          {isProduction && (
            <p className="text-green-600 font-medium">✅ Production ready</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkingPayPalButton;
