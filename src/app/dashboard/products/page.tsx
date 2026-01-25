"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Product, ProductStatus } from "@/types/database";
import {
	Plus,
	Edit,
	Trash2,
	Loader2,
	X,
	AlertCircle,
	ShoppingCart,
	Tag,
	Search,
	CheckCircle2,
	XCircle,
	Box,
	CircleDollarSign,
	ChevronDown,
	Copy,
	Check,
	ChevronLeft,
	ChevronRight,
	Package,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { m, AnimatePresence } from "framer-motion";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { cn } from "@/lib/utils";
import LoadingState from "@/components/LoadingState";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/dialog";
import { Button } from "@/components/dialogButton";
import { Heading, Text, Card, Button as UIButton, Price } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";

type SortOption = "newest" | "oldest" | "price-high" | "price-low";

export default function ProductsPage() {
	const { toast } = useToast();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editing, setEditing] = useState<Product | null>(null);
	const [form, setForm] = useState<Partial<Product>>({
		name: "",
		unit_price: 0,
		unit: "",
		description: "",
		category: "",
	});
	const [error, setError] = useState<string | null>(null);

	// Filters & Search
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [unitFilter, setUnitFilter] = useState<string>("all");
	const [sortOption, setSortOption] = useState<SortOption>("newest");

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Bulk actions
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Get unique categories and units from products
	const categories = useMemo(() => {
		const cats = products
			.map((p) => p.category)
			.filter((c): c is string => Boolean(c));
		return Array.from(new Set(cats));
	}, [products]);

	const units = useMemo(() => {
		const unts = products
			.map((p) => p.unit)
			.filter((u): u is string => Boolean(u));
		return Array.from(new Set(unts));
	}, [products]);

	// Filter, search, and sort products
	const filteredProducts = useMemo(() => {
		let filtered = [...products];

		// Status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter(
				(p) => (statusFilter === "active" ? p.active : !p.active)
			);
		}

		// Category filter
		if (categoryFilter !== "all") {
			filtered = filtered.filter((p) => p.category === categoryFilter);
		}

		// Unit filter
		if (unitFilter !== "all") {
			filtered = filtered.filter((p) => p.unit === unitFilter);
		}

		// Search
		if (searchTerm) {
			const q = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					(p.description || "").toLowerCase().includes(q)
			);
		}

		// Sort
		switch (sortOption) {
			case "newest":
				filtered.sort(
					(a, b) =>
						new Date(b.created_at).getTime() -
						new Date(a.created_at).getTime()
				);
				break;
			case "oldest":
				filtered.sort(
					(a, b) =>
						new Date(a.created_at).getTime() -
						new Date(b.created_at).getTime()
				);
				break;
			case "price-high":
				filtered.sort(
					(a, b) => Number(b.unit_price) - Number(a.unit_price)
				);
				break;
			case "price-low":
				filtered.sort(
					(a, b) => Number(a.unit_price) - Number(b.unit_price)
				);
				break;
		}

		return filtered;
	}, [products, statusFilter, categoryFilter, unitFilter, searchTerm, sortOption]);

	// Pagination
	const totalPages = Math.ceil(filteredProducts.length / pageSize);
	const paginatedProducts = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredProducts.slice(start, start + pageSize);
	}, [filteredProducts, currentPage, pageSize]);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [statusFilter, categoryFilter, unitFilter, searchTerm, sortOption]);

	// Stats
	const stats = useMemo(() => {
		const total = products.length;
		const active = products.filter((p) => p.active).length;
		const inactive = products.filter((p) => !p.active).length;
		const avgPrice =
			products.length > 0
				? products.reduce((sum, p) => sum + Number(p.unit_price), 0) /
				products.length
				: 0;

		return { total, active, inactive, avgPrice };
	}, [products]);

	const load = useCallback(async () => {
		try {
			setLoading(true);
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				// User not authenticated - loading will be set to false in finally block
				console.warn("Products: No authenticated user found");
				return;
			}
			const { data, error } = await supabase
				.from("products")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });
			if (error) throw error;
			setProducts(data || []);
		} catch (e: unknown) {
			toast({
				title: "خطأ",
				description: (e as Error).message,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		load();
	}, [load]);

	const closeModal = useCallback(() => {
		setForm({
			name: "",
			unit_price: 0,
			unit: "",
			description: "",
			category: "",
		});
		setError(null);
		setEditing(null);
		setShowModal(false);
	}, []);

	const openNew = () => {
		setEditing(null);
		setForm({
			name: "",
			unit_price: 0,
			unit: "",
			description: "",
			category: "",
		});
		setError(null);
		setShowModal(true);
	};

	const openEdit = (product: Product) => {
		setEditing(product);
		setForm({
			...product,
			category: product.category || "",
		});
		setError(null);
		setShowModal(true);
	};

	const duplicateProduct = async (product: Product) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;

			const { error } = await supabase.from("products").insert({
				user_id: user.id,
				name: `${product.name} (نسخة)`,
				description: product.description,
				unit: product.unit,
				unit_price: product.unit_price,
				active: product.active,
				category: product.category,
			});

			if (error) throw error;
			await load();
			toast({
				title: "تم النسخ",
				description: "تم نسخ المنتج بنجاح",
			});
		} catch (e: unknown) {
			toast({
				title: "خطأ",
				description: (e as Error).message,
				variant: "destructive",
			});
		}
	};

	const submit = async () => {
		try {
			setSaving(true);
			setError(null);

			if (!form.name?.trim()) {
				setError("اسم المنتج مطلوب");
				return;
			}

			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

			const payload = {
				user_id: user.id,
				name: form.name.trim(),
				description: form.description?.trim() || null,
				unit: form.unit?.trim() || null,
				unit_price: Number(form.unit_price) || 0,
				active: editing ? editing.active : true,
				category: form.category?.trim() || null,
			};

			const { error } = editing
				? await supabase
					.from("products")
					.update(payload)
					.eq("id", editing.id)
				: await supabase.from("products").insert(payload);

			if (error) throw error;

			closeModal();
			await load();
			toast({
				title: editing ? "تم التحديث" : "تمت الإضافة",
				description: "تم حفظ بيانات المنتج بنجاح",
			});
		} catch (e: unknown) {
			setError((e as Error).message || "حدث خطأ غير متوقع");
		} finally {
			setSaving(false);
		}
	};

	const toggleProductStatus = async (id: string, currentStatus: boolean) => {
		try {
			const { error } = await supabase
				.from("products")
				.update({ active: !currentStatus })
				.eq("id", id);
			if (error) throw error;
			await load();
			toast({
				title: !currentStatus ? "تم التفعيل" : "تم التعطيل",
				description: "تم تحديث حالة المنتج بنجاح",
			});
		} catch (e: unknown) {
			toast({
				title: "خطأ",
				description: (e as Error).message,
				variant: "destructive",
			});
		}
	};

	const deleteProduct = async (id: string) => {
		try {
			const { error } = await supabase
				.from("products")
				.delete()
				.eq("id", id);
			if (error) throw error;
			await load();
			toast({
				title: "تم الحذف",
				description: "تم حذف المنتج بنجاح",
			});
		} catch (e: unknown) {
			toast({
				title: "خطأ",
				description: (e as Error).message,
				variant: "destructive",
			});
		}
	};

	// Bulk actions
	const toggleSelect = (id: string) => {
		setSelectedIds((prev) => {
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
		if (selectedIds.size === paginatedProducts.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(paginatedProducts.map((p) => p.id)));
		}
	};

	const handleBulkStatusChange = async (activate: boolean) => {
		if (selectedIds.size === 0) return;

		try {
			setBulkActionLoading(true);
			const { error } = await supabase
				.from("products")
				.update({ active: activate })
				.in("id", Array.from(selectedIds));

			if (error) throw error;
			setSelectedIds(new Set());
			await load();
			toast({
				title: activate ? "تم التفعيل" : "تم التعطيل",
				description: `تم تحديث ${selectedIds.size} منتج`,
			});
		} catch (e: unknown) {
			toast({
				title: "خطأ",
				description: (e as Error).message,
				variant: "destructive",
			});
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedIds.size === 0) return;

		try {
			setBulkActionLoading(true);
			const { error } = await supabase
				.from("products")
				.delete()
				.in("id", Array.from(selectedIds));

			if (error) throw error;
			setSelectedIds(new Set());
			setShowDeleteDialog(false);
			await load();
			toast({
				title: "تم الحذف",
				description: `تم حذف ${selectedIds.size} منتج`,
			});
		} catch (e: unknown) {
			toast({
				title: "خطأ",
				description: (e as Error).message,
				variant: "destructive",
			});
		} finally {
			setBulkActionLoading(false);
		}
	};


	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-GB");
	};

	if (loading) {
		return <LoadingState message="جاري استعراض المنتجات..." />;
	}

	const hasSelected = selectedIds.size > 0;
	const allSelected =
		paginatedProducts.length > 0 &&
		selectedIds.size === paginatedProducts.length;

	return (
		<div className="space-y-8 pb-10">
			{/* Header */}
			<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
				<div>
					<Heading variant="h1">
						المنتجات والخدمات
					</Heading>
					<Text variant="body-large" color="muted" className="mt-2">
						أضف منتجاتك وخدماتك ليسهل عليك إنشاء الفواتير
					</Text>
				</div>
				<m.div
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<UIButton variant="primary" onClick={openNew} className="inline-flex items-center gap-2">
						<Plus size={20} strokeWidth={2.5} /> إضافة منتج
					</UIButton>
				</m.div>
			</div>

			{/* Stats Grid */}
			<div className={cn("grid grid-cols-1 md:grid-cols-4", layout.gap.standard)}>
				<StatsCard
					title="إجمالي المنتجات"
					value={stats.total}
					icon={ShoppingCart}
					color="purple"
					delay={0.1}
				/>
				<StatsCard
					title="منتجات نشطة"
					value={stats.active}
					icon={CheckCircle2}
					color="green"
					delay={0.2}
				/>
				<StatsCard
					title="منتجات معطلة"
					value={stats.inactive}
					icon={XCircle}
					color="orange"
					delay={0.3}
				/>
				<StatsCard
					title="متوسط السعر"
					value={<Price amount={stats.avgPrice} size="xl" />}
					icon={CircleDollarSign}
					color="indigo"
					delay={0.4}
				/>
			</div>

			{/* Bulk Actions Bar */}
			{hasSelected && (
				<Card padding="standard" className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
					<m.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className={cn("flex items-center", layout.gap.standard)}
					>
						<div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7f2dfb] flex items-center justify-center flex-shrink-0">
							<Check size={20} />
						</div>
						<div>
							<Text variant="body-small" className="font-bold">
								تم تحديد {selectedIds.size} منتج
							</Text>
							<Text variant="body-xs" color="muted" className="mt-0.5">
								اختر إجراءاً لتطبيقه على المنتجات المحددة
							</Text>
						</div>
					</m.div>
					<div className={cn("flex items-center flex-wrap", layout.gap.tight)}>
						<UIButton
							variant="ghost"
							size="sm"
							onClick={() => handleBulkStatusChange(true)}
							disabled={bulkActionLoading}
							className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
						>
							<CheckCircle2 size={16} />
							تفعيل
						</UIButton>
						<UIButton
							variant="ghost"
							size="sm"
							onClick={() => handleBulkStatusChange(false)}
							disabled={bulkActionLoading}
							className="bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
						>
							<XCircle size={16} />
							تعطيل
						</UIButton>
						<UIButton
							variant="ghost"
							size="sm"
							onClick={() => setShowDeleteDialog(true)}
							disabled={bulkActionLoading}
							className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
						>
							<Trash2 size={16} />
							حذف
						</UIButton>
						<UIButton
							variant="ghost"
							size="sm"
							onClick={() => setSelectedIds(new Set())}
							className="bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
						>
							<X size={16} />
							إلغاء
						</UIButton>
					</div>
				</Card>
			)}

			{/* Filters & Table Container */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
			>
				{/* Filters */}
				<div className="p-6 border-b border-gray-100 bg-gray-50/30">
					<div className="flex flex-col lg:flex-row gap-4">
						{/* Search */}
						<div className="relative flex-1">
							<Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
							<input
								type="text"
								placeholder="ابحث عن اسم المنتج، الوصف، أو الكود..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-purple-100 transition-all text-sm"
							/>
						</div>

						{/* Filters Row */}
						<div className="flex flex-wrap gap-3">
							{/* Status Filter */}
							<div className="relative">
								<select
									value={statusFilter}
									onChange={(e) =>
										setStatusFilter(
											e.target.value as "all" | ProductStatus
										)
									}
									className="appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-purple-100 text-sm pr-10 min-w-[140px]"
								>
									<option value="all">جميع الحالات</option>
									<option value="active">نشط</option>
									<option value="inactive">معطّل</option>
								</select>
								<ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
							</div>

							{/* Category Filter */}
							{categories.length > 0 && (
								<div className="relative">
									<select
										value={categoryFilter}
										onChange={(e) => setCategoryFilter(e.target.value)}
										className="appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-purple-100 text-sm pr-10 min-w-[140px]"
									>
										<option value="all">جميع الفئات</option>
										{categories.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</select>
									<ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
								</div>
							)}

							{/* Unit Filter */}
							{units.length > 0 && (
								<div className="relative">
									<select
										value={unitFilter}
										onChange={(e) => setUnitFilter(e.target.value)}
										className="appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-purple-100 text-sm pr-10 min-w-[140px]"
									>
										<option value="all">جميع الوحدات</option>
										{units.map((unit) => (
											<option key={unit} value={unit}>
												{unit}
											</option>
										))}
									</select>
									<ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
								</div>
							)}

							{/* Sort */}
							<div className="relative">
								<select
									value={sortOption}
									onChange={(e) =>
										setSortOption(e.target.value as SortOption)
									}
									className="appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-purple-100 text-sm pr-10 min-w-[160px]"
								>
									<option value="newest">الأحدث أولاً</option>
									<option value="oldest">الأقدم أولاً</option>
									<option value="price-high">الأعلى سعراً</option>
									<option value="price-low">الأقل سعراً</option>
								</select>
								<ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
							</div>
						</div>
					</div>
				</div>

				{/* Table */}
				{filteredProducts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
							<Package className="w-8 h-8 text-gray-300" />
						</div>
						<h3 className="text-gray-900 font-bold mb-1 text-lg">
							{products.length === 0
								? "لا توجد منتجات حتى الآن"
								: "لا توجد نتائج"}
						</h3>
						<p className="text-gray-500 text-sm mb-6">
							{products.length === 0
								? "ابدأ بإضافة أول منتج ليسهل عليك إنشاء الفواتير."
								: "حاول تغيير البحث أو الفلاتر"}
						</p>
						{products.length === 0 && (
							<m.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={openNew}
								className="inline-flex items-center gap-2 rounded-xl bg-[#7f2dfb] text-white px-6 py-3 text-base font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:bg-[#6a1fd8] transition-all"
							>
								<Plus size={20} strokeWidth={2.5} /> إضافة منتج
							</m.button>
						)}
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50/50">
									<tr>
										<th className="p-4 text-center w-12">
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
										<th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
											الاسم
										</th>
										<th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
											الفئة
										</th>
										<th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
											الوحدة
										</th>
										<th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
											السعر
										</th>
										<th className="p-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
											الحالة
										</th>
										<th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
											تاريخ الإنشاء
										</th>
										<th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
											الإجراءات
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50">
									{paginatedProducts.map((p) => {
										const isSelected = selectedIds.has(p.id);
										return (
											<tr
												key={p.id}
												className={cn(
													"hover:bg-gray-50/80 transition-colors group",
													isSelected && "bg-purple-50/50"
												)}
											>
												<td className="p-4 text-center">
													<button
														type="button"
														onClick={() => toggleSelect(p.id)}
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
														<div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7f2dfb] flex items-center justify-center flex-shrink-0">
															<Box size={20} />
														</div>
														<div className="min-w-0">
															<p className="font-bold text-gray-900 text-sm">
																{p.name}
															</p>
															{p.description && (
																<p className="text-xs text-gray-500 truncate max-w-[200px]">
																	{p.description}
																</p>
															)}
														</div>
													</div>
												</td>
												<td className="p-5 text-sm text-gray-600">
													{p.category ? (
														<span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
															{p.category}
														</span>
													) : (
														<span className="text-gray-400">—</span>
													)}
												</td>
												<td className="p-5 text-sm text-gray-600">
													{p.unit ? (
														<span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-medium">
															{p.unit}
														</span>
													) : (
														<span className="text-gray-400">—</span>
													)}
												</td>
												<td className="p-5">
													<Price amount={Number(p.unit_price)} size="sm" className="text-gray-900" />
												</td>
												<td className="p-5 text-center">
													<span
														className={cn(
															"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border",
															p.active
																? "bg-green-50 text-green-700 border-green-100"
																: "bg-gray-50 text-gray-700 border-gray-100"
														)}
													>
														{p.active ? "نشط" : "معطّل"}
													</span>
												</td>
												<td className="p-5 text-sm text-gray-600">
													{formatDate(p.created_at)}
												</td>
												<td className="p-5">
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={() => openEdit(p)}
															className="p-2 text-gray-500 hover:text-[#7f2dfb] hover:bg-purple-50 rounded-lg transition-colors"
															title="تعديل"
														>
															<Edit size={16} />
														</button>
														<button
															type="button"
															onClick={() => duplicateProduct(p)}
															className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
															title="نسخ"
														>
															<Copy size={16} />
														</button>
														<button
															type="button"
															onClick={() =>
																toggleProductStatus(p.id, p.active)
															}
															className={cn(
																"p-2 rounded-lg transition-colors",
																p.active
																	? "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
																	: "text-green-500 hover:text-green-600 hover:bg-green-50"
															)}
															title={p.active ? "تعطيل" : "تفعيل"}
														>
															{p.active ? (
																<XCircle size={16} />
															) : (
																<CheckCircle2 size={16} />
															)}
														</button>
														<button
															type="button"
															onClick={() => deleteProduct(p.id)}
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
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-600">عدد العناصر في الصفحة:</span>
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
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
											setCurrentPage((p) => Math.min(totalPages, p + 1))
										}
										disabled={currentPage === totalPages}
										className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										<ChevronLeft size={18} />
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</m.div>

			{/* Add/Edit Modal */}
			<AnimatePresence>
				{showModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/40 backdrop-blur-sm"
							onClick={closeModal}
						/>
						<m.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							className="bg-white rounded-3xl w-full max-w-lg shadow-2xl z-10 overflow-hidden"
						>
							{/* Fixed Header */}
							<div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
								<h2 className="text-xl font-bold text-gray-900">
									{editing ? "تعديل المنتج" : "إضافة منتج جديد"}
								</h2>
								<button
									type="button"
									onClick={closeModal}
									className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
								>
									<X size={24} />
								</button>
							</div>

							{/* Error Display */}
							{error && (
								<div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
									<AlertCircle size={20} className="text-red-600" />
									<span className="text-red-700 text-sm font-medium">{error}</span>
								</div>
							)}

							{/* Body */}
							<div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
								<div className="space-y-4">
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											اسم المنتج *
										</label>
										<div className="relative">
											<Box className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
											<input
												type="text"
												value={form.name || ""}
												onChange={(e) =>
													setForm((s) => ({ ...s, name: e.target.value }))
												}
												className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
												placeholder="أدخل اسم المنتج"
												required
											/>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												السعر (ريال) *
											</label>
											<div className="relative">
												<CircleDollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
												<input
													type="number"
													step="0.01"
													min="0"
													value={Number(form.unit_price || 0)}
													onChange={(e) =>
														setForm((s) => ({
															...s,
															unit_price: parseFloat(e.target.value) || 0,
														}))
													}
													className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
													placeholder="0.00"
													required
												/>
											</div>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												الوحدة
											</label>
											<div className="relative">
												<Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
												<input
													type="text"
													value={form.unit || ""}
													onChange={(e) =>
														setForm((s) => ({ ...s, unit: e.target.value }))
													}
													className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
													placeholder="قطعة، ساعة..."
												/>
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											الفئة
										</label>
										<input
											type="text"
											value={form.category || ""}
											onChange={(e) =>
												setForm((s) => ({ ...s, category: e.target.value }))
											}
											className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
											placeholder="الفئة (اختياري)"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											الوصف
										</label>
										<textarea
											value={form.description || ""}
											onChange={(e) =>
												setForm((s) => ({ ...s, description: e.target.value }))
											}
											rows={3}
											className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm resize-none"
											placeholder="وصف المنتج أو الخدمة (اختياري)"
										/>
									</div>
								</div>
							</div>

							{/* Fixed Footer */}
							<div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/30">
								<button
									type="button"
									onClick={closeModal}
									className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors text-sm"
								>
									إلغاء
								</button>
								<button
									type="button"
									onClick={submit}
									disabled={saving}
									className="px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white font-medium hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-colors text-sm flex items-center gap-2 disabled:opacity-70"
								>
									{saving && <Loader2 size={16} className="animate-spin" />}
									{saving
										? "جاري الحفظ..."
										: editing
											? "تحديث المنتج"
											: "إضافة المنتج"}
								</button>
							</div>
						</m.div>
					</div>
				)}
			</AnimatePresence>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>تأكيد الحذف</DialogTitle>
					</DialogHeader>
					<p className="text-gray-600">
						هل أنت متأكد من حذف {selectedIds.size} منتج؟ لا يمكن التراجع عن هذا الإجراء.
					</p>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
						>
							إلغاء
						</Button>
						<Button
							variant="destructive"
							onClick={handleBulkDelete}
							disabled={bulkActionLoading}
						>
							{bulkActionLoading ? (
								<>
									<Loader2 size={16} className="animate-spin ml-2" />
									جاري الحذف...
								</>
							) : (
								"حذف"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
