# ❄️ Eisfach - Lager- und Bestandsverwaltung

Eisfach ist ein modernes, leichtgewichtigenes Lager- und Bestandsverwaltungssystem (speziell für Gefrierschränke, Tiefkühllager und Vorratsräume), entwickelt für **Debian 13 Trixie**. Es basiert auf einem **Python (FastAPI)** Backend mit **SQLite**, einem **Web-Interface**, einer **Android PWA (ohne Google-Abhängigkeit)**, einer **nativen Android-App in Kotlin**, einem **Home Assistant Add-on** sowie einer **Home Assistant Integration**.

---

## 🚀 Features & Architektur

- **Backend:** Python FastAPI mit integrierter **SQLite**-Datenbank (kein separater Datenbank-Dienst wie MariaDB erforderlich). Automatisches Anlegen eines Admin-Benutzers (`admin` / `admin`) beim ersten Start.
- **Web-Interface:** Modernes HTML5 & JavaScript Dashboard mit Rollenverwaltung (Admin / Normalbenutzer). Administratoren können Benutzerkonten erstellen, Benutzernamen und Rollen bearbeiten, Passwörter zurücksetzen sowie Konten löschen.
- **Android App (PWA & Native):**
  - **PWA (Web-App):** Offline-fähige Web-App mit JavaScript-Kamera-Scanner (`ZXing`), ohne jegliche Google-Abhängigkeit.
  - **Echte Native Android-App (Kotlin):** Komplettes Android Studio Projekt (`/android/native`) mit nativer Kamera-Barcode-Erkennung (ZXing Android Embedded), REST-API-Kommunikation und vollem Funktionsumfang ohne Google Play Services.
- **Barcode / QR-Code Logik:**
  - Automatisches Scannen und Prüfen von Barcodes/QR-Codes (`/api/lager/scan`).
  - **Entnahme-Logik:** Wenn Menge = 1, wird das Produkt für 30 Tage versteckt (Soft-Delete mit automatischer Löschung nach 30 Tagen); wenn Menge > 1, wird die Menge um 1 reduziert.
  - **Weiteres Teil:** Erhöht die Menge eines Artikels um 1.
  - **Neuanlage:** Erstellt ein neues Produkt mit automatischer Einlagerung (heutiges Datum), Barcode, Lagerort und einer automatisch generierten **Jahr-Monat-Nummer**-ID (z. B. `2026-10-1`, aufsteigend ab 1).
  - **Verknüpfung:** Verknüpft neue Barcodes mit bestehenden Produkten.
- **Home Assistant Add-on:** Komplett gekapseltes Home Assistant Add-on im Repository-Stammverzeichnis, das das FastAPI-Backend und SQLite direkt innerhalb von Home Assistant ausführt.
- **Home Assistant Integration:** Über HACS installierbare Custom Integration mit anpassbarem Abfrageintervall und einer interaktiven Markdown-Dashboard-Karte.

## 👥 Benutzerverwaltung

Melden Sie sich mit einem Admin-Konto an und öffnen Sie **Admin → Benutzerverwaltung**. Dort können Sie Konten erstellen, bearbeiten und löschen. Beim Bearbeiten ist ein leeres Passwortfeld gleichbedeutend damit, das bestehende Passwort beizubehalten. Die eigene Sitzung kann nicht gelöscht oder zum normalen Benutzer herabgestuft werden; außerdem muss mindestens ein Admin-Konto bestehen bleiben.

Bei einer frischen eigenständigen Serverinstallation lautet der erste Login `admin` / `admin`. Ändern Sie dieses Standardpasswort in der Benutzerverwaltung, bevor Sie den Server anderen Geräten oder Netzwerken zugänglich machen.

Im Home-Assistant-Add-on gibt es zwei Zugänge: Port **8000** ist die normale Weboberfläche mit Eisfach-Login und wird direkt auf Host-Port 8000 veröffentlicht. Port **8001** ist nicht als Host-Port veröffentlicht und dient Home Assistant Ingress. Über Ingress erfolgt der Login automatisch; jeder Home-Assistant-Benutzer mit Zugriff auf dieses Ingress erhält in Eisfach Admin-Rechte. Bei einer eigenständigen Serverinstallation bleibt der Eisfach-Login aktiv.

Im Home-Assistant-Add-on wird die SQLite-Datenbank dauerhaft unter `/config/eisfach/eisfach.db` gespeichert. Beim Update versucht das Startskript, eine noch vorhandene Datenbank aus dem früheren Container-Pfad zu übernehmen, wenn die persistente Datenbank noch leer ist.

---

## 📂 Projektstruktur

```text
Eisfach/
├── android/
│   ├── Web-App/          # Android Web-App (HTML/JS)
│   └── native/           # Native Android-App (Kotlin / Android Studio)
├── backend/              # FastAPI, SQLite-Anbindung und API-Router
├── config/
│   └── schema.sql        # SQLite Datenbank-Schema
├── custom_components/
│   └── eisfach/          # Home Assistant Custom Integration
├── web/                  # Web-Frontend (HTML/JS)
├── config.yaml           # Home Assistant Add-on-Konfiguration
├── Dockerfile            # Add-on-Container
├── run.sh                # Add-on-Startskript
├── README.md             # Diese Dokumentation
└── INSTALL.md            # Detaillierte Installationsanleitung
```

---

## 📖 Dokumentation & Installation

Detaillierte Installationsschritte für Server, Web-Frontend, Android-App und Home Assistant finden Sie in der [INSTALL.md](INSTALL.md).
