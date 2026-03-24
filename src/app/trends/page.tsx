"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  CartesianGrid,
  Legend,
  ZAxis,
} from "recharts";
import {
  gemeenten,
  bevolkingsTrend,
  getTopGemeenten,
} from "@/data/gemeenten";
import { PROVINCIE_KLEUREN, Provincie } from "@/lib/types";
import { formatNumber, formatCurrency } from "@/lib/utils";

const tooltipStyle = {
  background: "rgba(18, 18, 30, 0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#e8e8f0",
};

export default function TrendsPage() {
  const topGroei = getTopGemeenten("bevolkingsgroei", 15);
  const topLaadpalen = getTopGemeenten("laadpalenPerInwoner", 15);

  // Scatter data: inkomen vs laadpalen
  const scatterData = gemeenten.map((g) => ({
    naam: g.naam,
    x: g.mediaalInkomen,
    y: g.laadpalenPerInwoner,
    z: g.inwoners,
    provincie: g.provincie,
  }));

  // Provincie averages
  const provincieData = (
    ["Antwerpen", "Limburg", "Oost-Vlaanderen", "Vlaams-Brabant", "West-Vlaanderen"] as Provincie[]
  ).map((p) => {
    const pg = gemeenten.filter((g) => g.provincie === p);
    return {
      naam: p,
      inkomen: Math.round(pg.reduce((s, g) => s + g.mediaalInkomen, 0) / pg.length),
      huisprijs: Math.round(pg.reduce((s, g) => s + g.gemiddeldeHuisprijs, 0) / pg.length),
      laadpalen: Math.round(pg.reduce((s, g) => s + g.laadpalen, 0)),
      kleur: PROVINCIE_KLEUREN[p],
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Trends</span> & Inzichten
        </h1>
        <p className="mt-1 text-sm text-muted">
          Trendlijnen, correlaties en opvallende patronen in Vlaamse gemeenten
        </p>
      </div>

      {/* Growth charts */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="glass-strong rounded-xl p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
            Top 15 — Laadpalen per 1000 inwoners
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topLaadpalen.map((g) => ({ naam: g.naam, waarde: g.laadpalenPerInwoner, provincie: g.provincie }))} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8888a0" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="naam" type="category" width={110} tick={{ fontSize: 9, fill: "#8888a0" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v).toFixed(2), "per 1000 inw."]} />
              <Bar dataKey="waarde" radius={[0, 4, 4, 0]} barSize={10}>
                {topLaadpalen.map((g, i) => (
                  <Cell key={i} fill={PROVINCIE_KLEUREN[g.provincie]} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-strong rounded-xl p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
            Bevolking Vlaanderen (2015-2025)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={bevolkingsTrend}>
              <defs>
                <linearGradient id="gradBev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="jaar" tick={{ fontSize: 10, fill: "#8888a0" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8888a0" }} axisLine={false} tickLine={false} domain={["dataMin - 50000", "dataMax + 50000"]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatNumber(Number(v)), "Inwoners"]} />
              <Area type="monotone" dataKey="waarde" stroke="#6366f1" strokeWidth={2} fill="url(#gradBev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter: Inkomen vs Laadpalen */}
      <div className="glass-strong rounded-xl p-4">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted">
          Correlatie: Inkomen vs Laadpalen per Inwoner
        </p>
        <p className="mb-3 text-[10px] text-muted">
          Elke stip = 1 gemeente &middot; Kleur = provincie &middot; Grootte = inwonersaantal
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="x"
              name="Inkomen"
              tick={{ fontSize: 10, fill: "#8888a0" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
              label={{ value: "Mediaan Inkomen", position: "bottom", offset: -5, fontSize: 10, fill: "#8888a0" }}
            />
            <YAxis
              dataKey="y"
              name="Laadpalen /1000 inw"
              tick={{ fontSize: 10, fill: "#8888a0" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Laadpalen /1000 inw", angle: -90, position: "insideLeft", fontSize: 10, fill: "#8888a0" }}
            />
            <ZAxis dataKey="z" range={[20, 200]} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => {
                const v = Number(value);
                if (name === "Inkomen") return [`€${formatNumber(v)}`, name];
                if (name === "Laadpalen /1000 inw") return [v.toFixed(2), name];
                return [formatNumber(v), String(name)];
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.naam || ""}
            />
            <Scatter data={scatterData}>
              {scatterData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={PROVINCIE_KLEUREN[entry.provincie as Provincie]}
                  fillOpacity={0.6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Stijgers & Dalers */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="glass-strong rounded-xl p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
            Snelste Stijgers — Bevolkingsgroei
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topGroei.map((g) => ({ naam: g.naam, groei: g.bevolkingsgroei, provincie: g.provincie }))} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8888a0" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="naam" type="category" width={120} tick={{ fontSize: 10, fill: "#8888a0" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(2)}%`, "Groei"]} />
              <Bar dataKey="groei" radius={[0, 4, 4, 0]} barSize={12}>
                {topGroei.map((g, i) => (
                  <Cell key={i} fill={PROVINCIE_KLEUREN[g.provincie]} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-strong rounded-xl p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
            Provincie Vergelijking — Gemiddelden
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={provincieData}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="naam" tick={{ fontSize: 10, fill: "#8888a0" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8888a0" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="inkomen" name="Inkomen (€)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="huisprijs" name="Huisprijs (€)" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
