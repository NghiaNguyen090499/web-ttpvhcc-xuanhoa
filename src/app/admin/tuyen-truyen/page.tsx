'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý Video/File/Tuyên truyền — upload file/video và CRUD nội dung
 * @lienquan    : src/app/api/admin/propaganda/route.ts, src/app/api/admin/uploads/route.ts
 * @alias       : admin-tuyen-truyen, media-propaganda
 */

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Calendar, Edit3, FileText, Link as LinkIcon,
  Plus, Save, Search, Trash2, UploadCloud, Video
} from 'lucide-react'
import { useAdminRole } from '@/components/admin/AdminRoleContext'

type MediaType = 'article' | 'video' | 'file'

interface PropagandaItem {
  id: string
  icon: string
  tag: string
  tagColor: string
  title: string
  summary: string
  content: string
  publishedAt: string
  mediaType?: MediaType
  mediaUrl?: string
  fileName?: string
  fileSize?: number
}

interface UploadResult {
  url: string
  fileName: string
  fileSize: number
  mimeType: string
}

const TAG_COLORS = ['blue', 'red', 'green', 'orange', 'teal', 'amber']
const MAX_UPLOAD_SIZE = 300 * 1024 * 1024
const ALLOWED_UPLOAD_MIME_PREFIXES = ['image/', 'video/', 'application/pdf']
const DEFAULT_FORM = {
  icon: '📢',
  tag: 'Tuyên truyền',
  tagColor: 'blue',
  title: '',
  summary: '',
  content: '',
  publishedAt: '',
  mediaType: 'article' as MediaType,
  mediaUrl: '',
  fileName: '',
  fileSize: undefined as number | undefined,
}

function formatSize(size?: number) {
  if (!size) return ''
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function titleFromFileName(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim()
}

async function readUploadError(res: Response) {
  try {
    const data = await res.json()
    if (typeof data?.error === 'string') return data.error
  } catch {
    // Proxy/Nginx 413 có thể trả HTML hoặc body rỗng.
  }

  if (res.status === 413) return 'Tệp vượt quá dung lượng 300MB'
  return 'Không thể tải tệp lên'
}

function validateUploadFile(file: File) {
  if (file.size > MAX_UPLOAD_SIZE) {
    return 'Tệp vượt quá dung lượng 300MB'
  }

  const allowed = ALLOWED_UPLOAD_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))
  if (!allowed) {
    return 'Chỉ hỗ trợ ảnh, video hoặc PDF'
  }

  return null
}

