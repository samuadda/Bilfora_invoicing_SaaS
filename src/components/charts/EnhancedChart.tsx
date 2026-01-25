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
} from "recharts";
import { ChartType } from "./ChartSwitcher";
import ChartSwitcher from "./ChartSwitcher";
import { useState, useMemo } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

  // Dynamic config based on props
  const chartConfig = useMemo(() => {
    return {
      [dataKey]: {
        label: name,
        color: color,
      },
    } satisfies ChartConfig;
  }, [dataKey, name, color]);

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 10, right: 0, left: 0, bottom: 0 },
    };

    const colorVar = `var(--color-${dataKey})`;

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorVar} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colorVar} stopOpacity={0} />
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
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" />}
              cursor={{
                stroke: colorVar,
                strokeWidth: 1,
                strokeDasharray: "5 5",
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              name={name}
              stroke={colorVar}
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
                stroke={colorVar}
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
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" />}
              cursor={{ fill: "#f9fafb", radius: 8 }}
            />
            <Bar
              dataKey={dataKey}
              name={name}
              fill={colorVar}
              radius={[6, 6, 0, 0]}
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
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={name}
              stroke={colorVar}
              strokeWidth={4}
              dot={{ r: 4, fill: colorVar, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
            {showForecast && forecastData && (
              <Line
                type="monotone"
                dataKey={dataKey}
                data={forecastData}
                stroke={colorVar}
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
        <ChartContainer config={chartConfig} className="h-full w-full">
          {renderChart()}
        </ChartContainer>
      </div>
    </div>
  );
}

