import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, ShoppingCart, Heart } from 'lucide-react';

export default function SignInPrompt({ isOpen, onClose, onNavigate, action = 'add to cart' }) {
  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    onNavigate('auth');
  };

  const getActionText = () => {
    switch (action) {
      case 'wishlist':
        return 'add to wishlist';
      case 'cart':
      default:
        return 'add to cart';
    }
  };

  const getIcon = () => {
    switch (action) {
      case 'wishlist':
        return <Heart className="h-5 w-5" />;
      case 'cart':
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <CardTitle>Sign In Required</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              You need to sign in to {getActionText()}. Create an account or sign in to continue shopping.
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-3">
            <Button onClick={handleSignIn} className="flex-1">
              Sign In / Sign Up
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Continue Browsing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
