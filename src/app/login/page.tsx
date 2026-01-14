"use client";

import { supabasePersistent, supabaseSession } from "@/lib/supabase-clients";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { Eye, EyeClosed, Check, ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import { AuthError } from "@supabase/supabase-js";

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
	const [rememberMe, setRememberMe] = useState(false);

	// Forgot password states
	const [showForgotPassword, setShowForgotPassword] = useState(false);
	const [resetEmail, setResetEmail] = useState("");
	const [resetEmailError, setResetEmailError] = useState("");
	const [isResetting, setIsResetting] = useState(false);
	const [resetSuccess, setResetSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	// Check for success messages from URL
	useEffect(() => {
		const message = searchParams.get("message");
		if (message === "password_reset_success") {
			setSuccessMessage(
				"تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
			);
		}
	}, [searchParams]);

	// Load remember me preference from localStorage on component mount
	useEffect(() => {
		const savedRememberMe = localStorage.getItem("rememberMe");
		if (savedRememberMe === "true") {
			setRememberMe(true);
		}
	}, []);

	// Handle remember me checkbox change
	const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const isChecked = e.target.checked;
		setRememberMe(isChecked);

		// Save preference to localStorage
		if (isChecked) {
			localStorage.setItem("rememberMe", "true");
		} else {
			localStorage.removeItem("rememberMe");
		}
	};

	// =============  تسجيل الدخول بالبريد =============
	/**
	 * Manual Testing Steps:
	 * 
	 * 1. Login with "Remember me" checked:
	 *    - Login → close tab → reopen site → user should still be authenticated
	 * 
	 * 2. Login with "Remember me" unchecked:
	 *    - Login → close tab → reopen site → user should be logged out
	 * 
	 * 3. Explicit logout:
	 *    - Click "Logout" → session should be cleared in both cases
	 */
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
			// Select the appropriate client based on "Remember me" checkbox
			const client = rememberMe ? supabasePersistent : supabaseSession;

			// Add timeout wrapper for login request
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

			// Save remember me preference to localStorage for UI state
			if (!error && rememberMe) {
				localStorage.setItem("rememberMe", "true");
			} else if (!error && !rememberMe) {
				localStorage.removeItem("rememberMe");
			}

			if (error) {
				let errorMessage = error.message;

				// Handle network errors
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

			// Login successful
			setGeneralError("");
			setSuccessMessage("تم تسجيل الدخول بنجاح!");
			setIsLoading(false);

			// Show redirecting message after a brief moment
			setTimeout(() => {
				setIsRedirecting(true);
				setTimeout(() => {
					router.push("/dashboard");
				}, 500);
			}, 800);
		} catch (err: unknown) {
			const error = err as Error;
			console.error("Login Error:", error);

			// Handle network/fetch errors in catch block
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

	// =============  إعادة تعيين كلمة المرور =============
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
			// Use persistent client for password reset (always persistent)
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

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mx-auto w-full max-w-sm lg:w-96"
				>
					<div className="flex flex-col items-start gap-2 mb-10">
						<Image
							src="/logoPNG.png"
							alt="Bilfora"
							width={140}
							height={40}
							className="h-10 w-auto mb-6"
						/>
						<h2 className="text-3xl font-bold tracking-tight text-[#012d46]">
							مرحباً بعودتك 👋
						</h2>
						<p className="text-sm text-gray-600">
							أدخل بياناتك للدخول إلى لوحة التحكم
						</p>
					</div>

					{successMessage && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
						>
							<div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
								<Check className="h-4 w-4 text-green-600" />
							</div>
							<p className="text-green-700 text-sm font-medium">
								{successMessage}
							</p>
						</motion.div>
					)}

					{isRedirecting && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3"
						>
							<div className="h-4 w-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin flex-shrink-0"></div>
							<p className="text-blue-700 text-sm font-medium">
								جاري التحويل...
							</p>
						</motion.div>
					)}

					{generalError && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
						>
							<p className="text-red-600 text-sm font-medium">
								{generalError}
							</p>
						</motion.div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6" style={{ pointerEvents: isRedirecting ? 'none' : 'auto', opacity: isRedirecting ? 0.6 : 1 }}>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium leading-6 text-gray-900 mb-2"
							>
								البريد الإلكتروني
							</label>
							<div className="relative">
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) =>
										handleInputChange(
											"email",
											e.target.value
										)
									}
									className={cn(
										"block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7f2dfb] sm:text-sm sm:leading-6 transition-all",
										emailError &&
										"ring-red-300 focus:ring-red-500"
									)}
								/>
							</div>
							{emailError && (
								<p className="mt-2 text-sm text-red-600">
									{emailError}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium leading-6 text-gray-900 mb-2"
							>
								كلمة المرور
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									required
									value={password}
									onChange={(e) =>
										handleInputChange(
											"password",
											e.target.value
										)
									}
									className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7f2dfb] sm:text-sm sm:leading-6 transition-all"
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
								>
									{showPassword ? (
										<EyeClosed size={18} />
									) : (
										<Eye size={18} />
									)}
								</button>
							</div>
							{passwordError && (
								<p className="mt-2 text-sm text-red-600">
									{passwordError}
								</p>
							)}
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									checked={rememberMe}
									onChange={handleRememberMeChange}
									className="h-4 w-4 rounded border-gray-300 text-[#7f2dfb] focus:ring-[#7f2dfb]"
								/>
								<label
									htmlFor="remember-me"
									className="mr-2 block text-sm text-gray-900 select-none cursor-pointer"
								>
									تذكرني
								</label>
							</div>

							<div className="text-sm">
								<button
									type="button"
									onClick={() => setShowForgotPassword(true)}
									className="font-semibold text-[#7f2dfb] hover:text-[#6a1fd8]"
								>
									نسيت كلمة المرور؟
								</button>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={isLoading || isRedirecting}
								className={`flex w-full justify-center rounded-xl bg-[#7f2dfb] px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#6a1fd8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7f2dfb] transition-all ${isLoading || isRedirecting ? "opacity-70 cursor-wait" : ""
									}`}
							>
								{isLoading ? (
									<div className="flex items-center gap-2">
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										<span>جاري تسجيل الدخول...</span>
									</div>
								) : "تسجيل الدخول"}
							</button>
						</div>
					</form>

					<p className="mt-10 text-center text-sm text-gray-500">
						ليس لديك حساب؟{" "}
						<Link
							href="/signup"
							className="font-semibold leading-6 text-[#7f2dfb] hover:text-[#6a1fd8]"
						>
							أنشئ حساباً جديداً
						</Link>
					</p>
				</motion.div>
			</div>

			{/* Left Side - Image/Decoration */}
			<div className="hidden lg:block relative bg-gray-50 overflow-hidden">
				<DotPattern
					width={24}
					height={24}
					glow={true}
					className={cn(
						"absolute inset-0 [mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)] opacity-50"
					)}
				/>
				<div className="w-full h-full flex items-center justify-center p-12 relative z-10">
					<div className="max-w-xl text-center">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.8 }}
							className="relative w-full aspect-square mb-12"
						>
							<Image
								src="/dashboard-preview.png"
								alt="Dashboard Preview"
								fill
								className="object-contain drop-shadow-2xl rounded-2xl"
								priority
							/>
						</motion.div>
						<h1 className="text-3xl font-bold text-[#012d46] mb-4">
							أدر أعمالك بذكاء
						</h1>
						<p className="text-lg text-gray-600">
							نظام متكامل لإدارة الفواتير، العملاء، والمدفوعات. صمم خصيصاً لتسهيل أعمالك وتوفير وقتك.
						</p>
					</div>
				</div>
			</div>

			{/* Forgot Password Modal */}
			{showForgotPassword && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
					<motion.div
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

						<h3 className="text-xl font-bold text-[#012d46] mb-2">استعادة كلمة المرور</h3>
						<p className="text-sm text-gray-600 mb-6">
							أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
						</p>

						{resetSuccess ? (
							<div className="text-center py-6">
								<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<Check className="w-6 h-6 text-green-600" />
								</div>
								<h4 className="text-green-700 font-bold mb-2">تم الإرسال بنجاح!</h4>
								<p className="text-sm text-gray-500 mb-6">
									تم إرسال رابط إعادة تعيين كلمة المرور إلى {resetEmail}. يرجى التحقق من بريدك الوارد (والمهملات).
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
									<label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
										البريد الإلكتروني
									</label>
									<input
										type="email"
										id="resetEmail"
										value={resetEmail}
										onChange={(e) => handleInputChange("resetEmail", e.target.value)}
										className="w-full rounded-xl border-gray-300 focus:ring-[#7f2dfb] focus:border-[#7f2dfb]"
										placeholder="name@example.com"
									/>
									{resetEmailError && (
										<p className="mt-1 text-sm text-red-600">{resetEmailError}</p>
									)}
								</div>

								<div className="flex gap-3 mt-6">
									<button
										type="button"
										onClick={() => setShowForgotPassword(false)}
										className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
									>
										إلغاء
									</button>
									<button
										type="submit"
										disabled={isResetting}
										className="flex-1 py-2.5 bg-[#7f2dfb] text-white font-medium rounded-xl hover:bg-[#6a1fd8] flex items-center justify-center gap-2"
									>
										{isResetting ? (
											<>
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
												جاري الإرسال...
											</>
										) : (
											"إرسال الرابط"
										)}
									</button>
								</div>
							</form>
						)}
					</motion.div>
				</div>
			)}
		</div>
	);
}

export default function LoginForm() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen w-full flex items-center justify-center bg-white">
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
