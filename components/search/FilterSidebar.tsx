'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { FilterOptions } from '@/lib/types'

interface Props {
  options: FilterOptions
}

interface FilterGroupProps {
  title: string
  items: string[]
  paramKey: string
  current: string | null
}

function FilterGroup({ title, items, paramKey, current }: FilterGroupProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function toggle(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (current === value) {
      params.delete(paramKey)
    } else {
      params.set(paramKey, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  if (items.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item}>
            <button
              onClick={() => toggle(item)}
              className="flex items-center gap-2 w-full text-left text-sm text-gray-700 hover:text-gray-900 py-0.5"
            >
              <span
                className={`w-3.5 h-3.5 border rounded-sm flex-shrink-0 transition-colors ${
                  current === item
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-400'
                }`}
              />
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FilterSidebar({ options }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeFilters = ['org', 'role', 'skill', 'interest', 'year'].filter((k) =>
    searchParams.get(k)
  )

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString())
    ;['org', 'role', 'skill', 'interest', 'year'].forEach((k) => params.delete(k))
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <aside className="w-56 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterGroup
        title="Skills"
        items={options.skills}
        paramKey="skill"
        current={searchParams.get('skill')}
      />
      <FilterGroup
        title="Organization"
        items={options.organizations}
        paramKey="org"
        current={searchParams.get('org')}
      />
      <FilterGroup
        title="Interests"
        items={options.interests}
        paramKey="interest"
        current={searchParams.get('interest')}
      />
      <FilterGroup
        title="Graduation Year"
        items={options.graduationYears.map(String)}
        paramKey="year"
        current={searchParams.get('year')}
      />
    </aside>
  )
}
