import { AuthError } from "@supabase/supabase-js";

/**
 * Parses various error objects (Supabase AuthError, standard Error, strings)
 * and returns a friendly, brand-consistent Arabic error message.
 */
export function getAuthErrorMessage(error: unknown): string {
	if (!error) return "حدث خطأ غير متوقع/nيرجى المحاولة مرة أخرى";

	const message =
		(error as AuthError)?.message ||
		(error as Error)?.message ||
		(typeof error === "string" ? error : JSON.stringify(error));

	// Normalize for case-insensitive matching
	const lowerMsg = message.toLowerCase();

	// --- Registration & Account Existence ---
	if (
		lowerMsg.includes("user already registered") ||
		lowerMsg.includes("already registered") ||
		lowerMsg.includes("already exists") ||
		(error as any)?.code === "user_already_registered"
	) {
		return "هذا البريد الإلكتروني مسجل بالفعل. هل تود تسجيل الدخول؟";
	}

	// --- Login Credentials ---
	if (
		lowerMsg.includes("invalid login credentials") ||
		lowerMsg.includes("invalid_grant") ||
		lowerMsg.includes("wrong password")
	) {
		return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
	}

	// --- Email Verification ---
	if (lowerMsg.includes("email not confirmed")) {
		return "البريد الإلكتروني غير مفعل. يرجى التحقق من صندوق الوارد (أو البريد المهمل)";
	}

	// --- Rate Limiting ---
	if (
		lowerMsg.includes("too many requests") ||
		lowerMsg.includes("rate limit") ||
		lowerMsg.includes("429")
	) {
		return "تم إرسال طلبات كثيرة جداً. خذ نفساً عميقاً وحاول بعد قليل";
	}

	// --- Network / Connection ---
	if (
		lowerMsg.includes("failed to fetch") ||
		lowerMsg.includes("networkerror") ||
		lowerMsg.includes("fetch failed") ||
		lowerMsg.includes("connection timeout") ||
		lowerMsg.includes("timeout") ||
		lowerMsg.includes("upstream request timeout")
	) {
		return "يبدو أن هناك مشكلة في الاتصال. تأكد من الإنترنت وحاول مرة أخرى";
	}

	// --- Password Requirements (Supabase often returns these in English if validitation fails at DB level) ---
	if (lowerMsg.includes("password should be at least")) {
		return "كلمة المرور يجب أن تكون 6 خانات على الأقل"; // Common default, though UI enforces 8 usually
	}

	// --- Default Fallback ---
	// If it's a very generic error or something techy we don't want to show
	if (lowerMsg.includes("error") && lowerMsg.length < 20) {
		return "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى";
	}

	// Return the message if it's already likely in Arabic (contains Arabic characters)
	// regex for Arabic chars roughly
	if (/[\u0600-\u06FF]/.test(message)) {
		return message;
	}

	// Final fallback for unknown English errors to avoid showing tech jargon
	console.warn("Unhandled English error:", message);
	return "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً";
}
