/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Dải thống kê — 4 cột con số ấn tượng (kế thừa backup StatsStrip)
 * @lienquan    : src/app/(public)/page.tsx
 * @alias       : stats, thong-ke, stats-strip
 */

const STATS = [
  { value: '26+', label: 'Nhóm thủ tục', icon: '📋' },
  { value: '6', label: 'Lĩnh vực', icon: '🏛️' },
  { value: '100%', label: 'Trực tuyến', icon: '💻' },
  { value: '24/7', label: 'Hỗ trợ AI', icon: '🤖' },
]

export function StatsStrip() {
  return (
    <section className="bg-primary-dark py-6" id="stats-strip">
      <div className="container-main">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center text-white">
              <p className="text-2xl md:text-3xl font-bold font-heading">{s.value}</p>
              <p className="text-xs md:text-sm text-white/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
