import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Default user profile structure
export const defaultUserProfile = {
  displayName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  preferences: {
    newsletter: true,
    smsNotifications: false,
    emailNotifications: true,
    language: 'en'
  },
  membership: {
    type: 'Gold',
    joinDate: new Date().toISOString().split('T')[0],
    points: 0
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Get user profile from Firestore
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      // Create default profile if user doesn't exist
      await createUserProfile(userId, defaultUserProfile);
      return defaultUserProfile;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Create user profile in Firestore
export const createUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Update user profile in Firestore
export const updateUserProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Order status constants
export const ORDER_STATUS = {
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Default order structure
export const defaultOrder = {
  id: '',
  userId: '',
  date: new Date().toISOString().split('T')[0],
  status: ORDER_STATUS.PROCESSING,
  total: 0,
  items: [],
  shippingAddress: {
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  paymentMethod: {
    type: 'credit_card',
    last4: '',
    brand: ''
  },
  trackingNumber: '',
  estimatedDelivery: '',
  actualDelivery: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Get user orders from Firestore
export const getUserOrders = async (userId) => {
  try {
    // In a real app, you would query the orders collection
    // For now, return mock data
    return [];
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

// Create new order in Firestore
export const createOrder = async (orderData) => {
  try {
    // In a real app, you would add to the orders collection
    console.log('Creating order:', orderData);
    return { id: `ORD-${Date.now()}`, ...orderData };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    // In a real app, you would update the order in Firestore
    console.log('Updating order status:', orderId, status);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
