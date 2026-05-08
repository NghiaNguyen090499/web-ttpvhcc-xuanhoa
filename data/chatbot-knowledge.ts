import { procedures } from '@/data/procedures';

/**
 * Build RAG context from procedures data + static info for the AI chatbot.
 * This is sent as system context so the model answers based on real data only.
 */

const UNIT_INFO = `
## Thông tin đơn vị
- Tên: Trung tâm Phục vụ Hành chính Công (TTPVHCC) Phường Xuân Hòa
- Địa chỉ: Tổ 45, Phường Xuân Hòa, TP.HCM
- Điện thoại: 0996 233 983
- Email: ubndxuanhoa@tphcm.gov.vn
- Giờ làm việc: Thứ 2 đến Thứ 6, 07:30 – 11:30 (sáng), 13:00 – 17:00 (chiều). Thứ 7 sáng: 07:30 – 11:30. Chủ nhật nghỉ.
- Tổng đài hỗ trợ TP.HCM: 1022

## Cổng Dịch vụ công
- Cổng DVC Quốc gia: https://dichvucong.gov.vn/
- Cổng DVC TP.HCM: https://dichvucong.hochiminhcity.gov.vn/

## Hướng dẫn chung
- Người dân có thể nộp hồ sơ trực tuyến qua Cổng Dịch vụ công cho các thủ tục hỗ trợ online.
- Đối với thủ tục cần nộp trực tiếp, vui lòng đến UBND phường trong giờ làm việc.
- Mang theo CMND/CCCD bản gốc khi đến làm thủ tục.
`;

function buildProceduresContext(): string {
  return procedures
    .map(
      (p) =>
        `### ${p.name} (Mã: ${p.code})
- Lĩnh vực: ${p.category}
- Đối tượng: ${p.target}
- Hồ sơ: ${p.documents.map((d) => d.name).join('; ')}
- Thời gian: ${p.processingTime}
- Phí: ${p.fee}
- Kết quả: ${p.result}
- Nộp online: ${p.canSubmitOnline ? 'Có' : 'Không - cần nộp trực tiếp'}
- Link DVC: ${p.canSubmitOnline ? p.urlDvcQuocGia : 'Nộp trực tiếp tại UBND phường'}
- Trang chi tiết: /thu-tuc-hanh-chinh/${p.slug}`
    )
    .join('\n\n');
}

const FAQ = `
## Câu hỏi thường gặp

### Đăng ký kết hôn cần gì?
Cần: Tờ khai đăng ký kết hôn, Giấy xác nhận tình trạng hôn nhân (nếu khác nơi cư trú), CMND/CCCD hai bên. Thời gian: trong ngày. Miễn phí. Có thể nộp online.

### Làm giấy khai sinh cần gì?
Cần: Tờ khai đăng ký khai sinh, Giấy chứng sinh từ bệnh viện, CMND/CCCD người đi khai sinh. Thời gian: trong ngày. Miễn phí.

### Chứng thực bản sao mất bao lâu?
Chứng thực bản sao từ bản chính: trong ngày (không quá 2 ngày nếu nhiều). Phí 2.000đ/trang. Cần mang bản gốc.

### Giờ làm việc là mấy giờ?
Thứ 2-6: Sáng 07:30-11:30, Chiều 13:00-17:00. Thứ 7: Sáng 07:30-11:30. CN nghỉ.

### Tổng đài 1022 là gì?
Tổng đài 1022 là kênh tiếp nhận phản ánh, kiến nghị và hỗ trợ thông tin cho người dân TP.HCM.

### Làm sao nộp hồ sơ online?
Truy cập Cổng DVC Quốc gia (dichvucong.gov.vn) hoặc DVC TP.HCM (dichvucong.hochiminhcity.gov.vn), tìm thủ tục cần làm và làm theo hướng dẫn.
`;

export function buildSystemPrompt(): string {
  return `Bạn là trợ lý ảo của Trung tâm Phục vụ Hành chính Công Phường Xuân Hòa, TP.HCM.

Nhiệm vụ: Hỗ trợ người dân tra cứu thủ tục hành chính, trả lời câu hỏi về dịch vụ công, giờ làm việc, hồ sơ cần chuẩn bị.

Quy tắc:
1. CHỈ trả lời dựa trên thông tin trong knowledge base bên dưới. KHÔNG bịa thông tin.
2. Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu.
3. Nếu câu hỏi liên quan đến thủ tục cụ thể, dẫn link trang chi tiết.
4. Nếu không biết câu trả lời, nói: "Xin lỗi, tôi chưa có thông tin về vấn đề này. Vui lòng gọi 0996 233 983 hoặc tổng đài 1022 để được hỗ trợ."
5. KHÔNG trả lời các câu hỏi không liên quan đến dịch vụ hành chính công.
6. Khi nêu link, dùng format markdown: [tên](link)

${UNIT_INFO}

## Danh mục thủ tục hành chính
${buildProceduresContext()}

${FAQ}`;
}

export const QUICK_SUGGESTIONS = [
  { label: 'Đăng ký kết hôn', prompt: 'Tôi muốn đăng ký kết hôn cần chuẩn bị gì?' },
  { label: 'Khai sinh', prompt: 'Làm giấy khai sinh cho con cần những giấy tờ gì?' },
  { label: 'Giờ làm việc', prompt: 'Giờ làm việc của UBND phường là mấy giờ?' },
  { label: 'Nộp hồ sơ online', prompt: 'Tôi muốn nộp hồ sơ trực tuyến thì làm thế nào?' },
];
