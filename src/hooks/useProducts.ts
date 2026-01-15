import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Product } from "@/types/database";

export function useProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("active", true)
                .order("name");

            if (error) {
                throw error;
            }

            return data as Product[];
        },
    });
}
