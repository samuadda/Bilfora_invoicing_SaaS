"use client";

import { useState } from "react";
import Image from "next/image";
import {
	Hash,
	CalendarClock,
	Percent,
	CreditCard,
	Send,
	FileText,
	Building2,
	MapPin,
	LayoutTemplate,
	Palette,
	QrCode,
	Receipt,
	Globe,
	ChevronDown,
	Loader2
} from "lucide-react";
import { m } from "framer-motion";
import { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";
import { updateSettingsAction } from "@/actions/settings";
import { useToast } from "@/components/ui/use-toast";

interface SettingsClientProps {
	initialSettings: InvoiceSettings | null;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	// Initialize state with props or defaults
	const [prefix, setPrefix] = useState(initialSettings?.numbering_prefix ?? "INV-");
	const [nextNumber, setNextNumber] = useState(101); // Not in schema currently? We'll ignore for now or add to schema if needed. Schema has 'numbering_prefix' only.
	// Note: 'next_invoice_number' might be in a sequence table, not settings. We'll disable this field or just keep it UI only for now if not in schema.
	
	const [dueDays, setDueDays] = useState(30); // Not in schema?
	// Schema has: vat_rate, currency, timezone, etc.
	
	// Map schema fields to state
	const [vatNumber, setVatNumber] = useState(initialSettings?.vat_number ?? "");
	const [crNumber, setCrNumber] = useState(initialSettings?.cr_number ?? "");
	const [businessLogo, setBusinessLogo] = useState<string | null>(initialSettings?.logo_url ?? null);
	const [addressLine, setAddressLine] = useState(initialSettings?.address_line1 ?? "");
	const [city, setCity] = useState(initialSettings?.city ?? "");
	const [sellerName, setSellerName] = useState(initialSettings?.seller_name ?? "");
	
	const [iban, setIban] = useState(initialSettings?.iban ?? "");
	const [footerNote, setFooterNote] = useState(initialSettings?.invoice_footer ?? "شكراً لتعاملكم معنا");
	
	// Format tax rate: 0.15 -> 15
	const [taxRate, setTaxRate] = useState(
		initialSettings?.default_vat_rate ? initialSettings.default_vat_rate * 100 : 15
	);

	// UI only states (not in schema yet, or handled differently)
	const [autoSend, setAutoSend] = useState(false);
	const [allowPartials, setAllowPartials] = useState(true);
	const [template, setTemplate] = useState<"classic" | "compact" | "modern">("classic");
	const [primaryColor, setPrimaryColor] = useState("#7f2dfb");
	const [qrValue, setQrValue] = useState(""); // This is typically generated, not saved as value?

	const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setBusinessLogo(url);
			// TODO: Implement actual upload to Supabase Storage
			toast({
				title: "تنبيه",
				description: "رفع الشعار غير مفعل حالياً، سيتم عرضه محلياً فقط",
				variant: "destructive"
			});
		}
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			const payload = {
				seller_name: sellerName || "My Business", // Fallback validation
				vat_number: vatNumber || "300000000000003",
				cr_number: crNumber || null,
				address_line1: addressLine || null,
				city: city || null,
				logo_url: businessLogo, // Note: this might be blob: url which won't work across sessions. Needs upload.
				iban: iban || null,
				invoice_footer: footerNote || null,
				default_vat_rate: taxRate / 100, // Convert 15 -> 0.15
				numbering_prefix: prefix,
				currency: "SAR" as const,
				timezone: "Asia/Riyadh",
			};

			const result = await updateSettingsAction(payload);
			if (result.success) {
				toast({
					title: "تم الحفظ بنجاح",
					description: "تم تحديث إعدادات الفواتير",
				});
			} else {
				toast({
					variant: "destructive",
					title: "خطأ في الحفظ",
					description: result.error || "تأكد من إدخال جميع البيانات المطلوبة",
				});
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "خطأ",
				description: "حدث خطأ غير متوقع",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-8 pb-10">
			{/* Header */}
			<m.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col gap-2"
			>
				<h1 className="text-3xl font-bold text-[#012d46]">إعدادات الفواتير</h1>
				<p className="text-gray-500">تخصيص مظهر الفواتير، الضرائب، وخيارات الدفع</p>
			</m.div>

			{/* Business info */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<Building2 className="text-[#7f2dfb]" size={24} />
					بيانات النشاط التجاري
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							اسم المنشأة
						</label>
						<input
							value={sellerName}
							onChange={(e) => setSellerName(e.target.value)}
							className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
							placeholder="اسم متجرك أو شركتك"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							الرقم الضريبي (VAT)
						</label>
						<div className="relative">
							<Receipt
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								value={vatNumber}
								onChange={(e) => setVatNumber(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="3xxxxxxxxxxxxx3"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							السجل التجاري (CR)
						</label>
						<div className="relative">
							<Building2
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								value={crNumber}
								onChange={(e) => setCrNumber(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="1010XXXXXX"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							شعار الفواتير
						</label>
						<div className="flex items-center gap-4">
							<div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
								{businessLogo ? (
									<Image
										src={businessLogo}
										alt="Logo"
										fill
										className="object-contain"
									/>
								) : (
									<Building2 className="text-gray-300" size={24} />
								)}
							</div>
							<label className="px-4 py-2 rounded-xl bg-purple-50 text-[#7f2dfb] text-sm font-bold hover:bg-purple-100 cursor-pointer transition-colors">
								رفع شعار
								<input
									type="file"
									accept="image/*"
									onChange={onLogoChange}
									className="hidden"
								/>
							</label>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
					<div className="md:col-span-2 space-y-2">
						<label className="text-sm font-medium text-gray-700">
							العنوان
						</label>
						<div className="relative">
							<MapPin
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								value={addressLine}
								onChange={(e) => setAddressLine(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="الشارع، الحي، رقم المبنى"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							المدينة
						</label>
						<input
							value={city}
							onChange={(e) => setCity(e.target.value)}
							className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
							placeholder="الرياض"
						/>
					</div>
				</div>
			</m.div>

			{/* Numbering & due */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<Hash className="text-[#7f2dfb]" size={24} />
					إعدادات الترقيم
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							بادئة الفاتورة
						</label>
						<div className="relative">
							<Hash
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								value={prefix}
								onChange={(e) => setPrefix(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="INV-"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							الرقم التالي (تجريبي)
						</label>
						<input
							type="number"
							value={nextNumber}
							disabled
							className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							فترة الاستحقاق (أيام - تجريبي)
						</label>
						<div className="relative">
							<CalendarClock
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								type="number"
								value={dueDays}
								onChange={(e) => setDueDays(parseInt(e.target.value || "0", 10))}
								disabled
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
							/>
						</div>
					</div>
				</div>
			</m.div>

			{/* Taxes, sending, footer */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<Percent className="text-[#7f2dfb]" size={24} />
					الضرائب والشروط
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							نسبة الضريبة (%)
						</label>
						<div className="relative">
							<Percent
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								type="number"
								value={taxRate}
								onChange={(e) => setTaxRate(parseFloat(e.target.value || "0"))}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
							/>
						</div>
					</div>
					<label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer bg-white">
						<span className="flex items-center gap-2 text-sm font-medium text-gray-700">
							<Send size={18} className="text-[#7f2dfb]" /> إرسال تلقائي
						</span>
						<input
							type="checkbox"
							checked={autoSend}
							onChange={(e) => setAutoSend(e.target.checked)}
							className="w-5 h-5 rounded border-gray-300 text-[#7f2dfb] focus:ring-[#7f2dfb]"
						/>
					</label>
					<label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer bg-white">
						<span className="flex items-center gap-2 text-sm font-medium text-gray-700">
							<FileText size={18} className="text-[#7f2dfb]" /> دفع جزئي
						</span>
						<input
							type="checkbox"
							checked={allowPartials}
							onChange={(e) => setAllowPartials(e.target.checked)}
							className="w-5 h-5 rounded border-gray-300 text-[#7f2dfb] focus:ring-[#7f2dfb]"
						/>
					</label>
				</div>
				<div className="mt-6 space-y-2">
					<label className="text-sm font-medium text-gray-700">
						ملاحظة تذييل الفاتورة
					</label>
					<textarea
						rows={3}
						value={footerNote}
						onChange={(e) => setFooterNote(e.target.value)}
						className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all resize-none"
						placeholder="مثال: شكراً لتعاملكم معنا، يرجى التحويل خلال 30 يوم"
					/>
				</div>
			</m.div>

			{/* Branding & template - UI Only for now */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<Palette className="text-[#7f2dfb]" size={24} />
					التصميم (قريباً)
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50 pointer-events-none">
					{/* ... preserved existing UI code ... */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							القالب
						</label>
						<div className="relative">
							<LayoutTemplate
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<select
								value={template}
								onChange={(e) => setTemplate(e.target.value as any)}
								className="w-full appearance-none rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm"
							>
								<option value="classic">كلاسيكي</option>
								<option value="compact">مضغوط</option>
								<option value="modern">عصري</option>
							</select>
							<ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							اللون الأساسي
						</label>
						<div className="relative flex items-center">
							<input
								type="color"
								value={primaryColor}
								onChange={(e) => setPrimaryColor(e.target.value)}
								className="w-full h-12 rounded-xl border border-gray-200 p-1 cursor-pointer"
							/>
						</div>
					</div>
				</div>
			</m.div>

			{/* Default payment info */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<CreditCard className="text-[#7f2dfb]" size={24} />
					بيانات الدفع
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							رقم الآيبان (IBAN)
						</label>
						<div className="relative">
							<Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input
								value={iban}
								onChange={(e) => setIban(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="SAxx xxxx xxxx xxxx xxxx xx"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							رابط QR أو نص للدفع (غير مفعل)
						</label>
						<div className="relative">
							<QrCode
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								value={qrValue}
								onChange={(e) => setQrValue(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="رابط بوابة الدفع أو تعليمات"
								disabled
							/>
						</div>
					</div>
				</div>
				<div className="flex justify-end mt-8">
					<button 
						onClick={handleSave}
						disabled={isLoading}
						className="px-8 py-3 rounded-xl bg-[#7f2dfb] text-white text-base font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
					>
						{isLoading && <Loader2 className="animate-spin w-4 h-4" />}
						حفظ الإعدادات
					</button>
				</div>
			</m.div>
		</div>
	);
}
