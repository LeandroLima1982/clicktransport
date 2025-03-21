
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
initializeApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>,
);
