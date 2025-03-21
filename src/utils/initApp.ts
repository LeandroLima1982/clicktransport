import { initializeApiKey } from './updateApiKey';

// Initialize the application
export const initializeApp = () => {
  // Set up the Google Maps API key
  initializeApiKey();
  
  // Other initialization tasks can be added here
  console.log('Application initialized');
};
