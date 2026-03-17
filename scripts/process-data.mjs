/**
 * Data processing script for Gemeente Dashboard
 *
 * Reads real Statbel data and outputs JSON files for the dashboard.
 *
 * Sources:
 * - Statbel: Population per municipality (2025, + historical 2015-2024)
 * - Statbel: Fiscal income per municipality (2005-2023)
 * - Statbel: Real estate prices per municipality (2010-2025, quarterly)
 * - Belgium TopoJSON for map boundaries
 */

import XLSX from "xlsx";
import { writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = resolve(__dirname, "../data/raw");
const OUT = resolve(__dirname, "../src/data");

// ────────────────────────────────────────────
// 1. POPULATION DATA (2015-2025)
// ────────────────────────────────────────────
console.log("📊 Processing population data...");

const popWb = XLSX.readFile(resolve(RAW, "bevolking.xlsx"));

// Flemish NIS code prefixes: 1xxxx (Antwerpen), 2xxxx (Vl-Brabant), 3xxxx (W-Vl), 4xxxx (O-Vl), 7xxxx (Limburg)
function isFlemishNIS(code) {
  const s = String(code);
  if (s.length !== 5) return false;
  const prefix = s[0];
  if (!["1", "2", "3", "4", "7"].includes(prefix)) return false;
  // Exclude aggregate codes ending in 000 (provinces, arrondissements)
  if (s.endsWith("000")) return false;
  return true;
}

function nisToProvincie(code) {
  const s = String(code);
  const first2 = parseInt(s.substring(0, 2));
  if (first2 >= 11 && first2 <= 13) return "Antwerpen";
  if (first2 >= 23 && first2 <= 24) return "Vlaams-Brabant";
  if (first2 >= 31 && first2 <= 38) return "West-Vlaanderen";
  if (first2 >= 41 && first2 <= 46) return "Oost-Vlaanderen";
  if (first2 >= 71 && first2 <= 73) return "Limburg";
  return null;
}

// Parse population for a given year
function parsePopulation(sheetName) {
  const sheet = popWb.Sheets[sheetName];
  if (!sheet) return new Map();
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const map = new Map();
  for (const row of rows) {
    const nis = String(row[0]);
    if (isFlemishNIS(nis)) {
      map.set(nis, {
        naam: row[1],
        mannen: row[2],
        vrouwen: row[3],
        totaal: row[4],
      });
    }
  }
  return map;
}

// Current population (2025)
const pop2025 = parsePopulation("Bevolking in 2025");
console.log(`  Found ${pop2025.size} Flemish municipalities in 2025`);

// Historical population for trends
const popTrend = new Map();
for (let year = 2015; year <= 2025; year++) {
  const sheetName = `Bevolking in ${year}`;
  const data = parsePopulation(sheetName);
  for (const [nis, info] of data) {
    if (!popTrend.has(nis)) popTrend.set(nis, []);
    popTrend.get(nis).push({ jaar: year, inwoners: info.totaal });
  }
}

// Flemish total population trend
const vlaamsTotaal = [];
for (let year = 2015; year <= 2025; year++) {
  const sheetName = `Bevolking in ${year}`;
  const sheet = popWb.Sheets[sheetName];
  if (!sheet) continue;
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const vlRow = rows.find(r => String(r[0]) === "02000");
  if (vlRow) vlaamsTotaal.push({ jaar: year, waarde: vlRow[4] });
}

// ────────────────────────────────────────────
// 2. FISCAL INCOME DATA (latest year per municipality)
// ────────────────────────────────────────────
console.log("💰 Processing fiscal income data...");

const incWb = XLSX.readFile(resolve(RAW, "fiscaal_inkomen.xlsx"));
const incRows = XLSX.utils.sheet_to_json(incWb.Sheets[incWb.SheetNames[0]]);

// Get the latest year per municipality, compute average income
const incomeByNIS = new Map();
for (const row of incRows) {
  const nis = String(row.CD_MUNTY_REFNIS);
  if (!isFlemishNIS(nis)) continue;
  const year = row.CD_YEAR;
  const existing = incomeByNIS.get(nis);
  if (!existing || year > existing.year) {
    const nDecl = row.MS_NBR_NON_ZERO_INC + (row.MS_NBR_ZERO_INC || 0);
    const totInc = row.MS_TOT_NET_TAXABLE_INC;
    incomeByNIS.set(nis, {
      year,
      totaalInkomen: totInc,
      aantalDeclaraties: nDecl,
      gemiddeldInkomen: nDecl > 0 ? Math.round(totInc / nDecl) : 0,
      totaalBelasting: row.MS_TOT_TAXES || 0,
      inwoners: row.MS_TOT_RESIDENTS || 0,
    });
  }
}
console.log(`  Found income data for ${incomeByNIS.size} municipalities (latest year per municipality)`);

// Income trend per NIS (for historical)
const incomeTrend = new Map();
for (const row of incRows) {
  const nis = String(row.CD_MUNTY_REFNIS);
  if (!isFlemishNIS(nis)) continue;
  if (row.CD_YEAR < 2015) continue;
  if (!incomeTrend.has(nis)) incomeTrend.set(nis, []);
  const nDecl = row.MS_NBR_NON_ZERO_INC + (row.MS_NBR_ZERO_INC || 0);
  incomeTrend.get(nis).push({
    jaar: row.CD_YEAR,
    gemiddeldInkomen: nDecl > 0 ? Math.round(row.MS_TOT_NET_TAXABLE_INC / nDecl) : 0,
  });
}

// ────────────────────────────────────────────
// 3. REAL ESTATE PRICES (2024 — from Statbel XLSX Q1-Q4)
// ────────────────────────────────────────────
console.log("🏠 Processing real estate price data...");

// Parse new CSV exported from Statbel XLSX (2010-2025, quarterly, per gemeente)
const reCsv = readFileSync(resolve(RAW, "vastgoedprijzen_gemeente.csv"), "utf-8");
const reLines = reCsv.split("\n");

const huisprijsByNIS = new Map();
const huisprijsTrend = new Map(); // For historical trend
const TARGET_YEAR = "2024"; // Most recent full year with Q1-Q4 data

// First pass: collect all quarterly medians per NIS per year
const quarterlies = new Map(); // NIS → Map<year, [medians]>
for (let i = 1; i < reLines.length; i++) {
  const cols = reLines[i].split(",");
  if (cols.length < 5) continue;

  const nis = cols[0];
  const jaar = cols[2];
  const mediaan = parseFloat(cols[4]); // mediaan_alle (all house types)

  if (!isFlemishNIS(nis)) continue;
  if (isNaN(mediaan) || mediaan <= 0) continue;

  if (!quarterlies.has(nis)) quarterlies.set(nis, new Map());
  const yearMap = quarterlies.get(nis);
  if (!yearMap.has(jaar)) yearMap.set(jaar, []);
  yearMap.get(jaar).push(mediaan);
}

// Build current prices (2024) and trend data
for (const [nis, yearMap] of quarterlies) {
  // Trend: yearly averages of quarterly medians
  const trendData = [];
  for (const [jaar, medians] of yearMap) {
    const avg = Math.round(medians.reduce((s, v) => s + v, 0) / medians.length);
    trendData.push({ jaar: parseInt(jaar), mediaanPrijs: avg });
  }
  trendData.sort((a, b) => a.jaar - b.jaar);
  huisprijsTrend.set(nis, trendData);

  // Current price: use 2024 (full year), fallback to 2023
  const targetMedians = yearMap.get(TARGET_YEAR) || yearMap.get("2023");
  if (targetMedians && targetMedians.length > 0) {
    const avgMediaan = Math.round(targetMedians.reduce((s, v) => s + v, 0) / targetMedians.length);
    huisprijsByNIS.set(nis, {
      mediaanPrijs: avgMediaan,
      transacties: 0, // Not available per quarter in new format
      jaar: yearMap.has(TARGET_YEAR) ? 2024 : 2023,
    });
  }
}

console.log(`  Found real estate data for ${huisprijsByNIS.size} municipalities (${TARGET_YEAR})`);

// ────────────────────────────────────────────
// 4. LAADPALEN DATA (WFS — Dept. MOW)
// ────────────────────────────────────────────
console.log("⚡ Processing laadpalen data...");

const laadpalenCsv = readFileSync(resolve(RAW, "laadpunten_all.csv"), "utf-8");
const laadpalenLines = laadpalenCsv.split("\n");
const lpHeaders = laadpalenLines[0].split(",");

// Count laadpunten per gemeente (by name matching)
const laadpalenPerGemeente = new Map(); // gemeente name → { count, publiek, semiPubliek, snelladers }
for (let i = 1; i < laadpalenLines.length; i++) {
  // CSV with possible commas in quoted fields — simple parse for known structure
  const line = laadpalenLines[i];
  if (!line.trim()) continue;
  const cols = line.split(",");
  if (cols.length < 16) continue;

  const gemeente = cols[11]; // gemeente column
  const toegankelijkheid = cols[4]; // toegankelijkheid
  const snelheid = cols[5]; // snelheid
  const kw = parseFloat(cols[5]) || 0;

  if (!gemeente) continue;
  const key = gemeente.trim();
  if (!laadpalenPerGemeente.has(key)) {
    laadpalenPerGemeente.set(key, { totaal: 0, publiek: 0, semiPubliek: 0, snelladers: 0 });
  }
  const entry = laadpalenPerGemeente.get(key);
  entry.totaal++;
  if (toegankelijkheid === "publiek") entry.publiek++;
  else if (toegankelijkheid === "semi-publiek") entry.semiPubliek++;
  // snelheid column is at index 6 actually, kw at index 5
  const kwVal = parseFloat(cols[5]) || 0;
  if (kwVal >= 50) entry.snelladers++;
}
console.log(`  Found laadpunten in ${laadpalenPerGemeente.size} municipalities`);
console.log(`  Total laadpunten: ${[...laadpalenPerGemeente.values()].reduce((s, v) => s + v.totaal, 0)}`);

// ────────────────────────────────────────────
// 4b. ONDERWIJS DATA (Dataloep — Dept. Onderwijs)
// ────────────────────────────────────────────
console.log("📚 Processing onderwijs data...");

const ondCsv = readFileSync(resolve(RAW, "onderwijs_mobiliteit.csv"), "utf-8");
const ondLines = ondCsv.split("\n");

// Count leerlingen per woonplaats-gemeente (NIS code)
const leerlingenPerGemeente = new Map(); // NIS → total students
for (let i = 1; i < ondLines.length; i++) {
  const line = ondLines[i];
  if (!line.trim()) continue;
  // CSV is quoted, parse carefully
  const matches = line.match(/"([^"]*)"/g);
  if (!matches || matches.length < 22) continue;
  const strip = s => s.replace(/^"|"$/g, "");

  const woonplaatsNis = strip(matches[11]); // woonplaats_fusiegemeente_nis
  const aantal = parseInt(strip(matches[matches.length - 1])) || 0; // aantal_inschrijvingen (last col)

  if (!woonplaatsNis || !isFlemishNIS(woonplaatsNis)) continue;
  leerlingenPerGemeente.set(woonplaatsNis, (leerlingenPerGemeente.get(woonplaatsNis) || 0) + aantal);
}
console.log(`  Found onderwijs data for ${leerlingenPerGemeente.size} municipalities`);

