# HVC — backup van de bestaande website

Eerste stap van het nieuwe webproject voor **Huishoudhulp Van Cauteren**
([www.hvancauteren.be](https://www.hvancauteren.be)): alles veiligstellen wat er
nu staat, vóór er iets nieuws gebouwd wordt.

De huidige site draait op **Wix**. Deze map bevat scripts die de inhoud eruit
halen en wegschrijven naar bestanden die je los van Wix kunt bewaren.

## Wat wordt er geëxporteerd

| Stap | Script | Wat | Bron |
|------|--------|-----|------|
| 1 | `01-discover.mjs` | Sites in het account + site-id + gepubliceerde URLs | Sites API (account-level) |
| 2 | `02-export-contacts.mjs` | Alle contacten, labels en extra velden — JSON + CSV | Contacts API v4 |
| 3 | `03-export-wix-content.mjs` | Blogposts, categorieën, formulierinzendingen | Blog v3, Forms v4 |
| 4 | `04-crawl-site.mjs` | De copy van elke pagina — markdown + ruwe HTML + medialijst | De gepubliceerde site zelf |

Stap 4 loopt via de publieke website en niet via de API. Dat is bewust: de Wix
REST API geeft wel de gestructureerde app-data (contacten, blog, formulieren),
maar **niet** de tekst die in de editor op de pagina's staat. Die bestaat alleen
in de gepubliceerde HTML.

## Vereisten

- Node.js 18 of hoger (verder niets — de scripts hebben geen dependencies)
- Een Wix API key met leesrechten, aangemaakt door de **eigenaar** van het
  HVC-account: <https://manage.wix.com/account/api-keys>

## Gebruik

```bash
cd hvc
cp .env.example .env      # vul WIX_API_KEY en WIX_ACCOUNT_ID in

npm run discover          # toont de site-ids — zet de juiste in .env als WIX_SITE_ID
npm run backup            # draait alle vier de stappen
```

Losse stappen: `npm run contacts`, `npm run content`, `npm run crawl`.

Alleen de sitecopy ophalen kan zonder API key:

```bash
node scripts/04-crawl-site.mjs https://www.hvancauteren.be
```

## Waar komt het terecht

Elke run schrijft naar `exports/<datum-tijd>/`, dus een tweede run overschrijft
de eerste nooit.

```
exports/2026-08-13T09-14-22/
├── 00-sites.json                     alle sites in het account
├── 00-published-urls.json            gepubliceerde URLs van de site
├── 01-contacts.json                  alle contacten, volledig
├── 01-contacts.csv                   zelfde data, plat, opent in Excel
├── 01-contacts-extended-fields.json  betekenis van de extra kolommen
├── 02-blog-posts.json                blogposts incl. tekst
├── 02-blog-categories.json
├── 03-form-submissions.json          inzendingen van contactformulieren
└── site/
    ├── pages.json                    index: URL, titel, koppen, aantal woorden
    ├── media.json                    elke afbeelding + alt-tekst + waar gebruikt
    ├── pages/<slug>.md               de copy, leesbaar
    └── raw/<slug>.html               de ruwe HTML, voor als er iets mist
```

## Let op: persoonsgegevens

`exports/` staat in `.gitignore` en dat moet zo blijven. De export bevat
persoonsgegevens van klanten en medewerkers (namen, adressen, telefoonnummers).
Dat hoort niet in een git-repo en niet op een gedeelde schijf zonder afspraken.
Bewaar het versleuteld en gooi verlopen kopieën weg.

De API key hoort om dezelfde reden alleen in `.env` — nooit in een commit.

## Wat hier niet in zit

Bewust buiten scope gelaten, omdat het niet met een leesrechten-API key op te
halen is of omdat het pas relevant wordt bij de bouw van de nieuwe site:

- **Beeldmateriaal zelf.** `media.json` bevat de URLs en alt-teksten; de
  bestanden worden niet gedownload. Dat kan later in één slag vanaf die lijst.
- **De Wix-vormgeving.** Kleuren, lettertypes en layout komen niet uit de API.
  Neem screenshots van de huidige site als visuele referentie.
- **Formulierdefinities.** De inzendingen worden bewaard, de opbouw van de
  formulieren niet.
- **Instellingen buiten de site**: domeinnaam, DNS, mailboxen, Google Business.
  Die staan los van Wix en moeten apart in kaart gebracht worden vóór een
  eventuele migratie.

## Status

De scripts zijn getest tegen een lokale mock van de Wix API en een
nagebootste Wix-pagina: paginering, CSV-escaping, sitemap-crawl,
URL-normalisatie en tekstextractie werken. Ze zijn **nog niet** tegen het echte
HVC-account gedraaid — zie het openstaande toegangspunt in de projectnotities.
