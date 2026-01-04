import type { InvoiceType } from "@/types/database";

/**
 * Arabic labels for invoice types
 * Maps the DB enum values to Arabic UI labels
 */
export const labelByInvoiceType: Record<InvoiceType, string> = {
	standard_tax: "فاتورة ضريبية",
	simplified_tax: "فاتورة ضريبية مبسطة",
	non_tax: "فاتورة عادية (غير ضريبية)",
};

/**
 * Get Arabic label for invoice type
 */
export function getInvoiceTypeLabel(type: InvoiceType): string {
	return labelByInvoiceType[type] || type;
}

