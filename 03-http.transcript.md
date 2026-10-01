# Eine Nachricht geht auf die Reise

Illustration, keine Bildschirmaufnahme.

## Wer verändert den Text?

Wir schicken eine Nachricht an Fallfinder und schauen auf die Antwort.

Wer entfernt die zusätzlichen Leerzeichen: die Anfrage oder unser Backend? Legt euch fest.

## 1 · Die Anfrage bringt den Text

POST /normalize bekommt ein JSON-Objekt mit dem Feld text.

Die Adresse zeigt auf den lokalen Server. Die Leerzeichen reisen zunächst mit.

## 2 · Das Backend bearbeitet den Text

Unser Backend bewahrt das Original und erstellt eine bereinigte Kopie.

Es entfernt äußere Leerzeichen und fasst mehrere innere Leerzeichen zusammen.

## 3 · Die Antwort zeigt den Vergleich

Die Antwort enthält original, normalized und changed.

Das Wort not bleibt erhalten, weil es die Bedeutung verändert.

## Jetzt seid ihr dran

Sendet den Text einmal mit und einmal ohne zusätzliche Leerzeichen.

Vergleicht das Änderungsfeld in beiden Antworten. Die Zeichnung ersetzt euren echten Aufruf nicht.

## Die Änderung gehört ins Backend

Die Stimme in diesem Video ist synthetisch, erzeugt mit Piper, Stimme deutsch Thorsten high.