// ────────────────────────────────────────────
// 5a. SURFACE AREA PER MUNICIPALITY (Statbel Kadaster)
// ────────────────────────────────────────────
console.log("📐 Processing surface area data...");

const oppCsv = readFileSync(resolve(RAW, "oppervlakte_gemeente.csv"), "utf-8");
const oppLines = oppCsv.split("\n");
const oppByNIS = new Map(); // NIS → km²
for (let i = 1; i < oppLines.length; i++) {
  const cols = oppLines[i].split(",");
  if (cols.length < 3) continue;
  const nis = cols[0].trim();
  const km2 = parseFloat(cols[2]);
  if (nis && !isNaN(km2)) {
    oppByNIS.set(nis, km2);
  }
}
console.log(`  Found surface area for ${oppByNIS.size} municipalities`);

// ────────────────────────────────────────────
// 5b. GEMEENTE-STADSMONITOR — Vergrijzing (DE_05)
// ────────────────────────────────────────────
console.log("👵 Processing vergrijzingsgraad (Stadsmonitor)...");

const smDemWb = XLSX.readFile(resolve(RAW, "stadsmonitor_register_demografie.xlsx"));
const de05Rows = XLSX.utils.sheet_to_json(smDemWb.Sheets["DE_05"], { header: 1 });

