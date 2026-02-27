"use client";

import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";
import type { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";
import {
	baseStyles as s,
	safeText,
	formatCurrency,
	formatDate,
} from "./sharedStyles";
import { convertToHijri } from "@/lib/dateConvert";

interface InvoicePDF_TaxProps {
	invoice: InvoiceWithClientAndItems;
	client: Client | null;
	items: InvoiceItem[];
	qrDataUrl?: string | null;
	invoiceSettings: InvoiceSettings;
}

export function InvoicePDF_Tax({
	invoice,
	client,
	items,
	qrDataUrl,
	invoiceSettings,
}: InvoicePDF_TaxProps) {
	const sellerName = invoiceSettings.name;
	const vatNumber = invoiceSettings.tax_number;
	const crNumber = null;
	const address = [invoiceSettings.address_line1, invoiceSettings.city].filter(Boolean).join("، ");
	const iban = invoiceSettings.iban;

	// Calculate totals
	const subtotal = items.reduce(
		(sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
		0
	);
	const taxRate = Number(invoice.tax_rate || 15);
	const vatAmount = subtotal * (taxRate / 100);
	const totalAmount = subtotal + vatAmount;

	return (
		<Document>
			<Page size="A4" style={s.page}>
				{/* Header with QR Code */}
				<View style={s.header}>
					<View style={s.headerLeft}>
						<Text style={s.invoiceTitle}>Tax Invoice / فاتورة ضريبية</Text>
						<Text style={s.invoiceMeta}>
							Invoice No / رقم الفاتورة: {safeText(invoice.invoice_number || invoice.id)}
						</Text>
						<View style={{ marginBottom: 2 }}>
							<Text style={s.invoiceMeta}>
								Issue Date / تاريخ الإصدار: {formatDate(invoice.issue_date)}
							</Text>
							{invoice.issue_date && (
								<Text style={{ fontSize: 9, color: "#6B7280", marginTop: 1 }}>
									{convertToHijri(invoice.issue_date).formattedHijri}
								</Text>
							)}
						</View>
						<View style={{ marginBottom: 2 }}>
							<Text style={s.invoiceMeta}>
								Due Date / تاريخ الاستحقاق: {formatDate(invoice.due_date)}
							</Text>
							{invoice.due_date && (
								<Text style={{ fontSize: 9, color: "#6B7280", marginTop: 1 }}>
									{convertToHijri(invoice.due_date).formattedHijri}
								</Text>
							)}
						</View>
					</View>
					<View style={s.headerRight}>
						{qrDataUrl && (
							<View style={s.qrContainer}>
								{/* eslint-disable-next-line jsx-a11y/alt-text */}
								<Image src={qrDataUrl} style={s.qrImage} />
								<Text style={s.qrLabel}>QR Code / رمز الاستجابة السريعة</Text>
							</View>
						)}
					</View>
				</View>

				{/* Seller Information */}
				<View style={s.infoSection}>
					<Text style={s.infoSectionTitle}>Seller Information / معلومات البائع</Text>
					<View style={s.infoBox}>
						{sellerName && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>Name / الاسم:</Text>
								<Text style={s.infoValue}>{safeText(sellerName)}</Text>
							</View>
						)}
						{crNumber && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>CR No / الرقم التجاري:</Text>
								<Text style={s.infoValue}>{safeText(crNumber)}</Text>
							</View>
						)}
						{vatNumber && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>VAT No / الرقم الضريبي:</Text>
								<Text style={s.infoValue}>{safeText(vatNumber)}</Text>
							</View>
						)}
						{address && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>Address / العنوان:</Text>
								<Text style={s.infoValue}>{safeText(address)}</Text>
							</View>
						)}
						{iban && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>IBAN / الآيبان:</Text>
								<Text style={s.infoValue}>{safeText(iban)}</Text>
							</View>
						)}
					</View>
				</View>

				{/* Buyer Information */}
				<View style={s.infoSection}>
					<Text style={s.infoSectionTitle}>Buyer Information / معلومات البائع</Text>
					<View style={s.infoBox}>
						<View style={s.infoRow}>
							<Text style={s.infoLabel}>Name / الاسم:</Text>
							<Text style={s.infoValue}>{safeText(client?.name || "—")}</Text>
						</View>
						{client?.company_name && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>Company / اسم الشركة:</Text>
								<Text style={s.infoValue}>{safeText(client.company_name)}</Text>
							</View>
						)}
						{client?.tax_number && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>VAT No / الرقم الضريبي:</Text>
								<Text style={s.infoValue}>{safeText(client.tax_number)}</Text>
							</View>
						)}
						{client?.address && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>Address / العنوان:</Text>
								<Text style={s.infoValue}>
									{safeText(client.address)}
									{client?.city ? `، ${safeText(client.city)}` : null}
								</Text>
							</View>
						)}
						{client?.email && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>Email / البريد الإلكتروني:</Text>
								<Text style={s.infoValue}>{safeText(client.email)}</Text>
							</View>
						)}
						{client?.phone && (
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>Phone / الهاتف:</Text>
								<Text style={s.infoValue}>{safeText(client.phone)}</Text>
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
						<View style={s.colDescription}>
							<Text style={s.tableHeaderCell}>Description / الوصف</Text>
						</View>
						<View style={s.colQuantity}>
							<Text style={[s.tableHeaderCell, s.tableCellCenter]}>Qty / الكمية</Text>
						</View>
						<View style={s.colUnitPrice}>
							<Text style={[s.tableHeaderCell, s.tableCellNumber]}>
								Unit Price / سعر الوحدة
							</Text>
						</View>
						<View style={s.colTaxRate}>
							<Text style={[s.tableHeaderCell, s.tableCellCenter]}>
								VAT % / الضريبة
							</Text>
						</View>
						<View style={s.colTaxAmount}>
							<Text style={[s.tableHeaderCell, s.tableCellNumber]}>
								VAT Amount / مبلغ الضريبة
							</Text>
						</View>
						<View style={s.colTotal}>
							<Text style={[s.tableHeaderCell, s.tableCellNumber]}>
								Total / الإجمالي
							</Text>
						</View>
					</View>

					{items.map((item, index) => {
						const qty = Number(item.quantity) || 0;
						const unitPrice = Number(item.unit_price) || 0;
						const lineSubtotal = qty * unitPrice;
						const lineVat = lineSubtotal * (taxRate / 100);
						const lineTotal = lineSubtotal + lineVat;

						return (
							<View
								key={item.id || index}
								style={[s.tableRow, index % 2 === 1 ? s.tableRowAlt : {}]}
							>
								<View style={s.colIndex}>
									<Text style={s.tableCell}>{index + 1}</Text>
								</View>
								<View style={s.colDescription}>
									<Text style={s.tableCell}>
										{safeText(item.description)}
									</Text>
								</View>
								<View style={s.colQuantity}>
									<Text style={[s.tableCell, s.tableCellCenter]}>
										{safeText(qty)}
									</Text>
								</View>
								<View style={s.colUnitPrice}>
									<Text style={s.tableCellNumber}>
										{formatCurrency(unitPrice)}
									</Text>
								</View>
								<View style={s.colTaxRate}>
									<Text style={[s.tableCell, s.tableCellCenter]}>
										{safeText(taxRate)}%
									</Text>
								</View>
								<View style={s.colTaxAmount}>
									<Text style={s.tableCellNumber}>
										{formatCurrency(lineVat)}
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
							<Text style={s.totalLabel}>Subtotal / المجموع الفرعي:</Text>
							<Text style={s.totalValue}>{formatCurrency(subtotal)}</Text>
						</View>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>
								VAT ({taxRate}%) / ضريبة القيمة المضافة:
							</Text>
							<Text style={s.totalValue}>{formatCurrency(vatAmount)}</Text>
						</View>
						<View style={s.totalDivider} />
						<View style={s.finalTotalRow}>
							<Text style={s.finalTotalLabel}>Grand Total / الإجمالي المستحق:</Text>
							<Text style={s.finalTotalValue}>{formatCurrency(totalAmount)}</Text>
						</View>
					</View>
				</View>

				{/* Notes */}
				{invoice.notes && (
					<View style={s.notesSection}>
						<Text style={s.notesLabel}>Notes / ملاحظات:</Text>
						<Text style={s.notesText}>{safeText(invoice.notes)}</Text>
					</View>
				)}

				{/* Footer */}
				<View style={s.footer}>
					<Text style={s.footerText}>
						Generated by Bilfora / صُنعت هذه الفاتورة بواسطة منصة بيلفورة
					</Text>
				</View>
			</Page>
		</Document>
	);
}

