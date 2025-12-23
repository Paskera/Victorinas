from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel
import uuid

class GameState(str, Enum):
    WAITING = "waiting"
    QUESTION = "question"
    ANSWERING = "answering"
    VOTING = "voting"
    RESULTS = "results"
    FINAL_RESULTS = "final_results"

class Player(BaseModel):
    id: str
    name: str
    score: int = 0
    connected: bool = True
    current_answer: Optional[str] = None
    votes_received: int = 0

class Question(BaseModel):
    id: str
    text: str
    category: str

class GameRound(BaseModel):
    question: Question
    player_answers: Dict[str, str] = {}
    votes: Dict[str, str] = {}
    results: Dict[str, int] = {}

class DeathPartyGame(BaseModel):
    game_id: str = str(uuid.uuid4())
    state: GameState = GameState.WAITING
    players: Dict[str, Player] = {}
    questions: List[Question] = []
    current_round: int = 0
    current_question: Optional[Question] = None
    rounds: List[GameRound] = []
    
    class Config:
        arbitrary_types_allowed = True