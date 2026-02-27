import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";

export function useSettings() {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from("invoice_settings")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) {
                console.error("Error fetching settings:", error);
                throw error;
            }

            return data;
        },
    });
}
