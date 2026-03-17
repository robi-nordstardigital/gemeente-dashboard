import { Gemeente, Provincie } from "@/lib/types";

// Seeded random for reproducible data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateGemeente(
  id: string,
  naam: string,
  provincie: Provincie,
  seed: number,
  sizeHint: "groot" | "middel" | "klein"
): Gemeente {
  const rand = seededRandom(seed);

  const inwoners =
    sizeHint === "groot"
      ? Math.round(50000 + rand() * 450000)
      : sizeHint === "middel"
        ? Math.round(15000 + rand() * 35000)
        : Math.round(3000 + rand() * 15000);

  const oppervlakte =
    sizeHint === "groot"
      ? +(20 + rand() * 180).toFixed(1)
      : sizeHint === "middel"
        ? +(15 + rand() * 80).toFixed(1)
        : +(5 + rand() * 50).toFixed(1);

  const dichtheid = +(inwoners / oppervlakte).toFixed(1);
  const mediaalInkomen = Math.round(18000 + rand() * 22000);
  const werkloosheidsgraad = +(2 + rand() * 10).toFixed(1);
  const laadpalen = Math.round((inwoners / 1000) * (0.5 + rand() * 4));
  const laadpalenPerInwoner = +((laadpalen / inwoners) * 1000).toFixed(2);
  const criminaliteitsgraad = +(20 + rand() * 60).toFixed(1);
  const groeneRuimte = +(5 + rand() * 55).toFixed(1);
  const vergrijzingsgraad = +(12 + rand() * 18).toFixed(1);
  const bevolkingsgroei = +(-1 + rand() * 3).toFixed(2);
  const gemiddeldeHuisprijs = Math.round(150000 + rand() * 350000);

  return {
    id,
    naam,
    provincie,
    inwoners,
    oppervlakte,
    dichtheid,
    mediaalInkomen,
    werkloosheidsgraad,
    laadpalen,
    laadpalenPerInwoner,
    criminaliteitsgraad,
    groeneRuimte,
    vergrijzingsgraad,
    bevolkingsgroei,
    gemiddeldeHuisprijs,
    scores: {
      demografie: Math.round(30 + rand() * 70),
      economie: Math.round(30 + rand() * 70),
      mobiliteit: Math.round(30 + rand() * 70),
      onderwijs: Math.round(30 + rand() * 70),
      milieu: Math.round(30 + rand() * 70),
      veiligheid: Math.round(30 + rand() * 70),
      wonen: Math.round(30 + rand() * 70),
      zorg: Math.round(30 + rand() * 70),
    },
  };
}

