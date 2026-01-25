"use client";

import * as React from "react";
import { PieChart, Pie, Cell } from "recharts";
import { m } from "framer-motion";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

  // Create config dynamically based on input data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    categories.forEach((item, index) => {
      config[`segment_${index}`] = {
        label: item.name,
        color: item.color,
      };
    });
    return config;
  }, [categories]);

  // Map data to include 'fill' required by Shadcn/Recharts pattern
  const chartData = React.useMemo(() => {
    return categories.map((item, index) => ({
      ...item,
      fill: item.color,
      segmentKey: `segment_${index}`,
    }));
  }, [categories]);

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
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                cornerRadius={6}
                strokeWidth={0}
              >
                {/* We can still use Cell here for explicit control if needed, 
                    but chartData.fill handles it if logic aligns. 
                    However, keeping Cell loop ensures stability with current Recharts version */}
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
            </PieChart>
          </ChartContainer>
        </div>
      </m.div>
    </div>
  );
}