const vergrijzingByNIS = new Map(); // NIS → { jaar, pct }
for (let i = 1; i < de05Rows.length; i++) {
  const row = de05Rows[i];
  const nis = String(row[1]);
  if (!isFlemishNIS(nis)) continue;
  const jaar = row[3];
  const pct = row[7]; // Procent (%) 65+
  if (typeof pct !== "number") continue;
  const existing = vergrijzingByNIS.get(nis);
  if (!existing || jaar > existing.jaar) {
    vergrijzingByNIS.set(nis, { jaar, pct: +pct.toFixed(1) });
  }
}
console.log(`  Found vergrijzing for ${vergrijzingByNIS.size} municipalities (latest year per gemeente)`);

// ────────────────────────────────────────────
// 5c. GEMEENTE-STADSMONITOR — Werkzoekendengraad (WE_36)
// ────────────────────────────────────────────
console.log("💼 Processing werkzoekendengraad (Stadsmonitor)...");

const smWerkWb = XLSX.readFile(resolve(RAW, "stadsmonitor_register_werk.xlsx"));
const we36Rows = XLSX.utils.sheet_to_json(smWerkWb.Sheets["WE_36"], { header: 1 });

const werkloosheidByNIS = new Map(); // NIS → { jaar, pct }
for (let i = 1; i < we36Rows.length; i++) {
  const row = we36Rows[i];
  const nis = String(row[1]);
  if (!isFlemishNIS(nis)) continue;
  const jaar = row[3];
  const pct = row[5]; // Procent (%)
  if (typeof pct !== "number") continue;
  const existing = werkloosheidByNIS.get(nis);
  if (!existing || jaar > existing.jaar) {
    werkloosheidByNIS.set(nis, { jaar, pct: +pct.toFixed(1) });
  }
}
console.log(`  Found werkzoekendengraad for ${werkloosheidByNIS.size} municipalities`);

