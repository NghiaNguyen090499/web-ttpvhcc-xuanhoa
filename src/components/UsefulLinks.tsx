/**
 * @nhom        : Components
 * @chucnang    : Liên kết website — grid cards cho Sở, Ban, Ngành, Tổ chức TP.HCM
 * @lienquan    : data/useful-links.json
 * @alias       : useful-links, lien-ket-website
 *
 * Không dùng FontAwesome — dùng lucide-react icons + emoji thay thế
 * để giữ bundle size nhỏ và không phụ thuộc CDN
 */

import Link from 'next/link'

// Dữ liệu đọc trực tiếp — không cần import JSON runtime
const CATEGORIES = {
  gov: { label: 'Cơ quan Đảng — Chính quyền', color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', icon: '🏛️' },
  org: { label: 'Mặt trận — Đoàn thể', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: '🤝' },
  dept: { label: 'Sở, Ban, Ngành', color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', icon: '🏢' },
}

// Icon mapping — thay FontAwesome bằng emoji để không phụ thuộc CDN
const ICON_MAP: Record<string, string> = {
  'fas fa-flag': '🚩',
  'fas fa-star': '⭐',
  'fas fa-landmark': '🏛️',
  'fas fa-female': '👩',
  'fas fa-hard-hat': '👷',
  'fas fa-users': '👥',
  'fas fa-user-tie': '👔',
  'fas fa-hands-helping': '🤲',
  'fas fa-theater-masks': '🎭',
  'fas fa-flask': '🔬',
  'fas fa-industry': '🏭',
  'fas fa-heartbeat': '❤️‍🩹',
  'fas fa-seedling': '🌱',
  'fas fa-search': '🔍',
  'fas fa-building-columns': '🏢',
  'fas fa-laptop-code': '💻',
  'fas fa-drafting-compass': '📐',
  'fas fa-utensils': '🍽️',
}

interface UsefulLink {
  index: number
  title: string
  url: string
  category: 'gov' | 'org' | 'dept'
  iconClass: string
}

interface UsefulLinksProps {
  /** Hiển thị dạng compact (chỉ hiện 1 hàng ngang, dùng trên trang chủ) */
  compact?: boolean
}

import fs from 'fs'
import path from 'path'

/**
 * @chucnang    : Đọc dữ liệu liên kết từ JSON
 * @output      : Mảng UsefulLink
 */
function getUsefulLinks(): UsefulLink[] {
  const filePath = path.join(process.cwd(), 'data', 'useful-links.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)
  return data.items as UsefulLink[]
}

/**
 * @chucnang    : Lấy emoji icon từ FontAwesome class
 */
function getIcon(iconClass: string): string {
  const key = iconClass.split(' ').slice(0, 2).join(' ')
  return ICON_MAP[key] || '🔗'
}

export default function UsefulLinks({ compact = false }: UsefulLinksProps) {
  const links = getUsefulLinks()

  // Nhóm theo category
  const grouped = {
    gov: links.filter((l) => l.category === 'gov'),
    org: links.filter((l) => l.category === 'org'),
    dept: links.filter((l) => l.category === 'dept'),
  }

  if (compact) {
    // Dạng compact — carousel ngang trên trang chủ
    return (
      <section className="py-10 bg-cream/50">
        <div className="container-main">
          <div className="text-center mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">Liên kết</p>
            <h2 className="mt-1 font-heading text-xl font-bold text-text-primary uppercase tracking-wide">
              Cổng thông tin liên kết
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {links.slice(0, 12).map((link) => (
              <a
                key={link.index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-border text-xs font-medium text-text-primary hover:border-primary/30 hover:shadow-md btn-transition"
                title={link.title}
              >
                <span className="text-base">{getIcon(link.iconClass)}</span>
                <span className="max-w-[120px] truncate">{link.title}</span>
              </a>
            ))}
            {links.length > 12 && (
              <Link
                href="/lien-ket"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs font-semibold text-primary hover:bg-primary/10 btn-transition"
              >
                Xem tất cả →
              </Link>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Dạng đầy đủ — dùng trên trang /lien-ket
  return (
    <div className="space-y-8">
      {(Object.entries(grouped) as [keyof typeof CATEGORIES, UsefulLink[]][]).map(([cat, items]) => {
        if (items.length === 0) return null
        const config = CATEGORIES[cat]
        return (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <h3 className="text-base font-bold text-text-primary">{config.label}</h3>
                <p className="text-xs text-text-muted">{items.length} cổng thông tin</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((link) => (
                <a
                  key={link.index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 p-4 rounded-2xl border ${config.color} hover:shadow-lg hover:-translate-y-0.5 btn-transition`}
                >
                  <span className="text-2xl flex-shrink-0 group-hover:scale-110 btn-transition">{getIcon(link.iconClass)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary truncate">{link.title}</p>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">{link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</p>
                  </div>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-primary shrink-0 btn-transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
