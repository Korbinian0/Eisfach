-- SQLite Schema für Eisfach

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role INTEGER NOT NULL DEFAULT 0 -- 0 = Normal User, 1 = Admin
);

CREATE TABLE IF NOT EXISTS lagerorte (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lager (
    id TEXT PRIMARY KEY, -- Format: YYYY-MM-N (z.B. 2026-10-1)
    barcode TEXT NOT NULL UNIQUE,
    lagerort TEXT NOT NULL,
    name TEXT NOT NULL,
    menge INTEGER NOT NULL DEFAULT 0,
    einlager_datum DATE NOT NULL,
    status INTEGER NOT NULL DEFAULT 1, -- 1 = Aktiv, 0 = Versteckt (Soft-deleted)
    hidden_date DATETIME NULL -- Zeitpunkt des Versteckens für 30-Tage-Löschung
);

-- Standard Lagerorte einfügen
INSERT OR IGNORE INTO lagerorte (name) VALUES ('Gefrierschrank Oben'), ('Gefrierschrank Unten'), ('Kühlschrank Hauptfach');
