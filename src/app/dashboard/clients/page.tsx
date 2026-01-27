"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
	Edit, Trash2, Plus, Search, Loader2, Users, CheckCircle2, XCircle,
	Building2, Phone, Mail, MapPin, ChevronDown, ChevronLeft, ChevronRight,
	Eye, Check, AlertCircle, Download
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Client, ClientStatus, Invoice } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/dialog";
import { Button } from "@/components/dialogButton";
import { m, AnimatePresence } from "framer-motion";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { cn } from "@/lib/utils";
import LoadingState from "@/components/LoadingState";
import { useRouter } from "next/navigation";
// ExcelJS is dynamically imported in exportClients to reduce bundle size
import { Heading, Text, Card, Button as UIButton, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Input } from "@/components/ui";
import { BulkActions, BulkActionButton } from "@/components/dashboard/BulkActions";
import { Pagination } from "@/components/ui/pagination";
import { layout } from "@/lib/ui/tokens";
import QuickClientModal from "@/components/QuickClientModal";

const statusConfig = {
	active: { label: "نشط", className: "bg-green-50 text-green-700 border-green-100" },
	inactive: { label: "غير نشط", className: "bg-gray-50 text-gray-700 border-gray-100" },
	deleted: { label: "محذوف", className: "bg-red-50 text-red-700 border-red-100" },
};

type ClientWithInvoices = Client & {
	invoices?: Invoice[];
	invoice_count?: number;
	last_invoice_date?: string | null;
	has_overdue_invoices?: boolean;
	total_invoiced_amount?: number;
};

type AdvancedFilter =
	| "all"
	| "active-only"
	| "inactive-only"
	| "has-overdue"
	| "no-invoices"
	| "new-clients";

type SortOption =
	| "newest"
	| "oldest"
	| "most-invoices"
	| "highest-amount"
	| "alphabetical";

const clientSchema = z.object({
	name: z.string().min(2, "اسم العميل قصير جداً"),
	email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
	phone: z.string().min(9, "رقم الجوال غير صالح"),
	company_name: z.string().nullable().optional(),
	tax_number: z.string().nullable().optional(),
	address: z.string().nullable().optional(),
	city: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	status: z.enum(["active", "inactive"]),
});

