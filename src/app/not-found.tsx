"use client";
import Link from "next/link";
import { m } from "framer-motion";
import { Home, FileText, HelpCircle } from "lucide-react";
import Navbar from "@/components/landing-page/Navbar";
import { Button } from "@/components/ui";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30">
			<Navbar />
			<main className="pt-24 pb-20 px-4 flex flex-col items-center justify-center min-h-[80vh]">
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center max-w-lg"
				>
					{/* Creative 404 Illustration */}
					<div className="mb-8 relative">
						{/* Large 404 */}
						<m.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="text-[120px] sm:text-[160px] font-black text-[#7f2dfb]/10 leading-none select-none"
						>
							404
						</m.div>
						
						{/* Floating invoice icon */}
						<m.div
							initial={{ y: 0 }}
							animate={{ y: [-5, 5, -5] }}
							transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
							className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
						>
							<div className="h-20 w-20 rounded-2xl bg-white border-2 border-[#7f2dfb]/20 flex items-center justify-center shadow-lg">
								<FileText className="h-10 w-10 text-[#7f2dfb]" />
							</div>
						</m.div>
					</div>

					{/* Heading */}
					<m.h1
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-2xl sm:text-3xl font-bold text-[#012d46] mb-3"
					>
						أوبس! الفاتورة ضاعت 📄
					</m.h1>

					{/* Description */}
					<m.p
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="text-gray-500 mb-8 leading-relaxed"
					>
						هذي الصفحة مو موجودة. يمكن الرابط خطأ أو الصفحة انتقلت.
						<br />
						<span className="text-[#7f2dfb] font-medium">بس فواتيرك في أمان، لا تخاف!</span>
					</m.p>

					{/* CTA Buttons */}
					<m.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="flex flex-col sm:flex-row items-center justify-center gap-3"
					>
						<Link href="/">
							<Button variant="primary" className="flex items-center gap-2 px-6 py-3">
								<Home className="h-4 w-4" />
								الرئيسية
							</Button>
						</Link>
						<Link href="/login">
							<Button variant="secondary" className="flex items-center gap-2 px-6 py-3 border border-gray-200">
								<FileText className="h-4 w-4" />
								الدخول لحسابي
							</Button>
						</Link>
					</m.div>
				</m.div>

				{/* Helpful links */}
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="mt-12 text-center"
				>
					<div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-100">
						<HelpCircle className="h-4 w-4 text-gray-400" />
						<span className="text-sm text-gray-500">محتاج مساعدة؟</span>
						<Link href="/contact" className="text-sm text-[#7f2dfb] font-medium hover:underline">
							تواصل معي
						</Link>
					</div>
				</m.div>
			</main>
		</div>
	);
}
