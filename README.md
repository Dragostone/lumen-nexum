# Fallfinder

Eine neue Supportnachricht kommt an. Fallfinder soll ähnliche frühere Beispiele zur Prüfung anbieten. Du baust zuerst einen kleinen HTTP-Einstieg, bewahrst den Originaltext und prüfst eine nachvollziehbare Bereinigung. Danach vergleichst du Suchergebnisse und entscheidest, wann ein ähnlicher Text fachlich nicht passt.

## Beginne mit der Lernwerkstatt

[Lernwerkstatt öffnen](https://static.205.100.104.178.clients.your-server.de/unterricht/2026-10-01/)

Für die gemeinsame Antwortspeicherung erhältst du einen persönlichen Zugangslink oder Zugangscode von der Lehrkraft. Trage ihn ausschließlich in das Zugangsfeld ein. Nach einem bestätigten Speichern kann die Lehrkraft deine Antworten lesen. Die Seite zeigt den bestätigten Zeitpunkt. Bei einer unterbrochenen Verbindung bleiben lokale Eingaben erhalten; der JSON-Export ist eine zusätzliche Sicherung. Ein bloß ausgefülltes Textfeld bestätigt noch keine Serverspeicherung.

Neun Stationen bieten ungefähr 160 Minuten aktive Arbeit und zwei kurze Pausen. Das ist ein Arbeitsbudget, keine garantierte Dauer. Installationen kommen hinzu. Die Aufgaben enthalten Vorhersagen, bearbeitbare Texte, HTTP-Versuche, eine eigene Route, Gegenbeispiele und einen abschließenden Nachweis. Es gibt keine Wartezeiten zum Freischalten von Aufgaben.


Du untersuchst die Fälle wie eine Anfrage aus dem Arbeitsalltag: erst eine Vermutung festhalten, dann das Verhalten prüfen und schließlich eine Entscheidung begründen. Ein selbst gewählter Grenzfall, eine gezielt erzeugte Abweichung und die Übergabe an einen Kollegen gehören dazu. Die Hilfen stehen zum Nachschlagen bereit.

## Lokal verwenden

Das vollständige Paket mit Website, Starter und Videos liegt unter [Releases](https://github.com/OthmanAdi/fallfinder-lernwerkstatt/releases/tag/2026-10-01.1). Lade `fallfinder-lernwerkstatt-2026-10-01.zip` herunter, entpacke es und öffne ein Terminal im Ordner `learner`:

```bash
node serve.mjs
```

Öffne danach `http://localhost:3218`. Die lokale Ausgabe speichert zunächst im eigenen Browser. Verwende für die von der Lehrkraft sichtbaren Antworten die oben verlinkte gehostete Lernwerkstatt mit deinem persönlichen Zugang.

Wenn du das Repository klonst, liegen die MP4-Dateien separat im Release. Lade sie in `learner/videos` herunter. Bilder, Untertitel und Transkripte sind bereits im Repository. Es werden keine Pakete für die Lernoberfläche installiert.

## Ein eigenes Backend

Öffne ein Terminal im Ordner `starter` und lies dessen README. Der erste Befehl erstellt einen neuen Ordner und überschreibt kein vorhandenes Projekt:

```bash
node create-project.mjs fallfinder
cd fallfinder
node --check src/server.ts
npm install --ignore-scripts
npm start
```

Voraussetzung: Node 24.12.0 oder neuer. Hono 4.13.11 und @hono/node-server 2.1.3 sind festgelegt. Der Starter enthält zunächst nur `/health`. Station 3 erklärt den vollständigen Aufbau der Normalisierungsroute. Eine Modellinstallation ist für den Einstieg nicht nötig.

## Vier kurze Erklärvideos

1. Arbeitsplatz und neues Projekt: Terminal, Editor und Startdatei.
2. Original und normalisierte Kopie: Leerraum verändern, Bedeutung behalten.
3. HTTP und JSON: Anfrage, Backend und Antwort unterscheiden.
4. Embeddings und ähnliche Fälle: Vorschläge lesen und fachlich prüfen.

Jedes Video hat deutsche SRT- und WebVTT-Untertitel, ein Vorschaubild und ein Transkript. Die Bilder sind gezeichnete Illustrationen. Die Stimme ist synthetisch, erzeugt mit Piper (Stimme de_DE thorsten high). Zwei technische Grafiken wurden mit ImageGen erzeugt. Ein zusätzliches Ablaufdiagramm lässt sich untersuchen. Die Lernoberfläche bleibt ohne Ton nutzbar.

## Was tatsächlich ausgeführt wird

Die Textsimulation läuft im Browser. Dein eigener HTTP-Server entsteht im Projekt `fallfinder`. Die ausdrücklich als gespeichert bezeichneten Modellantworten stammen aus einem echten lokalen CPU-Lauf vom 1. Oktober 2026, laufen aber nicht beim Öffnen der Seite erneut.

Verwendet wurde `Xenova/bge-small-en-v1.5`, Revision `ea104dacec62c0de699686887e3f920caeb4f3e3`: englische Texte, q8 auf CPU, 384 Dimensionen, mean pooling und L2-Vektornormalisierung. Die zwölf Supportfälle wurden für den Unterricht geschrieben und unter CC0-1.0 bereitgestellt. Es handelt sich nicht um echte Kundendaten. Ein hoher Ähnlichkeitswert ist weder eine Wahrscheinlichkeit für die richtige Antwort noch eine Erlaubnis für eine Erstattung.

Quellen: [ONNX-Modellkarte](https://huggingface.co/Xenova/bge-small-en-v1.5), [ursprüngliches Modell](https://huggingface.co/BAAI/bge-small-en-v1.5), [Hono für Node.js](https://hono.dev/docs/getting-started/nodejs).

## Dein Ergebnis

Am Ende hast du einen neuen Projektordner, beobachtete HTTP-Antworten, eigene Testfälle und eine begründete Entscheidung über einen Modelltreffer. Halte deine Nachweise in einer README fest. Speichere deine Antworten für die Lehrkraft und exportiere zusätzlich eine JSON-Kopie. Verwende in dieser Übung keine echten Kundendaten.
