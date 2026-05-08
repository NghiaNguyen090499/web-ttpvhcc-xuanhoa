'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý tin tức — danh sách bài viết + tạo/sửa/xóa
 * @lienquan    : src/lib/static-data.ts, data/news.json
 * @alias       : admin-articles, quan-ly-tin-tuc
 */

import { useState, useEffect } from 'react'
import {
  Plus, Search, Edit3, Trash2, Eye, Calendar, Tag, X,
  Save, ArrowLeft
} from 'lucide-react'

// Type bài viết
interface NewsItem {
  id: string
  title: string
  slug: string
  date: string
  tag: string
  image: string
  images?: string[]
  excerpt: string
  content: string
  source: string
}

// Tags có sẵn
const AVAILABLE_TAGS = [
  'Hành chính', 'Đoàn thanh niên', 'Thiện nguyện', 'Giáo dục',
  'Văn hóa', 'Thi đua', 'An ninh', 'Đối ngoại',
  'Quy hoạch', 'Y tế', 'Công đoàn', 'An sinh',
]

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')

  // State cho form tạo/sửa
  const [showEditor, setShowEditor] = useState(false)
  const [editingArticle, setEditingArticle] = useState<NewsItem | null>(null)
  const [formData, setFormData] = useState({
    title: '', slug: '', date: '', tag: AVAILABLE_TAGS[0],
    image: '', excerpt: '', content: '', source: 'UBND Phường Xuân Hòa',
  })
  const [saving, setSaving] = useState(false)

  // Tải dữ liệu bài viết
  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/admin/articles')
      const data = await res.json()
      setArticles(data.articles || [])
    } catch {
      console.error('Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  // Tạo slug từ title
  const generateSlug = (title: string) =>
    title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  // Mở editor tạo mới
  const handleCreate = () => {
    setEditingArticle(null)
    const today = new Date().toISOString().split('T')[0]
    setFormData({
      title: '', slug: '', date: today, tag: AVAILABLE_TAGS[0],
      image: '/images/news/post-01.jpg', excerpt: '', content: '',
      source: 'UBND Phường Xuân Hòa',
    })
    setShowEditor(true)
  }

  // Mở editor sửa
  const handleEdit = (article: NewsItem) => {
    setEditingArticle(article)
    setFormData({
      title: article.title, slug: article.slug, date: article.date,
      tag: article.tag, image: article.image, excerpt: article.excerpt,
      content: article.content, source: article.source,
    })
    setShowEditor(true)
  }

  // Lưu bài viết
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return
    setSaving(true)

    try {
      const method = editingArticle ? 'PUT' : 'POST'
      const body = editingArticle
        ? { ...formData, id: editingArticle.id }
        : { ...formData, slug: formData.slug || generateSlug(formData.title) }

      const res = await fetch('/api/admin/articles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        await fetchArticles()
        setShowEditor(false)
      }
    } catch {
      console.error('Lỗi lưu bài viết')
    } finally {
      setSaving(false)
    }
  }

  // Xóa bài viết
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa bài viết này?')) return

    try {
      await fetch('/api/admin/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await fetchArticles()
    } catch {
      console.error('Lỗi xóa bài viết')
    }
  }

  // Lọc bài viết
  const filtered = articles.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase())
    const matchTag = !filterTag || a.tag === filterTag
    return matchSearch && matchTag
  })

  // Unique tags từ dữ liệu
  const usedTags = [...new Set(articles.map((a) => a.tag))]

  // --- Editor View ---
  if (showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {editingArticle ? 'Sửa bài viết' : 'Tạo bài viết mới'}
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tiêu đề *</label>
            <input
              type="text" value={formData.title}
              onChange={(e) => setFormData({
                ...formData, title: e.target.value,
                slug: editingArticle ? formData.slug : generateSlug(e.target.value),
              })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Tiêu đề bài viết..."
            />
          </div>

          {/* Slug + Ngày + Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug</label>
              <input
                type="text" value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="tieu-de-bai-viet"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày đăng</label>
              <input
                type="date" value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Chuyên mục</label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                {AVAILABLE_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Ảnh đại diện */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Đường dẫn ảnh đại diện</label>
            <input
              type="text" value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="/images/news/post-xx.jpg"
            />
          </div>

          {/* Tóm tắt */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tóm tắt</label>
            <textarea
              rows={2} value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-none"
              placeholder="Tóm tắt ngắn gọn..."
            />
          </div>

          {/* Nội dung */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nội dung *</label>
            <textarea
              rows={12} value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-y font-mono"
              placeholder="Nội dung bài viết (hỗ trợ HTML)..."
            />
          </div>

          {/* Nguồn */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nguồn</label>
            <input
              type="text" value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleSave} disabled={saving || !formData.title.trim() || !formData.content.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Đang lưu...' : 'Lưu bài viết'}
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tức</h1>
          <p className="mt-1 text-sm text-gray-500">{articles.length} bài viết</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo bài viết
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
        >
          <option value="">Tất cả chuyên mục</option>
          {usedTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Không tìm thấy bài viết</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Tiêu đề</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Chuyên mục</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Ngày đăng</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((article) => (
                  <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 line-clamp-1">{article.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{article.excerpt}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        <Tag className="w-3 h-3" />
                        {article.tag}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {article.date}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/tin-tuc/${article.slug}`} target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Xem"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleEdit(article)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="Sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
