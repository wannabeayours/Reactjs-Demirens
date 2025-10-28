// PayPal Configuration
export const PAYPAL_CONFIG = {
  // Environment settings
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  
  // Client IDs (you should move these to environment variables)
  clientId: {
    sandbox: 'AR5thvtDL5d98o50Cp7my2sJDogMx6HA0LsjcF7a4KHT5QQQqHHnai4lyClw8TBo1VYjdfSiKj2PVqef',
    production: 'YOUR_PRODUCTION_CLIENT_ID' // Replace with actual production client ID
  },
  
  // Currency settings
  currency: 'PHP',
  
  // SDK parameters to help prevent blocking
  sdkParams: {
    'disable-funding': 'credit,card',
    'data-sdk-integration-source': 'button-factory',
    'data-page-type': 'checkout'
  },
  
  // Error handling configuration
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
    showDetailedErrors: process.env.NODE_ENV === 'development'
  },
  
  // Button styling
  buttonStyle: {
    layout: 'vertical',
    color: 'gold',
    shape: 'rect',
    label: 'paypal',
    height: 40
  }
};

// Helper function to get current client ID
export const getClientId = () => {
  return PAYPAL_CONFIG.clientId[PAYPAL_CONFIG.environment];
};

// Helper function to check if PayPal SDK is loaded
export const isPayPalSDKLoaded = () => {
  return typeof window !== 'undefined' && window.paypal && window.paypal.Buttons;
};

// Helper function to generate SDK URL
export const generateSDKUrl = () => {
  const baseUrl = 'https://www.paypal.com/sdk/js';
  const params = new URLSearchParams({
    'client-id': getClientId(),
    currency: PAYPAL_CONFIG.currency,
    ...PAYPAL_CONFIG.sdkParams
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Debug helper for development
export const debugPayPal = () => {
  if (PAYPAL_CONFIG.errorHandling.showDetailedErrors) {
    console.log('PayPal Configuration:', PAYPAL_CONFIG);
    console.log('PayPal SDK Loaded:', isPayPalSDKLoaded());
    console.log('Current Environment:', PAYPAL_CONFIG.environment);
    console.log('Client ID:', getClientId());
  }
};