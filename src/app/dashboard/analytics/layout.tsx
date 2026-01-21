"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, Download, Search, ChevronDown, FileText, Table } from "lucide-react";

export default function AnalyticsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showExportMenu, setShowExportMenu] = useState(false);
	const [customFrom, setCustomFrom] = useState("");
	const [customTo, setCustomTo] = useState("");
	const datePickerRef = useRef<HTMLDivElement>(null);
	const exportMenuRef = useRef<HTMLDivElement>(null);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
				setShowDatePicker(false);
			}
			if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
				setShowExportMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const from = searchParams.get("from");
	const to = searchParams.get("to");

	const currentRangeLabel = useMemo(() => {
		if (from && to) return `${new Date(from).toLocaleDateString("en-GB")} – ${new Date(to).toLocaleDateString("en-GB")}`;
		return "نطاق زمني";
	}, [from, to]);

	const setRange = (days: number) => {
		const toDate = new Date();
		const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
		const params = new URLSearchParams(searchParams.toString());
		params.set("from", fromDate.toISOString());
		params.set("to", toDate.toISOString());
		router.push(`${pathname}?${params.toString()}`);
	};

	const setCustomRange = () => {
		if (customFrom && customTo) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("from", new Date(customFrom).toISOString());
			params.set("to", new Date(customTo).toISOString());
			router.push(`${pathname}?${params.toString()}`);
			setShowDatePicker(false);
		}
	};

	// Helper function to escape CSV values
	const escapeCSV = (value: unknown): string => {
		if (value === null || value === undefined) return '';
		const str = String(value);
		// If value contains comma, quote, or newline, wrap in quotes and escape quotes
		if (str.includes(',') || str.includes('"') || str.includes('\n')) {
			return `"${str.replace(/"/g, '""')}"`;
		}
		return str;
	};

	// Helper function to format currency
	const formatCurrency = (amount: number | null | undefined): string => {
		if (amount === null || amount === undefined) return '0.00';
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	};

	// Helper function to format date
	const formatDate = (dateString: string | null | undefined): string => {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-GB', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			});
		} catch {
			return dateString;
		}
	};

	// Helper function to translate status
	const translateStatus = (status: string): string => {
		const statusMap: Record<string, string> = {
			'draft': 'مسودة',
			'sent': 'مرسلة',
			'paid': 'مدفوعة',
			'overdue': 'متأخرة',
			'cancelled': 'ملغية'
		};
		return statusMap[status] || status;
	};

	const exportData = async (format: 'csv' | 'excel', type: 'summary' | 'invoices') => {
		try {
			if (type === 'summary') {
				// Export summary data
				const summaryData = [
					['تقرير التحليلات', ''],
					['نطاق التصدير', `${from ? formatDate(from) : 'غير محدد'} - ${to ? formatDate(to) : 'غير محدد'}`],
					['تاريخ التصدير', formatDate(new Date().toISOString())],
					['وقت التصدير', new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })],
					[''],
					['البيانات', 'القيمة'],
					['إجمالي الإيرادات', 'يتم حسابها من البيانات'],
					['عدد الفواتير', 'يتم حسابها من البيانات'],
					['متوسط قيمة الفاتورة', 'يتم حسابها من البيانات'],
					['العملاء النشطون', 'يتم حسابها من البيانات']
				];

				const csvContent = summaryData.map(row =>
					row.map(cell => escapeCSV(cell)).join(',')
				).join('\n');

				// Add BOM for UTF-8 to ensure Arabic displays correctly in Excel
				const BOM = '\uFEFF';
				const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `analytics-summary-${new Date().toISOString().split('T')[0]}.csv`;
				a.click();
				URL.revokeObjectURL(url);
			} else if (type === 'invoices') {
				// Export detailed invoice data
				const response = await fetch(`/api/analytics/export-invoices?from=${from || ''}&to=${to || ''}`);
				if (!response.ok) {
					throw new Error('فشل تحميل البيانات');
				}
				const data = await response.json();

				// Format headers
				const headers = [
					'رقم الفاتورة',
					'العميل',
					'المبلغ الإجمالي (ريال)',
					'الحالة',
					'تاريخ الإصدار',
					'تاريخ الاستحقاق',
					'مبلغ الضريبة (ريال)',
					'المجموع الفرعي (ريال)',
					'تاريخ الإنشاء'
				];

				// Format data rows
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const rows = data.map((invoice: Record<string, any>) => [
					escapeCSV(invoice.invoice_number || '-'),
					escapeCSV(invoice.client_name || 'غير محدد'),
					formatCurrency(invoice.total_amount),
					escapeCSV(translateStatus(invoice.status || '')),
					formatDate(invoice.issue_date),
					formatDate(invoice.due_date),
					formatCurrency(invoice.tax_amount),
					formatCurrency(invoice.subtotal),
					formatDate(invoice.created_at || invoice.issue_date)
				]);

				// Add metadata header
				const metadata = [
					['تقرير الفواتير', ''],
					['نطاق التصدير', `${from ? formatDate(from) : 'الكل'} - ${to ? formatDate(to) : 'الآن'}`],
					['تاريخ التصدير', formatDate(new Date().toISOString())],
					['وقت التصدير', new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })],
					['عدد الفواتير', data.length.toString()],
					['']
				];

				const allRows = [
					...metadata.map(row => row.map(cell => escapeCSV(cell)).join(',')),
					headers.map(h => escapeCSV(h)).join(','),
					...rows.map((row: string[]) => row.join(','))
				];

				const csvContent = allRows.join('\n');

				// Add BOM for UTF-8 to ensure Arabic displays correctly in Excel
				const BOM = '\uFEFF';
				const blob = new Blob(
					[BOM + csvContent],
					{ type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel;charset=utf-8;' }
				);
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `invoices-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
				a.click();
				URL.revokeObjectURL(url);
			}
		} catch (error) {
			console.error('Export error:', error);
			alert('حدث خطأ أثناء التصدير. يرجى المحاولة مرة أخرى.');
		}
	};

	return (
		<div className="space-y-6">
			{/* Page header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						التحليلات
					</h1>
					<p className="text-gray-500 mt-1">
						نظرة متقدمة على الأداء والمبيعات والعملاء عبر الفترات
						الزمنية
					</p>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative hidden md:block">
						<Search
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
							size={16}
						/>
						<input
							type="search"
							placeholder="ابحث في التقارير..."
							className="w-56 rounded-xl border border-gray-200 pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
						/>
					</div>

					{/* Date Range Picker */}
					<div className="relative" ref={datePickerRef}>
						<button
							onClick={() => setShowDatePicker(!showDatePicker)}
							className="inline-flex items-center gap-2 rounded-xl bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-200 active:translate-y-[1px]"
						>
							<CalendarRange size={16} />
							<span>{currentRangeLabel}</span>
							<ChevronDown size={16} />
						</button>

						{showDatePicker && (
							<div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 min-w-80">
								<div className="space-y-4">
									<h3 className="font-semibold text-gray-900">اختر النطاق الزمني</h3>

									{/* Quick ranges */}
									<div className="flex gap-2 flex-wrap">
										<button onClick={() => setRange(7)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">7 أيام</button>
										<button onClick={() => setRange(30)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">30 يوماً</button>
										<button onClick={() => setRange(90)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">3 أشهر</button>
										<button onClick={() => setRange(180)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">6 أشهر</button>
									</div>

									{/* Custom range */}
									<div className="border-t pt-4">
										<h4 className="font-medium text-gray-700 mb-3">نطاق مخصص</h4>
										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="block text-sm text-gray-600 mb-1">من</label>
												<input
													type="date"
													value={customFrom}
													onChange={(e) => setCustomFrom(e.target.value)}
													className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
												/>
											</div>
											<div>
												<label className="block text-sm text-gray-600 mb-1">إلى</label>
												<input
													type="date"
													value={customTo}
													onChange={(e) => setCustomTo(e.target.value)}
													className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
												/>
											</div>
										</div>
										<button
											onClick={setCustomRange}
											className="mt-3 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
										>
											تطبيق النطاق المخصص
										</button>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Export Menu */}
					<div className="relative" ref={exportMenuRef}>
						<button
							onClick={() => setShowExportMenu(!showExportMenu)}
							className="inline-flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]"
						>
							<Download size={16} />
							<span>تصدير</span>
							<ChevronDown size={16} />
						</button>

						{showExportMenu && (
							<div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 min-w-48">
								<div className="space-y-1">
									<div className="px-3 py-2 text-sm font-medium text-gray-700">ملخص التحليلات</div>
									<button
										onClick={() => exportData('csv', 'summary')}
										className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										<FileText size={16} />
										تصدير CSV
									</button>
									<button
										onClick={() => exportData('excel', 'summary')}
										className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										<Table size={16} />
										تصدير Excel
									</button>

									<div className="border-t my-2"></div>
									<div className="px-3 py-2 text-sm font-medium text-gray-700">تفاصيل الفواتير</div>
									<button
										onClick={() => exportData('csv', 'invoices')}
										className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										<FileText size={16} />
										فواتير CSV
									</button>
									<button
										onClick={() => exportData('excel', 'invoices')}
										className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										<Table size={16} />
										فواتير Excel
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Content */}
			<section className="rounded-2xl bg-white border border-gray-200 p-4 md:p-6 shadow-sm">
				{children}
			</section>
		</div>
	);
}
