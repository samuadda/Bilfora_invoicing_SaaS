"use client";

import { InvoiceWithClientAndItems, Client, InvoiceItem, InvoiceType } from "@/types/database";
import type { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";
import { InvoicePDF_Tax } from "./InvoicePDF_Tax";
import { InvoicePDF_Simplified } from "./InvoicePDF_Simplified";
import { InvoicePDF_Regular } from "./InvoicePDF_Regular";
import { InvoicePDF_CreditNote } from "./InvoicePDF_CreditNote";

interface InvoicePDFRendererProps {
	invoice: Omit<InvoiceWithClientAndItems, 'client'> & { client?: Client | null };
	client: Client | null;
	items: InvoiceItem[];
	qrDataUrl?: string | null;
	invoiceSettings: InvoiceSettings;
}

export function InvoicePDFRenderer({
	invoice,
	client,
	items,
	qrDataUrl,
	invoiceSettings,
}: InvoicePDFRendererProps) {
	// Use invoice_type directly (DB enum format), fallback to legacy type field if needed
	const invoiceType: InvoiceType =
		invoice.invoice_type ?? (invoice.type as InvoiceType) ?? "standard_tax";

	const documentKind = invoice.document_kind || "invoice";

	// Cast invoice for child components (they use separate client prop anyway)
	const invoiceForPdf = invoice as InvoiceWithClientAndItems;

	// Determine which template to use
	if (documentKind === "credit_note") {
		return (
			<InvoicePDF_CreditNote
				invoice={invoiceForPdf}
				client={client}
				items={items}
				invoiceSettings={invoiceSettings}
				relatedInvoiceNumber={
					(invoice as unknown as { related_invoice_id?: string }).related_invoice_id || invoice.invoice_number
				}
			/>
		);
	}

	if (invoiceType === "standard_tax") {
		return (
			<InvoicePDF_Tax
				invoice={invoiceForPdf}
				client={client}
				items={items}
				qrDataUrl={qrDataUrl}
				invoiceSettings={invoiceSettings}
			/>
		);
	}

	if (invoiceType === "simplified_tax") {
		return (
			<InvoicePDF_Simplified
				invoice={invoiceForPdf}
				client={client}
				items={items}
				qrDataUrl={qrDataUrl}
				invoiceSettings={invoiceSettings}
			/>
		);
	}

	// non_tax invoice
	return (
		<InvoicePDF_Regular
			invoice={invoiceForPdf}
			client={client}
			items={items}
			invoiceSettings={invoiceSettings}
		/>
	);
}


