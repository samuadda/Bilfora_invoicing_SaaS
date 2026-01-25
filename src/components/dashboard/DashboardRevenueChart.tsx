"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface MonthlyData {
  name: string;
  revenue: number;
}

interface DashboardRevenueChartProps {
  data: MonthlyData[];
}

const chartConfig = {
  revenue: {
    label: "الإجمالي",
    color: "#7f2dfb",
  },
} satisfies ChartConfig;

export default function DashboardRevenueChart({
  data,
}: DashboardRevenueChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          top: 10,
          left: -20,
          right: 10,
          bottom: 30,
        }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
          interval={0}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickFormatter={(value) => `${value / 1000}k`}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          strokeWidth={4}
          dot={{ r: 4, fill: "var(--color-revenue)", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6, strokeWidth: 0 }}
          animationDuration={1500}
        />
      </LineChart>
    </ChartContainer>
  );
}

