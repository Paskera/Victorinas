import './globals.css'

export const metadata = {
  title: 'Смертельная Вечеринка',
  description: 'Игра для веселых компаний',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="bg-dark_bg bg-game-pattern text-light_text font-sans antialiased">
        {children}
      </body>
    </html>
  )
}