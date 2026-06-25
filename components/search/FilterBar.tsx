'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { FilterOptions } from '@/lib/types'

interface Props {
  options: FilterOptions
}

const FILTERS = [
  { label: 'Organization', paramKey: 'org', optionsKey: 'organizations' as const },
  { label: 'Skills',       paramKey: 'skill', optionsKey: 'skills' as const },
  { label: 'Interests',    paramKey: 'interest', optionsKey: 'interests' as const },
  { label: 'College',      paramKey: 'college', optionsKey: 'colleges' as const },
  { label: 'Grad Year',    paramKey: 'year', optionsKey: 'graduationYears' as const },
]

function FilterDropdown({
  label, paramKey, items, current,
}: {
  label: string; paramKey: string; items: string[]; current: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (current === value) params.delete(paramKey)
    else params.set(paramKey, value)
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  const isActive = !!current

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
          isActive
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
        }`}
      >
        {isActive ? current : label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg py-1.5 min-w-[180px] max-h-64 overflow-y-auto">
          {isActive && (
            <button
              onClick={() => select(current!)}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 font-medium"
            >
              Clear
            </button>
          )}
          {items.map((item) => (
            <button
              key={item}
              onClick={() => select(item)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                current === item
                  ? 'text-gray-900 font-semibold bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FilterBar({ options }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeCount = FILTERS.filter(f => searchParams.get(f.paramKey)).length

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString())
    FILTERS.forEach(f => params.delete(f.paramKey))
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {FILTERS.map(f => {
        const items = options[f.optionsKey].map(String)
        return (
          <FilterDropdown
            key={f.paramKey}
            label={f.label}
            paramKey={f.paramKey}
            items={items}
            current={searchParams.get(f.paramKey)}
          />
        )
      })}
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="px-3.5 py-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
