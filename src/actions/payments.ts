"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const paymentSchema = z.object({
    invoice_id: z.string().uuid(),
    amount: z.number().positive(),
    payment_date: z.string(),
    payment_method: z.enum(["cash", "transfer", "card", "check", "other"]),
    reference_number: z.string().optional(),
    notes: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof paymentSchema>;

export async function recordPaymentAction(data: CreatePaymentInput) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const parsed = paymentSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    const payment = {
        ...parsed.data,
        created_by: user.id,
    };

    // 1. Insert Payment
    const { error: insertError } = await supabase.from("payments").insert(payment);

    if (insertError) {
        console.error("Error creating payment:", insertError);
        return { success: false, error: "Failed to record payment" };
    }

    // 2. Refresh Invoice Data to check totals
    const { data: invoice, error: fetchError } = await supabase
        .from("invoices")
        .select("total_amount, payments(amount)")
        .eq("id", payment.invoice_id)
        .single();

    if (fetchError || !invoice) {
        // Payment succeeded but failed to fetch invoice for status update
        // We still return success as the payment is recorded
        revalidatePath(`/dashboard/invoices/${payment.invoice_id}`);
        return { success: true, warning: "Payment recorded but status update failed" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const invoiceTotal = Number(invoice.total_amount);

    // 3. Update Status if Fully Paid
    // We only auto-update to 'paid'. If it was 'paid' and now isn't (e.g. edited invoice), logic is more complex.
    // Here we strictly handle the "Mark as Paid" flow.
    if (totalPaid >= invoiceTotal - 0.5) { // 0.5 buffer for rounding errors
        await supabase
            .from("invoices")
            .update({ status: "paid" })
            .eq("id", payment.invoice_id);
    }

    revalidatePath(`/dashboard/invoices/${payment.invoice_id}`);
    revalidatePath("/dashboard/invoices");
    return { success: true };
}
