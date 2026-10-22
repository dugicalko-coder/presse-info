import { createFileRoute } from "@tanstack/react-router";

import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/redaktion")({
  head: () => pageHead({ title: "Redaktion & Grundsätze", description: "Wer hinter Presseinfo steht und nach welchen Grundsätzen die Redaktion arbeitet.", path: "/redaktion" }),
  component: () => (
    <section className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <h1 className="font-pi-serif text-4xl font-semibold tracking-tight md:text-5xl">Redaktion & Grundsätze</h1>
      <div className="pi-prose pi-plain mt-8">
        <p>Presseinfo ist ein Online-Medium der Digital Denker e.U. in Wien. Die Redaktion berichtet über Politik, Wirtschaft, Bauen &amp; Wohnen, Energie, Gesundheit und Kultur in Österreich und veröffentlicht Presseaussendungen von Unternehmen, Vereinen und Gemeinden.</p>
        <h2>Unsere Grundsätze</h2>
        <ul><li>Nachrichten beruhen auf nachprüfbaren Quellen, die wir am Ende des Beitrags nennen.</li><li>Redaktionelle Beiträge und Presseaussendungen werden klar getrennt und gekennzeichnet.</li><li>KI-Werkzeuge unterstützen uns beim Schreiben; jeder Beitrag wird von der Redaktion geprüft.</li><li>Fehler korrigieren wir rasch und transparent.</li></ul>
        <h2>Kontakt</h2>
        <p>Hinweise, Korrekturen und Presseaussendungen an <a className="pi-link" href="mailto:redaktion@presseinfo.at">redaktion@presseinfo.at</a>.</p>
      </div>
    </section>
  ),
});
