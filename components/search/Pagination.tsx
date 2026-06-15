'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface Props {
  page: number
  totalPages: number
  total: number
  pageSize: number
}

export default function Pagination({ page, totalPages, total, pageSize }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function go(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}
