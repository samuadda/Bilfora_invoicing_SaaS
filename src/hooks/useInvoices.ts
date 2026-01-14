import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { InvoiceWithClientAndItems, InvoiceStatus } from "@/types/database";

export const INVOICES_QUERY_KEY = ["invoices"];

export function useInvoices() {
    return useQuery({
        queryKey: INVOICES_QUERY_KEY,
        queryFn: async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("invoices")
                .select(
                    `
          *,
          client:clients(*),
          items:invoice_items(*)
        `
                )
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data as InvoiceWithClientAndItems[]) || [];
        },
    });
}

export function useDeleteInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (invoiceIds: string | string[]) => {
            const ids = Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds];
            const { error } = await supabase.from("invoices").delete().in("id", ids);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
        },
    });
}

export function useUpdateInvoiceStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            ids,
            status,
        }: {
            ids: string | string[];
            status: InvoiceStatus;
        }) => {
            const invoiceIds = Array.isArray(ids) ? ids : [ids];
            const { error } = await supabase
                .from("invoices")
                .update({ status })
                .in("id", invoiceIds);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
        },
    });
}
