"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
	Building2,
	MapPin,
	Receipt,
	Save,
	AlertCircle,
	CheckCircle,
	Loader2,
} from "lucide-react";
import { supabasePersistent } from "@/lib/supabase-clients";
import { UpdateProfileInput, AccountType } from "@/types/database";
import { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";
import { updateSettingsAction } from "@/actions/settings";
import { useToast } from "@/components/ui/use-toast";
import { IS_ZATCA_ENABLED } from "@/config/features";
import { m } from "framer-motion";
import LoadingState from "@/components/LoadingState";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";

interface BusinessSettingsClientProps {
	initialSettings: InvoiceSettings | null;
	userId: string;
}

export default function BusinessSettingsClient({ initialSettings, userId }: BusinessSettingsClientProps) {
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Profile fields (from profiles table)
	const [accountType, setAccountType] = useState<AccountType>("individual");
	const [companyName, setCompanyName] = useState("");
	const [taxNumber, setTaxNumber] = useState("");
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");

	// Invoice settings fields
	const [sellerName, setSellerName] = useState(initialSettings?.seller_name ?? "");
	const [vatNumber, setVatNumber] = useState(initialSettings?.vat_number ?? "");
	const [crNumber, setCrNumber] = useState(initialSettings?.cr_number ?? "");
	const [addressLine, setAddressLine] = useState(initialSettings?.address_line1 ?? "");
	const [invoiceCity, setInvoiceCity] = useState(initialSettings?.city ?? "");
	const [businessLogo, setBusinessLogo] = useState<string | null>(initialSettings?.logo_url ?? null);

	// Load profile data
	useEffect(() => {
		const loadProfile = async () => {
			setLoading(true);
			try {
				const { data, error: fetchError } = await supabasePersistent
					.from("profiles")
					.select("account_type, company_name, tax_number, address, city")
					.eq("id", userId)
					.single();
				if (fetchError) throw fetchError;
				if (data) {
					setAccountType(data.account_type || "individual");
					setCompanyName(data.company_name || "");
					setTaxNumber(data.tax_number || "");
					setAddress(data.address || "");
					setCity(data.city || "");
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "خطأ في تحميل البيانات");
			} finally {
				setLoading(false);
			}
		};
		loadProfile();
	}, [userId]);

	const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setBusinessLogo(url);
			toast({ title: "تنبيه", description: "رفع الشعار غير مفعل حالياً، سيتم عرضه محلياً فقط", variant: "destructive" });
		}
	};

	const handleSave = async () => {
		setSaving(true);
		setError(null);
		setSuccess(null);
		try {
			// Save profile fields
			const { error: profileError } = await supabasePersistent
				.from("profiles")
				.update({
					account_type: accountType,
					company_name: companyName || null,
					tax_number: taxNumber || null,
					address: address || null,
					city: city || null,
				} as Partial<UpdateProfileInput>)
				.eq("id", userId);
			if (profileError) throw profileError;

			// Save invoice settings fields
			const result = await updateSettingsAction({
				seller_name: sellerName || "My Business",
				vat_number: vatNumber || "300000000000003",
				cr_number: crNumber || null,
				address_line1: addressLine || null,
				city: invoiceCity || null,
				logo_url: businessLogo,
				iban: initialSettings?.iban ?? null,
				invoice_footer: initialSettings?.invoice_footer ?? null,
				default_vat_rate: initialSettings?.default_vat_rate ?? 0,
				numbering_prefix: initialSettings?.numbering_prefix ?? "INV-",
				currency: "SAR" as const,
				timezone: "Asia/Riyadh",
			});

			if (!result.success) {
				setError(result.error || "خطأ في حفظ إعدادات الفواتير");
				return;
			}

			setSuccess("تم حفظ بيانات المنشأة بنجاح ✓");
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطأ في الحفظ");
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <LoadingState message="جاري تحميل بيانات المنشأة..." />;

	return (
		<div className="space-y-6">
			{success && (
				<m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
					<CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
					<p className="text-green-800 font-medium">{success}</p>
				</m.div>
			)}
			{error && (
				<m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
					<AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
					<p className="text-red-800 font-medium">{error}</p>
				</m.div>
			)}

			{/* Profile Business Info */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<Building2 className="text-[#7f2dfb]" size={20} />
					الحساب والمنشأة
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">نوع الحساب *</label>
						<Select value={accountType} onValueChange={(val) => setAccountType(val as AccountType)}>
							<SelectTrigger className="w-full h-11 bg-white border-gray-200"><SelectValue /></SelectTrigger>
							<SelectContent>
								<SelectItem value="individual">فرد</SelectItem>
								<SelectItem value="business">مؤسسة</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">اسم الشركة</label>
						<div className="relative">
							<Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="اسم الشركة" />
						</div>
					</div>
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							{IS_ZATCA_ENABLED ? "الرقم الضريبي" : "السجل التجاري"}
						</label>
						<div className="relative">
							<Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder={IS_ZATCA_ENABLED ? "3xxxxxxxxxxxxx3" : "1010xxxxxx"} />
						</div>
					</div>
				</div>
			</div>

			{/* Invoice Business Info */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<Receipt className="text-[#7f2dfb]" size={20} />
					بيانات الفاتورة
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">اسم المنشأة (على الفاتورة)</label>
						<input value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="اسم متجرك أو شركتك" />
					</div>
					{IS_ZATCA_ENABLED && (
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">الرقم الضريبي (VAT)</label>
							<div className="relative">
								<Receipt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
								<input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="3xxxxxxxxxxxxx3" />
							</div>
						</div>
					)}
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">السجل التجاري (CR)</label>
						<div className="relative">
							<Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="1010XXXXXX" />
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">شعار الفواتير</label>
						<div className="flex items-center gap-4">
							<div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
								{businessLogo ? (<Image src={businessLogo} alt="Logo" fill className="object-contain" />) : (<Building2 className="text-gray-300" size={24} />)}
							</div>
							<label className="px-4 py-2 rounded-xl bg-purple-50 text-[#7f2dfb] text-sm font-bold hover:bg-purple-100 cursor-pointer transition-colors">
								رفع شعار
								<input type="file" accept="image/*" onChange={onLogoChange} className="hidden" />
							</label>
						</div>
					</div>
				</div>
			</div>

			{/* Address */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<MapPin className="text-[#7f2dfb]" size={20} />
					العنوان
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">المدينة (الملف الشخصي)</label>
						<div className="relative">
							<MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="الرياض" />
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">العنوان التفصيلي (الملف الشخصي)</label>
						<input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="اسم الشارع، رقم المبنى، الحي" />
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">المدينة (على الفاتورة)</label>
						<input value={invoiceCity} onChange={(e) => setInvoiceCity(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="الرياض" />
					</div>
					<div className="md:col-span-2 space-y-2">
						<label className="text-sm font-medium text-gray-700">عنوان الفاتورة</label>
						<div className="relative">
							<MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="الشارع، الحي، رقم المبنى" />
						</div>
					</div>
				</div>
			</div>

			{/* Save */}
			<div className="flex justify-end">
				<button onClick={handleSave} disabled={saving} className="px-8 py-3 rounded-xl bg-[#7f2dfb] text-white text-base font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
					{saving && <Loader2 className="animate-spin w-4 h-4" />}
					<Save size={18} />
					حفظ بيانات المنشأة
				</button>
			</div>
		</div>
	);
}
