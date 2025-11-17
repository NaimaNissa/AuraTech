import React, { useState, useEffect } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../lib/orderService';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const WorkingPayPalButton = ({ 
  shippingInfo, 
  shippingCost, 
  onOrderSuccess, 
  onOrderError,
  className = "" 
}) => {
  const { items, getTotalPrice, getTotalTax, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [{ isPending, isResolved }] = usePayPalScriptReducer();
  
  // Validate shipping form before creating PayPal order
  const validateShippingForm = () => {
    const missingFields = [];
    if (!shippingInfo.fullName) missingFields.push('Full Name');
    if (!shippingInfo.email) missingFields.push('Email');
    if (!shippingInfo.contact) missingFields.push('Phone Number');
    if (!shippingInfo.address) missingFields.push('Address');
    if (!shippingInfo.city) missingFields.push('City');
    if (!shippingInfo.state) missingFields.push('State');
    if (!shippingInfo.zipCode) missingFields.push('ZIP Code');
    if (!shippingInfo.country) missingFields.push('Country');
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  // Calculate order total
  const calculateOrderTotal = () => {
    const subtotal = getTotalPrice();
    const tax = getTotalTax();
    return (subtotal + tax + shippingCost).toFixed(2);
  };

  // Create PayPal order
  const createPayPalOrder = (data, actions) => {
    // Validate shipping form before creating order
    const validation = validateShippingForm();
    if (!validation.isValid) {
      const missingFieldsStr = validation.missingFields.join(', ');
      alert(`Please complete all shipping information before proceeding.\n\nMissing fields: ${missingFieldsStr}`);
      throw new Error(`Shipping form incomplete. Missing: ${missingFieldsStr}`);
    }

    const orderTotal = calculateOrderTotal();
    const subtotal = getTotalPrice();
    const tax = getTotalTax();

    const breakdown = {
      item_total: { currency_code: 'USD', value: subtotal.toFixed(2) },
      shipping: { currency_code: 'USD', value: shippingCost.toFixed(2) }
    };
    
    if (tax > 0) {
      breakdown.tax_total = { currency_code: 'USD', value: tax.toFixed(2) };
    }

    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: orderTotal,
          breakdown: breakdown
        },
        items: items.map(item => ({
          name: item.name && item.name.length > 127 ? item.name.substring(0, 127) : (item.name || 'Product'),
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
  };

  // Handle payment approval
  const onApprove = async (data, actions) => {
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
        tax: getTotalTax(),
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
  };

  // Handle errors
  const onError = (err) => {
    console.error('❌ PayPal error:', err);
    setOrderStatus('error');
    setIsProcessing(false);
    if (onOrderError) onOrderError(err);
    alert('Payment failed. Please try again.');
  };

  // Handle cancellation
  const onCancel = () => {
    console.log('🚫 Payment cancelled');
    setOrderStatus(null);
  };

  if (!items.length || !currentUser) {
    return null;
  }

  // Validate shipping information
  const shippingIncomplete = !shippingInfo.fullName || 
                              !shippingInfo.email || 
                              !shippingInfo.contact ||
                              !shippingInfo.address || 
                              !shippingInfo.city || 
                              !shippingInfo.state || 
                              !shippingInfo.zipCode ||
                              !shippingInfo.country;

  return (
    <div className={`space-y-4 ${className}`}>
      {shippingIncomplete && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Please complete all shipping information before proceeding with payment.</strong>
            <br />
            Please fill in all required fields in the shipping form above.
          </AlertDescription>
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

      {isPending ? (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading PayPal checkout...</span>
        </div>
      ) : isResolved ? (
        <div className="relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Processing payment...</span>
              </div>
            </div>
          )}
          
          <div className={`border-2 rounded-lg p-4 ${shippingIncomplete ? 'border-red-300 bg-red-50 opacity-50 pointer-events-none' : 'border-gray-200'}`}>
            {shippingIncomplete ? (
              <div className="text-center py-4">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-red-600 font-medium">Please complete shipping information above</p>
                <p className="text-sm text-red-500 mt-1">Fill in all required fields to enable payment</p>
              </div>
            ) : (
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
                  height: 50
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
          <XCircle className="h-6 w-6 text-red-600 mr-3" />
          <span className="text-red-600">PayPal is not ready. Please refresh the page.</span>
        </div>
      )}
    </div>
  );
};

export default WorkingPayPalButton;
