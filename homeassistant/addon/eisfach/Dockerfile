FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends sqlite3 && rm -rf /var/lib/apt/lists/*

COPY backend/ /app/backend/
COPY config/ /app/config/
COPY web/ /app/web/

RUN pip install --no-cache-dir -r backend/requirements.txt

COPY run.sh /run.sh
RUN chmod +x /run.sh

CMD ["/run.sh"]

