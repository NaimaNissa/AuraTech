// src/lib/imageUtils.js

/**
 * Utility functions for image handling and validation
 */

// Sample image URLs for testing different colors
export const sampleImageUrls = {
  red: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'
  ],
  blue: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'
  ],
  black: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'
  ],
  white: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'
  ],
  silver: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'
  ]
};

/**
 * Validate if a URL is a valid image URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid image URL
 */
export const isValidImageUrl = (url) => {
  try {
    new URL(url);
    return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url) || 
           url.includes('unsplash.com') || 
           url.includes('placeholder') ||
           url.includes('picsum.photos');
  } catch {
    return false;
  }
};

/**
 * Get a fallback image URL
 * @returns {string} - Fallback image URL
 */
export const getFallbackImageUrl = () => {
  return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop';
};

/**
 * Format color name for consistent key usage
 * @param {string} colorName - The color name to format
 * @returns {string} - Formatted color key
 */
export const formatColorKey = (colorName) => {
  return colorName.toLowerCase().replace(/\s+/g, '');
};

/**
 * Get sample images for a specific color
 * @param {string} colorName - The color name
 * @param {number} count - Number of images to return
 * @returns {string[]} - Array of image URLs
 */
export const getSampleImagesForColor = (colorName, count = 3) => {
  const colorKey = formatColorKey(colorName);
  const images = sampleImageUrls[colorKey] || sampleImageUrls.red;
  return images.slice(0, count);
};

/**
 * Generate color-based image variations
 * @param {string} baseImageUrl - Base image URL
 * @param {string} colorName - Color name
 * @param {number} count - Number of variations to generate
 * @returns {string[]} - Array of image URLs
 */
export const generateColorImageVariations = (baseImageUrl, colorName, count = 5) => {
  const variations = [baseImageUrl];
  
  for (let i = 1; i < count; i++) {
    const variationUrl = `${baseImageUrl}?v=${i}&color=${encodeURIComponent(colorName)}`;
    variations.push(variationUrl);
  }
  
  return variations;
};

