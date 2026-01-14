"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface StatusData {
	name: string;
	value: number;
	color: string;
}

interface DashboardDonutChartProps {
	data: StatusData[];
	total: number;
}

export default function DashboardDonutChart({
	data,
	total,
}: DashboardDonutChartProps) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const CustomTooltip = ({ active, payload, coordinate }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload as StatusData;
			const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

			// Chart dimensions (280px container)
			const chartWidth = 280;
			const chartHeight = 280;
			const centerX = chartWidth / 2;
			const centerY = chartHeight / 2;
			const innerRadius = 70;

			// Get mouse coordinates
			const mouseX = coordinate?.x ?? centerX;
			const mouseY = coordinate?.y ?? centerY;

			// Calculate distance from center
			const dx = mouseX - centerX;
			const dy = mouseY - centerY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// If tooltip is too close to center, position it outside the donut ring
			let tooltipX = mouseX;
			let tooltipY = mouseY;

			if (distance < innerRadius + 30) {
				// Calculate angle and position tooltip outside the ring
				const angle = Math.atan2(dy, dx);
				const outerRadius = 95;
				tooltipX = centerX + Math.cos(angle) * (outerRadius + 50);
				tooltipY = centerY + Math.sin(angle) * (outerRadius + 50);
			}

			return (
				<div
					className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-800 text-sm pointer-events-none"
					style={{
						position: 'absolute',
						left: `${tooltipX}px`,
						top: `${tooltipY}px`,
						transform: 'translate(-50%, -50%)',
						zIndex: 50,
					}}
				>
					<p className="font-bold mb-1">{data.name}</p>
					<p className="font-medium">{data.value} فاتورة</p>
					<p className="text-xs opacity-70 mt-1">{percentage}% من الإجمالي</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 min-h-[280px] relative">
				<ResponsiveContainer width="100%" height={280}>
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={70}
							outerRadius={95}
							paddingAngle={4}
							dataKey="value"
							cornerRadius={6}
							stroke="#fff"
							strokeWidth={2}
						>
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="#fff" />
							))}
						</Pie>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ fill: 'transparent' }}
							allowEscapeViewBox={{ x: true, y: true }}
							wrapperStyle={{ outline: 'none' }}
						/>
					</PieChart>
				</ResponsiveContainer>
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
					<div className="text-center bg-white rounded-full px-6 py-3 shadow-sm border border-gray-100">
						<p className="text-3xl font-extrabold text-gray-900">{total}</p>
						<p className="text-xs text-gray-500 mt-1">إجمالي الفواتير</p>
					</div>
				</div>
			</div>
			<div className="mt-6 pt-4 border-t border-gray-100">
				<div className="grid grid-cols-2 gap-3">
					{data.map((item, index) => {
						const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
						return (
							<div key={index} className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full flex-shrink-0"
									style={{ backgroundColor: item.color }}
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
									<p className="text-xs text-gray-500">{item.value} ({percentage}%)</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
