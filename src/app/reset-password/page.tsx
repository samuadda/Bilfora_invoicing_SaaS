"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed, Loader2 } from "lucide-react";

function ResetPasswordContent() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [confirmPasswordError, setConfirmPasswordError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [generalError, setGeneralError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isValidSession, setIsValidSession] = useState(false);
	const [isCheckingSession, setIsCheckingSession] = useState(true);

	const router = useRouter();
	const searchParams = useSearchParams();

	// Check if user has a valid session for password reset
	useEffect(() => {
		const checkSession = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();
				if (session) {
					setIsValidSession(true);
				} else {
					// Check if we have access_token and refresh_token in URL
					const accessToken = searchParams.get("access_token");
					const refreshToken = searchParams.get("refresh_token");

					if (accessToken && refreshToken) {
						const { error } = await supabase.auth.setSession({
							access_token: accessToken,
							refresh_token: refreshToken,
						});

						if (!error) {
							setIsValidSession(true);
						}
					}
				}
			} catch (error) {
				console.error("Session check error:", error);
			} finally {
				setIsCheckingSession(false);
			}
		};

		checkSession();
	}, [searchParams]);

	const validatePassword = (password: string) => {
		// 8+ chars, at least 1 letter & 1 digit
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
		return passwordRegex.test(password);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Reset errors
		setPasswordError("");
		setConfirmPasswordError("");
		setGeneralError("");

		// Validate passwords
		if (!password) {
			setPasswordError("كلمة المرور مطلوبة");
			return;
		}

		if (!validatePassword(password)) {
			setPasswordError(
				"كلمة المرور يجب أن تكون 8 خانات على الأقل، وتحتوي على حرف ورقم على الأقل"
			);
			return;
		}

		if (!confirmPassword) {
			setConfirmPasswordError("تأكيد كلمة المرور مطلوب");
			return;
		}

		if (password !== confirmPassword) {
			setConfirmPasswordError("كلمات المرور غير متطابقة");
			return;
		}

		setIsLoading(true);

		try {
			const { error } = await supabase.auth.updateUser({
				password: password,
			});

			if (error) {
				// Translate common error messages to Arabic
				let errorMessage = error.message;
				if (
					error.message.includes(
						"New password should be different from the old password"
					)
				) {
					errorMessage =
						"كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور القديمة";
				} else if (
					error.message.includes("Password should be at least")
				) {
					errorMessage = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
				} else if (error.message.includes("Invalid password")) {
					errorMessage = "كلمة المرور غير صالحة";
				} else if (error.message.includes("User not found")) {
					errorMessage = "المستخدم غير موجود";
				} else if (error.message.includes("Session not found")) {
					errorMessage = "الجلسة غير صالحة أو منتهية الصلاحية";
				} else if (error.message.includes("Invalid token")) {
					errorMessage = "الرابط غير صالح أو منتهي الصلاحية";
				}
				setGeneralError("حدث خطأ: " + errorMessage);
			} else {
				// Success - redirect to login
				router.push("/login?message=password_reset_success");
			}
		} catch (err) {
			console.error("Password update error:", err);
			setGeneralError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
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

		if (score <= 1)
			return { strength: score, color: "bg-red-500", text: "ضعيفة" };
		if (score === 2)
			return { strength: score, color: "bg-yellow-500", text: "متوسطة" };
		if (score === 3)
			return { strength: score, color: "bg-blue-500", text: "جيدة" };
		return { strength: score, color: "bg-green-500", text: "قوية" };
	};

	const passwordStrength = getPasswordStrength(password);

	if (isCheckingSession) {
		return (
			<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-t from-[#cc15ff3d] to-[#fff] p-4 sm:p-6 lg:p-8">
				<DotPattern
					width={16}
					height={16}
					glow={true}
					className={cn(
						"absolute inset-0 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
					)}
				/>
				<div className="text-center relative z-10">
					<div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">جاري التحقق من الجلسة...</p>
				</div>
			</div>
		);
	}

	if (!isValidSession) {
		return (
			<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-t from-[#cc15ff3d] to-[#fff] p-4 sm:p-6 lg:p-8">
				<DotPattern
					width={16}
					height={16}
					glow={true}
					className={cn(
						"absolute inset-0 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
					)}
				/>
				<div className="text-center max-w-md mx-auto p-6 relative z-10">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							className="w-8 h-8 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-bold text-red-600 mb-2">
						رابط غير صالح
					</h2>
					<p className="text-gray-600 mb-6">
						رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.
						يرجى طلب رابط جديد.
					</p>
					<button
						onClick={() => router.push("/login")}
						className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
					>
						العودة لتسجيل الدخول
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-t from-[#cc15ff3d] to-[#fff] p-4 sm:p-6 lg:p-8">
			<DotPattern
				width={16}
				height={16}
				glow={true}
				className={cn(
					"absolute inset-0 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
				)}
			/>
			<div className="relative w-full max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 shadow-lg rounded-2xl sm:rounded-3xl bg-white z-10">
				<div className="w-full">
					<h1 className="text-lg sm:text-xl font-bold flex items-center justify-center gap-2 mb-4">
						<span className="text-2xl sm:text-3xl font-black text-[#7f2dfb] tracking-tight">
							بِلفورا
						</span>
					</h1>

					<h2 className="text-xl font-bold text-center mb-2">
						إعادة تعيين كلمة المرور
					</h2>
					<p className="text-sm text-gray-600 text-center mb-6">
						أدخل كلمة مرور جديدة
					</p>

					{/* General Error */}
					{generalError && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-600 text-xs sm:text-sm text-center">
								{generalError}
							</p>
						</div>
					)}

					<form onSubmit={handleSubmit}>
						{/* كلمة المرور الجديدة */}
						<div className="mb-4">
							<label
								htmlFor="password"
								className="font-semibold text-xs sm:text-sm text-gray-600 pb-1 block"
							>
								كلمة المرور الجديدة
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									id="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									className="border rounded-lg px-3 py-2 mt-1 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300 pr-10"
									placeholder="أدخل كلمة المرور الجديدة"
									disabled={isLoading}
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute inset-y-0 right-2 flex items-center text-xs sm:text-sm text-gray-500 hover:text-gray-700"
									disabled={isLoading}
								>
									{showPassword ? (
										<EyeClosed size={16} />
									) : (
										<Eye size={16} />
									)}
								</button>
							</div>

							{/* Password Strength */}
							{password && (
								<div className="mt-2">
									<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
										<div className="flex gap-1 justify-center sm:justify-start">
											{[1, 2, 3, 4].map((level) => (
												<div
													key={level}
													className={`h-1 w-6 sm:w-8 rounded-full ${level <=
														passwordStrength.strength
														? passwordStrength.color
														: "bg-gray-200"
														}`}
												/>
											))}
										</div>
										<span
											className={`text-xs font-medium text-center sm:text-right ${passwordStrength.strength <= 1
												? "text-red-600"
												: passwordStrength.strength ===
													2
													? "text-yellow-600"
													: passwordStrength.strength ===
														3
														? "text-blue-600"
														: "text-green-600"
												}`}
										>
											{passwordStrength.text}
										</span>
									</div>
								</div>
							)}
							{passwordError && (
								<p className="text-red-500 text-xs mt-1">
									{passwordError}
								</p>
							)}
						</div>

						{/* تأكيد كلمة المرور */}
						<div className="mb-6">
							<label
								htmlFor="confirmPassword"
								className="font-semibold text-xs sm:text-sm text-gray-600 pb-1 block"
							>
								تأكيد كلمة المرور
							</label>
							<div className="relative">
								<input
									type={
										showConfirmPassword
											? "text"
											: "password"
									}
									id="confirmPassword"
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									className="border rounded-lg px-3 py-2 mt-1 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300 pr-10"
									placeholder="أعد إدخال كلمة المرور"
									disabled={isLoading}
								/>
								<button
									type="button"
									onClick={() =>
										setShowConfirmPassword(
											!showConfirmPassword
										)
									}
									className="absolute inset-y-0 right-2 flex items-center text-xs sm:text-sm text-gray-500 hover:text-gray-700"
									disabled={isLoading}
								>
									{showConfirmPassword ? (
										<EyeClosed size={16} />
									) : (
										<Eye size={16} />
									)}
								</button>
							</div>
							{confirmPasswordError && (
								<p className="text-red-500 text-xs mt-1">
									{confirmPasswordError}
								</p>
							)}
						</div>

						{/* زر تحديث كلمة المرور */}
						<button
							type="submit"
							disabled={isLoading}
							className={`w-full text-white rounded-lg px-3 py-2.5 text-xs sm:text-sm font-semibold transition duration-100 flex items-center justify-center gap-2 ${isLoading
								? "bg-gray-400 cursor-not-allowed"
								: "bg-[#7f2dfb] hover:bg-violet-400"
								}`}
						>
							{isLoading ? (
								<>
									<div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									<span className="text-xs sm:text-sm">
										جاري التحديث...
									</span>
								</>
							) : (
								"تحديث كلمة المرور"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default function ResetPasswordPage() {
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
			<ResetPasswordContent />
		</Suspense>
	);
}
