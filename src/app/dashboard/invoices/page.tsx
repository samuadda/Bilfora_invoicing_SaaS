"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useClients } from "@/hooks/useClients";
import { useAllInvoicesStats } from "@/hooks/useAllInvoicesStats";

import {
	Eye,
	Download,
	ChevronLeft,
	ChevronRight,
	CheckCircle,
	Clock,
	XCircle,
	AlertCircle,
	FileText,
	Send,
	Plus,
	Search,
	Trash2,
	Loader2,
	Calendar,
	Check,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/dialog";
import { InvoiceWithClientAndItems, InvoiceStatus, InvoiceType } from "@/types/database";
import InvoiceCreationModal from "@/components/InvoiceCreationModal";
import { getInvoiceTypeLabel } from "@/lib/invoiceTypeLabels";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import LoadingState from "@/components/LoadingState";
import { Heading, Text, Card, Button, Input, Select } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";

const statusConfig = {
	draft: {
		label: "مسودة",
		color: "bg-gray-100 text-gray-600 border-gray-200",
		icon: FileText,
	},
	sent: {
		label: "مرسلة",
		color: "bg-blue-50 text-blue-600 border-blue-100",
		icon: Send,
	},
	paid: {
		label: "مدفوعة",
		color: "bg-green-50 text-green-600 border-green-100",
		icon: CheckCircle,
	},
	overdue: {
		label: "متأخرة",
		color: "bg-orange-50 text-orange-600 border-orange-100",
		icon: AlertCircle,
	},
	cancelled: {
		label: "ملغية",
		color: "bg-red-50 text-red-600 border-red-100",
		icon: XCircle,
	},
};

type SortField = "amount" | "issue_date" | "due_date" | null;
type SortDirection = "asc" | "desc";
type AmountFilter = "all" | "under-1000" | "1000-5000" | "over-5000";

// Helper functions
const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "SAR",
		maximumFractionDigits: 0,
	}).format(amount);

import { convertToHijri } from "@/lib/dateConvert";

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-GB");
};

const isOverdue = (dueDate: string, status: InvoiceStatus): boolean => {
	return (
		new Date(dueDate) < new Date() &&
		status !== "paid" &&
		status !== "cancelled"
	);
};

