// Utility functions for managing color-based product images

// Generate sample color images for demonstration
export const generateSampleColorImages = (product) => {
  const colors = product.colors || [];
  const baseImage = product.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop';
  
  const colorImages = {};
  
  colors.forEach((color, index) => {
    const colorKey = color.toLowerCase().replace(/\s+/g, '');
    const images = [];
    
    // Generate up to 5 sample images for each color (can be expanded to 10)
    for (let i = 0; i < Math.min(5, 10); i++) {
      if (i === 0) {
        // First image is the base image
        images.push(baseImage);
      } else {
        // Generate variation URLs (in a real app, these would be actual different images)
        const variationUrl = `${baseImage}?v=${i}&color=${encodeURIComponent(color)}&tint=${index}`;
        images.push(variationUrl);
      }
    }
    
    colorImages[colorKey] = {
      name: color,
      images: images,
      price: product.price || 0
    };
  });
  
  return colorImages;
};

// Validate image URL
export const isValidImageUrl = (url) => {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('unsplash.com') || url.includes('placeholder');
  } catch {
    return false;
  }
};

// Get image dimensions (for future use)
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
};

// Format color name for display
export const formatColorName = (colorName) => {
  return colorName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Get color hex code (for future use with color picker)
export const getColorHex = (colorName) => {
  const colorMap = {
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#00FF00',
    'yellow': '#FFFF00',
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#808080',
    'grey': '#808080',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'silver': '#C0C0C0',
    'gold': '#FFD700'
  };
  
  return colorMap[colorName.toLowerCase()] || '#808080';
};
