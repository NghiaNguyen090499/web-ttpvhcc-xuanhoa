'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý niêm yết công khai — CRUD file niêm yết và upload PDF/ảnh
 * @lienquan    : src/app/api/admin/public-notices/route.ts, src/app/api/admin/uploads/route.ts
 * @alias       : admin-niem-yet, public-notices-admin
 */

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Calendar, ClipboardList, Edit3, ExternalLink, FileImage,
  FileText, Plus, Save, Search, Tag, Trash2, UploadCloud
} from 'lucide-react'
import { useAdminRole } from '@/components/admin/AdminRoleContext'
import { NoticeCategoryManager } from '@/components/admin/NoticeCategoryManager'
import { uploadCmsFile } from '@/lib/cms-upload-client'

type NoticeFileType = 'pdf' | 'image' | 'doc' | string
type NoticeAttachment = { url: string; name?: string; fileType?: NoticeFileType }

interface PublicNoticeItem {
  id: string
  title: string
  category?: string
  fileUrl: string
  attachments?: NoticeAttachment[]
  fileType?: NoticeFileType
  publishedAt: string
  description?: string
}

type NoticeCategory = { id: string; name: string; usedCount?: number; isActive?: boolean }

const NOTICE_CATEGORIES = [
  'Cải cách TTHC',
  'Chỉ đạo điều hành',
  'Thủ tục HC',
  'Tài chính - Ngân sách',
  'Quy hoạch',
  'Thông báo',
]

const DEFAULT_FORM = {
  title: '',
  category: NOTICE_CATEGORIES[0],
  fileUrl: '',
  attachments: [] as NoticeAttachment[],
  fileType: 'pdf',
  publishedAt: '',
  description: '',
}

