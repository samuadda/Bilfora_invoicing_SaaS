"use client";

import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";
import { baseStyles as s, safeText as safeString, formatCurrency, formatDate } from "./sharedStyles";
import { convertToHijri } from "@/lib/dateConvert";

interface SellerInfo {
	name: string;
	crNumber: string;
	vatNumber: string;
	address: string;
}

interface InvoiceStandardPDFProps {
	invoice: InvoiceWithClientAndItems;
	client: Client | null;
	items: InvoiceItem[];
	qrDataUrl?: string | null;
	sellerInfo: SellerInfo;
}

export function InvoiceStandardPDF({
	invoice,
	client,
	items,
	qrDataUrl,
	sellerInfo,
}: InvoiceStandardPDFProps) {
	// Calculate totals (safety check)
	const subtotal = items.reduce(
		(sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
		0
	);
	const taxRate = Number(invoice.tax_rate || 0);
	const vatAmount = subtotal * (taxRate / 100);
	const totalAmount = subtotal + vatAmount;

	return (
		<Document>
			<Page size="A4" style={s.page}>
				{/* Header */}
				<View style={s.header}>
					<View style={s.logoSection}>
						<View style={s.logoPlaceholder}>
							<Text style={s.logoText}>بيلفورة</Text>
						</View>
						<Text style={s.companyName}>{safeString(sellerInfo.name)}</Text>
						<View style={s.companyInfo}>
							<Text style={s.companyInfoRow}>{safeString(sellerInfo.address)}</Text>
							<Text style={s.companyInfoRow}>
								الرقم التجاري: {safeString(sellerInfo.crNumber)}
							</Text>
							<Text style={s.companyInfoRow}>
								الرقم الضريبي: {safeString(sellerInfo.vatNumber)}
							</Text>
						</View>
					</View>

					<View style={s.invoiceInfo}>
						<Text style={s.invoiceTitle}>فاتورة ضريبية</Text>
						<View style={s.invoiceDetails}>
							<Text style={s.invoiceDetailRow}>
								رقم الفاتورة: {safeString(invoice.invoice_number || invoice.id)}
							</Text>
							<View>
								<Text style={s.invoiceDetailRow}>
									تاريخ الإصدار: {formatDate(invoice.issue_date)}
								</Text>
								{invoice.issue_date && (
									<Text style={{ fontSize: 9, color: "#6B7280", marginTop: 1 }}>
										الموافق: {convertToHijri(invoice.issue_date).formattedHijri}
									</Text>
								)}
							</View>
							<View>
								<Text style={s.invoiceDetailRow}>
									تاريخ الاستحقاق: {formatDate(invoice.due_date)}
								</Text>
								{invoice.due_date && (
									<Text style={{ fontSize: 9, color: "#6B7280", marginTop: 1 }}>
										الموافق: {convertToHijri(invoice.due_date).formattedHijri}
									</Text>
								)}
							</View>
							{qrDataUrl && (
								<View style={{ marginTop: 8, alignItems: "flex-end" }}>
									{/* eslint-disable-next-line jsx-a11y/alt-text */}
									<Image src={qrDataUrl} style={{ width: 80, height: 80 }} />
									<Text style={{ fontSize: 8, color: "#6B7280", marginTop: 4 }}>
										رمز الاستجابة السريعة
									</Text>
								</View>
							)}
						</View>
					</View>
				</View>

				{/* Seller Info Section */}
				<View style={s.section}>
					<Text style={s.sectionTitle}>معلومات البائع</Text>
					<View style={s.clientInfo}>
						<Text style={s.clientName}>{safeString(sellerInfo.name)}</Text>
						<Text style={s.clientDetailRow}>
							الرقم التجاري: {safeString(sellerInfo.crNumber)}
						</Text>
						<Text style={s.clientDetailRow}>
							الرقم الضريبي: {safeString(sellerInfo.vatNumber)}
						</Text>
						<Text style={s.clientDetailRow}>
							العنوان: {safeString(sellerInfo.address)}
						</Text>
					</View>
				</View>

				{/* Buyer Info Section */}
				<View style={s.section}>
					<Text style={s.sectionTitle}>معلومات المشتري</Text>
					<View style={s.clientInfo}>
						<Text style={s.clientName}>
							{safeString(client?.name || "غير محدد")}
						</Text>
						{client?.company_name && (
							<Text style={s.clientDetailRow}>
								الشركة: {safeString(client.company_name)}
							</Text>
						)}
						<Text style={s.clientDetailRow}>
							البريد الإلكتروني: {safeString(client?.email || "-")}
						</Text>
						<Text style={s.clientDetailRow}>
							الهاتف: {safeString(client?.phone || "-")}
						</Text>
						{client?.tax_number && (
							<Text style={s.clientDetailRow}>
								الرقم الضريبي: {safeString(client.tax_number)}
							</Text>
						)}
						{client?.address && (
							<Text style={s.clientDetailRow}>
								العنوان: {safeString(client.address)}
								{client?.city ? `، ${safeString(client.city)}` : ""}
							</Text>
						)}
					</View>
				</View>

				{/* Items Table */}
				<View style={s.section}>
					<Text style={s.sectionTitle}>تفاصيل الفاتورة</Text>
					<View style={s.table}>
						<View style={s.tableHeader}>
							<Text style={[s.tableHeaderCell, s.indexCell]}>#</Text>
							<Text style={[s.tableHeaderCell, s.descriptionCell]}>الوصف</Text>
							<Text style={[s.tableHeaderCell, s.quantityCell, s.tableCellCenter]}>
								الكمية
							</Text>
							<Text style={[s.tableHeaderCell, s.unitPriceCell, s.tableCellNumber]}>
								سعر الوحدة (بدون ضريبة)
							</Text>
							<Text style={[s.tableHeaderCell, s.taxRateCell, s.tableCellCenter]}>
								نسبة الضريبة
							</Text>
							<Text style={[s.tableHeaderCell, s.taxAmountCell, s.tableCellNumber]}>
								مبلغ الضريبة
							</Text>
							<Text style={[s.tableHeaderCell, s.totalCell, s.tableCellNumber]}>
								الإجمالي (شامل الضريبة)
							</Text>
						</View>

						{items.map((it, i) => {
							const qty = Number(it.quantity) || 0;
							const unitPrice = Number(it.unit_price) || 0;
							const lineNet = qty * unitPrice;
							const lineVat = lineNet * (taxRate / 100);
							const lineTotal = lineNet + lineVat;

							return (
								<View
									key={i}
									style={[
										s.tableRow,
										i % 2 === 1 ? s.tableRowZebra : {},
									]}
								>
									<Text style={[s.tableCell, s.indexCell]}>{i + 1}</Text>
									<Text style={[s.tableCell, s.descriptionCell]}>
										{safeString(it.description || "-")}
									</Text>
									<Text style={[s.tableCell, s.quantityCell, s.tableCellCenter]}>
										{safeString(qty)}
									</Text>
									<Text style={[s.tableCell, s.unitPriceCell, s.tableCellNumber]}>
										{formatCurrency(unitPrice)}
									</Text>
									<Text style={[s.tableCell, s.taxRateCell, s.tableCellCenter]}>
										{taxRate}%
									</Text>
									<Text style={[s.tableCell, s.taxAmountCell, s.tableCellNumber]}>
										{formatCurrency(lineVat)}
									</Text>
									<Text style={[s.tableCell, s.totalCell, s.tableCellNumber]}>
										{formatCurrency(lineTotal)}
									</Text>
								</View>
							);
						})}
					</View>
				</View>

				{/* Totals */}
				<View style={s.section}>
					<Text style={s.sectionTitle}>الإجمالي</Text>
					<View style={s.totalsCard}>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>المجموع الفرعي (بدون ضريبة):</Text>
							<Text style={s.totalValue}>{formatCurrency(subtotal)}</Text>
						</View>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>
								مجموع الضريبة ({taxRate}%):
							</Text>
							<Text style={s.totalValue}>{formatCurrency(vatAmount)}</Text>
						</View>
						<View style={s.totalDivider} />
						<View style={s.finalTotal}>
							<Text style={s.finalTotalLabel}>الإجمالي المستحق:</Text>
							<Text style={s.finalTotalValue}>{formatCurrency(totalAmount)}</Text>
						</View>
					</View>
				</View>

				{/* Notes */}
				{invoice.notes && (
					<View style={s.notes}>
						<Text style={s.notesLabel}>ملاحظات:</Text>
						<Text style={s.notesText}>{safeString(invoice.notes)}</Text>
					</View>
				)}

				{/* Footer */}
				<View style={s.footer}>
					<Text style={s.footerText}>
						صُنعت هذه الفاتورة بواسطة منصة بيلفورة - النظام المعتمد لإصدار
						الفواتير الاحترافية.
					</Text>
				</View>
			</Page>
		</Document>
	);
}

