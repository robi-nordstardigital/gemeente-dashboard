"use client";

const DATASETS = [
  {
    naam: "Gemeente-Stadsmonitor",
    beschrijving:
      "Hoofdbron met 300+ indicatoren over alle Vlaamse gemeenten. Bevat 13 thema's: demografie, economie, klimaat & milieu, lokaal bestuur, mobiliteit, onderwijs, ruimte, samenleven, werk, wonen, zorg, cultuur en armoede. Per indicator downloadbaar als Excel.",
    url: "https://gemeente-stadsmonitor.vlaanderen.be",
    download: "https://gemeente-stadsmonitor.vlaanderen.be/download-alle-cijfers",
    formaat: "Excel (XLSX)",
    uitgever: "Agentschap Binnenlands Bestuur & Statistiek Vlaanderen",
    frequentie: "Jaarlijks (laatste editie: 2024)",
    licentie: "Open data",
    indicatoren: [
      "Inwonersaantal",
      "Bevolkingsgroei & prognoses",
      "Migratiesaldo",
      "Vergrijzingsgraad",
      "Werkloosheidsgraad",
      "Mediaan inkomen",
      "Groene ruimte (%)",
      "Huishoudgrootte",
    ],
  },
  {
    naam: "Statbel Open Data",
    beschrijving:
      "Het Belgisch federaal statistiekbureau biedt tientallen datasets aan op gemeenteniveau. Bevolkingscijfers, vastgoedprijzen, bouwvergunningen, verkeersongevallen en meer. Alle datasets onder CC BY 4.0.",
    url: "https://statbel.fgov.be/nl/open-data",
    formaat: "XLSX, TXT, SQLite, SHP, GeoJSON",
    uitgever: "Statbel (FOD Economie)",
    frequentie: "Variabel (maandelijks tot jaarlijks)",
    licentie: "CC BY 4.0",
    indicatoren: [
      "Bevolking per gemeente",
      "Gemiddelde vastgoedprijzen",
      "Bouwvergunningen",
      "Verkeersongevallen",
      "Geboorte & overlijden",
      "Huishoudsamenstelling",
    ],
  },
  {
    naam: "Laadpalen Vlaanderen (Dept. MOW)",
    beschrijving:
      "Locatie en kenmerken van alle publiek toegankelijke laadpunten voor elektrische voertuigen in Vlaanderen. Maandelijks geüpdatet. Bevat uitbater, vermogen, connectortype en coördinaten.",
    url: "https://metadata.vlaanderen.be/srv/api/records/d46516ca-c159-41bc-9c54-aa256c337228",
    formaat: "CSV, Shapefile, GML",
    uitgever: "Departement Mobiliteit en Openbare Werken",
    frequentie: "Maandelijks",
    licentie: "Open data",
    indicatoren: [
      "Aantal laadpunten per locatie",
      "Uitbater (operator)",
      "Vermogen (kW)",
      "Connector type",
      "Toegankelijkheid (publiek/semi-publiek)",
      "GPS-coördinaten",
    ],
  },
  {
    naam: "Politie Criminaliteitsstatistieken",
    beschrijving:
      "Geregistreerde criminaliteitscijfers per politiezone en gemeente. Beschikbaar als PDF-rapporten en dynamische kaarten voor specifieke misdrijftypes.",
    url: "https://www.politie.be/statistieken/nl/criminaliteit",
    formaat: "PDF, interactieve kaarten",
    uitgever: "Federale Politie",
    frequentie: "Jaarlijks",
    licentie: "Publiek",
    indicatoren: [
      "Criminaliteitsgraad per 1000 inwoners",
      "Autodiefstal",
      "Inbraak",
      "Intrafamiliaal geweld",
    ],
  },
  {
    naam: "Statistiek Vlaanderen — Gemeentemonitor",
    beschrijving:
      "Kerncijfers per gemeente op vlak van demografie, arbeidsmarkt, economie, energie, ruimtelijke ordening, welzijn en wonen. Aanvullend op de Gemeente-Stadsmonitor.",
    url: "https://www.statistiekvlaanderen.be",
    formaat: "Online tabellen, PDF",
    uitgever: "Statistiek Vlaanderen",
    frequentie: "Jaarlijks",
    licentie: "Open data",
    indicatoren: [
      "Werkgelegenheidsgraad",
      "Energieverbruik",
      "Ruimtebeslag",
      "Bevolkingsdichtheid",
    ],
  },
  {
    naam: "SPARQL Endpoint Vlaanderen",
    beschrijving:
      "Linked data endpoint voor het bevragen van adressen, gemeenten en administratieve indelingen via SPARQL queries.",
    url: "https://data.vlaanderen.be/sparql",
    formaat: "SPARQL / JSON-LD",
    uitgever: "Digitaal Vlaanderen",
    frequentie: "Continu",
    licentie: "Open data",
    indicatoren: [
      "Gemeente-indelingen",
      "NIS-codes",
      "Adresregisters",
      "Administratieve grenzen",
    ],
  },
];

export default function DatasetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Datasets</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Overzicht van de publieke databronnen die dit dashboard kan gebruiken
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-warning" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-warning">Demo-modus: synthetische data</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Dit dashboard gebruikt momenteel <strong className="text-foreground">gegenereerde mock data</strong> om
              de functionaliteit te demonstreren. De gemeentenamen en NIS-codes zijn echt,
              maar alle cijfers (inwoners, inkomen, laadpalen, etc.) zijn synthetisch gegenereerd
              met een seeded random algorithm. Hieronder staan de echte bronnen die
              ge&iuml;ntegreerd kunnen worden.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset cards */}
      <div className="space-y-4">
        {DATASETS.map((ds) => (
          <div key={ds.naam} className="glass-strong rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">{ds.naam}</h2>
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
                    <strong className="text-foreground/70">Uitgever:</strong> {ds.uitgever}
                  </span>
                  <span>
                    <strong className="text-foreground/70">Frequentie:</strong> {ds.frequentie}
                  </span>
                  <span>
                    <strong className="text-foreground/70">Licentie:</strong> {ds.licentie}
                  </span>
                </div>

                {/* Indicatoren */}
                <div className="mt-3 flex flex-wrap gap-1.5">
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

              {/* Links */}
              <div className="flex shrink-0 flex-col gap-2">
                <a
                  href={ds.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-glass px-3 py-1.5 text-[12px] font-medium text-foreground transition-all hover:border-accent/30 hover:text-accent-light"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Website
                </a>
                {"download" in ds && ds.download && (
                  <a
                    href={ds.download}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-[12px] font-medium text-accent-light transition-all hover:bg-accent/25"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Future roadmap */}
      <div className="glass-strong rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground">Roadmap: echte data-integratie</h2>
        <div className="mt-3 space-y-2">
          {[
            "Excel bestanden downloaden van Gemeente-Stadsmonitor en parsen naar JSON",
            "Laadpalen CSV van MOW koppelen aan gemeenten via NIS-code",
            "Statbel bevolkings- en vastgoeddata integreren",
            "Automatische maandelijkse data-update via GitHub Actions",
            "SPARQL queries voor actuele administratieve indelingen",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/50" />
              <p className="text-[13px] text-muted">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
