
import { toast } from 'sonner'; 
export { toast };

// For compatibility with shadcn/ui toast pattern
export const useToast = () => {
  return { toast };
};

// Export type definitions
export type ToastT = typeof toast;
