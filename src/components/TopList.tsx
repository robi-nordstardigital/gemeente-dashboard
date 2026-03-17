"use client";

import Link from "next/link";
import { Gemeente, Indicator, INDICATOR_LABELS, PROVINCIE_KLEUREN } from "@/lib/types";
import { formatIndicator, slugify } from "@/lib/utils";

interface TopListProps {
  title: string;
  gemeenten: Gemeente[];
  indicator: Indicator;
  ascending?: boolean;
}

export default function TopList({ title, gemeenten, indicator, ascending = false }: TopListProps) {
  const sorted = [...gemeenten]
    .sort((a, b) =>
      ascending
        ? (a[indicator] as number) - (b[indicator] as number)
        : (b[indicator] as number) - (a[indicator] as number)
    )
    .slice(0, 10);

  const max = Math.max(...sorted.map((g) => g[indicator] as number));

  return (
    <div className="glass-strong rounded-xl p-4">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
        {title}
      </p>
      <div className="space-y-1.5">
        {sorted.map((g, i) => {
          const value = g[indicator] as number;
          const pct = (value / max) * 100;
          const color = PROVINCIE_KLEUREN[g.provincie];

          return (
            <Link
              key={g.id}
              href={`/gemeente/${slugify(g.naam)}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03] transition-colors"
            >
              <span className="w-5 text-right text-[11px] font-mono text-muted shrink-0">
                {i + 1}.
              </span>
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: color }}
              />
              <span className="flex-1 truncate text-[13px] font-medium">
                {g.naam}
              </span>
              <div className="hidden sm:block w-24">
                <div className="h-1.5 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
              <span className="w-20 text-right text-[12px] font-mono text-muted">
                {formatIndicator(indicator, value)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
