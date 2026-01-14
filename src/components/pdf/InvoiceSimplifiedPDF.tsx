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

interface InvoiceSimplifiedPDFProps {
	invoice: InvoiceWithClientAndItems;
	client: Client | null;
	items: InvoiceItem[];
	qrDataUrl?: string | null;
	sellerInfo: SellerInfo;
}

export function InvoiceSimplifiedPDF({
	invoice,
	client,
	items,
	qrDataUrl,
	sellerInfo,
}: InvoiceSimplifiedPDFProps) {
	// Calculate totals
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
				<View style={{ marginBottom: 20, alignItems: "center" }}>
					<Text style={{ fontSize: 24, fontWeight: "bold", color: "#012d46", marginBottom: 8 }}>
						فاتورة ضريبية مبسطة
					</Text>
					<Text style={{ fontSize: 12, color: "#6B7280" }}>
						رقم الفاتورة: {safeString(invoice.invoice_number || invoice.id)}
					</Text>
					<View style={{ marginTop: 4 }}>
						<Text style={{ fontSize: 10, color: "#6B7280" }}>
							تاريخ الإصدار: {formatDate(invoice.issue_date)}
						</Text>
						{invoice.issue_date && (
							<Text style={{ fontSize: 9, color: "#6B7280", marginTop: 1 }}>
								الموافق: {convertToHijri(invoice.issue_date).formattedHijri}
							</Text>
						)}
					</View>
				</View>

				{/* Seller Info */}
				<View style={{ marginBottom: 16, padding: 12, backgroundColor: "#F9FAFB", borderRadius: 6 }}>
					<Text style={{ fontSize: 12, fontWeight: "bold", color: "#012d46", marginBottom: 6 }}>
						معلومات البائع
					</Text>
					<Text style={{ fontSize: 10, color: "#374151", marginBottom: 2 }}>
						{safeString(sellerInfo.name)}
					</Text>
					<Text style={{ fontSize: 9, color: "#6B7280", marginBottom: 2 }}>
						{safeString(sellerInfo.address)}
					</Text>
					<Text style={{ fontSize: 9, color: "#6B7280" }}>
						الرقم الضريبي: {safeString(sellerInfo.vatNumber)}
					</Text>
				</View>

				{/* Buyer Info */}
				{client && (
					<View style={{ marginBottom: 16, padding: 12, backgroundColor: "#F9FAFB", borderRadius: 6 }}>
						<Text style={{ fontSize: 12, fontWeight: "bold", color: "#012d46", marginBottom: 6 }}>
							معلومات المشتري
						</Text>
						<Text style={{ fontSize: 10, color: "#374151", marginBottom: 2 }}>
							{safeString(client.name)}
						</Text>
						{client.email && (
							<Text style={{ fontSize: 9, color: "#6B7280", marginBottom: 2 }}>
								{safeString(client.email)}
							</Text>
						)}
					</View>
				)}

				{/* Items Table (Simplified) */}
				<View style={{ marginBottom: 16 }}>
					<View style={s.table}>
						<View style={[s.tableHeader, { flexDirection: "row" }]}>
							<Text style={[s.tableHeaderCell, { width: "50%" }]}>الوصف</Text>
							<Text style={[s.tableHeaderCell, { width: "15%", textAlign: "center" }]}>
								الكمية
							</Text>
							<Text style={[s.tableHeaderCell, { width: "35%", textAlign: "left" }]}>
								السعر (شامل الضريبة)
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
									<Text style={[s.tableCell, { width: "50%" }]}>
										{safeString(it.description || "-")}
									</Text>
									<Text style={[s.tableCell, { width: "15%", textAlign: "center" }]}>
										{safeString(qty)}
									</Text>
									<Text style={[s.tableCell, { width: "35%", textAlign: "left", fontFamily: "Helvetica" }]}>
										{formatCurrency(lineTotal)}
									</Text>
								</View>
							);
						})}
					</View>
				</View>

				{/* Totals */}
				<View style={{ marginBottom: 20 }}>
					<View style={s.totalsCard}>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>إجمالي المبلغ الخاضع للضريبة:</Text>
							<Text style={s.totalValue}>{formatCurrency(subtotal)}</Text>
						</View>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>ضريبة القيمة المضافة ({taxRate}%):</Text>
							<Text style={s.totalValue}>{formatCurrency(vatAmount)}</Text>
						</View>
						<View style={s.totalDivider} />
						<View style={s.finalTotal}>
							<Text style={s.finalTotalLabel}>المجموع مع الضريبة ({taxRate}%):</Text>
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
							رمز الاستجابة السريعة
						</Text>
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

