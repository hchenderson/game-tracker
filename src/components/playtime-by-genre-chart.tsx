"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import { useMemo } from "react";

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export function PlaytimeByGenreChart({ data }: { data: { genre: string; minutes: number }[] }) {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((item, index) => {
        config[item.genre] = {
            label: item.genre,
            color: COLORS[index % COLORS.length]
        };
    });
    return config;
  }, [data]);
  
  const totalMinutes = data.reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-square">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent 
                hideLabel 
                formatter={(value, name) => `${name}: ${Math.round(Number(value) / 60)} hrs (${(Number(value) / totalMinutes * 100).toFixed(0)}%)` }
            />}
          />
          <Pie data={data} dataKey="minutes" nameKey="genre" innerRadius={60} strokeWidth={5} paddingAngle={5}>
             {data.map((entry) => (
              <Cell key={`cell-${entry.genre}`} fill={chartConfig[entry.genre].color} />
            ))}
          </Pie>
          <Legend content={<ChartLegendContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
