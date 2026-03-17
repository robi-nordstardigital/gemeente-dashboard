"use client";

const INTEGRATED_DATASETS = [
  {
    naam: "Statbel — Bevolking per gemeente",
    status: "live" as const,
    beschrijving:
      "Officieel inwonersaantal per gemeente op 1 januari van elk jaar (2015–2025). Bevat mannen, vrouwen en totaal per NIS-code. De bron is het Rijksregister via Statbel.",
    url: "https://statbel.fgov.be/nl/themas/bevolking/structuur-van-de-bevolking",
    download:
      "https://statbel.fgov.be/nl/open-data/bevolking-naar-woonplaats-nationaliteit-burgerlijke-staat-leeftijd-en-geslacht-10",
    formaat: "Excel (XLSX)",
    uitgever: "Statbel (FOD Economie)",
    licentie: "CC BY 4.0",
    datumData: "1 januari 2025",
    bestandRaw: "bevolking.xlsx",
    indicatoren: [
      "Inwonersaantal (totaal, mannen, vrouwen)",
      "Bevolkingstrend 2015–2025",
      "Jaarlijkse groei (%)",
    ],
    verwerking: [
      "Excel bevat per jaar een apart werkblad. Elk werkblad is geparseerd en gefilterd op Vlaamse NIS-codes (prefix 1, 2, 3, 4, 7).",
      "Aggregaatcodes (eindigend op 000 — provincies, arrondissementen) zijn uitgesloten.",
      "Bevolkingsgroei is berekend als procentueel verschil tussen twee opeenvolgende jaren.",
      "285 Vlaamse gemeenten succesvol geëxtraheerd.",
    ],
  },
  {
    naam: "Statbel — Fiscale Statistiek van de Inkomens",
    status: "live" as const,
    beschrijving:
      "Belastbare inkomens per gemeente op basis van fiscale aangiften. Beschikbaar van 2005 t.e.m. 2023. Bevat totaal netto belastbaar inkomen, aantal aangiften (met en zonder inkomen), en totaal belastingen.",
    url: "https://statbel.fgov.be/nl/themas/huishoudens/fiscale-inkomens",
    download:
      "https://statbel.fgov.be/nl/open-data/fiscale-statistiek-van-de-inkomens",
    formaat: "Excel (XLSX)",
    uitgever: "Statbel (FOD Economie)",
    licentie: "CC BY 4.0",
    datumData: "Inkomstenjaar 2023",
    bestandRaw: "fiscaal_inkomen.xlsx",
    indicatoren: [
      "Gemiddeld netto belastbaar inkomen per aangifte",
      "Inkomenstrend 2015–2023",
    ],
    verwerking: [
      "Per gemeente wordt het meest recente jaar geselecteerd (2023 voor de meeste gemeenten).",
      "Gemiddeld inkomen = totaal netto belastbaar inkomen / (aangiften met inkomen + aangiften zonder inkomen).",
      "Alleen Vlaamse gemeenten op basis van NIS-code filtering.",
      "Inkomensdata beschikbaar voor 280+ gemeenten.",
    ],
  },
  {
    naam: "Statbel — Vastgoedprijzen per gemeente",
    status: "live" as const,
    beschrijving:
      "Mediaanprijzen van vastgoedverkopen per gemeente, per kwartaal (Q1–Q4) van 2010 t.e.m. Q3 2025. Bevat alle woningtypes: gesloten/halfopen, open bebouwing en appartementen. Bron: akten geregistreerd bij FOD Financiën.",
    url: "https://statbel.fgov.be/nl/themas/bouwen-wonen/vastgoedprijzen",
    download:
      "https://statbel.fgov.be/sites/default/files/files/documents/Bouwen%20%26%20wonen/2.1%20Vastgoedprijzen/NM/FR_immo_statbel_trimestre_par_commune.xlsx",
    formaat: "Excel (XLSX) — 4 MB",
    uitgever: "Statbel (FOD Economie)",
    licentie: "CC BY 4.0",
    datumData: "2024 (volledig jaar Q1–Q4)",
    bestandRaw: "vastgoedprijzen_gemeente_2010_2025.xlsx",
    indicatoren: [
      "Mediaanprijs alle woningtypes",
      "Trend 2010–2025 per gemeente",
      "Per kwartaal beschikbaar",
    ],
    verwerking: [
      "XLSX gedownload van Statbel open data — bevat kwartaaldata per gemeente voor alle woningtypes (2010–Q3 2025).",
      "Gefilterd op Vlaamse gemeenten (NIS-prefix 1, 2, 3, 4, 7).",
      "Per gemeente wordt het gemiddelde van de kwartaalmedianen van 2024 gebruikt als huidige prijs. Fallback naar 2023 als 2024 ontbreekt.",
      "Trenddata: per jaar het gemiddelde van beschikbare kwartaalmedianen.",
      "Vastgoeddata beschikbaar voor 265 van 285 gemeenten.",
    ],
  },
  {
    naam: "Laadpalen Vlaanderen — WFS (Dept. MOW)",
    status: "live" as const,
    beschrijving:
      "Alle 80.000 publiek en semi-publiek toegankelijke laadpunten voor elektrische voertuigen in Vlaanderen. Bevat uitbater, vermogen (kW), connector type, snelheid, toegankelijkheid en GPS-coördinaten per laadpunt.",
    url: "https://metadata.vlaanderen.be/srv/api/records/d46516ca-c159-41bc-9c54-aa256c337228",
    download:
      "https://geoserver.gis.cloud.mow.vlaanderen.be/geoserver/beleid/wfs?SERVICE=WFS&version=2.0.0&request=GetFeature&typeName=laadpunten_public&outputFormat=csv&count=100000",
    formaat: "WFS → CSV (GeoServer API)",
    uitgever: "Departement Mobiliteit en Openbare Werken",
    licentie: "Open data",
    datumData: "Live data (maandelijks geüpdatet)",
    bestandRaw: "laadpunten_all.csv",
    indicatoren: [
      "Laadpunten per gemeente (80.000 totaal)",
      "Laadpalen per 1000 inwoners",
      "Publiek vs. semi-publiek",
      "Vermogen (kW) & snelheid",
    ],
    verwerking: [
      "Data opgehaald via WFS GetFeature API van de GeoServer van Dept. MOW — geen handmatige FME download nodig.",
      "80.000 laadpunten gedownload in pagina's van 20.000 records (API limiet).",
      "Geaggregeerd per gemeentenaam: totaal, publiek, semi-publiek, snelladers (≥50 kW).",
      "Laadpalen per 1000 inwoners berekend op basis van Statbel bevolkingsdata 2025.",
      "Laadpunten beschikbaar voor alle 285 Vlaamse gemeenten.",
    ],
  },
  {
    naam: "Dataloep Onderwijs — Mobiliteit & Aantrekking",
    status: "live" as const,
    beschrijving:
      "Leerlingeninschrijvingen per woonplaats-gemeente voor basis- en secundair onderwijs in Vlaanderen. Schooljaar 2023–2024, teldatum 1 oktober. Bevat hoofdstructuur, instelling, scholengemeenschap en woonplaats NIS-code.",
    url: "https://onderwijs.vlaanderen.be/nl/onderwijsstatistieken/dataloep-aan-de-slag-met-cijfers-over-onderwijs/download-je-dataset-uit-dataloep",
    download:
      "https://opendata.dataplatform-onderwijs.vlaanderen.be/dataloep/mobiliteit-aantrekking-dataset-2023-2024-1okt.csv",
    formaat: "CSV (direct download)",
    uitgever: "Vlaams Ministerie van Onderwijs en Vorming",
    licentie: "Open data",
    datumData: "Schooljaar 2023–2024 (1 oktober)",
    bestandRaw: "onderwijs_mobiliteit.csv",
    indicatoren: [
      "Leerlingen per woonplaats-gemeente",
      "Onderwijs-ratio (leerlingen/inwoners)",
    ],
    verwerking: [
      "CSV bevat 102.000 rijen met individuele school-woonplaats combinaties.",
      "Geaggregeerd per woonplaats NIS-code: totaal aantal inschrijvingen per gemeente.",
      "Gefilterd op Vlaamse gemeenten via NIS-code prefix (1, 2, 3, 4, 7).",
      "Onderwijs-score berekend als percentiel-ranking van leerlingen/inwoners ratio.",
      "Onderwijsdata beschikbaar voor alle 285 gemeenten.",
    ],
  },
  {
    naam: "Statbel Kadaster — Bodembezetting (oppervlakte)",
    status: "live" as const,
    beschrijving:
      "Kadastrale oppervlakte per gemeente in hectaren, afkomstig van het kadasterregister. Bevat belastbare en niet-belastbare oppervlakte per perceeltype. Dataset omvat alle 581 Belgische gemeenten.",
    url: "https://statbel.fgov.be/nl/themas/leefmilieu/grond/bodemgebruik",
    download:
      "https://statbel.fgov.be/sites/default/files/files/opendata/Bodembezetting%20volgens%20het%20Kadasterregister/TF_EAE_LAND_OCCUPTN_sqlite.zip",
    formaat: "SQLite database (ZIP)",
    uitgever: "Statbel (FOD Economie)",
    licentie: "CC BY 4.0",
    datumData: "2025",
    bestandRaw: "oppervlakte_gemeente.csv (geëxtraheerd uit SQLite)",
    indicatoren: [
      "Oppervlakte per gemeente (km²)",
      "Bevolkingsdichtheid (inw/km²)",
    ],
    verwerking: [
      "SQLite database gedownload van Statbel open data (bodembezetting kadaster).",
      "Totale oppervlakte per gemeente berekend als SUM(MS_TOT_SUR) over alle perceeltypes, gedeeld door 100 voor conversie van hectare naar km².",
      "Gefilterd op jaar 2025 (meest recente data).",
      "Bevolkingsdichtheid berekend als inwoners / oppervlakte.",
      "Oppervlaktedata beschikbaar voor alle 285 Vlaamse gemeenten.",
    ],
  },
  {
    naam: "Gemeente-Stadsmonitor — Burgerbevraging",
    status: "live" as const,
    beschrijving:
      "Enquêteresultaten van de Gemeente-Stadsmonitor burgerbevraging over leefbaarheid, netheid, groen, tevredenheid en vertrouwen in het gemeentebestuur. Survey-data uit 2023 voor alle Vlaamse gemeenten.",
    url: "https://gemeente-stadsmonitor.vlaanderen.be",
    download:
      "https://gemeente-stadsmonitor.vlaanderen.be/download-alle-cijfers",
    formaat: "Excel (XLSX) per thema",
    uitgever: "Agentschap Binnenlands Bestuur & Statistiek Vlaanderen",
    licentie: "Open data",
    datumData: "2023 (burgerbevraging)",
    bestandRaw: "stadsmonitor_survey_wonen.xlsx, stadsmonitor_survey_lokaal_bestuur.xlsx",
    indicatoren: [
      "Netheid van het centrum (%)",
      "Netheid van straten en voetpaden (%)",
      "Voldoende groen in de buurt (%)",
      "Tevredenheid over de gemeente (%)",
      "Graag wonen in de gemeente (%)",
      "Vertrouwen in gemeentebestuur (%)",
    ],
    verwerking: [
      "XLSX bestanden gedownload van de Gemeente-Stadsmonitor downloadpagina (thema Wonen & woonomgeving + Lokaal bestuur).",
      "Per indicator (WO_S_12, WO_S_13, WO_S_33, WO_S_15, WO_S_16, LO_S_13) de meest recente enquêtewaarde per gemeente geselecteerd.",
      "Positieve respons (Eens% of Veel%) als kernwaarde gebruikt.",
      "Leefbaarheidsscore berekend als gemiddelde van alle 6 survey-indicatoren.",
      "Milieu-score gebaseerd op groen in de buurt, veiligheid-score op netheid.",
      "Survey-data beschikbaar voor 272 van 285 Vlaamse gemeenten.",
    ],
  },
];

