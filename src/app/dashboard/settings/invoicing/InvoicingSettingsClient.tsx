"use client";

import { useState } from "react";
import {
	Hash,
	CreditCard,
	Palette,
	Building2,
	Globe,
	Loader2,
	Save,
	LayoutTemplate,
} from "lucide-react";

import { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";
import { updateSettingsAction } from "@/actions/settings";
import { useToast } from "@/components/ui/use-toast";
import { supabasePersistent } from "@/lib/supabase-clients";
import { IS_ZATCA_ENABLED } from "@/config/features";

interface InvoicingSettingsClientProps {
	initialSettings: InvoiceSettings | null;
	userId: string;
}

export default function InvoicingSettingsClient({
	initialSettings,
	userId,
}: InvoicingSettingsClientProps) {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	// --- State Management ---

	// Card 1: Brand Identity
	const [brandColor, setBrandColor] = useState(
		initialSettings?.brand_color ?? "#7f2dfb"
	);
	const [logoUrl, setLogoUrl] = useState<string | null>(
		initialSettings?.logo_url ?? null
	);

	// Card 2: Banking & Payments
	const [bankName, setBankName] = useState(initialSettings?.bank_name ?? "");
	const [iban, setIban] = useState(initialSettings?.iban ?? "");
	const [bankName2, setBankName2] = useState(initialSettings?.bank_name_2 ?? "");
	const [iban2, setIban2] = useState(initialSettings?.iban_2 ?? "");
	const [bankName3, setBankName3] = useState(initialSettings?.bank_name_3 ?? "");
	const [iban3, setIban3] = useState(initialSettings?.iban_3 ?? "");
	const [paymentNotes, setPaymentNotes] = useState(
		initialSettings?.payment_notes ?? ""
	);

	// Card 3: Defaults & Numbering
	const [prefix, setPrefix] = useState(
		initialSettings?.numbering_prefix ?? "INV-"
	);
	const [defaultTerms] = useState(
		initialSettings?.default_terms ?? "Net 30"
	);
	const [footerNote, setFooterNote] = useState(
		initialSettings?.invoice_footer ?? "شكراً لتعاملكم معنا"
	);
	
	// Legacy/ZATCA fields (Hidden if Zatca disabled, but kept in state)
	const [taxRate] = useState(
		initialSettings?.default_vat_rate
			? initialSettings.default_vat_rate * 100
			: 15
	);

	// --- Handlers ---

	const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 2 * 1024 * 1024) {
			toast({ title: "خطأ", description: "حجم الصورة يجب أن لا يتجاوز 2 ميجابايت", variant: "destructive" });
			return;
		}

		try {
			setIsLoading(true);
			
			const fileExt = file.name.split('.').pop();
			const fileName = `${userId}-${Math.random()}.${fileExt}`;
			const filePath = `${fileName}`;

			const { error: uploadError } = await supabasePersistent.storage
				.from('business-logos')
				.upload(filePath, file);

			if (uploadError) throw uploadError;

			const { data: { publicUrl } } = supabasePersistent.storage
				.from('business-logos')
				.getPublicUrl(filePath);

			setLogoUrl(publicUrl);
			toast({ title: "تم الرفع", description: "تم تحديث الشعار بنجاح" });
		} catch (error) {
			console.error(error);
			toast({ title: "خطأ", description: `فشل رفع الشعار: ${(error as Error).message}`, variant: "destructive" });
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			const result = await updateSettingsAction({
				// Preserved or Default Fields
				seller_name: initialSettings?.seller_name || "My Business",
				vat_number: initialSettings?.vat_number || "300000000000003",
				cr_number: initialSettings?.cr_number || null,
				address_line1: initialSettings?.address_line1 || null,
				city: initialSettings?.city || null,
				
				// Updated Fields
				logo_url: logoUrl,
				brand_color: brandColor,
				
				bank_name: bankName || null,
				iban: iban || null,
				bank_name_2: bankName2 || null,
				iban_2: iban2 || null,
				bank_name_3: bankName3 || null,
				iban_3: iban3 || null,
				payment_notes: paymentNotes || null,
				
				numbering_prefix: prefix,
				default_terms: defaultTerms,
				invoice_footer: footerNote || null,
				
				// Logic
				default_vat_rate: IS_ZATCA_ENABLED ? taxRate / 100 : 0,
				currency: "SAR",
				timezone: "Asia/Riyadh",
			});

			if (result.success) {
				toast({
					title: "تم الحفظ بنجاح",
					description: "تم تحديث إعدادات الفواتير",
				});
			} else {
				toast({
					variant: "destructive",
					title: "خطأ في الحفظ",
					description:
						result.error || "تأكد من إدخال جميع البيانات المطلوبة",
				});
			}
		} catch {
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
		<div className="space-y-6 pb-20">
			{/* --- Card 1: Brand Identity --- */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<Palette className="text-[#7f2dfb]" size={20} />
					هوية الفاتورة
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Logo Upload */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							شعار الفاتورة
						</label>
						<div className="flex items-center gap-4">
							<div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
								{logoUrl ? (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img
										src={logoUrl}
										alt="Logo"
										className="object-contain w-full h-full"
									/>
								) : (
									<Building2 className="text-gray-300" size={24} />
								)}
							</div>
							<label className="px-4 py-2 rounded-xl bg-purple-50 text-[#7f2dfb] text-sm font-bold hover:bg-purple-100 cursor-pointer transition-colors">
								رفع صورة
								<input
									type="file"
									accept="image/*"
									onChange={onLogoChange}
									className="hidden"
								/>
							</label>
						</div>
					</div>

					{/* Brand Color */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							لون الهوية (Brand Color)
						</label>
						<div className="flex items-center gap-3">
							<input
								type="color"
								value={brandColor}
								onChange={(e) => setBrandColor(e.target.value)}
								className="h-10 w-20 rounded cursor-pointer border-0 p-0"
							/>
							<span className="text-sm text-gray-500 font-mono">
								{brandColor}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* --- Card 2: Banking & Payments --- */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<CreditCard className="text-[#7f2dfb]" size={20} />
					بيانات الدفع
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							اسم البنك
						</label>
						<div className="relative">
							<Building2
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								value={bankName}
								onChange={(e) => setBankName(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="مثال: مصرف الراجحي"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							رقم الآيبان (IBAN)
						</label>
						<div className="relative">
							<Globe
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								value={iban}
								onChange={(e) => setIban(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="SAxx xxxx xxxx xxxx xxxx xx"
								style={{ direction: "ltr", textAlign: "right" }}
							/>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							اسم البنك الإضافي 1
						</label>
						<div className="relative">
							<Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input
								value={bankName2}
								onChange={(e) => setBankName2(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="مثال: البنك الأهلي"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							رقم الآيبان (IBAN) للإضافي 1
						</label>
						<div className="relative">
							<Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input
								value={iban2}
								onChange={(e) => setIban2(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="SAxx xxxx xxxx xxxx xxxx xx"
								style={{ direction: "ltr", textAlign: "right" }}
							/>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							اسم البنك الإضافي 2
						</label>
						<div className="relative">
							<Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input
								value={bankName3}
								onChange={(e) => setBankName3(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="مثال: بنك الإنماء"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							رقم الآيبان (IBAN) للإضافي 2
						</label>
						<div className="relative">
							<Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input
								value={iban3}
								onChange={(e) => setIban3(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="SAxx xxxx xxxx xxxx xxxx xx"
								style={{ direction: "ltr", textAlign: "right" }}
							/>
						</div>
					</div>
				</div>

				<div className="mt-5 space-y-2">
					<label className="text-sm font-medium text-gray-700">
						معلومات دفع إضافية (STC Pay / PayPal / ملاحظات)
					</label>
					<textarea
						rows={2}
						value={paymentNotes}
						onChange={(e) => setPaymentNotes(e.target.value)}
						className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all resize-none"
						placeholder="أي تفاصيل أخرى لطرق الدفع..."
					/>
				</div>
			</div>

			{/* --- Card 3: Defaults & Numbering --- */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<Hash className="text-[#7f2dfb]" size={20} />
					الإعدادات الافتراضية
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							بادئة الفاتورة (Prefix)
						</label>
						<div className="relative">
							<LayoutTemplate
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								value={prefix}
								onChange={(e) => setPrefix(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="INV-"
								style={{ direction: "ltr", textAlign: "right" }}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							التسلسل التالي (Next No.)
						</label>
						<div className="relative">
							<Hash
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							{/* Placeholder for now found in DB sequence table usually */}
							<input
								disabled
								value={"---"} 
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
							/>
						</div>
					</div>
				</div>

				<div className="mt-5 space-y-2">
					<label className="text-sm font-medium text-gray-700">
						ملاحظة تذييل الفاتورة (Footer Note)
					</label>
					<textarea
						rows={2}
						value={footerNote}
						onChange={(e) => setFooterNote(e.target.value)}
						className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all resize-none"
						placeholder="مثال: شكراً لتعاملكم معنا..."
					/>
				</div>
			</div>

			{/* Save Action */}
			<div className="flex justify-end pt-4">
				<button
					onClick={handleSave}
					disabled={isLoading}
					className="px-8 py-3 rounded-xl bg-[#7f2dfb] text-white text-base font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
				>
					{isLoading && <Loader2 className="animate-spin w-4 h-4" />}
					<Save size={18} />
					حفظ التغييرات
				</button>
			</div>
		</div>
	);
}
