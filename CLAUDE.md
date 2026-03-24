# Gemeente Dashboard - Project Notes

## Deployment
- **Hosting**: Railway (auto-deploy from main)
- **URL**: https://gemeente-dashboard-production.up.railway.app
- **Repo**: https://github.com/robi-nordstardigital/gemeente-dashboard.git
- **Branch**: `main`
- **Dev port**: 4002
- **Deploy**: `railway up` or push to main (after GitHub deploy hook setup)

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts (radar, bar charts)
- **Maps**: Leaflet + react-leaflet (Flanders GeoJSON)
- **Icons**: Phosphor Icons (`@phosphor-icons/react`)
- **Data parsing**: `xlsx` (SheetJS) for Excel files
- **Package manager**: npm

## Dev Server
- Run via `.claude/launch.json` config (`gemeente-dashboard` on port 3001)

## Architecture

### Data Pipeline
All data flows through one script: `scripts/process-data.mjs`
1. Reads raw data files from `data/raw/` (XLSX, CSV)
2. Filters on Flemish municipalities (NIS prefix 1,2,3,4,7; excludes aggregate codes ending in 000)
3. Merges all sources by NIS code
4. Computes **percentile-based** theme scores (50 = mediaan, d.w.z. 50% scoort lager)
5. Outputs: `src/data/gemeenten-real.json` (285 records) + `src/data/aggregates.json`

Run with: `node scripts/process-data.mjs`

### Key Files
- `scripts/process-data.mjs` — ETL script, single source of truth for data processing
- `src/data/gemeenten-real.json` — Pre-processed data for all 285 municipalities (generated, do not edit)
- `src/data/aggregates.json` — Flemish-wide aggregates and data availability status (generated)
- `src/data/gemeenten.ts` — TypeScript wrapper that imports the JSON + provides accessor functions
- `src/lib/types.ts` — Gemeente interface, ThemaScores, Indicator type, labels, tooltips, colors
- `src/lib/utils.ts` — Formatting, ranking, slugification utilities

### Pages
| Route | Description |
|-------|------------|
| `/` | Homepage with KPI cards, top 10 list, province breakdown |
| `/rankings` | All 285 gemeenten sortable table (incl. Leefbaarheid ranking) |
| `/gemeente/[slug]` | Detail page: radar chart, survey indicator bars (min/gem/max range), Vlaams comparison |
| `/vergelijk` | Compare up to 4 gemeenten side-by-side (radar + bar) |
| `/trends` | Population trends, scatter plots, province averages |
| `/datasets` | Documentation of all data sources, pipeline, limitations |

## Integrated Data Sources

### Core Statistics
| Dataset | Source | File in `data/raw/` | Year | Coverage |
|---------|--------|---------------------|------|----------|
| Bevolking | Statbel | `bevolking.xlsx` | 2015-2025 | 285 gem. |
| Fiscaal Inkomen | Statbel | `fiscaal_inkomen.xlsx` | 2005-2023 | 271 gem. |
| Vastgoedprijzen | Statbel | `vastgoedprijzen_gemeente.csv` | 2010-2024 | 265 gem. |
| Laadpalen | Dept. MOW WFS | `laadpunten_all.csv` | Live (monthly) | 285 gem. |
| Onderwijs | Dataloep | `onderwijs_mobiliteit.csv` | 2023-2024 | 285 gem. |
| Oppervlakte | Statbel Kadaster | `oppervlakte_gemeente.csv` | 2025 | 285 gem. |

### Stadsmonitor Register Data
| File | Indicator | ID |
|------|-----------|-----|
| `stadsmonitor_register_demografie.xlsx` | Vergrijzingsgraad | DE_05 |
| `stadsmonitor_register_werk.xlsx` | Werkzoekendengraad | WE_36 |
| `stadsmonitor_register_ruimte.xlsx` | Groene ruimte / landgebruik | RU_05 |
| `stadsmonitor_register_samenleven.xlsx` | Criminaliteitsgraad | SA_01 |
| `stadsmonitor_register_armoede.xlsx` | Kansarmoede-index (AR_03), OKI (AR_05) | AR_03, AR_05 |

### Stadsmonitor Survey Data (Burgerbevraging 2023)
| ID | File | Indicator | Positive column |
|----|------|-----------|-----------------|
| WO_S_12 | `stadsmonitor_survey_wonen.xlsx` | Netheid van het centrum | Eens (%) |
| WO_S_13 | `stadsmonitor_survey_wonen.xlsx` | Netheid straten en voetpaden | Eens (%) |
| WO_S_33 | `stadsmonitor_survey_wonen.xlsx` | Voldoende groen in de buurt | Eens (%) |
| WO_S_15 | `stadsmonitor_survey_wonen.xlsx` | Tevredenheid over de gemeente | Eens (%) |
| WO_S_16 | `stadsmonitor_survey_wonen.xlsx` | Graag wonen in de gemeente | Eens (%) |
| LO_S_13 | `stadsmonitor_survey_lokaal_bestuur.xlsx` | Vertrouwen in gemeentebestuur | Veel (%) |
| MO_S_06 | `stadsmonitor_survey_mobiliteit.xlsx` | Veilig fietsen | Eens (%) |
| ZO_S_06 | `stadsmonitor_survey_zorg.xlsx` | Tevredenheid gezondheidsvoorzieningen | Eens (%) |

