import { Font, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency as libFormatCurrency, formatDate as libFormatDate, formatDateTime as libFormatDateTime } from "@/lib/formatters";

// Register IBM Plex Sans Arabic font for a premium, modern look
// Font source: https://github.com/IBM/plex
try {
	Font.register({
		family: "IBM Plex Sans Arabic",
		fonts: [
			{
				src: "/fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Regular.ttf",
				fontWeight: "normal",
			},
			{
				src: "/fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Bold.ttf",
				fontWeight: "bold",
			},
		],
	});
} catch (err) {
	console.warn("Failed to register IBM Plex Sans Arabic font", err);
}

export const premiumStyles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 40,
		fontSize: 10,
		fontFamily: "Markazi", // TODO: Switch to "IBM Plex Sans Arabic" after downloading the font files
		lineHeight: 1.6,
		direction: "rtl",
		color: "#334155", // slate-700
	},
	// Utility
	bold: { fontWeight: "bold" },
	textSm: { fontSize: 9 },
	textXs: { fontSize: 8 },
	textLg: { fontSize: 12 },
	textXl: { fontSize: 14 },
	text2Xl: { fontSize: 20 },

	// Colors
	textPrimary: { color: "#0f172a" }, // slate-900
	textSecondary: { color: "#64748b" }, // slate-500
	bgGray: { backgroundColor: "#f8fafc" }, // slate-50

	// Layout
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 32,
		alignItems: "flex-start",
	},
	headerLeft: {
		flexDirection: "column",
		alignItems: "flex-start",
		width: "50%",
	},
	headerRight: {
		flexDirection: "column",
		alignItems: "flex-end",
		width: "50%",
	},

	// Brand
	invoiceTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#012d46", // Bilfora Brand Color
		marginBottom: 4,
	},
	invoiceBadge: {
		backgroundColor: "#e2e8f0",
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 4,
		fontSize: 9,
		color: "#0f172a",
		marginTop: 8,
		alignSelf: "flex-end"
	},

	// Grid System for Two-Column Details
	gridContainer: {
		flexDirection: "row",
		gap: 20,
		marginBottom: 30,
	},
	card: {
		flex: 1,
		backgroundColor: "#F8FAFC",
		borderRadius: 8,
		padding: 16,
		border: "1px solid #E2E8F0",
	},
	cardTitle: {
		fontSize: 10,
		fontWeight: "bold",
		color: "#94A3B8", // slate-400
		marginBottom: 8,
		textTransform: "uppercase",
	},
	cardContent: {
		flexDirection: "column",
		gap: 2,
	},

	// Table Styles (Clean & Modern)
	table: {
		width: "100%",
		borderRadius: 8,
		overflow: "hidden",
		marginBottom: 24,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#012d46", // Brand Color
		paddingVertical: 10,
		paddingHorizontal: 12,
		alignItems: "center",
	},
	tableHeaderCell: {
		color: "#FFFFFF",
		fontSize: 9,
		fontWeight: "bold",
		textAlign: "right", // Arabic Default
	},
	tableRow: {
		flexDirection: "row",
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#E2E8F0",
		alignItems: "center",
	},
	tableRowZebra: {
		backgroundColor: "#F8FAFC",
	},
	tableCell: {
		fontSize: 9,
		color: "#334155",
		textAlign: "right",
	},

	// Column Widths
	colDesc: { width: "45%", textAlign: "right" },
	colQty: { width: "15%", textAlign: "center" },
	colPrice: { width: "20%", textAlign: "right" },
	colTotal: { width: "20%", textAlign: "right", fontWeight: "bold" },

	// Totals Section
	totalsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	notesContainer: {
		width: "55%",
		paddingRight: 20,
	},
	totalsCard: {
		width: "40%",
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		border: "1px solid #E2E8F0",
		overflow: "hidden",
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#F1F5F9",
	},
	totalLabel: {
		fontSize: 9,
		color: "#64748B",
	},
	totalValue: {
		fontSize: 9,
		color: "#0F172A",
		fontWeight: "bold",
		fontFamily: "Helvetica", // Numbers often look better in non-Arabic font or specific numeral version
	},
	finalTotalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: "#F1F5F9",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderTopWidth: 2,
		borderTopColor: "#CBD5E1",
	},
	finalTotalLabel: {
		fontSize: 10,
		fontWeight: "bold",
		color: "#0F172A",
	},
	finalTotalValue: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#012d46",
		fontFamily: "Helvetica",
	},

	// Footer & QR
	footer: {
		position: "absolute",
		bottom: 30,
		left: 40,
		right: 40,
		borderTopWidth: 1,
		borderTopColor: "#E2E8F0",
		paddingTop: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	footerText: {
		fontSize: 8,
		color: "#94A3B8",
	},
	qrCodeContainer: {
		alignItems: "center",
		justifyContent: "center",
	},
	qrCodeImage: {
		width: 70,
		height: 70,
	}
});

