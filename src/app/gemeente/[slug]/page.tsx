"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { getGemeenteBySlug, gemeenten } from "@/data/gemeenten";
import { INDICATOR_LABELS, PROVINCIE_KLEUREN, Indicator } from "@/lib/types";
import { formatIndicator, formatNumber, formatCurrency, getRank } from "@/lib/utils";

const KEY_INDICATORS: { key: Indicator; label: string; ascending?: boolean }[] = [
  { key: "inwoners", label: "Inwoners" },
  { key: "dichtheid", label: "Dichtheid" },
  { key: "mediaalInkomen", label: "Mediaan Inkomen" },
  { key: "werkloosheidsgraad", label: "Werkloosheid", ascending: true },
  { key: "laadpalenPerInwoner", label: "Laadpalen /1000 inw." },
  { key: "criminaliteitsgraad", label: "Criminaliteit", ascending: true },
  { key: "groeneRuimte", label: "Groene Ruimte" },
  { key: "vergrijzingsgraad", label: "Vergrijzing" },
  { key: "bevolkingsgroei", label: "Bev. Groei" },
  { key: "gemiddeldeHuisprijs", label: "Huisprijs" },
];

export default function GemeenteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const gemeente = getGemeenteBySlug(slug);

  if (!gemeente) return notFound();

  const radarData = Object.entries(gemeente.scores).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
    fullMark: 100,
  }));

  const provincieColor = PROVINCIE_KLEUREN[gemeente.provincie];

  // Compare to average
  const avg = (key: Indicator) =>
    gemeenten.reduce((s, g) => s + (g[key] as number), 0) / gemeenten.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/rankings"
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar rankings
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{gemeente.naam}</h1>
          <div className="mt-1 flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ background: provincieColor }}
            />
            <span className="text-sm text-muted">{gemeente.provincie}</span>
            <span className="text-sm text-muted">&middot;</span>
            <span className="text-sm text-muted">NIS {gemeente.id}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Inwoners", value: formatNumber(gemeente.inwoners) },
          { label: "Oppervlakte", value: `${gemeente.oppervlakte} km²` },
          { label: "Inkomen", value: formatCurrency(gemeente.mediaalInkomen) },
          { label: "Laadpalen", value: String(gemeente.laadpalen) },
          { label: "Huisprijs", value: formatCurrency(gemeente.gemiddeldeHuisprijs) },
        ].map((s) => (
          <div key={s.label} className="kpi-card rounded-xl p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
              {s.label}
            </p>
            <p className="mt-1 text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Radar Chart */}
        <div className="glass-strong rounded-xl p-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
            Thema Scores
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: "#8888a0" }}
              />
              <Radar
                dataKey="score"
                stroke={provincieColor}
                fill={provincieColor}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Rankings per indicator */}
        <div className="glass-strong rounded-xl p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
            Ranking per Indicator (van {gemeenten.length})
          </p>
          <div className="space-y-2">
            {KEY_INDICATORS.map(({ key, label, ascending }) => {
              const rank = getRank(gemeenten, gemeente.id, key, ascending);
              const value = gemeente[key] as number;
              const pct = ((gemeenten.length - rank) / gemeenten.length) * 100;

              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-32 text-[12px] text-muted truncate">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background:
                          pct > 66
                            ? "#22c55e"
                            : pct > 33
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-[12px] font-mono font-medium text-foreground">
                    #{rank}
                  </span>
                  <span className="w-20 text-right text-[11px] font-mono text-muted">
                    {formatIndicator(key, value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison with Flemish average */}
      <div className="glass-strong rounded-xl p-4">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
          Vergelijking met Vlaams Gemiddelde
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={KEY_INDICATORS.map(({ key, label }) => ({
              naam: label,
              gemeente: gemeente[key] as number,
              gemiddelde: avg(key),
            }))}
            layout="vertical"
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="naam"
              type="category"
              width={120}
              tick={{ fontSize: 11, fill: "#8888a0" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(18, 18, 30, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#e8e8f0",
              }}
            />
            <Bar dataKey="gemeente" name={gemeente.naam} fill={provincieColor} radius={[0, 4, 4, 0]} barSize={10} />
            <Bar dataKey="gemiddelde" name="Vlaams gem." fill="rgba(255,255,255,0.15)" radius={[0, 4, 4, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
