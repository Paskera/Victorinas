'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

interface GameState {
  game_state: string
  players: any[]
  current_round: number
  total_rounds: number
  question?: any
  answered_count?: number
  total_players?: number
  answers?: { id: number; text: string }[]
  voted_count?: number
  round_results?: any
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = params.code as string
  const computerIP = searchParams.get('ip') || 'localhost'
  
  const [playerName, setPlayerName] = useState('')
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerId, setPlayerId] = useState('')
  const [connectionError, setConnectionError] = useState('')
  const [isHost, setIsHost] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    const newPlayerId = Math.random().toString(36).substr(2, 9)
    setPlayerId(newPlayerId)
    
    // Проверяем, является ли игрок ведущим (пришел с главной страницы)
    const urlParams = new URLSearchParams(window.location.search)
    setIsHost(urlParams.has('host'))
    
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const connectToGame = () => {
    if (!code || !playerName.trim()) return

    setConnectionError('')
    
    // Используем IP компьютера для WebSocket
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
            setGameState(message.data)
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

  const submitVote = (answerId: number) => {
    if (ws.current) {
      ws.current.send(JSON.stringify({
        type: 'submit_vote',
        data: { answer_id: answerId }
      }))
    }
  }

  const nextRound = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({
        type: 'next_round'
      }))
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-2">
              💀 Смертельная Вечеринка
            </h1>
            <p className="text-gray-600">Код комнаты: <strong className="text-xl">{code}</strong></p>
          </div>

          {connectionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{connectionError}</p>
              <p className="text-red-700 text-xs mt-2">
                Убедитесь, что бэкенд запущен на компьютере
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваше имя:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Введите ваше имя"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200"
                maxLength={20}
              />
            </div>

            <button
              onClick={connectToGame}
              disabled={!playerName.trim()}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 disabled:cursor-not-allowed"
            >
              Присоединиться к игре
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              Подключение к: {computerIP}:8000
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Игровой интерфейс
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            💀 Игровая комната
          </h1>
          <p className="text-gray-600">Код: {code} | Игрок: {playerName}</p>
          {isHost && (
            <p className="text-green-600 font-semibold">🎮 Вы - ведущий</p>
          )}
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Статус игры</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 font-semibold">Статус</p>
                <p className="text-green-600 capitalize">{gameState?.game_state || 'waiting'}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 font-semibold">Игроков</p>
                <p className="text-blue-600">{gameState?.players?.length || 0}</p>
              </div>
            </div>

            {/* Кнопка начала игры для ведущего */}
            {isHost && gameState?.game_state === 'waiting' && gameState.players.length >= 2 && (
              <div className="text-center">
                <button
                  onClick={startGame}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 text-lg"
                >
                  🎮 Начать игру ({gameState.players.length} игроков)
                </button>
              </div>
            )}

            {isHost && gameState?.game_state === 'waiting' && gameState.players.length < 2 && (
              <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Ожидание игроков... ({gameState.players.length}/2)
                </p>
              </div>
            )}

            {/* Фаза ответов */}
            {gameState?.game_state === 'answering' && gameState.question && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Вопрос:</h3>
                <p className="text-purple-700 text-lg mb-2">{gameState.question.text}</p>
                <p className="text-purple-600 text-sm mb-4">
                  Категория: {gameState.question.category}
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Ваш ответ:
                  </label>
                  <textarea
                    placeholder="Введите ваш ответ..."
                    rows={3}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    onBlur={(e) => submitAnswer(e.target.value)}
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    Ответили: {gameState.answered_count} / {gameState.total_players}
                  </p>
                </div>
              </div>
            )}

            {/* Фаза голосования */}
            {gameState?.game_state === 'voting' && gameState.answers && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-800 mb-4">Голосование: выберите лучший ответ</h3>
                
                <div className="space-y-3">
                  {gameState.answers.map((answer: any) => (
                    <button
                      key={answer.id}
                      onClick={() => submitVote(answer.id)}
                      className="w-full p-4 bg-white border border-indigo-300 rounded-lg text-left hover:bg-indigo-100 transition-colors duration-200"
                    >
                      <p className="text-indigo-800">{answer.text}</p>
                    </button>
                  ))}
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg mt-4">
                  <p className="text-blue-800 text-sm">
                    Проголосовали: {gameState.voted_count} / {gameState.total_players}
                  </p>
                </div>
              </div>
            )}

            {/* Результаты раунда */}
            {gameState?.game_state === 'results' && gameState.round_results && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-4">Результаты раунда:</h3>
                
                <div className="space-y-3">
                  {gameState.round_results.answers.map((result: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-green-800">{result.player_name}</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                          +{result.points_earned} очков
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{result.answer}</p>
                      <p className="text-gray-600 text-sm">Голосов: {result.votes}</p>
                    </div>
                  ))}
                </div>
                
                {isHost && (
                  <div className="text-center mt-4">
                    <button
                      onClick={nextRound}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-xl transition-colors duration-200"
                    >
                      Следующий раунд
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Итоговые результаты */}
            {gameState?.game_state === 'final_results' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-4">Игра завершена! 🎉</h3>
                <p className="text-yellow-700 mb-4">Победитель: {gameState.players[0]?.name}</p>
                
                {isHost && (
                  <div className="text-center">
                    <button
                      onClick={() => router.push('/create')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-xl transition-colors duration-200"
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
                <h3 className="font-semibold text-gray-800 mb-2">Игроки в комнате:</h3>
                <div className="space-y-2">
                  {gameState.players.map((player, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{player.name}</span>
                        {player.has_answered && gameState.game_state === 'answering' && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">✓</span>
                        )}
                        {player.has_voted && gameState.game_state === 'voting' && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">✓</span>
                        )}
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
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
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200"
          >
            Выйти в меню
          </button>
        </div>
      </div>
    </div>
  )
}