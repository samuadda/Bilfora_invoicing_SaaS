"use client";

import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";
import { baseStyles as s, safeText, formatCurrency, formatDate } from "./sharedStyles";
import { convertToHijri } from "@/lib/dateConvert";

interface SellerInfo {
	name: string;
	crNumber: string;
	vatNumber: string;
	address: string;
	logoUrl?: string;
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

	// Prepare data
	const invoiceNumber = invoice.invoice_number || invoice.id?.slice(0, 8).toUpperCase();
	const issueDate = formatDate(invoice.issue_date);
	const hijriDate = invoice.issue_date ? convertToHijri(invoice.issue_date).formattedHijri : "";

	return (
		<Document>
			<Page size="A4" style={s.page}>

				{/* --- Header Section --- */}
				<View style={s.header}>
					{/* Valid Right (Source First in RTL) -> Company Info */}
					<View style={s.headerRight}>
						{sellerInfo.logoUrl ? (
							<Image src={sellerInfo.logoUrl} style={{ width: 80, height: 80, marginBottom: 10, borderRadius: 4 }} />
						) : (
							<View style={{ width: 60, height: 60, backgroundColor: "#012d46", borderRadius: 4, marginBottom: 10 }} />
						)}
						<Text style={[s.textXl, s.bold, s.textPrimary]}>{safeText(sellerInfo.name)}</Text>
						<Text style={s.textSecondary}>{safeText(sellerInfo.address)}</Text>
						<Text style={[s.textSecondary, s.textXs]}>سجل تجاري: {safeText(sellerInfo.crNumber)}</Text>
						<Text style={[s.textSecondary, s.textXs]}>الرقم الضريبي: {safeText(sellerInfo.vatNumber)}</Text>
					</View>

					{/* Visual Left (Source Second in RTL) -> Invoice Details */}
					<View style={s.headerLeft}>
						<Text style={s.invoiceTitle}>فاتورة ضريبية</Text>
						<Text style={[s.textSecondary, s.textSm]}>Tax Invoice</Text>

						<View style={s.invoiceBadge}>
							<Text style={s.bold}>#{invoiceNumber}</Text>
						</View>

						<View style={{ marginTop: 12, alignItems: 'flex-end' }}>
							<Text style={s.textSm}>تاريخ الإصدار: {issueDate}</Text>
							<Text style={[s.textXs, s.textSecondary]}>{hijriDate}</Text>
						</View>
					</View>
				</View>

				{/* --- Info Grid (Bill To / Bill From) --- */}
				<View style={s.gridContainer}>
					{/* Client Info (Right in RTL flow? No, we typically want Seller Right, Buyer Left) 
					    If we want Buyer on Left (Visual), it should be 2nd child. */
					}

					{/* Seller Card (Visual Right) */}
					<View style={s.card}>
						<Text style={s.cardTitle}>من (المصدر)</Text>
						<View style={s.cardContent}>
							<Text style={[s.bold, s.textPrimary]}>{safeText(sellerInfo.name)}</Text>
							<Text style={s.textSm}>{safeText(sellerInfo.address)}</Text>
							<Text style={s.textSm}>الرقم الضريبي: {safeText(sellerInfo.vatNumber)}</Text>
						</View>
					</View>

					{/* Buyer Card (Visual Left) */}
					<View style={s.card}>
						<Text style={s.cardTitle}>إلى (العميل)</Text>
						<View style={s.cardContent}>
							{client ? (
								<>
									<Text style={[s.bold, s.textPrimary]}>{safeText(client.name)}</Text>
									<Text style={s.textSm}>{safeText(client.address)}</Text>
									{client.vat_number && (
										<Text style={s.textSm}>الرقم الضريبي: {safeText(client.vat_number)}</Text>
									)}
								</>
							) : (
								<Text style={s.textSecondary}>عميل نقدي</Text>
							)}
						</View>
					</View>
				</View>

				{/* --- Items Table --- */}
				<View style={s.table}>
					{/* Header */}
					<View style={s.tableHeader}>
						<Text style={[s.tableHeaderCell, s.colDesc]}>الوصف / Description</Text>
						<Text style={[s.tableHeaderCell, s.colQty]}>الكمية</Text>
						<Text style={[s.tableHeaderCell, s.colPrice]}>سعر الوحدة</Text>
						<Text style={[s.tableHeaderCell, s.colTotal]}>المجموع</Text>
					</View>

					{/* Rows */}
					{items.map((it, i) => {
						const qty = Number(it.quantity) || 0;
						const unitPrice = Number(it.unit_price) || 0;
						const lineNet = qty * unitPrice;
						// Typically tax is calculated per line for precision, or total. Keeping simple logic.

						return (
							<View key={i} style={[s.tableRow, i % 2 === 0 ? {} : s.tableRowZebra]}>
								<Text style={[s.tableCell, s.colDesc]}>{safeText(it.description || "item")}</Text>
								<Text style={[s.tableCell, s.colQty, { fontFamily: 'Helvetica' }]}>{qty}</Text>
								<Text style={[s.tableCell, s.colPrice, { fontFamily: 'Helvetica' }]}>{formatCurrency(unitPrice)}</Text>
								<Text style={[s.tableCell, s.colTotal, { fontFamily: 'Helvetica' }]}>{formatCurrency(lineNet)}</Text>
							</View>
						);
					})}
				</View>

				{/* --- Totals & Notes --- */}
				<View style={s.totalsContainer}>
					{/* Notes (Visual Right) */}
					<View style={s.notesContainer}>
						{qrDataUrl && (
							<View style={s.qrCodeContainer}>
								<Image src={qrDataUrl} style={s.qrCodeImage} />
							</View>
						)}
						{/* Bank details could go here */}
					</View>

					{/* Totals (Visual Left) */}
					<View style={s.totalsCard}>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>المجموع الفرعي (Subtotal)</Text>
							<Text style={s.totalValue}>{formatCurrency(subtotal)}</Text>
						</View>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>ضريبة القيمة المضافة ({taxRate}%)</Text>
							<Text style={s.totalValue}>{formatCurrency(vatAmount)}</Text>
						</View>
						<View style={s.finalTotalRow}>
							<Text style={s.finalTotalLabel}>الإجمالي المستحق</Text>
							<Text style={s.finalTotalValue}>{formatCurrency(totalAmount)}</Text>
						</View>
					</View>
				</View>

				{/* --- Footer --- */}
				<View style={s.footer}>
					<Text style={s.footerText}>Thank you for your business</Text>
					<Text style={s.footerText}>تم إصدار الفاتورة إلكترونياً</Text>
					<Text style={s.footerText}>Page 1 of 1</Text>
				</View>

			</Page>
		</Document>
	);
}
