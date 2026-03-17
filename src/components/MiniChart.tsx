"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface MiniChartProps {
  data: { jaar: number; waarde: number }[];
  color?: string;
  height?: number;
  label?: string;
}

export default function MiniChart({ data, color = "#6366f1", height = 120, label }: MiniChartProps) {
  return (
    <div className="glass-strong rounded-xl p-4">
      {label && (
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
          {label}
        </p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="jaar"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#8888a0" }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(18, 18, 30, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#e8e8f0",
            }}
            formatter={(value: number) => [new Intl.NumberFormat("nl-BE").format(value), ""]}
            labelFormatter={(label) => `${label}`}
          />
          <Area
            type="monotone"
            dataKey="waarde"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace("#", "")})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
