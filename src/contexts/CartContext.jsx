import { createContext, useContext, useReducer } from 'react';
import { createOrder } from '../lib/orderService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

const cartReducer = (state, action) => {
  console.log('🛒 Cart reducer action:', action.type, action.payload);
  console.log('🛒 Current state:', state);
  
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        const newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
        console.log('🛒 Updated existing item, new state:', newState);
        return newState;
      }
      const newState = {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
      console.log('🛒 Added new item, new state:', newState);
      return newState;

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { currentUser } = useAuth();

  const addItem = (product, onRequireAuth = null) => {
    console.log('🛒 Adding item to cart:', product);
    console.log('🛒 Current user:', currentUser);
    console.log('🛒 Current cart items:', state.items);
    
    if (!currentUser) {
      console.log('🛒 No user, showing sign-in prompt');
      // If user is not authenticated, call the callback to show sign-in prompt
      if (onRequireAuth) {
        onRequireAuth();
      }
      return false;
    }
    dispatch({ type: 'ADD_ITEM', payload: product });
    console.log('🛒 Item added to cart successfully');
    return true;
  };

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    // Find the item to check maxQuantity
    const item = state.items.find(item => item.id === productId);
    if (item && item.maxQuantity !== undefined) {
      // Validate against available stock
      const maxQuantity = item.maxQuantity || 0;
      const validQuantity = Math.max(0, Math.min(quantity, maxQuantity));
      if (validQuantity !== quantity) {
        console.warn(`⚠️ Quantity ${quantity} exceeds available stock (${maxQuantity}). Setting to ${validQuantity}`);
      }
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity: validQuantity } });
    } else {
      // If no maxQuantity stored, allow the update (backward compatibility)
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get tax for a specific quantity from tax array
  const getTaxForQuantity = (taxArray, quantity) => {
    if (!taxArray || !Array.isArray(taxArray) || taxArray.length === 0) {
      return 0;
    }
    
    // Sort by quantity descending to find the closest match
    const sortedTax = [...taxArray].sort((a, b) => b.quantity - a.quantity);
    
    // Find the tax entry with quantity <= requested quantity
    for (const taxEntry of sortedTax) {
      if (taxEntry.quantity <= quantity) {
        return parseFloat(taxEntry.taxAmount) || 0;
      }
    }
    
    // If no match found, return 0
    return 0;
  };

  const getTotalTax = () => {
    return state.items.reduce((total, item) => {
      const itemTax = getTaxForQuantity(item.tax, item.quantity);
      return total + itemTax;
    }, 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const createOrderFromCart = async (customerInfo) => {
    try {
      console.log('🛒 Creating order from cart with customer info:', customerInfo);
      console.log('🛒 Cart items:', state.items);
      
      const orders = [];
      
      // Create an order for each item in the cart
      for (const item of state.items) {
        const itemTax = getTaxForQuantity(item.tax, item.quantity);
        const orderData = {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          contact: customerInfo.contact,
          address: customerInfo.address,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          tax: itemTax,
          totalPrice: (item.price * item.quantity) + itemTax + (customerInfo.shippingCost || 0), // Include tax and shipping in total
          shippingCost: customerInfo.shippingCost || 0,
          description: item.description || `${item.name} - ${item.brand || 'AuraTech'}`,
          note: customerInfo.note || '',
          productImage: item.image, // Include product image
          productColor: item.color || 'Default' // Include product color
        };
        
        console.log('🛒 Creating order for item:', item.name, 'with data:', orderData);
        console.log('🛒 Item image being passed:', item.image);
        console.log('🛒 ProductImage field:', orderData.productImage);
        const order = await createOrder(orderData);
        console.log('🛒 Order created successfully:', order);
        orders.push(order);
      }
      
      // Clear cart after successful order creation
      clearCart();
      
      return orders;
    } catch (error) {
      console.error('❌ Error creating order from cart:', error);
      console.error('❌ Customer info:', customerInfo);
      console.error('❌ Cart items:', state.items);
      console.error('❌ Error details:', error.message, error.code);
      throw error;
    }
  };

  const value = {
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalTax,
    getTaxForQuantity,
    getTotalItems,
    createOrderFromCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

