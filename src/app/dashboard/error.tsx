"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error("Dashboard Error Caught", error);
    }, [error]);

    return (
        <div className="flex h-[50vh] flex-col items-center justify-center p-4 text-center">
            <h2 className="text-xl font-bold mb-4">تعذر تحميل المحتوى</h2>
            <p className="text-gray-600 mb-6">
                حدث خطأ أثناء تحميل لوحة التحكم.
            </p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
                إعادة المحاولة
            </button>
        </div>
    );
}