const getDaysDifference = (dueDate: string): number => {
	const due = new Date(dueDate);
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	due.setHours(0, 0, 0, 0);
	const diffTime = due.getTime() - now.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDueDateInfo = (
	invoice: InvoiceWithClientAndItems
): { text: string; color: string } | null => {
	if (invoice.status === "paid") {
		return null;
	}

	const days = getDaysDifference(invoice.due_date);

	if (days < 0) {
		return {
			text: `متأخرة ${Math.abs(days)} أيام`,
			color: "text-red-600",
		};
	} else if (days === 0) {
		return {
			text: "مستحقة اليوم",
			color: "text-orange-600",
		};
	} else if (days <= 7) {
		return {
			text: `متبقي ${days} أيام`,
			color: "text-amber-600",
		};
	} else {
		return {
			text: `متبقي ${days} أيام`,
			color: "text-green-600",
		};
	}
};

import { useInvoices, useDeleteInvoice, useUpdateInvoiceStatus } from "@/hooks/useInvoices";

// export default function InvoicesPage() {
function InvoicesContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Hooks
	// Client data for filter dropdown
	// Hooks
	const deleteInvoiceMutation = useDeleteInvoice();
	const updateStatusMutation = useUpdateInvoiceStatus();
	// Client data for filter dropdown
	const { data: clientsData = [] } = useClients();

	// Local State for Filters (controlled inputs)
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all" | "overdue">("all");
	// const [documentKindFilter, setDocumentKindFilter] = useState... // Keeping simplistic for now
	const [documentKindFilter, setDocumentKindFilter] = useState<"all" | "invoice" | "credit_note">("all");
	const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
	const [clientFilter, setClientFilter] = useState<string>("all");
	const [amountFilter, setAmountFilter] = useState<AmountFilter>("all");
	// Additional State
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
	const [deleteCandidate, setDeleteCandidate] = useState<InvoiceWithClientAndItems | null>(null);
	const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Pagination State
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Debounce search term for query
	const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Reset page on filter change
	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearch, statusFilter, dateFilter, clientFilter, amountFilter]);

	// Query Hook
	const {
		data: invoicesData,
		isLoading: loading
	} = useInvoices({
		page: currentPage,
		pageSize,
		search: debouncedSearch,
		status: statusFilter === "overdue" ? "all" : statusFilter as InvoiceStatus | "all", // Handle overdue separately or later
		clientId: clientFilter,
		dateRange: dateFilter === "all" ? "all" : dateFilter as "today" | "week" | "month"
	});

	const invoices = invoicesData?.data || [];
	const totalCount = invoicesData?.count || 0;
	const totalPages = Math.ceil(totalCount / pageSize);

	// Apply client-side "Overdue" and "Amount" filtering if necessary (since API limitations)
	// Or just display what we got. For "Amount" filter, it's safer to do client side on the page or ignore for now if not critical.
	// The previous implementation had pure client side. 
	// Let's stick to server returned data for main pagination flow.

	// For mapping to UI
	const filteredInvoices = invoices; // Direct mapping now
	const paginatedInvoices = invoices; // Already paginated by server

	// Sorting
	const [sortField, setSortField] = useState<SortField>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	// Bulk selection
	const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(
		new Set()
	);

	// Get unique clients from invoices -> Replaced by useClients hook
	/* const uniqueClients = useMemo(() => {
		const clients = invoices.map((inv) => inv.client.name);
		return Array.from(new Set(clients)).sort();
	}, [invoices]); */

	// Initialize from URL params
	useEffect(() => {
		const status = searchParams.get("status");
		const date = searchParams.get("date");
		const client = searchParams.get("client");
		const amount = searchParams.get("amount");
		const search = searchParams.get("search");
		const sort = searchParams.get("sort");
		const sortDir = searchParams.get("sortDir");

		if (
			status &&
			(status === "all" || Object.keys(statusConfig).includes(status))
		) {
			setStatusFilter(status as InvoiceStatus | "all");
		}
		if (date && ["all", "today", "week", "month"].includes(date)) {
			setDateFilter(date as "all" | "today" | "week" | "month");
		}
		if (client) setClientFilter(client);
		if (
			amount &&
			["all", "under-1000", "1000-5000", "over-5000"].includes(amount)
		) {
			setAmountFilter(amount as AmountFilter);
		}
		if (search) setSearchTerm(search);
		if (sort && ["amount", "issue_date", "due_date"].includes(sort)) {
			setSortField(sort as SortField);
		}
		if (sortDir && ["asc", "desc"].includes(sortDir)) {
			setSortDirection(sortDir as SortDirection);
		}
	}, [searchParams]);

	// Update URL when filters change
	useEffect(() => {
		const params = new URLSearchParams();
		if (statusFilter !== "all") params.set("status", statusFilter);
		if (dateFilter !== "all") params.set("date", dateFilter);
		if (clientFilter !== "all") params.set("client", clientFilter);
		if (amountFilter !== "all") params.set("amount", amountFilter);
		if (searchTerm) params.set("search", searchTerm);
		if (sortField) {
			params.set("sort", sortField);
			params.set("sortDir", sortDirection);
		}

		const queryString = params.toString();
		const newUrl = queryString
			? `?${queryString}`
			: window.location.pathname;
		router.replace(newUrl, { scroll: false });
	}, [
		statusFilter,
		dateFilter,
		clientFilter,
		amountFilter,
		searchTerm,
		sortField,
		sortDirection,
		router,
	]);

	// Removed useEffect for loadInvoices since we use useInvoices hook now


	// Removed giant useEffect for client-side filtering
	/* useEffect(() => { ... }) */

	// Pagination
	// const totalPages = Math.ceil(filteredInvoices.length / pageSize); -> Calculated above
	// const paginatedInvoices = filteredInvoices.slice(...) -> Server returns page

	const allSelected =
		paginatedInvoices.length > 0 &&
		selectedInvoiceIds.size === paginatedInvoices.length;
	const hasSelected = selectedInvoiceIds.size > 0;



	const handleInvoiceSuccess = () => {
		// Invalidate is handled automatically by mutations or we can refetch manually if needed, 
		// but typically success callback might close modal. 
		// New hook auto-fetches efficiently.
	};

	const handleStatusChange = async (
		invoiceIds: string | string[],
		newStatus: InvoiceStatus
	) => {
		try {
			await updateStatusMutation.mutateAsync({ ids: invoiceIds, status: newStatus });
			setSelectedInvoiceIds(new Set());
		} catch (err) {
			console.error("Error:", err);
		}
	};

	const handleDeleteInvoice = async (invoiceIds: string | string[]) => {
		try {
			await deleteInvoiceMutation.mutateAsync(invoiceIds);
			setDeleteCandidate(null);
			setShowBulkDeleteDialog(false);
			setSelectedInvoiceIds(new Set());
		} catch (err) {
			console.error("Error:", err);
		}
	};

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	const toggleSelect = (id: string) => {
		setSelectedInvoiceIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const toggleSelectAll = () => {
		if (allSelected) {
			setSelectedInvoiceIds(new Set());
		} else {
			setSelectedInvoiceIds(new Set(paginatedInvoices.map((i) => i.id)));
		}
	};

	const handleBulkStatusChange = async (newStatus: InvoiceStatus) => {
		if (selectedInvoiceIds.size === 0) return;
		setBulkActionLoading(true);
		try {
			await handleStatusChange(Array.from(selectedInvoiceIds), newStatus);
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedInvoiceIds.size === 0) return;
		setBulkActionLoading(true);
		try {
			await handleDeleteInvoice(Array.from(selectedInvoiceIds));
		} finally {
			setBulkActionLoading(false);
		}
	};

	const exportToExcel = () => {
		const headers = [
			"رقم الفاتورة",
			"اسم العميل",
			"البريد الإلكتروني",
			"المبلغ",
			"الحالة",
			"تاريخ الإصدار",
			"تاريخ الاستحقاق",
		];

		const rows = filteredInvoices.map((invoice) => [
			invoice.invoice_number,
			invoice.client.name,
			invoice.client.email || "",
			invoice.total_amount,
			statusConfig[invoice.status]?.label || invoice.status,
			formatDate(invoice.created_at),
			formatDate(invoice.due_date),
		]);

		// Create workbook and worksheet
		const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

		// Set column widths for better readability
		const columnWidths = [
			{ wch: 15 }, // رقم الفاتورة
			{ wch: 20 }, // اسم العميل
			{ wch: 25 }, // البريد الإلكتروني
			{ wch: 12 }, // المبلغ
			{ wch: 12 }, // الحالة
			{ wch: 15 }, // تاريخ الإصدار
			{ wch: 15 }, // تاريخ الاستحقاق
		];
		worksheet["!cols"] = columnWidths;

		// Create workbook
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "الفواتير");

		// Generate Excel file and download
		const fileName = `invoices-export-${new Date().toISOString().split("T")[0]
			}.xlsx`;
		XLSX.writeFile(workbook, fileName);
	};

	// Stats calculations (from all invoices, not filtered)
	// Stats calculations (from all invoices via useAllInvoicesStats)
	const { data: statsInvoices = [] } = useAllInvoicesStats();

	const stats = useMemo(() => {
		const total = statsInvoices.length;
		const overdue = statsInvoices.filter((i) =>
			isOverdue(i.due_date, i.status)
		).length;
		const dueIn7Days = statsInvoices.filter((i) => {
			if (i.status === "paid" || i.status === "cancelled") return false;
			const days = getDaysDifference(i.due_date);
			return days >= 0 && days <= 7;
		});
		const dueIn7DaysAmount = dueIn7Days.reduce(
			(sum, i) => sum + i.total_amount,
			0
		);
		const outstanding = statsInvoices.filter(
			(i) => i.status !== "paid" && i.status !== "cancelled"
		);
		const outstandingAmount = outstanding.reduce(
			(sum, i) => sum + i.total_amount,
			0
		);
		const paid = statsInvoices.filter((i) => i.status === "paid");
		const paidAmount = paid.reduce((sum, i) => sum + i.total_amount, 0);

		return {
			total,
			overdue,
			outstandingAmount,
			paidAmount,
			dueIn7DaysAmount,
		};
	}, [statsInvoices]);

	if (loading) {
		return <LoadingState message="جاري جلب الفواتير..." />;
	}

	return (
		<div className={cn("space-y-8 pb-10", layout.stack.large)}>
			{/* Header */}
			<div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between", layout.gap.large)}>
				<div>
					<Heading variant="h1">
						الفواتير
					</Heading>
					<Text variant="body-large" color="muted" className="mt-2">
						إدارة ومتابعة فواتير العملاء
					</Text>
				</div>
				<motion.div
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<Button
						variant="primary"
						onClick={() => setShowInvoiceModal(true)}
						className="inline-flex items-center gap-2"
					>
						<Plus size={20} strokeWidth={2.5} />
						<span>إنشاء فاتورة جديدة</span>
					</Button>
				</motion.div>
			</div>

			{/* Stats Cards */}
			<div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", layout.gap.standard)}>
				<StatsCard
					title="إجمالي الفواتير"
					value={stats.total}
					icon={FileText}
					color="blue"
				/>
				<StatsCard
					title="فواتير متأخرة"
					value={stats.overdue}
					icon={AlertCircle}
					color="orange"
					isWarning={true}
				/>
				<StatsCard
					title="المبلغ المستحق"
					value={formatCurrency(stats.outstandingAmount)}
					icon={Clock}
					color="purple"
				/>
				<StatsCard
					title="المبلغ المحصل"
					value={formatCurrency(stats.paidAmount)}
					icon={CheckCircle}
					color="green"
				/>
				<StatsCard
					title="مستحق خلال ٧ أيام"
					value={formatCurrency(stats.dueIn7DaysAmount)}
					icon={Calendar}
					color="indigo"
				/>
			</div>

			{/* Bulk Actions Bar */}
			{hasSelected && (
				<Card padding="standard" className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex items-center gap-3"
					>
						<div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7f2dfb] flex items-center justify-center flex-shrink-0">
							<Check size={20} />
						</div>
						<div>
							<Text variant="body-small" className="font-bold">
								تم تحديد {selectedInvoiceIds.size} فاتورة
							</Text>
							<Text variant="body-xs" color="muted" className="mt-0.5">
								اختر إجراءاً لتطبيقه على الفواتير المحددة
							</Text>
						</div>
					</motion.div>
					<div className={cn("flex items-center flex-wrap", layout.gap.tight)}>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleBulkStatusChange("paid")}
							disabled={bulkActionLoading}
							className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
						>
							<CheckCircle size={16} />
							تحديد كـ مدفوعة
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleBulkStatusChange("sent")}
							disabled={bulkActionLoading}
							className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
						>
							<Send size={16} />
							تحديد كـ مرسلة
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowBulkDeleteDialog(true)}
							disabled={bulkActionLoading}
							className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
						>
							<Trash2 size={16} />
							حذف
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedInvoiceIds(new Set())}
							className="bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
						>
							<XCircle size={16} />
							إلغاء
						</Button>
					</div>
				</Card>
			)}

			{/* Filters & Search */}
			<Card padding="standard">
				<div className={cn("flex flex-col lg:flex-row items-start lg:items-center justify-between", layout.gap.standard)}>
					<div className="relative w-full lg:w-96">
						<Search
							className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
							size={20}
						/>
						<Input
							type="text"
							placeholder="البحث برقم الفاتورة، اسم العميل..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pr-12 bg-gray-50"
						/>
					</div>

					<div className={cn("flex flex-wrap w-full lg:w-auto", layout.gap.standard)}>
						<div className="relative flex-1 lg:flex-none min-w-[140px]">
							<Select
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(
										e.target.value as InvoiceStatus | "all"
									)
								}
							>
								<option value="all">جميع الحالات</option>
								<option value="draft">مسودة</option>
								<option value="sent">مرسلة</option>
								<option value="paid">مدفوعة</option>
								<option value="cancelled">ملغية</option>
								<option value="overdue">متأخرة</option>
							</Select>
						</div>
						<div className="relative flex-1 lg:flex-none min-w-[140px]">
							<Select
								value={documentKindFilter}
								onChange={(e) =>
									setDocumentKindFilter(
										e.target.value as
										| "all"
										| "invoice"
										| "credit_note"
									)
								}
							>
								<option value="all">الكل</option>
								<option value="invoice">فواتير</option>
								<option value="credit_note">
									إشعارات دائنة
								</option>
							</Select>
						</div>
						<div className="relative flex-1 lg:flex-none min-w-[140px]">
							<Select
								value={dateFilter}
								onChange={(e) => setDateFilter(e.target.value as string)}
							>
								<option value="all">كل الوقت</option>
								<option value="today">اليوم</option>
								<option value="week">هذا الأسبوع</option>
								<option value="month">هذا الشهر</option>
							</Select>
						</div>
						{clientsData.length > 0 && (
							<div className="relative flex-1 lg:flex-none min-w-[140px]">
								<Select
									value={clientFilter}
									onChange={(e) =>
										setClientFilter(e.target.value)
									}
								>
									<option value="all">كل العملاء</option>
									{clientsData.map((client) => (
										<option key={client.id} value={client.name}>
											{client.name}
										</option>
									))}
								</Select>
							</div>
						)}
						<div className="relative flex-1 lg:flex-none min-w-[140px]">
							<Select
								value={amountFilter}
								onChange={(e) =>
									setAmountFilter(
										e.target.value as AmountFilter
									)
								}
							>
								<option value="all">كل المبالغ</option>
								<option value="under-1000">أقل من 1,000</option>
								<option value="1000-5000">
									من 1,000 إلى 5,000
								</option>
								<option value="over-5000">أكثر من 5,000</option>
							</Select>
						</div>
						<Button
							variant="secondary"
							size="md"
							onClick={exportToExcel}
							className="inline-flex items-center gap-2"
						>
							<Download size={18} />
							تصدير (Excel)
						</Button>
					</div>
				</div>
			</Card>

			{/* Pagination Controls */}
			{totalCount > 0 && (
				<div className="flex items-center justify-between mt-4">
					<Text variant="body-small" color="muted">
						عرض {Math.min((currentPage - 1) * pageSize + 1, totalCount)} إلى {Math.min(currentPage * pageSize, totalCount)} من {totalCount} فاتورة
					</Text>
					<div className="flex items-center gap-2">
						<Button
							variant="secondary"
							size="sm"
							onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
							disabled={currentPage === 1 || loading}
						>
							<ChevronRight size={16} />
							السابق
						</Button>
						<div className="flex items-center gap-1">
							{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
								// Simple logic to show first few pages, can be improved for many pages
								let p = i + 1;
								if (totalPages > 5 && currentPage > 3) {
									p = currentPage - 2 + i;
								}
								if (p > totalPages) return null;

								return (
									<button
										key={p}
										onClick={() => setCurrentPage(p)}
										className={cn(
											"w-8 h-8 rounded-lg text-sm font-medium transition-colors",
											currentPage === p
												? "bg-blue-600 text-white"
												: "bg-gray-100 text-gray-600 hover:bg-gray-200"
										)}
									>
										{p}
									</button>
								)
							})}
						</div>
						<Button
							variant="secondary"
							size="sm"
							onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages || loading}
						>
							التالي
							<ChevronLeft size={16} />
						</Button>
					</div>
				</div>
			)}

			{/* Invoices Table */}
			<Card padding="none" className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50/50 border-b border-gray-100">
							<tr>
								<th className="px-4 py-4 text-center w-12">
									<button
										type="button"
										onClick={toggleSelectAll}
										className="p-1 hover:bg-gray-200 rounded transition-colors"
										title="تحديد الكل"
									>
										{allSelected ? (
											<Check className="w-5 h-5 text-[#7f2dfb]" />
										) : (
											<div className="w-5 h-5 border-2 border-gray-300 rounded" />
										)}
									</button>
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									رقم الفاتورة
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									العميل
								</th>
								<th
									className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
									onClick={() => handleSort("amount")}
								>
									<div className="flex items-center justify-end gap-1">
										المبلغ
										{sortField === "amount" &&
											(sortDirection === "asc" ? (
												<ArrowUp
													size={14}
													className="text-[#7f2dfb]"
												/>
											) : (
												<ArrowDown
													size={14}
													className="text-[#7f2dfb]"
												/>
											))}
									</div>
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									الحالة
								</th>
								<th
									className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
									onClick={() => handleSort("issue_date")}
								>
									<div className="flex items-center justify-end gap-1">
										تاريخ الإصدار
										{sortField === "issue_date" &&
											(sortDirection === "asc" ? (
												<ArrowUp
													size={14}
													className="text-[#7f2dfb]"
												/>
											) : (
												<ArrowDown
													size={14}
													className="text-[#7f2dfb]"
												/>
											))}
									</div>
								</th>
								<th
									className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
									onClick={() => handleSort("due_date")}
								>
									<div className="flex items-center justify-end gap-1">
										تاريخ الاستحقاق
										{sortField === "due_date" &&
											(sortDirection === "asc" ? (
												<ArrowUp
													size={14}
													className="text-[#7f2dfb]"
												/>
											) : (
												<ArrowDown
													size={14}
													className="text-[#7f2dfb]"
												/>
											))}
									</div>
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									الإجراءات
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{paginatedInvoices.map((invoice, i) => {
								const statusInfo = statusConfig[invoice.status];
								const StatusIcon = statusInfo.icon;
								const isOverdueInvoice = isOverdue(
									invoice.due_date,
									invoice.status
								);
								const isSelected = selectedInvoiceIds.has(
									invoice.id
								);
								const dueDateInfo = getDueDateInfo(invoice);

								return (
									<motion.tr
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: i * 0.05 }}
										key={invoice.id}
										className={cn(
											"group hover:bg-gray-50/50 transition-colors",
											isSelected && "bg-purple-50/50"
										)}
									>
										<td className="px-4 py-4 text-center">
											<button
												type="button"
												onClick={() =>
													toggleSelect(invoice.id)
												}
												className="p-1 hover:bg-gray-200 rounded transition-colors"
											>
												{isSelected ? (
													<Check className="w-5 h-5 text-[#7f2dfb]" />
												) : (
													<div className="w-5 h-5 border-2 border-gray-300 rounded" />
												)}
											</button>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex flex-col gap-1">
												<span className="font-bold text-[#012d46]">
													{invoice.invoice_number}
												</span>
												<div className="flex gap-1 flex-wrap">
													{invoice.document_kind ===
														"credit_note" && (
															<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
																إشعار دائن
															</span>
														)}
													{(() => {
														// Use invoice_type directly (DB enum format), fallback to legacy type field if needed
														const invoiceType: InvoiceType =
															invoice.invoice_type ?? (invoice.type as InvoiceType) ?? "standard_tax";
														const label = getInvoiceTypeLabel(invoiceType);
														// Determine badge color based on type
														const badgeClass =
															invoiceType === "standard_tax"
																? "bg-blue-100 text-blue-700 border-blue-200"
																: invoiceType === "simplified_tax"
																	? "bg-purple-100 text-purple-700 border-purple-200"
																	: "bg-gray-100 text-gray-700 border-gray-200";
														return (
															<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badgeClass}`}>
																{label === "فاتورة ضريبية" ? "ضريبية" : label === "فاتورة ضريبية مبسطة" ? "مبسطة" : "غير ضريبية"}
															</span>
														);
													})()}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex flex-col">
												<span className="font-medium text-gray-900">
													{invoice.client.name}
												</span>
												<span className="text-xs text-gray-500">
													{invoice.client.email ||
														"-"}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="font-bold text-gray-900">
												{formatCurrency(
													invoice.total_amount
												)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex flex-col gap-1">
												<span
													className={cn(
														"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border w-fit",
														isOverdueInvoice
															? statusConfig
																.overdue
																.color
															: statusInfo.color
													)}
												>
													{isOverdueInvoice ? (
														<AlertCircle
															size={12}
														/>
													) : (
														<StatusIcon size={12} />
													)}
													{isOverdueInvoice
														? "متأخرة"
														: statusInfo.label}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<div className="flex items-center gap-2">
												<Calendar
													size={14}
													className="text-gray-400"
												/>
												<div className="flex flex-col gap-0.5">
													<span className="font-semibold text-gray-900">
														{formatDate(
															invoice.created_at
														)}
													</span>
													<span className="text-gray-500 text-xs">
														{convertToHijri(invoice.created_at).formattedHijri}
													</span>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex flex-col gap-1">
												<span className="text-sm font-semibold text-gray-900">
													{formatDate(
														invoice.due_date
													)}
												</span>
												<span className="text-gray-500 text-xs">
													{convertToHijri(invoice.due_date).formattedHijri}
												</span>
												{dueDateInfo && (
													<span
														className={cn(
															"text-xs font-medium",
															dueDateInfo.color
														)}
													>
														{dueDateInfo.text}
													</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<button
													onClick={() =>
														router.push(
															`/dashboard/invoices/${invoice.id}`
														)
													}
													className="p-2 text-gray-400 hover:text-[#7f2dfb] hover:bg-purple-50 rounded-lg transition-colors"
													title="عرض التفاصيل"
												>
													<Eye size={18} />
												</button>
												{invoice.status === "draft" && (
													<button
														onClick={() =>
															handleStatusChange(
																invoice.id,
																"sent"
															)
														}
														className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
														title="إرسال"
													>
														<Send size={18} />
													</button>
												)}
												{invoice.status !== "paid" &&
													invoice.status !==
													"cancelled" && (
														<>
															<button
																onClick={() =>
																	handleStatusChange(
																		invoice.id,
																		"paid"
																	)
																}
																className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
																title="تحديد كمدفوعة"
															>
																<CheckCircle
																	size={18}
																/>
															</button>
															<button
																onClick={() =>
																	handleStatusChange(
																		invoice.id,
																		"cancelled"
																	)
																}
																className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
																title="إلغاء الفاتورة"
															>
																<XCircle
																	size={18}
																/>
															</button>
														</>
													)}
												{invoice.status === "draft" && (
													<button
														onClick={() =>
															setDeleteCandidate(
																invoice
															)
														}
														className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
														title="حذف"
													>
														<Trash2 size={18} />
													</button>
												)}
											</div>
										</td>
									</motion.tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{filteredInvoices.length === 0 && (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
							<FileText className="w-10 h-10 text-gray-300" />
						</div>
						<Heading variant="h3-subsection">
							لا توجد فواتير
						</Heading>
						<Text variant="body-small" color="muted" className="mt-1 mb-6 max-w-xs mx-auto">
							لم نجد أي فواتير تطابق بحثك. ابدأ بإنشاء فاتورة
							جديدة.
						</Text>
						<Button
							variant="primary"
							onClick={() => setShowInvoiceModal(true)}
							className="inline-flex items-center gap-2"
						>
							<Plus size={18} strokeWidth={2.5} />
							إنشاء فاتورة
						</Button>
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600">
								عدد العناصر في الصفحة:
							</span>
							<select
								value={pageSize}
								onChange={(e) => {
									setPageSize(Number(e.target.value));
									setCurrentPage(1);
								}}
								className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#7f2dfb] focus:ring-2 focus:ring-purple-100"
							>
								<option value={10}>10</option>
								<option value={25}>25</option>
								<option value={50}>50</option>
							</select>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() =>
									setCurrentPage((p) => Math.max(1, p - 1))
								}
								disabled={currentPage === 1}
								className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<ChevronRight size={18} />
							</button>
							<span className="text-sm text-gray-600 px-3">
								صفحة {currentPage} من {totalPages}
							</span>
							<button
								type="button"
								onClick={() =>
									setCurrentPage((p) =>
										Math.min(totalPages, p + 1)
									)
								}
								disabled={currentPage === totalPages}
								className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<ChevronLeft size={18} />
							</button>
						</div>
					</div>
				)}
			</Card>

			<InvoiceCreationModal
				isOpen={showInvoiceModal}
				onClose={() => setShowInvoiceModal(false)}
				onSuccess={handleInvoiceSuccess}
			/>

			<Dialog
				open={!!deleteCandidate}
				onOpenChange={(open) => !open && setDeleteCandidate(null)}
			>
				<DialogContent className="rounded-3xl p-8">
					<DialogHeader className="mb-4">
						<DialogTitle className="text-2xl font-bold text-center text-[#012d46]">
							حذف الفاتورة؟
						</DialogTitle>
					</DialogHeader>
					<p className="text-center text-gray-600 mb-8">
						هل أنت متأكد من أنك تريد حذف الفاتورة رقم{" "}
						<span className="font-bold text-gray-900">
							{deleteCandidate?.invoice_number}
						</span>
						؟
						<br />
						لا يمكن التراجع عن هذا الإجراء.
					</p>
					<DialogFooter className="flex gap-3 sm:justify-center">
						<button
							onClick={() => setDeleteCandidate(null)}
							className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
						>
							إلغاء
						</button>
						<button
							onClick={() =>
								deleteCandidate &&
								handleDeleteInvoice(deleteCandidate.id)
							}
							className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
						>
							نعم، حذف
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={showBulkDeleteDialog}
				onOpenChange={setShowBulkDeleteDialog}
			>
				<DialogContent className="rounded-3xl p-8">
					<DialogHeader className="mb-4">
						<DialogTitle className="text-2xl font-bold text-center text-[#012d46]">
							حذف الفواتير المحددة؟
						</DialogTitle>
					</DialogHeader>
					<p className="text-center text-gray-600 mb-8">
						هل أنت متأكد من أنك تريد حذف {selectedInvoiceIds.size}{" "}
						فاتورة؟
						<br />
						لا يمكن التراجع عن هذا الإجراء.
					</p>
					<DialogFooter className="flex gap-3 sm:justify-center">
						<button
							onClick={() => setShowBulkDeleteDialog(false)}
							className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
						>
							إلغاء
						</button>
						<button
							onClick={handleBulkDelete}
							disabled={bulkActionLoading}
							className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{bulkActionLoading && (
								<Loader2 size={16} className="animate-spin" />
							)}
							حذف
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: React.ComponentType<{
		size?: number;
		strokeWidth?: number;
		className?: string;
	}>;
	color: "purple" | "blue" | "green" | "orange" | "indigo";
	isWarning?: boolean;
}

function StatsCard({
	title,
	value,
	icon: Icon,
	color,
	isWarning,
}: StatsCardProps) {
	const colors = {
		purple: "bg-purple-50 text-[#7f2dfb]",
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		orange: "bg-orange-50 text-orange-600",
		indigo: "bg-indigo-50 text-indigo-600",
	};

	return (
		<Card
			className={cn(
				"flex flex-col justify-between h-full transition-all duration-300",
				isWarning && "border-orange-200 shadow-orange-100/50"
			)}
			variant={isWarning ? "elevated" : "default"}
		>
			<div className="flex justify-between items-start mb-4">
				<div
					className={cn(
						"p-3 rounded-2xl transition-transform group-hover:scale-105",
						colors[color as keyof typeof colors]
					)}
				>
					<Icon size={24} strokeWidth={2.5} />
				</div>
			</div>
			<div>
				<Text variant="body-small" color="muted" className="font-medium mb-1">
					{title}
				</Text>
				<Heading variant="h3" className="tracking-tight">
					{value}
				</Heading>
			</div>
		</Card>
	);
}

export default function InvoicesPage() {
	return (
		<Suspense fallback={<LoadingState />}>
			<InvoicesContent />
		</Suspense>
	);
}

