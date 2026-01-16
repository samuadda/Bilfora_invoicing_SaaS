"use client";
import Navbar from "@/components/landing-page/Navbar";
import { TextAnimate } from "@/components/landing-page/text-animate";
import { m } from "framer-motion";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="pt-32 pb-24 px-4 max-w-4xl mx-auto">
				{/* Hero */}
				<section className="text-center mb-16">
					<TextAnimate
						as="h1"
						animation="blurIn"
						once={true}
						className="text-4xl font-bold md:text-5xl text-[#012d46] mb-4"
					>
						المطور خلف بيلفورا
					</TextAnimate>
					<p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">image.png
						منتج تم تطويره بالكامل بواسطة مطوّر واحد يحب التفاصيل الصغيرة
						ويؤمن أن التجربة الجميلة تبدأ من الشاشة الأولى حتى آخر فاتورة.
					</p>
				</section>

				{/* Dev card */}
				<section className="grid md:grid-cols-[1.1fr_1.2fr] gap-10 items-center mb-20">
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7f2dfb] via-indigo-600 to-slate-900 p-7 text-right text-white shadow-2xl"
					>
						<div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,transparent_60%),radial-gradient(circle_at_bottom,_black,transparent_60%)]" />
						<div className="relative space-y-4">
							<div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-1 text-xs font-medium backdrop-blur">
								<span className="h-2 w-2 rounded-full bg-emerald-400" />
								<span>مطوّر واحد • منتج كامل</span>
							</div>
							<h2 className="text-2xl md:text-3xl font-bold">
								مرحباً، أنا صدّيق المطوّر الوحيد لبيلفورا 👋
							</h2>
							<p className="text-sm md:text-base text-purple-50 leading-relaxed">
								بنيت بيلفورا لأني كنت أرى المستقلين وأصحاب المشاريع الصغيرة
								يضيعون وقتهم في الإكسل والفواتير اليدوية. قررت أصنع أداة
								عربية بسيطة، أنيقة، وتعمل فعلاً على أرض الواقع.
							</p>
							<p className="text-sm md:text-base text-purple-100 leading-relaxed">
								من تصميم الواجهة، مروراً بتجربة الاستخدام، إلى ربط قواعد
								البيانات وسيرفرات البريد – كل سطر كود هنا كُتب بعناية من
								شخص واحد يحب المنتجات المتقنة.
							</p>
						</div>
					</m.div>

					<div className="space-y-6 text-gray-700 leading-relaxed">
						<h3 className="text-xl font-bold text-[#012d46]">
							كيف أعمل على بيلفورا؟
						</h3>
						<ul className="space-y-3 text-sm md:text-base">
							<li>
								<span className="font-semibold text-[#7f2dfb]">
									• الاستماع للمستخدمين:
								</span>{" "}
								أتابع رسائلكم وتجاربكم مع النظام، وأحوّلها إلى تحسينات
								عملية في لوحة التحكم وسير العمل.
							</li>
							<li>
								<span className="font-semibold text-[#7f2dfb]">
									• تركيز على السرعة والبساطة:
								</span>{" "}
								أختصر الخطوات قدر الإمكان، وأحاول أن يكون كل شيء واضحاً
								حتى بدون شرح.
							</li>
							<li>
								<span className="font-semibold text-[#7f2dfb]">
									• تجربة مستخدم ممتعة:
								</span>{" "}
								الأنيميشن، الألوان، وتفاصيل الواجهة ليست كماليات؛ هي
								جزء من شعورك بالاحترافية وأنت تصدر فاتورتك.
							</li>
						</ul>
					</div>
				</section>

				{/* Stack & philosophy */}
				<section className="space-y-10">
					<div className="space-y-4 text-center">
						<h3 className="text-xl font-bold text-[#012d46]">
							ما الذي استعمله لبناء بيلفورا؟
						</h3>
						<p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
							بيلفورا مبني باستخدام تقنيات حديثة مثل{" "}
							<span className="font-semibold">Next.js</span>،{" "}
							<span className="font-semibold">Tailwind CSS</span>، و{" "}
							<span className="font-semibold">Supabase</span> لتخزين
							البيانات وإدارة المستخدمين، مع الكثير من الاهتمام
							بتجربة اللغة العربية واتجاه الكتابة.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6 text-sm md:text-base text-gray-700">
						<div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-5">
							<h4 className="mb-2 text-sm font-semibold text-[#012d46]">
								منتج مستقل
							</h4>
							<p>
								لا توجد شركة ضخمة خلف بيلفورا؛ فقط مطوّر واحد يحب بناء
								أدوات حقيقية تحل مشاكل يومية.
							</p>
						</div>
						<div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-5">
							<h4 className="mb-2 text-sm font-semibold text-[#012d46]">
								تحسين مستمر
							</h4>
							<p>
								كل ميزة جديدة تبدأ من ملاحظة أو رسالة من مستخدم مثلك، ثم
								تتحوّل إلى تحديث حي في لوحة التحكم.
							</p>
						</div>
						<div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-5">
							<h4 className="mb-2 text-sm font-semibold text-[#012d46]">
								اهتمام بالتفاصيل
							</h4>
							<p>
								من نوع الخط، إلى حركة الزر، إلى سهولة القراءة على الجوال؛
								كل هذه التفاصيل جزء من هوية بيلفورا.
							</p>
						</div>
					</div>

					{/* Social links */}
					<div className="pt-6 border-t border-gray-100 mt-6">
						<div className="flex flex-col items-center gap-3 text-center">
							<p className="text-sm text-gray-600">
								تحب تشوف الكود أو تتابع رحلة بناء بيلفورا كمشروع مستقل؟
							</p>
							<div className="flex items-center gap-4">
								<Link
									href="https://github.com/SAMUADDA"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-800 hover:border-[#7f2dfb] hover:text-[#7f2dfb] transition-colors"
								>
									<Github className="h-4 w-4" />
									<span>GitHub / SAMUADDA</span>
								</Link>
								<Link
									href="https://twitter.com/SAMUADDA"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-800 hover:border-sky-500 hover:text-sky-500 transition-colors"
								>
									<Twitter className="h-4 w-4" />
									<span>X / SAMUADDA</span>
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

