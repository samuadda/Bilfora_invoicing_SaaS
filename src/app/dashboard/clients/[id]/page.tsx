"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
	ArrowRight, Building2, Mail,
	Phone, MapPin, Calendar, FileText,
	CheckCircle, Clock, XCircle, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Client, Invoice, InvoiceStatus } from "@/types/database";
import LoadingState from "@/components/LoadingState";
import { cn } from "@/lib/utils";
import { m } from "framer-motion";

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
	draft: {
		label: "مسودة",
		color: "bg-gray-100 text-gray-600 border-gray-200",
		icon: FileText,
	},
	sent: {
		label: "مرسلة",
		color: "bg-blue-50 text-blue-600 border-blue-100",
		icon: Clock,
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

const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "SAR",
		maximumFractionDigits: 0,
	}).format(amount);

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-GB");
};

export default function ClientDetailPage() {
	const params = useParams();
	const router = useRouter();
	const clientId = params.id as string;

	const [client, setClient] = useState<Client | null>(null);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);

	const loadClientData = useCallback(async () => {
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				router.push("/login");
				return;
			}

			// Load client
			const { data: clientData, error: clientError } = await supabase
				.from("clients")
				.select("*")
				.eq("id", clientId)
				.eq("user_id", user.id)
				.single();

			if (clientError) throw clientError;
			setClient(clientData);

			// Load invoices
			const { data: invoicesData, error: invoicesError } = await supabase
				.from("invoices")
				.select("*")
				.eq("client_id", clientId)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (invoicesError) throw invoicesError;
			setInvoices(invoicesData || []);
		} catch (err: unknown) {
			console.error("Error loading client:", err);
			if ((err as { code?: string })?.code === "PGRST116") {
				// Not found
				router.push("/dashboard/clients");
			}
		} finally {
			setLoading(false);
		}
	}, [clientId, router]);

	useEffect(() => {
		if (clientId) {
			loadClientData();
		}
	}, [clientId, loadClientData]);

	if (loading) {
		return <LoadingState message="جاري تحميل بيانات المشتري..." />;
	}

	if (!client) {
		return (
			<div className="flex flex-col items-center justify-center py-16">
				<p className="text-gray-500 mb-4">المشتري غير موجود</p>
				<button
					onClick={() => router.push("/dashboard/clients")}
					className="px-6 py-2 bg-[#7f2dfb] text-white rounded-xl"
				>
					العودة للعملاء
				</button>
			</div>
		);
	}

	const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
	const paidInvoices = invoices.filter((inv) => inv.status === "paid");
	const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
	const pendingInvoices = invoices.filter(
		(inv) => inv.status !== "paid" && inv.status !== "cancelled"
	);
	const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

	return (
		<div className="space-y-8 pb-10">
			{/* Header */}
			<div className="flex items-center gap-4">
				<button
					onClick={() => router.push("/dashboard/clients")}
					className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
				>
					<ArrowRight size={20} className="text-gray-600" />
				</button>
				<div>
					<h1 className="text-3xl font-bold text-[#012d46]">{client.name}</h1>
					<p className="text-gray-500 mt-1">تفاصيل المشتري والفواتير</p>
				</div>
			</div>

			{/* Client Info Card */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
			>
				<h2 className="text-xl font-bold text-gray-900 mb-6">معلومات المشتري</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="flex items-start gap-3">
						<div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
							{client.name.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="text-sm text-gray-500 mb-1">الاسم</p>
							<p className="font-bold text-gray-900">{client.name}</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
						<div>
							<p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
							<p className="font-medium text-gray-900">{client.email}</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
						<div>
							<p className="text-sm text-gray-500 mb-1">الهاتف</p>
							<p className="font-medium text-gray-900">{client.phone}</p>
						</div>
					</div>
					{client.company_name && (
						<div className="flex items-start gap-3">
							<Building2 className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
							<div>
								<p className="text-sm text-gray-500 mb-1">اسم الشركة</p>
								<p className="font-medium text-gray-900">{client.company_name}</p>
							</div>
						</div>
					)}
					{client.tax_number && (
						<div className="flex items-start gap-3">
							<FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
							<div>
								<p className="text-sm text-gray-500 mb-1">الرقم الضريبي</p>
								<p className="font-medium text-gray-900">{client.tax_number}</p>
							</div>
						</div>
					)}
					{client.address && (
						<div className="flex items-start gap-3">
							<MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
							<div>
								<p className="text-sm text-gray-500 mb-1">العنوان</p>
								<p className="font-medium text-gray-900">{client.address}</p>
							</div>
						</div>
					)}
					<div className="flex items-start gap-3">
						<Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
						<div>
							<p className="text-sm text-gray-500 mb-1">تاريخ الإضافة</p>
							<p className="font-medium text-gray-900">{formatDate(client.created_at)}</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<div className="w-5 h-5 flex-shrink-0" />
						<div>
							<p className="text-sm text-gray-500 mb-1">الحالة</p>
							<span
								className={cn(
									"inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border",
									client.status === "active"
										? "bg-green-50 text-green-700 border-green-100"
										: "bg-gray-50 text-gray-700 border-gray-100"
								)}
							>
								{client.status === "active" ? "نشط" : "غير نشط"}
							</span>
						</div>
					</div>
				</div>
			</m.div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-5">
				<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
					<p className="text-sm text-gray-500 mb-2">إجمالي الفواتير</p>
					<p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
				</div>
				<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
					<p className="text-sm text-gray-500 mb-2">إجمالي المبلغ</p>
					<p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvoiced)}</p>
				</div>
				<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
					<p className="text-sm text-gray-500 mb-2">المبلغ المدفوع</p>
					<p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
				</div>
				<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
					<p className="text-sm text-gray-500 mb-2">المبلغ المستحق</p>
					<p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPending)}</p>
				</div>
			</div>

			{/* Invoices Table */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
			>
				<div className="p-6 border-b border-gray-100">
					<h2 className="text-xl font-bold text-gray-900">الفواتير</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50/50">
							<tr>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									رقم الفاتورة
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									تاريخ الإصدار
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									تاريخ الاستحقاق
								</th>
								<th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
									الحالة
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									المبلغ
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									الإجراءات
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{invoices.map((invoice) => {
								const statusInfo = statusConfig[invoice.status];
								const StatusIcon = statusInfo.icon;
								return (
									<tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
										<td className="px-6 py-4">
											<span className="font-bold text-[#012d46]">{invoice.invoice_number}</span>
										</td>
										<td className="px-6 py-4 text-sm text-gray-600">{formatDate(invoice.issue_date)}</td>
										<td className="px-6 py-4 text-sm text-gray-600">{formatDate(invoice.due_date)}</td>
										<td className="px-6 py-4 text-center">
											<span
												className={cn(
													"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
													statusInfo.color
												)}
											>
												<StatusIcon size={12} />
												{statusInfo.label}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-bold text-gray-900">
												{formatCurrency(invoice.total_amount)}
											</span>
										</td>
										<td className="px-6 py-4">
											<button
												onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
												className="text-[#7f2dfb] hover:text-[#6a1fd8] font-medium text-sm"
											>
												عرض
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					{invoices.length === 0 && (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
								<FileText className="w-8 h-8 text-gray-300" />
							</div>
							<h3 className="text-gray-900 font-bold mb-1">لا توجد فواتير</h3>
							<p className="text-gray-500 text-sm">لم يتم إصدار أي فواتير لهذا المشتري بعد</p>
						</div>
					)}
				</div>
			</m.div>
		</div>
	);
}

