// Stammdaten von Presseinfo: Rubriken, Themen, Bundeslaender, Firmengruppe.
export const SITE = {
  name: "Presseinfo",
  claim: "Nachrichten & Presseaussendungen aus Österreich",
  description:
    "Presseinfo bringt Nachrichten, Ratgeber und Presseaussendungen aus ganz Österreich: Politik, Wirtschaft, Bauen & Wohnen, Energie, Gesundheit, Kultur und alle neun Bundesländer.",
  publisher: "Digital Denker e.U.",
  address: "Wattgasse 33, 1160 Wien",
  email: "redaktion@presseinfo.at",
  themeColor: "#f6f3ee",
};

export type Category = { slug: string; label: string; intro: string; image: string; topics: string[] };

export const CATEGORIES: Category[] = [
  { slug: "politik", label: "Politik", intro: "Bundesregierung, Nationalrat, Länder und Europa: Was in Österreich entschieden wird und was es bedeutet.", image: "/assets/img/politik.webp", topics: ["Innenpolitik", "Parlament", "Europa", "Gemeinden"] },
  { slug: "wirtschaft", label: "Wirtschaft", intro: "Konjunktur, Unternehmen, Arbeit und Gründen, dazu Wissen rund um Medien und Pressearbeit.", image: "/assets/img/wirtschaft.webp", topics: ["Konjunktur", "Unternehmen", "Finanzen", "Arbeit & Karriere", "Gründen", "Medien & PR"] },
  { slug: "chronik", label: "Chronik", intro: "Was in Österreich passiert: Verkehr, Wetter, Blaulicht und Alltag in Stadt und Land.", image: "/assets/img/chronik.webp", topics: ["Österreich", "Wien", "Verkehr", "Wetter"] },
  { slug: "bauen-wohnen", label: "Bauen & Wohnen", intro: "Hausbau, Sanierung, Immobilien und Garten: Praxiswissen für Bauherren, Eigentümer und Mieter.", image: "/assets/img/bauen-wohnen.webp", topics: ["Bauen", "Sanieren", "Immobilien", "Garten"] },
  { slug: "energie", label: "Energie & Umwelt", intro: "Photovoltaik, Wärmepumpe, Förderungen und Klima: Wie Österreich Energie erzeugt und spart.", image: "/assets/img/energie.webp", topics: ["Photovoltaik", "Heizen", "Förderungen", "Klima"] },
  { slug: "gesundheit", label: "Gesundheit", intro: "Medizin, Pflege, Ernährung und Psyche: verständlich erklärt und aus österreichischer Sicht.", image: "/assets/img/gesundheit.webp", topics: ["Medizin", "Pflege", "Ernährung", "Psyche"] },
  { slug: "kultur", label: "Kultur & Freizeit", intro: "Bühne, Musik, Ausstellungen und Ausflüge zwischen Bodensee und Neusiedler See.", image: "/assets/img/kultur.webp", topics: ["Bühne", "Musik", "Ausstellungen", "Ausflüge"] },
  { slug: "lifestyle", label: "Lifestyle", intro: "Essen und Trinken, Mobilität, Reisen und Schönheit: das gute Leben in Österreich.", image: "/assets/img/lifestyle.webp", topics: ["Essen & Trinken", "Mobilität", "Reisen", "Schönheit"] },
];
export const TOPIC_INTRO: Record<string, string> = {
  Innenpolitik: "Bundesregierung, Parteien und die großen Debatten: Was die Innenpolitik in Österreich gerade bewegt.",
  Parlament: "Nationalrat und Bundesrat: neue Gesetze, Ausschüsse und Abstimmungen verständlich erklärt.",
  Europa: "EU-Entscheidungen mit Folgen für Österreich, von Förderungen bis zu neuen Regeln.",
  Gemeinden: "Bürgermeister, Gemeinderäte und Gemeindefinanzen: Politik dort, wo sie den Alltag direkt betrifft.",
  Konjunktur: "Wachstum, Inflation und Prognosen: Wie es um Österreichs Wirtschaft steht.",
  Unternehmen: "Insolvenzen, Investitionen und Standorte: Nachrichten aus Österreichs Betrieben.",
  Finanzen: "Steuern, Sparen und Rechnungen: Finanzwissen für Haushalte und KMU.",
  "Arbeit & Karriere": "Arbeitsmarkt, Gehalt und Rechte im Job: was Beschäftigte in Österreich wissen sollten.",
  Gründen: "Gewerbe, Konzession, GmbH oder e.U.: Schritt für Schritt zum eigenen Unternehmen.",
  "Medien & PR": "Presseaussendungen, Pressefotos und Medienarbeit: Praxiswissen für Unternehmen und Vereine.",
  Österreich: "Blaulicht, Unfälle und Ereignisse aus allen Bundesländern, sachlich berichtet.",
  Wien: "Polizei, Einsätze und Ereignisse aus den 23 Wiener Bezirken.",
  Verkehr: "Öffis, Baustellen, Sperren und Regeln auf der Straße: aktuell und praktisch.",
  Wetter: "Unwetter, Warnungen und Vorsorge: was das Wetter für Österreich bedeutet.",
  Bauen: "Hausbau, Baumeister, Kran und Aushub: Abläufe und Kosten für Bauherren.",
  Sanieren: "Bad, Wohnung, Dach und Fassade: wie Sanierungen ablaufen und was sie kosten.",
  Immobilien: "Mieten, Kaufen, Wohnbauförderung: der Immobilienmarkt in Österreich.",
  Garten: "Pergola, Terrasse, Rasen und Pflanzen: Gartenwissen durch das Jahr.",
  Photovoltaik: "PV-Anlage, Speicher und Balkonkraftwerk: Solarstrom für Haus und Wohnung.",
  Heizen: "Wärmepumpe, Fernwärme, Pellets und Heizungstausch: Heizen mit Zukunft.",
  Förderungen: "Bund, Länder und Gemeinden: welche Förderungen es für Energie und Sanierung gibt.",
  Klima: "Hitze, Dürre, Starkregen und Klimapolitik: Folgen und Vorsorge in Österreich.",
  Medizin: "Ärzte, Spitäler, Impfungen und Kassenleistungen: das Gesundheitssystem erklärt.",
  Pflege: "Pflegegeld, 24-Stunden-Betreuung und Pflegeheim: Hilfe für Betroffene und Angehörige.",
  Ernährung: "Ausgewogen essen im Alltag: Empfehlungen, Tipps und Hintergründe.",
  Psyche: "Psychische Gesundheit, Therapie auf Kasse und Anlaufstellen in Krisen.",
  Bühne: "Oper, Theater und Kabarett: Premieren, Spielpläne und Tipps für den Abend.",
  Musik: "Konzerte, Festivals und Clubs: Musik in Wien und den Bundesländern.",
  Ausstellungen: "Museen und Ausstellungen: was sich in Österreichs Häusern gerade lohnt.",
  Ausflüge: "Wienerwald, Wachau, Seen und Berge: Ausflugsziele für jede Jahreszeit.",
  "Essen & Trinken": "Heurige, Kaffeehaus, Martinigansl und Klassiker der österreichischen Küche.",
  Mobilität: "Öffis, Vignette, Parkpickerl, E-Auto und Rad: mobil in Österreich.",
  Reisen: "Städtetrips, Thermen und Winterurlaub: Reisetipps für Österreich.",
  Schönheit: "Haut-, Haar- und Handpflege: Tipps für jede Jahreszeit.",
};

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const topicSlug = (t: string) =>
  t.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/&/g, "und").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export type Region = { slug: string; label: string; capital: string };
