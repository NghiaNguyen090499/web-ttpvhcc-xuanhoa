'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý phản ánh — danh sách phản ánh từ người dân
 * @lienquan    : src/app/api/admin/feedback/route.ts
 * @alias       : admin-feedback, quan-ly-phan-anh
 */

import { useState, useEffect } from 'react'
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Eye, Send } from 'lucide-react'

interface FeedbackItem {
  id: string
  name: string
  email?: string
  phone?: string
  subject: string
  content: string
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED'
  response?: string
  createdAt: string
}

// Màu trạng thái
const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700', icon: Clock },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [responseText, setResponseText] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

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

  // Lọc
  const filtered = feedbacks.filter((f) => !filterStatus || f.status === filterStatus)

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
            : 'Dữ liệu phản ánh sẽ hiển thị khi Database được kết nối'}
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterStatus ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Tất cả
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Nội dung */}
      {feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-700">Chưa có phản ánh nào</h3>
          <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
            Phản ánh từ người dân qua form Liên hệ sẽ hiển thị tại đây.
            Cần kết nối Database (Supabase) để lưu trữ và quản lý phản ánh.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100 inline-block">
            <p className="text-xs text-amber-700 font-medium">
              ⚠️ Hiện tại phản ánh được ghi log trong console (DB chưa kết nối)
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((fb) => {
              const statusConfig = STATUS_CONFIG[fb.status]
              const StatusIcon = statusConfig.icon
              return (
                <div
                  key={fb.id}
                  onClick={() => viewDetail(fb)}
                  className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                    selectedFeedback?.id === fb.id ? 'border-primary ring-1 ring-primary/20' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{fb.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {fb.name} · {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{fb.content}</p>
                </div>
              )
            })}
          </div>

          {/* Chi tiết */}
          {selectedFeedback && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit lg:sticky lg:top-4">
              <h3 className="font-bold text-gray-900">{selectedFeedback.subject}</h3>
              <div className="mt-3 space-y-2 text-xs text-gray-500">
                <p>👤 {selectedFeedback.name}</p>
                {selectedFeedback.email && <p>✉️ {selectedFeedback.email}</p>}
                {selectedFeedback.phone && <p>📞 {selectedFeedback.phone}</p>}
                <p>🕐 {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">
                {selectedFeedback.content}
              </div>

              {/* Form phản hồi */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phản hồi</label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-none"
                  placeholder="Nhập phản hồi cho người dân..."
                />
                <button className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all">
                  <Send className="w-4 h-4" />
                  Gửi phản hồi
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
