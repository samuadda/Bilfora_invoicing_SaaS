import { cn } from "@/lib/utils";
import { getButtonClass } from "@/lib/ui/tokens";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /**
   * Button variant
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /**
   * Button size
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Use pill shape (rounded-full)
   * @default false
   */
  pill?: boolean;
}

/**
 * Button component with consistent styling based on design tokens.
 * 
 * Usage:
 * ```tsx
 * <Button variant="primary">Click Me</Button>
 * <Button variant="secondary" size="sm">Small Button</Button>
 * ```
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  pill = false,
  className,
  ...props
}: ButtonProps) {
  const baseClass = getButtonClass(variant, size, pill ? "pill" : "default");

  return (
    <button className={cn(baseClass, className)} {...props}>
      {children}
    </button>
  );
}

