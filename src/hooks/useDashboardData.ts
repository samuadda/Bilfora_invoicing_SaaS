import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useInvoiceStats, MonthlyStats, DailyRevenue } from "@/hooks/useInvoiceStats";
import { InvoiceWithClientAndItems } from "@/types/database";

export function useDashboardData(selectedYear: number, selectedMonth: number) {
    const { getMonthlyStats, getDailyRevenue, getRecentInvoices } = useInvoiceStats();

    // Fetch User
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");
            return user;
        },
    });

    // Fetch Profile
    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ["profile", user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data } = await supabase
                .from("profiles")
                .select("full_name, created_at")
                .eq("id", user.id)
                .single();
            return data;
        },
        enabled: !!user,
    });

    // Fetch Monthly Stats
    const { data: monthlyStats, isLoading: isStatsLoading } = useQuery({
        queryKey: ["monthlyStats", user?.id, selectedYear, selectedMonth],
        queryFn: () => getMonthlyStats(user!.id, selectedYear, selectedMonth),
        enabled: !!user,
        placeholderData: (prev) => prev, // Keep previous data while fetching new month
    });

    // Fetch Daily Revenue
    const { data: dailyRevenue, isLoading: isRevenueLoading } = useQuery({
        queryKey: ["dailyRevenue", user?.id, selectedYear, selectedMonth],
        queryFn: () => getDailyRevenue(user!.id, selectedYear, selectedMonth),
        enabled: !!user,
        placeholderData: (prev) => prev,
    });

    // Fetch Recent Invoices
    const { data: recentInvoices, isLoading: isInvoicesLoading } = useQuery({
        queryKey: ["recentInvoices", user?.id, selectedYear, selectedMonth],
        queryFn: () => getRecentInvoices(user!.id, selectedYear, selectedMonth, 8),
        enabled: !!user,
        placeholderData: (prev) => prev,
    });

    const isLoading =
        isUserLoading ||
        isProfileLoading ||
        isStatsLoading ||
        isRevenueLoading ||
        isInvoicesLoading;

    // Default empty stats if loading or error
    const defaultStats: MonthlyStats = {
        totalInvoiced: 0,
        collected: 0,
        outstanding: 0,
        overdueCount: 0,
        totalInvoices: 0,
        paidInvoices: 0,
    };

    return {
        user,
        profile,
        monthlyStats: monthlyStats || defaultStats,
        dailyRevenue: dailyRevenue || [],
        recentInvoices: recentInvoices || [],
        isLoading,
    };
}