Download bron: https://gemeente-stadsmonitor.vlaanderen.be/download-alle-cijfers

## Theme Scores (Radar Chart)

All scores are **percentile-based** (0-100). Score 50 = mediaan (50% van gemeenten scoort lager). Economie is NIET opgenomen in de radar chart (te weinig spreiding).

| Theme | Label in UI | Data source | Method | Inverse? |
|-------|------------|-------------|--------|----------|
| demografie | Bev.groei | Statbel bevolkingsgroei % | Percentile | Nee |
| werk | Werk | Stadsmonitor WE_36 werkzoekendengraad | Percentile | Ja (lager = beter) |
| mobiliteit | Mobiliteit | MOW laadpalen/1000 inw. | Percentile | Nee |
| fietsveiligheid | Fietsveiligheid | Stadsmonitor MO_S_06 veilig fietsen | Percentile | Nee |
| onderwijs | Onderwijs | Stadsmonitor AR_05 OKI | Percentile | Ja (lager = beter) |
| wonen | Wonen | Statbel huisprijzen | Percentile | Ja (lager = beter) |
| veiligheid | Veiligheid | Stadsmonitor SA_01 criminaliteitsgraad | Percentile | Ja (lager = beter) |
| zorg | Zorg | Stadsmonitor ZO_S_06 tevredenheid zorg | Percentile | Nee |
| bestuur | Bestuur | Stadsmonitor LO_S_13 vertrouwen bestuur | Percentile | Nee |
| armoede | Armoede | Stadsmonitor AR_03 kansarmoede-index | Percentile | Ja (lager = beter) |
| leefbaarheid | Leefbaarheid | Gemiddelde van 6 survey-indicatoren | Percentile | Nee |

**Leefbaarheidsranking**: Op de homepage en rankings-pagina wordt de globale leefbaarheidsscore gebruikt als "meest leefbare gemeente" ranking. Berekend als gemiddelde percentiel van alle 6 survey-indicatoren.

**Tooltips**: Elk thema heeft een tooltip (`THEMA_TOOLTIPS` in `types.ts`) die uitlegt hoe de score is berekend. Transparantie is belangrijk.

## Survey Indicator Bars (Detail Page)

Op de gemeente-detailpagina worden de 8 survey-indicatoren getoond als horizontale bars met:
- **Min** (laagste score van alle gemeenten) en **Max** (hoogste) als range-grenzen
- **Gemiddelde** (Vlaams gemiddelde) als referentielijn
- **Gemeente score** als marker op de bar
- **Kleur**: groen als boven gemiddelde, rood als eronder
- **Ranking**: bijv. "#45 van 272"
- **% boven/onder gemiddelde**: bijv. "+4.2% boven gemiddelde"

## UI Design
- Apple-style glassmorphism, dark theme
- Smooth, subtle animations (geen loading bars/spinners)
- Compact en modern layout
- Phosphor Icons (light variant, inline SVG)

## Data Gotchas & Known Issues
- **`data/raw/` is gitignored** — raw data files are not committed. Re-download from Stadsmonitor/Statbel if needed
- **NIS codes**: 5-digit, first digit = province. Codes ending in `000` are aggregates (province/arrondissement) — always exclude
- **Laadpalen matching**: Done by gemeente NAME (not NIS), since MOW WFS uses names. Watch for spelling differences
- **Survey data**: 272 van 285 gemeenten hebben survey data. Missing = 0, leefbaarheid fallback = 50
- **Inverse percentiles**: Werk, onderwijs (OKI), wonen (huisprijzen), veiligheid (criminaliteit), armoede gebruiken inverse ranking: lager = beter = hogere score
- **Vastgoedprijzen**: Annual average of quarterly medians. 265/285 gemeenten; rest falls back to 2023
- **Onderwijs CSV**: Quoted fields with commas — parsed via regex, not simple split
- **Population 2025**: Uses Statbel preliminary data (may be revised)
- **Gemeentefusies**: NIS codes changed for some municipalities after 2019 fusions. Current data uses post-fusion codes
- **Economie score**: Mediaan inkomen heeft te weinig spreiding waardoor scores weinig zeggen. Daarom niet in radar chart

## Not Yet Integrated
- **VDAB Werkloosheid**: Interactive tool (Arvastat), no direct CSV API
- **Meer Stadsmonitor indicatoren**: 442 beschikbaar, 8 survey + 5 register nu gebruikt
- **GeoJSON detail**: Huidige Flanders GeoJSON is basic, geen gemeente-grenzen
