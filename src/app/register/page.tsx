"use client";

import Link from "next/link";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import { cn } from "@/lib/utils";
import Image from "next/image";
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
import { Eye, EyeClosed, ArrowLeft, Check, Smartphone, Laptop, ChevronDown } from "lucide-react";

const Form = () => {
	const [formData, setFormData] = useState({
		fullname: "",
		email: "",
		phone: "",
		password: "",
		dob: "",
		gender: "male", // 'male' | 'female' | 'institute'
	});

	const router = useRouter();

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState("");

	// ===== Utils =====
	const calculateAge = (dob: string) => {
		const birthDate = new Date(dob);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
		return age;
	};

	// 05xxxxxxxx -> +9665xxxxxxxx (E.164)
	const normalizeSaPhone = (p: string) =>
		p
			.replace(/\D/g, "")
			.replace(/^966/, "")
			.replace(/^0/, "")
			.replace(/^5/, "+9665");

	const validate = () => {
		const newErrors: Record<string, string> = {};
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const phoneRegex = /^05\d{8}$/; // إدخال المستخدم
		// 8+ chars, at least 1 letter & 1 digit (يسمح بالرموز)
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

		if (!formData.fullname.trim())
			newErrors.fullname = "الاسم الكامل مطلوب";

		if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
		else if (!emailRegex.test(formData.email))
			newErrors.email = "البريد الإلكتروني غير صالح";

		if (!formData.phone.trim()) newErrors.phone = "رقم الجوال مطلوب";
		else if (!phoneRegex.test(formData.phone))
			newErrors.phone = "رقم الجوال غير صالح (مثال: 05xxxxxxxx)";

		if (!formData.password) newErrors.password = "كلمة المرور مطلوبة";
		else if (!passwordRegex.test(formData.password))
			newErrors.password =
				"كلمة المرور يجب أن تكون 8 خانات على الأقل، وتحتوي على حرف ورقم على الأقل";

		if (!formData.dob) newErrors.dob = "تاريخ الميلاد مطلوب";
		else if (calculateAge(formData.dob) < 13)
			newErrors.dob = "يجب أن يكون عمرك 13 سنة أو أكثر";

		return newErrors;
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
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
			const phoneE164 = normalizeSaPhone(formData.phone);

			const { error } = await supabase.auth.signUp({
				email: formData.email,
				password: formData.password,
				options: {
					emailRedirectTo: `${location.origin}/confirmed`,
					data: {
						full_name: formData.fullname,
						phone: phoneE164,
						dob: formData.dob,
						account_type:
							formData.gender === "institute"
								? "business"
								: "individual",
						gender:
							formData.gender === "institute"
								? null
								: formData.gender,
					},
				},
			});

			if (error) {
				// أخطاء شائعة
				if (
					(error as { code?: string }).code ===
					"user_already_registered"
				) {
					setGeneralError(
						"هذا البريد مسجّل مسبقًا. جرّب تسجيل الدخول."
					);
				} else {
					setGeneralError("فشل التسجيل: " + error.message);
				}
				// أفرغ كلمة المرور للأمان (اختياري)
				setFormData((p) => ({ ...p, password: "" }));
				return;
			}

			setShowConfirmModal(true);
		} catch (err: unknown) {
			console.error("Unexpected Error:", err);
			setGeneralError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
		} finally {
			setIsLoading(false);
		}
	};

	// ===== Password strength meter =====
	const getPasswordStrength = (password: string) => {
		if (!password) return { strength: 0, color: "bg-gray-200", text: "" };

		let score = 0;
		if (password.length >= 8) score++;
		if (/[A-Za-z]/.test(password)) score++;
		if (/\d/.test(password)) score++;
		if (/[^A-Za-z\d]/.test(password)) score++; // يسمح بالرموز
		if (score <= 1)
			return { strength: score, color: "bg-red-500", text: "ضعيفة" };
		if (score === 2)
			return { strength: score, color: "bg-yellow-500", text: "متوسطة" };
		if (score === 3)
			return { strength: score, color: "bg-blue-500", text: "جيدة" };
		return { strength: score, color: "bg-green-500", text: "قوية" };
	};

	const passwordStrength = getPasswordStrength(formData.password);

	return (
		<div className="w-full lg:grid lg:grid-cols-2 min-h-screen">
			{/* Right Side - Form */}
			<div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
				<Link
					href="/"
					className="absolute top-8 right-8 flex items-center gap-2 text-gray-500 hover:text-[#7f2dfb] transition-colors"
				>
					<ArrowLeft size={16} />
					<span>العودة للرئيسية</span>
				</Link>

				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mx-auto w-full max-w-sm lg:w-96"
				>
					<div className="flex flex-col items-start gap-2 mb-8">
						<Image
							src="/logoPNG.png"
							alt="Bilfora"
							width={140}
							height={40}
							className="h-10 w-auto mb-6"
						/>
						<h2 className="text-3xl font-bold tracking-tight text-[#012d46]">
							انضم إلى بيلفورا 🚀
						</h2>
						<p className="text-sm text-gray-600">
							أنشئ حسابك الجديد في دقائق وابدأ في تنظيم فواتيرك
						</p>
					</div>

					{generalError && (
						<m.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
						>
							<p className="text-red-600 text-sm font-medium">
								{generalError}
							</p>
						</m.div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="grid grid-cols-1 gap-5">
							<div>
								<label
									htmlFor="fullname"
									className="block text-sm font-medium leading-6 text-gray-900 mb-1"
								>
									الاسم الكامل
								</label>
								<input
									type="text"
									id="fullname"
									name="fullname"
									value={formData.fullname}
									onChange={handleChange}
									className={cn(
										"block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7f2dfb] sm:text-sm sm:leading-6 transition-all",
										errors.fullname && "ring-red-300 focus:ring-red-500"
									)}
								/>
								{errors.fullname && (
									<p className="mt-1 text-xs text-red-600">{errors.fullname}</p>
								)}
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium leading-6 text-gray-900 mb-1"
								>
									البريد الإلكتروني
								</label>
								<input
									type="email"
									name="email"
									id="email"
									value={formData.email}
									onChange={handleChange}
									className={cn(
										"block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7f2dfb] sm:text-sm sm:leading-6 transition-all",
										errors.email && "ring-red-300 focus:ring-red-500"
									)}
								/>
								{errors.email && (
									<p className="mt-1 text-xs text-red-600">{errors.email}</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="phone"
										className="block text-sm font-medium leading-6 text-gray-900 mb-1"
									>
										رقم الجوال
									</label>
									<input
										type="tel"
										name="phone"
										id="phone"
										value={formData.phone}
										onChange={handleChange}
										placeholder="05xxxxxxxx"
										className={cn(
											"block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7f2dfb] sm:text-sm sm:leading-6 transition-all",
											errors.phone && "ring-red-300 focus:ring-red-500"
										)}
									/>
									{errors.phone && (
										<p className="mt-1 text-xs text-red-600">{errors.phone}</p>
									)}
								</div>
								<div>
									<label
										htmlFor="dob"
										className="block text-sm font-medium leading-6 text-gray-900 mb-1"
									>
										تاريخ الميلاد
									</label>
									<input
										type="date"
										name="dob"
										id="dob"
										value={formData.dob}
										onChange={handleChange}
										className={cn(
											"block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7f2dfb] sm:text-sm sm:leading-6 transition-all",
											errors.dob && "ring-red-300 focus:ring-red-500"
										)}
									/>
									{errors.dob && (
										<p className="mt-1 text-xs text-red-600">{errors.dob}</p>
									)}
								</div>
							</div>

							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium leading-6 text-gray-900 mb-1"
								>
									كلمة المرور
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										name="password"
										id="password"
										value={formData.password}
										onChange={handleChange}
										className={cn(
											"block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7f2dfb] sm:text-sm sm:leading-6 transition-all",
											errors.password && "ring-red-300 focus:ring-red-500"
										)}
									/>
									<button
										type="button"
										onClick={() => setShowPassword((s) => !s)}
										className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
									>
										{showPassword ? (
											<EyeClosed size={18} />
										) : (
											<Eye size={18} />
										)}
									</button>
								</div>
								
								{formData.password && (
									<div className="mt-2 flex items-center gap-2">
										<div className="flex gap-1 flex-1">
											{[1, 2, 3, 4].map((level) => (
												<div
													key={level}
													className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
														level <= passwordStrength.strength
															? passwordStrength.color
															: "bg-gray-200"
													}`}
												/>
											))}
										</div>
										<span className="text-xs text-gray-500 font-medium">
											{passwordStrength.text}
										</span>
									</div>
								)}
								{errors.password && (
									<p className="mt-1 text-xs text-red-600">{errors.password}</p>
								)}
							</div>

							<div>
								<label
									htmlFor="gender"
									className="block text-sm font-medium leading-6 text-gray-900 mb-1"
								>
									نوع الحساب
								</label>
								<div className="relative">
									<select
										name="gender"
										id="gender"
										value={formData.gender}
										onChange={handleChange}
										className="block w-full appearance-none rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#7f2dfb] sm:text-sm sm:leading-6"
									>
										<option value="male">فرد (ذكر)</option>
										<option value="female">فرد (أنثى)</option>
										<option value="institute">منشأة / شركة</option>
									</select>
									<ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
								</div>
							</div>
						</div>

						<div className="pt-2">
							<button
								type="submit"
								disabled={isLoading}
								className="flex w-full justify-center rounded-xl bg-[#012d46] px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#023b5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#012d46] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<div className="flex items-center gap-2">
										<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										<span>جاري إنشاء الحساب...</span>
									</div>
								) : (
									"إنشاء حساب جديد"
								)}
							</button>
						</div>
					</form>

					<p className="mt-8 text-center text-sm text-gray-500">
						لديك حساب بالفعل؟{" "}
						<Link
							href="/login"
							className="font-semibold leading-6 text-[#7f2dfb] hover:text-[#6a1fd8]"
						>
							سجل الدخول
						</Link>
					</p>
				</m.div>
			</div>

			{/* Left Side - Visuals */}
			<div className="hidden lg:flex relative flex-1 flex-col justify-center items-center bg-[#012d46] overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-[#7f2dfb]/20 to-[#012d46]/90 z-0" />
				<DotPattern
					width={32}
					height={32}
					glow={true}
					className="[mask-image:linear-gradient(to_bottom,white,transparent)] opacity-20"
				/>

				<div className="relative z-10 w-full max-w-lg">
					<div className="grid grid-cols-2 gap-4 mb-8">
						<m.div 
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
							className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10"
						>
							<div className="w-10 h-10 bg-[#7f2dfb] rounded-lg flex items-center justify-center mb-4">
								<Smartphone className="text-white w-6 h-6" />
							</div>
							<h3 className="text-white font-bold mb-1">تطبيق جوال</h3>
							<p className="text-white/60 text-sm">أدر فواتيرك من أي مكان وفي أي وقت.</p>
						</m.div>
						<m.div 
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3 }}
							className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 translate-y-8"
						>
							<div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
								<Laptop className="text-white w-6 h-6" />
							</div>
							<h3 className="text-white font-bold mb-1">لوحة تحكم</h3>
							<p className="text-white/60 text-sm">تقارير وتحليلات متقدمة لنمو أعمالك.</p>
						</m.div>
					</div>
					
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className="text-center"
					>
						<h2 className="text-3xl font-bold text-white mb-4">
							انضم لأكثر من 2000+ شركة ومستقل
						</h2>
						<p className="text-white/70">
							ابدأ رحلتك المالية الرقمية اليوم مع بيلفورا.
						</p>
					</m.div>
				</div>
			</div>

			<Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
				<DialogContent className="sm:max-w-md rounded-2xl text-center p-8">
					<DialogHeader className="flex flex-col items-center gap-4">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
							<Check className="w-8 h-8 text-green-600" />
						</div>
						<DialogTitle className="text-2xl font-bold text-[#012d46]">
							تم إنشاء الحساب بنجاح! 🎉
						</DialogTitle>
						<DialogDescription className="text-gray-600 text-base">
							لقد أرسلنا رابط تفعيل إلى بريدك الإلكتروني.
							<br />
							يرجى التحقق من صندوق الوارد لتفعيل حسابك والبدء.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-6 sm:justify-center">
						<button
							onClick={() => {
								setShowConfirmModal(false);
								router.push("/login");
							}}
							className="w-full bg-[#7f2dfb] hover:bg-[#6a1fd8] text-white font-bold py-3 px-6 rounded-xl transition-colors"
						>
							الذهاب لصفحة الدخول
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Form;
