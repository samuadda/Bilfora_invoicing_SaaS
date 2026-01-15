import { supabase } from "@/lib/supabase";
import { InvoiceWithClientAndItems } from "@/types/database";

export interface MonthlyStats {
	totalInvoiced: number;
	collected: number;
	outstanding: number;
	overdueCount: number;
	totalInvoices: number;
	paidInvoices: number;
}

export interface DailyRevenue {
	day: number;
	revenue: number;
	paid: number;
}

export function useInvoiceStats() {

	const getMonthlyStats = async (userId: string, year: number, month: number): Promise<MonthlyStats> => {
		const startDate = new Date(year, month - 1, 1).toISOString();
		const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

		const { data, error } = await supabase
			.from("invoices")
			.select("total_amount, status, due_date, created_at")
			.eq("user_id", userId)
			.gte("created_at", startDate)
			.lte("created_at", endDate);

		if (error) throw error;

		const stats: MonthlyStats = {
			totalInvoiced: 0,
			collected: 0,
			outstanding: 0,
			overdueCount: 0, // This logic checks current overdue, which depends on due date field
			totalInvoices: 0,
			paidInvoices: 0,
		};

		const now = new Date();

		(data || []).forEach((inv) => {
			stats.totalInvoices++;
			stats.totalInvoiced += inv.total_amount;

			if (inv.status === "paid") {
				stats.collected += inv.total_amount;
				stats.paidInvoices++;
			} else if (inv.status !== "cancelled") {
				stats.outstanding += inv.total_amount;
				// Overdue check
				if (new Date(inv.due_date) < now) {
					stats.overdueCount++;
				}
			}
		});

		return stats;
	};

	const getDailyRevenue = async (userId: string, year: number, month: number): Promise<DailyRevenue[]> => {
		const startDate = new Date(year, month - 1, 1).toISOString();
		const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

		const { data, error } = await supabase
			.from("invoices")
			.select("created_at, total_amount, status")
			.eq("user_id", userId)
			.gte("created_at", startDate)
			.lte("created_at", endDate);

		if (error) throw error;

		// Group by day
		const dailyMap = new Map<number, { revenue: number; paid: number }>();
		const daysInMonth = new Date(year, month, 0).getDate();

		// Initialize all days
		for (let d = 1; d <= daysInMonth; d++) {
			dailyMap.set(d, { revenue: 0, paid: 0 });
		}

		(data || []).forEach((inv) => {
			const day = new Date(inv.created_at).getDate();
			const current = dailyMap.get(day) || { revenue: 0, paid: 0 };

			if (inv.status !== "cancelled") {
				current.revenue += inv.total_amount;
			}
			if (inv.status === "paid") {
				current.paid += inv.total_amount;
			}
			dailyMap.set(day, current);
		});

		return Array.from(dailyMap.entries()).map(([day, stats]) => ({
			day,
			revenue: stats.revenue,
			paid: stats.paid,
		}));
	};

	const getRecentInvoices = async (userId: string, year: number, month: number, limit: number) => {
		// Logic seemed to fetch recent invoices generally, or for that month?
		// useDashboardData passes year/month, but typical "Recent Invoices" is global.
		// Let's assume it respects the filter if passed, or just global recent if the UI implies that.
		// The args signature in useDashboardData: getRecentInvoices(id, year, month, 8).
		// So it is filtered by month.

		const startDate = new Date(year, month - 1, 1).toISOString();
		const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

		const { data, error } = await supabase
			.from("invoices")
			.select("*, client:clients(*)")
			.eq("user_id", userId)
			.gte("created_at", startDate)
			.lte("created_at", endDate)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) throw error;
		return (data as any[]) || []; // Returning basic array or typed
	};

	return {
		getMonthlyStats,
		getDailyRevenue,
		getRecentInvoices
	};
}
