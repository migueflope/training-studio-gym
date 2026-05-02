"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function GrowthChart({
  data,
}: {
  data: { name: string; usuarios: number }[];
}) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#9A9A9A"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9A9A9A"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111111",
              borderColor: "#222222",
              borderRadius: "8px",
            }}
            itemStyle={{ color: "#D4AF37" }}
          />
          <Line
            type="monotone"
            dataKey="usuarios"
            stroke="#D4AF37"
            strokeWidth={3}
            dot={{ fill: "#D4AF37", strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
