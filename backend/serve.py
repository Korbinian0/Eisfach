import asyncio
import socket

import uvicorn


def create_listeners():
    listeners = []
    try:
        for port in (8000, 8001):
            listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            listener.bind(("0.0.0.0", port))
            listener.listen(2048)
            listener.setblocking(False)
            listeners.append(listener)
    except OSError:
        for listener in listeners:
            listener.close()
        raise
    return listeners


async def main():
    server = uvicorn.Server(uvicorn.Config("main:app", log_level="info"))
    listeners = create_listeners()
    try:
        await server.serve(sockets=listeners)
    finally:
        for listener in listeners:
            listener.close()


if __name__ == "__main__":
    asyncio.run(main())
