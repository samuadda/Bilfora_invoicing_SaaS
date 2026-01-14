"use client";
import Navbar from "@/components/landing-page/Navbar";
import { ChevronLeft, ChevronUp, Star, Shield, Lock, CreditCard, Headphones } from "lucide-react";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { TypewriterEffect } from "@/components/landing-page/typewriter-effect";
import { TextAnimate } from "@/components/landing-page/text-animate";
import { motion, AnimatePresence } from "framer-motion";
import { Safari } from "@/components/landing-page/safari";
import { Features } from "@/components/landing-page/Features";
import Iphone15Pro from "@/components/landing-page/iphone-15-pro";
import { ElegantFeatures } from "@/components/landing-page/elegant-features";
import { Marquee } from "@/components/landing-page/marquee";
import { cn } from "@/lib/utils";
import { Ripple } from "@/components/landing-page/ripple";
import Image from "next/image";
import { Pricing } from "@/components/landing-page/Pricing";
import { FAQ } from "@/components/landing-page/FAQ";
import { Logos } from "@/components/landing-page/Logos";
import { useState, useEffect } from "react";
import { Section, Container, Heading, Text, Card, Button } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";
import { StatNumber } from "@/components/landing-page/StatNumber";
import { ReviewCard } from "@/components/landing-page/ReviewCard";
import { heroWords, content, reviews } from "@/data/landing-page";



