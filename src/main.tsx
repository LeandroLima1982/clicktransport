
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeSupabase } from './utils/supabaseClient';

// Initialize Supabase before rendering the application
initializeSupabase().then((isConnected) => {
  if (!isConnected) {
    console.warn('Warning: Connection to Supabase could not be established. Some features may not work properly.');
  }
  
  // Initialize the application
  createRoot(document.getElementById("root")!).render(<App />);
});