// ────────────────────────────────────────────
// 5d. GEMEENTE-STADSMONITOR — Groene ruimte (RU_05 landgebruik)
// ────────────────────────────────────────────
console.log("🌳 Processing groene ruimte (Stadsmonitor)...");

const smRuimWb = XLSX.readFile(resolve(RAW, "stadsmonitor_register_ruimte.xlsx"));
const ru05Rows = XLSX.utils.sheet_to_json(smRuimWb.Sheets["RU_05"], { header: 1 });

// Sum "Bos" + "Grasland" + "Water" + "Recreatie" as % of total = groene ruimte
const groeneRuimteByNIS = new Map(); // NIS → { jaar, pct }
const landgebruikTemp = new Map(); // NIS → Map<jaar, { groen, totaal }>

for (let i = 1; i < ru05Rows.length; i++) {
  const row = ru05Rows[i];
  const nis = String(row[1]);
  if (!isFlemishNIS(nis)) continue;
  const jaar = row[3];
  const gebruik = row[4];
  const opp = row[5]; // Oppervlakte type landgebruik
  const totaal = row[6]; // Totale oppervlakte

  if (typeof opp !== "number" || typeof totaal !== "number") continue;

  const key = `${nis}_${jaar}`;
  if (!landgebruikTemp.has(key)) landgebruikTemp.set(key, { nis, jaar, groen: 0, totaal });

  const entry = landgebruikTemp.get(key);
  if (["Bos", "Grasland", "Water", "Recreatie"].includes(gebruik)) {
    entry.groen += opp;
  }
}

// Pick latest year per NIS
for (const entry of landgebruikTemp.values()) {
  const pct = entry.totaal > 0 ? +((entry.groen / entry.totaal) * 100).toFixed(1) : 0;
  const existing = groeneRuimteByNIS.get(entry.nis);
  if (!existing || entry.jaar > existing.jaar) {
    groeneRuimteByNIS.set(entry.nis, { jaar: entry.jaar, pct });
  }
}
console.log(`  Found groene ruimte for ${groeneRuimteByNIS.size} municipalities`);

// ────────────────────────────────────────────
// 5e. GEMEENTE-STADSMONITOR — Survey indicatoren (Burgerbevraging)
// ────────────────────────────────────────────
console.log("📋 Processing Stadsmonitor survey data (burgerbevraging)...");

