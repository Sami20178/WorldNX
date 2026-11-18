# WorldNX

WorldNX ist als **nächste Generation von OmniNX** geplant.

Dieses Repository ist strikt auf den **Node.js-Server und unmittelbar erforderliche Serverdateien** beschränkt. Architektur, eigentlicher Quellcode außerhalb des Server-Laufzeitpakets, Integrationsmanifest und Tests gehören nach [WorldNX-Source-Code](https://github.com/Sami20178/WorldNX-Source-Code).

## Server starten
Voraussetzung: eine unterstützte Node.js-LTS-Version 22.x, 24.x oder 26.x. Empfohlen ist 26.x; Node.js 20 ist seit 2026-04-30 End-of-Life.

```sh
npm start
```

Standardmäßig lauscht der Server auf Port 3000. `PORT` und `HOST` können per Umgebungsvariable gesetzt werden; `HOST` muss eine gültige IP-Adresse oder ein DNS-Hostname sein. Ungültige Werte verhindern den Start. `APP_ORIGIN` ist optional und muss eine reine HTTPS-Origin sein (HTTP ist nur für Loopback-Entwicklung erlaubt). Diese Origin steuert die gezielte CORS-Freigabe.

Bei `SIGTERM` oder `SIGINT` schließt der Server den Listener geordnet und lässt laufende Anfragen auslaufen.

## Health and readiness
- `GET /healthz` and `GET /api/health` report that the HTTP process is running.
- `GET /readyz` and `GET /api/ready` validate the server catalog and report readiness. They return HTTP 503 if the catalog is missing or invalid.

## Checks
`npm test` prüft die Syntax von `server.js`. Die HTTP-Vertragstests liegen im Source-Code-Repository und testen den Server separat.

## Geplantes WorldNX.zip- und USB-Angebot
WorldNX soll ein versioniertes `WorldNX.zip`-Paket und einen Dienst zur USB-Dateiübertragung eines ausgewählten CFW-Packs erhalten. Der Dienst ist noch nicht als fertige Funktion bestätigt. Er muss auf einer dokumentierten, vom Zielgerät unterstützten Dateiübertragungsschnittstelle basieren und vor dem Kopieren Ziel, Speicherplatz und Prüfsumme prüfen. USB-Dateiübertragung allein installiert oder aktiviert keine CFW.

Die Planung und Tests dazu liegen in [WorldNX-Source-Code](https://github.com/Sami20178/WorldNX-Source-Code/blob/main/docs/WorldNX-zip-usb-transfer-service.md). Switch 2 mit Systemsoftware **23.5.0** (veröffentlicht am 10. November 2026) ist die aktuell dokumentierte Version; WorldNX-Kompatibilität bleibt **unverifiziert** und echte USB-Übertragung bleibt **nicht getestet**.

## Aktueller Status
Der Server stellt zunächst nur Health-Endpunkte und Projektdaten bereit. Das ist ein überprüfbares Fundament, noch kein vollständiger NEX-/Nintendo-Online-Dienst. Weitere Protokolle werden getrennt geplant, getestet und anhand der jeweiligen Lizenzen integriert.


## Read-only MCP endpoint

Der Server enthält einen MCP-Streamable-HTTP-Endpunkt unter `POST /mcp`. Er ist ausschließlich für öffentliche Projekt- und Katalogmetadaten vorgesehen. Die Tools sind:

- `get_api_health` — Prozess-/Katalogstatus
- `get_project_info` — öffentliche Repository- und Projektinformationen
- `list_catalog_entries` — gefilterte Katalogmetadaten
- `get_catalog_entry` — ein einzelner Metadateneintrag

Die MCP-Ausgabe enthält bewusst keine Download-URLs, Prüfsummen, Firmware, Schlüssel, Installationsanleitungen oder Geräteaktionen. Es gibt keine Benutzerkonten- oder Schreibwerkzeuge.

Für die Freigabe des MCP-Endpunkts ist `MCP_ALLOWED_HOSTS` erforderlich: eine kommaseparierte Liste exakter Hostnamen ohne Port oder Wildcard. Ohne diese Einstellung antwortet `/mcp` mit HTTP 503. Ein vorhandener `Origin`-Header muss exakt zu `APP_ORIGIN` passen. Der Endpunkt ist stateless; für private Daten oder Schreibaktionen wäre vor einer Erweiterung ein separates OAuth-/Berechtigungsdesign nötig.

Die Route ist in diesem Branch implementiert, aber **nicht auf einem öffentlichen Host deployed**. Eine ChatGPT-Verbindung ist daher noch nicht aktiv.

## Checks

`npm install --ignore-scripts --no-audit --no-fund` installiert die fest gepinnten direkten Abhängigkeiten. `npm test` prüft Syntax und MCP-HTTP-Verträge mit Node.js-Bordmitteln.
