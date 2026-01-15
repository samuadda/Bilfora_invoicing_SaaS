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

            const { data, error } = await supabase
                .from("clients")
                .select("*")
                .eq("status", "active")
                .order("name");

            if (error) {
                throw error;
            }

            return data as Client[];
        },
    });
}
