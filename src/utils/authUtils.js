// src/utils/authUtils.js - Fixed Version

/**
 * Get current salon ID from localStorage
 * @returns {string|null} Current salon ID or null if not found
 */
export const getCurrentSalonId = () => {
  try {
    // First try to get from direct storage
    const salonId = localStorage.getItem('currentSalonId') || localStorage.getItem('salonId');
    if (salonId) {
      console.log('Found salon ID in direct storage:', salonId);
      return salonId;
    }

    // Fallback: try to extract from partnerAuth
    const authData = getPartnerAuth();
    if (authData?.salon?.id) {
      console.log('Found salon ID in partnerAuth:', authData.salon.id);
      // Store it for future use
      localStorage.setItem('currentSalonId', authData.salon.id);
      return authData.salon.id;
    }

    console.log('No salon ID found');
    return null;
  } catch (error) {
    console.error('Error getting salon ID:', error);
    return null;
  }
};

/**
 * Get current salon data from localStorage
 * @returns {Object|null} Salon data
 */
export const getCurrentSalon = () => {
  const partnerAuth = getPartnerAuth();
  return partnerAuth?.salon || null;
};

/**
 * Get complete partner auth data from localStorage
 * @returns {Object|null} Partner auth data
 */
export const getPartnerAuth = () => {
  try {
    const authData = localStorage.getItem('partnerAuth');
    const parsed = authData ? JSON.parse(authData) : null;
    console.log('Retrieved partnerAuth:', parsed);
    return parsed;
  } catch (error) {
    console.error('Error parsing partner auth data:', error);
    return null;
  }
};

/**
 * Check if partner is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isPartnerAuthenticated = () => {
  try {
    const authData = getPartnerAuth();
    const salonId = getCurrentSalonId();
    
    console.log('Authentication check:');
    console.log('- Auth data exists:', !!authData);
    console.log('- Salon ID exists:', !!salonId);
    console.log('- Owner ID exists:', !!(authData?.owner?.id));
    
    // For authentication, we need:
    // 1. Auth data exists
    // 2. Salon ID exists  
    // 3. Owner data exists
    const isAuthenticated = !!(authData && salonId && authData?.owner?.id);
    
    console.log('Final authentication result:', isAuthenticated);
    
    // If we have auth data but missing salon ID, try to extract it
    if (authData && !salonId && authData.owner?.id) {
      console.log('Auth data exists but salon ID missing, using owner ID as fallback');
      localStorage.setItem('currentSalonId', authData.owner.id);
      return true;
    }
    
    return isAuthenticated;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get authentication token
 * @returns {string|null} Auth token
 */
export const getAuthToken = () => {
  const partnerAuth = getPartnerAuth();
  const token = partnerAuth?.token || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('token') ||
                null;
  
  console.log('Auth token found:', !!token);
  return token;
};

/**
 * Make authenticated API request with salon ID
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const salonId = getCurrentSalonId();
  
  console.log('Making authenticated request:');
  console.log('- URL:', url);
  console.log('- Token exists:', !!token);
  console.log('- Salon ID:', salonId);
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  // Add salon ID to headers for easier backend handling
  if (salonId) {
    defaultHeaders['X-Salon-ID'] = salonId;
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  try {
    console.log('Clearing all auth data...');
    localStorage.removeItem('partnerAuth');
    localStorage.removeItem('currentSalonId');
    localStorage.removeItem('salonId');
    localStorage.removeItem('owner');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
};

/**
 * Get current owner/user data
 * @returns {Object|null} Owner data
 */
export const getCurrentOwner = () => {
  try {
    const authData = getPartnerAuth();
    return authData?.owner || null;
  } catch (error) {
    console.error('Error getting owner data:', error);
    return null;
  }
};

/**
 * Validate salon ownership for an operation
 * @param {string} resourceSalonId - Salon ID from resource being accessed
 * @returns {boolean} True if current user owns the salon
 */
export const validateSalonOwnership = (resourceSalonId) => {
  const currentSalonId = getCurrentSalonId();
  if (!currentSalonId || !resourceSalonId) {
    console.warn('Missing salon ID for ownership validation');
    return false;
  }
  return currentSalonId === resourceSalonId;
};

/**
 * Debug helper - shows current auth state
 */
export const debugAuthState = () => {
  console.log('=== DEBUG AUTH STATE ===');
  console.log('Current Salon ID:', getCurrentSalonId());
  console.log('Partner Auth:', getPartnerAuth());
  console.log('Current Owner:', getCurrentOwner());
  console.log('Auth Token:', !!getAuthToken());
  console.log('Is Authenticated:', isPartnerAuthenticated());
  console.log('LocalStorage Contents:');
  console.log('- partnerAuth:', localStorage.getItem('partnerAuth'));
  console.log('- currentSalonId:', localStorage.getItem('currentSalonId'));
  console.log('- salonId:', localStorage.getItem('salonId'));
  console.log('========================');
};