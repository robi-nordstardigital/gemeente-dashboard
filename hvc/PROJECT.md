# HVC — projectnotities

Werkdocument voor het nieuwe webproject van Huishoudhulp Van Cauteren.
Bevat wat er tot nu toe uitgezocht is, zodat niemand het opnieuw hoeft te doen.

## Het bedrijf

**Huishoudhulp Van Cauteren** — poetshulp met dienstencheques.

| | |
|---|---|
| Site | <https://www.hvancauteren.be> |
| Adres | Broechemlei 51, 2520 Ranst |
| Telefoon | 03 294 37 67 |
| E-mail | info@hvancauteren.be |
| BTW | BE 0564.904.046 |
| Opgericht | 21-10-2014 |
| Werkgebied | Ranst, Lier, Wommelgem, Nijlen, Zandhoven |

Ordegrootte volgens publieke bronnen: ±132 VTE, omzet ±€4,9 mln. Die cijfers
komen van [companyweb](https://www.companyweb.be/en/0564904046/van-cauteren) en
de [gemeente Ranst](https://www.ranst.be/bedrijven/detail/8/huishoudhulp-van-cauteren)
— nog niet bevestigd door HVC zelf.

Dat aantal medewerkers is relevant voor de backup: het contactenbestand bevat
waarschijnlijk zowel klanten als huishoudhulpen, en dus veel persoonsgegevens.

## Huidige situatie

De site draait op **Wix** (klassieke editor). Wat daaruit te halen valt en hoe,
staat in [README.md](./README.md).

## Wix-accounts — let op, het zijn er twee

Dit is het punt waar het misgaat als je er niet op let:

| Account | Id | Sites |
|---|---|---|
| Robi Struyf (persoonlijk) | `a26ab9df-3e63-4c61-af3b-0d1e079936b0` | Discours (discours.be) |
| HVC | `b894bd42-88ca-4b7a-be39-ea5b0277f7b9` | hvancauteren.be |

De Wix-connector in Claude hangt standaard aan het persoonlijke account. Die
ziet het HVC-account **niet**, ook niet als je een HVC API key hebt.

Om de connector op HVC te richten, gebruik je de API-key-configuratie in plaats
van de OAuth-koppeling
([bron](https://dev.wix.com/docs/api-reference/articles/ai-tools/wix-mcp/about-the-wix-mcp)):

```json
{
  "mcpServers": {
    "wix-mcp": {
      "type": "http",
      "url": "https://mcp.wix.com/mcp",
      "headers": {
        "Authorization": "<HVC API KEY>",
        "wix-account-id": "b894bd42-88ca-4b7a-be39-ea5b0277f7b9"
      }
    }
  }
}
```

Wix waarschuwt dat de verbinding kan blijven hangen op het oude account na een
accountwissel. Werkt het niet meteen: verwijder `~/.mcp-auth` (macOS) of
`C:\Users\<naam>\.mcp-auth` (Windows) en verbind opnieuw.

## Openstaand

- [ ] Wix-connector omzetten naar het HVC-account (zie hierboven)
- [ ] Backup daadwerkelijk draaien — de scripts zijn getest tegen mocks, nog niet
      tegen het echte account
- [ ] API key roteren zodra de backup binnen is. De huidige key is in een chat
      geplakt en moet daarom als gecompromitteerd behandeld worden:
      <https://manage.wix.com/account/api-keys>
- [ ] Eigen repo `hvc-website` aanmaken en deze map daarheen verhuizen — nu
      staat het in `gemeente-dashboard`, een ander project
- [ ] Screenshots van de huidige site als visuele referentie
- [ ] Beeldmateriaal downloaden op basis van `media.json`

## Buiten de site zelf

Vóór er iets gemigreerd wordt, moet dit in kaart:

- **Domein en DNS** — waar staat `hvancauteren.be` geregistreerd, en wie beheert
  de nameservers? Bij Wix of extern?
- **E-mail** — draait `info@hvancauteren.be` via Wix, Google Workspace of iets
  anders? Dit is het risicovolste onderdeel van een migratie: een verkeerde
  MX-record en de mail ligt plat.
- **Google Business Profile** en andere vindbaarheid
- **Dienstencheque-koppelingen** (Sodexo/Pluxee) als die op de site staan
- **Bestaande URL-structuur** — nodig voor redirects, zodat de vindbaarheid niet
  wegvalt. `pages.json` uit de crawl is hiervoor de bron.

## Beslissingen

| Datum | Beslissing |
|---|---|
| 2026-08-13 | Backup als eerste stap, vóór er iets nieuws gebouwd wordt |
| 2026-08-13 | Eigen repo voor HVC, los van gemeente-dashboard |
| 2026-08-13 | Paginacopy via crawl van de publieke site — de Wix API geeft geen editor-tekst |
