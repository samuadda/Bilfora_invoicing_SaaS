/**
 * Utility to check if Supabase server is reachable
 */
export async function checkSupabaseConnection(
	supabaseUrl: string,
	timeout: number = 5000
): Promise<boolean> {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		const response = await fetch(`${supabaseUrl}/rest/v1/`, {
			method: "HEAD",
			signal: controller.signal,
			headers: {
				apikey: "check", // Just to check if server responds
			},
		});

		clearTimeout(timeoutId);
		return response.status !== 0; // Any response means server is reachable
	} catch {
		// Ignore errors during check
		return false;
	}
}

/**
 * Suppress noisy console errors for known network issues
 */
export function suppressNetworkErrors() {
	if (typeof window === "undefined") return;

	const originalError = console.error;
	const originalWarn = console.warn;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	console.error = (...args: any[]) => {
		const message = args.join(" ");

		// Suppress known Supabase network errors
		if (
			message.includes("ERR_CONNECTION_TIMED_OUT") ||
			message.includes("Failed to fetch") ||
			(message.includes("TypeError") && message.includes("fetch")) ||
			(message.includes("AuthRetryableFetchError") && message.includes("Failed to fetch"))
		) {
			// Only log in development, suppress in production
			if (process.env.NODE_ENV === "development") {
				originalError(...args);
			}
			return;
		}

		originalError(...args);
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	console.warn = (...args: any[]) => {
		const message = args.join(" ");

		// Suppress network-related warnings
		if (message.includes("Failed to fetch") || message.includes("timeout")) {
			if (process.env.NODE_ENV === "development") {
				originalWarn(...args);
			}
			return;
		}

		originalWarn(...args);
	};

	// Return cleanup function
	return () => {
		console.error = originalError;
		console.warn = originalWarn;
	};
}

