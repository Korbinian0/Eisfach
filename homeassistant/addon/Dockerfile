FROM debian:trixie-backports

WORKDIR /app

RUN apt-get update && apt-get install -y python3 python3-pip3 python3-venv sqlite3 libsqlite3-dev python3-fastapi python3-uvicorn python3-sqlalchemy python3-josepy python3-passlib python3-databases python3-pydantic python3-multipart python3-cryptography python3-requests

COPY backend/ /app/backend/
COPY config/ /app/config/
COPY web/ /app/web/

RUN pip install --no-cache-dir -r backend/requirements.txt

COPY run.sh /run.sh
RUN chmod +x /run.sh

CMD ["/run.sh"]

