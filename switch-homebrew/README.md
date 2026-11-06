# WorldNX Homebrew (NRO)

Ein kleines, read-only Diagnoseprogramm fuer Nintendo-Switch-Homebrew. Es zeigt die erkannte Horizon-Firmwareversion an und prueft eine Controller-Eingabe.

## Build

Voraussetzungen: devkitA64, libnx und die devkitPro Switch-Toolchain.

```sh
cd switch-homebrew
make
```

Die Datei entsteht unter `build/WorldNX.nro`.

## Kompatibilitaet

Das NRO-Format und der Build sind fuer die Nintendo-Switch-Homebrew-Toolchain vorgesehen. **Nintendo Switch 2-Kompatibilitaet ist nicht bestaetigt** und muss auf einem rechtmaessig nutzbaren, kompatiblen Testsystem geprueft werden. Dieses Projekt enthaelt keinen Exploit, keine Firmware-Aenderung und keine Umgehung von Schutzmechanismen.
