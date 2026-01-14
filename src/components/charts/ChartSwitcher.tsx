"use client";

import { AreaChart, BarChart, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChartType = "area" | "bar" | "line";

interface ChartSwitcherProps {
	chartType: ChartType;
	onChartTypeChange: (type: ChartType) => void;
}

export default function ChartSwitcher({
	chartType,
	onChartTypeChange,
}: ChartSwitcherProps) {
	const options: { type: ChartType; icon: typeof AreaChart; label: string }[] = [
		{ type: "area", icon: AreaChart, label: "منطقة" },
		{ type: "bar", icon: BarChart, label: "أعمدة" },
		{ type: "line", icon: LineChart, label: "خط" },
	];

	return (
		<div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
			{options.map((option) => {
				const Icon = option.icon;
				return (
					<button
						key={option.type}
						onClick={() => onChartTypeChange(option.type)}
						className={cn(
							"flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
							chartType === option.type
								? "bg-white text-purple-600 shadow-sm"
								: "text-gray-600 hover:text-gray-900"
						)}
						title={option.label}
					>
						<Icon size={16} />
						<span className="hidden sm:inline">{option.label}</span>
					</button>
				);
			})}
		</div>
	);
}

