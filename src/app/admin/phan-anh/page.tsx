'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Quản lý phản ánh — danh sách + tìm kiếm + chi tiết + phản hồi qua email + đổi trạng thái
 * @lienquan    : src/app/api/admin/feedback/route.ts, src/lib/feedback-email.ts, data/feedbacks.json
 * @alias       : admin-feedback, quan-ly-phan-anh
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Search,
  Send, Filter, ChevronRight, User, Mail, Phone, CalendarClock, X, MailCheck, MailX, Reply,
  Paperclip, FileText, Image as ImageIcon, Download,
} from 'lucide-react'
import { useAdminRole } from '@/components/admin/AdminRoleContext'

interface AttachmentItem {
  id: string
  name: string
  size: number
  mimeType: string
  url: string
}

// Kiểu dữ liệu phản ánh
interface FeedbackItem {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  subject: string
  content: string
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED'
  attachments?: AttachmentItem[]
  response?: string | null
  responseAttachments?: AttachmentItem[]
  respondedAt?: string | null
  createdAt: string
}

type FeedbackStatus = FeedbackItem['status']

type ActionMessage = {
  type: 'success' | 'error' | 'warning'
  text: string
}

// Cấu hình trạng thái
const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700', icon: Clock, dot: 'bg-amber-400', card: 'border-amber-400 ring-amber-100', text: 'text-amber-700' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700', icon: AlertCircle, dot: 'bg-blue-400', card: 'border-blue-400 ring-blue-100', text: 'text-blue-700' },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700', icon: CheckCircle, dot: 'bg-green-400', card: 'border-green-400 ring-green-100', text: 'text-green-700' },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle, dot: 'bg-red-400', card: 'border-red-400 ring-red-100', text: 'text-red-700' },
} as const

const STATUS_KEYS = Object.keys(STATUS_CONFIG) as FeedbackStatus[]

const MESSAGE_STYLE = {
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-red-200 bg-red-50 text-red-700',
} as const

// Tệp cán bộ đính kèm khi trả lời — khớp ATTACHMENT_RULES.response ở src/lib/feedback-attachments.ts
const MAX_RESPONSE_FILES = 5
const MAX_RESPONSE_FILE_SIZE = 10 * 1024 * 1024
const MAX_RESPONSE_TOTAL_SIZE = 20 * 1024 * 1024
const RESPONSE_FILE_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx'
const RESPONSE_FILE_EXT = /\.(jpe?g|png|webp|pdf|docx?|xlsx?)$/i

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function fileHref(item: AttachmentItem, download = false) {
  const params = new URLSearchParams({ name: item.name })
  if (download) params.set('download', '1')
  return `${item.url}?${params.toString()}`
}

/** Danh sách tệp đính kèm: ảnh hiển thị thumbnail, tệp khác hiển thị dạng dòng */
function AttachmentList({ items, tone = 'gray' }: { items: AttachmentItem[]; tone?: 'gray' | 'green' }) {
  if (items.length === 0) return null
  const images = items.filter((item) => item.mimeType.startsWith('image/'))
  const files = items.filter((item) => !item.mimeType.startsWith('image/'))
  const border = tone === 'green' ? 'border-green-200' : 'border-gray-200'
  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((item) => (
            <a
              key={item.id}
              href={fileHref(item)}
              target="_blank"
              rel="noopener noreferrer"
              title={`${item.name} (${formatSize(item.size)})`}
              className={`block h-24 w-24 overflow-hidden rounded-lg border ${border} bg-white hover:opacity-90`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh riêng tư cần cookie đăng nhập */}
              <img src={item.url} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}
      {files.map((item) => (
        <div key={item.id} className={`flex items-center gap-2 rounded-lg border ${border} bg-white px-3 py-2 text-sm`}>
          <FileText className="h-4 w-4 shrink-0 text-gray-400" />
          <a href={fileHref(item)} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate font-medium text-gray-700 hover:text-primary hover:underline">
            {item.name}
          </a>
          <span className="shrink-0 text-xs text-gray-400">{formatSize(item.size)}</span>
          <a href={fileHref(item, true)} aria-label={`Tải ${item.name}`} className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <Download className="h-4 w-4" />
          </a>
        </div>
      ))}
    </div>
  )
}

// Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu
function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
}

