"use client";


import { useMemo, useState } from "react";
import { INVOICE_TOKENS } from "@/lib/invoice-design/tokens";
import { IS_ZATCA_ENABLED } from "@/config/features";
import { Loader2, Printer, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { m } from "framer-motion";

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
	/* const [qrDataUrl, setQrDataUrl] = useState<string | null>(null); */
	/* const [qrWarning, setQrWarning] = useState<string | null>(null); */
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [isDuplicating, setIsDuplicating] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	// Use invoice_type directly (DB enum format), fallback to legacy type field if needed
	const invoiceType: InvoiceType =
		invoice.invoice_type ?? (invoice.type as InvoiceType) ?? "standard_tax";
	const documentKind: DocumentKind = invoice.document_kind || "invoice";
	
	// Force non-tax mode if ZATCA is disabled
	const isTax = IS_ZATCA_ENABLED && (invoiceType === "standard_tax" || invoiceType === "simplified_tax");
	const isNonTax = !IS_ZATCA_ENABLED || invoiceType === "non_tax";
	
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

	// Robust check for download readiness
	const isReadyForDownload = useMemo(() => {
		if (!invoiceSettings?.name) return false;
		// For tax invoices, VAT number is mandatory ONLY if ZATCA is enabled
		if (IS_ZATCA_ENABLED && isTax && !invoiceSettings?.tax_number) return false;
		return true;
	}, [invoiceSettings, isTax]);

	const getMissingSettingsMessage = () => {
		if (!invoiceSettings?.name) return "أكمل اسم المنشأة لتنزيل PDF";
		if (IS_ZATCA_ENABLED && isTax && !invoiceSettings?.tax_number) return "أكمل الرقم الضريبي لتنزيل PDF";
		return "أكمل بيانات المنشأة لتنزيل PDF";
	};

	const getFormattedTime = (dateStr?: string | null, timeStr?: string | null) => {
		if (timeStr && timeStr.length >= 5) return timeStr.substring(0, 5);
		if (dateStr && dateStr.includes('T')) {
			try {
				const date = new Date(dateStr);
				if (date.getHours() !== 0 || date.getMinutes() !== 0) {
					return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
				}
			} catch { /* ignore */ }
		}
		return "";
	};

    const issueTime = getFormattedTime(invoice.issue_date, invoice.issue_time);

	// Seller Info Derived
	const sellerName = invoiceSettings?.name || "اسم المنشأة";
	const sellerTaxNumber = invoiceSettings?.tax_number || "";
	const sellerCrNumber = invoiceSettings?.cr_number || "";
	const sellerAddress = invoiceSettings?.address || "";
	const sellerPhone = invoiceSettings?.phone || "";
	const sellerBankName = invoiceSettings?.bank_name || "";
	const sellerIban = invoiceSettings?.iban || "";
	const invoiceFooter = invoiceSettings?.invoice_footer || "";

	// Buyer Info Derived
	const buyerName = client?.company_name || client?.name || "عميل نقدي";
	const buyerTaxNumber = client?.tax_number || "";
	const buyerAddress = client?.address || "";
	const buyerPhone = client?.phone || "";
	const showBuyerVat = isTax && isTax; // simplified check


	/* Removed QR generation effect */

	const getTitle = () => {
		if (!IS_ZATCA_ENABLED) return "فاتورة";
		if (isCredit) return "إشعار دائن";
		return getInvoiceTypeLabel(invoiceType);
	};



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

	/* Removed handlePrint */

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
									{IS_ZATCA_ENABLED && (
										<span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
											{getInvoiceTypeLabel(invoiceType)}
										</span>
									)}
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
									<button
										onClick={() => setIsPaymentModalOpen(true)}
										className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
									>
										<CreditCard className="w-4 h-4" />
										تسجيل دفعة
									</button>
								)}
								<button
									onClick={handleDuplicate}
									disabled={isDuplicating}
									className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
								>
									{isDuplicating ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Copy className="w-4 h-4" />
									)}
									نسخ
								</button>

								{isReadyForDownload ? (
									<a
										href={`/api/invoices/${invoice.id}/pdf`}
										target="_blank"
										className="inline-flex items-center gap-2 px-4 py-2 bg-[#7f2dfb] text-white rounded-lg hover:bg-[#6b1fd9] transition-colors"
									>
										<Printer className="w-4 h-4" />
										تحميل PDF
									</a>
								) : (
									<button
										disabled
										className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
									>
										<Printer className="w-4 h-4" />
										{isSettingsReady
											? "جاري التحميل..."
											: getMissingSettingsMessage()}
									</button>
								)}
							</div>
						</div>
					</div>

					{!isReadyForDownload && (
						<div className="no-print mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
							<div className="flex items-start gap-2">
								<AlertCircle className="mt-0.5 h-5 w-5" />
								<div>
									<p className="font-semibold">
										{isTax
											? "أكمل بيانات المنشأة لإظهار QR وتنزيل PDF"
											: "أكمل بيانات المنشأة لتنزيل PDF"}
									</p>
									<p className="text-sm text-amber-800">
										{isTax
											? "الرجاء إضافة اسم المنشأة والرقم الضريبي في إعدادات الفواتير."
											: "الرجاء إضافة اسم المنشأة في إعدادات الفواتير."}
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
							{/* {qrWarning && isTax && (
								<p className="mt-2 text-sm font-medium text-amber-900">
									{qrWarning}
								</p>
							)} */}
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
						className="print-invoice bg-white shadow-sm"
						style={{
							borderRadius: INVOICE_TOKENS.radius,
							color: INVOICE_TOKENS.textDark,
							padding: '2rem', // Match PDF padding roughly
						}}
					>
						{/* HEADER (Matches PDF) */}
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: INVOICE_TOKENS.spacing.gapLg,
								borderBottom: `2px solid ${INVOICE_TOKENS.border}`,
								paddingBottom: "1rem",
							}}
						>
							<div
								style={{
									fontSize: "24px",
									fontWeight: "bold",
									color: INVOICE_TOKENS.primary,
								}}
							>
								Bilfora
							</div>
							<div>
								<h1
									style={{
										fontSize: INVOICE_TOKENS.headings.h1.size,
										fontWeight: INVOICE_TOKENS.headings.h1.weight,
										color: INVOICE_TOKENS.textDark,
										margin: 0,
									}}
								>
									{getTitle()}
								</h1>
								<div
									style={{
										marginTop: "0.25rem",
										color: "#6b7280",
										textAlign: "left",
										direction: "ltr",
									}}
								>
									# {invoice.invoice_number || invoice.id}
								</div>
							</div>
						</div>

						{/* META GRID (Matches PDF) */}
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: INVOICE_TOKENS.spacing.gapLg,
								marginBottom: "1.5rem",
							}}
						>
							{/* Seller */}
							<div>
								<h3
									style={{
										color: INVOICE_TOKENS.primary,
										fontSize: INVOICE_TOKENS.headings.h3.size,
										marginBottom: "0.25rem",
										borderBottom: `1px solid ${INVOICE_TOKENS.border}`,
										paddingBottom: "0.25rem",
										fontWeight: 600,
									}}
								>
									مِن (البائع)
								</h3>
								<div className="flex flex-col gap-1 mt-2">
									<div className="font-bold text-gray-900">{sellerName}</div>
									{sellerAddress && <div className="text-gray-600 text-sm">{sellerAddress}</div>}
									{sellerPhone && <div className="text-gray-600 text-sm ltr-iso text-right">{sellerPhone}</div>}
									{IS_ZATCA_ENABLED && sellerTaxNumber && (
										<div className="text-gray-500 text-sm mt-1">الرقم الضريبي: <span className="ltr-iso">{sellerTaxNumber}</span></div>
									)}
									{!IS_ZATCA_ENABLED && sellerCrNumber && (
										<div className="text-gray-500 text-sm mt-1">س.ت: <span className="ltr-iso">{sellerCrNumber}</span></div>
									)}
								</div>
							</div>

							{/* Buyer */}
							<div>
								<h3
									style={{
										color: INVOICE_TOKENS.primary,
										fontSize: INVOICE_TOKENS.headings.h3.size,
										marginBottom: "0.25rem",
										borderBottom: `1px solid ${INVOICE_TOKENS.border}`,
										paddingBottom: "0.25rem",
										fontWeight: 600,
									}}
								>
									إلى (العميل)
								</h3>
								<div className="flex flex-col gap-1 mt-2">
									<div className="font-bold text-gray-900">{buyerName}</div>
									{buyerAddress && <div className="text-gray-600 text-sm">{buyerAddress}</div>}
									{buyerPhone && <div className="text-gray-600 text-sm ltr-iso text-right">{buyerPhone}</div>}
									{IS_ZATCA_ENABLED && isTax && buyerTaxNumber && (
										<div className="text-gray-500 text-sm mt-1">الرقم الضريبي: <span className="ltr-iso">{buyerTaxNumber}</span></div>
									)}
								</div>
							</div>
						</div>

						{/* DATES METADATA */}
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: INVOICE_TOKENS.spacing.gapLg,
								marginBottom: "1.5rem",
							}}
						>
							<div>
								<h3
									style={{
										color: INVOICE_TOKENS.primary,
										fontSize: INVOICE_TOKENS.headings.h3.size,
										marginBottom: "0.25rem",
										borderBottom: `1px solid ${INVOICE_TOKENS.border}`,
										paddingBottom: "0.25rem",
										fontWeight: 600,
									}}
								>
									تفاصيل الفاتورة
								</h3>
								<div className="flex justify-between items-center mb-1">
									<span className="font-semibold text-gray-500 text-[13px]">
										تاريخ الإصدار:
									</span>
									<span className="ltr-iso">
										{formatDate(invoice.issue_date)}
										{issueTime && <span className="text-gray-400 text-sm mr-2 font-medium">{issueTime}</span>}
									</span>
								</div>
								<div className="flex justify-between items-center mb-1">
									<span className="font-semibold text-gray-500 text-[13px]">
										تاريخ الاستحقاق:
									</span>
									<span className="ltr-iso">{formatDate(invoice.due_date)}</span>
								</div>
							</div>
						</div>

						{/* TABLE (Matches PDF) */}
						<div className="mb-8 overflow-x-auto">
							<table style={{ width: "100%", borderCollapse: "collapse", direction: 'rtl' }}>
								<thead>
									<tr>
										<th
											style={{
												backgroundColor: INVOICE_TOKENS.primary,
												color: "white",
												padding: INVOICE_TOKENS.table.cellPadding,
												textAlign: "center",
												fontSize: "13px",
												width: "15%",
											}}
										>
											الإجمالي
										</th>
										{isTax && (
											<th
												style={{
													backgroundColor: INVOICE_TOKENS.primary,
													color: "white",
													padding: INVOICE_TOKENS.table.cellPadding,
													textAlign: "center",
													fontSize: "13px",
													width: "15%",
												}}
											>
												الضريبة
											</th>
										)}
										<th
											style={{
												backgroundColor: INVOICE_TOKENS.primary,
												color: "white",
												padding: INVOICE_TOKENS.table.cellPadding,
												textAlign: "center",
												fontSize: "13px",
												width: "15%",
											}}
										>
											{IS_ZATCA_ENABLED ? 'سعر الوحدة' : 'السعر'}
										</th>
										<th
											style={{
												backgroundColor: INVOICE_TOKENS.primary,
												color: "white",
												padding: INVOICE_TOKENS.table.cellPadding,
												textAlign: "center",
												fontSize: "13px",
												width: "10%",
											}}
										>
											الكمية
										</th>
										<th
											className="desc"
											style={{
												backgroundColor: INVOICE_TOKENS.primary,
												color: "white",
												padding: INVOICE_TOKENS.table.cellPadding,
												textAlign: "right", // Desc right aligned
												fontSize: "13px",
												width: "40%",
											}}
										>
											الوصف
										</th>
										<th
											style={{
												backgroundColor: INVOICE_TOKENS.primary,
												color: "white",
												padding: INVOICE_TOKENS.table.cellPadding,
												textAlign: "center",
												fontSize: "13px",
												width: "5%",
											}}
										>
											#
										</th>
									</tr>
								</thead>
								<tbody>
									{items.map((item, index) => {
										const qty = Number(item.quantity) || 0;
										const unit = Number(item.unit_price) || 0;
										const lineTotalRaw = qty * unit;
										const taxAmount = isTax
											? invoice.tax_rate
												? lineTotalRaw * (invoice.tax_rate / 100)
												: 0
											: 0;
										const lineTotal = isTax
											? lineTotalRaw + taxAmount
											: lineTotalRaw;

										return (
											<tr
												key={item.id || index}
												style={{ borderBottom: `1px solid ${INVOICE_TOKENS.border}` }}
											>
												<td
													className="num"
													style={{
														padding: INVOICE_TOKENS.table.cellPadding,
														color: INVOICE_TOKENS.textGray,
														textAlign: "left",
														direction: "ltr",
													}}
												>
													{formatCurrency(lineTotal)}
												</td>
												{isTax && (
													<td
														className="num"
														style={{
															padding: INVOICE_TOKENS.table.cellPadding,
															color: INVOICE_TOKENS.textGray,
															textAlign: "left",
															direction: "ltr",
														}}
													>
														{formatCurrency(taxAmount)}
													</td>
												)}
												<td
													className="num"
													style={{
														padding: INVOICE_TOKENS.table.cellPadding,
														color: INVOICE_TOKENS.textGray,
														textAlign: "left",
														direction: "ltr",
													}}
												>
													{formatCurrency(unit)}
												</td>
												<td
													className="qty"
													style={{
														padding: INVOICE_TOKENS.table.cellPadding,
														color: INVOICE_TOKENS.textGray,
														textAlign: "center",
														direction: "ltr",
													}}
												>
													{qty}
												</td>
												<td
													className="desc"
													style={{
														padding: INVOICE_TOKENS.table.cellPadding,
														color: INVOICE_TOKENS.textGray,
														textAlign: "right",
													}}
												>
													{item.description || "-"}
												</td>
												<td
													className="idx"
													style={{
														padding: INVOICE_TOKENS.table.cellPadding,
														color: INVOICE_TOKENS.textGray,
														textAlign: "center",
														direction: "ltr",
													}}
												>
													{index + 1}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						{/* TOTALS (Matches PDF) */}
						<div
							className="totals-section"
							style={{
								width: "50%",
								marginRight: "auto", // Right aligned in RTL (means Left visually on screen if direction is RTL? No, margin-right: auto pushes it to the LEFT in RTL layout)
								// Wait, PDF says margin-right: auto. In RTL, margin-right refers to the physical right? 
								// In RTL, "margin-right: auto" pushes the element to the LEFT side of the container. 
								// Correct, because "margin-inline-start: auto" would push it to the end (left). 
								// Let's stick to PDF CSS logic.
								backgroundColor: INVOICE_TOKENS.bgSoft,
								padding: "1.5rem",
								borderRadius: "8px",
								marginLeft: "0",
							}}
						>
							<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "15px" }}>
								<span>المجموع (Subtotal):</span>
								<span className="ltr-iso" style={{ direction: 'ltr' }}>{formatCurrency(totals.subtotal)}</span>
							</div>
							{isTax && (
								<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "15px" }}>
									<span>الضريبة (VAT):</span>
									<span className="ltr-iso" style={{ direction: 'ltr' }}>{formatCurrency(totals.vat)}</span>
								</div>
							)}
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									marginBottom: "0.5rem",
									fontWeight: 800,
									fontSize: "18px",
									color: INVOICE_TOKENS.textDark,
									borderTop: `2px solid ${INVOICE_TOKENS.border}`,
									paddingTop: "1rem",
									marginTop: "0.5rem",
								}}
							>
								<span>الإجمالي (Total):</span>
								<span className="ltr-iso" style={{ direction: 'ltr' }}>{formatCurrency(totals.total)}</span>
							</div>

							{/* Payment status additions (not in PDF but useful for dashboard) */}
							{totals.paid > 0 && (
								<>
									<div className="flex justify-between text-green-600 font-medium text-sm mt-2">
										<span>المدفوع:</span>
										<span style={{ direction: 'ltr' }}>{formatCurrency(totals.paid)}</span>
									</div>
									<div className="flex justify-between text-red-600 font-bold text-sm">
										<span>المتبقي:</span>
										<span style={{ direction: 'ltr' }}>{formatCurrency(totals.outstanding)}</span>
									</div>
								</>
							)}
						</div>

						{/* NOTES (Matches PDF) */}
						{invoice.notes && (
							<div
								style={{
									marginTop: "2rem",
									borderTop: `1px solid ${INVOICE_TOKENS.border}`,
									paddingTop: "1rem",
								}}
							>
								<strong>ملاحظات:</strong>
								<p style={{ whiteSpace: "pre-wrap", color: INVOICE_TOKENS.textGray, marginTop: '0.5rem' }}>
									{invoice.notes}
								</p>
							</div>
						)}

						{/* Footer (Matches PDF) */}
						<div
							style={{
								marginTop: "3rem",
								textAlign: "center",
								color: "#9ca3af",
								fontSize: "12px",
								borderTop: `1px solid ${INVOICE_TOKENS.border}`,
								paddingTop: "1rem",
							}}
						>
							Generated by Bilfora
						</div>

						{/* Dashboard-only widgets (Payments) */}
						{payments.length > 0 && (
							<div className="mt-8 pt-8 border-t border-gray-100 no-print">
								<h3 className="text-lg font-semibold text-[#012d46] mb-4">
									سجل الدفعات
								</h3>
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
						{/* PAYMENT & NOTES & FOOTER */}
						{(sellerBankName || sellerIban) && (
							<div className="mt-12 p-6 bg-[#f8fafc] border border-gray-200 rounded-lg break-inside-avoid">
								<h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
									تفاصيل الحساب البنكي
								</h4>
								{sellerBankName && (
									<div className="flex justify-between py-2 border-b border-gray-200 text-sm">
										<span className="text-gray-500">اسم البنك</span>
										<span className="font-semibold text-gray-900">{sellerBankName}</span>
									</div>
								)}
								{sellerIban && (
									<div className="flex justify-between py-2 border-b border-gray-200 text-sm">
										<span className="text-gray-500">IBAN</span>
										<span className="font-semibold text-gray-900 ltr-iso font-mono">{sellerIban}</span>
									</div>
								)}
							</div>
						)}

						{invoiceFooter && (
							<div className="mt-6 text-center text-[13px] text-gray-500">
								{invoiceFooter}
							</div>
						)}

						<div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
							تم الإنشاء بواسطة منصة <span className="font-bold text-[#7f2dfb]">Bilfora</span> للفواتير الإلكترونية
						</div>

					</m.div>
				</div>
			</div>
		</>
	);
}
