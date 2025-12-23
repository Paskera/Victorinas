'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [roomCode, setRoomCode] = useState('')
  const router = useRouter()

  const joinGame = () => {
    if (roomCode.trim()) {
      router.push(`/game/${roomCode.toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-2">
            💀 Смертельная Вечеринка
          </h1>
          <p className="text-gray-600">Подключитесь с телефона и играйте вместе!</p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <button
              onClick={() => router.push('/create')}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 text-lg"
            >
              Создать игру
            </button>
            <p className="text-gray-500 text-sm mt-2">
              Вы будете ведущим игры
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">или</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Введите код комнаты:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 text-center font-mono text-lg uppercase"
              />
              <button
                onClick={joinGame}
                disabled={!roomCode.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Войти
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Как играть:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. Создайте игру или введите код</li>
            <li>2. Подключитесь с телефона</li>
            <li>3. Отвечайте на вопросы и голосуйте</li>
            <li>4. Самые смешные ответы побеждают!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}