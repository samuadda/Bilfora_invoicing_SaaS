"use client";

import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { ChartType } from "./ChartSwitcher";
import ChartSwitcher from "./ChartSwitcher";
import { useState } from "react";

interface EnhancedChartProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any[];
	dataKey: string;
	name: string;
	color?: string;
	gradientId?: string;
	showForecast?: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	forecastData?: any[];
	height?: number;
	currency?: boolean;
}

export default function EnhancedChart({
	data,
	dataKey,
	name,
	color = "#8B5CF6",
	gradientId = "chartGradient",
	showForecast = false,
	forecastData,
	height = 350,
	currency = false,
}: EnhancedChartProps) {
	const [chartType, setChartType] = useState<ChartType>("area");

	const formatValue = (value: number) => {
		if (currency) {
			return new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "SAR",
				maximumFractionDigits: 0,
			}).format(value);
		}
		return value.toString();
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl border border-gray-800 text-sm">
					<p className="font-bold mb-2 opacity-50">{label}</p>
					{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
					{payload.map((entry: any, index: number) => (
						<div
							key={index}
							className="flex items-center gap-2 mb-1 last:mb-0"
						>
							<div
								className="w-2 h-2 rounded-full"
								style={{
									backgroundColor: entry.color || entry.fill || color,
								}}
							/>
							<span className="font-medium">
								{formatValue(entry.value)}
							</span>
							<span className="opacity-70 mr-1">{entry.name || name}</span>
						</div>
					))}
				</div>
			);
		}
		return null;
	};

	const renderChart = () => {
		const commonProps = {
			data: data,
			margin: { top: 10, right: 0, left: 0, bottom: 0 },
		};

		switch (chartType) {
			case "area":
				return (
					<AreaChart {...commonProps}>
						<defs>
							<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={color} stopOpacity={0.3} />
								<stop offset="95%" stopColor={color} stopOpacity={0} />
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
							tick={{ fill: "#9ca3af", fontSize: 12 }}
							dy={15}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#9ca3af", fontSize: 12 }}
							dx={-15}
							tickFormatter={(value) =>
								currency ? `${value / 1000}k` : value.toString()
							}
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{
								stroke: color,
								strokeWidth: 1,
								strokeDasharray: "5 5",
							}}
						/>
						<Area
							type="monotone"
							dataKey={dataKey}
							name={name}
							stroke={color}
							strokeWidth={4}
							fillOpacity={1}
							fill={`url(#${gradientId})`}
							animationDuration={1500}
						/>
						{showForecast && forecastData && (
							<Area
								type="monotone"
								dataKey={dataKey}
								data={forecastData}
								stroke={color}
								strokeWidth={2}
								strokeDasharray="5 5"
								fill="none"
								name="التنبؤ"
								dot={false}
							/>
						)}
					</AreaChart>
				);

			case "bar":
				return (
					<BarChart {...commonProps} barSize={24}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="#f3f4f6"
						/>
						<XAxis
							dataKey="name"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#9ca3af", fontSize: 12 }}
							dy={10}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#9ca3af", fontSize: 12 }}
							dx={-10}
							tickFormatter={(value) =>
								currency ? `${value / 1000}k` : value.toString()
							}
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ fill: "#f9fafb", radius: 8 }}
						/>
						<Bar
							dataKey={dataKey}
							name={name}
							fill={color}
							radius={[6, 6, 6, 6]}
							animationDuration={1500}
						/>
					</BarChart>
				);

			case "line":
				return (
					<LineChart {...commonProps}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="#f3f4f6"
						/>
						<XAxis
							dataKey="name"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#9ca3af", fontSize: 12 }}
							dy={10}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#9ca3af", fontSize: 12 }}
							dx={-10}
							tickFormatter={(value) =>
								currency ? `${value / 1000}k` : value.toString()
							}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Line
							type="monotone"
							dataKey={dataKey}
							name={name}
							stroke={color}
							strokeWidth={4}
							dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#fff" }}
							activeDot={{ r: 6, strokeWidth: 0 }}
							animationDuration={1500}
						/>
						{showForecast && forecastData && (
							<Line
								type="monotone"
								dataKey={dataKey}
								data={forecastData}
								stroke={color}
								strokeWidth={2}
								strokeDasharray="5 5"
								name="التنبؤ"
								dot={false}
							/>
						)}
					</LineChart>
				);
		}
	};

	return (
		<div>
			<div className="flex items-center justify-end mb-4">
				<ChartSwitcher
					chartType={chartType}
					onChartTypeChange={setChartType}
				/>
			</div>
			<div style={{ height }}>
				<ResponsiveContainer width="100%" height="100%">
					{renderChart()}
				</ResponsiveContainer>
			</div>
		</div>
	);
}