/**
 * Parse a Stadsmonitor survey sheet.
 * Returns Map<NIS, { jaar, pct }> with latest year's positive % per municipality.
 * Column layout: [Gemeente, NIS-code, Indicator, Jaar, Neg%, Neutraal%, Pos%]
 */
function parseSurveySheet(filePath, sheetName) {
  const wb = XLSX.readFile(filePath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
  const result = new Map();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const nis = String(row[1]);
    if (!isFlemishNIS(nis)) continue;
    const jaar = row[3];
    const pct = row[6]; // Eens (%) or Veel (%)
    if (typeof pct !== "number") continue;
    const existing = result.get(nis);
    if (!existing || jaar > existing.jaar) {
      result.set(nis, { jaar, pct });
    }
  }
  return result;
}

const surveyWonenFile = resolve(RAW, "stadsmonitor_survey_wonen.xlsx");
const surveyLBFile = resolve(RAW, "stadsmonitor_survey_lokaal_bestuur.xlsx");

const netheidCentrumByNIS = parseSurveySheet(surveyWonenFile, "WO_S_12");
const netheidStratenByNIS = parseSurveySheet(surveyWonenFile, "WO_S_13");
const groenBuurtByNIS = parseSurveySheet(surveyWonenFile, "WO_S_33");
const tevredenheidGemeenteByNIS = parseSurveySheet(surveyWonenFile, "WO_S_15");
const graagWonenByNIS = parseSurveySheet(surveyWonenFile, "WO_S_16");
const vertrouwenBestuurByNIS = parseSurveySheet(surveyLBFile, "LO_S_13");

console.log(`  Netheid centrum: ${netheidCentrumByNIS.size} municipalities`);
console.log(`  Netheid straten: ${netheidStratenByNIS.size} municipalities`);
console.log(`  Groen in buurt: ${groenBuurtByNIS.size} municipalities`);
console.log(`  Tevredenheid gemeente: ${tevredenheidGemeenteByNIS.size} municipalities`);
console.log(`  Graag wonen: ${graagWonenByNIS.size} municipalities`);
console.log(`  Vertrouwen bestuur: ${vertrouwenBestuurByNIS.size} municipalities`);

// ────────────────────────────────────────────
// 6. BUILD COMBINED GEMEENTE RECORDS
// ────────────────────────────────────────────
console.log("🔗 Combining all data sources...");

const gemeenten = [];

for (const [nis, popData] of pop2025) {
  const provincie = nisToProvincie(nis);
  if (!provincie) continue;

  const income = incomeByNIS.get(nis);
  const huisprijs = huisprijsByNIS.get(nis);

  // Compute bevolkingsgroei from historical data
  const trend = popTrend.get(nis) || [];
  const sorted = trend.sort((a, b) => a.jaar - b.jaar);
  let bevolkingsgroei = 0;
  if (sorted.length >= 2) {
    const latest = sorted[sorted.length - 1].inwoners;
    const prev = sorted[sorted.length - 2].inwoners;
    if (prev > 0) bevolkingsgroei = +((latest - prev) / prev * 100).toFixed(2);
  }

  // Real surface area from Statbel Kadaster (bodembezetting 2025)
  const oppervlakte = oppByNIS.get(nis) || 0;

  // Match laadpalen by gemeente name
  const lpData = laadpalenPerGemeente.get(popData.naam);
  const aantalLaadpalen = lpData ? lpData.totaal : 0;
  const lpPerInwoner = popData.totaal > 0 ? +(aantalLaadpalen / popData.totaal * 1000).toFixed(2) : 0;

  // Match onderwijs data by NIS code
  const aantalLeerlingen = leerlingenPerGemeente.get(nis) || 0;

  const gemeente = {
    id: nis,
    naam: popData.naam,
    provincie,
    inwoners: popData.totaal,
    oppervlakte,
    dichtheid: 0,
    mediaalInkomen: income ? income.gemiddeldInkomen : 0,
    werkloosheidsgraad: werkloosheidByNIS.get(nis)?.pct || 0,
    laadpalen: aantalLaadpalen,
    laadpalenPerInwoner: lpPerInwoner,
    criminaliteitsgraad: 0, // Need separate data source (Politie)
    groeneRuimte: 0, // Need separate data source (Stadsmonitor)
    vergrijzingsgraad: 0, // Need separate data source
    // Stadsmonitor survey indicators (burgerbevraging)
    netheidCentrum: netheidCentrumByNIS.get(nis)?.pct || 0,
    netheidStraten: netheidStratenByNIS.get(nis)?.pct || 0,
    groenBuurt: groenBuurtByNIS.get(nis)?.pct || 0,
    tevredenheidGemeente: tevredenheidGemeenteByNIS.get(nis)?.pct || 0,
    graagWonen: graagWonenByNIS.get(nis)?.pct || 0,
    vertrouwenBestuur: vertrouwenBestuurByNIS.get(nis)?.pct || 0,
    bevolkingsgroei,
    gemiddeldeHuisprijs: huisprijs ? huisprijs.mediaanPrijs : 0,
    leerlingen: aantalLeerlingen,
    inkomensJaar: income ? income.year : 0,
    huisprijsJaar: huisprijs ? huisprijs.jaar : 0,
    bevolkingsTrend: sorted,
    scores: {
      demografie: 0,
      economie: 0,
      mobiliteit: 0,
      onderwijs: 0,
      milieu: 0,
      veiligheid: 0,
      wonen: 0,
      zorg: 0,
      leefbaarheid: 0,
    },
  };

  gemeente.dichtheid = gemeente.oppervlakte > 0
    ? +(gemeente.inwoners / gemeente.oppervlakte).toFixed(1)
    : 0;

  gemeenten.push(gemeente);
}

