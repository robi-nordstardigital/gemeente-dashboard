# Gemeente Dashboard - Project Notes

## Deployment
- **Hosting**: GitHub Pages (static export) — currently dev only
- **Repo**: https://github.com/robi-nordstardigital/gemeente-dashboard.git
- **Branch**: `main`
- **Dev port**: 3001

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts (radar, bar charts)
- **Maps**: Leaflet + react-leaflet
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
4. Computes percentile-based theme scores
5. Outputs: `src/data/gemeenten-real.json` (285 records) + `src/data/aggregates.json`

Run with: `node scripts/process-data.mjs`

### Key Files
- `scripts/process-data.mjs` — ETL script, single source of truth for data processing
- `src/data/gemeenten-real.json` — Pre-processed data for all 285 municipalities (generated, do not edit)
- `src/data/aggregates.json` — Flemish-wide aggregates and data availability status (generated)
- `src/data/gemeenten.ts` — TypeScript wrapper that imports the JSON + provides accessor functions
- `src/lib/types.ts` — Gemeente interface, ThemaScores, Indicator type, labels, colors
- `src/lib/utils.ts` — Formatting, ranking, slugification utilities

### Pages
| Route | Description |
|-------|------------|
| `/` | Homepage with KPI cards, province breakdown |
| `/rankings` | All 285 gemeenten sortable table (incl. Leefbaarheid column) |
| `/gemeente/[slug]` | Detail page: radar chart, indicator rankings, survey bars, Vlaams comparison |
| `/vergelijk` | Compare up to 4 gemeenten side-by-side (radar + bar) |
| `/trends` | Population trends, scatter plots, province averages |
| `/datasets` | Documentation of all data sources, pipeline, limitations |

## Integrated Data Sources (7 live)

| Dataset | Source | File in `data/raw/` | Year | Coverage |
|---------|--------|---------------------|------|----------|
| Bevolking | Statbel | `bevolking.xlsx` | 2015-2025 | 285 gem. |
| Fiscaal Inkomen | Statbel | `fiscaal_inkomen.xlsx` | 2005-2023 | 271 gem. |
| Vastgoedprijzen | Statbel | `vastgoedprijzen_gemeente.csv` | 2010-2024 | 265 gem. |
| Laadpalen | Dept. MOW WFS | `laadpunten_all.csv` | Live (monthly) | 285 gem. |
| Onderwijs | Dataloep | `onderwijs_mobiliteit.csv` | 2023-2024 | 285 gem. |
| Oppervlakte | Statbel Kadaster | `oppervlakte_gemeente.csv` | 2025 | 285 gem. |
| Stadsmonitor Survey | Burgerbevraging | `stadsmonitor_survey_wonen.xlsx` + `stadsmonitor_survey_lokaal_bestuur.xlsx` | 2023 | 272 gem. |

### Stadsmonitor Register Data (also integrated)
- `stadsmonitor_register_demografie.xlsx` → Vergrijzingsgraad (DE_05)
- `stadsmonitor_register_werk.xlsx` → Werkzoekendengraad (WE_36)
- `stadsmonitor_register_ruimte.xlsx` → Groene ruimte / landgebruik (RU_05)

### Stadsmonitor Survey Indicators (6 leefbaarheid-indicatoren)
| ID | Sheet | Indicator | Positive column |
|----|-------|-----------|-----------------|
| WO_S_12 | Wonen | Netheid van het centrum | Eens (%) |
| WO_S_13 | Wonen | Netheid straten en voetpaden | Eens (%) |
| WO_S_33 | Wonen | Voldoende groen in de buurt | Eens (%) |
| WO_S_15 | Wonen | Tevredenheid over de gemeente | Eens (%) |
| WO_S_16 | Wonen | Graag wonen in de gemeente | Eens (%) |
| LO_S_13 | Lokaal bestuur | Vertrouwen in gemeentebestuur | Veel (%) |

Download: https://gemeente-stadsmonitor.vlaanderen.be/download-alle-cijfers

## Theme Scores (0-100)

| Theme | Data source | Method |
|-------|------------|--------|
| Demografie | Statbel bevolkingsgroei | Percentile ranking |
| Economie | Statbel mediaan inkomen | Percentile ranking |
| Mobiliteit | MOW laadpalen/1000 inw. | Percentile ranking |
| Onderwijs | Dataloep leerlingen/inwoners | Percentile ranking |
| Wonen | Statbel huisprijzen (inverse) | Percentile ranking (lower = better) |
| Leefbaarheid | Stadsmonitor survey (6 indicators) | Direct average of % scores |
| Milieu | Stadsmonitor groen in buurt | Direct % from survey |
| Veiligheid | Stadsmonitor netheid (centrum + straten avg) | Direct % from survey |
| Zorg | — | Placeholder (50) |

## Data Gotchas & Known Issues
- **`data/raw/` is gitignored** — raw data files are not committed. Re-download from sources if needed
- **NIS codes**: 5-digit, first digit determines province. Codes ending in `000` are aggregate (province/arrondissement) — always exclude
- **Laadpalen matching**: Done by gemeente NAME (not NIS), since the WFS data uses names. Watch for spelling differences
- **Survey data**: Not all 285 gemeenten have survey data — 272 have it. Missing ones get 0, and leefbaarheid defaults to 50
- **Leefbaarheid score**: Simple average of 6 survey percentages (not percentile-based like other scores). Range is roughly 55-85
- **Vastgoedprijzen**: Uses annual average of quarterly medians. 265/285 gemeenten have data; rest falls back to 2023
- **Onderwijs CSV**: Quoted fields with commas — parsed via regex, not simple split
- **Population 2025**: Uses Statbel preliminary data (may be revised)
- **Gemeentefusies**: NIS codes changed for some municipalities after 2019 fusions. Current data uses post-fusion codes

## Not Yet Integrated
- **Criminaliteit**: Federale Politie publishes PDF only, no CSV/API
- **Zorg**: No suitable open data source found yet
- **VDAB Werkloosheid**: Interactive tool (Arvastat), no direct CSV API
