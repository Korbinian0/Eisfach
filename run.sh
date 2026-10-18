#!/usr/bin/env bash
set -eu

mkdir -p /config/eisfach
DB_PATH="/config/eisfach/eisfach.db"
LEGACY_DB_PATH="/app/backend/eisfach.db"
RESTORE_DB_PATH="${DB_PATH}.restore"

database_has_data() {
    result=$(sqlite3 "$1" "SELECT CASE WHEN EXISTS (SELECT 1 FROM lager) OR EXISTS (SELECT 1 FROM users WHERE username != 'admin') OR EXISTS (SELECT 1 FROM lagerorte WHERE name NOT IN ('Gefrierschrank Oben', 'Gefrierschrank Unten', 'Kühlschrank Hauptfach')) THEN 1 ELSE 0 END;")
    [ "$result" = "1" ]
}

if [ ! -f "$DB_PATH" ]; then
    if [ -f "$LEGACY_DB_PATH" ]; then
        echo "Restoring Eisfach database from the previous container path..."
        sqlite3 "$LEGACY_DB_PATH" ".backup '$DB_PATH'"
    else
        echo "Initializing persistent Eisfach SQLite database..."
        sqlite3 "$DB_PATH" < /app/config/schema.sql
    fi
elif [ -f "$LEGACY_DB_PATH" ] && ! database_has_data "$DB_PATH" && database_has_data "$LEGACY_DB_PATH"; then
    BACKUP_DB_PATH="${DB_PATH}.before-restore-$(date +%Y%m%d%H%M%S)"
    echo "Saving the empty persistent database to $BACKUP_DB_PATH"
    cp -p "$DB_PATH" "$BACKUP_DB_PATH"
    echo "Restoring Eisfach data from the previous container path..."
    sqlite3 "$LEGACY_DB_PATH" ".backup '$RESTORE_DB_PATH'"
    mv "$RESTORE_DB_PATH" "$DB_PATH"
fi

export DB_PATH
cd /app/backend
exec python3 serve.py
