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

const SURVEY_INDICATORS: { key: Indicator; label: string; icon: string; tooltip: string }[] = [
  { key: "graagWonen", label: "Graag wonen in de gemeente", icon: "♥",
    tooltip: "% inwoners dat aangeeft graag in hun gemeente te wonen (antwoord: eens)" },
  { key: "tevredenheidGemeente", label: "Tevredenheid over de gemeente", icon: "★",
    tooltip: "% inwoners dat tevreden is over de gemeente als geheel (antwoord: eens)" },
  { key: "netheidCentrum", label: "Netheid van het centrum", icon: "✦",
    tooltip: "% inwoners dat vindt dat het centrum van de gemeente netjes is (antwoord: eens)" },
  { key: "netheidStraten", label: "Netheid straten en voetpaden", icon: "◆",
    tooltip: "% inwoners dat vindt dat straten en voetpaden netjes zijn (antwoord: eens)" },
  { key: "groenBuurt", label: "Voldoende groen in de buurt", icon: "●",
    tooltip: "% inwoners dat vindt dat er voldoende groen is in hun buurt (antwoord: eens)" },
  { key: "vertrouwenBestuur", label: "Vertrouwen in gemeentebestuur", icon: "◎",
    tooltip: "% inwoners dat veel vertrouwen heeft in het gemeentebestuur (antwoord: veel)" },
];

const KEY_INDICATORS: { key: Indicator; label: string; ascending?: boolean }[] = [
  { key: "inwoners", label: "Inwoners" },
  { key: "dichtheid", label: "Dichtheid" },
  { key: "mediaalInkomen", label: "Mediaan Inkomen" },
  { key: "laadpalenPerInwoner", label: "Laadpalen /1000 inw." },
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

  // Scores backed by real data
  const REAL_SCORES = ["demografie", "economie", "mobiliteit", "onderwijs", "wonen", "leefbaarheid", "milieu", "veiligheid"] as const;
  const radarData = REAL_SCORES.map((key) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: gemeente.scores[key],
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

      {/* Survey Indicators — Leefbaarheid detail */}
      {gemeente.graagWonen > 0 && (
        <div className="glass-strong rounded-xl p-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted">
            Leefbaarheid — Burgerbevraging 2023
          </p>
          <p className="mb-4 text-[11px] text-muted/60">
            % inwoners dat positief antwoordde (eens/veel) · Bron: Gemeente-Stadsmonitor
          </p>
          <div className="space-y-5">
            {SURVEY_INDICATORS.map(({ key, label, icon, tooltip }) => {
              const value = gemeente[key] as number;
              if (value === 0) return null;
              const withData = gemeenten.filter(g => (g[key] as number) > 0);
              const values = withData.map(g => g[key] as number);
              const vlAvg = values.reduce((s, v) => s + v, 0) / values.length;
              const min = Math.min(...values);
              const max = Math.max(...values);
              const diff = value - vlAvg;
              const rank = getRank(withData, gemeente.id, key);
              // Position within min-max range (0-100%)
              const range = max - min || 1;
              const valuePos = ((value - min) / range) * 100;
              const avgPos = ((vlAvg - min) / range) * 100;

              return (
                <div key={key} className="group">
                  {/* Label row */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 relative">
                      <span className="text-sm">{icon}</span>
                      <span className="text-[13px] text-foreground/90">{label}</span>
                      <span className="text-muted/40 text-[10px] cursor-help" title={tooltip}>?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold font-mono">{value}%</span>
                      <span className="text-[11px] font-mono text-muted">
                        #{rank}<span className="text-muted/50">/{withData.length}</span>
                      </span>
                    </div>
                  </div>
                  {/* Tooltip explanation */}
                  <p className="text-[10px] text-muted/50 mb-1.5 hidden group-hover:block">{tooltip}</p>
                  {/* Range bar: min to max with markers */}
                  <div className="relative h-4 rounded-full bg-white/[0.03] overflow-visible">
                    {/* Track background showing full range */}
                    <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-white/5" />
                    {/* Value bar from left edge to value position */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all"
                      style={{
                        width: `${valuePos}%`,
                        background: diff >= 5
                          ? "linear-gradient(90deg, rgba(34,197,94,0.15), rgba(34,197,94,0.45))"
                          : diff > -5
                            ? "linear-gradient(90deg, rgba(245,158,11,0.15), rgba(245,158,11,0.35))"
                            : "linear-gradient(90deg, rgba(239,68,68,0.15), rgba(239,68,68,0.4))",
                      }}
                    />
                    {/* Value dot */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 z-20"
                      style={{
                        left: `${valuePos}%`,
                        background: diff >= 5 ? "#22c55e" : diff > -5 ? "#f59e0b" : "#ef4444",
                        borderColor: diff >= 5 ? "#16a34a" : diff > -5 ? "#d97706" : "#dc2626",
                      }}
                    />
                    {/* Flemish average marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-white/30 z-10"
                      style={{ left: `${avgPos}%` }}
                    />
                    <div
                      className="absolute -bottom-3.5 -translate-x-1/2 text-[8px] text-white/30"
                      style={{ left: `${avgPos}%` }}
                    >
                      gem.
                    </div>
                  </div>
                  {/* Min / diff badge / Max labels */}
                  <div className="flex items-center justify-between mt-4 text-[10px] font-mono">
                    <span className="text-muted/40">{min}%</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        diff >= 5
                          ? "bg-emerald-500/10 text-emerald-400"
                          : diff > -5
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)} vs Vlaams gem. ({vlAvg.toFixed(0)}%)
                    </span>
                    <span className="text-muted/40">{max}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Overall leefbaarheid score */}
          <div className="mt-4 pt-3 border-t border-glass-border flex items-center justify-between">
            <span className="text-[12px] font-medium text-muted">Leefbaarheidsscore (gemiddelde)</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">{gemeente.scores.leefbaarheid}/100</span>
              {(() => {
                const vlAvgLeef = gemeenten.filter(g => g.scores.leefbaarheid !== 50 || g.graagWonen > 0)
                  .reduce((s, g) => s + g.scores.leefbaarheid, 0) /
                  gemeenten.filter(g => g.scores.leefbaarheid !== 50 || g.graagWonen > 0).length;
                const diff = gemeente.scores.leefbaarheid - vlAvgLeef;
                return (
                  <span className={`text-[12px] font-mono ${diff > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {diff > 0 ? "+" : ""}{diff.toFixed(1)} vs gem.
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      )}

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
