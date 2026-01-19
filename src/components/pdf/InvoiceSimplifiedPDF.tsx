/* eslint-disable jsx-a11y/alt-text */
"use client";

import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";
import { premiumStyles as s, safeText, formatCurrency, formatDate, formatLtrNumber } from "./sharedStyles";
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

				{/* --- Header Section (Row Reverse: Child 1 Right, Child 2 Left) --- */}
				<View style={s.header}>
					{/* Child 1: Logo & Company Info -> Visual Right */}
					<View style={s.headerSide}>
						{sellerInfo.logoUrl ? (
							<Image src={sellerInfo.logoUrl} style={{ width: 80, height: 80, marginBottom: 10, borderRadius: 4 }} />
						) : (
							<View style={{ width: 60, height: 60, backgroundColor: "#012d46", borderRadius: 4, marginBottom: 10 }} />
						)}
						<Text style={[s.textXl, s.bold, s.textPrimary]}>{safeText(sellerInfo.name)}</Text>
						<Text style={s.textSecondary}>{safeText(sellerInfo.address)}</Text>
						<Text style={[s.textSecondary, s.textXs]}>سجل تجاري: {formatLtrNumber(sellerInfo.crNumber)}</Text>
						<Text style={[s.textSecondary, s.textXs]}>الرقم الضريبي: {formatLtrNumber(sellerInfo.vatNumber)}</Text>
					</View>

					{/* Child 2: Invoice Meta -> Visual Left */}
					<View style={s.headerSideLeft}>
						<Text style={s.invoiceTitle}>فاتورة ضريبية</Text>
						<Text style={[s.textSecondary, s.textSm]}>Tax Invoice</Text>

						<View style={s.invoiceBadge}>
							<Text style={s.bold}>#{formatLtrNumber(invoiceNumber)}</Text>
						</View>

						<View style={{ marginTop: 12, alignItems: 'flex-start' }}>
							<Text style={s.textSm}>تاريخ الإصدار: {formatDate(invoice.issue_date)}</Text>
							<Text style={[s.textXs, s.textSecondary]}>{hijriDate}</Text>
						</View>
					</View>
				</View>

				{/* --- Info Grid (Row Reverse: Child 1 Right, Child 2 Left) --- */}
				<View style={s.gridContainer}>
					{/* Child 1: Seller (From) -> Visual Right */}
					<View style={s.card}>
						<Text style={s.cardTitle}>من (المصدر)</Text>
						<View style={s.cardContent}>
							<Text style={[s.bold, s.textPrimary]}>{safeText(sellerInfo.name)}</Text>
							<Text style={s.textSm}>{safeText(sellerInfo.address)}</Text>
							<Text style={s.textSm}>الرقم الضريبي: {formatLtrNumber(sellerInfo.vatNumber)}</Text>
						</View>
					</View>

					{/* Child 2: Buyer (To) -> Visual Left */}
					<View style={s.card}>
						<Text style={s.cardTitle}>إلى (العميل)</Text>
						<View style={s.cardContent}>
							{client ? (
								<>
									<Text style={[s.bold, s.textPrimary]}>{safeText(client.name)}</Text>
									<Text style={s.textSm}>{safeText(client.address)}</Text>
									{client.tax_number && (
										<Text style={s.textSm}>الرقم الضريبي: {formatLtrNumber(client.tax_number)}</Text>
									)}
								</>
							) : (
								<Text style={s.textSecondary}>عميل نقدي</Text>
							)}
						</View>
					</View>
				</View>

				{/* --- Items Table (Row Reverse: Child 1 Right -> Child N Left) --- */}
				{/* Order: Index -> Desc -> Qty -> Price -> Total */}
				<View style={s.table}>
					{/* Header */}
					<View style={s.tableHeader}>
						<Text style={[s.tableHeaderCell, s.colIndex]}>#</Text>
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

						return (
							<View key={i} style={[s.tableRow, i % 2 === 0 ? {} : s.tableRowZebra]}>
								<Text style={[s.tableCell, s.colIndex]}>{formatLtrNumber(i + 1)}</Text>
								<Text style={[s.tableCell, s.colDesc]}>{safeText(it.description || "item")}</Text>
								<Text style={[s.tableCell, s.colQty, { fontFamily: 'Helvetica' }]}>{formatLtrNumber(qty)}</Text> {/* Helvetica for pure numbers inside? Or LTR? */}
								<Text style={[s.tableCell, s.colPrice]}>{formatCurrency(unitPrice)}</Text>
								<Text style={[s.tableCell, s.colTotal]}>{formatCurrency(lineNet)}</Text>
							</View>
						);
					})}
				</View>

				{/* --- Totals & Notes (Row Reverse: Child 1 Right, Child 2 Left) --- */}
				<View style={s.totalsContainer}>
					{/* Child 1: Notes/QR -> Visual Right */}
					<View style={s.notesContainer}>
						{qrDataUrl && (
							<View style={s.qrCodeContainer}>
								<Image src={qrDataUrl} style={s.qrCodeImage} />
							</View>
						)}
					</View>

					{/* Child 2: Totals -> Visual Left */}
					<View style={s.totalsCard}>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>المجموع الفرعي (Subtotal)</Text>
							<Text style={s.totalValue}>{formatCurrency(subtotal)}</Text>
						</View>
						<View style={s.totalRow}>
							<Text style={s.totalLabel}>ضريبة القيمة المضافة ({formatLtrNumber(taxRate)}%)</Text>
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
		</Document >
	);
}
