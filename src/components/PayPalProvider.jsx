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
    // Enable both PayPal and card payments
    components: 'buttons,marks,messages',
    // Enable guest checkout for users without PayPal accounts
    enableFunding: 'paylater,venmo,card',
    // Disable funding sources you don't want
    disableFunding: '',
    // Enable buyer country detection
    buyerCountry: 'US',
    // Enable vault for future payments (optional)
    vault: false,
    // Enable debug mode for development
    debug: process.env.NODE_ENV === 'development',
    // Data namespace to prevent conflicts if SDK is loaded multiple times
    dataNamespace: 'paypal_sdk_auratech'
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;
