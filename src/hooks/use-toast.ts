
import { toast as sonnerToast } from 'sonner';
import {
  useToast as useToastOriginal,
} from "@/components/ui/use-toast";
import { ReactNode } from 'react';
import { ExternalToast } from 'sonner';

// Define a proper type for the toast object to prevent type errors
export interface ToastT {
  (message: ReactNode, data?: ExternalToast): string | number;
  success: (message: ReactNode, data?: ExternalToast) => string | number;
  error: (message: ReactNode, data?: ExternalToast) => string | number;
  warning: (message: ReactNode, data?: ExternalToast) => string | number;
  info: (message: ReactNode, data?: ExternalToast) => string | number;
  loading: (message: ReactNode, data?: ExternalToast) => string | number;
  dismiss: (toastId?: string | number) => void;
  [key: string]: any;
}

// Create a wrapper to match the expected API
export const useToast = () => {
  const originalToast = useToastOriginal();
  return originalToast;
};

// Create a wrapper for sonner toast to work with the existing code
export const toast: ToastT = {
  ...sonnerToast,
  error: sonnerToast.error,
  success: sonnerToast.success,
  warning: sonnerToast.warning,
  info: sonnerToast.info,
  loading: sonnerToast.loading
};
