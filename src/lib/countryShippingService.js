// Country-based shipping service that syncs with dashboard
import { collection, getDocs, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase';

// Fetch shipping costs from dashboard
export const getDashboardShippingCosts = async () => {
  try {
    console.log('🚚 Fetching shipping costs from dashboard...');
    
    const shippingRef = collection(db, 'shippingCosts');
    const q = query(shippingRef, orderBy('country', 'asc'));
    const snapshot = await getDocs(q);
    
    const costs = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      costs[data.country.toLowerCase()] = {
        id: doc.id,
        country: data.country,
        cost: parseFloat(data.cost) || 0,
        currency: data.currency || 'USD',
        estimatedDays: data.estimatedDays || '5-7',
        isActive: data.isActive !== false // Default to true if not specified
      };
    });
    
    console.log('✅ Loaded shipping costs from dashboard:', Object.keys(costs).length, 'countries');
    return costs;
  } catch (error) {
    console.error('❌ Error fetching dashboard shipping costs:', error);
    return {};
  }
};

// Get list of countries from dashboard
export const getDashboardCountries = async () => {
  try {
    console.log('🌍 Fetching countries from dashboard...');
    
    const shippingRef = collection(db, 'shippingCosts');
    const q = query(shippingRef, orderBy('country', 'asc'));
    const snapshot = await getDocs(q);
    
    const countries = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isActive !== false) { // Only include active countries
        countries.push({
          id: doc.id,
          name: data.country,
          cost: parseFloat(data.cost) || 0,
          currency: data.currency || 'USD',
          estimatedDays: data.estimatedDays || '5-7'
        });
      }
    });
    
    console.log('✅ Loaded countries from dashboard:', countries.length, 'countries');
    return countries;
  } catch (error) {
    console.error('❌ Error fetching dashboard countries:', error);
    return [];
  }
};

// Default shipping rates by country (fallback if no dashboard rates found)
const DEFAULT_COUNTRY_RATES = {
  // North America
  'united states': 5.99,
  'usa': 5.99,
  'us': 5.99,
  'canada': 12.99,
  'mexico': 15.99,
  
  // Europe
  'united kingdom': 18.99,
  'uk': 18.99,
  'germany': 16.99,
  'france': 16.99,
  'italy': 17.99,
  'spain': 17.99,
  'netherlands': 16.99,
  'belgium': 16.99,
  'switzerland': 22.99,
  'austria': 18.99,
  'sweden': 19.99,
  'norway': 24.99,
  'denmark': 18.99,
  
  // Asia Pacific
  'australia': 24.99,
  'new zealand': 26.99,
  'japan': 22.99,
  'south korea': 20.99,
  'singapore': 18.99,
  'hong kong': 16.99,
  'taiwan': 18.99,
  'thailand': 15.99,
  'malaysia': 16.99,
  'philippines': 17.99,
  'indonesia': 18.99,
  'vietnam': 16.99,
  
  // South Asia
  'india': 14.99,
  'pakistan': 16.99,
  'bangladesh': 15.99,
  'sri lanka': 17.99,
  'nepal': 18.99,
  
  // Middle East
  'united arab emirates': 19.99,
  'uae': 19.99,
  'saudi arabia': 21.99,
  'israel': 18.99,
  'turkey': 16.99,
  'iran': 22.99,
  'iraq': 25.99,
  'jordan': 20.99,
  'lebanon': 19.99,
  
  // Africa
  'south africa': 22.99,
  'egypt': 19.99,
  'nigeria': 21.99,
  'kenya': 23.99,
  'morocco': 20.99,
  'ghana': 22.99,
  
  // South America
  'brazil': 26.99,
  'argentina': 24.99,
  'chile': 23.99,
  'colombia': 21.99,
  'peru': 22.99,
  'venezuela': 25.99,
  'ecuador': 23.99,
  'uruguay': 25.99,
  
  // Default for unlisted countries
  'default': 29.99
};

// Parse country from address
const parseCountryFromAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return 'default';
  }
  
  const addressLower = address.toLowerCase().trim();
  const parts = addressLower.split(',').map(part => part.trim());
  
  // Country is usually the last part of the address
  const lastPart = parts[parts.length - 1];
  
  // Check if any part of the address matches known countries
  for (const part of parts) {
    for (const country in DEFAULT_COUNTRY_RATES) {
      if (part.includes(country) || country.includes(part)) {
        console.log(`🌍 Detected country: ${country} from address part: ${part}`);
        return country;
      }
    }
  }
  
  console.log(`🌍 No specific country detected, using: ${lastPart}`);
  return lastPart || 'default';
};

// Get shipping rates from dashboard (Firebase shipments collection)
export const getDashboardShippingRates = async () => {
  try {
    console.log('🔍 Fetching shipping rates from dashboard...');
    
    const shipmentsRef = collection(db, 'shipments');
    const snapshot = await getDocs(shipmentsRef);
    
    const dashboardRates = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.Address && data.ShippingCost) {
        const country = parseCountryFromAddress(data.Address);
        const cost = parseFloat(data.ShippingCost) || 0;
        
        // Use the lowest cost if multiple rates exist for same country
        if (!dashboardRates[country] || cost < dashboardRates[country]) {
          dashboardRates[country] = cost;
        }
      }
    });
    
    console.log('✅ Dashboard shipping rates loaded:', dashboardRates);
    return dashboardRates;
  } catch (error) {
    console.error('❌ Error fetching dashboard shipping rates:', error);
    return {};
  }
};

