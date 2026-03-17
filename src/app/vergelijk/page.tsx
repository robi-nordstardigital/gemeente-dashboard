"use client";

import { useState, useMemo } from "react";
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
  Legend,
} from "recharts";
import { gemeenten } from "@/data/gemeenten";
import { Indicator, INDICATOR_LABELS, PROVINCIE_KLEUREN } from "@/lib/types";
import { formatIndicator, slugify } from "@/lib/utils";

const COMPARE_COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444"];

const INDICATORS: Indicator[] = [
  "inwoners",
  "dichtheid",
  "mediaalInkomen",
  "laadpalenPerInwoner",
  "bevolkingsgroei",
  "gemiddeldeHuisprijs",
];

export default function VergelijkPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const suggestions = useMemo(() => {
    if (!search) return [];
    return gemeenten
      .filter((g) => g.naam.toLowerCase().includes(search.toLowerCase()))
      .filter((g) => !selected.includes(g.id))
      .slice(0, 8);
  }, [search, selected]);

  const selectedGemeenten = selected
    .map((id) => gemeenten.find((g) => g.id === id)!)
    .filter(Boolean);

  // Scores backed by real data
  const REAL_SCORES = ["demografie", "economie", "mobiliteit", "onderwijs", "wonen", "leefbaarheid", "milieu", "veiligheid"] as const;
  const radarData = selectedGemeenten.length > 0
    ? REAL_SCORES.map((key) => {
        const point: Record<string, string | number> = {
          subject: key.charAt(0).toUpperCase() + key.slice(1),
        };
        selectedGemeenten.forEach((g) => {
          point[g.naam] = g.scores[key];
        });
        return point;
      })
    : [];

  const barData = INDICATORS.map((ind) => {
    const point: Record<string, string | number> = {
      indicator: INDICATOR_LABELS[ind],
    };
    selectedGemeenten.forEach((g) => {
      point[g.naam] = g[ind] as number;
    });
    return point;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Vergelijken</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Selecteer 2 tot 4 gemeenten om zij-aan-zij te vergelijken
        </p>
      </div>

      {/* Search + Selected */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Zoek gemeente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 rounded-lg border border-glass-border bg-glass px-3 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-10 left-0 z-50 w-64 rounded-lg border border-glass-border bg-surface shadow-xl">
              {suggestions.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    if (selected.length < 4) {
                      setSelected([...selected, g.id]);
                      setSearch("");
                    }
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-glass-hover transition-colors"
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: PROVINCIE_KLEUREN[g.provincie] }}
                  />
                  {g.naam}
                  <span className="ml-auto text-[10px] text-muted">{g.provincie}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedGemeenten.map((g, i) => (
          <div
            key={g.id}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
            style={{
              borderColor: COMPARE_COLORS[i],
              background: `${COMPARE_COLORS[i]}15`,
            }}
          >
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: COMPARE_COLORS[i] }}
            />
            {g.naam}
            <button
              onClick={() => setSelected(selected.filter((id) => id !== g.id))}
              className="ml-1 text-muted hover:text-foreground"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {selectedGemeenten.length < 2 && (
        <div className="glass-strong flex items-center justify-center rounded-xl py-20">
          <p className="text-sm text-muted">
            Selecteer minstens 2 gemeenten om te vergelijken
          </p>
        </div>
      )}

      {selectedGemeenten.length >= 2 && (
        <>
          {/* Radar comparison */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="glass-strong rounded-xl p-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                Thema Scores Vergelijking
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: "#8888a0" }}
                  />
                  {selectedGemeenten.map((g, i) => (
                    <Radar
                      key={g.id}
                      dataKey={g.naam}
                      stroke={COMPARE_COLORS[i]}
                      fill={COMPARE_COLORS[i]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats comparison table */}
            <div className="glass-strong rounded-xl p-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
                Indicatoren Vergelijking
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted">
                        Indicator
                      </th>
                      {selectedGemeenten.map((g, i) => (
                        <th
                          key={g.id}
                          className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider"
                          style={{ color: COMPARE_COLORS[i] }}
                        >
                          {g.naam}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INDICATORS.map((ind) => {
                      const values = selectedGemeenten.map(
                        (g) => g[ind] as number
                      );
                      const best = Math.max(...values);

                      return (
                        <tr
                          key={ind}
                          className="border-b border-glass-border/30"
                        >
                          <td className="py-2 text-[12px] text-muted">
                            {INDICATOR_LABELS[ind]}
                          </td>
                          {selectedGemeenten.map((g, i) => {
                            const val = g[ind] as number;
                            return (
                              <td
                                key={g.id}
                                className={`py-2 text-right font-mono text-[12px] ${
                                  val === best
                                    ? "font-semibold text-foreground"
                                    : "text-muted"
                                }`}
                              >
                                {formatIndicator(ind, val)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bar chart comparison */}
          <div className="glass-strong rounded-xl p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
              Visuele Vergelijking
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="indicator"
                  type="category"
                  width={140}
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
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "#8888a0" }}
                />
                {selectedGemeenten.map((g, i) => (
                  <Bar
                    key={g.id}
                    dataKey={g.naam}
                    fill={COMPARE_COLORS[i]}
                    radius={[0, 4, 4, 0]}
                    barSize={8}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
