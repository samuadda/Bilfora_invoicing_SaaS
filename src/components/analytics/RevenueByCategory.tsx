"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { m } from "framer-motion";

interface CategoryData {
	name: string;
	value: number;
	color: string;
}

interface RevenueByCategoryProps {
	categories: CategoryData[];
}

export default function RevenueByCategory({ categories }: RevenueByCategoryProps) {
	const total = categories.reduce((sum, cat) => sum + cat.value, 0);

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 0,
		}).format(amount);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
			return (
				<div className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl border border-gray-800 text-sm">
					<p className="font-bold mb-2">{data.name}</p>
					<p className="font-medium">{formatCurrency(data.value)}</p>
					<p className="text-xs opacity-70 mt-1">{percentage}% من الإجمالي</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* Cards */}
			<div className="space-y-4">
				{categories.map((category, index) => {
					const percentage = total > 0 ? (category.value / total) * 100 : 0;
					return (
						<m.div
							key={category.name}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
							className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<div
										className="w-4 h-4 rounded-full"
										style={{ backgroundColor: category.color }}
									/>
									<span className="font-bold text-gray-900">{category.name}</span>
								</div>
								<span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-2xl font-extrabold text-gray-900">
									{formatCurrency(category.value)}
								</span>
								<div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
									<div
										className="h-full transition-all duration-500"
										style={{
											width: `${percentage}%`,
											backgroundColor: category.color,
										}}
									/>
								</div>
							</div>
						</m.div>
					);
				})}
			</div>

			{/* Pie Chart */}
			<m.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center"
			>
				<div className="w-full h-[300px]">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={categories}
								dataKey="value"
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={100}
								paddingAngle={4}
								cornerRadius={6}
							>
								{categories.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
								))}
							</Pie>
							<Tooltip content={<CustomTooltip />} />
							<Legend
								verticalAlign="bottom"
								height={36}
								iconType="circle"
								formatter={(value) => (
									<span className="text-sm font-medium text-gray-600 mr-2">
										{value}
									</span>
								)}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>
			</m.div>
		</div>
	);
}

