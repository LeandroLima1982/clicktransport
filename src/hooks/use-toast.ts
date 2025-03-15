
import { useState } from "react";
import { toast as sonerToast } from "sonner";

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

  return {
    toast,
    dismiss: (toastId?: string) => {
      sonerToast.dismiss(toastId);
      setOpen(false);
    },
  };
}
