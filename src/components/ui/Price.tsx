"use client";

import { cn } from "@/lib/utils";

// Inline SVG for Saudi Riyal symbol - using currentColor for text color matching
const SarIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1124.14 1256.39"
        fill="currentColor"
        className={className}
        aria-hidden="true"
    >
        <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
        <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
    </svg>
);

interface PriceProps {
    /** The numeric amount to display */
    amount: number;
    /** Size variant for the price display */
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    /** Additional CSS classes */
    className?: string;
    /** Show the currency icon (default: true) */
    showIcon?: boolean;
}

const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
};

const iconSizeClasses = {
    xs: "w-2.5 h-2.5",
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
};

/**
 * Price component that displays a formatted currency amount with the Saudi Riyal symbol
 * 
 * @example
 * <Price amount={1234.56} />
 * <Price amount={500} size="lg" />
 */
export function Price({
    amount,
    size = "md",
    className,
    showIcon = true,
}: PriceProps) {
    // Format number with 2 decimal places using English digits
    const formattedAmount = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1",
                sizeClasses[size],
                className
            )}
            style={{ direction: "ltr", unicodeBidi: "isolate" }}
        >
            <span className="font-semibold tabular-nums">{formattedAmount}</span>
            {showIcon && (
                <SarIcon className={cn(iconSizeClasses[size], "flex-shrink-0")} />
            )}
        </span>
    );
}

export default Price;
