'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý FAQ — CRUD câu hỏi thường gặp cho Chatbot AI + trang FAQ
 * @lienquan    : src/app/api/admin/faq/route.ts, data/faq.json
 * @alias       : admin-faq, quan-ly-faq
 */

import { useState, useEffect } from 'react'
import {
  Plus, Search, Edit3, Trash2, Save, ArrowLeft,
  MessageCircle, ToggleLeft, ToggleRight, HelpCircle
} from 'lucide-react'

// Kiểu dữ liệu FAQ
interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  sortOrder: number
  isActive: boolean
  viewCount: number
}

// Danh mục FAQ có sẵn
const FAQ_CATEGORIES = ['Chung', 'Tư pháp', 'Cư trú', 'Hướng dẫn', 'Đất đai', 'Xây dựng', 'Y tế', 'Giáo dục']

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  // State cho form tạo/sửa
  const [showEditor, setShowEditor] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)
  const [formData, setFormData] = useState({
    question: '', answer: '', category: FAQ_CATEGORIES[0],
    isActive: true, sortOrder: 0,
  })
  const [saving, setSaving] = useState(false)

  // Tải dữ liệu
  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/faq')
      const data = await res.json()
      setFaqs(data.faqs || [])
    } catch {
      console.error('Lỗi tải dữ liệu FAQ')
    } finally {
      setLoading(false)
    }
  }

  // Mở editor tạo mới
  const handleCreate = () => {
    setEditingFaq(null)
    setFormData({
      question: '', answer: '', category: FAQ_CATEGORIES[0],
      isActive: true, sortOrder: faqs.length + 1,
    })
    setShowEditor(true)
  }

  // Mở editor sửa
  const handleEdit = (faq: FaqItem) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question, answer: faq.answer,
      category: faq.category, isActive: faq.isActive,
      sortOrder: faq.sortOrder,
    })
    setShowEditor(true)
  }

  // Lưu FAQ
  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) return
    setSaving(true)

    try {
      const method = editingFaq ? 'PUT' : 'POST'
      const body = editingFaq
        ? { id: editingFaq.id, ...formData }
        : formData

      const res = await fetch('/api/admin/faq', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        await fetchFaqs()
        setShowEditor(false)
      }
    } catch {
      console.error('Lỗi lưu FAQ')
    } finally {
      setSaving(false)
    }
  }

  // Xóa FAQ
  const handleDelete = async (id: string) => {
    if (!confirm('Xóa câu hỏi này?')) return

    try {
      await fetch('/api/admin/faq', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await fetchFaqs()
    } catch {
      console.error('Lỗi xóa FAQ')
    }
  }

  // Toggle trạng thái active
  const handleToggleActive = async (faq: FaqItem) => {
    try {
      await fetch('/api/admin/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: faq.id, isActive: !faq.isActive }),
      })
      await fetchFaqs()
    } catch {
      console.error('Lỗi đổi trạng thái')
    }
  }

  // Lọc
  const filtered = faqs.filter((f) => {
    const matchSearch = !search
      || f.question.toLowerCase().includes(search.toLowerCase())
      || f.answer.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !filterCategory || f.category === filterCategory
    return matchSearch && matchCategory
  })

  const usedCategories = [...new Set(faqs.map((f) => f.category))]

  // --- Editor View ---
  if (showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {editingFaq ? 'Sửa câu hỏi' : 'Tạo câu hỏi mới'}
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {/* Câu hỏi */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Câu hỏi *</label>
            <textarea
              rows={2} value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              placeholder="Nhập câu hỏi thường gặp..."
            />
          </div>

          {/* Câu trả lời */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Câu trả lời *</label>
            <textarea
              rows={6} value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-y"
              placeholder="Nhập câu trả lời chi tiết..."
            />
          </div>

          {/* Danh mục + Thứ tự + Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                {FAQ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Thứ tự sắp xếp</label>
              <input
                type="number" value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Trạng thái</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`flex items-center gap-2 w-full rounded-xl border px-4 py-3 text-sm transition-all ${
                  formData.isActive
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}
              >
                {formData.isActive
                  ? <><ToggleRight className="w-5 h-5" /> Đang hiển thị</>
                  : <><ToggleLeft className="w-5 h-5" /> Đã ẩn</>
                }
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving || !formData.question.trim() || !formData.answer.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Đang lưu...' : 'Lưu câu hỏi'}
            </button>
            <button
              onClick={() => setShowEditor(false)}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
          </div>
        </div>

        {/* Preview */}
        {formData.question && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Xem trước</h3>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="font-semibold text-gray-900 text-sm">❓ {formData.question}</p>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {formData.answer || '(Chưa có câu trả lời)'}
              </p>
              {formData.category && (
                <span className="inline-block mt-3 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                  {formData.category}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- List View ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý FAQ</h1>
          <p className="mt-1 text-sm text-gray-500">
            {faqs.length} câu hỏi · Dùng cho Chatbot AI + Trang FAQ
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo câu hỏi
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm câu hỏi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
        >
          <option value="">Tất cả danh mục</option>
          {usedCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Danh sách */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-700">Chưa có câu hỏi nào</h3>
          <p className="mt-2 text-sm text-gray-400">
            Tạo FAQ để chatbot AI có thể trả lời người dân chính xác hơn.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((faq) => (
            <div key={faq.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  faq.isActive ? 'bg-blue-50' : 'bg-gray-100'
                }`}>
                  <MessageCircle className={`w-4 h-4 ${faq.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${faq.isActive ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                    {faq.question}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {faq.category}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {faq.viewCount} lượt xem
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(faq)}
                    className={`p-2 rounded-lg transition-all ${
                      faq.isActive
                        ? 'text-green-500 hover:bg-green-50'
                        : 'text-gray-300 hover:bg-gray-50'
                    }`}
                    title={faq.isActive ? 'Ẩn' : 'Hiện'}
                  >
                    {faq.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(faq)}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    title="Sửa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
