"use client";

import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";
import type { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";
import {
	baseStyles as s,
	safeText,
	formatCurrency,
	formatDateTime,
} from "./sharedStyles";
import { convertToHijri } from "@/lib/dateConvert";

interface InvoicePDF_SimplifiedProps {
	invoice: InvoiceWithClientAndItems;
	client: Client | null;
	items: InvoiceItem[];
	qrDataUrl?: string | null;
	invoiceSettings: InvoiceSettings;
}

export function InvoicePDF_Simplified({
	invoice,
	client,
	items,
	qrDataUrl,
	invoiceSettings,
}: InvoicePDF_SimplifiedProps) {
	const sellerName = invoiceSettings.name;
	const vatNumber = invoiceSettings.tax_number;
	const address = [invoiceSettings.address_line1, invoiceSettings.city].filter(Boolean).join("، ");
	const crNumber = null;
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
				{/* Header */}
				<View style={{ marginBottom: 20, alignItems: "center" }}>
					<Text style={{ fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 8, textAlign: 'center' }}>
						Simplified Tax Invoice / فاتورة ضريبية مبسطة
					</Text>
					<Text style={{ fontSize: 10, color: "#6B7280", marginBottom: 4 }}>
						Invoice No / رقم الفاتورة: {safeText(invoice.invoice_number || invoice.id)}
					</Text>
					<View style={{ marginBottom: 2, alignItems: 'center' }}>
						<Text style={{ fontSize: 10, color: "#6B7280" }}>
							Issue Date / تاريخ الإصدار: {formatDateTime(invoice.issue_date)}
						</Text>
						{invoice.issue_date && (
							<Text style={{ fontSize: 9, color: "#6B7280", marginTop: 1 }}>
								{convertToHijri(invoice.issue_date).formattedHijri}
							</Text>
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
				{client && (
					<View style={s.infoSection}>
						<Text style={s.infoSectionTitle}>Buyer Information / معلومات البائع</Text>
						<View style={s.infoBox}>
							<View style={s.infoRow}>
								<Text style={s.infoLabel}>Name / الاسم:</Text>
								<Text style={s.infoValue}>{safeText(client.name)}</Text>
							</View>
							{client.email && (
								<View style={s.infoRow}>
									<Text style={s.infoLabel}>Email / البريد:</Text>
									<Text style={s.infoValue}>{safeText(client.email)}</Text>
								</View>
							)}
						</View>
					</View>
				)}

				{/* Line Items Table (Simplified) */}
				<View style={s.table}>
					<View style={s.tableHeader}>
						<View style={s.colDescSimple}>
							<Text style={s.tableHeaderCell}>Description / الوصف</Text>
						</View>
						<View style={s.colQtySimple}>
							<Text style={[s.tableHeaderCell, s.tableCellCenter]}>Qty / الكمية</Text>
						</View>
						<View style={s.colPriceSimple}>
							<Text style={[s.tableHeaderCell, s.tableCellNumber]}>
								Price (Inc. VAT) / السعر (شامل الضريبة)
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
							<Text style={s.totalLabel}>Total Taxable / الخاضع للضريبة:</Text>
							<Text style={s.totalValue}>{formatCurrency(subtotal)}</Text>
						</View>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>
								VAT ({taxRate}%) / الضريبة:
							</Text>
							<Text style={s.totalValue}>{formatCurrency(vatAmount)}</Text>
						</View>
						<View style={s.totalDivider} />
						<View style={s.finalTotalRow}>
							<Text style={s.finalTotalLabel}>
								Total / الإجمالي:
							</Text>
							<Text style={s.finalTotalValue}>{formatCurrency(totalAmount)}</Text>
						</View>
					</View>
				</View>

				{/* QR Code */}
				{qrDataUrl && (
					<View style={{ alignItems: "center", marginTop: 20 }}>
						{/* eslint-disable-next-line jsx-a11y/alt-text */}
						<Image src={qrDataUrl} style={{ width: 100, height: 100 }} />
						<Text style={{ fontSize: 8, color: "#6B7280", marginTop: 4 }}>
							QR Code / رمز الاستجابة السريعة
						</Text>
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

