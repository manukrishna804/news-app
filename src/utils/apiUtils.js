// API utility functions for better error handling

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    switch (status) {
      case 401:
        return 'Unauthorized. Please check your credentials.';
      case 403:
        return 'Access forbidden. You may not have permission for this action.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.response.data?.message || `Server error (${status})`;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your internet connection.';
  } else {
    // Other errors
    return error.message || defaultMessage;
  }
};

export const validateApiKey = (apiKey, serviceName) => {
  // Temporarily allow demo keys for development
  if (apiKey === 'demo_key_for_development') {
    console.warn(`${serviceName} using demo key for development`);
    return true;
  }
  
  if (!apiKey) {
    throw new Error(`${serviceName} API key is not configured`);
  }
  if (apiKey === 'your_api_key_here' || apiKey.includes('your_')) {
    throw new Error(`${serviceName} API key is not properly configured`);
  }
  return true;
};

export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}; 