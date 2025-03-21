import { initializeApiKey } from './updateApiKey';
import { initializeSupabase } from './supabaseClient';

// Initialize the application
export const initializeApp = async () => {
  try {
    // Set up the Google Maps API key
    await initializeApiKey();
    
    // Initialize Supabase connection
    await initializeSupabase();
    
    // Other initialization tasks can be added here
    console.log('Application initialized');
  } catch (error) {
    console.error('Error initializing application:', error);
  }
};
