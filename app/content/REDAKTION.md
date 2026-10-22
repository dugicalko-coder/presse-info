# Presseinfo.at – Redaktionsregeln (auch für die automatische Tagesproduktion)

Sprache Deutsch (Österreich). Sachlich, journalistisch, keine Werbesprache. Nur belegte Fakten, keine erfundenen Zahlen, Zitate oder Personen. Fakten aus Quellen immer mit eigenen Worten umschreiben, nie Sätze kopieren. Bei Blaulicht keine Namen von Verdächtigen/Opfern, Unschuldsvermutung.

## Rubriken und Themen (topic exakt so)
- politik: Innenpolitik, Parlament, Europa, Gemeinden
- wirtschaft: Konjunktur, Unternehmen, Finanzen, Arbeit & Karriere, Gründen, Medien & PR
- chronik: Österreich, Wien, Verkehr, Wetter
- bauen-wohnen: Bauen, Sanieren, Immobilien, Garten
- energie: Photovoltaik, Heizen, Förderungen, Klima
- gesundheit: Medizin, Pflege, Ernährung, Psyche
- kultur: Bühne, Musik, Ausstellungen, Ausflüge
- lifestyle: Essen & Trinken, Mobilität, Reisen, Schönheit
region: wien, niederoesterreich, burgenland, oberoesterreich, steiermark, kaernten, salzburg, tirol, vorarlberg oder null.

## SEO (Yoast-Regeln)
- Titel: wichtigstes Keyword ZUERST, so wie gesucht wird („PV-Anlage in Wien: …“, „Überfall in Wien-Favoriten: …“, „Politik Wien: …“), max. ca. 70 Zeichen.
- focus_keyword (1–3 Wörter), keywords (6–10, kurze + Longtail), meta_title (≤60 Zeichen, Keyword zuerst), meta_description (130–155 Zeichen, Keyword am Anfang, Handlungsanreiz), slug (Keyword vorne, a-z0-9-, ≤70 Zeichen).
- Fokus-Keyword im ersten Satz und in einer Zwischenüberschrift.
- body 450–750 Wörter, Markdown nur: Absätze mit Leerzeile, „## “ Zwischenüberschriften (3–5), Listen „- “/„1. “, sparsam **fett**. Keine H1/Tabellen/HTML.
- faq: 2–3 kurze Fragen/Antworten. teaser ≤220 Zeichen.
- image_prompt (Englisch, fotorealistisch, einzigartiges Motiv passend zum Beitrag, österreichischer Kontext, „no text, no logos, no readable signs“, keine realen Personen), image_alt (Deutsch, mit Keyword).
- service: true bei Dienstleister-Themen (PV, Wärmepumpe, Heizung, Sanierung, Fassade, Hausbau, Kran, Abbruch, Pergola/Garten, Gewerbe/Konzession, Immobilien-Angebote) – dann erscheint im Beitrag die Partner-Empfehlung mit Leadformular.

## JSON-Format
{"slug":"","title":"","meta_title":"","meta_description":"","focus_keyword":"","keywords":[],"teaser":"","body":"","category":"","topic":"","region":null,"kind":"news","author":"Presseinfo Redaktion","source_name":"","source_url":"","published_at":"2026-10-22T08:15:00+02:00","image_prompt":"","image_alt":"","service":false,"faq":[{"q":"","a":""}]}

## Veröffentlichen
1. JSON nach /tmp/beitrag.json schreiben.
2. Bild (wenn Higgsfield-Guthaben reicht): generate_image (16:9, image_prompt), Ergebnis mit curl laden und als
   public/assets/img/artikel/<slug>.webp (1600 px breit, Qualität 78) und <slug>-sm.webp (640 px, Qualität 72) speichern (ImageMagick convert). Ohne Guthaben ohne Bild veröffentlichen (die Seite zeigt dann eine Titelkarte, nie ein doppeltes Foto).
3. node content/new-article.mjs /tmp/beitrag.json  (legt migrations/<zeit>_artikel.sql an; Bild wird automatisch verknüpft, wenn die Datei existiert)
4. git add -A && git commit -m "Artikel: <slug>"; dann pushen und deployen.
