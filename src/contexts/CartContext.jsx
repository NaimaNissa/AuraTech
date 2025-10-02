import { createContext, useContext, useReducer } from 'react';
import { createOrder } from '../lib/orderService';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

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

  const addItem = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const createOrderFromCart = async (customerInfo) => {
    try {
      const orders = [];
      
      // Create an order for each item in the cart
      for (const item of state.items) {
        const orderData = {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          contact: customerInfo.contact,
          address: customerInfo.address,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity,
          shippingCost: customerInfo.shippingCost || 0,
          description: item.description || `${item.name} - ${item.brand || 'AuraTech'}`,
          note: customerInfo.note || ''
        };
        
        const order = await createOrder(orderData);
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
    getTotalItems,
    createOrderFromCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

