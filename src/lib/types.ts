export interface Gemeente {
  id: string; // NIS code
  naam: string;
  provincie: Provincie;
  inwoners: number;
  oppervlakte: number; // km²
  dichtheid: number; // inwoners/km²
  mediaalInkomen: number; // €/jaar
  werkloosheidsgraad: number; // %
  laadpalen: number;
  laadpalenPerInwoner: number; // per 1000 inwoners
  criminaliteitsgraad: number; // per 1000 inwoners
  groeneRuimte: number; // % oppervlakte
  vergrijzingsgraad: number; // % 65+
  bevolkingsgroei: number; // % t.o.v. vorig jaar
  gemiddeldeHuisprijs: number; // €
  scores: ThemaScores;
}

export interface ThemaScores {
  demografie: number; // 0-100
  economie: number;
  mobiliteit: number;
  onderwijs: number;
  milieu: number;
  veiligheid: number;
  wonen: number;
  zorg: number;
}

export type Provincie =
  | "Antwerpen"
  | "Limburg"
  | "Oost-Vlaanderen"
  | "Vlaams-Brabant"
  | "West-Vlaanderen";

export interface TrendDataPoint {
  jaar: number;
  waarde: number;
}

export interface GemeenteTrend {
  id: string;
  naam: string;
  data: TrendDataPoint[];
}

export type SortDirection = "asc" | "desc";

export type Indicator = keyof Omit<Gemeente, "id" | "naam" | "provincie" | "scores">;

export const INDICATOR_LABELS: Record<Indicator, string> = {
  inwoners: "Inwoners",
  oppervlakte: "Oppervlakte (km²)",
  dichtheid: "Dichtheid (inw/km²)",
  mediaalInkomen: "Mediaan inkomen (€)",
  werkloosheidsgraad: "Werkloosheid (%)",
  laadpalen: "Laadpalen",
  laadpalenPerInwoner: "Laadpalen /1000 inw.",
  criminaliteitsgraad: "Criminaliteit /1000 inw.",
  groeneRuimte: "Groene ruimte (%)",
  vergrijzingsgraad: "Vergrijzing 65+ (%)",
  bevolkingsgroei: "Bevolkingsgroei (%)",
  gemiddeldeHuisprijs: "Gem. huisprijs (€)",
};

export const PROVINCIE_KLEUREN: Record<Provincie, string> = {
  Antwerpen: "#f97316",
  Limburg: "#22c55e",
  "Oost-Vlaanderen": "#3b82f6",
  "Vlaams-Brabant": "#a855f7",
  "West-Vlaanderen": "#ef4444",
};
