'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRCodeProps {
  url: string
  size?: number
}

export const QRCode: React.FC<QRCodeProps> = ({ url, size = 200 }) => {
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200">
      <QRCodeSVG
        value={url} 
        size={size}
        level="M"
        includeMargin={false}
        bgColor="#FFFFFF"
        fgColor="#000000"
      />
      <p className="mt-3 text-sm text-gray-600 text-center max-w-xs break-all">
        {url}
      </p>
      <p className="text-xs text-gray-500 mt-1">Код комнаты: {url.split('/').pop()?.split('?')[0]}</p>
    </div>
  )
}