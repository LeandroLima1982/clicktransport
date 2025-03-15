
import { useState, useRef, useEffect } from "react";
import { toast as sonerToast, ToastT } from "sonner";

type ToastVariant = "default" | "destructive" | undefined;

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export function toast({ title, description, variant }: ToastProps) {
  if (variant === "destructive") {
    return sonerToast.error(title, {
      description,
    });
  }

  return sonerToast(title, {
    description,
  });
}

export function useToast() {
  const [, setOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastT[]>([]);
  
  // Mock the toasts array for the toaster component to consume
  // This is needed because sonner doesn't expose this directly
  const toastsRef = useRef<ToastT[]>([]);
  
  useEffect(() => {
    // This is just to satisfy the type system
    // Sonner manages its own internal state
    setToasts(toastsRef.current);
  }, []);

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      sonerToast.dismiss(toastId);
      setOpen(false);
    },
  };
}
