/**
 * @nhom        : API Routes / Admin
 * @chucnang    : CRUD tin tức — đọc/tạo/sửa/xóa bài viết
 * @lienquan    : data/news.json, src/lib/static-data.ts
 * @alias       : admin-articles-api, crud-tin-tuc
 *
 * Hiện tại đọc/ghi từ file JSON (dev mode).
 * Khi kết nối DB sẽ chuyển sang Prisma queries.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const NEWS_FILE = join(process.cwd(), 'data', 'news.json')

// Đọc dữ liệu từ JSON
function readNews() {
  try {
    const raw = readFileSync(NEWS_FILE, 'utf-8')
    return JSON.parse(raw) as Array<Record<string, unknown>>
  } catch {
    return []
  }
}

// Ghi dữ liệu ra JSON
function writeNews(data: Array<Record<string, unknown>>) {
  writeFileSync(NEWS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

/** GET — Lấy danh sách bài viết */
export async function GET() {
  const articles = readNews()
  return NextResponse.json({ articles, total: articles.length })
}

/** POST — Tạo bài viết mới */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ error: 'Tiêu đề và nội dung là bắt buộc' }, { status: 400 })
    }

    const articles = readNews()
    const newId = `post-${String(articles.length + 1).padStart(2, '0')}`

    const newArticle = {
      id: newId,
      title: body.title.trim(),
      slug: body.slug || newId,
      date: body.date || new Date().toISOString().split('T')[0],
      tag: body.tag || 'Hành chính',
      image: body.image || '/images/news/post-01.jpg',
      excerpt: body.excerpt?.trim() || body.content.trim().slice(0, 150) + '...',
      content: body.content.trim(),
      source: body.source || 'UBND Phường Xuân Hòa',
    }

    articles.unshift(newArticle)
    writeNews(articles)

    return NextResponse.json({ success: true, article: newArticle })
  } catch (err) {
    console.error('[Admin/Articles] Lỗi tạo:', err)
    return NextResponse.json({ error: 'Lỗi tạo bài viết' }, { status: 500 })
  }
}

/** PUT — Cập nhật bài viết */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID bài viết' }, { status: 400 })
    }

    const articles = readNews()
    const index = articles.findIndex((a) => a.id === body.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
    }

    // Cập nhật các trường
    articles[index] = {
      ...articles[index],
      title: body.title?.trim() || articles[index].title,
      slug: body.slug || articles[index].slug,
      date: body.date || articles[index].date,
      tag: body.tag || articles[index].tag,
      image: body.image || articles[index].image,
      excerpt: body.excerpt?.trim() || articles[index].excerpt,
      content: body.content?.trim() || articles[index].content,
      source: body.source || articles[index].source,
    }

    writeNews(articles)

    return NextResponse.json({ success: true, article: articles[index] })
  } catch (err) {
    console.error('[Admin/Articles] Lỗi cập nhật:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật bài viết' }, { status: 500 })
  }
}

/** DELETE — Xóa bài viết */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID bài viết' }, { status: 400 })
    }

    const articles = readNews()
    const filtered = articles.filter((a) => a.id !== body.id)

    if (filtered.length === articles.length) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
    }

    writeNews(filtered)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin/Articles] Lỗi xóa:', err)
    return NextResponse.json({ error: 'Lỗi xóa bài viết' }, { status: 500 })
  }
}
