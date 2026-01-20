import { createClient } from "@/utils/supabase/server";
import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";

export async function getInvoiceForPdf(invoiceId: string, userId: string) {
    const supabase = await createClient();

    const { data: invoiceData, error } = await supabase
        .from("invoices")
        .select(
            `
				*,
				client:clients(*),
				items:invoice_items(*),
				payments:payments(*)
			`,
        )
        .eq("id", invoiceId)
        .eq("user_id", userId)
        .single();

    if (error || !invoiceData) {
        return null;
    }

    // Cast to the expected structure
    const invoiceBase = invoiceData as unknown as InvoiceWithClientAndItems;
    const clientData = (invoiceData as unknown as { client?: Client | null }).client ?? null;
    const itemsData = (invoiceData as unknown as { items?: InvoiceItem[] }).items ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsData = (invoiceData as unknown as { payments: any[] }).payments ?? [];

    return {
        invoice: invoiceBase,
        client: clientData,
        items: itemsData,
        payments: paymentsData,
    };
}
