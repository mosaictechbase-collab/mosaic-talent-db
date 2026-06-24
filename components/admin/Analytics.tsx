'use client'

import { useState, useEffect, useCallback } from 'react'
import { listImportBatches, listAuditLog } from '@/app/admin/actions'

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

interface AuditEntry {
  id: string
  action: string
  profile_name: string | null
  performed_by: string | null
  created_at: string
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

function fmt(dt: string) {
  const d = new Date(dt)
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  )
}

const ACTION_STYLES: Record<string, string> = {
  add: 'bg-green-50 text-green-700',
  update: 'bg-blue-50 text-blue-700',
  delete: 'bg-red-50 text-red-600',
}

export default function Analytics() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [batchTotal, setBatchTotal] = useState(0)
  const [batchPage, setBatchPage] = useState(1)
  const [totalProfiles, setTotalProfiles] = useState(0)

  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditPage, setAuditPage] = useState(1)

  const [loading, setLoading] = useState(true)
  const [auditLoading, setAuditLoading] = useState(true)

  const loadBatches = useCallback(async (p: number) => {
    setLoading(true)
    const res = await listImportBatches(p)
    setBatches(res.batches)
    setBatchTotal(res.total)
    setTotalProfiles(res.totalProfiles)
    setLoading(false)
  }, [])

  const loadAudit = useCallback(async (p: number) => {
    setAuditLoading(true)
    const res = await listAuditLog(p)
    setAudit(res.entries)
    setAuditTotal(res.total)
    setAuditLoading(false)
  }, [])

  useEffect(() => { loadBatches(batchPage) }, [batchPage, loadBatches])
  useEffect(() => { loadAudit(auditPage) }, [auditPage, loadAudit])

  const totalInserted = batches.reduce((s, b) => s + (b.inserted_count ?? 0), 0)
  const totalUpdated = batches.reduce((s, b) => s + (b.updated_count ?? 0), 0)
  const batchPages = Math.ceil(batchTotal / 20)
  const auditPages = Math.ceil(auditTotal / 50)

  return (
    <div className="space-y-10">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total members" value={totalProfiles.toLocaleString()} sub="active profiles in DB" />
        <StatCard label="Import batches" value={batchTotal} sub="all-time uploads" />
        <StatCard label="Manual edits" value={auditTotal} sub="adds, updates, deletes" />
        <StatCard label="Rows inserted" value={totalInserted.toLocaleString()} sub="via CSV (this page)" />
      </div>

      {/* Manual edit log */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Manual edit history</h3>
        {auditLoading ? (
          <div className="text-sm text-gray-400 py-6 text-center">Loading…</div>
        ) : audit.length === 0 ? (
          <div className="text-sm text-gray-400 py-6 text-center">No manual edits yet.</div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                  <th className="text-left px-4 py-3 font-medium">Profile</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">By</th>
                  <th className="text-left px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {audit.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ACTION_STYLES[e.action] ?? 'bg-gray-100 text-gray-600'}`}>
                        {e.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{e.profile_name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell truncate max-w-[160px]">
                      {e.performed_by ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmt(e.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {auditPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button onClick={() => setAuditPage(p => Math.max(1, p - 1))} disabled={auditPage <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="text-sm text-gray-500">Page {auditPage} of {auditPages}</span>
            <button onClick={() => setAuditPage(p => Math.min(auditPages, p + 1))} disabled={auditPage >= auditPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>

      {/* Upload history */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload history</h3>
        {loading ? (
          <div className="text-sm text-gray-400 py-6 text-center">Loading…</div>
        ) : batches.length === 0 ? (
          <div className="text-sm text-gray-400 py-6 text-center">No imports yet.</div>
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
                    <td className="px-4 py-3 max-w-[180px]">
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
        {batchPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button onClick={() => setBatchPage(p => Math.max(1, p - 1))} disabled={batchPage <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="text-sm text-gray-500">Page {batchPage} of {batchPages}</span>
            <button onClick={() => setBatchPage(p => Math.min(batchPages, p + 1))} disabled={batchPage >= batchPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
