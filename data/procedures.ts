export type ProcedureDocument = {
  name: string;
  downloadUrl?: string;
};

export type ProcedureStep = {
  step: number;
  title: string;
  description: string;
};

export type Procedure = {
  id: string;
  slug: string;
  name: string;
  code: string;
  category: string;
  target: string;
  documents: ProcedureDocument[];
  steps: ProcedureStep[];
  processingTime: string;
  fee: string;
  result: string;
  forms: ProcedureDocument[];
  urlDvcQuocGia: string;
  urlDvcHcm: string;
  canSubmitOnline: boolean;
  popular?: boolean;
};

export const PROCEDURE_CATEGORIES = [
  'Hộ tịch',
  'Đất đai',
  'Xây dựng',
  'Kinh doanh',
  'Tư pháp',
  'Giáo dục',
  'Y tế',
  'Môi trường',
  'Giao thông',
  'Lao động - TBXH',
] as const;

export const procedures: Procedure[] = [
  {
    id: 'hotinh-001',
    slug: 'dang-ky-ket-hon',
    name: 'Đăng ký kết hôn',
    code: '1.004873',
    category: 'Hộ tịch',
    target: 'Công dân Việt Nam',
    documents: [
      { name: 'Tờ khai đăng ký kết hôn (theo mẫu)' },
      { name: 'Giấy xác nhận tình trạng hôn nhân (nếu khác nơi cư trú)' },
      { name: 'CMND/CCCD hoặc hộ chiếu của hai bên' },
    ],
    steps: [
      { step: 1, title: 'Chuẩn bị hồ sơ', description: 'Hai bên nam nữ chuẩn bị đầy đủ hồ sơ theo yêu cầu.' },
      { step: 2, title: 'Nộp hồ sơ', description: 'Nộp tại bộ phận Tư pháp – Hộ tịch UBND phường hoặc qua Cổng DVC.' },
      { step: 3, title: 'Xử lý hồ sơ', description: 'Cán bộ kiểm tra, xác minh hồ sơ.' },
      { step: 4, title: 'Nhận kết quả', description: 'Hai bên có mặt tại UBND phường để ký vào sổ đăng ký và nhận Giấy chứng nhận kết hôn.' },
    ],
    processingTime: 'Trong ngày làm việc (nếu hồ sơ hợp lệ)',
    fee: 'Miễn phí',
    result: 'Giấy chứng nhận kết hôn',
    forms: [{ name: 'Tờ khai đăng ký kết hôn', downloadUrl: '#' }],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/p/home/dvc-toan-trinh.html?ma_dich_vu=1.004873',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: true,
    popular: true,
  },
  {
    id: 'hotinh-002',
    slug: 'dang-ky-khai-sinh',
    name: 'Đăng ký khai sinh',
    code: '1.004746',
    category: 'Hộ tịch',
    target: 'Cha/mẹ hoặc người thân thích của trẻ',
    documents: [
      { name: 'Tờ khai đăng ký khai sinh (theo mẫu)' },
      { name: 'Giấy chứng sinh do cơ sở y tế cấp' },
      { name: 'CMND/CCCD của người đi khai sinh' },
    ],
    steps: [
      { step: 1, title: 'Chuẩn bị hồ sơ', description: 'Chuẩn bị giấy chứng sinh và tờ khai.' },
      { step: 2, title: 'Nộp hồ sơ', description: 'Nộp tại UBND phường nơi cư trú của trẻ.' },
      { step: 3, title: 'Nhận kết quả', description: 'Nhận Giấy khai sinh trong ngày.' },
    ],
    processingTime: 'Trong ngày làm việc',
    fee: 'Miễn phí',
    result: 'Giấy khai sinh',
    forms: [{ name: 'Tờ khai đăng ký khai sinh', downloadUrl: '#' }],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/p/home/dvc-toan-trinh.html?ma_dich_vu=1.004746',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: true,
    popular: true,
  },
  {
    id: 'hotinh-003',
    slug: 'dang-ky-khai-tu',
    name: 'Đăng ký khai tử',
    code: '1.004772',
    category: 'Hộ tịch',
    target: 'Người thân thích của người chết',
    documents: [
      { name: 'Tờ khai đăng ký khai tử (theo mẫu)' },
      { name: 'Giấy báo tử hoặc giấy tờ chứng minh sự kiện chết' },
    ],
    steps: [
      { step: 1, title: 'Chuẩn bị hồ sơ', description: 'Chuẩn bị giấy báo tử và tờ khai.' },
      { step: 2, title: 'Nộp hồ sơ', description: 'Nộp tại UBND phường nơi cư trú cuối cùng của người chết.' },
      { step: 3, title: 'Nhận kết quả', description: 'Nhận trích lục khai tử trong ngày.' },
    ],
    processingTime: 'Trong ngày làm việc',
    fee: 'Miễn phí',
    result: 'Trích lục khai tử',
    forms: [{ name: 'Tờ khai đăng ký khai tử', downloadUrl: '#' }],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/p/home/dvc-toan-trinh.html?ma_dich_vu=1.004772',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: true,
  },
  {
    id: 'hotinh-004',
    slug: 'cap-ban-sao-trich-luc-ho-tich',
    name: 'Cấp bản sao trích lục hộ tịch',
    code: '2.000635',
    category: 'Hộ tịch',
    target: 'Công dân có yêu cầu',
    documents: [
      { name: 'Tờ khai cấp bản sao trích lục hộ tịch (theo mẫu)' },
      { name: 'CMND/CCCD của người yêu cầu' },
    ],
    steps: [
      { step: 1, title: 'Nộp tờ khai', description: 'Nộp tờ khai tại UBND phường.' },
      { step: 2, title: 'Nhận kết quả', description: 'Nhận bản sao trích lục trong ngày.' },
    ],
    processingTime: 'Trong ngày làm việc',
    fee: '8.000 VNĐ/bản sao',
    result: 'Bản sao trích lục hộ tịch',
    forms: [{ name: 'Tờ khai yêu cầu cấp bản sao', downloadUrl: '#' }],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: true,
  },
  {
    id: 'tuphap-001',
    slug: 'chung-thuc-ban-sao-tu-ban-chinh',
    name: 'Chứng thực bản sao từ bản chính',
    code: '2.000794',
    category: 'Tư pháp',
    target: 'Cá nhân, tổ chức có yêu cầu',
    documents: [
      { name: 'Bản chính giấy tờ cần chứng thực' },
      { name: 'Bản sao cần chứng thực' },
    ],
    steps: [
      { step: 1, title: 'Mang bản chính', description: 'Mang bản chính và bản photo đến UBND phường.' },
      { step: 2, title: 'Nộp yêu cầu', description: 'Nộp tại bộ phận Tư pháp.' },
      { step: 3, title: 'Nhận kết quả', description: 'Nhận bản sao chứng thực trong ngày.' },
    ],
    processingTime: 'Trong ngày (không quá 2 ngày nếu số lượng lớn)',
    fee: '2.000 VNĐ/trang (từ trang thứ 3: 1.000 VNĐ/trang)',
    result: 'Bản sao chứng thực',
    forms: [],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: false,
    popular: true,
  },
  {
    id: 'tuphap-002',
    slug: 'chung-thuc-chu-ky',
    name: 'Chứng thực chữ ký',
    code: '2.000798',
    category: 'Tư pháp',
    target: 'Cá nhân có yêu cầu',
    documents: [
      { name: 'Giấy tờ cần chứng thực chữ ký' },
      { name: 'CMND/CCCD của người yêu cầu' },
    ],
    steps: [
      { step: 1, title: 'Chuẩn bị giấy tờ', description: 'Mang giấy tờ cần chứng thực chữ ký.' },
      { step: 2, title: 'Ký trước mặt cán bộ', description: 'Ký tên vào giấy tờ trước mặt cán bộ phường.' },
      { step: 3, title: 'Nhận kết quả', description: 'Nhận giấy tờ đã chứng thực chữ ký.' },
    ],
    processingTime: 'Trong ngày làm việc',
    fee: '10.000 VNĐ/trường hợp',
    result: 'Giấy tờ có chữ ký được chứng thực',
    forms: [],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: false,
  },
  {
    id: 'datdai-001',
    slug: 'xac-nhan-thay-doi-thong-tin-dat-dai',
    name: 'Xác nhận thay đổi thông tin đất đai trên sổ hồng',
    code: '1.003456',
    category: 'Đất đai',
    target: 'Chủ sở hữu đất/nhà',
    documents: [
      { name: 'Đơn đề nghị xác nhận thay đổi' },
      { name: 'Giấy chứng nhận quyền sử dụng đất (bản gốc)' },
      { name: 'Giấy tờ chứng minh thay đổi (quyết định đổi tên đường, số nhà...)' },
    ],
    steps: [
      { step: 1, title: 'Nộp hồ sơ', description: 'Nộp tại bộ phận Một cửa UBND phường.' },
      { step: 2, title: 'Thẩm định', description: 'Cán bộ địa chính xác minh thực tế.' },
      { step: 3, title: 'Nhận kết quả', description: 'Nhận giấy xác nhận thay đổi.' },
    ],
    processingTime: '10 ngày làm việc',
    fee: 'Miễn phí',
    result: 'Giấy xác nhận thay đổi thông tin trên sổ hồng',
    forms: [{ name: 'Đơn đề nghị xác nhận', downloadUrl: '#' }],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: false,
    popular: true,
  },
  {
    id: 'xaydung-001',
    slug: 'cap-giay-phep-xay-dung-nha-o-rieng-le',
    name: 'Cấp giấy phép xây dựng nhà ở riêng lẻ',
    code: '1.009994',
    category: 'Xây dựng',
    target: 'Chủ sở hữu đất',
    documents: [
      { name: 'Đơn đề nghị cấp giấy phép xây dựng' },
      { name: 'Giấy tờ về quyền sử dụng đất' },
      { name: 'Bản vẽ thiết kế xây dựng (2 bộ)' },
      { name: 'Ảnh chụp hiện trạng' },
    ],
    steps: [
      { step: 1, title: 'Nộp hồ sơ', description: 'Nộp tại UBND quận/huyện (phường xác nhận hiện trạng).' },
      { step: 2, title: 'Thẩm định', description: 'Cơ quan thẩm định hồ sơ thiết kế.' },
      { step: 3, title: 'Nhận kết quả', description: 'Nhận giấy phép xây dựng.' },
    ],
    processingTime: '15 ngày làm việc',
    fee: '75.000 VNĐ',
    result: 'Giấy phép xây dựng',
    forms: [{ name: 'Đơn đề nghị cấp GPXD', downloadUrl: '#' }],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: true,
  },
  {
    id: 'kinhdoanh-001',
    slug: 'dang-ky-ho-kinh-doanh',
    name: 'Đăng ký hộ kinh doanh',
    code: '2.001954',
    category: 'Kinh doanh',
    target: 'Cá nhân, nhóm cá nhân, hộ gia đình',
    documents: [
      { name: 'Giấy đề nghị đăng ký hộ kinh doanh' },
      { name: 'CMND/CCCD của chủ hộ kinh doanh' },
      { name: 'Biên bản họp nhóm (nếu nhiều người góp vốn)' },
    ],
    steps: [
      { step: 1, title: 'Chuẩn bị hồ sơ', description: 'Chuẩn bị đầy đủ giấy tờ theo yêu cầu.' },
      { step: 2, title: 'Nộp hồ sơ', description: 'Nộp tại UBND quận/huyện (qua phường).' },
      { step: 3, title: 'Nhận kết quả', description: 'Nhận Giấy chứng nhận đăng ký hộ kinh doanh.' },
    ],
    processingTime: '3 ngày làm việc',
    fee: '100.000 VNĐ',
    result: 'Giấy chứng nhận đăng ký hộ kinh doanh',
    forms: [{ name: 'Giấy đề nghị đăng ký hộ KD', downloadUrl: '#' }],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: true,
    popular: true,
  },
  {
    id: 'laodong-001',
    slug: 'xac-nhan-ho-ngheo-ho-can-ngheo',
    name: 'Xác nhận hộ nghèo, hộ cận nghèo',
    code: '2.001589',
    category: 'Lao động - TBXH',
    target: 'Hộ gia đình',
    documents: [
      { name: 'Đơn đề nghị xác nhận hộ nghèo/cận nghèo' },
      { name: 'Sổ hộ khẩu (bản sao)' },
      { name: 'CMND/CCCD chủ hộ' },
    ],
    steps: [
      { step: 1, title: 'Nộp đơn', description: 'Nộp tại UBND phường.' },
      { step: 2, title: 'Xác minh', description: 'Cán bộ phường đến xác minh thực tế.' },
      { step: 3, title: 'Xét duyệt', description: 'Hội đồng xét duyệt tại phường.' },
      { step: 4, title: 'Nhận kết quả', description: 'Nhận giấy xác nhận.' },
    ],
    processingTime: '10 ngày làm việc',
    fee: 'Miễn phí',
    result: 'Giấy xác nhận hộ nghèo/cận nghèo',
    forms: [{ name: 'Đơn đề nghị xác nhận', downloadUrl: '#' }],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: false,
  },
  {
    id: 'yte-001',
    slug: 'xac-nhan-chua-benh-cho-nguoi-ngheo',
    name: 'Xác nhận chữa bệnh cho người nghèo',
    code: '1.003580',
    category: 'Y tế',
    target: 'Người thuộc hộ nghèo, cận nghèo',
    documents: [
      { name: 'Đơn xin xác nhận (theo mẫu)' },
      { name: 'Giấy xác nhận hộ nghèo/cận nghèo' },
      { name: 'CMND/CCCD' },
    ],
    steps: [
      { step: 1, title: 'Nộp đơn', description: 'Nộp đơn tại UBND phường.' },
      { step: 2, title: 'Xác nhận', description: 'UBND phường xác nhận và ký.' },
      { step: 3, title: 'Nhận kết quả', description: 'Nhận giấy xác nhận trong ngày.' },
    ],
    processingTime: 'Trong ngày làm việc',
    fee: 'Miễn phí',
    result: 'Giấy xác nhận',
    forms: [{ name: 'Đơn xin xác nhận', downloadUrl: '#' }],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: false,
  },
  {
    id: 'moitruong-001',
    slug: 'xac-nhan-dang-ky-ke-hoach-bao-ve-moi-truong',
    name: 'Xác nhận đăng ký kế hoạch bảo vệ môi trường',
    code: '2.001266',
    category: 'Môi trường',
    target: 'Chủ dự án, cơ sở sản xuất kinh doanh',
    documents: [
      { name: 'Kế hoạch bảo vệ môi trường (3 bản)' },
      { name: 'Báo cáo đầu tư dự án' },
    ],
    steps: [
      { step: 1, title: 'Nộp hồ sơ', description: 'Nộp tại UBND phường/quận.' },
      { step: 2, title: 'Thẩm định', description: 'Cơ quan chuyên môn thẩm định.' },
      { step: 3, title: 'Nhận kết quả', description: 'Nhận giấy xác nhận.' },
    ],
    processingTime: '10 ngày làm việc',
    fee: 'Miễn phí',
    result: 'Giấy xác nhận đăng ký kế hoạch BVMT',
    forms: [],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: false,
  },
  {
    id: 'hotinh-005',
    slug: 'dang-ky-nhan-cha-me-con',
    name: 'Đăng ký nhận cha, mẹ, con',
    code: '1.004845',
    category: 'Hộ tịch',
    target: 'Công dân Việt Nam',
    documents: [
      { name: 'Tờ khai đăng ký nhận cha/mẹ/con (theo mẫu)' },
      { name: 'Chứng cứ chứng minh quan hệ cha/mẹ/con' },
      { name: 'CMND/CCCD các bên' },
    ],
    steps: [
      { step: 1, title: 'Nộp hồ sơ', description: 'Nộp tại UBND phường.' },
      { step: 2, title: 'Xác minh', description: 'Cán bộ xác minh chứng cứ.' },
      { step: 3, title: 'Nhận kết quả', description: 'Nhận trích lục đăng ký nhận cha/mẹ/con.' },
    ],
    processingTime: '3 ngày làm việc',
    fee: 'Miễn phí',
    result: 'Trích lục đăng ký nhận cha, mẹ, con',
    forms: [{ name: 'Tờ khai nhận cha/mẹ/con', downloadUrl: '#' }],
    urlDvcQuocGia: 'https://dichvucong.gov.vn/',
    urlDvcHcm: 'https://dichvucong.hochiminhcity.gov.vn/',
    canSubmitOnline: true,
    popular: true,
  },
];
