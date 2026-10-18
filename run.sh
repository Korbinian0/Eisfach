#!/usr/bin/env bash
mkdir -p /config/eisfach
DB_PATH="/config/eisfach/eisfach.db"

if [ ! -f "$DB_PATH" ]; then
    echo "Initializing Eisfach SQLite database..."
    sqlite3 "$DB_PATH" < /app/config/schema.sql
fi

export DATABASE_URL="sqlite:///$DB_PATH"
export AUTH_DISABLED="true"
cd /app/backend
exec uvicorn main:app --host 0.0.0.0 --port 8001
