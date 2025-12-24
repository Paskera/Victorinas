'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FloatingElements from './components/FloatingElements'

export default function Home() {
  const [roomCode, setRoomCode] = useState('')
  const [computerIP, setComputerIP] = useState('localhost')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Автоматически получаем IP при загрузке
    fetch('http://localhost:8000/local-ip')
      .then(res => res.json())
      .then(data => setComputerIP(data.ip))
      .catch(() => setComputerIP('localhost'))
  }, [])

  const createGame = async () => {
    setIsCreating(true)
    setError('')
    try {
      const response = await fetch('http://localhost:8000/create-room', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Перенаправляем на страницу игры
      router.push(`/game/${data.room_code}?ip=${computerIP}`)
    } catch (error) {
      setError(`Ошибка создания комнаты: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
      setIsCreating(false)
    }
  }

  const joinGame = () => {
    if (roomCode.trim()) {
      router.push(`/game/${roomCode.toUpperCase()}?ip=${computerIP}`)
    }
  }

  return (
    <div className="relative flex items-center justify-center p-4 min-h-screen">
      <FloatingElements />
      <div className="bg-dark_card rounded-xl shadow-lg p-8 w-full relative z-10 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text mb-2">
            Victorinas
          </h1>
          <p className="text-accent">Подключитесь с телефона и играйте вместе!</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          <div className="text-center">
            <button
              onClick={createGame}
              disabled={isCreating}
              className="w-full bg-primary hover:bg-secondary disabled:bg-gray-700 text-light_text font-bold py-4 px-6 rounded-xl transition-colors duration-200 text-lg hover:ring-2 hover:ring-white hover:ring-offset-0 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Создание комнаты...' : 'Victorinas'}
            </button>
            <button
              // onClick={() => router.push('/create')}
              className="w-full bg-primary hover:bg-secondary text-light_text font-bold py-4 px-6 rounded-xl transition-colors duration-200 text-lg hover:ring-2 hover:ring-white hover:ring-offset-0"
            >
              Mems poker
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-dark_card rounded-lg">
          <h3 className="font-semibold text-light_text mb-2">Как играть:</h3>
          <ul className="text-base text-light_text space-y-1">
            <li>1. Выберите игру</li>
            <li>2. Подключитесь с телефона</li>
            <li>3. Отвечайте на вопросы и голосуйте</li>
            <li>4. Самые смешные ответы побеждают!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}