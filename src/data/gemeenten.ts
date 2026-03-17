import { Gemeente } from "@/lib/types";
import gemeentenRaw from "./gemeenten-real.json";
import aggregatesRaw from "./aggregates.json";

// Import pre-processed real data from Statbel
export const gemeenten: Gemeente[] = gemeentenRaw as Gemeente[];

// Pre-computed aggregates from real data
export const totaalInwoners = aggregatesRaw.totaalInwoners;
export const totaalLaadpalen = gemeenten.reduce((sum, g) => sum + g.laadpalen, 0);
export const gemiddeldInkomen = aggregatesRaw.gemiddeldInkomen;
export const gemiddeldeWerkloosheid = +(
  gemeenten.filter(g => g.werkloosheidsgraad > 0).reduce((sum, g) => sum + g.werkloosheidsgraad, 0) /
  (gemeenten.filter(g => g.werkloosheidsgraad > 0).length || 1)
).toFixed(1);
export const gemiddeldeHuisprijs = aggregatesRaw.gemiddeldeHuisprijs;

// Population trend from real Statbel data (2015-2025)
export const bevolkingsTrend = aggregatesRaw.bevolkingsTrend;

// Data availability status
export const dataStatus = aggregatesRaw.dataStatus;

// Laadpalen trend (estimated — real data requires manual FME portal download)
export const laadpalenTrend = [
  { jaar: 2018, waarde: 1240 },
  { jaar: 2019, waarde: 2180 },
  { jaar: 2020, waarde: 3450 },
  { jaar: 2021, waarde: 5620 },
  { jaar: 2022, waarde: 8900 },
  { jaar: 2023, waarde: 13400 },
  { jaar: 2024, waarde: 18700 },
  { jaar: 2025, waarde: 24500 },
];

export function getGemeenteBySlug(slug: string): Gemeente | undefined {
  return gemeenten.find(
    (g) =>
      g.naam
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") === slug
  );
}

export function getTopGemeenten(indicator: keyof Gemeente, n = 10, ascending = false): Gemeente[] {
  return [...gemeenten]
    .filter(g => {
      const v = g[indicator];
      return typeof v === "number" && v > 0;
    })
    .sort((a, b) => {
      const va = a[indicator] as number;
      const vb = b[indicator] as number;
      return ascending ? va - vb : vb - va;
    })
    .slice(0, n);
}
