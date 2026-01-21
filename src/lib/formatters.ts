/**
 * Shared formatting utilities
 * 
 * IMPORTANT: All formatters enforce Western/Latin numerals (0-9) 
 * even when the UI is in Arabic. This is achieved via:
 * - Using en-GB/en-US locales
 * - Explicitly setting numberingSystem: 'latn'
 */

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

export const formatCurrency = (amount: number, currency: string = "SAR"): string => {
    if (isNaN(amount) || !isFinite(amount)) return "0.00";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// ─────────────────────────────────────────────────────────────────────────────
// DATE FORMATTING (Western numerals guaranteed)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format date as DD/MM/YYYY with Western numerals
 * Uses explicit Intl.DateTimeFormat to guarantee Latin digits
 */
export const formatDate = (dateString?: string | null | Date): string => {
    if (!dateString) return "—";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";

        // Use explicit Intl.DateTimeFormat with numberingSystem: 'latn'
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            numberingSystem: "latn",
        }).format(date);
    } catch {
        return "—";
    }
};

/**
 * Format date and time as DD/MM/YYYY HH:MM with Western numerals
 */
export const formatDateTime = (dateString?: string | null | Date): string => {
    if (!dateString) return "—";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";

        const dateFormatter = new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            numberingSystem: "latn",
        });

        const timeFormatter = new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            numberingSystem: "latn",
        });

        return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
    } catch {
        return "—";
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// NUMBER FORMATTING (Western numerals guaranteed)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format number with Western numerals and optional locale formatting
 */
export const formatNumber = (
    value: number,
    options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        useGrouping?: boolean;
    }
): string => {
    if (isNaN(value) || !isFinite(value)) return "0";
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: options?.minimumFractionDigits ?? 0,
        maximumFractionDigits: options?.maximumFractionDigits ?? 2,
        useGrouping: options?.useGrouping ?? true,
        numberingSystem: "latn",
    }).format(value);
};

/**
 * Format percentage with Western numerals
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
    if (isNaN(value) || !isFinite(value)) return "0%";
    return new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        numberingSystem: "latn",
    }).format(value / 100);
};
