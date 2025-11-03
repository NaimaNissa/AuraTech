import React, { useEffect } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// PayPal Client ID - Use environment variable or fallback to provided ID
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AfIKN_uTLh6n04vCgjvlvmCkl7KpgJolXt0XsmLMDgLSDAv1ZfCFgPbJBNWsR2Pc1dECgghywJyCJtzt';

const PayPalProvider = ({ children }) => {
  // Log the client ID being used (for debugging)
  useEffect(() => {
    console.log('💳 PayPal Provider initialized');
    console.log('💳 Using PayPal Client ID:', PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 20)}...` : 'NOT SET');
    console.log('💳 Environment variable VITE_PAYPAL_CLIENT_ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID ? 'SET' : 'NOT SET');
  }, []);

  // Validate client ID
  if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID.length < 20) {
    console.error('❌ Invalid PayPal Client ID detected');
    console.error('💡 Please check your VITE_PAYPAL_CLIENT_ID environment variable');
  }

  const initialOptions = {
    clientId: PAYPAL_CLIENT_ID,
    currency: 'USD',
    intent: 'capture',
    components: 'buttons',
    enableFunding: 'card'
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;
