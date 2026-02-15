"use client";

import { supabasePersistent } from "@/lib/supabase-clients";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect, Suspense } from "react";
import { Eye, EyeClosed, Check, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { m } from "framer-motion";
import { AuthError } from "@supabase/supabase-js";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

// Loading states for the multi-step loader
const loginLoadingStates = [
	{ text: "جارٍ التحقق من بياناتك..." },
	{ text: "تأمين الاتصال..." },
	{ text: "تحميل حسابك..." },
	{ text: "جاهز! لحظة ونوصّلك..." },
];

function LoginContent() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [generalError, setGeneralError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [isRedirecting, setIsRedirecting] = useState(false);

	const [showLoader, setShowLoader] = useState(false);

	// Forgot password states
	const [showForgotPassword, setShowForgotPassword] = useState(false);
	const [resetEmail, setResetEmail] = useState("");
	const [resetEmailError, setResetEmailError] = useState("");
	const [isResetting, setIsResetting] = useState(false);
	const [resetSuccess, setResetSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const message = searchParams.get("message");
		if (message === "password_reset_success") {
			setSuccessMessage(
				"تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
			);
		}
	}, [searchParams]);



	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		let isValid = true;

		setGeneralError("");
		setEmailError("");
		setPasswordError("");

		if (!email) {
			setEmailError("البريد الإلكتروني مطلوب");
			isValid = false;
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				setEmailError("صيغة البريد الإلكتروني غير صحيحة");
				isValid = false;
			}
		}

		if (!password) {
			setPasswordError("كلمة المرور مطلوبة");
			isValid = false;
		}

		if (!isValid) return;

		setIsLoading(true);
		setGeneralError("");

		try {
			const client = supabasePersistent;

			const loginPromise = client.auth.signInWithPassword({
				email,
				password,
			});

			const timeoutPromise = new Promise((_, reject) =>
				setTimeout(() => reject(new Error("Connection timeout")), 15000)
			);

			const { error } = await Promise.race([
				loginPromise,
				timeoutPromise,
			]) as { data: unknown; error: AuthError | null };



			if (error) {
				let errorMessage = error.message;

				if (error.message.includes("Failed to fetch") ||
					error.message.includes("NetworkError") ||
					error.message.includes("fetch failed")) {
					errorMessage = "فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.";
				} else if (error.message.includes("Invalid login credentials")) {
					errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
				} else if (error.message.includes("Email not confirmed")) {
					errorMessage =
						"البريد الإلكتروني غير مفعل. يرجى التحقق من بريدك الإلكتروني";
				} else if (error.message.includes("Too many requests")) {
					errorMessage = "تم إرسال طلبات كثيرة. يرجى المحاولة لاحقاً";
				}
				setGeneralError(errorMessage);
				return;
			}

			setGeneralError("");
			setIsLoading(false);
			setShowLoader(true);

			// Let the loader show all steps before redirecting
			setTimeout(() => {
				setIsRedirecting(true);
				router.refresh();
				setTimeout(() => {
					router.push("/dashboard");
				}, 500);
			}, 6500); // Allow loader to complete all 4 steps (~1.5s each)
		} catch (err: unknown) {
			const error = err as Error;
			console.error("Login Error:", error);

			let errorMessage = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";

			if (
				error?.message?.includes("Failed to fetch") ||
				error?.message?.includes("NetworkError") ||
				error?.message?.includes("fetch failed") ||
				error?.message?.includes("timeout") ||
				error?.message?.includes("Connection timeout") ||
				error?.message?.includes("ERR_CONNECTION_TIMED_OUT") ||
				error?.name === "TypeError" ||
				error?.name === "ConnectionTimeout"
			) {
				errorMessage = "فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.";
			}

			setGeneralError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!resetEmail.trim()) {
			setResetEmailError("البريد الإلكتروني مطلوب");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(resetEmail)) {
			setResetEmailError("البريد الإلكتروني غير صالح");
			return;
		}

		setIsResetting(true);
		setResetEmailError("");

		try {
			const { error } = await supabasePersistent.auth.resetPasswordForEmail(
				resetEmail,
				{
					redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || location.origin}/reset-password`,
				}
			);

			if (error) {
				setResetEmailError("حدث خطأ: " + error.message);
			} else {
				setResetSuccess(true);
			}
		} catch (err) {
			console.error("Password reset error:", err);
			setResetEmailError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
		} finally {
			setIsResetting(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		if (field === "email") {
			setEmail(value);
			setEmailError("");
		} else if (field === "password") {
			setPassword(value);
			setPasswordError("");
		} else if (field === "resetEmail") {
			setResetEmail(value);
			setResetEmailError("");
		}
		setGeneralError("");
	};

	return (
		<>
			{/* Multi-Step Loader */}
			<MultiStepLoader
				loadingStates={loginLoadingStates}
				loading={showLoader}
				duration={1500}
				loop={false}
			/>
			
			<div className="min-h-screen bg-gray-50 relative overflow-hidden flex items-center justify-center px-4 py-12">
				{/* Aurora Background */}
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
							<Link
								href="/register"
								className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors rounded-full"
							>
								حساب جديد
							</Link>
							<span className="px-5 py-2 text-sm font-medium bg-white text-[#012d46] rounded-full shadow-sm">
								تسجيل الدخول
							</span>
						</div>
					</div>

					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-[#012d46] mb-2">
							أهلاً من جديد!
						</h1>
						<p className="text-gray-500 text-sm">
							سجّل دخولك وكمّل شغلك
						</p>
					</div>

					{/* Success Message */}
					{successMessage && (
						<m.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-6 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3"
						>
							<div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
								<Check className="h-4 w-4 text-green-600" />
							</div>
							<p className="text-green-700 text-sm font-medium">{successMessage}</p>
						</m.div>
					)}

					{/* Redirecting Message */}
					{isRedirecting && (
						<m.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3"
						>
							<div className="h-4 w-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin flex-shrink-0"></div>
							<p className="text-blue-700 text-sm font-medium">لحظة ونوصّلك...</p>
						</m.div>
					)}

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

					<form onSubmit={handleSubmit} className="space-y-4" style={{ pointerEvents: isRedirecting ? 'none' : 'auto', opacity: isRedirecting ? 0.6 : 1 }}>
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
									value={email}
									onChange={(e) => handleInputChange("email", e.target.value)}
									placeholder="name@example.com"
									className={cn(
										"block w-full rounded-xl bg-gray-50/80 border border-gray-200 py-4 pr-11 pl-4 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/10 focus:outline-none transition-all text-sm leading-relaxed",
										emailError && "border-red-300 focus:border-red-500 focus:ring-red-500/10"
									)}
								/>
							</div>
							{emailError && <p className="mt-1.5 text-xs text-red-500">{emailError}</p>}
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
									value={password}
									onChange={(e) => handleInputChange("password", e.target.value)}
									placeholder="••••••••"
									className={cn(
										"block w-full rounded-xl bg-gray-50/80 border border-gray-200 py-4 pr-11 pl-11 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/10 focus:outline-none transition-all text-sm leading-relaxed",
										passwordError && "border-red-300 focus:border-red-500 focus:ring-red-500/10"
									)}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
								</button>
							</div>
							{passwordError && <p className="mt-1.5 text-xs text-red-500">{passwordError}</p>}
						</div>

						{/* Forgot Password */}
						<div className="flex items-center justify-end">
							<button
								type="button"
								onClick={() => setShowForgotPassword(true)}
								className="text-sm font-medium text-[#7f2dfb] hover:text-[#6a1fd8]"
							>
								نسيت كلمة السر؟
							</button>
						</div>

						{/* Submit */}
						<m.button
							type="submit"
							disabled={isLoading || isRedirecting}
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
									<span>دخول</span>
									<ArrowRight className="h-4 w-4" />
								</>
							)}
						</m.button>
					</form>

					{/* Footer */}
					<p className="text-center text-xs text-gray-400 mt-6">
						ما عندك حساب؟{" "}
						<Link href="/register" className="text-[#7f2dfb] hover:underline font-medium">
							أنشئ واحد مجاناً
						</Link>
					</p>
				</div>

				{/* Logo below card */}
				<div className="flex items-center justify-center mt-8">
					<Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-[#7f2dfb] transition-colors">
						<span className="text-lg font-bold">بِلفورا</span>
					</Link>
				</div>
			</m.div>

			{/* Forgot Password Modal */}
			{showForgotPassword && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
					<m.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
					>
						<button
							onClick={() => setShowForgotPassword(false)}
							className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
						>
							✕
						</button>

						<h3 className="text-xl font-bold text-[#012d46] mb-2">نسيت كلمة السر؟</h3>
						<p className="text-sm text-gray-600 mb-6">
							عادي! اكتب بريدك وبنرسل لك رابط تعيد فيه تعيينها.
						</p>

						{resetSuccess ? (
							<div className="text-center py-6">
								<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<Check className="w-6 h-6 text-green-600" />
								</div>
								<h4 className="text-green-700 font-bold mb-2">تمام!</h4>
								<p className="text-sm text-gray-500 mb-6">
									أرسلنا الرابط لـ {resetEmail}. شيّك بريدك (والمهملات بعد!).
								</p>
								<button
									onClick={() => {
										setShowForgotPassword(false);
										setResetSuccess(false);
										setResetEmail("");
									}}
									className="w-full py-2 bg-[#7f2dfb] text-white rounded-xl font-medium hover:bg-[#6a1fd8]"
								>
									حسناً
								</button>
							</div>
						) : (
							<form onSubmit={handleForgotPassword}>
								<div className="mb-4">
									<label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
										البريد الإلكتروني
									</label>
									<div className="relative">
										<Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
										<input
											type="email"
											id="resetEmail"
											value={resetEmail}
											onChange={(e) => handleInputChange("resetEmail", e.target.value)}
											className="block w-full rounded-xl bg-gray-50/80 border border-gray-200 py-3.5 pr-11 pl-4 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/10 focus:outline-none transition-all text-sm"
											placeholder="name@example.com"
										/>
									</div>
									{resetEmailError && (
										<p className="mt-1.5 text-xs text-red-500">{resetEmailError}</p>
									)}
								</div>

								<div className="flex gap-3 mt-6">
									<button
										type="button"
										onClick={() => setShowForgotPassword(false)}
										className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
									>
										خلاص
									</button>
									<button
										type="submit"
										disabled={isResetting}
										className="flex-1 py-2.5 bg-[#7f2dfb] text-white font-medium rounded-xl hover:bg-[#6a1fd8] flex items-center justify-center gap-2"
									>
										{isResetting ? (
											<>
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
												لحظة...
											</>
										) : (
											"أرسل الرابط"
										)}
									</button>
								</div>
							</form>
						)}
					</m.div>
				</div>
				)}
			</div>
		</>
	);
}

export default function LoginForm() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
					<div className="text-center">
						<Loader2 className="h-8 w-8 animate-spin text-[#7f2dfb] mx-auto mb-2" />
						<p className="text-gray-500">جاري التحميل...</p>
					</div>
				</div>
			}
		>
			<LoginContent />
		</Suspense>
	);
}
