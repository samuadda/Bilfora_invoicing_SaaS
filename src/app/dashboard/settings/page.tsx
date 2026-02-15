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
	ShieldCheck,
} from "lucide-react";
import { supabasePersistent } from "@/lib/supabase-clients";
import { Profile, UpdateProfileInput, Gender } from "@/types/database";
import { m } from "framer-motion";
import LoadingState from "@/components/LoadingState";
import { Heading, Text, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";

export default function GeneralSettingsPage() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [emailSaving, setEmailSaving] = useState(false);
	const [passwordSaving, setPasswordSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [emailInput, setEmailInput] = useState("");
	const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

	// Security toggles (placeholder)
	const [twoFA, setTwoFA] = useState(false);
	const [alertLogins, setAlertLogins] = useState(true);

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
			setProfile(p);
			setFormData({
				full_name: p.full_name || "",
				phone: p.phone || "",
				dob: p.dob || "",
				gender: (p.gender as Gender) || "",
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطأ في تحميل البيانات");
		} finally {
			setLoading(false);
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
		setError(null);
		try {
			const filePath = `${profile.id}/${Date.now()}-${file.name}`;
			const { error: uploadError } = await supabasePersistent.storage
				.from("avatars")
				.upload(filePath, file, { upsert: true });
			if (uploadError) {
				if (uploadError.message?.includes("Bucket not found")) {
					setError("لم يتم إعداد مخزن الصور بعد. تواصل مع الدعم الفني.");
				} else {
					setError("فشل رفع الصورة: " + uploadError.message);
				}
				return;
			}
			const { data: urlData } = supabasePersistent.storage
				.from("avatars")
				.getPublicUrl(filePath);
			await saveProfile({ avatar_url: urlData.publicUrl });
			setProfile((prev) => prev ? { ...prev, avatar_url: urlData.publicUrl } : prev);
			setSuccess("تم تحديث الصورة الشخصية");
		} catch {
			setError("خطأ في رفع الصورة");
		} finally {
			setSaving(false);
		}
	};

	const handleSavePersonalInfo = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		await saveProfile({
			full_name: formData.full_name,
			phone: formData.phone,
			dob: formData.dob,
			gender: formData.gender as Gender,
		});
		setSaving(false);
	};

	const saveProfile = async (updates: Partial<UpdateProfileInput>) => {
		setError(null);
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
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطأ في الحفظ");
		}
	};

	const handleEmailUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setEmailSaving(true);
		setError(null);
		setSuccess(null);
		try {
			if (!emailInput || !emailInput.includes("@")) {
				setError("البريد الإلكتروني غير صالح");
				return;
			}
			const { data: { user } } = await supabasePersistent.auth.getUser();
			if (!user) throw new Error("غير مسجل");
			if (emailInput === user.email) {
				setError("البريد الجديد مطابق للبريد الحالي");
				return;
			}
			const { error: updateError } = await supabasePersistent.auth.updateUser({ email: emailInput });
			if (updateError) {
				if (updateError.message?.toLowerCase().includes("rate limit")) {
					setError("عدد المحاولات كثير. حاول بعد دقيقة.");
				} else if (updateError.message?.toLowerCase().includes("same")) {
					setError("البريد الجديد مطابق للبريد الحالي");
				} else {
					setError("فشل تحديث البريد: " + updateError.message);
				}
				return;
			}
			setSuccess("تم إرسال رابط تأكيد إلى البريد الجديد. تفقد صندوق الوارد.");
			setEmailInput("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطأ في تحديث البريد الإلكتروني");
		} finally {
			setEmailSaving(false);
		}
	};

	const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setPasswordSaving(true);
		setError(null);
		setSuccess(null);
		try {
			if (passwords.newPass !== passwords.confirm) {
				setError("كلمة المرور الجديدة غير متطابقة مع التأكيد");
				return;
			}
			if (passwords.newPass.length < 8) {
				setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
				return;
			}
			if (!/\d/.test(passwords.newPass) || !/[a-zA-Z]/.test(passwords.newPass)) {
				setError("كلمة المرور يجب أن تحتوي على حرف ورقم على الأقل");
				return;
			}
			const { error: signInError } = await supabasePersistent.auth.signInWithPassword({
				email: (await supabasePersistent.auth.getUser()).data.user?.email || "",
				password: passwords.current,
			});
			if (signInError) {
				setError("كلمة المرور الحالية غير صحيحة");
				return;
			}
			const { error: updateError } = await supabasePersistent.auth.updateUser({ password: passwords.newPass });
			if (updateError) {
				if (updateError.message?.toLowerCase().includes("same")) {
					setError("كلمة المرور الجديدة لا يمكن أن تكون نفس كلمة المرور الحالية");
				} else {
					setError("فشل تغيير كلمة المرور: " + updateError.message);
				}
				return;
			}
			setSuccess("تم تغيير كلمة المرور بنجاح ✓");
			setPasswords({ current: "", newPass: "", confirm: "" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطأ في تغيير كلمة المرور");
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
				</div>
			</div>

			{/* Personal Info */}
			<form onSubmit={handleSavePersonalInfo} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<User className="text-[#7f2dfb]" size={20} />
					المعلومات الشخصية
				</h2>
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

			{/* Email & Password side by side */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Email */}
				<form onSubmit={handleEmailUpdate} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
					<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
						<Mail className="text-[#7f2dfb]" size={20} />
						البريد الإلكتروني
					</h2>
					{error && error.includes("البريد") && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-800 text-sm font-medium">{error}</p></div>
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
					{error && error.includes("كلمة المرور") && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-800 text-sm font-medium">{error}</p></div>
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

			{/* Security Toggles */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-[#012d46] mb-5 flex items-center gap-2">
					<ShieldCheck className="text-[#7f2dfb]" size={20} />
					الأمان والحماية
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-green-100 text-green-600 rounded-lg"><ShieldCheck size={18} /></div>
							<div>
								<p className="text-sm font-bold text-gray-900">التحقق بخطوتين (2FA)</p>
								<p className="text-xs text-gray-500">حماية إضافية لحسابك</p>
							</div>
						</div>
						<label className="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} className="sr-only peer" />
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7f2dfb]"></div>
						</label>
					</div>
					<div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Lock size={18} /></div>
							<div>
								<p className="text-sm font-bold text-gray-900">تنبيهات الدخول</p>
								<p className="text-xs text-gray-500">تنبيه عند تسجيل الدخول من جهاز جديد</p>
							</div>
						</div>
						<label className="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" checked={alertLogins} onChange={(e) => setAlertLogins(e.target.checked)} className="sr-only peer" />
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7f2dfb]"></div>
						</label>
					</div>
				</div>
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
