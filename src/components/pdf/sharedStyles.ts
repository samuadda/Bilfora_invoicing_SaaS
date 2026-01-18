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

export const baseStyles = StyleSheet.create({
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
