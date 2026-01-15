import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { InvoiceStatus } from "@/types/database";

export interface InvoiceStatsData {
    id: string;
    total_amount: number;
    status: InvoiceStatus;
    due_date: string;
    created_at: string;
}

export function useAllInvoicesStats() {
    return useQuery({
        queryKey: ["invoices", "all-stats"],
        queryFn: async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error("User not authenticated");

            // Fetch only necessary fields for stats calculation
            const { data, error } = await supabase
                .from("invoices")
                .select("id, total_amount, status, due_date, created_at")
                .eq("user_id", user.id);

            if (error) throw error;
            return (data as InvoiceStatsData[]) || [];
        },
    });
}
