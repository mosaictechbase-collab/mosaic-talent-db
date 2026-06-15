'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [connectEmail, setConnectEmail] = useState('')
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
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-gray-500 mt-1">Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">50+</div>
            <div className="text-sm text-gray-500 mt-1">Organizations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">100+</div>
            <div className="text-sm text-gray-500 mt-1">Skills</div>
          </div>
        </div>
      </div>

      {/* Connect section */}
      <div className="w-full max-w-2xl">
        <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-8 py-6 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-lg font-semibold">Connect with Our Mosaic Community</h2>
            </div>
            <p className="text-blue-100 text-sm">
              Enter your student email to find your top matches across the ecosystem
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <div className="flex gap-3">
              <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <div className="pl-4 pr-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={connectEmail}
                  onChange={(e) => setConnectEmail(e.target.value)}
                  placeholder="yourname@northeastern.edu"
                  className="flex-1 py-3 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Find My Matches
              </button>
            </div>

            {/* Placeholder match cards */}
            <div className="mt-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Your top matches will appear here</p>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto mb-2" />
                    <div className="h-2.5 bg-gray-200 rounded w-3/4 mx-auto mb-1.5" />
                    <div className="h-2 bg-gray-100 rounded w-1/2 mx-auto mb-2" />
                    <div className="flex gap-1 justify-center">
                      <div className="h-5 w-12 bg-blue-50 rounded-full" />
                      <div className="h-5 w-10 bg-blue-50 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              We&apos;ll match you based on shared skills, interests, and organizations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