function formatDate(value: string) {
  if (!value) return ''
  return new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getFileTypeLabel(fileType?: NoticeFileType) {
  if (fileType === 'image') return 'Ảnh'
  if (fileType === 'doc') return 'DOC'
  return 'PDF'
}

function detectFileType(file: File): NoticeFileType {
  if (file.type.startsWith('image/')) return 'image'
  if (/\.(doc|docx)$/i.test(file.name)) return 'doc'
  return 'pdf'
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

export default function AdminPublicNoticesPage() {
  const { canEdit, canDelete } = useAdminRole()
  const [items, setItems] = useState<PublicNoticeItem[]>([])
  const [categories, setCategories] = useState<NoticeCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingItem, setEditingItem] = useState<PublicNoticeItem | null>(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function fetchItems() {
    try {
      const res = await fetch('/api/admin/public-notices')
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      console.error('Lỗi tải dữ liệu niêm yết')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/public-notice-categories')
      const data = await res.json()
      if (res.ok && Array.isArray(data.items)) setCategories(data.items)
    } catch {
      console.error('Lỗi tải danh mục niêm yết')
    }
  }

  useEffect(() => {
    let active = true

    fetch('/api/admin/public-notices')
      .then((res) => res.json())
      .then((data) => {
        if (active) setItems(data.items || [])
      })
      .catch(() => console.error('Lỗi tải dữ liệu niêm yết'))
      .finally(() => {
        if (active) setLoading(false)
      })

    const categoryTimer = window.setTimeout(() => { void fetchCategories() }, 0)

    return () => {
      active = false
      window.clearTimeout(categoryTimer)
    }
  }, [])

  const usedCategories = useMemo(() => {
    const names = new Set(categories.filter((category) => category.isActive !== false).map((category) => category.name))
    items.forEach((item) => { if (item.category) names.add(item.category) })
    return [...names]
  }, [categories, items])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchSearch = !keyword
        || item.title.toLowerCase().includes(keyword)
        || (item.description || '').toLowerCase().includes(keyword)
        || (item.category || '').toLowerCase().includes(keyword)
      const matchCategory = !filterCategory || item.category === filterCategory
      return matchSearch && matchCategory
    })
  }, [items, search, filterCategory])

  const openCreate = () => {
    if (!canEdit) return
    setEditingItem(null)
    setFormData({
      ...DEFAULT_FORM,
      category: categories.find((category) => category.isActive !== false)?.name || NOTICE_CATEGORIES[0],
      publishedAt: new Date().toISOString().slice(0, 10),
    })
    setShowEditor(true)
  }

  const openEdit = (item: PublicNoticeItem) => {
    if (!canEdit) return
    setEditingItem(item)
    setFormData({
      title: item.title,
      category: item.category || NOTICE_CATEGORIES[0],
      fileUrl: item.fileUrl,
      attachments: item.attachments?.length ? item.attachments : [{ url: item.fileUrl, name: 'Tài liệu chính', fileType: item.fileType || 'pdf' }],
      fileType: item.fileType || 'pdf',
      publishedAt: item.publishedAt,
      description: item.description || '',
    })
    setShowEditor(true)
  }

  const handleUpload = async (files: File[]) => {
    if (!files.length || !canEdit) return

    setUploading(true)
    try {
      const uploadedFiles: NoticeAttachment[] = []
      for (const file of files) {
        const uploaded = await uploadCmsFile(file, {
          folder: 'niem-yet',
          allowedMimePrefixes: ['image/', 'application/pdf'],
        })
        uploadedFiles.push({ url: uploaded.url, name: file.name, fileType: detectFileType(file) })
      }
      setFormData((current) => ({
        ...current,
        attachments: [...current.attachments, ...uploadedFiles],
        fileUrl: current.fileUrl || uploadedFiles[0]?.url || '',
        fileType: current.fileUrl ? current.fileType : (uploadedFiles[0]?.fileType || 'pdf'),
      }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể tải tệp lên')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!canEdit || !formData.title.trim() || !formData.fileUrl.trim()) return
    setSaving(true)

    try {
      const method = editingItem ? 'PUT' : 'POST'
      const body = editingItem ? { id: editingItem.id, ...formData } : formData
      const res = await fetch('/api/admin/public-notices', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        alert(await readApiError(res, 'Không thể lưu niêm yết'))
        return
      }

      await fetchItems()
      setShowEditor(false)
    } catch {
      alert('Không thể lưu niêm yết')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) return
    if (!confirm('Xóa văn bản niêm yết này?')) return

    try {
      const res = await fetch('/api/admin/public-notices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        alert(await readApiError(res, 'Không thể xóa niêm yết'))
        return
      }

      await fetchItems()
    } catch {
      alert('Không thể xóa niêm yết')
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
            {editingItem ? 'Sửa niêm yết' : 'Thêm niêm yết mới'}
          </h1>
        </div>

        <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Tiêu đề *</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Nhập tiêu đề văn bản niêm yết..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                {formData.category && !categories.some((category) => category.name === formData.category) && <option value={formData.category}>{formData.category} (dữ liệu cũ)</option>}
                {categories.filter((category) => category.isActive !== false).map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                {!categories.length && NOTICE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Ngày niêm yết</label>
              <input
                type="date"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Loại file</label>
              <select
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="pdf">PDF</option>
                <option value="image">Ảnh</option>
                <option value="doc">DOC</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">File niêm yết *</label>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <input
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="/uploads/niem-yet/file.pdf hoặc đường dẫn file"
              />
              <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold transition ${
                uploading ? 'pointer-events-none text-gray-400' : 'text-gray-700 hover:border-primary hover:text-primary'
              }`}>
                <UploadCloud className="h-4 w-4" />
                {uploading ? 'Đang tải...' : 'Tải PDF/ảnh'}
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    // FileList là đối tượng "live": phải sao chép trước khi reset input,
                    // nếu không danh sách sẽ rỗng và request upload không được gửi.
                    const files = Array.from(e.currentTarget.files || [])
                    e.currentTarget.value = ''
                    void handleUpload(files)
                  }}
                />
              </label>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">Có thể chọn nhiều PDF/ảnh cùng lúc. Tệp đầu tiên sẽ là tài liệu chính.</p>
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div key={`${attachment.url}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2 text-xs">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate font-medium text-primary hover:underline">{attachment.name || attachment.url}</a>
                    <button type="button" onClick={() => setFormData((current) => {
                      const attachments = current.attachments.filter((_, attachmentIndex) => attachmentIndex !== index)
                      const primary = attachments[0]
                      return { ...current, attachments, fileUrl: current.fileUrl === attachment.url ? (primary?.url || '') : current.fileUrl, fileType: current.fileUrl === attachment.url ? (primary?.fileType || 'pdf') : current.fileType }
                    })} className="shrink-0 text-gray-400 hover:text-red-600" title="Bỏ tệp">Bỏ</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Mô tả</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Mô tả ngắn hiển thị trên trang niêm yết..."
            />
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || uploading || !formData.title.trim() || !formData.fileUrl.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Đang lưu...' : 'Lưu niêm yết'}
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý niêm yết</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} văn bản niêm yết công khai</p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Thêm niêm yết
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tiêu đề, mô tả, danh mục..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">Tất cả danh mục</option>
          {usedCategories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </div>

      <NoticeCategoryManager canEdit={canEdit} onChanged={() => { void fetchCategories() }} />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">Chưa có niêm yết</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Niêm yết</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 md:table-cell">Danh mục</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 lg:table-cell">Ngày</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const TypeIcon = item.fileType === 'image' ? FileImage : FileText
                  return (
                    <tr key={item.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <TypeIcon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-medium text-gray-900">{item.title}</p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{item.description || item.fileUrl}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                          <Tag className="h-3 w-3" />
                          {item.category || 'Niêm yết'}
                        </span>
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {getFileTypeLabel(item.fileType)}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 lg:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.publishedAt)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                            title="Mở file"
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
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <a
        href="/niem-yet"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
      >
        <ClipboardList className="h-4 w-4" />
        Xem trang niêm yết công khai
      </a>
    </div>
  )
}