// All 300 Flemish municipalities grouped by province
const GEMEENTE_DEFS: [string, string, Provincie, "groot" | "middel" | "klein"][] = [
  // Antwerpen (69 gemeenten)
  ["11001", "Aartselaar", "Antwerpen", "middel"],
  ["11002", "Antwerpen", "Antwerpen", "groot"],
  ["11004", "Boechout", "Antwerpen", "middel"],
  ["11005", "Boom", "Antwerpen", "middel"],
  ["11007", "Borsbeek", "Antwerpen", "klein"],
  ["11008", "Brasschaat", "Antwerpen", "middel"],
  ["11009", "Brecht", "Antwerpen", "middel"],
  ["11013", "Edegem", "Antwerpen", "middel"],
  ["11016", "Essen", "Antwerpen", "middel"],
  ["11018", "Hemiksem", "Antwerpen", "klein"],
  ["11021", "Hove", "Antwerpen", "klein"],
  ["11022", "Kalmthout", "Antwerpen", "middel"],
  ["11023", "Kapellen", "Antwerpen", "middel"],
  ["11024", "Kontich", "Antwerpen", "middel"],
  ["11025", "Lint", "Antwerpen", "klein"],
  ["11029", "Mortsel", "Antwerpen", "middel"],
  ["11030", "Niel", "Antwerpen", "klein"],
  ["11035", "Ranst", "Antwerpen", "middel"],
  ["11037", "Rumst", "Antwerpen", "middel"],
  ["11038", "Schelle", "Antwerpen", "klein"],
  ["11039", "Schilde", "Antwerpen", "middel"],
  ["11040", "Schoten", "Antwerpen", "middel"],
  ["11044", "Stabroek", "Antwerpen", "middel"],
  ["11050", "Wijnegem", "Antwerpen", "klein"],
  ["11052", "Wommelgem", "Antwerpen", "middel"],
  ["11053", "Wuustwezel", "Antwerpen", "middel"],
  ["11054", "Zandhoven", "Antwerpen", "middel"],
  ["11055", "Zoersel", "Antwerpen", "middel"],
  ["11056", "Zwijndrecht", "Antwerpen", "middel"],
  ["11057", "Malle", "Antwerpen", "middel"],
  ["12002", "Berlaar", "Antwerpen", "klein"],
  ["12005", "Bonheiden", "Antwerpen", "middel"],
  ["12007", "Bornem", "Antwerpen", "middel"],
  ["12009", "Duffel", "Antwerpen", "middel"],
  ["12014", "Heist-op-den-Berg", "Antwerpen", "middel"],
  ["12021", "Lier", "Antwerpen", "middel"],
  ["12025", "Mechelen", "Antwerpen", "groot"],
  ["12026", "Nijlen", "Antwerpen", "middel"],
  ["12029", "Putte", "Antwerpen", "middel"],
  ["12030", "Puurs-Sint-Amands", "Antwerpen", "middel"],
  ["12034", "Sint-Katelijne-Waver", "Antwerpen", "middel"],
  ["12035", "Willebroek", "Antwerpen", "middel"],
  ["13001", "Arendonk", "Antwerpen", "middel"],
  ["13002", "Baarle-Hertog", "Antwerpen", "klein"],
  ["13003", "Balen", "Antwerpen", "middel"],
  ["13004", "Beerse", "Antwerpen", "middel"],
  ["13006", "Dessel", "Antwerpen", "klein"],
  ["13008", "Geel", "Antwerpen", "middel"],
  ["13010", "Grobbendonk", "Antwerpen", "klein"],
  ["13011", "Herentals", "Antwerpen", "middel"],
  ["13012", "Herenthout", "Antwerpen", "klein"],
  ["13013", "Herselt", "Antwerpen", "middel"],
  ["13014", "Hoogstraten", "Antwerpen", "middel"],
  ["13016", "Hulshout", "Antwerpen", "klein"],
  ["13017", "Kasterlee", "Antwerpen", "middel"],
  ["13019", "Laakdal", "Antwerpen", "middel"],
  ["13021", "Meerhout", "Antwerpen", "klein"],
  ["13023", "Merksplas", "Antwerpen", "klein"],
  ["13025", "Mol", "Antwerpen", "middel"],
  ["13029", "Olen", "Antwerpen", "middel"],
  ["13031", "Oud-Turnhout", "Antwerpen", "middel"],
  ["13035", "Ravels", "Antwerpen", "middel"],
  ["13036", "Retie", "Antwerpen", "klein"],
  ["13037", "Rijkevorsel", "Antwerpen", "klein"],
  ["13040", "Turnhout", "Antwerpen", "middel"],
  ["13044", "Vorselaar", "Antwerpen", "klein"],
  ["13046", "Vosselaar", "Antwerpen", "klein"],
  ["13049", "Westerlo", "Antwerpen", "middel"],
  ["13053", "Lille", "Antwerpen", "middel"],

  // Limburg (42 gemeenten)
  ["71002", "As", "Limburg", "klein"],
  ["71004", "Beringen", "Limburg", "middel"],
  ["71011", "Diepenbeek", "Limburg", "middel"],
  ["71016", "Genk", "Limburg", "groot"],
  ["71017", "Gingelom", "Limburg", "klein"],
  ["71020", "Halen", "Limburg", "klein"],
  ["71022", "Hasselt", "Limburg", "groot"],
  ["71024", "Herk-de-Stad", "Limburg", "middel"],
  ["71034", "Leopoldsburg", "Limburg", "middel"],
  ["71037", "Lummen", "Limburg", "middel"],
  ["71045", "Nieuwerkerken", "Limburg", "klein"],
  ["71047", "Opglabbeek", "Limburg", "klein"],
  ["71053", "Sint-Truiden", "Limburg", "middel"],
  ["71057", "Tessenderlo", "Limburg", "middel"],
  ["71066", "Zonhoven", "Limburg", "middel"],
  ["71069", "Ham", "Limburg", "klein"],
  ["72003", "Bocholt", "Limburg", "middel"],
  ["72004", "Bree", "Limburg", "middel"],
  ["72018", "Kinrooi", "Limburg", "middel"],
  ["72020", "Lommel", "Limburg", "middel"],
  ["72021", "Maaseik", "Limburg", "middel"],
  ["72025", "Neerpelt", "Limburg", "middel"],
  ["72029", "Overpelt", "Limburg", "middel"],
  ["72030", "Peer", "Limburg", "middel"],
  ["72037", "Hamont-Achel", "Limburg", "middel"],
  ["72038", "Hechtel-Eksel", "Limburg", "middel"],
  ["72039", "Houthalen-Helchteren", "Limburg", "middel"],
  ["72040", "Meeuwen-Gruitrode", "Limburg", "middel"],
  ["72041", "Dilsen-Stokkem", "Limburg", "middel"],
  ["73001", "Alken", "Limburg", "middel"],
  ["73006", "Bilzen", "Limburg", "middel"],
  ["73009", "Borgloon", "Limburg", "klein"],
  ["73022", "Heers", "Limburg", "klein"],
  ["73028", "Herstappe", "Limburg", "klein"],
  ["73032", "Hoeselt", "Limburg", "klein"],
  ["73040", "Kortessem", "Limburg", "klein"],
  ["73042", "Lanaken", "Limburg", "middel"],
  ["73066", "Riemst", "Limburg", "middel"],
  ["73083", "Tongeren", "Limburg", "middel"],
  ["73098", "Wellen", "Limburg", "klein"],
  ["73107", "Maasmechelen", "Limburg", "middel"],
  ["73109", "Voeren", "Limburg", "klein"],

  // Oost-Vlaanderen (65 gemeenten)
  ["41002", "Aalst", "Oost-Vlaanderen", "groot"],
  ["41011", "Denderleeuw", "Oost-Vlaanderen", "middel"],
  ["41018", "Geraardsbergen", "Oost-Vlaanderen", "middel"],
  ["41024", "Haaltert", "Oost-Vlaanderen", "middel"],
  ["41027", "Herzele", "Oost-Vlaanderen", "middel"],
  ["41034", "Lede", "Oost-Vlaanderen", "middel"],
  ["41048", "Ninove", "Oost-Vlaanderen", "middel"],
  ["41063", "Sint-Lievens-Houtem", "Oost-Vlaanderen", "klein"],
  ["41081", "Zottegem", "Oost-Vlaanderen", "middel"],
  ["41082", "Erpe-Mere", "Oost-Vlaanderen", "middel"],
  ["42003", "Berlare", "Oost-Vlaanderen", "middel"],
  ["42004", "Buggenhout", "Oost-Vlaanderen", "middel"],
  ["42006", "Dendermonde", "Oost-Vlaanderen", "middel"],
  ["42008", "Hamme", "Oost-Vlaanderen", "middel"],
  ["42010", "Laarne", "Oost-Vlaanderen", "middel"],
  ["42011", "Lebbeke", "Oost-Vlaanderen", "middel"],
  ["42023", "Waasmunster", "Oost-Vlaanderen", "middel"],
  ["42025", "Wetteren", "Oost-Vlaanderen", "middel"],
  ["42026", "Wichelen", "Oost-Vlaanderen", "middel"],
  ["42028", "Zele", "Oost-Vlaanderen", "middel"],
  ["43002", "Assenede", "Oost-Vlaanderen", "middel"],
  ["43005", "Eeklo", "Oost-Vlaanderen", "middel"],
  ["43007", "Kaprijke", "Oost-Vlaanderen", "klein"],
  ["43010", "Maldegem", "Oost-Vlaanderen", "middel"],
  ["43014", "Sint-Laureins", "Oost-Vlaanderen", "klein"],
  ["43018", "Zelzate", "Oost-Vlaanderen", "middel"],
  ["44001", "Aalter", "Oost-Vlaanderen", "middel"],
  ["44011", "De Pinte", "Oost-Vlaanderen", "klein"],
  ["44012", "Destelbergen", "Oost-Vlaanderen", "middel"],
  ["44013", "Deinze", "Oost-Vlaanderen", "middel"],
  ["44019", "Evergem", "Oost-Vlaanderen", "middel"],
  ["44021", "Gent", "Oost-Vlaanderen", "groot"],
  ["44029", "Knesselare", "Oost-Vlaanderen", "klein"],
  ["44034", "Lochristi", "Oost-Vlaanderen", "middel"],
  ["44040", "Melle", "Oost-Vlaanderen", "klein"],
  ["44043", "Merelbeke", "Oost-Vlaanderen", "middel"],
  ["44045", "Moerbeke", "Oost-Vlaanderen", "klein"],
  ["44048", "Nazareth", "Oost-Vlaanderen", "middel"],
  ["44049", "Nevele", "Oost-Vlaanderen", "middel"],
  ["44052", "Oosterzele", "Oost-Vlaanderen", "middel"],
  ["44064", "Sint-Martens-Latem", "Oost-Vlaanderen", "klein"],
  ["44072", "Waarschoot", "Oost-Vlaanderen", "klein"],
  ["44073", "Wachtebeke", "Oost-Vlaanderen", "klein"],
  ["44080", "Zulte", "Oost-Vlaanderen", "middel"],
  ["44081", "Lovendegem", "Oost-Vlaanderen", "klein"],
  ["45017", "Kruisem", "Oost-Vlaanderen", "middel"],
  ["45035", "Oudenaarde", "Oost-Vlaanderen", "middel"],
  ["45041", "Ronse", "Oost-Vlaanderen", "middel"],
  ["45057", "Zingem", "Oost-Vlaanderen", "klein"],
  ["45059", "Brakel", "Oost-Vlaanderen", "middel"],
  ["45060", "Kluisbergen", "Oost-Vlaanderen", "klein"],
  ["45061", "Wortegem-Petegem", "Oost-Vlaanderen", "klein"],
  ["45062", "Horebeke", "Oost-Vlaanderen", "klein"],
  ["45063", "Lierde", "Oost-Vlaanderen", "klein"],
  ["45064", "Maarkedal", "Oost-Vlaanderen", "klein"],
  ["46003", "Beveren", "Oost-Vlaanderen", "middel"],
  ["46013", "Kruibeke", "Oost-Vlaanderen", "middel"],
  ["46014", "Lokeren", "Oost-Vlaanderen", "middel"],
  ["46020", "Sint-Gillis-Waas", "Oost-Vlaanderen", "middel"],
  ["46021", "Sint-Niklaas", "Oost-Vlaanderen", "groot"],
  ["46024", "Stekene", "Oost-Vlaanderen", "middel"],
  ["46025", "Temse", "Oost-Vlaanderen", "middel"],
  ["46099", "Moerbeke-Waas", "Oost-Vlaanderen", "klein"],
  ["44084", "Lievegem", "Oost-Vlaanderen", "middel"],
  ["44085", "Gavere", "Oost-Vlaanderen", "middel"],

  // Vlaams-Brabant (65 gemeenten)
  ["23002", "Aarschot", "Vlaams-Brabant", "middel"],
  ["23003", "Beersel", "Vlaams-Brabant", "middel"],
  ["23009", "Bertem", "Vlaams-Brabant", "klein"],
  ["23016", "Diest", "Vlaams-Brabant", "middel"],
  ["23023", "Galmaarden", "Vlaams-Brabant", "klein"],
  ["23024", "Geetbets", "Vlaams-Brabant", "klein"],
  ["23025", "Glabbeek", "Vlaams-Brabant", "klein"],
  ["23027", "Halle", "Vlaams-Brabant", "middel"],
  ["23032", "Haacht", "Vlaams-Brabant", "middel"],
  ["23033", "Herent", "Vlaams-Brabant", "middel"],
  ["23038", "Hoegaarden", "Vlaams-Brabant", "klein"],
  ["23039", "Holsbeek", "Vlaams-Brabant", "klein"],
  ["23044", "Huldenberg", "Vlaams-Brabant", "klein"],
  ["23045", "Kampenhout", "Vlaams-Brabant", "middel"],
  ["23047", "Kapelle-op-den-Bos", "Vlaams-Brabant", "klein"],
  ["23052", "Keerbergen", "Vlaams-Brabant", "middel"],
  ["23054", "Kortenaken", "Vlaams-Brabant", "klein"],
  ["23055", "Kortenberg", "Vlaams-Brabant", "middel"],
  ["23060", "Landen", "Vlaams-Brabant", "middel"],
  ["23064", "Leuven", "Vlaams-Brabant", "groot"],
  ["23077", "Liedekerke", "Vlaams-Brabant", "middel"],
  ["23081", "Linter", "Vlaams-Brabant", "klein"],
  ["23086", "Londerzeel", "Vlaams-Brabant", "middel"],
  ["23088", "Lubbeek", "Vlaams-Brabant", "middel"],
  ["23094", "Merchtem", "Vlaams-Brabant", "middel"],
  ["23096", "Opwijk", "Vlaams-Brabant", "middel"],
  ["23097", "Oud-Heverlee", "Vlaams-Brabant", "middel"],
  ["23098", "Overijse", "Vlaams-Brabant", "middel"],
  ["23099", "Pepingen", "Vlaams-Brabant", "klein"],
  ["23100", "Rotselaar", "Vlaams-Brabant", "middel"],
  ["23101", "Scherpenheuvel-Zichem", "Vlaams-Brabant", "middel"],
  ["23102", "Sint-Genesius-Rode", "Vlaams-Brabant", "middel"],
  ["23103", "Sint-Pieters-Leeuw", "Vlaams-Brabant", "middel"],
  ["23104", "Steenokkerzeel", "Vlaams-Brabant", "middel"],
  ["23105", "Ternat", "Vlaams-Brabant", "middel"],
  ["23107", "Tervuren", "Vlaams-Brabant", "middel"],
  ["23108", "Tielt-Winge", "Vlaams-Brabant", "middel"],
  ["23109", "Tienen", "Vlaams-Brabant", "middel"],
  ["23110", "Tremelo", "Vlaams-Brabant", "middel"],
  ["23111", "Vilvoorde", "Vlaams-Brabant", "middel"],
  ["23112", "Wemmel", "Vlaams-Brabant", "middel"],
  ["23113", "Wezembeek-Oppem", "Vlaams-Brabant", "middel"],
  ["23114", "Zaventem", "Vlaams-Brabant", "middel"],
  ["23115", "Zemst", "Vlaams-Brabant", "middel"],
  ["23116", "Zoutleeuw", "Vlaams-Brabant", "klein"],
  ["23117", "Lennik", "Vlaams-Brabant", "klein"],
  ["23118", "Roosdaal", "Vlaams-Brabant", "middel"],
  ["23119", "Affligem", "Vlaams-Brabant", "middel"],
  ["23120", "Begijnendijk", "Vlaams-Brabant", "klein"],
  ["23121", "Boortmeerbeek", "Vlaams-Brabant", "middel"],
  ["23122", "Boutersem", "Vlaams-Brabant", "klein"],
  ["23123", "Dilbeek", "Vlaams-Brabant", "middel"],
  ["23124", "Drogenbos", "Vlaams-Brabant", "klein"],
  ["23125", "Grimbergen", "Vlaams-Brabant", "middel"],
  ["23126", "Hoeilaart", "Vlaams-Brabant", "middel"],
  ["23127", "Kraainem", "Vlaams-Brabant", "middel"],
  ["23128", "Linkebeek", "Vlaams-Brabant", "klein"],
  ["23129", "Machelen", "Vlaams-Brabant", "middel"],
  ["23130", "Meise", "Vlaams-Brabant", "middel"],
  ["23131", "Bierbeek", "Vlaams-Brabant", "klein"],
  ["23132", "Gooik", "Vlaams-Brabant", "klein"],
  ["23133", "Herne", "Vlaams-Brabant", "klein"],
  ["23134", "Tielt-Winge", "Vlaams-Brabant", "middel"],
  ["23135", "Bekkevoort", "Vlaams-Brabant", "klein"],
  ["23136", "Bertem", "Vlaams-Brabant", "klein"],

  // West-Vlaanderen (64 gemeenten)
  ["31003", "Beernem", "West-Vlaanderen", "middel"],
  ["31004", "Blankenberge", "West-Vlaanderen", "middel"],
  ["31005", "Brugge", "West-Vlaanderen", "groot"],
  ["31006", "Damme", "West-Vlaanderen", "middel"],
  ["31012", "Jabbeke", "West-Vlaanderen", "middel"],
  ["31022", "Oostkamp", "West-Vlaanderen", "middel"],
  ["31033", "Torhout", "West-Vlaanderen", "middel"],
  ["31040", "Zedelgem", "West-Vlaanderen", "middel"],
  ["31042", "Zuienkerke", "West-Vlaanderen", "klein"],
  ["31043", "Knokke-Heist", "West-Vlaanderen", "middel"],
  ["32003", "Diksmuide", "West-Vlaanderen", "middel"],
  ["32006", "Houthulst", "West-Vlaanderen", "klein"],
  ["32010", "Koekelare", "West-Vlaanderen", "klein"],
  ["32011", "Kortemark", "West-Vlaanderen", "middel"],
  ["32030", "Lo-Reninge", "West-Vlaanderen", "klein"],
  ["33011", "Ieper", "West-Vlaanderen", "middel"],
  ["33016", "Langemark-Poelkapelle", "West-Vlaanderen", "klein"],
  ["33021", "Poperinge", "West-Vlaanderen", "middel"],
  ["33029", "Wervik", "West-Vlaanderen", "middel"],
  ["33037", "Zonnebeke", "West-Vlaanderen", "middel"],
  ["33039", "Heuvelland", "West-Vlaanderen", "klein"],
  ["33040", "Mesen", "West-Vlaanderen", "klein"],
  ["33041", "Vleteren", "West-Vlaanderen", "klein"],
  ["34002", "Anzegem", "West-Vlaanderen", "middel"],
  ["34003", "Avelgem", "West-Vlaanderen", "klein"],
  ["34009", "Deerlijk", "West-Vlaanderen", "middel"],
  ["34013", "Harelbeke", "West-Vlaanderen", "middel"],
  ["34022", "Kortrijk", "West-Vlaanderen", "groot"],
  ["34023", "Kuurne", "West-Vlaanderen", "middel"],
  ["34025", "Lendelede", "West-Vlaanderen", "klein"],
  ["34027", "Menen", "West-Vlaanderen", "middel"],
  ["34040", "Waregem", "West-Vlaanderen", "middel"],
  ["34041", "Wevelgem", "West-Vlaanderen", "middel"],
  ["34042", "Zwevegem", "West-Vlaanderen", "middel"],
  ["34043", "Spiere-Helkijn", "West-Vlaanderen", "klein"],
  ["35002", "Bredene", "West-Vlaanderen", "middel"],
  ["35005", "Gistel", "West-Vlaanderen", "middel"],
  ["35006", "Ichtegem", "West-Vlaanderen", "middel"],
  ["35011", "Middelkerke", "West-Vlaanderen", "middel"],
  ["35013", "Oostende", "West-Vlaanderen", "groot"],
  ["35014", "Oudenburg", "West-Vlaanderen", "klein"],
  ["35029", "De Haan", "West-Vlaanderen", "middel"],
  ["36006", "Hooglede", "West-Vlaanderen", "klein"],
  ["36007", "Ingelmunster", "West-Vlaanderen", "middel"],
  ["36008", "Izegem", "West-Vlaanderen", "middel"],
  ["36010", "Ledegem", "West-Vlaanderen", "klein"],
  ["36011", "Lichtervelde", "West-Vlaanderen", "klein"],
  ["36012", "Moorslede", "West-Vlaanderen", "middel"],
  ["36015", "Roeselare", "West-Vlaanderen", "groot"],
  ["36019", "Staden", "West-Vlaanderen", "middel"],
  ["37002", "Dentergem", "West-Vlaanderen", "klein"],
  ["37007", "Meulebeke", "West-Vlaanderen", "middel"],
  ["37010", "Oostrozebeke", "West-Vlaanderen", "klein"],
  ["37011", "Pittem", "West-Vlaanderen", "klein"],
  ["37012", "Ruiselede", "West-Vlaanderen", "klein"],
  ["37015", "Tielt", "West-Vlaanderen", "middel"],
  ["37017", "Wielsbeke", "West-Vlaanderen", "klein"],
  ["37018", "Wingene", "West-Vlaanderen", "middel"],
  ["37020", "Ardooie", "West-Vlaanderen", "klein"],
  ["38002", "De Panne", "West-Vlaanderen", "middel"],
  ["38008", "Koksijde", "West-Vlaanderen", "middel"],
  ["38014", "Nieuwpoort", "West-Vlaanderen", "middel"],
  ["38016", "Veurne", "West-Vlaanderen", "middel"],
  ["38025", "Alveringem", "West-Vlaanderen", "klein"],
];

