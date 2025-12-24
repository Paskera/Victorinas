'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import FloatingElements from '../../components/FloatingElements'
import { QRCode } from '../../components/QRCode'

interface GameState {
  game_state: string
  players: any[]
  current_round: number
  total_rounds: number
  question?: any
  answered_count?: number
  total_players?: number
  answers?: { player_id: string; text: string }[]
  voted_count?: number
  round_results?: any
  host_id?: string  // ID ведущего игрока
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = params.code as string
  // const computerIP = searchParams.get('ip') || 'localhost'
  const [computerIP, setComputerIP] = useState('192.168.31.178')
  
  const [playerName, setPlayerName] = useState('')
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerId, setPlayerId] = useState('')
  const [connectionError, setConnectionError] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [selectedAnswerForVote, setSelectedAnswerForVote] = useState<string | null>(null)
  const [roomStatus, setRoomStatus] = useState<any>(null)
  const ws = useRef<WebSocket | null>(null)
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const newPlayerId = Math.random().toString(36).substr(2, 9)
    setPlayerId(newPlayerId)
    
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  useEffect(() => {
    // Автоматически получаем IP при загрузке
    fetch('http://localhost:8000/local-ip')
      .then(res => res.json())
      .then(data => setComputerIP(data.ip))
      .catch(() => setComputerIP('localhost'))
  }, [])

  const connectToGame = () => {
    if (!code || !playerName.trim()) return

    setConnectionError('')
    
    // Используем IP компьютера для WebSocket (используем room_code напрямую)
    const wsUrl = computerIP === 'localhost' 
      ? `ws://localhost:8000/ws/${code}/${playerId}`
      : `ws://${computerIP}:8000/ws/${code}/${playerId}`
    


    console.log('Подключаемся к WebSocket:', wsUrl)

    try {
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        console.log('✅ WebSocket подключен!')
        setConnected(true)
        setConnectionError('')
        
        ws.current?.send(JSON.stringify({
          type: 'player_join',
          data: { player_name: playerName }
        }))
      }

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'game_state_update') {
            const state = message.data
            setGameState(state)
            // Проверяем, является ли текущий игрок ведущим
            setIsHost(state.host_id === playerId)
            // Сбрасываем выбранный ответ при смене фазы
            if (state.game_state !== 'voting') {
              setSelectedAnswerForVote(null)
            }
          }
        } catch (error) {
          console.error('Ошибка парсинга сообщения:', error)
        }
      }

      ws.current.onclose = (event) => {
        console.log('Соединение закрыто:', event.code, event.reason)
        setConnected(false)
        if (event.code !== 1000) {
          setConnectionError(`Соединение закрыто: ${event.reason || 'Неизвестная ошибка'}`)
        }
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket ошибка:', error)
        setConnectionError(`Ошибка подключения к ${computerIP}:8000`)
      }
    } catch (error) {
      setConnectionError('Не удалось создать соединение')
    }
  }

  const startGame = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({
        type: 'start_game'
      }))
    }
  }

  const submitAnswer = (answer: string) => {
    if (ws.current) {
      ws.current.send(JSON.stringify({
        type: 'submit_answer',
        data: { answer }
      }))
    }
  }

  const submitVote = (votedPlayerId: string) => {
    if (ws.current && votedPlayerId !== playerId) {
      ws.current.send(JSON.stringify({
        type: 'submit_vote',
        data: { player_id: votedPlayerId }
      }))
      setSelectedAnswerForVote(null)
    }
  }

  const nextRound = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({
        type: 'next_round'
      }))
    }
  }

  const gameEmojis = [
    '🎮', '🎲', '👾', '🕹️', '🎯', '🎰', '🃏', '🎪', '🎭', '🎫', '🎬', '🎤', '🎧', '🎼', '🎹'
  ];

  if (!connected) {
    return (
      <div className="relative flex items-center justify-center p-4 min-h-screen">
        <FloatingElements emojis={gameEmojis} />
        <div className="bg-dark_card rounded-xl shadow-lg p-10 w-full relative z-10 max-w-md text-center">
          <div className="text-center mb-8">
            <p className="text-light_text text-lg">Код комнаты: <strong className="text-2xl text-accent tracking-wider ml-2">{code}</strong></p>
          </div>

          {connectionError && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{connectionError}</p>
              <p className="text-red-300/80 text-sm mt-2">
                Убедитесь, что бэкенд запущен на компьютере
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-light_text mb-3 text-left">
                Ваше имя:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Введите ваше имя"
                className="w-full px-6 py-4 border-2 border-accent rounded-xl focus:border-primary focus:ring-2 focus:ring-primary bg-dark_bg text-light_text placeholder-gray-600 text-xl"
                maxLength={20}
              />
            </div>

            <button
              onClick={connectToGame}
              disabled={!playerName.trim()}
              className="w-full bg-primary hover:bg-secondary disabled:bg-gray-700 text-light_text font-bold py-4 px-8 rounded-xl transition-colors duration-200 disabled:cursor-not-allowed hover:ring-2 hover:ring-white hover:ring-offset-0 text-xl shadow-lg"
            >
              Присоединиться к игре
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              Подключение к: {computerIP}:8000
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Игровой интерфейс
  return (
    <div className="relative min-h-screen p-4">
      <FloatingElements emojis={gameEmojis} />
      <div className="max-w-2xl mx-auto relative z-10">
        <header className="text-center mb-8">
          <p className="text-light_text mt-2 text-xl">Код: <span className="text-accent font-bold">{code}</span> | Игрок: <span className="text-accent font-bold">{playerName}</span></p>
          {isHost && gameState && (
            <p className="text-green-400 font-semibold mt-1">🎮 Вы - ведущий</p>
          )}
        </header>
        <div className="bg-white p-3 rounded-lg">
        <QRCode 
          url={`http://${computerIP}:3000/game/${code}?ip=${computerIP}`}
          size={160}
          />
        </div>
        <div className="bg-dark_card rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-light_text mb-4">Статус игры</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-900/30 p-3 rounded-lg border border-green-700/50">
                <p className="text-green-400 font-semibold">Статус</p>
                <p className="text-green-300 capitalize">{gameState?.game_state || 'waiting'}</p>
              </div>
              <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700/50">
                <p className="text-blue-400 font-semibold">Игроков</p>
                <p className="text-blue-300">{gameState?.players?.length || 0}</p>
              </div>
            </div>

            {/* Кнопка начала игры для ведущего */}
            {isHost && gameState?.game_state === 'waiting' && gameState.players.length >= 2 && (
              <div className="text-center">
                <button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 text-lg hover:ring-2 hover:ring-white hover:ring-offset-0"
                >
                  🎮 Начать игру ({gameState.players.length} игроков)
                </button>
              </div>
            )}

            {isHost && gameState?.game_state === 'waiting' && gameState.players.length < 2 && (
              <div className="text-center bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
                <p className="text-yellow-400">
                  Ожидание игроков... ({gameState.players.length}/2)
                </p>
              </div>
            )}

            {/* Фаза ответов */}
            {gameState?.game_state === 'answering' && gameState.question && (
              <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-300 mb-2">Вопрос:</h3>
                <p className="text-purple-200 text-lg mb-2">{gameState.question.text}</p>
                <p className="text-purple-400 text-sm mb-4">
                  Категория: {gameState.question.category}
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Ваш ответ:
                  </label>
                  <textarea
                    placeholder="Введите ваш ответ..."
                    rows={3}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-500 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 bg-dark_bg text-light_text"
                  />
                  <button
                    onClick={() => {
                      if (answerText.trim()) {
                        submitAnswer(answerText.trim())
                        setAnswerText('')
                      }
                    }}
                    disabled={!answerText.trim()}
                    className="w-full mt-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    Отправить ответ
                  </button>
                </div>
                
                <div className="bg-blue-900/30 p-3 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    Ответили: {gameState.answered_count} / {gameState.total_players}
                  </p>
                </div>
              </div>
            )}

            {/* Фаза голосования */}
            {gameState?.game_state === 'voting' && gameState.answers && (
              <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-300 mb-4">Голосование: выберите лучший ответ</h3>
                
                <div className="space-y-3">
                  {gameState.answers
                    .filter((answer: any) => answer.player_id !== playerId) // Исключаем свой ответ
                    .map((answer: any) => (
                    <button
                      key={answer.player_id}
                      onClick={() => setSelectedAnswerForVote(answer.player_id)}
                      className={`w-full p-4 bg-dark_bg border rounded-lg text-left transition-colors duration-200 group ${
                        selectedAnswerForVote === answer.player_id
                          ? 'border-indigo-400 bg-indigo-900/50'
                          : 'border-indigo-500 hover:bg-indigo-900/50'
                      }`}
                    >
                      <p className="text-indigo-200 group-hover:text-white transition-colors">{answer.text}</p>
                    </button>
                  ))}
                </div>
                
                {selectedAnswerForVote && (
                  <button
                    onClick={() => submitVote(selectedAnswerForVote)}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Голосовать
                  </button>
                )}
                
                <div className="bg-blue-900/30 p-3 rounded-lg mt-4">
                  <p className="text-blue-300 text-sm">
                    Проголосовали: {gameState.voted_count} / {gameState.total_players}
                  </p>
                </div>
              </div>
            )}

            {/* Результаты раунда */}
            {gameState?.game_state === 'results' && gameState.round_results && (
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-green-300 mb-4">Результаты раунда:</h3>
                
                <div className="space-y-3">
                  {gameState.round_results.answers.map((result: any, index: number) => (
                    <div key={index} className="bg-dark_bg p-3 rounded-lg border border-green-700/30">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-green-400">{result.player_name}</span>
                        <span className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-sm font-semibold border border-green-700">
                          +{result.points_earned} очков
                        </span>
                      </div>
                      <p className="text-light_text mb-2">{result.answer}</p>
                      <p className="text-gray-400 text-sm">Голосов: {result.votes}</p>
                    </div>
                  ))}
                </div>
                
                {isHost && (
                  <div className="text-center mt-4">
                    <button
                      onClick={nextRound}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition-colors duration-200"
                    >
                      Следующий раунд
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Итоговые результаты */}
            {gameState?.game_state === 'final_results' && (
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-400 mb-4">Игра завершена! 🎉</h3>
                <p className="text-yellow-200 mb-4">Победитель: {gameState.players[0]?.name}</p>
                
                {isHost && (
                  <div className="text-center">
                    <button
                      onClick={() => router.push('/create')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-xl transition-colors duration-200"
                    >
                      Новая игра
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Список игроков */}
            {gameState?.players && gameState.players.length > 0 && (
              <div>
                <h3 className="font-semibold text-light_text mb-2">Игроки в комнате:</h3>
                <div className="space-y-2">
                  {gameState.players.map((player, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-dark_bg rounded-lg border border-accent/20">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-light_text">{player.name}</span>
                        {player.has_answered && gameState.game_state === 'answering' && (
                          <span className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-xs border border-green-700">✓</span>
                        )}
                        {player.has_voted && gameState.game_state === 'voting' && (
                          <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded-full text-xs border border-blue-700">✓</span>
                        )}
                      </div>
                      <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold border border-blue-700">
                        {player.score} очков
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 hover:ring-2 hover:ring-white hover:ring-offset-0"
          >
            Выйти в меню
          </button>
        </div>
      </div>
    </div>
  )
}