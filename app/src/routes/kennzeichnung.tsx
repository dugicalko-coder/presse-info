import { createFileRoute } from "@tanstack/react-router";

import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/kennzeichnung")({
  head: () => pageHead({ title: "Kennzeichnung", description: "Wie Presseinfo KI-Bilder, KI-unterstützte Texte und Presseaussendungen kennzeichnet.", path: "/kennzeichnung" }),
  component: () => (
    <section className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <h1 className="font-pi-serif text-4xl font-semibold tracking-tight md:text-5xl">Kennzeichnung</h1>
      <div className="pi-prose pi-plain mt-8">
        <p>Transparenz ist uns wichtig. Deshalb kennzeichnen wir drei Dinge klar und einheitlich.</p>
        <h2>KI-generierte Bilder</h2>
        <p>Symbolbilder, die mit KI erzeugt wurden, tragen direkt am Bild den Hinweis „KI-generiert“. Sie zeigen keine realen Ereignisse oder Personen.</p>
        <h2>KI-unterstützte Texte</h2>
        <p>Redaktionelle Beiträge können mit KI-Unterstützung entstehen. Jeder Text wird vor der Veröffentlichung von der Redaktion geprüft; Quellen nennen wir am Ende des Beitrags.</p>
        <h2>Presseaussendungen</h2>
        <p>Beiträge, die von Unternehmen, Vereinen oder Institutionen stammen, sind als „Presseaussendung“ gekennzeichnet und nennen den Aussender. Für ihren Inhalt ist der Aussender verantwortlich.</p>
      </div>
    </section>
  ),
});
