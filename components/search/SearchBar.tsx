'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  defaultValue: string
}

export default function SearchBar({ defaultValue }: Props) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
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
          className="flex-1 py-2.5 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </form>
  )
}
