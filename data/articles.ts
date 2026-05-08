export type ArticleCategory = 'Tin tức' | 'Thông báo' | 'Văn bản pháp quy' | 'Kết quả TTHC';

export type Article = {
  id: string;
  slug: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  content: string;
  imageSrc: string;
  imageAlt: string;
  source: string;
  publishedAt: string;
  tag: string;
  href?: string;
  featured?: boolean;
};

export const articles: Article[] = [
  {
    id: 'news-001',
    slug: 'tphcm-bo-sung-16-thu-tuc-mien-le-phi',
    title: 'TPHCM bổ sung 16 thủ tục hành chính miễn lệ phí khi thực hiện trực tuyến',
    category: 'Tin tức',
    summary: 'Thành phố tiếp tục mở rộng danh mục thủ tục được khuyến khích nộp trực tuyến nhằm giảm chi phí và rút ngắn thời gian tiếp nhận hồ sơ.',
    content: `<p>UBND TP.HCM vừa ban hành quyết định bổ sung 16 thủ tục hành chính được miễn lệ phí khi người dân thực hiện trực tuyến trên Cổng Dịch vụ công.</p>
<p>Đây là nỗ lực tiếp theo trong lộ trình chuyển đổi số hành chính công, nhằm khuyến khích người dân và doanh nghiệp sử dụng dịch vụ công trực tuyến thay vì nộp hồ sơ giấy trực tiếp.</p>
<h3>Các thủ tục được miễn lệ phí gồm:</h3>
<ul>
<li>Đăng ký khai sinh</li>
<li>Đăng ký kết hôn</li>
<li>Cấp bản sao trích lục hộ tịch</li>
<li>Và 13 thủ tục khác trong lĩnh vực tư pháp, đất đai</li>
</ul>
<p>Chính sách này có hiệu lực từ ngày 01/04/2026 và áp dụng trên toàn địa bàn thành phố.</p>`,
    imageSrc: '/news/mien-le-phi-truc-tuyen-2026.jpg',
    imageAlt: 'Người dân thực hiện thủ tục tại trung tâm phục vụ hành chính công',
    source: 'TPHCM - Cổng TTĐT Chính phủ',
    publishedAt: '31/03/2026',
    tag: 'Trực tuyến',
    href: 'https://tphcm.chinhphu.vn/tphcm-bo-sung-16-thu-tuc-hanh-chinh-mien-le-phi-khi-thuc-hien-truc-tuyen-101260331181139104.htm',
    featured: true,
  },
  {
    id: 'news-002',
    slug: 'tphcm-tuyen-sinh-dau-cap-truc-tuyen',
    title: 'TPHCM tuyển sinh đầu cấp trực tuyến từ ngày 15/6',
    category: 'Tin tức',
    summary: 'Kế hoạch tuyển sinh đầu cấp được triển khai trực tuyến, đồng bộ với mục tiêu chuẩn hóa luồng xử lý hồ sơ trên môi trường số.',
    content: `<p>Sở Giáo dục và Đào tạo TP.HCM thông báo kế hoạch tuyển sinh đầu cấp năm học 2026-2027 sẽ được thực hiện hoàn toàn trực tuyến từ ngày 15/6/2026.</p>
<p>Phụ huynh có thể đăng ký tuyển sinh cho con em mình thông qua Cổng Dịch vụ công hoặc ứng dụng di động, không cần đến trường nộp hồ sơ giấy.</p>`,
    imageSrc: '/news/tuyen-sinh-truc-tuyen-2026.jpeg',
    imageAlt: 'Học sinh tại lớp học ở TP.HCM',
    source: 'TPHCM - Cổng TTĐT Chính phủ',
    publishedAt: '26/03/2026',
    tag: 'Giáo dục',
    href: 'https://tphcm.chinhphu.vn/tphcm-tuyen-sinh-dau-cap-truc-tuyen-tu-ngay-15-6-101260326093956612.htm',
  },
  {
    id: 'news-003',
    slug: 'thu-tuc-ly-lich-tu-phap-tren-vneid',
    title: 'Có thể làm thủ tục cấp phiếu lý lịch tư pháp trên ứng dụng VNeID từ 9/3',
    category: 'Tin tức',
    summary: 'Người dân có thể thực hiện thủ tục cấp phiếu lý lịch tư pháp trên VNeID.',
    content: `<p>Bộ Công an cho biết từ ngày 9/3, người dân có thể thực hiện thủ tục cấp phiếu lý lịch tư pháp trực tiếp trên ứng dụng VNeID, giúp giảm thời gian và chi phí đi lại.</p>`,
    imageSrc: '/news/ly-lich-tu-phap-vneid-2025.jpg',
    imageAlt: 'Công dân làm thủ tục',
    source: 'TPHCM - Cổng TTĐT Chính phủ',
    publishedAt: '09/03/2025',
    tag: 'VNeID',
  },
  {
    id: 'news-004',
    slug: 'tphcm-thi-diem-sang-ten-xe-truc-tuyen',
    title: 'TPHCM thí điểm sang tên xe trực tuyến qua VNeID',
    category: 'Tin tức',
    summary: 'Mô hình thí điểm hỗ trợ người dân thực hiện quy trình sang tên xe trên nền tảng số.',
    content: `<p>TPHCM triển khai thí điểm dịch vụ sang tên đổi chủ phương tiện giao thông qua ứng dụng VNeID.</p>`,
    imageSrc: '/news/sang-ten-xe-vneid-2025.jpg',
    imageAlt: 'Khu vực đăng ký xe',
    source: 'TPHCM - Cổng TTĐT Chính phủ',
    publishedAt: '12/05/2025',
    tag: 'Giao thông',
  },
  {
    id: 'news-005',
    slug: 'tphcm-ra-mat-he-thong-tthc',
    title: 'TPHCM ra mắt Hệ thống thông tin giải quyết thủ tục hành chính',
    category: 'Thông báo',
    summary: 'Hệ thống mới tập trung quy trình tiếp nhận, luân chuyển và tra cứu trạng thái hồ sơ hành chính.',
    content: `<p>UBND TP.HCM chính thức ra mắt Hệ thống thông tin giải quyết thủ tục hành chính tập trung.</p>`,
    imageSrc: '/news/ra-mat-he-thong-tthc-2022.jpeg',
    imageAlt: 'Ra mắt hệ thống TTHC',
    source: 'TPHCM - Cổng TTĐT Chính phủ',
    publishedAt: '30/10/2022',
    tag: 'Hệ thống',
  },
  {
    id: 'news-006',
    slug: 'ubnd-tphcm-khong-nhan-ho-so-giay',
    title: 'Từ 1/8, UBND TPHCM không nhận hồ sơ giấy từ sở, ngành, địa phương',
    category: 'Thông báo',
    summary: 'Quy định mới thúc đẩy xử lý hồ sơ điện tử liên thông.',
    content: `<p>Từ ngày 1/8, UBND TP.HCM sẽ không tiếp nhận hồ sơ giấy từ các sở, ngành và địa phương, thúc đẩy chuyển đổi số toàn diện.</p>`,
    imageSrc: '/news/khong-nhan-ho-so-giay-2024.jpg',
    imageAlt: 'Cán bộ tiếp nhận hồ sơ',
    source: 'TPHCM - Cổng TTĐT Chính phủ',
    publishedAt: '01/08/2024',
    tag: 'Số hóa',
  },
  {
    id: 'announce-001',
    slug: 'thong-bao-nghi-le-30-4-1-5',
    title: 'Thông báo lịch nghỉ lễ 30/4 và 1/5 năm 2026',
    category: 'Thông báo',
    summary: 'TTPVHCC Phường Xuân Hòa thông báo lịch nghỉ lễ Giỗ Tổ Hùng Vương, 30/4 và 1/5 năm 2026.',
    content: `<p>TTPVHCC Phường Xuân Hòa trân trọng thông báo lịch nghỉ lễ 30/4 - 1/5 năm 2026. Cán bộ và nhân viên được nghỉ từ ngày 30/4 đến hết ngày 3/5/2026 (thứ Bảy đến thứ Ba). Ngày 4/5/2026 (thứ Tư) làm việc trở lại bình thường.</p>`,
    imageSrc: '/news/ra-mat-he-thong-tthc-2022.jpeg',
    imageAlt: 'Thông báo lịch nghỉ lễ',
    source: 'TTPVHCC Phường Xuân Hòa',
    publishedAt: '20/04/2026',
    tag: 'Lịch nghỉ',
  },
  {
    id: 'legal-001',
    slug: 'nghi-dinh-ve-bao-ve-du-lieu-ca-nhan',
    title: 'Nghị định 356/2025/NĐ-CP về bảo vệ dữ liệu cá nhân',
    category: 'Văn bản pháp quy',
    summary: 'Hướng dẫn chi tiết Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15.',
    content: `<p>Chính phủ ban hành Nghị định 356/2025/NĐ-CP quy định chi tiết một số điều của Luật Bảo vệ dữ liệu cá nhân.</p>`,
    imageSrc: '/news/khong-nhan-ho-so-giay-2024.jpg',
    imageAlt: 'Văn bản pháp quy',
    source: 'Chính phủ',
    publishedAt: '15/01/2026',
    tag: 'Pháp quy',
  },
];
