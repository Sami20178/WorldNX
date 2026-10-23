# WorldNX

WorldNX ist als **nächste Generation von OmniNX** geplant.

Dieses Repository ist absichtlich auf den **Node.js-Server und unmittelbar erforderliche Serverdateien** beschränkt. Der restliche Quellcode, Architektur, Integrationsmanifest und Tests gehören nach [WorldNX-Source-Code](https://github.com/Sami20178/WorldNX-Source-Code).

## Server starten
Voraussetzung: Node.js 20 oder neuer.

```sh
npm start
```

Standardmäßig lauscht der Server auf Port 3000. `PORT` und `HOST` können per Umgebungsvariable gesetzt werden.

## Aktueller Status
Der Server stellt zunächst nur einen einfachen Health-Endpunkt und Projektdaten bereit. Das ist ein überprüfbares Fundament, noch kein vollständiger NEX-/Nintendo-Online-Dienst. Weitere Protokolle werden getrennt geplant, getestet und anhand der jeweiligen Lizenzen integriert.
