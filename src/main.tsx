
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeApp } from './utils/initApp';
import './index.css';
import { Toaster } from './components/ui/sonner';
import { supabase } from './utils/supabaseClient';

// Re-export supabase client so existing imports work
export { supabase };

// Initialize the app before rendering
(async () => {
  try {
    await initializeApp();
    
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
        <Toaster position="top-right" />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Render the app anyway to allow the user to enter API key
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
        <Toaster position="top-right" />
      </React.StrictMode>,
    );
  }
})();
