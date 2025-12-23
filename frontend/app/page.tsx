'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FloatingElements from './components/FloatingElements'

export default function Home() {
  const [roomCode, setRoomCode] = useState('')
  const router = useRouter()

  const joinGame = () => {
    if (roomCode.trim()) {
      router.push(`/game/${roomCode.toUpperCase()}`)
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
          <div className="text-center">
            <button
              onClick={() => router.push('/create')}
              className="w-full bg-primary hover:bg-secondary text-light_text font-bold py-4 px-6 rounded-xl transition-colors duration-200 text-lg hover:ring-2 hover:ring-white hover:ring-offset-0"
            >
              Создать игру
            </button>
            <p className="text-light_text text-sm mt-2">
              Вы будете ведущим игры
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-accent" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark_card text-light_text">или</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-light_text mb-2">
              Введите код комнаты:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                className="flex-1 px-4 py-3 border-2 border-accent rounded-xl focus:border-primary focus:ring-2 focus:ring-primary text-center font-mono text-lg uppercase text-dark_text"
              />
              <button
                onClick={joinGame}
                disabled={!roomCode.trim()}
                className="w-full bg-primary hover:bg-secondary disabled:bg-gray-700 text-light_text font-bold py-4 px-6 rounded-xl transition-colors duration-200 text-lg hover:ring-2 hover:ring-white hover:ring-offset-0"
              >
                Войти
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-dark_card rounded-lg">
          <h3 className="font-semibold text-light_text mb-2">Как играть:</h3>
          <ul className="text-base text-light_text space-y-1">
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