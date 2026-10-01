# Fallfinder: dein neuer Projektordner

Eine kleine Suche soll ähnliche Supportfälle zeigen. Eine Person entscheidet anschließend, ob der Treffer passt. Die erste Etappe startet einen lokalen Server. Es gibt noch keine Modellsuche.

Öffne ein Terminal im Ordner `starter`. Prüfe mit `node --version`, ob Node 24.12.0 oder neuer verfügbar ist. Die Befehle sind für Bash im Lernarbeitsplatz oder Git Bash gedacht.

```bash
node create-project.mjs fallfinder
cd fallfinder
node --check src/server.ts
npm install --ignore-scripts
npm start
```

Die erste Zeile erstellt den neuen Ordner samt `package.json` und `src/server.ts`. Ein vorhandener Ordner wird nicht überschrieben. Die dritte Zeile prüft den Einstieg auf Syntaxfehler, startet aber keinen Server. Die Pakete sind Hono 4.13.11 und @hono/node-server 2.1.3. Die erste Installation braucht Internet und zusätzliche Einrichtungszeit.

Öffne ein zweites Terminal und prüfe:

```bash
curl -sS http://localhost:3217/health
```

Erwartet: `{"project":"Fallfinder","ready":true}`. Das bestätigt den HTTP-Einstieg, keine Modellinferenz. Halte deinen Server im ersten Terminal mit Strg+C an.

Deine erste eigene Änderung: Ändere die Eingabe in der Lernoberfläche. Notiere vorher, ob `not` und `20` erhalten bleiben sollten. Exportiere deine Beobachtung als JSON. Den Normalisierungs-Endpunkt ergänzen wir gemeinsam in `src/server.ts`.

Bei `EADDRINUSE` läuft schon etwas auf Port 3217. Beende keinen fremden Prozess. Prüfe dein eigenes Terminal und frage nach dem belegten Port. Bei `ECONNREFUSED` prüfe, ob dein eigener Server gestartet ist. Bei einem vorhandenen Projektordner lies zuerst seine `package.json`, statt neu zu erzeugen.
