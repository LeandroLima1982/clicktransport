
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import App from './App.tsx';
import './index.css';

// Initialize Supabase client with environment variables
const supabaseUrl = 'https://ofctyafulvkwaldondsj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mY3R5YWZ1bHZrd2FsZG9uZHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NTc1NDksImV4cCI6MjA1NzEzMzU0OX0.tu9XJ07Y2HLDX5LKQDDL_Tjr_lPLcwypE0c0Zzrhggw';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize the application
createRoot(document.getElementById("root")!).render(<App />);
