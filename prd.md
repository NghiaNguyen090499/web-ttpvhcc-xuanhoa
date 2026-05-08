# PRD – Website TTPVHCC Phường Xuân Hòa (MVP)

> **Tài liệu tham chiếu:** KH 157/KH-UBND ngày 05/5/2026 · HĐ 01/2026/HĐTKPM/ARAR (v2)  
> **Domain dự kiến:** `https://ttpvhcc-xuanhoa-hcm.gov.vn`  
> **Cập nhật lần cuối:** 07/05/2026

---

## 1. Tổng quan sản phẩm

### 1.1 Bối cảnh

Trung tâm Phục vụ Hành chính Công (TTPVHCC) phường Xuân Hòa cần nâng cấp hạ tầng website nhằm đáp ứng Nghị quyết 57-NQ/TW về chuyển đổi số và Luật An ninh mạng 116/2025/QH15. Website hiện tại thiếu bảo mật, không responsive, và chưa tích hợp dịch vụ công trực tuyến.

### 1.2 Mục tiêu MVP

| Mục tiêu | Chỉ số thành công |
|---|---|
| Bảo mật đạt chuẩn | OWASP Top 10 pass · SSL Labs A+ · Pentest không có lỗ hổng High/Critical |
| Hiệu năng | Tải trang < 2s · PageSpeed ≥ 80 (mobile) / ≥ 90 (desktop) |
| Trải nghiệm người dùng | Responsive trên mọi thiết bị · Mobile-first |
| Chuyển đổi số | Liên kết đầy đủ đến Cổng DVC · Chatbot tự phục vụ 24/7 |
| Uptime | ≥ 99.5% · RTO ≤ 2 giờ khi sự cố |

### 1.3 Phạm vi MVP (trong scope)

- Giao diện website chuẩn cơ quan nhà nước cấp phường
- Hạ tầng Cloud + bảo mật (NGFW, DDoS, TLS 1.3, AES-256, EV SSL)
- Liên kết Cổng Dịch vụ công (dichvucong.gov.vn + HCM)
- AI Chatbot hỗ trợ thủ tục hành chính 24/7
- Phân tích hành vi người dùng (Analytics)
- Hệ thống quản trị nội dung (CMS) cho cán bộ

### 1.4 Ngoài phạm vi MVP

- Tích hợp VNeID / xác thực định danh điện tử *(để lại roadmap v2)*
- Nộp hồ sơ trực tuyến trực tiếp trên website *(chuyển hướng sang Cổng DVC)*
- Ứng dụng mobile native
- Đa ngôn ngữ

---

## 2. Người dùng mục tiêu

| Nhóm | Nhu cầu chính | Kênh truy cập |
|---|---|---|
| **Người dân** | Tra cứu thủ tục, biểu mẫu, lịch làm việc | Mobile (>70%) |
| **Doanh nghiệp** | Tra cứu thủ tục đăng ký kinh doanh, nộp hồ sơ qua DVC | Desktop |
| **Cán bộ phường** | Cập nhật tin tức, thông báo, quản lý nội dung | Desktop (CMS) |

---

## 3. Kiến trúc hệ thống

### 3.1 Tech stack đề xuất

```
Frontend:    Next.js 14 (App Router) + Tailwind CSS
Backend:     Node.js / Python FastAPI (Microservices)
CMS:         Payload CMS hoặc Directus (self-hosted)
AI Chatbot:  Claude API (claude-sonnet-4-6) + RAG trên knowledge base thủ tục
Database:    PostgreSQL (AES-256 at rest)
Hosting:     Cloud VPS (Viettel IDC / VNPT Cloud) – Auto-scaling
CDN:         Cloudflare (DDoS protection + WAF)
SSL:         EV SSL – Extended Validation
Monitoring:  Uptime Robot + Sentry + Plausible Analytics
```

### 3.2 Sơ đồ hạ tầng

