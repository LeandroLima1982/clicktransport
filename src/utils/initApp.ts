
import { initializeApiKey } from './updateApiKey';
import { initializeSupabase } from './supabaseClient';

// Initialize the application
export const initializeApp = async () => {
  // Set up the Google Maps API key
  initializeApiKey();
  
  // Initialize Supabase connection
  await initializeSupabase();
  
  // Other initialization tasks can be added here
  console.log('Application initialized');
};
