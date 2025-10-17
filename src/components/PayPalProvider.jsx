import React from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// PayPal Client ID - Use environment variable or fallback to provided ID
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AfIKN_uTLh6n04vCgjvlvmCkl7KpgJolXt0XsmLMDgLSDAv1ZfCFgPbJBNWsR2Pc1dECgghywJyCJtzt';

const PayPalProvider = ({ children }) => {
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
    debug: process.env.NODE_ENV === 'development'
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;
