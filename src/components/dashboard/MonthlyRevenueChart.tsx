"use client";

import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { DailyRevenue } from "@/hooks/useInvoiceStats";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface MonthlyRevenueChartProps {
  data: DailyRevenue[];
}

const chartConfig = {
  revenue: {
    label: "الإجمالي",
    color: "#7f2dfb", // Brand Primary
  },
  paid: {
    label: "المحصل",
    color: "#10b981", // Green 500
  },
} satisfies ChartConfig;

export default function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  // Format data for chart
  const chartData = data.map((item) => ({
    day: item.day,
    revenue: item.revenue,
    paid: item.paid,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 5,
          left: -15,
          right: 10,
          bottom: 20,
        }}
      >
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          interval={Math.floor(data.length / 7)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          tickFormatter={(value) => `${value / 1000}k`}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="revenue"
          type="monotone"
          fill="url(#fillRevenue)"
          fillOpacity={0.4}
          stroke="var(--color-revenue)"
          strokeWidth={3}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="paid"
          stroke="var(--color-paid)"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      </AreaChart>
    </ChartContainer>
  );
}

