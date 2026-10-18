#!/usr/bin/env bash
mkdir -p /config/eisfach
DB_PATH="/config/eisfach/eisfach.db"

if [ ! -f "$DB_PATH" ]; then
    echo "Initializing Eisfach SQLite database..."
    sqlite3 "$DB_PATH" < /app/config/schema.sql
fi

export DATABASE_URL="sqlite:///$DB_PATH"
cd /app/backend
exec python3 serve.py
