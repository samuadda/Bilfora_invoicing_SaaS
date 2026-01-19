import { Font, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency as libFormatCurrency, formatDate as libFormatDate, formatDateTime as libFormatDateTime } from "@/lib/formatters";

// 1. Prevent Arabic Word Breaking
// This is critical for connecting letters correctly and preventing mid-word wrapping
Font.registerHyphenationCallback((word) => [word]);

// 2. Register Premium SaaS Fonts
// We strictly use IBM Plex Sans Arabic for that modern, clean SaaS look
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

// Fallback font
try {
	Font.register({
		family: "Markazi",
		fonts: [
			{ src: "/fonts/markazi/MarkaziText-Regular.ttf" },
			{ src: "/fonts/markazi/MarkaziText-Bold.ttf", fontWeight: "bold" },
		],
	});
} catch (err) {
	console.warn("Failed to register Markazi font", err);
}

// 3. Styles targeting alignment and RTL
// We use 'row-reverse' in flex containers to naturally map visual RTL (Right-to-Left)
// to logical source order (First item = Rightmost).
export const premiumStyles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 40,
		fontSize: 10,
		fontFamily: "IBM Plex Sans Arabic", // Premium SaaS Font
		lineHeight: 1.5,
		color: "#334155", // slate-700
		// We do NOT use direction: 'rtl' globally because it can be flaky with some flex implementations
		// Instead we control layout explicitly with flex-direction
	},
	// Utility
	bold: { fontWeight: "bold" },
	textSm: { fontSize: 9 },
	textXs: { fontSize: 8 },
	textLg: { fontSize: 12 },
	textXl: { fontSize: 14 },
	text2Xl: { fontSize: 20 },

	textPrimary: { color: "#0f172a" }, // slate-900
	textSecondary: { color: "#64748b" }, // slate-500

	// Layout Helpers
	// RowReverse = Visual RTL (Item 1 is Rightmost)
	rowRtl: {
		flexDirection: "row-reverse",
		width: "100%",
	},
	// Normal Row = Visual LTR (Item 1 is Leftmost) - useful for LTR sections like English dates if needed
	rowLtr: {
		flexDirection: "row",
		width: "100%",
	},

	// Header
	header: {
		flexDirection: "row-reverse", // Logo/Info on Right? Or Left?
		// User guide: Header usually has Logo on one side, Info on other.
		// Let's assume standard SaaS: Logo/Seller (Right), Invoice Details (Left)
		justifyContent: "space-between",
		marginBottom: 32,
		alignItems: "flex-start",
	},
	headerSide: {
		flexDirection: "column",
		alignItems: "flex-end", // Align text to the right (visually)
		width: "48%",
	},
	headerSideLeft: { // Visually Left
		flexDirection: "column",
		alignItems: "flex-start", // Actually, for English/Arabic mixed, sometimes Left align is nicer for the Left block.
		width: "48%",
	},

	// Invoice Title
	invoiceTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#012d46",
		marginBottom: 4,
		textAlign: "left", // Visually Left side
	},
	invoiceBadge: {
		backgroundColor: "#e2e8f0",
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 4,
		fontSize: 9,
		color: "#0f172a",
		marginTop: 8,
		alignSelf: "flex-start", // Visually Left
	},

	// Grid System
	gridContainer: {
		flexDirection: "row-reverse", // Item 1 (Seller) Right, Item 2 (Buyer) Left
		gap: 20,
		marginBottom: 30,
	},
	card: {
		flex: 1,
		backgroundColor: "#F8FAFC",
		borderRadius: 8,
		padding: 16,
		border: "1px solid #E2E8F0",
		textAlign: "right", // Text inside card aligned Right
	},
	cardTitle: {
		fontSize: 10,
		fontWeight: "bold",
		color: "#94A3B8",
		marginBottom: 8,
		textTransform: "uppercase",
		textAlign: "right",
	},
	cardContent: {
		flexDirection: "column",
		gap: 2,
	},

	// Table (The critical part)
	table: {
		width: "100%",
		borderRadius: 8,
		overflow: "hidden",
		marginBottom: 24,
		borderWidth: 1,
		borderColor: "#E2E8F0",
	},
	tableHeader: {
		flexDirection: "row-reverse", // Col 1 (Rightmost) -> Col N (Leftmost)
		backgroundColor: "#012d46",
		paddingVertical: 10,
		paddingHorizontal: 12,
		alignItems: "center",
	},
	tableHeaderCell: {
		color: "#FFFFFF",
		fontSize: 9,
		fontWeight: "bold",
		textAlign: "right",
	},
	tableRow: {
		flexDirection: "row-reverse",
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#E2E8F0",
		alignItems: "center", // Center vertically
	},
	tableRowZebra: {
		backgroundColor: "#F8FAFC",
	},
	tableCell: {
		fontSize: 9,
		color: "#334155",
		textAlign: "right",
	},

	// Column Layout - Total | Unit Price | Quantity | Description | #
	// Visual Order (Right to Left):
	// 1. # (Index) - Rightmost
	// 2. Description - Wide
	// 3. Qty
	// 4. Unit Price
	// 5. Total - Leftmost

	colIndex: { width: "5%", textAlign: "right" },
	colDesc: { width: "45%", textAlign: "right" },
	colQty: { width: "10%", textAlign: "center" }, // Center Qty usually looks better
	colPrice: { width: "20%", textAlign: "right" }, // Prices Right aligned
	colTotal: { width: "20%", textAlign: "right", fontWeight: "bold" },

	// Totals Layout
	totalsContainer: {
		flexDirection: "row-reverse", // Notes (Right), Totals (Left) OR Totals(Left), Notes(Right)?
		// Usually Totals are on the bottom-right or bottom-left?
		// Arabic: Totals usually on the Left?
		// Let's assume standard: Notes on Right (Start), Totals on Left (End).
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	notesContainer: {
		width: "55%",
		paddingLeft: 20, // Padding on left since it's on the right
		textAlign: "right",
	},
	totalsCard: {
		width: "40%",
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		border: "1px solid #E2E8F0",
		overflow: "hidden",
	},
	totalRow: {
		flexDirection: "row-reverse", // Label Right, Value Left
		justifyContent: "space-between",
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#F1F5F9",
	},
	totalLabel: {
		fontSize: 9,
		color: "#64748B",
		textAlign: "right",
	},
	totalValue: {
		fontSize: 9,
		color: "#0F172A",
		fontWeight: "bold",
		textAlign: "left", // Values often align Left or Right? Right matches label. 
		// But in a row, usually Label (Right) ..... Value (Left).
	},
	finalTotalRow: {
		flexDirection: "row-reverse",
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
		textAlign: "right",
	},
	finalTotalValue: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#012d46",
		textAlign: "left",
	},

	// Footer
	footer: {
		position: "absolute",
		bottom: 30,
		left: 40,
		right: 40,
		borderTopWidth: 1,
		borderTopColor: "#E2E8F0",
		paddingTop: 20,
		flexDirection: "row-reverse",
		justifyContent: "space-between",
		alignItems: "center",
	},
	footerText: {
		fontSize: 8,
		color: "#94A3B8",
		textAlign: "center",
	},
	qrCodeContainer: {
		alignItems: "flex-end", // Align QR to right (in notes section)
		justifyContent: "flex-start",
		marginBottom: 8,
	},
	qrCodeImage: {
		width: 70,
		height: 70,
	}
});

// Helper: Wrap numbers/dates in Unicode directional isolates
// \u2066 (Left-to-Right Isolate) ... content ... \u2069 (Pop Directional Isolate)
// This forces valid LTR rendering for numbers inside an RTL context
export const formatLtrNumber = (value: string | number | null | undefined) => {
	if (value === null || value === undefined) return "";
	return `\u2066${value}\u2069`;
};

// Helper to safely format currency in RTL friendly way
export const formatCurrency = (amount: number) => {
	// e.g. "1,230.50 SAR" formatted by lib
	// We wrap the whole string or just the number?
	// Usually currency like "1,250.00 SAR" needs to be LTR isolated so distinct parts don't flip.
	const formatted = libFormatCurrency(amount).replace("SAR", "ر.س");
	return `\u2066${formatted}\u2069`; // Force LTR for the number+symbol grouping
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

export const baseStyles = premiumStyles;
