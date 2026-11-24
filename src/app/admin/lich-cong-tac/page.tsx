'use client'

/**
 * @nhom        : Admin / Lịch công tác
 * @chucnang    : Upload và publish PDF lịch công tác tuần
 * @lienquan    : src/app/api/admin/work-schedule/route.ts, src/lib/work-schedule-file.ts
 * @alias       : admin-work-schedule, admin-lich-cong-tac
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, CheckCircle2, ExternalLink, FileText, Loader2, Upload, X } from 'lucide-react'
import { useAdminRole } from '@/components/admin/AdminRoleContext'
import { uploadCmsFile } from '@/lib/cms-upload-client'
import type { LichCongTacData, LichTrucEntry } from '@/lib/static-data'
import {
  buildWorkScheduleFileMeta,
  formatWorkScheduleFileSize,
  parseWorkScheduleFileName,
  type WorkScheduleFileMeta,
} from '@/lib/work-schedule-file'

interface WorkScheduleApiResponse {
  data: LichCongTacData
  error?: string
}

interface FormState {
  tuanSo: string
  tuanTu: string
  tuanDen: string
  capNhat: string
  nguoiDuyet: string
  file?: WorkScheduleFileMeta
  gioLamViec: string[]
  diaDiemTruSo: string[]
  lichTruc: LichTrucEntry[]
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function createFormState(data?: LichCongTacData): FormState {
  return {
    tuanSo: String(data?.metadata.tuanSo || ''),
    tuanTu: data?.metadata.tuanTu || '',
    tuanDen: data?.metadata.tuanDen || '',
    capNhat: data?.metadata.capNhat || todayIso(),
    nguoiDuyet: data?.metadata.nguoiDuyet || 'Văn phòng UBND Phường Xuân Hòa',
    file: data?.metadata.file,
    gioLamViec: data?.metadata.gioLamViec || [],
    diaDiemTruSo: data?.metadata.diaDiemTruSo || [],
    lichTruc: data?.lichTruc || [],
  }
}

export default function AdminWorkSchedulePage() {
  const { canEdit } = useAdminRole()
  const [data, setData] = useState<LichCongTacData | null>(null)
  const [form, setForm] = useState<FormState>(createFormState())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/work-schedule')
        const payload = await res.json() as WorkScheduleApiResponse
        if (!res.ok) throw new Error(payload.error || 'Không thể tải lịch công tác')
        setData(payload.data)
        setForm(createFormState(payload.data))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải lịch công tác')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  async function handleUpload(file: File | undefined) {
    if (!file || !canEdit) return
    setError('')
    setMessage('')

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Lịch công tác chỉ hỗ trợ file PDF')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      const uploaded = await uploadCmsFile(file, {
        folder: 'lich-cong-tac',
        allowedMimePrefixes: ['application/pdf'],
        onProgress: setUploadProgress,
      })
      const fileMeta = buildWorkScheduleFileMeta(uploaded)
      const parsed = parseWorkScheduleFileName(uploaded.fileName)

      setForm((current) => ({
        ...current,
        tuanSo: uploaded.workSchedule?.metadata.tuanSo
          ? String(uploaded.workSchedule.metadata.tuanSo)
          : parsed.tuanSo ? String(parsed.tuanSo) : current.tuanSo,
        tuanTu: uploaded.workSchedule?.metadata.tuanTu || parsed.tuanTu || current.tuanTu,
        tuanDen: uploaded.workSchedule?.metadata.tuanDen || parsed.tuanDen || current.tuanDen,
        capNhat: uploaded.workSchedule?.metadata.capNhat || todayIso(),
        gioLamViec: uploaded.workSchedule?.metadata.gioLamViec || current.gioLamViec,
        diaDiemTruSo: uploaded.workSchedule?.metadata.diaDiemTruSo || current.diaDiemTruSo,
        lichTruc: uploaded.workSchedule?.lichTruc || current.lichTruc,
        file: fileMeta,
      }))
      setMessage(uploaded.workSchedule?.lichTruc?.length
        ? `Đã tải PDF lên và trích xuất ${uploaded.workSchedule.lichTruc.length} dòng lịch trực. Kiểm tra rồi bấm Lưu cập nhật để publish.`
        : 'Đã tải PDF lên. Kiểm tra thông tin tuần rồi bấm Lưu cập nhật để publish.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải file lên')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!canEdit) return
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/admin/work-schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            tuanSo: Number(form.tuanSo) || 0,
            tuanTu: form.tuanTu,
            tuanDen: form.tuanDen,
            capNhat: form.capNhat,
            nguoiDuyet: form.nguoiDuyet,
            gioLamViec: form.gioLamViec,
            diaDiemTruSo: form.diaDiemTruSo,
          },
          file: form.file || null,
          lichTruc: form.lichTruc,
        }),
      })
      const payload = await res.json() as WorkScheduleApiResponse & { success?: boolean }
      if (!res.ok) throw new Error(payload.error || 'Không thể lưu lịch công tác')

      setData(payload.data)
      setForm(createFormState(payload.data))
      setMessage('Đã cập nhật lịch công tác trên giao diện public.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu lịch công tác')
    } finally {
      setSaving(false)
    }
  }

  const dutyRows = data?.lichTruc?.length || 0
  const totalItems = data?.lichTuan.reduce((sum, day) => sum + day.items.length, 0) || 0

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch công tác</h1>
          <p className="mt-1 text-sm text-gray-500">Upload PDF lịch tuần, hệ thống tự lấy thông tin tuần từ tên file nếu đúng mẫu.</p>
        </div>
        <Link
          href="/lich-cong-tac"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
        >
          <ExternalLink className="h-4 w-4" />
          Xem trang public
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}

      {!canEdit && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          Tài khoản hiện tại chỉ có quyền xem. Cần quyền EDITOR hoặc ADMIN để upload lịch công tác.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">PDF lịch tuần</h2>
              <p className="text-xs text-gray-500">Chấp nhận file PDF, ví dụ: Lịch tuần từ ngày 25-5 đến ngày 31-5.signed.pdf</p>
            </div>
          </div>

          <div
            className={`mt-5 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              canEdit ? 'border-gray-200 bg-gray-50 hover:border-primary/40 hover:bg-primary/5' : 'border-gray-100 bg-gray-50 opacity-70'
            }`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              handleUpload(event.dataTransfer.files?.[0])
            }}
          >
            <FileText className="mx-auto h-10 w-10 text-primary/70" />
            <p className="mt-3 text-sm font-semibold text-gray-900">
              {uploading ? `Đang tải lên ${uploadProgress}%` : 'Kéo thả PDF vào đây hoặc chọn tệp'}
            </p>
            <p className="mt-1 text-xs text-gray-500">Sau khi upload, kiểm tra thông tin tuần và bấm lưu.</p>
            <label className={`mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
              canEdit && !uploading ? 'bg-primary text-white hover:bg-primary-dark' : 'pointer-events-none bg-gray-200 text-gray-500'
            }`}>
              Chọn PDF
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={!canEdit || uploading}
                onChange={(event) => handleUpload(event.target.files?.[0])}
              />
            </label>
          </div>

          {form.file && (
            <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900">{form.file.title}</p>
                  <p className="mt-1 break-all text-xs text-gray-500">{form.file.fileName}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatWorkScheduleFileSize(form.file.fileSize)} · {new Date(form.file.uploadedAt).toLocaleString('vi-VN')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={form.file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Mở PDF
                    </a>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, file: undefined }))}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Gỡ file khỏi lịch
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Thông tin hiển thị</h2>
              <p className="text-xs text-gray-500">Các trường này xuất hiện trên trang public.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Tuần số</span>
              <input
                type="number"
                min="0"
                max="53"
                value={form.tuanSo}
                disabled={!canEdit}
                onChange={(event) => setForm({ ...form, tuanSo: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-50"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-gray-600">Từ ngày</span>
                <input
                  type="date"
                  value={form.tuanTu}
                  disabled={!canEdit}
                  onChange={(event) => setForm({ ...form, tuanTu: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-50"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-600">Đến ngày</span>
                <input
                  type="date"
                  value={form.tuanDen}
                  disabled={!canEdit}
                  onChange={(event) => setForm({ ...form, tuanDen: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-50"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Ngày cập nhật</span>
              <input
                type="date"
                value={form.capNhat}
                disabled={!canEdit}
                onChange={(event) => setForm({ ...form, capNhat: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Người duyệt / đơn vị cập nhật</span>
              <input
                value={form.nguoiDuyet}
                disabled={!canEdit}
                onChange={(event) => setForm({ ...form, nguoiDuyet: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-50"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={!canEdit || saving || uploading}
            onClick={handleSave}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Lưu cập nhật
          </button>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Dữ liệu bảng lịch hiện có</h2>
        <p className="mt-1 text-sm text-gray-500">
          Hiện có {dutyRows || data?.lichTuan.length || 0} ngày trong dữ liệu lịch. File PDF sẽ được hiển thị ở đầu trang public để người dân xem bản chính thức.
          {dutyRows === 0 && totalItems > 0 ? ` Bảng lịch cũ có ${totalItems} hoạt động.` : ''}
        </p>
      </section>
    </div>
  )
}
