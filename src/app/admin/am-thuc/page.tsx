'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Edit3,
  Eye,
  EyeOff,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Star,
  Trash2,
  UploadCloud,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useAdminRole } from '@/components/admin/AdminRoleContext'
import type { FoodPlace, FoodPlaceCategory } from '@/types/food-place'

const CATEGORY_OPTIONS: Array<{ value: FoodPlaceCategory; label: string }> = [
  { value: 'restaurant', label: 'Quán ăn & nhà hàng' },
  { value: 'cafe', label: 'Cà phê & trà' },
  { value: 'bakery', label: 'Tiệm bánh & món ngọt' },
  { value: 'vegetarian', label: 'Ẩm thực chay' },
  { value: 'takeaway', label: 'Món nhanh & mang đi' },
  { value: 'other', label: 'Ẩm thực khác' },
]

type FoodPlaceForm = Omit<FoodPlace, 'rating' | 'userRatingCount'> & {
  rating: number | ''
  userRatingCount: number | ''
}

function emptyForm(): FoodPlaceForm {
  return {
    id: '',
    name: '',
    address: '',
    summary: '',
    category: 'restaurant',
    googleMapsUri: '',
    imageUrl: '',
    imageAlt: '',
    imageCredit: '',
    imageSourceUrl: '',
    rating: '',
    userRatingCount: '',
    priceLabel: '',
    openingHours: '',
    phone: '',
    isFeatured: false,
    isActive: true,
    sortOrder: 0,
    reviewedAt: new Date().toISOString().slice(0, 10),
  }
}

function formFromItem(item: FoodPlace): FoodPlaceForm {
  return {
    ...item,
    imageUrl: item.imageUrl ?? '',
    imageAlt: item.imageAlt ?? '',
    imageCredit: item.imageCredit ?? '',
    imageSourceUrl: item.imageSourceUrl ?? '',
    rating: item.rating ?? '',
    userRatingCount: item.userRatingCount ?? '',
    priceLabel: item.priceLabel ?? '',
    openingHours: item.openingHours ?? '',
    phone: item.phone ?? '',
    reviewedAt: item.reviewedAt ?? '',
  }
}

function categoryLabel(category: FoodPlaceCategory) {
  return CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? 'Ẩm thực khác'
}

async function responseError(response: Response) {
  try {
    const data = await response.json()
    return typeof data.error === 'string' ? data.error : 'Thao tác không thành công'
  } catch {
    return 'Thao tác không thành công'
  }
}

