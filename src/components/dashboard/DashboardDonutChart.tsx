"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
  
  // Create config dynamically based on input data (mapping arabic names/colors)
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      count: { label: "الفواتير" },
    };
    data.forEach((item, index) => {
      // Use index as key to avoid arabic key issues, or use name if safe
      config[`segment_${index}`] = {
        label: item.name,
        color: item.color,
      };
    });
    return config;
  }, [data]);

  // Map data to include 'fill' required by Shadcn/Recharts pattern
  const chartData = React.useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: item.color, // Use the color passed from props
      segmentKey: `segment_${index}`, // Bind to config
    }));
  }, [data]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-[280px]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name" // Use name for tooltip label
              innerRadius={70}
              outerRadius={95}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          إجمالي الفواتير
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          {data.map((item, index) => {
            const percentage =
              total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.value} ({percentage}%)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
