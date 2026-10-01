# Ein hoher Wert, ein wichtiger Unterschied

Dies sind gespeicherte Ergebnisse eines echten lokalen Modelllaufs vom 1. Oktober 2026. Beim Öffnen dieser Datei läuft kein Modell. Die Beispielnachrichten wurden für den Unterricht erfunden. Es sind keine echten Kundendaten.

Lies zuerst nur diese Anfrage:

> I received the refund of 25 euros.

Das bedeutet: Ich habe die Erstattung von 25 Euro erhalten. Welche Information sollte ein passender früherer Fall enthalten? Schreibe deine Vermutung in die Lernoberfläche, bevor du weiterliest.

## Beobachtung aus dem Modelllauf

Der erste semantische Treffer war F07:

> I did NOT receive the refund of 25 euros.

Der gemessene Ähnlichkeitswert war **0.9302392517570891**. Beide Texte handeln von einer Erstattung und 25 Euro. Trotzdem widersprechen sie sich in einem entscheidenden Punkt: erhalten oder nicht erhalten. Der Wert ist weder eine Wahrscheinlichkeit für die richtige Antwort noch eine Erlaubnis, Geld zu erstatten.

Ändern wir die Anfrage zu `I did NOT receive the refund of 25 euros.`, bleibt F07 an erster Stelle, mit **0.9670659040005214**. Auch ein sehr ähnlicher Text braucht fachliche Prüfung. Die Anfrage erhält einen Suchpräfix, die gespeicherten Beispiele nicht; identische sichtbare Sätze erzwingen deshalb keinen Wert von genau eins.

## Deine Entscheidung

Ergänze deine Begründung in der Lernoberfläche: Welches einzelne Wort würde deine Entscheidung über diesen Treffer ändern? Nenne außerdem eine Information, die vor einer tatsächlichen Erstattung noch geprüft werden sollte. Exportiere deine Antworten.

## Noch ein Vergleich

Die Anfrage `My plastic vanished on the train.` führte im Modelllauf zu F05: `I lost my card on the train. Please help me block it.`. Der Wert war **0.669877892077344**. Das ist ein Vorschlag zur Prüfung. Das Programm weiß nicht, ob wirklich eine Karte verloren ging. Auch die einfache Wortsuche fand F05 zuerst. Dieser Lauf belegt deshalb keinen allgemeinen Vorteil des Modells gegenüber der Wortsuche.

## Nachvollziehbare Herkunft

- Modell: `Xenova/bge-small-en-v1.5`, Revision `ea104dacec62c0de699686887e3f920caeb4f3e3`.
- Lauf: q8 auf CPU, 384 Dimensionen, mean pooling, L2-Vektornormalisierung.
- Daten: zwölf neu geschriebene synthetische englische Supportnachrichten, CC0-1.0.
- Textbereinigung: Leerraum an Rändern entfernen und Folgen von Leerraum zusammenfassen. Original bleibt erhalten. Keine automatische Übersetzung.
- [Vollständige gespeicherte Antworten](real-model-observation.json).
- [Primäre Modellkarte](https://huggingface.co/Xenova/bge-small-en-v1.5).

Der Start des Modells und ein erster Download brauchen zusätzlich Zeit und Netzwerkzugriff. Die Lernoberfläche und das erste HTTP-Experiment benötigen diese Gewichte nicht.
