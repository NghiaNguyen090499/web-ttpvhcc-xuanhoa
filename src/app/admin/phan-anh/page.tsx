'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý phản ánh — danh sách + chi tiết + phản hồi + đổi trạng thái
 * @lienquan    : src/app/api/admin/feedback/route.ts, data/feedbacks.json
 * @alias       : admin-feedback, quan-ly-phan-anh
 */

import { useState, useEffect } from 'react'
import {
  MessageSquare, Clock, CheckCircle, XCircle, AlertCircle,
  Send, Filter, ChevronRight
} from 'lucide-react'

// Kiểu dữ liệu phản ánh
interface FeedbackItem {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  subject: string
  content: string
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED'
  response?: string | null
  respondedAt?: string | null
  createdAt: string
}

// Cấu hình trạng thái
const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700', icon: Clock, dot: 'bg-amber-400' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700', icon: AlertCircle, dot: 'bg-blue-400' },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700', icon: CheckCircle, dot: 'bg-green-400' },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle, dot: 'bg-red-400' },
} as const

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [responseText, setResponseText] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sending, setSending] = useState(false)
  const [statusChanging, setStatusChanging] = useState(false)

  // Tải dữ liệu
  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/admin/feedback')
      const data = await res.json()
      setFeedbacks(data.feedbacks || [])
    } catch {
      console.error('Lỗi tải dữ liệu phản ánh')
    } finally {
      setLoading(false)
    }
  }

  // Gửi phản hồi
  const handleSendResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return
    setSending(true)

    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFeedback.id,
          response: responseText.trim(),
          status: 'RESOLVED',
        }),
      })

      if (res.ok) {
        await fetchFeedbacks()
        // Cập nhật selected feedback
        setSelectedFeedback((prev) => prev ? {
          ...prev,
          response: responseText.trim(),
          status: 'RESOLVED',
          respondedAt: new Date().toISOString(),
        } : null)
        setResponseText('')
      }
    } catch {
      console.error('Lỗi gửi phản hồi')
    } finally {
      setSending(false)
    }
  }

  // Đổi trạng thái
  const handleChangeStatus = async (id: string, status: FeedbackItem['status']) => {
    setStatusChanging(true)
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (res.ok) {
        await fetchFeedbacks()
        setSelectedFeedback((prev) => prev?.id === id ? { ...prev, status } : prev)
      }
    } catch {
      console.error('Lỗi đổi trạng thái')
    } finally {
      setStatusChanging(false)
    }
  }

  // Lọc
  const filtered = feedbacks.filter((f) => !filterStatus || f.status === filterStatus)

  // Thống kê
  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter((f) => f.status === 'PENDING').length,
    processing: feedbacks.filter((f) => f.status === 'PROCESSING').length,
    resolved: feedbacks.filter((f) => f.status === 'RESOLVED').length,
  }

  // Xem chi tiết
  const viewDetail = (fb: FeedbackItem) => {
    setSelectedFeedback(fb)
    setResponseText(fb.response || '')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phản ánh - Kiến nghị</h1>
        <p className="mt-1 text-sm text-gray-500">
          {feedbacks.length > 0
            ? `${feedbacks.length} phản ánh từ người dân`
            : 'Đang tải dữ liệu phản ánh...'}
        </p>
      </div>

      {/* Thống kê nhanh */}
      {feedbacks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Tổng</p>
              <MessageSquare className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-600">Chờ xử lý</p>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-amber-700 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-blue-600">Đang xử lý</p>
              <AlertCircle className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-blue-700 mt-1">{stats.processing}</p>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-green-600">Đã giải quyết</p>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xl font-bold text-green-700 mt-1">{stats.resolved}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterStatus ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Tất cả ({stats.total})
        </button>
        {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, config]) => {
          const count = feedbacks.filter((f) => f.status === key).length
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Nội dung */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Đang tải...
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-700">Chưa có phản ánh nào</h3>
          <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
            Phản ánh từ người dân qua form Liên hệ sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách bên trái */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((fb) => {
              const statusConfig = STATUS_CONFIG[fb.status]
              const StatusIcon = statusConfig.icon
              const isSelected = selectedFeedback?.id === fb.id
              return (
                <div
                  key={fb.id}
                  onClick={() => viewDetail(fb)}
                  className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                        <p className="font-semibold text-gray-900 truncate text-sm">{fb.subject}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {fb.name} · {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-primary rotate-90' : 'text-gray-300'}`} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{fb.content}</p>
                </div>
              )
            })}
          </div>

          {/* Chi tiết bên phải */}
          {selectedFeedback ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit lg:sticky lg:top-4 space-y-4">
              {/* Thông tin phản ánh */}
              <div>
                <h3 className="font-bold text-gray-900">{selectedFeedback.subject}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                  <p>👤 {selectedFeedback.name}</p>
                  {selectedFeedback.email && <p>✉️ {selectedFeedback.email}</p>}
                  {selectedFeedback.phone && <p>📞 {selectedFeedback.phone}</p>}
                  <p>🕐 {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              {/* Nội dung */}
              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">
                {selectedFeedback.content}
              </div>

              {/* Đổi trạng thái */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Trạng thái</label>
                <div className="flex gap-1.5 flex-wrap">
                  {(Object.entries(STATUS_CONFIG) as [FeedbackItem['status'], typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleChangeStatus(selectedFeedback.id, key)}
                      disabled={statusChanging || selectedFeedback.status === key}
                      className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                        selectedFeedback.status === key
                          ? `${config.color} ring-1 ring-offset-1`
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phản hồi cũ */}
              {selectedFeedback.response && selectedFeedback.respondedAt && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-[10px] font-semibold text-green-600 mb-1">
                    Đã phản hồi — {new Date(selectedFeedback.respondedAt).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-sm text-green-800 leading-relaxed">{selectedFeedback.response}</p>
                </div>
              )}

              {/* Form phản hồi */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {selectedFeedback.response ? 'Cập nhật phản hồi' : 'Phản hồi'}
                </label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-none"
                  placeholder="Nhập phản hồi cho người dân..."
                />
                <button
                  onClick={handleSendResponse}
                  disabled={sending || !responseText.trim()}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Đang gửi...' : 'Gửi phản hồi'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center h-fit">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Chọn phản ánh để xem chi tiết</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
