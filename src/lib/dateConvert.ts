/**
 * Date conversion utility for displaying Gregorian and Hijri dates
 * 
 * IMPORTANT: 
 * - Gregorian dates are the ONLY source of truth stored in database
 * - Hijri dates are display-only and never saved or used in calculations
 * - All calculations, ZATCA QR, and backend logic use Gregorian only
 */

export interface DateDisplay {
	formattedGregorian: string;
	formattedHijri: string;
}

/**
 * Converts a Gregorian date string to formatted Gregorian and Hijri dates for display
 * 
 * @param dateString - ISO date string from database (Gregorian)
 * @returns Object with formattedGregorian and formattedHijri strings
 * 
 * @example
 * const { formattedGregorian, formattedHijri } = convertToHijri("2025-12-04");
 * // formattedGregorian: "04/12/2025"
 * // formattedHijri: "03/06/1447 هـ"
 */
export function convertToHijri(dateString: string): DateDisplay {
	if (!dateString) {
		return {
			formattedGregorian: "",
			formattedHijri: "",
		};
	}

	const date = new Date(dateString);

	// Format Gregorian date (DD/MM/YYYY)
	const formattedGregorian = date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});

	// Format Hijri date (DD/MM/YYYY هـ) with Western numerals
	const hijriDate = date.toLocaleDateString("ar-SA-u-ca-islamic-nu-latn", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});

	// Check if hijriDate already contains "هـ" to avoid duplication
	// Some locales already include it, so we only add if it's not present
	const formattedHijri = hijriDate.includes("هـ") ? hijriDate : `${hijriDate} هـ`;

	return {
		formattedGregorian,
		formattedHijri,
	};
}

/**
 * Formats a date for display with both Gregorian and Hijri
 * Returns a formatted string ready for UI display
 * 
 * @param dateString - ISO date string from database
 * @returns Formatted string with both dates
 */
export function formatDateWithHijri(dateString: string): string {
	const { formattedGregorian, formattedHijri } = convertToHijri(dateString);
	if (!formattedGregorian) return "";
	return `${formattedGregorian}\nالموافق: ${formattedHijri}`;
}

