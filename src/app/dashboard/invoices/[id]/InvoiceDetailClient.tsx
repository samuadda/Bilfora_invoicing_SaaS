"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Printer, ArrowLeft, AlertCircle } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Link from "next/link";
import { m } from "framer-motion";
import { InvoicePDFRenderer } from "@/components/pdf/InvoicePDFRenderer";
import { generateZatcaTLVBase64 } from "@/components/pdf/zatcaQr";
import { convertToHijri } from "@/lib/dateConvert";
import type {
	Client,
	DocumentKind,
	InvoiceItem,
	InvoiceType,
	InvoiceWithClientAndItems,
} from "@/types/database";
import type { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";
import { getInvoiceTypeLabel } from "@/lib/invoiceTypeLabels";
import { PaymentRecordingModal } from "@/components/payments/PaymentRecordingModal";
import { InvoicePaymentsList } from "@/components/payments/InvoicePaymentsList";
import { Button } from "@/components/ui/Button";
import { CreditCard, Copy } from "lucide-react";
import { duplicateInvoiceAction } from "@/actions/invoices";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface Payment {
	id: string;
	amount: number;
	payment_date: string;
	payment_method: string;
	reference_number?: string | null;
	notes?: string | null;
}

type InvoiceDetailClientProps = {
	invoice: Omit<InvoiceWithClientAndItems, 'client'> & { client?: Client | null };
	client: Client | null;
	items: InvoiceItem[];
	payments: Payment[];
	invoiceSettings: InvoiceSettings | null;
	isSettingsReady: boolean;
};

export default function InvoiceDetailClient({
	invoice,
	client,
	items,
	payments,
	invoiceSettings,
	isSettingsReady,
}: InvoiceDetailClientProps) {
	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
	const [qrWarning, setQrWarning] = useState<string | null>(null);
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [isDuplicating, setIsDuplicating] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	// Use invoice_type directly (DB enum format), fallback to legacy type field if needed
	const invoiceType: InvoiceType =
		invoice.invoice_type ?? (invoice.type as InvoiceType) ?? "standard_tax";
	const documentKind: DocumentKind = invoice.document_kind || "invoice";
	const isTax = invoiceType === "standard_tax" || invoiceType === "simplified_tax";
	const isNonTax = invoiceType === "non_tax";
	const isCredit = documentKind === "credit_note";
	const taxRate = isNonTax ? 0 : Number(invoice.tax_rate ?? 0);
	const currency = invoiceSettings?.currency ?? "SAR";

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);

	const formatDate = (dateString?: string | null) => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		if (Number.isNaN(date.getTime())) return "-";
		return date.toLocaleDateString("en-GB");
	};

	const totals = useMemo(() => {
		const toNumber = (value: unknown): number | null => {
			if (typeof value === "number") return Number.isFinite(value) ? value : null;
			if (typeof value === "string") {
				const n = Number(value);
				return Number.isFinite(n) ? n : null;
			}
			return null;
		};

		const subtotalFromInvoice =
			toNumber((invoice as unknown as Record<string, unknown>).subtotal) ?? toNumber(invoice.subtotal);

		const subtotalComputed =
			subtotalFromInvoice ??
			items.reduce(
				(sum, item) =>
					sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
				0,
			);

		const vatFromInvoice =
			toNumber(invoice.vat_amount) ?? toNumber((invoice as unknown as Record<string, unknown>).tax_amount);

		const vatComputed = isNonTax
			? 0
			: vatFromInvoice ?? subtotalComputed * (taxRate / 100);

		const totalFromInvoice = toNumber(invoice.total_amount);

		const totalComputed =
			totalFromInvoice ??
			(isCredit ? -(subtotalComputed + vatComputed) : subtotalComputed + vatComputed);

		const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
		const outstanding = Math.max(0, totalComputed - totalPaid);

		return {
			subtotal: subtotalComputed,
			vat: vatComputed,
			total: totalComputed,
			paid: totalPaid,
			outstanding,
		};
	}, [invoice, items, isNonTax, isCredit, taxRate, payments]);

	useEffect(() => {
		async function buildQr() {
			if (!isTax) {
				setQrWarning(null);
				setQrDataUrl(null);
				return;
			}

			if (!isSettingsReady || !invoiceSettings?.seller_name || !invoiceSettings.vat_number) {
				setQrWarning("أكمل بيانات المنشأة لإظهار QR");
				setQrDataUrl(null);
				return;
			}

			try {
				const QRCode = (await import("qrcode")).default;

				const invoiceTotal = (invoice.total_amount ?? totals.total ?? 0).toFixed(2);
				const vatTotal = (invoice.vat_amount ?? totals.vat ?? 0).toFixed(2);

				const issueDateIso = invoice.issue_date
					? new Date(invoice.issue_date).toISOString()
					: new Date().toISOString();

				const sellerInfo = {
					sellerName: invoiceSettings.seller_name,
					vatNumber: invoiceSettings.vat_number,
					timestamp: issueDateIso,
					invoiceTotal,
					vatTotal,
				};

				const tlvBase64 = generateZatcaTLVBase64(sellerInfo);
				if (!tlvBase64) {
					setQrDataUrl(null);
					setQrWarning("أكمل بيانات المنشأة لإظهار QR");
					return;
				}

				const dataUrl = await QRCode.toDataURL(tlvBase64, {
					margin: 0,
				});
				setQrWarning(null);
				setQrDataUrl(dataUrl);
			} catch (err) {
				console.error("Error generating QR code:", err);
				setQrWarning("تعذر إنشاء رمز QR");
				setQrDataUrl(null);
			}
		}

		buildQr();
	}, [
		invoice.issue_date,
		invoice.total_amount,
		invoice.vat_amount,
		invoiceSettings,
		isSettingsReady,
		isTax,
		totals.total,
		totals.vat,
	]);

	const getTitle = () => {
		if (isCredit) return "إشعار دائن";
		return getInvoiceTypeLabel(invoiceType);
	};

	const pdfDoc = useMemo(() => {
		if (!isSettingsReady || !invoiceSettings) return null;

		return (
			<InvoicePDFRenderer
				invoice={invoice}
				client={client}
				items={items}
				qrDataUrl={qrDataUrl}
				invoiceSettings={invoiceSettings}
			/>
		);
	}, [client, invoice, invoiceSettings, isSettingsReady, items, qrDataUrl]);

	const handleDuplicate = async () => {
		if (isDuplicating) return;
		setIsDuplicating(true);
		try {
			const result = await duplicateInvoiceAction(invoice.id);
			if (result.success && result.data?.id) {
				toast({
					title: "تم نسخ الفاتورة بنجاح",
					description: `تم إنشاء نسخة مسودة من الفاتورة ${invoice.invoice_number || invoice.id}`,
				});
				router.push(`/dashboard/invoices/${result.data.id}`);
			} else {
				toast({
					variant: "destructive",
					title: "خطأ في النسخ",
					description: result.error || "حدث خطأ غير متوقع",
				});
				setIsDuplicating(false);
			}
		} catch {
			toast({
				variant: "destructive",
				title: "خطأ في النسخ",
				description: "حدث خطأ غير متوقع",
			});
			setIsDuplicating(false);
		}
	};

	return (
		<>
			<div className="min-h-screen bg-gray-50 p-4 md:p-8">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="mb-6 no-print">
						<Link
							href="/dashboard/invoices"
							className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7f2dfb] transition-colors mb-4"
						>
							<ArrowLeft className="w-4 h-4" />
							العودة إلى قائمة الفواتير
						</Link>
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<div className="flex items-center gap-3 mb-2">
									<h1 className="text-2xl md:text-3xl font-bold text-[#012d46]">
										{getTitle()} #{invoice.invoice_number || invoice.id}
									</h1>
									<span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
										{getInvoiceTypeLabel(invoiceType)}
									</span>
								</div>
								{isCredit && invoice?.related_invoice_id && (
									<p className="text-sm text-gray-500 mt-1">
										هذا إشعار دائن متعلق بالفاتورة رقم{" "}
										{invoice.invoice_number || invoice.id}
									</p>
								)}
							</div>
							<div className="flex gap-3 items-center">
								{invoice.status !== "paid" && invoice.status !== "cancelled" && (
									<Button
										onClick={() => setIsPaymentModalOpen(true)}
										className="gap-2 bg-green-600 hover:bg-green-700"
									>
										<CreditCard className="w-4 h-4" />
										تسجيل دفعة
									</Button>
								)}
								<Button
									variant="secondary"
									onClick={handleDuplicate}
									disabled={isDuplicating}
									className="gap-2"
								>
									{isDuplicating ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Copy className="w-4 h-4" />
									)}
									نسخ
								</Button>

								{pdfDoc ? (
									<PDFDownloadLink
										document={pdfDoc}
										fileName={`invoice-${invoice.invoice_number || invoice.id}.pdf`}
										className="inline-flex items-center gap-2 px-4 py-2 bg-[#7f2dfb] text-white rounded-lg hover:bg-[#6b1fd9] transition-colors"
									>
										{({ loading }) =>
											loading ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													جاري التحميل...
												</>
											) : (
												<>
													<Printer className="w-4 h-4" />
													تحميل PDF
												</>
											)
										}
									</PDFDownloadLink>
								) : (
									<button
										disabled
										className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
									>
										<Loader2 className="w-4 h-4 animate-spin" />
										{isSettingsReady
											? "جاري التحميل..."
											: "أكمل بيانات المنشأة لتنزيل PDF"}
									</button>
								)}
							</div>
						</div>
					</div>

					{!isSettingsReady && (
						<div className="no-print mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
							<div className="flex items-start gap-2">
								<AlertCircle className="mt-0.5 h-5 w-5" />
								<div>
									<p className="font-semibold">أكمل بيانات المنشأة لإظهار QR وتنزيل PDF</p>
									<p className="text-sm text-amber-800">
										الرجاء إضافة اسم المنشأة والرقم الضريبي في إعدادات الفواتير.
									</p>
									<div className="mt-2">
										<Link
											href="/dashboard/invoices-settings"
											className="text-[#7f2dfb] hover:underline font-medium"
										>
											الانتقال إلى إعدادات الفواتير
										</Link>
									</div>
								</div>
							</div>
							{qrWarning && (
								<p className="mt-2 text-sm font-medium text-amber-900">
									{qrWarning}
								</p>
							)}
						</div>
					)}

					{/* Print Header */}
					<div className="print-header mb-6">
						<h1 className="text-2xl font-bold text-[#012d46] text-center mb-4">
							{getTitle()} #{invoice.invoice_number || invoice.id}
						</h1>
					</div>

					{/* Invoice Details */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="print-invoice bg-white rounded-lg shadow-sm p-6 md:p-8"
					>
						{/* Invoice Info */}
						<div className="grid md:grid-cols-2 gap-6 mb-8">
							<div>
								<h3 className="text-lg font-semibold text-[#012d46] mb-4">
									معلومات الفاتورة
								</h3>
								<div className="space-y-2 text-gray-600">
									<p>
										<span className="font-medium">رقم الفاتورة:</span>{" "}
										{invoice.invoice_number || invoice.id}
									</p>
									<div className="flex flex-col gap-1">
										<span className="font-medium">تاريخ الإصدار:</span>{" "}
										<div className="flex flex-col gap-0.5">
											<span>{formatDate(invoice.issue_date)}</span>
											{invoice.issue_date && (
												<span className="text-gray-500 text-xs">
													الموافق: {convertToHijri(invoice.issue_date).formattedHijri}
												</span>
											)}
										</div>
									</div>
									<div className="flex flex-col gap-1">
										<span className="font-medium">تاريخ الاستحقاق:</span>{" "}
										<div className="flex flex-col gap-0.5">
											<span>{formatDate(invoice.due_date)}</span>
											{invoice.due_date && (
												<span className="text-gray-500 text-xs">
													الموافق: {convertToHijri(invoice.due_date).formattedHijri}
												</span>
											)}
										</div>
									</div>
									<p>
										<span className="font-medium">الحالة:</span>{" "}
										<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
											{invoice.status}
										</span>
									</p>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#012d46] mb-4">
									معلومات العميل
								</h3>
								<div className="space-y-2 text-gray-600">
									<p className="font-medium text-[#012d46]">
										{client?.name ?? "-"}
									</p>
									{client?.company_name && <p>الشركة: {client.company_name}</p>}
									{client?.email && <p>البريد: {client.email}</p>}
									{client?.phone && <p>الهاتف: {client.phone}</p>}
									{client?.tax_number && <p>الرقم الضريبي: {client.tax_number}</p>}
								</div>
							</div>
						</div>

						{/* Items Table */}
						<div className="mb-8">
							<h3 className="text-lg font-semibold text-[#012d46] mb-4">تفاصيل الفاتورة</h3>
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="bg-[#7f2dfb] text-white">
											<th className="p-3 text-right text-sm font-semibold">#</th>
											<th className="p-3 text-right text-sm font-semibold">الوصف</th>
											<th className="p-3 text-center text-sm font-semibold">الكمية</th>
											<th className="p-3 text-left text-sm font-semibold">
												سعر الوحدة {isTax ? "(بدون ضريبة)" : ""}
											</th>
											{isTax && (
												<>
													<th className="p-3 text-center text-sm font-semibold">نسبة الضريبة</th>
													<th className="p-3 text-left text-sm font-semibold">مبلغ الضريبة</th>
												</>
											)}
											<th className="p-3 text-left text-sm font-semibold">
												الإجمالي {isTax ? "(شامل الضريبة)" : ""}
											</th>
										</tr>
									</thead>
									<tbody>
										{items.map((item, index) => {
											const qty = Number(item.quantity) || 0;
											const unit = Number(item.unit_price) || 0;
											const lineNet = qty * unit;
											const lineVat = isNonTax ? 0 : lineNet * (taxRate / 100);
											const lineTotal = isCredit ? -(lineNet + lineVat) : lineNet + lineVat;

											return (
												<tr
													key={item.id || index}
													className="border-b border-gray-200 hover:bg-gray-50"
												>
													<td className="p-3 text-right text-sm">{index + 1}</td>
													<td className="p-3 text-right text-sm">{item.description || "-"}</td>
													<td className="p-3 text-center text-sm">{qty}</td>
													<td className="p-3 text-left text-sm">{formatCurrency(unit)}</td>
													{isTax && (
														<>
															<td className="p-3 text-center text-sm">{taxRate}%</td>
															<td className="p-3 text-left text-sm">
																{formatCurrency(lineVat)}
															</td>
														</>
													)}
													<td className="p-3 text-left text-sm font-medium">
														{formatCurrency(lineTotal)}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>

						{/* Totals */}
						<div className="flex justify-end">
							<div className="totals-section w-full md:w-96 space-y-2 p-4 rounded-lg">
								{isTax ? (
									<>
										<div className="flex justify-between text-gray-600">
											<span>المجموع الفرعي (بدون ضريبة):</span>
											<span className="font-medium">{formatCurrency(totals.subtotal)}</span>
										</div>
										<div className="flex justify-between text-gray-600">
											<span>مجموع الضريبة ({taxRate}%):</span>
											<span className="font-medium">{formatCurrency(totals.vat)}</span>
										</div>
										<div className="border-t border-gray-300 pt-2 mt-2 space-y-2">
											<div className="flex justify-between text-lg font-bold text-[#012d46]">
												<span>{isCredit ? "إشعار دائن:" : "الإجمالي المستحق:"}</span>
												<span>{formatCurrency(totals.total)}</span>
											</div>
											{totals.paid > 0 && (
												<>
													<div className="flex justify-between text-green-600 font-medium">
														<span>المدفوع:</span>
														<span>{formatCurrency(totals.paid)}</span>
													</div>
													<div className="flex justify-between text-red-600 font-bold">
														<span>المتبقي:</span>
														<span>{formatCurrency(totals.outstanding)}</span>
													</div>
												</>
											)}
										</div>
									</>
								) : (
									<div className="space-y-2">
										<div className="flex justify-between text-lg font-bold text-[#012d46]">
											<span>{isCredit ? "إشعار دائن:" : "المجموع:"}</span>
											<span>{formatCurrency(totals.total)}</span>
										</div>
										{totals.paid > 0 && (
											<>
												<div className="flex justify-between text-green-600 font-medium">
													<span>المدفوع:</span>
													<span>{formatCurrency(totals.paid)}</span>
												</div>
												<div className="flex justify-between text-red-600 font-bold">
													<span>المتبقي:</span>
													<span>{formatCurrency(totals.outstanding)}</span>
												</div>
											</>
										)}
									</div>
								)}
							</div>
						</div>

						{/* Notes */}
						{invoice.notes && (
							<div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
								<h4 className="font-semibold text-yellow-900 mb-2">ملاحظات:</h4>
								<p className="text-yellow-800 text-sm">{invoice.notes}</p>
							</div>
						)}

						{/* Payment History */}
						{payments.length > 0 && (
							<div className="mt-8">
								<h3 className="text-lg font-semibold text-[#012d46] mb-4">سجل الدفعات</h3>
								<InvoicePaymentsList payments={payments} />
							</div>
						)}

						<PaymentRecordingModal
							isOpen={isPaymentModalOpen}
							onClose={() => setIsPaymentModalOpen(false)}
							invoiceId={invoice.id}
							totalAmount={totals.total ?? 0}
							outstandingAmount={totals.outstanding ?? 0}
							onSuccess={() => {
								// Optional: Refresh data if not handled by server action revalidation
							}}
						/>
					</m.div>
				</div>
			</div>
		</>
	);
}
