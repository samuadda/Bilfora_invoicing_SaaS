import { Font, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency as libFormatCurrency, formatDate as libFormatDate, formatDateTime as libFormatDateTime } from "@/lib/formatters";

// Register Markazi font for RTL-safe PDF rendering
try {
	Font.register({
		family: "Markazi",
		fonts: [
			{
				src: "/fonts/markazi/MarkaziText-Regular.ttf",
				fontWeight: "normal",
			},
			{
				src: "/fonts/markazi/MarkaziText-Bold.ttf",
				fontWeight: "bold",
			},
		],
	});
} catch (err) {
	console.warn("Failed to register Markazi font", err);
}

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

// Helper function to safely get string value (prevents xCoordinate error)
export const safeText = (value: unknown): string => {
	if (value === null || value === undefined) return "—";
	const str = String(value).trim();
	return str === "" ? "—" : str;
};

// Re-export formatters for backward compatibility in PDF components
export const formatCurrency = libFormatCurrency;
export const formatDate = libFormatDate;
export const formatDateTime = libFormatDateTime;
