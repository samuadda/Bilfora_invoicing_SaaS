"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
	User,
	Mail,
	Phone,
	Camera,
	Calendar,
	Save,
	AlertCircle,
	CheckCircle,
	Loader2,
	Lock,
	Trash2,
	Download,
	Building2,
	MapPin
} from "lucide-react";
import { supabasePersistent } from "@/lib/supabase-clients";
import { Profile, UpdateProfileInput, Gender, AccountType } from "@/types/database";
import { m } from "framer-motion";
import LoadingState from "@/components/LoadingState";
import { Heading, Text, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { getAuthErrorMessage } from "@/utils/error-handling";
import { IS_ZATCA_ENABLED } from "@/config/features";
import { updateSettingsAction } from "@/actions/settings";
import { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";

export default function GeneralSettingsPage() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [emailSaving, setEmailSaving] = useState(false);
	const [passwordSaving, setPasswordSaving] = useState(false);
	const [error, setError] = useState<string | null>(null); // Global/Loading error
	const [avatarError, setAvatarError] = useState<string | null>(null);
	const [personalInfoError, setPersonalInfoError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [emailInput, setEmailInput] = useState("");
	const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

	// Profile fields (from profiles table)
	const [accountType, setAccountType] = useState<AccountType>("individual");
	const [companyName, setCompanyName] = useState("");
	const [taxNumber, setTaxNumber] = useState("");
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");

	// Invoice settings fields
	const [initialInvoiceSettings, setInitialInvoiceSettings] = useState<InvoiceSettings | null>(null);
	const [addressLine, setAddressLine] = useState("");
	const [invoiceCity, setInvoiceCity] = useState("");

	const [formData, setFormData] = useState({
		full_name: "",
		phone: "",
		dob: "",
		gender: "" as Gender | "",
	});

	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
		setLoading(true);
		setError(null);
		try {
			const { data: { user } } = await supabasePersistent.auth.getUser();
			if (!user) throw new Error("غير مسجل");
			const { data, error: fetchError } = await supabasePersistent
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();
			if (fetchError) throw fetchError;
			const p = data as Profile;

			// Fetch invoice settings
			const { data: invoiceData, error: invoiceError } = await supabasePersistent
				.from("invoice_settings")
				.select("*")
				.eq("user_id", user.id)
				.maybeSingle();

			if (!invoiceError && invoiceData) {
				setInitialInvoiceSettings(invoiceData as InvoiceSettings);
				setAddressLine(invoiceData.address_line1 || "");
				setInvoiceCity(invoiceData.city || "");
			}
			setProfile(p);
			setFormData({
				full_name: p.full_name || "",
				phone: p.phone || "",
				dob: p.dob || "",
				gender: (p.gender as Gender) || "",
			});
			setAccountType(p.account_type || "individual");
			setCompanyName(p.company_name || "");
			setTaxNumber(p.tax_number || "");
			setAddress(p.address || "");
			setCity(p.city || "");

		} catch (err) {
			setError(getAuthErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	const handleSaveBusinessInfo = async () => {
		setSaving(true);
		setError(null);
		setSuccess(null);
		try {
			const { data: { user } } = await supabasePersistent.auth.getUser();
			if (!user) throw new Error("غير مسجل");

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
				.eq("id", user.id);
			if (profileError) throw profileError;

			// Save invoice settings fields
			const result = await updateSettingsAction({
				seller_name: initialInvoiceSettings?.seller_name ?? "My Business",
				vat_number: initialInvoiceSettings?.vat_number ?? "300000000000003",
				cr_number: initialInvoiceSettings?.cr_number ?? null,
				address_line1: addressLine || null,
				city: invoiceCity || null,
				logo_url: initialInvoiceSettings?.logo_url ?? null,
				iban: initialInvoiceSettings?.iban ?? null,
				invoice_footer: initialInvoiceSettings?.invoice_footer ?? null,
				default_vat_rate: initialInvoiceSettings?.default_vat_rate ?? 0,
				numbering_prefix: initialInvoiceSettings?.numbering_prefix ?? "INV-",
				currency: "SAR" as const,
				timezone: "Asia/Riyadh",
				brand_color: initialInvoiceSettings?.brand_color ?? null,
				default_terms: initialInvoiceSettings?.default_terms ?? "Net 30",
				bank_name: initialInvoiceSettings?.bank_name ?? null,
				payment_notes: initialInvoiceSettings?.payment_notes ?? null,
			});

			if (!result.success) {
				setError(result.error || "خطأ في حفظ إعدادات الفواتير");
				return;
			}

			// Update local profile state
			setProfile((prev) => prev ? { 
				...prev, 
				account_type: accountType,
				company_name: companyName || null,
				tax_number: taxNumber || null,
				address: address || null,
				city: city || null
			} as Profile : prev);

			setSuccess("تم حفظ بيانات المنشأة بنجاح ✓");
		} catch (err) {
			setError(getAuthErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError(null);
		setSuccess(null);
	};

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !profile) return;
		setSaving(true);
		setAvatarError(null);
		try {
			const filePath = `${profile.id}/${Date.now()}-${file.name}`;
			const { error: uploadError } = await supabasePersistent.storage
				.from("avatars")
				.upload(filePath, file, { upsert: true });
			if (uploadError) {
				if (uploadError.message?.includes("Bucket not found")) {
					setAvatarError("لم يتم إعداد مخزن الصور بعد. تواصل مع الدعم الفني.");
				} else {
					setAvatarError("فشل رفع الصورة: " + uploadError.message);
				}
				return;
			}
			const { data: urlData } = supabasePersistent.storage
				.from("avatars")
				.getPublicUrl(filePath);
			
			const err = await saveProfile({ avatar_url: urlData.publicUrl });
			if (err) setAvatarError(err);
			else setSuccess("تم تحديث الصورة الشخصية");
		} catch (err) {
			setAvatarError(getAuthErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	const handleSavePersonalInfo = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setPersonalInfoError(null);
		const err = await saveProfile({
			full_name: formData.full_name,
			phone: formData.phone,
			dob: formData.dob,
			gender: formData.gender as Gender,
		});
		if (err) setPersonalInfoError(err);
		setSaving(false);
	};

	const saveProfile = async (updates: Partial<UpdateProfileInput>): Promise<string | null> => {
		setSuccess(null);
		try {
			const { data: { user } } = await supabasePersistent.auth.getUser();
			if (!user) throw new Error("غير مسجل");
			const { error: updateError } = await supabasePersistent
				.from("profiles")
				.update(updates)
				.eq("id", user.id);
			if (updateError) throw updateError;
			setProfile((prev) => prev ? { ...prev, ...updates } as Profile : prev);
			setSuccess("تم حفظ التغييرات بنجاح ✓");
			return null;
		} catch (err) {
			return getAuthErrorMessage(err);
		}
	};

	const handleEmailUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setEmailSaving(true);
		setEmailError(null);
		setSuccess(null);
		try {
			if (!emailInput || !emailInput.includes("@")) {
				setEmailError("البريد الإلكتروني غير صالح");
				return;
			}
			const { data: { user } } = await supabasePersistent.auth.getUser();
			if (!user) throw new Error("غير مسجل");
			if (emailInput === user.email) {
				setEmailError("البريد الجديد مطابق للبريد الحالي");
				return;
			}
			const { error: updateError } = await supabasePersistent.auth.updateUser({ email: emailInput });
			if (updateError) {
				setEmailError(getAuthErrorMessage(updateError));
				return;
			}
			setSuccess("تم إرسال رابط تأكيد إلى البريد الجديد. تفقد صندوق الوارد.");
			setEmailInput("");
		} catch (err) {
			setEmailError(getAuthErrorMessage(err));
		} finally {
			setEmailSaving(false);
		}
	};

	const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setPasswordSaving(true);
		setPasswordError(null);
		setSuccess(null);
		try {
			if (passwords.newPass !== passwords.confirm) {
				setPasswordError("كلمة المرور الجديدة غير متطابقة مع التأكيد");
				return;
			}
			if (passwords.newPass.length < 8) {
				setPasswordError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
				return;
			}
			if (!/\d/.test(passwords.newPass) || !/[a-zA-Z]/.test(passwords.newPass)) {
				setPasswordError("كلمة المرور يجب أن تحتوي على حرف ورقم على الأقل");
				return;
			}
			const { error: signInError } = await supabasePersistent.auth.signInWithPassword({
				email: (await supabasePersistent.auth.getUser()).data.user?.email || "",
				password: passwords.current,
			});
			if (signInError) {
				setPasswordError("كلمة المرور الحالية غير صحيحة");
				return;
			}
			const { error: updateError } = await supabasePersistent.auth.updateUser({ password: passwords.newPass });
			if (updateError) {
				setPasswordError(getAuthErrorMessage(updateError));
				return;
			}
			setSuccess("تم تغيير كلمة المرور بنجاح ✓");
			setPasswords({ current: "", newPass: "", confirm: "" });
		} catch (err) {
			setPasswordError(getAuthErrorMessage(err));
		} finally {
			setPasswordSaving(false);
		}
	};



	if (loading) {
		return <LoadingState message="جاري تحميل البيانات..." />;
	}

	return (
		<div className="space-y-6">
			{/* Success/Error Messages */}
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

			{/* Avatar & Name Header */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-5">
				<div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gray-50 shrink-0">
					<Image
						src={profile?.avatar_url || "/symbol-shadowNoBg.png"}
						alt="Avatar"
						fill
						sizes="80px"
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
						<label className="cursor-pointer text-white flex flex-col items-center">
							<Camera size={18} />
							<span className="text-[10px] font-bold mt-0.5">تغيير</span>
							<input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
						</label>
					</div>
				</div>
				<div className="flex-1">
					<Heading variant="h1" className="text-xl md:text-2xl">{profile?.full_name || "الملف الشخصي"}</Heading>
					<Text variant="body-small" color="muted" className="mt-0.5">
						{profile?.account_type === "business" ? "حساب أعمال" : "حساب فردي"}
					</Text>
					{avatarError && (
						<p className="mt-2 text-sm text-red-600 font-medium">{avatarError}</p>
					)}
				</div>
			</div>

			{/* Personal Info */}
			<form onSubmit={handleSavePersonalInfo} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<User className="text-[#7f2dfb]" size={20} />
					المعلومات الشخصية
				</h2>
				{personalInfoError && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-800 text-sm font-medium">{personalInfoError}</p></div>
				)}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">الاسم الكامل *</label>
						<div className="relative">
							<User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input name="full_name" value={formData.full_name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="أدخل اسمك" required />
						</div>
					</div>
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">رقم الجوال *</label>
						<div className="relative">
							<Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" placeholder="9665xxxxxxxx" required />
						</div>
					</div>
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">تاريخ الميلاد *</label>
						<div className="relative">
							<Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input name="dob" type="date" value={formData.dob} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" required />
						</div>
					</div>
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">الجنس</label>
						<Select value={formData.gender || ""} onValueChange={(val) => { setFormData(prev => ({ ...prev, gender: val as Gender })); setError(null); setSuccess(null); }}>
							<SelectTrigger className="w-full h-11 bg-white border-gray-200"><SelectValue placeholder="اختر الجنس" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="male">ذكر</SelectItem>
								<SelectItem value="female">أنثى</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="flex justify-end mt-5 pt-5 border-t border-gray-50">
					<button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center gap-2">
						{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
						حفظ المعلومات
					</button>
				</div>
			</form>

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

					{accountType === "business" && (
						<>
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
						</>
					)}
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
				<div className="flex justify-end mt-5 pt-5 border-t border-gray-50">
					<button onClick={handleSaveBusinessInfo} disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center gap-2">
						{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
						حفظ بيانات المنشأة
					</button>
				</div>
			</div>

			{/* Email & Password side by side */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Email */}
				<form onSubmit={handleEmailUpdate} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
					<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
						<Mail className="text-[#7f2dfb]" size={20} />
						البريد الإلكتروني
					</h2>
					{emailError && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-800 text-sm font-medium">{emailError}</p></div>
					)}
					{success && success.includes("رابط تأكيد") && (
						<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl"><p className="text-green-800 text-sm font-medium">{success}</p></div>
					)}
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">البريد الجديد</label>
							<input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" type="email" required disabled={emailSaving} placeholder="example@domain.com" />
							<p className="text-xs text-gray-500">سيتم إرسال رابط تأكيد إلى البريد الجديد</p>
						</div>
						<button type="submit" disabled={emailSaving} className="w-full py-2.5 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
							{emailSaving ? <><Loader2 size={18} className="animate-spin" />جاري التحديث...</> : <><Save size={18} />تحديث البريد</>}
						</button>
					</div>
				</form>

				{/* Password */}
				<form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
					<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
						<Lock className="text-[#7f2dfb]" size={20} />
						تغيير كلمة المرور
					</h2>
					{passwordError && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-800 text-sm font-medium">{passwordError}</p></div>
					)}
					{success && success.includes("كلمة المرور") && (
						<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl"><p className="text-green-800 text-sm font-medium">{success}</p></div>
					)}
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">كلمة المرور الحالية</label>
							<input type="password" value={passwords.current} onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" required disabled={passwordSaving} />
						</div>
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">الجديدة</label>
							<input type="password" value={passwords.newPass} onChange={(e) => setPasswords(p => ({ ...p, newPass: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" required disabled={passwordSaving} placeholder="8 أحرف على الأقل، حرف ورقم" />
							<p className="text-xs text-gray-500">يجب أن تكون 8 خانات على الأقل، وتحتوي على حرف ورقم على الأقل</p>
						</div>
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">تأكيد الجديدة</label>
							<input type="password" value={passwords.confirm} onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all" required disabled={passwordSaving} />
						</div>
						<button type="submit" disabled={passwordSaving} className="w-full py-2.5 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
							{passwordSaving ? <><Loader2 size={18} className="animate-spin" />جاري الحفظ...</> : <><Save size={18} />حفظ كلمة المرور</>}
						</button>
					</div>
				</form>
			</div>



			{/* Danger Zone */}
			<div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-red-600 mb-2">منطقة الخطر</h2>
				<p className="text-sm text-gray-500 mb-5">الرجاء استخدام هذه الإجراءات بحذر، لا يمكن التراجع عنها.</p>
				<div className="flex flex-col sm:flex-row gap-3">
					<button className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
						<Trash2 size={16} />
						حذف الحساب نهائياً
					</button>
					<button
						onClick={() => {
							const blob = new Blob([JSON.stringify({ profile, formData }, null, 2)], { type: "application/json" });
							const url = URL.createObjectURL(blob);
							const a = document.createElement("a");
							a.href = url;
							a.download = "my-profile-data.json";
							a.click();
							URL.revokeObjectURL(url);
						}}
						className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
					>
						<Download size={16} />
						تصدير كل البيانات
					</button>
				</div>
			</div>
		</div>
	);
}
