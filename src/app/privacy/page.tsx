"use client";
import Navbar from "@/components/landing-page/Navbar";
import { m } from "framer-motion";
import { Shield, Heart, Mail, Lock, Eye, Trash2 } from "lucide-react";

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
				{/* Header */}
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-12"
				>
					<div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-100 px-4 py-2 mb-4">
						<Shield className="h-4 w-4 text-[#7f2dfb]" />
						<span className="text-sm font-medium text-[#7f2dfb]">الخصوصية</span>
					</div>
					<h1 className="text-4xl font-bold mb-4 text-[#012d46]">
						سياسة الخصوصية
					</h1>
					<p className="text-gray-500">
						آخر تحديث: فبراير 2026
					</p>
				</m.div>

				{/* Intro - Friendly */}
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-10 border border-purple-100"
				>
					<div className="flex items-start gap-4">
						<Heart className="h-6 w-6 text-[#7f2dfb] flex-shrink-0 mt-1" />
						<div>
							<p className="text-gray-700 leading-relaxed">
								<strong className="text-[#012d46]">بالعربي الواضح:</strong> أنا صدّيق، مطور مستقل أبني بِلفورا لوحدي.
								أحترم خصوصيتك لأني أعرف شعور إنسان يخاف على بياناته.
								هذي الصفحة تشرح بالضبط ايش نجمع وليش، بدون لف ولا دوران.
							</p>
						</div>
					</div>
				</m.div>

				{/* Sections */}
				<div className="space-y-8">
					<m.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white rounded-2xl border border-gray-100 p-6"
					>
						<div className="flex items-center gap-3 mb-4">
							<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
								<Eye className="h-5 w-5 text-blue-600" />
							</div>
							<h2 className="text-xl font-bold text-[#012d46]">ايش البيانات اللي نجمعها؟</h2>
						</div>
						<ul className="space-y-3 text-gray-600">
							<li className="flex items-start gap-2">
								<span className="text-[#7f2dfb] font-bold">•</span>
								<span><strong>بيانات الحساب:</strong> اسمك، إيميلك، ورقم جوالك (عشان تسجل وندخلك)</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-[#7f2dfb] font-bold">•</span>
								<span><strong>بيانات عملك:</strong> اسم منشأتك، عنوانها، شعارها (عشان تطلع في فواتيرك)</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-[#7f2dfb] font-bold">•</span>
								<span><strong>بيانات الفواتير:</strong> عملاءك، منتجاتك، الفواتير نفسها (هذي شغلك - ما نطلع عليها)</span>
							</li>
						</ul>
					</m.section>

					<m.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="bg-white rounded-2xl border border-gray-100 p-6"
					>
						<div className="flex items-center gap-3 mb-4">
							<div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
								<Lock className="h-5 w-5 text-green-600" />
							</div>
							<h2 className="text-xl font-bold text-[#012d46]">كيف نحمي بياناتك؟</h2>
						</div>
						<ul className="space-y-3 text-gray-600">
							<li className="flex items-start gap-2">
								<span className="text-emerald-500">✓</span>
								<span>كل البيانات مشفرة (HTTPS + تشفير في قاعدة البيانات)</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-emerald-500">✓</span>
								<span>ما نشارك بياناتك مع أي طرف ثالث، أبداً</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-emerald-500">✓</span>
								<span>ما نبيع بياناتك، هذا مو موديل عملنا</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-emerald-500">✓</span>
								<span>السيرفرات محمية ومراقبة</span>
							</li>
						</ul>
					</m.section>

					<m.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="bg-white rounded-2xl border border-gray-100 p-6"
					>
						<div className="flex items-center gap-3 mb-4">
							<div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
								<Trash2 className="h-5 w-5 text-red-600" />
							</div>
							<h2 className="text-xl font-bold text-[#012d46]">تبي تحذف بياناتك؟</h2>
						</div>
						<p className="text-gray-600 leading-relaxed">
							حقك. راسلني على <a href="mailto:support@bilfora.com" className="text-[#7f2dfb] hover:underline">support@bilfora.com</a> وأحذف كل شي خلال 48 ساعة.
							بدون أسئلة، بدون تعقيد.
						</p>
					</m.section>

					<m.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className="bg-white rounded-2xl border border-gray-100 p-6"
					>
						<div className="flex items-center gap-3 mb-4">
							<div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
								<Mail className="h-5 w-5 text-amber-600" />
							</div>
							<h2 className="text-xl font-bold text-[#012d46]">عندك سؤال؟</h2>
						</div>
						<p className="text-gray-600 leading-relaxed">
							كل ما يخص الخصوصية أو بياناتك، راسلني مباشرة:
							<br />
							<a href="mailto:support@bilfora.com" className="text-[#7f2dfb] font-medium hover:underline">support@bilfora.com</a>
						</p>
					</m.section>
				</div>
			</main>
		</div>
	);
}