export const REGIONS: Region[] = [
  { slug: "wien", label: "Wien", capital: "Wien" },
  { slug: "niederoesterreich", label: "Niederösterreich", capital: "St. Pölten" },
  { slug: "burgenland", label: "Burgenland", capital: "Eisenstadt" },
  { slug: "oberoesterreich", label: "Oberösterreich", capital: "Linz" },
  { slug: "steiermark", label: "Steiermark", capital: "Graz" },
  { slug: "kaernten", label: "Kärnten", capital: "Klagenfurt" },
  { slug: "salzburg", label: "Salzburg", capital: "Salzburg" },
  { slug: "tirol", label: "Tirol", capital: "Innsbruck" },
  { slug: "vorarlberg", label: "Vorarlberg", capital: "Bregenz" },
];
export const regionBySlug = (slug: string | null | undefined) => (slug ? REGIONS.find((r) => r.slug === slug) ?? null : null);

export const KIND_LABEL: Record<string, string> = { news: "Nachricht", ratgeber: "Ratgeber", presse: "Presseaussendung" };

export const TIMING_OPTIONS = ["Ab sofort", "In 2-3 Wochen", "In 1-2 Monaten", "In 2-3 Monaten"];
export const PACKAGE_OPTIONS = ["Standard-Veröffentlichung", "Premium: Startseite und Newsletter", "Serie: mehrere Aussendungen"];

