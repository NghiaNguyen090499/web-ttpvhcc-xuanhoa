import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Car,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  Facebook,
  FileSearch,
  FileText,
  Globe,
  GraduationCap,
  HeartPulse,
  Home,
  IdCard,
  Leaf,
  Mail,
  Map,
  MapPin,
  Megaphone,
  MessageCircle,
  MonitorSmartphone,
  Phone,
  PhoneCall,
  Scale,
  Search,
  Truck,
  Upload,
  Youtube,
} from 'lucide-react';

export type PortalIconLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type PortalNavLink = {
  label: string;
  href: string;
  active?: boolean;
};

export type PortalAction = {
  label: string;
  icon: LucideIcon;
};

export type PortalHeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  primaryAction: PortalAction;
  secondaryAction: PortalAction;
};

export type PortalTopBarContent = {
  siteLabel: string;
  socialLinks: PortalIconLink[];
};

export type PortalHeaderContent = {
  agencyTitle: string;
  agencySubtitle: string;
  navLinks: PortalNavLink[];
};

export type PortalStatItem = {
  icon: LucideIcon;
  value: string;
  label: string;
  note: string;
};

export type PortalNewsItem = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  summary: string;
  source: string;
  publishedAt: string;
  tag: string;
  icon: LucideIcon;
  featured?: boolean;
};

export type PortalPromotionBanner = {
  label: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  surfaceClass: string;
};

export type PortalHotlineBlock = {
  title: string;
  value: string;
  description: string;
};

export type PortalNewsSidebarContent = {
  sliderTitle: string;
  banners: PortalPromotionBanner[];
  hotline: PortalHotlineBlock;
};

export type PortalFeaturedShortcut = {
  label: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  actionLabel: string;
  external?: boolean;
};

export type PortalServiceItem = {
  icon: LucideIcon;
  label: string;
  badge: string;
  href: string;
};

export type PortalResourceItem = {
  icon: LucideIcon;
  text: string;
  href: string;
};

export type PortalResourcesContent = {
  title: string;
  items: PortalResourceItem[];
};

export type PortalFooterContact = {
  icon: LucideIcon;
  value: string;
  href?: string;
};

export type PortalFooterLink = {
  label: string;
  href: string;
};

export type PortalSocialButton = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  buttonClass: string;
  iconClass: string;
};

export type PortalFooterContent = {
  contactTitle: string;
  mapTitle: string;
  linksTitle: string;
  socialTitle: string;
  contactItems: PortalFooterContact[];
  externalLinks: PortalFooterLink[];
  socialButtons: PortalSocialButton[];
  credits: [string, string];
};

