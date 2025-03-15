
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './integrations/supabase/client';

// Export the supabase client to be used throughout the application
export { supabase };

createRoot(document.getElementById("root")!).render(<App />);
