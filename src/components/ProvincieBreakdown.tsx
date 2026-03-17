"use client";

import { gemeenten } from "@/data/gemeenten";
import { Provincie, PROVINCIE_KLEUREN } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const provincies: Provincie[] = [
  "Antwerpen",
  "Limburg",
  "Oost-Vlaanderen",
  "Vlaams-Brabant",
  "West-Vlaanderen",
];

export default function ProvincieBreakdown() {
  const data = provincies.map((p) => {
    const pg = gemeenten.filter((g) => g.provincie === p);
    return {
      naam: p,
      gemeenten: pg.length,
      inwoners: pg.reduce((s, g) => s + g.inwoners, 0),
      laadpalen: pg.reduce((s, g) => s + g.laadpalen, 0),
      gemInkomen: Math.round(pg.reduce((s, g) => s + g.mediaalInkomen, 0) / pg.length),
      kleur: PROVINCIE_KLEUREN[p],
    };
  });

  const maxInw = Math.max(...data.map((d) => d.inwoners));

  return (
    <div className="glass-strong rounded-xl p-4">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
        Per Provincie
      </p>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.naam}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: d.kleur }}
                />
                <span className="text-[13px] font-medium">{d.naam}</span>
              </div>
              <span className="text-[12px] font-mono text-muted">
                {formatNumber(d.inwoners)} inw.
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(d.inwoners / maxInw) * 100}%`,
                  background: d.kleur,
                  opacity: 0.7,
                }}
              />
            </div>
            <div className="mt-1 flex gap-4 text-[10px] text-muted">
              <span>{d.gemeenten} gemeenten</span>
              <span>{formatNumber(d.laadpalen)} laadpalen</span>
              <span>&euro;{formatNumber(d.gemInkomen)} gem. inkomen</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
