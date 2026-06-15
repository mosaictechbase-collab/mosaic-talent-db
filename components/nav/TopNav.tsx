'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopNav() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/admin', label: 'Admin' },
  ]

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-blue-600 font-bold text-lg tracking-tight">Mosaic</span>
          <span className="font-semibold text-gray-800 text-lg"> Talent Network</span>
        </Link>

        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