```
                        ┌─────────────────┐
     Người dùng ──────▶ │   Cloudflare    │ ← DDoS + WAF + CDN
                        └────────┬────────┘
                                 │ TLS 1.3
                        ┌────────▼────────┐
                        │   NGFW (Cloud)  │ ← AI intrusion detection
                        └────────┬────────┘
                    ┌────────────┼────────────┐
             ┌──────▼──────┐    │    ┌────────▼──────┐
             │  Next.js    │    │    │   FastAPI      │
             │  Frontend   │    │    │   (Chatbot API)│
             └──────┬──────┘    │    └────────┬───────┘
                    │           │             │
             ┌──────▼───────────▼─────────────▼───────┐
             │           PostgreSQL (encrypted)         │
             │        + Daily Auto-backup offsite       │
             └─────────────────────────────────────────┘
```

### 3.3 Bảo mật

- **Zero Trust:** Mọi request đều phải xác thực, không tin tưởng mặc định theo vị trí mạng
- **MFA bắt buộc** cho tất cả tài khoản admin CMS (TOTP / Authenticator app)
- **TLS 1.3** cho toàn bộ traffic; HSTS enabled
- **AES-256** cho database và backup
- **Auto-backup** hàng ngày → lưu offsite tại trung tâm dữ liệu thứ 2
- **Pentest** trước khi go-live (báo cáo nộp kèm nghiệm thu)

---

## 4. Tính năng chi tiết

### 4.1 Module: Trang chủ

**Mô tả:** Cổng thông tin chính, hiển thị các nội dung thiết yếu nhanh nhất

**User stories:**
- Là người dân, tôi muốn thấy ngay số điện thoại và giờ làm việc của TTPVHCC khi vào trang để biết khi nào đến được
- Là người dân, tôi muốn thấy thông báo khẩn mới nhất để không bỏ lỡ thay đổi quan trọng
- Là người dân, tôi muốn truy cập nhanh Cổng DVC để nộp hồ sơ trực tuyến ngay từ trang chủ

**Thành phần giao diện:**

| Component | Nội dung |
|---|---|
| Hero banner | Tên đơn vị · địa chỉ · giờ làm việc · bản đồ nhúng |
| Thanh truy cập nhanh | 4 nút: Nộp hồ sơ online · Tra cứu thủ tục · Lịch hẹn · Biểu mẫu |
| Thông báo nổi bật | 3 tin mới nhất từ CMS · nút xem thêm |
| Dịch vụ công phổ biến | Top 6 thủ tục được tra cứu nhiều nhất · link đến trang chi tiết |
| Tin tức & hoạt động | Grid 6 bài viết mới nhất |
| Chatbot widget | Nổi góc phải màn hình · 24/7 |

**Acceptance criteria:**
- [ ] Tải dưới 2 giây trên kết nối 4G
- [ ] Hiển thị đúng trên iOS Safari, Android Chrome, Firefox, Edge
- [ ] Nút "Nộp hồ sơ online" mở đúng URL Cổng DVC trong tab mới
- [ ] Thông báo khẩn hiển thị banner màu đỏ nổi bật khi được CMS kích hoạt

---

### 4.2 Module: Thủ tục hành chính

**Mô tả:** Tra cứu toàn bộ danh mục thủ tục thuộc thẩm quyền phường Xuân Hòa

**User stories:**
- Là người dân, tôi muốn tìm kiếm thủ tục theo từ khóa để không cần duyệt hết danh mục
- Là người dân, tôi muốn xem hồ sơ cần chuẩn bị, thời gian giải quyết và phí (nếu có) để chuẩn bị đúng trước khi đến
- Là người dân, tôi muốn tải biểu mẫu trực tiếp từ trang thủ tục để không phải đến phường chỉ để lấy giấy tờ
- Là người dân, tôi muốn nhấn một nút để chuyển sang Cổng DVC nộp hồ sơ online cho thủ tục đó

**Tính năng:**

