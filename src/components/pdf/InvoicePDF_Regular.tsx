"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";
import type { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";
import {
	baseStyles as s,
	safeText,
	formatCurrency,
	formatDate,
} from "./sharedStyles";
import { convertToHijri } from "@/lib/dateConvert";

interface InvoicePDF_RegularProps {
	invoice: InvoiceWithClientAndItems;
	client: Client | null;
	items: InvoiceItem[];
	invoiceSettings: InvoiceSettings;
}

export function InvoicePDF_Regular({
	invoice,
	client,
	items,
	invoiceSettings,
}: InvoicePDF_RegularProps) {
	const sellerName = invoiceSettings.name;
	const vatNumber = invoiceSettings.tax_number;
	const crNumber = null;
	const address = [invoiceSettings.address_line1, invoiceSettings.city].filter(Boolean).join("، ");
	const iban = invoiceSettings.iban;

	// Calculate totals (no VAT)
	const subtotal = items.reduce(
		(sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
		0
	);
	const totalAmount = subtotal;

	return (
		<Document>
			<Page size="A4" style={s.page}>
				{/* Header */}
				<View style={s.header}>
					<View style={s.headerLeft}>
						<Text style={s.invoiceTitle}>فاتورة</Text>
						<Text style={s.invoiceMeta}>
							رقم الفاتورة: {safeText(invoice.invoice_number || invoice.id)}
						</Text>
						<View style={{ marginBottom: 8 }}>
							<Text style={s.invoiceMeta}>
								تاريخ الإصدار: {formatDate(invoice.issue_date)}
							</Text>
							{invoice.issue_date && (
								<Text style={{ fontSize: 9, color: "#6B7280", marginTop: 2 }}>
									الموافق: {convertToHijri(invoice.issue_date).formattedHijri}
								</Text>
							)}
						</View>
						<View style={{ marginBottom: 8 }}>
							<Text style={s.invoiceMeta}>
								تاريخ الاستحقاق: {formatDate(invoice.due_date)}
							</Text>
							{invoice.due_date && (
								<Text style={{ fontSize: 9, color: "#6B7280", marginTop: 1 }}>
									الموافق: {convertToHijri(invoice.due_date).formattedHijri}
								</Text>
							)}
						</View>
					</View>
				</View>

				{/* Seller Information */}
				<View style={s.infoSection}>
					<Text style={s.infoSectionTitle}>معلومات البائع</Text>
					<View style={s.infoBox}>
						{sellerName && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>الاسم:</Text>
								<Text style={s.infoValue}>{safeText(sellerName)}</Text>
							</View>
						)}
						{crNumber && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>الرقم التجاري:</Text>
								<Text style={s.infoValue}>{safeText(crNumber)}</Text>
							</View>
						)}
						{vatNumber && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>الرقم الضريبي:</Text>
								<Text style={s.infoValue}>{safeText(vatNumber)}</Text>
							</View>
						)}
						{address && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>العنوان:</Text>
								<Text style={s.infoValue}>{safeText(address)}</Text>
							</View>
						)}
						{iban && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>الآيبان:</Text>
								<Text style={s.infoValue}>{safeText(iban)}</Text>
							</View>
						)}
					</View>
				</View>

				{/* Buyer Information */}
				<View style={s.infoSection}>
					<Text style={s.infoSectionTitle}>معلومات العميل</Text>
					<View style={s.infoBox}>
						<View style={s.infoRow}>
							<Text style={s.infoLabel}>الاسم:</Text>
							<Text style={s.infoValue}>{safeText(client?.name || "—")}</Text>
						</View>
						{client?.company_name && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>اسم الشركة:</Text>
								<Text style={s.infoValue}>{safeText(client.company_name)}</Text>
							</View>
						)}
						{client?.email && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>البريد الإلكتروني:</Text>
								<Text style={s.infoValue}>{safeText(client.email)}</Text>
							</View>
						)}
						{client?.phone && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>الهاتف:</Text>
								<Text style={s.infoValue}>{safeText(client.phone)}</Text>
							</View>
						)}
						{client?.address && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>العنوان:</Text>
								<Text style={s.infoValue}>
									{safeText(client.address)}
									{client?.city ? `، ${safeText(client.city)}` : null}
								</Text>
							</View>
						)}
					</View>
				</View>

				{/* Line Items Table */}
				<View style={s.table}>
					<View style={s.tableHeader}>
						<View style={s.colIndex}>
							<Text style={s.tableHeaderCell}>#</Text>
						</View>
						<View style={s.colDescSimple}>
							<Text style={s.tableHeaderCell}>الوصف</Text>
						</View>
						<View style={s.colQtySimple}>
							<Text style={[s.tableHeaderCell, s.tableCellCenter]}>الكمية</Text>
						</View>
						<View style={s.colPriceSimple}>
							<Text style={s.tableHeaderCell}>
								سعر الوحدة
							</Text>
						</View>
						<View style={s.colTotal}>
							<Text style={s.tableHeaderCell}>الإجمالي</Text>
						</View>
					</View>

					{items.map((item, index) => {
						const qty = Number(item.quantity) || 0;
						const unitPrice = Number(item.unit_price) || 0;
						const lineTotal = qty * unitPrice;

						return (
							<View
								key={item.id || index}
								style={[s.tableRow, index % 2 === 1 ? s.tableRowAlt : {}]}
							>
								<View style={s.colIndex}>
									<Text style={s.tableCell}>{index + 1}</Text>
								</View>
								<View style={s.colDescSimple}>
									<Text style={s.tableCell}>
										{safeText(item.description)}
									</Text>
								</View>
								<View style={s.colQtySimple}>
									<Text style={[s.tableCell, s.tableCellCenter]}>
										{safeText(qty)}
									</Text>
								</View>
								<View style={s.colPriceSimple}>
									<Text style={s.tableCellNumber}>
										{formatCurrency(unitPrice)}
									</Text>
								</View>
								<View style={s.colTotal}>
									<Text style={s.tableCellNumber}>
										{formatCurrency(lineTotal)}
									</Text>
								</View>
							</View>
						);
					})}
				</View>

				{/* Totals Section */}
				<View style={s.totalsSection}>
					<View style={s.totalsBox}>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>المجموع الفرعي:</Text>
							<Text style={s.totalValue}>{formatCurrency(subtotal)}</Text>
						</View>
						<View style={s.totalDivider} />
						<View style={s.finalTotalRow}>
							<Text style={s.finalTotalLabel}>الإجمالي:</Text>
							<Text style={s.finalTotalValue}>{formatCurrency(totalAmount)}</Text>
						</View>
					</View>
				</View>

				{/* Notes */}
				{invoice.notes && (
					<View style={s.notesSection}>
						<Text style={s.notesLabel}>ملاحظات:</Text>
						<Text style={s.notesText}>{safeText(invoice.notes)}</Text>
					</View>
				)}

				{/* Footer */}
				<View style={s.footer}>
					<Text style={s.footerText}>
						صُنعت هذه الفاتورة بواسطة منصة بيلفورة
					</Text>
				</View>
			</Page>
		</Document>
	);
}

