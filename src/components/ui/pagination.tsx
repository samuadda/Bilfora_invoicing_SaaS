import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className,
}: PaginationProps) {
  // If totalPages is 0, we typically don't render, but parent usually handles this.
  // We want to show controls even for single page to maintain UI layout if desired, 
  // or at least let the parent decide. The previous implementation showed them.
  if (totalPages <= 0) return null;

  // Generate page numbers to display
  // Logic: Show first, last, current, and neighbors. 
  // For simplicity and matching the design: Show a window of pages.
  const getPageNumbers = () => {
    const pages = [];
    // Always show max 5 pages for simple consistency, centered around current
    // Or the logic from the previous file:
    // let start = Math.max(1, currentPage - 2);
    // let end = Math.min(totalPages, start + 4);
    // if (end - start < 4) start = Math.max(1, end - 4);

    // Let's implement a standard shifting window
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    // Adjust start if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        className="flex items-center gap-1"
      >
        <ChevronRight size={16} />
        <span>السابق</span>
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
              currentPage === page
                ? "bg-[#7f2dfb] text-white shadow-sm hover:bg-[#6a1fd8]"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        className="flex items-center gap-1"
      >
        <span>التالي</span>
        <ChevronLeft size={16} />
      </Button>
    </div>
  );
}