```
Danh mục thủ tục
├── Lĩnh vực: Hộ tịch | Đất đai | Xây dựng | Kinh doanh | Tư pháp | ...
├── Tìm kiếm full-text (tên thủ tục, mã số)
├── Lọc: thời gian xử lý · có thể nộp online · miễn phí
└── Trang chi tiết mỗi thủ tục:
    ├── Tên thủ tục & mã số
    ├── Đối tượng thực hiện
    ├── Hồ sơ cần chuẩn bị (danh sách có thể tải từng giấy tờ)
    ├── Trình tự thực hiện (step-by-step)
    ├── Thời gian giải quyết
    ├── Phí & lệ phí
    ├── Kết quả nhận được
    ├── Biểu mẫu đính kèm (PDF/DOCX download)
    └── [Nộp hồ sơ online] → dichvucong.gov.vn/<thủ tục tương ứng>
```

**Tích hợp Cổng DVC:**
- Mỗi thủ tục map với URL tương ứng trên `dichvucong.gov.vn` và `dichvucong.hochiminhcity.gov.vn`
- Nút CTA rõ ràng: `Nộp hồ sơ trực tuyến →` (mở tab mới)
- Hiển thị badge "Có thể nộp online" trên thẻ thủ tục trong danh sách

**Acceptance criteria:**
- [ ] Tìm kiếm trả kết quả < 300ms
- [ ] Tất cả link Cổng DVC dẫn đúng trang (không 404)
- [ ] Biểu mẫu tải được trên mobile không qua máy tính
- [ ] Hiển thị đúng khi danh mục có > 100 thủ tục (phân trang hoặc virtual scroll)

---

### 4.3 Module: AI Chatbot

**Mô tả:** Trợ lý ảo hỗ trợ người dân tra cứu thủ tục và giải đáp thắc mắc 24/7

**User stories:**
- Là người dân, tôi muốn hỏi chatbot "tôi cần gì để đăng ký kết hôn" và nhận câu trả lời ngay mà không cần tìm trong danh mục
- Là người dân, tôi muốn chatbot cho tôi biết giờ làm việc và có thể đặt lịch hẹn không
- Là người dân, khi chatbot không biết, tôi muốn được chuyển đến đúng số điện thoại/bộ phận để hỏi tiếp

**Kiến trúc Chatbot:**

```
Người dùng
    ↓ câu hỏi
RAG Retrieval
    ├── Knowledge base: danh mục thủ tục (vector DB)
    ├── Knowledge base: thông tin đơn vị (giờ làm việc, địa chỉ, liên hệ)
    └── Knowledge base: FAQ (câu hỏi thường gặp do cán bộ biên soạn)
    ↓ context
Claude API (claude-sonnet-4-6)
    ↓ câu trả lời
Fallback logic
    ├── Confidence thấp → "Xin lỗi, câu hỏi này tôi chưa có thông tin. Vui lòng gọi: [số điện thoại]"
    └── Từ khoá nhạy cảm → chuyển thẳng sang hotline
```

**Yêu cầu:**
- Widget nổi, thu gọn được, không che nội dung chính
- Lịch sử hội thoại trong phiên (không lưu sau khi đóng trình duyệt, tuân thủ Luật BVDLCN)
- Hỗ trợ tiếng Việt có dấu, ngôn ngữ thông thường (không yêu cầu người dùng gõ đúng tên thủ tục)
- Gợi ý câu hỏi nhanh khi mở chatbot lần đầu: *"Hỏi về hộ khẩu"* · *"Đăng ký kết hôn"* · *"Giờ làm việc"*

**Acceptance criteria:**
- [ ] Trả lời trong < 3 giây (P95)
- [ ] Nhận diện đúng ít nhất 80% câu hỏi trong bộ test 50 câu
- [ ] Không hallucinate thông tin không có trong knowledge base
- [ ] Hiển thị link dẫn đến trang thủ tục tương ứng trong câu trả lời

---

### 4.4 Module: Tin tức & Thông báo

**User stories:**
- Là cán bộ phường, tôi muốn đăng tin tức qua CMS mà không cần biết code
- Là người dân, tôi muốn nhận thông báo khẩn về dịch vụ công bị gián đoạn hoặc thay đổi lịch làm việc

**Tính năng:**
- Phân loại: Tin tức · Thông báo · Văn bản pháp quy · Kết quả giải quyết TTHC
- Tìm kiếm và lọc theo danh mục, thời gian
- Banner thông báo khẩn (Emergency Banner) có thể bật/tắt qua CMS
- Hỗ trợ rich text, hình ảnh, đính kèm file PDF

