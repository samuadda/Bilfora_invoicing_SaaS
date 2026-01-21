"use client";

import { useState, useEffect } from "react";
import {
	Edit,
	Download,
	Filter,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	CheckCircle,
	Clock,
	XCircle,
	AlertCircle,
	Plus,
	Search,
	Trash2,
	Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
	OrderWithClientAndItems,
	OrderStatus,
	Client,
} from "@/types/database";

const statusConfig = {
	pending: {
		label: "معلق",
		color: "bg-yellow-100 text-yellow-800",
		icon: Clock,
	},
	processing: {
		label: "قيد المعالجة",
		color: "bg-blue-100 text-blue-800",
		icon: AlertCircle,
	},
	completed: {
		label: "مكتمل",
		color: "bg-green-100 text-green-800",
		icon: CheckCircle,
	},
	cancelled: {
		label: "ملغي",
		color: "bg-red-100 text-red-800",
		icon: XCircle,
	},
};

export default function OrdersPage() {
	const [orders, setOrders] = useState<OrderWithClientAndItems[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<
		OrderWithClientAndItems[]
	>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">(
		"all"
	);
	const [dateFilter, setDateFilter] = useState("all");
	const [showFilters, setShowFilters] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingOrder, setEditingOrder] =
		useState<OrderWithClientAndItems | null>(null);
	const [saving, setSaving] = useState(false);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Form state for add/edit
	const [formData, setFormData] = useState({
		client_id: "",
		status: "pending" as OrderStatus,
		notes: "",
		items: [{ description: "", quantity: 1, unit_price: 0 }],
	});

	// Load orders and clients on component mount
	useEffect(() => {
		loadOrders();
		loadClients();
	}, []);

	// Filter orders when filters change
	useEffect(() => {
		let filtered = [...orders];

		// Filter by status
		if (statusFilter !== "all") {
			filtered = filtered.filter((o) => o.status === statusFilter);
		}

		// Filter by search term
		if (searchTerm) {
			filtered = filtered.filter(
				(o) =>
					o.order_number
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					o.client.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					o.client.email
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
			);
		}

		// Filter by date
		if (dateFilter !== "all") {
			const now = new Date();
			const filterDate = new Date();

			switch (dateFilter) {
				case "today":
					filterDate.setHours(0, 0, 0, 0);
					break;
				case "week":
					filterDate.setDate(now.getDate() - 7);
					break;
				case "month":
					filterDate.setMonth(now.getMonth() - 1);
					break;
			}

			filtered = filtered.filter(
				(o) => new Date(o.created_at) >= filterDate
			);
		}

		setFilteredOrders(filtered);
		setCurrentPage(1); // Reset to page 1 when filters change
	}, [orders, statusFilter, searchTerm, dateFilter]);

	// Pagination
	const totalPages = Math.ceil(filteredOrders.length / pageSize);
	const paginatedOrders = filteredOrders.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	const loadOrders = async () => {
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

			const { data, error } = await supabase
				.from("orders")
				.select(
					`
					*,
					client:clients(*),
					items:order_items(*)
				`
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error loading orders:", error);
				setError("فشل في تحميل قائمة الطلبات");
				return;
			}

			setOrders(data || []);
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		} finally {
			setLoading(false);
		}
	};

	const loadClients = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from("clients")
				.select("*")
				.eq("user_id", user.id)
				.eq("status", "active")
				.order("name");

			if (error) {
				console.error("Error loading clients:", error);
				return;
			}

			setClients(data || []);
		} catch (err) {
			console.error("Unexpected error loading clients:", err);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleItemChange = (
		index: number,
		field: string,
		value: string | number
	) => {
		setFormData((prev) => ({
			...prev,
			items: prev.items.map((item, i) =>
				i === index ? { ...item, [field]: value } : item
			),
		}));
	};

	const addItem = () => {
		setFormData((prev) => ({
			...prev,
			items: [
				...prev.items,
				{ description: "", quantity: 1, unit_price: 0 },
			],
		}));
	};

	const removeItem = (index: number) => {
		setFormData((prev) => ({
			...prev,
			items: prev.items.filter((_, i) => i !== index),
		}));
	};

	const resetForm = () => {
		setFormData({
			client_id: "",
			status: "pending",
			notes: "",
			items: [{ description: "", quantity: 1, unit_price: 0 }],
		});
		setEditingOrder(null);
		setError(null);
		setSuccess(null);
	};

	const handleAddOrder = () => {
		resetForm();
		setShowAddModal(true);
	};

	const handleEditOrder = (order: OrderWithClientAndItems) => {
		setFormData({
			client_id: order.client_id,
			status: order.status,
			notes: order.notes || "",
			items: order.items.map((item) => ({
				description: item.description,
				quantity: item.quantity,
				unit_price: item.unit_price,
			})),
		});
		setEditingOrder(order);
		setShowAddModal(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setSaving(true);
			setError(null);

			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

			// Calculate total amount
			const totalAmount = formData.items.reduce(
				(sum, item) => sum + item.quantity * item.unit_price,
				0
			);

			if (editingOrder) {
				// Update existing order
				const { error: orderError } = await supabase
					.from("orders")
					.update({
						client_id: formData.client_id,
						status: formData.status,
						total_amount: totalAmount,
						notes: formData.notes || null,
					})
					.eq("id", editingOrder.id);

				if (orderError) {
					console.error("Error updating order:", orderError);
					setError("فشل في تحديث الطلب");
					return;
				}

				// Delete existing items and insert new ones
				const { error: deleteError } = await supabase
					.from("order_items")
					.delete()
					.eq("order_id", editingOrder.id);

				if (deleteError) {
					console.error("Error deleting order items:", deleteError);
					setError("فشل في تحديث عناصر الطلب");
					return;
				}

				const { error: insertError } = await supabase
					.from("order_items")
					.insert(
						formData.items.map((item) => ({
							order_id: editingOrder.id,
							description: item.description,
							quantity: item.quantity,
							unit_price: item.unit_price,
							total: item.quantity * item.unit_price,
						}))
					);

				if (insertError) {
					console.error("Error inserting order items:", insertError);
					setError("فشل في تحديث عناصر الطلب");
					return;
				}

				setSuccess("تم تحديث الطلب بنجاح");
			} else {
				// Create new order
				const { data: orderData, error: orderError } = await supabase
					.from("orders")
					.insert({
						user_id: user.id,
						client_id: formData.client_id,
						status: formData.status,
						total_amount: totalAmount,
						notes: formData.notes || null,
					})
					.select()
					.single();

				if (orderError) {
					console.error("Error creating order:", orderError);
					setError("فشل في إضافة الطلب");
					return;
				}

				// Insert order items
				const { error: insertError } = await supabase
					.from("order_items")
					.insert(
						formData.items.map((item) => ({
							order_id: orderData.id,
							description: item.description,
							quantity: item.quantity,
							unit_price: item.unit_price,
							total: item.quantity * item.unit_price,
						}))
					);

				if (insertError) {
					console.error("Error inserting order items:", insertError);
					setError("فشل في إضافة عناصر الطلب");
					return;
				}

				setSuccess("تم إضافة الطلب بنجاح");
			}

			// Reload orders and close modal
			await loadOrders();
			setShowAddModal(false);
			resetForm();
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		} finally {
			setSaving(false);
		}
	};

	const handleStatusChange = async (
		orderId: string,
		newStatus: OrderStatus
	) => {
		try {
			setError(null);

			const { error } = await supabase
				.from("orders")
				.update({ status: newStatus })
				.eq("id", orderId);

			if (error) {
				console.error("Error updating order status:", error);
				setError("فشل في تحديث حالة الطلب");
				return;
			}

			setSuccess("تم تحديث حالة الطلب بنجاح");
			await loadOrders();
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		}
	};

	const handleDeleteOrder = async (orderId: string) => {
		if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;

		try {
			setError(null);

			const { error } = await supabase
				.from("orders")
				.delete()
				.eq("id", orderId);

			if (error) {
				console.error("Error deleting order:", error);
				setError("فشل في حذف الطلب");
				return;
			}

			setSuccess("تم حذف الطلب بنجاح");
			await loadOrders();
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		}
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
		}).format(amount);

	const formatDate = (dateString: string) =>
		new Date(dateString).toLocaleDateString("en-GB");

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
					<p className="text-gray-500">جاري تحميل الطلبات...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Success/Error Messages */}
			{success && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
					<CheckCircle className="h-5 w-5 text-green-600" />
					<p className="text-green-800">{success}</p>
				</div>
			)}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
					<AlertCircle className="h-5 w-5 text-red-600" />
					<p className="text-red-800">{error}</p>
				</div>
			)}

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								إجمالي الطلبات
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{orders.length}
							</p>
						</div>
						<div className="p-2 bg-blue-100 rounded-lg">
							<CheckCircle className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">طلبات معلقة</p>
							<p className="text-2xl font-bold text-yellow-600">
								{
									orders.filter((o) => o.status === "pending")
										.length
								}
							</p>
						</div>
						<div className="p-2 bg-yellow-100 rounded-lg">
							<Clock className="w-6 h-6 text-yellow-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								طلبات مكتملة
							</p>
							<p className="text-2xl font-bold text-green-600">
								{
									orders.filter(
										(o) => o.status === "completed"
									).length
								}
							</p>
						</div>
						<div className="p-2 bg-green-100 rounded-lg">
							<CheckCircle className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								إجمالي المبيعات
							</p>
							<p className="text-2xl font-bold text-purple-600">
								{formatCurrency(
									orders.reduce(
										(sum, order) =>
											sum + order.total_amount,
										0
									)
								)}
							</p>
						</div>
						<div className="p-2 bg-purple-100 rounded-lg">
							<Download className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Header with Add Button */}
			<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						الطلبات
					</h1>
					<p className="text-gray-500 mt-1">إدارة طلبات العملاء</p>
				</div>
				<button
					onClick={handleAddOrder}
					className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:translate-y-[1px]"
				>
					<Plus size={16} />
					إضافة طلب جديد
				</button>
			</div>

			{/* Filters */}
			<div className="bg-white p-4 rounded-xl border border-gray-200">
				<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
					<div className="flex flex-wrap gap-3">
						<div className="relative">
							<Search
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								type="text"
								placeholder="البحث في الطلبات..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-3 pr-9 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 w-64"
							/>
						</div>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
						>
							<Filter size={16} />
							<span>تصفية</span>
							<ChevronDown size={16} />
						</button>

						{showFilters && (
							<>
								<select
									value={statusFilter}
									onChange={(e) =>
										setStatusFilter(
											e.target.value as
											| OrderStatus
											| "all"
										)
									}
									className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
								>
									<option value="all">جميع الحالات</option>
									<option value="pending">معلق</option>
									<option value="processing">
										قيد المعالجة
									</option>
									<option value="completed">مكتمل</option>
									<option value="cancelled">ملغي</option>
								</select>

								<select
									value={dateFilter}
									onChange={(e) =>
										setDateFilter(e.target.value)
									}
									className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
								>
									<option value="all">جميع التواريخ</option>
									<option value="today">اليوم</option>
									<option value="week">آخر أسبوع</option>
									<option value="month">آخر شهر</option>
								</select>
							</>
						)}
					</div>

					<div className="text-sm text-gray-600">
						عرض {filteredOrders.length} من {orders.length} طلب
					</div>
				</div>
			</div>

			{/* Orders Table */}
			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									رقم الطلب
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									العميل
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									العناصر
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									المبلغ
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الحالة
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									التاريخ
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الإجراءات
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{paginatedOrders.map((order) => {
								const statusInfo = statusConfig[order.status];
								const StatusIcon = statusInfo.icon;

								return (
									<tr
										key={order.id}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{order.order_number}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{order.client.name}
												</div>
												<div className="text-sm text-gray-500">
													{order.client.email}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{order.items.length} عنصر
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{formatCurrency(order.total_amount)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
											>
												<StatusIcon size={12} />
												{statusInfo.label}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(order.created_at)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
												<button
													onClick={() =>
														handleEditOrder(order)
													}
													className="text-gray-600 hover:text-gray-900"
													title="تعديل"
												>
													<Edit size={16} />
												</button>
												<button
													onClick={() =>
														handleStatusChange(
															order.id,
															"completed"
														)
													}
													className="text-green-600 hover:text-green-900"
													title="تمييز كمكتمل"
												>
													<CheckCircle size={16} />
												</button>
												<button
													onClick={() =>
														handleStatusChange(
															order.id,
															"cancelled"
														)
													}
													className="text-red-600 hover:text-red-900"
													title="إلغاء"
												>
													<XCircle size={16} />
												</button>
												<button
													onClick={() =>
														handleDeleteOrder(
															order.id
														)
													}
													className="text-red-600 hover:text-red-900"
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

				{filteredOrders.length === 0 && (
					<div className="text-center py-12">
						<div className="text-gray-500 text-lg">
							لا توجد طلبات
						</div>
						<p className="text-gray-400 mt-2">
							لم يتم العثور على طلبات تطابق المعايير المحددة
						</p>
						<button
							onClick={handleAddOrder}
							className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
						>
							<Plus size={16} />
							إضافة طلب جديد
						</button>
					</div>
				)}

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
								onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
								disabled={currentPage === totalPages}
								className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<ChevronLeft size={18} />
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Add/Edit Modal */}
			{showAddModal && (
				<div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
						<h2 className="text-xl font-bold mb-4">
							{editingOrder ? "تعديل الطلب" : "إضافة طلب جديد"}
						</h2>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										العميل *
									</label>
									<select
										name="client_id"
										value={formData.client_id}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										required
									>
										<option value="">اختر العميل</option>
										{clients.map((client) => (
											<option
												key={client.id}
												value={client.id}
											>
												{client.name} - {client.email}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										الحالة
									</label>
									<select
										name="status"
										value={formData.status}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									>
										<option value="pending">معلق</option>
										<option value="processing">
											قيد المعالجة
										</option>
										<option value="completed">مكتمل</option>
										<option value="cancelled">ملغي</option>
									</select>
								</div>
							</div>

							{/* Order Items */}
							<div>
								<div className="flex items-center justify-between mb-4">
									<label className="block text-sm text-gray-600">
										عناصر الطلب *
									</label>
									<button
										type="button"
										onClick={addItem}
										className="text-purple-600 hover:text-purple-700 text-sm"
									>
										+ إضافة عنصر
									</button>
								</div>

								<div className="space-y-3">
									{formData.items.map((item, index) => (
										<div
											key={index}
											className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
										>
											<div className="md:col-span-2">
												<label className="block text-xs text-gray-600 mb-1">
													الوصف
												</label>
												<input
													value={item.description}
													onChange={(e) =>
														handleItemChange(
															index,
															"description",
															e.target.value
														)
													}
													className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
													placeholder="وصف العنصر"
													required
												/>
											</div>
											<div>
												<label className="block text-xs text-gray-600 mb-1">
													الكمية
												</label>
												<input
													type="number"
													min="1"
													value={item.quantity}
													onChange={(e) =>
														handleItemChange(
															index,
															"quantity",
															parseInt(
																e.target.value
															) || 1
														)
													}
													className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
													required
												/>
											</div>
											<div>
												<label className="block text-xs text-gray-600 mb-1">
													السعر
												</label>
												<div className="flex gap-2">
													<input
														type="number"
														min="0"
														step="0.01"
														value={item.unit_price}
														onChange={(e) =>
															handleItemChange(
																index,
																"unit_price",
																parseFloat(
																	e.target
																		.value
																) || 0
															)
														}
														className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
														required
													/>
													<button
														type="button"
														onClick={() =>
															removeItem(index)
														}
														className="text-red-600 hover:text-red-700 p-2"
														disabled={
															formData.items
																.length === 1
														}
													>
														<Trash2 size={16} />
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div>
								<label className="block text-sm text-gray-600 mb-1">
									ملاحظات
								</label>
								<textarea
									name="notes"
									value={formData.notes}
									onChange={handleInputChange}
									rows={3}
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									placeholder="ملاحظات إضافية"
								/>
							</div>

							<div className="flex items-center justify-end gap-2 pt-4">
								<button
									type="button"
									onClick={() => {
										setShowAddModal(false);
										resetForm();
									}}
									className="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50"
								>
									إلغاء
								</button>
								<button
									type="submit"
									disabled={saving}
									className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
								>
									{saving && (
										<Loader2
											size={16}
											className="animate-spin"
										/>
									)}
									{saving
										? "جاري الحفظ..."
										: editingOrder
											? "تحديث"
											: "إضافة"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
