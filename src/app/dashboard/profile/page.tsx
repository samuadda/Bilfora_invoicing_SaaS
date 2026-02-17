"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
	User,
	Mail,
	Phone,
	Camera,
	MapPin,
	Building2,
	Calendar,
	Save,
	AlertCircle,
	CheckCircle,
	Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { IS_ZATCA_ENABLED } from "@/config/features";
import {
	Profile,
	UpdateProfileInput,
	Gender,
	AccountType,
} from "@/types/database";
import { m } from "framer-motion";
import LoadingState from "@/components/LoadingState";
import { Heading, Text, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { getAuthErrorMessage } from "@/utils/error-handling";


export default function ProfilePage() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [emailSaving, setEmailSaving] = useState(false);
	const [passwordSaving, setPasswordSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [avatarError, setAvatarError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [emailInput, setEmailInput] = useState("");
	const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

	// Form state
	const [formData, setFormData] = useState({
		full_name: "",
		phone: "",
		dob: "",
		gender: "" as Gender | "",
		account_type: "individual" as AccountType,
		company_name: "",
		tax_number: "",
		address: "",
		city: "",
	});

	// Load user profile on component mount
	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
		try {
			setLoading(true);
			setError(null);

			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();

			if (error) {
				console.error("Error loading profile:", error);
				setError("فشل في تحميل الملف الشخصي");
				return;
			}

			if (data) {
				setProfile(data);
				setFormData({
					full_name: data.full_name || "",
					phone: data.phone || "",
					dob: data.dob || "",
					gender: data.gender || "",
					account_type: data.account_type || "individual",
					company_name: data.company_name || "",
					tax_number: data.tax_number || "",
					address: data.address || "",
					city: data.city || "",
				});
				setEmailInput(user!.email || "");
			}
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		setError(null);
		setSuccess(null);
	};

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setSaving(true);
			setAvatarError(null);
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error("غير مسجل");

			const fileExt = file.name.split(".").pop();
			const filePath = `${user.id}/${Date.now()}.${fileExt}`;

			const { error: uploadError } = await supabase.storage
				.from("avatars")
				.upload(filePath, file, { upsert: true });
			if (uploadError) throw uploadError;

			const { data: publicUrlData } = supabase.storage
				.from("avatars")
				.getPublicUrl(filePath);

			const avatarUrl = publicUrlData.publicUrl;

			const { error: updateError } = await supabase
				.from("profiles")
				.update({ avatar_url: avatarUrl })
				.eq("id", user.id);
			if (updateError) throw updateError;

			await loadProfile();
			setSuccess("تم تحديث الصورة الشخصية");
		} catch (err: unknown) {
			console.error("Avatar upload error:", err);
			setAvatarError(getAuthErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	const handleSavePersonalInfo = async (e: React.FormEvent) => {
		e.preventDefault();
		await saveProfile({
			full_name: formData.full_name,
			phone: formData.phone,
			dob: formData.dob,
			gender: formData.gender || null,
			account_type: formData.account_type,
		});
	};

	const handleSaveBusinessInfo = async (e: React.FormEvent) => {
		e.preventDefault();
		await saveProfile({
			company_name: formData.company_name,
			tax_number: formData.tax_number,
		});
	};

	const handleSaveAddress = async (e: React.FormEvent) => {
		e.preventDefault();
		await saveProfile({
			address: formData.address,
			city: formData.city,
		});
	};

	const saveProfile = async (updates: Partial<UpdateProfileInput>) => {
		if (!profile) return;

		try {
			setSaving(true);
			setError(null);

			const { error } = await supabase
				.from("profiles")
				.update(updates)
				.eq("id", profile.id);

			if (error) {
				console.error("Error updating profile:", error);
				setError("فشل في حفظ التغييرات");
				return;
			}

			setSuccess("تم حفظ التغييرات بنجاح");
			await loadProfile();
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		} finally {
			setSaving(false);
		}
	};

	const handleEmailUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		e.stopPropagation();

		setEmailSaving(true);
		setEmailError(null);
		setSuccess(null);

		// Validate email - same rules as registration
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailInput.trim()) {
			setEmailError("البريد الإلكتروني مطلوب");
			setEmailSaving(false);
			return;
		}
		if (!emailRegex.test(emailInput.trim())) {
			setEmailError("البريد الإلكتروني غير صالح");
			setEmailSaving(false);
			return;
		}

		// Check if email is different from current
		const { data: { user } } = await supabase.auth.getUser();
		if (user?.email && emailInput.trim().toLowerCase() === user.email.toLowerCase()) {
			setEmailError("البريد الإلكتروني الجديد يجب أن يكون مختلفاً عن الحالي");
			setEmailSaving(false);
			return;
		}

		try {
			// Get the current origin for redirect URL
			const redirectUrl = typeof window !== 'undefined'
				? `${window.location.origin}/dashboard/profile?email_confirmed=true`
				: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/dashboard/profile?email_confirmed=true`;

			// Update user email - Supabase will automatically send confirmation email
			const { data, error: updateError } = await supabase.auth.updateUser(
				{
					email: emailInput.trim()
				},
				{
					emailRedirectTo: redirectUrl
				}
			);

			if (updateError) {
				console.error("Email update error details:", updateError);
				setEmailError(getAuthErrorMessage(updateError));
				setEmailSaving(false);
				return;
			}

			// Check if update was successful
			if (data?.user) {
				// The email will be in email_change_token until confirmed
				// Supabase should automatically send confirmation email
				console.log("Email update initiated. Confirmation email should be sent to:", emailInput.trim());
				setSuccess("تم إرسال رابط تأكيد إلى البريد الجديد. الرجاء التحقق من بريدك الإلكتروني (والبريد العشوائي) والنقر على الرابط لتأكيد التغيير.");
				setEmailInput("");
			} else {
				setEmailError("حدث خطأ أثناء تحديث البريد الإلكتروني");
			}
		} catch (err: unknown) {
			console.error("Email update error:", err);
			setEmailError(getAuthErrorMessage(err));
		} finally {
			setEmailSaving(false);
		}
	};

	const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		e.stopPropagation();

		setPasswordSaving(true);
		setPasswordError(null);
		setSuccess(null);

		// Validate current password
		if (!passwords.current) {
			setPasswordError("كلمة المرور الحالية مطلوبة");
			setPasswordSaving(false);
			return;
		}

		// Validate new password - same rules as registration
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
		if (!passwords.newPass) {
			setPasswordError("كلمة المرور الجديدة مطلوبة");
			setPasswordSaving(false);
			return;
		}
		if (!passwordRegex.test(passwords.newPass)) {
			setPasswordError("كلمة المرور يجب أن تكون 8 خانات على الأقل، وتحتوي على حرف ورقم على الأقل");
			setPasswordSaving(false);
			return;
		}

		// Validate confirmation
		if (!passwords.confirm) {
			setPasswordError("تأكيد كلمة المرور مطلوب");
			setPasswordSaving(false);
			return;
		}
		if (passwords.newPass !== passwords.confirm) {
			setPasswordError("كلمات المرور غير متطابقة");
			setPasswordSaving(false);
			return;
		}

		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user || !user.email) {
				throw new Error("غير مسجل دخول");
			}

			// Verify current password
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: user.email,
				password: passwords.current
			});

			if (signInError) {
				setPasswordError("كلمة المرور الحالية غير صحيحة");
				setPasswordSaving(false);
				return;
			}

			// Update password
			const { error: updateError } = await supabase.auth.updateUser({
				password: passwords.newPass
			});

			if (updateError) {
				throw updateError;
			}

			setSuccess("تم تغيير كلمة المرور بنجاح");
			setPasswords({ current: "", newPass: "", confirm: "" });
		} catch (err: unknown) {
			console.error("Password change error:", err);
			setPasswordError(getAuthErrorMessage(err));
		} finally {
			setPasswordSaving(false);
		}
	};

	const calculateCompletionPercent = () => {
		const fields = [formData.full_name, formData.phone, formData.dob, formData.gender, formData.account_type, formData.city, formData.address];
		let total = fields.length;
		let filled = fields.filter(Boolean).length;
		if (formData.account_type === "business") {
			total += 1;
			if (formData.company_name) filled += 1;
		}
		return Math.round((filled / total) * 100);
	};
	const completionPercent = calculateCompletionPercent();

	if (loading) {
		return <LoadingState message="جاري تحميل الملف الشخصي..." />;
	}

	return (
		<div className="space-y-6 pb-10">
			{/* Success/Error Messages */}
			{success && (
				<m.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
				>
					<CheckCircle className="h-5 w-5 text-green-600" />
					<p className="text-green-800 font-medium">{success}</p>
				</m.div>
			)}
			{error && (
				<m.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
				>
					<AlertCircle className="h-5 w-5 text-red-600" />
					<p className="text-red-800 font-medium">{error}</p>
					<button
						onClick={loadProfile}
						className="mr-auto text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg transition-colors"
					>
						إعادة المحاولة
					</button>
				</m.div>
			)}

			{/* Header */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 md:justify-between"
			>
				<div className="flex items-center gap-6 w-full md:w-auto">
					<div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gray-50">
						<Image
							src={profile?.avatar_url || "/symbol-shadowNoBg.png"}
							alt="Avatar"
							fill
							sizes="96px"
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
							<label className="cursor-pointer text-white flex flex-col items-center">
								<Camera size={20} />
								<span className="text-[10px] font-bold mt-1">تغيير</span>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleAvatarChange}
								/>
							</label>
						</div>
					</div>
					<div className="flex-1">
						<Heading variant="h1" className="text-2xl md:text-3xl">
							{profile?.full_name || "الملف الشخصي"}
						</Heading>
						<Text variant="body-small" color="muted" className="mt-1">
							{profile?.account_type === "business" ? "حساب أعمال" : "حساب فردي"}
						</Text>
						{avatarError && (
							<p className="mt-2 text-sm text-red-600 font-medium">{avatarError}</p>
						)}
						<div className="mt-3 max-w-[200px]">
							<div className="flex justify-between text-xs text-gray-500 mb-1">
								<span>اكتمال الملف</span>
								<span className="font-bold text-[#7f2dfb]">{completionPercent}%</span>
							</div>
							<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
								<m.div
									initial={{ width: 0 }}
									animate={{ width: `${completionPercent}%` }}
									transition={{ duration: 1, ease: "easeOut" }}
									className="h-full bg-gradient-to-r from-[#7f2dfb] to-purple-400"
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="flex gap-3 w-full md:w-auto">
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
						className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors w-full md:w-auto"
					>
						تصدير البيانات
					</button>
				</div>
			</m.div>

			{/* Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left column: profile forms */}
				<m.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.1 }}
					className="lg:col-span-2 space-y-6"
				>
					{/* Personal info */}
					<form
						onSubmit={handleSavePersonalInfo}
						className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
					>
						<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
							<User className="text-[#7f2dfb]" size={24} />
							المعلومات الشخصية
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									الاسم الكامل *
								</label>
								<div className="relative">
									<User
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={18}
									/>
									<input
										name="full_name"
										value={formData.full_name}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
										placeholder="أدخل اسمك"
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									رقم الجوال *
								</label>
								<div className="relative">
									<Phone
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={18}
									/>
									<input
										name="phone"
										value={formData.phone}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
										placeholder="9665xxxxxxxx"
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									تاريخ الميلاد *
								</label>
								<div className="relative">
									<Calendar
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={18}
									/>
									<input
										name="dob"
										type="date"
										value={formData.dob}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									الجنس
								</label>
								<div className="relative">
									<Select
										value={formData.gender || ""}
										onValueChange={(val) => {
											setFormData(prev => ({ ...prev, gender: val as Gender }));
											setError(null);
											setSuccess(null);
										}}
									>
										<SelectTrigger className="w-full h-11 bg-white border-gray-200">
											<SelectValue placeholder="اختر الجنس" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="male">ذكر</SelectItem>
											<SelectItem value="female">أنثى</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									نوع الحساب *
								</label>
								<div className="relative">
									<Select
										value={formData.account_type}
										onValueChange={(val) => {
											setFormData(prev => ({ ...prev, account_type: val as AccountType }));
											setError(null);
											setSuccess(null);
										}}
									>
										<SelectTrigger className="w-full h-11 bg-white border-gray-200">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="individual">فرد</SelectItem>
											<SelectItem value="business">مؤسسة</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-50">
							<button
								type="submit"
								disabled={saving}
								className="px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
							>
								{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
								حفظ المعلومات
							</button>
						</div>
					</form>

					{/* Business info */}
					<form
						onSubmit={handleSaveBusinessInfo}
						className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
					>
						<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
							<Building2 className="text-[#7f2dfb]" size={24} />
							المعلومات التجارية
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									اسم الشركة
								</label>
								<div className="relative">
									<Building2
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={18}
									/>
									<input
										name="company_name"
										value={formData.company_name}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
										placeholder="اسم الشركة"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									{IS_ZATCA_ENABLED ? "الرقم الضريبي" : "السجل التجاري"}
								</label>
								<div className="relative">
									<Building2
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={18}
									/>
									<input
										name="tax_number"
										value={formData.tax_number}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
										placeholder={IS_ZATCA_ENABLED ? "3xxxxxxxxxxxxx3" : "1010xxxxxx"}
									/>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-50">
							<button
								type="submit"
								disabled={saving}
								className="px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
							>
								{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
								حفظ
							</button>
						</div>
					</form>

					{/* Address */}
					<form
						onSubmit={handleSaveAddress}
						className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
					>
						<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
							<MapPin className="text-[#7f2dfb]" size={24} />
							العنوان
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									المدينة
								</label>
								<div className="relative">
									<MapPin
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={18}
									/>
									<input
										name="city"
										value={formData.city}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
										placeholder="الرياض"
									/>
								</div>
							</div>
							<div className="md:col-span-2 space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									العنوان التفصيلي
								</label>
								<input
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
									placeholder="اسم الشارع، رقم المبنى، الحي"
								/>
							</div>
						</div>
						<div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-50">
							<button
								type="submit"
								disabled={saving}
								className="px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
							>
								{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
								حفظ العنوان
							</button>
						</div>
					</form>

					{/* Email & Password */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form onSubmit={handleEmailUpdate} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
							<h2 className="text-lg font-bold text-[#012d46] mb-6 flex items-center gap-2">
								<Mail className="text-[#7f2dfb]" size={20} />
								البريد الإلكتروني
							</h2>
							{emailError && (
								<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
									<p className="text-red-800 text-sm font-medium">{emailError}</p>
								</div>
							)}
							{success && success.includes("رابط تأكيد") && (
								<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
									<p className="text-green-800 text-sm font-medium">{success}</p>
								</div>
							)}
							<div className="space-y-4">
								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">البريد الجديد</label>
									<input
										value={emailInput}
										onChange={(e) => setEmailInput(e.target.value)}
										className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
										type="email"
										required
										disabled={emailSaving}
										placeholder="example@domain.com"
									/>
									<p className="text-xs text-gray-500">سيتم إرسال رابط تأكيد إلى البريد الجديد</p>
								</div>
								<button
									type="submit"
									disabled={emailSaving}
									className="w-full py-2.5 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{emailSaving ? (
										<>
											<Loader2 size={18} className="animate-spin" />
											جاري التحديث...
										</>
									) : (
										<>
											<Save size={18} />
											تحديث البريد
										</>
									)}
								</button>
							</div>
						</form>

						<form onSubmit={handlePasswordChange} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
							<h2 className="text-lg font-bold text-[#012d46] mb-6 flex items-center gap-2">
								<Building2 className="text-[#7f2dfb]" size={20} />
								تغيير كلمة المرور
							</h2>
							{passwordError && (
								<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
									<p className="text-red-800 text-sm font-medium">{passwordError}</p>
								</div>
							)}

							{success && success.includes("كلمة المرور") && (
								<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
									<p className="text-green-800 text-sm font-medium">{success}</p>
								</div>
							)}
							<div className="space-y-4">
								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">كلمة المرور الحالية</label>
									<input
										type="password"
										value={passwords.current}
										onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
										className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
										required
										disabled={passwordSaving}
									/>
								</div>
								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">الجديدة</label>
									<input
										type="password"
										value={passwords.newPass}
										onChange={(e) => setPasswords(p => ({ ...p, newPass: e.target.value }))}
										className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
										required
										disabled={passwordSaving}
										placeholder="8 أحرف على الأقل، حرف ورقم"
									/>
									<p className="text-xs text-gray-500">يجب أن تكون 8 خانات على الأقل، وتحتوي على حرف ورقم على الأقل</p>
								</div>
								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">تأكيد الجديدة</label>
									<input
										type="password"
										value={passwords.confirm}
										onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
										className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
										required
										disabled={passwordSaving}
									/>
								</div>
								<button
									type="submit"
									disabled={passwordSaving}
									className="w-full py-2.5 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{passwordSaving ? (
										<>
											<Loader2 size={18} className="animate-spin" />
											جاري الحفظ...
										</>
									) : (
										<>
											<Save size={18} />
											حفظ كلمة المرور
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</m.div>

				{/* Right column: public profile preview */}
				<m.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
					className="space-y-6"
				>
					{/* Profile info summary */}
					<div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-6">
						<h3 className="text-lg font-bold text-[#012d46] mb-4">
							ملخص المعلومات
						</h3>
						<div className="space-y-4 text-sm">
							<div className="flex justify-between items-center py-2 border-b border-gray-50">
								<span className="text-gray-500">الاسم</span>
								<span className="font-bold text-gray-900">
									{profile?.full_name || "غير محدد"}
								</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-gray-50">
								<span className="text-gray-500">الجوال</span>
								<span className="font-bold text-gray-900" style={{ direction: "ltr" }}>
									{profile?.phone || "غير محدد"}
								</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-gray-50">
								<span className="text-gray-500">
									نوع الحساب
								</span>
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-[#7f2dfb]">
									{profile?.account_type === "business" ? "مؤسسة" : "فرد"}
								</span>
							</div>
							{profile?.company_name && (
								<div className="flex justify-between items-center py-2 border-b border-gray-50">
									<span className="text-gray-500">
										الشركة
									</span>
									<span className="font-bold text-gray-900">
										{profile?.company_name}
									</span>
								</div>
							)}
							{profile?.city && (
								<div className="flex justify-between items-center py-2 border-b border-gray-50">
									<span className="text-gray-500">
										المدينة
									</span>
									<span className="font-bold text-gray-900">
										{profile?.city}
									</span>
								</div>
							)}
							<div className="pt-4 text-xs text-gray-400 text-center">
								آخر تحديث: {new Date().toLocaleDateString("en-GB")}
							</div>
						</div>
					</div>
				</m.div>
			</div>
		</div>
	);
}