---

### 4.5 Module: Giới thiệu & Liên hệ

**Nội dung:**
- Giới thiệu TTPVHCC: chức năng, nhiệm vụ, cơ cấu tổ chức
- Thông tin liên hệ: địa chỉ, điện thoại, email, bản đồ Google Maps nhúng
- Lịch làm việc (bảng theo ngày trong tuần, nghỉ lễ)
- Form phản ánh kiến nghị (gửi email đến hộp thư cán bộ, không lưu CSDL để giảm scope BVDLCN)

---

### 4.6 Module: CMS (Quản trị nội dung)

**Người dùng:** Cán bộ phường được phân quyền

**Tính năng tối thiểu:**
- Đăng/sửa/xóa: tin tức, thông báo, nội dung trang tĩnh
- Quản lý danh mục thủ tục: cập nhật hồ sơ, biểu mẫu, URL Cổng DVC
- Quản lý FAQ cho Chatbot (thêm/sửa câu hỏi - câu trả lời)
- Phân quyền: Admin (toàn quyền) · Editor (nội dung) · Viewer (chỉ xem)
- MFA bắt buộc khi đăng nhập (TOTP)
- Audit log: ghi lại mọi thao tác thay đổi nội dung

---

## 5. Yêu cầu phi chức năng

### 5.1 Hiệu năng

| Chỉ số | Mục tiêu | Công cụ đo |
|---|---|---|
| Time to First Byte (TTFB) | < 200ms | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | PageSpeed Insights |
| Cumulative Layout Shift (CLS) | < 0.1 | PageSpeed Insights |
| PageSpeed Score (mobile) | ≥ 80 | PageSpeed Insights |
| PageSpeed Score (desktop) | ≥ 90 | PageSpeed Insights |

### 5.2 Bảo mật

| Yêu cầu | Chi tiết |
|---|---|
| SSL | EV SSL · SSL Labs rating A+ · HSTS preload |
| Mã hóa truyền tải | TLS 1.3 tối thiểu · TLS 1.0/1.1 disabled |
| Mã hóa lưu trữ | AES-256 cho database và backup |
| Xác thực admin | MFA bắt buộc (TOTP) · brute-force protection |
| Tường lửa | Cloudflare WAF + NGFW tại Cloud server |
| DDoS | Cloudflare DDoS protection (L3/L4/L7) |
| IDS/IPS | Tích hợp tại NGFW, cảnh báo realtime |
| Pentest | Trước go-live · báo cáo OWASP methodology |
| Headers | CSP · X-Frame-Options · X-Content-Type-Options |
| Dependency scan | Kiểm tra thư viện nguồn mở trước bàn giao |

### 5.3 Tính sẵn sàng

| Chỉ số | Mục tiêu |
|---|---|
| Uptime | ≥ 99.5% (tương đương < 44 giờ downtime/năm) |
| RTO (Recovery Time Objective) | ≤ 2 giờ |
| RPO (Recovery Point Objective) | ≤ 24 giờ (backup hàng ngày) |
| Backup | Tự động hàng ngày · lưu offsite tại DC thứ 2 |
| Auto-scaling | Kích hoạt khi CPU > 70% hoặc traffic tăng đột biến |

### 5.4 Khả năng tiếp cận (Accessibility)

- Đạt chuẩn WCAG 2.1 Level AA
- Hỗ trợ screen reader (alt text cho ảnh, ARIA labels)
- Cỡ chữ tối thiểu 16px cho body text
- Tỷ lệ tương phản màu ≥ 4.5:1

---

## 6. Thiết kế & UX

### 6.1 Design tokens

```css
--color-primary:    #003087;  /* xanh chính phủ */
--color-secondary:  #D4A017;  /* vàng accent */
--color-success:    #1A7A3A;
--color-danger:     #C0392B;
--color-text:       #1A1A1A;
--color-surface:    #F5F5F5;
--font-heading:     "Be Vietnam Pro", sans-serif;
--font-body:        "Be Vietnam Pro", sans-serif;
--border-radius:    8px;
```

