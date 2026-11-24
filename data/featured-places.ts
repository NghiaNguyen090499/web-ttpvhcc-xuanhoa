export const FEATURED_PLACES_MAP_ID = '1UUIrmBXAXwRRTm6ihEXdisbRusP2OwI'

export type FeaturedPlaceCategory = 'heritage' | 'architecture' | 'culture' | 'community' | 'public-service' | 'election'
export type FeaturedPlaceLayer = 'discovery' | 'public-service' | 'election'

export type FeaturedPlace = {
  id: string
  name: string
  category: FeaturedPlaceCategory
  layer: FeaturedPlaceLayer
  address: string
  summary: string
  latitude: number
  longitude: number
  isFeatured?: boolean
  image?: {
    src: string
    alt: string
    attribution: string
    license: string
    sourceUrl: string
  }
}

export type FeaturedJourneyTheme = 'history' | 'architecture' | 'faith' | 'family'

export type FeaturedJourneyStop = {
  placeId: string
  minutesFromPrevious?: number
  label: string
  narrative: string
  lookCloser?: string
}

export type FeaturedJourney = {
  slug: string
  title: string
  eyebrow: string
  tagline: string
  description: string
  theme: FeaturedJourneyTheme
  durationMinutes: number
  distanceKm: number
  bestTime: string
  difficulty: string
  coverPlaceId: string
  color: string
  highlights: string[]
  stops: FeaturedJourneyStop[]
  notice?: string
}

export const FEATURED_PLACE_CATEGORIES: Record<FeaturedPlaceCategory, { label: string; description: string; color: string }> = {
  heritage: {
    label: 'Địa chỉ đỏ & di sản',
    description: 'Những dấu mốc lịch sử, tín ngưỡng và ký ức đô thị.',
    color: 'bg-[#b84b3e] text-white',
  },
  architecture: {
    label: 'Kiến trúc & giáo dục',
    description: 'Những công trình ghi dấu diện mạo đô thị và tri thức.',
    color: 'bg-[#b47718] text-white',
  },
  culture: {
    label: 'Văn hóa & tín ngưỡng',
    description: 'Không gian gìn giữ đời sống tinh thần của cộng đồng.',
    color: 'bg-[#7651a6] text-white',
  },
  community: {
    label: 'Cộng đồng & không gian xanh',
    description: 'Điểm hẹn học tập, sinh hoạt và kết nối cộng đồng.',
    color: 'bg-[#177454] text-white',
  },
  'public-service': {
    label: 'Phục vụ người dân',
    description: 'Các địa điểm hành chính và y tế thiết yếu.',
    color: 'bg-primary text-white',
  },
  election: {
    label: 'Điểm bỏ phiếu',
    description: 'Các khu vực bỏ phiếu được công bố trên bản đồ số của phường.',
    color: 'bg-[#7d3f98] text-white',
  },
}

