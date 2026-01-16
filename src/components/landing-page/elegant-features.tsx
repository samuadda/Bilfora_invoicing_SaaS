"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import {
	FileText,
	Database,
	CreditCard,
	Sparkles,
	ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface ContentItem {
	title: string;
	description: string;
	content?: React.ReactNode;
}

interface Feature extends ContentItem {
	icon: React.ReactNode;
	gradient: string;
}

const gradients = [
	"from-cyan-500 to-emerald-500",
	"from-orange-500 to-yellow-500",
	"from-blue-500 to-indigo-500",
	"from-pink-500 to-rose-500",
];

const icons = [
	<FileText key="file" className="w-6 h-6" />,
	<Database key="database" className="w-6 h-6" />,
	<CreditCard key="card" className="w-6 h-6" />,
	<Sparkles key="sparkles" className="w-6 h-6" />,
];

export const ElegantFeatures = ({ content }: { content: ContentItem[] }) => {
	const features: Feature[] = content.map((item, index) => ({
		...item,
		icon: icons[index % icons.length],
		gradient: gradients[index % gradients.length],
	}));

	const [activeIndex, setActiveIndex] = useState(0);
	const activeFeature = features[activeIndex] ?? features[0];

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
			<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
				{/* Left: Steps list */}
				<div className="space-y-4">
					{features.map((feature, index) => {
						const isActive = index === activeIndex;

						return (
							<button
								key={feature.title}
								type="button"
								onClick={() => setActiveIndex(index)}
								onMouseEnter={() => setActiveIndex(index)}
								className={cn(
									"w-full text-right rounded-2xl border px-5 py-4 sm:px-6 sm:py-5 transition-all duration-200 flex items-start gap-4",
									"bg-white hover:bg-slate-50",
									isActive
										? "border-transparent shadow-md ring-2 ring-offset-2 ring-offset-gray-50 ring-cyan-400/80"
										: "border-gray-200"
								)}
							>
								<div
									className={cn(
										"mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br",
										feature.gradient
									)}
								>
									{feature.icon}
								</div>
								<div className="flex-1 space-y-1">
									<h3
										className={cn(
											"text-base sm:text-lg font-bold",
											isActive ? "text-slate-900" : "text-slate-800"
										)}
									>
										{feature.title}
									</h3>
									<p className="text-sm sm:text-[15px] leading-relaxed text-slate-600">
										{feature.description}
									</p>
								</div>
							</button>
						);
					})}
				</div>

				{/* Right: Big card that follows selection */}
				<m.div
					key={activeFeature?.title}
					initial={{ opacity: 0, x: 40, scale: 0.96 }}
					animate={{ opacity: 1, x: 0, scale: 1 }}
					transition={{ duration: 0.35, ease: "easeOut" }}
					className={cn(
						"relative rounded-3xl bg-gradient-to-br p-8 sm:p-10 md:p-12 shadow-2xl overflow-hidden",
						activeFeature?.gradient || "from-cyan-500 to-emerald-500"
					)}
				>
					{/* Grid background */}
					<div className="pointer-events-none absolute inset-0 opacity-30">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35)_0,_transparent_55%),radial-gradient(circle_at_bottom,_rgba(0,0,0,0.12)_0,_transparent_60%)]" />
						<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:22px_22px]" />
					</div>

					<div className="relative z-10 flex flex-col gap-6 text-white">
						<div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg">
							{activeFeature?.icon}
						</div>
						<div className="space-y-3">
							<h3 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug">
								{activeFeature?.title}
							</h3>
							<p className="text-sm sm:text-base md:text-lg text-white/90 max-w-md leading-relaxed">
								{activeFeature?.description}
							</p>
						</div>

						<div className="mt-4 flex items-center gap-3">
							<Link href="/register">
								<button className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm sm:text-base font-semibold text-slate-900 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
									ابدأ الآن
									<ArrowLeft className="mr-2 h-4 w-4" />
								</button>
							</Link>
							<span className="text-xs sm:text-sm text-white/80">
								لا تحتاج بطاقة ائتمان للتجربة
							</span>
						</div>
					</div>
				</m.div>
			</div>
		</div>
	);
}


