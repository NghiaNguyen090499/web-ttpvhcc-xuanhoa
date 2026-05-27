/**
 * @nhom        : Pages / Giới thiệu
 * @chucnang    : Trang giới thiệu — mission cards, chức năng nhiệm vụ, cơ cấu tổ chức từ admin
 * @lienquan    : data/organization.json, src/app/admin/gioi-thieu/page.tsx, src/lib/static-data.ts
 * @alias       : about, gioi-thieu, co-cau-to-chuc
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getOrganizationData, type OrganizationNode } from '@/lib/static-data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Giới thiệu',
  description: 'Giới thiệu Trung tâm Phục vụ Hành chính Công phường Xuân Hòa, TP.HCM — sứ mệnh, chức năng và cơ cấu tổ chức.',
}

const MISSION = [
  { icon: '🎯', title: 'Sứ mệnh', desc: 'Phục vụ nhân dân, giải quyết thủ tục hành chính nhanh chóng, minh bạch, hiệu quả.' },
  { icon: '🛡️', title: 'Cam kết', desc: 'Đảm bảo đúng thời hạn, đúng quy trình, công khai và thuận tiện cho người dân.' },
  { icon: '👥', title: 'Phục vụ', desc: 'Hơn 50,000 lượt giao dịch mỗi năm, phục vụ toàn bộ cư dân phường Xuân Hòa.' },
  { icon: '🏆', title: 'Chất lượng', desc: 'Đạt tiêu chuẩn ISO 9001:2015 trong quản lý chất lượng dịch vụ hành chính công.' },
]

const LINE_COLOR = '#355b84'
const ORG_CARD_WIDTH = 240
const ORG_COLUMN_WIDTH = 272

function getTypeLabel(type: OrganizationNode['type']) {
  if (type === 'chairman') return 'Giám đốc'
  if (type === 'vice') return 'Phó Giám đốc'
  return 'Cán bộ chuyên môn'
}

function getNodeName(node: OrganizationNode) {
  return node.name?.trim() || node.title
}

function getNodeRole(node: OrganizationNode) {
  return node.role?.trim() || (node.name ? node.title : getTypeLabel(node.type))
}

function uniqueNodes(nodes: OrganizationNode[]) {
  return Array.from(new Map(nodes.map((node) => [node.id, node])).values())
}

function buildOrgLevels(nodes: OrganizationNode[]): OrganizationNode[][] {
  const ordered = [...nodes].sort((a, b) => {
    const rank = { chairman: 1, vice: 2, department: 3 }
    return rank[a.type] - rank[b.type] || a.order - b.order || a.title.localeCompare(b.title)
  })

  const director = ordered.find((node) => node.type === 'chairman') || ordered[0]
  const deputy = ordered.find((node) => node.parentId === director?.id && node.type === 'vice')
    || ordered.find((node) => node.type === 'vice' && node.id !== director?.id)
    || ordered.find((node) => node.parentId === director?.id)

  const assigned = new Set([director?.id, deputy?.id].filter(Boolean))
  const levelThreeFromDeputy = deputy
    ? ordered.filter((node) => node.parentId === deputy.id && !assigned.has(node.id))
    : []
  const levelThreeFill = ordered.filter((node) => !assigned.has(node.id) && !levelThreeFromDeputy.some((item) => item.id === node.id))
  const levelThree = uniqueNodes([...levelThreeFromDeputy, ...levelThreeFill]).slice(0, 4)
  levelThree.forEach((node) => assigned.add(node.id))

  const levelThreeIds = new Set(levelThree.map((node) => node.id))
  const levelFourFromColumns = ordered.filter((node) => node.parentId && levelThreeIds.has(node.parentId) && !assigned.has(node.id))
  const levelFourFill = ordered.filter((node) => !assigned.has(node.id) && !levelFourFromColumns.some((item) => item.id === node.id))
  const levelFour = uniqueNodes([...levelFourFromColumns, ...levelFourFill]).slice(0, 4)

  return [[director], [deputy], levelThree, levelFour]
    .map((level) => level.filter((node): node is OrganizationNode => Boolean(node)))
    .filter((level) => level.length > 0)
}

function LandscapeAvatar({ imageUrl }: { imageUrl?: string }) {
  if (imageUrl) {
    return (
      <div
        className="absolute top-0 z-10 h-[74px] w-[74px] overflow-hidden rounded-full border-[5px] border-white bg-[#d8f1ff] bg-cover bg-center shadow-[0_8px_18px_rgba(8,61,107,0.2)]"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    )
  }

  return (
    <div className="absolute top-0 z-10 flex h-[74px] w-[74px] items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-[#d8f1ff] shadow-[0_8px_18px_rgba(8,61,107,0.2)]">
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
        <rect width="120" height="120" fill="#d8f1ff" />
        <circle cx="93" cy="24" r="12" fill="#f7d66b" opacity="0.85" />
        <path d="M22 37c2.6-8 15.5-9.2 19.8-2.4 5.6-3.2 14.2.1 15.4 7.4 5.7.4 9.6 4.3 9.6 9.3H16.4c-1.8-6.4 1.4-11.6 5.6-14.3Z" fill="#fff" opacity="0.95" />
        <path d="M74 45c2.2-6.2 11.8-7.2 15.2-1.8 4.5-2.2 10.8.8 11.7 6.3 4.4.5 7.6 3.3 7.6 7.1H67.9c-1.4-4.8 1.1-8.7 6.1-11.6Z" fill="#fff" opacity="0.9" />
        <path d="M-8 92c25-26 49-32 77-12 20-15 38-18 61-3v43H-8V92Z" fill="#4aa85d" />
        <path d="M-10 102c25-18 47-19 72-2 20-13 41-15 68 3v17H-10v-18Z" fill="#2f8d4b" />
      </svg>
    </div>
  )
}

function PersonNode({ node }: { node: OrganizationNode }) {
  const field = node.field?.trim()
  const phone = node.phone?.trim()

  return (
    <article className="relative flex w-[240px] justify-center pt-10 text-center">
      <LandscapeAvatar imageUrl={node.imageUrl} />
      <div className="min-h-[148px] w-full rounded-[22px] bg-[#083d6b] px-5 pb-4 pt-11 text-white shadow-[0_14px_26px_rgba(8,61,107,0.2)]">
        <h3 className="whitespace-nowrap text-[13px] font-extrabold uppercase leading-tight tracking-wide">
          {getNodeName(node)}
        </h3>
        <p className="mt-1.5 text-[12px] font-bold leading-snug text-white/95">
          {getNodeRole(node)}
        </p>
        {phone && (
          <p className="mt-1.5 text-[11px] font-semibold leading-snug text-white/90">
            ĐT: {phone}
          </p>
        )}
        {field && (
          <p className="mt-1.5 line-clamp-3 text-[11px] font-medium leading-snug text-white/80">
            {field}
          </p>
        )}
      </div>
    </article>
  )
}

function SplitConnector({ count }: { count: number }) {
  if (count <= 0) return null
  if (count === 1) {
    return (
      <div className="mx-auto h-14 w-0.5" style={{ backgroundColor: LINE_COLOR }} aria-hidden="true" />
    )
  }

  const edge = `${50 / count}%`
  const points = Array.from({ length: count }, (_, index) => `${((index + 0.5) / count) * 100}%`)

  return (
    <div className="relative mx-auto h-16 w-full" aria-hidden="true">
      <span className="absolute left-1/2 top-0 h-8 w-0.5 -translate-x-1/2" style={{ backgroundColor: LINE_COLOR }} />
      <span className="absolute top-8 h-0.5" style={{ left: edge, right: edge, backgroundColor: LINE_COLOR }} />
      {points.map((left) => (
        <span
          key={left}
          className="absolute top-8 h-8 w-0.5 -translate-x-1/2"
          style={{ left, backgroundColor: LINE_COLOR }}
        />
      ))}
    </div>
  )
}

function ColumnConnector({ count }: { count: number }) {
  if (count <= 0) return null
  const points = Array.from({ length: count }, (_, index) => `${((index + 0.5) / count) * 100}%`)

  return (
    <div className="relative mx-auto h-16 w-full" aria-hidden="true">
      {points.map((left) => (
        <span
          key={left}
          className="absolute top-0 h-full w-0.5 -translate-x-1/2"
          style={{ left, backgroundColor: LINE_COLOR }}
        />
      ))}
    </div>
  )
}

function OrgLevel({ nodes }: { nodes: OrganizationNode[] }) {
  const width = Math.max(ORG_CARD_WIDTH, nodes.length * ORG_COLUMN_WIDTH)

  return (
    <div
      className="mx-auto grid justify-items-center gap-8"
      style={{ width, gridTemplateColumns: `repeat(${nodes.length}, ${ORG_CARD_WIDTH}px)` }}
    >
      {nodes.map((node) => (
        <PersonNode key={node.id} node={node} />
      ))}
    </div>
  )
}

function OrganizationChart({ nodes }: { nodes: OrganizationNode[] }) {
  const levels = buildOrgLevels(nodes)
  const maxWidth = Math.max(640, ...levels.map((level) => level.length * ORG_COLUMN_WIDTH))

  if (levels.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-text-muted">
        Chưa có dữ liệu cơ cấu tổ chức. Vui lòng cập nhật trong trang quản trị.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#d8dce2] bg-[#f5f5f5] shadow-[0_18px_46px_rgba(15,35,61,0.1)]">
      <header className="border-b border-[#d7dbe2] bg-gradient-to-b from-white via-[#f6f7f9] to-[#e9edf2] px-6 py-5 text-center">
        <h2
          className="mx-auto max-w-4xl text-[19px] font-bold uppercase leading-tight tracking-wide text-black md:text-[24px]"
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          Cơ cấu tổ chức Trung tâm Phục vụ Hành chính Công Phường Xuân Hòa
        </h2>
      </header>

      <div className="overflow-x-auto">
        <div
          className="bg-[#f5f5f5] bg-[radial-gradient(#d8dee8_1px,transparent_1px)] [background-size:18px_18px] px-8 py-10"
          style={{ minWidth: maxWidth + 80 }}
        >
          {levels.map((level, index) => (
            <div key={index} className="mx-auto" style={{ width: Math.max(ORG_CARD_WIDTH, level.length * ORG_COLUMN_WIDTH) }}>
              {index === 1 && <SplitConnector count={1} />}
              {index === 2 && <SplitConnector count={level.length} />}
              {index >= 3 && <ColumnConnector count={level.length} />}
              <OrgLevel nodes={level} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const organization = getOrganizationData()
  const nodes = organization.nodes
    .filter((node) => node.isActive)
    .sort((a, b) => a.order - b.order)

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/90">Giới thiệu</span>
          </nav>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Giới thiệu TTPVHCC
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Trung tâm Phục vụ Hành chính Công phường Xuân Hòa - nơi tiếp nhận, giải quyết thủ tục hành chính và phục vụ người dân.
          </p>
        </div>
      </section>

      <section className="bg-[#f5f5f5] bg-[radial-gradient(#d8dee8_1px,transparent_1px)] [background-size:18px_18px] py-10 md:py-14">
        <div className="container-main space-y-12">
          {/* Mission cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MISSION.map((m) => (
              <div key={m.title} className="rounded-2xl border border-border bg-white p-6 text-center hover:-translate-y-0.5 hover:shadow-lg btn-transition">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-2xl">
                  {m.icon}
                </div>
                <h3 className="mt-4 text-base font-bold text-text-primary">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Chức năng nhiệm vụ */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-primary text-lg">🏛️</div>
              <h2 className="text-xl font-bold text-text-primary font-heading uppercase tracking-wide">Chức năng & Nhiệm vụ</h2>
            </div>
            <div className="mt-6 space-y-4 text-sm leading-7 text-text-secondary">
              <p>
                Trung tâm Phục vụ Hành chính Công (TTPVHCC) phường Xuân Hòa là đơn vị trực thuộc UBND phường,
                có chức năng tiếp nhận và giải quyết thủ tục hành chính cho người dân và doanh nghiệp trên địa bàn.
              </p>
              <p><strong className="text-text-primary">Nhiệm vụ chính:</strong></p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Tiếp nhận, thẩm định và trả kết quả thủ tục hành chính theo cơ chế một cửa, một cửa liên thông</li>
                <li>Hướng dẫn, hỗ trợ người dân và doanh nghiệp trong quá trình thực hiện thủ tục hành chính</li>
                <li>Phối hợp với các cơ quan, đơn vị liên quan trong giải quyết thủ tục hành chính</li>
                <li>Tiếp nhận phản ánh, kiến nghị của người dân về thủ tục hành chính</li>
                <li>Thực hiện chuyển đổi số, ứng dụng công nghệ thông tin trong giải quyết TTHC</li>
              </ul>
            </div>
          </div>

          {/* Cơ cấu tổ chức */}
          <OrganizationChart nodes={nodes} />
        </div>
      </section>
    </>
  )
}
