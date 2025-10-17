import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  ShoppingCart, 
  ArrowLeft,
  Trash2
} from 'lucide-react';

export default function WishlistPage({ onNavigate }) {
  const { items: wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { currentUser } = useAuth();
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  const handleAddToCart = (product) => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    const success = addItem(product, () => {
      setShowSignInPrompt(true);
    });
    
    if (success) {
      console.log('✅ Added to cart:', product);
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlist();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            You need to sign in to view your wishlist. Create an account or sign in to save your favorite products.
          </p>
          <Button onClick={() => onNavigate('auth')}>
            Sign In / Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => onNavigate('products')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
            </div>
          </div>
          
          {wishlistItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearWishlist}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Start adding products to your wishlist to save them for later.
            </p>
            <Button onClick={() => onNavigate('products')}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600">${product.price}</span>
                      <Badge variant="outline" className="text-xs">
                        In Stock
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