// Helper function to format relative time
const formatRelativeTime = (dateString: string | null | undefined): string => {
	if (!dateString) return "لا توجد فواتير بعد";
	const date = new Date(dateString);
	const now = new Date();
	const diffTime = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "اليوم";
	if (diffDays === 1) return "منذ يوم";
	if (diffDays < 7) return `منذ ${diffDays} أيام`;
	if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
	if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`;
	return `منذ ${Math.floor(diffDays / 365)} سنوات`;
};

// Helper to check if invoice is overdue
const isInvoiceOverdue = (invoice: Invoice): boolean => {
	return (
		new Date(invoice.due_date) < new Date() &&
		invoice.status !== "paid" &&
		invoice.status !== "cancelled"
	);
};

export default function ClientsPage() {
	const [clients, setClients] = useState<ClientWithInvoices[]>([]);
	const [filteredClients, setFilteredClients] = useState<ClientWithInvoices[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(20); // Default 20 per page
	// const [totalCount, setTotalCount] = useState(0);

	const [statusFilter, setStatusFilter] = useState<AdvancedFilter>("all");
	const [sortOption, setSortOption] = useState<SortOption>("newest");
	const [searchTerm, setSearchTerm] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [showQuickAddModal, setShowQuickAddModal] = useState(false);
	const [editingClient, setEditingClient] = useState<Client | null>(null);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState<Partial<Client>>({});
	const [deleteCandidate, setDeleteCandidate] = useState<Client | null>(null);
	const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
	const [bulkActionLoading, setBulkActionLoading] = useState(false);
	const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	// Stats calculation
	const stats = useMemo(() => {
		const total = clients.length;
		const active = clients.filter((c) => c.status === "active").length;
		const inactive = clients.filter((c) => c.status === "inactive").length;
		const withOverdue = clients.filter((c) => c.has_overdue_invoices).length;

		return { total, active, inactive, withOverdue };
	}, [clients]);

	const pickUpdatableFields = (data: Partial<Client>) => {
		return {
			name: data.name ?? undefined,
			email: data.email ?? undefined,
			phone: data.phone ?? undefined,
			company_name: data.company_name ?? undefined,
			tax_number: data.tax_number ?? undefined,
			address: data.address ?? undefined,
			city: data.city ?? undefined,
			notes: data.notes ?? undefined,
			status: data.status ?? ("active" as ClientStatus),
		};
	};

	const loadClients = useCallback(async () => {
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				// User not authenticated - loading will be set to false in finally block
				console.warn("Clients: No authenticated user found");
				return;
			}

			// Load all clients with their invoices
			const { data: clientsData, error: clientsError } = await supabase
				.from("clients")
				.select("*")
				.eq("user_id", user.id)
				.is("deleted_at", null)
				.order("created_at", { ascending: false });

			if (clientsError) throw clientsError;

			// Load all invoices for these clients
			const clientIds = clientsData?.map((c) => c.id) || [];
			const { data: invoicesData, error: invoicesError } = await supabase
				.from("invoices")
				.select("*")
				.eq("user_id", user.id)
				.in("client_id", clientIds.length > 0 ? clientIds : ["00000000-0000-0000-0000-000000000000"])
				.order("created_at", { ascending: false });

			if (invoicesError) throw invoicesError;

			// Group invoices by client and enrich client data
			const clientsWithInvoices: ClientWithInvoices[] = (clientsData || []).map((client) => {
				const clientInvoices = (invoicesData || []).filter(
					(inv) => inv.client_id === client.id
				);

				const hasOverdue = clientInvoices.some(isInvoiceOverdue);
				const lastInvoice = clientInvoices.length > 0 ? clientInvoices[0] : null;
				const totalInvoiced = clientInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

				return {
					...client,
					invoices: clientInvoices,
					invoice_count: clientInvoices.length,
					last_invoice_date: lastInvoice?.created_at || null,
					has_overdue_invoices: hasOverdue,
					total_invoiced_amount: totalInvoiced,
				};
			});

			setClients(clientsWithInvoices);
			// setTotalCount(clientsWithInvoices.length);
		} catch (err: unknown) {
			toast({
				title: "خطأ",
				description: "فشل في تحميل العملاء",
				variant: "destructive",
			});
			console.error("Error loading clients:", err);
		} finally {
			setLoading(false);
		}
	}, [toast]);

	const filterClients = useCallback(() => {
		let result = [...clients];

		// Advanced filters
		if (statusFilter === "active-only") {
			result = result.filter((c) => c.status === "active");
		} else if (statusFilter === "inactive-only") {
			result = result.filter((c) => c.status === "inactive");
		} else if (statusFilter === "has-overdue") {
			result = result.filter((c) => c.has_overdue_invoices);
		} else if (statusFilter === "no-invoices") {
			result = result.filter((c) => (c.invoice_count || 0) === 0);
		} else if (statusFilter === "new-clients") {
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			result = result.filter((c) => new Date(c.created_at) >= thirtyDaysAgo);
		}

		// Search filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			result = result.filter(
				(c) =>
					c.name.toLowerCase().includes(term) ||
					(c.email && c.email.toLowerCase().includes(term)) ||
					(c.phone && c.phone.includes(term)) ||
					(c.company_name && c.company_name.toLowerCase().includes(term)) ||
					(c.tax_number && c.tax_number.toLowerCase().includes(term))
			);
		}

		// Apply Sorting
		result.sort((a, b) => {
			switch (sortOption) {
				case "newest":
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
				case "oldest":
					return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
				case "most-invoices":
					return (b.invoice_count || 0) - (a.invoice_count || 0);
				case "highest-amount":
					return (b.total_invoiced_amount || 0) - (a.total_invoiced_amount || 0);
				case "alphabetical":
					return a.name.localeCompare(b.name);
				default:
					return 0;
			}
		});

		setFilteredClients(result);
	}, [clients, statusFilter, searchTerm, sortOption]);

	useEffect(() => {
		loadClients();
	}, [loadClients]);

	useEffect(() => {
		filterClients();
		setCurrentPage(1);
	}, [filterClients]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value || null }));
	};

	const openAddModal = () => {
		setShowQuickAddModal(true);
	};

	const openEditModal = (client: Client) => {
		setEditingClient(client);
		setFormData(pickUpdatableFields(client));
		setShowModal(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const parsed = clientSchema.safeParse(formData);
		if (!parsed.success) {
			toast({
				title: "تحقق من البيانات",
				description: parsed.error.issues[0].message,
				variant: "destructive",
			});
			return;
		}
		try {
			setSaving(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data: existingProfile } = await supabase
				.from("profiles")
				.select("id")
				.eq("id", user.id)
				.single();
			if (!existingProfile) {
				const { error: profileError } = await supabase.from("profiles").insert({
					id: user.id,
					full_name: "",
					phone: "",
					dob: "1990-01-01",
					account_type: "individual",
				});
				if (profileError) throw profileError;
			}

			if (editingClient) {
				const payload = pickUpdatableFields(formData);
				const { error } = await supabase
					.from("clients")
					.update(payload)
					.eq("id", editingClient.id);
				if (error) throw error;
				toast({
					title: "تم التحديث",
					description: "تم تحديث بيانات العميل بنجاح",
				});
			} else {
				const payload = pickUpdatableFields(formData);
				const { error } = await supabase
					.from("clients")
					.insert({ ...payload, user_id: user.id });
				if (error) throw error;
				toast({
					title: "تم الإضافة",
					description: "تمت إضافة العميل بنجاح",
				});
			}
			setShowModal(false);
			setCurrentPage(1);
			await loadClients();
		} catch (err: unknown) {
			toast({
				title: "خطأ",
				description: (err as Error)?.message || "حدث خطأ أثناء الحفظ",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteClient = async (id: string) => {
		try {
			await supabase
				.from("clients")
				.update({ deleted_at: new Date().toISOString() })
				.eq("id", id);
			toast({
				title: "تم الحذف",
				description: "تم حذف العميل بنجاح",
			});
			setDeleteCandidate(null);
			await loadClients();
		} catch {
			toast({
				title: "خطأ",
				description: "فشل في حذف العميل",
				variant: "destructive",
			});
		}
	};

	const handleBulkDelete = async () => {
		if (selectedClientIds.size === 0) return;
		setBulkActionLoading(true);
		try {
			await supabase
				.from("clients")
				.update({ deleted_at: new Date().toISOString() })
				.in("id", Array.from(selectedClientIds));
			toast({
				title: "تم الحذف",
				description: `تم حذف ${selectedClientIds.size} عميل بنجاح`,
			});
			setShowBulkDeleteDialog(false);
			setSelectedClientIds(new Set());
			await loadClients();
		} catch {
			toast({
				title: "خطأ",
				description: "فشل في حذف العملاء",
				variant: "destructive",
			});
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleBulkStatusChange = async (newStatus: ClientStatus) => {
		if (selectedClientIds.size === 0) return;
		setBulkActionLoading(true);
		try {
			await supabase
				.from("clients")
				.update({ status: newStatus })
				.in("id", Array.from(selectedClientIds));
			toast({
				title: "تم التحديث",
				description: `تم تحديث ${selectedClientIds.size} عميل بنجاح`,
			});
			setSelectedClientIds(new Set());
			await loadClients();
		} catch {
			toast({
				title: "خطأ",
				description: "فشل في تحديث العملاء",
				variant: "destructive",
			});
		} finally {
			setBulkActionLoading(false);
		}
	};

	const toggleSelect = (id: string) => {
		setSelectedClientIds((prev) => {
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
			setSelectedClientIds(new Set());
		} else {
			setSelectedClientIds(new Set(paginatedClients.map((c) => c.id)));
		}
	};

	const exportClients = async (useSelected: boolean = false) => {
		const clientsToExport = useSelected
			? filteredClients.filter((c) => selectedClientIds.has(c.id))
			: filteredClients;

		// If falling back to CSV is desired on error, we can wrap in try-catch,
		// but ExcelJS is generally reliable. For now, strict Excel export.

		// Dynamic import to reduce initial bundle size (~500KB savings)
		const ExcelJS = (await import("exceljs")).default;
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("العملاء");

		worksheet.columns = [
			{ header: "الاسم", key: "name", width: 20 },
			{ header: "اسم الشركة", key: "company_name", width: 20 },
			{ header: "البريد الإلكتروني", key: "email", width: 25 },
			{ header: "الهاتف", key: "phone", width: 15 },
			{ header: "الرقم الضريبي", key: "tax_number", width: 15 },
			{ header: "الحالة", key: "status", width: 12 },
			{ header: "تاريخ الإضافة", key: "created_at", width: 15 },
			{ header: "عدد الفواتير", key: "invoice_count", width: 12 },
			{ header: "إجمالي المبلغ", key: "total_amount", width: 15 },
		];

		clientsToExport.forEach((client) => {
			worksheet.addRow({
				name: client.name,
				company_name: client.company_name || "",
				email: client.email,
				phone: client.phone,
				tax_number: client.tax_number || "",
				status: statusConfig[client.status]?.label || client.status,
				created_at: new Date(client.created_at).toLocaleDateString("en-GB"),
				invoice_count: client.invoice_count || 0,
				total_amount: client.total_invoiced_amount || 0,
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
		anchor.download = `clients-export-${new Date().toISOString().split("T")[0]}.xlsx`;
		anchor.click();
		window.URL.revokeObjectURL(url);
	};

	const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB");

	// Pagination
	const filteredTotalPages = Math.ceil(filteredClients.length / pageSize);
	const paginatedClients = filteredClients.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	const allSelected =
		paginatedClients.length > 0 &&
		selectedClientIds.size === paginatedClients.length &&
		paginatedClients.every((c) => selectedClientIds.has(c.id));
	const hasSelected = selectedClientIds.size > 0;

	if (loading) {
		return <LoadingState message="جاري تحميل العملاء..." />;
	}

	return (
		<div className={cn("space-y-8 pb-10", layout.stack.large)}>
			{/* Header */}
			<div className={cn("flex flex-col gap-6 md:flex-row md:items-center md:justify-between", layout.gap.large)}>
				<div>
					<Heading variant="h1">العملاء</Heading>
					<Text variant="body-large" color="muted" className="mt-2">إدارة قاعدة بيانات العملاء ومتابعة تفاصيلهم</Text>
				</div>
				<m.div
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<UIButton variant="primary" onClick={openAddModal} className="inline-flex items-center gap-2">
						<Plus size={20} strokeWidth={2.5} />
						<span>إضافة عميل</span>
					</UIButton>
				</m.div>
			</div>

			{/* Stats Grid */}
			<div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4", layout.gap.standard)}>
				<StatsCard
					title="إجمالي العملاء"
					value={stats.total}
					icon={Users}
					color="blue"
					delay={0.1}
				/>
				<StatsCard
					title="العملاء النشطون"
					value={stats.active}
					icon={CheckCircle2}
					color="green"
					delay={0.2}
				/>
				<StatsCard
					title="العملاء غير النشطين"
					value={stats.inactive}
					icon={XCircle}
					color="orange"
					delay={0.3}
				/>
				<StatsCard
					title="عملاء لديهم فواتير متأخرة"
					value={stats.withOverdue}
					icon={AlertCircle}
					color="red"
					delay={0.4}
				/>
			</div>

			{/* Bulk Actions Bar */}
			{/* Bulk Actions Bar */}
			<BulkActions
				selectedCount={selectedClientIds.size}
				itemLabel="عميل"
				onClearSelection={() => setSelectedClientIds(new Set())}
			>
				<BulkActionButton
					variant="delete"
					icon={<Trash2 size={16} />}
					onClick={() => setShowBulkDeleteDialog(true)}
					disabled={bulkActionLoading}
				>
					حذف
				</BulkActionButton>
				<BulkActionButton
					variant="info"
					icon={<Download size={16} />}
					onClick={() => exportClients(true)}
					disabled={bulkActionLoading}
				>
					تصدير اكسل
				</BulkActionButton>
				<BulkActionButton
					variant="warning"
					icon={<XCircle size={16} />}
					onClick={() => handleBulkStatusChange("inactive")}
					disabled={bulkActionLoading}
				>
					تعطيل
				</BulkActionButton>
				<BulkActionButton
					variant="success"
					icon={<CheckCircle2 size={16} />}
					onClick={() => handleBulkStatusChange("active")}
					disabled={bulkActionLoading}
				>
					تفعيل
				</BulkActionButton>
			</BulkActions>

			{/* Filter Card */}
			<Card padding="standard">
				<div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
					<div className="relative w-full lg:w-96">
						<Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
						<Input
							type="text"
							placeholder="ابحث بالاسم، الشركة، البريد، الهاتف، الرقم الضريبي..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pr-12 bg-gray-50"
						/>
					</div>
					<div className="flex items-center gap-3 w-full lg:w-auto">
						<div className="relative flex-1 lg:flex-none min-w-[180px]">
							<Select
								value={statusFilter}
								onValueChange={(val) => setStatusFilter(val as AdvancedFilter)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="جميع الحالات" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">جميع الحالات</SelectItem>
									<SelectItem value="active-only">نشط فقط</SelectItem>
									<SelectItem value="inactive-only">غير نشط</SelectItem>
									<SelectItem value="has-overdue">لديه فواتير متأخرة</SelectItem>
									<SelectItem value="no-invoices">لم تصدر له فواتير بعد</SelectItem>
									<SelectItem value="new-clients">عملاء جدد (آخر 30 يوم)</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="relative flex-1 lg:flex-none min-w-[160px]">
							<Select
								value={sortOption}
								onValueChange={(val) => setSortOption(val as SortOption)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="ترتيب حسب" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="newest">الأحدث إضافة</SelectItem>
									<SelectItem value="oldest">الأقدم إضافة</SelectItem>
									<SelectItem value="most-invoices">الأكثر فواتير</SelectItem>
									<SelectItem value="highest-amount">الأعلى مبلغاً</SelectItem>
									<SelectItem value="alphabetical">أبجدياً (أ-ي)</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<UIButton
							variant="secondary"
							size="md"
							onClick={() => exportClients(false)}
							className="inline-flex items-center gap-2 px-4 py-2 text-sm"
						>
							<Download size={18} />
							تصدير (Excel)
						</UIButton>
					</div>
				</div>
			</Card>

			{/* Pagination Controls */}
			{stats.total > 0 && (
				<div className="flex items-center justify-between mt-4">
					<Text variant="body-small" color="muted">
						عرض {Math.min((currentPage - 1) * pageSize + 1, filteredClients.length)} إلى {Math.min(currentPage * pageSize, filteredClients.length)} من {filteredClients.length} عميل
					</Text>
					<Pagination
						currentPage={currentPage}
						totalPages={filteredTotalPages}
						onPageChange={setCurrentPage}
						isLoading={loading}
					/>
				</div>
			)}

			{/* Table Card */}
			<Card padding="none" className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50/50">
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
								<th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">العميل</th>
								<th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الشركة</th>
								<th className="p-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">الفواتير</th>
								<th className="p-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
								<th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">تاريخ الإضافة</th>
								<th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{paginatedClients.map((client) => {
								const isSelected = selectedClientIds.has(client.id);
								return (
									<tr
										key={client.id}
										className={cn(
											"hover:bg-gray-50/80 transition-colors group",
											isSelected && "bg-purple-50/50"
										)}
									>
										<td className="px-4 py-4 text-center">
											<button
												type="button"
												onClick={() => toggleSelect(client.id)}
												className="p-1 hover:bg-gray-200 rounded transition-colors"
											>
												{isSelected ? (
													<Check className="w-5 h-5 text-[#7f2dfb]" />
												) : (
													<div className="w-5 h-5 border-2 border-gray-300 rounded" />
												)}
											</button>
										</td>
										<td className="p-5">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
													{client.name.charAt(0).toUpperCase()}
												</div>
												<div>
													<p className="font-bold text-gray-900 text-sm">{client.name}</p>
													<p className="text-xs text-gray-500">{client.email}</p>
													<p className="text-xs text-gray-400 mt-0.5">
														{formatRelativeTime(client.last_invoice_date)}
													</p>
												</div>
											</div>
										</td>
										<td className="p-5">
											<div className="flex items-center gap-2 text-sm text-gray-600">
												{client.company_name ? (
													<>
														<Building2 size={16} className="text-gray-400" />
														{client.company_name}
													</>
												) : (
													<span className="text-gray-400">—</span>
												)}
											</div>
										</td>
										<td className="p-5 text-center">
											<span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg px-2.5 py-1 text-xs font-bold">
												{client.invoice_count || 0} فواتير
											</span>
										</td>
										<td className="p-5 text-center">
											<div className="flex flex-col items-center gap-1">
												<span
													className={cn(
														"px-3 py-1 rounded-full text-xs font-bold border",
														statusConfig[client.status]?.className
													)}
												>
													{statusConfig[client.status]?.label}
												</span>
												{client.has_overdue_invoices && (
													<span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
														متأخر
													</span>
												)}
											</div>
										</td>
										<td className="p-5 text-sm text-gray-500">
											{formatDate(client.created_at)}
										</td>
										<td className="p-5">
											<div className="flex items-center gap-2">
												<button
													onClick={() => router.push(`/dashboard/clients/${client.id}`)}
													className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
													title="عرض"
												>
													<Eye size={16} />
												</button>
												<button
													onClick={() => openEditModal(client)}
													className="p-2 text-gray-500 hover:text-[#7f2dfb] hover:bg-purple-50 rounded-lg transition-colors"
													title="تعديل"
												>
													<Edit size={16} />
												</button>
												<button
													onClick={() => setDeleteCandidate(client)}
													className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
													title="حذف"
												>
													<Trash2 size={16} />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					{filteredClients.length === 0 && (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
								<Users className="w-8 h-8 text-gray-300" />
							</div>
							<h3 className="text-gray-900 font-bold mb-1">لا يوجد عملاء</h3>
							<p className="text-gray-500 text-sm">حاول تغيير معايير البحث أو أضف عميلاً جديداً</p>
						</div>
					)}
				</div>

				{/* Pagination */}
				{filteredTotalPages > 1 && (
					<div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600">عدد العناصر في الصفحة:</span>
							<Select
								value={String(pageSize)}
								onValueChange={(val) => {
									setPageSize(Number(val));
									setCurrentPage(1);
								}}
							>
								<SelectTrigger className="w-[70px] h-8">
									<SelectValue placeholder={String(pageSize)} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="25">25</SelectItem>
									<SelectItem value="50">50</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								disabled={currentPage === 1}
								className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<ChevronRight size={18} />
							</button>
							<span className="text-sm text-gray-600 px-3">
								صفحة {currentPage} من {filteredTotalPages}
							</span>
							<button
								type="button"
								onClick={() => setCurrentPage((p) => Math.min(filteredTotalPages, p + 1))}
								disabled={currentPage === filteredTotalPages}
								className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<ChevronLeft size={18} />
							</button>
						</div>
					</div>
				)}
			</Card>

			{/* Quick Add Modal */}
			<QuickClientModal
				isOpen={showQuickAddModal}
				onClose={() => setShowQuickAddModal(false)}
				onSuccess={loadClients}
			/>

			{/* Edit Modal */}
			<AnimatePresence>
				{showModal && editingClient && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/40 backdrop-blur-sm"
							onClick={() => setShowModal(false)}
						/>
						<m.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col"
						>
							<div className="p-6 border-b border-gray-100 bg-gray-50/50">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-bold text-gray-900">
										تعديل بيانات العميل
									</h2>
									<button
										onClick={() => setShowModal(false)}
										className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
									>
										<XCircle size={24} />
									</button>
								</div>
								{!editingClient && (
									<p className="text-sm text-gray-500 mt-1">
										أضِف بيانات العميل الجديد لبدء إنشاء الفواتير بسهولة.
									</p>
								)}
							</div>

							<form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Name - Required */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											الاسم الكامل <span className="text-red-500">*</span>
										</label>
										<input
											name="name"
											value={formData.name || ""}
											onChange={handleInputChange}
											className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
											placeholder="مثال: محمد السعدي"
											required
										/>
									</div>

									{/* Phone - Required */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											رقم الجوال <span className="text-red-500">*</span>
										</label>
										<div className="relative">
											<Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
											<input
												name="phone"
												value={formData.phone || ""}
												onChange={handleInputChange}
												className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
												placeholder="05xxxxxxxx"
												dir="ltr"
												required
											/>
										</div>
									</div>

									{/* Email - Optional */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري)</span>
										</label>
										<div className="relative">
											<Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
											<input
												name="email"
												type="email"
												value={formData.email || ""}
												onChange={handleInputChange}
												className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
												placeholder="example@domain.com"
												dir="ltr"
											/>
										</div>
									</div>

									{/* Company Name - Optional */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											اسم الشركة <span className="text-gray-400 font-normal">(اختياري)</span>
										</label>
										<input
											name="company_name"
											value={formData.company_name || ""}
											onChange={handleInputChange}
											className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
											placeholder="مثال: شركة الريّان"
										/>
									</div>

									{/* Tax Number - Optional */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											الرقم الضريبي <span className="text-gray-400 font-normal">(اختياري)</span>
										</label>
										<input
											name="tax_number"
											value={formData.tax_number || ""}
											onChange={handleInputChange}
											className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
											placeholder="مثال: 310xxxxxxx"
											dir="ltr"
										/>
									</div>

									{/* Status */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">الحالة</label>
										<div className="relative">
											<select
												name="status"
												value={formData.status || "active"}
												onChange={handleInputChange}
												className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm bg-white"
											>
												<option value="active">نشط</option>
												<option value="inactive">غير نشط</option>
											</select>
											<ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
										</div>
									</div>

									{/* Address - Optional */}
									<div className="space-y-2 md:col-span-2">
										<label className="text-sm font-medium text-gray-700">
											العنوان <span className="text-gray-400 font-normal">(اختياري)</span>
										</label>
										<div className="relative">
											<MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
											<input
												name="address"
												value={formData.address || ""}
												onChange={handleInputChange}
												className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
												placeholder="مثال: الرياض، حي النخيل، شارع الملك فهد"
											/>
										</div>
									</div>

									{/* Notes - Optional */}
									<div className="space-y-2 md:col-span-2">
										<label className="text-sm font-medium text-gray-700">
											ملاحظات <span className="text-gray-400 font-normal">(اختياري)</span>
										</label>
										<textarea
											name="notes"
											value={formData.notes || ""}
											onChange={handleInputChange}
											rows={3}
											className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
											placeholder="أي ملاحظات إضافية عن العميل..."
										/>
									</div>
								</div>

								<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
									<button
										type="button"
										onClick={() => setShowModal(false)}
										className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
									>
										إلغاء
									</button>
									<button
										type="submit"
										disabled={saving}
										className="px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white font-medium hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-colors text-sm flex items-center gap-2"
									>
										{saving && <Loader2 size={16} className="animate-spin" />}
										{saving ? "جاري الحفظ..." : (editingClient ? "حفظ التعديلات" : "إضافة العميل")}
									</button>
								</div>
							</form>
						</m.div>
					</div>
				)}
			</AnimatePresence>

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
				<DialogContent className="rounded-3xl">
					<DialogHeader>
						<DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
					</DialogHeader>
					<div className="py-4 text-center">
						<div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
							<Trash2 className="w-8 h-8 text-red-500" />
						</div>
						<p className="text-gray-600 mb-2">هل أنت متأكد من حذف العميل؟</p>
						<p className="font-bold text-gray-900 text-lg">{deleteCandidate?.name}</p>
					</div>
					<DialogFooter className="gap-2 sm:justify-center">
						<Button
							variant="outline"
							onClick={() => setDeleteCandidate(null)}
							className="rounded-xl flex-1"
						>
							إلغاء
						</Button>
						<Button
							variant="destructive"
							onClick={() => deleteCandidate && handleDeleteClient(deleteCandidate.id)}
							className="rounded-xl flex-1 bg-red-600 hover:bg-red-700"
						>
							حذف العميل
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Bulk Delete Dialog */}
			<Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
				<DialogContent className="rounded-3xl">
					<DialogHeader>
						<DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
					</DialogHeader>
					<div className="py-4 text-center">
						<div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
							<Trash2 className="w-8 h-8 text-red-500" />
						</div>
						<p className="text-gray-600 mb-2">
							هل أنت متأكد من حذف {selectedClientIds.size} عميل؟
						</p>
						<p className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء.</p>
					</div>
					<DialogFooter className="gap-2 sm:justify-center">
						<Button
							variant="outline"
							onClick={() => setShowBulkDeleteDialog(false)}
							className="rounded-xl flex-1"
						>
							إلغاء
						</Button>
						<Button
							variant="destructive"
							onClick={handleBulkDelete}
							disabled={bulkActionLoading}
							className="rounded-xl flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
						>
							{bulkActionLoading && <Loader2 size={16} className="animate-spin" />}
							حذف
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
