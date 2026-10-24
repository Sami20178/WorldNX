# WorldNX

WorldNX ist als **nächste Generation von OmniNX** geplant.

Dieses Repository ist strikt auf den **Node.js-Server und unmittelbar erforderliche Serverdateien** beschränkt. Architektur, eigentlicher Quellcode außerhalb des Server-Laufzeitpakets, Integrationsmanifest und Tests gehören nach [WorldNX-Source-Code](https://github.com/Sami20178/WorldNX-Source-Code).

## Server starten
Voraussetzung: Node.js 20 oder neuer.

```sh
npm start
```

Standardmäßig lauscht der Server auf Port 3000. `PORT` und `HOST` können per Umgebungsvariable gesetzt werden.

## Checks
`npm test` prüft die Syntax von `server.js`. Die HTTP-Vertragstests liegen im Source-Code-Repository und testen den Server separat.

## Aktueller Status
Der Server stellt zunächst nur Health-Endpunkte und Projektdaten bereit. Das ist ein überprüfbares Fundament, noch kein vollständiger NEX-/Nintendo-Online-Dienst. Weitere Protokolle werden getrennt geplant, getestet und anhand der jeweiligen Lizenzen integriert.
