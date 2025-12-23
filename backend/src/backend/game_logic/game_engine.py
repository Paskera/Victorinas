import random
import uuid
from typing import List, Dict, Optional
from .models import DeathPartyGame, GameState, Player, Question, GameRound

class DeathPartyGameEngine:
    def __init__(self):
        self.game = DeathPartyGame()
        self._initialize_questions()
    
    def _initialize_questions(self):
        """Инициализация базы вопросов для игры"""
        self.questions_pool = [
            Question(id=str(uuid.uuid4()), text="Самая бесполезная вещь, которую можно купить за 1000 рублей?", category="Разное"),
            Question(id=str(uuid.uuid4()), text="Что бы вы сделали, если бы стали невидимым на один день?", category="Фантазия"),
            Question(id=str(uuid.uuid4()), text="Самая странная еда, которую вы когда-либо пробовали?", category="Еда"),
            Question(id=str(uuid.uuid4()), text="Если бы животные могли говорить, какое было бы самым грубым?", category="Животные"),
            Question(id=str(uuid.uuid4()), text="Самая неловкая ситуация в общественном транспорте?", category="Истории"),
        ]
    
    def add_player(self, player_id: str, player_name: str) -> Player:
        """Добавляет игрока в игру"""
        player = Player(id=player_id, name=player_name[:20])
        self.game.players[player_id] = player
        return player
    
    def remove_player(self, player_id: str):
        """Удаляет игрока из игры"""
        if player_id in self.game.players:
            del self.game.players[player_id]
    
    def start_game(self):
        """Начинает игру"""
        if len(self.game.players) < 2:
            raise ValueError("Для начала игры нужно минимум 2 игрока")
        
        self.game.state = GameState.QUESTION
        self.game.current_round = 0
        self.game.rounds = []
        self._next_question()
    
    def _next_question(self):
        """Переход к следующему вопросу"""
        if not self.questions_pool:
            self._initialize_questions()
        
        question = random.choice(self.questions_pool)
        self.questions_pool.remove(question)
        
        self.game.current_question = question
        self.game.state = GameState.ANSWERING
        
        round = GameRound(question=question)
        self.game.rounds.append(round)
        self.game.current_round = len(self.game.rounds) - 1
    
    def submit_answer(self, player_id: str, answer: str) -> bool:
        """Принимает ответ от игрока"""
        if (self.game.state != GameState.ANSWERING or 
            not self.game.current_question or
            player_id not in self.game.players):
            return False
        
        clean_answer = ' '.join(answer.strip().split())[:100]
        current_round = self.game.rounds[self.game.current_round]
        current_round.player_answers[player_id] = clean_answer
        
        if len(current_round.player_answers) == len(self.game.players):
            self._start_voting()
        
        return True
    
    def _start_voting(self):
        """Начинает фазу голосования"""
        self.game.state = GameState.VOTING
    
    def submit_vote(self, voter_id: str, voted_player_id: str) -> bool:
        """Принимает голос от игрока"""
        if (self.game.state != GameState.VOTING or
            voter_id not in self.game.players or
            voted_player_id not in self.game.players or
            voter_id == voted_player_id):
            return False
        
        current_round = self.game.rounds[self.game.current_round]
        current_round.votes[voter_id] = voted_player_id
        
        if len(current_round.votes) == len(self.game.players):
            self._calculate_results()
        
        return True
    
    def _calculate_results(self):
        """Подсчитывает результаты раунда"""
        current_round = self.game.rounds[self.game.current_round]
        vote_count: Dict[str, int] = {}
        
        for voted_player_id in current_round.votes.values():
            vote_count[voted_player_id] = vote_count.get(voted_player_id, 0) + 1
        
        for player_id, votes in vote_count.items():
            points = votes * 100
            self.game.players[player_id].score += points
            self.game.players[player_id].votes_received = votes
            current_round.results[player_id] = points
        
        self.game.state = GameState.RESULTS
    
    def next_round(self):
        """Переход к следующему раунду"""
        if self.game.state != GameState.RESULTS:
            return False
        
        for player in self.game.players.values():
            player.votes_received = 0
        
        if len(self.game.rounds) >= 3:  # 3 раунда для демо
            self.game.state = GameState.FINAL_RESULTS
        else:
            self._next_question()
        
        return True
    
    def get_game_state(self) -> dict:
        """Возвращает текущее состояние игры"""
        current_round = (self.game.rounds[self.game.current_round] 
                        if self.game.rounds else None)
        
        players_data = []
        for player in self.game.players.values():
            players_data.append({
                'id': player.id,
                'name': player.name,
                'score': player.score,
                'connected': player.connected,
                'votes_received': player.votes_received,
                'has_answered': (current_round and player.id in current_round.player_answers),
                'has_voted': (current_round and player.id in current_round.votes)
            })
        
        players_data.sort(key=lambda x: x['score'], reverse=True)
        
        state_data = {
            'game_state': self.game.state.value,
            'players': players_data,
            'current_round': self.game.current_round + 1,
            'total_rounds': 3,
            'question': (self.game.current_question.dict() 
                        if self.game.current_question else None),
        }
        
        if self.game.state == GameState.ANSWERING:
            state_data['answered_count'] = (len(current_round.player_answers) 
                                          if current_round else 0)
            state_data['total_players'] = len(self.game.players)
        
        elif self.game.state == GameState.VOTING:
            if current_round:
                answers = list(current_round.player_answers.values())
                random.shuffle(answers)
                state_data['answers'] = [
                    {'id': i, 'text': answer} 
                    for i, answer in enumerate(answers)
                ]
                state_data['voted_count'] = len(current_round.votes)
        
        elif self.game.state == GameState.RESULTS:
            if current_round:
                state_data['round_results'] = {
                    'answers': [
                        {
                            'player_name': self.game.players[player_id].name,
                            'answer': answer,
                            'votes': self.game.players[player_id].votes_received,
                            'points_earned': current_round.results.get(player_id, 0)
                        }
                        for player_id, answer in current_round.player_answers.items()
                    ]
                }
        
        return state_data