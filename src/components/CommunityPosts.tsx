/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Tuyên truyền cộng đồng — hiển thị các bài tuyên truyền dạng card
 *                Bấm vào mở modal xem bài viết đầy đủ
 * @lienquan    : src/lib/static-data.ts, data/tuyen-truyen.json
 * @alias       : community-posts, tuyen-truyen, bai-viet-cong-dong
 */

'use client'

import { useState } from 'react'
import type { TuyenTruyenItem } from '@/lib/static-data'

/**
 * @chucnang    : Lấy class màu theo tagColor
 * @input       : color (string)
 * @output      : object { bg, text, ring }
 */
function getTagStyle(color: string) {
  const map: Record<string, { bg: string; text: string; ring: string; iconBg: string }> = {
    blue:   { bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-200',    iconBg: 'bg-blue-100' },
    red:    { bg: 'bg-red-50',     text: 'text-red-700',     ring: 'ring-red-200',     iconBg: 'bg-red-100' },
    green:  { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', iconBg: 'bg-emerald-100' },
    orange: { bg: 'bg-orange-50',  text: 'text-orange-700',  ring: 'ring-orange-200',  iconBg: 'bg-orange-100' },
    teal:   { bg: 'bg-teal-50',    text: 'text-teal-700',    ring: 'ring-teal-200',    iconBg: 'bg-teal-100' },
    amber:  { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200',   iconBg: 'bg-amber-100' },
  }
  return map[color] || map.blue
}

/**
 * @chucnang    : Card bài tuyên truyền — bấm mở modal
 * @input       : item (TuyenTruyenItem), onClick callback
 * @output      : JSX card
 */
function PostCard({ item, onClick }: { item: TuyenTruyenItem; onClick: () => void }) {
  const style = getTagStyle(item.tagColor)

  return (
    <button
      onClick={onClick}
      className={`group text-left w-full bg-white rounded-2xl border border-border p-5 hover:shadow-lg hover:-translate-y-1 btn-transition focus:outline-none focus:ring-2 ${style.ring}`}
    >
      {/* Icon + Tag */}
      <div className="flex items-center gap-3 mb-3">
        <span className={`flex items-center justify-center w-11 h-11 rounded-xl text-xl ${style.iconBg}`}>
          {item.icon}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
          {item.tag}
        </span>
      </div>

      {/* Tiêu đề */}
      <h3 className="text-sm font-bold text-text-primary leading-snug group-hover:text-primary btn-transition line-clamp-2">
        {item.title}
      </h3>

      {/* Tóm tắt */}
      <p className="mt-2 text-xs text-text-secondary leading-relaxed line-clamp-2">
        {item.summary}
      </p>

      {/* Đọc thêm */}
      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:gap-2 btn-transition">
        Đọc bài viết
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </button>
  )
}

/**
 * @chucnang    : Modal hiển thị bài viết đầy đủ
 * @input       : item (TuyenTruyenItem | null), onClose callback
 * @output      : JSX modal overlay
 */
function PostModal({ item, onClose }: { item: TuyenTruyenItem | null; onClose: () => void }) {
  if (!item) return null

  const style = getTagStyle(item.tagColor)

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay mờ */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />

      {/* Modal content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-start gap-4 z-10">
          <span className={`flex items-center justify-center w-12 h-12 rounded-xl text-2xl shrink-0 ${style.iconBg}`}>
            {item.icon}
          </span>
          <div className="flex-1 min-w-0">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
              {item.tag}
            </span>
            <h2 className="mt-1 text-lg font-bold text-text-primary font-heading leading-snug">
              {item.title}
            </h2>
            <p className="text-xs text-text-muted mt-1">
              {new Date(item.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-text-muted hover:text-text-primary btn-transition shrink-0"
            aria-label="Đóng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nội dung bài viết */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Mô tả tóm tắt */}
          <p className="text-sm text-text-secondary italic border-l-3 border-primary pl-4 mb-5 leading-relaxed">
            {item.summary}
          </p>

          {/* Nội dung HTML */}
          <div
            className="prose-community"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border px-6 py-3 flex items-center justify-between">
          <span className="text-[10px] text-text-muted">
            UBND Phường Xuân Hòa
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-primary hover:text-primary-dark btn-transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * @chucnang    : Section tuyên truyền cộng đồng — grid cards + modal
 *                Nhận dữ liệu từ Server Component qua props
 * @input       : items (TuyenTruyenItem[])
 * @output      : JSX section
 */
export function CommunityPosts({ items }: { items: TuyenTruyenItem[] }) {
  const [selectedPost, setSelectedPost] = useState<TuyenTruyenItem | null>(null)

  return (
    <>
      <section className="py-10 md:py-14 bg-white" id="tuyen-truyen">
        <div className="container-main">
          {/* Heading */}
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              📢
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-text-primary font-heading uppercase tracking-wide">
              Góc tiện ích
            </h2>
            <div className="w-12 h-1 bg-accent mx-auto mt-3 rounded-full" />
            <p className="mt-3 text-sm text-text-secondary max-w-lg mx-auto">
              Cập nhật kiến thức an ninh, sức khỏe, môi trường và các chính sách thiết thực cho người dân
            </p>
          </div>

          {/* Grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <PostCard
                key={item.id}
                item={item}
                onClick={() => setSelectedPost(item)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal bài viết */}
      <PostModal item={selectedPost} onClose={() => setSelectedPost(null)} />
    </>
  )
}
