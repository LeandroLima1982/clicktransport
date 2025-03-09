
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import App from './App.tsx';
import './index.css';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Authentication and database features may not work properly.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

createRoot(document.getElementById("root")!).render(<App />);
