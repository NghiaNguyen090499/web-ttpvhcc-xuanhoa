'use client'

/**
 * @nhom        : Pages / FAQ (Client)
 * @chucnang    : Client component trang FAQ — accordion, lọc danh mục, tìm kiếm
 * @lienquan    : src/app/(public)/faq/page.tsx
 * @alias       : faq-client, accordion-faq
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronDown, Search, HelpCircle, MessageCircle } from 'lucide-react'

interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  sortOrder: number
  viewCount: number
}

interface FaqPageClientProps {
  faqs: FaqItem[]
}

export default function FaqPageClient({ faqs }: FaqPageClientProps) {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  // Danh mục có sẵn
  const categories = useMemo(() => [...new Set(faqs.map(f => f.category))], [faqs])

  // Lọc
  const filtered = useMemo(() => {
    return faqs.filter(f => {
      const matchSearch = !search
        || f.question.toLowerCase().includes(search.toLowerCase())
        || f.answer.toLowerCase().includes(search.toLowerCase())
      const matchCat = !filterCat || f.category === filterCat
      return matchSearch && matchCat
    }).sort((a, b) => a.sortOrder - b.sortOrder)
  }, [faqs, search, filterCat])

  // Toggle accordion
  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id)

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/90">FAQ</span>
          </nav>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Câu hỏi thường gặp
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Giải đáp nhanh các thắc mắc phổ biến về thủ tục hành chính — {faqs.length} câu hỏi
          </p>
        </div>
      </section>

      {/* Nội dung */}
      <section className="py-10 md:py-14">
        <div className="container-main max-w-3xl">
          {/* Tìm kiếm + Lọc */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm câu hỏi..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary bg-white"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Accordion FAQ */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-sm text-text-muted">
                Không tìm thấy câu hỏi {search && `với từ khóa "${search}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq) => {
                const isOpen = openId === faq.id
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border bg-white overflow-hidden transition-all ${
                      isOpen ? 'border-primary/30 shadow-md' : 'border-border hover:border-gray-300'
                    }`}
                  >
                    {/* Header câu hỏi */}
                    <button
                      onClick={() => toggle(faq.id)}
                      className="w-full flex items-start gap-3 px-5 py-4 text-left group"
                    >
                      <span className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-primary text-white' : 'bg-cream text-primary'
                      }`}>
                        <HelpCircle className="w-3.5 h-3.5" />
                      </span>
                      <span className={`flex-1 text-sm font-semibold leading-relaxed transition-colors ${
                        isOpen ? 'text-primary' : 'text-text-primary group-hover:text-primary'
                      }`}>
                        {faq.question}
                      </span>
                      <ChevronDown className={`w-4 h-4 mt-1 shrink-0 text-gray-400 transition-transform ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`} />
                    </button>

                    {/* Nội dung trả lời (accordion) */}
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <div className="pl-9 border-l-2 border-primary/20">
                          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {faq.answer}
                          </p>
                          <span className="inline-block mt-3 text-[10px] px-2 py-0.5 rounded-full bg-cream text-text-muted font-medium">
                            📂 {faq.category}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* CTA Chatbot */}
          <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-base font-bold text-text-primary">Không tìm thấy câu trả lời?</h3>
            <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
              Hãy hỏi trợ lý AI 24/7 bằng nút chat ở góc phải màn hình, hoặc liên hệ TTPVHCC trực tiếp.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Link
                href="/lien-he"
                className="text-xs font-semibold px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark btn-transition"
              >
                📍 Liên hệ TTPVHCC
              </Link>
              <a
                href="https://www.facebook.com/phuongxuanhoatphochiminh"
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold px-4 py-2 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary/5 btn-transition"
              >
                📱 Facebook
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
