"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { invoiceSchema, type CreateInvoiceSchema } from "@/lib/schemas/invoice";
import { revalidatePath } from "next/cache";

type ActionState = {
    success?: boolean;
    error?: string;
    data?: { id: string; invoice_number: string | null };
};

interface InvoiceRpcResponse {
    id: string;
    invoice_number: string | null;
}

export async function createInvoiceAction(data: CreateInvoiceSchema): Promise<ActionState> {
    const cookieStore = await cookies();

    // 1. Server-Side Validation
    const result = invoiceSchema.safeParse(data);
    if (!result.success) {
        return {
            success: false,
            error: result.error.issues[0].message ?? "Invalid input data",
        };
    }

    const {
        client_id,
        invoice_type,
        document_kind,
        issue_date,
        due_date,
        status,
        tax_rate,
        notes,
        items,
    } = result.data;

    // 2. Auth Check
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // 3. Prepare Logic
    const finalTaxRate = invoice_type === "non_tax" ? 0 : Number(tax_rate) || 0;
    const itemsPayload = items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
    }));

    try {
        // 4. Secure RPC Call
        // Since we are on the server, we trust the input after Zod validation.
        // The RPC itself will handle database-level integrity.
        const { data: rpcData, error } = await supabase.rpc("create_invoice_with_items", {
            p_client_id: client_id,
            p_order_id: null, // Always null as per original code, or pass result.data.order_id if needed
            p_invoice_type: invoice_type,
            p_document_kind: document_kind ?? "invoice",
            p_issue_date: issue_date,
            p_due_date: due_date,
            p_status: status,
            p_tax_rate: finalTaxRate,
            p_notes: notes ?? "",
            p_items: itemsPayload,
        });

        if (error) {
            console.error("RPC Error:", error);
            return { success: false, error: error.message };
        }

        // 5. Success
        revalidatePath("/dashboard/invoices");

        // Parse result similarly to client-side helper
        let createdId = null;
        let invoiceNumber = null;

        if (Array.isArray(rpcData) && rpcData.length > 0) {
            createdId = rpcData[0].id;
            invoiceNumber = rpcData[0].invoice_number;
        } else if (rpcData && typeof rpcData === 'object' && 'id' in rpcData) {
            const data = rpcData as InvoiceRpcResponse;
            createdId = data.id;
            invoiceNumber = data.invoice_number;
        }

        if (!createdId) {
            return { success: false, error: "Invoice created but ID missing" };
        }

        return {
            success: true,
            data: { id: createdId, invoice_number: invoiceNumber },
        };
    } catch (err) {
        console.error("Unexpected Action Error:", err);
        return { success: false, error: "Unexpected server error" };
    }
}
