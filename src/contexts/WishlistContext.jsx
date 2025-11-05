import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

// Helper functions for localStorage
const getWishlistStorageKey = (userId) => `wishlist_${userId}`;

const loadWishlistFromStorage = (userId) => {
  try {
    const key = getWishlistStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const items = JSON.parse(stored);
      return Array.isArray(items) ? items : [];
    }
  } catch (error) {
    console.error('❌ Error loading wishlist from localStorage:', error);
  }
  return [];
};

const saveWishlistToStorage = (userId, items) => {
  try {
    const key = getWishlistStorageKey(userId);
    if (items.length > 0) {
      localStorage.setItem(key, JSON.stringify(items));
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('❌ Error saving wishlist to localStorage:', error);
  }
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state; // Already in wishlist
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: []
      };

    case 'RESTORE_WISHLIST':
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
};

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });
  const { currentUser } = useAuth();
  const hasRestoredRef = useRef(false);

  // Load wishlist from localStorage when user changes or on mount
  useEffect(() => {
    if (currentUser?.uid) {
      const savedItems = loadWishlistFromStorage(currentUser.uid);
      if (savedItems.length > 0 && !hasRestoredRef.current) {
        console.log('🔄 Restoring wishlist from localStorage for user:', currentUser.uid, savedItems.length, 'items');
        dispatch({ type: 'RESTORE_WISHLIST', payload: savedItems });
        hasRestoredRef.current = true;
      } else if (savedItems.length === 0) {
        hasRestoredRef.current = false;
      }
    } else {
      // User logged out - clear wishlist and reset restore flag
      dispatch({ type: 'CLEAR_WISHLIST' });
      hasRestoredRef.current = false;
    }
  }, [currentUser?.uid]); // Only depend on user ID, not state.items to avoid loops

  // Save wishlist to localStorage whenever items change (but not on initial restore)
  useEffect(() => {
    if (currentUser?.uid && hasRestoredRef.current) {
      // Only save if we've already restored (to avoid saving during restore)
      saveWishlistToStorage(currentUser.uid, state.items);
    }
  }, [state.items, currentUser?.uid]);

  const addToWishlist = (product) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    if (currentUser?.uid) {
      saveWishlistToStorage(currentUser.uid, []);
    }
  };

  const isInWishlist = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const getWishlistCount = () => {
    return state.items.length;
  };

  const value = {
    items: state.items,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
