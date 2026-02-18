import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Client } from "@/types/database";

export function useClients() {
    return useQuery({
        queryKey: ["clients"],
        queryFn: async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // Get current user to ensure we only fetch their clients
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from("clients")
                .select("*")
                .eq("user_id", user.id)
                .eq("status", "active")
                .is("deleted_at", null)
                .order("name");
            
            if (error) {
                console.error("Error fetching clients:", error);
                throw error;
            }

            return data as Client[];
        },
    });
}
