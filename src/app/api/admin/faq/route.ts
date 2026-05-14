/**
 * @nhom        : API Routes / Admin
 * @chucnang    : CRUD FAQ — đọc/tạo/sửa/xóa câu hỏi thường gặp (cho Chatbot + trang FAQ)
 * @lienquan    : data/faq.json, src/lib/chatbot.ts
 * @alias       : admin-faq-api, crud-faq
 *
 * Hiện tại đọc/ghi từ file JSON (dev mode).
 * Khi kết nối DB sẽ chuyển sang Prisma queries (model Faq).
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const FAQ_FILE = join(process.cwd(), 'data', 'faq.json')

// Kiểu dữ liệu FAQ
interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  sortOrder: number
  isActive: boolean
  viewCount: number
}

// Đọc dữ liệu từ JSON
function readFaqs(): FaqItem[] {
  try {
    const raw = readFileSync(FAQ_FILE, 'utf-8')
    return JSON.parse(raw) as FaqItem[]
  } catch {
    return []
  }
}

// Ghi dữ liệu ra JSON
function writeFaqs(data: FaqItem[]) {
  writeFileSync(FAQ_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

/** GET — Lấy danh sách FAQ */
export async function GET() {
  const faqs = readFaqs()
  return NextResponse.json({ faqs, total: faqs.length })
}

/** POST — Tạo FAQ mới */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.question?.trim() || !body.answer?.trim()) {
      return NextResponse.json(
        { error: 'Câu hỏi và câu trả lời là bắt buộc' },
        { status: 400 }
      )
    }

    const faqs = readFaqs()
    const newFaq: FaqItem = {
      id: `faq-${String(faqs.length + 1).padStart(2, '0')}`,
      question: body.question.trim(),
      answer: body.answer.trim(),
      category: body.category?.trim() || 'Chung',
      sortOrder: body.sortOrder ?? faqs.length + 1,
      isActive: body.isActive ?? true,
      viewCount: 0,
    }

    faqs.push(newFaq)
    writeFaqs(faqs)

    return NextResponse.json({ success: true, faq: newFaq })
  } catch (err) {
    console.error('[Admin/FAQ] Lỗi tạo:', err)
    return NextResponse.json({ error: 'Lỗi tạo câu hỏi' }, { status: 500 })
  }
}

/** PUT — Cập nhật FAQ */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID câu hỏi' }, { status: 400 })
    }

    const faqs = readFaqs()
    const index = faqs.findIndex((f) => f.id === body.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy câu hỏi' }, { status: 404 })
    }

    faqs[index] = {
      ...faqs[index],
      question: body.question?.trim() || faqs[index].question,
      answer: body.answer?.trim() || faqs[index].answer,
      category: body.category?.trim() ?? faqs[index].category,
      sortOrder: body.sortOrder ?? faqs[index].sortOrder,
      isActive: body.isActive ?? faqs[index].isActive,
    }

    writeFaqs(faqs)

    return NextResponse.json({ success: true, faq: faqs[index] })
  } catch (err) {
    console.error('[Admin/FAQ] Lỗi cập nhật:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật câu hỏi' }, { status: 500 })
  }
}

/** DELETE — Xóa FAQ */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID câu hỏi' }, { status: 400 })
    }

    const faqs = readFaqs()
    const filtered = faqs.filter((f) => f.id !== body.id)

    if (filtered.length === faqs.length) {
      return NextResponse.json({ error: 'Không tìm thấy câu hỏi' }, { status: 404 })
    }

    writeFaqs(filtered)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin/FAQ] Lỗi xóa:', err)
    return NextResponse.json({ error: 'Lỗi xóa câu hỏi' }, { status: 500 })
  }
}
