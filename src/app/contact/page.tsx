"use client";
import { m } from "framer-motion";
import { Mail, MessageCircle } from "lucide-react";
import Navbar from "@/components/landing-page/Navbar";

export default function ContactPage() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="pt-32 pb-20 px-4">
				<div className="max-w-xl mx-auto text-center">
					{/* Header */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-purple-50 mb-6">
							<MessageCircle className="h-8 w-8 text-[#7f2dfb]" />
						</div>
						<h1 className="text-3xl sm:text-4xl font-bold text-[#012d46] mb-4">
							تواصل معي
						</h1>
						<p className="text-gray-500 leading-relaxed mb-10">
							أنا صدّيق، المطور الوحيد لبِلفورا.
							<br />
							عندك سؤال أو فكرة أو مشكلة؟ راسلني مباشرة!
						</p>
					</m.div>

					{/* Contact Options */}
					<div className="space-y-4">
						{/* Email */}
						<m.a
							href="mailto:support@bilfora.com"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-[#7f2dfb] hover:bg-purple-50/50 transition-all group"
						>
							<div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-[#7f2dfb] transition-colors">
								<Mail className="h-6 w-6 text-[#7f2dfb] group-hover:text-white transition-colors" />
							</div>
							<div className="text-right flex-1">
								<p className="font-semibold text-[#012d46]">البريد الإلكتروني</p>
								<p className="text-[#7f2dfb] text-sm">support@bilfora.com</p>
							</div>
						</m.a>

						{/* X (Twitter) */}
						<m.a
							href="https://x.com/saddiqmusa"
							target="_blank"
							rel="noopener noreferrer"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-[#7f2dfb] hover:bg-purple-50/50 transition-all group"
						>
							<div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-black transition-colors">
								<svg className="h-5 w-5 text-black group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
									<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
								</svg>
							</div>
							<div className="text-right flex-1">
								<p className="font-semibold text-[#012d46]">X (تويتر)</p>
								<p className="text-gray-500 text-sm">@saddiqmusa</p>
							</div>
						</m.a>

						{/* GitHub */}
						<m.a
							href="https://github.com/saddiqmusa"
							target="_blank"
							rel="noopener noreferrer"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-[#7f2dfb] hover:bg-purple-50/50 transition-all group"
						>
							<div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 transition-colors">
								<svg className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
								</svg>
							</div>
							<div className="text-right flex-1">
								<p className="font-semibold text-[#012d46]">GitHub</p>
								<p className="text-gray-500 text-sm">@saddiqmusa</p>
							</div>
						</m.a>
					</div>

					{/* Footer note */}
					<m.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						className="text-sm text-gray-400 mt-10"
					>
						أرد عادةً خلال 24 ساعة
					</m.p>
				</div>
			</main>
		</div>
	);
}
