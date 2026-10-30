# WorldNX

WorldNX ist als **nächste Generation von OmniNX** geplant.

Dieses Repository ist strikt auf den **Node.js-Server und unmittelbar erforderliche Serverdateien** beschränkt. Architektur, eigentlicher Quellcode außerhalb des Server-Laufzeitpakets, Integrationsmanifest und Tests gehören nach [WorldNX-Source-Code](https://github.com/Sami20178/WorldNX-Source-Code).

## Server starten
Voraussetzung: eine unterstützte Node.js-LTS-Version 22.x, 24.x oder 26.x. Empfohlen ist 26.x; Node.js 20 ist seit 2026-04-30 End-of-Life.

```sh
npm start
```

Standardmäßig lauscht der Server auf Port 3000. `PORT` und `HOST` können per Umgebungsvariable gesetzt werden.

## Health and readiness
- `GET /healthz` and `GET /api/health` report that the HTTP process is running.
- `GET /readyz` and `GET /api/ready` validate the server catalog and report readiness. They return HTTP 503 if the catalog is missing or invalid.

## Checks
`npm test` prüft die Syntax von `server.js`. Die HTTP-Vertragstests liegen im Source-Code-Repository und testen den Server separat.

## Geplantes WorldNX.zip- und USB-Angebot
WorldNX soll ein versioniertes `WorldNX.zip`-Paket und einen Dienst zur USB-Dateiübertragung eines ausgewählten CFW-Packs erhalten. Der Dienst ist noch nicht als fertige Funktion bestätigt. Er muss auf einer dokumentierten, vom Zielgerät unterstützten Dateiübertragungsschnittstelle basieren und vor dem Kopieren Ziel, Speicherplatz und Prüfsumme prüfen. USB-Dateiübertragung allein installiert oder aktiviert keine CFW.

Die Planung und Tests dazu liegen in [WorldNX-Source-Code](https://github.com/Sami20178/WorldNX-Source-Code/blob/main/docs/WorldNX-zip-usb-transfer-service.md). Switch 2 mit Systemversion 23.0.1 bleibt derzeit unbestätigt.

## Aktueller Status
Der Server stellt zunächst nur Health-Endpunkte und Projektdaten bereit. Das ist ein überprüfbares Fundament, noch kein vollständiger NEX-/Nintendo-Online-Dienst. Weitere Protokolle werden getrennt geplant, getestet und anhand der jeweiligen Lizenzen integriert.
