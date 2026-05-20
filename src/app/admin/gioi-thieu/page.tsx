'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý trang giới thiệu — cơ cấu tổ chức
 * @lienquan    : src/app/api/admin/organization/route.ts, data/organization.json
 * @alias       : admin-about, admin-gioi-thieu, quan-ly-co-cau-to-chuc
 */

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Building2, Edit3, Plus, Save, Trash2 } from 'lucide-react'

type NodeType = 'chairman' | 'vice' | 'department'

interface OrganizationNode {
  id: string
  title: string
  type: NodeType
  parentId: string | null
  order: number
  isActive: boolean
}

interface OrganizationData {
  metadata: {
    title: string
    updatedAt: string
    note: string
  }
  nodes: OrganizationNode[]
}

const NODE_TYPES: Array<{ value: NodeType; label: string }> = [
  { value: 'chairman', label: 'Chủ tịch' },
  { value: 'vice', label: 'Phó Chủ tịch' },
  { value: 'department', label: 'Phòng / Trung tâm' },
]

function getTypeLabel(type: NodeType) {
  return NODE_TYPES.find((item) => item.value === type)?.label || type
}

function sortNodes(nodes: OrganizationNode[]) {
  return [...nodes].sort((a, b) => {
    const rank = { chairman: 1, vice: 2, department: 3 }
    return rank[a.type] - rank[b.type] || a.order - b.order || a.title.localeCompare(b.title)
  })
}

export default function AdminAboutPage() {
  const [organization, setOrganization] = useState<OrganizationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNode, setEditingNode] = useState<OrganizationNode | null>(null)
  const [metadataForm, setMetadataForm] = useState({ title: '', note: '' })
  const [formData, setFormData] = useState({
    title: '',
    type: 'department' as NodeType,
    parentId: '',
    order: 1,
    isActive: true,
  })

  const nodes = useMemo(() => sortNodes(organization?.nodes || []), [organization])

  async function fetchOrganization() {
    try {
      const res = await fetch('/api/admin/organization')
      const data = await res.json()
      setOrganization(data.organization)
      setMetadataForm({
        title: data.organization?.metadata?.title || 'Cơ cấu tổ chức',
        note: data.organization?.metadata?.note || '',
      })
    } catch {
      console.error('Lỗi tải cơ cấu tổ chức')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchOrganization()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const openCreate = () => {
    setEditingNode(null)
    setFormData({
      title: '',
      type: 'department',
      parentId: '',
      order: nodes.length + 1,
      isActive: true,
    })
    setShowEditor(true)
  }

  const openEdit = (node: OrganizationNode) => {
    setEditingNode(node)
    setFormData({
      title: node.title,
      type: node.type,
      parentId: node.parentId || '',
      order: node.order,
      isActive: node.isActive,
    })
    setShowEditor(true)
  }

  const saveMetadata = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-metadata', ...metadataForm }),
      })
      if (res.ok) await fetchOrganization()
    } catch {
      console.error('Lỗi lưu tiêu đề cơ cấu')
    } finally {
      setSaving(false)
    }
  }

  const saveNode = async () => {
    if (!formData.title.trim()) return
    setSaving(true)
    try {
      const method = editingNode ? 'PUT' : 'POST'
      const body = editingNode ? { id: editingNode.id, ...formData } : formData
      const res = await fetch('/api/admin/organization', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        await fetchOrganization()
        setShowEditor(false)
      }
    } catch {
      console.error('Lỗi lưu ô cơ cấu')
    } finally {
      setSaving(false)
    }
  }

  const deleteNode = async (node: OrganizationNode) => {
    if (!confirm(`Xóa "${node.title}"? Các ô con trực tiếp cũng sẽ bị xóa.`)) return
    try {
      await fetch('/api/admin/organization', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: node.id }),
      })
      await fetchOrganization()
    } catch {
      console.error('Lỗi xóa ô cơ cấu')
    }
  }

  const parentOptions = nodes.filter((node) => !editingNode || node.id !== editingNode.id)

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Đang tải dữ liệu...</div>
  }

  if (showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {editingNode ? 'Sửa ô cơ cấu' : 'Thêm ô cơ cấu'}
          </h1>
        </div>

        <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Tên hiển thị *</label>
            <textarea
              rows={3}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Ví dụ: Phòng Văn hóa - Xã hội"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Loại ô</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as NodeType })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                {NODE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Thuộc cấp trên</label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Không có</option>
                {parentOptions.map((node) => (
                  <option key={node.id} value={node.id}>{node.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Thứ tự</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary"
            />
            Hiển thị trên trang giới thiệu
          </label>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={saveNode}
              disabled={saving || !formData.title.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              onClick={() => setShowEditor(false)}
              className="rounded-xl px-6 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giới thiệu</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý cơ cấu tổ chức hiển thị ở trang giới thiệu</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Thêm ô cơ cấu
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-gray-900">Tiêu đề sơ đồ</h2>
        <div className="grid gap-4 lg:grid-cols-[280px_1fr_auto]">
          <input
            value={metadataForm.title}
            onChange={(e) => setMetadataForm({ ...metadataForm, title: e.target.value })}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="Cơ cấu tổ chức"
          />
          <input
            value={metadataForm.note}
            onChange={(e) => setMetadataForm({ ...metadataForm, note: e.target.value })}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="Ghi chú nội bộ"
          />
          <button
            onClick={saveMetadata}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Lưu
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Danh sách ô trong sơ đồ</h2>
            <p className="text-sm text-gray-500">{nodes.length} ô cơ cấu</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {nodes.map((node) => {
            const parent = nodes.find((item) => item.id === node.parentId)
            return (
              <div key={node.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{node.title}</p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-600">
                      {getTypeLabel(node.type)}
                    </span>
                    {!node.isActive && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-sm text-amber-700">Đang ẩn</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Cấp trên: {parent?.title || 'Không có'} · Thứ tự: {node.order}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(node)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-primary/30 hover:text-primary"
                  >
                    <Edit3 className="h-4 w-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteNode(node)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
