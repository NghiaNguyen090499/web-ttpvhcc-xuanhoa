'use client'

import { useEffect, useState } from 'react'
import { Edit3, Plus, Save, Tag, Trash2, X } from 'lucide-react'

type Category = { id: string; name: string; usedCount?: number; isActive?: boolean }

export function NoticeCategoryManager({ canEdit, onChanged }: { canEdit: boolean; onChanged?: () => void }) {
  const [items, setItems] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const response = await fetch('/api/admin/public-notice-categories')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Không thể tải danh mục')
      setItems(data.items || [])
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải danh mục') } finally { setLoading(false) }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function mutate(method: 'POST' | 'PUT' | 'DELETE', body: Record<string, string>) {
    setSaving(true); setError('')
    try {
      const response = await fetch('/api/admin/public-notice-categories', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Thao tác thất bại')
      await load(); onChanged?.(); return true
    } catch (err) { setError(err instanceof Error ? err.message : 'Thao tác thất bại'); return false } finally { setSaving(false) }
  }

  async function add() {
    if (!name.trim() || !canEdit) return
    if (await mutate('POST', { name: name.trim() })) setName('')
  }

  async function saveEdit() {
    if (!editingId || !editingName.trim() || !canEdit) return
    if (await mutate('PUT', { id: editingId, name: editingName.trim() })) { setEditingId(null); setEditingName('') }
  }

  async function remove(item: Category) {
    if (!canEdit || (item.usedCount || 0) > 0) return
    if (!window.confirm(`Xóa danh mục “${item.name}”?`)) return
    await mutate('DELETE', { id: item.id })
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><Tag className="h-4 w-4 text-primary" />Danh mục niêm yết</h2><p className="mt-1 text-xs text-gray-500">Quản lý danh mục dùng khi tạo văn bản. Danh mục đang có dữ liệu chỉ được đổi tên.</p></div>
      </div>
      {canEdit && <div className="mt-4 flex gap-2"><input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void add() }} placeholder="Tên danh mục mới" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" /><button onClick={() => void add()} disabled={saving || !name.trim()} className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />Thêm</button></div>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      {loading ? <p className="mt-4 text-sm text-gray-400">Đang tải danh mục...</p> : <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{items.filter((item) => item.isActive !== false).map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2.5">{editingId === item.id ? <input autoFocus value={editingName} onChange={(event) => setEditingName(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2 py-1 text-sm" /> : <div className="min-w-0"><p className="truncate text-sm font-medium text-gray-800">{item.name}</p><p className="text-[11px] text-gray-400">{item.usedCount || 0} niêm yết</p></div>} {canEdit && <div className="flex shrink-0 items-center gap-1">{editingId === item.id ? <><button onClick={() => void saveEdit()} disabled={saving || !editingName.trim()} className="rounded-lg p-1.5 text-primary hover:bg-primary/5 disabled:opacity-50" title="Lưu"><Save className="h-4 w-4" /></button><button onClick={() => setEditingId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50" title="Hủy"><X className="h-4 w-4" /></button></> : <><button onClick={() => { setEditingId(item.id); setEditingName(item.name); setError('') }} className="rounded-lg p-1.5 text-gray-400 hover:bg-primary/5 hover:text-primary" title="Đổi tên"><Edit3 className="h-4 w-4" /></button><button onClick={() => void remove(item)} disabled={(item.usedCount || 0) > 0} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30" title={(item.usedCount || 0) > 0 ? 'Danh mục đang được sử dụng' : 'Xóa'}><Trash2 className="h-4 w-4" /></button></>}</div>}</div>)}</div>}
    </section>
  )
}
