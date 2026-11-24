'use client'

/**
 * @nhom        : Components / Public
 * @chucnang    : Form nhập và danh sách bình luận dưới bài viết tin tức
 * @lienquan    : src/app/api/articles/[articleId]/comments/route.ts
 * @alias       : article-comments, binh-luan-bai-viet
 */

import { FormEvent, useMemo, useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'

interface ArticleComment {
  id: string
  articleId: string
  authorName: string
  content: string
  createdAt: string
}

interface ArticleCommentsProps {
  articleId: string
  commentsEnabled: boolean
  initialComments: ArticleComment[]
}

function formatCommentDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export default function ArticleComments({
  articleId,
  commentsEnabled,
  initialComments,
}: ArticleCommentsProps) {
  const [comments, setComments] = useState(initialComments)
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const commentCountLabel = useMemo(() => {
    if (comments.length === 0) return 'Chưa có bình luận'
    return `${comments.length} bình luận`
  }, [comments.length])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!commentsEnabled || submitting) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(articleId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, content, website }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Không thể gửi bình luận')
        return
      }

      if (data.comment) {
        setComments((current) => [data.comment, ...current])
        setContent('')
      }
    } catch {
      setError('Không thể gửi bình luận, vui lòng thử lại sau')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-text-primary">
              Bình luận
            </h2>
            <p className="text-xs text-text-muted">{commentCountLabel}</p>
          </div>
        </div>

        {!commentsEnabled && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
            Đã tắt
          </span>
        )}
      </div>

      {commentsEnabled ? (
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="text"
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            maxLength={80}
            required
            className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Tên hiển thị"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={1000}
            required
            rows={4}
            className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Nội dung bình luận"
          />
          <input
            type="text"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || authorName.trim().length < 2 || content.trim().length < 3}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-text-secondary">
          Bình luận đã tắt cho bài viết này.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <p className="rounded-xl bg-surface px-4 py-3 text-sm text-text-muted">
            Chưa có bình luận nào.
          </p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-xl border border-border bg-surface px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-text-primary">{comment.authorName}</h3>
                <time className="text-xs text-text-muted" dateTime={comment.createdAt}>
                  {formatCommentDate(comment.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {comment.content}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
