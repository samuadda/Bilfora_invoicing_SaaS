"use client";

import { useState } from "react";
import {
	Hash,
	CalendarClock,
	Percent,
	CreditCard,
	Send,
	FileText,
	LayoutTemplate,
	Palette,
	QrCode,
	Globe,
	Loader2,
	Save,
} from "lucide-react";

import { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";
import { updateSettingsAction } from "@/actions/settings";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { IS_ZATCA_ENABLED } from "@/config/features";

interface InvoicingSettingsClientProps {
	initialSettings: InvoiceSettings | null;
}

export default function InvoicingSettingsClient({ initialSettings }: InvoicingSettingsClientProps) {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	// Numbering
	const [prefix, setPrefix] = useState(initialSettings?.numbering_prefix ?? "INV-");
	const [nextNumber] = useState(101);
	const [dueDays, setDueDays] = useState(30);

	// Tax
	const [taxRate, setTaxRate] = useState(initialSettings?.default_vat_rate ? initialSettings.default_vat_rate * 100 : 15);

	// Toggles
	const [autoSend, setAutoSend] = useState(false);

	// Footer
	const [footerNote, setFooterNote] = useState(initialSettings?.invoice_footer ?? "شكراً لتعاملكم معنا");

	// Branding (disabled)
	const [template, setTemplate] = useState<"classic" | "compact" | "modern">("classic");
	const [primaryColor, setPrimaryColor] = useState("#7f2dfb");

	// Payment
	const [iban, setIban] = useState(initialSettings?.iban ?? "");
	const [qrValue, setQrValue] = useState("");

	const handleSave = async () => {
		setIsLoading(true);
		try {
			const result = await updateSettingsAction({
				seller_name: initialSettings?.seller_name || "My Business",
				vat_number: initialSettings?.vat_number || "300000000000003",
				cr_number: initialSettings?.cr_number || null,
				address_line1: initialSettings?.address_line1 || null,
				city: initialSettings?.city || null,
				logo_url: initialSettings?.logo_url ?? null,
				iban: iban || null,
				invoice_footer: footerNote || null,
				default_vat_rate: IS_ZATCA_ENABLED ? taxRate / 100 : 0,
				numbering_prefix: prefix,
				currency: "SAR" as const,
				timezone: "Asia/Riyadh",
			});
			if (result.success) {
				toast({ title: "تم الحفظ بنجاح", description: "تم تحديث إعدادات الفواتير" });
			} else {
				toast({ variant: "destructive", title: "خطأ في الحفظ", description: result.error || "تأكد من إدخال جميع البيانات المطلوبة" });
			}
		} catch {
			toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ غير متوقع" });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Numbering */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<Hash className="text-[#7f2dfb]" size={20} />
					إعدادات الترقيم
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">بداية الفاتورة</label>
						<div className="relative">
							<Hash className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="INV-" />
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">الرقم التالي (تجريبي)</label>
						<input type="number" value={nextNumber} disabled className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">فترة الاستحقاق (أيام - تجريبي)</label>
						<div className="relative">
							<CalendarClock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input type="number" value={dueDays} onChange={(e) => setDueDays(parseInt(e.target.value || "0", 10))} disabled className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
						</div>
					</div>
				</div>
			</div>

			{/* Tax & Toggles & Footer */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					{IS_ZATCA_ENABLED ? (
						<><Percent className="text-[#7f2dfb]" size={20} />الضرائب والشروط</>
					) : (
						<><FileText className="text-[#7f2dfb]" size={20} />إعدادات الفاتورة</>
					)}
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
					{IS_ZATCA_ENABLED && (
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">نسبة الضريبة (%)</label>
							<div className="relative">
								<Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
								<input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value || "0"))} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" />
							</div>
						</div>
					)}
					<label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer bg-white">
						<span className="flex items-center gap-2 text-sm font-medium text-gray-700">
							<Send size={18} className="text-[#7f2dfb]" /> إرسال تلقائي
						</span>
						<div className="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" checked={autoSend} onChange={(e) => setAutoSend(e.target.checked)} className="sr-only peer" />
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7f2dfb]"></div>
						</div>
					</label>
				</div>
				<div className="mt-5 space-y-2">
					<label className="text-sm font-medium text-gray-700">ملاحظة تذييل الفاتورة</label>
					<textarea rows={3} value={footerNote} onChange={(e) => setFooterNote(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all resize-none" placeholder="مثال: شكراً لتعاملكم معنا، يرجى التحويل خلال 30 يوم" />
				</div>
			</div>

			{/* Branding (Disabled) */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<Palette className="text-[#7f2dfb]" size={20} />
					التصميم (قريباً)
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-5 opacity-50 pointer-events-none">
					<div className="space-y-2">
						<label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
							<LayoutTemplate size={15} className="text-gray-400" />
							القالب
						</label>
						<Select value={template} onValueChange={(val) => setTemplate(val as "classic" | "compact" | "modern")}>
							<SelectTrigger className="w-full h-11 bg-white border-gray-200"><SelectValue placeholder="اختر القالب" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="classic">كلاسيكي</SelectItem>
								<SelectItem value="compact">مضغوط</SelectItem>
								<SelectItem value="modern">عصري</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">اللون الأساسي</label>
						<input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-12 rounded-xl border border-gray-200 p-1 cursor-pointer" />
					</div>
				</div>
			</div>

			{/* Payment Info */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<CreditCard className="text-[#7f2dfb]" size={20} />
					بيانات الدفع
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">رقم الآيبان (IBAN)</label>
						<div className="relative">
							<Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input value={iban} onChange={(e) => setIban(e.target.value)} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="SAxx xxxx xxxx xxxx xxxx xx" />
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">تعليمات دفع إضافية</label>
						<div className="relative">
							<QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input value={qrValue} onChange={(e) => setQrValue(e.target.value)} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="رابط بوابة الدفع أو تعليمات" disabled />
						</div>
					</div>
				</div>
			</div>

			{/* Save */}
			<div className="flex justify-end">
				<button onClick={handleSave} disabled={isLoading} className="px-8 py-3 rounded-xl bg-[#7f2dfb] text-white text-base font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
					{isLoading && <Loader2 className="animate-spin w-4 h-4" />}
					<Save size={18} />
					حفظ إعدادات الفواتير
				</button>
			</div>
		</div>
	);
}
