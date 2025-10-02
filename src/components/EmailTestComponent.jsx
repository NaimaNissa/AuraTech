import React, { useState } from 'react';
import { sendLoginWelcomeEmailSimple, sendOrderConfirmationEmailSimple } from '../lib/emailService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailTestComponent() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (result) => {
    setTestResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
  };

  const testLoginEmail = async () => {
    setIsLoading(true);
    try {
      const userData = {
        email: 'customer@example.com',
        displayName: 'Test Customer',
        uid: 'test-uid-123'
      };

      const result = await sendLoginWelcomeEmailSimple(userData);
      
      addTestResult({
        type: 'login',
        success: result.success,
        message: result.success ? 'Login welcome email prepared successfully!' : `Failed: ${result.error}`,
        timestamp: new Date().toLocaleTimeString(),
        details: result.success ? `To: ${result.recipient}` : null
      });
    } catch (error) {
      addTestResult({
        type: 'login',
        success: false,
        message: `Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testOrderEmail = async () => {
    setIsLoading(true);
    try {
      const orderData = {
        OrderID: 'ORD-TEST-' + Date.now(),
        customerEmail: 'customer@example.com',
        fullName: 'Test Customer',
        productname: 'Test Product - Wireless Headphones',
        Quantity: '2',
        Price: '149.99',
        TotalPrice: '319.98',
        shippingCost: '19.99',
        Status: 'confirmed',
        Address: '123 Test Street, Test City, TC 12345, Test Country',
        createdAt: new Date().toISOString()
      };

      const result = await sendOrderConfirmationEmailSimple(orderData);
      
      addTestResult({
        type: 'order',
        success: result.success,
        message: result.success ? 'Order confirmation email prepared successfully!' : `Failed: ${result.error}`,
        timestamp: new Date().toLocaleTimeString(),
        details: result.success ? `Order: ${result.orderID} | To: ${result.recipient}` : null
      });
    } catch (error) {
      addTestResult({
        type: 'order',
        success: false,
        message: `Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email System Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={testLoginEmail}
            disabled={isLoading}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Mail className="h-4 w-4" />
            Test Login Email
          </Button>
          
          <Button
            onClick={testOrderEmail}
            disabled={isLoading}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Mail className="h-4 w-4" />
            Test Order Email
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <Alert key={index} variant={result.success ? "default" : "destructive"}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <span className="font-medium capitalize">{result.type} Email:</span>
                        <span className="text-xs text-gray-500">{result.timestamp}</span>
                      </div>
                      <div>{result.message}</div>
                      {result.details && (
                        <div className="text-xs text-gray-600 mt-1">{result.details}</div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> This is a test interface. In production, emails would be sent automatically via EmailJS or another email service to the actual customer email addresses.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
