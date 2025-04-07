
// Re-exporting from Sonner since we're using it throughout the app
import { toast } from 'sonner'; 
export { toast };

// For compatibility with legacy code
export type ToasterToast = any;
export type ToastT = typeof toast;

// Re-export useToast as a simple hook that returns toast
export const useToast = () => {
  return { toast };
};