### 6.2 Layout chính

```
Header
  ├── Logo + Tên đơn vị
  ├── Nav chính: Trang chủ · Thủ tục HCC · Tin tức · Giới thiệu · Liên hệ
  └── [Nộp hồ sơ online] CTA button (highlight)

Main content (theo từng trang)

Footer
  ├── Thông tin đơn vị · Giờ làm việc
  ├── Links: UBND TP.HCM · Cổng DVC Quốc gia · Cổng DVC TP.HCM
  └── Bản quyền · Chính sách bảo mật · Phiên bản
```

### 6.3 Mobile-first breakpoints

```
Mobile:  < 768px  → 1 cột, hamburger menu, chatbot thu gọn
Tablet:  768-1024px → 2 cột
Desktop: > 1024px → full layout
```

---

## 7. Tích hợp Cổng Dịch vụ công

### 7.1 Mapping thủ tục

Mỗi thủ tục trong CSDL của website cần có trường:

```json
{
  "id": "hotinh-001",
  "ten": "Đăng ký kết hôn",
  "linh_vuc": "Hộ tịch",
  "url_dvc_quoc_gia": "https://dichvucong.gov.vn/p/home/dvc-toan-trinh.html?ma_dich_vu=...",
  "url_dvc_hcm": "https://dichvucong.hochiminhcity.gov.vn/...",
  "co_the_nop_online": true
}
```

### 7.2 Nguyên tắc tích hợp

- Website **không** xử lý hồ sơ — chỉ thông tin và điều hướng
- Toàn bộ nộp hồ sơ thực hiện trên Cổng DVC (tab mới)
- Kiểm tra định kỳ các URL DVC không bị broken link (cronjob hàng tuần)
- Hiển thị badge "Có thể nộp online" / "Nộp trực tiếp" rõ ràng trên mỗi thủ tục

---

## 8. Lộ trình phát triển

### Giai đoạn 1 — Thiết kế & Phát triển (01/05 – 15/05/2026)

```
Tuần 1 (01–07/05)
  ├── Setup môi trường: Cloud server, domain, Cloudflare, CI/CD
  ├── Thiết kế UI: wireframe → mockup → design system
  └── Setup CMS: cài đặt, cấu hình phân quyền, schema nội dung

Tuần 2 (08–15/05)
  ├── Phát triển frontend: trang chủ, danh mục thủ tục, tin tức
  ├── Phát triển Chatbot: RAG pipeline, knowledge base import, UI widget
  ├── Nhập liệu: danh mục thủ tục + mapping URL Cổng DVC
  └── Demo nội bộ → Bên A xác nhận → chốt giai đoạn 1
```

### Giai đoạn 2 — Kiểm thử & Bảo mật (16/05 – 25/05/2026)

```
Tuần 3 (16–22/05)
  ├── Kiểm thử chức năng: test toàn bộ user stories
  ├── Kiểm thử hiệu năng: Lighthouse, PageSpeed, GTmetrix
  ├── Vulnerability Assessment (tự động + thủ công)
  └── Sửa lỗi phát sinh

Tuần 4 (23–25/05)
  ├── Penetration Testing (đơn vị bảo mật độc lập)
  ├── Vá lỗ hổng (nếu có)
  └── Bên A ký biên bản nghiệm thu kỹ thuật
```

### Giai đoạn 3 — Ra mắt & Vận hành (26–31/05/2026)

```
26–28/05: Đào tạo cán bộ (2 buổi) + bàn giao tài liệu
29/05:    Ra mắt chính thức
30–31/05: Theo dõi vận hành, xử lý phản hồi ban đầu
31/05:    Ký biên bản bàn giao tổng thể
```

---

## 9. Kiểm thử

### 9.1 Test cases ưu tiên cao