const PLANNED_DATASETS = [
  {
    naam: "VDAB Arvastat — Werkloosheid",
    beschrijving:
      "Werkzoekendencijfers per gemeente, maandelijks geactualiseerd. Beschikbaar tot op wijkniveau.",
    url: "https://arvastat.vdab.be/",
    formaat: "Interactieve tool (Excel export)",
    uitgever: "VDAB Studiedienst",
    reden: "Interactieve tool, geen directe CSV/API — handmatige export vereist",
    indicatoren: [
      "Werkloosheidsgraad per gemeente",
      "Werkzoekenden naar profiel",
      "Vacatures",
    ],
  },
  {
    naam: "Politie Criminaliteitsstatistieken",
    beschrijving:
      "Geregistreerde criminaliteitscijfers per politiezone en gemeente.",
    url: "https://www.politie.be/statistieken/nl/criminaliteit",
    formaat: "PDF, interactieve kaarten",
    uitgever: "Federale Politie",
    reden: "Alleen PDF-rapporten beschikbaar, geen CSV/API",
    indicatoren: [
      "Criminaliteitsgraad per 1000 inwoners",
      "Autodiefstal",
      "Inbraak",
    ],
  },
  {
    naam: "SPARQL Endpoint Vlaanderen",
    beschrijving:
      "Linked data endpoint voor het bevragen van adressen, gemeenten en administratieve indelingen.",
    url: "https://data.vlaanderen.be/sparql",
    formaat: "SPARQL / JSON-LD",
    uitgever: "Digitaal Vlaanderen",
    reden: "Kan gebruikt worden voor actuele NIS-codes en grenzen",
    indicatoren: [
      "Gemeente-indelingen",
      "NIS-codes",
      "Administratieve grenzen",
    ],
  },
];

