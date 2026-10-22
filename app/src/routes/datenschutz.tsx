import { createFileRoute } from "@tanstack/react-router";

import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/datenschutz")({
  head: () => pageHead({ title: "Datenschutz", description: "Datenschutzerklärung von Presseinfo: welche Daten wir verarbeiten und welche Rechte Sie haben.", path: "/datenschutz" }),
  component: () => (
    <section className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <h1 className="font-pi-serif text-4xl font-semibold tracking-tight md:text-5xl">Datenschutz</h1>
      <div className="pi-prose pi-plain mt-8">
        <p>Verantwortlich für die Datenverarbeitung ist die Digital Denker e.U., Wattgasse 33, 1160 Wien, <a className="pi-link" href="mailto:redaktion@presseinfo.at">redaktion@presseinfo.at</a>.</p>
        <h2>Newsletter</h2>
        <p>Wenn Sie den Presseinfo-Brief abonnieren, speichern wir Ihre E-Mail-Adresse, um Ihnen den Newsletter zu senden (Art. 6 Abs. 1 lit. a DSGVO). Sie können sich jederzeit abmelden.</p>
        <h2>Einreichung von Presseaussendungen</h2>
        <p>Für die Bearbeitung Ihrer Einreichung verarbeiten wir die angegebenen Kontaktdaten und Inhalte (Art. 6 Abs. 1 lit. b DSGVO). Die Kontaktdaten werden nicht veröffentlicht; veröffentlicht werden nur Firmenname, Website und der freigegebene Text.</p>
        <h2>Server und Hosting</h2>
        <p>Beim Aufruf der Website werden technisch notwendige Daten wie IP-Adresse und Zeitpunkt verarbeitet, um die Seite sicher auszuliefern. Wir setzen keine Tracking-Cookies ein.</p>
        <h2>Ihre Rechte</h2>
        <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch sowie das Recht auf Beschwerde bei der österreichischen Datenschutzbehörde.</p>
      </div>
    </section>
  ),
});
