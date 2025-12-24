import uuid
from typing import Dict, List
from fastapi import WebSocket
import json

from .game_engine import DeathPartyGameEngine

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, player_id: str):
        await websocket.accept()
        self.active_connections[player_id] = websocket
        print(f"✅ Игрок подключен: {player_id}")

    def disconnect(self, player_id: str):
        if player_id in self.active_connections:
            del self.active_connections[player_id]
            print(f"🔌 Игрок отключен: {player_id}")

    async def send_personal_message(self, message: str, player_id: str):
        if player_id in self.active_connections:
            try:
                await self.active_connections[player_id].send_text(message)
            except Exception as e:
                print(f"❌ Ошибка отправки {player_id}: {e}")

class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, Dict] = {}
        self.room_codes: Dict[str, str] = {}
        self.connections: Dict[str, ConnectionManager] = {}

    def create_room(self, room_id: str) -> str:
        """Создает комнату и генерирует 4-значный код"""
        import random
        import string
        
        while True:
            code = ''.join(random.choices(string.ascii_uppercase, k=4))
            if code not in self.room_codes:
                break
        
        self.rooms[room_id] = {
            'code': code,
            'game': DeathPartyGameEngine(),
            'players': {},
            'status': 'waiting',
            'host_id': None  # ID первого подключившегося игрока (ведущий)
        }
        self.room_codes[code] = room_id
        self.connections[room_id] = ConnectionManager()
        
        print(f"🎮 Создана комната: {room_id} -> {code}")
        return code

    async def connect_player(self, room_id: str, player_id: str, websocket: WebSocket):
        """Подключает игрока к комнате"""
        print(f"🔄 Подключение: комната={room_id}, игрок={player_id}")
        
        if room_id not in self.rooms:
            print(f"📦 Комната {room_id} не найдена, создаем новую")
            self.create_room(room_id)
            
        room = self.rooms[room_id]
        
        try:
            # Подключаем WebSocket
            await self.connections[room_id].connect(websocket, player_id)
            
            # Если игрок уже был в комнате, обновляем его статус подключения
            if player_id in room['players']:
                room['players'][player_id]['connected'] = True
                print(f"🔄 Игрок переподключен: {room['players'][player_id]['name']} ({player_id})")
            else:
                # Если это первый игрок, делаем его ведущим
                if room['host_id'] is None:
                    room['host_id'] = player_id
                    print(f"🎮 Первый игрок становится ведущим: {player_id}")
                
                # Добавляем нового игрока в игру
                player_name = f'Игрок {len(room["players"]) + 1}'
                room['game'].add_player(player_id, player_name)
                
                room['players'][player_id] = {
                    'name': player_name,
                    'score': 0,
                    'connected': True
                }
                
                print(f"✅ Игрок добавлен: {player_name} ({player_id})")
            
            # Отправляем начальное состояние
            await self.update_room_state(room_id)
            
        except Exception as e:
            print(f"❌ Ошибка подключения игрока: {e}")
            raise

    async def handle_message(self, room_id: str, player_id: str, message: str):
        """Обрабатывает сообщения от игроков"""
        try:
            data = json.loads(message)
            msg_type = data.get('type')
            msg_data = data.get('data', {})
            
            if room_id not in self.rooms:
                return
                
            room = self.rooms[room_id]
            game_engine = room['game']
            
            if msg_type == 'player_join':
                player_name = msg_data.get('player_name', '')
                if player_name and player_name.strip():
                    if player_id in game_engine.game.players:
                        game_engine.game.players[player_id].name = player_name[:20]
                    if player_id in room['players']:
                        room['players'][player_id]['name'] = player_name[:20]
                    print(f"🎯 Игрок установил имя: {player_name}")
                
            elif msg_type == 'start_game':
                # Проверяем, является ли игрок ведущим
                if player_id != room.get('host_id'):
                    print(f"❌ Игрок {player_id} пытается начать игру, но не является ведущим")
                    return
                try:
                    game_engine.start_game()
                    print(f"🎮 Игра начата в комнате {room_id}")
                except ValueError as e:
                    print(f"❌ Не удалось начать игру: {e}")
                
            elif msg_type == 'submit_answer':
                answer = msg_data.get('answer', '')
                game_engine.submit_answer(player_id, answer)
                
            elif msg_type == 'submit_vote':
                voted_player_id = msg_data.get('player_id')
                if voted_player_id and voted_player_id != player_id:
                    # Проверяем, что игрок существует и это не сам игрок
                    current_round = game_engine.game.rounds[game_engine.game.current_round]
                    if voted_player_id in current_round.player_answers:
                        game_engine.submit_vote(player_id, voted_player_id)
                
            elif msg_type == 'next_round':
                # Проверяем, является ли игрок ведущим
                if player_id != room.get('host_id'):
                    print(f"❌ Игрок {player_id} пытается начать следующий раунд, но не является ведущим")
                    return
                game_engine.next_round()
                
            await self.update_room_state(room_id)
            
        except Exception as e:
            print(f"❌ Ошибка обработки сообщения: {e}")

    async def update_room_state(self, room_id: str):
        """Отправляет обновленное состояние всем игрокам"""
        if room_id not in self.rooms:
            return
            
        room = self.rooms[room_id]
        game_state = room['game'].get_game_state()
        
        # Добавляем информацию о ведущем игроке
        game_state['host_id'] = room.get('host_id')
        
        state_message = {
            'type': 'game_state_update',
            'data': game_state
        }
        
        player_ids = list(room['players'].keys())
        for player_id in player_ids:
            await self.connections[room_id].send_personal_message(
                json.dumps(state_message), player_id
            )
        
        print(f"📊 Состояние отправлено {len(player_ids)} игрокам")

    def disconnect_player(self, room_id: str, player_id: str):
        if room_id in self.rooms and player_id in self.rooms[room_id]['players']:
            self.rooms[room_id]['players'][player_id]['connected'] = False
            if room_id in self.connections:
                self.connections[room_id].disconnect(player_id)
            
            # Если ведущий отключился, назначаем нового ведущего (первого из оставшихся)
            if self.rooms[room_id].get('host_id') == player_id:
                remaining_players = [pid for pid in self.rooms[room_id]['players'].keys() 
                                   if pid != player_id and self.rooms[room_id]['players'][pid]['connected']]
                if remaining_players:
                    self.rooms[room_id]['host_id'] = remaining_players[0]
                    print(f"🎮 Новый ведущий: {remaining_players[0]}")
                else:
                    self.rooms[room_id]['host_id'] = None
                    
            print(f"👋 Игрок отключен: {player_id}")

    def get_room_status(self, room_code: str):
        if room_code in self.room_codes:
            room_id = self.room_codes[room_code]
            room = self.rooms[room_id]
            players_list = [
                {
                    'id': pid,
                    'name': room['players'][pid]['name'],
                    'score': room['players'][pid]['score'],
                    'is_host': pid == room.get('host_id')
                }
                for pid in room['players'].keys()
                if room['players'][pid]['connected']
            ]
            return {
                'exists': True,
                'room_id': room_id,
                'player_count': len(players_list),
                'status': room['status'],
                'players': players_list,
                'host_id': room.get('host_id')
            }
        return {'exists': False}