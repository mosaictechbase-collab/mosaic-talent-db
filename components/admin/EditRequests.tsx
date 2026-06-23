'use client'

import { useState, useEffect, useCallback } from 'react'
import { listEditRequests, dismissEditRequest } from '@/app/admin/actions'

interface EditRequest {
  id: string
  email: string
  message: string
  status: string
  created_at: string
  profile: { full_name: string } | null
}

export default function EditRequests() {
  const [requests, setRequests] = useState<EditRequest[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [dismissing, setDismissing] = useState<string | null>(null)
  const [showReviewed, setShowReviewed] = useState(false)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    const result = await listEditRequests(p)
    setRequests(result.requests)
    setTotal(result.total)
    setLoading(false)
  }, [])

  useEffect(() => { load(page) }, [page, load])

  async function handleDismiss(id: string) {
    setDismissing(id)
    await dismissEditRequest(id)
    await load(page)
    setDismissing(null)
  }

  const visible = showReviewed ? requests : requests.filter(r => r.status === 'pending')
  const pendingCount = requests.filter(r => r.status === 'pending').length
  const totalPages = Math.ceil(total / 50)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showReviewed}
            onChange={(e) => setShowReviewed(e.target.checked)}
            className="rounded"
          />
          Show reviewed
        </label>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">
          {showReviewed ? 'No edit requests yet.' : 'No pending edit requests.'}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => (
            <div
              key={r.id}
              className={`border rounded-xl p-4 ${r.status === 'reviewed' ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">
                      {r.profile?.full_name ?? 'Unknown profile'}
                    </p>
                    {r.status === 'pending' && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Pending</span>
                    )}
                    {r.status === 'reviewed' && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Reviewed</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{r.email} · {new Date(r.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.message}</p>
                </div>
                {r.status === 'pending' && (
                  <button
                    onClick={() => handleDismiss(r.id)}
                    disabled={dismissing === r.id}
                    className="shrink-0 text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    {dismissing === r.id ? 'Marking…' : 'Mark reviewed'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