export const COMPANIES: { name: string; url: string }[] = [
  { name: "Konzessionsuche.at", url: "https://www.konzessionsuche.at" },
  { name: "Solar Wien", url: "https://www.solarwien.at" },
  { name: "Alpenkraft Projekt Bau", url: "https://alpenkraft-bau.at" },
  { name: "Heizexperten", url: "https://heizexperten.at" },
  { name: "Bestbieter", url: "https://www.bestbieter.at" },
  { name: "JaPergola", url: "https://www.japergola.at" },
  { name: "Fassadenfirma.at", url: "https://www.fassadenfirma.at" },
  { name: "Wienerinfo.at", url: "https://wienerinfo.at" },
  { name: "HausBauWien", url: "https://hausbauwien.at" },
  { name: "Abbruchabriss", url: "https://www.abbruchabriss.at" },
  { name: "KranWien", url: "https://kranwien.at" },
];

export const SEO_KEYWORDS = [
  "Presseaussendung Österreich", "Pressemitteilung veröffentlichen", "Presseinfo", "Nachrichten Österreich", "News Österreich",
  "Wirtschaftsnachrichten", "Politik Österreich", "Bauen und Wohnen", "Photovoltaik Förderung", "Wärmepumpe Österreich",
  "Pressemitteilung kostenlos", "PR Österreich", "Unternehmensnews", "Wien News", "Bundesländer News",
];

const TZ = "Europe/Vienna";
export const fmtDate = (iso: string) => new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(new Date(iso));
export const fmtTime = (iso: string) => new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
export const fmtShort = (iso: string) => new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "2-digit", timeZone: TZ }).format(new Date(iso));
export const fmtToday = () => new Intl.DateTimeFormat("de-AT", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(new Date());

// Auf "https://presseinfo.at" umstellen, sobald die Domain auf die Website zeigt.
// Per Umgebungsvariable VITE_SITE_URL (Vercel) ueberschreibbar, ohne Code-Aenderung.
export const SITE_URL: string = ((import.meta.env.VITE_SITE_URL as string | undefined) || "https://presseinfo.higgsfield.app").replace(/\/+$/, "");
export const OG_IMAGE = "/assets/og/presseinfo-og.jpg";
export const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);
/** Eigenes Foto des Beitrags oder null (dann zeigt die Seite eine Titelkarte statt eines doppelten Fotos). */
export const imageFor = (a: { image: string | null }) => a.image;
/** Fuer og:image: eigenes Foto, sonst das Presseinfo-Teilbild. */
export const shareImageFor = (a: { image: string | null }) => a.image ?? OG_IMAGE;

