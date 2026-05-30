import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Blueprint Being - Your Source for Inspiration',
  description: 'A beautifully crafted blog platform with modern design and powerful features',
  keywords: 'blog, articles, tech, lifestyle, business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
