from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
import socket
import uvicorn

from backend.game_logic.room_manager import RoomManager


app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Для разработки разрешаем все
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

room_manager = RoomManager()

def get_local_ip():
    """Получает локальный IP адрес компьютера"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except:
        return "localhost"

@app.get("/")
async def root():
    return {"message": "Death Party Game Server is running!"}

@app.get("/local-ip")
async def get_local_ip_endpoint():
    """Возвращает локальный IP адрес сервера"""
    local_ip = get_local_ip()
    return {"ip": local_ip}

@app.post("/create-room")
async def create_room():
    """Создает новую игровую комнату"""
    room_id = str(uuid.uuid4())[:8].upper()
    room_code = room_manager.create_room(room_id)
    return JSONResponse({
        "room_id": room_id,
        "room_code": room_code
    })

@app.websocket("/ws/{room_code}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, player_id: str):
    """WebSocket подключение для реального времени"""
    # Получаем room_id по room_code
    if room_code not in room_manager.room_codes:
        await websocket.close(code=1008, reason="Room not found")
        return
    
    room_id = room_manager.room_codes[room_code]
    await room_manager.connect_player(room_id, player_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await room_manager.handle_message(room_id, player_id, data)
    except WebSocketDisconnect:
        room_manager.disconnect_player(room_id, player_id)

@app.get("/room/{room_code}/status")
async def get_room_status(room_code: str):
    """Проверка статуса комнаты"""
    return room_manager.get_room_status(room_code)

def main():
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    # import uvicorn
    # # uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    main()