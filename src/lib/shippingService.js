// Shipping cost calculation service
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Default shipping rates (fallback if no specific rates found)
const DEFAULT_SHIPPING_RATES = {
  // Domestic shipping (same country)
  domestic: {
    standard: 5.99,
    express: 12.99,
    overnight: 24.99
  },
  // International shipping
  international: {
    standard: 15.99,
    express: 29.99,
    overnight: 49.99
  }
};

// Common city/state/country mappings for shipping zones
const SHIPPING_ZONES = {
  // Zone 1: Local/Same City (Cheapest)
  zone1: {
    cost: 3.99,
    deliveryDays: '1-2',
    cities: ['new york', 'nyc', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten island'],
    states: [],
    countries: []
  },
  // Zone 2: Same State/Region
  zone2: {
    cost: 7.99,
    deliveryDays: '2-3',
    cities: [],
    states: ['new york', 'ny', 'new jersey', 'nj', 'connecticut', 'ct', 'pennsylvania', 'pa'],
    countries: []
  },
  // Zone 3: Same Country
  zone3: {
    cost: 12.99,
    deliveryDays: '3-5',
    cities: [],
    states: ['california', 'ca', 'texas', 'tx', 'florida', 'fl', 'illinois', 'il', 'ohio', 'oh'],
    countries: ['united states', 'usa', 'us']
  },
  // Zone 4: International
  zone4: {
    cost: 24.99,
    deliveryDays: '7-14',
    cities: [],
    states: [],
    countries: ['canada', 'mexico', 'united kingdom', 'uk', 'germany', 'france', 'australia', 'japan']
  },
  // Zone 5: Remote International
  zone5: {
    cost: 39.99,
    deliveryDays: '14-21',
    cities: [],
    states: [],
    countries: ['other'] // Default for unlisted countries
  }
};

// Parse address components
const parseAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return { city: '', state: '', country: '', full: '' };
  }

  const addressLower = address.toLowerCase().trim();
  const parts = addressLower.split(',').map(part => part.trim());
  
  return {
    city: parts[0] || '',
    state: parts[1] || '',
    country: parts[parts.length - 1] || '',
    full: addressLower
  };
};

// Determine shipping zone based on address
const determineShippingZone = (address) => {
  const { city, state, country, full } = parseAddress(address);
  
  console.log('🗺️ Determining shipping zone for:', { city, state, country });
  
  // Check Zone 1 (Local cities)
  for (const zoneCity of SHIPPING_ZONES.zone1.cities) {
    if (city.includes(zoneCity) || full.includes(zoneCity)) {
      console.log('📍 Found Zone 1 (Local)');
      return 'zone1';
    }
  }
  
  // Check Zone 2 (Same state/region)
  for (const zoneState of SHIPPING_ZONES.zone2.states) {
    if (state.includes(zoneState) || full.includes(zoneState)) {
      console.log('📍 Found Zone 2 (Regional)');
      return 'zone2';
    }
  }
  
  // Check Zone 3 (Same country)
  for (const zoneState of SHIPPING_ZONES.zone3.states) {
    if (state.includes(zoneState) || full.includes(zoneState)) {
      console.log('📍 Found Zone 3 (National)');
      return 'zone3';
    }
  }
  
  for (const zoneCountry of SHIPPING_ZONES.zone3.countries) {
    if (country.includes(zoneCountry) || full.includes(zoneCountry)) {
      console.log('📍 Found Zone 3 (National)');
      return 'zone3';
    }
  }
  
  // Check Zone 4 (International)
  for (const zoneCountry of SHIPPING_ZONES.zone4.countries) {
    if (country.includes(zoneCountry) || full.includes(zoneCountry)) {
      console.log('📍 Found Zone 4 (International)');
      return 'zone4';
    }
  }
  
  // Default to Zone 5 (Remote International)
  console.log('📍 Defaulting to Zone 5 (Remote International)');
  return 'zone5';
};

