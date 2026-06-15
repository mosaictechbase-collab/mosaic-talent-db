import { Suspense } from 'react'
import { searchProfiles, getFilterOptions } from '@/lib/search'
import FilterSidebar from '@/components/search/FilterSidebar'
import ProfileCard from '@/components/search/ProfileCard'
import Pagination from '@/components/search/Pagination'
import SearchBar from '@/components/search/SearchBar'
import type { SearchParams } from '@/lib/types'

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [results, filters] = await Promise.all([
    searchProfiles(params),
    getFilterOptions(),
  ])

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Explore Community</h1>
      {/* Top search bar */}
      <div className="mb-6">
        <Suspense>
          <SearchBar defaultValue={params.q ?? ''} />
        </Suspense>
      </div>

      <div className="flex gap-8">
        {/* Left filter sidebar */}
        <Suspense>
          <FilterSidebar options={filters} />
        </Suspense>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-4">
            {results.total} result{results.total !== 1 ? 's' : ''}
          </p>

          {results.profiles.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium text-gray-500">No results found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}

          <Suspense>
            <Pagination
              page={results.page}
              totalPages={results.totalPages}
              total={results.total}
              pageSize={results.pageSize}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
