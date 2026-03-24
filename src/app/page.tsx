"use client";

import KpiCard from "@/components/KpiCard";
import MiniChart from "@/components/MiniChart";
import TopList from "@/components/TopList";
import ProvincieBreakdown from "@/components/ProvincieBreakdown";
import {
  gemeenten,
  totaalInwoners,
  gemiddeldInkomen,
  gemiddeldeHuisprijs,
  bevolkingsTrend,
} from "@/data/gemeenten";
import { formatNumber, formatCurrency } from "@/lib/utils";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-in">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Vlaanderen</span> in Cijfers
        </h1>
        <p className="mt-1 text-sm text-muted">
          {gemeenten.length} gemeenten &middot; Bron: Statbel 2025 &middot; Echte data
        </p>
      </div>

      {/* Data source badge */}
      <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <p className="text-xs text-success">
          6 echte datasets: bevolking, inkomen, vastgoed, oppervlakte (Statbel) · laadpalen (MOW) · onderwijs (Dataloep)
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Inwoners"
          value={formatNumber(totaalInwoners)}
          change="Statbel 1 jan 2025"
          changeType="neutral"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.997M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Gem. Inkomen"
          value={formatCurrency(gemiddeldInkomen)}
          change="Fiscaal inkomen 2023"
          changeType="neutral"
          delay={1}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <KpiCard
          label="Gem. Huisprijs"
          value={formatCurrency(gemiddeldeHuisprijs)}
          change="Mediaan woonhuis 2024"
          changeType="neutral"
          delay={2}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          }
        />
        <KpiCard
          label="Gemeenten"
          value={String(gemeenten.length)}
          change="Vlaams Gewest"
          changeType="neutral"
          delay={3}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <MiniChart
          data={bevolkingsTrend}
          color="#6366f1"
          label="Bevolking Vlaams Gewest (2015-2025, Statbel)"
          height={140}
        />
        <MiniChart
          data={bevolkingsTrend.map((d, i, arr) => ({
            jaar: d.jaar,
            waarde: i > 0 ? +((d.waarde - arr[i-1].waarde) / arr[i-1].waarde * 100).toFixed(2) : 0,
          })).slice(1)}
          color="#22c55e"
          label="Jaarlijkse Bevolkingsgroei (%)"
          height={140}
        />
      </div>

      {/* Top Lists + Province Breakdown */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <TopList
          title="Top 10 — Grootste Gemeenten"
          gemeenten={gemeenten}
          indicator="inwoners"
        />
        <TopList
          title="Top 10 — Hoogste Gemiddeld Inkomen"
          gemeenten={gemeenten}
          indicator="mediaalInkomen"
        />
        <ProvincieBreakdown />
      </div>

      {/* More Top Lists */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <TopList
          title="Top 10 — Duurste Gemeenten (Huisprijs)"
          gemeenten={gemeenten}
          indicator="gemiddeldeHuisprijs"
        />
        <TopList
          title="Top 10 — Snelste Bevolkingsgroei"
          gemeenten={gemeenten}
          indicator="bevolkingsgroei"
        />
        <TopList
          title="Top 10 — Hoogste Bevolkingsdichtheid"
          gemeenten={gemeenten}
          indicator="dichtheid"
        />
      </div>
    </div>
  );
}