export default function AdminPropagandaPage() {
  const { canEdit, canDelete } = useAdminRole()
  const [items, setItems] = useState<PropagandaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingItem, setEditingItem] = useState<PropagandaItem | null>(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  async function fetchItems() {
    try {
      const res = await fetch('/api/admin/propaganda')
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      console.error('Lỗi tải dữ liệu tuyên truyền')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    fetch('/api/admin/propaganda')
      .then((res) => res.json())
      .then((data) => {
        if (active) setItems(data.items || [])
      })
      .catch(() => console.error('Lỗi tải dữ liệu tuyên truyền'))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return items
    return items.filter((item) =>
      item.title.toLowerCase().includes(keyword)
      || item.summary.toLowerCase().includes(keyword)
      || item.tag.toLowerCase().includes(keyword)
    )
  }, [items, search])

  const openCreate = () => {
    if (!canEdit) return
    setEditingItem(null)
    setFormData({ ...DEFAULT_FORM, publishedAt: new Date().toISOString().slice(0, 10) })
    setShowEditor(true)
  }

  const openEdit = (item: PropagandaItem) => {
    if (!canEdit) return
    setEditingItem(item)
    setFormData({
      icon: item.icon,
      tag: item.tag,
      tagColor: item.tagColor,
      title: item.title,
      summary: item.summary,
      content: item.content,
      publishedAt: item.publishedAt,
      mediaType: item.mediaType || 'article',
      mediaUrl: item.mediaUrl || '',
      fileName: item.fileName || '',
      fileSize: item.fileSize,
    })
    setShowEditor(true)
  }

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    const validationError = validateUploadFile(file)
    if (validationError) {
      alert(validationError)
      setDragActive(false)
      return null
    }

    setUploading(true)

    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/admin/uploads', { method: 'POST', body })

      if (!res.ok) {
        alert(await readUploadError(res))
        return null
      }

      const data = await res.json()
      return data as UploadResult
    } catch {
      alert('Không thể tải tệp lên')
      return null
    } finally {
      setUploading(false)
      setDragActive(false)
    }
  }

  const handleUpload = async (file: File | undefined) => {
    if (!file || !canEdit) return
    const data = await uploadFile(file)
    if (!data) return

    setFormData((current) => ({
      ...current,
      mediaType: file.type.startsWith('video/') ? 'video' : 'file',
      mediaUrl: data.url,
      fileName: data.fileName,
      fileSize: data.fileSize,
    }))
  }

  const handleQuickUpload = async (file: File | undefined) => {
    if (!file || !canEdit) return
    const data = await uploadFile(file)
    if (!data) return

    const title = titleFromFileName(data.fileName)
    setEditingItem(null)
    setFormData({
      ...DEFAULT_FORM,
      icon: file.type.startsWith('video/') ? '🎬' : '📄',
      title,
      summary: title,
      content: `<p>${title}</p>`,
      publishedAt: new Date().toISOString().slice(0, 10),
      mediaType: file.type.startsWith('video/') ? 'video' : 'file',
      mediaUrl: data.url,
      fileName: data.fileName,
      fileSize: data.fileSize,
    })
    setShowEditor(true)
  }

  const handleSave = async () => {
    if (!canEdit || !formData.title.trim()) return
    setSaving(true)

    try {
      const method = editingItem ? 'PUT' : 'POST'
      const body = editingItem ? { ...formData, id: editingItem.id } : formData
      const res = await fetch('/api/admin/propaganda', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        await fetchItems()
        setShowEditor(false)
      }
    } catch {
      console.error('Lỗi lưu nội dung tuyên truyền')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) return
    if (!confirm('Bạn chắc chắn muốn xóa nội dung này?')) return

    await fetch('/api/admin/propaganda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await fetchItems()
  }

  if (showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {editingItem ? 'Sửa nội dung tuyên truyền' : 'Thêm Video/File/Tuyên truyền'}
          </h1>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_180px]">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Tiêu đề *</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="Nhập tiêu đề hiển thị..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Chuyên mục</label>
              <input
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Ngày đăng</label>
              <input
                type="date"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Loại nội dung</label>
              <select
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as MediaType })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="article">Bài tuyên truyền</option>
                <option value="video">Video</option>
                <option value="file">File/PDF</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Icon</label>
              <input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Màu thẻ</label>
              <select
                value={formData.tagColor}
                onChange={(e) => setFormData({ ...formData, tagColor: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                {TAG_COLORS.map((color) => <option key={color} value={color}>{color}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Tải video/file</label>
            <label
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault()
                handleUpload(e.dataTransfer.files?.[0])
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                dragActive ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50 hover:border-primary/50'
              }`}
            >
              <UploadCloud className="h-10 w-10 text-primary" />
              <span className="mt-2 text-sm font-semibold text-gray-800">
                {uploading ? 'Đang tải lên...' : 'Kéo thả tập tin vào đây hoặc chọn tệp để tải lên'}
              </span>
              <span className="mt-1 text-xs text-gray-500">Hỗ trợ video, ảnh hoặc PDF, tối đa 300MB</span>
              <input
                type="file"
                accept="image/*,video/*,application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleUpload(e.target.files?.[0])}
              />
            </label>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Đường dẫn media</label>
            <input
              value={formData.mediaUrl}
              onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Dán link video/PDF hoặc dùng vùng upload phía trên"
            />
            {formData.fileName && (
              <p className="mt-1.5 text-xs text-gray-500">
                Đã chọn: {formData.fileName} {formatSize(formData.fileSize)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Tóm tắt</label>
            <textarea
              rows={2}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Nội dung HTML</label>
            <textarea
              rows={10}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-primary"
              placeholder="<p>Nội dung chi tiết...</p>"
            />
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || uploading || !formData.title.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Đang lưu...' : 'Lưu nội dung'}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video/File/Tuyên truyền</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} nội dung</p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Thêm nội dung
          </button>
        )}
      </div>

      {canEdit ? (
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault()
            handleQuickUpload(e.dataTransfer.files?.[0])
          }}
          className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed bg-white px-5 py-5 transition ${
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
          }`}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-gray-900">
              {uploading ? 'Đang tải lên...' : 'Kéo thả video/file vào đây hoặc chọn tệp'}
            </span>
            <span className="mt-1 block text-sm text-gray-500">
              Sau khi upload, hệ thống sẽ mở form để nhập tiêu đề và lưu nội dung.
            </span>
          </span>
          <input
            type="file"
            accept="image/*,video/*,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleQuickUpload(e.target.files?.[0])}
          />
        </label>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Tài khoản hiện tại chỉ có quyền xem. Cần quyền EDITOR hoặc ADMIN để tải video/file.
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm tiêu đề, tóm tắt, chuyên mục..."
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">Chưa có nội dung</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Nội dung</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 md:table-cell">Loại</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 lg:table-cell">Ngày đăng</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const TypeIcon = item.mediaType === 'video' ? Video : item.mediaType === 'file' ? FileText : LinkIcon
                  return (
                    <tr key={item.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <p className="line-clamp-1 font-medium text-gray-900">{item.icon} {item.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{item.summary}</p>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                          <TypeIcon className="h-3 w-3" />
                          {item.mediaType === 'video' ? 'Video' : item.mediaType === 'file' ? 'File' : 'Bài viết'}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 lg:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {item.publishedAt}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {item.mediaUrl && (
                            <a
                              href={item.mediaUrl}
                              target="_blank"
                              className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                              title="Mở media"
                            >
                              <LinkIcon className="h-4 w-4" />
                            </a>
                          )}
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
    </div>
  )
}
