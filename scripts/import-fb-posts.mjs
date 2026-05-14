/**
 * Script import bài Facebook mới vào news.json
 * Chạy: node scripts/import-fb-posts.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()
const fbPosts = JSON.parse(readFileSync(join(ROOT, 'facebook-xuan-hoa-latest/posts.json'), 'utf-8'))
const existingNews = JSON.parse(readFileSync(join(ROOT, 'data/news.json'), 'utf-8'))

// Phân loại tag từ nội dung
function detectTag(text) {
  const t = text.toLowerCase()
  if (t.includes('kỷ niệm') || t.includes('văn hóa') || t.includes('hồ chí minh')) return 'Văn hóa'
  if (t.includes('tuyển') || t.includes('lao động') || t.includes('việc làm')) return 'Lao động'
  if (t.includes('đoàn thanh niên') || t.includes('đội') || t.includes('hội')) return 'Đoàn thanh niên'
  if (t.includes('quốc hội') || t.includes('cử tri') || t.includes('tiếp xúc')) return 'Đối ngoại'
  if (t.includes('công an') || t.includes('định danh') || t.includes('căn cước')) return 'An ninh'
  if (t.includes('bổ nhiệm') || t.includes('quyết định') || t.includes('nhân sự')) return 'Hành chính'
  return 'Hành chính'
}

// Tạo slug từ title
function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

// Rút title từ text (dòng đầu, tối đa 100 ký tự)
function extractTitle(text) {
  let title = text.split('\n')[0].trim()
  // Bỏ "… Xem thêm"
  title = title.replace(/…\s*Xem thêm/g, '').replace(/\+\d+/g, '').trim()
  if (title.length > 120) title = title.slice(0, 117) + '...'
  return title
}

// Rút excerpt
function extractExcerpt(text) {
  const lines = text.split('\n').filter(l => l.trim())
  const full = lines.slice(0, 3).join(' ').replace(/…\s*Xem thêm/g, '').replace(/\+\d+/g, '').trim()
  return full.length > 200 ? full.slice(0, 197) + '...' : full
}

// Ngày đăng ước tính từ createdAtText
function estimateDate(createdAtText) {
  const now = new Date('2026-05-14')
  if (createdAtText.includes('giờ')) {
    return now.toISOString().split('T')[0] // Hôm nay
  }
  const match = createdAtText.match(/(\d+)\s*ngày/)
  if (match) {
    now.setDate(now.getDate() - parseInt(match[1]))
    return now.toISOString().split('T')[0]
  }
  return now.toISOString().split('T')[0]
}

// Tạo danh sách ảnh local
function getLocalImages(index) {
  const dir = join(ROOT, `public/images/news`)
  const prefix = `fb-${String(index).padStart(2, '0')}`
  try {
    const files = readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.jpg')).sort()
    return files.map(f => `/images/news/${f}`)
  } catch { return [] }
}

// Chuyển đổi 10 bài FB
const newPosts = fbPosts.map((post, i) => {
  const idx = i + 1
  const idStr = String(idx).padStart(2, '0')
  const images = getLocalImages(idx)
  const title = extractTitle(post.text)
  const tag = detectTag(post.text)
  const date = estimateDate(post.createdAtText)

  return {
    id: `fb-${idStr}`,
    title,
    slug: slugify(title),
    date,
    tag,
    image: images[0] || `/images/news/fb-${idStr}.jpg`,
    ...(images.length > 1 ? { images } : {}),
    excerpt: extractExcerpt(post.text),
    content: post.text.replace(/\\n/g, '\n').replace(/…\s*Xem thêm/g, '').replace(/\+\d+/g, '').trim(),
    source: 'Facebook — Phường Xuân Hòa'
  }
})

// Gộp: bài mới trước, bài cũ sau
const merged = [...newPosts, ...existingNews]
writeFileSync(join(ROOT, 'data/news.json'), JSON.stringify(merged, null, 2), 'utf-8')

console.log(`✅ Đã import ${newPosts.length} bài mới → data/news.json`)
console.log(`   Tổng: ${merged.length} bài viết`)
newPosts.forEach(p => console.log(`   - [${p.date}] ${p.tag}: ${p.title.slice(0, 60)}...`))
