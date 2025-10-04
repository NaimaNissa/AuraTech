// src/lib/shippingService.js
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';

// Default shipping costs for different countries
const DEFAULT_SHIPPING_COSTS = {
  'United States': 0,
  'Canada': 15,
  'United Kingdom': 25,
  'Germany': 20,
  'France': 20,
  'Australia': 30,
  'Japan': 25,
  'India': 20,
  'Brazil': 35,
  'Mexico': 20,
  'China': 15,
  'South Korea': 25,
  'Italy': 20,
  'Spain': 20,
  'Netherlands': 20,
  'Sweden': 25,
  'Norway': 30,
  'Denmark': 25,
  'Finland': 25,
  'Switzerland': 25,
  'Austria': 20,
  'Belgium': 20,
  'Poland': 15,
  'Czech Republic': 15,
  'Hungary': 15,
  'Portugal': 20,
  'Greece': 20,
  'Ireland': 25,
  'New Zealand': 35,
  'Singapore': 20,
  'Hong Kong': 20,
  'Taiwan': 20,
  'Thailand': 15,
  'Malaysia': 15,
  'Indonesia': 20,
  'Philippines': 20,
  'Vietnam': 15,
  'South Africa': 30,
  'Egypt': 25,
  'Nigeria': 30,
  'Kenya': 30,
  'Morocco': 25,
  'Tunisia': 25,
  'Algeria': 25,
  'Israel': 25,
  'Turkey': 20,
  'Russia': 25,
  'Ukraine': 20,
  'Argentina': 35,
  'Chile': 30,
  'Colombia': 30,
  'Peru': 30,
  'Venezuela': 35,
  'Ecuador': 30,
  'Uruguay': 35,
  'Paraguay': 35,
  'Bolivia': 35
};

// Get all shipping costs from Firebase
export const getShippingCosts = async () => {
  try {
    console.log('🚚 Fetching shipping costs from Firebase...');
    
    const shippingRef = collection(db, 'shippingCosts');
    const q = query(shippingRef, orderBy('country', 'asc'));
    const snapshot = await getDocs(q);
    
    const shippingCosts = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      shippingCosts[data.country] = {
        id: doc.id,
        country: data.country,
        cost: data.cost,
        currency: data.currency || 'USD',
        estimatedDays: data.estimatedDays || '5-7',
        updatedAt: data.updatedAt
      };
    });
    
    // If no shipping costs in Firebase, return defaults
    if (Object.keys(shippingCosts).length === 0) {
      console.log('⚠️ No shipping costs found, using defaults');
      return DEFAULT_SHIPPING_COSTS;
    }
    
    console.log(`✅ Found ${Object.keys(shippingCosts).length} shipping costs`);
    return shippingCosts;
  } catch (error) {
    console.error('❌ Error fetching shipping costs:', error);
    // Return defaults on error
    return DEFAULT_SHIPPING_COSTS;
  }
};

// Get shipping cost for a specific country
export const getShippingCostForCountry = async (country) => {
  try {
    const shippingCosts = await getShippingCosts();
    return shippingCosts[country] || { cost: 25, currency: 'USD', estimatedDays: '5-7' };
  } catch (error) {
    console.error('❌ Error getting shipping cost for country:', error);
    return { cost: 25, currency: 'USD', estimatedDays: '5-7' };
  }
};

// Add or update shipping cost for a country
export const updateShippingCost = async (country, cost, currency = 'USD', estimatedDays = '5-7') => {
  try {
    console.log('🚚 Updating shipping cost for:', country, cost);
    
    const shippingRef = collection(db, 'shippingCosts');
    
    // Check if country already exists
    const existingCosts = await getShippingCosts();
    const existingCost = existingCosts[country];
    
    if (existingCost) {
      // Update existing
      const docRef = doc(db, 'shippingCosts', existingCost.id);
      await updateDoc(docRef, {
        cost: parseFloat(cost),
        currency,
        estimatedDays,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Shipping cost updated');
    } else {
      // Add new
      await addDoc(shippingRef, {
        country,
        cost: parseFloat(cost),
        currency,
        estimatedDays,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Shipping cost added');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error updating shipping cost:', error);
    throw error;
  }
};

// Delete shipping cost for a country
export const deleteShippingCost = async (country) => {
  try {
    console.log('🗑️ Deleting shipping cost for:', country);
    
    const existingCosts = await getShippingCosts();
    const existingCost = existingCosts[country];
    
    if (existingCost) {
      const docRef = doc(db, 'shippingCosts', existingCost.id);
      await deleteDoc(docRef);
      console.log('✅ Shipping cost deleted');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error deleting shipping cost:', error);
    throw error;
  }
};

// Get list of all countries
export const getAllCountries = () => {
  return Object.keys(DEFAULT_SHIPPING_COSTS).sort();
};

// Initialize default shipping costs in Firebase
export const initializeDefaultShippingCosts = async () => {
  try {
    console.log('🚚 Initializing default shipping costs...');
    
    const existingCosts = await getShippingCosts();
    
    // Only add countries that don't exist
    const countriesToAdd = Object.keys(DEFAULT_SHIPPING_COSTS).filter(
      country => !existingCosts[country]
    );
    
    if (countriesToAdd.length === 0) {
      console.log('✅ All default shipping costs already exist');
      return;
    }
    
    const shippingRef = collection(db, 'shippingCosts');
    
    for (const country of countriesToAdd) {
      await addDoc(shippingRef, {
        country,
        cost: DEFAULT_SHIPPING_COSTS[country],
        currency: 'USD',
        estimatedDays: '5-7',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log(`✅ Added ${countriesToAdd.length} default shipping costs`);
  } catch (error) {
    console.error('❌ Error initializing default shipping costs:', error);
    throw error;
  }
};