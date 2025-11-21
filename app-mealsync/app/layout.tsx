import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MealSync - Cafeteria Menu',
  description: 'Enterprise cafeteria menu management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
