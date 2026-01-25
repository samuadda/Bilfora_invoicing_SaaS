"use client";

import { useState, useEffect, useMemo } from "react";
 import { ArrowRight, FileText, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import InvoiceCreationModal from "@/components/InvoiceCreationModal";
import QuickClientModal from "@/components/QuickClientModal";
import QuickProductModal from "@/components/QuickProductModal";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import LoadingState from "@/components/LoadingState";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import MonthlyStatsCards from "@/components/dashboard/MonthlyStatsCards";
import MonthlyRevenueChart from "@/components/dashboard/MonthlyRevenueChart";
import RecentInvoicesList from "@/components/dashboard/RecentInvoicesList";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Heading, Text, Card, Button, Price } from "@/components/ui";
import { cn } from "@/lib/utils";

import { layout } from "@/lib/ui/tokens";

export default function DashboardPage() {
	const router = useRouter();

	// Month/Year selector state
	const now = new Date();
	const [selectedYear] = useState(now.getFullYear());
	const [selectedMonth] = useState(now.getMonth());

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
			<m.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className={cn("flex flex-col md:flex-row md:items-center md:justify-between", layout.gap.standard)}
			>
				<div>
					<Heading variant="h1" className="flex items-center gap-3">
						مرحباً، {userName || "شريك النجاح"} 
					</Heading>
					<Text variant="body-large" color="muted" className="mt-2">
						إليك نظرة عامة على أداء أعمالك هذا الشهر
					</Text>
				</div>
				<div className={cn("flex items-center", layout.gap.standard)}>
					<DashboardQuickActions
						onCreateInvoice={openInvoiceModal}
						onCreateClient={openClientModal}
						onCreateProduct={openProductModal}
					/>
				</div>
			</m.div>

			{/* Monthly Stats Cards */}
			<MonthlyStatsCards stats={stats} />

			{/* Chart and Summary Row */}
			<div className={cn("grid grid-cols-1 lg:grid-cols-3", layout.gap.large)}>
				{/* Revenue Chart */}
				<m.div
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
				</m.div>

				{/* Quick Summary */}
				<m.div
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
								<Price
									amount={stats.totalInvoices > 0 ? stats.totalInvoiced / stats.totalInvoices : 0}
									size="sm"
									className="font-bold"
								/>
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
				</m.div>
			</div>

			{/* Recent Invoices List */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.7 }}
			>
				<RecentInvoicesList invoices={recentInvoices} />
			</m.div>

			{/* Link to Analytics */}
			<m.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.8 }}
				className="flex justify-center pt-2"
			>
				<Link href={analyticsUrl}>
					<button className="relative group bg-white border border-purple-100 hover:border-purple-200 shadow-sm hover:shadow-md hover:shadow-purple-100/30 text-gray-600 hover:text-purple-700 px-8 py-3.5 rounded-2xl transition-all duration-300 flex items-center gap-3">
						<span className="font-medium">عرض التحليلات التفصيلية</span>
						<div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors duration-300">
							<ArrowRight size={16} className="group-hover:-translate-x-0.5 transition-transform" />
						</div>
					</button>
				</Link>
			</m.div>

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