| # | Mô tả | Kết quả mong đợi |
|---|---|---|
| TC-01 | Tải trang chủ trên mobile 4G | Hiển thị đầy đủ < 2 giây |
| TC-02 | Tìm kiếm "đăng ký kết hôn" | Trả đúng thủ tục, hiện nút DVC |
| TC-03 | Nhấn "Nộp hồ sơ online" | Mở dichvucong.gov.vn đúng trang |
| TC-04 | Hỏi chatbot "cần gì để làm sổ hộ khẩu" | Trả lời đúng, < 3 giây |
| TC-05 | Tải biểu mẫu trên iPhone | File PDF tải thành công |
| TC-06 | Admin đăng nhập không có MFA | Bị chặn, yêu cầu setup MFA |
| TC-07 | Cán bộ đăng bài tin tức | Bài hiển thị đúng trên frontend |
| TC-08 | Mô phỏng DDoS nhỏ (wrk) | Cloudflare chặn, site không sập |
| TC-09 | SSL scan (SSL Labs) | Rating A+ |
| TC-10 | Kiểm tra backup restore | Restore thành công trong < 2 giờ |

### 9.2 Acceptance Testing

Bên A ký nghiệm thu khi **toàn bộ** điều kiện sau đạt:
- [ ] Tất cả test cases TC-01 đến TC-10 pass
- [ ] Báo cáo Pentest: 0 lỗ hổng High/Critical còn mở
- [ ] PageSpeed: mobile ≥ 80 · desktop ≥ 90
- [ ] SSL Labs: A+
- [ ] Chatbot: accuracy ≥ 80% trên bộ 50 câu test

---

## 10. Bảo mật dữ liệu cá nhân

Theo Luật BVDLCN 91/2025/QH15 và NĐ 356/2025/NĐ-CP:

- Website **không thu thập** dữ liệu cá nhân qua form, trừ form phản ánh kiến nghị (chỉ gửi email, không lưu CSDL)
- Chatbot **không lưu** lịch sử hội thoại sau khi đóng phiên
- Analytics (Plausible): không dùng cookie, không thu thập IP, tuân thủ GDPR/PDPL
- Chính sách bảo mật hiển thị ở footer, viết bằng ngôn ngữ dễ hiểu
- Nếu tương lai bổ sung thu thập dữ liệu: bắt buộc có banner consent

---

## 11. Vận hành sau go-live

| Hạng mục | Tần suất | Người thực hiện |
|---|---|---|
| Kiểm tra uptime | Tự động 24/7 | Uptime Robot → alert email |
| Backup | Hàng ngày | Tự động (cronjob) |
| Cập nhật security patch | Khi có CVE | Bên B (trong thời gian bảo hành) |
| Kiểm tra broken link DVC | Hàng tuần | Cronjob tự động |
| Bảo trì định kỳ | 6 tháng/lần | Bên B |
| Cập nhật nội dung thủ tục | Khi có thay đổi | Cán bộ phường (CMS) |
| Cập nhật knowledge base chatbot | Khi có thủ tục mới | Cán bộ phường (CMS FAQ) |

---

## 12. Câu hỏi mở (cần xác nhận trước khi dev)

| # | Câu hỏi | Người quyết định | Hạn |
|---|---|---|---|
| Q1 | Domain `.gov.vn` đã nộp hồ sơ đăng ký VNNIC chưa? (xử lý 2–4 tuần) | Bên A | Trước 01/05 |
| Q2 | Danh mục thủ tục phường Xuân Hòa có bao nhiêu thủ tục? File nguồn ở đâu? | Bên A | Trước 05/05 |
| Q3 | Mapping URL Cổng DVC cho từng thủ tục — ai thực hiện? | Thống nhất 2 bên | Trước 08/05 |
| Q4 | Cán bộ quản trị CMS là ai? Cần cấp bao nhiêu tài khoản? | Bên A | Trước 10/05 |
| Q5 | Logo, nhận diện thương hiệu TTPVHCC — file vector gốc? | Bên A | Trước 05/05 |
| Q6 | Đơn vị bảo mật độc lập thực hiện Pentest là ai? Bên nào thuê? | Thống nhất 2 bên | Trước 16/05 |

---

*Tài liệu này là cơ sở để triển khai. Mọi thay đổi scope cần xác nhận bằng văn bản từ cả hai bên.*