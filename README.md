# ❄️ Eisfach - Lager- und Bestandsverwaltung

Eisfach ist ein modernes, leichtgewichtigenes Lager- und Bestandsverwaltungssystem (speziell für Gefrierschränke, Tiefkühllager und Vorratsräume), entwickelt für **Debian 13 Trixie**. Es basiert auf einem **Python (FastAPI)** Backend mit **SQLite**, einem **Web-Interface**, einer **Android PWA (ohne Google-Abhängigkeit)**, einer **nativen Android-App in Kotlin**, einem **Home Assistant Add-on** sowie einer **Home Assistant Integration**.

---

## 🚀 Features & Architektur

- **Backend:** Python FastAPI mit integrierter **SQLite**-Datenbank (kein separater Datenbank-Dienst wie MariaDB erforderlich). Automatisches Anlegen eines Admin-Benutzers (`admin` / `admin`) beim ersten Start.
- **Web-Interface:** Modernes HTML5 & JavaScript Dashboard mit Rollenverwaltung (Admin / Normalbenutzer) sowie Admin-Funktionen zum Erstellen, Bearbeiten, Löschen und Zurücksetzen von Benutzerkonten.
- **Android App (PWA & Native):**
  - **PWA (Web-App):** Offline-fähige Web-App mit JavaScript-Kamera-Scanner (`ZXing`), ohne jegliche Google-Abhängigkeit.
  - **Echte Native Android-App (Kotlin):** Komplettes Android Studio Projekt (`/android/native`) mit nativer Kamera-Barcode-Erkennung (ZXing Android Embedded), REST-API-Kommunikation und vollem Funktionsumfang ohne Google Play Services.
- **Barcode / QR-Code Logik:**
  - Automatisches Scannen und Prüfen von Barcodes/QR-Codes (`/api/lager/scan`).
  - **Entnahme-Logik:** Wenn Menge = 1, wird das Produkt für 30 Tage versteckt (Soft-Delete mit automatischer Löschung nach 30 Tagen); wenn Menge > 1, wird die Menge um 1 reduziert.
  - **Weiteres Teil:** Erhöht die Menge eines Artikels um 1.
  - **Neuanlage:** Erstellt ein neues Produkt mit automatischer Einlagerung (heutiges Datum), Barcode, Lagerort und einer automatisch generierten **Jahr-Monat-Nummer**-ID (z. B. `2026-10-1`, aufsteigend ab 1).
  - **Verknüpfung:** Verknüpft neue Barcodes mit bestehenden Produkten.
- **Home Assistant Add-on:** Komplett gekapseltes Home Assistant Add-on (`/home/korbinian.musch@ad.au-musch.de/Dokumente/Eisfach/homeassistant/addon`), das das FastAPI-Backend und SQLite direkt innerhalb von Home Assistant ausführt.
- **Home Assistant Integration:** Über HACS installierbare Custom Integration mit anpassbarem Abfrageintervall und einer interaktiven Markdown-Dashboard-Karte.

---

## 📂 Projektstruktur

```text
/home/korbinian.musch@ad.au-musch.de/Dokumente/Eisfach/
├── android/
│   ├── app/              # Android PWA Web-App (HTML/JS/ZXing)
│   └── native/           # Echte native Android-App (Kotlin / Android Studio)
├── backend/
│   ├── main.py           # FastAPI Hauptanwendung & Admin-Initialisierung
│   ├── database.py       # SQLite Datenbankverbindung
│   ├── auth.py           # JWT Authentifizierung
│   └── routers/          # API Router (auth, lager, locations, home_assistant)
├── config/
│   └── schema.sql        # SQLite Datenbank-Schema
├── homeassistant/
│   ├── addon/            # Home Assistant Add-on (Docker, config.yaml, run.sh)
│   └── custom_components/# Home Assistant Custom Integration (Sensor)
├── web/                  # Web-Frontend (HTML/JS)
├── README.md             # Diese Dokumentation
└── INSTALL.md            # Detaillierte Installationsanleitung
```

---

## 📖 Dokumentation & Installation

Detaillierte Installationsschritte für Server, Web-Frontend, Android-App und Home Assistant finden Sie in der [INSTALL.md](INSTALL.md).
