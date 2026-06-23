'use client'

import { useState, useEffect, useCallback } from 'react'
import { listImportBatches } from '@/app/admin/actions'

interface Batch {
  id: string
  filename: string | null
  imported_at: string
  row_count: number
  inserted_count: number
  updated_count: number
  dupes_skipped: number
  imported_by: string | null
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-gray-200 rounded-xl px-5 py-4 bg-white">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Analytics() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [total, setTotal] = useState(0)
  const [totalProfiles, setTotalProfiles] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    const res = await listImportBatches(p)
    setBatches(res.batches)
    setTotal(res.total)
    setTotalProfiles(res.totalProfiles)
    setLoading(false)
  }, [])

  useEffect(() => { load(page) }, [page, load])

  const totalInserted = batches.reduce((s, b) => s + (b.inserted_count ?? 0), 0)
  const totalUpdated = batches.reduce((s, b) => s + (b.updated_count ?? 0), 0)
  const totalPages = Math.ceil(total / 20)

  function fmt(dt: string) {
    const d = new Date(dt)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total members" value={totalProfiles.toLocaleString()} sub="active profiles in DB" />
        <StatCard label="Import batches" value={total} sub="all-time uploads" />
        <StatCard label="Rows inserted" value={totalInserted.toLocaleString()} sub="this page" />
        <StatCard label="Rows updated" value={totalUpdated.toLocaleString()} sub="this page" />
      </div>

      {/* Upload history table */}
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload history</h3>

      {loading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
      ) : batches.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">No imports yet.</div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">File</th>
                <th className="text-left px-4 py-3 font-medium">Imported at</th>
                <th className="text-right px-4 py-3 font-medium">Rows</th>
                <th className="text-right px-4 py-3 font-medium">Inserted</th>
                <th className="text-right px-4 py-3 font-medium">Updated</th>
                <th className="text-right px-4 py-3 font-medium">Dupes</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 max-w-[200px]">
                    <span className="font-mono text-xs text-gray-700 truncate block" title={b.filename ?? '—'}>
                      {b.filename ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{fmt(b.imported_at)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700">{b.row_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="text-green-700 font-medium">+{b.inserted_count.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="text-blue-600 font-medium">{b.updated_count.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-400">{b.dupes_skipped.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell truncate max-w-[140px]">
                    {b.imported_by ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
