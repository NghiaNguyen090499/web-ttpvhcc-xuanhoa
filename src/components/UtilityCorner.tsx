/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Góc tiện ích — hiển thị 3–6 bài tuyên truyền dạng card nhỏ
 *                ở cột phải section tin tức. Bấm vào mở modal bài viết đầy đủ.
 * @lienquan    : src/components/NewsSection.tsx, src/components/CommunityPosts.tsx
 * @alias       : utility-corner, goc-tien-ich
 */

'use client'

import { useState } from 'react'
import type { TuyenTruyenItem } from '@/lib/static-data'

/**
 * @chucnang    : Lấy class màu theo tagColor
 * @input       : color (string)
 * @output      : object { bg, text, bgCard }
 */
function getColorSet(color: string) {
  const map: Record<string, { bgCard: string; text: string; tagBg: string; tagText: string }> = {
    blue:   { bgCard: 'bg-blue-600',    text: 'text-white', tagBg: 'bg-blue-500/30',    tagText: 'text-white' },
    red:    { bgCard: 'bg-primary',      text: 'text-white', tagBg: 'bg-white/20',        tagText: 'text-white' },
    green:  { bgCard: 'bg-emerald-600',  text: 'text-white', tagBg: 'bg-emerald-500/30',  tagText: 'text-white' },
    orange: { bgCard: 'bg-orange-500',   text: 'text-white', tagBg: 'bg-orange-400/30',   tagText: 'text-white' },
    teal:   { bgCard: 'bg-teal-600',     text: 'text-white', tagBg: 'bg-teal-500/30',     tagText: 'text-white' },
    amber:  { bgCard: 'bg-amber-500',    text: 'text-white', tagBg: 'bg-amber-400/30',    tagText: 'text-white' },
  }
  return map[color] || map.blue
}

/**
 * @chucnang    : Lấy style modal theo tagColor
 */
function getModalTagStyle(color: string) {
  const map: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue:   { bg: 'bg-blue-50',    text: 'text-blue-700',    iconBg: 'bg-blue-100' },
    red:    { bg: 'bg-red-50',     text: 'text-red-700',     iconBg: 'bg-red-100' },
    green:  { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    orange: { bg: 'bg-orange-50',  text: 'text-orange-700',  iconBg: 'bg-orange-100' },
    teal:   { bg: 'bg-teal-50',    text: 'text-teal-700',    iconBg: 'bg-teal-100' },
    amber:  { bg: 'bg-amber-50',   text: 'text-amber-700',   iconBg: 'bg-amber-100' },
  }
  return map[color] || map.blue
}

/**
 * @chucnang    : Modal hiển thị bài viết đầy đủ (tái sử dụng logic từ CommunityPosts)
 * @input       : item, onClose
 * @output      : JSX modal
 */
function PostModal({ item, onClose }: { item: TuyenTruyenItem | null; onClose: () => void }) {
  if (!item) return null

  const style = getModalTagStyle(item.tagColor)

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />

      {/* Nội dung modal */}
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

        {/* Nội dung */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-120px)]">
          <p className="text-sm text-text-secondary italic border-l-3 border-primary pl-4 mb-5 leading-relaxed">
            {item.summary}
          </p>
          <div
            className="prose-community"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border px-6 py-3 flex items-center justify-between">
          <span className="text-[10px] text-text-muted">UBND Phường Xuân Hòa</span>
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
 * @chucnang    : Góc tiện ích — sidebar cột phải trong section tin tức
 *                Hiển thị các bài tuyên truyền dạng card nhỏ, bấm mở modal
 * @input       : items (TuyenTruyenItem[]) — tối đa 3–4 bài
 * @output      : JSX cột phải
 */
export function UtilityCorner({ items }: { items: TuyenTruyenItem[] }) {
  const [selectedPost, setSelectedPost] = useState<TuyenTruyenItem | null>(null)

  /* Lấy tối đa 3 bài cho sidebar */
  const displayItems = items.slice(0, 3)

  return (
    <>
      <div className="rounded-2xl border border-border bg-white overflow-hidden flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-cream/60">
          <span className="text-sm">📢</span>
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
            Góc tiện ích
          </h4>
        </div>

        {/* Danh sách bài tuyên truyền — dạng card nhỏ */}
        <div className="p-4 space-y-3">
          {displayItems.map((item) => {
            const colors = getColorSet(item.tagColor)
            return (
              <button
                key={item.id}
                onClick={() => setSelectedPost(item)}
                className={`group w-full text-left rounded-xl p-4 ${colors.bgCard} ${colors.text} hover:opacity-90 hover:shadow-lg btn-transition`}
              >
                {/* Icon + Tag */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${colors.tagBg} ${colors.tagText}`}>
                    {item.tag}
                  </span>
                </div>
                {/* Tiêu đề */}
                <h5 className="text-sm font-bold leading-snug mb-1.5">
                  {item.title}
                </h5>
                {/* Mô tả ngắn */}
                <p className="text-[11px] opacity-80 leading-relaxed line-clamp-2">
                  {item.summary}
                </p>
                {/* "Xem chi tiết" */}
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold opacity-70 group-hover:opacity-100 btn-transition">
                  Xem chi tiết
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      <PostModal item={selectedPost} onClose={() => setSelectedPost(null)} />
    </>
  )
}
