import { colors } from "@/lib/ui/tokens";

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

interface MonthlyData {
	name: string;
	revenue: number;
}

interface DashboardRevenueChartProps {
	data: MonthlyData[];
}

export default function DashboardRevenueChart({
	data,
}: DashboardRevenueChartProps) {
	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 0,
		}).format(amount);

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl border border-gray-800 text-sm">
					<p className="font-bold mb-2 opacity-50">{label}</p>
					{payload.map((entry: any, index: number) => (
						<div key={index} className="flex items-center gap-2">
							<div
								className="w-2 h-2 rounded-full"
								style={{ backgroundColor: entry.color || colors.brand.primary }}
							/>
							<span className="font-medium">{formatCurrency(entry.value)}</span>
							<span className="opacity-70 mr-1">{entry.name}</span>
						</div>
					))}
				</div>
			);
		}
		return null;
	};

	return (
		<div className="h-[350px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={data}
					margin={{ top: 10, right: 10, left: -20, bottom: 30 }}
				>
					<defs>
						<linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={colors.brand.primary} stopOpacity={0.2} />
							<stop offset="95%" stopColor={colors.brand.primary} stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="#f3f4f6"
					/>
					<XAxis
						dataKey="name"
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
						dy={10}
						angle={0}
						textAnchor="middle"
						interval={0}
						height={50}
					/>
					<YAxis
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#9ca3af", fontSize: 12 }}
						dx={-15}
						tickFormatter={(value) => `${value / 1000}k`}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Line
						type="monotone"
						dataKey="revenue"
						name="الإيرادات"
						stroke={colors.brand.primary}
						strokeWidth={4}
						dot={{ r: 4, fill: colors.brand.primary, strokeWidth: 2, stroke: "#fff" }}
						activeDot={{ r: 6, strokeWidth: 0 }}
						animationDuration={1500}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

