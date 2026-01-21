import { cn } from "@/lib/utils";
import { getSelectClass } from "@/lib/ui/tokens";
import { SelectHTMLAttributes, ReactNode, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  /**
   * Show chevron icon
   * @default true
   */
  showIcon?: boolean;
}

/**
 * Select component with consistent styling based on design tokens.
 * 
 * Usage:
 * ```tsx
 * <Select>
 *   <option value="1">Option 1</option>
 *   <option value="2">Option 2</option>
 * </Select>
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, showIcon = true, className, ...props }, ref) => {
    const baseClass = getSelectClass();

    return (
      <div className="relative">
        <select
          ref={ref}
          lang="en"
          className={cn(baseClass, className)}
          {...props}
        >
          {children}
        </select>
        {showIcon && (
          <ChevronDown
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={16}
          />
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

