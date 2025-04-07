
import { toast as sonnerToast } from 'sonner';
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";
import { ReactNode } from 'react';
import { ExternalToast } from 'sonner';

// Original shadcn toast interface
export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Define a proper type for the toast object
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

// Define a simple interface for the toast hook
export interface UseToastResult {
  toast: (props: { title?: React.ReactNode; description?: React.ReactNode; action?: React.ReactElement; variant?: "default" | "destructive"; }) => void;
  toasts: ToasterToast[];
  dismiss: (toastId?: string) => void;
}

// Create a simple implementation of the hook that doesn't call itself recursively
export const useToast = (): UseToastResult => {
  // Return an implementation that satisfies the type
  return {
    toast: () => {},
    toasts: [],
    dismiss: () => {},
  };
};

// Create a wrapper for sonner toast that implements our ToastT interface
export const toast: ToastT = Object.assign(
  (message: ReactNode, data?: ExternalToast) => sonnerToast(message, data),
  {
    ...sonnerToast,
    error: sonnerToast.error,
    success: sonnerToast.success,
    warning: sonnerToast.warning,
    info: sonnerToast.info,
    loading: sonnerToast.loading,
    dismiss: sonnerToast.dismiss,
  }
);
