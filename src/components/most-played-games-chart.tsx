"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { GameWithPlaytime } from "@/lib/types";

export function MostPlayedGamesChart({ data }: { data: GameWithPlaytime[] }) {
  const chartData = data.map(game => ({
    name: game.title,
    hours: Math.round(game.totalPlaytime / 60 * 10) / 10, // hours with one decimal
  }));

  const chartConfig = {
    hours: {
      label: "Hours",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            width={100}
            className="text-xs"
            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
          />
          <XAxis dataKey="hours" type="number" hide />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="hours" layout="vertical" radius={5} fill="var(--color-hours)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
