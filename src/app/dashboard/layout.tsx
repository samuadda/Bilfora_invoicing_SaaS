"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { supabasePersistent, supabaseSession } from "@/lib/supabase-clients";
import Sidebar from "@/components/dashboard/sideBar";
import { useSidebar } from "@/components/dashboard/sidebar/SidebarContext";
import SidebarProvider from "@/components/dashboard/SidebarProvider";
import LoadingState from "@/components/LoadingState";
import { Toaster } from "@/components/ui/sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardLayoutWrapperProps {
	children: ReactNode;
}

// 🧩 Main dashboard content (responsive, RTL-aware)
function DashboardContent({ children }: { children: ReactNode }) {
	const { isCollapsed } = useSidebar();

	return (
		<main
			className={cn(
				"flex-1 min-h-screen bg-[#f8f9fc] transition-all duration-300 w-full max-w-[100vw] overflow-x-hidden",
				isCollapsed ? "md:mr-[80px]" : "md:mr-[280px]"
			)}
		>
			<div className="p-4 md:p-8 pt-20 md:pt-8 max-w-[1600px] mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
				>
					{children}
				</motion.div>
			</div>
		</main>
	);
}

// 🔒 Authentication wrapper
function AuthWrapper({ children }: { children: ReactNode }) {
	const [authChecked, setAuthChecked] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [connectionError, setConnectionError] = useState(false);
	const router = useRouter();

	// ✅ Check authentication once on mount
	// Check both persistent and session clients to find the active session
	const checkAuth = useCallback(async () => {
		try {
			setIsLoading(true);
			setConnectionError(false);

			// Check both clients to find active session (could be in localStorage or sessionStorage)
			// Try persistent client first, then session client if no user found
			const timeoutPromise = new Promise((_, reject) =>
				setTimeout(() => reject(new Error("Connection timeout")), 10000)
			);

			// Check persistent client first
			const persistentPromise = supabasePersistent.auth.getUser();
			const persistentResult = await Promise.race([persistentPromise, timeoutPromise]) as any;

			let user = persistentResult?.data?.user;
			let error = persistentResult?.error;

			// If no user in persistent client, check session client
			if (!user && !error) {
				const sessionPromise = supabaseSession.auth.getUser();
				const sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any;
				user = sessionResult?.data?.user;
				error = sessionResult?.error;
			}

			// Check for network/connection errors
			if (error) {
				if (
					error.message?.includes("Failed to fetch") ||
					error.message?.includes("NetworkError") ||
					error.message?.includes("timeout") ||
					error.message?.includes("ERR_CONNECTION_TIMED_OUT")
				) {
					console.error("Network error during authentication check:", error);
					setConnectionError(true);
					setAuthChecked(false);
					return;
				}
				// For other auth errors, redirect to login
				router.replace("/login");
				return;
			}

			if (!user) {
				router.replace("/login");
				return;
			}
			setAuthChecked(true);
			setConnectionError(false);
		} catch (error: any) {
			console.error("Error checking authentication:", error);

			// Handle timeout and network errors gracefully
			if (
				error?.message?.includes("timeout") ||
				error?.message?.includes("Failed to fetch") ||
				error?.message?.includes("NetworkError") ||
				error?.message?.includes("ERR_CONNECTION_TIMED_OUT") ||
				error?.name === "TypeError"
			) {
				setConnectionError(true);
				setAuthChecked(false);
			} else {
				// For other errors, redirect to login
				router.replace("/login");
			}
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	useEffect(() => {
		checkAuth();

		// ✅ Real-time auth listener
		// Listen to both clients for auth state changes
		let subscriptions: Array<{ subscription: { unsubscribe: () => void } }> = [];

		try {
			// Listen to persistent client
			const { data: sub1 } = supabasePersistent.auth.onAuthStateChange(
				(event, session) => {
					if (!session && !connectionError) {
						router.replace("/login");
					}
				}
			);
			subscriptions.push(sub1);

			// Listen to session client
			const { data: sub2 } = supabaseSession.auth.onAuthStateChange(
				(event, session) => {
					if (!session && !connectionError) {
						router.replace("/login");
					}
				}
			);
			subscriptions.push(sub2);
		} catch (err) {
			console.error("Error setting up auth listener:", err);
		}

		return () => {
			subscriptions.forEach((sub) => {
				if (sub) {
					sub.subscription.unsubscribe();
				}
			});
		};
	}, [checkAuth, router]);

	// ⏳ Loading state
	if (isLoading && !connectionError) {
		return (
			<LoadingState message="جاري التحقق من الهوية..." fullScreen />
		);
	}

	// 🔴 Connection error state
	if (connectionError) {
		return (
			<div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-red-100"
				>
					<div className="flex flex-col items-center gap-6 text-center">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
							<svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<div>
							<h2 className="text-2xl font-bold text-[#012d46] mb-2">
								فشل الاتصال بالخادم
							</h2>
							<p className="text-gray-600 mb-1">
								لا يمكن الاتصال بخادم Supabase
							</p>
							<p className="text-sm text-gray-500">
								يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى
							</p>
						</div>
						<button
							onClick={() => checkAuth()}
							className="w-full px-6 py-3 bg-[#7f2dfb] text-white rounded-xl font-semibold hover:bg-[#6a1fd8] transition-colors"
						>
							إعادة المحاولة
						</button>
						<button
							onClick={() => router.push("/login")}
							className="text-sm text-gray-500 hover:text-[#7f2dfb] transition-colors"
						>
							العودة إلى صفحة تسجيل الدخول
						</button>
					</div>
				</motion.div>
			</div>
		);
	}

	// 🧱 Render dashboard if authenticated
	if (!authChecked) return null;

	return (
		<SidebarProvider>
			<div className="min-h-screen flex flex-col md:flex-row bg-[#f8f9fc]">
				<Sidebar />
				<DashboardContent>{children}</DashboardContent>
			</div>
		</SidebarProvider>
	);
}

// 🌟 Main layout wrapper
export default function DashboardLayoutWrapper({
	children,
}: DashboardLayoutWrapperProps) {
	return (
		<>
			<AuthWrapper>{children}</AuthWrapper>
			<Toaster />
		</>
	);
}