export const siteContent = {
  topBar: {
    siteLabel: 'Cổng Thông Tin Điện Tử Tổ 45 Phường Xuân Hòa - TP.HCM',
    socialLinks: [
      { label: 'Facebook', href: '#', icon: Facebook },
      { label: 'YouTube', href: '#', icon: Youtube },
    ],
  } satisfies PortalTopBarContent,

  header: {
    agencyTitle: 'Ủy Ban Nhân Dân',
    agencySubtitle: 'Phường Xuân Hòa',
    navLinks: [
      { label: 'Trang chủ', href: '#', active: true },
      { label: 'Tin tức', href: '#' },
      { label: 'Thủ tục hành chính', href: '#' },
      { label: 'Dịch vụ công', href: '#' },
      { label: 'Liên hệ', href: '#' },
    ],
  } satisfies PortalHeaderContent,

  hero: {
    eyebrow: 'Dịch vụ công cấp phường',
    title: 'Cổng Thông Tin Dịch Vụ Công Trực Tuyến',
    description:
      'Giao diện được tổ chức lại theo mẫu cổng hành chính: nền đỏ chủ đạo, card trắng dễ quét, CTA rõ cấp bậc và cụm thông tin địa phương được phân lớp rõ để người dân truy cập nhanh.',
    searchPlaceholder: 'Tìm cơ quan, thủ tục hành chính, biểu mẫu...',
    primaryAction: { label: 'Nộp hồ sơ trực tuyến', icon: Upload },
    secondaryAction: { label: 'Tra cứu kết quả hồ sơ', icon: Search },
  } satisfies PortalHeroContent,

  stats: [
    { icon: Clock, value: '24/7', label: 'Phục vụ', note: 'Tiếp nhận và tra cứu mọi lúc' },
    { icon: FileText, value: '100+', label: 'Thủ tục hành chính', note: 'Tập trung theo nhóm dịch vụ' },
    { icon: CheckCircle, value: 'Tỷ lệ', label: 'Hài lòng cao', note: 'Quy trình rõ, CTA nổi bật' },
  ] satisfies PortalStatItem[],

  newsSectionTitle: 'Bản tin mới nhất',
  newsSidebar: {
    sliderTitle: 'Banner tuyên truyền',
    banners: [
      {
        label: 'Tuyên truyền',
        title: 'Ưu tiên nộp hồ sơ trực tuyến để giảm thời gian chờ',
        description: 'Khuyến khích người dân chuẩn bị hồ sơ điện tử đầy đủ trước khi đến bộ phận tiếp nhận.',
        href: '#',
        icon: Megaphone,
        surfaceClass: 'from-[#7d1216] via-[#a61d21] to-[#de8455]',
      },
      {
        label: 'Phổ biến',
        title: 'Thực hiện đúng luồng số hóa, hạn chế hồ sơ giấy',
        description: 'Cập nhật các thay đổi mới trong xử lý hồ sơ điện tử liên thông giữa phường và cơ quan cấp trên.',
        href: '#',
        icon: Bell,
        surfaceClass: 'from-[#5f1013] via-[#8b171a] to-[#c45a39]',
      },
      {
        label: 'Hướng dẫn',
        title: 'Chủ động tra cứu hồ sơ và lịch hẹn trên cổng trực tuyến',
        description: 'Người dân nên kiểm tra trạng thái xử lý trước khi liên hệ trực tiếp để tiết kiệm thời gian giao dịch.',
        href: '#',
        icon: MonitorSmartphone,
        surfaceClass: 'from-[#611216] via-[#912126] to-[#db8a5c]',
      },
    ],
    hotline: {
      title: 'Tổng đài 1022',
      value: '1022',
      description: 'Kênh tiếp nhận phản ánh, kiến nghị và hỗ trợ thông tin cho người dân TP.HCM.',
    },
  } satisfies PortalNewsSidebarContent,

  news: [
    {
      title: 'TPHCM bổ sung 16 thủ tục hành chính miễn lệ phí khi thực hiện trực tuyến',
      href: 'https://tphcm.chinhphu.vn/tphcm-bo-sung-16-thu-tuc-hanh-chinh-mien-le-phi-khi-thuc-hien-truc-tuyen-101260331181139104.htm',
      imageSrc: '/news/mien-le-phi-truc-tuyen-2026.jpg',
      imageAlt: 'Người dân thực hiện thủ tục tại trung tâm phục vụ hành chính công',
      summary:
        'Thành phố tiếp tục mở rộng danh mục thủ tục được khuyến khích nộp trực tuyến nhằm giảm chi phí và rút ngắn thời gian tiếp nhận hồ sơ.',
      source: 'TPHCM - Cổng TTĐT Chính phủ',
      publishedAt: '31/03/2026',
      tag: 'Trực tuyến',
      icon: MonitorSmartphone,
      featured: true,
    },
    {
      title: 'TPHCM tuyển sinh đầu cấp trực tuyến từ ngày 15/6',
      href: 'https://tphcm.chinhphu.vn/tphcm-tuyen-sinh-dau-cap-truc-tuyen-tu-ngay-15-6-101260326093956612.htm',
      imageSrc: '/news/tuyen-sinh-truc-tuyen-2026.jpeg',
      imageAlt: 'Học sinh tại lớp học ở TP.HCM',
      summary:
        'Kế hoạch tuyển sinh đầu cấp được triển khai trực tuyến, đồng bộ với mục tiêu chuẩn hóa luồng xử lý hồ sơ trên môi trường số.',
      source: 'TPHCM - Cổng TTĐT Chính phủ',
      publishedAt: '26/03/2026',
      tag: 'Giáo dục',
      icon: GraduationCap,
    },
    {
      title: 'Có thể làm thủ tục cấp phiếu lý lịch tư pháp trên ứng dụng VNeID từ 9/3',
      href: 'https://tphcm.chinhphu.vn/co-the-lam-thu-tuc-cap-phieu-ly-lich-tu-phap-tren-ung-dung-vneid-tu-9-3-101250309133413705.htm',
      imageSrc: '/news/ly-lich-tu-phap-vneid-2025.jpg',
      imageAlt: 'Công dân làm thủ tục tại quầy xuất nhập cảnh',
      summary:
        'Người dân có thể thực hiện thủ tục cấp phiếu lý lịch tư pháp trên VNeID, giảm số lần phải nộp giấy tờ trực tiếp.',
      source: 'TPHCM - Cổng TTĐT Chính phủ',
      publishedAt: '09/03/2025',
      tag: 'VNeID',
      icon: IdCard,
    },
    {
      title: 'TPHCM thí điểm sang tên xe trực tuyến qua VNeID',
      href: 'https://tphcm.chinhphu.vn/tphcm-thi-diem-sang-ten-xe-truc-tuyen-qua-vneid-10125051210533387.htm',
      imageSrc: '/news/sang-ten-xe-vneid-2025.jpg',
      imageAlt: 'Khu vực đăng ký xe tại TP.HCM',
      summary:
        'Mô hình thí điểm hỗ trợ người dân thực hiện quy trình sang tên xe trên nền tảng số, cắt giảm thao tác nộp hồ sơ tại quầy.',
      source: 'TPHCM - Cổng TTĐT Chính phủ',
      publishedAt: '12/05/2025',
      tag: 'Giao thông',
      icon: Car,
    },
    {
      title: 'TPHCM ra mắt Hệ thống thông tin giải quyết thủ tục hành chính',
      href: 'https://tphcm.chinhphu.vn/tphcm-ra-mat-he-thong-thong-tin-giai-quyet-thu-tuc-hanh-chinh-101221030130809208.htm',
      imageSrc: '/news/ra-mat-he-thong-tthc-2022.jpeg',
      imageAlt: 'Lãnh đạo nhấn nút ra mắt hệ thống thông tin giải quyết thủ tục hành chính',
      summary:
        'Hệ thống mới được xây dựng để tập trung quy trình tiếp nhận, luân chuyển và tra cứu trạng thái hồ sơ hành chính của thành phố.',
      source: 'TPHCM - Cổng TTĐT Chính phủ',
      publishedAt: '30/10/2022',
      tag: 'Hệ thống',
      icon: Building2,
    },
    {
      title: 'Từ 1/8, UBND TPHCM không nhận hồ sơ giấy từ sở, ngành, địa phương',
      href: 'https://tphcm.chinhphu.vn/tu-1-8-ubnd-tphcm-khong-nhan-ho-so-giay-tu-so-nganh-dia-phuong-101240801131552763.htm',
      imageSrc: '/news/khong-nhan-ho-so-giay-2024.jpg',
      imageAlt: 'Cán bộ tiếp nhận hồ sơ tại bộ phận một cửa',
      summary:
        'Quy định mới thúc đẩy xử lý hồ sơ điện tử liên thông, giảm phụ thuộc vào luồng văn bản giấy giữa các đơn vị.',
      source: 'TPHCM - Cổng TTĐT Chính phủ',
      publishedAt: '01/08/2024',
      tag: 'Số hóa',
      icon: FileText,
    },
  ] satisfies PortalNewsItem[],

  servicesSectionTitle: 'Dịch vụ công trực tuyến',
  featuredShortcuts: [
    {
      label: 'Bản đồ số',
      title: 'Bản đồ số địa phương',
      description: 'Truy cập cổng bản đồ số để tra cứu thông tin lớp dữ liệu và các điểm phục vụ điều hành.',
      href: '#',
      icon: Map,
      actionLabel: 'Mở bản đồ',
      external: true,
    },
    {
      label: 'PDF công khai',
      title: 'Sổ tay số điện thoại lãnh đạo phường',
      description: 'Mở tệp PDF công khai để tra cứu đầu mối liên hệ, số trực và bộ phận phụ trách.',
      href: '#',
      icon: PhoneCall,
      actionLabel: 'Mở PDF',
      external: true,
    },
  ] satisfies PortalFeaturedShortcut[],

  services: [
    { icon: Home, label: 'Đất đai & Nhà ở', badge: 'Nhà đất', href: '#' },
    { icon: GraduationCap, label: 'Giáo dục', badge: 'Giáo dục', href: '#' },
    { icon: Briefcase, label: 'Đăng ký kinh doanh', badge: 'Kinh doanh', href: '#' },
    { icon: HeartPulse, label: 'Y tế', badge: 'Y tế', href: '#' },
    { icon: Truck, label: 'Lĩnh vực An toàn Giao thông', badge: 'Giao thông', href: '#' },
    { icon: Scale, label: 'Lĩnh vực Tư pháp', badge: 'Tư pháp', href: '#' },
    { icon: Leaf, label: 'Lĩnh vực Môi trường', badge: 'Môi trường', href: '#' },
  ] satisfies PortalServiceItem[],

  resources: {
    title: 'Trung tâm tài liệu & Biểu mẫu',
    items: [
      { icon: Download, text: 'Download biểu mẫu PDF', href: '#' },
      { icon: BookOpen, text: 'Xem hướng dẫn làm thủ tục hồ sơ', href: '#' },
      { icon: FileSearch, text: 'Xem hướng dẫn nộp hồ sơ trực tuyến', href: '#' },
      { icon: ClipboardList, text: 'Xem hướng dẫn tra cứu kết quả hồ sơ', href: '#' },
    ],
  } satisfies PortalResourcesContent,

  footer: {
    contactTitle: 'Thông tin liên hệ',
    mapTitle: 'Bản đồ vị trí',
    linksTitle: 'Kênh hỗ trợ & Liên kết',
    socialTitle: 'Kênh cộng đồng',
    contactItems: [
      { icon: Phone, value: '0996 233 983', href: 'tel:0996233983' },
      { icon: Mail, value: 'ubndxuanhoa@tphcm.gov.vn', href: 'mailto:ubndxuanhoa@tphcm.gov.vn' },
      { icon: MapPin, value: 'Tổ 45, Phường Xuân Hòa, TP.HCM' },
      { icon: Globe, value: 'congthongtin.xuanhoa.gov.vn', href: 'https://congthongtin.xuanhoa.gov.vn' },
    ],
    externalLinks: [
      { label: 'Cổng Thông Tin Điện Tử TP.HCM', href: 'https://www.hochiminhcity.gov.vn/' },
      { label: 'Sở Nội vụ TP.HCM', href: 'https://sonoivu.hochiminhcity.gov.vn/' },
      { label: 'Cổng Dịch Vụ Công Quốc Gia', href: 'https://dichvucong.gov.vn/' },
      { label: 'UBND Quận Phú Nhuận - TP.HCM', href: 'https://phunhuan.hochiminhcity.gov.vn/' },
      { label: 'Cổng Thông Tin Tổ Dân Phố', href: '#' },
    ],
    socialButtons: [
      {
        label: 'Facebook',
        description: 'Theo dõi thông báo và hoạt động địa phương',
        href: '#',
        icon: Facebook,
        buttonClass:
          'border-[#35589a] bg-[linear-gradient(135deg,#294f94_0%,#193a74_100%)] hover:brightness-110',
        iconClass: 'bg-white/16 text-white',
      },
      {
        label: 'Zalo',
        description: 'Nhắn tin và nhận cập nhật nhanh từ phường',
        href: 'https://zalo.me/4078461959342244319',
        icon: MessageCircle,
        buttonClass:
          'border-[#1d88e5] bg-[linear-gradient(135deg,#1f9bf0_0%,#0c62cf_100%)] hover:brightness-110',
        iconClass: 'bg-white/18 text-white',
      },
    ],
    credits: [
      'Cổng Thông Tin Điện Tử Tổ 45 Phường Xuân Hòa - TP.HCM',
      'Thiết kế lại giao diện theo mẫu tham chiếu hành chính',
    ],
  } satisfies PortalFooterContent,
} as const;
