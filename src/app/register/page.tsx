"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/dialog";
import { Eye, EyeClosed, Check, FileText, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		fullname: "",
		email: "",
		password: "",
	});

	const router = useRouter();
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState("");

	const validate = () => {
		const newErrors: Record<string, string> = {};
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

		if (!formData.fullname.trim()) newErrors.fullname = "الاسم مطلوب";
		if (!formData.email.trim()) newErrors.email = "البريد مطلوب";
		else if (!emailRegex.test(formData.email)) newErrors.email = "البريد غير صالح";
		if (!formData.password) newErrors.password = "كلمة المرور مطلوبة";
		else if (!passwordRegex.test(formData.password)) newErrors.password = "8 خانات على الأقل، حرف ورقم";

		return newErrors;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
		setGeneralError("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setIsLoading(true);
		setGeneralError("");

		try {
			const { error } = await supabase.auth.signUp({
				email: formData.email,
				password: formData.password,
				options: {
					emailRedirectTo: `${location.origin}/confirmed`,
					data: { full_name: formData.fullname },
				},
			});

			if (error) {
				if ((error as { code?: string }).code === "user_already_registered") {
					setGeneralError("هذا البريد مسجّل مسبقًا");
				} else {
					setGeneralError(error.message);
				}
				setFormData((p) => ({ ...p, password: "" }));
				return;
			}
			setShowConfirmModal(true);
		} catch {
			setGeneralError("حدث خطأ، حاول مرة أخرى");
		} finally {
			setIsLoading(false);
		}
	};

	const getPasswordStrength = (password: string) => {
		if (!password) return { strength: 0, color: "bg-gray-200", text: "" };
		let score = 0;
		if (password.length >= 8) score++;
		if (/[A-Za-z]/.test(password)) score++;
		if (/\d/.test(password)) score++;
		if (/[^A-Za-z\d]/.test(password)) score++;
		if (score <= 1) return { strength: score, color: "bg-red-500", text: "ضعيفة" };
		if (score === 2) return { strength: score, color: "bg-yellow-500", text: "متوسطة" };
		if (score === 3) return { strength: score, color: "bg-blue-500", text: "جيدة" };
		return { strength: score, color: "bg-green-500", text: "قوية" };
	};

	const passwordStrength = getPasswordStrength(formData.password);

	return (
		<div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center px-4 py-12">
			{/* Background decorations */}
			<div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#7f2dfb]/10 to-transparent rounded-full blur-3xl" />
			<div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-full blur-3xl" />
			
			{/* Floating shapes */}
			<m.div
				animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
				transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
				className="absolute top-20 left-[15%] w-16 h-16 bg-purple-100 rounded-2xl opacity-60"
			/>
			<m.div
				animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
				transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
				className="absolute top-40 right-[10%] w-12 h-12 bg-[#7f2dfb]/10 rounded-full"
			/>
			<m.div
				animate={{ y: [-5, 15, -5] }}
				transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
				className="absolute bottom-32 right-[20%] w-20 h-20 bg-purple-50 rounded-3xl opacity-70"
			/>

			{/* Logo */}
			<m.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				className="relative z-10 mb-8"
			>
				<Link href="/" className="flex items-center gap-2 group">
					<div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#7f2dfb] to-[#9f5dff] flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
						<FileText className="h-5 w-5 text-white" />
					</div>
					<span className="text-2xl font-black text-[#7f2dfb]">بِلفورا</span>
				</Link>
			</m.div>

			{/* Main Card */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="relative z-10 w-full max-w-md"
			>
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
					{/* Header with badge */}
					<div className="text-center mb-8">
						<m.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="inline-flex items-center gap-1.5 bg-purple-50 text-[#7f2dfb] text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
						>
							<Sparkles className="h-3.5 w-3.5" />
							<span>مجاني للأبد</span>
						</m.div>
						<h1 className="text-2xl font-bold text-[#012d46] mb-2">
							أنشئ حسابك
						</h1>
						<p className="text-gray-500 text-sm">
							وابدأ بإصدار فواتيرك في ثوانٍ
						</p>
					</div>

					{/* Error */}
					{generalError && (
						<m.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl"
						>
							<p className="text-red-600 text-sm text-center">{generalError}</p>
						</m.div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Name */}
						<div>
							<label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
								الاسم
							</label>
							<input
								type="text"
								id="fullname"
								name="fullname"
								value={formData.fullname}
								onChange={handleChange}
								placeholder="اسمك أو اسم منشأتك"
								className={cn(
									"block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb] transition-all text-sm",
									errors.fullname && "border-red-200 focus:border-red-500 focus:ring-red-500/20"
								)}
							/>
							{errors.fullname && <p className="mt-1.5 text-xs text-red-500">{errors.fullname}</p>}
						</div>

						{/* Email */}
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								البريد الإلكتروني
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="you@example.com"
								dir="ltr"
								className={cn(
									"block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb] transition-all text-sm text-left",
									errors.email && "border-red-200 focus:border-red-500 focus:ring-red-500/20"
								)}
							/>
							{errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
						</div>

						{/* Password */}
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								كلمة المرور
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									id="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="••••••••"
									dir="ltr"
									className={cn(
										"block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb] transition-all text-sm text-left",
										errors.password && "border-red-200 focus:border-red-500 focus:ring-red-500/20"
									)}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((s) => !s)}
									className="absolute inset-y-0 left-3 flex items-center text-gray-400 hover:text-gray-600"
								>
									{showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
								</button>
							</div>

							{formData.password && (
								<div className="mt-2.5 flex items-center gap-2">
									<div className="flex gap-1 flex-1">
										{[1, 2, 3, 4].map((level) => (
											<div
												key={level}
												className={`h-1.5 flex-1 rounded-full transition-colors ${
													level <= passwordStrength.strength ? passwordStrength.color : "bg-gray-200"
												}`}
											/>
										))}
									</div>
									<span className="text-xs text-gray-500 font-medium">{passwordStrength.text}</span>
								</div>
							)}
							{errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
						</div>

						{/* Submit */}
						<m.button
							type="submit"
							disabled={isLoading}
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
							className="w-full bg-gradient-to-r from-[#7f2dfb] to-[#9f5dff] hover:from-[#6a1fd8] hover:to-[#8a4de8] text-white font-semibold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
						>
							{isLoading ? (
								<>
									<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									<span>جاري الإنشاء...</span>
								</>
							) : (
								<>
									<span>أنشئ حسابي</span>
									<ArrowRight className="h-4 w-4" />
								</>
							)}
						</m.button>
					</form>

					{/* Divider */}
					<div className="my-6 flex items-center gap-4">
						<div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
					</div>

					{/* Login link */}
					<p className="text-center text-sm text-gray-500">
						عندك حساب؟{" "}
						<Link href="/login" className="font-semibold text-[#7f2dfb] hover:underline">
							سجل دخولك
						</Link>
					</p>
				</div>

				{/* Footer */}
				<p className="text-center text-xs text-gray-400 mt-6">
					بإنشاء حسابك، أنت توافق على{" "}
					<Link href="/terms" className="underline hover:text-gray-600">الشروط</Link>
					{" "}و{" "}
					<Link href="/privacy" className="underline hover:text-gray-600">الخصوصية</Link>
				</p>
			</m.div>

			{/* Success Modal */}
			<Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
				<DialogContent className="sm:max-w-md rounded-3xl text-center p-8">
					<DialogHeader className="flex flex-col items-center gap-4">
						<m.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", duration: 0.5 }}
							className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
						>
							<Check className="w-10 h-10 text-white" />
						</m.div>
						<DialogTitle className="text-2xl font-bold text-[#012d46]">
							تم إنشاء حسابك!
						</DialogTitle>
						<DialogDescription className="text-gray-500">
							أرسلنا رابط تفعيل لبريدك.
							<br />
							فعّل حسابك وابدأ!
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-6 sm:justify-center">
						<m.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => {
								setShowConfirmModal(false);
								router.push("/login");
							}}
							className="w-full bg-gradient-to-r from-[#7f2dfb] to-[#9f5dff] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-500/25"
						>
							الذهاب لتسجيل الدخول
						</m.button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
