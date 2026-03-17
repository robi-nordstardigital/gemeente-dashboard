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
  // Stadsmonitor survey indicators (burgerbevraging, % eens/veel)
  netheidCentrum: number;
  netheidStraten: number;
  groenBuurt: number;
  tevredenheidGemeente: number;
  graagWonen: number;
  vertrouwenBestuur: number;
  bevolkingsgroei: number; // % t.o.v. vorig jaar
  gemiddeldeHuisprijs: number; // €
  leerlingen: number; // Dataloep onderwijs — inschrijvingen per woonplaats
  inkomensJaar?: number;
  huisprijsJaar?: number;
  bevolkingsTrend?: { jaar: number; inwoners: number }[];
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
  leefbaarheid: number;
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

// Only indicators backed by real data are exposed to the UI
export type Indicator = keyof Omit<Gemeente, "id" | "naam" | "provincie" | "scores" | "inkomensJaar" | "huisprijsJaar" | "bevolkingsTrend" | "leerlingen" | "werkloosheidsgraad" | "criminaliteitsgraad" | "groeneRuimte" | "vergrijzingsgraad">;

export const INDICATOR_LABELS: Record<Indicator, string> = {
  inwoners: "Inwoners",
  oppervlakte: "Oppervlakte (km²)",
  dichtheid: "Dichtheid (inw/km²)",
  mediaalInkomen: "Mediaan inkomen (€)",
  laadpalen: "Laadpalen",
  laadpalenPerInwoner: "Laadpalen /1000 inw.",
  bevolkingsgroei: "Bevolkingsgroei (%)",
  gemiddeldeHuisprijs: "Gem. huisprijs (€)",
  netheidCentrum: "Netheid centrum (%)",
  netheidStraten: "Netheid straten (%)",
  groenBuurt: "Groen in buurt (%)",
  tevredenheidGemeente: "Tevredenheid gemeente (%)",
  graagWonen: "Graag wonen (%)",
  vertrouwenBestuur: "Vertrouwen bestuur (%)",
};

export const PROVINCIE_KLEUREN: Record<Provincie, string> = {
  Antwerpen: "#f97316",
  Limburg: "#22c55e",
  "Oost-Vlaanderen": "#3b82f6",
  "Vlaams-Brabant": "#a855f7",
  "West-Vlaanderen": "#ef4444",
};
