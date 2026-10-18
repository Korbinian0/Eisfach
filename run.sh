#!/usr/bin/env bash
mkdir -p /config/eisfach
DB_PATH="/config/eisfach/eisfach.db"

if [ ! -f "$DB_PATH" ]; then
    echo "Initializing Eisfach SQLite database..."
    sqlite3 "$DB_PATH" < /app/config/schema.sql
fi

export DATABASE_URL="sqlite:///$DB_PATH"
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &
server_8000_pid=$!
uvicorn main:app --host 0.0.0.0 --port 8001 &
server_8001_pid=$!

shutdown_servers() {
    kill "$server_8000_pid" "$server_8001_pid" 2>/dev/null || true
}
trap shutdown_servers EXIT INT TERM

wait -n "$server_8000_pid" "$server_8001_pid"
