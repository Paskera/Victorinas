'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCode } from '../components/QRCode'

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

  if (createdRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-4">
            💀 Комната создана!
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Код комнаты:</p>
            <p className="text-4xl font-bold text-gray-800 mb-4">{createdRoom.code}</p>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-3">Подключитесь с телефона:</p>
            <div className="flex justify-center">
              <QRCode url={createdRoom.url} size={180} />
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <p>📱 <strong>Способ 1:</strong> Отсканируйте QR-код</p>
            <p>🔗 <strong>Способ 2:</strong> Перейдите по ссылке:</p>
            <p className="bg-gray-100 p-2 rounded break-all text-xs">
              {createdRoom.url}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm font-semibold">✓ Правильный IP</p>
            <p className="text-green-700 text-xs mt-1">
              Телефон подключится к: {computerIP}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => router.push(`/game/${createdRoom.code}?ip=${computerIP}&host=true`)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Присоединиться как ведущий
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-4">
          Создать игру
        </h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">Введите IP адрес вашего компьютера:</p>
          
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={computerIP}
              onChange={(e) => setComputerIP(e.target.value)}
              placeholder="192.168.1.100"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 text-center"
            />
            <button
              type="button"
              onClick={showIPInstructions}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200"
            >
              ?
            </button>
          </div>
          
          <p className="text-xs text-gray-500">
            Убедитесь, что это IP вашего компьютера в локальной сети
          </p>
        </div>

        <button
          onClick={createGame}
          disabled={isCreating || !computerIP.trim()}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 text-lg mb-4"
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