// ────────────────────────────────────────────
// 6. COMPUTE RELATIVE SCORES (percentile-based)
// ────────────────────────────────────────────
console.log("📈 Computing relative scores...");

function computePercentileScore(values, value, higherIsBetter = true) {
  const sorted = [...values].sort((a, b) => a - b);
  const rank = sorted.findIndex(v => v >= value);
  const pct = (rank / sorted.length) * 100;
  return higherIsBetter ? Math.round(pct) : Math.round(100 - pct);
}

const allInkomen = gemeenten.map(g => g.mediaalInkomen).filter(v => v > 0);
const allHuisprijs = gemeenten.map(g => g.gemiddeldeHuisprijs).filter(v => v > 0);
const allDichtheid = gemeenten.map(g => g.dichtheid);
const allGroei = gemeenten.map(g => g.bevolkingsgroei);
const allLaadpalen = gemeenten.map(g => g.laadpalenPerInwoner).filter(v => v > 0);
const allLeerlingen = gemeenten.map(g => g.leerlingen).filter(v => v > 0);

for (const g of gemeenten) {
  g.scores.economie = g.mediaalInkomen > 0
    ? computePercentileScore(allInkomen, g.mediaalInkomen) : 50;
  g.scores.wonen = g.gemiddeldeHuisprijs > 0
    ? computePercentileScore(allHuisprijs, g.gemiddeldeHuisprijs, false) : 50; // lower price = better
  g.scores.demografie = computePercentileScore(allGroei, g.bevolkingsgroei);
  // Mobiliteit score based on laadpalen per inwoner (real data from MOW WFS)
  g.scores.mobiliteit = g.laadpalenPerInwoner > 0
    ? computePercentileScore(allLaadpalen, g.laadpalenPerInwoner) : 50;
  // Onderwijs score based on leerlingen per inwoner ratio (from Dataloep)
  const leerlingenRatio = g.inwoners > 0 ? g.leerlingen / g.inwoners : 0;
  const allRatios = gemeenten.filter(x => x.leerlingen > 0 && x.inwoners > 0).map(x => x.leerlingen / x.inwoners);
  g.scores.onderwijs = leerlingenRatio > 0
    ? computePercentileScore(allRatios, leerlingenRatio) : 50;
  // Leefbaarheid score: average of survey indicators (direct %, not percentile)
  const surveyValues = [g.netheidCentrum, g.netheidStraten, g.groenBuurt,
    g.tevredenheidGemeente, g.graagWonen, g.vertrouwenBestuur].filter(v => v > 0);
  g.scores.leefbaarheid = surveyValues.length > 0
    ? Math.round(surveyValues.reduce((s, v) => s + v, 0) / surveyValues.length) : 50;
  // Milieu score based on groen in buurt survey
  g.scores.milieu = g.groenBuurt > 0 ? g.groenBuurt : 50;
  // Veiligheid: netheid as proxy
  const netheidValues = [g.netheidCentrum, g.netheidStraten].filter(v => v > 0);
  g.scores.veiligheid = netheidValues.length > 0
    ? Math.round(netheidValues.reduce((s, v) => s + v, 0) / netheidValues.length) : 50;
  g.scores.zorg = 50;
}

