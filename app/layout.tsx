import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TopNav from '@/components/nav/TopNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mosaic Talent Network',
  description: "Find collaborators across Northeastern's entrepreneurship ecosystem",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-white antialiased`}>
        <TopNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
