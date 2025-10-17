import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function SimpleCheckoutPage({ onNavigate }) {
  console.log('🔄 SimpleCheckoutPage rendering...');
  
  try {
    const { items } = useCart();
    const { currentUser } = useAuth();
    
    console.log('📊 SimpleCheckoutPage data:', { 
      itemsCount: items?.length || 0, 
      hasUser: !!currentUser,
      userEmail: currentUser?.email 
    });

    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Simple Checkout Test</h1>
          
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Debug Information</h2>
            <div className="space-y-2 text-sm sm:text-base">
              <p><strong>Items in cart:</strong> {items?.length || 0}</p>
              <p><strong>User logged in:</strong> {currentUser ? 'Yes' : 'No'}</p>
              <p><strong>User email:</strong> {currentUser?.email || 'None'}</p>
            </div>
            
            {items && items.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Cart Items</h3>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between p-3 bg-gray-50 rounded">
                      <span>{item.name}</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Checkout Page is Working!</h3>
                  <p className="text-green-700">The checkout page loads successfully. The issue was with the complex component.</p>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Empty Cart</h3>
                <p className="text-yellow-700 mb-4">Add items to your cart first, then try checkout again.</p>
                <button 
                  onClick={() => onNavigate('home')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Go Shopping
                </button>
              </div>
            )}
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => onNavigate('home')}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-full sm:w-auto"
              >
                Back to Home
              </button>
              <button 
                onClick={() => onNavigate('cart')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ SimpleCheckoutPage error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Checkout Error</h1>
          <p className="text-gray-600 mb-6">Error: {error.message}</p>
          <button 
            onClick={() => onNavigate('home')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
}
