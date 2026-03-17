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
  veiligFietsen: number;
  tevredenheidZorg: number;
  kansarmoede: number; // kansarmoede-index (%)
  oki: number; // onderwijskansarmoede-indicator
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
  werk: number;
  mobiliteit: number;
  fietsveiligheid: number;
  onderwijs: number;
  wonen: number;
  veiligheid: number;
  zorg: number;
  bestuur: number;
  armoede: number;
  leefbaarheid: number;
}

export type ThemaKey = keyof ThemaScores;

export const THEMA_TOOLTIPS: Record<ThemaKey, string> = {
  demografie: "Percentiel-ranking op basis van jaarlijkse bevolkingsgroei (Statbel 2025). Hogere groei = hogere score.",
  economie: "Percentiel-ranking op basis van mediaan netto belastbaar inkomen per aangifte (Statbel 2023).",
  werk: "Percentiel-ranking op basis van werkzoekendengraad (Stadsmonitor WE_36). Lagere werkloosheid = hogere score.",
  mobiliteit: "Percentiel-ranking op basis van laadpalen per 1000 inwoners (Dept. MOW WFS, live data).",
  fietsveiligheid: "% inwoners dat zich veilig voelt om te fietsen in de gemeente (Stadsmonitor MO_S_06, burgerbevraging 2023).",
  onderwijs: "Percentiel-ranking op basis van Onderwijskansarmoede-indicator OKI (Stadsmonitor AR_05). Lagere OKI = hogere score.",
  wonen: "Percentiel-ranking op basis van mediaanprijs woningen (Statbel 2024). Lagere prijs = hogere score (betaalbaarder).",
  veiligheid: "Percentiel-ranking op basis van criminaliteitsgraad per 1000 inwoners (Stadsmonitor SA_01). Minder criminaliteit = hogere score.",
  zorg: "% inwoners dat tevreden is over gezondheidsvoorzieningen in de gemeente (Stadsmonitor ZO_S_06, burgerbevraging 2023).",
  bestuur: "% inwoners dat veel vertrouwen heeft in het gemeentebestuur (Stadsmonitor LO_S_13, burgerbevraging 2023).",
  armoede: "Percentiel-ranking op basis van kansarmoede-index (Stadsmonitor AR_03). Lagere kansarmoede = hogere score.",
  leefbaarheid: "Gemiddelde van 6 survey-indicatoren: graag wonen, tevredenheid, netheid centrum, netheid straten, groen in buurt, vertrouwen bestuur (burgerbevraging 2023).",
};

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
export type Indicator = keyof Omit<Gemeente, "id" | "naam" | "provincie" | "scores" | "inkomensJaar" | "huisprijsJaar" | "bevolkingsTrend" | "leerlingen" | "groeneRuimte" | "vergrijzingsgraad">;

export const INDICATOR_LABELS: Record<Indicator, string> = {
  inwoners: "Inwoners",
  oppervlakte: "Oppervlakte (km²)",
  dichtheid: "Dichtheid (inw/km²)",
  mediaalInkomen: "Mediaan inkomen (€)",
  werkloosheidsgraad: "Werkloosheid (%)",
  laadpalen: "Laadpalen",
  laadpalenPerInwoner: "Laadpalen /1000 inw.",
  criminaliteitsgraad: "Criminaliteit (/1000)",
  bevolkingsgroei: "Bevolkingsgroei (%)",
  gemiddeldeHuisprijs: "Gem. huisprijs (€)",
  netheidCentrum: "Netheid centrum (%)",
  netheidStraten: "Netheid straten (%)",
  groenBuurt: "Groen in buurt (%)",
  tevredenheidGemeente: "Tevredenheid gemeente (%)",
  graagWonen: "Graag wonen (%)",
  vertrouwenBestuur: "Vertrouwen bestuur (%)",
  veiligFietsen: "Veilig fietsen (%)",
  tevredenheidZorg: "Tevredenheid zorg (%)",
  kansarmoede: "Kansarmoede-index (%)",
  oki: "OKI (onderwijs)",
};

export const PROVINCIE_KLEUREN: Record<Provincie, string> = {
  Antwerpen: "#f97316",
  Limburg: "#22c55e",
  "Oost-Vlaanderen": "#3b82f6",
  "Vlaams-Brabant": "#a855f7",
  "West-Vlaanderen": "#ef4444",
};
