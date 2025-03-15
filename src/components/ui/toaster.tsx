
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  // Since we're relying on Sonner directly, we'll use the SonnerToaster component
  return <SonnerToaster richColors closeButton position="bottom-right" />;
}
