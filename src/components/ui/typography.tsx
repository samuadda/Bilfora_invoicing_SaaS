import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/ui/tokens";
import { ReactNode, ElementType } from "react";

// ============================================================================
// Heading Variants
// ============================================================================

const headingVariants = cva("", {
  variants: {
    variant: {
      h1: typography.heading.h1.page,
      "h1-hero": typography.heading.h1.hero,
      h2: typography.heading.h2.section,
      "h2-page": typography.heading.h2.page,
      h3: typography.heading.h3.card,
      "h3-subsection": typography.heading.h3.subsection,
      h4: typography.heading.h4.default,
    },
  },
  defaultVariants: {
    variant: "h1",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
  VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4";
  children: ReactNode;
}

/**
 * Heading component with consistent typography styles.
 * 
 * Usage:
 * ```tsx
 * <Heading variant="h1">Page Title</Heading>
 * <Heading variant="h1-hero">Hero Title</Heading>
 * <Heading variant="h2">Section Title</Heading>
 * ```
 */
export function Heading({
  variant,
  as,
  className,
  children,
  ...props
}: HeadingProps) {
  const Component = as || (variant?.startsWith("h1") ? "h1" : variant?.startsWith("h2") ? "h2" : variant?.startsWith("h3") ? "h3" : "h4") as ElementType;

  return (
    <Component
      className={cn(headingVariants({ variant }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// ============================================================================
// Text Variants
// ============================================================================

const textVariants = cva("", {
  variants: {
    variant: {
      body: typography.body.standard,
      "body-large": typography.body.large,
      "body-small": typography.body.small,
      "body-xs": typography.body.xs,
    },
    color: {
      default: typography.color.secondary,
      primary: typography.color.primary,
      muted: typography.color.muted,
      light: typography.color.light,
      brand: typography.color.brand,
      accent: typography.color.accent,
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
  },
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'color'>,
  VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div";
  children: ReactNode;
}

/**
 * Text component with consistent typography styles.
 * 
 * Usage:
 * ```tsx
 * <Text>Standard body text</Text>
 * <Text variant="body-large" color="muted">Large description</Text>
 * <Text variant="body-small" color="muted">Metadata</Text>
 * ```
 */
export function Text({
  variant,
  color,
  as = "p",
  className,
  children,
  ...props
}: TextProps) {
  const Component = as;

  return (
    <Component
      className={cn(textVariants({ variant, color }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// ============================================================================
// Label Variants
// ============================================================================

const labelVariants = cva("", {
  variants: {
    variant: {
      label: "text-sm font-medium text-gray-700",
      overline: "text-xs font-semibold text-gray-500 uppercase tracking-wide",
    },
  },
  defaultVariants: {
    variant: "label",
  },
});

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
  VariantProps<typeof labelVariants> {
  children: ReactNode;
}

/**
 * Label component for form labels and small text labels.
 * 
 * Usage:
 * ```tsx
 * <Label>Form Label</Label>
 * <Label variant="overline">Section Label</Label>
 * ```
 */
export function Label({
  variant,
  className,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(labelVariants({ variant }), className)}
      {...props}
    >
      {children}
    </label>
  );
}

// ============================================================================
// Export all typography components
// ============================================================================
// Note: Components are already exported above with 'export function'
// This section is kept for documentation purposes

