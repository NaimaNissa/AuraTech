import React, { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PayPalTest = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Detect if running in production (Vercel/Netlify) or localhost
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const createOrder = (data, actions) => {
    addLog('🔄 Creating PayPal test order...');
    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '10.00'
        },
        description: 'AuraTech PayPal Test Order'
      }]
    });
  };

  const onApprove = async (data, actions) => {
    try {
      setIsProcessing(true);
      setOrderStatus(null);
      addLog('✅ PayPal payment approved: ' + data.orderID);

      const details = await actions.order.capture();
      addLog('💰 Payment captured: ' + details.status);
      
      if (details.status === 'COMPLETED') {
        addLog('✅ Payment completed successfully!');
        setOrderStatus('success');
      } else {
        addLog('❌ Payment not completed. Status: ' + details.status);
        setOrderStatus('error');
      }
    } catch (error) {
      addLog('❌ Error: ' + error.message);
      setOrderStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const onError = (err) => {
    addLog('❌ PayPal error: ' + JSON.stringify(err));
    setOrderStatus('error');
  };

  const onCancel = (data) => {
    addLog('🚫 Payment cancelled: ' + data.orderID);
    setOrderStatus(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">PayPal Integration Test</h1>
        <p className="text-gray-600">Testing AuraTech PayPal integration</p>
        {isProduction ? (
          <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-800 font-medium">✅ Production Environment - Full PayPal functionality enabled</p>
          </div>
        ) : (
          <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-blue-800 font-medium">⚠️ Development Mode - Deploy to Vercel for full PayPal functionality</p>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {orderStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ PayPal test successful! Payment processed correctly.
          </AlertDescription>
        </Alert>
      )}

      {orderStatus === 'error' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            ❌ PayPal test failed. Check the logs below for details.
          </AlertDescription>
        </Alert>
      )}

      {/* PayPal Button */}
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8">
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Processing payment...</span>
            </div>
          </div>
        )}
        
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">Test Payment: $10.00</h3>
          <p className="text-sm text-gray-600">This is a test payment to verify PayPal integration</p>
        </div>

        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 45
          }}
        />
      </div>

      {/* Logs */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Test Logs:</h4>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No logs yet. Click the PayPal button to start testing.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-sm font-mono text-gray-700">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Test Instructions:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Click the PayPal button above</li>
          <li>Complete the payment process (use PayPal sandbox for testing)</li>
          <li>Check the logs to see if payment was processed correctly</li>
          <li>Verify that order status shows "success" after payment</li>
        </ol>
      </div>
    </div>
  );
};

export default PayPalTest;