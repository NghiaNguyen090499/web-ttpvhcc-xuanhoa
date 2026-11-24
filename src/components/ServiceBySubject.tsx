/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Phân loại dịch vụ theo đối tượng — Công dân & Doanh nghiệp
 *                Học từ DVC Quốc gia: 2 cột lớn với icon + nhóm dịch vụ theo sự kiện đời sống
 * @lienquan    : src/app/(public)/page.tsx
 * @alias       : service-subject, cong-dan-doanh-nghiep, phan-loai
 */

/* Link chi tiết TTHC dùng subdomain chính thức để tránh route /p/home trên domain chính bị WAF chặn. */

const DVC_DETAIL_URL = 'https://vpcp.dichvucong.gov.vn/p/home/dvc-chi-tiet-thu-tuc-hanh-chinh.html?ma_thu_tuc='
const DVC_VERTICAL_DETAIL_URL = 'https://vpcp.dichvucong.gov.vn/p/home/dvc-chi-tiet-thu-tuc-nganh-doc.html?ma_thu_tuc='

function dvcDetail(code: string, vertical = false) {
  return `${vertical ? DVC_VERTICAL_DETAIL_URL : DVC_DETAIL_URL}${code}`
}

/* Danh mục dịch vụ cho Công dân — theo sự kiện đời sống */
const CITIZEN_SERVICES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V21" />
      </svg>
    ),
    label: 'Hộ tịch & Gia đình',
    desc: 'Khai sinh, khai tử, kết hôn',
    href: dvcDetail('1.001193'),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
    label: 'Cư trú & Giấy tờ',
    desc: 'Thường trú, BHYT trẻ em',
    href: dvcDetail('2.002621', true),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    label: 'Đất đai & Xây dựng',
    desc: 'Sổ đỏ, giấy phép xây dựng',
    href: dvcDetail('1.013978'),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    label: 'Sức khỏe & Y tế',
    desc: 'Giấy xác nhận khuyết tật',
    href: dvcDetail('1.001699'),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: 'Chính sách xã hội',
    desc: 'Trợ cấp, bảo trợ xã hội',
    href: dvcDetail('1.001776'),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    label: 'Khiếu nại & Tố cáo',
    desc: 'Thanh tra, giải quyết đơn thư',
    href: dvcDetail('2.002409'),
  },
]

/* Danh mục dịch vụ cho Doanh nghiệp */
const BUSINESS_SERVICES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Đăng ký kinh doanh',
    desc: 'Hộ kinh doanh cá thể',
    href: dvcDetail('1.001612'),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    label: 'Thuế & Tài chính',
    desc: 'Kê khai phí, tài chính',
    href: dvcDetail('1.008603'),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    label: 'Giấy phép xây dựng',
    desc: 'Cấp phép, gia hạn, điều chỉnh',
    href: dvcDetail('1.013225'),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    label: 'Lao động & BHXH',
    desc: 'Nội quy, hợp đồng lao động',
    href: dvcDetail('2.001955'),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'Chứng thực & Công chứng',
    desc: 'Xác nhận bản sao, chữ ký',
    href: dvcDetail('2.000884'),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: 'Môi trường',
    desc: 'Đánh giá tác động môi trường',
    href: dvcDetail('1.010736'),
  },
]

/**
 * @chucnang    : Render 1 cột dịch vụ (Công dân hoặc Doanh nghiệp)
 * @input       : title (string), color (string), items (mảng dịch vụ)
 * @output      : JSX danh sách dịch vụ
 */
function ServiceColumn({
  title,
  color,
  iconBg,
  items,
}: {
  title: string
  color: string
  iconBg: string
  items: typeof CITIZEN_SERVICES
}) {
  return (
    <div>
      {/* Heading cột */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-1 rounded-full" style={{ backgroundColor: color }} />
        <h3
          className="text-lg md:text-xl font-bold font-heading uppercase tracking-wide"
          style={{ color }}
        >
          {title}
        </h3>
      </div>

      {/* Danh sách dịch vụ — link ngoài DVC Quốc gia */}
      <div className="space-y-1">
        {items.map((svc) => (
          <a
            key={svc.label}
            href={svc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:shadow-md btn-transition"
          >
            {/* Icon */}
            <span
              className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 btn-transition group-hover:scale-105"
              style={{ backgroundColor: iconBg, color }}
            >
              {svc.icon}
            </span>

            {/* Text */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary btn-transition truncate">
                {svc.label}
              </p>
              <p className="text-xs text-text-muted truncate">{svc.desc}</p>
            </div>

            {/* Arrow — icon external */}
            <svg
              className="w-4 h-4 text-text-muted/40 ml-auto shrink-0 group-hover:text-primary group-hover:translate-x-0.5 btn-transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}

export function ServiceBySubject() {
  return (
    <section className="py-8 md:py-10 bg-cream/50" id="service-by-subject">
      <div className="container-main">
        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Dịch vụ theo đối tượng
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-text-primary font-heading uppercase tracking-wide">
            Bạn cần thực hiện thủ tục gì?
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-3 rounded-full" />
          <p className="mt-3 text-sm text-text-secondary max-w-lg mx-auto">
            Chọn đối tượng phù hợp để tìm nhanh thủ tục hành chính
          </p>
        </div>

        {/* 2 cột — Công dân & Doanh nghiệp */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Cột Công dân */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-border p-5 md:p-6">
            <ServiceColumn
              title="Công dân"
              color="#0878c9"
              iconBg="rgba(166, 29, 33, 0.08)"
              items={CITIZEN_SERVICES}
            />
          </div>

          {/* Cột Doanh nghiệp */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-border p-5 md:p-6">
            <ServiceColumn
              title="Doanh nghiệp"
              color="#1565C0"
              iconBg="rgba(21, 101, 192, 0.08)"
              items={BUSINESS_SERVICES}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
