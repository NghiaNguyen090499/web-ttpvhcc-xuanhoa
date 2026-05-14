'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý thủ tục hành chính — danh sách lĩnh vực + CRUD thủ tục con
 * @lienquan    : src/app/api/admin/procedures/route.ts, data/procedures.json
 * @alias       : admin-procedures, quan-ly-thu-tuc
 */

import { useState, useEffect } from 'react'
import {
  Plus, Search, Edit3, Trash2, FolderOpen, ChevronDown, ChevronRight,
  Save, ArrowLeft, X, FileText, Layers
} from 'lucide-react'

// Kiểu dữ liệu lĩnh vực
interface CategoryItem {
  id: string
  name: string
  type: string
  slug: string
  description: string
  subCategories: string[]
}

export default function AdminProceduresPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  // State expand/collapse lĩnh vực
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())

  // State cho form tạo/sửa lĩnh vực
  const [showEditor, setShowEditor] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', type: 'cap-phuong',
    subCategories: '' as string, // danh sách thủ tục, ngắt bởi dòng mới
  })
  const [saving, setSaving] = useState(false)

  // State cho thêm thủ tục con nhanh
  const [addingToCat, setAddingToCat] = useState<string | null>(null)
  const [newProcName, setNewProcName] = useState('')

  // Tải dữ liệu
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/procedures')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      console.error('Lỗi tải dữ liệu thủ tục')
    } finally {
      setLoading(false)
    }
  }

  // Tạo slug từ tên
  const generateSlug = (name: string) =>
    name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  // Toggle mở rộng lĩnh vực
  const toggleExpand = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Mở editor tạo mới
  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '', type: 'cap-phuong', subCategories: '' })
    setShowEditor(true)
  }

  // Mở editor sửa
  const handleEdit = (cat: CategoryItem) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      type: cat.type,
      subCategories: cat.subCategories.join('\n'),
    })
    setShowEditor(true)
  }

  // Lưu lĩnh vực
  const handleSave = async () => {
    if (!formData.name.trim()) return
    setSaving(true)

    try {
      const method = editingCategory ? 'PUT' : 'POST'
      const subCats = formData.subCategories
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      const bodyData = editingCategory
        ? { id: editingCategory.id, name: formData.name, slug: formData.slug, description: formData.description, subCategories: subCats }
        : { name: formData.name, slug: formData.slug || generateSlug(formData.name), description: formData.description, type: formData.type, subCategories: subCats }

      const res = await fetch('/api/admin/procedures', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      })

      if (res.ok) {
        await fetchCategories()
        setShowEditor(false)
      }
    } catch {
      console.error('Lỗi lưu lĩnh vực')
    } finally {
      setSaving(false)
    }
  }

  // Xóa lĩnh vực
  const handleDelete = async (id: string) => {
    if (!confirm('Xóa lĩnh vực này sẽ xóa tất cả thủ tục con. Tiếp tục?')) return

    try {
      await fetch('/api/admin/procedures', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await fetchCategories()
    } catch {
      console.error('Lỗi xóa lĩnh vực')
    }
  }

  // Thêm thủ tục con nhanh
  const handleAddProcedure = async (categoryId: string) => {
    if (!newProcName.trim()) return

    try {
      await fetch('/api/admin/procedures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-procedure',
          categoryId,
          procedureName: newProcName.trim(),
        }),
      })
      setNewProcName('')
      setAddingToCat(null)
      await fetchCategories()
    } catch {
      console.error('Lỗi thêm thủ tục')
    }
  }

  // Xóa thủ tục con
  const handleRemoveProcedure = async (categoryId: string, procedureName: string) => {
    if (!confirm(`Xóa thủ tục "${procedureName}"?`)) return

    try {
      await fetch('/api/admin/procedures', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: categoryId,
          action: 'remove-procedure',
          procedureName,
        }),
      })
      await fetchCategories()
    } catch {
      console.error('Lỗi xóa thủ tục')
    }
  }

  // Lọc theo tìm kiếm
  const filtered = categories.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q)
      || c.subCategories.some((s) => s.toLowerCase().includes(q))
  })

  // Tổng thủ tục
  const totalProcedures = categories.reduce((sum, c) => sum + c.subCategories.length, 0)

  // --- Editor View ---
  if (showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {editingCategory ? 'Sửa lĩnh vực' : 'Tạo lĩnh vực mới'}
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {/* Tên lĩnh vực */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tên lĩnh vực *</label>
            <input
              type="text" value={formData.name}
              onChange={(e) => setFormData({
                ...formData, name: e.target.value,
                slug: editingCategory ? formData.slug : generateSlug(e.target.value),
              })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="VD: Tư pháp, Lao động - TBXH..."
            />
          </div>

          {/* Slug + Loại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug</label>
              <input
                type="text" value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="tu-phap"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                disabled={!!editingCategory}
              >
                <option value="cap-phuong">Cấp phường</option>
                <option value="phi-dia-gioi">Phi địa giới</option>
                <option value="thuong-gap">Thường gặp</option>
              </select>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mô tả</label>
            <textarea
              rows={2} value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-none"
              placeholder="Mô tả ngắn gọn về lĩnh vực..."
            />
          </div>

          {/* Danh sách thủ tục con */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Danh sách thủ tục (mỗi thủ tục một dòng)
            </label>
            <textarea
              rows={8} value={formData.subCategories}
              onChange={(e) => setFormData({ ...formData, subCategories: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-y font-mono"
              placeholder={"Thủ tục 1\nThủ tục 2\nThủ tục 3"}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {formData.subCategories.split('\n').filter(Boolean).length} thủ tục
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleSave} disabled={saving || !formData.name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Đang lưu...' : 'Lưu lĩnh vực'}
            </button>
            <button
              onClick={() => setShowEditor(false)}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- List View ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thủ tục HC</h1>
          <p className="mt-1 text-sm text-gray-500">
            {categories.length} lĩnh vực · {totalProcedures} thủ tục
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo lĩnh vực
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm lĩnh vực hoặc thủ tục..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Danh sách lĩnh vực */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Không tìm thấy lĩnh vực
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cat) => {
            const isExpanded = expandedCats.has(cat.id)
            return (
              <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Header lĩnh vực */}
                <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <button onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-600">
                    {isExpanded
                      ? <ChevronDown className="w-5 h-5" />
                      : <ChevronRight className="w-5 h-5" />
                    }
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(cat.id)}>
                    <p className="font-semibold text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {cat.subCategories.length} thủ tục · {cat.type === 'cap-phuong' ? 'Cấp phường' : cat.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      title="Sửa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Danh sách thủ tục con (expandable) */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/30">
                    {cat.subCategories.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2">Chưa có thủ tục nào</p>
                    ) : (
                      <div className="space-y-1">
                        {cat.subCategories.map((proc, i) => (
                          <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white transition-colors group">
                            <FileText className="w-4 h-4 text-gray-300 shrink-0" />
                            <span className="text-sm text-gray-700 flex-1">{proc}</span>
                            <button
                              onClick={() => handleRemoveProcedure(cat.id, proc)}
                              className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              title="Xóa thủ tục"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Thêm thủ tục nhanh */}
                    {addingToCat === cat.id ? (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                        <input
                          type="text" value={newProcName}
                          onChange={(e) => setNewProcName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddProcedure(cat.id)}
                          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                          placeholder="Tên thủ tục mới..."
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddProcedure(cat.id)}
                          className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark"
                        >
                          Thêm
                        </button>
                        <button
                          onClick={() => { setAddingToCat(null); setNewProcName('') }}
                          className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingToCat(cat.id)}
                        className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-xs text-primary font-medium hover:text-primary-dark transition-colors w-full"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm thủ tục
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Thống kê cuối trang */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <Layers className="w-5 h-5 text-blue-500 mx-auto" />
          <p className="text-lg font-bold text-gray-900 mt-2">{categories.length}</p>
          <p className="text-[10px] text-gray-500">Lĩnh vực</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <FileText className="w-5 h-5 text-emerald-500 mx-auto" />
          <p className="text-lg font-bold text-gray-900 mt-2">{totalProcedures}</p>
          <p className="text-[10px] text-gray-500">Thủ tục</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <FolderOpen className="w-5 h-5 text-purple-500 mx-auto" />
          <p className="text-lg font-bold text-gray-900 mt-2">
            {categories.filter((c) => c.type === 'cap-phuong').length}
          </p>
          <p className="text-[10px] text-gray-500">Cấp phường</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <FolderOpen className="w-5 h-5 text-amber-500 mx-auto" />
          <p className="text-lg font-bold text-gray-900 mt-2">
            {categories.filter((c) => c.type !== 'cap-phuong').length}
          </p>
          <p className="text-[10px] text-gray-500">Khác</p>
        </div>
      </div>
    </div>
  )
}
