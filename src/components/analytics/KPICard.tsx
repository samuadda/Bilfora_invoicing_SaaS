"use client";

import { m } from "framer-motion";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	color: "purple" | "blue" | "green" | "pink" | "orange" | "red" | "indigo";
	trend?: {
		value: number; // percentage change
		label?: string;
	};
	subtitle?: string;
	delay?: number;
}

export default function KPICard({
	title,
	value,
	icon: Icon,
	color,
	trend,
	subtitle,
	delay = 0,
}: KPICardProps) {
	const colors = {
		purple: "bg-purple-50 text-brand-primary",
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		pink: "bg-pink-50 text-pink-600",
		orange: "bg-orange-50 text-orange-600",
		red: "bg-red-50 text-red-600",
		indigo: "bg-indigo-50 text-indigo-600",
	};

	const isPositive = trend ? trend.value >= 0 : null;

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.5 }}
			className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group h-full flex flex-col"
		>
			{/* Subtle gradient background */}
			<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50/50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />

			<div className="flex justify-between items-start mb-4 relative z-10 gap-2 w-full">
				<div
					className={cn(
						"p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300 flex-shrink-0",
						colors[color]
					)}
				>
					<Icon size={24} strokeWidth={2.5} />
				</div>
				{trend && (
					<span
						className={cn(
							"flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg flex-1 min-w-0",
							isPositive
								? "text-green-600 bg-green-50 border border-green-100"
								: "text-red-600 bg-red-50 border border-red-100"
						)}
					>
						{isPositive ? (
							<ArrowUpRight size={12} className="flex-shrink-0" />
						) : (
							<ArrowDownRight size={12} className="flex-shrink-0" />
						)}
						<span className="flex-shrink-0">{Math.abs(trend.value).toFixed(1)}%</span>
						{trend.label && (
							<span className="text-gray-500 font-normal mr-1 text-[10px]">
								{trend.label}
							</span>
						)}
					</span>
				)}
			</div>
			<div className="relative z-10 flex-1 flex flex-col w-full">
				<p className="text-gray-500 text-sm font-medium mb-1 opacity-80 text-right">
					{title}
				</p>
				<h3 className="text-3xl font-extrabold text-gray-900 tracking-tight text-right">
					{value}
				</h3>
				{subtitle && (
					<p className="text-xs text-gray-400 mt-1 text-right">{subtitle}</p>
				)}
			</div>
		</m.div>
	);
}

