/**
 * @nhom        : Components / Chatbot
 * @chucnang    : Chat Widget — floating button + hội thoại AI hỗ trợ thủ tục HC
 * @lienquan    : src/app/api/chat/route.ts, src/lib/chatbot.ts
 * @alias       : chat-widget, chatbot-ui
 *
 * Client component — streaming response từ API /api/chat
 * Câu trả lời chỉ mang tính tham khảo
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// Câu hỏi gợi ý nhanh
const SUGGESTIONS = [
  'Làm giấy khai sinh cần gì?',
  'Giờ làm việc?',
  'Chứng thực bản sao',
  'Tải biểu mẫu',
  'Cấp phép xây dựng',
]

interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export default function ChatWidget() {
  // Trạng thái mở/đóng
  const [isOpen, setIsOpen] = useState(false)
  // Danh sách tin nhắn
  const [messages, setMessages] = useState<ChatMessage[]>([])
  // Input hiện tại
  const [input, setInput] = useState('')
  // Đang chờ phản hồi
  const [isLoading, setIsLoading] = useState(false)
  // Tin nhắn đang stream
  const [streamText, setStreamText] = useState('')

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  // Focus input khi mở
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  /**
   * @chucnang    : Gửi tin nhắn đến API và xử lý streaming response
   * @input       : text (string) — nội dung tin nhắn
   */
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamText('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-10), // Gửi 10 tin gần nhất
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Lỗi kết nối')
      }

      // Đọc streaming response
      const reader = res.body?.getReader()
      if (!reader) throw new Error('Không thể đọc response')

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                fullText += parsed.text
                setStreamText(fullText)
              }
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch {
              // Bỏ qua parse errors
            }
          }
        }
      }

      // Hoàn tất — thêm vào messages
      if (fullText) {
        setMessages((prev) => [...prev, { role: 'model', content: fullText }])
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể kết nối. Vui lòng thử lại.'
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `⚠️ ${errorMsg}\n\n📍 Liên hệ TTPVHCC: 99 Trần Quốc Thảo, P. Xuân Hòa, TP.HCM\n🕐 T2–T6: 07:30–17:00 | T7: 07:30–11:30`,
        },
      ])
    } finally {
      setIsLoading(false)
      setStreamText('')
    }
  }, [isLoading, messages])

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-xl hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot hỗ trợ'}
        id="chatbot-toggle"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>

      {/* Dot nhấp nháy khi chưa mở */}
      {!isOpen && messages.length === 0 && (
        <span className="fixed bottom-[70px] right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium shadow-lg animate-bounce pointer-events-none">
          💬 Cần hỗ trợ?
        </span>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          style={{ height: 'min(520px, calc(100vh - 8rem))' }}
        >
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Trợ lý TTPVHCC</p>
              <p className="text-[10px] text-white/70">Phường Xuân Hòa • Hỗ trợ tham khảo</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {/* Welcome */}
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🏛️</span>
                </div>
                <p className="text-sm font-semibold text-text-primary mb-1">Xin chào!</p>
                <p className="text-xs text-text-muted mb-4 leading-relaxed">
                  Tôi là trợ lý AI của TTPVHCC Phường Xuân Hòa.<br />
                  Hãy hỏi về thủ tục hành chính, biểu mẫu, giờ làm việc...
                </p>
                <p className="text-[10px] text-text-muted/70 italic mb-4">
                  ⚠️ Thông tin chỉ mang tính tham khảo
                </p>

                {/* Gợi ý nhanh */}
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="px-3 py-1.5 rounded-full bg-white border border-border text-[11px] font-medium text-text-primary hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Danh sách tin nhắn */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-white border border-border text-text-primary rounded-bl-md shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Đang stream */}
            {isLoading && streamText && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white border border-border text-text-primary text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm">
                  {streamText}
                  <span className="inline-block w-1.5 h-4 bg-primary/60 ml-0.5 animate-pulse rounded-sm" />
                </div>
              </div>
            )}

            {/* Đang loading (chưa có stream) */}
            {isLoading && !streamText && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-border shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Disclaimer */}
          <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-100">
            <p className="text-[9px] text-amber-700 text-center">
              ⚠️ Thông tin tham khảo — Liên hệ TTPVHCC để được tư vấn chính thức
            </p>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-3 py-3 border-t border-border bg-white flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              maxLength={500}
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-border text-sm text-text-primary outline-none focus:border-primary/40 focus:bg-white transition-colors placeholder:text-text-muted disabled:opacity-50"
              id="chatbot-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
              aria-label="Gửi tin nhắn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