// Dữ liệu khởi đầu được chuẩn hóa từ Google My Maps do phường cung cấp.
// Mỗi địa điểm cần được cán bộ phụ trách xác thực trước khi bổ sung nội dung chuyên sâu.
export const FEATURED_PLACES: FeaturedPlace[] = [
  {
    id: 'pho-binh',
    name: 'Phở Bình – Sở chỉ huy tiền phương Phân khu 6',
    category: 'heritage',
    layer: 'discovery',
    address: '7 Lý Chính Thắng, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Một địa chỉ đỏ gắn với ký ức về cuộc Tổng tiến công và nổi dậy Xuân Mậu Thân 1968 giữa lòng Sài Gòn.',
    latitude: 10.7908803,
    longitude: 106.6871296,
    isFeatured: true,
  },
  {
    id: 'chua-xa-loi',
    name: 'Chùa Xá Lợi',
    category: 'heritage',
    layer: 'discovery',
    address: '89 Bà Huyện Thanh Quan, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Công trình tôn giáo, văn hóa tiêu biểu nằm trong không gian đô thị trung tâm của phường.',
    latitude: 10.778296,
    longitude: 106.6865804,
    isFeatured: true,
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Xa_Loi_Pagoda_%289982349464%29.jpg/1920px-Xa_Loi_Pagoda_%289982349464%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
      alt: 'Chùa Xá Lợi tại Thành phố Hồ Chí Minh',
      attribution: 'Gary Todd',
      license: 'CC0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Xa_Loi_Pagoda_(9982349464).jpg',
    },
  },
  {
    id: 'dinh-xuan-hoa',
    name: 'Đình Xuân Hòa',
    category: 'heritage',
    layer: 'discovery',
    address: '129 Lý Chính Thắng, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Không gian tín ngưỡng truyền thống, lưu giữ một lớp ký ức của vùng đất Xuân Hòa.',
    latitude: 10.786517,
    longitude: 106.684868,
  },
  {
    id: 'thuy-dai',
    name: 'Thủy Đài',
    category: 'architecture',
    layer: 'discovery',
    address: '1 Công trường Quốc Tế, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Dấu ấn kiến trúc quen thuộc tại khu vực Công trường Quốc Tế, một trong các điểm nhận diện đô thị của phường.',
    latitude: 10.7828912,
    longitude: 106.6954116,
    isFeatured: true,
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Ho_con_rua-_saigon-_dyt_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
      alt: 'Khu vực Hồ Con Rùa, gần Công trường Quốc Tế',
      attribution: 'trungydang',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ho_con_rua-_saigon-_dyt_-_panoramio.jpg',
    },
  },
  {
    id: 'thpt-nguyen-thi-minh-khai',
    name: 'Trường THPT Nguyễn Thị Minh Khai',
    category: 'architecture',
    layer: 'discovery',
    address: '275 Điện Biên Phủ, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Một công trình giáo dục lâu đời, góp phần tạo nên diện mạo tri thức của khu vực trung tâm.',
    latitude: 10.77926,
    longitude: 106.6869808,
  },
  {
    id: 'thpt-marie-curie',
    name: 'Trường THPT Marie Curie',
    category: 'architecture',
    layer: 'discovery',
    address: '159 Nam Kỳ Khởi Nghĩa, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Công trình giáo dục có kiến trúc đặc trưng, nằm trên trục đường Nam Kỳ Khởi Nghĩa.',
    latitude: 10.7824378,
    longitude: 106.6908122,
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Main_gate_of_Marie_Curie_high_school_in_Ho_Chi_Minh_city.JPG/1920px-Main_gate_of_Marie_Curie_high_school_in_Ho_Chi_Minh_city.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
      alt: 'Cổng Trường THPT Marie Curie tại Thành phố Hồ Chí Minh',
      attribution: 'Ngô Trung',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Main_gate_of_Marie_Curie_high_school_in_Ho_Chi_Minh_city.JPG',
    },
  },
  {
    id: 'vien-pasteur',
    name: 'Viện Pasteur Thành phố Hồ Chí Minh',
    category: 'architecture',
    layer: 'discovery',
    address: '167 Pasteur, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Công trình y tế – khoa học tiêu biểu góp phần tạo nên chiều sâu lịch sử của tuyến đường Pasteur.',
    latitude: 10.786221,
    longitude: 106.6889408,
  },
  {
    id: 'bao-tang-chung-tich-chien-tranh',
    name: 'Bảo tàng Chứng tích Chiến tranh',
    category: 'culture',
    layer: 'discovery',
    address: '28 Võ Văn Tần, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm đến văn hóa – lịch sử, giúp công chúng tiếp cận tư liệu và ký ức về chiến tranh.',
    latitude: 10.7795106,
    longitude: 106.6920916,
    isFeatured: true,
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Helic%C3%B3ptero_CH-47_Chinook%2C_Museo_de_los_Vestigios_de_la_Guerra_de_Vietnam%2C_Ciudad_Ho_Chi_Minh%2C_Vietnam%2C_2013-08-14%2C_DD_01.JPG/1920px-Helic%C3%B3ptero_CH-47_Chinook%2C_Museo_de_los_Vestigios_de_la_Guerra_de_Vietnam%2C_Ciudad_Ho_Chi_Minh%2C_Vietnam%2C_2013-08-14%2C_DD_01.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
      alt: 'Hiện vật trưng bày ngoài trời tại Bảo tàng Chứng tích Chiến tranh',
      attribution: 'Diego Delso',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Helic%C3%B3ptero_CH-47_Chinook,_Museo_de_los_Vestigios_de_la_Guerra_de_Vietnam,_Ciudad_Ho_Chi_Minh,_Vietnam,_2013-08-14,_DD_01.JPG',
    },
  },
  {
    id: 'bao-tang-phu-nu-nam-bo',
    name: 'Bảo tàng Phụ nữ Nam Bộ',
    category: 'culture',
    layer: 'discovery',
    address: '202 Võ Thị Sáu, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Không gian giới thiệu những câu chuyện, đóng góp và di sản của phụ nữ Nam Bộ.',
    latitude: 10.7836813,
    longitude: 106.6876327,
  },
  {
    id: 'chua-chantarangsay',
    name: 'Chùa Chantarangsay',
    category: 'culture',
    layer: 'discovery',
    address: '164/235 Trần Quốc Thảo, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Một không gian Phật giáo Khmer, bổ sung sắc màu văn hóa đa dạng cho phường Xuân Hòa.',
    latitude: 10.7862451,
    longitude: 106.6828111,
  },
  {
    id: 'chua-vinh-nghiem',
    name: 'Chùa Vĩnh Nghiêm',
    category: 'culture',
    layer: 'discovery',
    address: '339 Nam Kỳ Khởi Nghĩa, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Tổ đình và không gian sinh hoạt văn hóa, tâm linh quen thuộc của người dân thành phố.',
    latitude: 10.7902211,
    longitude: 106.6821485,
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Chua_Vinh_nghiem%2C_tphcm_vietnam_-_panoramio_%281%29.jpg/1920px-Chua_Vinh_nghiem%2C_tphcm_vietnam_-_panoramio_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
      alt: 'Chùa Vĩnh Nghiêm tại Thành phố Hồ Chí Minh',
      attribution: 'trungydang',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chua_Vinh_nghiem,_tphcm_vietnam_-_panoramio_(1).jpg',
    },
  },
  {
    id: 'nha-thieu-nhi',
    name: 'Nhà Thiếu nhi Thành phố Hồ Chí Minh',
    category: 'community',
    layer: 'discovery',
    address: '169 Nam Kỳ Khởi Nghĩa, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Không gian học tập, sáng tạo và sinh hoạt dành cho thiếu nhi, nằm trong mạch văn hóa của phường.',
    latitude: 10.7837994,
    longitude: 106.6886,
  },
  {
    id: 'cong-vien-phan-dinh-phung',
    name: 'Công viên Phan Đình Phùng',
    category: 'community',
    layer: 'discovery',
    address: 'Khu vực Phan Đình Phùng, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Không gian xanh, phục vụ nhu cầu nghỉ ngơi, vận động và gặp gỡ của cộng đồng.',
    latitude: 10.7667133,
    longitude: 106.6863113,
  },
  {
    id: 'ttpvhcc',
    name: 'Trung tâm Phục vụ Hành chính công phường Xuân Hòa',
    category: 'public-service',
    layer: 'public-service',
    address: '99 Trần Quốc Thảo, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm tiếp nhận và hỗ trợ thực hiện thủ tục hành chính cho người dân, tổ chức.',
    latitude: 10.7827395,
    longitude: 106.6863035,
  },
  {
    id: 'tram-y-te',
    name: 'Trạm Y tế phường Xuân Hòa',
    category: 'public-service',
    layer: 'public-service',
    address: '18 Võ Văn Tần, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm cung cấp dịch vụ y tế ban đầu cho người dân trên địa bàn.',
    latitude: 10.7802321,
    longitude: 106.6930853,
  },
  {
    id: 'tru-so-dang-uy-hdnd-ubnd-ubmttq',
    name: 'Trụ sở Đảng ủy – HĐND – UBND – UBMTTQ phường Xuân Hòa',
    category: 'public-service',
    layer: 'public-service',
    address: '99–99A Trần Quốc Thảo, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Trụ sở làm việc của các cơ quan lãnh đạo, chính quyền và Mặt trận Tổ quốc phường Xuân Hòa.',
    latitude: 10.7828306,
    longitude: 106.6862721,
  },
  {
    id: 'ban-chi-huy-quan-su',
    name: 'Ban Chỉ huy Quân sự phường Xuân Hòa',
    category: 'public-service',
    layer: 'public-service',
    address: '234 Điện Biên Phủ, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Địa điểm làm việc của Ban Chỉ huy Quân sự phường Xuân Hòa.',
    latitude: 10.7810706,
    longitude: 106.6880139,
  },
  {
    id: 'cong-an-phuong',
    name: 'Công an phường Xuân Hòa',
    category: 'public-service',
    layer: 'public-service',
    address: '18 Huỳnh Tịnh Của, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Trụ sở Công an phường, phục vụ công tác bảo đảm an ninh, trật tự trên địa bàn.',
    latitude: 10.7892753,
    longitude: 106.6876066,
  },
  {
    id: 'trung-tam-chinh-tri',
    name: 'Trung tâm Chính trị phường Xuân Hòa',
    category: 'public-service',
    layer: 'public-service',
    address: '146 Võ Thị Sáu, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Địa điểm tổ chức hoạt động đào tạo, bồi dưỡng và sinh hoạt chính trị trên địa bàn phường.',
    latitude: 10.7876212,
    longitude: 106.6905764,
  },
  {
    id: 'benh-vien-mat-tphcm',
    name: 'Bệnh viện Mắt Thành phố Hồ Chí Minh',
    category: 'architecture',
    layer: 'discovery',
    address: '280 Điện Biên Phủ, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Một cơ sở y tế chuyên khoa lâu đời, được bản đồ phường ghi nhận trong nhóm công trình kiến trúc nghệ thuật cấp thành phố.',
    latitude: 10.7783772,
    longitude: 106.6850989,
  },
  {
    id: 'toa-tong-giam-muc-sai-gon',
    name: 'Tòa Tổng Giám mục Sài Gòn',
    category: 'culture',
    layer: 'discovery',
    address: '180 Nguyễn Đình Chiểu, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Một địa điểm tôn giáo và kiến trúc góp phần làm nên sự đa dạng văn hóa của khu vực trung tâm.',
    latitude: 10.7798056,
    longitude: 106.6907594,
  },
  {
    id: 'thien-vien-quang-duc',
    name: 'Văn phòng 2 Trung ương Giáo hội Phật giáo Việt Nam – Thiền viện Quảng Đức',
    category: 'culture',
    layer: 'discovery',
    address: '294 Nam Kỳ Khởi Nghĩa, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Không gian Phật giáo và địa điểm làm việc của Văn phòng 2 Trung ương Giáo hội Phật giáo Việt Nam.',
    latitude: 10.790381,
    longitude: 106.684,
  },
  {
    id: 'van-phong-hoi-dong-giam-muc',
    name: 'Văn phòng Hội đồng Giám mục Việt Nam',
    category: 'culture',
    layer: 'discovery',
    address: '72/12 Trần Quốc Toản, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Địa điểm hoạt động của Hội đồng Giám mục Việt Nam trên địa bàn phường Xuân Hòa.',
    latitude: 10.7877355,
    longitude: 106.6873116,
  },
  {
    id: 'nha-tho-nu-tuong-nguyen-thi-dinh',
    name: 'Nhà thờ Nữ tướng Nguyễn Thị Định',
    category: 'culture',
    layer: 'discovery',
    address: '218 Pasteur, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Một địa điểm được ghi nhận trên bản đồ số của phường, gắn với tên tuổi Nữ tướng Nguyễn Thị Định.',
    latitude: 10.783913,
    longitude: 106.6929864,
  },
  {
    id: 'mam-non-xuan-hoa',
    name: 'Trường Mầm non Xuân Hòa',
    category: 'community',
    layer: 'discovery',
    address: '32 Bis Nguyễn Thị Diệu, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Cơ sở giáo dục mầm non mang tên phường, phục vụ trẻ em và các gia đình trên địa bàn.',
    latitude: 10.7755536,
    longitude: 106.6880661,
  },
  {
    id: 'bo-phieu-01',
    name: 'Khu vực bỏ phiếu số 1 – Khu phố 1, 2',
    category: 'election',
    layer: 'election',
    address: 'Nhà Truyền thống Quận 3, 39 Trần Quốc Thảo, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 1 và Khu phố 2 theo bản đồ số của phường.',
    latitude: 10.7794789,
    longitude: 106.6899738,
  },
  {
    id: 'bo-phieu-02',
    name: 'Khu vực bỏ phiếu số 2 – Khu phố 7',
    category: 'election',
    layer: 'election',
    address: 'Trường Mẫu giáo Tuổi Thơ 7, 125 Trương Định, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 7 theo bản đồ số của phường.',
    latitude: 10.7809581,
    longitude: 106.6855006,
  },
  {
    id: 'bo-phieu-03',
    name: 'Khu vực bỏ phiếu số 3 – Khu phố 3, 4',
    category: 'election',
    layer: 'election',
    address: 'Trường Tiểu học Trần Quốc Thảo, 6 Võ Văn Tần, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 3 và Khu phố 4 theo bản đồ số của phường.',
    latitude: 10.7819045,
    longitude: 106.695008,
  },
  {
    id: 'bo-phieu-04',
    name: 'Khu vực bỏ phiếu số 4 – Khu phố 5, 10',
    category: 'election',
    layer: 'election',
    address: 'Học viện Cán bộ TP.HCM – Cơ sở 3, hẻm 146 Võ Thị Sáu, phường Xuân Hòa',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 5 và Khu phố 10 theo bản đồ số của phường.',
    latitude: 10.7876116,
    longitude: 106.6905776,
  },
  {
    id: 'bo-phieu-05',
    name: 'Khu vực bỏ phiếu số 5 – Khu phố 6, 9, 12',
    category: 'election',
    layer: 'election',
    address: 'Trường Tiểu học Nguyễn Thanh Tuyền, 183 Nam Kỳ Khởi Nghĩa, phường Xuân Hòa',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 6, Khu phố 9 và Khu phố 12 theo bản đồ số của phường.',
    latitude: 10.7858222,
    longitude: 106.6879599,
  },
  {
    id: 'bo-phieu-06',
    name: 'Khu vực bỏ phiếu số 6 – Khu phố 11, 13',
    category: 'election',
    layer: 'election',
    address: 'Trường THPT Nguyễn Thị Diệu, 12 Trần Quốc Toản, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 11 và Khu phố 13 theo bản đồ số của phường.',
    latitude: 10.7893599,
    longitude: 106.6891886,
  },
  {
    id: 'bo-phieu-07',
    name: 'Khu vực bỏ phiếu số 7 – Khu phố 14, 15',
    category: 'election',
    layer: 'election',
    address: 'Trường Tiểu học Nguyễn Thái Sơn, 18 Trần Quốc Toản, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 14 và Khu phố 15 theo bản đồ số của phường.',
    latitude: 10.7888058,
    longitude: 106.6889162,
  },
  {
    id: 'bo-phieu-08',
    name: 'Khu vực bỏ phiếu số 8 – Khu phố 16, 17',
    category: 'election',
    layer: 'election',
    address: 'Trường Tiểu học Nguyễn Thái Sơn, 12 Huỳnh Tịnh Của, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 16 và Khu phố 17 theo bản đồ số của phường.',
    latitude: 10.7888388,
    longitude: 106.6880972,
  },
  {
    id: 'bo-phieu-09',
    name: 'Khu vực bỏ phiếu số 9 – Khu phố 18, 19',
    category: 'election',
    layer: 'election',
    address: 'Thiền viện Quảng Đức, 294 Nam Kỳ Khởi Nghĩa, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 18 và Khu phố 19 theo bản đồ số của phường.',
    latitude: 10.7903955,
    longitude: 106.6836594,
  },
  {
    id: 'bo-phieu-10',
    name: 'Khu vực bỏ phiếu số 10 – Khu phố 8, 22',
    category: 'election',
    layer: 'election',
    address: 'Trường Mầm non 7, 148/22 Lý Chính Thắng, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 8 và Khu phố 22 theo bản đồ số của phường.',
    latitude: 10.7868295,
    longitude: 106.6839614,
  },
  {
    id: 'bo-phieu-11',
    name: 'Khu vực bỏ phiếu số 11 – Khu phố 23, 24',
    category: 'election',
    layer: 'election',
    address: 'Chùa Chantarangsay, hẻm 164/235 Trần Quốc Thảo, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 23 và Khu phố 24; số nhà được chuẩn hóa theo marker địa điểm chính.',
    latitude: 10.786259,
    longitude: 106.6828253,
  },
  {
    id: 'bo-phieu-12',
    name: 'Khu vực bỏ phiếu số 12 – Khu phố 20, 21',
    category: 'election',
    layer: 'election',
    address: 'Chùa Vĩnh Nghiêm, 339 Nam Kỳ Khởi Nghĩa, phường Xuân Hòa, TP. Hồ Chí Minh',
    summary: 'Điểm bỏ phiếu phục vụ cử tri thuộc Khu phố 20 và Khu phố 21 theo bản đồ số của phường.',
    latitude: 10.7907388,
    longitude: 106.6826098,
  },
]