function formatRelative(iso: string) {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (diffMinutes < 1) return 'Vừa xong'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

export default function AdminFeedbackPage() {
  const { canEdit } = useAdminRole()
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [responseFiles, setResponseFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const responseFileInputRef = useRef<HTMLInputElement>(null)
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | ''>('')
  const [query, setQuery] = useState('')
  const [sending, setSending] = useState(false)
  const [statusChanging, setStatusChanging] = useState(false)
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null)

  const selectedFeedback = feedbacks.find((f) => f.id === selectedId) ?? null

  // Tải dữ liệu
  useEffect(() => {
    let active = true

    fetch('/api/admin/feedback')
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Không thể tải dữ liệu phản ánh')
        return data
      })
      .then((data) => {
        if (active) setFeedbacks(data.feedbacks || [])
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Lỗi tải dữ liệu phản ánh'
        console.error(message)
        if (active) setActionMessage({ type: 'error', text: message })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Tự ẩn thông báo thành công
  useEffect(() => {
    if (actionMessage?.type !== 'success') return
    const timer = setTimeout(() => setActionMessage(null), 6000)
    return () => clearTimeout(timer)
  }, [actionMessage])

  // Esc để đóng chi tiết
  useEffect(() => {
    if (!selectedId) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDetail()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId])

  const updateFeedback = (id: string, patch: Partial<FeedbackItem>) => {
    setFeedbacks((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item))
  }

  const addResponseFiles = (fileList: FileList | null) => {
    if (!fileList) return
    setFileError('')
    const next = [...responseFiles]
    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_RESPONSE_FILES) {
        setFileError(`Chỉ được đính kèm tối đa ${MAX_RESPONSE_FILES} tệp`)
        break
      }
      if (!RESPONSE_FILE_EXT.test(file.name)) {
        setFileError(`"${file.name}" không được hỗ trợ (chỉ ảnh, PDF, Word, Excel)`)
        continue
      }
      if (file.size > MAX_RESPONSE_FILE_SIZE) {
        setFileError(`"${file.name}" vượt quá 10MB`)
        continue
      }
      if (next.reduce((sum, f) => sum + f.size, 0) + file.size > MAX_RESPONSE_TOTAL_SIZE) {
        setFileError('Tổng dung lượng tệp đính kèm vượt quá 20MB')
        continue
      }
      next.push(file)
    }
    setResponseFiles(next)
    if (responseFileInputRef.current) responseFileInputRef.current.value = ''
  }

  const resetResponseForm = () => {
    setResponseText('')
    setResponseFiles([])
    setFileError('')
  }

  // Gửi phản hồi
  const handleSendResponse = async () => {
    if (!canEdit || !selectedFeedback || !responseText.trim() || sending) return
    setSending(true)
    setActionMessage(null)

    try {
      const payload = new FormData()
      payload.append('id', selectedFeedback.id)
      payload.append('response', responseText.trim())
      payload.append('status', 'RESOLVED')
      responseFiles.forEach((file) => payload.append('attachments', file, file.name))

      const res = await fetch('/api/admin/feedback', { method: 'PUT', body: payload })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Không thể gửi phản hồi')

      updateFeedback(selectedFeedback.id, {
        response: responseText.trim(),
        responseAttachments: data.feedback?.responseAttachments || [],
        status: 'RESOLVED',
        respondedAt: data.feedback?.respondedAt || new Date().toISOString(),
      })
      resetResponseForm()

      if (data.emailSent === true) {
        setActionMessage({ type: 'success', text: `Đã lưu phản hồi và gửi email tới ${selectedFeedback.email}.` })
      } else if (data.emailSent === false) {
        setActionMessage({ type: 'warning', text: 'Đã lưu phản hồi nhưng gửi email thất bại. Vui lòng liên hệ người dân qua điện thoại hoặc thử lại sau.' })
      } else {
        setActionMessage({ type: 'success', text: 'Đã lưu phản hồi. Người dân không cung cấp email nên không có email nào được gửi.' })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi gửi phản hồi'
      console.error(message)
      setActionMessage({ type: 'error', text: message })
    } finally {
      setSending(false)
    }
  }

  // Đổi trạng thái
  const handleChangeStatus = async (id: string, status: FeedbackStatus) => {
    if (!canEdit) return
    setStatusChanging(true)
    setActionMessage(null)
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không thể đổi trạng thái')

      updateFeedback(id, { status })
      setActionMessage({ type: 'success', text: `Đã chuyển phản ánh sang “${STATUS_CONFIG[status].label}”.` })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi đổi trạng thái'
      console.error(message)
      setActionMessage({ type: 'error', text: message })
    } finally {
      setStatusChanging(false)
    }
  }

  // Thống kê theo trạng thái
  const counts = useMemo(() => {
    const result: Record<FeedbackStatus, number> = { PENDING: 0, PROCESSING: 0, RESOLVED: 0, REJECTED: 0 }
    for (const f of feedbacks) result[f.status]++
    return result
  }, [feedbacks])

  // Lọc + tìm kiếm
  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return feedbacks.filter((f) =>
      (!filterStatus || f.status === filterStatus) &&
      (!q || normalize(`${f.subject} ${f.name} ${f.content} ${f.email || ''} ${f.phone || ''}`).includes(q)))
  }, [feedbacks, filterStatus, query])

  const viewDetail = (fb: FeedbackItem) => {
    setSelectedId(fb.id)
    resetResponseForm()
  }

  function closeDetail() {
    setSelectedId(null)
    setResponseText('')
    setResponseFiles([])
    setFileError('')
  }

  const applyFilter = (status: FeedbackStatus | '') => {
    setFilterStatus(status)
    if (selectedFeedback && status && selectedFeedback.status !== status) closeDetail()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phản ánh - Kiến nghị</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading
              ? 'Đang tải dữ liệu phản ánh...'
              : feedbacks.length > 0
              ? `${feedbacks.length} phản ánh gần nhất từ người dân`
              : 'Chưa có phản ánh từ người dân'}
          </p>
        </div>
        {feedbacks.length > 0 && (
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Tìm phản ánh</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, người gửi, nội dung..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
        )}
      </div>

      {/* Thống kê nhanh — đồng thời là bộ lọc */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[74px] animate-pulse rounded-xl border border-gray-100 bg-white" />
          ))}
        </div>
      ) : feedbacks.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5" role="group" aria-label="Lọc theo trạng thái">
          <button
            type="button"
            onClick={() => applyFilter('')}
            aria-pressed={!filterStatus}
            className={`rounded-xl border bg-white p-4 text-left transition hover:shadow-md ${
              !filterStatus ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">Tất cả</p>
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-1 text-xl font-bold text-gray-900">{feedbacks.length}</p>
          </button>
          {STATUS_KEYS.map((key) => {
            const config = STATUS_CONFIG[key]
            const Icon = config.icon
            const active = filterStatus === key
            return (
              <button
                type="button"
                key={key}
                onClick={() => applyFilter(active ? '' : key)}
                aria-pressed={active}
                className={`rounded-xl border bg-white p-4 text-left transition hover:shadow-md ${
                  active ? `${config.card} ring-2` : 'border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-medium ${config.text}`}>{config.label}</p>
                  <Icon className={`h-4 w-4 ${config.text} opacity-60`} />
                </div>
                <p className={`mt-1 text-xl font-bold ${config.text}`}>{counts[key]}</p>
              </button>
            )
          })}
        </div>
      )}

      {actionMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${MESSAGE_STYLE[actionMessage.type]}`}
        >
          {actionMessage.type === 'success'
            ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            : actionMessage.type === 'warning'
            ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="flex-1">{actionMessage.text}</span>
          <button type="button" onClick={() => setActionMessage(null)} aria-label="Đóng thông báo" className="opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Nội dung */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5">
              <div className="h-4 w-2/3 rounded bg-gray-100" />
              <div className="mt-2 h-3 w-1/3 rounded bg-gray-100" />
              <div className="mt-4 h-3 w-full rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <h3 className="text-base font-semibold text-gray-700">Chưa có phản ánh nào</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            Phản ánh từ người dân qua form Liên hệ sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Danh sách bên trái */}
          <div className="min-w-0 space-y-2.5 lg:col-span-2">
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                <Filter className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">Không có phản ánh phù hợp</p>
                <button
                  type="button"
                  onClick={() => { applyFilter(''); setQuery('') }}
                  className="mt-3 text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
            {filtered.map((fb) => {
              const statusConfig = STATUS_CONFIG[fb.status]
              const isSelected = selectedId === fb.id
              return (
                <button
                  type="button"
                  key={fb.id}
                  onClick={() => viewDetail(fb)}
                  aria-current={isSelected}
                  className={`w-full rounded-2xl border bg-white p-4 text-left transition-all hover:border-gray-200 hover:shadow-sm ${
                    isSelected ? 'border-primary ring-2 ring-primary/15' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${statusConfig.dot}`} aria-hidden="true" />
                        <p className="truncate text-sm font-semibold text-gray-900">{fb.subject}</p>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-gray-500">
                        <span className="truncate">{fb.name}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={fb.createdAt} title={new Date(fb.createdAt).toLocaleString('vi-VN')}>
                          {formatRelative(fb.createdAt)}
                        </time>
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{fb.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] font-medium text-gray-400">
                    {fb.email
                      ? <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />Có email</span>
                      : <span className="inline-flex items-center gap-1"><MailX className="h-3.5 w-3.5" />Không email</span>}
                    {(fb.attachments?.length ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" />{fb.attachments!.length} ảnh</span>
                    )}
                    {fb.response && (
                      <span className="inline-flex items-center gap-1 text-green-600"><Reply className="h-3.5 w-3.5" />Đã phản hồi</span>
                    )}
                    <ChevronRight className={`ml-auto h-4 w-4 ${isSelected ? 'text-primary' : 'text-gray-300'}`} />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Chi tiết bên phải */}
          {selectedFeedback ? (
            <div
              className="fixed inset-0 z-50 flex items-end bg-gray-950/50 lg:static lg:z-auto lg:col-span-3 lg:block lg:bg-transparent"
              role="dialog"
              aria-labelledby="feedback-detail-title"
              onClick={(e) => { if (e.target === e.currentTarget) closeDetail() }}
            >
              <div className="max-h-[92dvh] w-full space-y-5 overflow-y-auto overscroll-contain rounded-t-2xl border border-gray-100 bg-white p-5 shadow-2xl lg:sticky lg:top-4 lg:max-h-[calc(100dvh-7rem)] lg:rounded-2xl lg:p-6 lg:shadow-none">
                {/* Thông tin phản ánh */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_CONFIG[selectedFeedback.status].color}`}>
                        {STATUS_CONFIG[selectedFeedback.status].label}
                      </span>
                      <h3 id="feedback-detail-title" className="mt-2 break-words text-lg font-bold leading-7 text-gray-900">
                        {selectedFeedback.subject}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeDetail}
                      className="-mr-1 -mt-1 shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Đóng chi tiết phản ánh"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <dl className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
                    <div className="flex min-w-0 gap-2.5">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-gray-500">Người gửi</dt>
                        <dd className="break-words font-medium text-gray-800">{selectedFeedback.name}</dd>
                      </div>
                    </div>
                    <div className="flex min-w-0 gap-2.5">
                      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-gray-500">Thời gian gửi</dt>
                        <dd className="font-medium text-gray-800">{new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}</dd>
                      </div>
                    </div>
                    <div className="flex min-w-0 gap-2.5">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-gray-500">Email</dt>
                        <dd>
                          {selectedFeedback.email ? (
                            <a className="break-all font-medium text-primary hover:underline" href={`mailto:${selectedFeedback.email}`}>
                              {selectedFeedback.email}
                            </a>
                          ) : <span className="text-gray-400">Không cung cấp</span>}
                        </dd>
                      </div>
                    </div>
                    <div className="flex min-w-0 gap-2.5">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-gray-500">Điện thoại</dt>
                        <dd>
                          {selectedFeedback.phone ? (
                            <a className="font-medium text-primary hover:underline" href={`tel:${selectedFeedback.phone}`}>
                              {selectedFeedback.phone}
                            </a>
                          ) : <span className="text-gray-400">Không cung cấp</span>}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Nội dung */}
                <section aria-labelledby="feedback-content-title">
                  <h4 id="feedback-content-title" className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Nội dung phản ánh
                  </h4>
                  <div className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-gray-100 bg-white p-4 text-sm leading-7 text-gray-700 [overflow-wrap:anywhere]">
                    {selectedFeedback.content}
                  </div>
                  {(selectedFeedback.attachments?.length ?? 0) > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Paperclip className="h-3.5 w-3.5" />
                        Ảnh người dân đính kèm ({selectedFeedback.attachments!.length})
                      </p>
                      <AttachmentList items={selectedFeedback.attachments!} />
                    </div>
                  )}
                </section>

                {/* Đổi trạng thái */}
                {canEdit && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Chuyển trạng thái</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {STATUS_KEYS.map((key) => {
                        const config = STATUS_CONFIG[key]
                        const current = selectedFeedback.status === key
                        return (
                          <button
                            type="button"
                            key={key}
                            onClick={() => handleChangeStatus(selectedFeedback.id, key)}
                            disabled={statusChanging || current}
                            aria-pressed={current}
                            className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all disabled:cursor-default ${
                              current
                                ? `${config.color} border-transparent`
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                            }`}
                          >
                            {config.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Phản hồi cũ */}
                {selectedFeedback.response && (
                  <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <p className="mb-1 text-xs font-semibold text-green-700">
                      Đã phản hồi{selectedFeedback.respondedAt ? ` — ${new Date(selectedFeedback.respondedAt).toLocaleString('vi-VN')}` : ''}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-green-900 [overflow-wrap:anywhere]">
                      {selectedFeedback.response}
                    </p>
                    {(selectedFeedback.responseAttachments?.length ?? 0) > 0 && (
                      <div className="mt-3">
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-green-700">
                          <Paperclip className="h-3.5 w-3.5" />
                          Tệp đính kèm ({selectedFeedback.responseAttachments!.length})
                        </p>
                        <AttachmentList items={selectedFeedback.responseAttachments!} tone="green" />
                      </div>
                    )}
                  </div>
                )}

                {/* Form phản hồi */}
                {canEdit && (
                  <div>
                    <label htmlFor="feedback-response" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {selectedFeedback.response ? 'Gửi phản hồi bổ sung' : 'Phản hồi người dân'}
                    </label>
                    <textarea
                      id="feedback-response"
                      rows={5}
                      maxLength={5000}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendResponse()
                      }}
                      className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Nhập nội dung phản hồi cho người dân..."
                    />
                    {/* Tệp đính kèm trả lời */}
                    <div className="mt-2">
                      <input
                        ref={responseFileInputRef}
                        id="feedback-response-files"
                        type="file"
                        multiple
                        accept={RESPONSE_FILE_ACCEPT}
                        disabled={sending || responseFiles.length >= MAX_RESPONSE_FILES}
                        onChange={(e) => addResponseFiles(e.target.files)}
                        className="sr-only"
                      />
                      {responseFiles.length > 0 && (
                        <ul className="mb-2 space-y-1.5">
                          {responseFiles.map((file, index) => (
                            <li key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                              {file.type.startsWith('image/')
                                ? <ImageIcon className="h-4 w-4 shrink-0 text-gray-400" />
                                : <FileText className="h-4 w-4 shrink-0 text-gray-400" />}
                              <span className="min-w-0 flex-1 truncate text-gray-700">{file.name}</span>
                              <span className="shrink-0 text-xs text-gray-400">{formatSize(file.size)}</span>
                              <button
                                type="button"
                                onClick={() => { setResponseFiles((items) => items.filter((_, i) => i !== index)); setFileError('') }}
                                disabled={sending}
                                aria-label={`Bỏ tệp ${file.name}`}
                                className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-600 disabled:opacity-50"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {responseFiles.length < MAX_RESPONSE_FILES && (
                        <label
                          htmlFor="feedback-response-files"
                          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary ${sending ? 'pointer-events-none opacity-50' : ''}`}
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          Đính kèm hình ảnh / tệp
                        </label>
                      )}
                      <p className="mt-1 text-[11px] text-gray-400">
                        Ảnh, PDF, Word, Excel · tối đa {MAX_RESPONSE_FILES} tệp, mỗi tệp ≤ 10MB, tổng ≤ 20MB
                      </p>
                      {fileError && <p className="mt-1 text-xs font-semibold text-red-600" role="alert">{fileError}</p>}
                    </div>
                    <div className={`mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                      selectedFeedback.email ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {selectedFeedback.email
                        ? <><MailCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>Phản hồi{responseFiles.length > 0 ? ` và ${responseFiles.length} tệp đính kèm` : ''} sẽ được gửi qua email tới <strong className="break-all">{selectedFeedback.email}</strong> và phản ánh chuyển sang “Đã giải quyết”.</span></>
                        : <><MailX className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>Người dân không cung cấp email — phản hồi chỉ được lưu trong hệ thống. {selectedFeedback.phone ? 'Hãy liên hệ qua điện thoại.' : ''}</span></>}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-400">{responseText.length}/5000 · Ctrl+Enter để gửi</span>
                      <button
                        type="button"
                        onClick={handleSendResponse}
                        disabled={sending || !responseText.trim()}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                        {sending ? 'Đang gửi...' : selectedFeedback.email ? 'Gửi phản hồi qua email' : 'Lưu phản hồi'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden h-fit rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center lg:col-span-3 lg:block">
              <MessageSquare className="mx-auto mb-3 h-8 w-8 text-gray-200" />
              <p className="text-sm text-gray-400">Chọn một phản ánh để xem chi tiết và phản hồi</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