export const baseStyles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 30,
		fontSize: 11,
		fontFamily: "Markazi",
		lineHeight: 1.5,
		direction: "rtl",
	},
	// Header Section
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 24,
		paddingBottom: 16,
		borderBottomWidth: 2,
		borderBottomColor: "#1F2937",
	},
	headerLeft: {
		flexDirection: "column",
		width: "48%",
	},
	headerRight: {
		flexDirection: "column",
		alignItems: "flex-end",
		width: "48%",
	},
	qrContainer: {
		marginBottom: 12,
		alignItems: "flex-end",
	},
	qrImage: {
		width: 90,
		height: 90,
	},
	qrLabel: {
		fontSize: 8,
		color: "#6B7280",
		marginTop: 4,
	},
	// Seller/Buyer Info Sections
	infoSection: {
		marginBottom: 20,
	},
	infoSectionTitle: {
		fontSize: 13,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 8,
		paddingBottom: 6,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	infoBox: {
		backgroundColor: "#F9FAFB",
		padding: 12,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	infoRow: {
		flexDirection: "row",
		marginBottom: 4,
	},
	infoLabel: {
		fontSize: 10,
		color: "#6B7280",
		width: 100,
		fontWeight: "bold",
	},
	infoValue: {
		fontSize: 10,
		color: "#1F2937",
		flex: 1,
	},
	// Invoice Header
	invoiceTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 12,
		textAlign: "right",
	},
	invoiceMeta: {
		fontSize: 10,
		color: "#374151",
		marginBottom: 4,
		textAlign: "right",
	},
	// Table Styles
	table: {
		width: "100%",
		marginTop: 16,
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 4,
		overflow: "hidden",
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#1F2937",
		paddingVertical: 10,
		paddingHorizontal: 8,
	},
	tableHeaderCell: {
		color: "#FFFFFF",
		fontSize: 10,
		fontWeight: "bold",
		textAlign: "right",
	},
	tableRow: {
		flexDirection: "row",
		paddingVertical: 8,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
		minHeight: 30,
	},
	tableRowAlt: {
		backgroundColor: "#F9FAFB",
	},
	tableCell: {
		fontSize: 10,
		color: "#374151",
		textAlign: "right",
		paddingHorizontal: 4,
	},
	tableCellNumber: {
		fontSize: 10,
		color: "#374151",
		textAlign: "left",
		fontFamily: "Helvetica",
		direction: "ltr",
		paddingHorizontal: 4,
	},
	tableCellCenter: {
		textAlign: "center",
	},
	// Column widths for tax invoice (using flex)
	colIndex: { flex: 0.5, paddingHorizontal: 4 },
	colDescription: { flex: 3.2, paddingHorizontal: 4 },
	colQuantity: { flex: 0.8, paddingHorizontal: 4 },
	colUnitPrice: { flex: 1.2, paddingHorizontal: 4 },
	colTaxRate: { flex: 1.0, paddingHorizontal: 4 },
	colTaxAmount: { flex: 1.3, paddingHorizontal: 4 },
	colTotal: { flex: 2.0, paddingHorizontal: 4 },
	// Column widths for simplified/regular
	colDescSimple: { flex: 4.5, paddingHorizontal: 4 },
	colQtySimple: { flex: 1.5, paddingHorizontal: 4 },
	colPriceSimple: { flex: 4.0, paddingHorizontal: 4 },
	// Totals Section
	totalsSection: {
		marginTop: 20,
		alignItems: "flex-end",
	},
	totalsBox: {
		width: 300,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 4,
		padding: 12,
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 6,
		minHeight: 20,
	},
	totalLabel: {
		fontSize: 10,
		color: "#6B7280",
		fontWeight: "bold",
	},
	totalValue: {
		fontSize: 10,
		color: "#1F2937",
		fontWeight: "bold",
		fontFamily: "Helvetica",
		direction: "ltr",
	},
	totalDivider: {
		height: 1,
		backgroundColor: "#E5E7EB",
		marginVertical: 8,
	},
	finalTotalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 8,
		borderTopWidth: 2,
		borderTopColor: "#1F2937",
		marginTop: 4,
		minHeight: 24,
	},
	finalTotalLabel: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#1F2937",
	},
	finalTotalValue: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#1F2937",
		fontFamily: "Helvetica",
		direction: "ltr",
	},
	// Notes Section
	notesSection: {
		marginTop: 20,
		padding: 12,
		backgroundColor: "#FEF3C7",
		borderRadius: 4,
		borderWidth: 1,
		borderColor: "#FCD34D",
	},
	notesLabel: {
		fontSize: 11,
		fontWeight: "bold",
		color: "#92400E",
		marginBottom: 6,
	},
	notesText: {
		fontSize: 10,
		color: "#78350F",
		lineHeight: 1.6,
	},
	// Footer
	footer: {
		marginTop: 24,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
	},
	footerText: {
		fontSize: 9,
		color: "#9CA3AF",
		textAlign: "center",
	},
	// Logo Section
	logoSection: {
		flexDirection: "column",
		alignItems: "flex-start",
	},
	logoPlaceholder: {
		width: 60,
		height: 60,
		backgroundColor: "#1F2937",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
	},
	logoText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "bold",
	},
	companyName: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 4,
	},
	companyInfo: {
		flexDirection: "column",
	},
	companyInfoRow: {
		fontSize: 9,
		color: "#6B7280",
		marginBottom: 2,
	},
	// Invoice Info
	invoiceInfo: {
		flexDirection: "column",
		alignItems: "flex-end",
	},
	invoiceDetails: {
		flexDirection: "column",
		alignItems: "flex-end",
	},
	invoiceDetailRow: {
		fontSize: 10,
		color: "#374151",
		marginBottom: 4,
	},
	// Section
	section: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 8,
		paddingBottom: 6,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	// Client Info
	clientInfo: {
		backgroundColor: "#F9FAFB",
		padding: 12,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	clientName: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 4,
	},
	clientDetailRow: {
		fontSize: 10,
		color: "#6B7280",
		marginBottom: 2,
	},
	// Table column widths for standard invoice
	indexCell: { flex: 0.5, paddingHorizontal: 4 },
	descriptionCell: { flex: 2.5, paddingHorizontal: 4 },
	quantityCell: { flex: 0.8, paddingHorizontal: 4 },
	unitPriceCell: { flex: 1.5, paddingHorizontal: 4 },
	taxRateCell: { flex: 1.0, paddingHorizontal: 4 },
	taxAmountCell: { flex: 1.2, paddingHorizontal: 4 },
	totalCell: { flex: 1.5, paddingHorizontal: 4 },
	tableRowZebra: {
		backgroundColor: "#F9FAFB",
	},
	// Totals Card
	totalsCard: {
		width: 300,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 4,
		padding: 12,
		alignSelf: "flex-end",
	},
	// Final Total Row
	finalTotal: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 8,
		borderTopWidth: 2,
		borderTopColor: "#1F2937",
		marginTop: 4,
	},
	// Notes Section
	notes: {
		marginTop: 16,
		padding: 12,
		backgroundColor: "#FEF3C7",
		borderRadius: 4,
		borderWidth: 1,
		borderColor: "#FCD34D",
	},
});

// Helper to safely format currency in RTL friendly way
export const formatCurrency = (amount: number) => {
	// e.g. "1,230.50 SAR" instead of just the number
	return libFormatCurrency(amount).replace("SAR", "ر.س");
};

export const safeText = (value: unknown): string => {
	if (value === null || value === undefined) return "—";
	const str = String(value).trim();
	return str === "" ? "—" : str;
};

export const formatDate = (date: string | Date | null) => {
	if (!date) return "—";
	return libFormatDate(date);
};

export const formatDateTime = libFormatDateTime;
