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
import { Eye, EyeClosed, Check, Mail, User, Lock, ArrowRight } from "lucide-react";
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
		if (score <= 1) return { strength: score, color: "bg-red-400", text: "ضعيفة" };
		if (score === 2) return { strength: score, color: "bg-yellow-400", text: "متوسطة" };
		if (score === 3) return { strength: score, color: "bg-blue-400", text: "جيدة" };
		return { strength: score, color: "bg-green-400", text: "قوية" };
	};

	const passwordStrength = getPasswordStrength(formData.password);

	return (
		<div className="min-h-screen bg-gray-50 relative overflow-hidden flex items-center justify-center px-4 py-12">
			{/* Aurora Background - Light Mode */}
			<div className="absolute inset-0 overflow-hidden">
				<m.div
					animate={{
						x: [0, 50, 0],
						y: [0, 30, 0],
						scale: [1, 1.1, 1],
					}}
					transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
					className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#7f2dfb]/20 via-purple-400/10 to-transparent rounded-full blur-[120px]"
				/>
				<m.div
					animate={{
						x: [0, -30, 0],
						y: [0, 50, 0],
						scale: [1, 1.2, 1],
					}}
					transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
					className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-pink-300/20 via-rose-200/10 to-transparent rounded-full blur-[100px]"
				/>
				<m.div
					animate={{
						x: [0, 40, 0],
						y: [0, -40, 0],
					}}
					transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
					className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-cyan-300/15 via-teal-200/10 to-transparent rounded-full blur-[80px]"
				/>
				<m.div
					animate={{
						x: [0, -20, 0],
						y: [0, 20, 0],
					}}
					transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
					className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] bg-gradient-to-tr from-violet-200/20 to-transparent rounded-full blur-[60px]"
				/>
			</div>

			{/* Glass Card */}
			<m.div
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 w-full max-w-md"
			>
				<div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/50 p-8 shadow-xl shadow-gray-200/50">
					{/* Tab Toggle */}
					<div className="flex items-center justify-center mb-8">
						<div className="bg-gray-100 rounded-full p-1 flex">
							<span className="px-5 py-2 text-sm font-medium bg-white text-[#012d46] rounded-full shadow-sm">
								حساب جديد
							</span>
							<Link
								href="/login"
								className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors rounded-full"
							>
								تسجيل الدخول
							</Link>
						</div>
					</div>

					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-[#012d46] mb-2">
							أهلاً! خلّنا نبدأ
						</h1>
						<p className="text-gray-500 text-sm">
							حسابك المجاني جاهز خلال ثواني
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

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Name */}
						<div>
							<label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
								الاسم
							</label>
							<div className="relative">
								<User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="text"
									id="fullname"
									name="fullname"
									value={formData.fullname}
									onChange={handleChange}
									placeholder="اسمك أو اسم منشأتك"
									className={cn(
										"block w-full rounded-xl bg-gray-50/80 border border-gray-200 py-4 pr-11 pl-4 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/10 focus:outline-none transition-all text-sm leading-relaxed",
										errors.fullname && "border-red-300 focus:border-red-500 focus:ring-red-500/10"
									)}
								/>
							</div>
							{errors.fullname && <p className="mt-1.5 text-xs text-red-500">{errors.fullname}</p>}
						</div>

						{/* Email */}
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								البريد الإلكتروني
							</label>
							<div className="relative">
								<Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="name@example.com"
									className={cn(
										"block w-full rounded-xl bg-gray-50/80 border border-gray-200 py-4 pr-11 pl-4 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/10 focus:outline-none transition-all text-sm leading-relaxed",
										errors.email && "border-red-300 focus:border-red-500 focus:ring-red-500/10"
									)}
								/>
							</div>
							{errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
						</div>

						{/* Password */}
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
							كلمة المرور
						</label>
						<div className="relative">
							<Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type={showPassword ? "text" : "password"}
								id="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="8 خانات على الأقل"
								className={cn(
									"block w-full rounded-xl bg-gray-50/80 border border-gray-200 py-4 pr-11 pl-11 text-gray-900 placeholder:text-gray-400 placeholder:text-right focus:bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/10 focus:outline-none transition-all text-sm leading-relaxed",
									errors.password && "border-red-300 focus:border-red-500 focus:ring-red-500/10"
								)}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((s) => !s)}
								className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								{showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
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
									<span className="text-xs text-gray-500">{passwordStrength.text}</span>
								</div>
							)}
							{errors.password && <p className="mt-1.5 text-xs text-red-500 pr-1">{errors.password}</p>}
						</div>

						{/* Submit */}
						<m.button
							type="submit"
							disabled={isLoading}
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
							className="w-full bg-[#7f2dfb] text-white font-semibold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#6a1fd8] mt-6 shadow-lg shadow-purple-500/20"
						>
							{isLoading ? (
								<>
									<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									<span>لحظة...</span>
								</>
							) : (
								<>
									<span>يلا نبدأ!</span>
									<ArrowRight className="h-4 w-4" />
								</>
							)}
						</m.button>
					</form>

					{/* Footer */}
					<p className="text-center text-xs text-gray-400 mt-6">
						بإنشاء حسابك، أنت توافق على{" "}
						<Link href="/terms" className="text-gray-600 hover:text-[#7f2dfb] underline">الشروط</Link>
						{" "}و{" "}
						<Link href="/privacy" className="text-gray-600 hover:text-[#7f2dfb] underline">الخصوصية</Link>
					</p>
				</div>

				{/* Logo below card */}
				<div className="flex items-center justify-center mt-8">
					<Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-[#7f2dfb] transition-colors">
						<span className="text-lg font-bold">بِلفورا</span>
					</Link>
				</div>
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
							تمام!
						</DialogTitle>
						<DialogDescription className="text-gray-500">
							بس فعّل حسابك من الرابط اللي أرسلناه لبريدك
							<br />
							وبعدين سجّل دخولك وابدأ!
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
							className="w-full bg-[#7f2dfb] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[#6a1fd8] transition-colors shadow-lg shadow-purple-500/20"
						>
							تمام، خلّني أسجّل دخولي
						</m.button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
