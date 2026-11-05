"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StateDistributionChartProps {
  data: { state: string; users: number }[];
}

export default function StateDistributionChart({ data }: StateDistributionChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-gray-400">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 4,
          right: 12,
          left: 4,
          bottom: 4,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6B7280", fontSize: 10 }}
        />
        <YAxis
          type="category"
          dataKey="state"
          width={88}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6B7280", fontSize: 10 }}
        />
        <Tooltip
          formatter={(value) => [Number(value).toLocaleString(), "Users"]}
          cursor={{ fill: "#F3F4F6" }}
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
        />
        <Bar dataKey="users" fill="#1A5C38" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
