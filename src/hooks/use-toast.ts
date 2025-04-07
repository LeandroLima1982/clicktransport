
import { toast as sonnerToast } from 'sonner';
import {
  useToast as useToastOriginal,
} from "@/components/ui/use-toast";

// Create a wrapper to match the expected API
export const useToast = useToastOriginal;

// Create a wrapper for sonner toast to work with the existing code
export const toast = {
  ...sonnerToast,
  error: sonnerToast.error,
  success: sonnerToast.success,
  warning: sonnerToast.warning,
  info: sonnerToast.info,
  loading: sonnerToast.loading
};

// For backward compatibility
export type ToastT = typeof toast;
