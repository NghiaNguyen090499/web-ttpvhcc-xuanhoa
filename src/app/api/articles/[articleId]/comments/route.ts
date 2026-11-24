/**
 * @nhom        : API Routes / Public
 * @chucnang    : Đọc và gửi bình luận công khai dưới bài viết tin tức
 * @lienquan    : prisma/schema.prisma, src/app/(public)/tin-tuc/[slug]/ArticleComments.tsx
 * @alias       : article-comments-api, binh-luan-tin-tuc
 */

import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { prisma } from '@/lib/db'
import { getClientIp } from '@/lib/login-rate-limit'
import { consumeFormQuota, countLinks, isDuplicateSubmission } from '@/lib/form-rate-limit'

export const runtime = 'nodejs'

const NEWS_FILE = join(process.cwd(), 'data', 'news.json')
const COMMENTS_FILE = join(process.cwd(), 'data', 'article-comments.json')

// Chống spam: 5 bình luận/10 phút, 30 bình luận/ngày cho mỗi IP
const COMMENT_RATE_RULES = [
  { max: 5, windowMs: 10 * 60 * 1000 },
  { max: 30, windowMs: 24 * 60 * 60 * 1000 },
]

type RouteContext = { params: Promise<{ articleId: string }> }

interface StaticNewsItem {
  id: string
  commentsEnabled?: boolean
}

interface StoredArticleComment {
  id: string
  articleId: string
  authorName: string
  content: string
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

function normalizeName(value: unknown) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeComment(value: unknown) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function publicComment(comment: StoredArticleComment) {
  return {
    id: comment.id,
    articleId: comment.articleId,
    authorName: comment.authorName,
    content: comment.content,
    createdAt: comment.createdAt,
  }
}

function readNews(): StaticNewsItem[] {
  try {
    const raw = readFileSync(NEWS_FILE, 'utf-8')
    return JSON.parse(raw) as StaticNewsItem[]
  } catch {
    return []
  }
}

function readComments(): StoredArticleComment[] {
  try {
    const raw = readFileSync(COMMENTS_FILE, 'utf-8')
    return JSON.parse(raw) as StoredArticleComment[]
  } catch {
    return []
  }
}

function writeComments(comments: StoredArticleComment[]) {
  mkdirSync(dirname(COMMENTS_FILE), { recursive: true })
  writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8')
}

function getStaticArticle(articleId: string) {
  return readNews().find((article) => article.id === articleId)
}

function getStaticComments(articleId: string) {
  return readComments()
    .filter((comment) => comment.articleId === articleId && comment.isVisible !== false)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50)
    .map(publicComment)
}

async function readCommentsFromDatabase(articleId: string) {
  if (!prisma) return null

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { status: true, commentsEnabled: true },
  })

  if (!article || article.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
  }

  if (!article.commentsEnabled) {
    return NextResponse.json({ commentsEnabled: false, comments: [] })
  }

  const comments = await prisma.articleComment.findMany({
    where: { articleId, isVisible: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({
    commentsEnabled: true,
    comments: comments.map((comment) => ({
      id: comment.id,
      articleId: comment.articleId,
      authorName: comment.authorName,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
    })),
  })
}

async function createCommentInDatabase(articleId: string, authorName: string, content: string) {
  if (!prisma) return null

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { status: true, commentsEnabled: true },
  })

  if (!article || article.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
  }

  if (!article.commentsEnabled) {
    return NextResponse.json({ error: 'Bình luận đã tắt cho bài viết này' }, { status: 403 })
  }

  const comment = await prisma.articleComment.create({
    data: { articleId, authorName, content },
  })

  return NextResponse.json({
    success: true,
    comment: {
      id: comment.id,
      articleId: comment.articleId,
      authorName: comment.authorName,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
    },
  })
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { articleId } = await context.params

  if (!articleId) {
    return NextResponse.json({ error: 'Thiếu ID bài viết' }, { status: 400 })
  }

  try {
    const databaseResponse = await readCommentsFromDatabase(articleId)
    if (databaseResponse) return databaseResponse
  } catch (err) {
    console.warn('[ArticleComments] Fallback JSON khi đọc bình luận:', err)
  }

  const article = getStaticArticle(articleId)
  if (!article) {
    return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
  }

  const commentsEnabled = article.commentsEnabled !== false
  return NextResponse.json({
    commentsEnabled,
    comments: commentsEnabled ? getStaticComments(articleId) : [],
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { articleId } = await context.params

    if (!articleId) {
      return NextResponse.json({ error: 'Thiếu ID bài viết' }, { status: 400 })
    }

    const body = await request.json()

    if (String(body.website || '').trim()) {
      return NextResponse.json({ success: true })
    }

    const authorName = normalizeName(body.authorName)
    const content = normalizeComment(body.content)

    if (authorName.length < 2 || authorName.length > 80) {
      return NextResponse.json({ error: 'Tên hiển thị phải từ 2 đến 80 ký tự' }, { status: 400 })
    }

    if (content.length < 3 || content.length > 1000) {
      return NextResponse.json({ error: 'Bình luận phải từ 3 đến 1000 ký tự' }, { status: 400 })
    }

    if (countLinks(content) > 1) {
      return NextResponse.json({ error: 'Bình luận không được chứa nhiều đường link' }, { status: 400 })
    }

    const retryAfter = consumeFormQuota('comment', getClientIp(request.headers), COMMENT_RATE_RULES)
    if (retryAfter > 0) {
      return NextResponse.json(
        { error: `Bạn bình luận quá nhanh. Vui lòng thử lại sau ${Math.ceil(retryAfter / 60)} phút.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    if (isDuplicateSubmission(`comment:${articleId}`, content, 24 * 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Bình luận này đã được gửi trước đó' }, { status: 409 })
    }

    try {
      const databaseResponse = await createCommentInDatabase(articleId, authorName, content)
      if (databaseResponse) return databaseResponse
    } catch (err) {
      console.warn('[ArticleComments] Fallback JSON khi lưu bình luận:', err)
    }

    const article = getStaticArticle(articleId)
    if (!article) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
    }

    if (article.commentsEnabled === false) {
      return NextResponse.json({ error: 'Bình luận đã tắt cho bài viết này' }, { status: 403 })
    }

    const now = new Date().toISOString()
    const comment: StoredArticleComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      articleId,
      authorName,
      content,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    }
    const comments = [comment, ...readComments()]
    writeComments(comments)

    return NextResponse.json({ success: true, comment: publicComment(comment) })
  } catch (err) {
    console.error('[ArticleComments] Lỗi xử lý bình luận:', err)
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại sau' }, { status: 500 })
  }
}
