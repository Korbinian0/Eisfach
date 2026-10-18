# 📥 Eisfach - Installationsanleitung

Diese Anleitung beschreibt die Installation und Einrichtung von **Eisfach** auf einem **Debian 13 Trixie** System sowie die Verwendung der Android-App und Home Assistant Integration.

---

## 1. Server-Installation (Python FastAPI & SQLite)

### Systemvoraussetzungen
- Python 3.10+
- SQLite3
- Apache2 (optional als Reverse Proxy)

### Schritte:
1. **Repository klonen** nach `/opt/Eisfach` und in das Backend-Verzeichnis wechseln:
   ```bash
   sudo git clone https://github.com/Korbinian0/Eisfach.git /opt/Eisfach
   cd /opt/Eisfach/backend
   ```
2. **Python Virtual Environment einrichten**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Datenbank initialisieren** (optional, da die Tabellen beim Start automatisch erstellt werden):
   ```bash
   sqlite3 eisfach.db < ../config/schema.sql
   ```
4. **Backend manuell starten**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   Öffnen Sie anschließend `http://<server-ip>:8000` im Browser. Beim ersten Start wird automatisch das Admin-Konto `admin` mit dem Passwort `admin` angelegt. Ändern Sie dieses Passwort direkt nach der ersten Anmeldung unter **Admin → Benutzerverwaltung → Bearbeiten**, bevor Sie den Server für andere Geräte oder Netzwerke freigeben.

### Benutzerkonten verwalten

Öffnen Sie nach der Anmeldung als Administrator den Reiter **Admin** und verwenden Sie den Bereich **Benutzerverwaltung**:
- **Erstellen:** Benutzername, Passwort und Rolle (Benutzer oder Admin) festlegen.
- **Bearbeiten:** Benutzername und Rolle ändern. Ein neues Passwort wird nur gesetzt, wenn das Passwortfeld ausgefüllt wird; ein leeres Feld lässt das bisherige Passwort unverändert.
- **Löschen:** Ein Konto nach Bestätigung entfernen.

Das eigene Admin-Konto kann nicht gelöscht oder zum normalen Benutzer herabgestuft werden. Auch das letzte verbleibende Admin-Konto kann weder gelöscht noch herabgestuft werden. Benutzerverwaltungs-Endpunkte sind serverseitig Admin-geschützt.

### Systemd Autostart-Dienst (`/etc/systemd/system/eisfach.service`)
```ini
[Unit]
Description=Eisfach FastAPI Backend
After=network.target

[Service]
User=root
WorkingDirectory=/opt/Eisfach/backend
ExecStart=/opt/Eisfach/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```
Aktivieren mit:
```bash
sudo systemctl daemon-reload
sudo systemctl enable eisfach
sudo systemctl start eisfach
```

---

## 2. Android-App Installation

### Option A: Native Android-App (Kotlin)
1. Öffnen Sie den Ordner `/opt/Eisfach/android/native` als Projekt in **Android Studio**.
2. Kompilieren Sie die App (keine Google Play Services erforderlich).
3. Installieren Sie die APK auf Ihrem Android-Gerät.
4. Geben Sie beim Start die Server-URL (z. B. `http://<server-ip>:8000`) und Ihre Login-Daten (`admin` / `admin`) ein.

### Option B: Android PWA (Web-App)
1. Hosten Sie den Ordner `android/Web-App` auf einem Webserver oder nutzen Sie ihn lokal.
2. Die App nutzt HTML5 MediaDevices und ZXing JS für den kamerabasierten Barcode-Scan.

---

## 3. Home Assistant Integration & Add-on (via GitHub)

### Add-on Installation via GitHub Repository
1. Gehen Sie in Home Assistant zu **Einstellungen** ➡️ **Add-ons** ➡️ **Add-on-Store**.
2. Klicken Sie oben rechts auf die drei Punkte (**⋮**) ➡️ **Repositories**.
3. Fügen Sie die Repository-URL hinzu:
   ```text
   https://github.com/Korbinian0/Eisfach
   ```
4. Nach dem Laden finden Sie das **Eisfach Inventar Server** Add-on im Store, können es installieren und starten.

### Sensor Integration (via HACS / GitHub)
1. Fügen Sie dieses Repository (`https://github.com/Korbinian0/Eisfach`) in **HACS** als benutzerdefiniertes Repository (Kategorie: *Integration*) hinzu oder kopieren Sie den Ordner `homeassistant/custom_components/eisfach` nach `/config/custom_components/eisfach`.
2. Starten Sie Home Assistant neu.
3. Fügen Sie die Integration über **Einstellungen** ➡️ **Geräte & Dienste** ➡️ **Integration hinzufügen** hinzu.
4. Nutzen Sie die Markdown-Karte auf Ihrem Dashboard.
