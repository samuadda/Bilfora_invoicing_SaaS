/**
 * UI Design Tokens
 * 
 * Centralized design tokens based on the best existing patterns in the codebase.
 * These tokens represent the "elite" design patterns found in:
 * - Landing page (src/app/page.tsx)
 * - Dashboard pages (src/app/dashboard/page.tsx)
 * - Invoice pages (src/app/dashboard/invoices/page.tsx)
 * - Modal components (src/components/InvoiceCreationModal.tsx)
 */

// ============================================================================
// LAYOUT TOKENS
// ============================================================================

export const layout = {
  // Container max widths
  container: {
    full: "max-w-7xl", // Landing page sections
    content: "max-w-6xl", // Content pages
    dashboard: "max-w-[1600px]", // Dashboard container
  },

  // Horizontal padding (responsive)
  paddingX: {
    mobile: "px-4",
    tablet: "sm:px-6",
    desktop: "lg:px-8",
    // Combined pattern (most common)
    responsive: "px-4 sm:px-6 lg:px-8",
  },

  // Section vertical spacing
  section: {
    small: "py-12", // Small sections (trust signals, logos)
    medium: "py-16", // Medium sections
    standard: "py-20", // Standard sections
    large: "py-24", // Large sections (most common for major content blocks)
    xlarge: "py-32", // Extra large sections (pricing, hero)
    // Responsive pattern
    responsive: "py-16 md:py-24", // Standard responsive pattern
  },

  // Gap spacing (for grids and flex containers)
  gap: {
    tight: "gap-3", // Tight spacing
    standard: "gap-4", // Standard spacing (most common)
    medium: "gap-5", // Medium spacing
    large: "gap-6", // Large spacing (common in dashboards)
    xlarge: "gap-8", // Extra large spacing
  },

  // Stack spacing (vertical spacing between children)
  stack: {
    tight: "space-y-2",
    standard: "space-y-4",
    medium: "space-y-6", // Common in forms
    large: "space-y-8", // Large forms, sections
  },
} as const;

// ============================================================================
// SURFACE TOKENS (Cards, Panels, Modals)
// ============================================================================