const KNOWN_LIMITATIONS = [
  {
    indicator: "Bevolkingsdichtheid",
    status: "afgeleid",
    uitleg:
      "Berekend als inwoners (Statbel 2025) / oppervlakte (Statbel Kadaster 2025). Beide bronwaarden zijn echt — de dichtheid is dus correct.",
  },
  {
    indicator: "Thema-scores",
    status: "gedeeltelijk",
    uitleg:
      "Scores voor economie, wonen, demografie, mobiliteit (laadpalen), onderwijs (leerlingen), leefbaarheid, milieu (groen) en veiligheid (netheid) zijn berekend op basis van echte data. Leefbaarheid, milieu en veiligheid komen uit de Stadsmonitor burgerbevraging 2023. Alleen de zorg-score staat standaard op 50 (neutrale waarde).",
  },
  {
    indicator: "Vastgoedprijzen",
    status: "actueel",
    uitleg:
      "Geüpdatet naar 2024 data (Q1–Q4). Mediaanprijs per gemeente is het gemiddelde van de 4 kwartaalmedianen. 265 van 285 gemeenten hebben huisprijsdata.",
  },
];

function StatusBadge({ status }: { status: "live" | "planned" }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Geïntegreerd
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Gepland
    </span>
  );
}

export default function DatasetsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Datasets & Bronnen</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Alle databronnen, verwerkingsstappen en bekende beperkingen van dit
          dashboard — volledig transparant
        </p>
      </div>

      {/* Data overview banner */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-emerald-400">
              Echte open data geïntegreerd
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Dit dashboard gebruikt{" "}
              <strong className="text-foreground">
                6 echte publieke datasets
              </strong>{" "}
              van Statbel, Dept. MOW en Dept. Onderwijs voor bevolking, inkomen,
              vastgoedprijzen, oppervlakte, laadpalen en onderwijs. Alle data is vrij
              beschikbaar. Hieronder vind je per dataset de exacte bron,
              verwerking en eventuele beperkingen.
            </p>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[
          { label: "Gemeenten", waarde: "285", sub: "Vlaams Gewest" },
          { label: "Bevolking", waarde: "2025", sub: "Statbel" },
          { label: "Inkomen", waarde: "2023", sub: "Statbel Fiscaal" },
          { label: "Vastgoed", waarde: "2024", sub: "Statbel Immo" },
          { label: "Laadpalen", waarde: "80K", sub: "Dept. MOW" },
          { label: "Oppervlakte", waarde: "2025", sub: "Kadaster" },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-strong rounded-xl p-3 text-center"
          >
            <p className="text-[11px] uppercase tracking-wider text-muted">
              {s.label}
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">{s.waarde}</p>
            <p className="text-[10px] text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── INTEGRATED DATASETS ── */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <svg
            className="h-5 w-5 text-emerald-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
            />
          </svg>
          Geïntegreerde datasets
        </h2>

        <div className="space-y-4">
          {INTEGRATED_DATASETS.map((ds) => (
            <div key={ds.naam} className="glass-strong rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[15px] font-semibold text-foreground">
                      {ds.naam}
                    </h3>
                    <StatusBadge status={ds.status} />
                    <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-light">
                      {ds.formaat}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    {ds.beschrijving}
                  </p>

                  {/* Meta */}
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-muted">
                    <span>
                      <strong className="text-foreground/70">Uitgever:</strong>{" "}
                      {ds.uitgever}
                    </span>
                    <span>
                      <strong className="text-foreground/70">Peildatum:</strong>{" "}
                      {ds.datumData}
                    </span>
                    <span>
                      <strong className="text-foreground/70">Licentie:</strong>{" "}
                      {ds.licentie}
                    </span>
                    <span>
                      <strong className="text-foreground/70">Bestand:</strong>{" "}
                      <code className="rounded bg-glass px-1 text-accent-light">
                        data/raw/{ds.bestandRaw}
                      </code>
                    </span>
                  </div>

                  {/* Indicators */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {ds.indicatoren.map((ind) => (
                      <span
                        key={ind}
                        className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[11px] text-emerald-300/80"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>

                  {/* Processing steps */}
                  <div className="mt-4 rounded-lg border border-glass-border bg-glass/50 p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
                      Verwerking & aanpassingen
                    </p>
                    <ul className="space-y-1.5">
                      {ds.verwerking.map((step, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-[12px] leading-relaxed text-muted"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/50" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Links */}
                <div className="flex shrink-0 flex-col gap-2">
                  <a
                    href={ds.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-glass px-3 py-1.5 text-[12px] font-medium text-foreground transition-all hover:border-accent/30 hover:text-accent-light"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                    Bron
                  </a>
                  <a
                    href={ds.download}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-[12px] font-medium text-emerald-400 transition-all hover:bg-emerald-500/25"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DATA PIPELINE ── */}
      <div className="glass-strong rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <svg
            className="h-4 w-4 text-accent-light"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
            />
          </svg>
          Data pipeline
        </h2>
        <p className="mt-2 text-[13px] text-muted">
          Alle ruwe bestanden staan in{" "}
          <code className="rounded bg-glass px-1.5 py-0.5 text-accent-light">
            data/raw/
          </code>
          . Het verwerkingsscript{" "}
          <code className="rounded bg-glass px-1.5 py-0.5 text-accent-light">
            scripts/process-data.mjs
          </code>{" "}
          combineert alles tot JSON:
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]">
          {[
            {
              label: "bevolking.xlsx",
              color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
            },
            {
              label: "fiscaal_inkomen.xlsx",
              color:
                "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
            },
            {
              label: "vastgoedprijzen_...2025.xlsx",
              color: "bg-amber-500/15 text-amber-400 border-amber-500/20",
            },
            {
              label: "laadpunten_all.csv",
              color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
            },
            {
              label: "onderwijs_mobiliteit.csv",
              color: "bg-pink-500/15 text-pink-400 border-pink-500/20",
            },
            {
              label: "oppervlakte_gemeente.csv",
              color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
            },
            { label: "\u2192", color: "text-muted" },
            {
              label: "process-data.mjs",
              color:
                "bg-purple-500/15 text-purple-400 border-purple-500/20",
            },
            { label: "\u2192", color: "text-muted" },
            {
              label: "gemeenten-real.json",
              color: "bg-accent/15 text-accent-light border-accent/20",
            },
          ].map((step, i) =>
            step.label === "\u2192" ? (
              <span key={i} className={step.color}>
                {step.label}
              </span>
            ) : (
              <span
                key={i}
                className={`rounded-md border px-2 py-1 font-mono ${step.color}`}
              >
                {step.label}
              </span>
            )
          )}
        </div>
        <div className="mt-4 space-y-1.5 text-[12px] text-muted">
          <p>
            <strong className="text-foreground/70">Merge-sleutel:</strong>{" "}
            NIS-code (5-cijferige gemeentecode, bv. 11001 = Antwerpen)
          </p>
          <p>
            <strong className="text-foreground/70">Filter:</strong> Alleen
            Vlaamse gemeenten (NIS-prefix 1, 2, 3, 4, 7). Aggregaatcodes
            (provincies, arrondissementen) worden uitgesloten.
          </p>
          <p>
            <strong className="text-foreground/70">Output:</strong>{" "}
            <code className="rounded bg-glass px-1 text-accent-light">
              src/data/gemeenten-real.json
            </code>{" "}
            (285 gemeenten) +{" "}
            <code className="rounded bg-glass px-1 text-accent-light">
              src/data/aggregates.json
            </code>{" "}
            (totalen & trends)
          </p>
        </div>
      </div>

      {/* ── KNOWN LIMITATIONS ── */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <svg
            className="h-5 w-5 text-amber-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          Bekende beperkingen & schattingen
        </h2>
        <div className="space-y-3">
          {KNOWN_LIMITATIONS.map((lim) => (
            <div
              key={lim.indicator}
              className="flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4"
            >
              <span
                className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  lim.status === "schatting"
                    ? "bg-amber-500/15 text-amber-400"
                    : lim.status === "afgeleid"
                      ? "bg-orange-500/15 text-orange-400"
                      : lim.status === "verouderd"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-blue-500/15 text-blue-400"
                }`}
              >
                {lim.status}
              </span>
              <div>
                <p className="text-[13px] font-medium text-foreground">
                  {lim.indicator}
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                  {lim.uitleg}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PLANNED DATASETS ── */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <svg
            className="h-5 w-5 text-amber-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Geplande datasets
        </h2>
        <p className="mb-4 text-[13px] text-muted">
          Deze bronnen zijn geïdentificeerd maar nog niet geïntegreerd.
          Ze bevatten waardevolle indicatoren die het dashboard verder kunnen
          verrijken.
        </p>

        <div className="space-y-3">
          {PLANNED_DATASETS.map((ds) => (
            <div key={ds.naam} className="glass-strong rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[14px] font-semibold text-foreground">
                      {ds.naam}
                    </h3>
                    <StatusBadge status="planned" />
                    <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-light">
                      {ds.formaat}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                    {ds.beschrijving}
                  </p>

                  {/* Why not integrated */}
                  <p className="mt-2 text-[11px] text-amber-400/80">
                    <strong>Reden:</strong> {ds.reden}
                  </p>

                  {/* Indicators */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ds.indicatoren.map((ind) => (
                      <span
                        key={ind}
                        className="rounded-md border border-glass-border bg-glass px-2 py-0.5 text-[11px] text-muted"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={ds.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-glass-border bg-glass px-3 py-1.5 text-[12px] font-medium text-foreground transition-all hover:border-accent/30 hover:text-accent-light"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                  Bron
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="rounded-xl border border-glass-border bg-glass/30 p-4 text-center">
        <p className="text-[12px] text-muted">
          Alle datasets zijn publiek beschikbaar en vrij te gebruiken. Statbel
          data valt onder de{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/deed.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-light underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
          >
            CC BY 4.0
          </a>{" "}
          licentie. Bronvermelding: Statbel (FOD Economie).
        </p>
      </div>
    </div>
  );
}
