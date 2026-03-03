"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronUp, Zap, Globe, Gift, Shield } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import Navbar from "@/components/landing-page/Navbar";
import MainButton from "@/components/MainButton";
import { TypewriterEffect } from "@/components/landing-page/typewriter-effect";
import { TextAnimate } from "@/components/landing-page/text-animate";
import { Safari } from "@/components/landing-page/safari";
import { Features } from "@/components/landing-page/Features";
import Iphone15Pro from "@/components/landing-page/iphone-15-pro";
import { ElegantFeatures } from "@/components/landing-page/elegant-features";
import { Marquee } from "@/components/landing-page/marquee";
import { cn } from "@/lib/utils";
import { Ripple } from "@/components/landing-page/ripple";
import { Pricing } from "@/components/landing-page/Pricing";
import { FAQ } from "@/components/landing-page/FAQ";
import { Logos } from "@/components/landing-page/Logos";
import { Section, Container, Heading, Text, Card, Button } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";
import { ReviewCard } from "@/components/landing-page/ReviewCard";
import { heroWords, content, reviews } from "@/data/landing-page";

/**
 * Client-side landing page component containing all interactive elements.
 * This is wrapped by a server component for better SSR performance.
 */
export default function LandingPageClient() {
	const [showScrollButton, setShowScrollButton] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 400) {
				setShowScrollButton(true);
			} else {
				setShowScrollButton(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const firstRow = reviews.slice(0, reviews.length / 2);
	const secondRow = reviews.slice(reviews.length / 2);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<>
			<div className="relative bg-white overflow-hidden" id="home">
				<Navbar />

				{/* Scroll to top button */}
				<AnimatePresence>
					{showScrollButton && (
						<m.button
							onClick={scrollToTop}
							className="fixed bottom-8 right-8 z-50 p-3 bg-[#7f2dfb] text-white rounded-full shadow-lg hover:bg-[#6a1fd8] hover:shadow-xl transition-all duration-200 hover:scale-110"
							initial={{ opacity: 0, scale: 0 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0 }}
							transition={{ duration: 0.3 }}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
						>
							<ChevronUp size={24} />
						</m.button>
					)}
				</AnimatePresence>

				{/* hero section */}
				<section className="relative flex justify-center items-center pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
					<div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
						<div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#7f2dfb] opacity-20 blur-[100px]"></div>
					</div>

					<Container className="relative z-20">
						<div className="max-w-4xl mx-auto text-center">

							<h1>
								<TypewriterEffect
									words={heroWords}
									className="text-5xl leading-tight font-bold sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight lg:text-8xl lg:leading-tight tracking-tight"
									cursorClassName="bg-[#ff5291]"
								/>
							</h1>
							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1, duration: 0.5 }}
								className="mt-8"
							>
								<Text variant="body-large" color="muted" className="sm:text-2xl max-w-3xl mx-auto leading-relaxed">
									لا تحتاج محاسب ولا خبرة سابقة.
									<br className="hidden sm:block" />
									أنشئ فواتير احترافية بثوانٍ. ودع الإكسل، وابدأ تظهر كأنك شركة كبيرة.
									<br />
									<span className="font-bold text-[#012d46] bg-purple-50 px-2 rounded-md border border-purple-100 mt-2 inline-block">
										خلّي المحاسبة علينا، وركّز أنت في تجارتك
									</span>
								</Text>
							</m.div>



							{/* CTA Buttons  */}
							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 1.5 }}
								className="flex flex-col items-center justify-center gap-4 mt-8"
							>
								<Link href="/register">
									<MainButton
										text="ابدأ بإصدار فواتيرك مجاناً"
										bgColor="bg-[#7f2dfb]"
										textColor="text-white"
										className="w-full sm:w-auto px-10 py-5 text-xl shadow-purple-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-bold"
									/>
								</Link>
								<p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
									بدون بطاقة ائتمان
									<span className="text-gray-300 mx-1">|</span>
									<span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
									مصمم للمستقلين والشركات
								</p>
							</m.div>


						</div>
					</Container>
				</section>

				<m.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Logos />
				</m.div>



				{/* features */}
				<m.div
					id="features"
					className="relative z-10"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Features />
				</m.div>

				{/* mock up */}
				<Section padding="large" background="muted" className="overflow-hidden">
					<Container>
						<div className={cn("flex flex-col items-center justify-center gap-10 mb-16 text-center")}>
							<TextAnimate
								as="h2"
								animation="blurIn"
								once={true}
								className="text-4xl font-bold md:text-5xl text-[#012d46]"
							>
								بلفرها من جوالك أو لابتوبك في ثوانٍ
							</TextAnimate>
							<Text variant="body-large" color="muted" className="max-w-2xl">
								تجربة استخدام سلسة ومتناسقة عبر جميع أجهزتك.
								ابدأ الفاتورة من المكتب وأرسلها من المقهى.
							</Text>
						</div>
						<m.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
							viewport={{ once: true, amount: 0.2 }}
							className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16"
						>
							<Iphone15Pro
								className="w-full max-w-[300px] h-auto shadow-2xl rounded-[3rem]"
								src="/phoneDashboardDemo.png"
							/>
							<div className="w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden border border-gray-200">
								<Safari
									className="w-full h-auto"
									url="bilfora.com/dashboard"
									imageSrc="/dashboardDemo.png"
								/>
							</div>
						</m.div>

						{/* statistics section */}
						<m.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{
								duration: 0.5,
								ease: "easeOut",
								delay: 0.1,
							}}
							className={cn("mt-16 grid sm:grid-cols-2 lg:grid-cols-4", layout.gap.large)}
						>
							<Card padding="standard" className="text-center">
								<div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
									<Zap className="h-5 w-5 text-[#7f2dfb]" />
								</div>
								<Text variant="body-small" className="font-semibold text-slate-800 mb-1">
									90 ثانية
								</Text>
								<Text variant="body-xs" color="muted">
									لإنشاء أول فاتورة احترافية
								</Text>
							</Card>
							<Card padding="standard" className="text-center">
								<div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
									<Globe className="h-5 w-5 text-emerald-500" />
								</div>
								<Text variant="body-small" className="font-semibold text-slate-800 mb-1">
									عربي 100%
								</Text>
								<Text variant="body-xs" color="muted">
									من التصميم للكود للدعم
								</Text>
							</Card>
							<Card padding="standard" className="text-center">
								<div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-3">
									<Gift className="h-5 w-5 text-cyan-500" />
								</div>
								<Text variant="body-small" className="font-semibold text-slate-800 mb-1">
									مجاني تماماً
								</Text>
								<Text variant="body-xs" color="muted">
									بدون رسوم خفية أو اشتراكات
								</Text>
							</Card>
							<Card padding="standard" className="text-center">
								<div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
									<Shield className="h-5 w-5 text-amber-500" />
								</div>
								<Text variant="body-small" className="font-semibold text-slate-800 mb-1">
									آمن وموثوق
								</Text>
								<Text variant="body-xs" color="muted">
									بياناتك محمية ومشفرة
								</Text>
							</Card>
						</m.div>
					</Container>
				</Section>

				{/* how does it work ? */}
				<Section
					padding="large"
					className="bg-gradient-to-b from-white to-gray-50"
					id="how-to"
				>
					<div className="text-center mb-16">
						<TextAnimate
							as="h2"
							animation="blurIn"
							once={true}
							className="text-4xl font-bold md:text-5xl text-[#012d46]"
						>
							كيف تبلفرها ؟
						</TextAnimate>
						<Text variant="body-large" color="muted" className="mt-4">
							من التسجيل إلى فاتورتك الأولى أقل من دقيقتين
						</Text>
					</div>
					<ElegantFeatures content={content} />
				</Section>

				<m.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Pricing />
				</m.div>

				{/* Reviews */}
				<Section
					padding="large"
					background="muted"
					className="relative overflow-hidden"
				>
					<m.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
						className="mb-12 text-center"
					>
						<Heading variant="h2" className="mb-4">
							شركاء النجاح 💜
						</Heading>
						<Text variant="body-large" color="muted">
							انضم لأكثر من 500+ مبدع ومستقل يعتمدون على بِلفورا
						</Text>
					</m.div>
					<Marquee pauseOnHover className="[--duration:40s]">
						{firstRow.map((review) => (
							<ReviewCard key={review.username} {...review} />
						))}
					</Marquee>
					<Marquee
						reverse
						pauseOnHover
						className="[--duration:40s] mt-8"
					>
						{secondRow.map((review) => (
							<ReviewCard key={review.username} {...review} />
						))}
					</Marquee>
					<div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-50"></div>
					<div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-50"></div>
				</Section>

				<m.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<FAQ />
				</m.div>

				{/* CTA Section */}
				<footer className="max-w-screen mx-auto relative overflow-hidden pt-20">
					<m.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.4 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
						className="max-w-6xl mx-auto px-4 relative flex flex-col justify-center mb-24 items-center gap-8 text-center py-16 lg:py-24 rounded-3xl bg-[#7f2dfb] overflow-hidden shadow-2xl mx-4 lg:mx-auto"
					>
						<Ripple
							mainCircleSize={500}
							mainCircleOpacity={0.3}
							numCircles={12}
							className="absolute inset-0 z-0 text-white"
						/>
						<h2 className="relative z-10 text-3xl md:text-5xl text-white font-bold max-w-4xl leading-tight mb-8">
							ابدأ رحلتك المالية مجاناً
							<br />
							<span className="text-purple-200 text-2xl md:text-3xl mt-4 block font-medium">
								وخلص أول فاتورة في دقيقة
							</span>
						</h2>
						
						<div className="relative z-10 flex flex-col sm:flex-row gap-4">
							<Link href="/register">
								<Button
									variant="secondary"
									size="lg"
									pill
									className="px-12 py-8 text-xl bg-white text-[#7f2dfb] hover:shadow-lg transform hover:-translate-y-1 font-bold"
								>
									ابدأ مجاناً الآن
								</Button>
							</Link>
						</div>
					</m.div>

					{/* Main Footer */}
					<div className="bg-[#0f172a] text-white border-t border-gray-800">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
								{/* Company Info */}
								<div className="space-y-6">
									<Link href="/" className="inline-block">
										<span className="text-3xl font-black text-white tracking-tighter hover:opacity-80 transition-opacity">
											بِلفورا
										</span>
									</Link>
									<p className="text-gray-400 text-sm leading-relaxed">
										منصة ذكية لإصدار الفواتير الإلكترونية
										للمستقلين وأصحاب الأعمال. أنشئ فواتيرك
										بسهولة واحترافية في ثوانٍ.
									</p>
									<div className="flex items-center gap-4">
										<Link
											href="https://twitter.com/bilfora"
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-400 hover:text-[#7f2dfb] transition-colors p-1"
										>
											<svg
												className="h-5 w-5"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
											</svg>
										</Link>
										<Link
											href="https://linkedin.com/company/bilfora"
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-400 hover:text-[#7f2dfb] transition-colors p-1"
										>
											<svg
												className="h-5 w-5"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
											</svg>
										</Link>
									</div>
								</div>

								{/* Product Links */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-white">
										المنتج
									</h3>
									<ul className="space-y-3">
										<li>
											<Link
												href="/register"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												لوحة التحكم
											</Link>
										</li>
										<li>
											<Link
												href="/register"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												إنشاء الفواتير
											</Link>
										</li>
										<li>
											<Link
												href="/#pricing"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												الأسعار
											</Link>
										</li>
									</ul>
								</div>

								{/* Support Links */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-white">
										الدعم والمساعدة
									</h3>
									<ul className="space-y-3">
										<li>
											<Link
												href="/contact"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												مركز المساعدة
											</Link>
										</li>
										<li>
											<Link
												href="/contact"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												تواصل معنا
											</Link>
										</li>
										<li>
											<Link
												href="/#faq"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												الأسئلة الشائعة
											</Link>
										</li>
									</ul>
								</div>

								{/* Legal & Company */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-white">
										الشركة
									</h3>
									<ul className="space-y-3">
										<li>
											<Link
												href="/about"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												من نحن
											</Link>
										</li>
										<li>
											<Link
												href="/privacy"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												سياسة الخصوصية
											</Link>
										</li>
										<li>
											<Link
												href="/terms"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												شروط الاستخدام
											</Link>
										</li>
									</ul>
								</div>
							</div>

							{/* Newsletter Signup */}
							<div className="mt-16 pt-8 border-t border-gray-800/50">
								<div className="max-w-md mx-auto text-center">
									<h3 className="text-lg font-semibold mb-2 text-white">
										ابق على اطلاع
									</h3>
									<p className="text-gray-400 text-sm mb-6">
										اشترك في نشرتنا الإخبارية للحصول على آخر
										التحديثات والنصائح
									</p>
									<div className="flex gap-2">
										<input
											type="email"
											placeholder="بريدك الإلكتروني"
											className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb] focus:border-transparent transition-all"
										/>
										<Button
											variant="primary"
											size="md"
											className="px-6"
										>
											اشترك
										</Button>
									</div>
								</div>
							</div>
						</div>

						{/* Bottom Bar */}
						<div className="bg-[#0b1120] border-t border-gray-800/50">
							<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
								<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
									<div className="text-gray-500 text-sm">
										© 2025 بِلفورا. جميع الحقوق محفوظة.
									</div>
									<div className="flex items-center gap-8 text-sm">
										<Link
											href="/privacy"
											className="text-gray-500 hover:text-white transition-colors"
										>
											الخصوصية
										</Link>
										<Link
											href="/terms"
											className="text-gray-500 hover:text-white transition-colors"
										>
											الشروط
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</>
	);
}
