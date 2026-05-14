/**
 * @nhom        : Lib / Chatbot
 * @chucnang    : System prompt + context builder cho Gemini chatbot
 * @lienquan    : data/procedures.json, data/news.json, data/faq.json, src/lib/static-data.ts
 * @alias       : chatbot-context, system-prompt
 *
 * Xây dựng context đầy đủ từ dữ liệu local để Gemini trả lời chính xác.
 * Câu trả lời chỉ mang tính tham khảo — không thay thế tư vấn chính thức.
 */

import fs from 'fs'
import path from 'path'

/**
 * @chucnang    : Đọc procedures.json và tạo context text
 * @output      : String mô tả đầy đủ các lĩnh vực TTHC
 */
function buildProceduresContext(): string {
  const filePath = path.join(process.cwd(), 'data', 'procedures.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)

  const lines: string[] = []

  // Thủ tục cấp phường
  lines.push('## THỦ TỤC CẤP PHƯỜNG')
  for (const cat of data.categories) {
    lines.push(`### ${cat.name} (${cat.slug})`)
    lines.push(`Mô tả: ${cat.description}`)
    lines.push(`Nhóm thủ tục: ${cat.subCategories.join(', ')}`)
    if (cat.documents?.length) {
      for (const doc of cat.documents) {
        lines.push(`- Tài liệu: ${doc.title} — ${doc.pageCount} trang — Tải PDF: ${doc.pdf}`)
      }
    }
    lines.push('')
  }

  // Thủ tục phi địa giới
  lines.push('## THỦ TỤC PHI ĐỊA GIỚI HÀNH CHÍNH')
  for (const cat of data.phiDiaGioi) {
    const pdfInfo = cat.pdf ? ` — Tải PDF: ${cat.pdf}` : ''
    lines.push(`- ${cat.name}: ${cat.description}${pdfInfo}`)
  }
  lines.push('')

  // Thủ tục thường gặp
  lines.push('## THỦ TỤC THƯỜNG GẶP')
  for (const cat of data.thuongGap) {
    const pdfInfo = cat.pdf ? ` — Tải PDF: ${cat.pdf}` : ''
    lines.push(`- ${cat.name}: ${cat.description}${pdfInfo}`)
  }
  lines.push('')

  // Link hữu ích
  lines.push('## LIÊN KẾT HỮU ÍCH')
  lines.push(`- Biểu mẫu: ${data.externalLinks.bieuMau}`)
  lines.push(`- Tra cứu hồ sơ DVC: ${data.externalLinks.dvcTraCuu}`)
  lines.push(`- Thủ tục DVC: ${data.externalLinks.dvcThuTuc}`)
  lines.push(`- Đánh giá DVC: ${data.externalLinks.dvcDanhGia}`)
  lines.push(`- Hướng dẫn DVC: ${data.externalLinks.dvcHuongDan}`)
  lines.push(`- Facebook: ${data.externalLinks.facebook}`)

  return lines.join('\n')
}

/**
 * @chucnang    : Đọc news.json và tạo context tin tức gần nhất
 * @output      : String 5 tin mới nhất
 */
function buildNewsContext(): string {
  const filePath = path.join(process.cwd(), 'data', 'news.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const news = JSON.parse(raw)

  const lines: string[] = ['## TIN TỨC MỚI NHẤT']
  const recent = news.slice(0, 5)
  for (const n of recent) {
    lines.push(`- [${n.date}] ${n.title}: ${n.excerpt}`)
  }
  return lines.join('\n')
}

/**
 * @chucnang    : Đọc faq.json và tạo context FAQ cho chatbot
 * @output      : String câu hỏi thường gặp
 */
function buildFaqContext(): string {
  try {
    const filePath = path.join(process.cwd(), 'data', 'faq.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    const faqs = JSON.parse(raw) as Array<{
      question: string; answer: string; category: string; isActive: boolean
    }>

    const activeFaqs = faqs.filter(f => f.isActive !== false)
    if (activeFaqs.length === 0) return ''

    const lines: string[] = ['## CÂU HỎI THƯỜNG GẶP (FAQ)']
    for (const faq of activeFaqs) {
      lines.push(`### Hỏi: ${faq.question}`)
      lines.push(`Trả lời: ${faq.answer}`)
      lines.push(`Danh mục: ${faq.category}`)
      lines.push('')
    }
    return lines.join('\n')
  } catch {
    return ''
  }
}

/**
 * @chucnang    : Tạo system prompt đầy đủ cho Gemini
 * @output      : String system instruction
 */
export function buildSystemPrompt(): string {
  const procedures = buildProceduresContext()
  const news = buildNewsContext()
  const faq = buildFaqContext()

  return `Bạn là trợ lý AI của Trung tâm Phục vụ Hành chính Công (TTPVHCC) Phường Xuân Hòa, TP. Hồ Chí Minh.

## VAI TRÒ
- Hỗ trợ người dân tra cứu thủ tục hành chính, cung cấp thông tin tham khảo.
- Trả lời ngắn gọn, rõ ràng, thân thiện, bằng tiếng Việt.
- Khi trả lời về thủ tục, kèm link tải PDF nếu có (bắt đầu bằng /pdf/procedures/...).
- Khi người dân cần nộp hồ sơ → hướng dẫn qua Cổng DVC: https://dichvucong.gov.vn

## LƯU Ý QUAN TRỌNG
⚠️ MỌI CÂU TRẢ LỜI CHỈ MANG TÍNH THAM KHẢO — không thay thế tư vấn pháp lý chính thức.
⚠️ Luôn nhắc người dân liên hệ trực tiếp TTPVHCC để được hướng dẫn chi tiết nếu cần.
⚠️ KHÔNG cung cấp thông tin ngoài phạm vi TTHC phường Xuân Hòa.
⚠️ KHÔNG lưu, yêu cầu, hoặc xử lý thông tin cá nhân (CMND, CCCD, địa chỉ cụ thể).

## KHI KHÔNG THỂ TRẢ LỜI
Nếu câu hỏi nằm ngoài phạm vi hoặc bạn không chắc chắn, hãy trả lời:
"Xin lỗi, tôi không thể tư vấn chi tiết về vấn đề này. Vui lòng liên hệ trực tiếp TTPVHCC Phường Xuân Hòa:
📍 Địa chỉ: 99 Trần Quốc Thảo, Phường Xuân Hòa, TP.HCM
🕐 Giờ làm việc: T2–T6: 07:30–17:00 | T7: 07:30–11:30 (sáng)
📱 Facebook: https://www.facebook.com/phuongxuanhoatphochiminh"

## THÔNG TIN TTPVHCC
- Địa chỉ: 99 Trần Quốc Thảo, Phường Xuân Hòa, TP. Hồ Chí Minh
- Giờ làm việc: Thứ 2 – Thứ 6: 07:30 – 11:30, 13:00 – 17:00. Thứ 7: 07:30 – 11:30 (sáng)
- Website: /thu-tuc (trang thủ tục), /tin-tuc (tin tức), /lien-he (liên hệ)
- Trang biểu mẫu: https://drive.google.com/drive/folders/1FHrz0OVdExpG8zpzZ0xQhY82BePZUx1Q

## DỮ LIỆU THỦ TỤC HÀNH CHÍNH
${procedures}

${news}

${faq}

## PHONG CÁCH TRẢ LỜI
- Gọi người dùng là "bạn" hoặc "anh/chị"
- Dùng emoji phù hợp (📋, 📍, 🕐, 📱, ✅) để dễ đọc
- Nếu có link PDF → ghi rõ "Tải danh mục PDF tại: [link]"
- Kết thúc bằng: "💡 Lưu ý: Thông tin trên chỉ mang tính tham khảo. Vui lòng liên hệ TTPVHCC để được hướng dẫn chính xác nhất."
`
}

/**
 * @chucnang    : Danh sách câu hỏi gợi ý nhanh
 * @output      : Array string
 */
export const QUICK_SUGGESTIONS = [
  'Làm giấy khai sinh cần gì?',
  'Giờ làm việc của TTPVHCC?',
  'Chứng thực bản sao ở đâu?',
  'Tải biểu mẫu thủ tục',
  'Tra cứu hồ sơ đã nộp',
  'Cấp phép xây dựng thế nào?',
]
