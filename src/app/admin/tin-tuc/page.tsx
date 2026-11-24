'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý tin tức — danh sách bài viết + tạo/sửa/xóa
 * @lienquan    : src/lib/static-data.ts, data/news.json
 * @alias       : admin-articles, quan-ly-tin-tuc
 */

import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Edit3, Trash2, Eye, Calendar, Tag, Save, ArrowLeft, UploadCloud, Image as ImageIcon, Star, StarOff, MessageCircle } from 'lucide-react'
import { useAdminRole } from '@/components/admin/AdminRoleContext'
import RichTextEditor, { type RichTextEditorHandle } from '@/components/admin/RichTextEditor'
import { uploadCmsFile } from '@/lib/cms-upload-client'

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
  isFeatured?: boolean
  commentsEnabled?: boolean
  commentCount?: number
}

// Tags có sẵn
const AVAILABLE_TAGS = [
  'Hành chính', 'Đoàn thanh niên', 'Thiện nguyện', 'Giáo dục',
  'Văn hóa', 'Thi đua', 'An ninh', 'Đối ngoại',
  'Quy hoạch', 'Y tế', 'Công đoàn', 'An sinh',
]

export default function AdminArticlesPage() {
  const { canEdit, canDelete } = useAdminRole()
  const editorRef = useRef<RichTextEditorHandle | null>(null)
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
    commentsEnabled: true,
  })
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  async function fetchArticles() {
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

  // Tải dữ liệu bài viết
  useEffect(() => {
    let active = true

    fetch('/api/admin/articles')
      .then((res) => res.json())
      .then((data) => {
        if (active) setArticles(data.articles || [])
      })
      .catch(() => console.error('Lỗi tải dữ liệu'))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Tạo slug từ title
  const generateSlug = (title: string) =>
    title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  // Mở editor tạo mới
  const handleCreate = () => {
    if (!canEdit) return
    setEditingArticle(null)
    const today = new Date().toISOString().split('T')[0]
    setFormData({
      title: '', slug: '', date: today, tag: AVAILABLE_TAGS[0],
      image: '/images/news/post-01.jpg', excerpt: '', content: '',
      source: 'UBND Phường Xuân Hòa',
      commentsEnabled: true,
    })
    setShowEditor(true)
  }

  // Mở editor sửa
  const handleEdit = (article: NewsItem) => {
    if (!canEdit) return
    setEditingArticle(article)
    setFormData({
      title: article.title, slug: article.slug, date: article.date,
      tag: article.tag, image: article.image, excerpt: article.excerpt,
      content: article.content, source: article.source,
      commentsEnabled: article.commentsEnabled !== false,
    })
    setShowEditor(true)
  }

  const handleCoverUpload = async (file: File | undefined) => {
    if (!file || !canEdit) return

    setUploadingCover(true)
    try {
      const uploaded = await uploadCmsFile(file, {
        folder: 'tin-tuc',
        allowedMimePrefixes: ['image/'],
      })
      setFormData((current) => ({ ...current, image: uploaded.url }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể tải ảnh lên')
    } finally {
      setUploadingCover(false)
    }
  }

  // Lưu bài viết
  const handleSave = async () => {
    if (!canEdit) return
    const currentContent = editorRef.current?.getContent() || formData.content
    if (!formData.title.trim() || !currentContent.trim()) return
    setSaving(true)

    try {
      await editorRef.current?.uploadImages()
      const content = editorRef.current?.getContent() || currentContent
      const method = editingArticle ? 'PUT' : 'POST'
      const body = editingArticle
        ? { ...formData, content, id: editingArticle.id }
        : { ...formData, content, slug: formData.slug || generateSlug(formData.title) }

      const res = await fetch('/api/admin/articles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        editorRef.current?.resetDirty()
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
    if (!canDelete) return
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

  const handleToggleFeatured = async (article: NewsItem) => {
    if (!canEdit) return

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: article.id,
          isFeatured: !article.isFeatured,
        }),
      })

      if (!res.ok) {
        alert('Không thể cập nhật tin nổi bật')
        return
      }

      await fetchArticles()
    } catch {
      console.error('Lỗi cập nhật tin nổi bật')
    }
  }

  const handleToggleComments = async (article: NewsItem) => {
    if (!canEdit) return

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: article.id,
          commentsEnabled: article.commentsEnabled === false,
        }),
      })

      if (!res.ok) {
        alert('Không thể cập nhật trạng thái bình luận')
        return
      }

      await fetchArticles()
    } catch {
      console.error('Lỗi cập nhật trạng thái bình luận')
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
            <div className="grid gap-3 lg:grid-cols-[180px_1fr]">
              <div className="flex min-h-32 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {formData.image ? (
                  <div
                    aria-label="Ảnh đại diện"
                    className="h-40 w-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${formData.image}")` }}
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-300" />
                )}
              </div>
              <div className="space-y-3">
                <input
                  type="text" value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="/images/news/post-xx.jpg"
                />
                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold transition ${
                  uploadingCover ? 'pointer-events-none text-gray-400' : 'text-gray-700 hover:border-primary hover:text-primary'
                }`}>
                  <UploadCloud className="h-4 w-4" />
                  {uploadingCover ? 'Đang tải ảnh...' : 'Tải ảnh lên'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingCover}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.currentTarget.value = ''
                      handleCoverUpload(file)
                    }}
                  />
                </label>
              </div>
            </div>
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
            <RichTextEditor
              ref={editorRef}
              value={formData.content}
              disabled={saving}
              placeholder="Nhập nội dung bài viết..."
              onChange={(content) => setFormData((current) => ({ ...current, content }))}
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

          {/* Bình luận */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3">
            <div>
              <label className="block text-sm font-semibold text-gray-800">Cho phép bình luận</label>
              <p className="mt-0.5 text-xs text-gray-500">Người dân có thể nhập tên và bình luận dưới bài viết.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.commentsEnabled}
              onClick={() => setFormData((current) => ({ ...current, commentsEnabled: !current.commentsEnabled }))}
              className={`relative h-7 w-12 rounded-full transition ${
                formData.commentsEnabled ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  formData.commentsEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleSave} disabled={saving || uploadingCover || !formData.title.trim() || !formData.content.trim()}
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
        {canEdit && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
          >
            <Plus className="w-4 h-4" />
            Tạo bài viết
          </button>
        )}
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
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-gray-900 line-clamp-1">{article.title}</p>
                        {article.isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            <Star className="h-3 w-3 fill-current" />
                            Nổi bật
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          article.commentsEnabled === false
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-green-50 text-green-700'
                        }`}>
                          <MessageCircle className="h-3 w-3" />
                          {article.commentsEnabled === false ? 'Tắt bình luận' : `${article.commentCount || 0} bình luận`}
                        </span>
                      </div>
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
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(article)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            title="Sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleToggleFeatured(article)}
                            className={`p-2 rounded-lg transition-all ${
                              article.isFeatured
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title={article.isFeatured ? 'Bỏ tin nổi bật' : 'Đặt làm tin nổi bật'}
                          >
                            {article.isFeatured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleToggleComments(article)}
                            className={`p-2 rounded-lg transition-all ${
                              article.commentsEnabled === false
                                ? 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={article.commentsEnabled === false ? 'Bật bình luận' : 'Tắt bình luận'}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  )
}
