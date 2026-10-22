import { createFileRoute } from "@tanstack/react-router";

import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/impressum")({
  head: () => pageHead({ title: "Impressum & Offenlegung", description: "Impressum und Offenlegung gemäß Mediengesetz für Presseinfo.", path: "/impressum" }),
  component: () => (
    <section className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <h1 className="font-pi-serif text-4xl font-semibold tracking-tight md:text-5xl">Impressum & Offenlegung</h1>
      <div className="pi-prose pi-plain mt-8">
        <p><strong>Medieninhaber, Herausgeber und Verleger:</strong><br />Digital Denker e.U.<br />Wattgasse 33, 1160 Wien, Österreich<br />E-Mail: <a className="pi-link" href="mailto:redaktion@presseinfo.at">redaktion@presseinfo.at</a></p>
        <h2>Offenlegung gemäß § 25 Mediengesetz</h2>
        <p>Medieninhaber: Digital Denker e.U., Wattgasse 33, 1160 Wien. Unternehmensgegenstand: Betrieb von Online-Medien und digitalen Diensten.</p>
        <p>Grundlegende Richtung: Presseinfo ist ein unabhängiges Online-Medium mit Nachrichten, Ratgebern und Presseaussendungen aus Österreich. Presseaussendungen Dritter sind als solche gekennzeichnet; für deren Inhalt ist der jeweilige Aussender verantwortlich.</p>
        <h2>Haftung für Links</h2>
        <p>Für Inhalte externer Websites, auf die wir verlinken, sind ausschließlich deren Betreiber verantwortlich.</p>
      </div>
    </section>
  ),
});