export default function Home() {
	const [showScrollButton, setShowScrollButton] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			// Show button after scrolling down 400px
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
						<motion.button
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
						</motion.button>
					)}
				</AnimatePresence>

				{/* hero section */}
				<section className="relative flex justify-center items-center pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
					<div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
						<div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#7f2dfb] opacity-20 blur-[100px]"></div>
					</div>

					<Container className="relative z-20">
						<div className="max-w-4xl mx-auto text-center">
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
								className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-8"
							>
								<span className="flex h-2 w-2 rounded-full bg-purple-600 ml-2 animate-pulse"></span>
								جديد: نظام إدارة الفواتير الأذكى في المملكة 🇸🇦
							</motion.div>
							<h1>
								<TypewriterEffect
									words={heroWords}
									className="text-5xl leading-tight font-bold sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight lg:text-8xl lg:leading-tight tracking-tight"
									cursorClassName="bg-[#ff5291]"
								/>
							</h1>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1, duration: 0.5 }}
								className="mt-8"
							>
								<Text variant="body-large" color="muted" className="sm:text-2xl max-w-2xl mx-auto leading-relaxed">
									توقف عن إضاعة الوقت مع إكسل والفواتير اليدوية.
									<br />
									أنشئ فواتير احترافية متوافقة مع هيئة الزكاة والضريبة في أقل من دقيقتين
									<br />
									<span className="font-semibold text-gray-800">- بدون خبرة محاسبية.</span>
								</Text>
							</motion.div>

							{/* Trust Badges */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1.2, duration: 0.5 }}
								className="flex items-center justify-center gap-6 mt-8 flex-wrap"
							>
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Shield className="h-5 w-5 text-green-500" />
									<span>متوافق مع هيئة الزكاة والضريبة</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Lock className="h-5 w-5 text-blue-500" />
									<span>بياناتك مشفرة وآمنة 100%</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<CreditCard className="h-5 w-5 text-purple-500" />
									<span>بدون بطاقة ائتمان - جرب مجاناً</span>
								</div>
							</motion.div>

							{/* CTA Buttons  */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 1.5 }}
								className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10"
							>
								<Link href="/register">
									<MainButton
										text="ابدأ مجاناً - بدون بطاقة ائتمان"
										bgColor="bg-[#7f2dfb]"
										textColor="text-white"
										className="w-full sm:w-auto px-8 py-4 text-lg shadow-purple-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
									/>
								</Link>
								<Link
									href="/login"
									className="group flex items-center gap-2 text-gray-600 font-medium hover:text-[#7f2dfb] transition-colors"
								>
									<span>تسجيل الدخول</span>
									<ChevronLeft
										size={20}
										className="transition-transform group-hover:-translate-x-1"
									/>
								</Link>
								<Link
									href="/demo"
									className="group flex items-center gap-2 text-gray-600 font-medium hover:text-[#7f2dfb] transition-colors text-sm"
								>
									<span>شاهد كيف يعمل</span>
									<ChevronLeft
										size={16}
										className="transition-transform group-hover:-translate-x-1"
									/>
								</Link>
							</motion.div>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 2, duration: 1 }}
								className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-500"
							>
								<div className="flex -space-x-2 space-x-reverse">
									{[1, 2, 3, 4].map((i) => (
										<div
											key={i}
											className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
										>
											<Image
												src={`https://avatar.vercel.sh/${i}`}
												width={32}
												height={32}
												alt="user"
											/>
										</div>
									))}
								</div>
								<div className="flex items-center gap-1">
									<div className="flex text-yellow-400">
										<Star className="h-4 w-4 fill-current" />
										<Star className="h-4 w-4 fill-current" />
										<Star className="h-4 w-4 fill-current" />
										<Star className="h-4 w-4 fill-current" />
										<Star className="h-4 w-4 fill-current" />
									</div>
									<span className="font-bold text-gray-700">
										5.0
									</span>
								</div>
								<span>من 500+ عميل سعيد</span>
							</motion.div>
						</div>
					</Container>
				</section>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Logos />
				</motion.div>

				{/* Trust Signals Section */}
				<Section
					padding="small"
					background="muted"
					divider
					className="border-y border-gray-200"
				>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
					>
						<Container>
							<div className={cn("grid md:grid-cols-4", layout.gap.large)}>
								<div className="text-center">
									<Shield className="h-12 w-12 text-green-500 mx-auto mb-3" />
									<Heading variant="h3-subsection" className="mb-1">متوافق مع الزكاة والضريبة</Heading>
									<Text variant="body-small" color="muted">
										جميع الفواتير تلتزم بالمتطلبات السعودية
									</Text>
								</div>
								<div className="text-center">
									<Lock className="h-12 w-12 text-blue-500 mx-auto mb-3" />
									<Heading variant="h3-subsection" className="mb-1">بياناتك آمنة 100%</Heading>
									<Text variant="body-small" color="muted">
										تشفير SSL ونسخ احتياطية يومية
									</Text>
								</div>
								<div className="text-center">
									<CreditCard className="h-12 w-12 text-purple-500 mx-auto mb-3" />
									<Heading variant="h3-subsection" className="mb-1">جرب مجاناً</Heading>
									<Text variant="body-small" color="muted">
										بدون بطاقة ائتمان - ألغِ في أي وقت
									</Text>
								</div>
								<div className="text-center">
									<Headphones className="h-12 w-12 text-orange-500 mx-auto mb-3" />
									<Heading variant="h3-subsection" className="mb-1">دعم بالعربية</Heading>
									<Text variant="body-small" color="muted">
										فريق دعم متاح 6 أيام في الأسبوع
									</Text>
								</div>
							</div>
						</Container>
					</motion.div>
				</Section>

				{/* features */}
				<motion.div
					id="features"
					className="relative z-10"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Features />
				</motion.div>

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
						<motion.div
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
						</motion.div>

						{/* statistics section */}
						<motion.div
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
								<p className="text-3xl md:text-4xl font-extrabold text-[#7f2dfb] mb-1">
									<StatNumber
										value={10}
										prefix="+"
										suffix="K"
									/>
								</p>
								<Text variant="body-small" className="font-semibold text-slate-800 mb-1">
									فاتورة مُصدَرة
								</Text>
								<Text variant="body-xs" color="muted">
									من آلاف المستقلين السعداء
								</Text>
							</Card>
							<Card padding="standard" className="text-center">
								<p className="text-3xl md:text-4xl font-extrabold text-emerald-500 mb-1">
									<StatNumber value={500} prefix="+" />
								</p>
								<Text variant="body-small" className="font-semibold text-slate-800 mb-1">
									منشأة ومستقل
								</Text>
								<Text variant="body-xs" color="muted">
									يعتمدون على بيلفورا يومياً
								</Text>
							</Card>
							<Card padding="standard" className="text-center">
								<p className="text-3xl md:text-4xl font-extrabold text-cyan-500 mb-1">
									<StatNumber
										value={3}
										prefix="+"
										suffix="M"
									/>
								</p>
								<Text variant="body-small" className="font-semibold text-slate-800 mb-1">
									SAR قيمة فواتير
								</Text>
								<Text variant="body-xs" color="muted">
									تمت معالجتها عبر المنصة
								</Text>
							</Card>
							<Card padding="standard" className="text-center">
								<p className="text-3xl md:text-4xl font-extrabold text-amber-500 mb-1">
									<StatNumber value={90} suffix="%" />
								</p>
								<Text variant="body-small" className="font-semibold text-slate-800 mb-1">
									توفّر في الوقت
								</Text>
								<Text variant="body-xs" color="muted">
									عند إنشاء وإرسال الفواتير
								</Text>
							</Card>
						</motion.div>
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
							من التسجيل إلى فاتورتك الأولى - أقل من دقيقتين
						</Text>
					</div>
					<ElegantFeatures content={content} />
				</Section>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Pricing />
				</motion.div>

				{/* Reviews */}
				<Section
					padding="large"
					background="muted"
					className="relative overflow-hidden"
				>
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
						className="mb-12 text-center"
					>
						<Heading variant="h2" className="mb-4">
							تجارب أصدقائنا
						</Heading>
						<Text variant="body-large" color="muted">
							قصص نجاح من أشخاص مثلك يستخدمون بيلفورا يومياً
						</Text>
					</motion.div>
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

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<FAQ />
				</motion.div>

				{/* CTA Section */}
				<footer className="max-w-screen mx-auto relative overflow-hidden pt-20">
					<motion.div
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
						<h2 className="relative z-10 text-3xl md:text-5xl text-white font-bold max-w-4xl leading-tight">
							وفر 10 ساعات شهرياً - ركز على ما تحب بدلاً من الفواتير
							<br />
							<span className="text-purple-200">
								أنشئ فاتورتك الأولى في دقيقتين - بدون خبرة محاسبية
							</span>
						</h2>
						<p className="relative z-10 text-lg text-purple-100 max-w-2xl">
							انضم لـ <span className="font-semibold text-white">500+ مستقل سعودي</span> يستخدمون بيلفورا يومياً.
							<br />
							<span className="font-semibold text-white">بدون بطاقة ائتمان - ألغِ في أي وقت</span>
						</p>
						<div className="relative z-10 flex flex-col sm:flex-row gap-4">
							<Link href="/register">
								<Button
									variant="secondary"
									size="lg"
									pill
									className="px-10 bg-white text-[#7f2dfb] hover:shadow-lg transform hover:-translate-y-1"
								>
									ابدأ مجاناً الآن
								</Button>
							</Link>
							<Link href="/demo">
								<Button
									variant="ghost"
									size="lg"
									pill
									className="px-10 text-white bg-white/10 border border-white/20 hover:bg-white/20 transform hover:-translate-y-1"
								>
									شاهد عرض توضيحي
								</Button>
							</Link>
						</div>
					</motion.div>

					{/* Main Footer */}
					<div className="bg-[#0f172a] text-white border-t border-gray-800">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
								{/* Company Info */}
								<div className="space-y-6">
									<Link href="/" className="inline-block">
										<Image
											src="/logoPNG.png"
											alt="Bilfora"
											width={140}
											height={40}
											className="h-10 w-auto brightness-0 invert"
										/>
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
												href="/dashboard"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												لوحة التحكم
											</Link>
										</li>
										<li>
											<Link
												href="/dashboard/invoices"
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
												href="/help"
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
										© 2025 بيلفورا. جميع الحقوق محفوظة.
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
