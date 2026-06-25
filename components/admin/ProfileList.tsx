'use client'

import { useState, useEffect, useCallback } from 'react'
import { listProfiles, deleteProfile, updateProfile, type ManualProfileInput } from '@/app/admin/actions'

const COLLEGES = ['COE', 'Khoury', 'DMSB', 'Bouve', 'COS', 'CSSH', 'CAMD', 'Mills', 'CPS']

interface ProfileRow {
  id: string
  full_name: string
  email: string | null
  college: string | null
  organizations: string[]
  skills: string[]
  interests: string[]
  graduation_year: number | null
}

const empty: ManualProfileInput = {
  full_name: '', email: '', college: '', organizations: '',
  skills: '', interests: '', graduation_year: '',
}

function toInput(p: ProfileRow): ManualProfileInput {
  return {
    full_name: p.full_name,
    email: p.email ?? '',
    college: p.college ?? '',
    organizations: p.organizations.join(', '),
    skills: p.skills.join(', '),
    interests: p.interests.join(', '),
    graduation_year: p.graduation_year?.toString() ?? '',
  }
}

export default function ProfileList({ refreshKey }: { refreshKey: number }) {
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [editing, setEditing] = useState<ProfileRow | null>(null)
  const [form, setForm] = useState<ManualProfileInput>(empty)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const load = useCallback(async (p: number, query: string) => {
    setLoading(true)
    const result = await listProfiles(p, query)
    setProfiles(result.profiles as ProfileRow[])
    setTotal(result.total)
    setLoading(false)
  }, [])

  useEffect(() => { load(page, search) }, [page, search, refreshKey, load])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault(); setPage(1); setSearch(q)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id); setListError(null)
    const result = await deleteProfile(id)
    if (result.error) setListError(result.error)
    else await load(page, search)
    setDeleting(null)
  }

  function openEdit(p: ProfileRow) { setEditing(p); setForm(toInput(p)); setEditError(null) }
  function closeEdit() { setEditing(null); setForm(empty); setEditError(null) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing || !form.full_name.trim()) return
    setSaving(true); setEditError(null)
    const result = await updateProfile(editing.id, form)
    if (result.error) setEditError(result.error)
    else { closeEdit(); await load(page, search) }
    setSaving(false)
  }

  const totalPages = Math.ceil(total / 50)
  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name…"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Search</button>
        {search && <button type="button" onClick={() => { setQ(''); setSearch(''); setPage(1) }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</button>}
      </form>

      <p className="text-sm text-gray-500 mb-3">{total} profile{total !== 1 ? 's' : ''}</p>
      {listError && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{listError}</div>}

      {loading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
      ) : profiles.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">No profiles found.</div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">College</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Org</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Year</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{p.full_name}</td>
                  <td className="px-4 py-2.5 text-gray-500">{p.email ?? '—'}</td>
                  <td className="px-4 py-2.5 text-gray-500">{p.college ?? '—'}</td>
                  <td className="px-4 py-2.5 text-gray-500">{p.organizations.slice(0, 2).join(', ') || '—'}</td>
                  <td className="px-4 py-2.5 text-gray-500">{p.graduation_year ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                      <button onClick={() => handleDelete(p.id, p.full_name)} disabled={deleting === p.id}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 font-medium">
                        {deleting === p.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={closeEdit}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Edit profile</h2>
              <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {editError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{editError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                  <select value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} className={inputCls}>
                    <option value="">Select college…</option>
                    {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                  <input value={form.graduation_year} onChange={e => setForm(f => ({ ...f, graduation_year: e.target.value }))} placeholder="2026" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizations</label>
                  <input value={form.organizations} onChange={e => setForm(f => ({ ...f, organizations: e.target.value }))} placeholder="Generate, Scout" className={inputCls} />
                  <p className="text-xs text-gray-400 mt-0.5">Comma-separated</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="Python, React, Figma" className={inputCls} />
                  <p className="text-xs text-gray-400 mt-0.5">Comma-separated</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                  <input value={form.interests} onChange={e => setForm(f => ({ ...f, interests: e.target.value }))} placeholder="FinTech, Sustainability" className={inputCls} />
                  <p className="text-xs text-gray-400 mt-0.5">Comma-separated</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEdit} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || !form.full_name.trim()}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
