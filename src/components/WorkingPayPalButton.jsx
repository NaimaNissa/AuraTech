import React, { useState, useEffect } from 'react';
import { PayPalButtons, PayPalMarks, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../lib/orderService';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
  const [orderStatus, setOrderStatus] = useState(null); // 'success', 'error', null
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  
  // Detect if running in production (Vercel/Netlify) or localhost
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // Debug PayPal SDK loading status
  useEffect(() => {
    console.log('💳 PayPal SDK Status:', { isPending, isResolved, isRejected });
    if (isResolved) {
      console.log('✅ PayPal SDK loaded and ready!');
    }
    if (isRejected) {
      console.error('❌ PayPal SDK failed to load');
    }
  }, [isPending, isResolved, isRejected]);

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

      // IMPORTANT: Capture the payment FIRST
      const details = await actions.order.capture();
      console.log('💰 Payment captured successfully:', details);
      
      // Store payment details for order creation
      setPaymentDetails(details);

      // Validate payment was successful
      if (details.status !== 'COMPLETED') {
        throw new Error(`Payment not completed. Status: ${details.status}`);
      }

      // Now create order in our database ONLY after successful payment
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

      console.log('📦 Creating order in database with payment details:', orderData);
      
      // Create order in Firebase
      const order = await createOrder(orderData);
      console.log('📦 Order created in database:', order);

      // Clear cart only after successful order creation
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
  };

  // Handle PayPal errors
  const onError = (err) => {
    console.error('❌ PayPal error:', err);
    setOrderStatus('error');
    
    if (onOrderError) {
      onOrderError(err);
    }
    
    alert('Payment failed. Please try again or contact support if the problem persists.');
  };

  // Handle cancellation
  const onCancel = (data) => {
    console.log('🚫 PayPal payment cancelled:', data);
    setOrderStatus(null);
  };

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
      {/* PayPal Marks - Shows PayPal branding */}
      <div className="text-center">
        <PayPalMarks />
      </div>

      {/* PayPal SDK Loading State */}
      {isPending && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading PayPal checkout...
          </AlertDescription>
        </Alert>
      )}

      {/* PayPal SDK Error State */}
      {isRejected && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load PayPal. Please refresh the page and try again. If the problem persists, contact support.
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

      {/* PayPal Buttons - Only show when SDK is loaded */}
      {isResolved && (
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
      )}

      {/* Payment Options Info - Only show when SDK is ready */}
      {isResolved && (
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

      {/* Show error message if SDK failed to load */}
      {isRejected && (
        <div className="text-center text-sm text-red-600 space-y-1">
          <p>❌ PayPal checkout is temporarily unavailable</p>
          <p>Please refresh the page or try again in a moment</p>
          <p>If the problem persists, please contact support</p>
        </div>
      )}
    </div>
  );
};

export default WorkingPayPalButton;