/**
 * @nhom        : API / Chat
 * @chucnang    : POST /api/chat — gửi tin nhắn đến OpenRouter/Gemini, trả về streaming response
 * @input       : { message: string, history?: Array<{role, content}> }
 * @output      : Streaming text (ReadableStream)
 * @lienquan    : src/lib/chatbot.ts
 * @alias       : chat-api, gemini-chat
 *
 * Rate limit: 20 requests/phút/IP
 * Không lưu dữ liệu cá nhân — chỉ truyền context thủ tục
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { buildSystemPrompt } from '@/lib/chatbot'

// Rate limiting — bộ nhớ in-process (đủ cho single instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20 // tin nhắn
const RATE_WINDOW = 60_000 // 1 phút
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_OPENROUTER_MODEL = 'google/gemini-2.5-flash'

type ChatHistoryItem = { role: 'user' | 'model'; content: string }

/**
 * @chucnang    : Kiểm tra rate limit theo IP
 * @input       : ip (string)
 * @output      : boolean — true nếu vượt giới hạn
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT
}

/**
 * @chucnang    : Lấy IP từ request headers
 */
function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
}

function toHeaderAscii(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^\x20-\x7E]/g, '')
}

function toOpenRouterMessages(systemPrompt: string, message: string, history?: ChatHistoryItem[]) {
  return [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-10).map((msg) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ]
}

async function createOpenRouterStream({
  apiKey,
  message,
  history,
  systemPrompt,
}: {
  apiKey: string
  message: string
  history?: ChatHistoryItem[]
  systemPrompt: string
}) {
  const model = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://ttpvhcc-xuanhoa-hcm.gov.vn'
  const siteName = toHeaderAscii(process.env.NEXT_PUBLIC_APP_NAME || 'TTPVHCC Phường Xuân Hòa')

  const response = await fetch(OPENROUTER_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl,
      'X-Title': siteName,
    },
    body: JSON.stringify({
      model,
      messages: toOpenRouterMessages(systemPrompt, message, history),
      stream: true,
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 0.8,
    }),
  })

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '')
    console.error('[Chat API] OpenRouter error:', response.status, detail.slice(0, 500))
    return NextResponse.json(
      { error: 'Không thể kết nối OpenRouter. Vui lòng kiểm tra API key/model.' },
      { status: 502 }
    )
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const reader = response.body.getReader()

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const rawLine of lines) {
            const line = rawLine.trim()
            if (!line.startsWith('data:')) continue

            const data = line.slice(5).trim()
            if (!data) continue

            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
              return
            }

            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>
              error?: { message?: string }
            }

            if (parsed.error?.message) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ error: parsed.error.message })}\n\n`)
              )
              continue
            }

            const text = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content || ''
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        console.error('[Chat API] OpenRouter stream error:', err)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Lỗi kết nối AI. Vui lòng thử lại.' })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim()
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim()
    if (!openRouterApiKey && !geminiApiKey) {
      return NextResponse.json(
        { error: 'Chatbot chưa được cấu hình. Vui lòng liên hệ quản trị viên.' },
        { status: 503 }
      )
    }

    // Rate limit
    const ip = getClientIP(req)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau 1 phút.' },
        { status: 429 }
      )
    }

    // Parse body
    const body = await req.json()
    const { message, history } = body as {
      message: string
      history?: ChatHistoryItem[]
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Tin nhắn không được để trống.' }, { status: 400 })
    }

    // Giới hạn độ dài tin nhắn
    if (message.length > 500) {
      return NextResponse.json({ error: 'Tin nhắn quá dài (tối đa 500 ký tự).' }, { status: 400 })
    }

    const systemPrompt = await buildSystemPrompt()

    if (openRouterApiKey) {
      return createOpenRouterStream({
        apiKey: openRouterApiKey,
        message,
        history,
        systemPrompt,
      })
    }

    // Khởi tạo Gemini
    const ai = new GoogleGenAI({ apiKey: geminiApiKey as string })

    // Build conversation history cho Gemini
    const contents = []

    // Thêm lịch sử hội thoại (giới hạn 10 tin gần nhất)
    if (history?.length) {
      const recentHistory = history.slice(-10)
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })
      }
    }

    // Thêm tin nhắn hiện tại
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    })

    // Gọi Gemini với streaming
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3, // Thấp để trả lời chính xác
        maxOutputTokens: 1024,
        topP: 0.8,
      },
    })

    // Stream response về client
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text || ''
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          console.error('[Chat API] Stream error:', err)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Lỗi kết nối AI. Vui lòng thử lại.' })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[Chat API] Error:', err)
    return NextResponse.json(
      { error: 'Không thể kết nối đến AI. Vui lòng liên hệ TTPVHCC trực tiếp.' },
      { status: 500 }
    )
  }
}
