'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý văn bản chỉ đạo điều hành — CRUD văn bản và upload PDF
 * @lienquan    : src/app/api/admin/directive-documents/route.ts, src/app/api/admin/uploads/route.ts
 * @alias       : admin-van-ban, directive-documents-admin
 */

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Calendar, Edit3, ExternalLink, FileText, Plus,
  Save, Search, ScrollText, Trash2, UploadCloud
} from 'lucide-react'
import { useAdminRole } from '@/components/admin/AdminRoleContext'
import { uploadCmsFile } from '@/lib/cms-upload-client'

interface DirectiveDocumentItem {
  id: string
  soKyHieu: string
  loai: string
  trichYeu: string
  ngayBanHanh: string
  coQuanBanHanh: string
  nguoiKy: string
  linhVuc: string
  fileUrl: string
  trangThai: string
}

const DOCUMENT_TYPES = ['Công văn', 'Quyết định', 'Kế hoạch', 'Thông báo', 'Báo cáo', 'Tờ trình']
const DOCUMENT_STATUSES = ['Có hiệu lực', 'Hết hiệu lực', 'Thay thế', 'Đang cập nhật']
const DEFAULT_FORM = {
  soKyHieu: '',
  loai: DOCUMENT_TYPES[0],
  trichYeu: '',
  ngayBanHanh: '',
  coQuanBanHanh: 'UBND Phường Xuân Hòa',
  nguoiKy: '',
  linhVuc: 'Hành chính',
  fileUrl: '',
  trangThai: DOCUMENT_STATUSES[0],
}

