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
    invoice_footer?: string | null;
    email?: string | null;
    iban?: string | null;
    bank_name?: string | null;
    logo_url?: string | null;
    cr_number?: string | null;
    brand_color?: string | null;
    payment_notes?: string | null;
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

    // Fetch Invoice Settings (for logo, additional tax info, overrides)
    const { data: settingsData } = await supabase
        .from("invoice_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

    // Cast to the expected structure
    const invoiceBase = invoiceData as unknown as InvoiceWithClientAndItems;
    const clientData = (invoiceData as unknown as { client?: Client | null }).client ?? null;
    const itemsData = (invoiceData as unknown as { items?: InvoiceItem[] }).items ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsData = (invoiceData as unknown as { payments: any[] }).payments ?? [];

    const paymentInfo = invoiceBase.payment_info;
    
    // Resolve which bank info to use
    let activeBankName = settingsData?.bank_name;
    let activeIban = settingsData?.iban;

    if (paymentInfo) {
        if (paymentInfo.bank_name === null && paymentInfo.iban === null) {
            // "None" option was selected
            activeBankName = null;
            activeIban = null;
        } else {
            // Specific bank was selected
            activeBankName = paymentInfo.bank_name || null;
            activeIban = paymentInfo.iban || null;
        }
    }

    // Merge Profile + Settings (Settings take precedence for business identity)
    const sellerData: SellerProfile = {
        id: userId,
        full_name: profileData?.full_name,
        company_name: settingsData?.seller_name || profileData?.company_name, // Settings name > Profile name
        tax_number: settingsData?.vat_number || profileData?.tax_number,      // Settings VAT > Profile Tax
        address: [settingsData?.address_line1, settingsData?.city].filter(Boolean).join(", ") || profileData?.address,
        phone: profileData?.phone,
        email: profileData?.email,
        iban: activeIban,
        bank_name: activeBankName,
        logo_url: settingsData?.logo_url,
        cr_number: settingsData?.cr_number,
        invoice_footer: settingsData?.invoice_footer,
        brand_color: settingsData?.brand_color,
        payment_notes: settingsData?.payment_notes,
    };

    return {
        invoice: invoiceBase,
        client: clientData,
        items: itemsData,
        payments: paymentsData,
        seller: sellerData,
    };
}

