import { cn } from "@/lib/utils";
import { surface, getCardClass } from "@/lib/ui/tokens";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  /**
   * Card variant
   * @default "default"
   */
  variant?: "default" | "elevated";
  /**
   * Show hover effects
   * @default true
   */
  hover?: boolean;
  /**
   * Padding size override
   */
  padding?: "none" | "small" | "standard" | "large" | "xlarge";
  /**
   * Background variant
   */
  background?: "default" | "subtle" | "muted" | "purple" | "blue" | "green" | "orange" | "red" | "indigo";
}

/**
 * Card component with consistent styling.
 * 
 * Usage:
 * ```tsx
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  className,
  variant = "default",
  hover = true,
  padding,
  background = "default",
}: CardProps) {
  const baseClass = getCardClass(variant, hover);
  const paddingClass = padding === "none" ? "p-0" : padding ? surface.padding[padding] : "";
  const backgroundClass =
    background === "default"
      ? ""
      : background === "subtle"
        ? surface.background.subtle
        : background === "muted"
          ? surface.background.muted
          : surface.background[background];

  return (
    <div
      className={cn(
        baseClass,
        paddingClass,
        backgroundClass,
        className
      )}
    >
      {children}
    </div>
  );
}

