
import { toast as sonnerToast } from 'sonner';
import { ReactNode } from 'react';

export type ToasterToast = {
  id: string | number;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: 'default' | 'destructive';
};

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToastWithStatus = ToasterToast & {
  open: boolean;
  timestamp: number;
};

const toasts: ToasterToastWithStatus[] = [];

// For compatibility with shadcn/ui toast pattern
export const useToast = () => {
  const toast = (props: Omit<ToasterToast, "id">) => {
    // Just use sonner toast but maintain shadcn/ui compatibility
    return sonnerToast(props.title as string, {
      description: props.description,
      action: props.action
    });
  };

  toast.dismiss = sonnerToast.dismiss;
  toast.error = sonnerToast.error;
  toast.success = sonnerToast.success;
  toast.warning = sonnerToast.warning;
  toast.info = sonnerToast.info;
  toast.loading = sonnerToast.loading;
  toast.message = sonnerToast;
  toast.custom = sonnerToast;
  toast.promise = sonnerToast.promise;

  return {
    toast,
    toasts, // Provide empty but valid array for shadcn/ui Toaster component
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId)
  };
};

// Re-export the sonner toast for direct usage
export { sonnerToast as toast };
