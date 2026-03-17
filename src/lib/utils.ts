import { Gemeente, Indicator, Provincie } from "./types";

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("nl-BE").format(n);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function formatIndicator(indicator: Indicator, value: number): string {
  switch (indicator) {
    case "mediaalInkomen":
    case "gemiddeldeHuisprijs":
      return formatCurrency(value);
    case "bevolkingsgroei":
      return formatPercent(value);
    case "werkloosheidsgraad":
    case "kansarmoede":
      return formatPercent(value);
    case "netheidCentrum":
    case "netheidStraten":
    case "groenBuurt":
    case "tevredenheidGemeente":
    case "graagWonen":
    case "vertrouwenBestuur":
    case "veiligFietsen":
    case "tevredenheidZorg":
      return `${Math.round(value)}%`;
    case "laadpalenPerInwoner":
    case "criminaliteitsgraad":
    case "oki":
      return value.toFixed(2);
    case "dichtheid":
      return formatNumber(Math.round(value));
    case "oppervlakte":
      return `${value.toFixed(1)} km²`;
    default:
      return formatNumber(Math.round(value));
  }
}

export function getRank(gemeenten: Gemeente[], id: string, indicator: Indicator, ascending = false): number {
  const sorted = [...gemeenten].sort((a, b) =>
    ascending ? a[indicator] as number - (b[indicator] as number) : (b[indicator] as number) - (a[indicator] as number)
  );
  return sorted.findIndex((g) => g.id === id) + 1;
}

export function getProvincieGemeenten(gemeenten: Gemeente[], provincie: Provincie): Gemeente[] {
  return gemeenten.filter((g) => g.provincie === provincie);
}

export function slugify(naam: string): string {
  return naam
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
