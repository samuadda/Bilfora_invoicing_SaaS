"use client";

import { useState, useEffect, useMemo, Suspense } from "react";

import { useSearchParams, useRouter } from "next/navigation";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
} from "recharts";
import {
	TrendingUp,
	Users,
	ShoppingCart,
	DollarSign,
	AlertCircle,
	Package,
	ArrowUpRight,
	ArrowDownRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { InvoiceWithClientAndItems } from "@/types/database";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import LoadingState from "@/components/LoadingState";
import { Heading, Text, Button, Price } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";
import AnalyticsFiltersComponent, { AnalyticsFilters } from "@/components/filters/AnalyticsFilters";
import KPICard from "@/components/analytics/KPICard";
import EnhancedChart from "@/components/charts/EnhancedChart";
import EmptyState from "@/components/analytics/EmptyState";
import RevenueByCategory from "@/components/analytics/RevenueByCategory";
import ExportMenu from "@/components/analytics/ExportMenu";
// ExcelJS is dynamically imported in exportToExcel to reduce bundle size
import { useRef } from "react";

interface PeriodComparison {
	current: number;
	previous: number;
	change: number; // percentage
}

interface EnhancedStats {
	totalRevenue: number;
	totalInvoices: number;
	activeCustomers: number;
	collectionRate: number; // percentage
	overdueRatio: number; // percentage
	topProduct: string;
	highestInvoice: number;
	lowestInvoice: number;
	avgInvoiceValue: number;
	revenueComparison: PeriodComparison;
	invoicesComparison: PeriodComparison;
	collectionRateComparison: PeriodComparison;
	overdueRatioComparison: PeriodComparison;
}

// function AnalyticsContent() {
// export default function AnalyticsPage() { // Previous export
function AnalyticsContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const fromParam = searchParams.get("from");
	const toParam = searchParams.get("to");
	const pageRef = useRef<HTMLDivElement>(null);

	// State
	const [invoices, setInvoices] = useState<InvoiceWithClientAndItems[]>([]);
	const [filteredInvoices, setFilteredInvoices] = useState<InvoiceWithClientAndItems[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [stats, setStats] = useState<EnhancedStats>({
		totalRevenue: 0,
		totalInvoices: 0,
		activeCustomers: 0,
		collectionRate: 0,
		overdueRatio: 0,
		topProduct: "—",
		highestInvoice: 0,
		lowestInvoice: 0,
		avgInvoiceValue: 0,
		revenueComparison: { current: 0, previous: 0, change: 0 },
		invoicesComparison: { current: 0, previous: 0, change: 0 },
		collectionRateComparison: { current: 0, previous: 0, change: 0 },
		overdueRatioComparison: { current: 0, previous: 0, change: 0 },
	});

	const [filters, setFilters] = useState<AnalyticsFilters>({
		customerId: "all",
		status: "all",
		minAmount: null,
		maxAmount: null,
		productId: "all",
	});

	const [revenueByMonth, setRevenueByMonth] = useState<
		{ name: string; revenue: number; orders: number }[]
	>([]);
	const [statusDistribution, setStatusDistribution] = useState<
		{ name: string; value: number; color: string }[]
	>([]);
	const [topClients, setTopClients] = useState<
		{ name: string; revenue: number; invoiceCount: number }[]
	>([]);
	const [revenueByCategory, setRevenueByCategory] = useState<
		{ name: string; value: number; color: string }[]
	>([]);

	// Resolve date range
	const dateFrom = fromParam
		? new Date(fromParam)
		: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
	const dateTo = toParam ? new Date(toParam) : new Date();

	// Previous period for comparison
	const previousPeriodDays = Math.ceil(
		(dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)
	);
	const previousDateFrom = new Date(
		dateFrom.getTime() - previousPeriodDays * 24 * 60 * 60 * 1000
	);
	// const previousDateTo = new Date(dateFrom.getTime());

	useEffect(() => {
		loadAnalyticsData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromParam, toParam]);

	useEffect(() => {
		applyFilters();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [invoices, filters]);

	const loadAnalyticsData = async () => {
		try {
			setLoading(true);
			setError(null);

			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

			// Load invoices with client and items
			const { data: invoicesData, error: invoicesError } = await supabase
				.from("invoices")
				.select(
					`
					*,
					client:clients(*),
					items:invoice_items(*)
				`
				)
				.eq("user_id", user.id)
				.gte("created_at", previousDateFrom.toISOString())
				.lte("created_at", dateTo.toISOString())
				.order("created_at", { ascending: false });

			if (invoicesError) throw invoicesError;

			setInvoices((invoicesData as InvoiceWithClientAndItems[]) || []);

			// Calculate stats
			await calculateStats(
				(invoicesData as InvoiceWithClientAndItems[]) || [],
				user.id
			);
		} catch (err: unknown) {
			console.error("Error loading analytics:", err);
			setError("حدث خطأ أثناء تحميل البيانات");
		} finally {
			setLoading(false);
		}
	};

	const calculateStats = async (
		allInvoices: InvoiceWithClientAndItems[],
		userId: string
	) => {
		// Current period invoices
		const currentInvoices = allInvoices.filter(
			(inv) =>
				new Date(inv.created_at) >= dateFrom &&
				new Date(inv.created_at) <= dateTo
		);

		// Previous period invoices
		const previousInvoices = allInvoices.filter(
			(inv) =>
				new Date(inv.created_at) >= previousDateFrom &&
				new Date(inv.created_at) < dateFrom
		);

		// Current period stats
		const currentRevenue = currentInvoices.reduce(
			(sum, inv) => sum + inv.total_amount,
			0
		);
		const currentPaidRevenue = currentInvoices
			.filter((inv) => inv.status === "paid")
			.reduce((sum, inv) => sum + inv.total_amount, 0);
		const currentOverdueAmount = currentInvoices
			.filter(
				(inv) =>
					inv.status !== "paid" &&
					inv.status !== "cancelled" &&
					new Date(inv.due_date) < new Date()
			)
			.reduce((sum, inv) => sum + inv.total_amount, 0);

		// Previous period stats
		const previousRevenue = previousInvoices.reduce(
			(sum, inv) => sum + inv.total_amount,
			0
		);
		const previousPaidRevenue = previousInvoices
			.filter((inv) => inv.status === "paid")
			.reduce((sum, inv) => sum + inv.total_amount, 0);
		const previousOverdueAmount = previousInvoices
			.filter(
				(inv) =>
					inv.status !== "paid" &&
					inv.status !== "cancelled" &&
					new Date(inv.due_date) < new Date()
			)
			.reduce((sum, inv) => sum + inv.total_amount, 0);

		// Collection rate
		const currentCollectionRate =
			currentRevenue > 0 ? (currentPaidRevenue / currentRevenue) * 100 : 0;
		const previousCollectionRate =
			previousRevenue > 0 ? (previousPaidRevenue / previousRevenue) * 100 : 0;

		// Overdue ratio
		const currentOverdueRatio =
			currentRevenue > 0 ? (currentOverdueAmount / currentRevenue) * 100 : 0;
		const previousOverdueRatio =
			previousRevenue > 0 ? (previousOverdueAmount / previousRevenue) * 100 : 0;

		// Top product/service
		const productMap = new Map<string, number>();
		currentInvoices.forEach((inv) => {
			inv.items?.forEach((item) => {
				const productName = item.description || "غير محدد";
				productMap.set(
					productName,
					(productMap.get(productName) || 0) + item.total
				);
			});
		});
		const topProductEntry = Array.from(productMap.entries()).sort(
			(a, b) => b[1] - a[1]
		)[0];
		const topProduct = topProductEntry ? topProductEntry[0] : "—";

		// Highest/Lowest invoice
		const amounts = currentInvoices.map((inv) => inv.total_amount);
		const highestInvoice = amounts.length > 0 ? Math.max(...amounts) : 0;
		const lowestInvoice = amounts.length > 0 ? Math.min(...amounts) : 0;

		// Active customers
		const { data: clientsData } = await supabase
			.from("clients")
			.select("id, status")
			.eq("user_id", userId)
			.is("deleted_at", null);
		const activeCustomers =
			clientsData?.filter((c) => c.status === "active").length || 0;

		// Calculate comparisons
		const revenueChange =
			previousRevenue > 0
				? ((currentRevenue - previousRevenue) / previousRevenue) * 100
				: 0;
		const invoicesChange =
			previousInvoices.length > 0
				? ((currentInvoices.length - previousInvoices.length) /
					previousInvoices.length) *
				100
				: 0;
		const collectionRateChange = previousCollectionRate
			? currentCollectionRate - previousCollectionRate
			: 0;
		const overdueRatioChange = previousOverdueRatio
			? currentOverdueRatio - previousOverdueRatio
			: 0;

		setStats({
			totalRevenue: currentRevenue,
			totalInvoices: currentInvoices.length,
			activeCustomers,
			collectionRate: currentCollectionRate,
			overdueRatio: currentOverdueRatio,
			topProduct,
			highestInvoice,
			lowestInvoice,
			avgInvoiceValue:
				currentInvoices.length > 0
					? currentRevenue / currentInvoices.length
					: 0,
			revenueComparison: {
				current: currentRevenue,
				previous: previousRevenue,
				change: revenueChange,
			},
			invoicesComparison: {
				current: currentInvoices.length,
				previous: previousInvoices.length,
				change: invoicesChange,
			},
			collectionRateComparison: {
				current: currentCollectionRate,
				previous: previousCollectionRate,
				change: collectionRateChange,
			},
			overdueRatioComparison: {
				current: currentOverdueRatio,
				previous: previousOverdueRatio,
				change: overdueRatioChange,
			},
		});

		// Calculate revenue by month
		const monthlyMap = new Map<
			string,
			{ invoices: number; revenue: number }
		>();
		currentInvoices.forEach((inv) => {
			const date = new Date(inv.created_at);
			const monthKey = `${date.getFullYear()}-${String(
				date.getMonth() + 1
			).padStart(2, "0")}`;

			if (!monthlyMap.has(monthKey)) {
				monthlyMap.set(monthKey, { invoices: 0, revenue: 0 });
			}

			const monthData = monthlyMap.get(monthKey)!;
			monthData.invoices += 1;
			monthData.revenue += inv.total_amount;
		});

		const monthlyArray = Array.from(monthlyMap.entries())
			.map(([key, data]) => {
				const [year, month] = key.split("-");
				const date = new Date(parseInt(year), parseInt(month) - 1);
				return {
					name: date.toLocaleDateString("en-US", {
						month: "short",
						year: "numeric",
					}),
					revenue: data.revenue,
					orders: data.invoices,
				};
			})
			.sort((a, b) => {
				// Sort by date
				const dateA = new Date(a.name);
				const dateB = new Date(b.name);
				return dateA.getTime() - dateB.getTime();
			});

		setRevenueByMonth(monthlyArray);

		// Status distribution
		const statusCounts = currentInvoices.reduce(
			(acc, inv) => {
				acc[inv.status] = (acc[inv.status] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		const statusData = [
			{ name: "مدفوعة", value: statusCounts.paid || 0, color: "#10B981" },
			{ name: "مرسلة", value: statusCounts.sent || 0, color: "#3B82F6" },
			{ name: "مسودة", value: statusCounts.draft || 0, color: "#E5E7EB" },
			{ name: "متأخرة", value: statusCounts.overdue || 0, color: "#F59E0B" },
			{ name: "ملغية", value: statusCounts.cancelled || 0, color: "#EF4444" },
		].filter((item) => item.value > 0);

		setStatusDistribution(statusData);

		// Top clients
		const clientMap = new Map<
			string,
			{ name: string; revenue: number; invoiceCount: number }
		>();
		currentInvoices
			.filter((inv) => inv.status === "paid")
			.forEach((inv) => {
				const clientId = inv.client_id;
				const clientName = inv.client?.name || "عميل غير معروف";

				if (!clientMap.has(clientId)) {
					clientMap.set(clientId, {
						name: clientName,
						revenue: 0,
						invoiceCount: 0,
					});
				}

				const client = clientMap.get(clientId)!;
				client.revenue += inv.total_amount;
				client.invoiceCount += 1;
			});

		const topClientsArray = Array.from(clientMap.values())
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5);

		setTopClients(topClientsArray);

		// Revenue by category (simplified - using product names from invoice items)
		const categoryMap = new Map<string, number>();
		currentInvoices.forEach((inv) => {
			inv.items?.forEach((item) => {
				// Simple categorization based on description keywords
				const desc = (item.description || "").toLowerCase();
				let category = "خدمات";
				if (desc.includes("منتج") || desc.includes("سلعة")) {
					category = "منتجات";
				} else if (desc.includes("اشتراك") || desc.includes("شهري")) {
					category = "اشتراكات";
				}

				categoryMap.set(
					category,
					(categoryMap.get(category) || 0) + item.total
				);
			});
		});

		const categoryData = Array.from(categoryMap.entries()).map(
			([name, value], index) => ({
				name,
				value,
				color: ["#8B5CF6", "#3B82F6", "#10B981"][index % 3],
			})
		);

		setRevenueByCategory(categoryData);
	};

	const applyFilters = () => {
		let filtered = [...invoices];

		// Date filter (already applied in loadAnalyticsData, but ensure it's current period)
		filtered = filtered.filter(
			(inv) =>
				new Date(inv.created_at) >= dateFrom &&
				new Date(inv.created_at) <= dateTo
		);

		// Customer filter
		if (filters.customerId !== "all") {
			filtered = filtered.filter((inv) => inv.client_id === filters.customerId);
		}

		// Status filter
		if (filters.status !== "all") {
			filtered = filtered.filter((inv) => inv.status === filters.status);
		}

		// Amount range filter
		if (filters.minAmount !== null) {
			filtered = filtered.filter(
				(inv) => inv.total_amount >= filters.minAmount!
			);
		}
		if (filters.maxAmount !== null) {
			filtered = filtered.filter(
				(inv) => inv.total_amount <= filters.maxAmount!
			);
		}

		// Product filter (check if invoice items contain the product)
		if (filters.productId !== "all") {
			filtered = filtered.filter((inv) =>
				inv.items?.some((item) => item.id === filters.productId)
			);
		}

		setFilteredInvoices(filtered);
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 0,
		}).format(amount);

	const exportToCSV = () => {
		const headers = [
			"رقم الفاتورة",
			"العميل",
			"المبلغ",
			"الحالة",
			"تاريخ الإصدار",
			"تاريخ الاستحقاق",
		];

		const rows = filteredInvoices.map((inv) => [
			inv.invoice_number,
			inv.client?.name || "",
			inv.total_amount,
			inv.status,
			new Date(inv.created_at).toLocaleDateString("en-GB"),
			new Date(inv.due_date).toLocaleDateString("en-GB"),
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		const blob = new Blob(["\uFEFF" + csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`analytics-export-${new Date().toISOString().split("T")[0]}.csv`
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const exportToExcel = async () => {
		// Dynamic import to reduce initial bundle size (~500KB savings)
		const ExcelJS = (await import("exceljs")).default;
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("التحليلات");

		worksheet.columns = [
			{ header: "رقم الفاتورة", key: "invoice_number", width: 15 },
			{ header: "العميل", key: "client_name", width: 20 },
			{ header: "المبلغ", key: "amount", width: 12 },
			{ header: "الحالة", key: "status", width: 12 },
			{ header: "تاريخ الإصدار", key: "issue_date", width: 15 },
			{ header: "تاريخ الاستحقاق", key: "due_date", width: 15 },
		];

		filteredInvoices.forEach((inv) => {
			worksheet.addRow({
				invoice_number: inv.invoice_number,
				client_name: inv.client?.name || "",
				amount: inv.total_amount,
				status: inv.status,
				issue_date: new Date(inv.created_at).toLocaleDateString("en-GB"),
				due_date: new Date(inv.due_date).toLocaleDateString("en-GB"),
			});
		});

		const headerRow = worksheet.getRow(1);
		headerRow.font = { bold: true };
		headerRow.alignment = { vertical: "middle", horizontal: "center" };

		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		const url = window.URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `analytics-export-${new Date().toISOString().split("T")[0]}.xlsx`;
		anchor.click();
		window.URL.revokeObjectURL(url);
	};

	const exportToPDF = () => {
		// Use browser's print functionality
		// User can save as PDF from print dialog
		window.print();
	};

	// Generate forecast data (simple linear projection)
	const forecastData = useMemo(() => {
		if (revenueByMonth.length < 2) return [];
		const lastTwo = revenueByMonth.slice(-2);
		const trend = lastTwo[1].revenue - lastTwo[0].revenue;
		const forecast = [
			...revenueByMonth,
			{
				name: "التنبؤ",
				revenue: lastTwo[1].revenue + trend,
				orders: 0,
			},
		];
		return forecast;
	}, [revenueByMonth]);

	if (loading) {
		return <LoadingState message="جاري تحليل البيانات..." />;
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<p className="text-red-600 mb-4">{error}</p>
					<Button variant="primary" onClick={loadAnalyticsData}>
						إعادة المحاولة
					</Button>
				</div>
			</div>
		);
	}

	// Check if there's any data
	const hasData = invoices.length > 0;

	if (!hasData) {
		return <EmptyState />;
	}

	return (
		<div ref={pageRef} className="space-y-8 pb-12">
			{/* Header with Filters and Export */}
			<div className={cn("flex flex-col md:flex-row items-center justify-between", layout.gap.standard)}>
				<div>
					<Heading variant="h1">تقارير الأداء</Heading>
					<Text variant="body-large" color="muted" className="mt-2">تحليلات مفصلة لنمو أعمالك</Text>
				</div>
				<div className={cn("flex items-center", layout.gap.standard)}>
					<AnalyticsFiltersComponent
						filters={filters}
						onFiltersChange={setFilters}
					/>
					<ExportMenu
						onExportCSV={exportToCSV}
						onExportExcel={exportToExcel}
						onExportPDF={exportToPDF}
					/>
				</div>
			</div>

			{/* Enhanced KPI Cards */}
			<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4", layout.gap.standard)}>
				<KPICard
					title="إجمالي الإيرادات"
					value={<Price amount={stats.totalRevenue} size="xl" />}
					icon={DollarSign}
					color="green"
					trend={{
						value: stats.revenueComparison.change,
						label: "مقارنة بالفترة السابقة",
					}}
				/>
				<KPICard
					title="عدد الفواتير"
					value={stats.totalInvoices}
					icon={ShoppingCart}
					color="blue"
					trend={{
						value: stats.invoicesComparison.change,
						label: "مقارنة بالفترة السابقة",
					}}
				/>
				<KPICard
					title="معدل التحصيل"
					value={`${stats.collectionRate.toFixed(1)}%`}
					icon={TrendingUp}
					color="purple"
					trend={{
						value: stats.collectionRateComparison.change,
						label: "مقارنة بالفترة السابقة",
					}}
					subtitle="نسبة الفواتير المدفوعة"
				/>
				<KPICard
					title="نسبة المتأخرات"
					value={`${stats.overdueRatio.toFixed(1)}%`}
					icon={AlertCircle}
					color="orange"
					trend={{
						value: -stats.overdueRatioComparison.change, // Negative because lower is better
						label: "مقارنة بالفترة السابقة",
					}}
					subtitle="نسبة الفواتير المتأخرة"
				/>
			</div>

			{/* Additional KPI Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
				<KPICard
					title="أفضل منتج / خدمة"
					value={stats.topProduct}
					icon={Package}
					color="indigo"
				/>
				<KPICard
					title="أعلى فاتورة"
					value={<Price amount={stats.highestInvoice} size="xl" />}
					icon={ArrowUpRight}
					color="green"
				/>
				<KPICard
					title="أقل فاتورة"
					value={<Price amount={stats.lowestInvoice} size="xl" />}
					icon={ArrowDownRight}
					color="blue"
				/>
				<KPICard
					title="متوسط قيمة الفاتورة"
					value={<Price amount={stats.avgInvoiceValue} size="xl" />}
					icon={TrendingUp}
					color="pink"
				/>
			</div>

			{/* Revenue Chart with Forecast */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
			>
				<div className="flex items-center justify-between mb-8">
					<h3 className="text-xl font-bold text-[#012d46]">نمو الإيرادات</h3>
				</div>
				<EnhancedChart
					data={revenueByMonth}
					dataKey="revenue"
					name="الإيرادات"
					color="#8B5CF6"
					gradientId="revenueGradient"
					showForecast={true}
					forecastData={forecastData}
					currency={true}
				/>
			</m.div>

			{/* Revenue & Status Distribution */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:col-span-2"
				>
					<h3 className="text-xl font-bold text-[#012d46] mb-2">الإيرادات الشهرية</h3>
					<p className="text-sm text-gray-500 mb-8">تطور الإيرادات عبر الأشهر</p>
					<EnhancedChart
						data={revenueByMonth}
						dataKey="revenue"
						name="الإيرادات"
						color="#3B82F6"
						gradientId="monthlyRevenueGradient"
						currency={true}
					/>
				</m.div>

				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col"
				>
					<h3 className="text-xl font-bold text-[#012d46] mb-2">حالة الفواتير</h3>
					<p className="text-sm text-gray-500 mb-8">توزيع الفواتير حسب الحالة</p>
					<div className="flex-1 min-h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={statusDistribution}
									dataKey="value"
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={100}
									paddingAngle={4}
									cornerRadius={6}
								>
									{statusDistribution.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
									))}
								</Pie>
								<Tooltip
									content={({ active, payload }) => {
										if (active && payload && payload.length) {
											const data = payload[0];
											return (
												<div className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl border border-gray-800 text-sm">
													<p className="font-bold mb-2">{data.name}</p>
													<p className="font-medium">{data.value} فاتورة</p>
												</div>
											);
										}
										return null;
									}}
								/>
								<Legend
									verticalAlign="bottom"
									height={36}
									iconType="circle"
									formatter={(value) => (
										<span className="text-sm font-medium text-gray-600 mr-2">
											{value}
										</span>
									)}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</m.div>
			</div>

			{/* Revenue by Category */}
			{revenueByCategory.length > 0 && (
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
				>
					<h3 className="text-xl font-bold text-[#012d46] mb-8">الإيرادات حسب الفئة</h3>
					<RevenueByCategory categories={revenueByCategory} />
				</m.div>
			)}

			{/* Top Customers */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
			>
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-bold text-[#012d46]">أفضل العملاء</h3>
					<button
						onClick={() => router.push("/dashboard/analytics/top-customers")}
						className="text-[#7f2dfb] text-sm font-bold hover:underline"
					>
						عرض الكل
					</button>
				</div>
				<div className="space-y-4">
					{topClients.length > 0 ? (
						topClients.map((client, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors"
							>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
										{client.name.charAt(0).toUpperCase()}
									</div>
									<div>
										<p className="font-bold text-gray-900">{client.name}</p>
										<p className="text-xs text-gray-500 font-medium mt-0.5">
											{client.invoiceCount} فاتورة مدفوعة
										</p>
									</div>
								</div>
								<div className="text-left">
									<p className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
										{formatCurrency(client.revenue)}
									</p>
								</div>
							</div>
						))
					) : (
						<div className="text-center py-12">
							<Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
							<p className="text-gray-500 font-medium">لا توجد بيانات كافية</p>
						</div>
					)}
				</div>
			</m.div>
		</div>
	);
}

export default function AnalyticsPage() {
	return (
		<Suspense fallback={<LoadingState />}>
			<AnalyticsContent />
		</Suspense>
	);
}
