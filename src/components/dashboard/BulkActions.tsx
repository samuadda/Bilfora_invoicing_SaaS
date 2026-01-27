import { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, Text } from "@/components/ui"; // Assuming Text is exported from ui
import { m, AnimatePresence } from "framer-motion";

interface BulkActionsProps {
    selectedCount: number;
    itemLabel: string;
    onClearSelection: () => void;
    children: ReactNode;
    className?: string;
}

export function BulkActions({
    selectedCount,
    itemLabel,
    onClearSelection,
    children,
    className,
}: BulkActionsProps) {
    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <m.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn("mb-6", className)}
                >
                    <Card padding="none" className="bg-[#FDF8FF] border-[#EEDDFF] overflow-hidden shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center justify-between p-3 gap-4">
                            {/* Selection Info (Right in RTL) */}
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F4E7FF] text-[#7f2dfb]">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col">
                                        <Text className="font-bold text-[#7f2dfb] text-sm">
                                            تم تحديد {selectedCount} {itemLabel}
                                        </Text>
                                        <Text variant="body-small" className="text-[#a484c9] text-xs">
                                            اختر إجراءاً لتطبيقه على العناصر المحددة
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            {/* Actions (Left in RTL) */}
                            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 px-1 sm:px-0">
                                {children}

                                <div className="h-6 w-px bg-[#EEDDFF] mx-2 hidden sm:block" />

                                <button
                                    onClick={onClearSelection}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-black/5 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                    <span>إلغاء</span>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </Card>
                </m.div>
            )}
        </AnimatePresence>
    );
}

interface BulkActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "delete" | "success" | "warning" | "info";
    icon?: ReactNode;
}

export function BulkActionButton({
    variant = "default",
    icon,
    children,
    className,
    ...props
}: BulkActionButtonProps) {
    const variants = {
        default: "bg-white text-gray-700 hover:bg-gray-50 border-gray-200",
        delete: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
        success: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
        warning: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
        info: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    };

    return (
        <button
            type="button"
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
                variants[variant],
                className
            )}
            {...props}
        >
            {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
            {children}
        </button>
    );
}
