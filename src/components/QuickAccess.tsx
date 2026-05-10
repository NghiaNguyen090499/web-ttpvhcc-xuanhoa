/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : QuickAccess nâng cấp — 6 ô truy cập nhanh + form tra cứu hồ sơ inline
 *                Học từ DVC Quốc gia: 3 nút vàng lớn + DVC liên thông
 *                Nâng cấp: thêm đặt lịch, biểu mẫu, hỏi đáp AI, tra cứu hồ sơ
 * @lienquan    : src/app/(public)/page.tsx
 * @alias       : quick-access, truy-cap-nhanh
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'

/* 6 mục truy cập nhanh */
const ITEMS = [
  {
    title: 'Nộp hồ sơ trực tuyến',
    desc: 'Nộp qua Cổng DVC Quốc gia',
    href: 'https://dichvucong.gov.vn',
    external: true,
    color: '#a61d21',
    bgColor: 'rgba(166, 29, 33, 0.08)',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Tra cứu hồ sơ',
    desc: 'Nhập mã biên nhận tra cứu',
    href: '#lookup',
    external: false,
    isLookup: true,
    color: '#1565C0',
    bgColor: 'rgba(21, 101, 192, 0.08)',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: 'Biểu mẫu tải về',
    desc: 'Tải biểu mẫu theo lĩnh vực',
    href: '/thu-tuc',
    external: false,
    color: '#E65100',
    bgColor: 'rgba(230, 81, 0, 0.08)',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    title: 'Phản ánh, Kiến nghị',
    desc: 'Gửi ý kiến đến chính quyền',
    href: '/lien-he',
    external: false,
    color: '#6A1B9A',
    bgColor: 'rgba(106, 27, 154, 0.08)',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'Hướng dẫn sử dụng',
    desc: 'Quy trình, thủ tục từ A-Z',
    href: '/gioi-thieu',
    external: false,
    color: '#2E7D32',
    bgColor: 'rgba(46, 125, 50, 0.08)',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Hỏi đáp AI 24/7',
    desc: 'Chatbot hỗ trợ tức thì',
    href: '#chatbot',
    external: false,
    isChatbot: true,
    color: '#0D47A1',
    bgColor: 'rgba(13, 71, 161, 0.08)',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export function QuickAccess() {
  const [showLookup, setShowLookup] = useState(false)
  const [lookupCode, setLookupCode] = useState('')

  /**
   * @chucnang    : Xử lý click item — nếu là tra cứu hồ sơ thì mở form inline,
   *                nếu là chatbot thì trigger sự kiện mở chat widget
   */
  const handleItemClick = (item: typeof ITEMS[0], e: React.MouseEvent) => {
    if ((item as { isLookup?: boolean }).isLookup) {
      e.preventDefault()
      setShowLookup(!showLookup)
    }
    if ((item as { isChatbot?: boolean }).isChatbot) {
      e.preventDefault()
      /* Dispatch event để ChatWidget mở — nếu ChatWidget đang listen */
      window.dispatchEvent(new CustomEvent('open-chatbot'))
    }
  }

  /**
   * @chucnang    : Xử lý tra cứu hồ sơ — redirect đến DVC Quốc gia với mã
   */
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lookupCode.trim()) return
    window.open(
      `https://dichvucong.gov.vn/p/home/dvc-tra-cuu-ho-so.html?maBienNhan=${encodeURIComponent(lookupCode.trim())}`,
      '_blank'
    )
  }

  return (
    <section className="py-8 md:py-10" id="quick-access">
      <div className="container-main">
        {/* Grid 6 ô — 2 hàng x 3 cột trên desktop, 2 cột trên mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {ITEMS.map((item) => {
            const isExternal = item.external
            const Tag = isExternal ? 'a' : (item as { isLookup?: boolean }).isLookup || (item as { isChatbot?: boolean }).isChatbot ? 'button' : Link
            const linkProps = isExternal
              ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
              : (item as { isLookup?: boolean }).isLookup || (item as { isChatbot?: boolean }).isChatbot
                ? { type: 'button' as const }
                : { href: item.href }

            return (
              <Tag
                key={item.title}
                {...(linkProps as any)}
                onClick={(e: React.MouseEvent) => handleItemClick(item, e)}
                className="group flex flex-col items-center text-center p-4 md:p-5 rounded-2xl border border-border bg-white hover:border-transparent hover:-translate-y-1 hover:shadow-xl btn-transition"
              >
                {/* Icon vòng tròn */}
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-2xl mb-3 group-hover:scale-110 btn-transition"
                  style={{ backgroundColor: item.bgColor, color: item.color }}
                >
                  {item.icon}
                </div>

                {/* Tiêu đề */}
                <h3 className="text-xs md:text-sm font-bold text-text-primary group-hover:text-primary btn-transition leading-tight">
                  {item.title}
                </h3>

                {/* Mô tả — ẩn trên mobile */}
                <p className="hidden sm:block mt-1 text-[11px] text-text-muted leading-tight">
                  {item.desc}
                </p>

                {/* Badge external */}
                {isExternal && (
                  <span className="mt-2 text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                    DVC Quốc gia ↗
                  </span>
                )}
              </Tag>
            )
          })}
        </div>

        {/* Form tra cứu hồ sơ — hiện khi click "Tra cứu hồ sơ" */}
        {showLookup && (
          <div className="mt-4 animate-fade-in-up">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-border p-5 md:p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10">
                  <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Tra cứu tiến độ hồ sơ</h3>
                  <p className="text-xs text-text-muted">Nhập mã biên nhận để kiểm tra trạng thái xử lý</p>
                </div>
                <button
                  onClick={() => setShowLookup(false)}
                  className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream text-text-muted hover:text-primary btn-transition"
                  aria-label="Đóng tra cứu"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleLookup} className="flex gap-3">
                <input
                  type="text"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  placeholder="Nhập mã biên nhận hồ sơ..."
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-cream/50 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 btn-transition"
                  aria-label="Mã biên nhận"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark btn-transition shrink-0"
                >
                  Tra cứu
                </button>
              </form>

              <p className="mt-3 text-xs text-text-muted text-center">
                Kết quả sẽ được tra cứu trên Cổng Dịch vụ công Quốc gia
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
