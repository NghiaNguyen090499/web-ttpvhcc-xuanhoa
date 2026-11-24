'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Biên tập trang Chuyển đổi số và tài nguyên liên quan
 * @lienquan    : src/app/api/admin/chuyen-doi-so/route.ts, src/components/admin/RichTextEditor.tsx
 * @alias       : admin-digital-transformation
 */

import { useEffect, useState } from 'react'
import {
  ExternalLink,
  Eye,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { useAdminRole } from '@/components/admin/AdminRoleContext'
import type {
  DigitalHighlight,
  DigitalResource,
  DigitalTransformationContent,
} from '@/lib/digital-transformation'

const EMPTY_HIGHLIGHT: DigitalHighlight = {
  value: '',
  label: '',
  note: '',
}

const EMPTY_RESOURCE: DigitalResource = {
  id: '',
  title: '',
  description: '',
  url: '',
  kind: 'Tài nguyên',
  isActive: true,
  sortOrder: 1,
}

export default function AdminDigitalTransformationPage() {
  const { canEdit } = useAdminRole()
  const [form, setForm] = useState<DigitalTransformationContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/chuyen-doi-so')
      .then((response) => response.json())
      .then((data: DigitalTransformationContent) => setForm(data))
      .catch(() => setMessage('Không thể tải nội dung Chuyển đổi số'))
      .finally(() => setLoading(false))
  }, [])

  const updateMetadata = (
    updater: (metadata: DigitalTransformationContent['metadata']) => DigitalTransformationContent['metadata']
  ) => {
    setForm((current) => current ? { ...current, metadata: updater(current.metadata) } : current)
  }

  const updateHighlight = (index: number, field: keyof DigitalHighlight, value: string) => {
    updateMetadata((metadata) => ({
      ...metadata,
      highlights: metadata.highlights.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }))
  }

  const updateResource = (index: number, field: keyof DigitalResource, value: string | boolean | number) => {
    updateMetadata((metadata) => ({
      ...metadata,
      resources: metadata.resources.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }))
  }

  const handleSave = async () => {
    if (!canEdit || !form) return
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/chuyen-doi-so', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) {
        setMessage(result.error || 'Không thể lưu nội dung')
        return
      }
      setForm(result.content)
      setMessage('Đã lưu nội dung Chuyển đổi số')
    } catch {
      setMessage('Không thể kết nối máy chủ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 text-sm text-gray-500">Đang tải nội dung...</div>
  }

  if (!form) {
    return <div className="rounded-2xl bg-white p-8 text-sm text-red-600">{message || 'Không có dữ liệu'}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Trang nội dung</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Chuyển đổi số</h1>
          <p className="mt-1 text-sm text-gray-500">
            Biên tập nội dung công khai, điểm nhấn và các liên kết tài nguyên.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/chuyen-doi-so"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary/30 hover:text-primary"
          >
            <Eye className="h-4 w-4" />
            Xem trang
          </a>
          <button
            onClick={handleSave}
            disabled={!canEdit || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm ${message.startsWith('Đã lưu') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Tiêu đề và mô tả</h2>
        <div className="mt-4 grid gap-4">
          <label className="text-sm font-semibold text-gray-700">
            Tiêu đề trang
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              disabled={!canEdit}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-primary disabled:bg-gray-50"
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Mô tả ngắn
            <textarea
              value={form.metadata.summary}
              onChange={(event) => updateMetadata((metadata) => ({ ...metadata, summary: event.target.value }))}
              disabled={!canEdit}
              rows={3}
              className="mt-1.5 w-full resize-y rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-primary disabled:bg-gray-50"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Điểm nhấn</h2>
            <p className="mt-1 text-xs text-gray-500">Hiển thị thành các ô thông tin ngay dưới phần đầu trang.</p>
          </div>
          <button
            onClick={() => updateMetadata((metadata) => ({ ...metadata, highlights: [...metadata.highlights, { ...EMPTY_HIGHLIGHT }] }))}
            disabled={!canEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Thêm ô
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {form.metadata.highlights.map((item, index) => (
            <div key={index} className="rounded-xl border border-gray-200 p-4">
              <div className="grid grid-cols-[96px_1fr] gap-3">
                <label className="text-xs font-semibold text-gray-600">
                  Giá trị
                  <input
                    value={item.value}
                    onChange={(event) => updateHighlight(index, 'value', event.target.value)}
                    disabled={!canEdit}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold outline-none focus:border-primary disabled:bg-gray-50"
                  />
                </label>
                <label className="text-xs font-semibold text-gray-600">
                  Nhãn
                  <input
                    value={item.label}
                    onChange={(event) => updateHighlight(index, 'label', event.target.value)}
                    disabled={!canEdit}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal outline-none focus:border-primary disabled:bg-gray-50"
                  />
                </label>
              </div>
              <label className="mt-3 block text-xs font-semibold text-gray-600">
                Mô tả
                <input
                  value={item.note}
                  onChange={(event) => updateHighlight(index, 'note', event.target.value)}
                  disabled={!canEdit}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal outline-none focus:border-primary disabled:bg-gray-50"
                />
              </label>
              <button
                onClick={() => updateMetadata((metadata) => ({ ...metadata, highlights: metadata.highlights.filter((_, itemIndex) => itemIndex !== index) }))}
                disabled={!canEdit}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa ô
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900">Nội dung chi tiết</h2>
          <p className="mt-1 text-xs text-gray-500">Có thể chèn ảnh và PDF bằng nút upload trong trình soạn thảo.</p>
        </div>
        <div className="mt-4">
          <RichTextEditor
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
            disabled={!canEdit}
            folder="chuyen-doi-so"
            height={520}
            placeholder="Nhập nội dung hướng dẫn chuyển đổi số..."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Tài nguyên và liên kết</h2>
            <p className="mt-1 text-xs text-gray-500">Mỗi liên kết sẽ mở ở tab mới trên trang công khai.</p>
          </div>
          <button
            onClick={() => updateMetadata((metadata) => ({ ...metadata, resources: [...metadata.resources, { ...EMPTY_RESOURCE, sortOrder: metadata.resources.length + 1 }] }))}
            disabled={!canEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Thêm liên kết
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {form.metadata.resources.map((resource, index) => (
            <div key={index} className="rounded-xl border border-gray-200 p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_150px]">
                <label className="text-xs font-semibold text-gray-600">
                  Tên tài nguyên
                  <input
                    value={resource.title}
                    onChange={(event) => updateResource(index, 'title', event.target.value)}
                    disabled={!canEdit}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal outline-none focus:border-primary disabled:bg-gray-50"
                  />
                </label>
                <label className="text-xs font-semibold text-gray-600">
                  Đường dẫn URL
                  <input
                    type="url"
                    value={resource.url}
                    onChange={(event) => updateResource(index, 'url', event.target.value)}
                    disabled={!canEdit}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal outline-none focus:border-primary disabled:bg-gray-50"
                  />
                </label>
                <label className="text-xs font-semibold text-gray-600">
                  Loại
                  <input
                    value={resource.kind}
                    onChange={(event) => updateResource(index, 'kind', event.target.value)}
                    disabled={!canEdit}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal outline-none focus:border-primary disabled:bg-gray-50"
                  />
                </label>
              </div>
              <label className="mt-3 block text-xs font-semibold text-gray-600">
                Mô tả
                <input
                  value={resource.description}
                  onChange={(event) => updateResource(index, 'description', event.target.value)}
                  disabled={!canEdit}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal outline-none focus:border-primary disabled:bg-gray-50"
                />
              </label>
              <div className="mt-3 flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <input
                    type="checkbox"
                    checked={resource.isActive}
                    onChange={(event) => updateResource(index, 'isActive', event.target.checked)}
                    disabled={!canEdit}
                    className="h-4 w-4 accent-primary"
                  />
                  Hiển thị
                </label>
                <div className="flex items-center gap-3">
                  {resource.url && (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Mở liên kết
                    </a>
                  )}
                  <button
                    onClick={() => updateMetadata((metadata) => ({ ...metadata, resources: metadata.resources.filter((_, itemIndex) => itemIndex !== index) }))}
                    disabled={!canEdit}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