// Calculate shipping cost based on country
export const calculateCountryShippingCost = async (address, orderTotal = 0) => {
  try {
    console.log('🚚 Calculating country-based shipping for:', address);
    console.log('💰 Order total:', orderTotal);
    
    // Free shipping for orders over $150
    if (orderTotal >= 150) {
      console.log('🎉 Free shipping applied (order over $150)');
      return {
        cost: 0,
        country: 'free',
        method: 'Free International Shipping',
        deliveryDays: '5-10',
        reason: 'Order over $150'
      };
    }
    
    const country = parseCountryFromAddress(address);
    
    // Try to get rates from dashboard first
    const dashboardCosts = await getDashboardShippingCosts();
    let shippingData = dashboardCosts[country];
    
    // Fallback to default rates if not found in dashboard
    if (!shippingData || !shippingData.isActive) {
      const defaultCost = DEFAULT_COUNTRY_RATES[country] || DEFAULT_COUNTRY_RATES['default'];
      console.log(`📋 Using default rate for ${country}: $${defaultCost}`);
      shippingData = {
        cost: defaultCost,
        country: address.country || 'United States',
        currency: 'USD',
        estimatedDays: '5-7'
      };
    } else {
      console.log(`🎯 Using dashboard rate for ${country}: $${shippingData.cost}`);
    }
    
    // Determine delivery timeframe based on region
    let deliveryDays = '7-14'; // Default international
    
    if (['united states', 'usa', 'us'].includes(country)) {
      deliveryDays = '3-5';
    } else if (['canada', 'mexico'].includes(country)) {
      deliveryDays = '5-8';
    } else if (['united kingdom', 'uk', 'germany', 'france', 'italy', 'spain', 'netherlands'].includes(country)) {
      deliveryDays = '5-10';
    } else if (['australia', 'japan', 'singapore', 'hong kong'].includes(country)) {
      deliveryDays = '7-12';
    } else if (['bangladesh', 'india', 'pakistan', 'sri lanka'].includes(country)) {
      deliveryDays = '10-15';
    }
    
    const result = {
      cost: shippingData.cost,
      country: shippingData.country,
      method: `International Shipping to ${shippingData.country}`,
      deliveryDays: shippingData.estimatedDays || deliveryDays,
      currency: shippingData.currency || 'USD',
      reason: `Shipping to ${shippingData.country}`
    };
    
    console.log('✅ Country shipping calculation complete:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error calculating country shipping cost:', error);
    
    // Fallback to default international rate
    return {
      cost: DEFAULT_COUNTRY_RATES['default'],
      country: 'default',
      method: 'International Shipping',
      deliveryDays: '10-21',
      reason: 'Default international rate due to calculation error'
    };
  }
};

// Get shipping options for country
export const getCountryShippingOptions = async (address, orderTotal = 0) => {
  try {
    const baseShipping = await calculateCountryShippingCost(address, orderTotal);
    
    // If free shipping applies, only show free option
    if (baseShipping.cost === 0) {
      return [baseShipping];
    }
    
    const baseCost = baseShipping.cost;
    const country = baseShipping.country;
    
    // Generate shipping options
    const options = [
      {
        id: 'standard',
        name: 'Standard International',
        cost: baseCost,
        deliveryDays: baseShipping.deliveryDays,
        description: `Regular delivery to ${country}`
      }
    ];
    
    // Add express option for major countries
    const majorCountries = ['united states', 'usa', 'us', 'canada', 'united kingdom', 'uk', 'germany', 'france', 'australia', 'japan'];
    if (majorCountries.includes(country)) {
      options.push({
        id: 'express',
        name: 'Express International',
        cost: baseCost * 1.6, // 60% more than standard
        deliveryDays: '3-7',
        description: `Faster delivery to ${country}`
      });
    }
    
    return options;
  } catch (error) {
    console.error('❌ Error getting country shipping options:', error);
    
    // Return default option
    return [
      {
        id: 'standard',
        name: 'International Shipping',
        cost: DEFAULT_COUNTRY_RATES['default'],
        deliveryDays: '10-21',
        description: 'International delivery'
      }
    ];
  }
};

// Validate international address
export const validateInternationalAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      errors: ['Address is required']
    };
  }
  
  const trimmedAddress = address.trim();
  
  if (trimmedAddress.length < 15) {
    return {
      isValid: false,
      errors: ['Please provide a complete international address with country']
    };
  }
  
  // Check if address contains country information
  const addressLower = trimmedAddress.toLowerCase();
  let hasCountry = false;
  
  for (const country in DEFAULT_COUNTRY_RATES) {
    if (addressLower.includes(country)) {
      hasCountry = true;
      break;
    }
  }
  
  if (!hasCountry) {
    return {
      isValid: false,
      errors: ['Please include your country in the address']
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
};

// Get list of supported countries for dropdown
export const getSupportedCountries = () => {
  const countries = Object.keys(DEFAULT_COUNTRY_RATES)
    .filter(country => country !== 'default')
    .map(country => ({
      code: country,
      name: country.charAt(0).toUpperCase() + country.slice(1).replace(/\b\w/g, l => l.toUpperCase()),
      rate: DEFAULT_COUNTRY_RATES[country]
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  return countries;
};

