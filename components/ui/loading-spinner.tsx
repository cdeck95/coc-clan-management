import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export default function LoadingSpinner({
  size = "default",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 className={cn(`animate-spin ${sizeClasses[size]}`, className)} />
  );
}