export default function AdminFoodPlacesPage() {
  const { canEdit, canDelete } = useAdminRole()
  const [items, setItems] = useState<FoodPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [query, setQuery] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FoodPlaceForm>(emptyForm)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function loadItems() {
    try {
      const response = await fetch('/api/admin/food-places', { cache: 'no-store' })
      if (!response.ok) throw new Error(await responseError(response))
      const data = await response.json()
      setItems(data.items ?? [])
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Không thể tải danh sách' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetch('/api/admin/food-places', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error(await responseError(response))
        return response.json()
      })
      .then((data) => {
        if (active) setItems(data.items ?? [])
      })
      .catch((error) => {
        if (active) setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Không thể tải danh sách' })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi-VN')
    return items
      .filter((item) => !keyword || `${item.name} ${item.address} ${item.summary}`.toLocaleLowerCase('vi-VN').includes(keyword))
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi'))
  }, [items, query])

  function openCreate() {
    if (!canEdit) return
    setEditingId(null)
    setForm(emptyForm())
    setNotice(null)
    setShowEditor(true)
  }

  function openEdit(item: FoodPlace) {
    if (!canEdit) return
    setEditingId(item.id)
    setForm(formFromItem(item))
    setNotice(null)
    setShowEditor(true)
  }

  async function uploadImage(file?: File) {
    if (!file || !canEdit) return
    if (!file.type.startsWith('image/')) {
      setNotice({ type: 'error', message: 'Chỉ hỗ trợ tệp ảnh.' })
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      setNotice({ type: 'error', message: 'Ảnh không được vượt quá 12MB.' })
      return
    }

    setUploading(true)
    setNotice(null)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('folder', 'am-thuc')
      const response = await fetch('/api/admin/uploads', { method: 'POST', body })
      if (!response.ok) throw new Error(await responseError(response))
      const data = await response.json()
      setForm((current) => ({
        ...current,
        imageUrl: data.url,
        imageAlt: current.imageAlt || `Ảnh ${current.name || 'địa điểm ẩm thực'}`,
      }))
      setNotice({ type: 'success', message: 'Đã tải ảnh lên. Hãy bấm Lưu địa điểm để hoàn tất.' })
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Không thể tải ảnh' })
    } finally {
      setUploading(false)
    }
  }

  async function saveItem() {
    if (!canEdit || saving) return
    if (!form.name.trim() || !form.address.trim() || !form.summary.trim() || !form.googleMapsUri.trim()) {
      setNotice({ type: 'error', message: 'Vui lòng nhập tên, địa chỉ, giới thiệu và liên kết Google Maps.' })
      return
    }

    setSaving(true)
    setNotice(null)
    try {
      const response = await fetch('/api/admin/food-places', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: editingId ?? undefined }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      await loadItems()
      setShowEditor(false)
      setNotice({ type: 'success', message: editingId ? 'Đã cập nhật địa điểm.' : 'Đã thêm địa điểm mới.' })
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Không thể lưu địa điểm' })
    } finally {
      setSaving(false)
    }
  }

  async function toggleVisibility(item: FoodPlace) {
    if (!canEdit) return
    const response = await fetch('/api/admin/food-places', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, isActive: !item.isActive }),
    })
    if (!response.ok) {
      setNotice({ type: 'error', message: await responseError(response) })
      return
    }
    await loadItems()
    setNotice({ type: 'success', message: item.isActive ? 'Đã ẩn địa điểm khỏi trang công khai.' : 'Đã hiển thị địa điểm.' })
  }

  async function importFromOpenStreetMap() {
    if (!canEdit || importing) return
    if (!window.confirm('Quét các điểm ăn uống trong ranh giới phường từ OpenStreetMap? Điểm mới sẽ được nhập ở trạng thái ẩn để chờ duyệt.')) return

    setImporting(true)
    setNotice(null)
    try {
      const response = await fetch('/api/admin/food-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import-osm' }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      const data = await response.json()
      await loadItems()
      setNotice({ type: 'success', message: `Đã quét ${data.found} điểm; nhập thêm ${data.imported} điểm mới, bỏ qua ${data.skipped} điểm đã có.` })
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Không thể quét dữ liệu mở' })
    } finally {
      setImporting(false)
    }
  }

  async function removeItem(item: FoodPlace) {
    if (!canDelete || !window.confirm(`Xóa vĩnh viễn “${item.name}”?`)) return
    const response = await fetch('/api/admin/food-places', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    })
    if (!response.ok) {
      setNotice({ type: 'error', message: await responseError(response) })
      return
    }
    await loadItems()
    setNotice({ type: 'success', message: 'Đã xóa địa điểm.' })
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Khám phá Xuân Hòa</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Quản lý ẩm thực</h1>
          <p className="mt-1 text-sm text-gray-500">Biên tập quán ăn, hình ảnh và liên kết Google Maps hiển thị trên trang công khai.</p>
        </div>
        {canEdit && <div className="flex flex-wrap gap-2">
          <button type="button" onClick={importFromOpenStreetMap} disabled={importing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-sm hover:bg-primary/5 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${importing ? 'animate-spin' : ''}`} /> {importing ? 'Đang quét...' : 'Quét dữ liệu mở'}
          </button>
          <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-dark">
            <Plus className="h-4 w-4" /> Thêm địa điểm
          </button>
        </div>}
      </div>

      {notice && (
        <div className={`mt-5 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Đóng thông báo"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Tổng địa điểm" value={items.length} icon={UtensilsCrossed} />
        <StatCard label="Đang hiển thị" value={items.filter((item) => item.isActive).length} icon={Eye} />
        <StatCard label="Được đánh dấu nổi bật" value={items.filter((item) => item.isFeatured).length} icon={Star} />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên quán hoặc địa chỉ..." className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </label>
          <a href="/dia-diem-noi-bat/am-thuc" target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Xem trang công khai <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">Đang tải danh sách...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UtensilsCrossed className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 font-semibold text-gray-700">Chưa có địa điểm ẩm thực</p>
            <p className="mt-1 text-sm text-gray-500">Bấm “Thêm địa điểm” để bắt đầu xây dựng danh sách.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <article key={item.id} className={`grid gap-4 p-4 transition hover:bg-gray-50 sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:items-center ${item.isActive ? '' : 'opacity-60'}`}>
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                  {item.imageUrl ? (
                    <div role="img" aria-label={item.imageAlt ?? `Ảnh ${item.name}`} className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${item.imageUrl.replace(/"/g, '\\"')}")` }} />
                  ) : (
                    <div role="img" aria-label={`Chưa có ảnh xác thực của ${item.name}`} className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-950 to-emerald-700 px-2 text-center text-white">
                      <UtensilsCrossed className="h-6 w-6 text-amber-300" />
                      <span className="mt-1 text-[10px] font-bold">Chưa có ảnh xác thực</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-gray-900">{item.name}</h2>
                    {item.isFeatured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">Nổi bật</span>}
                    {!item.isActive && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">Đang ẩn</span>}
                    {item.sourceName && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700">Nguồn: {item.sourceName}</span>}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-primary">{categoryLabel(item.category)}</p>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-500"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{item.address}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {item.rating !== undefined && <span className="font-bold text-amber-700">★ {item.rating.toFixed(1)}</span>}
                    {item.userRatingCount !== undefined && <span>{item.userRatingCount.toLocaleString('vi-VN')} lượt đánh giá</span>}
                    <span>Thứ tự: {item.sortOrder}</span>
                  </div>
                </div>
                <div className="flex gap-2 sm:justify-end">
                  {canEdit && (
                    <>
                      <button type="button" onClick={() => toggleVisibility(item)} title={item.isActive ? 'Ẩn địa điểm' : 'Hiển thị địa điểm'} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-primary hover:text-primary">
                        {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={() => openEdit(item)} title="Chỉnh sửa" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-primary hover:text-primary"><Edit3 className="h-4 w-4" /></button>
                    </>
                  )}
                  {canDelete && <button type="button" onClick={() => removeItem(item)} title="Xóa" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-red-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-950/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto my-4 max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm ẩm thực'}</h2>
                <p className="text-xs text-gray-500">Các trường có dấu * là bắt buộc.</p>
              </div>
              <button type="button" onClick={() => setShowEditor(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <Field label="Tên địa điểm *"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="admin-input" placeholder="Ví dụ: Quán ăn..." /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nhóm ẩm thực *">
                    <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as FoodPlaceCategory })} className="admin-input">
                      {CATEGORY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Thứ tự hiển thị"><input type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="admin-input" /></Field>
                </div>
                <Field label="Địa chỉ *"><input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="admin-input" placeholder="Số nhà, tên đường, phường Xuân Hòa" /></Field>
                <Field label="Giới thiệu ngắn *"><textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} className="admin-input min-h-28 resize-y" maxLength={1200} placeholder="Món nổi bật, không gian hoặc nét đặc trưng..." /></Field>
                <Field label="Liên kết Google Maps *" hint="Mở địa điểm trên Google Maps → Chia sẻ → Sao chép đường liên kết."><input type="url" value={form.googleMapsUri} onChange={(event) => setForm({ ...form, googleMapsUri: event.target.value })} className="admin-input" placeholder="https://maps.app.goo.gl/..." /></Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Điểm sao tham khảo"><input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value === '' ? '' : Number(event.target.value) })} className="admin-input" placeholder="4.5" /></Field>
                  <Field label="Lượt đánh giá"><input type="number" min="0" value={form.userRatingCount} onChange={(event) => setForm({ ...form, userRatingCount: event.target.value === '' ? '' : Number(event.target.value) })} className="admin-input" placeholder="120" /></Field>
                  <Field label="Ngày kiểm tra"><input type="date" value={form.reviewedAt} onChange={(event) => setForm({ ...form, reviewedAt: event.target.value })} className="admin-input" /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Mức giá"><input value={form.priceLabel} onChange={(event) => setForm({ ...form, priceLabel: event.target.value })} className="admin-input" placeholder="30.000 – 80.000đ" /></Field>
                  <Field label="Điện thoại"><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="admin-input" placeholder="028..." /></Field>
                </div>
                <Field label="Giờ mở cửa"><input value={form.openingHours} onChange={(event) => setForm({ ...form, openingHours: event.target.value })} className="admin-input" placeholder="06:30 – 22:00 hằng ngày" /></Field>

                <div className="flex flex-wrap gap-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4 accent-primary" />Hiển thị công khai</label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} className="h-4 w-4 accent-primary" />Đánh dấu nổi bật</label>
                </div>
              </div>

              <aside className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Ảnh địa điểm</p>
                  <div className="mt-2 aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                    {form.imageUrl ? (
                      <div role="img" aria-label={form.imageAlt || `Ảnh ${form.name}`} className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${form.imageUrl.replace(/"/g, '\\"')}")` }} />
                    ) : (
                      <div role="img" aria-label={`Chưa có ảnh xác thực của ${form.name || 'địa điểm'}`} className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-950 to-emerald-700 px-6 text-center text-white">
                        <UtensilsCrossed className="h-10 w-10 text-amber-300" />
                        <p className="mt-3 text-sm font-bold">Chưa có ảnh xác thực</p>
                        <p className="mt-1 text-xs text-white/65">Hãy tải ảnh đúng của địa điểm trước khi sử dụng.</p>
                      </div>
                    )}
                  </div>
                  {!form.imageUrl && <p className="mt-1 text-[11px] text-gray-400">Trang công khai sẽ hiển thị placeholder trung tính, không dùng ảnh món ăn của địa điểm khác.</p>}
                  <label className={`mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-3 text-sm font-bold text-primary hover:bg-primary/10 ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
                    <UploadCloud className="h-4 w-4" />{uploading ? 'Đang tải ảnh...' : 'Tải ảnh từ máy'}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" onChange={(event) => uploadImage(event.target.files?.[0])} />
                  </label>
                </div>
                <Field label="Hoặc URL ảnh HTTPS"><input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} className="admin-input" placeholder="https://..." /></Field>
                <Field label="Mô tả ảnh"><input value={form.imageAlt} onChange={(event) => setForm({ ...form, imageAlt: event.target.value })} className="admin-input" placeholder="Ảnh món ăn hoặc mặt tiền quán" /></Field>
                <Field label="Tác giả / nguồn ảnh"><input value={form.imageCredit} onChange={(event) => setForm({ ...form, imageCredit: event.target.value })} className="admin-input" placeholder="Tên tác giả hoặc đơn vị" /></Field>
                <Field label="Liên kết nguồn ảnh"><input type="url" value={form.imageSourceUrl} onChange={(event) => setForm({ ...form, imageSourceUrl: event.target.value })} className="admin-input" placeholder="https://..." /></Field>
                <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Chỉ sử dụng ảnh do phường sở hữu, được chủ quán cung cấp hoặc có quyền sử dụng rõ ràng.</div>
                {form.sourceName && <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs leading-5 text-sky-800">Dữ liệu ban đầu: {form.sourceUrl ? <a href={form.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">{form.sourceName}</a> : form.sourceName}. Hãy kiểm tra địa chỉ và mô tả trước khi bật hiển thị công khai.</div>}
              </aside>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4">
              <button type="button" onClick={() => setShowEditor(false)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Hủy</button>
              <button type="button" onClick={saveItem} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Đang lưu...' : 'Lưu địa điểm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Star }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
      <span><span className="block text-2xl font-bold text-gray-900">{value}</span><span className="block text-xs text-gray-500">{label}</span></span>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      {hint && <span className="mt-0.5 block text-xs leading-5 text-gray-400">{hint}</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
  )
}