// Calculate shipping cost based on address
export const calculateShippingCost = async (address, orderTotal = 0) => {
  try {
    console.log('🚚 Calculating shipping cost for address:', address);
    console.log('💰 Order total:', orderTotal);
    
    // Free shipping for orders over $100
    if (orderTotal >= 100) {
      console.log('🎉 Free shipping applied (order over $100)');
      return {
        cost: 0,
        zone: 'free',
        deliveryDays: '3-5',
        method: 'Free Shipping',
        reason: 'Order over $100'
      };
    }
    
    // Determine shipping zone
    const zone = determineShippingZone(address);
    const zoneData = SHIPPING_ZONES[zone];
    
    console.log('✅ Shipping calculation complete:', {
      zone,
      cost: zoneData.cost,
      deliveryDays: zoneData.deliveryDays
    });
    
    return {
      cost: zoneData.cost,
      zone,
      deliveryDays: zoneData.deliveryDays,
      method: `Standard Shipping (${zoneData.deliveryDays} business days)`,
      reason: `Shipping to ${zone.replace('zone', 'Zone ')}`
    };
    
  } catch (error) {
    console.error('❌ Error calculating shipping cost:', error);
    
    // Fallback to default shipping
    return {
      cost: DEFAULT_SHIPPING_RATES.domestic.standard,
      zone: 'default',
      deliveryDays: '5-7',
      method: 'Standard Shipping',
      reason: 'Default rate applied due to calculation error'
    };
  }
};

// Get shipping options for address (for checkout selection)
export const getShippingOptions = async (address, orderTotal = 0) => {
  try {
    const baseShipping = await calculateShippingCost(address, orderTotal);
    
    // If free shipping applies, only show free option
    if (baseShipping.cost === 0) {
      return [baseShipping];
    }
    
    const zone = baseShipping.zone;
    const baseCost = baseShipping.cost;
    
    // Generate shipping options based on zone
    const options = [
      {
        id: 'standard',
        name: 'Standard Shipping',
        cost: baseCost,
        deliveryDays: SHIPPING_ZONES[zone]?.deliveryDays || '5-7',
        description: 'Regular delivery'
      },
      {
        id: 'express',
        name: 'Express Shipping',
        cost: baseCost * 1.8, // 80% more than standard
        deliveryDays: '1-3',
        description: 'Faster delivery'
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        cost: baseCost * 3, // 3x standard cost
        deliveryDays: '1',
        description: 'Next business day delivery'
      }
    ];
    
    return options;
  } catch (error) {
    console.error('❌ Error getting shipping options:', error);
    
    // Return default options
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        cost: DEFAULT_SHIPPING_RATES.domestic.standard,
        deliveryDays: '5-7',
        description: 'Regular delivery'
      }
    ];
  }
};

// Validate shipping address
export const validateShippingAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      errors: ['Address is required']
    };
  }
  
  const trimmedAddress = address.trim();
  
  if (trimmedAddress.length < 10) {
    return {
      isValid: false,
      errors: ['Address must be at least 10 characters long']
    };
  }
  
  // Basic validation - should contain some address components
  const hasNumbers = /\d/.test(trimmedAddress);
  const hasCommas = trimmedAddress.includes(',');
  
  if (!hasNumbers && !hasCommas) {
    return {
      isValid: false,
      errors: ['Please provide a complete address with street number and city']
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
};

// Get shipping cost from Firebase shipment collection (if admin has set custom rates)
export const getCustomShippingRates = async (address) => {
  try {
    console.log('🔍 Checking for custom shipping rates...');
    
    const shipmentsRef = collection(db, 'shipments');
    const snapshot = await getDocs(shipmentsRef);
    
    // Look for matching address patterns in existing shipments
    const customRates = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.Address && data.ShippingCost) {
        customRates.push({
          address: data.Address,
          cost: parseFloat(data.ShippingCost) || 0
        });
      }
    });
    
    // Try to find a matching rate
    const addressLower = address.toLowerCase();
    for (const rate of customRates) {
      const rateAddressLower = rate.address.toLowerCase();
      
      // Simple matching - if addresses share common components
      const addressParts = addressLower.split(',').map(p => p.trim());
      const rateParts = rateAddressLower.split(',').map(p => p.trim());
      
      let matches = 0;
      for (const part of addressParts) {
        for (const ratePart of rateParts) {
          if (part.includes(ratePart) || ratePart.includes(part)) {
            matches++;
          }
        }
      }
      
      // If we have good matches, use this rate
      if (matches >= 2) {
        console.log('✅ Found custom shipping rate:', rate.cost);
        return rate.cost;
      }
    }
    
    console.log('ℹ️ No custom shipping rates found');
    return null;
  } catch (error) {
    console.error('❌ Error fetching custom shipping rates:', error);
    return null;
  }
};

