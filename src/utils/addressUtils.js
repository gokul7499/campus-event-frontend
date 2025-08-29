/**
 * Utility functions for formatting addresses
 */

/**
 * Format an address object or string into a readable string
 * @param {Object|string} address - Address object or string
 * @returns {string} Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  // If it's already a string, return as is
  if (typeof address === 'string') {
    return address;
  }
  
  // If it's an object, format it
  if (typeof address === 'object') {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(Boolean); // Remove empty/null/undefined values
    
    return parts.join(', ');
  }
  
  return '';
};

/**
 * Format address for display with line breaks
 * @param {Object|string} address - Address object or string
 * @returns {Array} Array of address lines
 */
export const formatAddressLines = (address) => {
  if (!address) return [];
  
  // If it's already a string, return as single line
  if (typeof address === 'string') {
    return [address];
  }
  
  // If it's an object, format it with proper line breaks
  if (typeof address === 'object') {
    const lines = [];
    
    if (address.street) {
      lines.push(address.street);
    }
    
    const cityStateZip = [
      address.city,
      address.state,
      address.zipCode
    ].filter(Boolean).join(', ');
    
    if (cityStateZip) {
      lines.push(cityStateZip);
    }
    
    if (address.country) {
      lines.push(address.country);
    }
    
    return lines;
  }
  
  return [];
};

/**
 * Get a short version of the address (typically just city, state)
 * @param {Object|string} address - Address object or string
 * @returns {string} Short address string
 */
export const formatShortAddress = (address) => {
  if (!address) return '';
  
  // If it's already a string, return first part
  if (typeof address === 'string') {
    return address.split(',')[0] || address;
  }
  
  // If it's an object, return city and state
  if (typeof address === 'object') {
    const parts = [address.city, address.state].filter(Boolean);
    return parts.join(', ');
  }
  
  return '';
};
