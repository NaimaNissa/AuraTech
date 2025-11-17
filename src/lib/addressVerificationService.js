/**
 * Address Verification Service
 * Uses Google Maps Geocoding API to verify addresses
 * 
 * To use this service, you need to:
 * 1. Get a Google Maps API key from: https://console.cloud.google.com/google/maps-apis
 * 2. Enable the Geocoding API
 * 3. Add your API key to environment variables: VITE_GOOGLE_MAPS_API_KEY
 */

/**
 * Verify an address using Google Maps Geocoding API
 * @param {Object} addressData - Address object with street, city, state, zipCode, country
 * @returns {Promise<Object>} Verification result with isValid, formattedAddress, and suggestions
 */
export const verifyAddress = async (addressData) => {
  const { address, city, state, zipCode, country } = addressData;

  // Check if API key is configured
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Google Maps API key not configured. Address verification will use basic validation only.');
    return basicAddressValidation(addressData);
  }

  // Build the address string for geocoding
  const addressString = [
    address,
    city,
    state,
    zipCode,
    country
  ].filter(Boolean).join(', ');

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      return {
        isValid: false,
        formattedAddress: null,
        suggestions: [],
        confidence: 'low',
        message: 'Address not found. Please check and try again.'
      };
    }

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.address_components || [];
      
      // Extract address components
      const verifiedAddress = {
        street: getComponent(components, 'street_number') + ' ' + getComponent(components, 'route'),
        city: getComponent(components, 'locality') || getComponent(components, 'administrative_area_level_2'),
        state: getComponent(components, 'administrative_area_level_1'),
        zipCode: getComponent(components, 'postal_code'),
        country: getComponent(components, 'country')
      };

      // Check if the verified address matches the input
      const isExactMatch = checkAddressMatch(addressData, verifiedAddress, result.geometry.location_type);

      return {
        isValid: isExactMatch || result.geometry.location_type === 'ROOFTOP' || result.geometry.location_type === 'RANGE_INTERPOLATED',
        formattedAddress: result.formatted_address,
        verifiedAddress: verifiedAddress,
        locationType: result.geometry.location_type,
        confidence: getConfidenceLevel(result.geometry.location_type),
        suggestions: isExactMatch ? [] : [result.formatted_address],
        message: isExactMatch 
          ? 'Address verified successfully!' 
          : `Did you mean: ${result.formatted_address}?`
      };
    }

    return {
      isValid: false,
      formattedAddress: null,
      suggestions: [],
      confidence: 'low',
      message: 'Unable to verify address. Please check and try again.'
    };

  } catch (error) {
    console.error('❌ Address verification error:', error);
    // Fallback to basic validation if API fails
    return basicAddressValidation(addressData);
  }
};

/**
 * Get address component by type
 */
const getComponent = (components, type) => {
  const component = components.find(c => c.types.includes(type));
  return component ? component.long_name : '';
};

/**
 * Check if input address matches verified address
 */
const checkAddressMatch = (input, verified, locationType) => {
  // For exact matches (ROOFTOP), consider it valid
  if (locationType === 'ROOFTOP') {
    return true;
  }

  // Check if city, state, and country match
  const cityMatch = !input.city || 
    input.city.toLowerCase().trim() === verified.city.toLowerCase().trim() ||
    verified.city.toLowerCase().includes(input.city.toLowerCase().trim());
  
  const stateMatch = !input.state || 
    input.state.toLowerCase().trim() === verified.state.toLowerCase().trim() ||
    verified.state.toLowerCase().includes(input.state.toLowerCase().trim());
  
  const countryMatch = !input.country || 
    input.country.toLowerCase().trim() === verified.country.toLowerCase().trim();

  return cityMatch && stateMatch && countryMatch;
};

/**
 * Get confidence level based on location type
 */
const getConfidenceLevel = (locationType) => {
  switch (locationType) {
    case 'ROOFTOP':
      return 'high';
    case 'RANGE_INTERPOLATED':
      return 'high';
    case 'GEOMETRIC_CENTER':
      return 'medium';
    case 'APPROXIMATE':
      return 'low';
    default:
      return 'low';
  }
};

/**
 * Basic address validation (fallback when API is not available)
 */
const basicAddressValidation = (addressData) => {
  const { address, city, state, zipCode, country } = addressData;
  const errors = [];

  if (!address || address.trim().length < 5) {
    errors.push('Street address is too short');
  }

  if (!city || city.trim().length < 2) {
    errors.push('City is required');
  }

  if (!state || state.trim().length < 2) {
    errors.push('State/Province is required');
  }

  if (!zipCode || !/^\d{4,10}(-\d{4})?$/.test(zipCode.replace(/\s/g, ''))) {
    errors.push('Valid ZIP/Postal code is required');
  }

  if (!country || country.trim().length < 2) {
    errors.push('Country is required');
  }

  return {
    isValid: errors.length === 0,
    formattedAddress: null,
    suggestions: [],
    confidence: 'low',
    message: errors.length === 0 
      ? 'Address format looks valid (basic validation only)' 
      : `Please fix: ${errors.join(', ')}`,
    errors: errors
  };
};

/**
 * Format address for display
 */
export const formatAddress = (addressData) => {
  const { address, city, state, zipCode, country } = addressData;
  return [
    address,
    `${city}, ${state} ${zipCode}`,
    country
  ].filter(Boolean).join('\n');
};

