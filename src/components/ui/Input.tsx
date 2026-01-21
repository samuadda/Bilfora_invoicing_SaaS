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

// Input types that should always use Western/English numerals
const NUMERIC_INPUT_TYPES = ["date", "number", "tel", "time", "datetime-local", "month", "week"];

/**
 * Input component with consistent styling based on design tokens.
 * Automatically applies Western numerals for date/number/phone inputs.
 * 
 * Usage:
 * ```tsx
 * <Input type="text" placeholder="Enter text" />
 * <Input type="date" /> // Auto-applies nums-eng class
 * <Input type="number" /> // Auto-applies nums-eng-center class
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = "default", className, type, ...props }, ref) => {
    const baseClass = getInputClass();
    const sizeClass =
      size === "sm"
        ? "px-3 py-1.5 text-sm"
        : size === "lg"
          ? "px-4 py-3 text-base"
          : "";

    // Auto-apply nums-eng for numeric input types
    const isNumericType = type && NUMERIC_INPUT_TYPES.includes(type);
    const numericClass = isNumericType
      ? (type === "number" ? "nums-eng-center" : "nums-eng")
      : "";

    return (
      <input
        ref={ref}
        type={type}
        lang="en"
        className={cn(baseClass, sizeClass, numericClass, className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

