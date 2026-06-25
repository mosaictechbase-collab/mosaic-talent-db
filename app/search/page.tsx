import { Suspense } from 'react'
import { searchProfiles, getFilterOptions } from '@/lib/search'
import FilterBar from '@/components/search/FilterBar'
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
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Explore Community</h1>

      {/* Search bar */}
      <div className="mb-4">
        <Suspense>
          <SearchBar defaultValue={params.q ?? ''} />
        </Suspense>
      </div>

      {/* Horizontal filters */}
      <div className="mb-6">
        <Suspense>
          <FilterBar options={filters} />
        </Suspense>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-400 mb-5">
        {results.total.toLocaleString()} result{results.total !== 1 ? 's' : ''}
      </p>

      {/* Cards grid */}
      {results.profiles.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg font-medium text-gray-500">No results found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
  )
}
