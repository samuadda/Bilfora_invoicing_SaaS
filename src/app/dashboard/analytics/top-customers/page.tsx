"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, ChevronDown, ChevronUp, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";


type SortField = "revenue" | "invoices" | "overdue";
type SortDirection = "asc" | "desc";

interface CustomerStats {
	clientId: string;
	clientName: string;
	totalRevenue: number;
	invoiceCount: number;
	overdueAmount: number;
}

export default function TopCustomersPage() {
	const router = useRouter();
	const [customers, setCustomers] = useState<CustomerStats[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortField, setSortField] = useState<SortField>("revenue");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	useEffect(() => {
		loadCustomers();
	}, []);

	const loadCustomers = async () => {
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data: invoices, error } = await supabase
				.from("invoices")
				.select(
					`
					id,
					client_id,
					total_amount,
					status,
					due_date,
					client:clients(id, name)
				`
				)
				.eq("user_id", user.id);

			if (error) throw error;

			// Group by client
			const customerMap = new Map<string, CustomerStats>();

			invoices?.forEach((invoice) => {
				const clientId = invoice.client_id;
				const client = Array.isArray(invoice.client) ? invoice.client[0] : invoice.client;
				const clientName = client?.name || "عميل غير معروف";

				if (!customerMap.has(clientId)) {
					customerMap.set(clientId, {
						clientId,
						clientName,
						totalRevenue: 0,
						invoiceCount: 0,
						overdueAmount: 0,
					});
				}

				const customer = customerMap.get(clientId)!;
				customer.invoiceCount += 1;
				customer.totalRevenue += invoice.total_amount;

				// Check if overdue
				if (
					invoice.status !== "paid" &&
					invoice.status !== "cancelled" &&
					new Date(invoice.due_date) < new Date()
				) {
					customer.overdueAmount += invoice.total_amount;
				}
			});

			setCustomers(Array.from(customerMap.values()));
		} catch (err) {
			console.error("Error loading customers:", err);
		} finally {
			setLoading(false);
		}
	};

	const filteredAndSorted = useMemo(() => {
		let filtered = [...customers];

		// Search filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter((c) =>
				c.clientName.toLowerCase().includes(term)
			);
		}

		// Sort
		filtered.sort((a, b) => {
			let aVal: number;
			let bVal: number;

			switch (sortField) {
				case "revenue":
					aVal = a.totalRevenue;
					bVal = b.totalRevenue;
					break;
				case "invoices":
					aVal = a.invoiceCount;
					bVal = b.invoiceCount;
					break;
				case "overdue":
					aVal = a.overdueAmount;
					bVal = b.overdueAmount;
					break;
				default:
					return 0;
			}

			if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
			if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});

		return filtered;
	}, [customers, searchTerm, sortField, sortDirection]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 0,
		}).format(amount);

	if (loading) {
		return <LoadingState message="جاري تحميل بيانات العملاء..." />;
	}

	return (
		<div className="space-y-8 pb-10">
			{/* Header */}
			<div className="flex items-center gap-4">
				<button
					onClick={() => router.push("/dashboard/analytics")}
					className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
				>
					<ArrowRight size={20} className="text-gray-600" />
				</button>
				<div>
					<h1 className="text-3xl font-bold text-[#012d46]">أفضل العملاء</h1>
					<p className="text-gray-500 mt-1">ترتيب العملاء حسب الإيرادات والفواتير</p>
				</div>
			</div>

			{/* Search */}
			<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
				<div className="relative">
					<Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
					<input
						type="text"
						placeholder="ابحث عن عميل..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-purple-100 transition-all text-sm"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50/50">
							<tr>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									الترتيب
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									اسم المشتري
								</th>
								<th
									className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
									onClick={() => handleSort("revenue")}
								>
									<div className="flex items-center justify-end gap-1">
										إجمالي الإيرادات
										{sortField === "revenue" &&
											(sortDirection === "asc" ? (
												<ChevronUp size={14} className="text-[#7f2dfb]" />
											) : (
												<ChevronDown size={14} className="text-[#7f2dfb]" />
											))}
									</div>
								</th>
								<th
									className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
									onClick={() => handleSort("invoices")}
								>
									<div className="flex items-center justify-center gap-1">
										عدد الفواتير
										{sortField === "invoices" &&
											(sortDirection === "asc" ? (
												<ChevronUp size={14} className="text-[#7f2dfb]" />
											) : (
												<ChevronDown size={14} className="text-[#7f2dfb]" />
											))}
									</div>
								</th>
								<th
									className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
									onClick={() => handleSort("overdue")}
								>
									<div className="flex items-center justify-end gap-1">
										المبلغ المتأخر
										{sortField === "overdue" &&
											(sortDirection === "asc" ? (
												<ChevronUp size={14} className="text-[#7f2dfb]" />
											) : (
												<ChevronDown size={14} className="text-[#7f2dfb]" />
											))}
									</div>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{filteredAndSorted.map((customer, index) => (
								<tr
									key={customer.clientId}
									className="hover:bg-gray-50/50 transition-colors"
								>
									<td className="px-6 py-4 text-center">
										<span className="font-bold text-gray-400">#{index + 1}</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
												{customer.clientName.charAt(0).toUpperCase()}
											</div>
											<span className="font-bold text-gray-900">{customer.clientName}</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<span className="font-bold text-green-600">
											{formatCurrency(customer.totalRevenue)}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg px-3 py-1 text-sm font-bold">
											{customer.invoiceCount}
										</span>
									</td>
									<td className="px-6 py-4">
										{customer.overdueAmount > 0 ? (
											<span className="font-bold text-red-600">
												{formatCurrency(customer.overdueAmount)}
											</span>
										) : (
											<span className="text-gray-400">—</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{filteredAndSorted.length === 0 && (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
								<Users className="w-8 h-8 text-gray-300" />
							</div>
							<h3 className="text-gray-900 font-bold mb-1">لا يوجد عملاء</h3>
							<p className="text-gray-500 text-sm">حاول تغيير معايير البحث</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

