import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';

const PayPalTest = () => {
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '10.00'
          }
        }
      ]
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      console.log('Payment completed:', details);
      alert(`Payment completed by ${details.payer.name.given_name}`);
    });
  };

  const onError = (err) => {
    console.error('PayPal error:', err);
    alert('Payment failed. Please try again.');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">PayPal Test</h2>
      <p className="text-gray-600 mb-6 text-center">
        Test PayPal integration with a $10.00 payment
      </p>
      
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        }}
      />
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>💳 Pay with PayPal or use your debit/credit card</p>
        <p>🔒 Secure payment processing</p>
      </div>
    </div>
  );
};

export default PayPalTest;