// ────────────────────────────────────────────
// 7. WRITE OUTPUT FILES
// ────────────────────────────────────────────
console.log("💾 Writing output files...");

// Sort by name
gemeenten.sort((a, b) => a.naam.localeCompare(b.naam, "nl"));

writeFileSync(
  resolve(OUT, "gemeenten-real.json"),
  JSON.stringify(gemeenten, null, 2)
);

// Aggregates
const totaalInwoners = gemeenten.reduce((s, g) => s + g.inwoners, 0);
const gemiddeldInkomen = Math.round(
  gemeenten.filter(g => g.mediaalInkomen > 0).reduce((s, g) => s + g.mediaalInkomen, 0) /
  gemeenten.filter(g => g.mediaalInkomen > 0).length
);
const gemiddeldeHuisprijs = Math.round(
  gemeenten.filter(g => g.gemiddeldeHuisprijs > 0).reduce((s, g) => s + g.gemiddeldeHuisprijs, 0) /
  gemeenten.filter(g => g.gemiddeldeHuisprijs > 0).length
);

const totaalLaadpalen = gemeenten.reduce((s, g) => s + g.laadpalen, 0);

const aggregates = {
  totaalInwoners,
  totaalGemeenten: gemeenten.length,
  gemiddeldInkomen,
  gemiddeldeHuisprijs,
  totaalLaadpalen,
  bevolkingsTrend: vlaamsTotaal,
  dataStatus: {
    bevolking: { bron: "Statbel", jaar: 2025, beschikbaar: true },
    inkomen: { bron: "Statbel Fiscale Statistiek", jaar: incomeByNIS.values().next().value?.year || 0, beschikbaar: true },
    vastgoed: { bron: "Statbel Vastgoedprijzen", jaar: 2024, beschikbaar: true },
    laadpalen: { bron: "Dept. MOW (WFS)", jaar: 2025, beschikbaar: true },
    onderwijs: { bron: "Dataloep (Dept. Onderwijs)", jaar: "2023-2024", beschikbaar: true },
    criminaliteit: { bron: "Federale Politie", beschikbaar: false, reden: "Alleen PDF rapporten beschikbaar" },
    oppervlakte: { bron: "Statbel Kadaster (bodembezetting)", jaar: 2025, beschikbaar: true },
    groeneRuimte: { bron: "Gemeente-Stadsmonitor", beschikbaar: false, reden: "Handmatige Excel download nodig" },
    werkloosheid: { bron: "VDAB Arvastat", beschikbaar: false, reden: "Interactieve tool, geen directe CSV API" },
    stadsmonitorSurvey: { bron: "Gemeente-Stadsmonitor Burgerbevraging", jaar: 2023, beschikbaar: true },
  },
};

writeFileSync(
  resolve(OUT, "aggregates.json"),
  JSON.stringify(aggregates, null, 2)
);

console.log(`\n✅ Done! Processed ${gemeenten.length} Flemish municipalities`);
console.log(`   Population: ${totaalInwoners.toLocaleString()} total (2025)`);
console.log(`   Average income: €${gemiddeldInkomen.toLocaleString()}`);
console.log(`   Average house price: €${gemiddeldeHuisprijs.toLocaleString()}`);
console.log(`   Total laadpalen: ${totaalLaadpalen.toLocaleString()}`);
console.log(`   With income data: ${gemeenten.filter(g => g.mediaalInkomen > 0).length}`);
console.log(`   With house prices: ${gemeenten.filter(g => g.gemiddeldeHuisprijs > 0).length}`);
console.log(`   With laadpalen: ${gemeenten.filter(g => g.laadpalen > 0).length}`);
console.log(`   With onderwijs: ${gemeenten.filter(g => g.leerlingen > 0).length}`);
console.log(`   With oppervlakte: ${gemeenten.filter(g => g.oppervlakte > 0).length}`);
console.log(`   With survey data: ${gemeenten.filter(g => g.graagWonen > 0).length}`);
console.log(`\n📁 Output: src/data/gemeenten-real.json, src/data/aggregates.json`);
