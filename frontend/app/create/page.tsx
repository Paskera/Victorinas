'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCode } from '../components/QRCode'
import FloatingElements from '../components/FloatingElements'

export default function CreatePage() {
  const [isCreating, setIsCreating] = useState(false)
  const [computerIP, setComputerIP] = useState('192.168.31.178') // ЗАМЕНИТЕ НА ВАШ IP!
  const [createdRoom, setCreatedRoom] = useState<{ code: string; url: string } | null>(null)
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
    if (!computerIP.trim()) {
      setError('Введите IP адрес компьютера')
      return
    }

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
      
      // Создаем URL с IP для телефона
      const roomUrl = `http://${computerIP}:3000/game/${data.room_code}?ip=${computerIP}`
      
      setCreatedRoom({
        code: data.room_code,
        url: roomUrl
      })
      
    } catch (error) {
      setError(`Ошибка создания комнаты: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setIsCreating(false)
    }
  }

  const showIPInstructions = () => {
    alert(`КАК НАЙТИ IP КОМПЬЮТЕРА:

На Windows:
1. Нажмите Win + R
2. Введите: cmd
3. В командной строке введите: ipconfig
4. Найдите "IPv4-адрес" в разделе вашего Wi-Fi

Должно быть что-то вроде: 192.168.1.100

Убедитесь, что телефон и компьютер в одной Wi-Fi сети!`)
  }

  const pageEmojis = [
    '🛠️', '⚙️', '📝', '🕹️', '📡', '🔌', '🔋', '💾', '🖥️', '⌨️', '🖱️', '🧠', '⚡', '🔧', '🔨'
  ];

  if (createdRoom) {
    return (
      <div className="relative flex items-center justify-center p-4 min-h-screen">
        <FloatingElements emojis={pageEmojis} />
        <div className="bg-dark_card rounded-xl shadow-lg p-8 w-full relative z-10 max-w-md text-center">
          
          <div className="mb-8">
            <p className="text-light_text mb-2 text-xl">Код комнаты:</p>
            <p className="text-6xl font-bold text-accent mb-4 tracking-wider">{createdRoom.code}</p>
          </div>

          <div className="mb-8">
            <p className="text-light_text mb-4 text-lg">Подключитесь с телефона:</p>
            <div className="flex justify-center bg-white p-4 rounded-xl inline-block shadow-inner">
              <QRCode url={createdRoom.url} size={200} />
            </div>
          </div>

          <div className="space-y-4 text-base text-light_text mb-8">
            <p>📱 <strong className="text-accent">Способ 1:</strong> Отсканируйте QR-код</p>
            <p>🔗 <strong className="text-accent">Способ 2:</strong> Перейдите по ссылке:</p>
            <p className="bg-dark_bg p-3 rounded-lg break-all text-sm font-mono text-gray-300 border border-gray-700">
              {createdRoom.url}
            </p>
          </div>

          <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-semibold">✓ Правильный IP</p>
            <p className="text-green-300/80 text-sm mt-1">
              Телефон подключится к: {computerIP}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => router.push(`/game/${createdRoom.code}?ip=${computerIP}&host=true`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 text-xl shadow-lg"
            >
              Присоединиться как ведущий
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 text-lg"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center p-4 min-h-screen">
      <FloatingElements emojis={pageEmojis} />
      <div className="bg-dark_card rounded-xl shadow-lg p-10 w-full relative z-10 max-w-md text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text mb-8 text-light_text leading-tight">
          Создать игру
        </h1>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        <div className="mb-8">
          <p className="text-light_text mb-4 text-lg">Введите IP адрес вашего компьютера:</p>
          
          <div className="flex space-x-3 mb-3">
            <input
              type="text"
              value={computerIP}
              onChange={(e) => setComputerIP(e.target.value)}
              placeholder="192.168.1.100"
              className="flex-1 px-4 py-4 border-2 border-accent rounded-xl focus:border-primary focus:ring-2 focus:ring-primary text-center bg-dark_bg text-light_text text-xl placeholder-gray-600"
            />
            <button
              type="button"
              onClick={showIPInstructions}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200"
            >
              ?
            </button>
          </div>
          
          <p className="text-xs text-gray-400">
            Убедитесь, что это IP вашего компьютера в локальной сети
          </p>
        </div>

        <button
          onClick={createGame}
          disabled={isCreating || !computerIP.trim()}
          className="w-full bg-primary hover:bg-secondary disabled:bg-gray-700 text-light_text font-bold py-4 px-6 rounded-xl transition-colors duration-200 text-lg mb-4 hover:ring-2 hover:ring-white hover:ring-offset-0"
        >
          {isCreating ? 'Создание...' : 'Создать комнату'}
        </button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Телефон подключится к: {computerIP}:3000</p>
          <p>Бэкенд: localhost:8000</p>
        </div>
      </div>
    </div>
  )
}