// Các tuyến dưới đây là đề xuất nội dung giai đoạn đầu. Khoảng cách và thời lượng
// cần được cán bộ phụ trách kiểm tra thực địa trước khi công bố như hướng dẫn chính thức.
export const FEATURED_JOURNEYS: FeaturedJourney[] = [
  {
    slug: 'ky-uc-giua-long-do-thi',
    title: 'Ký ức giữa lòng đô thị',
    eyebrow: 'Hành trình 01 · Lịch sử',
    tagline: 'Đi qua những địa chỉ lưu giữ ký ức của thành phố trong nhịp sống Xuân Hòa hôm nay.',
    description: 'Một tuyến khám phá dành cho người muốn hiểu Xuân Hòa bằng những câu chuyện lịch sử, đời sống và ký ức cộng đồng còn hiện diện giữa các con phố trung tâm.',
    theme: 'history',
    durationMinutes: 120,
    distanceKm: 2.6,
    bestTime: 'Buổi sáng hoặc đầu giờ chiều',
    difficulty: 'Dễ · chủ yếu đi bộ đô thị',
    coverPlaceId: 'bao-tang-chung-tich-chien-tranh',
    color: '#a33b32',
    highlights: ['Địa chỉ đỏ Phở Bình', 'Câu chuyện phụ nữ Nam Bộ', 'Không gian ký ức chiến tranh'],
    stops: [
      {
        placeId: 'pho-binh',
        label: 'Nơi câu chuyện bắt đầu',
        narrative: 'Khởi đầu tại một địa chỉ đỏ gắn với cuộc Tổng tiến công và nổi dậy Xuân Mậu Thân 1968, nằm bình dị giữa nhịp sống thường ngày.',
        lookCloser: 'Quan sát cách một địa điểm đời thường có thể đồng thời mang trong mình một lớp ký ức lịch sử.',
      },
      {
        placeId: 'bao-tang-phu-nu-nam-bo',
        minutesFromPrevious: 18,
        label: 'Những câu chuyện ít được kể',
        narrative: 'Tiếp cận đóng góp và di sản của phụ nữ Nam Bộ qua các tư liệu, hiện vật và câu chuyện được gìn giữ tại bảo tàng.',
      },
      {
        placeId: 'chua-xa-loi',
        minutesFromPrevious: 12,
        label: 'Một khoảng lặng trong đô thị',
        narrative: 'Dừng lại ở không gian văn hóa, tôn giáo tiêu biểu để cảm nhận một nhịp khác của khu vực trung tâm.',
        lookCloser: 'Dành thời gian quan sát tỷ lệ kiến trúc, khoảng sân và mối quan hệ giữa công trình với phố xung quanh.',
      },
      {
        placeId: 'bao-tang-chung-tich-chien-tranh',
        minutesFromPrevious: 16,
        label: 'Khép lại bằng suy ngẫm',
        narrative: 'Điểm cuối giúp người xem tiếp cận tư liệu và ký ức chiến tranh trong một không gian trưng bày chuyên sâu.',
      },
    ],
    notice: 'Nội dung liên quan đến chiến tranh cần được tiếp cận với thái độ tôn trọng. Thời gian tham quan bảo tàng chưa được tính đầy đủ trong ước lượng tuyến.',
  },
  {
    slug: 'dau-an-kien-truc-va-tri-thuc',
    title: 'Dấu ấn kiến trúc và tri thức',
    eyebrow: 'Hành trình 02 · Kiến trúc',
    tagline: 'Đọc diện mạo Xuân Hòa qua trường học, công trình khoa học và những dấu mốc đô thị.',
    description: 'Một hành trình nối các công trình giáo dục, khoa học và kiến trúc quen thuộc, cho thấy chiều sâu tri thức trong diện mạo phường Xuân Hòa.',
    theme: 'architecture',
    durationMinutes: 150,
    distanceKm: 3.8,
    bestTime: '7:00–10:00 hoặc 15:30–17:30',
    difficulty: 'Vừa · tuyến đi bộ dài',
    coverPlaceId: 'thuy-dai',
    color: '#a76612',
    highlights: ['Viện Pasteur', 'Hai trường học lâu đời', 'Thủy Đài – dấu mốc đô thị'],
    stops: [
      {
        placeId: 'vien-pasteur',
        label: 'Tri thức khoa học giữa lòng phường',
        narrative: 'Bắt đầu từ công trình y tế – khoa học tiêu biểu trên tuyến đường Pasteur, một dấu ấn lâu đời của khu vực.',
      },
      {
        placeId: 'dinh-xuan-hoa',
        minutesFromPrevious: 12,
        label: 'Lớp nền truyền thống',
        narrative: 'Đình Xuân Hòa gợi mở lớp ký ức tín ngưỡng truyền thống nằm bên dưới diện mạo đô thị hiện đại.',
      },
      {
        placeId: 'thpt-marie-curie',
        minutesFromPrevious: 16,
        label: 'Một biểu tượng giáo dục',
        narrative: 'Quan sát công trình giáo dục có kiến trúc đặc trưng trên trục Nam Kỳ Khởi Nghĩa.',
        lookCloser: 'Chú ý nhịp cổng, hàng cây và tỷ lệ các khối kiến trúc nhìn từ vỉa hè đối diện.',
      },
      {
        placeId: 'nha-thieu-nhi',
        minutesFromPrevious: 5,
        label: 'Không gian của thế hệ mới',
        narrative: 'Một điểm nối hiện tại và tương lai qua hoạt động học tập, sáng tạo và sinh hoạt dành cho thiếu nhi.',
      },
      {
        placeId: 'thpt-nguyen-thi-minh-khai',
        minutesFromPrevious: 12,
        label: 'Dòng chảy giáo dục tiếp nối',
        narrative: 'Thêm một công trình giáo dục lâu đời góp phần hình thành diện mạo tri thức của khu vực trung tâm.',
      },
      {
        placeId: 'thuy-dai',
        minutesFromPrevious: 22,
        label: 'Dấu chấm đô thị',
        narrative: 'Khép lại ở Công trường Quốc Tế, nơi Thủy Đài trở thành một điểm nhận diện quen thuộc trong ký ức thị giác của thành phố.',
      },
    ],
    notice: 'Các trường học và cơ sở chuyên môn có thể hạn chế quyền vào bên trong; hành trình ưu tiên quan sát từ không gian công cộng.',
  },
  {
    slug: 'da-sac-tin-nguong-xuan-hoa',
    title: 'Đa sắc tín ngưỡng Xuân Hòa',
    eyebrow: 'Hành trình 03 · Văn hóa',
    tagline: 'Một tuyến đi bộ chậm qua những không gian tinh thần cùng tồn tại trong lòng phường.',
    description: 'Từ Phật giáo Bắc tông, Phật giáo Khmer đến tín ngưỡng đình làng, hành trình gợi mở sự đa dạng văn hóa bằng một cách tiếp cận tĩnh lặng và tôn trọng.',
    theme: 'faith',
    durationMinutes: 90,
    distanceKm: 2,
    bestTime: 'Buổi sáng, tránh giờ hành lễ',
    difficulty: 'Dễ · nhịp khám phá chậm',
    coverPlaceId: 'chua-xa-loi',
    color: '#66509a',
    highlights: ['Chùa Vĩnh Nghiêm', 'Không gian Phật giáo Khmer', 'Đình Xuân Hòa', 'Chùa Xá Lợi'],
    stops: [
      {
        placeId: 'chua-vinh-nghiem',
        label: 'Khởi đầu trong không gian tĩnh',
        narrative: 'Bắt đầu tại một tổ đình và không gian sinh hoạt văn hóa, tâm linh quen thuộc của người dân thành phố.',
      },
      {
        placeId: 'chua-chantarangsay',
        minutesFromPrevious: 14,
        label: 'Sắc màu văn hóa Khmer',
        narrative: 'Một điểm dừng giúp nhận ra sự đa dạng của đời sống văn hóa, tôn giáo ngay trong cùng một địa bàn đô thị.',
        lookCloser: 'Quan sát ngôn ngữ tạo hình khác biệt, nhưng giữ khoảng cách phù hợp với không gian sinh hoạt tôn giáo.',
      },
      {
        placeId: 'dinh-xuan-hoa',
        minutesFromPrevious: 12,
        label: 'Ký ức của cộng đồng cư dân',
        narrative: 'Không gian tín ngưỡng truyền thống lưu giữ một lớp ký ức gắn với vùng đất Xuân Hòa.',
      },
      {
        placeId: 'chua-xa-loi',
        minutesFromPrevious: 20,
        label: 'Điểm kết của một hành trình chậm',
        narrative: 'Khép lại hành trình trong một công trình tôn giáo, văn hóa tiêu biểu giữa không gian đô thị trung tâm.',
      },
    ],
    notice: 'Vui lòng giữ yên lặng, ăn mặc phù hợp và kiểm tra giờ mở cửa trước khi đến. Không sử dụng trò chơi hoặc hoạt động ồn ào tại các điểm tín ngưỡng.',
  },
  {
    slug: 'mot-gio-quanh-trung-tam',
    title: 'Một giờ quanh Trung tâm',
    eyebrow: 'Hành trình 04 · Gần bạn',
    tagline: 'Biến một khoảng thời gian ngắn thành cuộc dạo bộ để hiểu thêm về nơi mình đang sống.',
    description: 'Tuyến ngắn khởi đầu từ Trung tâm Phục vụ Hành chính công, phù hợp với người dân muốn khám phá vài điểm gần nhau mà không cần chuẩn bị trước.',
    theme: 'family',
    durationMinutes: 60,
    distanceKm: 1.2,
    bestTime: 'Sáng sớm hoặc cuối buổi chiều',
    difficulty: 'Rất dễ · phù hợp gia đình',
    coverPlaceId: 'chua-xa-loi',
    color: '#16705a',
    highlights: ['Không cần phương tiện', 'Các điểm dừng gần nhau', 'Phù hợp người dân địa phương'],
    stops: [
      {
        placeId: 'ttpvhcc',
        label: 'Bắt đầu từ điểm quen thuộc',
        narrative: 'Khởi hành ngay tại nơi tiếp nhận và hỗ trợ thủ tục hành chính của phường.',
      },
      {
        placeId: 'nha-thieu-nhi',
        minutesFromPrevious: 7,
        label: 'Không gian học tập và sáng tạo',
        narrative: 'Một điểm sinh hoạt dành cho thiếu nhi nằm trong mạch văn hóa của khu vực.',
      },
      {
        placeId: 'bao-tang-phu-nu-nam-bo',
        minutesFromPrevious: 8,
        label: 'Gặp những câu chuyện Nam Bộ',
        narrative: 'Dừng chân tại không gian giới thiệu những đóng góp và di sản của phụ nữ Nam Bộ.',
      },
      {
        placeId: 'chua-xa-loi',
        minutesFromPrevious: 12,
        label: 'Một khoảng lặng để kết thúc',
        narrative: 'Kết thúc tuyến ngắn tại một không gian văn hóa, tôn giáo tiêu biểu của khu vực.',
      },
    ],
    notice: 'Thời lượng 60 phút phù hợp cho việc đi bộ và quan sát bên ngoài; nếu tham quan bảo tàng hoặc công trình, hãy dành thêm thời gian.',
  },
]

export function getFeaturedPlace(placeId: string) {
  return FEATURED_PLACES.find((place) => place.id === placeId)
}

export function getFeaturedJourney(slug: string) {
  return FEATURED_JOURNEYS.find((journey) => journey.slug === slug)
}
