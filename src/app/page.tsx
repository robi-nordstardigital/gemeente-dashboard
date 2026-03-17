"use client";

import KpiCard from "@/components/KpiCard";
import MiniChart from "@/components/MiniChart";
import TopList from "@/components/TopList";
import ProvincieBreakdown from "@/components/ProvincieBreakdown";
import {
  gemeenten,
  totaalInwoners,
  totaalLaadpalen,
  gemiddeldInkomen,
  gemiddeldeWerkloosheid,
  gemiddeldeHuisprijs,
  laadpalenTrend,
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
          {gemeenten.length} gemeenten &middot; Laatste update maart 2026
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard
          label="Inwoners"
          value={formatNumber(totaalInwoners)}
          change="+0.8% t.o.v. 2024"
          changeType="positive"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.997M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Laadpalen"
          value={formatNumber(totaalLaadpalen)}
          change="+31% t.o.v. 2024"
          changeType="positive"
          delay={1}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
        />
        <KpiCard
          label="Gem. Inkomen"
          value={formatCurrency(gemiddeldInkomen)}
          change="+2.1% t.o.v. 2024"
          changeType="positive"
          delay={2}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <KpiCard
          label="Werkloosheid"
          value={`${gemiddeldeWerkloosheid}%`}
          change="-0.3% t.o.v. 2024"
          changeType="positive"
          delay={3}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          }
        />
        <KpiCard
          label="Gem. Huisprijs"
          value={formatCurrency(gemiddeldeHuisprijs)}
          change="+4.2% t.o.v. 2024"
          changeType="negative"
          delay={4}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <MiniChart
          data={laadpalenTrend}
          color="#22c55e"
          label="Laadpalen Groei Vlaanderen"
          height={140}
        />
        <MiniChart
          data={bevolkingsTrend}
          color="#6366f1"
          label="Bevolking Vlaanderen"
          height={140}
        />
      </div>

      {/* Top Lists + Province Breakdown */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <TopList
          title="Top 10 — Meeste Laadpalen per Inwoner"
          gemeenten={gemeenten}
          indicator="laadpalenPerInwoner"
        />
        <TopList
          title="Top 10 — Hoogste Mediaan Inkomen"
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
          title="Top 10 — Meeste Groene Ruimte"
          gemeenten={gemeenten}
          indicator="groeneRuimte"
        />
        <TopList
          title="Top 10 — Snelste Bevolkingsgroei"
          gemeenten={gemeenten}
          indicator="bevolkingsgroei"
        />
      </div>
    </div>
  );
}
