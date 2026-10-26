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
`npm test` führt die Node.js-Test-Suite aus. Die HTTP-Vertragstests im Source-Code-Repository prüfen zusätzlich den Vertrag zwischen Client und Server.

## Release-Entwurf
Ein vorsichtiger Release-Text und die Asset-Checkliste liegen unter [`docs/RELEASE-DRAFT-v0.2.0.md`](docs/RELEASE-DRAFT-v0.2.0.md). Er ist ein Entwurf, kein bereits veröffentlichter Release.

## Aktueller Status
Der Server stellt zunächst nur Health-Endpunkte und Projektdaten bereit. Das ist ein überprüfbares Fundament, noch kein vollständiger NEX-/Nintendo-Online-Dienst. Weitere Protokolle werden getrennt geplant, getestet und anhand der jeweiligen Lizenzen integriert.
