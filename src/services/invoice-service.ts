import { createClient } from "@/utils/supabase/server";
import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";

// User profile type for seller information
export interface SellerProfile {
    id: string;
    full_name?: string | null;
    company_name?: string | null;
    tax_number?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    iban?: string | null;
    bank_name?: string | null;
}

export async function getInvoiceForPdf(invoiceId: string, userId: string) {
    const supabase = await createClient();

    // Fetch invoice with related data
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

    // Fetch user profile (seller data)
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, tax_number, address, phone, email")
        .eq("id", userId)
        .single();

    // Cast to the expected structure
    const invoiceBase = invoiceData as unknown as InvoiceWithClientAndItems;
    const clientData = (invoiceData as unknown as { client?: Client | null }).client ?? null;
    const itemsData = (invoiceData as unknown as { items?: InvoiceItem[] }).items ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsData = (invoiceData as unknown as { payments: any[] }).payments ?? [];
    const sellerData: SellerProfile | null = profileData ?? null;

    return {
        invoice: invoiceBase,
        client: clientData,
        items: itemsData,
        payments: paymentsData,
        seller: sellerData,
    };
}

