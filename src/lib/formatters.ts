/**
 * Shared formatting utilities
 */

export const formatCurrency = (amount: number, currency: string = "SAR"): string => {
    if (isNaN(amount) || !isFinite(amount)) return "0.00";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (dateString?: string | null | Date): string => {
    if (!dateString) return "—";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-GB");
    } catch {
        return "—";
    }
};

export const formatDateTime = (dateString?: string | null | Date): string => {
    if (!dateString) return "—";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";
        const dateStr = date.toLocaleDateString("en-GB");
        const timeStr = date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        });
        return `${dateStr} ${timeStr}`;
    } catch {
        return "—";
    }
};
