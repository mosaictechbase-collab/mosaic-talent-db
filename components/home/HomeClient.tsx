'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConnectSection from '@/components/home/ConnectSection'

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k+`
  if (n > 0) return `${n}+`
  return '—'
}

export default function HomeClient({ memberCount }: { memberCount: number }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="flex flex-col items-center px-4 pb-32">
      {/* Hero */}
      <div className="flex flex-col items-center text-center max-w-2xl w-full pt-24 pb-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
          Find collaborators across Mosaic
        </h1>
        <p className="text-gray-500 text-lg mb-10">
          Search engineers, founders, designers, and operators across our
          <br className="hidden sm:block" /> student-led, entrepreneurial organizations
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-lg mx-auto">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent mb-4">
            <div className="pl-4 pr-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, skill, or interest..."
              className="flex-1 py-3 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            Search Network
          </button>
        </form>

        <div className="flex justify-center gap-16 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{formatCount(memberCount)}</div>
            <div className="text-sm text-gray-500 mt-1">Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">15+</div>
            <div className="text-sm text-gray-500 mt-1">Organizations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">100+</div>
            <div className="text-sm text-gray-500 mt-1">Skills</div>
          </div>
        </div>
      </div>

      {/* Connect section */}
      <ConnectSection />
    </div>
  )
}