export type Partner = { name: string; url: string; pitch: string; service: string };
const P = {
  solar: { name: "Solar Wien", url: "https://www.solarwien.at", service: "Photovoltaik", pitch: "Planung und Montage von PV-Anlagen und Stromspeichern in Wien und Umgebung, inklusive Förderberatung." },
  heiz: { name: "Heizexperten", url: "https://heizexperten.at", service: "Wärmepumpe", pitch: "Wärmepumpen mit natürlichem Kältemittel R290 für Wien, Niederösterreich und das Burgenland, vom Heizungstausch bis zur Inbetriebnahme." },
  haus: { name: "HausBauWien", url: "https://hausbauwien.at", service: "Hausbau", pitch: "Hausbau und Baumeisterarbeiten in Wien und Umgebung, von der Planung bis zur Schlüsselübergabe." },
  kran: { name: "KranWien", url: "https://kranwien.at", service: "Kranvermietung", pitch: "Turmdrehkrane für Baustellen in Wien und Umgebung, mit Planung, Transport und Montage." },
  abbruch: { name: "Abbruchabriss", url: "https://www.abbruchabriss.at", service: "Abbruch", pitch: "Abbruch, Abriss und Entkernung mit fachgerechter Entsorgung." },
  alpen: { name: "Alpenkraft Projekt Bau", url: "https://alpenkraft-bau.at", service: "Sanierung", pitch: "Wohnungs- und Badsanierung in Wien aus einer Hand, alle Gewerke koordiniert." },
  fassade: { name: "Fassadenfirma.at", url: "https://www.fassadenfirma.at", service: "Fassade", pitch: "Fassadensanierung, Wärmedämmung und Anstrich vom Fachbetrieb." },
  pergola: { name: "JaPergola", url: "https://www.japergola.at", service: "Pergola", pitch: "Pergolen und Terrassenüberdachungen nach Maß für Garten und Terrasse." },
  best: { name: "Bestbieter", url: "https://www.bestbieter.at", service: "Angebotsvergleich", pitch: "Angebote geprüfter Fachbetriebe einholen und vergleichen." },
  konz: { name: "Konzessionsuche.at", url: "https://www.konzessionsuche.at", service: "Gewerbe & Konzession", pitch: "Unterstützung rund um Gewerbeberechtigung, Konzession und gewerberechtliche Geschäftsführung." },
} satisfies Record<string, Partner>;

/** Passender Dienstleister fuer Beitraege mit Dienstleister-Bezug. */
export function partnerFor(a: { category: string; topic: string | null; title: string; slug: string; service?: number | null }): Partner | null {
  const t = `${a.title} ${a.slug}`.toLowerCase();
  if (/kran/.test(t)) return P.kran;
  if (/abbruch|abriss|entkern/.test(t)) return P.abbruch;
  if (/fassade|vollwärme|daemm|dämm/.test(t)) return P.fassade;
  if (/pergola|terrassen|überdach|ueberdach|carport/.test(t)) return P.pergola;
  if (/photovoltaik|pv-|pv |solar|stromspeicher|balkonkraftwerk/.test(t)) return P.solar;
  if (/wärmepumpe|waermepumpe|heizung|heizen|fernwärme|kessel/.test(t)) return P.heiz;
  if (/konzession|gewerbe|gründ|gruend|firmengründung/.test(t)) return P.konz;
  if (/sanier|bad|renovier|umbau|wohnung/.test(t) && a.category === "bauen-wohnen") return P.alpen;
  if (/hausbau|haus bauen|baumeister|fertigteil|rohbau|neubau/.test(t)) return P.haus;
  if (!a.service) return null;
  if (a.category === "energie") return a.topic === "Photovoltaik" ? P.solar : P.heiz;
  if (a.category === "bauen-wohnen") return a.topic === "Garten" ? P.pergola : a.topic === "Sanieren" ? P.alpen : a.topic === "Immobilien" ? P.best : P.haus;
  if (a.category === "wirtschaft") return P.konz;
  return P.best;
}
export const smallImage = (src: string) =>
  /\/assets\/img\/artikel\/[a-z0-9-]+\.webp$/.test(src) || (/\/assets\/img\/[a-z-]+\.webp$/.test(src) && !/(heizen|sanieren|wohnen|hero)\.webp$/.test(src)) ? src.replace(/\.webp$/, "-sm.webp") : src;

export function pageHead(opts: { title: string; description: string; path: string; image?: string; type?: string; noindex?: boolean }) {
  const title = opts.title === SITE.name ? `${SITE.name}: ${SITE.claim}` : `${opts.title} | ${SITE.name}`;
  const image = abs(opts.image ?? OG_IMAGE);
  return {
    meta: [
      { title },
      { name: "description", content: opts.description },
      ...(opts.noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
      { property: "og:title", content: title },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: opts.type ?? "website" },
      { property: "og:url", content: abs(opts.path) },
      { property: "og:image", content: image },
      { property: "og:locale", content: "de_AT" },
      { property: "og:site_name", content: SITE.name },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: opts.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: abs(opts.path) }],
  };
}
