import { articleHtmlToPlainText } from '@/lib/html'
import {
  getPortalFaqData,
  getPortalNewsData,
  getPortalNiemYetData,
  getPortalProcedureLinksData,
  getPortalProceduresData,
  getPortalVanBanData,
} from '@/lib/portal-db'

export type SiteSearchType = 'procedure' | 'news' | 'faq' | 'document' | 'notice'

export interface SiteSearchResult {
  id: string
  title: string
  description: string
  href: string
  type: SiteSearchType
  label: string
  date?: string
  external?: boolean
}

interface SearchCandidate extends SiteSearchResult {
  haystack: string
}

const TYPE_ORDER: Record<SiteSearchType, number> = {
  procedure: 0,
  news: 1,
  faq: 2,
  document: 3,
  notice: 4,
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function compactText(value: string, maxLength = 220) {
  const text = value.replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

function scoreCandidate(candidate: SearchCandidate, normalizedQuery: string, tokens: string[]) {
  const normalizedTitle = normalizeText(candidate.title)
  const normalizedDescription = normalizeText(candidate.description)
  const normalizedHaystack = normalizeText(candidate.haystack)

  let score = 0
  if (normalizedTitle === normalizedQuery) score += 120
  if (normalizedTitle.includes(normalizedQuery)) score += 80
  if (normalizedDescription.includes(normalizedQuery)) score += 35
  if (normalizedHaystack.includes(normalizedQuery)) score += 25

  for (const token of tokens) {
    if (normalizedTitle.includes(token)) score += 15
    if (normalizedDescription.includes(token)) score += 6
    if (normalizedHaystack.includes(token)) score += 3
  }

  return score
}

export async function searchSite(query: string) {
  const keyword = query.trim()
  const normalizedQuery = normalizeText(keyword)
  const tokens = normalizedQuery.split(/\s+/).filter((token) => token.length >= 2)
  if (!normalizedQuery || tokens.length === 0) return []

  const [procedures, procedureLinks, news, faqs, vanBan, notices] = await Promise.all([
    getPortalProceduresData(),
    getPortalProcedureLinksData(),
    getPortalNewsData(),
    getPortalFaqData(),
    getPortalVanBanData(),
    getPortalNiemYetData(),
  ])

  const candidates: SearchCandidate[] = []

  procedureLinks.groups.forEach((group) => {
    group.items.forEach((item) => {
      candidates.push({
        id: `procedure-link-${item.id}`,
        title: item.name,
        description: compactText([
          item.code ? `Mã thủ tục: ${item.code}` : '',
          `Lĩnh vực: ${group.name}`,
          'Mở trên Cổng Dịch vụ công Quốc gia.',
        ].filter(Boolean).join(' · ')),
        href: item.url,
        type: 'procedure',
        label: 'Thủ tục trực tuyến',
        external: true,
        haystack: `${item.name} ${item.code || ''} ${group.name}`,
      })
    })
  })

  procedures.categories.forEach((category) => {
    candidates.push({
      id: `procedure-category-${category.slug}`,
      title: category.name,
      description: compactText(category.description || `${category.subCategories.length} nhóm thủ tục`),
      href: `/thu-tuc/${category.slug}`,
      type: 'procedure',
      label: 'Lĩnh vực thủ tục',
      haystack: `${category.name} ${category.description} ${category.subCategories.join(' ')}`,
    })

    category.subCategories.forEach((name, index) => {
      candidates.push({
        id: `procedure-sub-${category.slug}-${index}`,
        title: name,
        description: compactText(`Thuộc lĩnh vực: ${category.name}`),
        href: `/thu-tuc/${category.slug}`,
        type: 'procedure',
        label: 'Nhóm thủ tục',
        haystack: `${name} ${category.name} ${category.description}`,
      })
    })
  })

  news.forEach((item) => {
    candidates.push({
      id: `news-${item.id}`,
      title: item.title,
      description: compactText(item.excerpt || articleHtmlToPlainText(item.content)),
      href: `/tin-tuc/${item.slug}`,
      type: 'news',
      label: item.tag || 'Tin tức',
      date: item.date,
      haystack: `${item.title} ${item.excerpt} ${articleHtmlToPlainText(item.content)} ${item.tag} ${item.source}`,
    })
  })

  faqs.forEach((item: { id: string; question: string; answer: string; category?: string }) => {
    candidates.push({
      id: `faq-${item.id}`,
      title: item.question,
      description: compactText(articleHtmlToPlainText(item.answer)),
      href: '/faq',
      type: 'faq',
      label: item.category || 'FAQ',
      haystack: `${item.question} ${articleHtmlToPlainText(item.answer)} ${item.category || ''}`,
    })
  })

  vanBan.forEach((item) => {
    candidates.push({
      id: `document-${item.id}`,
      title: item.trichYeu,
      description: compactText(`${item.soKyHieu} · ${item.loai} · ${item.linhVuc} · ${item.coQuanBanHanh}`),
      href: item.fileUrl,
      type: 'document',
      label: item.loai || 'Văn bản',
      date: item.ngayBanHanh,
      external: item.fileUrl.startsWith('http'),
      haystack: `${item.soKyHieu} ${item.loai} ${item.trichYeu} ${item.linhVuc} ${item.coQuanBanHanh} ${item.nguoiKy}`,
    })
  })

  notices.forEach((item) => {
    candidates.push({
      id: `notice-${item.id}`,
      title: item.title,
      description: compactText([item.category, item.description].filter(Boolean).join(' · ')),
      href: item.fileUrl,
      type: 'notice',
      label: item.category || 'Niêm yết',
      date: item.publishedAt,
      external: item.fileUrl.startsWith('http'),
      haystack: `${item.title} ${item.category || ''} ${item.description || ''}`,
    })
  })

  return candidates
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(candidate, normalizedQuery, tokens),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (TYPE_ORDER[a.type] !== TYPE_ORDER[b.type]) return TYPE_ORDER[a.type] - TYPE_ORDER[b.type]
      return a.title.localeCompare(b.title, 'vi')
    })
    .slice(0, 80)
    .map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      description: candidate.description,
      href: candidate.href,
      type: candidate.type,
      label: candidate.label,
      date: candidate.date,
      external: candidate.external,
    }))
}
