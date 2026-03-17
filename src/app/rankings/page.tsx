"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { gemeenten } from "@/data/gemeenten";
import { Indicator, INDICATOR_LABELS, Provincie, PROVINCIE_KLEUREN } from "@/lib/types";
import { formatIndicator, slugify } from "@/lib/utils";

const SORTABLE_INDICATORS: Indicator[] = [
  "inwoners",
  "dichtheid",
  "mediaalInkomen",
  "gemiddeldeHuisprijs",
  "bevolkingsgroei",
  "oppervlakte",
  "graagWonen",
  "tevredenheidGemeente",
  "netheidCentrum",
  "groenBuurt",
  "vertrouwenBestuur",
];

const PROVINCIES: (Provincie | "Alle")[] = [
  "Alle",
  "Antwerpen",
  "Limburg",
  "Oost-Vlaanderen",
  "Vlaams-Brabant",
  "West-Vlaanderen",
];

export default function RankingsPage() {
  const [sortBy, setSortBy] = useState<Indicator>("inwoners");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<Provincie | "Alle">("Alle");
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    let list = [...gemeenten];
    if (filter !== "Alle") list = list.filter((g) => g.provincie === filter);
    if (search) list = list.filter((g) => g.naam.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      const va = a[sortBy] as number;
      const vb = b[sortBy] as number;
      return sortDir === "desc" ? vb - va : va - vb;
    });
    return list;
  }, [sortBy, sortDir, filter, search]);

  function toggleSort(indicator: Indicator) {
    if (sortBy === indicator) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(indicator);
      setSortDir("desc");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Rankings</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Alle {gemeenten.length} Vlaamse gemeenten gesorteerd en vergeleken
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Zoek gemeente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-lg border border-glass-border bg-glass px-3 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
        <div className="flex gap-1">
          {PROVINCIES.map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all ${
                filter === p
                  ? "bg-accent/20 text-accent-light"
                  : "text-muted hover:bg-glass-hover hover:text-foreground"
              }`}
            >
              {p === "Alle" ? "Alle" : p}
              {p !== "Alle" && (
                <span
                  className="ml-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ background: PROVINCIE_KLEUREN[p] }}
                />
              )}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted">{sorted.length} gemeenten</span>
      </div>

      {/* Table */}
      <div className="glass-strong overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted w-8">
                  #
                </th>
                <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                  Gemeente
                </th>
                <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                  Provincie
                </th>
                {SORTABLE_INDICATORS.map((ind) => (
                  <th
                    key={ind}
                    onClick={() => toggleSort(ind)}
                    className="cursor-pointer px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    {INDICATOR_LABELS[ind]}
                    {sortBy === ind && (
                      <span className="ml-1 text-accent-light">
                        {sortDir === "desc" ? "↓" : "↑"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((g, i) => (
                <tr key={g.id} className="table-row border-b border-glass-border/50">
                  <td className="px-3 py-2 text-xs font-mono text-muted">{i + 1}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/gemeente/${slugify(g.naam)}`}
                      className="text-[13px] font-medium text-foreground hover:text-accent-light transition-colors"
                    >
                      {g.naam}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ background: PROVINCIE_KLEUREN[g.provincie] }}
                      />
                      <span className="text-xs text-muted">{g.provincie}</span>
                    </div>
                  </td>
                  {SORTABLE_INDICATORS.map((ind) => (
                    <td
                      key={ind}
                      className={`px-3 py-2 text-right font-mono text-[12px] ${
                        sortBy === ind ? "text-accent-light font-medium" : "text-muted"
                      }`}
                    >
                      {formatIndicator(ind, g[ind] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
