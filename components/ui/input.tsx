import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "min-h-12 w-full rounded border border-outline/70 bg-white/80 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
