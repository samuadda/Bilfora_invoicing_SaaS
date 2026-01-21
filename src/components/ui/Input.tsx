import { cn } from "@/lib/utils";
import { getInputClass } from "@/lib/ui/tokens";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input size variant
   * @default "default"
   */
  size?: "sm" | "default" | "lg";
}

/**
 * Input component with consistent styling based on design tokens.
 * 
 * Usage:
 * ```tsx
 * <Input type="text" placeholder="Enter text" />
 * <Input type="email" size="lg" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = "default", className, ...props }, ref) => {
    const baseClass = getInputClass();
    const sizeClass =
      size === "sm"
        ? "px-3 py-1.5 text-sm"
        : size === "lg"
          ? "px-4 py-3 text-base"
          : "";

    return (
      <input
        ref={ref}
        lang="en"
        className={cn(baseClass, sizeClass, className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

