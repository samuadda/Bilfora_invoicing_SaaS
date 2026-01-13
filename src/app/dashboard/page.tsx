"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, ArrowRight, FileText, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InvoiceCreationModal from "@/components/InvoiceCreationModal";
import QuickClientModal from "@/components/QuickClientModal";
import QuickProductModal from "@/components/QuickProductModal";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import LoadingState from "@/components/LoadingState";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import MonthlyStatsCards from "@/components/dashboard/MonthlyStatsCards";
import MonthlyRevenueChart from "@/components/dashboard/MonthlyRevenueChart";
import RecentInvoicesList from "@/components/dashboard/RecentInvoicesList";
import { useInvoiceStats, MonthlyStats, DailyRevenue } from "@/hooks/useInvoiceStats";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useQueryClient } from "@tanstack/react-query";
import { InvoiceWithClientAndItems } from "@/types/database";
import Link from "next/link";
import { Heading, Text, Card, Button, Select } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
	const router = useRouter();
	const { toast } = useToast();

	// Month/Year selector state
	const now = new Date();
	const [selectedYear, setSelectedYear] = useState(now.getFullYear());
	const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

	// Modals state
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
	const [showClientModal, setShowClientModal] = useState(false);
	const [showProductModal, setShowProductModal] = useState(false);

	// Fetch Data using React Query
	const {
		user,
		profile,
		monthlyStats: stats,
		dailyRevenue,
		recentInvoices,
		isLoading
	} = useDashboardData(selectedYear, selectedMonth);

	// Redirect if not authenticated (client-side protection)
	// Note: Middleware usually handles this, but keeping it as backup
	useEffect(() => {
		if (!isLoading && !user) {
			router.push("/login");
		}
	}, [user, isLoading, router]);


	// Derived UI state
	const userName = profile?.full_name || "";
	// If profile creation year is missing, fallback to current year
	const accountCreatedYear = profile?.created_at
		? new Date(profile.created_at).getFullYear()
		: now.getFullYear();

	// Format currency helper
	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 0,
		}).format(amount);


	// Generate month options for selector
	const monthOptions = useMemo(() => {
		const months = [
			"يناير",
			"فبراير",
			"مارس",
			"أبريل",
			"مايو",
			"يونيو",
			"يوليو",
			"أغسطس",
			"سبتمبر",
			"أكتوبر",
			"نوفمبر",
			"ديسمبر",
		];
		return months.map((name, index) => ({
			value: index,
			label: `${name} ${selectedYear}`,
		}));
	}, [selectedYear]);

	// Generate year options (from account creation year to current year)
	const yearOptions = useMemo(() => {
		const currentYear = now.getFullYear();
		const yearsCount = currentYear - accountCreatedYear + 1;
		return Array.from({ length: yearsCount }, (_, i) => currentYear - i);
	}, [accountCreatedYear]);

	const monthName = useMemo(() => {
		const months = [
			"يناير",
			"فبراير",
			"مارس",
			"أبريل",
			"مايو",
			"يونيو",
			"يوليو",
			"أغسطس",
			"سبتمبر",
			"أكتوبر",
			"نوفمبر",
			"ديسمبر",
		];
		return months[selectedMonth];
	}, [selectedMonth]);

	const openInvoiceModal = () => setShowInvoiceModal(true);
	const closeInvoiceModal = () => setShowInvoiceModal(false);

	const openClientModal = () => setShowClientModal(true);
	const closeClientModal = () => setShowClientModal(false);

	const openProductModal = () => setShowProductModal(true);
	const closeProductModal = () => setShowProductModal(false);

	// Query Invalidation Helper
	const queryClient = useQueryClient();
	const refreshData = () => {
		queryClient.invalidateQueries({ queryKey: ["monthlyStats"] });
		queryClient.invalidateQueries({ queryKey: ["dailyRevenue"] });
		queryClient.invalidateQueries({ queryKey: ["recentInvoices"] });
	};

	// Build analytics URL with month params
	const monthStr = String(selectedMonth + 1).padStart(2, "0");
	const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
	const analyticsUrl = `/dashboard/analytics?from=${selectedYear}-${monthStr}-01&to=${selectedYear}-${monthStr}-${lastDay}`;

	if (isLoading) {
		return <LoadingState message="جاري تحميل لوحة التحكم..." />;
	}

	return (
		<div className="space-y-6 pb-6">
			{/* Header with Month Selector */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className={cn("flex flex-col md:flex-row md:items-center md:justify-between", layout.gap.standard)}
			>
				<div>
					<Heading variant="h1">
						مرحباً، {userName || "شريك النجاح"} 👋
					</Heading>
					<Text variant="body-large" color="muted" className="mt-2">
						إليك نظرة عامة على أداء أعمالك هذا الشهر
					</Text>
				</div>
				<div className={cn("flex items-center", layout.gap.standard)}>
					{/* Month Selector */}
					<div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-2.5">
						<Calendar className="text-gray-400" size={18} />
						<select
							value={selectedMonth}
							onChange={(e) => setSelectedMonth(Number(e.target.value))}
							className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
						>
							{monthOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<select
							value={selectedYear}
							onChange={(e) => setSelectedYear(Number(e.target.value))}
							className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer mr-2"
						>
							{yearOptions.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>
					<DashboardQuickActions
						onCreateInvoice={openInvoiceModal}
						onCreateClient={openClientModal}
						onCreateProduct={openProductModal}
					/>
				</div>
			</motion.div>

			{/* Monthly Stats Cards */}
			<MonthlyStatsCards stats={stats} formatCurrency={formatCurrency} />

			{/* Chart and Summary Row */}
			<div className={cn("grid grid-cols-1 lg:grid-cols-3", layout.gap.large)}>
				{/* Revenue Chart */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="lg:col-span-2"
				>
					<Card>
						<div className="flex items-center justify-between mb-4">
							<div>
								<Heading variant="h3-subsection">
									الإيرادات اليومية - {monthName} {selectedYear}
								</Heading>
								<Text variant="body-xs" color="muted" className="mt-1">توزيع الإيرادات على أيام الشهر</Text>
							</div>
							<div className={cn("flex items-center text-xs", layout.gap.standard)}>
								<div className={cn("flex items-center", layout.gap.tight)}>
									<div className="w-2 h-2 rounded-full bg-[#7f2dfb]"></div>
									<Text variant="body-xs" color="muted">الإجمالي</Text>
								</div>
								<div className={cn("flex items-center", layout.gap.tight)}>
									<div className="w-2 h-2 rounded-full bg-green-500"></div>
									<Text variant="body-xs" color="muted">المحصل</Text>
								</div>
							</div>
						</div>
						{dailyRevenue.length > 0 ? (
							<MonthlyRevenueChart data={dailyRevenue} />
						) : (
							<div className="h-[280px] flex items-center justify-center text-gray-400">
								<Text variant="body-small">لا توجد بيانات لهذا الشهر</Text>
							</div>
						)}
					</Card>
				</motion.div>

				{/* Quick Summary */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
				>
					<Card hover>
						<Heading variant="h3-subsection" className="mb-5">ملخص سريع</Heading>
						<div className={layout.stack.standard}>
							<div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors group">
								<div className={cn("flex items-center", layout.gap.standard)}>
									<div className="p-2 bg-purple-100 rounded-lg group-hover:scale-105 transition-transform">
										<FileText className="text-[#7f2dfb]" size={18} strokeWidth={2.5} />
									</div>
									<Text variant="body-small" className="font-medium">عدد الفواتير</Text>
								</div>
								<Text variant="body-small" className="font-bold">{stats.totalInvoices}</Text>
							</div>
							<div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors group">
								<div className={cn("flex items-center", layout.gap.standard)}>
									<div className="p-2 bg-green-100 rounded-lg group-hover:scale-105 transition-transform">
										<TrendingUp className="text-green-600" size={18} strokeWidth={2.5} />
									</div>
									<Text variant="body-small" className="font-medium">معدل التحصيل</Text>
								</div>
								<Text variant="body-small" className="font-bold">
									{stats.totalInvoices > 0
										? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1)
										: 0}%
								</Text>
							</div>
							<div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors group">
								<div className={cn("flex items-center", layout.gap.standard)}>
									<div className="p-2 bg-blue-100 rounded-lg group-hover:scale-105 transition-transform">
										<DollarSign className="text-blue-600" size={18} strokeWidth={2.5} />
									</div>
									<Text variant="body-small" className="font-medium">متوسط الفاتورة</Text>
								</div>
								<Text variant="body-small" className="font-bold">
									{stats.totalInvoices > 0
										? formatCurrency(stats.totalInvoiced / stats.totalInvoices)
										: formatCurrency(0)}
								</Text>
							</div>
						</div>
						{stats.overdueCount > 0 && (
							<div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2">
								<AlertCircle className="text-orange-600 flex-shrink-0" size={16} />
								<Text variant="body-xs" className="font-medium text-orange-800">
									{stats.overdueCount} فاتورة متأخرة تحتاج متابعة
								</Text>
							</div>
						)}
					</Card>
				</motion.div>
			</div>

			{/* Recent Invoices List */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.7 }}
			>
				<RecentInvoicesList invoices={recentInvoices} formatCurrency={formatCurrency} />
			</motion.div>

			{/* Link to Analytics */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.8 }}
				className="flex justify-center pt-2"
			>
				<Link href={analyticsUrl}>
					<Button variant="secondary" className="inline-flex items-center gap-2">
						<span>عرض التحليلات التفصيلية</span>
						<ArrowRight size={16} />
					</Button>
				</Link>
			</motion.div>

			{/* Modals */}
			<InvoiceCreationModal
				isOpen={showInvoiceModal}
				onClose={closeInvoiceModal}
				onSuccess={refreshData}
			/>
			<QuickClientModal
				isOpen={showClientModal}
				onClose={closeClientModal}
				onSuccess={() => {
					refreshData();
					closeClientModal();
				}}
			/>
			<QuickProductModal
				isOpen={showProductModal}
				onClose={closeProductModal}
				onSuccess={() => {
					refreshData();
					closeProductModal();
				}}
			/>
		</div>
	);
}