export const gemeenten: Gemeente[] = GEMEENTE_DEFS.map(([id, naam, provincie, size], i) =>
  generateGemeente(id, naam, provincie, (parseInt(id) + 1) * 7919 + i * 31, size)
);

// Pre-computed aggregates
export const totaalInwoners = gemeenten.reduce((sum, g) => sum + g.inwoners, 0);
export const totaalLaadpalen = gemeenten.reduce((sum, g) => sum + g.laadpalen, 0);
export const gemiddeldInkomen = Math.round(
  gemeenten.reduce((sum, g) => sum + g.mediaalInkomen, 0) / gemeenten.length
);
export const gemiddeldeWerkloosheid = +(
  gemeenten.reduce((sum, g) => sum + g.werkloosheidsgraad, 0) / gemeenten.length
).toFixed(1);
export const gemiddeldeHuisprijs = Math.round(
  gemeenten.reduce((sum, g) => sum + g.gemiddeldeHuisprijs, 0) / gemeenten.length
);

// Trend data (laadpalen growth 2018-2025)
export const laadpalenTrend = [
  { jaar: 2018, waarde: 1240 },
  { jaar: 2019, waarde: 2180 },
  { jaar: 2020, waarde: 3450 },
  { jaar: 2021, waarde: 5620 },
  { jaar: 2022, waarde: 8900 },
  { jaar: 2023, waarde: 13400 },
  { jaar: 2024, waarde: 18700 },
  { jaar: 2025, waarde: 24500 },
];

export const bevolkingsTrend = [
  { jaar: 2015, waarde: 6444127 },
  { jaar: 2016, waarde: 6477804 },
  { jaar: 2017, waarde: 6516011 },
  { jaar: 2018, waarde: 6552134 },
  { jaar: 2019, waarde: 6589069 },
  { jaar: 2020, waarde: 6629143 },
  { jaar: 2021, waarde: 6653062 },
  { jaar: 2022, waarde: 6698876 },
  { jaar: 2023, waarde: 6745220 },
  { jaar: 2024, waarde: 6789100 },
  { jaar: 2025, waarde: 6831000 },
];

export function getGemeenteBySlug(slug: string): Gemeente | undefined {
  return gemeenten.find(
    (g) =>
      g.naam
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") === slug
  );
}

export function getTopGemeenten(indicator: keyof Gemeente, n = 10, ascending = false): Gemeente[] {
  return [...gemeenten]
    .sort((a, b) => {
      const va = a[indicator] as number;
      const vb = b[indicator] as number;
      return ascending ? va - vb : vb - va;
    })
    .slice(0, n);
}
