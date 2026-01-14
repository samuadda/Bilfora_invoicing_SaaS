"use client";

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { DailyRevenue } from "@/hooks/useInvoiceStats";
import { colors } from "@/lib/ui/tokens";

interface MonthlyRevenueChartProps {
	data: DailyRevenue[];
}

export default function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 0,
		}).format(amount);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-800 text-sm">
					<p className="font-bold mb-2">اليوم {payload[0].payload.day}</p>
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-brand-primary" />
							<span className="font-medium">
								الإجمالي: {formatCurrency(payload[0].value)}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-green-500" />
							<span className="font-medium">
								المحصل: {formatCurrency(payload[1]?.value || 0)}
							</span>
						</div>
					</div>
				</div>
			);
		}
		return null;
	};

	// Format data for chart - show day numbers
	const chartData = data.map((item) => ({
		day: item.day,
		revenue: item.revenue,
		paid: item.paid,
	}));

	return (
		<div className="h-[280px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 20 }}>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
					<XAxis
						dataKey="day"
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#6b7280", fontSize: 11 }}
						dy={10}
						interval={Math.floor(data.length / 7)} // Show ~7 labels
					/>
					<YAxis
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#9ca3af", fontSize: 11 }}
						dx={-10}
						tickFormatter={(value) => `${value / 1000}k`}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Line
						type="monotone"
						dataKey="revenue"
						stroke={colors.brand.primary}
						strokeWidth={3}
						dot={{ r: 3, fill: colors.brand.primary }}
						activeDot={{ r: 5 }}
					/>
					<Line
						type="monotone"
						dataKey="paid"
						stroke="#10b981"
						strokeWidth={2}
						dot={{ r: 2, fill: "#10b981" }}
						strokeDasharray="5 5"
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

