# WorldNX v0.2.0 — Release-Entwurf

**Vorgeschlagener Release-Name:** WorldNX v0.2.0 — Server API & Mod Catalog Foundation

## Beschreibung (für GitHub Releases)

WorldNX ist die nächste Generation von OmniNX. Diese Version legt das Serverfundament für den Metadaten-Katalog und die weitere Entwicklung.

### Enthalten
- Node.js-Server mit Health-Endpunkten.
- `GET /api/mods` für Katalog-Metadaten.
- Begrenzte CORS-Freigabe über den exakt konfigurierten `APP_ORIGIN`.
- Automatisierte Tests für Katalogantworten, Health-Endpunkte, Fehlercodes und CORS.
- Keine Firmware, Konsolenschlüssel oder fremden Spielinhalte.

### Automatische App-Updates
Die Tastenkombination **ZR + ZL** ist als gewünschter Auslöser für eine Update-Prüfung vorgemerkt. Sie ist in diesem Server-Release **noch nicht als fertige Konsolenfunktion bestätigt**. Ein Client muss zuerst Controller-Eingaben zuverlässig erkennen, eine vertrauenswürdige Release-Quelle abfragen und Signatur/Hash prüfen. Installation darf nur über einen für das Zielgerät offiziell unterstützten Weg erfolgen und kann eine Bestätigung erfordern.

### Installations- und Verbindungswege
- **USB:** Verwende USB nur für Dateiübertragung oder Entwicklerfunktionen, die vom jeweiligen Gerät und seiner offiziellen Dokumentation unterstützt werden. Dieses Release enthält keinen Installer für Switch-2-Systemsoftware.
- **Nintendo-USB-C-Kabel/Dock:** Ein Kabel kann Stromversorgung oder unterstützte Datenverbindungen bereitstellen; es macht eine Android-APK nicht zu einer Switch-App. `cable_serial_checker.apk` und `normal_serial_checker.apk` sind in diesem Release nicht enthalten oder validiert.
- **Modchip / RCM / CFW:** Diese Wege sind nicht Bestandteil dieses Server-Releases und werden weder als unterstützt noch als kompatibel beworben. Keine Installationsschritte, Exploit-Dateien oder Sicherheitsumgehungen sind enthalten.
- **Andere Plattformen:** Für Android, Desktop und Server müssen getrennte, plattformspezifische Builds erstellt und getestet werden.

### Dateien und Formate
Dieses Repository veröffentlicht den Node.js-Server. Eine APK, EXE oder ISO ist kein austauschbares Format:
- **Server:** Quellcode und gegebenenfalls ein versioniertes ZIP-Archiv mit Serverdateien.
- **Android APK:** Nur nach Entwicklung und Test eines echten Android-Clients.
- **Windows EXE:** Nur nach Erstellung eines echten Windows-Clients bzw. geeigneten Pakets.
- **ISO:** Nicht passend für diesen Node.js-Server; nicht erzeugt.
Keine dieser plattformspezifischen Dateien darf als vorhanden beworben werden, solange sie nicht tatsächlich gebaut, geprüft und als Release-Asset angehängt wurde.

### Status / bekannte Einschränkungen
Dies ist eine frühe Entwicklungsgrundlage, kein vollständiger Modloader, keine CFW und kein offizieller Nintendo-Dienst. Mod-Einträge sind Metadaten; es gibt keinen Konsolen-Download- oder Installationsmechanismus.

### Vor Veröffentlichung prüfen
- [ ] CI für den Release-Commit erfolgreich
- [ ] `npm test` erfolgreich
- [ ] Release-Tag stimmt mit `package.json` überein
- [ ] Nur tatsächlich erzeugte und geprüfte Assets anhängen
- [ ] Lizenz und Herkunft jedes enthaltenen Drittanbieter-Artefakts geprüft