export const surface = {
  // Border radius
  radius: {
    small: "rounded-xl", // Inputs, small cards
    medium: "rounded-2xl", // Standard cards (most common)
    large: "rounded-3xl", // Feature cards, modals, large cards
    full: "rounded-full", // Buttons, badges
  },

  // Borders
  border: {
    subtle: "border border-gray-100", // Light, subtle (default)
    standard: "border border-gray-200", // More visible
    // Colored variants
    purple: "border-purple-100",
    blue: "border-blue-100",
    green: "border-green-100",
    orange: "border-orange-100",
    red: "border-red-100",
  },

  // Shadows
  shadow: {
    none: "", // No shadow
    subtle: "shadow-sm", // Default cards
    medium: "shadow-md", // Hover states
    large: "shadow-lg", // Elevated cards
    xlarge: "shadow-xl", // Modals, CTAs
    xxlarge: "shadow-2xl", // Hero elements
    // Colored shadows
    purple: "shadow-lg shadow-purple-200", // Branded buttons
  },

  // Card padding
  padding: {
    small: "p-4",
    standard: "p-5 sm:p-6", // Responsive (most common)
    large: "p-6",
    xlarge: "p-8",
  },

  // Card backgrounds
  background: {
    default: "bg-white",
    subtle: "bg-gray-50/50",
    muted: "bg-gray-50",
    // Accent backgrounds
    purple: "bg-purple-50",
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    red: "bg-red-50",
    indigo: "bg-indigo-50",
  },

  // Complete card style (combines above)
  card: {
    default: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6",
    elevated: "bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl p-5 sm:p-6",
    hover: "hover:shadow-md transition-all duration-300",
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  // Heading sizes
  heading: {
    h1: {
      hero: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold", // Landing hero
      page: "text-3xl font-bold text-[#012d46]", // Dashboard/page titles
    },
    h2: {
      section: "text-4xl md:text-5xl font-bold text-[#012d46]", // Section titles
      page: "text-2xl md:text-3xl font-bold text-[#012d46]", // Page subsections
    },
    h3: {
      card: "text-2xl font-bold", // Card titles
      subsection: "text-lg font-bold", // Subsections
    },
    h4: {
      default: "text-base font-semibold",
    },
  },

  // Body text sizes
  body: {
    large: "text-lg", // Descriptions, hero text
    standard: "text-base", // Default body
    small: "text-sm", // Labels, metadata
    xs: "text-xs", // Badges, timestamps
  },

  // Text colors
  color: {
    primary: "text-gray-900", // Headings, important text
    secondary: "text-gray-700", // Body text
    muted: "text-gray-500", // Descriptions, metadata
    light: "text-gray-400", // Icons, placeholders
    brand: "text-[#012d46]", // Primary brand color for headings
    accent: "text-[#7f2dfb]", // Purple accent
  },

  // Font weights
  weight: {
    normal: "", // Default
    medium: "font-medium", // Labels, emphasis
    semibold: "font-semibold", // Subheadings
    bold: "font-bold", // Headings, important values
    extrabold: "font-extrabold", // Hero text
  },
} as const;

// ============================================================================
// INTERACTIVE TOKENS (Buttons, Inputs, Focus States)
// ============================================================================

export const interactive = {
  // Button sizes
  button: {
    size: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-3 text-base", // Standard
      lg: "px-8 py-4 text-lg",
      icon: "p-2", // Icon-only buttons
    },
    radius: {
      default: "rounded-xl",
      pill: "rounded-full",
    },
  },

  // Button variants
  buttonVariant: {
    primary: "bg-brand-primary text-white shadow-lg shadow-purple-200 hover:bg-brand-primary-hover hover:shadow-xl",
    secondary: "border border-gray-200 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  },

  // Input styles
  input: {
    base: "w-full rounded-xl border border-gray-200 px-4 py-2 text-sm",
    focus: "focus:outline-none focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20",
    disabled: "disabled:bg-gray-100 disabled:cursor-not-allowed",
    // Complete input style
    default: "w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20",
  },

  // Select/Dropdown styles (same as input)
  select: {
    base: "w-full appearance-none rounded-xl border border-gray-200 px-4 py-2 text-sm bg-white",
    focus: "focus:outline-none focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20",
    // Complete select style
    default: "w-full appearance-none rounded-xl border border-gray-200 px-4 py-2 text-sm bg-white focus:outline-none focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20",
  },

  // Focus ring (for accessibility)
  focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f2dfb]/20 focus-visible:ring-offset-2",
} as const;

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  // Brand colors
  brand: {
    primary: "#7f2dfb", // Purple
    primaryHover: "#6a1fd8", // Purple hover
    dark: "#012d46", // Dark blue for headings
    background: "#f8f9fc", // Dashboard background
  },

  // Status colors
  status: {
    success: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
      hover: "hover:bg-green-100",
    },
    warning: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
      hover: "hover:bg-orange-100",
    },
    error: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-100",
      hover: "hover:bg-red-100",
    },
    info: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      hover: "hover:bg-blue-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-[#7f2dfb]",
      border: "border-purple-100",
      hover: "hover:bg-purple-100",
    },
  },

  // Gray scale
  gray: {
    900: "text-gray-900", // Primary text
    700: "text-gray-700", // Secondary text
    600: "text-gray-600", // Muted text
    500: "text-gray-500", // Light muted
    400: "text-gray-400", // Icons, placeholders
    200: "border-gray-200", // Borders
    100: "border-gray-100", // Subtle borders
    50: "bg-gray-50", // Backgrounds
  },
} as const;

// ============================================================================
// BREAKPOINT USAGE RULES
// ============================================================================

export const breakpoints = {
  // When to use responsive variants
  rules: {
    // Padding: Always use responsive pattern for containers
    containerPadding: "px-4 sm:px-6 lg:px-8",

    // Section spacing: Use responsive for major sections
    sectionSpacing: "py-16 md:py-24",

    // Card padding: Use responsive for cards
    cardPadding: "p-5 sm:p-6",

    // Typography: Use responsive for hero/landing headings
    headingResponsive: "text-4xl md:text-5xl",

    // Grids: Use responsive columns
    gridResponsive: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Combine tokens into a complete className string
 */
export function combineTokens(...tokens: string[]): string {
  return tokens.filter(Boolean).join(" ");
}

/**
 * Get complete card className
 */
export function getCardClass(variant: "default" | "elevated" = "default", withHover = true): string {
  const base = variant === "elevated" ? surface.card.elevated : surface.card.default;
  return withHover ? `${base} ${surface.card.hover}` : base;
}

/**
 * Get complete button className
 */
export function getButtonClass(
  variant: keyof typeof interactive.buttonVariant = "primary",
  size: keyof typeof interactive.button.size = "md",
  radius: keyof typeof interactive.button.radius = "default"
): string {
  return combineTokens(
    interactive.buttonVariant[variant],
    interactive.button.size[size],
    interactive.button.radius[radius],
    "font-bold transition-all"
  );
}

/**
 * Get complete input className
 */
export function getInputClass(): string {
  return interactive.input.default;
}

/**
 * Get complete select className
 */
export function getSelectClass(): string {
  return interactive.select.default;
}