function formatDate(value: string) {
  if (!value) return ''
  return new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getTypeColor(type: string) {
  switch (type) {
    case 'Quyết định': return 'bg-red-50 text-red-700'
    case 'Kế hoạch': return 'bg-blue-50 text-blue-700'
    case 'Thông báo': return 'bg-amber-50 text-amber-700'
    case 'Công văn': return 'bg-emerald-50 text-emerald-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

async function readApiError(res: Response, fallback: string) {
  try {
    const data = await res.json()
    if (typeof data?.error === 'string') return data.error
  } catch {
    // Body lỗi có thể rỗng hoặc không phải JSON.
  }
  return fallback
}

export default function AdminDirectiveDocumentsPage() {
  const { canEdit, canDelete } = useAdminRole()
  const [items, setItems] = useState<DirectiveDocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingItem, setEditingItem] = useState<DirectiveDocumentItem | null>(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function fetchItems() {
    try {
      const res = await fetch('/api/admin/directive-documents')
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      console.error('Lỗi tải dữ liệu văn bản')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    fetch('/api/admin/directive-documents')
      .then((res) => res.json())
      .then((data) => {
        if (active) setItems(data.items || [])
      })
      .catch(() => console.error('Lỗi tải dữ liệu văn bản'))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const usedTypes = useMemo(() => {
    return [...new Set(items.map((item) => item.loai).filter(Boolean))]
  }, [items])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchSearch = !keyword
        || item.soKyHieu.toLowerCase().includes(keyword)
        || item.trichYeu.toLowerCase().includes(keyword)
        || item.linhVuc.toLowerCase().includes(keyword)
        || item.nguoiKy.toLowerCase().includes(keyword)
      const matchType = !filterType || item.loai === filterType
      return matchSearch && matchType
    })
  }, [items, search, filterType])

  const openCreate = () => {
    if (!canEdit) return
    setEditingItem(null)
    setFormData({
      ...DEFAULT_FORM,
      ngayBanHanh: new Date().toISOString().slice(0, 10),
    })
    setShowEditor(true)
  }

  const openEdit = (item: DirectiveDocumentItem) => {
    if (!canEdit) return
    setEditingItem(item)
    setFormData({
      soKyHieu: item.soKyHieu,
      loai: item.loai,
      trichYeu: item.trichYeu,
      ngayBanHanh: item.ngayBanHanh,
      coQuanBanHanh: item.coQuanBanHanh,
      nguoiKy: item.nguoiKy,
      linhVuc: item.linhVuc,
      fileUrl: item.fileUrl,
      trangThai: item.trangThai,
    })
    setShowEditor(true)
  }

  const handleUpload = async (file: File | undefined) => {
    if (!file || !canEdit) return

    setUploading(true)
    try {
      const uploaded = await uploadCmsFile(file, {
        folder: 'van-ban',
        allowedMimePrefixes: ['application/pdf'],
      })
      setFormData((current) => ({ ...current, fileUrl: uploaded.url }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể tải PDF lên')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!canEdit || !formData.soKyHieu.trim() || !formData.trichYeu.trim() || !formData.fileUrl.trim()) return
    setSaving(true)

    try {
      const method = editingItem ? 'PUT' : 'POST'
      const body = editingItem ? { id: editingItem.id, ...formData } : formData
      const res = await fetch('/api/admin/directive-documents', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        alert(await readApiError(res, 'Không thể lưu văn bản'))
        return
      }

      await fetchItems()
      setShowEditor(false)
    } catch {
      alert('Không thể lưu văn bản')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) return
    if (!confirm('Xóa văn bản này?')) return

    try {
      const res = await fetch('/api/admin/directive-documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        alert(await readApiError(res, 'Không thể xóa văn bản'))
        return
      }

      await fetchItems()
    } catch {
      alert('Không thể xóa văn bản')
    }
  }

  if (showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {editingItem ? 'Sửa văn bản' : 'Thêm văn bản mới'}
          </h1>
        </div>

        <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[180px_180px_180px_1fr]">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Số ký hiệu *</label>
              <input
                value={formData.soKyHieu}
                onChange={(e) => setFormData({ ...formData, soKyHieu: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="123/TB-UBND"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Loại văn bản</label>
              <select
                value={formData.loai}
                onChange={(e) => setFormData({ ...formData, loai: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                {DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Ngày ban hành</label>
              <input
                type="date"
                value={formData.ngayBanHanh}
                onChange={(e) => setFormData({ ...formData, ngayBanHanh: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Lĩnh vực</label>
              <input
                value={formData.linhVuc}
                onChange={(e) => setFormData({ ...formData, linhVuc: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="Cải cách hành chính"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Trích yếu *</label>
            <textarea
              rows={4}
              value={formData.trichYeu}
              onChange={(e) => setFormData({ ...formData, trichYeu: e.target.value })}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Nội dung trích yếu văn bản..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Cơ quan ban hành</label>
              <input
                value={formData.coQuanBanHanh}
                onChange={(e) => setFormData({ ...formData, coQuanBanHanh: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Người ký</label>
              <input
                value={formData.nguoiKy}
                onChange={(e) => setFormData({ ...formData, nguoiKy: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Trạng thái</label>
              <select
                value={formData.trangThai}
                onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                {DOCUMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">File PDF *</label>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <input
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="/uploads/van-ban/file.pdf hoặc đường dẫn PDF"
              />
              <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold transition ${
                uploading ? 'pointer-events-none text-gray-400' : 'text-gray-700 hover:border-primary hover:text-primary'
              }`}>
                <UploadCloud className="h-4 w-4" />
                {uploading ? 'Đang tải...' : 'Tải PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.currentTarget.value = ''
                    handleUpload(file)
                  }}
                />
              </label>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">Upload sẽ lưu file vào thư mục CMS `/uploads/van-ban`.</p>
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || uploading || !formData.soKyHieu.trim() || !formData.trichYeu.trim() || !formData.fileUrl.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Đang lưu...' : 'Lưu văn bản'}
            </button>
            <button
              onClick={() => setShowEditor(false)}
              className="rounded-xl px-6 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-800"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý văn bản</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} văn bản chỉ đạo điều hành</p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Thêm văn bản
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm số ký hiệu, trích yếu, lĩnh vực, người ký..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">Tất cả loại văn bản</option>
          {usedTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">Chưa có văn bản</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Văn bản</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 md:table-cell">Loại</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 lg:table-cell">Ngày ban hành</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium text-gray-900">{item.trichYeu}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                            {item.soKyHieu} · {item.linhVuc} · {item.nguoiKy || 'Chưa nhập người ký'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getTypeColor(item.loai)}`}>
                        {item.loai}
                      </span>
                      <span className="ml-2 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                        {item.trangThai}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.ngayBanHanh)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                          title="Mở PDF"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        {canEdit && (
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-primary/5 hover:text-primary"
                            title="Sửa"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <a
        href="/van-ban"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
      >
        <ScrollText className="h-4 w-4" />
        Xem trang văn bản chỉ đạo điều hành
      </a>
    </div>
  )
}
