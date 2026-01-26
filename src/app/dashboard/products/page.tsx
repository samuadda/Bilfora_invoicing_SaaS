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
	Copy,
	Check,
	ChevronLeft,
	ChevronRight,
	Package,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { m } from "framer-motion";
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
import { Heading, Text, Card, Button as UIButton, Price, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui";
import { Pagination } from "@/components/ui/pagination";
import { layout } from "@/lib/ui/tokens";
import QuickProductModal from "@/components/QuickProductModal";

type SortOption = "newest" | "oldest" | "price-high" | "price-low";

export default function ProductsPage() {
	const { toast } = useToast();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editing, setEditing] = useState<Product | null>(null);

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
		setEditing(null);
		setShowModal(false);
	}, []);

	const openNew = () => {
		setEditing(null);
		setShowModal(true);
	};

	const openEdit = (product: Product) => {
		setEditing(product);
		setShowModal(true);
	};

	const duplicateProduct = async (product: Product) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;

			const { error } = await supabase.from("products").insert({
				user_id: user.id,
				name: (() => {
					let newName = `${product.name} (نسخة)`;
					let counter = 2;
					while (products.some((p) => p.name === newName)) {
						newName = `${product.name} (نسخة ${counter})`;
						counter++;
					}
					return newName;
				})(),
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
		<div className={cn("space-y-8 pb-10", layout.stack.large)}>
			{/* Header */}
			<div className={cn("flex flex-col gap-6 md:flex-row md:items-center md:justify-between", layout.gap.large)}>
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
							className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 inline-flex items-center justify-center gap-2"
						>
							<CheckCircle2 size={16} />
							تفعيل
						</UIButton>
						<UIButton
							variant="ghost"
							size="sm"
							onClick={() => handleBulkStatusChange(false)}
							disabled={bulkActionLoading}
							className="bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 inline-flex items-center justify-center gap-2"
						>
							<XCircle size={16} />
							تعطيل
						</UIButton>
						<UIButton
							variant="ghost"
							size="sm"
							onClick={() => setShowDeleteDialog(true)}
							disabled={bulkActionLoading}
							className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 inline-flex items-center justify-center gap-2"
						>
							<Trash2 size={16} />
							حذف
						</UIButton>
						<UIButton
							variant="ghost"
							size="sm"
							onClick={() => setSelectedIds(new Set())}
							className="bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 inline-flex items-center justify-center gap-2"
						>
							<X size={16} />
							إلغاء
						</UIButton>
					</div>
				</Card>
			)}

			{/* Filters Card */}
			<Card padding="standard">
				<div className="flex flex-col lg:flex-row gap-4">
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
								<Select
									value={statusFilter}
									onValueChange={(val) =>
										setStatusFilter(val as "all" | ProductStatus)
									}
								>
									<SelectTrigger className="w-[140px]">
										<SelectValue placeholder="الحالة" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">جميع الحالات</SelectItem>
										<SelectItem value="active">نشط</SelectItem>
										<SelectItem value="inactive">معطّل</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Category Filter */}
							{categories.length > 0 && (
								<div className="relative">
									<Select
										value={categoryFilter}
										onValueChange={(val) => setCategoryFilter(val)}
									>
										<SelectTrigger className="w-[140px]">
											<SelectValue placeholder="الفئة" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">جميع الفئات</SelectItem>
											{categories.map((cat) => (
												<SelectItem key={cat} value={cat}>
													{cat}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							{/* Unit Filter */}
							{units.length > 0 && (
								<div className="relative">
									<Select
										value={unitFilter}
										onValueChange={(val) => setUnitFilter(val)}
									>
										<SelectTrigger className="w-[140px]">
											<SelectValue placeholder="الوحدة" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">جميع الوحدات</SelectItem>
											{units.map((unit) => (
												<SelectItem key={unit} value={unit}>
													{unit}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							{/* Sort */}
							<div className="relative">
								<Select
									value={sortOption}
									onValueChange={(val) =>
										setSortOption(val as SortOption)
									}
								>
									<SelectTrigger className="w-[160px]">
										<SelectValue placeholder="ترتيب حسب" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="newest">الأحدث أولاً</SelectItem>
										<SelectItem value="oldest">الأقدم أولاً</SelectItem>
										<SelectItem value="price-high">الأعلى سعراً</SelectItem>
										<SelectItem value="price-low">الأقل سعراً</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Pagination Controls */}
			{stats.total > 0 && (
				<div className="flex items-center justify-between mt-4">
					<Text variant="body-small" color="muted">
						عرض {Math.min((currentPage - 1) * pageSize + 1, filteredProducts.length)} إلى {Math.min(currentPage * pageSize, filteredProducts.length)} من {filteredProducts.length} منتج
					</Text>
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						isLoading={loading}
					/>
				</div>
			)}

			{/* Table Card */}
			<Card padding="none" className="overflow-hidden">
				{/* Products Table */}
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
			</Card>

			{/* Add/Edit Modal */}
			<QuickProductModal
				isOpen={showModal}
				onClose={closeModal}
				onSuccess={load}
				product={editing}
			/>

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
