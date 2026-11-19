/* ==========================================================================
   TRUNG TAM DIEU HANH TITAN v11.0 (XIAS v3.1.1 ATLAS CONSOLE)
   100% Tieng Viet, 0 emoji, 0 <select> goc, 7 muc dieu hanh, 1 luong truc tuyen
   ========================================================================== */
(() => {
  "use strict";

  const VIEW_TITLES = {
    command: "Giao việc",
    projects: "Quản lý Dự án",
    missions: "Tiến độ Toàn tập đoàn",
    tasks: "Bảng việc",
    staff: "Nhân sự",
    news: "Báo mới và Kỹ năng",
    finance: "Tài chính và Dự án"
  };

  const COL_LABELS = {
    BACKLOG: "Chờ triển khai",
    IN_PROGRESS: "Đang làm",
    QA_SECURITY_REVIEW: "Kiểm định chất lượng",
    WAITING_APPROVAL: "Chờ bạn duyệt",
    REJECTED: "Cần sửa lại",
    DONE: "Hoàn thành"
  };

  const PRIO_LABELS = {
    CRITICAL: "Khẩn cấp",
    HIGH: "Cao",
    MEDIUM: "Trung bình",
    LOW: "Thấp"
  };

  const PROJECT_STATUS_LABELS = {
    PLANNING: "Lập kế hoạch",
    ACTIVE: "Đang phát triển",
    PAUSED: "Tạm dừng",
    SHIPPED: "Đã ra mắt trực tuyến",
    ARCHIVED: "Lưu trữ"
  };

  const OPP_TIER_META = {
    FLAGSHIP_VENTURE: { label: "Cơ hội Chiến lược", cls: "badge-done", icon: "shield-check" },
    PLG_PLATFORM: { label: "Cơ hội Chiến lược", cls: "badge-sync", icon: "layers" },
    AI_WORKFLOW: { label: "Luồng Tự động AI", cls: "badge-run", icon: "cpu" },
    STANDARD: { label: "Cơ hội Tiêu chuẩn", cls: "badge-idle", icon: "compass" }
  };

  const MEDIA_PLATFORM_LABELS = {
    TIKTOK: "TikTok dọc 9:16",
    YOUTUBE_SHORTS: "YouTube Shorts 9:16",
    YOUTUBE_LONG: "YouTube Dài 16:9",
    FACEBOOK_REELS: "Facebook Reels 9:16",
    CROSS_PLATFORM: "Đa nền tảng"
  };

  const MEDIA_STATUS_LABELS = {
    DRAFT: "Bản nháp",
    SCRIPTED: "Đã có kịch bản",
    FLOW_READY: "Sẵn sàng Google Flow",
    FLOW_QUEUED: "Đang tạo trên Google Flow",
    RENDERED: "Đã dựng Video AI",
    PUBLISHED: "Đã đăng YouTube và TikTok"
  };

  const LEDGER_TYPE_LABELS = {
    REVENUE: { label: "Thu", badge: "badge-done", sign: "+" },
    EXPENSE: { label: "Chi", badge: "badge-fail", sign: "-" },
    TAX_RESERVE: { label: "Thuế", badge: "badge-wait", sign: "-" }
  };

  const ORDER_STATUS_VI = {
    PENDING: { label: "Đang chờ xử lý", cls: "badge-wait", icon: "clock" },
    RUNNING: { label: "Đang thực thi", cls: "badge-run", icon: "activity" },
    IN_PROGRESS: { label: "Đang thực thi", cls: "badge-run", icon: "activity" },
    DONE: { label: "Đã hoàn tất", cls: "badge-done", icon: "check" },
    COMPLETED: { label: "Đã hoàn tất", cls: "badge-done", icon: "check" },
    FAILED: { label: "Cần kiểm tra lại", cls: "badge-fail", icon: "alert-circle" }
  };

  const CONNECTOR_LABELS = {
    vn_news: "Báo kinh tế Việt Nam",
    google_news: "Tin tức tổng hợp",
    creator_seo_pulse: "Xu hướng tăng trưởng",
    security_advisory: "Cảnh báo an ninh",
    arxiv: "Nghiên cứu công nghệ",
    github_repo: "Mã nguồn mở GitHub",
    hackernews: "Diễn đàn công nghệ",
    deep_url: "Bài đọc từ liên kết",
    cloud_sync: "Đồng bộ đám mây",
    bench_rss: "Bản tin tổng hợp"
  };

  const DIV_ORDER = [
    "exec-board",
    "div9-critique-ux-lab",
    "div1-strategy-intel",
    "div2-product-design",
    "div3-engineering-ai",
    "div4-qa-cybersecurity",
    "div5-media-youtube-studio",
    "div6-sales-commercial",
    "div7-finance-tax-legal",
    "div8-data-ops-hr"
  ];

  const DIV_SHORT_NAMES = {
    "exec-board": "Ban Điều hành",
    "div9-critique-ux-lab": "Khối 9: Kiểm tra Cuối, QA/QC, Chức năng và Phản biện",
    "div1-strategy-intel": "Khối 1: Chiến lược và Thị trường",
    "div2-product-design": "Khối 2: Sản phẩm và Thiết kế",
    "div3-engineering-ai": "Khối 3: Kỹ thuật và Công nghệ",
    "div4-qa-cybersecurity": "Khối 4: Kiểm định và An ninh",
    "div5-media-youtube-studio": "Khối 5: Nội dung và Truyền thông",
    "div6-sales-commercial": "Khối 6: Kinh doanh và Bán hàng",
    "div7-finance-tax-legal": "Khối 7: Tài chính và Pháp chế",
    "div8-data-ops-hr": "Khối 8: Dữ liệu và Vận hành"
  };

  const CANONICAL_DEPT_TITLES_VI = {
    "00": "Tổng Giám đốc và Chánh Văn phòng",
    "01": "Tình báo Thị trường Toàn cầu",
    "02": "Nghiên cứu Tâm lý và Hành vi Khách hàng",
    "03": "Phân tích Đối thủ Cạnh tranh",
    "04": "Nghiên cứu Công nghệ mới và Trí tuệ nhân tạo",
    "05": "Kiến trúc Mô hình Kinh doanh",
    "06": "Quản trị Sản phẩm",
    "07": "Nghiên cứu Trải nghiệm Người dùng",
    "08": "Thiết kế Giao diện Cao cấp",
    "09": "Thiết kế Chuyển động và Tương tác",
    "10": "Xây dựng Thương hiệu",
    "11": "Điều phối Tiến độ Dự án",
    "12": "Kiến trúc Hệ thống Trưởng",
    "13": "Kỹ thuật Giao diện Web",
    "14": "Phát triển Ứng dụng Di động",
    "15": "Kỹ thuật Máy chủ và Cổng Thanh toán",
    "16": "Kỹ sư Trí tuệ nhân tạo và Tự động hóa",
    "17": "Quản trị Cơ sở Dữ liệu",
    "18": "Kỹ thuật Nhúng và Thiết bị Thông minh",
    "19": "Hạ tầng Đám mây và Vận hành Hệ thống",
    "20": "Kiểm thử Phần mềm và Tự động hóa",
    "21": "Kiểm thử Chịu tải và Tốc độ Hệ thống",
    "22": "Kiểm định Độ chuẩn xác và An toàn Trí tuệ nhân tạo",
    "23": "An ninh mạng và Chống xâm nhập",
    "24": "Bảo vệ Dữ liệu Cá nhân và Cô lập Khách hàng",
    "25": "Chiến lược Hệ thống Kênh Video ngắn",
    "26": "Biên kịch Thu hút và Câu mở đầu 3 giây",
    "27": "Đạo diễn Hình ảnh và Kỹ xảo Video",
    "28": "Đạo diễn Âm thanh và Lồng tiếng",
    "29": "Thiết kế Ảnh bìa và Tối ưu Tỷ lệ bấm",
    "30": "Tối ưu Tìm kiếm Đa nền tảng",
    "31": "Quảng cáo và Tối ưu Phễu Chuyển đổi",
    "32": "Tìm kiếm Khách hàng Tiềm năng",
    "33": "Chốt đơn Giá trị cao và Gói thuê bao",
    "34": "Kinh doanh Quốc tế và Tiếp thị Liên kết",
    "35": "Bàn giao và Hướng dẫn Khách hàng 180 giây",
    "36": "Giữ chân Khách hàng và Bán thêm",
    "37": "Kế toán Tổng hợp và Đối soát Dòng tiền",
    "38": "Định giá và Phân tích Lợi nhuận",
    "39": "Chuyên gia Thuế và Hóa đơn Điện tử",
    "40": "Pháp chế và Hợp đồng Thương mại",
    "41": "Bản quyền và Chính sách Nền tảng",
    "42": "Phân tích Dữ liệu Kinh doanh",
    "43": "Tự động hóa Quy trình Nội bộ",
    "44": "Lưu trữ Tri thức và Bộ nhớ Tập đoàn",
    "45": "Tuyển dụng, Đào tạo và Kiểm định Chuyên gia",
    "46": "Hội đồng Phản biện Mô hình Kiếm tiền và Rủi ro",
    "47": "Thanh tra Phản biện Chéo từng Phòng ban",
    "48": "Kiểm thử viên đóng vai 5 nhóm Khách hàng thật",
    "49": "Thanh tra Tối giản Giao diện và Đếm số chạm",
    "50": "Trinh sát Cơ hội và Thiết kế Sản phẩm Sinh lời",
    "51": "Kiểm định Chất lượng Tổng thể QA và QC",
    "52": "Kiểm tra Hoàn thiện Chức năng và Rà soát Lỗi",
    "53": "Tổng hợp Lỗi, Thu thập Phản hồi và Điều phối Trả việc"
  };

  const DEFAULT_QUALITY_CELLS = [
    {
      code: "USER_TESTER",
      name_vi: "Tổ Kiểm thử Đóng vai Người dùng Nội bộ",
      role_vi: "Đóng vai người dùng thật kiểm tra trải nghiệm và độ hoàn thiện chức năng trước khi bàn giao."
    },
    {
      code: "CRITIC",
      name_vi: "Tổ Phản biện và Tổng hợp Thiếu sót Nội bộ",
      role_vi: "Soi lỗi logic, tổng hợp điểm thiếu sót và đẩy trả về đúng phòng ban chịu trách nhiệm sửa."
    }
  ];

  const REWORK_CATEGORY_LABELS = {
    MISSING_FEATURE: "Thiếu chức năng",
    BUG: "Lỗi chức năng",
    UX_FRICTION: "Rối mắt khó thao tác",
    QA_QC: "Chưa đạt QA và QC",
    LOGIC_CRITIQUE: "Lỗi logic phản biện"
  };

  const REWORK_SEVERITY_LABELS = {
    CRITICAL: { label: "Nghiêm trọng", cls: "badge-fail" },
    HIGH: { label: "Cao", cls: "badge-wait" },
    MEDIUM: { label: "Trung bình", cls: "badge-idle" },
    LOW: { label: "Thấp", cls: "badge-idle" }
  };

  const REWORK_STATUS_LABELS = {
    OPEN: { label: "Đang mở, cần sửa", cls: "badge-fail", icon: "alert-circle" },
    IN_FIX: { label: "Đang sửa lỗi", cls: "badge-run", icon: "activity" },
    FIXED_PENDING_RECHECK: { label: "Đã sửa, chờ Khối 9 kiểm lại", cls: "badge-wait", icon: "clock" },
    VERIFIED_CLOSED: { label: "Đã kiểm lại đạt (0 lỗi)", cls: "badge-done", icon: "shield-check" }
  };

  const DIV9_TRIO_IDS = new Set(["53", "51", "52", "49"]);

  const PRODUCT_TYPE_VI = {
    AUTO: "Tự nhận diện theo đề bài",
    ALL: "Mọi sản phẩm",
    WEB_APP: "Ứng dụng Web và PWA",
    MOBILE_APP: "Ứng dụng Di động",
    B2B_SAAS: "Phần mềm Doanh nghiệp",
    EMBEDDED_IOT: "Thiết bị Nhúng và Phần cứng",
    MEDIA_CHANNEL: "Kênh Video và Truyền thông",
    GENERAL: "Tổng hợp Đa lĩnh vực"
  };

  const HANDOFF_MODE_VI = {
    PEER_HANDOFF: { label: "Chuyển việc ngang", cls: "badge-run", icon: "arrow-right" },
    CEO_ESCALATION: { label: "Đẩy lên Tổng Giám đốc #00", cls: "badge-wait", icon: "flag" },
    CEO_ASSIGN: { label: "Tổng Giám đốc #00 chỉ định", cls: "badge-sync", icon: "compass" }
  };

  const HANDOFF_STATUS_VI = {
    OPEN: { label: "Đang chờ tiếp nhận", cls: "badge-wait", icon: "clock" },
    ACCEPTED: { label: "Đã tiếp nhận xử lý", cls: "badge-run", icon: "activity" },
    REROUTED_BY_CEO: { label: "Tổng Giám đốc #00 đã chuyển tuyến", cls: "badge-sync", icon: "git-branch" },
    COMPLETED: { label: "Đã hoàn tất", cls: "badge-done", icon: "check" }
  };

  const FALLBACK_SOP_RULES_VI = [
    {
      title_vi: "Quy tắc 1: Bắt buộc đủ 9/9 Khối và Ban Điều hành",
      detail_vi: "Mọi sản phẩm đều có sự tham gia xuyên suốt từ Tổng Giám đốc #00 và đủ Khối 1 đến Khối 9 để bảo đảm toàn diện từ thị trường, sản phẩm, kỹ thuật, kiểm định, tăng trưởng, bán hàng, tài chính, dữ liệu đến chốt cuối 0 lỗi."
    },
    {
      title_vi: "Quy tắc 2: Chọn đúng phòng ban theo loại sản phẩm",
      detail_vi: "Tổng Giám đốc #00 dựa vào Danh bạ 54 phòng để kích hoạt đúng các phòng cần thiết theo loại sản phẩm và để trống phòng không liên quan tránh loãng, nhưng luôn khóa bắt buộc 2 Tổ Nội bộ ở 9 Khối và Bộ Tứ chốt cuối Khối 9 (#53, #51, #52, #49)."
    },
    {
      title_vi: "Quy tắc 3: Cơ chế 2 tầng giữa Tự chuyển việc ngang và Đẩy lên #00",
      detail_vi: "Khi rõ chuyên môn phòng nhận trong danh bạ và không đổi ngân sách hay kiến trúc, phòng hiện tại tự chuyển việc ngang và gửi bản sao #00. Khi vượt thẩm quyền, chưa rõ phòng phụ trách hoặc xung đột liên khối, đẩy ngay lên Tổng Giám đốc #00 phân xử."
    },
    {
      title_vi: "Quy tắc 4: Chốt cuối 0 lỗi tập trung qua Trạm #53",
      detail_vi: "Mọi thiếu sót từ 2 Tổ Nội bộ của 9 Khối và Chủ tịch được gom về Trạm #53, phối hợp #51 (QA và QC), #52 (Kiểm tra Chức năng) và #49 (Diệt Rối mắt) đẩy trả về đúng phòng sửa đến khi còn 0 phiếu lỗi mở."
    }
  ];

  const WORKER_VI_MAP = {
    "@researcher": "Trinh sát Thị trường và Đối thủ",
    "@trinh-sat-thi-truong": "Trinh sát Thị trường và Đối thủ",
    "@trinh-sat-co-hoi": "Trinh sát Thị trường và Đối thủ",
    "trinh sát thị trường và đối thủ": "Trinh sát Thị trường và Đối thủ",
    "trinh sát thị trường & đối thủ": "Trinh sát Thị trường và Đối thủ",
    "@cfo": "Chuyên gia Tài chính và Thuế",
    "@chuyen-gia-tai-chinh": "Chuyên gia Tài chính và Thuế",
    "@tai-chinh-thue": "Chuyên gia Tài chính và Thuế",
    "chuyên gia tài chính và thuế": "Chuyên gia Tài chính và Thuế",
    "chuyên gia tài chính và giá bán": "Chuyên gia Tài chính và Thuế",
    "giám đốc tài chính & thuế": "Chuyên gia Tài chính và Thuế",
    "giám đốc tài chính và thuế": "Chuyên gia Tài chính và Thuế",
    "@critic": "Hội đồng Phản biện và An ninh",
    "@phan-bien-doc-lap": "Hội đồng Phản biện và An ninh",
    "@phan-bien-rui-ro": "Hội đồng Phản biện và An ninh",
    "hội đồng phản biện rủi ro": "Hội đồng Phản biện và An ninh",
    "hội đồng phản biện độc lập": "Hội đồng Phản biện và An ninh",
    "hội đồng phản biện và an ninh": "Hội đồng Phản biện và An ninh",
    "hội đồng phản biện và bảo mật": "Hội đồng Phản biện và An ninh",
    "@qa-qc": "Kiểm định Chất lượng QA và QC",
    "@kiem-dinh-qa-qc": "Kiểm định Chất lượng QA và QC",
    "kiểm định chất lượng tổng thể qa và qc": "Kiểm định Chất lượng QA và QC",
    "kiểm định chất lượng qa và qc": "Kiểm định Chất lượng QA và QC",
    "@kiem-tra-chuc-nang": "Kiểm tra Hoàn thiện Chức năng",
    "@feature-auditor": "Kiểm tra Hoàn thiện Chức năng",
    "kiểm tra hoàn thiện chức năng và rà soát lỗi": "Kiểm tra Hoàn thiện Chức năng",
    "kiểm tra hoàn thiện chức năng": "Kiểm tra Hoàn thiện Chức năng",
    "53": "Tổng hợp Lỗi và Điều phối Trả việc",
    "@53": "Tổng hợp Lỗi và Điều phối Trả việc",
    "@tong-hop-loi": "Tổng hợp Lỗi và Điều phối Trả việc",
    "@defect-triage": "Tổng hợp Lỗi và Điều phối Trả việc",
    "tổng hợp lỗi, thu thập phản hồi và điều phối trả việc": "Tổng hợp Lỗi và Điều phối Trả việc",
    "tổng hợp lỗi và điều phối trả việc": "Tổng hợp Lỗi và Điều phối Trả việc",
    "@ky-su-san-pham": "Kỹ sư Phát triển Sản phẩm",
    "@builder": "Kỹ sư Phát triển Sản phẩm",
    "kỹ sư phát triển sản phẩm": "Kỹ sư Phát triển Sản phẩm",
    "kỹ sư xây dựng sản phẩm": "Kỹ sư Phát triển Sản phẩm",
    "@doi-ban-hang": "Đội Đóng gói và Bán hàng",
    "đội đóng gói và bán hàng": "Đội Đóng gói và Bán hàng",
    "đội đóng gói & bán hàng": "Đội Đóng gói và Bán hàng",
    "@tester-khach-hang": "Kiểm thử viên Khách hàng thật",
    "@ux-tester": "Kiểm thử viên Khách hàng thật",
    "kiểm thử viên khách hàng thật": "Kiểm thử viên Khách hàng thật",
    "@kien-truc-giao-dien": "Kiến trúc sư Giao diện",
    "@ket-noi-truc-tuyen": "Kỹ sư Kết nối Trực tuyến",
    "@kho-ky-nang": "Chuyên gia Kho Kỹ năng",
    "@coordinator": "Tổng Điều phối",
    "@dieu-phoi": "Tổng Điều phối",
    "tổng điều phối": "Tổng Điều phối",
    "tổng điều phối điều hành": "Tổng Điều phối"
  };

  const WORKER_ROLE_DESC_VI = {
    "Tổng Điều phối": "Điều phối luồng công việc, chốt cổng duyệt và nghiệm thu tổng thể.",
    "Trinh sát Thị trường và Đối thủ": "Nghiên cứu nhu cầu thật, đối thủ cạnh tranh và cơ hội sinh lời.",
    "Chuyên gia Tài chính và Thuế": "Tính giá bán, điểm hòa vốn, thuế và khóa biên lãi gộp an toàn.",
    "Kỹ sư Phát triển Sản phẩm": "Xây dựng mã nguồn sản phẩm chạy thật và kiểm thử kỹ thuật.",
    "Đội Đóng gói và Bán hàng": "Thiết kế trang bán hàng và kịch bản thu khách hàng đầu tiên.",
    "Kiểm thử viên Khách hàng thật": "Đóng vai người dùng thật kiểm tra trải nghiệm và bắt lỗi giao diện.",
    "Hội đồng Phản biện và An ninh": "Phản biện rủi ro lỗ vốn, kiểm toán bảo mật và kiểm định độc lập.",
    "Kiểm định Chất lượng QA và QC": "Tổng kiểm định chất lượng quy trình và thành phẩm chốt cuối Khối 9, đẩy trả mọi sai sót.",
    "Kiểm tra Hoàn thiện Chức năng": "Đối chiếu 100% chức năng đề bài, rà soát lỗi vận hành và chặn chốt khi chưa đạt 0 lỗi.",
    "Tổng hợp Lỗi và Điều phối Trả việc": "Gom toàn bộ phản hồi và lỗi từ 9 Khối, phân loại ưu tiên và điều phối đẩy trả về đúng phòng ban chịu trách nhiệm sửa.",
    "Kiến trúc sư Giao diện": "Thiết kế hệ thống giao diện, bố cục đáp ứng và kiểm định trải nghiệm.",
    "Kỹ sư Kết nối Trực tuyến": "Vận hành máy chủ, cơ sở dữ liệu và đồng bộ trực tuyến đa thiết bị.",
    "Chuyên gia Kho Kỹ năng": "Sưu tầm, kiểm duyệt và huấn luyện bộ kỹ năng chuyên môn cho phòng ban."
  };

  const MSG_TYPE_VI = {
    HANDOFF: { label: "Chuyền việc", cls: "badge-run", icon: "arrow-right" },
    UPDATE: { label: "Đang xử lý", cls: "badge-idle", icon: "clock" },
    CRITIQUE: { label: "Phản biện rủi ro", cls: "badge-wait", icon: "shield-check" },
    QA_REPORT: { label: "Kiểm thử khách hàng", cls: "badge-wait", icon: "check-square" },
    BOUNCE_BACK: { label: "Đẩy trả sửa lỗi", cls: "badge-fail", icon: "rotate-ccw" },
    REWORK_VERIFIED: { label: "Chốt đạt 0 lỗi", cls: "badge-done", icon: "shield-check" },
    DONE: { label: "Hoàn tất", cls: "badge-done", icon: "check" },
    APPROVAL: { label: "Duyệt cổng", cls: "badge-done", icon: "flag" }
  };

  const LEGACY_TITLE_RE = /\(@[a-z0-9_-]+\)|\((?:pm|ux|ui|pmo|ctr|cro|fp&a|bi|outbound sdr|high-ticket[^)]*|retention[^)]*|seo[^)]*|youtube[^)]*)\)|\b(?:r&d|pwa|iot|server|pre-mortem|tester|triệu view)\b/i;

  const state = {
    tab: "command",
    staticMode: false,
    onlineSource: "CONNECTING",
    lastSyncAt: "",
    overview: null,
    bridge: { online: false, active_workers: [], pending_orders_count: 0 },
    orders: [],
    swarmMessages: [],
    missionViewTabs: {},
    departments: [],
    divisions: [],
    missions: [],
    opportunities: [],
    tasks: [],
    projects: [],
    articles: [],
    learningRuns: [],
    learningProgress: { running: false },
    installedSkills: [],
    projectLedger: [],
    reworkTickets: [],
    reworkSummary: {},
    mediaCampaigns: [],
    deptHandoffs: [],
    corporateDirectorySummary: null,
    corporateDirectory: null,
    orgSopTab: "sop",
    lastRosterPlan: null,
    activeStaffDrawerDeptId: "",
    financeSummary: null,
    activeProjectFinance: null,
    progressCat: "all",
    missionFilter: "",
    openMissions: new Set(),
    missionsInitialized: false,
    knownMissionIds: new Set(),
    progressGroupOpen: { missions: true, opps: true, learning: true, tasks: true },
    progressExpandedLimit: { missions: false, opps: false, learning: false, tasks: false },
    taskViewMode: "grouped",
    taskBulkMode: false,
    taskGroupOpen: { WAITING_APPROVAL: true, ACTIVE: true, PENDING: true, DONE: false },
    staffStatusFilter: "",
    staffDivOpen: null,
    autoOpenedBusyDivs: new Set(),
    newsSubView: "articles",
    newsStarFilter: "all",
    financeViewProjectId: "",
    projectSubTab: "finance",
    selectedProjectId: "",
    projectDetail: null,
    projectDetailSubTab: "overview",
    projectDocFilter: "all",
    projectStatusFilter: "",
    projectSearchQuery: "",
    oppTierFilter: "all",
    selectedTaskIds: new Set(),
    expandedNewsIds: new Set(),
    currentDocFile: "",
    docEditMode: false,
    cmdIndex: 0,
    cmdItems: [],
    sse: null,
    bridgeTimer: null,
    bgSyncTimer: null,
    reconnectTimer: null,
    learningPollTimer: null
  };

  let API_BASE = "";
  let sessionUnlockedCloud = null;

  // -------------------------------------------------------------------------
  // 1. SAFE HTML, ICON HELPER, VIETNAMESE SANITIZER & MARKDOWN RENDERER
  // -------------------------------------------------------------------------
  function esc(val) {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ico(name, extra = "ico-xs") {
    return `<svg class="ico ${extra}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  }

  function vnd(n) {
    return (Math.round(Number(n) || 0)).toLocaleString("vi-VN") + " đ";
  }

  function shortVnd(n) {
    const val = Number(n) || 0;
    const abs = Math.abs(val);
    const sign = val < 0 ? "-" : "";
    if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1).replace(".", ",")} tỷ`;
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1).replace(".", ",")} tr`;
    if (abs >= 1e3) return `${sign}${Math.round(abs / 1e3)} nghìn`;
    return `${sign}${Math.round(abs)} đ`;
  }

  function formatDotNumber(n) {
    return Math.round(Number(n) || 0).toLocaleString("vi-VN");
  }

  function parseMoneyInput(val, fallback = 0) {
    if (val === null || val === undefined) return fallback;
    const digits = String(val).replace(/[^\d]/g, "");
    return digits ? Number(digits) : fallback;
  }

  function slugifyVi(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "tai-lieu-moi";
  }

  function shortTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  function shortDate(iso) {
    if (!iso) return "";
    const s = String(iso);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split("-");
      return `${d}/${m}/${y}`;
    }
    const dt = new Date(s);
    if (Number.isNaN(dt.getTime())) return s;
    return dt.toLocaleDateString("vi-VN");
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function sanitizeUiVietnamese(raw) {
    if (!raw) return "";
    let s = String(raw);
    s = s.replace(/\s*[\u2014\u2013]\s*/g, ": ");
    s = s.replace(/[\u2605\u25B2\uD83D\uDCAC\u2713\u2691\u23F8\u25B6\u21BA\u25CF\u25CB\u26A1]/g, "");
    s = s.replace(/\s*\(@[a-z0-9_-]+\)/gi, "");
    s = s.replace(/\s*\((?:PM|UX|UI|PMO|CRO|FP&A|BI|CTR|SEO\s*\/\s*GEO\s*\/\s*AEO|OUTBOUND SDR|HIGH-TICKET[^)]*|RETENTION[^)]*)\)/gi, "");
    const replacements = [
      [/Antigravity Swarm/gi, "Đội ngũ Chuyên gia Titan"],
      [/Antigravity/gi, "Hệ thống Titan"],
      [/Pre-Mortem/gi, "Phản biện rủi ro"],
      [/Local-First/gi, "lưu cục bộ trên máy"],
      [/BUILD_PRODUCT/g, "Sản xuất sản phẩm cuối"],
      [/Code\s*\/\s*Web\s*\/\s*App/gi, "Ứng dụng Web và Di động"],
      [/Landing Page/gi, "Trang giới thiệu bán hàng"],
      [/Tester đóng vai/gi, "Kiểm thử viên đóng vai"],
      [/\bTester\b/gi, "Kiểm thử khách hàng"],
      [/\bCFO\b/g, "Tài chính và Giá bán"],
      [/\bQA\b(?!\s*(?:và|\/)\s*QC\b)/g, "Kiểm định chất lượng"],
      [/\bPAT\b/g, "khóa truy cập"],
      [/\bKPI\b/g, "chỉ số"],
      [/\(PEER_HANDOFF\)/g, ""],
      [/\(CEO_ESCALATION\)/g, ""],
      [/\(CEO_ASSIGN\)/g, ""],
      [/\bPEER_HANDOFF\b/g, "Chuyển việc ngang"],
      [/\bCEO_ESCALATION\b/g, "Đẩy lên Tổng Giám đốc #00"],
      [/\bCEO_ASSIGN\b/g, "Tổng Giám đốc #00 chỉ định"],
      [/\bWEB_APP\b/g, "Ứng dụng Web"],
      [/\bMOBILE_APP\b/g, "Ứng dụng Di động"],
      [/\bB2B_SAAS\b/g, "Phần mềm Doanh nghiệp"],
      [/\bEMBEDDED_IOT\b/g, "Thiết bị Nhúng"],
      [/\bMEDIA_CHANNEL\b/g, "Kênh Truyền thông"],
      [/@researcher\b/gi, "Trinh sát Thị trường"],
      [/@cfo\b/gi, "Chuyên gia Tài chính"],
      [/@critic\b/gi, "Hội đồng Phản biện rủi ro"],
      [/@coordinator\b/gi, "Tổng Điều phối"],
      [/@ky-su-san-pham\b/gi, "Kỹ sư Sản phẩm"],
      [/@doi-ban-hang\b/gi, "Đội Đóng gói và Bán hàng"],
      [/@tester-khach-hang\b/gi, "Kiểm thử khách hàng"]
    ];
    for (const [pattern, target] of replacements) {
      s = s.replace(pattern, target);
    }
    return s.replace(/\s{2,}/g, " ").trim();
  }

  function cleanDeptTitleVi(deptId, rawTitle) {
    const idKey = String(deptId || "").padStart(2, "0");
    const raw = String(rawTitle || "").trim();
    if (!raw) return CANONICAL_DEPT_TITLES_VI[idKey] || `Phòng #${deptId}`;
    if (CANONICAL_DEPT_TITLES_VI[idKey] && raw === CANONICAL_DEPT_TITLES_VI[idKey]) {
      return CANONICAL_DEPT_TITLES_VI[idKey];
    }
    const isAllUpper = raw === raw.toUpperCase() && raw.length > 6;
    if (CANONICAL_DEPT_TITLES_VI[idKey] && (isAllUpper || LEGACY_TITLE_RE.test(raw))) {
      return CANONICAL_DEPT_TITLES_VI[idKey];
    }
    return sanitizeUiVietnamese(raw);
  }

  function deptTitle(deptId) {
    const found = state.departments.find((d) => d.dept_id === deptId);
    if (found) return cleanDeptTitleVi(found.dept_id, found.title_vi);
    return CANONICAL_DEPT_TITLES_VI[String(deptId || "").padStart(2, "0")] || `Phòng #${deptId}`;
  }

  function projectTitle(pid) {
    if (!pid) return "Việc chung toàn công ty";
    const found = state.projects.find((p) => p.project_id === pid);
    return found ? sanitizeUiVietnamese(found.title) : "Dự án nội bộ";
  }

  function viWorkerLabel(slug) {
    if (!slug) return "";
    const raw = String(slug).trim();
    const k = raw.toLowerCase();
    if (k === "@ceo" || k === "ceo") return "Tổng Giám đốc #00";
    const mDept = k.match(/^@?phong[-_\s]?(\d{1,2})$/);
    if (mDept) {
      const did = mDept[1].padStart(2, "0");
      return `Phòng #${did}: ${deptTitle(did)}`;
    }
    if (WORKER_VI_MAP[k]) return WORKER_VI_MAP[k];
    const atKey = k.startsWith("@") ? k : `@${k}`;
    if (WORKER_VI_MAP[atKey]) return WORKER_VI_MAP[atKey];
    return sanitizeUiVietnamese(raw.replace(/^@/, "").replace(/-/g, " "));
  }

  function parseDeptIdsJson(raw) {
    if (Array.isArray(raw)) return raw.map((x) => String(x).padStart(2, "0"));
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.map((x) => String(x).padStart(2, "0")) : [];
    } catch (_e) {
      return String(raw).split(",").map((x) => x.trim()).filter(Boolean);
    }
  }

  function normalizeDeptStatus(raw) {
    const st = String(raw || "IDLE").toUpperCase();
    if (st === "STUDYING" || st === "LEARNING") return "STUDYING";
    if (st === "BLOCKED" || st === "ERROR") return "BLOCKED";
    if (
      st === "WORKING" ||
      st === "EXECUTING" ||
      st === "RESEARCHING_TASK" ||
      st === "IN_QA_REVIEW" ||
      st === "WAITING_CHAIRMAN" ||
      st === "BUSY" ||
      st === "RUNNING" ||
      st === "ACTIVE"
    ) {
      return "WORKING";
    }
    return "IDLE";
  }

  function deptStatusMeta(raw) {
    const st = String(raw || "IDLE").toUpperCase();
    const norm = normalizeDeptStatus(st);
    if (st === "RESEARCHING_TASK") return { norm, label: "Đang nghiên cứu", cls: "badge-run", icon: "compass" };
    if (st === "IN_QA_REVIEW") return { norm, label: "Đang kiểm định", cls: "badge-run", icon: "shield-check" };
    if (st === "WAITING_CHAIRMAN") return { norm, label: "Chờ bạn duyệt", cls: "badge-wait", icon: "flag" };
    if (norm === "WORKING") return { norm, label: "Đang làm việc", cls: "badge-run", icon: "activity" };
    if (norm === "STUDYING") return { norm, label: "Đang học", cls: "badge-study", icon: "book-open" };
    if (norm === "BLOCKED") return { norm, label: "Đang bị chặn", cls: "badge-fail", icon: "alert-circle" };
    return { norm: "IDLE", label: "Sẵn sàng", cls: "badge-idle", icon: "check" };
  }

  function smartRouteDepartmentLocal(title, desc = "") {
    const txt = `${title || ""} ${desc || ""}`.toLowerCase();
    const rules = [
      [/thuế|hóa đơn|kê khai/, "39"],
      [/tài chính|giá bán|lãi|hòa vốn|lỗ|ngân sách|thu chi/, "38"],
      [/giao diện|ui|ux|thiết kế|màu sắc|bố cục/, "08"],
      [/web|app|code|lập trình|lỗi giao diện|tính năng/, "13"],
      [/máy chủ|api|thanh toán|vietqr|database|csdl/, "15"],
      [/bảo mật|hack|xâm nhập|an ninh/, "23"],
      [/kiểm thử|test|qa|bắt lỗi/, "20"],
      [/quảng cáo|bán hàng|zalo|video|khách hàng|chốt đơn/, "31"],
      [/seo|nội dung|bài viết|blog/, "30"],
      [/săn cơ hội|thị trường|đối thủ|khảo sát/, "50"],
      [/phản biện|rủi ro|kiểm toán/, "46"],
      [/pháp lý|hợp đồng|luật|nghị định/, "40"]
    ];
    for (const [re, id] of rules) {
      if (re.test(txt)) return id;
    }
    return "00";
  }

  function formatInlineMd(rawText) {
    const codeTokens = [];
    const withPlaceholders = String(rawText || "").replace(/`([^`]+)`/g, (_m, inner) => {
      const idx = codeTokens.length;
      codeTokens.push(`<code class="mono">${esc(inner)}</code>`);
      return `\u0000CODE${idx}\u0000`;
    });

    let safe = esc(withPlaceholders)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

    codeTokens.forEach((htmlCode, idx) => {
      safe = safe.replace(`\u0000CODE${idx}\u0000`, htmlCode);
    });
    return safe;
  }

  function renderCleanMarkdown(mdText) {
    if (!mdText) return "<p>Chưa có nội dung.</p>";
    let body = String(mdText);
    if (body.startsWith("---")) {
      const endFm = body.indexOf("\n---", 3);
      if (endFm !== -1) body = body.slice(endFm + 4);
    }
    const lines = body.split(/\r?\n/);
    let html = "";
    let inList = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        if (inList) { html += "</ul>"; inList = false; }
        continue;
      }
      if (line === "---") continue;
      if (line.startsWith("# ")) {
        if (inList) { html += "</ul>"; inList = false; }
        html += `<h2>${formatInlineMd(sanitizeUiVietnamese(line.slice(2)))}</h2>`;
      } else if (line.startsWith("## ") || line.startsWith("### ")) {
        if (inList) { html += "</ul>"; inList = false; }
        html += `<h3>${formatInlineMd(sanitizeUiVietnamese(line.replace(/^#+\s*/, "")))}</h3>`;
      } else if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${formatInlineMd(sanitizeUiVietnamese(line.replace(/^([-*]|\d+\.)\s*/, "")))}</li>`;
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        html += `<p>${formatInlineMd(sanitizeUiVietnamese(line))}</p>`;
      }
    }
    if (inList) html += "</ul>";
    return html || "<p>Chưa có nội dung.</p>";
  }

  function toast(message, undoPayload = null) {
    const stack = document.getElementById("toast-stack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = "toast-item";
    const span = document.createElement("span");
    span.textContent = sanitizeUiVietnamese(message);
    el.appendChild(span);
    if (undoPayload) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "undo-btn";
      btn.textContent = "Hoàn tác";
      btn.addEventListener("click", async () => {
        el.remove();
        await restoreDeleted(undoPayload);
      });
      el.appendChild(btn);
    }
    stack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 220);
    }, undoPayload ? 5500 : 3400);
  }

  async function withLock(btnEl, asyncFn) {
    if (btnEl && btnEl.disabled) return;
    let spinner = null;
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.classList.add("is-loading");
      btnEl.setAttribute("aria-busy", "true");
      spinner = document.createElement("span");
      spinner.className = "btn-spinner";
      spinner.setAttribute("aria-hidden", "true");
      btnEl.insertBefore(spinner, btnEl.firstChild);
    }
    try {
      await asyncFn();
    } catch (err) {
      toast((err && err.message) || "Đã xảy ra lỗi khi xử lý yêu cầu.");
    } finally {
      if (btnEl) {
        if (spinner && spinner.parentNode === btnEl) spinner.remove();
        btnEl.classList.remove("is-loading");
        btnEl.removeAttribute("aria-busy");
        btnEl.disabled = false;
      }
    }
  }

  // -------------------------------------------------------------------------
  // 2. CUSTOM ACCESSIBLE LISTBOX ENGINE (ZERO NATIVE <select>)
  // -------------------------------------------------------------------------
  const listboxRegistry = new Map();

  function closeAllListboxes(exceptId = "") {
    listboxRegistry.forEach((ctrl, id) => {
      if (id !== exceptId) ctrl.close(false);
    });
    document.querySelectorAll(".listbox-field[data-dynamic-listbox]").forEach((wrap) => {
      const trig = wrap.querySelector(".listbox-trigger");
      const menu = wrap.querySelector(".listbox-menu");
      if (trig && menu && wrap.getAttribute("data-dynamic-listbox") !== exceptId) {
        trig.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      }
    });
  }

  function setupListboxElement(wrapEl, id, onChangeCb = null) {
    const input = wrapEl.querySelector("input[type='hidden']");
    const trigger = wrapEl.querySelector(".listbox-trigger");
    const valSpan = wrapEl.querySelector(".listbox-value");
    const menu = wrapEl.querySelector(".listbox-menu");
    if (!input || !trigger || !valSpan || !menu) return null;

    let options = [];
    let activeIdx = 0;

    const getOptionEls = () => Array.from(menu.querySelectorAll(".listbox-option"));

    const highlight = (idx) => {
      const els = getOptionEls();
      if (!els.length) return;
      activeIdx = Math.max(0, Math.min(els.length - 1, idx));
      els.forEach((el, i) => {
        el.classList.toggle("is-active", i === activeIdx);
      });
      els[activeIdx].scrollIntoView({ block: "nearest" });
    };

    const setValue = (val, silent = true) => {
      const strVal = val === null || val === undefined ? "" : String(val);
      const idx = options.findIndex((o) => String(o.value) === strVal);
      const chosen = idx >= 0 ? options[idx] : options[0];
      if (!chosen) {
        input.value = strVal;
        return;
      }
      const changed = input.value !== String(chosen.value);
      input.value = String(chosen.value);
      valSpan.textContent = chosen.label;
      activeIdx = idx >= 0 ? idx : 0;
      getOptionEls().forEach((el, i) => {
        el.setAttribute("aria-selected", i === activeIdx ? "true" : "false");
      });
      if (!silent && changed) {
        input.dispatchEvent(new Event("change", { bubbles: true }));
        if (onChangeCb) onChangeCb(input.value);
      }
    };

    const open = () => {
      closeAllListboxes(id);
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      const curIdx = Math.max(0, options.findIndex((o) => String(o.value) === input.value));
      highlight(curIdx);
      menu.focus({ preventScroll: true });
    };

    const close = (returnFocus = false) => {
      if (menu.hidden) return;
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (returnFocus) trigger.focus({ preventScroll: true });
    };

    const setOptions = (items, preserve = true) => {
      const prev = preserve ? input.value : "";
      options = items.map((it) => ({ value: String(it.value), label: String(it.label) }));
      menu.innerHTML = options.map((o, i) => `
        <li class="listbox-option" role="option" data-value="${esc(o.value)}" data-idx="${i}" aria-selected="false">
          <span>${esc(o.label)}</span>
          ${ico("check", "ico-xs ico-check")}
        </li>
      `).join("");
      getOptionEls().forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setValue(el.getAttribute("data-value"), false);
          close(true);
        });
      });
      const hasPrev = preserve && options.some((o) => o.value === prev);
      setValue(hasPrev ? prev : (options[0] ? options[0].value : ""), true);
    };

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (menu.hidden) open();
      else close(true);
    });

    trigger.addEventListener("keydown", (e) => {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        open();
      }
    });

    menu.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        highlight((activeIdx + 1) % Math.max(1, options.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        highlight((activeIdx - 1 + options.length) % Math.max(1, options.length));
      } else if (e.key === "Home") {
        e.preventDefault();
        highlight(0);
      } else if (e.key === "End") {
        e.preventDefault();
        highlight(options.length - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (options[activeIdx]) setValue(options[activeIdx].value, false);
        close(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close(true);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const ch = e.key.toLowerCase();
        const found = options.findIndex((o, idx) => idx > activeIdx && o.label.toLowerCase().startsWith(ch));
        const fallback = found >= 0 ? found : options.findIndex((o) => o.label.toLowerCase().startsWith(ch));
        if (fallback >= 0) highlight(fallback);
      }
    });

    return { open, close, setOptions, setValue, getValue: () => input.value, hasOptions: () => options.length > 0 };
  }

  function initStaticListboxes() {
    document.querySelectorAll(".listbox-field[data-listbox]").forEach((wrap) => {
      const id = wrap.getAttribute("data-listbox");
      const ctrl = setupListboxElement(wrap, id);
      if (ctrl) listboxRegistry.set(id, ctrl);
    });

    const colOptionsTask = Object.entries(COL_LABELS).map(([value, label]) => ({ value, label }));
    const prioOptionsAll = [
      { value: "", label: "Mọi độ ưu tiên" },
      ...Object.entries(PRIO_LABELS).map(([value, label]) => ({ value, label }))
    ];
    const prioOptionsTask = prioOptionsAll.slice(1);
    const projStatusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label }));
    const divFilterOptions = [
      { value: "", label: "Tất cả 10 khối chuyên môn" },
      ...DIV_ORDER.map((code) => ({ value: code, label: DIV_SHORT_NAMES[code] }))
    ];

    setListboxOptions("inp-task-col", colOptionsTask, false);
    setListboxOptions("filter-task-prio", prioOptionsAll, false);
    setListboxOptions("inp-task-prio", prioOptionsTask, false);
    setListboxValue("inp-task-prio", "HIGH", true);
    setListboxOptions("inp-proj-status", projStatusOptions, false);
    setListboxOptions("filter-staff-div", divFilterOptions, false);
    setListboxOptions("filter-dir-div", divFilterOptions, false);
    setListboxOptions("filter-news-div", divFilterOptions, false);
    setListboxOptions("filter-skill-div", divFilterOptions, false);
    setListboxOptions("inp-roster-type", [
      { value: "AUTO", label: PRODUCT_TYPE_VI.AUTO },
      { value: "WEB_APP", label: PRODUCT_TYPE_VI.WEB_APP },
      { value: "MOBILE_APP", label: PRODUCT_TYPE_VI.MOBILE_APP },
      { value: "B2B_SAAS", label: PRODUCT_TYPE_VI.B2B_SAAS },
      { value: "EMBEDDED_IOT", label: PRODUCT_TYPE_VI.EMBEDDED_IOT },
      { value: "MEDIA_CHANNEL", label: PRODUCT_TYPE_VI.MEDIA_CHANNEL },
      { value: "GENERAL", label: PRODUCT_TYPE_VI.GENERAL }
    ], false);
    setListboxValue("inp-roster-type", "AUTO", true);
    setListboxOptions("filter-progress-status", [
      { value: "", label: "Mọi trạng thái" },
      { value: "RUNNING", label: "Đang chạy" },
      { value: "WAITING_CHAIRMAN", label: "Chờ bạn duyệt" },
      { value: "COMPLETED", label: "Đã hoàn thành" },
      { value: "PAUSED", label: "Tạm dừng" }
    ], false);
    setListboxOptions("inp-ledger-type", [
      { value: "REVENUE", label: "Doanh thu (Thu)" },
      { value: "EXPENSE", label: "Chi phí (Chi)" },
      { value: "TAX_RESERVE", label: "Dự phòng thuế (Thuế)" }
    ], false);
    setListboxOptions("inp-ledger-est", [
      { value: "0", label: "Thực tế phát sinh" },
      { value: "1", label: "Kế hoạch dự toán" }
    ], false);
    setListboxOptions("inp-rework-cat", Object.entries(REWORK_CATEGORY_LABELS).map(([value, label]) => ({ value, label })), false);
    setListboxValue("inp-rework-cat", "BUG", true);
    setListboxOptions("inp-rework-sev", [
      { value: "CRITICAL", label: "Nghiêm trọng" },
      { value: "HIGH", label: "Cao" },
      { value: "MEDIUM", label: "Trung bình" }
    ], false);
    setListboxValue("inp-rework-sev", "HIGH", true);
    setListboxOptions("inp-media-platform", Object.entries(MEDIA_PLATFORM_LABELS).map(([value, label]) => ({ value, label })), false);
    setListboxValue("inp-media-platform", "TIKTOK", true);

    document.addEventListener("click", () => closeAllListboxes());
  }

  function setListboxOptions(id, items, preserve = true, skipIfModalId = "") {
    const ctrl = listboxRegistry.get(id);
    if (!ctrl) return;
    if (skipIfModalId) {
      const modalEl = document.getElementById(skipIfModalId);
      if (modalEl && modalEl.classList.contains("open") && ctrl.hasOptions()) return;
    }
    ctrl.setOptions(items, preserve);
  }

  function setListboxValue(id, value, silent = true) {
    const ctrl = listboxRegistry.get(id);
    if (ctrl) ctrl.setValue(value, silent);
    else {
      const inp = document.getElementById(id);
      if (inp) inp.value = value;
    }
  }

  function getListboxValue(id) {
    const inp = document.getElementById(id);
    return inp ? inp.value : "";
  }

  // -------------------------------------------------------------------------
  // 3. WEBCRYPTO AES-256-GCM ENCRYPTED CLOUD VAULT
  // -------------------------------------------------------------------------
  const cryptoVault = {
    toB64(bytes) {
      const bin = Array.from(new Uint8Array(bytes), (b) => String.fromCharCode(b)).join("");
      return btoa(bin);
    },
    fromB64(b64) {
      return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    },
    utf8ToB64(str) {
      return this.toB64(new TextEncoder().encode(str));
    },
    b64ToUtf8(b64) {
      return new TextDecoder().decode(this.fromB64(b64.replace(/\s/g, "")));
    },
    async deriveKey(pin, salt) {
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(pin),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
      return window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    },
    async save(repo, token, pin) {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await this.deriveKey(pin, salt);
      const cipher = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(JSON.stringify({ repo, token }))
      );
      localStorage.setItem("titan_vault_v5", JSON.stringify({
        repo,
        salt: this.toB64(salt),
        iv: this.toB64(iv),
        cipher: this.toB64(cipher)
      }));
    },
    async unlock(pin) {
      const raw = localStorage.getItem("titan_vault_v5");
      if (!raw) throw new Error("Chưa lưu khóa kết nối đám mây trên thiết bị này. Hãy mã hóa và lưu két trước.");
      const rec = JSON.parse(raw);
      try {
        const key = await this.deriveKey(pin, this.fromB64(rec.salt));
        const plain = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: this.fromB64(rec.iv) },
          key,
          this.fromB64(rec.cipher)
        );
        return JSON.parse(new TextDecoder().decode(plain));
      } catch (_e) {
        throw new Error("Mã bảo vệ két không chính xác.");
      }
    }
  };

  // -------------------------------------------------------------------------
  // 4. SINGLE ONLINE FLOW + SAFE BACKWARD-COMPATIBLE FALLBACKS
  // -------------------------------------------------------------------------
  function saveOfflineViewCache() {
    if (!state.staticMode) return;
    try {
      localStorage.setItem("titan_v8_offline_cache", JSON.stringify({
        missions: state.missions,
        opportunities: state.opportunities,
        tasks: state.tasks,
        projects: state.projects,
        articles: state.articles,
        projectLedger: state.projectLedger
      }));
    } catch (_e) {}
  }

  async function probeHealthEndpoint(baseUrl, timeoutMs = 3200) {
    const cleanBase = String(baseUrl || "").replace(/\/+$/, "");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${cleanBase}/api/health`, {
        signal: ctrl.signal,
        cache: "no-store"
      });
      clearTimeout(timer);
      const ct = res.headers.get("content-type") || "";
      if (res.ok && ct.includes("application/json")) {
        const data = await res.json();
        if (data && data.status === "ok") return true;
      }
    } catch (_e) {
      clearTimeout(timer);
    }
    return false;
  }

  async function detectOnlineEndpoint() {
    const host = String(window.location.hostname || "").toLowerCase();
    const isDirectHost = window.location.protocol.startsWith("http") && !host.endsWith("github.io");
    if (isDirectHost && (await probeHealthEndpoint("", 2000))) {
      API_BASE = "";
      state.staticMode = false;
      state.onlineSource = "DIRECT";
      return true;
    }

    const epCandidates = [
      `./cloud_state/online_endpoint.json?t=${Date.now()}`,
      `../corporate_hq/cloud_state/online_endpoint.json?t=${Date.now()}`
    ];
    for (const epUrl of epCandidates) {
      try {
        const r = await fetch(epUrl, { cache: "no-store" });
        const ct = r.headers.get("content-type") || "";
        if (!r.ok || !ct.includes("application/json")) continue;
        const meta = await r.json();
        const candidateUrl = String((meta && meta.online_api_url) || "").trim().replace(/\/+$/, "");
        if (candidateUrl && /^https?:\/\//i.test(candidateUrl) && String(meta.status || "").toUpperCase() !== "OFFLINE") {
          const alive = await probeHealthEndpoint(candidateUrl, 3600);
          if (alive) {
            API_BASE = candidateUrl;
            state.staticMode = false;
            state.onlineSource = "TUNNEL";
            return true;
          }
        }
        break;
      } catch (_e) {}
    }

    if (!isDirectHost && (await probeHealthEndpoint("", 2000))) {
      API_BASE = "";
      state.staticMode = false;
      state.onlineSource = "DIRECT";
      return true;
    }

    state.onlineSource = "OFFLINE";
    return false;
  }

  async function api(path, method = "GET", body = null) {
    if (state.staticMode && path.startsWith("/api/")) {
      return handleOfflineFallback(path, method, body);
    }

    const fullUrl = path.startsWith("/api/") ? `${API_BASE}${path}` : path;
    let res;
    try {
      res = await fetch(fullUrl, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : null
      });
    } catch (networkErr) {
      if (path.startsWith("/api/")) {
        return activateOfflineFallback(path, method, body, networkErr);
      }
      throw networkErr;
    }

    const ct = res.headers.get("content-type") || "";
    if (res.status === 404 && !ct.includes("application/json") && path.startsWith("/api/")) {
      return activateOfflineFallback(path, method, body, new Error("Chế độ ngoại tuyến"));
    }

    if (!res.ok) {
      let msg = `Lỗi kết nối mã ${res.status}`;
      try {
        const j = await res.json();
        msg = j.error || msg;
      } catch (_e) {}
      throw new Error(sanitizeUiVietnamese(msg));
    }
    return await res.json();
  }

  async function activateOfflineFallback(path, method, body, origErr) {
    if (!state.staticMode) {
      for (const snapUrl of [`./cloud_state/snapshot.json?t=${Date.now()}`, `../corporate_hq/cloud_state/snapshot.json?t=${Date.now()}`]) {
        try {
          const sr = await fetch(snapUrl, { cache: "no-cache" });
          if (sr.ok) {
            const snap = await sr.json();
            state.staticMode = true;
            state.onlineSource = "OFFLINE";
            state.bridge = snap.bridge || { online: false, active_workers: [], pending_orders_count: 0 };
            state.orders = snap.orders || [];
            state.swarmMessages = snap.swarm_messages || [];
            state.divisions = snap.divisions || [];
            state.departments = snap.departments || [];
            state.missions = snap.missions || [];
            state.opportunities = snap.opportunities || [];
            state.tasks = snap.tasks || [];
            state.projects = snap.projects || [];
            state.articles = snap.knowledge_atoms || [];
            state.learningRuns = snap.learning_runs || [];
            state.learningProgress = snap.learning_progress || { running: false };
            state.installedSkills = snap.installed_skills || [];
            state.projectLedger = snap.project_ledger || [];
            state.reworkTickets = snap.rework_tickets || [];
            state.reworkSummary = snap.rework_summary || {};
            state.mediaCampaigns = snap.media_campaigns || [];
            state.deptHandoffs = snap.dept_handoffs || [];
            state.corporateDirectorySummary = snap.corporate_directory_summary || null;
            state.financeSummary = snap.finance_summary || null;
            state.lastSyncAt = snap.exported_at || new Date().toISOString();
            break;
          }
        } catch (_e) {}
      }
    }
    if (!state.staticMode) throw origErr;
    return handleOfflineFallback(path, method, body);
  }

  function computeProjectFinanceFallback(pid) {
    const p = state.projects.find((x) => x.project_id === pid);
    if (!p) return null;
    const ledger = state.projectLedger.filter((e) => e.project_id === pid);
    let actRev = 0; let actExp = 0; let actTax = 0;
    let planRev = 0; let planExp = 0; let planTax = 0;
    const byMonth = new Map();
    const byCat = new Map();

    ledger.forEach((e) => {
      const amt = Number(e.amount_vnd || 0);
      const isEst = Boolean(e.is_estimate);
      if (e.entry_type === "REVENUE") { if (isEst) planRev += amt; else actRev += amt; }
      if (e.entry_type === "EXPENSE") { if (isEst) planExp += amt; else actExp += amt; }
      if (e.entry_type === "TAX_RESERVE") { if (isEst) planTax += amt; else actTax += amt; }

      const mKey = String(e.entry_date || todayIso()).slice(0, 7);
      if (!byMonth.has(mKey)) byMonth.set(mKey, { month: mKey, revenue: 0, expense: 0, tax: 0, profit: 0 });
      const mr = byMonth.get(mKey);
      if (e.entry_type === "REVENUE") mr.revenue += amt;
      if (e.entry_type === "EXPENSE") mr.expense += amt;
      if (e.entry_type === "TAX_RESERVE") mr.tax += amt;
      mr.profit = mr.revenue - mr.expense - mr.tax;

      const cKey = `${e.entry_type}:${e.category || "Vận hành"}`;
      if (!byCat.has(cKey)) byCat.set(cKey, { category: e.category || "Vận hành", entry_type: e.entry_type, amount_vnd: 0 });
      byCat.get(cKey).amount_vnd += amt;
    });

    const price = Number(p.expected_price_vnd || 249000);
    const unitCost = Number(p.unit_cost_vnd || Math.round(price * 0.2));
    const fixedCost = Number(p.fixed_cost_monthly_vnd || 1500000);
    const margin = price > 0 ? Math.max(0, ((price - unitCost) / price) * 100) : 0;
    const netUnit = price - unitCost - price * 0.07;
    const breakeven = netUnit > 0 ? Math.ceil(fixedCost / netUnit) : 0;

    const pTasks = state.tasks.filter((t) => t.project_id === pid);
    const pDone = pTasks.filter((t) => t.kanban_column === "DONE").length;
    const pMissions = state.missions.filter((m) => m.project_id === pid);

    return {
      project: p,
      summary: {
        project_id: p.project_id,
        slug: p.slug || "",
        title: p.title,
        status: p.status || "ACTIVE",
        target_market: p.target_market || p.objective || "",
        expected_price_vnd: price,
        unit_cost_vnd: unitCost,
        fixed_cost_monthly_vnd: fixedCost,
        actual_revenue_vnd: actRev,
        actual_expense_vnd: actExp,
        actual_tax_vnd: actTax,
        actual_net_profit_vnd: actRev - actExp - actTax,
        plan_revenue_vnd: planRev,
        plan_expense_vnd: planExp,
        plan_tax_vnd: planTax,
        plan_net_profit_vnd: planRev - planExp - planTax,
        gross_margin_pct: Number(margin.toFixed(1)),
        breakeven_customers: breakeven,
        target_100_mrr_vnd: price * 100,
        monthly_series: Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month)),
        by_category: Array.from(byCat.values()).sort((a, b) => b.amount_vnd - a.amount_vnd),
        tasks_total: pTasks.length,
        tasks_done: pDone,
        progress_pct: pTasks.length ? Math.round((pDone / pTasks.length) * 100) : 0,
        missions_count: pMissions.length,
        preview_urls: []
      },
      ledger,
      tasks: pTasks,
      missions: pMissions
    };
  }

  function computeCorporateFinanceFallback() {
    if (state.financeSummary && Array.isArray(state.financeSummary.projects)) {
      return state.financeSummary;
    }
    const items = state.projects.map((p) => {
      const f = computeProjectFinanceFallback(p.project_id);
      return f ? f.summary : null;
    }).filter(Boolean);
    return {
      actual_revenue_vnd: items.reduce((s, x) => s + Number(x.actual_revenue_vnd || 0), 0),
      actual_expense_vnd: items.reduce((s, x) => s + Number(x.actual_expense_vnd || 0), 0),
      actual_tax_vnd: items.reduce((s, x) => s + Number(x.actual_tax_vnd || 0), 0),
      actual_net_profit_vnd: items.reduce((s, x) => s + Number(x.actual_net_profit_vnd || 0), 0),
      plan_revenue_vnd: items.reduce((s, x) => s + Number(x.plan_revenue_vnd || 0), 0),
      plan_expense_vnd: items.reduce((s, x) => s + Number(x.plan_expense_vnd || 0), 0),
      plan_tax_vnd: items.reduce((s, x) => s + Number(x.plan_tax_vnd || 0), 0),
      plan_net_profit_vnd: items.reduce((s, x) => s + Number(x.plan_net_profit_vnd || 0), 0),
      projects: items
    };
  }

  function handleOfflineFallback(path, method, body) {
    if (method === "GET") {
      if (path.startsWith("/api/overview")) {
        return {
          bridge: state.bridge,
          kpis: { total_departments: state.departments.length, total_knowledge_atoms: state.articles.length },
          divisions: state.divisions,
          projects: state.projects,
          missions: state.missions,
          opportunities: state.opportunities,
          orders: state.orders,
          swarm_messages: state.swarmMessages,
          learning_runs: state.learningRuns,
          learning_progress: state.learningProgress,
          installed_skills: state.installedSkills,
          project_ledger: state.projectLedger,
          rework_tickets: state.reworkTickets,
          rework_summary: state.reworkSummary,
          media_campaigns: state.mediaCampaigns,
          dept_handoffs: state.deptHandoffs,
          corporate_directory_summary: state.corporateDirectorySummary,
          finance_summary: computeCorporateFinanceFallback()
        };
      }
      if (path.startsWith("/api/media/campaigns")) {
        return { campaigns: state.mediaCampaigns };
      }
      if (path.startsWith("/api/rework")) {
        return { rework_tickets: state.reworkTickets, rework_summary: state.reworkSummary };
      }
      if (path.startsWith("/api/org/directory")) {
        return buildFallbackDirectoryPayload();
      }
      if (path.startsWith("/api/handoffs")) {
        return { count: state.deptHandoffs.length, handoffs: state.deptHandoffs };
      }
      if (path === "/api/learning/status") {
        return { learning_in_progress: false, learning_progress: state.learningProgress, recent_runs: state.learningRuns };
      }
      if (path.startsWith("/api/skills")) {
        return { skills: state.installedSkills };
      }
      if (path.startsWith("/api/finance/summary")) {
        return computeCorporateFinanceFallback();
      }
      const pmDet = path.match(/^\/api\/projects\/([^/]+)\/detail$/);
      if (pmDet) {
        const pid = decodeURIComponent(pmDet[1]);
        const fin = computeProjectFinanceFallback(pid);
        if (!fin) return {};
        return {
          project: fin.project,
          files: [],
          tasks: fin.tasks || [],
          missions: fin.missions || [],
          rework_tickets: (state.reworkTickets || []).filter((rw) => rw.project_id === pid),
          media_campaigns: (state.mediaCampaigns || []).filter((mc) => mc.project_id === pid),
          finance_summary: fin.summary || {},
          ledger: fin.ledger || []
        };
      }
      const pmFin = path.match(/^\/api\/projects\/([^/]+)\/finance$/);
      if (pmFin) {
        return computeProjectFinanceFallback(decodeURIComponent(pmFin[1])) || {};
      }
      if (path === "/api/bridge/status") return state.bridge;
      if (path.startsWith("/api/orders")) return { orders: state.orders, bridge: state.bridge };
      if (path === "/api/departments") return { departments: state.departments };
      const md = path.match(/^\/api\/departments\/(.+)$/);
      if (md) {
        const d = state.departments.find((x) => x.dept_id === md[1]);
        if (!d) return {};
        const divLabel = DIV_SHORT_NAMES[d.division_code] || d.division_code;
        return {
          ...d,
          handbook_markdown: d.handbook_markdown || `# ${cleanDeptTitleVi(d.dept_id, d.title_vi)}\n- Đơn vị: **${divLabel}**`,
          learned_articles: state.articles.filter((a) => a.dept_id === d.dept_id),
          installed_skills: state.installedSkills.filter((sk) => parseDeptIdsJson(sk.dept_ids_json || sk.dept_ids).includes(d.dept_id)),
          reflexions: []
        };
      }
      if (path.startsWith("/api/tasks")) return { tasks: state.tasks };
      if (path.startsWith("/api/missions")) return { missions: state.missions };
      if (path.startsWith("/api/opportunities")) return { opportunities: state.opportunities };
      if (path.startsWith("/api/knowledge")) return { articles: state.articles };
      if (path.startsWith("/api/projects")) return { projects: state.projects, files: [] };
      if (path.startsWith("/api/sync/snapshot")) {
        return {
          schema_version: "8.0",
          bridge: state.bridge,
          divisions: state.divisions,
          departments: state.departments,
          projects: state.projects,
          tasks: state.tasks,
          missions: state.missions,
          opportunities: state.opportunities,
          orders: state.orders,
          knowledge_atoms: state.articles,
          learning_runs: state.learningRuns,
          installed_skills: state.installedSkills,
          project_ledger: state.projectLedger,
          rework_tickets: state.reworkTickets
        };
      }
    }

    // Offline mutations with safe local state update
    if (method === "POST" && path === "/api/rework/bounce") {
      const tk = {
        ticket_id: `rw-${Date.now().toString(36)}`,
        mission_id: body.mission_id || null,
        project_id: body.project_id || null,
        task_id: body.task_id || null,
        step_order: Number(body.step_order || 0),
        source_dept_id: String(body.source_dept_id || "51").padStart(2, "0"),
        target_dept_id: String(body.target_dept_id || "13").padStart(2, "0"),
        severity: body.severity || "HIGH",
        defect_category: body.defect_category || "BUG",
        title: body.title || "Thiếu sót cần sửa",
        detail_vi: body.detail_vi || "",
        fix_note_vi: "",
        reopen_count: 0,
        status: "OPEN",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      state.reworkTickets.unshift(tk);
      saveOfflineViewCache();
      return tk;
    }
    if (method === "PATCH" && path.startsWith("/api/rework/")) {
      const tid = decodeURIComponent(path.split("/")[3] || "");
      const rec = state.reworkTickets.find((x) => x.ticket_id === tid);
      if (rec) {
        if (body.status === "OPEN" && rec.status === "FIXED_PENDING_RECHECK") {
          rec.reopen_count = Number(rec.reopen_count || 0) + 1;
        }
        if (body.status) rec.status = body.status;
        if (body.fix_note_vi !== undefined) rec.fix_note_vi = body.fix_note_vi;
        rec.updated_at = new Date().toISOString();
      }
      saveOfflineViewCache();
      return rec || {};
    }
    const ledgerPost = path.match(/^\/api\/projects\/([^/]+)\/finance\/ledger$/);
    if (method === "POST" && ledgerPost) {
      const pid = decodeURIComponent(ledgerPost[1]);
      const entry = {
        entry_id: `ldg-${Date.now().toString(36)}`,
        project_id: pid,
        entry_type: body.entry_type || "EXPENSE",
        category: body.category || "Vận hành",
        title: body.title || "Bút toán mới",
        amount_vnd: Number(body.amount_vnd || 0),
        is_estimate: body.is_estimate ? 1 : 0,
        entry_date: body.entry_date || todayIso(),
        note: body.note || "",
        created_at: new Date().toISOString()
      };
      state.projectLedger.unshift(entry);
      state.financeSummary = null;
      saveOfflineViewCache();
      return entry;
    }
    if (method === "PATCH" && path.startsWith("/api/finance/ledger/")) {
      const eid = decodeURIComponent(path.split("/")[4] || "");
      const rec = state.projectLedger.find((x) => x.entry_id === eid);
      if (rec) Object.assign(rec, body);
      state.financeSummary = null;
      saveOfflineViewCache();
      return rec || {};
    }
    if (method === "DELETE" && path.startsWith("/api/finance/ledger/")) {
      const eid = decodeURIComponent(path.split("/")[4] || "");
      state.projectLedger = state.projectLedger.filter((x) => x.entry_id !== eid);
      state.financeSummary = null;
      saveOfflineViewCache();
      return { deleted: true, entity_id: eid };
    }
    if (method === "POST" && path === "/api/skills/acquire") {
      return { ok: true, acquired_count: 0, summary_vi: "Đang ngoại tuyến: vui lòng kết nối trực tuyến để tải kỹ năng mới từ GitHub.", skills: state.installedSkills };
    }
    if (method === "POST" && path === "/api/learning/run") {
      return { started: false, message: "Đang ngoại tuyến: hệ thống sẽ quét báo mới ngay khi kết nối trực tuyến hoạt động." };
    }
    if (method === "POST" && path === "/api/missions") {
      const msn = buildClientMission(body.title || body.goal_prompt, body.auto_approve);
      state.missions.unshift(msn);
      const ord = {
        order_id: `ord-${Date.now().toString(36)}`,
        order_type: "NEW_MISSION",
        mission_id: msn.mission_id,
        title: msn.title,
        instructions: msn.goal_prompt,
        source_device: "web-online",
        status: "PENDING",
        created_at: new Date().toISOString()
      };
      state.orders.unshift(ord);
      saveOfflineViewCache();
      pushRemoteOrderToCloud(ord).catch(() => {});
      return { ...msn, order_id: ord.order_id, bridge_online: false };
    }
    if (method === "PATCH" && path.startsWith("/api/missions/")) {
      const mid = path.split("/")[3];
      const m = state.missions.find((x) => x.mission_id === mid);
      if (m) Object.assign(m, body);
      saveOfflineViewCache();
      return m || {};
    }
    if (method === "POST" && path === "/api/missions/bulk") {
      if (body.action === "clear_completed") {
        const before = state.missions.length;
        state.missions = state.missions.filter((m) => m.status !== "COMPLETED");
        saveOfflineViewCache();
        return { affected: before - state.missions.length, deleted_ids: [] };
      }
    }
    if (method === "POST" && path === "/api/opportunities") {
      const no = { opp_id: `opp-${Date.now()}`, status: "NEW", breakeven_users: 5, survival_score: 86, ...body };
      state.opportunities.unshift(no);
      saveOfflineViewCache();
      return no;
    }
    if (method === "PATCH" && path.startsWith("/api/opportunities/")) {
      const oid = path.split("/")[3];
      const o = state.opportunities.find((x) => x.opp_id === oid);
      if (o) Object.assign(o, body);
      saveOfflineViewCache();
      return o || {};
    }
    if (method === "POST" && path === "/api/opportunities/scan") {
      const ord = {
        order_id: `ord-${Date.now().toString(36)}`,
        order_type: "SCAN_OPPORTUNITIES",
        title: "Săn cơ hội sinh lời mới (Phòng #50, #46, #38)",
        instructions: "Tìm 3 cơ hội sản phẩm hoặc dịch vụ khả thi cao nhất hiện tại.",
        source_device: "web-online",
        status: "PENDING",
        created_at: new Date().toISOString()
      };
      state.orders.unshift(ord);
      saveOfflineViewCache();
      pushRemoteOrderToCloud(ord).catch(() => {});
      return { queued: true, order: ord, opportunities: state.opportunities, message: "Đã đưa yêu cầu săn cơ hội mới vào hàng đợi trực tuyến." };
    }
    if (method === "POST" && path.endsWith("/accept")) {
      const oid = path.split("/")[3];
      const opp = state.opportunities.find((o) => o.opp_id === oid);
      if (opp) {
        opp.status = "ACCEPTED";
        const msn = buildClientMission(opp.title, false);
        state.missions.unshift(msn);
        const ord = {
          order_id: `ord-${Date.now().toString(36)}`,
          order_type: "NEW_MISSION",
          mission_id: msn.mission_id,
          title: opp.title,
          instructions: `Khách hàng: ${opp.target_customer}. Nỗi đau: ${opp.pain_point}`,
          source_device: "web-online",
          status: "PENDING",
          created_at: new Date().toISOString()
        };
        state.orders.unshift(ord);
        saveOfflineViewCache();
        pushRemoteOrderToCloud(ord).catch(() => {});
        return { ...msn, order_id: ord.order_id, bridge_online: false };
      }
    }
    if (method === "POST" && path.endsWith("/dispatch")) {
      const tid = path.split("/")[3];
      const t = state.tasks.find((x) => x.task_id === tid);
      const ord = {
        order_id: `ord-${Date.now().toString(36)}`,
        order_type: "EXECUTE_TASK",
        task_id: tid,
        title: t ? t.title : tid,
        instructions: t ? t.description || t.title : tid,
        source_device: "web-online",
        status: "PENDING",
        created_at: new Date().toISOString()
      };
      state.orders.unshift(ord);
      saveOfflineViewCache();
      pushRemoteOrderToCloud(ord).catch(() => {});
      return { queued: true, order: ord };
    }
    if (method === "POST" && path === "/api/tasks") {
      const resolvedDept = (!body.assigned_dept_id || body.assigned_dept_id === "AUTO")
        ? smartRouteDepartmentLocal(body.title, body.description)
        : body.assigned_dept_id;
      const dispatchNow = Boolean(body.dispatch_now);
      const nt = {
        task_id: `task-${Date.now()}`,
        kanban_column: dispatchNow ? "IN_PROGRESS" : (body.kanban_column || "BACKLOG"),
        priority: body.priority || "HIGH",
        ...body,
        assigned_dept_id: resolvedDept
      };
      state.tasks.unshift(nt);
      let ord = null;
      if (dispatchNow) {
        ord = {
          order_id: `ord-${Date.now().toString(36)}`,
          order_type: "EXECUTE_TASK",
          task_id: nt.task_id,
          title: nt.title,
          instructions: nt.description || nt.title,
          source_device: "web-online",
          status: "PENDING",
          created_at: new Date().toISOString()
        };
        state.orders.unshift(ord);
        pushRemoteOrderToCloud(ord).catch(() => {});
      }
      saveOfflineViewCache();
      return { ...nt, dispatched: dispatchNow, order: ord, assigned_dept_title_vi: deptTitle(resolvedDept) };
    }
    if (method === "POST" && path.endsWith("/duplicate")) {
      const tid = path.split("/")[3];
      const orig = state.tasks.find((x) => x.task_id === tid);
      if (orig) {
        const copy = { ...orig, task_id: `task-${Date.now()}`, title: `${orig.title} (Bản sao)` };
        state.tasks.unshift(copy);
        saveOfflineViewCache();
        return copy;
      }
    }
    if (method === "PATCH" && path.startsWith("/api/tasks/")) {
      const tid = path.split("/")[3];
      const t = state.tasks.find((x) => x.task_id === tid);
      if (t) Object.assign(t, body);
      saveOfflineViewCache();
      return t || {};
    }
    if (method === "POST" && path === "/api/tasks/bulk") {
      const ids = new Set(body.task_ids || []);
      let affected = 0;
      if (body.action === "clear_done") {
        const b = state.tasks.length;
        state.tasks = state.tasks.filter((t) => t.kanban_column !== "DONE");
        affected = b - state.tasks.length;
      } else if (body.action === "delete") {
        const b = state.tasks.length;
        state.tasks = state.tasks.filter((t) => !ids.has(t.task_id));
        affected = b - state.tasks.length;
      } else if (body.action === "move_column") {
        state.tasks.forEach((t) => {
          if (ids.has(t.task_id)) { t.kanban_column = body.column; affected += 1; }
        });
      }
      saveOfflineViewCache();
      return { affected, deleted_ids: [] };
    }
    if (method === "POST" && path === "/api/projects") {
      const np = { project_id: `proj-${slugifyVi(body.slug || body.title)}`, status: body.status || "ACTIVE", ...body };
      state.projects.unshift(np);
      state.financeSummary = null;
      saveOfflineViewCache();
      return np;
    }
    if (method === "PATCH" && path.startsWith("/api/projects/")) {
      const pid = path.split("/")[3];
      const p = state.projects.find((x) => x.project_id === pid);
      if (p) Object.assign(p, body);
      state.financeSummary = null;
      saveOfflineViewCache();
      return p || {};
    }
    if (method === "PATCH" && path.startsWith("/api/knowledge/")) {
      const aid = Number(path.split("/")[3]);
      const a = state.articles.find((x) => Number(x.atom_id) === aid);
      if (a) a.is_starred = a.is_starred ? 0 : 1;
      saveOfflineViewCache();
      return a || {};
    }
    if (method === "DELETE") {
      const parts = path.split("/");
      if (parts[2] === "tasks") state.tasks = state.tasks.filter((x) => x.task_id !== parts[3]);
      if (parts[2] === "missions") state.missions = state.missions.filter((x) => x.mission_id !== parts[3]);
      if (parts[2] === "opportunities") state.opportunities = state.opportunities.filter((x) => x.opp_id !== parts[3]);
      if (parts[2] === "projects") { state.projects = state.projects.filter((x) => x.project_id !== parts[3]); state.financeSummary = null; }
      if (parts[2] === "knowledge") state.articles = state.articles.filter((x) => Number(x.atom_id) !== Number(parts[3]));
      saveOfflineViewCache();
      return { deleted: true };
    }
    if (method === "POST" && path.endsWith("/decision")) {
      const parts = path.split("/");
      if (parts[2] === "missions") {
        const m = state.missions.find((x) => x.mission_id === parts[3]);
        if (m) {
          const isProposalGate = m.phase === "PROPOSAL" && (m.total_steps || 8) >= 8;
          if (body.decision === "APPROVE" && isProposalGate) {
            m.phase = "PRODUCTION"; m.status = "RUNNING"; m.current_step_order = 5; m.progress_pct = 50;
          } else if (body.decision === "APPROVE") {
            m.phase = "DELIVERED"; m.status = "COMPLETED"; m.progress_pct = 100;
            (m.steps || []).forEach((s) => { s.status = "DONE"; });
          } else {
            m.status = "RUNNING"; m.progress_pct = isProposalGate ? 15 : 50;
          }
        }
        saveOfflineViewCache();
        return m || {};
      }
      if (parts[2] === "tasks") {
        const t = state.tasks.find((x) => x.task_id === parts[3]);
        if (t) t.kanban_column = body.decision === "APPROVE" ? "DONE" : "IN_PROGRESS";
        saveOfflineViewCache();
        return t || {};
      }
    }
    return {};
  }

  function buildClientMission(title, autoApprove) {
    const mid = `msn-${Date.now().toString(36)}`;
    const tpl = [
      [1, "Giai đoạn 1: Săn nhu cầu thật, đối thủ và tâm lý khách trả tiền", "01,02,03,50"],
      [2, "Giai đoạn 1: Tính vốn, giá bán, thuế và khóa biên lãi gộp tối thiểu 65%", "38,39"],
      [3, "Giai đoạn 1: Phản biện rủi ro và chốt kiến trúc sản phẩm", "46,47,06,12"],
      [4, "Giai đoạn 1: Trình duyệt chốt kèo để bắt đầu sản xuất sản phẩm", "00"],
      [5, "Giai đoạn 2: Xây dựng Sản phẩm Cuối hoàn chỉnh (Web và Di động)", "13,14,15,16,17,19"],
      [6, "Giai đoạn 2: Đóng gói Trang bán hàng, Bảng giá, Video và Kịch bản 50 khách đầu", "25,26,29,32,33,40"],
      [7, "Giai đoạn 2: Kiểm thử khách hàng thật trên 5 nhóm và phản biện chốt lỗi", "48,49,20,23,47"],
      [8, "Giai đoạn 2: Bàn giao Sản phẩm Cuối hoàn chỉnh và kịch bản thu tiền", "00,19,35"]
    ];
    return {
      mission_id: mid, title, goal_prompt: title, status: "RUNNING", phase: "PROPOSAL", project_id: "",
      dispatch_state: "QUEUED_FOR_ANTIGRAVITY", swarm_workers_json: "[]", auto_approve: autoApprove ? 1 : 0,
      current_step_order: 1, total_steps: 8, progress_pct: 0,
      steps: tpl.map(([ord, stitle, leads]) => ({
        step_id: `${mid}-s${ord}`, step_order: ord, title: stitle, lead_dept_ids: leads,
        lead_depts: leads.split(",").map((i) => ({ dept_id: i, title_vi: deptTitle(i) })),
        status: "PENDING", worker_name: "", artifact_path: "",
        live_activity_text: ord === 1 ? "Đã xếp hàng chờ đội ngũ trực tuyến tiếp nhận và triển khai." : "",
        output_summary: "", critique_verdict: "", ux_verdict: ""
      }))
    };
  }

  async function pushRemoteOrderToCloud(orderObj) {
    if (!sessionUnlockedCloud) return false;
    const { repo, token } = sessionUnlockedCloud;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/corporate_hq/cloud_state/remote_inbox.json`;
    const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` };
    let sha = null;
    let inbox = { updated_at: new Date().toISOString(), orders: [] };
    try {
      const r = await fetch(apiUrl, { headers });
      if (r.ok) {
        const meta = await r.json();
        sha = meta.sha;
        inbox = JSON.parse(cryptoVault.b64ToUtf8(meta.content || ""));
      }
    } catch (_e) {}
    inbox.orders = (inbox.orders || []).slice(-29);
    inbox.orders.push(orderObj);
    inbox.updated_at = new Date().toISOString();
    const putBody = {
      message: `chore(remote-order): ${orderObj.title.slice(0, 60)}`,
      content: cryptoVault.utf8ToB64(JSON.stringify(inbox, null, 2))
    };
    if (sha) putBody.sha = sha;
    const pr = await fetch(apiUrl, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(putBody)
    });
    if (pr.ok) {
      toast("Đã gửi lệnh lên kênh đồng bộ đám mây thành công.");
      return true;
    }
    return false;
  }

  function buildHandoffCommand(mission) {
    return `/teamwork Thực thi nhiệm vụ "${mission.title}" (Mã: ${mission.mission_id}) theo đúng quy trình 8 bước của Trung tâm Điều hành Titan, kèm Phản biện rủi ro (#46, #47) và Kiểm thử khách hàng (#48, #49).`;
  }

  async function restoreDeleted(undoPayload) {
    if (state.staticMode) {
      const items = undoPayload.items || [undoPayload];
      items.forEach((it) => {
        if (!it.backup) return;
        if (it.entity_type === "task") state.tasks.unshift(it.backup);
        if (it.entity_type === "mission") state.missions.unshift(it.backup);
        if (it.entity_type === "opportunity") state.opportunities.unshift(it.backup);
        if (it.entity_type === "project") state.projects.unshift(it.backup);
        if (it.entity_type === "article") state.articles.unshift(it.backup);
        if (it.entity_type === "ledger") { state.projectLedger.unshift(it.backup); state.financeSummary = null; }
      });
      saveOfflineViewCache();
      renderAllViews();
      toast("Đã khôi phục lại mục vừa xóa.");
      return;
    }
    try {
      const body = undoPayload.items
        ? { items: undoPayload.items.map((x) => ({ entity_type: x.entity_type, entity_id: x.entity_id })) }
        : { entity_type: undoPayload.entity_type, entity_id: undoPayload.entity_id };
      await api("/api/trash/restore", "POST", body);
      await Promise.all([loadEverything(), loadNews(document.getElementById("news-search-input").value || "")]);
      if (undoPayload.entity_type === "doc" && (state.selectedProjectId || state.financeViewProjectId)) {
        await loadProjectDocs(state.selectedProjectId || state.financeViewProjectId);
      }
      if (undoPayload.entity_type === "ledger") {
        if (state.financeViewProjectId) await loadActiveProjectFinance(state.financeViewProjectId);
        if (state.selectedProjectId) await loadProjectDetail(state.selectedProjectId);
      }
      toast("Đã khôi phục nguyên trạng mục vừa xóa.");
    } catch (e) {
      toast(`Không thể hoàn tác: ${e.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 5. DEDUPLICATED NEWS, LIVE LEARNING POLLING & HEADER COUNTS
  // -------------------------------------------------------------------------
  function getDeduplicatedArticles() {
    const map = new Map();
    for (const a of state.articles) {
      const key = a.url || a.url_hash || String(a.atom_id);
      if (!map.has(key)) {
        map.set(key, { ...a, dept_list: [a.dept_id] });
      } else {
        const existing = map.get(key);
        if (!existing.dept_list.includes(a.dept_id)) existing.dept_list.push(a.dept_id);
        if (a.is_starred) existing.is_starred = 1;
      }
    }
    return Array.from(map.values());
  }

  function startLearningStatusPolling() {
    if (state.staticMode) return;
    if (state.learningPollTimer) clearInterval(state.learningPollTimer);
    let ticks = 0;
    const poll = async () => {
      ticks += 1;
      try {
        const st = await api("/api/learning/status");
        if (st && st.learning_progress) state.learningProgress = st.learning_progress;
        if (st && Array.isArray(st.recent_runs)) state.learningRuns = st.recent_runs;
        renderCountsAndHeader();
        if (state.tab === "news") renderLearningBanner();
        if (state.tab === "missions") renderProgressTab();

        const stillRunning = Boolean(st && (st.learning_in_progress || (st.learning_progress && st.learning_progress.running)));
        if (!stillRunning || ticks > 90) {
          clearInterval(state.learningPollTimer);
          state.learningPollTimer = null;
          await Promise.all([loadEverything(), loadNews(document.getElementById("news-search-input").value || "")]);
          const lastSummary = (state.learningProgress && state.learningProgress.summary_vi)
            || (state.learningRuns[0] && state.learningRuns[0].summary_vi)
            || "Đã hoàn tất đợt quét báo mới.";
          toast(lastSummary);
        }
      } catch (_e) {
        if (ticks > 3) {
          clearInterval(state.learningPollTimer);
          state.learningPollTimer = null;
        }
      }
    };
    state.learningPollTimer = setInterval(poll, 1200);
    poll();
  }

  async function triggerLearningScan(scope = "all", btnEl = null) {
    await withLock(btnEl, async () => {
      state.learningProgress = {
        running: true,
        scope,
        sources_done: 0,
        sources_total: 24,
        current_source_vi: "Đang khởi động các nguồn tin thật...",
        new_atoms_added: 0,
        duplicates_skipped: 0,
        errors_count: 0,
        touched_depts: []
      };
      renderCountsAndHeader();
      if (state.tab === "news") renderLearningBanner();
      if (state.tab === "missions") renderProgressTab();

      const r = await api("/api/learning/run", "POST", { scope });
      if (state.staticMode) {
        state.learningProgress = { running: false };
        toast(sanitizeUiVietnamese((r && r.message) || "Đang ngoại tuyến."));
        renderCountsAndHeader();
        if (state.tab === "news") renderLearningBanner();
        return;
      }
      toast(sanitizeUiVietnamese((r && r.message) || "Đang quét 24 nguồn báo mới trực tiếp..."));
      startLearningStatusPolling();
    });
  }

  function renderCountsAndHeader() {
    const runningM = state.missions.filter((m) => m.status === "RUNNING").length;
    const waitM = state.missions.filter((m) => m.status === "WAITING_CHAIRMAN").length;
    const waitT = state.tasks.filter((t) => t.kanban_column === "WAITING_APPROVAL").length;
    const totalWait = waitM + waitT;
    const activeOpps = state.opportunities.filter((o) => o.status === "NEW").length;
    const staffTotal = state.departments.length || 54;
    const uniqueNewsCount = getDeduplicatedArticles().length;
    const skillsCount = state.installedSkills.length;

    const skillsEyebrow = document.getElementById("lbl-skills-depts-eyebrow");
    if (skillsEyebrow) {
      skillsEyebrow.textContent = `Kỹ năng chuyên môn đã nạp cho ${staffTotal} phòng ban`;
    }
    const footerBrand = document.getElementById("footer-brand-summary");
    if (footerBrand) {
      footerBrand.textContent = `Trung tâm Điều hành Titan v11.1: Vận hành trực tuyến tự động ${staffTotal} phòng chuyên gia.`;
    }
    const navProj = document.getElementById("nav-cnt-projects");
    if (navProj) navProj.textContent = state.projects.length;
    const staffSearchEl = document.getElementById("staff-search");
    if (staffSearchEl) {
      const maxCode = String(Math.max(53, staffTotal - 1)).padStart(2, "0");
      staffSearchEl.placeholder = `Tìm theo tên, mã phòng (00 đến ${maxCode}), kỹ năng...`;
    }

    const activeOrders = state.orders.filter((o) => ["PENDING", "RUNNING", "IN_PROGRESS"].includes(String(o.status || "").toUpperCase()));
    const learningRunning = Boolean(state.learningProgress && state.learningProgress.running);
    const totalActiveAll = runningM + activeOrders.length + (learningRunning ? 1 : 0);

    const avgPct = state.missions.length
      ? Math.round(state.missions.reduce((acc, m) => acc + Number(m.progress_pct || 0), 0) / state.missions.length)
      : 0;

    document.getElementById("stat-running-missions").textContent = runningM;
    document.getElementById("stat-waiting-approvals").textContent = totalWait;
    document.getElementById("stat-staff-ready").textContent = staffTotal;
    document.getElementById("stat-news-count").textContent = uniqueNewsCount;

    const skillsLbl = document.getElementById("lbl-skills-total");
    if (skillsLbl) {
      skillsLbl.textContent = skillsCount > 0
        ? `Bài phân tích mới và ${skillsCount} kỹ năng GitHub`
        : "Bài phân tích mới đã tổng hợp";
    }
    const subSkills = document.getElementById("lbl-subtab-skills");
    if (subSkills) {
      subSkills.textContent = skillsCount > 0
        ? `Kho Kỹ năng GitHub cho Nhân sự (${skillsCount})`
        : "Kho Kỹ năng GitHub cho Nhân sự";
    }

    const heroNote = document.getElementById("hero-status-note");
    if (heroNote) {
      heroNote.textContent = runningM > 0
        ? `Có ${runningM} nhiệm vụ đang được ${staffTotal} phòng chuyên gia triển khai song song.`
        : `Hệ thống ${staffTotal} phòng chuyên gia đang sẵn sàng tiếp nhận đề bài mới của bạn.`;
    }
    const heroProgLbl = document.getElementById("hero-progress-label");
    const heroProgBar = document.getElementById("hero-progress-bar");
    if (heroProgLbl) heroProgLbl.textContent = `${avgPct}%`;
    if (heroProgBar) heroProgBar.style.inlineSize = `${Math.max(4, avgPct)}%`;

    const waitCap = document.getElementById("stat-waiting-caption");
    if (waitCap) {
      waitCap.textContent = totalWait > 0
        ? `${totalWait} hạng mục đã phản biện xong, chờ bạn quyết định ngay bên dưới.`
        : "Hiện chưa có mục nào chờ duyệt cổng.";
    }

    // Tab 1 slim live activity banner
    const actBanner = document.getElementById("live-activity-banner");
    const actText = document.getElementById("live-activity-text");
    const actBtn = document.getElementById("btn-live-activity-jump");
    if (actBanner && actText && actBtn) {
      const scanOrd = activeOrders.find((o) => o.order_type === "SCAN_OPPORTUNITIES");
      const flowOrd = activeOrders.find((o) => o.order_type === "RENDER_GOOGLE_FLOW_VIDEO");
      const taskOrd = activeOrders.find((o) => o.order_type === "EXECUTE_TASK");
      if (learningRunning) {
        const lp = state.learningProgress;
        actBanner.classList.remove("is-hidden");
        actText.textContent = `Đang quét báo mới (${lp.sources_done || 0}/${lp.sources_total || 24}): ${sanitizeUiVietnamese(lp.current_source_vi || "Đang xử lý nguồn tin...")}`;
        actBtn.setAttribute("data-jump-pcat", "learning");
      } else if (flowOrd) {
        actBanner.classList.remove("is-hidden");
        actText.textContent = `Đang tạo video AI Google Flow: ${sanitizeUiVietnamese(flowOrd.title || "Chiến dịch Video AI")}`;
        actBtn.setAttribute("data-jump-pcat", "tasks");
      } else if (scanOrd) {
        actBanner.classList.remove("is-hidden");
        actText.textContent = `Đang chạy đợt săn cơ hội kiếm tiền: ${sanitizeUiVietnamese(scanOrd.title || "Săn cơ hội mới")}`;
        actBtn.setAttribute("data-jump-pcat", "opps");
      } else if (taskOrd) {
        actBanner.classList.remove("is-hidden");
        actText.textContent = `Đang chạy đầu việc giao chuyên gia: ${sanitizeUiVietnamese(taskOrd.title || "")}`;
        actBtn.setAttribute("data-jump-pcat", "tasks");
      } else {
        actBanner.classList.add("is-hidden");
      }
    }

    const workingStaff = state.departments.filter((d) => normalizeDeptStatus(d.status) === "WORKING").length;
    const studyingStaff = state.departments.filter((d) => normalizeDeptStatus(d.status) === "STUDYING").length;
    const blockedStaff = state.departments.filter((d) => normalizeDeptStatus(d.status) === "BLOCKED").length;
    const idleStaff = Math.max(0, staffTotal - workingStaff - studyingStaff - blockedStaff);
    const busyStaff = workingStaff + studyingStaff + blockedStaff;
    const readyPct = Math.round((idleStaff / Math.max(1, staffTotal)) * 100);
    const sideSummary = document.getElementById("sidebar-staff-summary");
    const sideFill = document.getElementById("sidebar-readiness-fill");
    if (sideSummary) {
      if (workingStaff > 0 && studyingStaff > 0) {
        sideSummary.textContent = `${workingStaff} phòng đang làm việc, ${studyingStaff} đang học, ${idleStaff} sẵn sàng`;
      } else if (workingStaff > 0) {
        sideSummary.textContent = `${workingStaff} phòng đang làm việc, ${idleStaff} sẵn sàng`;
      } else if (studyingStaff > 0) {
        sideSummary.textContent = `${studyingStaff} phòng đang học, ${idleStaff} sẵn sàng`;
      } else if (blockedStaff > 0) {
        sideSummary.textContent = `${blockedStaff} phòng đang bị chặn, ${idleStaff} sẵn sàng`;
      } else {
        sideSummary.textContent = `${staffTotal} phòng chuyên gia sẵn sàng nhận đề bài`;
      }
    }
    if (sideFill) sideFill.style.inlineSize = `${Math.max(10, readyPct)}%`;

    const navOpps = document.getElementById("nav-cnt-opps");
    navOpps.textContent = totalWait > 0 ? totalWait : activeOpps;
    navOpps.classList.toggle("warn", totalWait > 0);

    const navMsn = document.getElementById("nav-cnt-missions");
    const badgeProg = totalActiveAll + waitM;
    navMsn.textContent = badgeProg > 0 ? badgeProg : state.missions.length;
    navMsn.classList.toggle("warn", badgeProg > 0);

    document.getElementById("nav-cnt-tasks").textContent = state.tasks.filter((t) => t.kanban_column !== "DONE").length;
    document.getElementById("nav-cnt-staff").textContent = staffTotal;
    document.getElementById("nav-cnt-news").textContent = uniqueNewsCount;

    if (state.tab === "staff") {
      document.getElementById("view-heading").textContent = `Nhân sự (${staffTotal})`;
    }

    const chip = document.getElementById("live-indicator");
    const lbl = document.getElementById("live-label");
    const footerConn = document.getElementById("footer-conn-summary");
    const footerSync = document.getElementById("footer-last-sync");
    const b = state.bridge || {};
    const workers = Array.isArray(b.active_workers) ? b.active_workers : [];
    const pendingOrd = Number(b.pending_orders_count || 0);

    if (state.staticMode) {
      if (sessionUnlockedCloud) {
        chip.setAttribute("data-state", "online");
        lbl.textContent = "Trực tuyến: Đang kết nối";
        if (footerConn) footerConn.textContent = "Kênh đồng bộ đám mây 2 chiều đang bật";
      } else {
        chip.setAttribute("data-state", "offline");
        lbl.textContent = "Đang ngoại tuyến (Chế độ xem)";
        if (footerConn) footerConn.textContent = "Đang dùng bản lưu trực tuyến mới nhất";
      }
    } else if (b.online) {
      chip.setAttribute("data-state", "online");
      lbl.textContent = workers.length
        ? `Trực tuyến: Đang hoạt động (${workers.length} chuyên gia)`
        : "Trực tuyến: Đang hoạt động";
      if (footerConn) footerConn.textContent = "Kết nối trực tuyến ổn định";
    } else {
      chip.setAttribute("data-state", "online");
      lbl.textContent = pendingOrd > 0
        ? `Trực tuyến: Đang kết nối (${pendingOrd} lệnh chờ)`
        : "Trực tuyến: Đang kết nối";
      if (footerConn) footerConn.textContent = "Cầu nối trực tuyến đang hoạt động";
    }

    if (footerSync) {
      const t = shortTime(state.lastSyncAt || new Date().toISOString());
      footerSync.textContent = t ? `Cập nhật gần nhất: ${t}` : "Cập nhật gần nhất: Vừa xong";
    }
  }

  // -------------------------------------------------------------------------
  // 6. TAB 1: GIAO VIEC
  // -------------------------------------------------------------------------
  function renderCommandTab() {
    const waitMissions = state.missions.filter((m) => m.status === "WAITING_CHAIRMAN");
    const waitTasks = state.tasks.filter((t) => t.kanban_column === "WAITING_APPROVAL");
    const wrap = document.getElementById("pending-approvals-section");
    const list = document.getElementById("pending-approvals-list");

    if (!waitMissions.length && !waitTasks.length) {
      wrap.classList.add("is-hidden");
    } else {
      wrap.classList.remove("is-hidden");
      let html = "";
      waitMissions.forEach((m) => {
        const isProposalGate = m.phase === "PROPOSAL" && (m.total_steps || 8) >= 8;
        const gateSubtitle = isProposalGate
          ? "Cổng 1: Chờ duyệt kèo để đội ngũ bắt đầu sản xuất sản phẩm thật (Bước 5 đến 8)"
          : "Cổng 2: Sản phẩm cuối đã hoàn thiện và kiểm thử khách hàng thật, chờ nghiệm thu";
        const approveLabel = isProposalGate
          ? `${ico("check")}<span>Duyệt kèo -> Sản xuất sản phẩm</span>`
          : `${ico("check")}<span>Nghiệm thu Sản phẩm Cuối</span>`;
        html += `
          <div class="list-row">
            <div class="row-main">
              <div class="row-title">${esc(sanitizeUiVietnamese(m.title))}</div>
              <div class="row-meta">${gateSubtitle}</div>
              ${m.final_summary ? `<div class="step-summary">${esc(sanitizeUiVietnamese(m.final_summary.split("\n")[0]))}</div>` : ""}
            </div>
            <div class="row-actions">
              <button type="button" class="btn btn-xs" data-open-mission="${esc(m.mission_id)}">Xem chi tiết</button>
              <button type="button" class="btn btn-xs btn-primary" data-approve-msn="${esc(m.mission_id)}">${approveLabel}</button>
              <button type="button" class="btn btn-xs" data-reject-msn="${esc(m.mission_id)}">${ico("rotate-ccw")}<span>Sửa lại</span></button>
              <button type="button" class="btn btn-xs btn-destructive" data-del-msn="${esc(m.mission_id)}">${ico("trash")}<span>Xóa</span></button>
            </div>
          </div>
        `;
      });
      waitTasks.forEach((t) => {
        html += `
          <div class="list-row">
            <div class="row-main">
              <div class="row-title">${esc(sanitizeUiVietnamese(t.title))}</div>
              <div class="row-meta">Việc lẻ: Phòng #${esc(t.assigned_dept_id)} (${esc(deptTitle(t.assigned_dept_id))}) trình duyệt</div>
            </div>
            <div class="row-actions">
              <button type="button" class="btn btn-xs" data-open-task-jump="${esc(t.task_id)}">Xem chi tiết</button>
              <button type="button" class="btn btn-xs btn-primary" data-approve-task="${esc(t.task_id)}">${ico("check")}<span>Chấp nhận</span></button>
              <button type="button" class="btn btn-xs" data-reject-task="${esc(t.task_id)}">${ico("rotate-ccw")}<span>Làm lại</span></button>
              <button type="button" class="btn btn-xs btn-destructive" data-del-task="${esc(t.task_id)}">${ico("trash")}<span>Xóa</span></button>
            </div>
          </div>
        `;
      });
      list.innerHTML = html;
      bindQuickActions(list);
    }

    const oppGrid = document.getElementById("opportunities-grid");
    const allVisibleOpps = state.opportunities.filter((o) => o.status !== "DISMISSED");
    const visibleOpps = state.oppTierFilter === "strategic"
      ? allVisibleOpps.filter((o) => {
          const score = Number(o.product_scale_score || o.survival_score || 0);
          const tier = String(o.opportunity_tier || "STANDARD").toUpperCase();
          return score >= 85 || tier === "FLAGSHIP_VENTURE" || tier === "PLG_PLATFORM";
        })
      : allVisibleOpps;

    document.querySelectorAll("#opp-tier-filter .seg-btn").forEach((b) => {
      const on = b.getAttribute("data-opp-filter") === state.oppTierFilter;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });

    if (!visibleOpps.length) {
      oppGrid.innerHTML = `
        <div class="empty-state opp-card-lead">
          <p>${state.oppTierFilter === "strategic"
            ? "Chưa có cơ hội hạng Chiến lược từ 85 điểm trở lên. Chuyển sang <strong>Tất cả cơ hội</strong> hoặc nhấn <strong>Săn cơ hội mới</strong>."
            : "Chưa có đề xuất cơ hội nào. Nhấn <strong>Săn cơ hội mới</strong> để Phòng #50 tìm kiếm và phân tích cho bạn."
          }</p>
        </div>
      `;
      return;
    }

    oppGrid.innerHTML = visibleOpps.map((o, idx) => {
      const isAccepted = o.status === "ACCEPTED";
      const isLead = idx === 0 && visibleOpps.length >= 2;
      const descText = sanitizeUiVietnamese(o.pain_point || o.critique_note || "");
      const tierKey = String(o.opportunity_tier || "STANDARD").toUpperCase();
      const tierMeta = OPP_TIER_META[tierKey] || OPP_TIER_META.STANDARD;
      const scaleScore = Number(o.product_scale_score || o.survival_score || 75);
      const isStrategic = scaleScore >= 85 || tierKey === "FLAGSHIP_VENTURE" || tierKey === "PLG_PLATFORM";
      const moatText = sanitizeUiVietnamese(o.big_corp_moat_vi || "");
      const stackText = sanitizeUiVietnamese(o.zero_cost_stack_vi || "");

      return `
        <article class="opp-card ${isLead ? "opp-card-lead" : ""}">
          <div class="opp-head">
            <div class="stack-xs">
              <div class="action-group">
                ${isLead ? `<span class="eyebrow">Cơ hội nổi bật nhất</span>` : ""}
                <span class="badge ${tierMeta.cls}">${ico(tierMeta.icon)}<span>${esc(tierMeta.label)}</span></span>
                <span class="badge ${isStrategic ? "badge-done" : "badge-idle"}">Điểm quy mô: ${scaleScore}/100</span>
              </div>
              <h3 class="opp-title">${esc(sanitizeUiVietnamese(o.title))}</h3>
            </div>
            ${isAccepted
              ? `<span class="badge badge-done">${ico("check")}<span>Đã triển khai</span></span>`
              : `<span class="badge badge-run">${ico("compass")}<span>Sẵn sàng</span></span>`
            }
          </div>

          <p class="row-meta">Khách trả tiền: <strong>${esc(sanitizeUiVietnamese(o.target_customer))}</strong></p>

          <div class="opp-metrics mono">
            <span>Điểm quy mô: <strong class="${isStrategic ? "opp-metric-ok" : ""}">${scaleScore}/100</strong></span>
            <span>Biên lãi gộp: <strong class="opp-metric-ok">${Number(o.est_margin_pct || 75).toFixed(0)}%</strong></span>
            <span>Hòa vốn: <strong>${o.breakeven_users || 5} khách</strong></span>
            <span>Điểm phản biện: <strong>${o.survival_score || 86}/100</strong></span>
          </div>

          <p class="opp-critique">${esc(descText)}</p>

          ${(moatText || stackText) ? `
            <div class="opp-strategic-meta">
              ${moatText ? `<div class="opp-meta-line"><strong>Lợi thế thắng tập đoàn lớn:</strong> ${esc(moatText)}</div>` : ""}
              ${stackText ? `<div class="opp-meta-line"><strong>Hạ tầng 0đ -> Nâng cấp:</strong> ${esc(stackText)}</div>` : ""}
            </div>
          ` : ""}

          <div class="opp-actions">
            <div class="action-group">
              ${isAccepted
                ? `<button type="button" class="btn btn-xs" data-goto-missions><span>Xem tiến độ</span>${ico("arrow-right")}</button>`
                : `<button type="button" class="btn btn-xs btn-primary" data-accept-opp="${esc(o.opp_id)}">${ico("send")}<span>Triển khai ngay</span></button>`
              }
              <button type="button" class="btn btn-xs" data-edit-opp="${esc(o.opp_id)}">${ico("pencil")}<span>Sửa</span></button>
            </div>
            <button type="button" class="btn btn-xs btn-destructive" data-del-opp="${esc(o.opp_id)}">${ico("trash")}<span>Xóa</span></button>
          </div>
        </article>
      `;
    }).join("");

    bindQuickActions(oppGrid);
  }

  // -------------------------------------------------------------------------
  // 7. TAB 2: TIEN DO TOAN TAP DOAN (HOP NHAT MOI HOAT DONG)
  // -------------------------------------------------------------------------
  function artifactHref(relPath) {
    const clean = String(relPath || "").replace(/^\/+/, "");
    if (clean.startsWith("corporate_hq/projects/")) {
      const sub = clean.slice("corporate_hq/projects/".length);
      return state.staticMode ? `./projects/${sub}` : `${API_BASE}/projects/${sub}`;
    }
    return "";
  }

  function renderArtifactChip(relPath) {
    const clean = String(relPath || "").trim();
    if (!clean) return "";
    const lower = clean.toLowerCase();
    const liveUrl = artifactHref(clean);
    if (lower.endsWith(".html") || lower.endsWith("/app/") || lower.endsWith("/landing/")) {
      return `<a class="artifact-tag" href="${esc(liveUrl)}" target="_blank" rel="noopener noreferrer">${ico("external-link")}<span>Mở dùng thử trực tiếp: ${esc(clean.split("/").slice(-2).join("/"))}</span></a>`;
    }
    return `<button type="button" class="artifact-tag" data-read-artifact="${esc(clean)}">${ico("file-text")}<span>Đọc báo cáo: ${esc(clean.split("/").pop())}</span></button>`;
  }

  function renderSwarmGraphSvg(m, msnReworks = []) {
    const stepsByOrd = {};
    (m.steps || []).forEach((s) => { stepsByOrd[s.step_order] = s; });
    const nodeMeta = (ord) => {
      const s = stepsByOrd[ord];
      if (!s) return { cls: "", label: "Chờ lượt" };
      if (s.status === "DONE") return { cls: "graph-node-done", label: "Hoàn tất" };
      if (s.status === "RUNNING") return { cls: "graph-node-run", label: "Đang làm" };
      if (s.status === "WAITING_APPROVAL") return { cls: "graph-node-wait", label: "Chờ duyệt" };
      return { cls: "", label: "Chưa tới" };
    };
    const box = (x, y, w, h, ord, line1, line2) => {
      const info = nodeMeta(ord);
      return `
        <g class="${info.cls}">
          <rect class="graph-node-rect" x="${x}" y="${y}" width="${w}" height="${h}" rx="10" />
          <text class="graph-node-title" x="${x + 12}" y="${y + 22}">${esc(line1)}</text>
          <text class="graph-node-sub" x="${x + 12}" y="${y + 40}">${esc(line2)}</text>
          <text class="graph-node-state" x="${x + 12}" y="${y + 56}">${esc(info.label)}</text>
        </g>
      `;
    };
    const graphId = `arr-${slugifyVi(m.mission_id)}`;
    const bounceArrId = `barr-${slugifyVi(m.mission_id)}`;
    const reworks = Array.isArray(msnReworks) ? msnReworks : [];
    const openReworks = reworks.filter((tk) => tk.status !== "VERIFIED_CLOSED");
    const hasBounce = reworks.length > 0;
    const svgH = hasBounce ? 266 : 220;
    let bounceSvg = "";
    if (hasBounce) {
      const featured = openReworks[0] || reworks[0];
      const srcId = String(featured.source_dept_id || "53").padStart(2, "0");
      const tgtId = String(featured.target_dept_id || "13").padStart(2, "0");
      const extraNote = reworks.length > 1 ? ` (+${reworks.length - 1} phiếu)` : "";
      const bounceLabel = `Đẩy trả sửa lỗi: #${srcId} -> #${tgtId}${extraNote}`;
      const edgeCls = openReworks.length > 0 ? "graph-bounce-edge" : "graph-bounce-edge-warn";
      bounceSvg = `
        <path class="${edgeCls}" d="M 732 152 C 732 246, 558 246, 558 198" marker-end="url(#${bounceArrId})" />
        <text class="graph-bounce-label" x="470" y="256" text-anchor="middle">${esc(bounceLabel)}</text>
      `;
    }
    return `
      <div class="room-graph-wrap">
        <p class="row-meta">Sơ đồ phối hợp chuyền việc giữa 9 Khối chuyên môn và vòng lặp đẩy trả sửa lỗi Khối 9 (#53 Tổng hợp lỗi, #51 QA/QC, #52 Chức năng, #49 Diệt rối mắt).</p>
        <svg class="room-graph-svg" viewBox="0 0 940 ${svgH}" role="img" aria-label="Sơ đồ chuyền việc 8 bước và vòng đẩy trả sửa lỗi">
          <title>Sơ đồ chuyền việc 8 bước</title>
          <desc>Giai đoạn 1 gồm nghiên cứu thị trường, tài chính và giá bán, phản biện rủi ro, cổng duyệt 1. Giai đoạn 2 gồm kỹ sư sản phẩm, đóng gói bán hàng, kiểm định Khối 9 và bàn giao.</desc>
          <defs>
            <marker id="${graphId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path class="graph-arrow-fill" d="M 0 1 L 10 5 L 0 9 z" />
            </marker>
            <marker id="${bounceArrId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path class="graph-bounce-arrow" d="M 0 1 L 10 5 L 0 9 z" />
            </marker>
          </defs>
          <rect class="graph-zone" x="6" y="6" width="454" height="208" rx="12" />
          <text class="graph-zone-title" x="18" y="24">GIAI ĐOẠN 1: NGHIÊN CỨU, TÍNH LÃI VÀ CHỐT KÈO</text>
          <rect class="graph-zone graph-zone-active" x="476" y="6" width="458" height="208" rx="12" />
          <text class="graph-zone-title graph-zone-title-active" x="488" y="24">GIAI ĐOẠN 2: SẢN XUẤT SẢN PHẨM CUỐI VÀ CHỐT KHỐI 9</text>

          ${box(18, 38, 154, 68, 1, "Bước 1: Trinh sát", "#01, #02, #03, #50")}
          ${box(18, 126, 154, 68, 2, "Bước 2: Tài chính", "#38, #39")}
          ${box(196, 82, 130, 68, 3, "Bước 3: Phản biện", "#46, #47, #52")}
          ${box(348, 82, 100, 68, 4, "Cổng 1", "Duyệt chốt kèo")}

          ${box(488, 38, 154, 68, 5, "Bước 5: Sản phẩm", "#08, #13 đến #23")}
          ${box(488, 126, 154, 68, 6, "Bước 6: Bán hàng", "Khối 5, 6, 7, 8")}
          ${box(666, 82, 134, 68, 7, "Bước 7: Chốt Khối 9", "#53, #51, #52, #49")}
          ${box(822, 82, 100, 68, 8, "Cổng 2", "Bàn giao 0 lỗi")}

          <path class="graph-edge" d="M 172 72 L 194 106" marker-end="url(#${graphId})" />
          <path class="graph-edge" d="M 172 160 L 194 126" marker-end="url(#${graphId})" />
          <path class="graph-edge" d="M 326 116 L 346 116" marker-end="url(#${graphId})" />
          <path class="graph-edge-active" d="M 448 116 L 486 72" marker-end="url(#${graphId})" />
          <path class="graph-edge-active" d="M 448 116 L 486 160" marker-end="url(#${graphId})" />
          <path class="graph-edge" d="M 642 72 L 664 106" marker-end="url(#${graphId})" />
          <path class="graph-edge" d="M 642 160 L 664 126" marker-end="url(#${graphId})" />
          <path class="graph-edge-active" d="M 800 116 L 820 116" marker-end="url(#${graphId})" />
          ${bounceSvg}
        </svg>
      </div>
    `;
  }

  function renderReworkTicketCardHtml(tk) {
    const st = REWORK_STATUS_LABELS[tk.status] || REWORK_STATUS_LABELS.OPEN;
    const sev = REWORK_SEVERITY_LABELS[tk.severity] || REWORK_SEVERITY_LABELS.HIGH;
    const catLabel = REWORK_CATEGORY_LABELS[tk.defect_category] || "Lỗi cần sửa";
    const srcId = String(tk.source_dept_id || "51").padStart(2, "0");
    const tgtId = String(tk.target_dept_id || "00").padStart(2, "0");
    const reopenCnt = Number(tk.reopen_count || 0);

    let actionsHtml = "";
    if (tk.status === "OPEN" || tk.status === "IN_FIX") {
      actionsHtml = `<button type="button" class="btn btn-xs btn-primary" data-rework-action="${esc(tk.ticket_id)}:FIXED_PENDING_RECHECK">${ico("check")}<span>Báo đã sửa, gửi Khối 9 kiểm lại</span></button>`;
    } else if (tk.status === "FIXED_PENDING_RECHECK") {
      actionsHtml = `
        <button type="button" class="btn btn-xs btn-primary" data-rework-action="${esc(tk.ticket_id)}:VERIFIED_CLOSED">${ico("shield-check")}<span>Khối 9 chốt đạt (0 lỗi)</span></button>
        <button type="button" class="btn btn-xs btn-destructive" data-rework-action="${esc(tk.ticket_id)}:OPEN">${ico("rotate-ccw")}<span>Vẫn lỗi, đẩy trả sửa tiếp</span></button>
      `;
    }

    return `
      <article class="rework-ticket-card">
        <div class="rework-ticket-head">
          <div class="action-group">
            <span class="badge ${st.cls}">${ico(st.icon)}<span>${st.label}</span></span>
            <span class="badge ${sev.cls}">${sev.label}</span>
            <span class="badge badge-idle">${esc(catLabel)}</span>
            ${reopenCnt > 0 ? `<span class="badge badge-fail">Đẩy trả lại ${reopenCnt} lần</span>` : ""}
          </div>
          <span class="mono step-time">${esc(shortDate(tk.updated_at || tk.created_at))} ${esc(shortTime(tk.updated_at || tk.created_at))}</span>
        </div>
        <div class="row-title">${esc(sanitizeUiVietnamese(tk.title))}</div>
        ${tk.detail_vi ? `<p class="step-summary">${esc(sanitizeUiVietnamese(tk.detail_vi))}</p>` : ""}
        ${tk.fix_note_vi ? `<p class="row-meta">Ghi chú sửa lỗi: ${esc(sanitizeUiVietnamese(tk.fix_note_vi))}</p>` : ""}
        <div class="rework-route-row">
          <span>Phát hiện:</span>
          <button type="button" class="agent-pill" data-open-staff="${esc(srcId)}">#${esc(srcId)} ${esc(deptTitle(srcId))}</button>
          <span>đẩy trả về:</span>
          <button type="button" class="agent-pill" data-open-staff="${esc(tgtId)}">#${esc(tgtId)} ${esc(deptTitle(tgtId))}</button>
        </div>
        ${actionsHtml ? `<div class="action-group">${actionsHtml}</div>` : ""}
      </article>
    `;
  }

  function renderSwarmReworkPanel(m, msnReworks) {
    const tickets = Array.isArray(msnReworks) ? msnReworks : [];
    const openCnt = tickets.filter((tk) => tk.status !== "VERIFIED_CLOSED").length;
    const isBlocked = openCnt > 0;
    const gateTitle = isBlocked
      ? `Đang chặn chốt: còn ${openCnt} phiếu lỗi cần sửa`
      : "Đạt chốt 0 lỗi";
    const gateSub = isBlocked
      ? "Bộ tứ chốt cuối Khối 9 (#53 Tổng hợp lỗi, #51 QA và QC, #52 Chức năng, #49 Diệt rối mắt) đang chặn nghiệm thu đến khi tất cả phiếu được sửa và kiểm lại đạt."
      : "Bộ tứ chốt cuối Khối 9 (#53 Tổng hợp lỗi, #51 QA và QC, #52 Chức năng, #49 Diệt rối mắt) xác nhận hiện không còn phiếu lỗi mở.";

    return `
      <div class="rework-panel">
        <div class="rework-gate-banner ${isBlocked ? "is-blocked" : "is-pass"}">
          <div class="stack-sm">
            <div class="rework-gate-title">
              ${ico(isBlocked ? "alert-circle" : "shield-check")}
              <span>${esc(gateTitle)}</span>
            </div>
            <p class="row-meta">${esc(gateSub)}</p>
          </div>
          <button type="button" class="btn btn-xs btn-primary" data-open-rework-modal="${esc(m.mission_id)}">
            ${ico("plus")}<span>Tạo phiếu đẩy trả sửa lỗi</span>
          </button>
        </div>

        ${tickets.length
          ? tickets.map(renderReworkTicketCardHtml).join("")
          : `<div class="empty-state"><p>Chưa có phiếu đẩy trả sửa lỗi nào cho nhiệm vụ này. Nếu phát hiện thiếu chức năng, lỗi vận hành hoặc rối mắt, bấm Tạo phiếu đẩy trả sửa lỗi để giao đúng phòng sửa ngay.</p></div>`
        }
      </div>
    `;
  }

  function renderSwarmBoardPanel(_m, msgs) {
    if (!msgs.length) {
      return `<div class="room-feed"><p class="row-meta">Chưa có trao đổi nào trong phòng họp cho nhiệm vụ này. Toàn bộ quá trình báo cáo và phản biện chéo bằng tiếng Việt sẽ hiển thị trực tiếp tại đây.</p></div>`;
    }
    return `
      <div class="room-feed">
        ${msgs.map((msg) => {
          const mt = MSG_TYPE_VI[msg.msg_type] || MSG_TYPE_VI.UPDATE;
          const artBtn = msg.artifact_path ? renderArtifactChip(msg.artifact_path) : "";
          const sender = sanitizeUiVietnamese(msg.sender_name_vi || viWorkerLabel(msg.sender_slug));
          const recipient = sanitizeUiVietnamese(msg.recipient_name_vi || "Toàn đội");
          return `
            <article class="room-msg-card">
              <div class="room-msg-head">
                <div class="action-group">
                  <strong>${esc(sender)}</strong>
                  <span class="row-meta">gửi ${esc(recipient)}</span>
                  <span class="badge ${mt.cls}">${ico(mt.icon)}<span>${mt.label}</span></span>
                </div>
                <span class="mono step-time">${esc(shortTime(msg.created_at))}</span>
              </div>
              <div class="room-msg-body">${esc(sanitizeUiVietnamese(msg.content_vi))}</div>
              ${artBtn}
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function buildMissionMembersList(m, msgs) {
    const memberMap = new Map();
    const addDepts = (rec, rawDepts) => {
      if (!rawDepts) return;
      String(rawDepts).split(",").map((x) => x.trim()).filter(Boolean).forEach((id) => {
        rec.deptSet.add(id.padStart(2, "0"));
      });
    };
    const ensure = (slug, depts = "") => {
      const norm = String(slug || "").trim();
      if (!norm) return null;
      const vi = viWorkerLabel(norm);
      if (!vi) return null;
      if (!memberMap.has(vi)) {
        memberMap.set(vi, {
          name_vi: vi,
          roleDesc: WORKER_ROLE_DESC_VI[vi] || "Chuyên gia tham gia phối hợp triển khai và kiểm định sản phẩm.",
          deptSet: new Set(),
          stepOrders: new Set(),
          msgCount: 0,
          hasRunningStep: false,
          hasDoneStep: false,
          hasDoneMsg: false,
          minOrder: 99
        });
      }
      const rec = memberMap.get(vi);
      addDepts(rec, depts);
      return rec;
    };

    let declared = [];
    try { declared = JSON.parse(m.swarm_workers_json || "[]"); } catch (_e) {}
    declared.forEach((w) => ensure(w));

    (m.steps || []).forEach((s) => {
      if (!s.worker_name) return;
      const rec = ensure(s.worker_name, s.lead_dept_ids);
      if (!rec) return;
      rec.stepOrders.add(Number(s.step_order));
      rec.minOrder = Math.min(rec.minOrder, Number(s.step_order || 99));
      if (s.status === "RUNNING") rec.hasRunningStep = true;
      if (s.status === "DONE") rec.hasDoneStep = true;
    });

    const DONE_MSG_TYPES = new Set(["HANDOFF", "DECISION", "DONE", "APPROVAL", "QA_REPORT", "CRITIQUE"]);
    (msgs || []).forEach((msg) => {
      const rec = ensure(msg.sender_slug || msg.sender_name_vi, msg.sender_dept_ids);
      if (!rec) return;
      rec.msgCount += 1;
      if (DONE_MSG_TYPES.has(String(msg.msg_type || "").toUpperCase())) {
        rec.hasDoneMsg = true;
      }
    });

    const isMissionCompleted =
      m.status === "COMPLETED" ||
      m.phase === "DELIVERED" ||
      Number(m.progress_pct || 0) >= 100;
    const isMissionWaitingChairman = m.status === "WAITING_CHAIRMAN";

    return Array.from(memberMap.values())
      .map((rec) => {
        let stCls = "badge-idle";
        let stIcon = "clock";
        let stTxt = "Chờ tới lượt";

        if (isMissionCompleted) {
          stCls = "badge-done";
          stIcon = "check";
          stTxt = "Đã xong phần việc";
        } else if (isMissionWaitingChairman) {
          if (rec.hasDoneStep || rec.hasDoneMsg || rec.msgCount > 0) {
            stCls = "badge-wait";
            stIcon = "flag";
            stTxt = "Đã bàn giao, chờ duyệt";
          } else if (rec.hasRunningStep) {
            stCls = "badge-run";
            stIcon = "activity";
            stTxt = "Đang làm việc";
          }
        } else if (rec.hasRunningStep) {
          stCls = "badge-run";
          stIcon = "activity";
          stTxt = "Đang làm việc";
        } else if (rec.hasDoneStep || rec.hasDoneMsg) {
          stCls = "badge-done";
          stIcon = "check";
          stTxt = "Đã xong phần việc";
        }

        const stepsSorted = Array.from(rec.stepOrders).sort((a, b) => a - b);
        const deptIds = Array.from(rec.deptSet).sort();
        return {
          name_vi: rec.name_vi,
          roleDesc: rec.roleDesc,
          stepsSorted,
          deptIds,
          msgCount: rec.msgCount,
          minOrder: rec.minOrder,
          stCls,
          stIcon,
          stTxt
        };
      })
      .sort((a, b) => (a.minOrder - b.minOrder) || a.name_vi.localeCompare(b.name_vi, "vi"));
  }

  function computeMissionDivisionCoverage(m, msgs) {
    const plan = m && m.division_roster_plan;
    if (plan && typeof plan === "object") {
      const divs = Array.isArray(plan.divisions) ? plan.divisions : [];
      const nonExecCovered = divs.filter((dv) => dv.division_code !== "exec-board" && Array.isArray(dv.active_depts) && dv.active_depts.length > 0).length;
      const activeCount = Number(plan.active_divisions_count || nonExecCovered || 0);
      return {
        coveredCount: Math.min(9, activeCount),
        totalDivs: 9,
        productLabel: sanitizeUiVietnamese(plan.product_type_label_vi || PRODUCT_TYPE_VI[plan.product_type] || ""),
        activeDeptsCount: Number(plan.active_depts_count || 0),
        skippedDeptsCount: Number(plan.skipped_depts_count || 0),
        hasPlan: true
      };
    }

    const deptToDiv = new Map();
    state.departments.forEach((d) => {
      deptToDiv.set(String(d.dept_id).padStart(2, "0"), d.division_code);
    });
    const coveredDivs = new Set();
    const touchedDepts = new Set();
    const recordIds = (raw) => {
      if (!raw) return;
      String(raw).split(",").map((x) => x.trim()).filter(Boolean).forEach((id) => {
        const norm = id.padStart(2, "0");
        touchedDepts.add(norm);
        const dv = deptToDiv.get(norm);
        if (dv && dv !== "exec-board") coveredDivs.add(dv);
      });
    };
    (m.steps || []).forEach((s) => recordIds(s.lead_dept_ids));
    (msgs || []).forEach((msg) => recordIds(msg.sender_dept_ids));
    return {
      coveredCount: Math.min(9, coveredDivs.size),
      totalDivs: 9,
      productLabel: "",
      activeDeptsCount: touchedDepts.size,
      skippedDeptsCount: 0,
      hasPlan: false
    };
  }

  function renderHandoffCardHtml(ho, { isCeoDrawer = false, showActions = true } = {}) {
    const modeKey = String(ho.mode || "PEER_HANDOFF").toUpperCase();
    const statusKey = String(ho.status || "OPEN").toUpperCase();
    const mt = HANDOFF_MODE_VI[modeKey] || HANDOFF_MODE_VI.PEER_HANDOFF;
    const st = HANDOFF_STATUS_VI[statusKey] || HANDOFF_STATUS_VI.OPEN;
    const fromId = String(ho.from_dept_id || "00").padStart(2, "0");
    const toId = String(ho.to_dept_id || "00").padStart(2, "0");
    const resolvedId = ho.resolved_to_dept_id ? String(ho.resolved_to_dept_id).padStart(2, "0") : "";

    let actionBtns = "";
    if (showActions && statusKey !== "COMPLETED") {
      if (isCeoDrawer && statusKey === "OPEN") {
        actionBtns += `
          <button type="button" class="btn btn-xs btn-primary" data-ceo-reroute-handoff="${esc(ho.handoff_id)}">
            ${ico("git-branch")}<span>#00 phân công sang phòng khác</span>
          </button>
        `;
      }
      actionBtns += `
        <button type="button" class="btn btn-xs" data-handoff-status="${esc(ho.handoff_id)}:COMPLETED">
          ${ico("check")}<span>Hoàn tất</span>
        </button>
      `;
    }

    return `
      <article class="handoff-card">
        <div class="handoff-card-head">
          <div class="action-group">
            <span class="badge ${mt.cls}">${ico(mt.icon)}<span>${esc(mt.label)}</span></span>
            <span class="badge ${st.cls}">${ico(st.icon)}<span>${esc(st.label)}</span></span>
          </div>
          <span class="mono step-time">${esc(shortDate(ho.updated_at || ho.created_at))} ${esc(shortTime(ho.updated_at || ho.created_at))}</span>
        </div>
        <div class="row-title">${esc(sanitizeUiVietnamese(ho.reason_vi))}</div>
        ${ho.payload_vi ? `<p class="step-summary">${esc(sanitizeUiVietnamese(ho.payload_vi))}</p>` : ""}
        ${ho.ceo_note_vi ? `<p class="row-meta">Chỉ đạo của #00: ${esc(sanitizeUiVietnamese(ho.ceo_note_vi))}</p>` : ""}
        <div class="rework-route-row">
          <span>Từ:</span>
          <button type="button" class="agent-pill" data-open-staff="${esc(fromId)}">#${esc(fromId)} ${esc(deptTitle(fromId))}</button>
          <span>sang:</span>
          <button type="button" class="agent-pill" data-open-staff="${esc(toId)}">#${esc(toId)} ${esc(deptTitle(toId))}</button>
          ${resolvedId ? `
            <span>được #00 phân công tới:</span>
            <button type="button" class="agent-pill" data-open-staff="${esc(resolvedId)}">#${esc(resolvedId)} ${esc(deptTitle(resolvedId))}</button>
          ` : ""}
        </div>
        ${actionBtns ? `<div class="action-group">${actionBtns}</div>` : ""}
      </article>
    `;
  }

  function renderSwarmMembersPanel(m, msgs, prebuiltMembers = null) {
    const members = prebuiltMembers || buildMissionMembersList(m, msgs);
    const cov = computeMissionDivisionCoverage(m, msgs);
    const covCls = cov.coveredCount >= 9 ? "badge-done" : "badge-wait";
    const covText = `Độ phủ quy trình: ${cov.coveredCount}/${cov.totalDivs} Khối tham gia`;
    const msnHandoffs = (state.deptHandoffs || []).filter((ho) => ho.mission_id === m.mission_id);

    const coverageBarHtml = `
      <div class="mission-coverage-bar">
        <div class="action-group">
          <span class="badge ${covCls}">${ico("layers")}<span>${esc(covText)}</span></span>
          ${cov.productLabel ? `<span class="badge badge-idle">${esc(cov.productLabel)}</span>` : ""}
          ${cov.hasPlan && cov.activeDeptsCount ? `<span class="row-meta">${cov.activeDeptsCount} phòng được chọn, ${cov.skippedDeptsCount} phòng để trống tránh loãng</span>` : ""}
        </div>
        <button type="button" class="btn btn-xs" data-open-org-sop="sop">
          ${ico("compass")}<span>Quy trình 9 Khối</span>
        </button>
      </div>
    `;

    const membersGridHtml = members.length
      ? `
        <div class="room-member-grid">
          ${members.map((mb) => {
            const stepPart = mb.stepsSorted.length
              ? `Đảm nhiệm: Bước ${mb.stepsSorted.join(", ")}`
              : "Vai trò: Phối hợp và kiểm định";
            const msgPart = `Đã gửi: ${mb.msgCount} trao đổi`;
            const deptChipsHtml = mb.deptIds.length
              ? `<div class="who-chips">${mb.deptIds.map((id) =>
                  `<button type="button" class="agent-pill" data-open-staff="${esc(id)}" title="${esc(deptTitle(id))}">#${esc(id)}</button>`
                ).join("")}</div>`
              : "";
            return `
              <article class="room-member-card">
                <div class="member-card-top">
                  <div class="opp-head">
                    <strong>${esc(mb.name_vi)}</strong>
                    <span class="badge ${mb.stCls}">${ico(mb.stIcon)}<span>${mb.stTxt}</span></span>
                  </div>
                  <p class="member-role-desc">${esc(mb.roleDesc)}</p>
                </div>
                <div class="member-card-foot">
                  <div class="member-contrib-line">${esc(stepPart)} | ${esc(msgPart)}</div>
                  ${deptChipsHtml}
                </div>
              </article>
            `;
          }).join("")}
        </div>
      `
      : `<p class="row-meta">Chưa có thành viên chuyên trách nào được kích hoạt cho nhiệm vụ này.</p>`;

    const handoffsHtml = msnHandoffs.length
      ? `
        <div class="mission-handoff-section">
          <div class="sec-head">
            <h4 class="sec-title">Chuyển việc ngang và Đẩy lên Tổng Giám đốc #00 (${msnHandoffs.length})</h4>
          </div>
          <div class="stack-sm">
            ${msnHandoffs.map((ho) => renderHandoffCardHtml(ho, { isCeoDrawer: true, showActions: true })).join("")}
          </div>
        </div>
      `
      : "";

    return `
      <div class="room-members-wrap">
        ${coverageBarHtml}
        ${membersGridHtml}
        ${handoffsHtml}
      </div>
    `;
  }

  function syncOpenMissionsDefaults() {
    if (!state.missionsInitialized) {
      let opened = 0;
      state.missions.forEach((m) => {
        state.knownMissionIds.add(m.mission_id);
        const isActive = m.status === "RUNNING" || m.status === "WAITING_CHAIRMAN";
        if (isActive && opened < 2) {
          state.openMissions.add(m.mission_id);
          opened += 1;
        }
      });
      state.missionsInitialized = true;
      return;
    }
    state.missions.forEach((m) => {
      if (!state.knownMissionIds.has(m.mission_id)) {
        state.knownMissionIds.add(m.mission_id);
        if (m.status === "RUNNING" || m.status === "WAITING_CHAIRMAN") {
          state.openMissions.add(m.mission_id);
        }
      }
    });
  }

  function buildMissionCardHtml(m) {
    let swarmWorkers = [];
    try { swarmWorkers = JSON.parse(m.swarm_workers_json || "[]"); } catch (_e) {}
    const isQueued = m.status === "RUNNING" && m.dispatch_state === "QUEUED_FOR_ANTIGRAVITY";
    const isSwarm = m.status === "RUNNING" && m.dispatch_state === "SWARM_ACTIVE";

    const isProposalGate = m.phase === "PROPOSAL" && (m.total_steps || 8) >= 8;
    const isProductionPhase = m.phase === "PRODUCTION";
    const isOpen = state.openMissions.has(m.mission_id);
    const doneSteps = (m.steps || []).filter((s) => s.status === "DONE").length;
    const totalSteps = m.total_steps || (m.steps || []).length || 8;
    const pct = Number(m.progress_pct || 0);

    const phaseBadge = isProductionPhase
      ? `<span class="badge badge-run">${ico("layers")}<span>Giai đoạn 2: Sản xuất Sản phẩm Cuối</span></span>`
      : m.phase === "DELIVERED"
      ? `<span class="badge badge-done">${ico("check")}<span>Đã bàn giao Sản phẩm Cuối</span></span>`
      : `<span class="badge badge-idle">${ico("compass")}<span>Giai đoạn 1: Nghiên cứu và Chốt kèo</span></span>`;

    const stBadge =
      m.status === "COMPLETED" ? `<span class="badge badge-done">${ico("check")}<span>Đã nghiệm thu hoàn tất</span></span>` :
      (m.status === "WAITING_CHAIRMAN" && isProposalGate) ? `<span class="badge badge-wait">${ico("flag")}<span>Chờ duyệt chốt kèo</span></span>` :
      m.status === "WAITING_CHAIRMAN" ? `<span class="badge badge-wait">${ico("flag")}<span>Chờ nghiệm thu cuối</span></span>` :
      m.status === "PAUSED" ? `<span class="badge badge-idle">${ico("pause")}<span>Tạm dừng</span></span>` :
      isSwarm ? `<span class="badge badge-run">${ico("activity")}<span>Đang chạy: Bước ${m.current_step_order || 1}/${totalSteps}</span></span>` :
      isQueued ? `<span class="badge badge-wait">${ico("clock")}<span>Đang xếp hàng trực tuyến</span></span>` :
      `<span class="badge badge-run">${ico("activity")}<span>Bước ${m.current_step_order || 1}/${totalSteps}</span></span>`;

    const quickHeaderCta =
      m.status === "WAITING_CHAIRMAN"
        ? `<button type="button" class="btn btn-xs btn-primary" data-approve-msn="${esc(m.mission_id)}">${ico("check")}<span>Duyệt ngay</span></button>`
        : m.project_id
        ? `<button type="button" class="btn btn-xs" data-open-proj="${esc(m.project_id)}"><span>Mở dự án</span>${ico("arrow-right")}</button>`
        : "";

    const uniqueWorkerNames = Array.from(new Set(swarmWorkers.map((w) => viWorkerLabel(w)).filter(Boolean)));
    const workerChipsHtml = uniqueWorkerNames.length
      ? `<div class="chip-row">${uniqueWorkerNames.map((w) => `<span class="worker-tag">${esc(w)}</span>`).join("")}</div>`
      : "";

    const msnMsgs = state.swarmMessages.filter((x) => x.mission_id === m.mission_id);
    const msnMembers = buildMissionMembersList(m, msnMsgs);
    const msnReworks = (state.reworkTickets || []).filter((tk) => tk.mission_id === m.mission_id);
    const openReworkCnt = msnReworks.filter((tk) => tk.status !== "VERIFIED_CLOSED").length;
    const activeSubTab = state.missionViewTabs[m.mission_id] || "steps";

    const stepsHtml = (m.steps || []).map((s) => {
      const isDone = s.status === "DONE";
      const isRun = s.status === "RUNNING";
      const isWait = s.status === "WAITING_APPROVAL";
      const nodeCls = isDone ? "done" : isRun ? "running" : isWait ? "waiting" : "pending";
      const nodeInner = isDone ? ico("check") : isRun ? ico("activity") : isWait ? ico("flag") : String(s.step_order);

      const whoStateLabel = isDone
        ? `<strong class="text-ok">Đã hoàn tất:</strong>`
        : isRun ? `<strong>Đang triển khai:</strong>`
        : isWait ? `<strong>Chờ bạn duyệt:</strong>`
        : `<span>Chờ tới lượt:</span>`;

      const deptChips = (s.lead_depts || []).map((d) =>
        `<button type="button" class="agent-pill" data-open-staff="${esc(d.dept_id)}">#${esc(d.dept_id)} ${esc(cleanDeptTitleVi(d.dept_id, d.title_vi))}</button>`
      ).join("");
      const workerPill = s.worker_name ? `<span class="worker-tag">${esc(viWorkerLabel(s.worker_name))}</span>` : "";

      return `
        <div class="step-row ${isRun ? "is-running" : ""} ${isWait ? "is-waiting" : ""}">
          <span class="step-node ${nodeCls}">${nodeInner}</span>
          <div class="step-main">
            <div class="step-head-line">
              <div class="action-group">
                <span class="step-name">Bước ${s.step_order}. ${esc(sanitizeUiVietnamese(s.title))}</span>
                ${workerPill}
              </div>
              <span class="mono step-time">${esc(shortTime(s.completed_at || s.started_at))}</span>
            </div>
            <div class="who-chips">${whoStateLabel}${deptChips}</div>
            ${(s.live_activity_text && !isDone) ? `<p class="step-summary ${isRun ? "is-active" : ""}">${esc(sanitizeUiVietnamese(s.live_activity_text))}</p>` : ""}
            ${(s.output_summary && (isDone || isWait)) ? `<p class="step-summary">${esc(sanitizeUiVietnamese(s.output_summary))}</p>` : ""}
            ${s.artifact_path ? renderArtifactChip(s.artifact_path) : ""}
            ${isDone && (s.critique_verdict || s.ux_verdict) ? `
              <div class="step-checks">
                ${s.critique_verdict ? `<span>${ico("shield-check")} ${esc(sanitizeUiVietnamese(s.critique_verdict))}</span>` : ""}
                ${s.ux_verdict ? `<span>${ico("check")} ${esc(sanitizeUiVietnamese(s.ux_verdict))}</span>` : ""}
              </div>
            ` : ""}
          </div>
        </div>
      `;
    }).join("");

    const bodyHtml =
      activeSubTab === "board" ? renderSwarmBoardPanel(m, msnMsgs) :
      activeSubTab === "members" ? renderSwarmMembersPanel(m, msnMsgs, msnMembers) :
      activeSubTab === "rework" ? renderSwarmReworkPanel(m, msnReworks) :
      activeSubTab === "graph" ? renderSwarmGraphSvg(m, msnReworks) :
      `<div class="stepper-list">${stepsHtml}</div>`;

    return `
      <article class="mission-acc-card" data-mission-card="${esc(m.mission_id)}">
        <div class="mission-acc-head-bar">
          <button type="button" class="mission-acc-toggle" aria-expanded="${isOpen ? "true" : "false"}" data-toggle-mission="${esc(m.mission_id)}">
            ${ico("chevron-down", "ico-sm acc-chevron")}
            <span class="mission-acc-title">${esc(sanitizeUiVietnamese(m.title))}</span>
          </button>
          <div class="mission-acc-meta">
            ${openReworkCnt > 0 ? `<span class="badge badge-fail">${ico("alert-circle")}<span>${openReworkCnt} lỗi chờ sửa</span></span>` : ""}
            ${stBadge}
            <span class="mission-acc-mini-prog mono">
              <span class="mission-acc-mini-track" aria-hidden="true"><span class="progress-fill" style="display:block;inline-size:${Math.max(4, pct)}%;"></span></span>
              <span>${doneSteps}/${totalSteps} bước, ${pct}%</span>
            </span>
            ${quickHeaderCta}
          </div>
        </div>

        <div class="acc-panel ${isOpen ? "open" : ""}" data-mission-panel="${esc(m.mission_id)}">
          <div class="acc-inner">
            <div class="mission-acc-body">
              <div class="mission-header">
                <div class="mission-title-group">
                  <div class="mission-badges">${phaseBadge}${stBadge}</div>
                  ${workerChipsHtml}
                </div>

                <div class="progress-row">
                  <span class="mono doc-name-label">${pct}%</span>
                  <div class="progress-track">
                    <div class="progress-fill" style="inline-size:${pct}%;"></div>
                  </div>

                  <div class="action-group">
                    ${m.project_id ? `<button type="button" class="btn btn-xs" data-open-proj="${esc(m.project_id)}"><span>Mở dự án</span>${ico("arrow-right")}</button>` : ""}
                    ${(isQueued && !(state.bridge && state.bridge.online)) ? `<button type="button" class="btn btn-xs" data-copy-handoff="${esc(m.mission_id)}">${ico("copy")}<span>Sao chép lệnh</span></button>` : ""}
                    ${m.status === "WAITING_CHAIRMAN" ? `
                      <button type="button" class="btn btn-xs btn-primary" data-approve-msn="${esc(m.mission_id)}">${ico("check")}<span>${isProposalGate ? "Duyệt kèo -> Sản xuất sản phẩm" : "Nghiệm thu Sản phẩm Cuối"}</span></button>
                      <button type="button" class="btn btn-xs" data-reject-msn="${esc(m.mission_id)}">${ico("rotate-ccw")}<span>Gửi lại sửa</span></button>
                    ` : ""}
                    ${m.status === "RUNNING" ? `<button type="button" class="btn btn-xs" data-pause-msn="${esc(m.mission_id)}">${ico("pause")}<span>Tạm dừng</span></button>` : ""}
                    ${m.status === "PAUSED" ? `<button type="button" class="btn btn-xs btn-primary" data-resume-msn="${esc(m.mission_id)}">${ico("play")}<span>Chạy tiếp</span></button>` : ""}
                    <button type="button" class="btn btn-xs" data-edit-msn="${esc(m.mission_id)}">${ico("pencil")}<span>Sửa</span></button>
                    <button type="button" class="btn btn-xs btn-destructive" data-del-msn="${esc(m.mission_id)}">${ico("trash")}<span>Xóa</span></button>
                  </div>
                </div>
              </div>

              <div class="room-subnav">
                <div class="segmented" role="tablist" aria-label="Chế độ phòng họp trực tiếp">
                  <button type="button" class="seg-btn ${activeSubTab === "steps" ? "active" : ""}" role="tab" aria-selected="${activeSubTab === "steps" ? "true" : "false"}" data-msn-subtab="${esc(m.mission_id)}:steps">
                    ${ico("layers")}<span>Tiến độ ${totalSteps} bước</span>
                  </button>
                  <button type="button" class="seg-btn ${activeSubTab === "board" ? "active" : ""}" role="tab" aria-selected="${activeSubTab === "board" ? "true" : "false"}" data-msn-subtab="${esc(m.mission_id)}:board">
                    ${ico("message-square")}<span>Bảng trao đổi (${msnMsgs.length})</span>
                  </button>
                  <button type="button" class="seg-btn ${activeSubTab === "members" ? "active" : ""}" role="tab" aria-selected="${activeSubTab === "members" ? "true" : "false"}" data-msn-subtab="${esc(m.mission_id)}:members">
                    ${ico("users")}<span>Đội ngũ tham gia (${msnMembers.length})</span>
                  </button>
                  <button type="button" class="seg-btn ${activeSubTab === "rework" ? "active" : ""}" role="tab" aria-selected="${activeSubTab === "rework" ? "true" : "false"}" data-msn-subtab="${esc(m.mission_id)}:rework">
                    ${ico("rotate-ccw")}<span>Đẩy trả sửa lỗi (${msnReworks.length})</span>
                  </button>
                  <button type="button" class="seg-btn ${activeSubTab === "graph" ? "active" : ""}" role="tab" aria-selected="${activeSubTab === "graph" ? "true" : "false"}" data-msn-subtab="${esc(m.mission_id)}:graph">
                    ${ico("git-branch")}<span>Sơ đồ chuyền việc</span>
                  </button>
                </div>
                <span class="room-caption">Phòng họp trực tiếp: 100% Tiếng Việt</span>
              </div>

              ${bodyHtml}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderLearningProgressCardHtml() {
    const lp = state.learningProgress || {};
    if (!lp.running) return "";
    const done = Number(lp.sources_done || 0);
    const total = Math.max(1, Number(lp.sources_total || 24));
    const pct = Math.min(100, Math.round((done / total) * 100));
    return `
      <div class="live-banner is-active">
        <div class="live-banner-row">
          <div class="live-banner-title">
            <span class="btn-spinner" aria-hidden="true"></span>
            <span>Đang quét nguồn tin trực tiếp (${done}/${total}): ${esc(sanitizeUiVietnamese(lp.current_source_vi || "Đang kết nối..."))}</span>
          </div>
          <span class="mono doc-name-label">${pct}%</span>
        </div>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
          <div class="progress-fill" style="inline-size:${Math.max(4, pct)}%;"></div>
        </div>
        <div class="row-meta">Nạp mới: <strong>${lp.new_atoms_added || 0}</strong> bài, bỏ qua trùng: <strong>${lp.duplicates_skipped || 0}</strong> bài.</div>
      </div>
    `;
  }

  function matchProgressStatus(itemStatus, filterVal) {
    if (!filterVal) return true;
    const st = String(itemStatus || "").toUpperCase();
    if (filterVal === "RUNNING") return ["RUNNING", "PENDING", "CLAIMED", "IN_PROGRESS"].includes(st);
    if (filterVal === "WAITING_CHAIRMAN") return st === "WAITING_CHAIRMAN" || st === "WAITING_APPROVAL";
    if (filterVal === "COMPLETED") return st === "COMPLETED" || st === "DONE";
    if (filterVal === "PAUSED") return st === "PAUSED" || st === "FAILED";
    return st === filterVal;
  }

  function wrapProgressGroupHtml(groupKey, title, totalCount, shownCount, bodyHtml, headerActionHtml = "") {
    const isOpen = state.progressGroupOpen[groupKey] !== false;
    const isExpanded = Boolean(state.progressExpandedLimit[groupKey]);
    const remaining = Math.max(0, totalCount - shownCount);
    const footerHtml = remaining > 0
      ? `<div class="show-more-row"><button type="button" class="btn btn-xs" data-expand-pgroup="${esc(groupKey)}">Xem thêm (${remaining} mục)</button></div>`
      : (isExpanded && totalCount > 5
        ? `<div class="show-more-row"><button type="button" class="btn btn-xs" data-collapse-pgroup="${esc(groupKey)}">Thu gọn bớt</button></div>`
        : "");

    return `
      <div class="acc-card">
        <div class="acc-trigger" role="presentation">
          <button type="button" class="mission-acc-toggle" aria-expanded="${isOpen ? "true" : "false"}" data-toggle-pgroup="${esc(groupKey)}">
            ${ico("chevron-down", "ico-sm acc-chevron")}
            <span>${esc(title)}</span>
            <span class="badge badge-idle">${totalCount}</span>
          </button>
          <span class="acc-trigger-right">${headerActionHtml}</span>
        </div>
        <div class="acc-panel ${isOpen ? "open" : ""}" data-pgroup-panel="${esc(groupKey)}">
          <div class="acc-inner">
            <div class="acc-body">
              ${bodyHtml}
              ${footerHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderLearningRunsSectionHtml(runsInput, asGroupCard = true) {
    const allRuns = Array.isArray(runsInput) ? runsInput : (state.learningRuns || []);
    const liveHtml = renderLearningProgressCardHtml();
    if (!allRuns.length && !liveHtml) {
      return `
        <div class="empty-state">
          <h3>Chưa có đợt học tri thức hoặc nạp kỹ năng nào</h3>
          <p>Nhấn Quét báo mới ngay để ${state.departments.length || 53} phòng chuyên gia tự đọc 24 nguồn tin thị trường và ghi nhận kết quả tại đây.</p>
          <button type="button" class="btn btn-primary" data-trigger-learn-all>${ico("refresh-cw")}<span>Quét báo mới ngay</span></button>
        </div>
      `;
    }
    const showAll = Boolean(state.progressExpandedLimit.learning);
    const visible = showAll ? allRuns : allRuns.slice(0, 5);
    const listHtml = visible.length ? `
      <div class="hairline-list">
        ${visible.map((r) => {
          const isSkill = String(r.scope || "").startsWith("skills:");
          const scopeLabel = isSkill ? "Nạp kỹ năng GitHub" : (r.scope === "all" ? "Toàn tập đoàn (24 nguồn)" : `Phạm vi: ${sanitizeUiVietnamese(r.scope || "tổng hợp")}`);
          const added = Number(r.new_atoms_added ?? r.articles_added ?? 0);
          const skipped = Number(r.duplicates_skipped ?? 0);
          const scanned = Number(r.sources_queried ?? r.sources_scanned ?? r.sources_total ?? 0);
          const errCnt = Number(r.errors_count ?? (r.error_log ? String(r.error_log).split(/\n|;/).filter((x) => x.trim()).length : 0));
          const summary = r.summary_vi
            ? sanitizeUiVietnamese(r.summary_vi)
            : `Đã quét ${scanned} nguồn: nạp mới ${added} bài, bỏ qua ${skipped} bài đã có trong kho.`;
          return `
            <div class="list-row">
              <div class="row-main">
                <div class="action-group">
                  <span class="badge ${isSkill ? "badge-study" : "badge-done"}">${ico(isSkill ? "layers" : "book-open")}<span>${esc(scopeLabel)}</span></span>
                  <span class="mono row-meta">${esc(shortDate(r.finished_at || r.started_at))} ${esc(shortTime(r.finished_at || r.started_at))}</span>
                </div>
                <div class="row-title">${esc(summary)}</div>
                <div class="row-meta">Nạp mới: ${added}, Bỏ qua trùng: ${skipped}, Lỗi nguồn: ${errCnt}</div>
              </div>
              <div class="row-actions">
                <button type="button" class="btn btn-xs" data-goto-news="${isSkill ? "skills" : "articles"}">Xem kho</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    ` : "";

    const actionBtn = `<button type="button" class="btn btn-xs btn-primary" data-trigger-learn-all>${ico("refresh-cw")}<span>Quét báo mới</span></button>`;
    if (asGroupCard) {
      return `${liveHtml}${wrapProgressGroupHtml("learning", "Đợt học tri thức và Kỹ năng", allRuns.length, visible.length, listHtml, actionBtn)}`;
    }
    const remaining = Math.max(0, allRuns.length - visible.length);
    return `
      <div class="section-block">
        ${liveHtml}
        <div class="sec-head">
          <h2 class="sec-title">Lịch sử Học tri thức và Kỹ năng (${allRuns.length})</h2>
          ${actionBtn}
        </div>
        ${listHtml}
        ${remaining > 0 ? `<div class="show-more-row"><button type="button" class="btn btn-xs" data-expand-pgroup="learning">Xem thêm (${remaining} mục)</button></div>` : ""}
      </div>
    `;
  }

  function renderOrdersSectionHtml(itemsInput, orderType, groupKey, title, emptyMsg, actionHtml, asGroupCard = true) {
    const items = Array.isArray(itemsInput) ? itemsInput : (state.orders || []).filter((o) => o.order_type === orderType);
    if (!items.length) {
      if (asGroupCard) return "";
      return `
        <div class="empty-state">
          <h3>${esc(title)}</h3>
          <p>${esc(emptyMsg)}</p>
          ${actionHtml}
        </div>
      `;
    }
    const showAll = Boolean(state.progressExpandedLimit[groupKey]);
    const visible = showAll ? items : items.slice(0, 5);
    const listHtml = `
      <div class="hairline-list">
        ${visible.map((o) => {
          const st = ORDER_STATUS_VI[String(o.status || "PENDING").toUpperCase()] || ORDER_STATUS_VI.PENDING;
          const isFlowOrder = o.order_type === "RENDER_GOOGLE_FLOW_VIDEO";
          let rawDetail = o.result_summary || o.instructions || "";
          if (isFlowOrder && !o.result_summary && String(rawDetail).trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(rawDetail);
              const scCnt = Array.isArray(parsed.google_flow_scenes) ? parsed.google_flow_scenes.length : (parsed.scenes_count || 0);
              const ratio = parsed.aspect_ratio || "9:16";
              rawDetail = `Trình duyệt AI điều khiển Google Flow (${ratio}${scCnt ? `, ${scCnt} cảnh` : ""}) cho Phòng #27 và #25.`;
            } catch (_e) {
              rawDetail = "Đã gửi lệnh dựng video AI trên Google Flow cho Phòng #27 và #25.";
            }
          }
          const detail = sanitizeUiVietnamese(rawDetail);
          return `
            <div class="list-row">
              <div class="row-main">
                <div class="action-group">
                  <span class="badge ${st.cls}">${ico(st.icon)}<span>${st.label}</span></span>
                  ${isFlowOrder ? `<span class="badge badge-sync">${ico("video")}<span>Tạo video AI Google Flow</span></span>` : ""}
                  <span class="mono row-meta">${esc(shortDate(o.created_at))} ${esc(shortTime(o.created_at))}</span>
                </div>
                <div class="row-title">${esc(sanitizeUiVietnamese(o.title || o.order_id))}</div>
                ${detail ? `<div class="row-meta">${esc(detail)}</div>` : ""}
              </div>
              <div class="row-actions">
                ${orderType === "SCAN_OPPORTUNITIES"
                  ? `<button type="button" class="btn btn-xs" data-goto-tab="command">Xem cơ hội</button>`
                  : (isFlowOrder
                    ? `<button type="button" class="btn btn-xs" data-goto-tab="projects">Mở Studio Dự án</button>`
                    : (o.task_id
                      ? `<button type="button" class="btn btn-xs" data-open-task-jump="${esc(o.task_id)}">Mở chi tiết</button>`
                      : `<button type="button" class="btn btn-xs" data-goto-tab="tasks">Mở bảng việc</button>`))
                }
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    if (asGroupCard) {
      return wrapProgressGroupHtml(groupKey, title, items.length, visible.length, listHtml, actionHtml);
    }
    const remaining = Math.max(0, items.length - visible.length);
    return `
      <div class="section-block">
        <div class="sec-head">
          <h2 class="sec-title">${esc(title)} (${items.length})</h2>
          ${actionHtml}
        </div>
        ${listHtml}
        ${remaining > 0 ? `<div class="show-more-row"><button type="button" class="btn btn-xs" data-expand-pgroup="${esc(groupKey)}">Xem thêm (${remaining} mục)</button></div>` : ""}
      </div>
    `;
  }

  function renderProgressTab() {
    syncOpenMissionsDefaults();

    const oppOrdersAll = (state.orders || []).filter((o) => o.order_type === "SCAN_OPPORTUNITIES");
    const taskOrdersAll = (state.orders || []).filter((o) => o.order_type === "EXECUTE_TASK" || o.order_type === "RENDER_GOOGLE_FLOW_VIDEO");
    const runningM = state.missions.filter((m) => m.status === "RUNNING").length;
    const activeOrdersCnt = (state.orders || []).filter((o) => ["PENDING", "CLAIMED", "RUNNING", "IN_PROGRESS"].includes(String(o.status || "").toUpperCase())).length;
    const learningRunning = Boolean(state.learningProgress && state.learningProgress.running);
    const totalActive = runningM + activeOrdersCnt + (learningRunning ? 1 : 0);

    document.getElementById("prog-hero-active").textContent = totalActive;
    document.getElementById("prog-cnt-missions").textContent = state.missions.length;
    document.getElementById("prog-cnt-opps").textContent = oppOrdersAll.length;
    document.getElementById("prog-cnt-learning").textContent = state.learningRuns.length;

    const noteEl = document.getElementById("prog-hero-note");
    if (noteEl) {
      noteEl.textContent = totalActive > 0
        ? `Đang có ${totalActive} hoạt động chạy trực tuyến (${runningM} dự án 8 bước, ${activeOrdersCnt} lệnh xử lý${learningRunning ? ", 1 đợt quét báo mới" : ""}).`
        : "Tất cả luồng xử lý hiện đã ổn định. Nhấn vào từng thẻ để mở rộng chi tiết.";
    }

    document.querySelectorAll("#progress-cat-tabs .seg-btn").forEach((b) => {
      const on = b.getAttribute("data-pcat") === state.progressCat;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });

    const subFilterAct = document.getElementById("mission-subfilter-actions");
    if (subFilterAct) subFilterAct.classList.toggle("is-hidden", !(state.progressCat === "missions" || state.progressCat === "all"));

    const searchInp = document.getElementById("progress-search-input");
    const q = (searchInp ? searchInp.value : "").trim().toLowerCase();
    const statusFilter = getListboxValue("filter-progress-status") || "";

    const filteredMissions = state.missions.filter((m) => {
      if (!matchProgressStatus(m.status, statusFilter)) return false;
      if (q && !`${m.title} ${m.goal_prompt || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const filteredOpps = oppOrdersAll.filter((o) => {
      if (!matchProgressStatus(o.status, statusFilter)) return false;
      if (q && !`${o.title || ""} ${o.result_summary || ""} ${o.instructions || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const filteredTasks = taskOrdersAll.filter((o) => {
      if (!matchProgressStatus(o.status, statusFilter)) return false;
      if (q && !`${o.title || ""} ${o.result_summary || ""} ${o.instructions || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const filteredLearning = (state.learningRuns || []).filter((r) => {
      if (!matchProgressStatus(r.status || "COMPLETED", statusFilter)) return false;
      if (q && !`${r.scope || ""} ${r.summary_vi || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });

    // Update Collapse All / Expand All button label
    const toggleAllBtn = document.getElementById("btn-toggle-all-progress");
    if (toggleAllBtn) {
      const anyMissionOpen = filteredMissions.some((m) => state.openMissions.has(m.mission_id));
      const anyGroupOpen = state.progressCat === "all" && Object.values(state.progressGroupOpen).some(Boolean);
      toggleAllBtn.textContent = (anyMissionOpen || (state.progressCat === "all" && anyGroupOpen && !filteredMissions.length))
        ? "Thu gọn hết"
        : "Mở tất cả";
    }

    const box = document.getElementById("progress-content-container");
    if (state.progressCat === "missions") {
      if (!filteredMissions.length) {
        box.innerHTML = `
          <div class="empty-state">
            <h3>Không có dự án 8 bước nào khớp bộ lọc</h3>
            <p>Thử xóa từ khóa tìm kiếm, đổi trạng thái hoặc giao một đề bài mới cho toàn tập đoàn.</p>
            <button type="button" class="btn btn-primary" data-goto-tab="command">${ico("plus")}<span>Giao nhiệm vụ mới</span></button>
          </div>
        `;
      } else {
        const showAll = Boolean(state.progressExpandedLimit.missions);
        const visibleM = showAll ? filteredMissions : filteredMissions.slice(0, 5);
        const rem = Math.max(0, filteredMissions.length - visibleM.length);
        box.innerHTML = `
          ${visibleM.map(buildMissionCardHtml).join("")}
          ${rem > 0 ? `<div class="show-more-row"><button type="button" class="btn btn-xs" data-expand-pgroup="missions">Xem thêm (${rem} mục)</button></div>` : ""}
        `;
      }
    } else if (state.progressCat === "opps") {
      box.innerHTML = renderOrdersSectionHtml(
        filteredOpps,
        "SCAN_OPPORTUNITIES",
        "opps",
        "Đợt săn cơ hội kiếm tiền",
        "Chưa có đợt săn cơ hội nào khớp bộ lọc. Bấm nút bên dưới để Phòng #50 và #46 quét cơ hội mới.",
        `<button type="button" class="btn btn-xs btn-primary" data-trigger-scan-opps>${ico("compass")}<span>Săn cơ hội mới</span></button>`,
        false
      );
    } else if (state.progressCat === "learning") {
      box.innerHTML = renderLearningRunsSectionHtml(filteredLearning, false);
    } else if (state.progressCat === "tasks") {
      box.innerHTML = renderOrdersSectionHtml(
        filteredTasks,
        "EXECUTE_TASK",
        "tasks",
        "Đầu việc lẻ giao chuyên gia",
        "Chưa có đầu việc lẻ nào khớp bộ lọc. Mở Bảng việc hoặc bấm Thêm việc để giao AI làm ngay.",
        `<button type="button" class="btn btn-xs btn-primary" data-goto-tab="tasks">${ico("check-square")}<span>Mở bảng việc</span></button>`,
        false
      );
    } else {
      const parts = [];
      const liveCard = renderLearningProgressCardHtml();
      if (liveCard) parts.push(liveCard);

      if (filteredMissions.length) {
        const showAllM = Boolean(state.progressExpandedLimit.missions);
        const visibleM = showAllM ? filteredMissions : filteredMissions.slice(0, 5);
        const mBody = `<div class="mission-list" style="padding:var(--space-3);">${visibleM.map(buildMissionCardHtml).join("")}</div>`;
        parts.push(wrapProgressGroupHtml("missions", "Dự án 8 bước", filteredMissions.length, visibleM.length, mBody));
      }
      if (filteredOpps.length) {
        parts.push(renderOrdersSectionHtml(
          filteredOpps,
          "SCAN_OPPORTUNITIES",
          "opps",
          "Đợt săn cơ hội",
          "",
          `<button type="button" class="btn btn-xs" data-trigger-scan-opps>${ico("compass")}<span>Săn cơ hội mới</span></button>`,
          true
        ));
      }
      if (filteredTasks.length) {
        parts.push(renderOrdersSectionHtml(
          filteredTasks,
          "EXECUTE_TASK",
          "tasks",
          "Đầu việc giao AI",
          "",
          `<button type="button" class="btn btn-xs" data-goto-tab="tasks">Xem bảng việc</button>`,
          true
        ));
      }
      if (filteredLearning.length) {
        parts.push(renderLearningRunsSectionHtml(filteredLearning, true));
      }
      if (!parts.length) {
        parts.push(`
          <div class="empty-state">
            <h3>Không tìm thấy hoạt động nào khớp bộ lọc</h3>
            <p>Thử đổi từ khóa hoặc trạng thái, hoặc giao một nhiệm vụ mới để theo dõi trực tiếp tại đây.</p>
            <button type="button" class="btn btn-primary" data-goto-tab="command">${ico("plus")}<span>Bắt đầu giao việc</span></button>
          </div>
        `);
      }
      box.innerHTML = parts.join("");
    }

    // Bind mission accordion toggles
    box.querySelectorAll("[data-toggle-mission]").forEach((btn) => {
      btn.onclick = () => {
        const mid = btn.getAttribute("data-toggle-mission");
        const nextOpen = !state.openMissions.has(mid);
        if (nextOpen) state.openMissions.add(mid);
        else state.openMissions.delete(mid);
        btn.setAttribute("aria-expanded", nextOpen ? "true" : "false");
        const panel = box.querySelector(`[data-mission-panel="${mid}"]`);
        if (panel) panel.classList.toggle("open", nextOpen);
        const togBtn = document.getElementById("btn-toggle-all-progress");
        if (togBtn) {
          const anyOpen = filteredMissions.some((m) => state.openMissions.has(m.mission_id));
          togBtn.textContent = anyOpen ? "Thu gọn hết" : "Mở tất cả";
        }
      };
    });

    // Bind collapsible activity groups & show-more pagination
    box.querySelectorAll("[data-toggle-pgroup]").forEach((btn) => {
      btn.onclick = () => {
        const k = btn.getAttribute("data-toggle-pgroup");
        const nextOpen = !(btn.getAttribute("aria-expanded") === "true");
        state.progressGroupOpen[k] = nextOpen;
        btn.setAttribute("aria-expanded", nextOpen ? "true" : "false");
        const panel = box.querySelector(`[data-pgroup-panel="${k}"]`);
        if (panel) panel.classList.toggle("open", nextOpen);
      };
    });

    box.querySelectorAll("[data-expand-pgroup]").forEach((btn) => {
      btn.onclick = () => {
        const k = btn.getAttribute("data-expand-pgroup");
        state.progressExpandedLimit[k] = true;
        renderProgressTab();
      };
    });

    box.querySelectorAll("[data-collapse-pgroup]").forEach((btn) => {
      btn.onclick = () => {
        const k = btn.getAttribute("data-collapse-pgroup");
        state.progressExpandedLimit[k] = false;
        renderProgressTab();
      };
    });

    bindQuickActions(box);
  }

  // -------------------------------------------------------------------------
  // 8. TAB 3: BANG VIEC TINH GON (NHOM ACCORDION + 3 PHAN TU + 4 COT)
  // -------------------------------------------------------------------------
  function getFilteredTasks() {
    const q = (document.getElementById("filter-task-q").value || "").trim().toLowerCase();
    const projF = getListboxValue("filter-task-project");
    const prioF = getListboxValue("filter-task-prio");
    const deptF = getListboxValue("filter-task-dept");
    return state.tasks.filter((t) => {
      if (projF && t.project_id !== projF) return false;
      if (prioF && t.priority !== prioF) return false;
      if (deptF && t.assigned_dept_id !== deptF) return false;
      if (q && !`${t.title} ${t.description || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function renderTasksTab() {
    document.querySelectorAll("#task-view-mode .seg-btn").forEach((b) => {
      const on = b.getAttribute("data-tview") === state.taskViewMode;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });

    const bulkBtn = document.getElementById("btn-toggle-bulk-mode");
    if (bulkBtn) bulkBtn.setAttribute("aria-pressed", state.taskBulkMode ? "true" : "false");

    const filtered = getFilteredTasks();
    const groupWrap = document.getElementById("tasks-grouped-wrapper");
    const boardWrap = document.getElementById("tasks-board-wrapper");

    if (state.taskViewMode === "grouped") {
      groupWrap.classList.remove("is-hidden");
      boardWrap.classList.add("is-hidden");

      if (!filtered.length) {
        groupWrap.innerHTML = `
          <div class="empty-state">
            <h3>Không có công việc nào khớp bộ lọc</h3>
            <p>Thử đổi bộ lọc dự án hoặc nhấn Thêm việc mới để giao đầu việc lẻ cho phòng chuyên gia.</p>
          </div>
        `;
        updateBulkBar();
        return;
      }

      const groups = [
        {
          key: "WAITING_APPROVAL",
          title: "Cần bạn duyệt",
          badgeCls: "badge-wait",
          items: filtered.filter((t) => t.kanban_column === "WAITING_APPROVAL")
        },
        {
          key: "ACTIVE",
          title: "Đang thực hiện",
          badgeCls: "badge-run",
          items: filtered.filter((t) => t.kanban_column === "IN_PROGRESS" || t.kanban_column === "QA_SECURITY_REVIEW")
        },
        {
          key: "PENDING",
          title: "Chờ triển khai",
          badgeCls: "badge-idle",
          items: filtered.filter((t) => t.kanban_column === "BACKLOG" || t.kanban_column === "REJECTED")
        },
        {
          key: "DONE",
          title: "Đã hoàn thành",
          badgeCls: "badge-done",
          items: filtered.filter((t) => t.kanban_column === "DONE")
        }
      ];

      groupWrap.innerHTML = groups.map((g) => {
        const isOpen = g.key === "WAITING_APPROVAL"
          ? (g.items.length > 0 && state.taskGroupOpen[g.key] !== false)
          : Boolean(state.taskGroupOpen[g.key]);

        const rowsHtml = g.items.length
          ? g.items.map((t) => {
              const checked = state.selectedTaskIds.has(t.task_id) ? "checked" : "";
              const colCls =
                t.kanban_column === "DONE" ? "badge-done" :
                t.kanban_column === "WAITING_APPROVAL" ? "badge-wait" :
                t.kanban_column === "REJECTED" ? "badge-fail" :
                t.kanban_column === "IN_PROGRESS" ? "badge-run" : "badge-idle";
              const metaLine = `${projectTitle(t.project_id)}, Phòng #${t.assigned_dept_id}, Ưu tiên ${PRIO_LABELS[t.priority] || "Cao"}${t.auto_synced ? ", Tự đồng bộ" : ""}`;
              // Strictly ONE contextual primary action button per row!
              let primaryAction = `<button type="button" class="btn btn-xs" data-open-task-drawer="${esc(t.task_id)}">Chi tiết</button>`;
              if (t.kanban_column === "BACKLOG" || t.kanban_column === "REJECTED") {
                primaryAction = `<button type="button" class="btn btn-xs btn-primary" data-dispatch-task="${esc(t.task_id)}">${ico("cpu")}<span>Giao AI làm</span></button>`;
              } else if (t.kanban_column === "WAITING_APPROVAL") {
                primaryAction = `<button type="button" class="btn btn-xs btn-primary" data-approve-task="${esc(t.task_id)}">${ico("check")}<span>Duyệt ngay</span></button>`;
              }
              return `
                <div class="task-row-clean ${state.taskBulkMode ? "has-check" : ""} ${checked ? "is-selected" : ""}" data-row-task="${esc(t.task_id)}">
                  ${state.taskBulkMode ? `<input type="checkbox" data-sel-task="${esc(t.task_id)}" ${checked} aria-label="Chọn ${esc(t.title)}" />` : ""}
                  <div class="row-main">
                    <div class="row-title ${t.kanban_column === "DONE" ? "is-done" : ""}">${esc(sanitizeUiVietnamese(t.title))}</div>
                    <div class="row-meta">${esc(metaLine)}</div>
                  </div>
                  <span class="badge ${colCls}">${esc(COL_LABELS[t.kanban_column] || t.kanban_column)}</span>
                  <div class="task-row-end">${primaryAction}</div>
                </div>
              `;
            }).join("")
          : `<div class="list-row"><span class="row-meta">Không có công việc nào trong nhóm này.</span></div>`;

        const doneFooter = g.key === "DONE" && g.items.length > 0
          ? `<div class="list-row list-row-pair"><span class="row-meta">${g.items.length} việc đã hoàn thành</span><button type="button" class="btn btn-xs btn-destructive" id="btn-clear-done-tasks-inline">${ico("trash")}<span>Dọn việc đã xong</span></button></div>`
          : "";

        return `
          <div class="acc-card">
            <button type="button" class="acc-trigger" aria-expanded="${isOpen ? "true" : "false"}" data-toggle-task-group="${g.key}">
              <span class="acc-trigger-left">
                <span>${esc(g.title)}</span>
                <span class="badge ${g.badgeCls}">${g.items.length}</span>
              </span>
              <span class="acc-trigger-right">
                ${ico("chevron-down", "ico-sm acc-chevron")}
              </span>
            </button>
            <div class="acc-panel ${isOpen ? "open" : ""}" data-task-panel="${g.key}">
              <div class="acc-inner">
                <div class="acc-body">
                  ${rowsHtml}
                  ${doneFooter}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("");

      groupWrap.querySelectorAll("[data-toggle-task-group]").forEach((btn) => {
        btn.onclick = () => {
          const k = btn.getAttribute("data-toggle-task-group");
          state.taskGroupOpen[k] = !(btn.getAttribute("aria-expanded") === "true");
          const open = state.taskGroupOpen[k];
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          const panel = groupWrap.querySelector(`[data-task-panel="${k}"]`);
          if (panel) panel.classList.toggle("open", open);
        };
      });

      groupWrap.querySelectorAll("[data-row-task]").forEach((row) => {
        row.onclick = (e) => {
          if (e.target.closest("button, input")) return;
          openTaskDrawer(row.getAttribute("data-row-task"));
        };
      });

      const clrDone = document.getElementById("btn-clear-done-tasks-inline");
      if (clrDone) {
        clrDone.onclick = (e) => {
          e.stopPropagation();
          withLock(clrDone, async () => {
            const backups = state.tasks.filter((t) => t.kanban_column === "DONE");
            const res = await api("/api/tasks/bulk", "POST", { action: "clear_done" });
            await loadEverything();
            toast(`Đã dọn ${res.affected || backups.length} công việc đã xong.`, {
              items: backups.map((t) => ({ entity_type: "task", entity_id: t.task_id, backup: t }))
            });
          });
        };
      }

      bindQuickActions(groupWrap);
    } else {
      // Spacious 4-column drag-and-drop Kanban board
      groupWrap.classList.add("is-hidden");
      boardWrap.classList.remove("is-hidden");
      const boardCols = [
        { key: "BACKLOG", title: "Chờ triển khai", match: (t) => t.kanban_column === "BACKLOG" || t.kanban_column === "REJECTED" },
        { key: "IN_PROGRESS", title: "Đang làm và Kiểm định", match: (t) => t.kanban_column === "IN_PROGRESS" || t.kanban_column === "QA_SECURITY_REVIEW" },
        { key: "WAITING_APPROVAL", title: "Chờ duyệt", match: (t) => t.kanban_column === "WAITING_APPROVAL" },
        { key: "DONE", title: "Hoàn thành", match: (t) => t.kanban_column === "DONE" }
      ];

      boardWrap.innerHTML = boardCols.map((c) => {
        const colTasks = filtered.filter(c.match);
        return `
          <div class="k-col" data-drop-col="${c.key}">
            <div class="k-head">
              <span>${esc(c.title)} (${colTasks.length})</span>
              <button type="button" class="btn btn-xs" data-quick-col-add="${c.key}" aria-label="Thêm việc vào cột ${esc(c.title)}">${ico("plus")}</button>
            </div>
            ${colTasks.map((t) => `
              <div class="k-card" draggable="true" data-drag-task="${esc(t.task_id)}" data-open-task-drawer="${esc(t.task_id)}">
                <div class="row-title ${t.kanban_column === "DONE" ? "is-done" : ""}">${esc(sanitizeUiVietnamese(t.title))}</div>
                <div class="row-meta">${esc(projectTitle(t.project_id))}</div>
                <div class="k-card-foot">
                  <span class="mono">Phòng #${esc(t.assigned_dept_id)}</span>
                  <span class="badge ${t.kanban_column === "REJECTED" ? "badge-fail" : "badge-idle"}">${esc(t.kanban_column === "REJECTED" ? "Cần sửa lại" : (PRIO_LABELS[t.priority] || "Cao"))}</span>
                </div>
              </div>
            `).join("")}
          </div>
        `;
      }).join("");

      bindQuickActions(boardWrap);
      bindKanbanDragDrop(boardWrap);
    }
    updateBulkBar();
  }

  function bindKanbanDragDrop(boardWrap) {
    let draggedId = null;
    boardWrap.querySelectorAll("[data-drag-task]").forEach((card) => {
      card.addEventListener("dragstart", () => { draggedId = card.getAttribute("data-drag-task"); });
    });
    boardWrap.querySelectorAll("[data-drop-col]").forEach((colEl) => {
      colEl.addEventListener("dragover", (e) => { e.preventDefault(); colEl.classList.add("drag-over"); });
      colEl.addEventListener("dragleave", () => colEl.classList.remove("drag-over"));
      colEl.addEventListener("drop", async (e) => {
        e.preventDefault();
        colEl.classList.remove("drag-over");
        const targetCol = colEl.getAttribute("data-drop-col");
        if (!draggedId || !targetCol) return;
        await api(`/api/tasks/${encodeURIComponent(draggedId)}`, "PATCH", { kanban_column: targetCol });
        await loadEverything();
      });
    });
  }

  function openTaskDrawer(taskId) {
    const t = state.tasks.find((x) => x.task_id === taskId);
    if (!t) return;
    document.getElementById("drawer-heading").textContent = "Chi tiết công việc";
    const body = document.getElementById("drawer-body");
    const colOpts = Object.entries(COL_LABELS).map(([value, label]) => ({ value, label }));
    const dynId = `drawer-col-${t.task_id}`;

    body.innerHTML = `
      <div class="stack-sm">
        <h3 class="mission-title">${esc(sanitizeUiVietnamese(t.title))}</h3>
        <div class="action-group">
          <span class="badge badge-idle">Phòng #${esc(t.assigned_dept_id)}: ${esc(deptTitle(t.assigned_dept_id))}</span>
          <span class="badge badge-idle">Ưu tiên: ${esc(PRIO_LABELS[t.priority] || "Cao")}</span>
          ${t.auto_synced ? `<span class="badge badge-sync">Tự đồng bộ</span>` : ""}
        </div>
        <p class="row-meta">Dự án: <strong>${esc(projectTitle(t.project_id))}</strong></p>
        ${(t.linked_mission_id || t.project_id) ? `
          <div class="action-group">
            ${t.linked_mission_id ? `<button type="button" class="btn btn-xs" data-open-mission="${esc(t.linked_mission_id)}">${ico("layers")}<span>Mở phòng họp tiến độ</span></button>` : ""}
            ${t.project_id ? `<button type="button" class="btn btn-xs" data-open-proj="${esc(t.project_id)}">${ico("folder")}<span>Mở dự án</span></button>` : ""}
          </div>
        ` : ""}
      </div>

      <div class="form-field">
        <label>Chuyển cột trạng thái</label>
        <div class="listbox-field" data-dynamic-listbox="${esc(dynId)}">
          <input type="hidden" value="${esc(t.kanban_column || "BACKLOG")}" />
          <button type="button" class="listbox-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="lb-${esc(dynId)}" aria-label="Đổi trạng thái công việc">
            <span class="listbox-value">${esc(COL_LABELS[t.kanban_column] || t.kanban_column)}</span>
            ${ico("chevron-down", "ico-xs listbox-chevron")}
          </button>
          <ul class="listbox-menu" id="lb-${esc(dynId)}" role="listbox" tabindex="-1" hidden></ul>
        </div>
      </div>

      <div class="card stack-sm">
        <p class="eyebrow">Mô tả và Ghi chú yêu cầu</p>
        <p class="step-summary">${esc(sanitizeUiVietnamese(t.description || "Chưa có ghi chú mô tả chi tiết cho đầu việc này."))}</p>
      </div>

      <div class="action-group">
        ${t.kanban_column !== "DONE" ? `<button type="button" class="btn btn-primary" data-dispatch-task="${esc(t.task_id)}">${ico("cpu")}<span>Giao AI làm</span></button>` : ""}
        ${t.kanban_column !== "DONE" ? `<button type="button" class="btn" data-approve-task="${esc(t.task_id)}">${ico("check")}<span>Đánh dấu xong</span></button>` : ""}
        ${t.kanban_column === "WAITING_APPROVAL" ? `<button type="button" class="btn" data-reject-task="${esc(t.task_id)}">${ico("rotate-ccw")}<span>Yêu cầu làm lại</span></button>` : ""}
        <button type="button" class="btn" data-edit-task="${esc(t.task_id)}">${ico("pencil")}<span>Sửa</span></button>
        <button type="button" class="btn" data-dup-task="${esc(t.task_id)}">${ico("copy")}<span>Nhân bản</span></button>
      </div>

      <div class="rule"></div>

      <div>
        <button type="button" class="btn btn-destructive btn-block" data-del-task="${esc(t.task_id)}">${ico("trash")}<span>Xóa công việc</span></button>
      </div>
    `;

    const lbWrap = body.querySelector(`[data-dynamic-listbox="${dynId}"]`);
    const ctrl = setupListboxElement(lbWrap, dynId, async (newCol) => {
      await api(`/api/tasks/${encodeURIComponent(t.task_id)}`, "PATCH", { kanban_column: newCol });
      await loadEverything();
      toast(`Đã chuyển sang trạng thái ${COL_LABELS[newCol] || newCol}.`);
    });
    if (ctrl) {
      ctrl.setOptions(colOpts, false);
      ctrl.setValue(t.kanban_column || "BACKLOG", true);
    }

    bindQuickActions(body);
    document.getElementById("drawer-backdrop").classList.add("open");
    document.getElementById("inspector-drawer").classList.add("open");
  }

  // -------------------------------------------------------------------------
  // 9. TAB 4: NHAN SU (10 KHOI ACCORDION + LOC TRANG THAI + KHO KY NANG)
  // -------------------------------------------------------------------------
  function skillsCountForDept(deptId) {
    return state.installedSkills.filter((sk) => parseDeptIdsJson(sk.dept_ids_json || sk.dept_ids).includes(deptId)).length;
  }

  function ensureStaffDivDefaults() {
    if (state.staffDivOpen === null) {
      state.staffDivOpen = {};
      let anyActive = false;
      DIV_ORDER.forEach((code) => {
        const hasBusy = state.departments.some((d) => d.division_code === code && normalizeDeptStatus(d.status) !== "IDLE");
        if (hasBusy) {
          state.staffDivOpen[code] = true;
          state.autoOpenedBusyDivs.add(code);
          anyActive = true;
        } else {
          state.staffDivOpen[code] = false;
        }
      });
      if (!anyActive) {
        state.staffDivOpen["exec-board"] = true;
        state.staffDivOpen["div9-critique-ux-lab"] = true;
      }
      return;
    }
    // Auto-open any division that newly becomes busy (WORKING / STUDYING)
    DIV_ORDER.forEach((code) => {
      const hasBusy = state.departments.some((d) => d.division_code === code && ["WORKING", "STUDYING"].includes(normalizeDeptStatus(d.status)));
      if (hasBusy && !state.autoOpenedBusyDivs.has(code)) {
        state.staffDivOpen[code] = true;
        state.autoOpenedBusyDivs.add(code);
      } else if (!hasBusy && state.autoOpenedBusyDivs.has(code)) {
        state.autoOpenedBusyDivs.delete(code);
      }
    });
  }

  function renderStaffTab() {
    ensureStaffDivDefaults();

    // Update live counts inside segmented status filter
    const counts = { "": state.departments.length, WORKING: 0, STUDYING: 0, IDLE: 0, BLOCKED: 0 };
    state.departments.forEach((d) => {
      const st = normalizeDeptStatus(d.status);
      counts[st] = (counts[st] || 0) + 1;
    });
    const labels = {
      "": `Tất cả (${counts[""]})`,
      WORKING: `Đang làm việc (${counts.WORKING})`,
      STUDYING: `Đang học (${counts.STUDYING})`,
      IDLE: `Sẵn sàng (${counts.IDLE})`,
      BLOCKED: `Đang bị chặn (${counts.BLOCKED})`
    };
    document.querySelectorAll("#staff-status-filter .seg-btn").forEach((b) => {
      const k = b.getAttribute("data-sstatus");
      const on = state.staffStatusFilter === k;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      if (labels[k]) b.textContent = labels[k];
    });

    const q = (document.getElementById("staff-search").value || "").trim().toLowerCase();
    const divFilter = getListboxValue("filter-staff-div");

    const filtered = state.departments.filter((d) => {
      if (divFilter && d.division_code !== divFilter) return false;
      if (state.staffStatusFilter && normalizeDeptStatus(d.status) !== state.staffStatusFilter) return false;
      if (q) {
        const cleanName = cleanDeptTitleVi(d.dept_id, d.title_vi);
        const deptSkills = state.installedSkills
          .filter((sk) => parseDeptIdsJson(sk.dept_ids_json || sk.dept_ids).includes(d.dept_id))
          .map((sk) => `${sk.title_vi} ${sk.skill_slug} ${sk.category_vi}`).join(" ");
        if (!`${d.dept_id} ${d.code} ${d.title_vi} ${cleanName} ${deptSkills}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    const box = document.getElementById("staff-divisions-container");
    if (!filtered.length) {
      box.innerHTML = `
        <div class="empty-state">
          <h3>Không tìm thấy phòng chuyên gia phù hợp</h3>
          <p>Thử đổi từ khóa tìm kiếm hoặc bỏ lọc trạng thái để xem đầy đủ ${state.departments.length || 53} phòng ban.</p>
          <button type="button" class="btn btn-xs" id="btn-reset-staff-filter">Xóa bộ lọc</button>
        </div>
      `;
      document.getElementById("btn-reset-staff-filter").onclick = () => {
        document.getElementById("staff-search").value = "";
        setListboxValue("filter-staff-div", "", true);
        state.staffStatusFilter = "";
        renderStaffTab();
      };
      return;
    }

    const activeDivCodes = DIV_ORDER.filter((code) => filtered.some((d) => d.division_code === code));
    // Include any custom division code not in DIV_ORDER
    filtered.forEach((d) => {
      if (d.division_code && !activeDivCodes.includes(d.division_code)) activeDivCodes.push(d.division_code);
    });

    const anyFiltering = Boolean(q || divFilter || state.staffStatusFilter);
    const allOpen = activeDivCodes.every((code) => anyFiltering || Boolean(state.staffDivOpen[code]));
    const toggleAllBtn = document.getElementById("btn-toggle-all-divs");
    if (toggleAllBtn) toggleAllBtn.textContent = allOpen ? "Thu gọn hết" : "Mở tất cả";

    box.innerHTML = activeDivCodes.map((code) => {
      const members = filtered.filter((d) => d.division_code === code);
      const isOpen = anyFiltering ? true : Boolean(state.staffDivOpen[code]);
      const workingCnt = members.filter((d) => normalizeDeptStatus(d.status) === "WORKING").length;
      const studyingCnt = members.filter((d) => normalizeDeptStatus(d.status) === "STUDYING").length;
      const divName = DIV_SHORT_NAMES[code] || sanitizeUiVietnamese(code);
      const isDiv9 = code === "div9-critique-ux-lab";
      const qualityStripText = isDiv9
        ? "Chốt cuối Không Lỗi toàn tập đoàn (8 phòng #46 đến #53): Bộ tứ #53 (Tổng hợp và Điều phối Lỗi), #51 (QA và QC), #52 (Kiểm tra Hoàn thiện Chức năng), #49 (Tối giản Thao tác và Diệt Rối mắt) cùng #46, #47, #48, #50 tổng kiểm và đẩy trả lỗi về đúng phòng phụ trách."
        : "Tổ Kiểm thử Người dùng nội bộ và Tổ Phản biện nội bộ tự rà lỗi, tổng hợp thiếu sót và đẩy trả đúng phòng sửa trước khi chuyển Phòng #53 và chốt cuối Khối 9.";

      return `
        <div class="acc-card">
          <button type="button" class="acc-trigger" aria-expanded="${isOpen ? "true" : "false"}" data-toggle-div="${esc(code)}">
            <span class="acc-trigger-left">
              <span>${esc(divName)}</span>
              <span class="badge badge-idle">${members.length} phòng</span>
              <span class="badge badge-cells">2 tổ nội bộ: Kiểm thử và Phản biện</span>
              ${workingCnt > 0 ? `<span class="badge badge-run">${ico("activity")}<span>${workingCnt} đang làm</span></span>` : ""}
              ${studyingCnt > 0 ? `<span class="badge badge-study">${ico("book-open")}<span>${studyingCnt} đang học</span></span>` : ""}
            </span>
            <span class="acc-trigger-right">${ico("chevron-down", "ico-sm acc-chevron")}</span>
          </button>
          <div class="acc-panel ${isOpen ? "open" : ""}" data-div-panel="${esc(code)}">
            <div class="acc-inner">
              <div class="acc-body">
                <div class="div-quality-strip">
                  ${ico("shield-check", "ico-xs")}
                  <span>${esc(qualityStripText)}</span>
                </div>
                <div class="division-staff-grid">
                  ${members.map((d) => {
                    const st = deptStatusMeta(d.status);
                    const cleanName = cleanDeptTitleVi(d.dept_id, d.title_vi);
                    const skCnt = skillsCountForDept(d.dept_id);
                    const artCnt = Number(d.articles_learned || 0);
                    const isBusy = st.norm === "WORKING" || st.norm === "STUDYING";
                    const isTrio = isDiv9 && DIV9_TRIO_IDS.has(String(d.dept_id).padStart(2, "0"));
                    const openReworkForDept = (state.reworkTickets || []).filter(
                      (tk) => String(tk.target_dept_id).padStart(2, "0") === String(d.dept_id).padStart(2, "0") && tk.status !== "VERIFIED_CLOSED"
                    ).length;
                    const workTitle = sanitizeUiVietnamese(d.current_work_title || (st.norm === "STUDYING" ? "Đang cập nhật tri thức mới" : ""));
                    let jumpBtnHtml = "";
                    if (d.current_mission_id) {
                      jumpBtnHtml = `<button type="button" class="btn btn-xs" data-open-mission="${esc(d.current_mission_id)}">Xem tiến độ</button>`;
                    } else if (d.current_task_id) {
                      jumpBtnHtml = `<button type="button" class="btn btn-xs" data-open-task-jump="${esc(d.current_task_id)}">Xem tiến độ</button>`;
                    } else if (st.norm === "STUDYING") {
                      jumpBtnHtml = `<button type="button" class="btn btn-xs" data-jump-progress-cat="learning">Xem tiến độ</button>`;
                    } else if (isBusy) {
                      jumpBtnHtml = `<button type="button" class="btn btn-xs" data-jump-progress-cat="all">Xem tiến độ</button>`;
                    }
                    return `
                      <article class="staff-card ${isTrio ? "staff-card-trio" : ""}" data-open-staff="${esc(d.dept_id)}" role="button" tabindex="0">
                        <div class="staff-card-top">
                          <span class="sq-avatar">#${esc(d.dept_id)}</span>
                          <span class="staff-info">
                            <span class="row-title">${esc(cleanName)}</span>
                            <span class="staff-foot">
                              <span class="badge ${st.cls}">${ico(st.icon)}<span>${st.label}</span></span>
                              ${isTrio ? `<span class="badge badge-sync">Chốt cuối Khối 9</span>` : ""}
                              ${openReworkForDept > 0 ? `<span class="badge badge-fail">${openReworkForDept} phiếu sửa lỗi</span>` : ""}
                            </span>
                            <span class="mono row-meta">${artCnt} bài đã học, ${skCnt} kỹ năng GitHub</span>
                          </span>
                        </div>
                        ${(isBusy && (workTitle || jumpBtnHtml)) ? `
                          <div class="staff-live-work">
                            <span class="staff-live-work-title" title="${esc(workTitle)}">${esc(workTitle || "Đang thực thi công việc")}</span>
                            ${jumpBtnHtml}
                          </div>
                        ` : ""}
                      </article>
                    `;
                  }).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    box.querySelectorAll("[data-toggle-div]").forEach((btn) => {
      btn.onclick = () => {
        const code = btn.getAttribute("data-toggle-div");
        const nextOpen = !(btn.getAttribute("aria-expanded") === "true");
        state.staffDivOpen[code] = nextOpen;
        btn.setAttribute("aria-expanded", nextOpen ? "true" : "false");
        const panel = box.querySelector(`[data-div-panel="${code}"]`);
        if (panel) panel.classList.toggle("open", nextOpen);
      };
    });

    bindQuickActions(box);
  }

  async function openStaffDrawer(deptId) {
    closeModals();
    state.activeStaffDrawerDeptId = String(deptId || "").padStart(2, "0");
    document.getElementById("drawer-backdrop").classList.add("open");
    document.getElementById("inspector-drawer").classList.add("open");
    const body = document.getElementById("drawer-body");
    body.innerHTML = `<p class="row-meta">Đang tải hồ sơ phòng chuyên gia...</p>`;

    try {
      const d = await api(`/api/departments/${encodeURIComponent(deptId)}`);
      const cleanName = cleanDeptTitleVi(d.dept_id, d.title_vi);
      document.getElementById("drawer-heading").textContent = `Phòng #${d.dept_id}: ${cleanName}`;
      const isCustom = Number(d.dept_id) > 53;
      const st = deptStatusMeta(d.status);
      const deptSkills = Array.isArray(d.installed_skills) && d.installed_skills.length
        ? d.installed_skills
        : state.installedSkills.filter((sk) => parseDeptIdsJson(sk.dept_ids_json || sk.dept_ids).includes(d.dept_id));
      const qualityCells = Array.isArray(d.embedded_quality_cells) && d.embedded_quality_cells.length
        ? d.embedded_quality_cells
        : DEFAULT_QUALITY_CELLS;
      const deptReworks = Array.isArray(d.rework_tickets) && d.rework_tickets.length
        ? d.rework_tickets
        : (state.reworkTickets || []).filter((tk) => String(tk.target_dept_id).padStart(2, "0") === String(d.dept_id).padStart(2, "0"));
      const normDid = String(d.dept_id || "00").padStart(2, "0");
      const peerDir = d.peer_directory || {};
      const upPeers = Array.isArray(peerDir.upstream_depts) ? peerDir.upstream_depts : [];
      const downPeers = Array.isArray(peerDir.downstream_depts) ? peerDir.downstream_depts : [];
      const coreStrength = sanitizeUiVietnamese(peerDir.core_strength_vi || "");
      const deptHandoffs = Array.isArray(d.recent_handoffs)
        ? d.recent_handoffs
        : (state.deptHandoffs || []).filter((ho) =>
            [ho.from_dept_id, ho.to_dept_id, ho.resolved_to_dept_id].map((x) => String(x || "").padStart(2, "0")).includes(normDid)
          );
      const isCeoDept = normDid === "00";

      body.innerHTML = `
        <div class="action-group">
          <span class="badge ${st.cls}">${ico(st.icon)}<span>${st.label}</span></span>
          <span class="mono row-meta">Hoàn tất: <strong>${d.tasks_completed || 0} việc</strong></span>
          <span class="mono row-meta">Bài học: <strong>${(d.learned_articles || []).length}</strong></span>
          <span class="mono row-meta">Kỹ năng: <strong>${deptSkills.length}</strong></span>
        </div>

        ${d.current_work_title ? `
          <div class="staff-live-work">
            <span class="staff-live-work-title">${esc(sanitizeUiVietnamese(d.current_work_title))}</span>
            ${d.current_mission_id
              ? `<button type="button" class="btn btn-xs" data-open-mission="${esc(d.current_mission_id)}">Xem tiến độ</button>`
              : d.current_task_id
              ? `<button type="button" class="btn btn-xs" data-open-task-jump="${esc(d.current_task_id)}">Xem công việc</button>`
              : ""}
          </div>
        ` : ""}

        <div class="drawer-quality-box">
          <div class="sec-head">
            <h3 class="sec-title">Cơ chế chất lượng nội bộ của phòng</h3>
            <span class="badge badge-cells">2 tổ nội bộ</span>
          </div>
          ${qualityCells.map((c) => `
            <div class="drawer-cell-item">
              <strong>${esc(sanitizeUiVietnamese(c.name_vi))}</strong>
              <span class="row-meta">${esc(sanitizeUiVietnamese(c.role_vi))}</span>
            </div>
          `).join("")}
          <p class="row-meta">Quy tắc đẩy trả: Mọi lỗi chức năng, thiếu sót hoặc rối mắt phát hiện sau khi bàn giao đều bị đẩy trả trực tiếp về Phòng #${esc(d.dept_id)} sửa đến khi Khối 9 chốt 0 lỗi.</p>
        </div>

        <div class="drawer-collab-box">
          <div class="sec-head">
            <h3 class="sec-title">Phối hợp đồng đội và Chuyển việc</h3>
            <button type="button" class="btn btn-xs" data-open-org-sop="directory">
              ${ico("layers")}<span>Danh bạ 54 phòng</span>
            </button>
          </div>
          ${coreStrength ? `<p class="step-summary"><strong>Chuyên môn lõi:</strong> ${esc(coreStrength)}</p>` : ""}
          ${upPeers.length ? `
            <div class="who-chips">
              <span>Nhận đầu vào từ:</span>
              ${upPeers.map((p) => `<button type="button" class="agent-pill" data-open-staff="${esc(p.dept_id)}" title="${esc(cleanDeptTitleVi(p.dept_id, p.title_vi))}">#${esc(p.dept_id)} ${esc(cleanDeptTitleVi(p.dept_id, p.title_vi))}</button>`).join("")}
            </div>
          ` : ""}
          ${downPeers.length ? `
            <div class="who-chips">
              <span>Thường bàn giao ngang cho:</span>
              ${downPeers.map((p) => `<button type="button" class="agent-pill" data-open-staff="${esc(p.dept_id)}" title="${esc(cleanDeptTitleVi(p.dept_id, p.title_vi))}">#${esc(p.dept_id)} ${esc(cleanDeptTitleVi(p.dept_id, p.title_vi))}</button>`).join("")}
            </div>
          ` : ""}
          <div class="action-group">
            <button type="button" class="btn btn-xs btn-primary" data-open-handoff-peer="${esc(normDid)}">
              ${ico("arrow-right")}<span>Chuyển việc ngang sang phòng khác</span>
            </button>
            <button type="button" class="btn btn-xs" data-open-handoff-ceo="${esc(normDid)}">
              ${ico("flag")}<span>Đẩy lên Tổng Giám đốc #00 xử lý</span>
            </button>
          </div>
          <div class="stack-sm">
            <div class="row-meta"><strong>Lịch sử chuyển việc và phân xử (${deptHandoffs.length})</strong></div>
            ${deptHandoffs.length
              ? deptHandoffs.map((ho) => renderHandoffCardHtml(ho, { isCeoDrawer: isCeoDept, showActions: true })).join("")
              : `<p class="row-meta">Chưa có lượt chuyển việc ngang hoặc đẩy lên #00 nào liên quan đến phòng này.</p>`
            }
          </div>
        </div>

        <div class="section-block">
          <div class="sec-head">
            <h3 class="sec-title">Phiếu sửa lỗi được đẩy về phòng này (${deptReworks.length})</h3>
            <button type="button" class="btn btn-xs btn-destructive" data-open-rework-for-dept="${esc(d.dept_id)}">
              ${ico("rotate-ccw")}<span>Đẩy trả lỗi về phòng này</span>
            </button>
          </div>
          ${deptReworks.length
            ? deptReworks.map(renderReworkTicketCardHtml).join("")
            : `<p class="row-meta">Hiện phòng này không có phiếu sửa lỗi nào bị đẩy trả.</p>`
          }
        </div>

        <button type="button" class="btn btn-primary btn-block" id="btn-dept-learn-more">
          ${ico("download")}<span>Nạp thêm kiến thức và kỹ năng mới cho phòng này</span>
        </button>

        <div class="section-block">
          <div class="sec-head">
            <h3 class="sec-title">Kỹ năng chuyên môn từ GitHub (${deptSkills.length})</h3>
          </div>
          ${deptSkills.length ? `
            <div class="hairline-list">
              ${deptSkills.map((sk) => `
                <div class="list-row">
                  <div class="row-main">
                    <div class="row-title">${esc(sanitizeUiVietnamese(sk.title_vi || sk.skill_slug))}</div>
                    <div class="row-meta">${esc(sk.repo_name || "Kho kỹ năng")} (${esc(sk.category_vi || "Chuyên môn")})</div>
                    ${sk.summary_vi ? `<p class="skill-summary">${esc(sanitizeUiVietnamese(sk.summary_vi))}</p>` : ""}
                  </div>
                  ${sk.source_url ? `<a class="btn btn-xs" href="${esc(sk.source_url)}" target="_blank" rel="noopener noreferrer">${ico("external-link")}<span>Nguồn</span></a>` : ""}
                </div>
              `).join("")}
            </div>
          ` : `<p class="row-meta">Chưa có kỹ năng riêng trong kho. Nhấn nút nạp thêm kiến thức ở trên để đồng bộ ngay.</p>`}
        </div>

        <form id="form-staff-quick-task" class="drawer-quick-form">
          <label for="inp-direct-task" class="doc-name-label">Giao việc riêng cho Phòng #${esc(d.dept_id)}</label>
          <div class="drawer-quick-row">
            <input type="text" class="input" id="inp-direct-task" placeholder="Nhập việc cần phòng chuyên gia này xử lý..." required />
            <button type="submit" class="btn btn-primary">${ico("send")}<span>Giao ngay</span></button>
          </div>
        </form>

        <details class="details-box">
          <summary>Cập nhật chức danh và hạn mức xử lý hàng tháng</summary>
          <form id="form-staff-meta" class="details-body">
            <div class="form-field">
              <label for="inp-staff-title">Chức danh hiển thị</label>
              <input type="text" class="input" id="inp-staff-title" value="${esc(cleanName)}" required />
            </div>
            <div class="form-field">
              <label for="inp-staff-budget">Hạn mức xử lý mỗi tháng</label>
              <input type="number" class="input mono" id="inp-staff-budget" value="${d.token_budget_monthly || 500000}" min="1000" step="50000" />
            </div>
            <button type="submit" class="btn btn-xs btn-primary">Lưu thông tin</button>
          </form>
        </details>

        ${(d.reflexions && d.reflexions.length) ? `
          <div class="section-block">
            <div class="sec-head"><h3 class="sec-title">Sổ rút kinh nghiệm (${d.reflexions.length})</h3></div>
            <div class="hairline-list">
              ${d.reflexions.map((r) => `
                <div class="list-row list-row-pair">
                  <div class="row-main">
                    <div class="row-title text-err">${esc(sanitizeUiVietnamese(r.failure_symptom))}</div>
                    <div class="row-meta">Quy tắc phòng ngừa: ${esc(sanitizeUiVietnamese(r.preventive_rule))}</div>
                  </div>
                  <button type="button" class="btn btn-xs btn-destructive" data-del-refl="${esc(r.reflexion_id)}">Xóa</button>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <div class="section-block">
          <div class="sec-head">
            <h3 class="sec-title">Sổ tay chuyên môn</h3>
            <div class="action-group">
              <button type="button" class="btn btn-xs" id="btn-edit-hb">${ico("pencil")}<span>Sửa sổ tay</span></button>
              ${isCustom ? `<button type="button" class="btn btn-xs btn-destructive" id="btn-retire-dept">${ico("trash")}<span>Giải thể phòng này</span></button>` : ""}
            </div>
          </div>
          <div id="hb-pretty" class="rendered-md">${renderCleanMarkdown(d.handbook_markdown)}</div>
          <div id="hb-edit-wrap" class="stack-sm is-hidden">
            <textarea class="textarea mono doc-editor" id="hb-textarea" aria-label="Nội dung sổ tay chuyên môn">${esc(d.handbook_markdown || "")}</textarea>
            <button type="button" class="btn btn-primary" id="btn-save-hb">Lưu sổ tay</button>
          </div>
        </div>
      `;

      document.getElementById("btn-dept-learn-more").onclick = (e) => withLock(e.currentTarget, async () => {
        const resSkill = await api("/api/skills/acquire", "POST", { dept_id: d.dept_id, division_code: d.division_code }).catch((err) => ({ ok: false, summary_vi: err.message }));
        await api("/api/learning/run", "POST", { scope: `dept:${d.dept_id}` }).catch(() => {});
        await loadEverything();
        if (!state.staticMode) startLearningStatusPolling();
        toast((resSkill && resSkill.summary_vi) || `Đã kích hoạt nạp kiến thức và kỹ năng mới cho Phòng #${d.dept_id}.`);
        openStaffDrawer(d.dept_id);
      });

      document.getElementById("form-staff-quick-task").onsubmit = async (e) => {
        e.preventDefault();
        const tval = document.getElementById("inp-direct-task").value.trim();
        if (!tval) return;
        const btn = e.target.querySelector("button[type='submit']");
        await withLock(btn, async () => {
          await api("/api/tasks", "POST", { title: tval, assigned_dept_id: d.dept_id, priority: "HIGH" });
          closeDrawer();
          await loadEverything();
          switchTab("tasks");
          toast(`Đã giao việc cho Phòng #${d.dept_id}.`);
        });
      };

      document.getElementById("form-staff-meta").onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector("button[type='submit']");
        await withLock(btn, async () => {
          await api(`/api/departments/${encodeURIComponent(d.dept_id)}`, "PATCH", {
            title_vi: document.getElementById("inp-staff-title").value.trim(),
            token_budget_monthly: Number(document.getElementById("inp-staff-budget").value || 500000)
          });
          await loadEverything();
          toast("Đã cập nhật thông tin phòng ban.");
          openStaffDrawer(d.dept_id);
        });
      };

      document.getElementById("btn-edit-hb").onclick = () => {
        const w = document.getElementById("hb-edit-wrap");
        const p = document.getElementById("hb-pretty");
        const open = w.classList.contains("is-hidden");
        w.classList.toggle("is-hidden", !open);
        p.classList.toggle("is-hidden", open);
      };

      document.getElementById("btn-save-hb").onclick = (e) => withLock(e.currentTarget, async () => {
        const md = document.getElementById("hb-textarea").value;
        await api(`/api/departments/${encodeURIComponent(d.dept_id)}`, "PATCH", { handbook_markdown: md });
        toast("Đã lưu sổ tay chuyên môn.");
        openStaffDrawer(d.dept_id);
      });

      const retireBtn = document.getElementById("btn-retire-dept");
      if (retireBtn) {
        retireBtn.onclick = () => withLock(retireBtn, async () => {
          await api(`/api/departments/${encodeURIComponent(d.dept_id)}`, "DELETE");
          closeDrawer();
          await loadEverything();
          toast(`Đã giải thể Phòng #${d.dept_id}.`);
        });
      }

      body.querySelectorAll("[data-del-refl]").forEach((rb) => {
        rb.onclick = () => withLock(rb, async () => {
          await api(`/api/reflexions/${encodeURIComponent(rb.getAttribute("data-del-refl"))}`, "DELETE");
          openStaffDrawer(d.dept_id);
        });
      });

      bindQuickActions(body);
    } catch (e) {
      body.innerHTML = `<p class="text-err">${esc(e.message)}</p>`;
    }
  }

  function closeDrawer() {
    document.getElementById("drawer-backdrop").classList.remove("open");
    document.getElementById("inspector-drawer").classList.remove("open");
    document.getElementById("drawer-body").innerHTML = "";
  }

  // -------------------------------------------------------------------------
  // 10. TAB 5: BAO MOI VA KHO KY NANG GITHUB
  // -------------------------------------------------------------------------
  function renderLearningBanner() {
    const banner = document.getElementById("learning-live-banner");
    const titleEl = document.getElementById("learning-banner-title");
    const detailEl = document.getElementById("learning-banner-detail");
    const trackEl = document.getElementById("learning-banner-track");
    const fillEl = document.getElementById("learning-banner-fill");
    const lp = state.learningProgress || {};

    if (lp.running) {
      const done = Number(lp.sources_done || 0);
      const total = Math.max(1, Number(lp.sources_total || 24));
      const pct = Math.min(100, Math.round((done / total) * 100));
      banner.classList.add("is-active");
      titleEl.textContent = `Đang quét kênh ${done}/${total}: ${sanitizeUiVietnamese(lp.current_source_vi || "Đang đọc nguồn tin...")}`;
      detailEl.textContent = `Đã nạp mới ${lp.new_atoms_added || 0} bài, bỏ qua ${lp.duplicates_skipped || 0} bài trùng lặp.`;
      trackEl.classList.remove("is-hidden");
      trackEl.setAttribute("aria-valuenow", String(pct));
      fillEl.style.inlineSize = `${Math.max(5, pct)}%`;
    } else {
      banner.classList.remove("is-active");
      trackEl.classList.add("is-hidden");
      const last = state.learningRuns[0];
      if (lp.summary_vi) {
        const at = shortTime(lp.finished_at || new Date().toISOString());
        titleEl.textContent = at ? `Hoàn tất quét báo lúc ${at}` : "Hoàn tất đợt quét báo mới";
        detailEl.textContent = sanitizeUiVietnamese(lp.summary_vi);
      } else if (last) {
        const at = shortTime(last.finished_at || last.started_at);
        const added = Number(last.new_atoms_added ?? last.articles_added ?? 0);
        const skipped = Number(last.duplicates_skipped ?? 0);
        const scanned = Number(last.sources_queried ?? last.sources_scanned ?? last.sources_total ?? 24);
        const deptsCnt = Array.isArray(last.touched_depts) ? last.touched_depts.length : (Number(last.touched_depts_count) || state.departments.length || 53);
        titleEl.textContent = at ? `Hoàn tất đợt quét gần nhất lúc ${at}` : "Đợt quét gần nhất đã hoàn tất";
        detailEl.textContent = last.summary_vi
          ? sanitizeUiVietnamese(last.summary_vi)
          : `Đã quét ${scanned} nguồn, nạp mới ${added} bài cho ${deptsCnt} phòng ban, bỏ qua ${skipped} bài đã có trong kho.`;
      } else {
        titleEl.textContent = "Kho tri thức thị trường sẵn sàng quét 24 nguồn tin thật";
        detailEl.textContent = "Bấm Quét 24 nguồn báo mới ngay để hệ thống tự tổng hợp tin mới và báo cáo rõ số bài nạp mới hoặc bỏ qua trùng lặp.";
      }
    }
  }

  function renderNewsTab() {
    renderLearningBanner();

    document.querySelectorAll("#news-subview-tabs .seg-btn").forEach((b) => {
      const on = b.getAttribute("data-nsub") === state.newsSubView;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });

    const artPanel = document.getElementById("news-panel-articles");
    const skillPanel = document.getElementById("news-panel-skills");
    artPanel.classList.toggle("is-hidden", state.newsSubView !== "articles");
    skillPanel.classList.toggle("is-hidden", state.newsSubView !== "skills");

    if (state.newsSubView === "skills") {
      renderSkillsPanel();
      return;
    }

    const divFilter = getListboxValue("filter-news-div");
    const deptIdsInDiv = divFilter
      ? new Set(state.departments.filter((d) => d.division_code === divFilter).map((d) => d.dept_id))
      : null;

    const box = document.getElementById("news-list-box");
    const uniqueList = getDeduplicatedArticles().filter((a) => {
      if (state.newsStarFilter === "starred" && !a.is_starred) return false;
      if (deptIdsInDiv) {
        const list = a.dept_list || [a.dept_id];
        if (!list.some((id) => deptIdsInDiv.has(id))) return false;
      }
      return true;
    });

    if (!uniqueList.length) {
      box.innerHTML = `<div class="empty-state"><p>Không có bài báo nào khớp bộ lọc hiện tại.</p></div>`;
      return;
    }

    box.innerHTML = uniqueList.map((a) => {
      const aid = a.atom_id || a.url_hash;
      const expanded = state.expandedNewsIds.has(String(aid));
      const link = a.url || a.source_url || "#";
      const srcLabel = CONNECTOR_LABELS[a.source_connector] || "Bản tin thị trường";
      const deptsText = (a.dept_list || [a.dept_id]).map((d) => `#${d}`).join(", ");
      const starred = Boolean(a.is_starred);
      return `
        <article class="news-row">
          <div class="news-top">
            <div class="row-main clickable" data-toggle-news="${esc(aid)}">
              <div class="row-title">${esc(sanitizeUiVietnamese(a.title))}</div>
              <div class="row-meta">${esc(srcLabel)}, Phòng ${esc(deptsText)}, ${esc(shortTime(a.fetched_at))}</div>
            </div>
            <div class="action-group">
              ${a.atom_id ? `<button type="button" class="btn btn-xs ${starred ? "btn-star-active" : ""}" aria-pressed="${starred ? "true" : "false"}" data-star-news="${a.atom_id}">${ico(starred ? "star-fill" : "star")}<span>${starred ? "Đã đánh dấu" : "Đánh dấu"}</span></button>` : ""}
              <a class="btn btn-xs" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${ico("external-link")}<span>Mở bài gốc</span></a>
              ${a.atom_id ? `<button type="button" class="btn btn-xs btn-destructive" data-del-news="${a.atom_id}">${ico("trash")}<span>Xóa</span></button>` : ""}
            </div>
          </div>
          ${expanded ? `
            <div class="news-summary-box">
              <div>${esc(sanitizeUiVietnamese(a.summary_vi || ""))}</div>
              ${a.actionable_insight ? `<div class="news-insight">Ứng dụng thực tế: ${esc(sanitizeUiVietnamese(a.actionable_insight))}</div>` : ""}
            </div>
          ` : ""}
        </article>
      `;
    }).join("");

    box.querySelectorAll("[data-toggle-news]").forEach((el) => {
      el.onclick = () => {
        const id = el.getAttribute("data-toggle-news");
        if (state.expandedNewsIds.has(id)) state.expandedNewsIds.delete(id);
        else state.expandedNewsIds.add(id);
        renderNewsTab();
      };
    });
    bindQuickActions(box);
  }

  function renderSkillsPanel() {
    const allSkills = state.installedSkills || [];
    document.getElementById("skills-hero-count").textContent = allSkills.length;

    const repoSet = Array.from(new Set(allSkills.map((s) => s.repo_name).filter(Boolean)));
    const repoChips = document.getElementById("skills-repo-chips");
    if (repoChips) {
      const displayRepos = repoSet.length ? repoSet : ["ux-ui-agent-skills", "marketingskills", "superpowers", "anthropics/skills", "mattpocock/skills"];
      repoChips.innerHTML = displayRepos.map((r) => `<span class="badge badge-study">${ico("layers")}<span>${esc(r)}</span></span>`).join("");
    }

    const q = (document.getElementById("skill-search-input").value || "").trim().toLowerCase();
    const divF = getListboxValue("filter-skill-div");
    const deptF = getListboxValue("filter-skill-dept");

    const filtered = allSkills.filter((sk) => {
      const dIds = parseDeptIdsJson(sk.dept_ids_json || sk.dept_ids);
      if (divF && sk.division_code !== divF) return false;
      if (deptF && !dIds.includes(deptF)) return false;
      if (q && !`${sk.title_vi} ${sk.skill_slug} ${sk.repo_name} ${sk.category_vi} ${sk.summary_vi}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const grid = document.getElementById("skills-grid-box");
    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state opp-card-lead">
          <h3>Chưa có kỹ năng nào khớp bộ lọc</h3>
          <p>Nhập từ khóa hoặc dán liên kết kho GitHub vào biểu mẫu phía trên để tải kỹ năng mới dạy trực tiếp cho đội ngũ.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((sk) => {
      const dIds = parseDeptIdsJson(sk.dept_ids_json || sk.dept_ids);
      return `
        <article class="skill-card">
          <div class="opp-head">
            <h3 class="row-title">${esc(sanitizeUiVietnamese(sk.title_vi || sk.skill_slug))}</h3>
            <span class="badge badge-study">${esc(sk.category_vi || "Chuyên môn")}</span>
          </div>
          <div class="row-meta mono">${esc(sk.repo_name || "Kho kỹ năng GitHub")}</div>
          <p class="skill-summary">${esc(sanitizeUiVietnamese(sk.summary_vi || ""))}</p>
          <div class="chip-row">
            ${dIds.slice(0, 5).map((id) => `<button type="button" class="agent-pill" data-open-staff="${esc(id)}">#${esc(id)}</button>`).join("")}
            ${dIds.length > 5 ? `<span class="row-meta">+${dIds.length - 5} phòng</span>` : ""}
          </div>
          ${sk.source_url ? `
            <div>
              <a class="btn btn-xs" href="${esc(sk.source_url)}" target="_blank" rel="noopener noreferrer">${ico("external-link")}<span>Mở nguồn GitHub</span></a>
            </div>
          ` : ""}
        </article>
      `;
    }).join("");

    bindQuickActions(grid);
  }

  // -------------------------------------------------------------------------
  // 11. TAB 6: TAI CHINH VA DU AN (ZERO SLIDERS, BAO CAO THUC TE & SO THU CHI)
  // -------------------------------------------------------------------------
  function buildCorpComparisonSvg(projects) {
    if (!projects.length) {
      return `<p class="row-meta">Chưa có dự án nào để vẽ biểu đồ so sánh.</p>`;
    }
    const maxVal = Math.max(1000000, ...projects.flatMap((p) => [
      Number(p.actual_revenue_vnd || 0),
      Number(p.actual_expense_vnd || 0),
      Number(p.plan_revenue_vnd || 0)
    ]));
    const rowH = 56;
    const h = projects.length * rowH + 20;
    const labelW = 190;
    const barMaxW = 360;

    const rowsSvg = projects.map((p, i) => {
      const y = i * rowH + 10;
      const revW = Math.max(3, Math.round((Number(p.actual_revenue_vnd || 0) / maxVal) * barMaxW));
      const expW = Math.max(3, Math.round((Number(p.actual_expense_vnd || 0) / maxVal) * barMaxW));
      const planW = Math.max(3, Math.round((Number(p.plan_revenue_vnd || 0) / maxVal) * barMaxW));
      const name = sanitizeUiVietnamese(p.title || p.project_id).slice(0, 26);
      return `
        <g>
          <text class="chart-axis-text" x="0" y="${y + 18}">${esc(name)}</text>
          <rect class="chart-bar-rev" x="${labelW}" y="${y + 2}" width="${revW}" height="10" rx="3" />
          <text class="chart-val-text" x="${labelW + revW + 8}" y="${y + 11}">Thu: ${esc(shortVnd(p.actual_revenue_vnd))}</text>
          <rect class="chart-bar-exp" x="${labelW}" y="${y + 16}" width="${expW}" height="10" rx="3" />
          <text class="chart-val-text" x="${labelW + expW + 8}" y="${y + 25}">Chi: ${esc(shortVnd(p.actual_expense_vnd))}</text>
          <rect class="chart-bar-plan" x="${labelW}" y="${y + 30}" width="${planW}" height="10" rx="3" />
          <text class="chart-val-text" x="${labelW + planW + 8}" y="${y + 39}">Dự toán: ${esc(shortVnd(p.plan_revenue_vnd))}</text>
        </g>
      `;
    }).join("");

    return `
      <svg class="chart-svg" viewBox="0 0 700 ${h}" role="img" aria-label="Biểu đồ so sánh thu thực tế, chi thực tế và dự toán giữa các dự án">
        <title>So sánh tài chính giữa các dự án</title>
        <desc>Hiển thị doanh thu thực tế, chi phí thực tế và dự toán doanh thu kế hoạch cho từng dự án trong tập đoàn.</desc>
        ${rowsSvg}
      </svg>
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-swatch sw-rev"></span>Thu thực tế</span>
        <span class="legend-item"><span class="legend-swatch sw-exp"></span>Chi thực tế</span>
        <span class="legend-item"><span class="legend-swatch sw-plan"></span>Dự toán kế hoạch</span>
      </div>
    `;
  }

  function buildMonthlyGroupedBarSvg(series) {
    const data = Array.isArray(series) && series.length
      ? series.slice(-6)
      : [{ month: todayIso().slice(0, 7), revenue: 0, expense: 0, tax: 0 }];
    const maxVal = Math.max(1000000, ...data.flatMap((d) => [Number(d.revenue || 0), Number(d.expense || 0), Number(d.tax || 0)]));
    const chartH = 150;
    const baseY = 170;
    const colW = Math.floor(580 / Math.max(1, data.length));

    const bars = data.map((d, i) => {
      const gx = 40 + i * colW;
      const bw = Math.min(22, Math.floor((colW - 24) / 3));
      const hRev = Math.max(4, Math.round((Number(d.revenue || 0) / maxVal) * chartH));
      const hExp = Math.max(4, Math.round((Number(d.expense || 0) / maxVal) * chartH));
      const hTax = Math.max(4, Math.round((Number(d.tax || 0) / maxVal) * chartH));
      return `
        <g>
          <rect class="chart-bar-rev" x="${gx}" y="${baseY - hRev}" width="${bw}" height="${hRev}" rx="4" />
          <rect class="chart-bar-exp" x="${gx + bw + 4}" y="${baseY - hExp}" width="${bw}" height="${hExp}" rx="4" />
          <rect class="chart-bar-tax" x="${gx + (bw + 4) * 2}" y="${baseY - hTax}" width="${bw}" height="${hTax}" rx="4" />
          <text class="chart-axis-text" x="${gx}" y="${baseY + 18}">${esc(d.month)}</text>
        </g>
      `;
    }).join("");

    return `
      <svg class="chart-svg" viewBox="0 0 640 200" role="img" aria-label="Biểu đồ cột nhóm Thu, Chi và Dự phòng thuế theo tháng">
        <title>Thu, Chi và Dự phòng thuế theo tháng</title>
        <desc>Gồm ${data.length} kỳ tháng gần nhất hiển thị tổng thu, tổng chi và khoản dự phòng thuế.</desc>
        <line class="chart-grid-line" x1="32" y1="20" x2="620" y2="20" />
        <line class="chart-grid-line" x1="32" y1="95" x2="620" y2="95" />
        <line class="chart-grid-line" x1="32" y1="${baseY}" x2="620" y2="${baseY}" />
        ${bars}
      </svg>
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-swatch sw-rev"></span>Thu</span>
        <span class="legend-item"><span class="legend-swatch sw-exp"></span>Chi</span>
        <span class="legend-item"><span class="legend-swatch sw-tax"></span>Dự phòng thuế</span>
      </div>
    `;
  }

  function buildCategoryBreakdownHtml(byCategory, grossMarginPct) {
    const items = Array.isArray(byCategory) ? byCategory.slice(0, 6) : [];
    const total = items.reduce((s, x) => s + Number(x.amount_vnd || 0), 0);
    if (!items.length) {
      return `
        <p class="row-meta">Chưa có bút toán phân loại hạng mục cho dự án này. Ghi nhận khoản thu hoặc chi để xem tỷ trọng tự động.</p>
        <div class="rule"></div>
        <div class="rank-head"><span>Biên lãi gộp mục tiêu</span><strong class="mono text-ok">${Number(grossMarginPct || 0).toFixed(1)}%</strong></div>
      `;
    }
    return `
      <ol class="rank-list">
        ${items.map((it) => {
          const pct = total > 0 ? Math.round((Number(it.amount_vnd || 0) / total) * 100) : 0;
          const swCls = it.entry_type === "REVENUE" ? "sw-rev" : it.entry_type === "TAX_RESERVE" ? "sw-tax" : "sw-exp";
          const lbl = LEDGER_TYPE_LABELS[it.entry_type]?.label || "Khoản mục";
          return `
            <li class="rank-item">
              <div class="rank-head">
                <span>${esc(sanitizeUiVietnamese(it.category))} (${lbl})</span>
                <span class="mono"><strong>${vnd(it.amount_vnd)}</strong> (${pct}%)</span>
              </div>
              <div class="rank-track"><i class="rank-fill ${swCls}" style="inline-size:${Math.max(4, pct)}%;"></i></div>
            </li>
          `;
        }).join("")}
      </ol>
      <div class="rule"></div>
      <div class="rank-head"><span>Biên lãi gộp theo định giá hiện tại</span><strong class="mono text-ok">${Number(grossMarginPct || 0).toFixed(1)}%</strong></div>
    `;
  }

  function exportLedgerCsv(projectTitleStr, ledger) {
    const safeCell = (v) => {
      let s = String(v === null || v === undefined ? "" : v);
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = ["Ngay", "Loai", "Hang muc", "Noi dung", "So tien (VND)", "Tinh chat", "Ghi chu"];
    const rows = (ledger || []).map((e) => [
      e.entry_date || "",
      LEDGER_TYPE_LABELS[e.entry_type]?.label || e.entry_type,
      e.category || "",
      e.title || "",
      Number(e.amount_vnd || 0),
      e.is_estimate ? "Ke hoach du toan" : "Thuc te",
      e.note || ""
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(safeCell).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `so-thu-chi-${slugifyVi(projectTitleStr)}-${todayIso()}.csv`;
    a.click();
    toast("Đã xuất tệp bảng tính CSV sổ thu chi dự án.");
  }

  // -------------------------------------------------------------------------
  // 11A. TAB 2: QUAN LY DU AN (2 TANG: DANH MUC -> CHI TIET 5 PHAN MUC)
  // -------------------------------------------------------------------------
  function resolveProjectPreviewHref(rawUrl) {
    let clean = String(rawUrl || "").trim().replace(/\\/g, "/");
    if (!clean) return "";
    if (/^https?:\/\//i.test(clean)) return clean;
    if (clean.startsWith("corporate_hq/projects/")) {
      clean = `./projects/${clean.slice("corporate_hq/projects/".length)}`;
    }
    if (clean.startsWith("./")) {
      return state.staticMode ? clean : `${API_BASE}${clean.slice(1)}`;
    }
    if (clean.startsWith("/")) {
      return state.staticMode ? `.${clean}` : `${API_BASE}${clean}`;
    }
    return clean;
  }

  function extractProjectPreviews(p, detailSummary = null) {
    const raw = (p && p.preview_urls) || (detailSummary && detailSummary.preview_urls) || null;
    let appUrl = "";
    let landingUrl = "";
    const links = [];

    if (raw && !Array.isArray(raw) && typeof raw === "object") {
      appUrl = String(raw.app_url || "").trim();
      landingUrl = String(raw.landing_url || "").trim();
      if (Array.isArray(raw.links)) {
        raw.links.forEach((lk) => {
          if (!lk) return;
          const u = String(lk.url || lk.href || "").trim();
          if (!u) return;
          links.push({
            label_vi: sanitizeUiVietnamese(lk.label_vi || lk.label || "Mở sản phẩm trực tiếp"),
            url: u,
            kind: String(lk.kind || "other")
          });
        });
      }
    } else if (Array.isArray(raw)) {
      raw.forEach((pv) => {
        const u = typeof pv === "string" ? pv : String((pv && (pv.url || pv.href)) || "");
        if (!u) return;
        const low = u.toLowerCase();
        const isLanding = low.includes("landing");
        const isApp = low.includes("/app/") || (!isLanding && low.endsWith(".html"));
        if (isApp && !appUrl) appUrl = u;
        if (isLanding && !landingUrl) landingUrl = u;
        links.push({
          label_vi: typeof pv === "string"
            ? (isLanding ? "Mở Trang giới thiệu bán hàng" : "Mở Ứng dụng dùng thử trực tiếp")
            : sanitizeUiVietnamese(pv.label_vi || pv.label || "Mở sản phẩm trực tiếp"),
          url: u,
          kind: isLanding ? "landing" : (isApp ? "app" : "other")
        });
      });
    }

    if (appUrl && !links.some((x) => x.url === appUrl)) {
      links.unshift({ label_vi: "Mở Ứng dụng Live trực tiếp", url: appUrl, kind: "app" });
    }
    if (landingUrl && !links.some((x) => x.url === landingUrl)) {
      links.push({ label_vi: "Mở Trang bán hàng giới thiệu", url: landingUrl, kind: "landing" });
    }
    return { appUrl, landingUrl, links };
  }

  function deriveProjectMetrics(p) {
    const tasksSummary = p.tasks_summary || (() => {
      const pTasks = state.tasks.filter((t) => t.project_id === p.project_id);
      const done = pTasks.filter((t) => t.kanban_column === "DONE").length;
      const inProg = pTasks.filter((t) => ["IN_PROGRESS", "QA_SECURITY_REVIEW"].includes(t.kanban_column)).length;
      const wait = pTasks.filter((t) => t.kanban_column === "WAITING_APPROVAL").length;
      return {
        total: pTasks.length,
        done,
        in_progress: inProg,
        waiting: wait,
        progress_pct: pTasks.length ? Math.round((done / pTasks.length) * 100) : 0
      };
    })();

    const reworkSummary = p.rework_summary || (() => {
      const mIds = new Set(state.missions.filter((m) => m.project_id === p.project_id).map((m) => m.mission_id));
      const pRw = (state.reworkTickets || []).filter((rw) => rw.project_id === p.project_id || mIds.has(rw.mission_id));
      return {
        open_count: pRw.filter((rw) => rw.status === "OPEN" || rw.status === "IN_FIX").length,
        recheck_count: pRw.filter((rw) => rw.status === "FIXED_PENDING_RECHECK").length,
        closed_count: pRw.filter((rw) => rw.status === "VERIFIED_CLOSED").length
      };
    })();

    const quality = p.quality_metrics || (() => {
      const linked = state.missions.find((m) => m.project_id === p.project_id);
      return {
        survival_score: linked ? Number(linked.survival_score || 0) : 0,
        ux_score: linked ? Number(linked.ux_score || 0) : 0,
        expected_margin_pct: linked ? Number(linked.expected_margin_pct || 0) : 0,
        product_scale_score: linked ? Number(linked.product_scale_score || 0) : 0,
        all_9_divisions_covered: Boolean(linked && linked.division_roster_plan && linked.division_roster_plan.all_9_divisions_covered),
        mission_id: linked ? linked.mission_id : "",
        mission_status: linked ? linked.status : ""
      };
    })();

    const filesSummary = p.files_summary || { total_files: 0, app_files: 0, doc_files: 0, total_size_kb: 0 };
    const financeBrief = p.finance_brief || (() => {
      const fb = computeProjectFinanceFallback(p.project_id);
      const s = (fb && fb.summary) || {};
      return {
        actual_revenue_vnd: Number(s.actual_revenue_vnd || 0),
        actual_expense_vnd: Number(s.actual_expense_vnd || 0),
        actual_net_profit_vnd: Number(s.actual_net_profit_vnd || 0),
        plan_revenue_vnd: Number(s.plan_revenue_vnd || 0),
        plan_net_profit_vnd: Number(s.plan_net_profit_vnd || 0)
      };
    })();

    return { tasksSummary, reworkSummary, quality, filesSummary, financeBrief };
  }

  function projectStatusBadgeCls(status) {
    const st = String(status || "ACTIVE").toUpperCase();
    if (st === "SHIPPED") return "badge-done";
    if (st === "ACTIVE") return "badge-run";
    if (st === "PAUSED") return "badge-wait";
    return "badge-idle";
  }

  async function loadProjectDetail(pid) {
    if (!pid) {
      state.projectDetail = null;
      return null;
    }
    try {
      const det = await api(`/api/projects/${encodeURIComponent(pid)}/detail`);
      if (det && det.project) {
        state.projectDetail = det;
        if (state.tab === "projects" && state.selectedProjectId === pid) {
          renderProjectsTab();
        }
        return det;
      }
    } catch (_e) {}

    // Safe fallback for older server or offline mode
    const fin = computeProjectFinanceFallback(pid);
    const p = state.projects.find((x) => x.project_id === pid) || (fin && fin.project);
    if (!p) {
      state.projectDetail = null;
      return null;
    }
    const mIds = new Set(state.missions.filter((m) => m.project_id === pid).map((m) => m.mission_id));
    state.projectDetail = {
      project: p,
      files: [],
      tasks: (fin && fin.tasks) || state.tasks.filter((t) => t.project_id === pid),
      missions: (fin && fin.missions) || state.missions.filter((m) => m.project_id === pid),
      rework_tickets: (state.reworkTickets || []).filter((rw) => rw.project_id === pid || mIds.has(rw.mission_id)),
      finance_summary: (fin && fin.summary) || {},
      ledger: (fin && fin.ledger) || state.projectLedger.filter((l) => l.project_id === pid)
    };
    if (state.tab === "projects" && state.selectedProjectId === pid) {
      renderProjectsTab();
    }
    return state.projectDetail;
  }

  async function openProjectWorkspace(projectId, subTab = "overview") {
    closeDrawer();
    closeModals();
    if (!projectId) {
      state.selectedProjectId = "";
      state.projectDetail = null;
      switchTab("projects");
      return;
    }
    state.selectedProjectId = projectId;
    state.projectDetailSubTab = subTab || "overview";
    state.currentDocFile = "";
    state.docEditMode = false;
    switchTab("projects");
    await loadProjectDetail(projectId);
  }

  function openProjectUpgradeModal(pid) {
    const p = state.projects.find((x) => x.project_id === pid) || (state.projectDetail && state.projectDetail.project);
    if (!p) return;
    document.getElementById("form-project-upgrade").reset();
    document.getElementById("upgrade-project-id").value = p.project_id;
    const ctx = document.getElementById("upgrade-project-context");
    if (ctx) {
      ctx.innerHTML = `
        <strong>Dự án mục tiêu: ${esc(sanitizeUiVietnamese(p.title))}</strong>
        <span class="row-meta">Hệ thống sẽ tự lập đội hình đủ 9/9 Khối chuyên môn và Bộ Tứ chốt cuối Khối 9 (#53, #51, #52, #49) để triển khai nâng cấp trực tiếp dự án này.</span>
      `;
    }
    openModal("modal-project-upgrade");
  }

  function openMediaCampaignModal(pid) {
    const p = state.projects.find((x) => x.project_id === pid) || (state.projectDetail && state.projectDetail.project);
    if (!p) return;
    document.getElementById("form-media-campaign").reset();
    document.getElementById("media-project-id").value = p.project_id;
    document.getElementById("inp-media-schedule").value = "Thứ 3 và Thứ 6 lúc 20:00";
    setListboxValue("inp-media-platform", "TIKTOK", true);
    const ctx = document.getElementById("media-project-context");
    if (ctx) {
      ctx.innerHTML = `
        <strong>Studio Khối 5 (#25 đến #31): ${esc(sanitizeUiVietnamese(p.title))}</strong>
        <span class="row-meta">Tự động sinh kịch bản Hook 3 giây, phân cảnh câu lệnh Google Flow và Veo 3.1, ảnh bìa SVG và bộ tiêu đề SEO YouTube/TikTok.</span>
      `;
    }
    openModal("modal-media-campaign");
  }

  function renderProjectMediaPanel(p, campaigns) {
    const list = Array.isArray(campaigns) ? campaigns : [];
    return `
      <div class="section-block">
        <div class="sec-head">
          <div>
            <h3 class="sec-title">Studio Truyền thông và Video AI Google Flow (${list.length} chiến dịch)</h3>
            <p class="row-meta">Sản xuất bởi Khối 5 (#25 Chiến lược Kênh, #26 Biên kịch mở đầu 3 giây, #27 Đạo diễn Google Flow và Veo 3.1, #29 Ảnh bìa, #30 SEO).</p>
          </div>
          <div class="action-group">
            <a class="btn btn-xs" id="btn-open-google-flow-top" href="https://flow.google.com/" target="_blank" rel="noopener noreferrer">
              ${ico("external-link")}<span>Mở Google Flow</span>
            </a>
            <button type="button" class="btn btn-xs btn-primary" id="btn-proj-add-media">
              ${ico("video")}<span>Tạo chiến dịch Video AI (Google Flow / YTB / TikTok)</span>
            </button>
          </div>
        </div>
        ${list.length ? `
          <div class="media-campaign-list">
            ${list.map((c) => {
              let scenes = [];
              if (Array.isArray(c.google_flow_scenes)) {
                scenes = c.google_flow_scenes;
              } else if (c.google_flow_scenes_json) {
                try { scenes = JSON.parse(c.google_flow_scenes_json) || []; } catch (_e) { scenes = []; }
              }
              const platKey = String(c.platform || "TIKTOK").toUpperCase();
              const platLbl = MEDIA_PLATFORM_LABELS[platKey] || platKey;
              const stKey = String(c.status || "FLOW_READY").toUpperCase();
              const stLbl = MEDIA_STATUS_LABELS[stKey] || stKey;
              const stLbId = `media-st-${c.campaign_id}`;
              const rawThumb = c.thumbnail_web_url || c.thumbnail_svg_path || "";
              const thumbHref = rawThumb ? resolveProjectPreviewHref(rawThumb) : "";
              const flowUrl = c.google_flow_url || "https://flow.google.com/";
              const videoFiles = Array.isArray(c.video_files) ? c.video_files : [];
              const allPromptsText = scenes.map((sc, idx) =>
                `Scene ${sc.scene_no || (idx + 1)} (${sc.duration_sec || 5}s, ${sc.shot_type || "Medium"}): ${sc.visual_prompt_flow || ""}`
              ).join("\n\n");
              const seoCopyText = [
                c.seo_title_vi || c.title || "",
                c.seo_description_vi || "",
                c.hashtags || "",
                c.cta_vi ? `CTA: ${c.cta_vi}` : ""
              ].filter(Boolean).join("\n");

              return `
                <article class="media-campaign-card" data-campaign-card="${esc(c.campaign_id)}">
                  <div class="media-campaign-top ${thumbHref ? "has-thumb" : ""}">
                    ${thumbHref ? `
                      <div class="media-thumb-wrap">
                        <img class="media-thumb-img" src="${esc(thumbHref)}" alt="Ảnh bìa chiến dịch ${esc(sanitizeUiVietnamese(c.title))}" loading="lazy" />
                      </div>
                    ` : ""}
                    <div class="stack-sm">
                      <div class="project-card-head">
                        <div class="stack-xs">
                          <div class="action-group">
                            <span class="badge badge-sync">${ico("video")}<span>${esc(platLbl)}</span></span>
                            ${stKey === "FLOW_QUEUED" ? `<span class="badge badge-run">${ico("activity")}<span>Đang chờ Trình duyệt AI</span></span>` : ""}
                            ${c.publish_schedule_vi ? `<span class="badge badge-idle">${ico("clock")}<span>${esc(sanitizeUiVietnamese(c.publish_schedule_vi))}</span></span>` : ""}
                          </div>
                          <h4 class="project-card-title">${esc(sanitizeUiVietnamese(c.title))}</h4>
                        </div>
                        <div class="action-group">
                          <div class="listbox-field listbox-inline listbox-compact" data-media-status-lb="${esc(stLbId)}" data-campaign-id="${esc(c.campaign_id)}">
                            <input type="hidden" value="${esc(stKey)}" />
                            <button type="button" class="listbox-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="lb-${esc(stLbId)}" aria-label="Đổi trạng thái chiến dịch Video AI">
                              <span class="listbox-value">${esc(stLbl)}</span>
                              ${ico("chevron-down", "ico-xs listbox-chevron")}
                            </button>
                            <ul class="listbox-menu" id="lb-${esc(stLbId)}" role="listbox" tabindex="-1" hidden></ul>
                          </div>
                          <button type="button" class="btn btn-xs btn-destructive" data-del-media="${esc(c.campaign_id)}">${ico("trash")}<span>Xóa</span></button>
                        </div>
                      </div>

                      <div class="media-flow-bar">
                        <span class="row-meta">Dựng Video AI trực tiếp trên Google Flow:</span>
                        <div class="action-group">
                          <button type="button" class="btn btn-xs" data-copy-open-flow="${esc(c.campaign_id)}" data-flow-url="${esc(flowUrl)}" data-scene-count="${scenes.length}" data-flow-prompt="${esc(allPromptsText || c.title || "")}">
                            ${ico("external-link")}<span>Sao chép và Mở Google Flow</span>
                          </button>
                          <button type="button" class="btn btn-xs btn-primary" data-render-flow="${esc(c.campaign_id)}">
                            ${ico("zap")}<span>Tạo Video bằng Trình duyệt AI</span>
                          </button>
                        </div>
                      </div>

                      ${c.angle_vi ? `<p class="row-meta">Góc đánh truyền thông: <strong>${esc(sanitizeUiVietnamese(c.angle_vi))}</strong></p>` : ""}

                      ${c.hook_3s_vi ? `
                        <div class="media-hook-box">
                          <span class="eyebrow">Câu mở đầu thu hút 3 giây đầu (Hook)</span>
                          <strong>${esc(sanitizeUiVietnamese(c.hook_3s_vi))}</strong>
                        </div>
                      ` : ""}

                      ${c.publish_url ? `
                        <div class="action-group">
                          <a class="btn btn-xs btn-primary" href="${esc(c.publish_url)}" target="_blank" rel="noopener noreferrer">${ico("external-link")}<span>Mở liên kết đã đăng</span></a>
                        </div>
                      ` : ""}
                    </div>
                  </div>

                  ${videoFiles.length ? `
                    <div class="media-video-section">
                      <div class="sec-head">
                        <strong class="row-title">Video đã dựng xong (${videoFiles.length})</strong>
                      </div>
                      <div class="media-video-grid">
                        ${videoFiles.map((vf) => {
                          const vUrl = resolveProjectPreviewHref(vf.url || "");
                          return `
                            <div class="media-video-card">
                              <div class="sec-head">
                                <span class="mono row-title">${esc(vf.name || "video.mp4")}</span>
                                <div class="action-group">
                                  ${vf.size_kb ? `<span class="mono row-meta">${esc(String(vf.size_kb))} KB</span>` : ""}
                                  <a class="btn btn-xs" href="${esc(vUrl)}" download="${esc(vf.name || "video.mp4")}">${ico("download")}<span>Tải tệp MP4</span></a>
                                </div>
                              </div>
                              <video class="media-video-player" controls preload="metadata" src="${esc(vUrl)}"></video>
                            </div>
                          `;
                        }).join("")}
                      </div>
                    </div>
                  ` : ""}

                  ${scenes.length ? `
                    <div class="stack-sm">
                      <div class="sec-head">
                        <strong class="row-title">Kịch bản phân cảnh Google Flow và Veo 3.1 (${scenes.length} cảnh)</strong>
                        <button type="button" class="btn btn-xs btn-primary" data-copy-text="${esc(allPromptsText)}" data-copy-label="Đã sao chép toàn bộ câu lệnh Google Flow">
                          ${ico("copy")}<span>Sao chép câu lệnh Google Flow</span>
                        </button>
                      </div>
                      <div class="media-scene-list">
                        ${scenes.map((sc, idx) => `
                          <div class="media-scene-row">
                            <div class="sec-head">
                              <span class="badge badge-idle">Cảnh ${sc.scene_no || (idx + 1)} (${sc.duration_sec || 5}s, ${esc(sanitizeUiVietnamese(sc.shot_type || "Cận cảnh"))})</span>
                              <button type="button" class="btn btn-xs" data-copy-text="${esc(sc.visual_prompt_flow || "")}" data-copy-label="Đã sao chép câu lệnh Cảnh ${sc.scene_no || (idx + 1)}">
                                ${ico("copy")}<span>Sao chép cảnh này</span>
                              </button>
                            </div>
                            ${sc.visual_prompt_flow ? `<div class="media-prompt-box">${esc(sc.visual_prompt_flow)}</div>` : ""}
                            ${sc.voiceover_vi ? `<p class="row-meta"><strong>Lời thoại:</strong> ${esc(sanitizeUiVietnamese(sc.voiceover_vi))}</p>` : ""}
                            ${sc.on_screen_text_vi ? `<p class="row-meta"><strong>Chữ trên màn hình:</strong> ${esc(sanitizeUiVietnamese(sc.on_screen_text_vi))}</p>` : ""}
                            ${sc.sfx_music_vi ? `<p class="row-meta"><strong>Âm thanh và Nhạc nền:</strong> ${esc(sanitizeUiVietnamese(sc.sfx_music_vi))}</p>` : ""}
                          </div>
                        `).join("")}
                      </div>
                    </div>
                  ` : ""}

                  <div class="media-seo-box">
                    <div class="sec-head">
                      <strong class="row-title">Tiêu đề SEO, Hashtags và Lời kêu gọi</strong>
                      <button type="button" class="btn btn-xs" data-copy-text="${esc(seoCopyText)}" data-copy-label="Đã sao chép bộ Tiêu đề SEO và Hashtags">
                        ${ico("copy")}<span>Sao chép SEO và Hashtags</span>
                      </button>
                    </div>
                    ${c.seo_title_vi ? `<p class="row-meta"><strong>Tiêu đề đăng:</strong> ${esc(sanitizeUiVietnamese(c.seo_title_vi))}</p>` : ""}
                    ${c.seo_description_vi ? `<p class="row-meta">${esc(sanitizeUiVietnamese(c.seo_description_vi))}</p>` : ""}
                    ${c.hashtags ? `<p class="mono row-meta">${esc(c.hashtags)}</p>` : ""}
                    ${c.cta_vi ? `<p class="row-meta"><strong>Kêu gọi hành động:</strong> ${esc(sanitizeUiVietnamese(c.cta_vi))}</p>` : ""}
                  </div>
                </article>
              `;
            }).join("")}
          </div>
        ` : `
          <div class="empty-state">
            <p>Dự án này chưa có chiến dịch Video AI nào. Nhấn <strong>Tạo chiến dịch Video AI (Google Flow / YTB / TikTok)</strong> để Khối 5 sinh ngay kịch bản, câu lệnh Google Flow và ảnh bìa SVG.</p>
          </div>
        `}
      </div>
    `;
  }

  function openNewProjectModal() {
    document.getElementById("proj-modal-title").textContent = "Tạo dự án mới";
    document.getElementById("edit-proj-id").value = "";
    document.getElementById("wrap-proj-slug").classList.remove("is-hidden");
    document.getElementById("form-proj").reset();
    document.getElementById("inp-proj-price").value = "399.000";
    setListboxValue("inp-proj-status", "ACTIVE", true);
    openModal("modal-proj");
  }

  function renderProjectsTab() {
    const root = document.getElementById("projects-workspace-root");
    if (!root) return;

    if (state.selectedProjectId) {
      renderProjectDetailWorkspace(root);
      return;
    }

    const totalProjects = state.projects.length;
    const shippedCount = state.projects.filter((p) => String(p.status || "").toUpperCase() === "SHIPPED").length;
    const activeCount = state.projects.filter((p) => String(p.status || "").toUpperCase() === "ACTIVE").length;

    const uxScores = state.projects
      .map((p) => Number((deriveProjectMetrics(p).quality || {}).ux_score || 0))
      .filter((v) => v > 0);
    const avgUx = uxScores.length ? Math.round(uxScores.reduce((a, b) => a + b, 0) / uxScores.length) : 0;

    const totalOpenReworks = state.projects.reduce((acc, p) => {
      const rw = deriveProjectMetrics(p).reworkSummary;
      return acc + Number(rw.open_count || 0) + Number(rw.recheck_count || 0);
    }, 0);

    const q = (state.projectSearchQuery || "").trim().toLowerCase();
    const stF = state.projectStatusFilter || "";
    const filtered = state.projects.filter((p) => {
      if (stF && String(p.status || "").toUpperCase() !== stF) return false;
      if (!q) return true;
      const hay = `${p.title || ""} ${p.slug || ""} ${p.objective || ""} ${p.target_market || ""}`.toLowerCase();
      return hay.includes(q);
    });

    const stTabs = [
      { v: "", lbl: `Tất cả (${totalProjects})` },
      { v: "SHIPPED", lbl: `Đã ra mắt (${shippedCount})` },
      { v: "ACTIVE", lbl: `Đang phát triển (${activeCount})` },
      { v: "PLANNING", lbl: "Lập kế hoạch" },
      { v: "PAUSED", lbl: "Tạm dừng" }
    ];

    root.innerHTML = `
      <div class="hero-band">
        <div class="card card-lift hero-lead">
          <div class="hero-metrics-top">
            <div class="hero-figure-wrap">
              <p class="eyebrow">Danh mục sản phẩm và dự án</p>
              <p class="hero-figure">${totalProjects}</p>
              <p class="hero-caption">${shippedCount} đã ra mắt trực tuyến, ${activeCount} đang phát triển tích cực cùng 9 Khối chuyên môn.</p>
            </div>
            <div class="action-group">
              <button type="button" class="btn btn-primary" id="btn-new-proj-tab2">
                ${ico("plus")}<span>Tạo dự án mới</span>
              </button>
            </div>
          </div>
        </div>

        <div class="hero-aside-stack">
          <div class="card">
            <p class="eyebrow">Chất lượng trải nghiệm trung bình</p>
            <p class="stat-value-md ${avgUx >= 85 ? "text-ok" : ""}">${avgUx > 0 ? `${avgUx}/100` : "Đang đo"}</p>
            <p class="row-meta">${uxScores.length > 0 ? `Tổng hợp từ ${uxScores.length} dự án đã qua kiểm định Khối 9.` : "Điểm kiểm định sẽ tự cập nhật sau Bước 7 Khối 9."}</p>
          </div>
          <div class="card hero-aside-card-grow">
            <p class="eyebrow">Tổng phiếu lỗi đang mở</p>
            <p class="stat-value-md ${totalOpenReworks > 0 ? "text-err" : "text-ok"}">${totalOpenReworks}</p>
            <p class="row-meta">${totalOpenReworks > 0 ? "Còn phiếu lỗi cần phòng ban sửa trước khi chốt 0 lỗi." : "Đạt chuẩn 0 lỗi mở trên toàn bộ danh mục dự án."}</p>
          </div>
        </div>
      </div>

      <div class="toolbar-row">
        <div class="toolbar-group url-input-grow">
          <label class="sr-only" for="projects-search-input">Tìm dự án theo tên, thị trường hoặc mã</label>
          <input type="search" class="input staff-search-input" id="projects-search-input" value="${esc(state.projectSearchQuery || "")}" placeholder="Tìm theo tên dự án, thị trường, mã định danh..." />
        </div>
        <div class="segmented" id="projects-status-filter" role="tablist" aria-label="Lọc dự án theo trạng thái">
          ${stTabs.map((t) => `
            <button type="button" class="seg-btn ${stF === t.v ? "active" : ""}" role="tab" aria-selected="${stF === t.v ? "true" : "false"}" data-pstatus="${esc(t.v)}">${esc(t.lbl)}</button>
          `).join("")}
        </div>
      </div>

      ${filtered.length ? `
        <div class="project-portfolio-grid">
          ${filtered.map((p) => {
            const m = deriveProjectMetrics(p);
            const pv = extractProjectPreviews(p);
            const stKey = String(p.status || "ACTIVE").toUpperCase();
            const stLabel = PROJECT_STATUS_LABELS[stKey] || "Đang phát triển";
            const stCls = projectStatusBadgeCls(stKey);
            const scoreLabel = m.quality.ux_score > 0
              ? `Trải nghiệm ${m.quality.ux_score}/100`
              : (m.quality.product_scale_score > 0 ? `Quy mô ${m.quality.product_scale_score}/100` : "Đang kiểm định");
            const filesLabel = `${m.filesSummary.total_files || 0} tệp`;
            const finLabel = `Thu ${shortVnd(m.financeBrief.actual_revenue_vnd)} / Dự toán ${shortVnd(m.financeBrief.plan_revenue_vnd)}`;
            const openRw = Number(m.reworkSummary.open_count || 0) + Number(m.reworkSummary.recheck_count || 0);
            const mediaCnt = Number(
              p.media_campaigns_count !== undefined && p.media_campaigns_count !== null
                ? p.media_campaigns_count
                : (state.mediaCampaigns || []).filter((mc) => mc.project_id === p.project_id).length
            );

            return `
              <article class="project-card" data-project-card="${esc(p.project_id)}">
                <div class="stack-sm">
                  <div class="project-card-head">
                    <div class="stack-xs">
                      <h2 class="project-card-title">${esc(sanitizeUiVietnamese(p.title))}</h2>
                      <p class="row-meta">${esc(sanitizeUiVietnamese(p.target_market || p.objective || "Sản phẩm thuộc hệ sinh thái Titan AI Corp."))}</p>
                    </div>
                    <div class="action-group">
                      <span class="badge ${stCls}">${esc(stLabel)}</span>
                      <span class="badge badge-sync">${ico("video")}<span>${mediaCnt} chiến dịch Video AI</span></span>
                      ${openRw > 0 ? `<span class="badge badge-fail">${openRw} lỗi mở</span>` : ""}
                    </div>
                  </div>

                  <div class="project-kpi-strip">
                    <div class="project-kpi-cell">
                      <span class="project-kpi-label">Chất lượng Khối 9</span>
                      <span class="project-kpi-val ${m.quality.ux_score >= 85 ? "text-ok" : ""}">${esc(scoreLabel)}</span>
                    </div>
                    <div class="project-kpi-cell">
                      <span class="project-kpi-label">Tiến độ công việc</span>
                      <span class="project-kpi-val">${m.tasksSummary.done}/${m.tasksSummary.total} việc (${m.tasksSummary.progress_pct}%)</span>
                    </div>
                    <div class="project-kpi-cell">
                      <span class="project-kpi-label">Mã nguồn và Tài liệu</span>
                      <span class="project-kpi-val">${esc(filesLabel)}</span>
                    </div>
                    <div class="project-kpi-cell">
                      <span class="project-kpi-label">Tài chính dự án</span>
                      <span class="project-kpi-val">${esc(finLabel)}</span>
                    </div>
                  </div>

                  <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.tasksSummary.progress_pct}">
                    <div class="progress-fill" style="inline-size:${Math.max(4, m.tasksSummary.progress_pct)}%;"></div>
                  </div>
                </div>

                <div class="project-card-actions">
                  <div class="action-group">
                    ${pv.appUrl ? `<a class="btn btn-xs" href="${esc(resolveProjectPreviewHref(pv.appUrl))}" target="_blank" rel="noopener noreferrer">${ico("external-link")}<span>Mở Ứng dụng Live</span></a>` : ""}
                    ${pv.landingUrl ? `<a class="btn btn-xs" href="${esc(resolveProjectPreviewHref(pv.landingUrl))}" target="_blank" rel="noopener noreferrer">${ico("book-open")}<span>Trang bán hàng</span></a>` : ""}
                  </div>
                  <div class="action-group">
                    <button type="button" class="btn btn-xs" data-open-proj-upgrade="${esc(p.project_id)}">${ico("zap")}<span>Nâng cấp dự án</span></button>
                    <button type="button" class="btn btn-xs btn-primary" data-open-proj="${esc(p.project_id)}">${ico("folder")}<span>Quản lý dự án</span></button>
                  </div>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="empty-state">
          <p>Không tìm thấy dự án nào khớp điều kiện lọc hiện tại. Thử đổi trạng thái hoặc nhấn <strong>Tạo dự án mới</strong>.</p>
        </div>
      `}
    `;

    const newProjBtn = document.getElementById("btn-new-proj-tab2");
    if (newProjBtn) newProjBtn.onclick = openNewProjectModal;

    const searchInp = document.getElementById("projects-search-input");
    if (searchInp) {
      searchInp.oninput = (e) => {
        state.projectSearchQuery = e.target.value;
        const pos = e.target.selectionStart;
        renderProjectsTab();
        const reInp = document.getElementById("projects-search-input");
        if (reInp) { reInp.focus(); try { reInp.setSelectionRange(pos, pos); } catch (_e) {} }
      };
    }

    root.querySelectorAll("#projects-status-filter [data-pstatus]").forEach((b) => {
      b.onclick = () => {
        state.projectStatusFilter = b.getAttribute("data-pstatus") || "";
        renderProjectsTab();
      };
    });

    bindQuickActions(root);
  }

  function renderProjectDetailWorkspace(root) {
    const pid = state.selectedProjectId;
    const det = (state.projectDetail && state.projectDetail.project && state.projectDetail.project.project_id === pid)
      ? state.projectDetail
      : null;
    const p = (det && det.project) || state.projects.find((x) => x.project_id === pid);
    if (!p) {
      state.selectedProjectId = "";
      state.projectDetail = null;
      renderProjectsTab();
      return;
    }

    const m = deriveProjectMetrics(p);
    const finSummary = (det && det.finance_summary) || (computeProjectFinanceFallback(pid)?.summary) || {};
    const pv = extractProjectPreviews(p, finSummary);
    const pTasks = (det && Array.isArray(det.tasks)) ? det.tasks : state.tasks.filter((t) => t.project_id === pid);
    const pMissions = (det && Array.isArray(det.missions)) ? det.missions : state.missions.filter((ms) => ms.project_id === pid);
    const mIds = new Set(pMissions.map((ms) => ms.mission_id));
    const pReworks = (det && Array.isArray(det.rework_tickets))
      ? det.rework_tickets
      : (state.reworkTickets || []).filter((rw) => rw.project_id === pid || mIds.has(rw.mission_id));
    const pFiles = (det && Array.isArray(det.files)) ? det.files : [];
    const pMedia = (det && Array.isArray(det.media_campaigns))
      ? det.media_campaigns
      : (state.mediaCampaigns || []).filter((mc) => mc.project_id === pid);
    const openRwCnt = pReworks.filter((tk) => tk.status !== "VERIFIED_CLOSED").length;
    const statusLbId = `proj-detail-status-${p.project_id}`;
    const subTab = state.projectDetailSubTab || "overview";

    let subHtml = "";
    if (subTab === "overview") {
      const surv = Number(m.quality.survival_score || 0);
      const ux = Number(m.quality.ux_score || 0);
      const margin = Number(m.quality.expected_margin_pct || finSummary.gross_margin_pct || 0);
      subHtml = `
        <div class="stack-md">
          <div class="quality-score-grid">
            <div class="quality-score-tile">
              <span class="eyebrow">Điểm sống sót</span>
              <span class="quality-score-num ${surv >= 85 ? "text-ok" : ""}">${surv > 0 ? `${surv}/100` : "Đang đo"}</span>
              <span class="row-meta">Thẩm định bởi Khối 9 #46</span>
            </div>
            <div class="quality-score-tile">
              <span class="eyebrow">Trải nghiệm khách thật</span>
              <span class="quality-score-num ${ux >= 85 ? "text-ok" : ""}">${ux > 0 ? `${ux}/100` : "Đang đo"}</span>
              <span class="row-meta">Kiểm thử đóng vai #48 và #49</span>
            </div>
            <div class="quality-score-tile">
              <span class="eyebrow">Biên lãi gộp</span>
              <span class="quality-score-num ${margin >= 65 ? "text-ok" : ""}">${margin > 0 ? `${margin.toFixed(1)}%` : "Chưa chốt"}</span>
              <span class="row-meta">Kiểm toán tài chính Khối 7</span>
            </div>
            <div class="quality-score-tile">
              <span class="eyebrow">Phiếu lỗi đang mở</span>
              <span class="quality-score-num ${openRwCnt > 0 ? "text-err" : "text-ok"}">${openRwCnt}</span>
              <span class="row-meta">${openRwCnt > 0 ? "Đang chặn chốt 0 lỗi" : "Đạt chuẩn chốt cuối 0 lỗi"}</span>
            </div>
          </div>

          ${pv.links.length ? `
            <div class="preview-cards-grid">
              ${pv.links.map((lk) => `
                <div class="preview-card">
                  <div class="row-main">
                    <div class="row-title">${esc(lk.label_vi)}</div>
                    <div class="mono row-meta">${esc(lk.url)}</div>
                  </div>
                  <a class="btn btn-xs btn-primary" href="${esc(resolveProjectPreviewHref(lk.url))}" target="_blank" rel="noopener noreferrer">${ico("external-link")}<span>Mở trực tiếp</span></a>
                </div>
              `).join("")}
            </div>
          ` : ""}

          <div class="split-2">
            <div class="card stack-sm">
              <h3 class="sec-title">Mục tiêu sản phẩm và Thị trường</h3>
              <p class="step-summary">${esc(sanitizeUiVietnamese(p.objective || "Chưa cập nhật mục tiêu chi tiết cho dự án này."))}</p>
              ${(p.target_market || finSummary.target_market) ? `<p class="row-meta">Thị trường mục tiêu: <strong>${esc(sanitizeUiVietnamese(p.target_market || finSummary.target_market))}</strong></p>` : ""}
              <p class="row-meta">Giá bán mục tiêu: <strong class="mono">${esc(vnd(p.expected_price_vnd || finSummary.expected_price_vnd || 0))} / tháng</strong></p>
              <p class="row-meta">Thư mục mã nguồn: <span class="mono">${esc(p.workspace_path || `corporate_hq/projects/${p.slug}`)}</span></p>
            </div>

            <div class="card stack-sm">
              <h3 class="sec-title">Nhiệm vụ 8 bước liên kết (${pMissions.length})</h3>
              ${pMissions.length ? `
                <div class="hairline-list">
                  ${pMissions.map((ms) => `
                    <div class="list-row">
                      <div class="row-main">
                        <div class="row-title">${esc(sanitizeUiVietnamese(ms.title))}</div>
                        <div class="row-meta">Tiến độ: ${ms.progress_pct || 0}%, Giai đoạn: ${ms.phase === "DELIVERED" ? "Đã bàn giao" : ms.phase === "PRODUCTION" ? "Sản xuất sản phẩm" : "Nghiên cứu chốt kèo"}</div>
                      </div>
                      <button type="button" class="btn btn-xs" data-open-mission="${esc(ms.mission_id)}">Mở tiến độ</button>
                    </div>
                  `).join("")}
                </div>
              ` : `<p class="row-meta">Chưa có nhiệm vụ 8 bước gắn với dự án này. Bấm Giao 9 Khối nâng cấp để khởi chạy ngay.</p>`}
            </div>
          </div>
        </div>
      `;
    } else if (subTab === "tasks") {
      subHtml = `
        <div class="section-block">
          <div class="sec-head">
            <h3 class="sec-title">Công việc dự án (${pTasks.length})</h3>
            <button type="button" class="btn btn-xs btn-primary" id="btn-proj-add-task">${ico("plus")}<span>Giao việc AI cho dự án này</span></button>
          </div>
          ${pTasks.length ? `
            <div class="hairline-list">
              ${pTasks.map((t) => `
                <div class="task-row-clean" data-open-task-drawer="${esc(t.task_id)}">
                  <div class="row-main">
                    <div class="row-title ${t.kanban_column === "DONE" ? "is-done" : ""}">${esc(sanitizeUiVietnamese(t.title))}</div>
                    <div class="row-meta">Phòng #${esc(t.assigned_dept_id)} (${esc(deptTitle(t.assigned_dept_id))}), Ưu tiên ${esc(PRIO_LABELS[t.priority] || "Cao")}</div>
                  </div>
                  <span class="badge badge-idle">${esc(COL_LABELS[t.kanban_column] || t.kanban_column)}</span>
                  <button type="button" class="btn btn-xs" data-open-task-drawer="${esc(t.task_id)}">Chi tiết</button>
                </div>
              `).join("")}
            </div>
          ` : `<div class="empty-state"><p>Dự án này chưa có công việc nào. Nhấn Giao việc AI cho dự án này để giao trực tiếp cho đội ngũ chuyên gia.</p></div>`}
        </div>
      `;
    } else if (subTab === "docs") {
      const df = state.projectDocFilter || "all";
      subHtml = `
        <div class="card stack-md">
          <div class="sec-head">
            <div class="action-group">
              <h3 class="sec-title">Tài liệu và Mã nguồn (${pFiles.length || m.filesSummary.total_files || 0} tệp)</h3>
              <div class="segmented" id="proj-doc-filter" role="tablist" aria-label="Lọc loại tệp dự án">
                <button type="button" class="seg-btn ${df === "all" ? "active" : ""}" role="tab" aria-selected="${df === "all" ? "true" : "false"}" data-doc-filter="all">Tất cả</button>
                <button type="button" class="seg-btn ${df === "doc" ? "active" : ""}" role="tab" aria-selected="${df === "doc" ? "true" : "false"}" data-doc-filter="doc">Tài liệu</button>
                <button type="button" class="seg-btn ${df === "code" ? "active" : ""}" role="tab" aria-selected="${df === "code" ? "true" : "false"}" data-doc-filter="code">Mã nguồn</button>
              </div>
            </div>
            <button type="button" class="btn btn-xs btn-primary" id="btn-new-doc">${ico("file-text")}<span>Tạo tài liệu mới</span></button>
          </div>
          <div class="split-2">
            <div class="hairline-list doc-tree-scroll" id="project-docs-list"></div>
            <div class="stack-sm">
              <div class="sec-head">
                <span class="doc-name-label" id="doc-current-name">Chưa chọn tệp</span>
                <div class="action-group" id="doc-editor-actions" hidden>
                  <button type="button" class="btn btn-xs" id="btn-toggle-doc-edit">Sửa nội dung</button>
                  <button type="button" class="btn btn-xs btn-primary is-hidden" id="btn-save-doc">Lưu tài liệu</button>
                  <button type="button" class="btn btn-xs btn-destructive" id="btn-delete-doc">${ico("trash")}<span>Xóa tệp</span></button>
                </div>
              </div>
              <div id="doc-pretty-view" class="doc-viewer rendered-md">Chọn một tệp tài liệu hoặc mã nguồn bên trái để xem hoặc chỉnh sửa.</div>
              <textarea id="doc-raw-editor" class="textarea mono doc-editor is-hidden" aria-label="Trình soạn thảo tài liệu và mã nguồn"></textarea>
            </div>
          </div>
        </div>
      `;
    } else if (subTab === "rework") {
      const isBlocked = openRwCnt > 0;
      subHtml = `
        <div class="rework-panel">
          <div class="rework-gate-banner ${isBlocked ? "is-blocked" : "is-pass"}">
            <div class="stack-xs">
              <div class="rework-gate-title">
                ${ico(isBlocked ? "alert-circle" : "shield-check")}
                <span>${isBlocked ? `Đang chặn chốt: còn ${openRwCnt} phiếu lỗi cần sửa` : "Đạt chốt 0 lỗi cho dự án này"}</span>
              </div>
              <p class="row-meta">Bộ Tứ chốt cuối Khối 9 (#53, #51, #52, #49) giám sát toàn bộ vòng đẩy trả sửa lỗi cho dự án này.</p>
            </div>
            <button type="button" class="btn btn-xs btn-destructive" id="btn-proj-add-rework">
              ${ico("rotate-ccw")}<span>Đẩy trả lỗi cho dự án này</span>
            </button>
          </div>
          ${pReworks.length
            ? pReworks.map(renderReworkTicketCardHtml).join("")
            : `<div class="empty-state"><p>Hiện dự án này không có phiếu sửa lỗi nào. Nếu phát hiện lỗi chức năng hoặc trải nghiệm, nhấn Đẩy trả lỗi cho dự án này.</p></div>`
          }
        </div>
      `;
    } else if (subTab === "media") {
      subHtml = renderProjectMediaPanel(p, pMedia);
    } else {
      // Subtab 5: Tài chính dự án (tóm tắt + nhảy sang Tab Tài chính đầy đủ)
      const actRev = Number(finSummary.actual_revenue_vnd ?? m.financeBrief.actual_revenue_vnd ?? 0);
      const actExp = Number(finSummary.actual_expense_vnd ?? m.financeBrief.actual_expense_vnd ?? 0);
      const actTax = Number(finSummary.actual_tax_vnd || 0);
      const actNet = Number(finSummary.actual_net_profit_vnd ?? m.financeBrief.actual_net_profit_vnd ?? (actRev - actExp - actTax));
      const planRev = Number(finSummary.plan_revenue_vnd ?? m.financeBrief.plan_revenue_vnd ?? 0);
      const planNet = Number(finSummary.plan_net_profit_vnd ?? m.financeBrief.plan_net_profit_vnd ?? 0);
      subHtml = `
        <div class="stack-md">
          <div class="hero-band">
            <div class="card card-lift hero-lead">
              <div class="hero-figure-wrap">
                <p class="eyebrow">Lãi ròng thực tế dự án</p>
                <p class="hero-figure ${actNet >= 0 ? "text-ok" : "text-err"}">${esc(vnd(actNet))}</p>
                <p class="hero-caption">Tính từ các bút toán Thu, Chi, Thuế thực tế đã ghi nhận trong Sổ Thu Chi.</p>
              </div>
              <div class="sub-metrics-row">
                <div>
                  <p class="eyebrow">Thu thực tế</p>
                  <p class="stat-value-md text-ok">${esc(vnd(actRev))}</p>
                </div>
                <div>
                  <p class="eyebrow">Chi thực tế</p>
                  <p class="stat-value-md">${esc(vnd(actExp))}</p>
                </div>
                <div>
                  <p class="eyebrow">Dự phòng thuế</p>
                  <p class="stat-value-md">${esc(vnd(actTax))}</p>
                </div>
              </div>
            </div>

            <div class="estimate-card hero-aside-card-grow">
              <div class="stack-sm">
                <span class="badge badge-idle">Kế hoạch dự toán</span>
                <div class="list-row-pair"><span>Doanh thu dự toán</span><strong class="mono">${esc(vnd(planRev))}</strong></div>
                <div class="list-row-pair"><span>Lãi ròng dự toán</span><strong class="mono text-ok">${esc(vnd(planNet))}</strong></div>
                <div class="list-row-pair"><span>Điểm hòa vốn</span><strong class="mono">${finSummary.breakeven_customers || 0} khách</strong></div>
                <div class="list-row-pair"><span>Biên lãi gộp</span><strong class="mono">${Number(finSummary.gross_margin_pct || 0).toFixed(1)}%</strong></div>
              </div>
              <div class="rule"></div>
              <div class="action-group">
                <button type="button" class="btn btn-xs btn-primary" id="btn-proj-add-ledger">${ico("plus")}<span>Ghi nhận Thu hoặc Chi</span></button>
                <button type="button" class="btn btn-xs" data-open-proj-finance="${esc(p.project_id)}">${ico("bar-chart")}<span>Mở báo cáo tài chính đầy đủ</span></button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    root.innerHTML = `
      <div class="project-detail-backbar">
        <button type="button" class="btn btn-xs" id="btn-proj-back">
          ${ico("arrow-left")}<span>Danh sách dự án</span>
        </button>
        <span class="mono row-meta">Mã dự án: ${esc(p.project_id)}</span>
      </div>

      <div class="card stack-md">
        <div class="toolbar-row">
          <div class="row-main">
            <h2 class="mission-title">${esc(sanitizeUiVietnamese(p.title))}</h2>
            <p class="row-meta">Tiến độ công việc: <strong>${m.tasksSummary.done}/${m.tasksSummary.total} việc (${m.tasksSummary.progress_pct}%)</strong>, Tổng tệp: <strong>${pFiles.length || m.filesSummary.total_files || 0} tệp</strong></p>
          </div>
          <div class="action-group">
            <div class="listbox-field listbox-inline listbox-compact" data-dynamic-listbox="${esc(statusLbId)}">
              <input type="hidden" value="${esc(p.status || "ACTIVE")}" />
              <button type="button" class="listbox-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="lb-${esc(statusLbId)}" aria-label="Đổi trạng thái dự án">
                <span class="listbox-value">${esc(PROJECT_STATUS_LABELS[p.status] || "Đang phát triển")}</span>
                ${ico("chevron-down", "ico-xs listbox-chevron")}
              </button>
              <ul class="listbox-menu" id="lb-${esc(statusLbId)}" role="listbox" tabindex="-1" hidden></ul>
            </div>
            ${pv.appUrl ? `<a class="btn btn-xs" href="${esc(resolveProjectPreviewHref(pv.appUrl))}" target="_blank" rel="noopener noreferrer">${ico("external-link")}<span>Mở Ứng dụng Live</span></a>` : ""}
            ${pv.landingUrl ? `<a class="btn btn-xs" href="${esc(resolveProjectPreviewHref(pv.landingUrl))}" target="_blank" rel="noopener noreferrer">${ico("book-open")}<span>Trang bán hàng</span></a>` : ""}
            <button type="button" class="btn btn-xs btn-primary" data-open-proj-upgrade="${esc(p.project_id)}">${ico("zap")}<span>Giao 9 Khối nâng cấp</span></button>
            <button type="button" class="btn btn-xs" data-edit-proj="${esc(p.project_id)}">${ico("pencil")}<span>Sửa dự án</span></button>
            <button type="button" class="btn btn-xs btn-destructive" data-del-proj="${esc(p.project_id)}">${ico("trash")}<span>Xóa dự án</span></button>
          </div>
        </div>

        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.tasksSummary.progress_pct}">
          <div class="progress-fill" style="inline-size:${Math.max(4, m.tasksSummary.progress_pct)}%;"></div>
        </div>

        <div class="segmented" role="tablist" aria-label="6 phân mục quản trị chi tiết dự án">
          <button type="button" class="seg-btn ${subTab === "overview" ? "active" : ""}" role="tab" aria-selected="${subTab === "overview" ? "true" : "false"}" data-pdet-tab="overview">Tổng quan và Sản phẩm</button>
          <button type="button" class="seg-btn ${subTab === "tasks" ? "active" : ""}" role="tab" aria-selected="${subTab === "tasks" ? "true" : "false"}" data-pdet-tab="tasks">Công việc dự án (${pTasks.length})</button>
          <button type="button" class="seg-btn ${subTab === "docs" ? "active" : ""}" role="tab" aria-selected="${subTab === "docs" ? "true" : "false"}" data-pdet-tab="docs">Tài liệu và Mã nguồn (${pFiles.length || m.filesSummary.total_files || 0})</button>
          <button type="button" class="seg-btn ${subTab === "rework" ? "active" : ""}" role="tab" aria-selected="${subTab === "rework" ? "true" : "false"}" data-pdet-tab="rework">Lỗi và Kiểm định Khối 9 (${pReworks.length})</button>
          <button type="button" class="seg-btn ${subTab === "finance" ? "active" : ""}" role="tab" aria-selected="${subTab === "finance" ? "true" : "false"}" data-pdet-tab="finance">Tài chính dự án</button>
          <button type="button" class="seg-btn ${subTab === "media" ? "active" : ""}" role="tab" aria-selected="${subTab === "media" ? "true" : "false"}" data-pdet-tab="media">Truyền thông và Video AI (${pMedia.length})</button>
        </div>
      </div>

      ${subHtml}
    `;

    const backBtn = document.getElementById("btn-proj-back");
    if (backBtn) {
      backBtn.onclick = () => {
        state.selectedProjectId = "";
        state.projectDetail = null;
        renderProjectsTab();
      };
    }

    const stWrap = root.querySelector(`[data-dynamic-listbox="${statusLbId}"]`);
    if (stWrap) {
      const ctrl = setupListboxElement(stWrap, statusLbId, async (newStatus) => {
        await api(`/api/projects/${encodeURIComponent(p.project_id)}`, "PATCH", { status: newStatus });
        await loadEverything();
        await loadProjectDetail(p.project_id);
        toast(`Đã chuyển trạng thái dự án sang ${PROJECT_STATUS_LABELS[newStatus] || newStatus}.`);
      });
      if (ctrl) {
        ctrl.setOptions(Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label })), false);
        ctrl.setValue(p.status || "ACTIVE", true);
      }
    }

    root.querySelectorAll("[data-pdet-tab]").forEach((btn) => {
      btn.onclick = () => {
        state.projectDetailSubTab = btn.getAttribute("data-pdet-tab") || "overview";
        renderProjectsTab();
      };
    });

    if (subTab === "tasks") {
      const addTaskBtn = document.getElementById("btn-proj-add-task");
      if (addTaskBtn) addTaskBtn.onclick = () => openNewTaskModal("BACKLOG", p.project_id);
    } else if (subTab === "docs") {
      root.querySelectorAll("#proj-doc-filter [data-doc-filter]").forEach((b) => {
        b.onclick = () => {
          state.projectDocFilter = b.getAttribute("data-doc-filter") || "all";
          renderProjectsTab();
        };
      });
      bindDocEditorEvents(p.project_id);
      loadProjectDocs(p.project_id, true, pFiles.length ? pFiles : null);
    } else if (subTab === "rework") {
      const addRwBtn = document.getElementById("btn-proj-add-rework");
      if (addRwBtn) addRwBtn.onclick = () => openReworkModal({ projectId: p.project_id, missionId: (pMissions[0] && pMissions[0].mission_id) || "" });
    } else if (subTab === "media") {
      const addMediaBtn = document.getElementById("btn-proj-add-media");
      if (addMediaBtn) addMediaBtn.onclick = () => openMediaCampaignModal(p.project_id);

      root.querySelectorAll("[data-media-status-lb]").forEach((lbWrap) => {
        const lbId = lbWrap.getAttribute("data-media-status-lb");
        const campId = lbWrap.getAttribute("data-campaign-id");
        const curVal = lbWrap.querySelector("input[type='hidden']")?.value || "FLOW_READY";
        const ctrl = setupListboxElement(lbWrap, lbId, async (newStatus) => {
          await api(`/api/media/campaigns/${encodeURIComponent(campId)}`, "PATCH", { status: newStatus });
          await loadEverything();
          await loadProjectDetail(p.project_id);
          toast(`Đã cập nhật trạng thái chiến dịch sang ${MEDIA_STATUS_LABELS[newStatus] || newStatus}.`);
        });
        if (ctrl) {
          ctrl.setOptions(Object.entries(MEDIA_STATUS_LABELS).map(([value, label]) => ({ value, label })), false);
          ctrl.setValue(curVal, true);
        }
      });

      root.querySelectorAll("[data-copy-open-flow]").forEach((fb) => {
        fb.onclick = () => {
          const promptTxt = fb.getAttribute("data-flow-prompt") || "";
          const sceneCnt = Number(fb.getAttribute("data-scene-count") || 0);
          const flowUrl = fb.getAttribute("data-flow-url") || "https://flow.google.com/";
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(promptTxt).catch(() => {});
          }
          window.open(flowUrl, "_blank", "noopener,noreferrer");
          toast(
            sceneCnt > 0
              ? `Đã sao chép đủ ${sceneCnt} cảnh Google Flow và mở flow.google.com!`
              : "Đã sao chép kịch bản Google Flow và mở flow.google.com!"
          );
        };
      });

      root.querySelectorAll("[data-render-flow]").forEach((rb) => {
        rb.onclick = () => withLock(rb, async () => {
          const cid = rb.getAttribute("data-render-flow");
          if (!cid) return;
          const res = await api(`/api/media/campaigns/${encodeURIComponent(cid)}/render-flow`, "POST", {});
          await loadEverything();
          await loadProjectDetail(p.project_id);
          const msg = sanitizeUiVietnamese(
            (res && res.message) ||
            (res && res.bridge_online
              ? "Đã gửi lệnh mở Google Flow sang Trình duyệt AI trực tuyến để dựng video."
              : "Đã xếp lệnh dựng Video AI Google Flow vào hàng đợi trực tuyến cho Phòng #27 và #25.")
          );
          toast(msg);
        });
      });

      root.querySelectorAll("[data-copy-text]").forEach((cb) => {
        cb.onclick = async () => {
          const txt = cb.getAttribute("data-copy-text") || "";
          const msg = cb.getAttribute("data-copy-label") || "Đã sao chép vào bộ nhớ tạm.";
          try {
            await navigator.clipboard.writeText(txt);
            toast(msg);
          } catch (_e) {
            toast("Trình duyệt chặn sao chép tự động, vui lòng bôi đen văn bản để sao chép.");
          }
        };
      });

      root.querySelectorAll(".media-thumb-img").forEach((img) => {
        img.onerror = () => {
          const wrap = img.closest(".media-thumb-wrap");
          const top = img.closest(".media-campaign-top");
          if (wrap) wrap.classList.add("is-hidden");
          if (top) top.classList.remove("has-thumb");
        };
      });

      root.querySelectorAll("[data-del-media]").forEach((db) => {
        db.onclick = () => withLock(db, async () => {
          const cid = db.getAttribute("data-del-media");
          await api(`/api/media/campaigns/${encodeURIComponent(cid)}`, "DELETE");
          await loadEverything();
          await loadProjectDetail(p.project_id);
          toast("Đã xóa chiến dịch Video AI.");
        });
      });
    } else if (subTab === "finance") {
      const addLdgBtn = document.getElementById("btn-proj-add-ledger");
      if (addLdgBtn) addLdgBtn.onclick = () => openLedgerModal(p.project_id, null);
    }

    bindQuickActions(root);
  }

  // -------------------------------------------------------------------------
  // 11. TAB 7: TAI CHINH TOAN TAP DOAN VA TUNG DU AN (TAP TRUNG 100% TAI CHINH)
  // -------------------------------------------------------------------------
  async function loadActiveProjectFinance(pid) {
    if (!pid) {
      state.activeProjectFinance = null;
      return;
    }
    try {
      const res = await api(`/api/projects/${encodeURIComponent(pid)}/finance`);
      if (res && res.summary) {
        state.activeProjectFinance = res;
      } else {
        state.activeProjectFinance = computeProjectFinanceFallback(pid);
      }
    } catch (_e) {
      state.activeProjectFinance = computeProjectFinanceFallback(pid);
    }
    if (state.tab === "finance") renderFinanceTabBody();
  }

  function renderFinanceTab() {
    const bar = document.getElementById("finance-project-bar");
    const isCorp = !state.financeViewProjectId;
    bar.innerHTML = [
      `<button type="button" class="chip-btn ${isCorp ? "active" : ""}" role="tab" aria-selected="${isCorp ? "true" : "false"}" data-fin-proj="">${ico("bar-chart")}<span>Tổng hợp toàn tập đoàn</span></button>`,
      ...state.projects.map((p) => {
        const on = state.financeViewProjectId === p.project_id;
        return `<button type="button" class="chip-btn ${on ? "active" : ""}" role="tab" aria-selected="${on ? "true" : "false"}" data-fin-proj="${esc(p.project_id)}">${ico("folder")}<span>${esc(sanitizeUiVietnamese(p.title))}</span></button>`;
      })
    ].join("");

    bar.querySelectorAll("[data-fin-proj]").forEach((btn) => {
      btn.onclick = async () => {
        const pid = btn.getAttribute("data-fin-proj");
        state.financeViewProjectId = pid;
        state.currentDocFile = "";
        state.docEditMode = false;
        renderFinanceTab();
        if (pid) await loadActiveProjectFinance(pid);
      };
    });

    if (state.financeViewProjectId && (!state.activeProjectFinance || state.activeProjectFinance.project?.project_id !== state.financeViewProjectId)) {
      state.activeProjectFinance = computeProjectFinanceFallback(state.financeViewProjectId);
      loadActiveProjectFinance(state.financeViewProjectId);
    }
    renderFinanceTabBody();
  }

  function renderFinanceTabBody() {
    const body = document.getElementById("finance-workspace-body");
    if (!state.financeViewProjectId) {
      const corp = computeCorporateFinanceFallback();
      const projRows = corp.projects || [];
      const netCls = Number(corp.actual_net_profit_vnd || 0) >= 0 ? "text-ok" : "text-err";

      body.innerHTML = `
        <div class="hero-band">
          <div class="card card-lift hero-lead">
            <div class="hero-figure-wrap">
              <p class="eyebrow">Lãi ròng thực tế toàn tập đoàn</p>
              <p class="hero-figure ${netCls}">${esc(vnd(corp.actual_net_profit_vnd || 0))}</p>
              <p class="hero-caption">Chỉ tính từ các bút toán thực tế đã ghi nhận trong sổ thu chi (không cộng gộp khoản dự toán kế hoạch).</p>
            </div>
            <div class="rule"></div>
            <div>
              <p class="eyebrow">So sánh tài chính giữa các dự án</p>
              ${buildCorpComparisonSvg(projRows)}
            </div>
          </div>

          <div class="hero-aside-stack">
            <div class="card">
              <div>
                <p class="eyebrow">Tổng thu thực tế</p>
                <p class="stat-value-md text-ok">${esc(vnd(corp.actual_revenue_vnd || 0))}</p>
              </div>
              <div class="rule"></div>
              <div>
                <p class="eyebrow">Tổng chi thực tế</p>
                <p class="stat-value-md">${esc(vnd(corp.actual_expense_vnd || 0))}</p>
              </div>
            </div>

            <div class="estimate-card hero-aside-card-grow">
              <div>
                <span class="badge badge-idle">Kế hoạch dự toán</span>
                <p class="eyebrow" style="margin-block-start:var(--space-2);">Dự toán doanh thu kế hoạch</p>
                <p class="stat-value-md">${esc(vnd(corp.plan_revenue_vnd || 0))}</p>
                <p class="row-meta">Lãi ròng dự toán: <strong>${esc(vnd(corp.plan_net_profit_vnd || 0))}</strong></p>
              </div>
              <p class="row-meta">Số liệu dự toán luôn tách biệt rõ khỏi tiền mặt thực thu.</p>
            </div>
          </div>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <caption>Bảng tổng hợp Danh mục Dự án toàn tập đoàn</caption>
            <thead>
              <tr>
                <th scope="col">Tên dự án</th>
                <th scope="col">Trạng thái</th>
                <th scope="col" class="num">Tiến độ việc</th>
                <th scope="col" class="num">Thu thực tế</th>
                <th scope="col" class="num">Chi thực tế</th>
                <th scope="col" class="num">Lãi ròng thực tế</th>
                <th scope="col" class="num">Hòa vốn</th>
                <th scope="col">Quản trị</th>
              </tr>
            </thead>
            <tbody>
              ${projRows.length ? projRows.map((p) => `
                <tr>
                  <td><strong>${esc(sanitizeUiVietnamese(p.title))}</strong></td>
                  <td><span class="badge badge-idle">${esc(PROJECT_STATUS_LABELS[p.status] || "Đang triển khai")}</span></td>
                  <td class="num">${p.progress_pct || 0}% (${p.tasks_done || 0}/${p.tasks_total || 0})</td>
                  <td class="num text-ok">${esc(vnd(p.actual_revenue_vnd || 0))}</td>
                  <td class="num">${esc(vnd(p.actual_expense_vnd || 0))}</td>
                  <td class="num ${Number(p.actual_net_profit_vnd || 0) >= 0 ? "text-ok" : "text-err"}"><strong>${esc(vnd(p.actual_net_profit_vnd || 0))}</strong></td>
                  <td class="num">${p.breakeven_customers || 0} khách</td>
                  <td>
                    <div class="action-group">
                      <button type="button" class="btn btn-xs" data-fin-inspect="${esc(p.project_id)}">Báo cáo tài chính</button>
                      <button type="button" class="btn btn-xs btn-primary" data-open-proj="${esc(p.project_id)}">Quản lý dự án</button>
                    </div>
                  </td>
                </tr>
              `).join("") : `<tr><td colspan="8" class="row-meta">Chưa có dự án nào. Bấm Tạo dự án mới ở góc trên bên phải.</td></tr>`}
            </tbody>
          </table>
        </div>
      `;

      body.querySelectorAll("[data-fin-inspect]").forEach((btn) => {
        btn.onclick = async () => {
          const pid = btn.getAttribute("data-fin-inspect");
          state.financeViewProjectId = pid;
          renderFinanceTab();
          await loadActiveProjectFinance(pid);
        };
      });
      bindQuickActions(body);
      return;
    }

    // Specific Project Financial Workspace (100% focused on P&L, Ledger, Charts, Simulator)
    const data = state.activeProjectFinance || computeProjectFinanceFallback(state.financeViewProjectId);
    if (!data || !data.project) {
      state.financeViewProjectId = "";
      renderFinanceTab();
      return;
    }

    const p = data.project;
    const s = data.summary || {};
    const ledger = data.ledger || [];
    const actNet = Number(s.actual_net_profit_vnd || 0);

    body.innerHTML = `
      <div class="card stack-md">
        <div class="toolbar-row">
          <div class="row-main">
            <h2 class="mission-title">${esc(sanitizeUiVietnamese(p.title))}</h2>
            <p class="row-meta">Trạng thái: <strong>${esc(PROJECT_STATUS_LABELS[p.status] || "Đang phát triển")}</strong>, Tiến độ công việc: <strong>${s.tasks_done || 0}/${s.tasks_total || 0} việc (${s.progress_pct || 0}%)</strong></p>
          </div>
          <div class="action-group">
            <button type="button" class="btn btn-xs btn-primary" data-open-proj="${esc(p.project_id)}">${ico("folder")}<span>Mở quản lý dự án</span></button>
            <button type="button" class="btn btn-xs" data-edit-proj="${esc(p.project_id)}">${ico("pencil")}<span>Sửa dự án</span></button>
            <button type="button" class="btn btn-xs btn-destructive" data-del-proj="${esc(p.project_id)}">${ico("trash")}<span>Xóa dự án</span></button>
          </div>
        </div>
      </div>

      <div class="hero-band">
        <div class="card card-lift hero-lead">
          <div class="hero-figure-wrap">
            <p class="eyebrow">Lãi ròng thực tế dự án</p>
            <p class="hero-figure ${actNet >= 0 ? "text-ok" : "text-err"}">${esc(vnd(actNet))}</p>
            <p class="hero-caption">Tính từ toàn bộ bút toán Thực tế trong Sổ Thu Chi của dự án này.</p>
          </div>
          <div class="sub-metrics-row">
            <div>
              <p class="eyebrow">Tổng thu thực tế</p>
              <p class="stat-value-md text-ok">${esc(vnd(s.actual_revenue_vnd || 0))}</p>
            </div>
            <div>
              <p class="eyebrow">Tổng chi thực tế</p>
              <p class="stat-value-md">${esc(vnd(s.actual_expense_vnd || 0))}</p>
            </div>
            <div>
              <p class="eyebrow">Dự phòng thuế thực tế</p>
              <p class="stat-value-md">${esc(vnd(s.actual_tax_vnd || 0))}</p>
            </div>
          </div>
        </div>

        <div class="estimate-card hero-aside-card-grow">
          <div class="stack-sm">
            <span class="badge badge-idle">Kế hoạch dự toán (tách biệt thực tế)</span>
            <div class="list-row-pair"><span>Doanh thu dự toán</span><strong class="mono">${esc(vnd(s.plan_revenue_vnd || 0))}</strong></div>
            <div class="list-row-pair"><span>Chi phí dự toán</span><strong class="mono">${esc(vnd(s.plan_expense_vnd || 0))}</strong></div>
            <div class="list-row-pair"><span>Dự phòng thuế dự toán</span><strong class="mono">${esc(vnd(s.plan_tax_vnd || 0))}</strong></div>
            <div class="list-row-pair"><span>Lãi ròng dự toán</span><strong class="mono text-ok">${esc(vnd(s.plan_net_profit_vnd || 0))}</strong></div>
          </div>
          <div class="rule"></div>
          <div class="row-meta">Điểm hòa vốn: <strong>${s.breakeven_customers || 0} khách</strong>, Biên lãi gộp: <strong>${Number(s.gross_margin_pct || 0).toFixed(1)}%</strong></div>
        </div>
      </div>

      <div class="split-2">
        <div class="card">
          <div class="sec-head"><h3 class="sec-title">Thu, Chi và Dự phòng thuế theo tháng</h3></div>
          ${buildMonthlyGroupedBarSvg(s.monthly_series)}
        </div>
        <div class="card">
          <div class="sec-head"><h3 class="sec-title">Cơ cấu hạng mục chi phí và biên lãi</h3></div>
          ${buildCategoryBreakdownHtml(s.by_category, s.gross_margin_pct)}
        </div>
      </div>

      <div class="section-block">
        <div class="sec-head">
          <div>
            <h3 class="sec-title">Sổ Thu Chi Dự án (${ledger.length} bút toán)</h3>
            <p class="row-meta">Ghi nhận minh bạch từng khoản Thu, Chi, Thuế thực tế hoặc dự toán.</p>
          </div>
          <div class="action-group">
            <button type="button" class="btn btn-xs btn-primary" id="btn-add-ledger">${ico("plus")}<span>Ghi nhận Thu hoặc Chi</span></button>
            <button type="button" class="btn btn-xs" id="btn-export-ledger-csv">${ico("download")}<span>Xuất CSV</span></button>
            <button type="button" class="btn btn-xs" id="btn-print-report">${ico("printer")}<span>In báo cáo</span></button>
          </div>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <caption class="sr-only">Chi tiết sổ thu chi của dự án</caption>
            <thead>
              <tr>
                <th scope="col">Ngày</th>
                <th scope="col">Loại</th>
                <th scope="col">Hạng mục</th>
                <th scope="col">Nội dung</th>
                <th scope="col" class="num">Số tiền</th>
                <th scope="col">Tính chất</th>
                <th scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${ledger.length ? ledger.map((e) => {
                const meta = LEDGER_TYPE_LABELS[e.entry_type] || LEDGER_TYPE_LABELS.EXPENSE;
                return `
                  <tr>
                    <td class="mono">${esc(shortDate(e.entry_date))}</td>
                    <td><span class="badge ${meta.badge}">${meta.label}</span></td>
                    <td>${esc(sanitizeUiVietnamese(e.category))}</td>
                    <td>
                      <div><strong>${esc(sanitizeUiVietnamese(e.title))}</strong></div>
                      ${e.note ? `<div class="row-meta">${esc(sanitizeUiVietnamese(e.note))}</div>` : ""}
                    </td>
                    <td class="num ${e.entry_type === "REVENUE" ? "text-ok" : ""}"><strong>${meta.sign}${esc(vnd(e.amount_vnd))}</strong></td>
                    <td><span class="badge ${e.is_estimate ? "badge-idle" : "badge-run"}">${e.is_estimate ? "Dự toán" : "Thực tế"}</span></td>
                    <td>
                      <div class="action-group">
                        <button type="button" class="btn btn-xs" data-edit-ledger="${esc(e.entry_id)}">Sửa</button>
                        <button type="button" class="btn btn-xs btn-destructive" data-del-ledger="${esc(e.entry_id)}">Xóa</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("") : `<tr><td colspan="7" class="row-meta">Chưa có bút toán nào trong sổ thu chi dự án này. Nhấn Ghi nhận Thu hoặc Chi để thêm.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <details class="details-box">
        <summary>Mô phỏng định giá và điểm hòa vốn cho dự án này</summary>
        <div class="details-body">
          <div class="form-grid-4">
            <div class="form-field">
              <label for="sim-price">Giá bán dự kiến (VNĐ/tháng)</label>
              <input type="number" class="input mono" id="sim-price" min="0" step="10000" value="${Number(s.expected_price_vnd || 249000)}" />
            </div>
            <div class="form-field">
              <label for="sim-unit">Chi phí biến đổi mỗi khách (VNĐ)</label>
              <input type="number" class="input mono" id="sim-unit" min="0" step="5000" value="${Number(s.unit_cost_vnd || 55000)}" />
            </div>
            <div class="form-field">
              <label for="sim-fixed">Chi phí cố định hàng tháng (VNĐ)</label>
              <input type="number" class="input mono" id="sim-fixed" min="0" step="100000" value="${Number(s.fixed_cost_monthly_vnd || 1500000)}" />
            </div>
            <div class="form-field">
              <label for="sim-tax">Tỷ lệ dự phòng thuế (%)</label>
              <input type="number" class="input mono" id="sim-tax" min="0" max="50" step="0.5" value="7" />
            </div>
          </div>
          <div class="sim-summary-strip mono" id="sim-live-output"></div>
          <div class="action-group">
            <button type="button" class="btn btn-primary" id="btn-save-proj-pricing">${ico("check")}<span>Lưu định giá vào dự án</span></button>
          </div>
        </div>
      </details>
    `;

    const addLdgBtn = document.getElementById("btn-add-ledger");
    if (addLdgBtn) addLdgBtn.onclick = () => openLedgerModal(p.project_id, null);

    const csvBtn = document.getElementById("btn-export-ledger-csv");
    if (csvBtn) csvBtn.onclick = () => exportLedgerCsv(p.title, ledger);

    const printBtn = document.getElementById("btn-print-report");
    if (printBtn) printBtn.onclick = () => window.print();

    body.querySelectorAll("[data-edit-ledger]").forEach((btn) => {
      btn.onclick = () => {
        const entry = ledger.find((x) => x.entry_id === btn.getAttribute("data-edit-ledger"));
        if (entry) openLedgerModal(p.project_id, entry);
      };
    });

    body.querySelectorAll("[data-del-ledger]").forEach((btn) => {
      btn.onclick = () => withLock(btn, async () => {
        const eid = btn.getAttribute("data-del-ledger");
        const backup = ledger.find((x) => x.entry_id === eid);
        await api(`/api/finance/ledger/${encodeURIComponent(eid)}`, "DELETE");
        await loadEverything();
        await loadActiveProjectFinance(p.project_id);
        toast("Đã xóa bút toán tài chính.", { entity_type: "ledger", entity_id: eid, backup });
      });
    });

    const recalcSim = () => {
      const price = Math.max(0, Number(document.getElementById("sim-price").value || 0));
      const unit = Math.max(0, Number(document.getElementById("sim-unit").value || 0));
      const fixed = Math.max(0, Number(document.getElementById("sim-fixed").value || 0));
      const taxPct = Math.max(0, Number(document.getElementById("sim-tax").value || 7));
      const grossPct = price > 0 ? ((price - unit) / price) * 100 : 0;
      const netUnit = price - unit - (price * taxPct) / 100;
      const be = netUnit > 0 ? Math.ceil(fixed / netUnit) : 0;
      const p50 = Math.round(netUnit * 50 - fixed);
      const p200 = Math.round(netUnit * 200 - fixed);
      const out = document.getElementById("sim-live-output");
      if (out) {
        out.innerHTML = `
          <span>Biên lãi gộp: <strong class="${grossPct >= 65 ? "text-ok" : "text-err"}">${grossPct.toFixed(1)}%</strong></span>
          <span>Hòa vốn: <strong>${be > 0 ? `${be} khách` : "Đang lỗ"}</strong></span>
          <span>Mốc 50 khách: <strong class="${p50 >= 0 ? "text-ok" : "text-err"}">${vnd(p50)}/tháng</strong></span>
          <span>Mốc 200 khách: <strong class="${p200 >= 0 ? "text-ok" : "text-err"}">${vnd(p200)}/tháng</strong></span>
        `;
      }
    };
    ["sim-price", "sim-unit", "sim-fixed", "sim-tax"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.oninput = recalcSim;
    });
    recalcSim();

    const savePricingBtn = document.getElementById("btn-save-proj-pricing");
    if (savePricingBtn) {
      savePricingBtn.onclick = () => withLock(savePricingBtn, async () => {
        await api(`/api/projects/${encodeURIComponent(p.project_id)}`, "PATCH", {
          expected_price_vnd: Number(document.getElementById("sim-price").value || 0),
          unit_cost_vnd: Number(document.getElementById("sim-unit").value || 0),
          fixed_cost_monthly_vnd: Number(document.getElementById("sim-fixed").value || 0)
        });
        await loadEverything();
        await loadActiveProjectFinance(p.project_id);
        toast("Đã lưu cấu hình định giá vào dự án.");
      });
    }

    bindQuickActions(body);
  }

  function openLedgerModal(pid, entry = null) {
    document.getElementById("ledger-modal-title").textContent = entry ? "Chỉnh sửa bút toán Thu hoặc Chi" : "Ghi nhận Thu hoặc Chi";
    document.getElementById("edit-ledger-id").value = entry ? entry.entry_id : "";
    document.getElementById("edit-ledger-pid").value = pid;
    setListboxValue("inp-ledger-type", entry ? entry.entry_type : "REVENUE", true);
    setListboxValue("inp-ledger-est", entry && entry.is_estimate ? "1" : "0", true);
    document.getElementById("inp-ledger-title").value = entry ? entry.title : "";
    document.getElementById("inp-ledger-amount").value = entry ? Number(entry.amount_vnd || 0) : "";
    document.getElementById("inp-ledger-date").value = (entry && entry.entry_date) ? entry.entry_date.slice(0, 10) : todayIso();
    document.getElementById("inp-ledger-category").value = entry ? (entry.category || "Vận hành") : "Vận hành";
    document.getElementById("inp-ledger-note").value = entry ? (entry.note || "") : "";
    openModal("modal-ledger");
  }

  function bindDocEditorEvents(pid) {
    const newDocBtn = document.getElementById("btn-new-doc");
    if (newDocBtn) {
      newDocBtn.onclick = () => {
        document.getElementById("form-doc").reset();
        openModal("modal-doc");
      };
    }
    const togBtn = document.getElementById("btn-toggle-doc-edit");
    if (togBtn) {
      togBtn.onclick = () => {
        state.docEditMode = !state.docEditMode;
        document.getElementById("doc-pretty-view").classList.toggle("is-hidden", state.docEditMode);
        document.getElementById("doc-raw-editor").classList.toggle("is-hidden", !state.docEditMode);
        document.getElementById("btn-save-doc").classList.toggle("is-hidden", !state.docEditMode);
        togBtn.textContent = state.docEditMode ? "Xem bản trình bày" : "Sửa nội dung";
      };
    }
    const saveBtn = document.getElementById("btn-save-doc");
    if (saveBtn) {
      saveBtn.onclick = () => withLock(saveBtn, async () => {
        if (!pid || !state.currentDocFile) return;
        const content = document.getElementById("doc-raw-editor").value;
        await api(`/api/projects/${encodeURIComponent(pid)}/files`, "POST", { file: state.currentDocFile, content });
        await openDocFile(pid, state.currentDocFile);
        toast("Đã lưu tài liệu.");
      });
    }
    const delBtn = document.getElementById("btn-delete-doc");
    if (delBtn) {
      delBtn.onclick = () => withLock(delBtn, async () => {
        if (!pid || !state.currentDocFile) return;
        const deletedFile = state.currentDocFile;
        const res = await api(`/api/projects/${encodeURIComponent(pid)}/files?file=${encodeURIComponent(deletedFile)}`, "DELETE");
        state.currentDocFile = "";
        await loadProjectDocs(pid, false);
        toast(`Đã xóa tệp ${deletedFile}.`, res.entity_id ? { entity_type: "doc", entity_id: res.entity_id } : null);
      });
    }
  }

  function resetDocViewer() {
    state.currentDocFile = "";
    state.docEditMode = false;
    const nameEl = document.getElementById("doc-current-name");
    const actEl = document.getElementById("doc-editor-actions");
    const pvEl = document.getElementById("doc-pretty-view");
    const edEl = document.getElementById("doc-raw-editor");
    if (nameEl) nameEl.textContent = "Chưa chọn tài liệu";
    if (actEl) actEl.hidden = true;
    if (pvEl) { pvEl.innerHTML = "Chọn hoặc tạo một tài liệu mới để xem nội dung tại đây."; pvEl.classList.remove("is-hidden"); }
    if (edEl) edEl.classList.add("is-hidden");
  }

  async function loadProjectDocs(pid, keepCurrentFile = true, preloadedFiles = null) {
    const dBox = document.getElementById("project-docs-list");
    if (!dBox) return;
    if (!pid || (state.staticMode && !preloadedFiles)) {
      dBox.innerHTML = `<div class="list-row"><span class="row-meta">Tài liệu và mã nguồn sẽ tải tự động khi kênh trực tuyến đang mở.</span></div>`;
      return;
    }
    try {
      let allFiles = Array.isArray(preloadedFiles) ? preloadedFiles : [];
      if (!allFiles.length && !state.staticMode) {
        const res = await api(`/api/projects/${encodeURIComponent(pid)}/files`);
        allFiles = res.files || [];
      }
      const docExts = new Set([".md", ".txt", ".pdf", ".csv", ".doc", ".docx", ".rtf"]);
      const df = state.projectDocFilter || "all";
      const files = allFiles.filter((f) => {
        if (df === "all") return true;
        const cat = f.category || (docExts.has(String(f.ext || "").toLowerCase()) ? "doc" : "code");
        return cat === df;
      });
      if (!files.length) {
        dBox.innerHTML = `<div class="list-row"><span class="row-meta">Không có tệp nào trong nhóm lọc này. Thử chuyển sang Tất cả hoặc nhấn Tạo tài liệu mới.</span></div>`;
        resetDocViewer();
        return;
      }
      dBox.innerHTML = files.map((f) => `
        <div class="list-row list-row-pair clickable ${f.path === state.currentDocFile ? "is-selected" : ""}" data-open-doc="${esc(f.path)}">
          <span class="mono row-title">${esc(f.path)}</span>
          <span class="mono row-meta">${Math.max(1, Math.round((f.size_bytes || 0) / 1024))} KB</span>
        </div>
      `).join("");
      dBox.querySelectorAll("[data-open-doc]").forEach((r) => {
        r.onclick = () => openDocFile(pid, r.getAttribute("data-open-doc"));
      });
      const targetPath = keepCurrentFile && files.some((x) => x.path === state.currentDocFile)
        ? state.currentDocFile
        : files[0].path;
      await openDocFile(pid, targetPath);
    } catch (_e) {}
  }

  async function openDocFile(pid, filePath) {
    try {
      const doc = await api(`/api/projects/${encodeURIComponent(pid)}/files?file=${encodeURIComponent(filePath)}`);
      state.currentDocFile = filePath;
      state.docEditMode = false;
      const nameEl = document.getElementById("doc-current-name");
      const actEl = document.getElementById("doc-editor-actions");
      const rawEl = document.getElementById("doc-raw-editor");
      const pvEl = document.getElementById("doc-pretty-view");
      const saveEl = document.getElementById("btn-save-doc");
      const togEl = document.getElementById("btn-toggle-doc-edit");
      if (nameEl) nameEl.textContent = filePath;
      if (actEl) actEl.hidden = false;
      if (rawEl) { rawEl.value = doc.content || ""; rawEl.classList.add("is-hidden"); }
      if (pvEl) {
        const isMd = /\.(md|markdown|txt)$/i.test(filePath);
        pvEl.innerHTML = isMd
          ? renderCleanMarkdown(doc.content || "")
          : `<pre class="mono">${esc(doc.content || "")}</pre>`;
        pvEl.classList.remove("is-hidden");
      }
      if (saveEl) saveEl.classList.add("is-hidden");
      if (togEl) togEl.textContent = "Sửa nội dung";
      document.querySelectorAll("#project-docs-list [data-open-doc]").forEach((row) => {
        row.classList.toggle("is-selected", row.getAttribute("data-open-doc") === filePath);
      });
    } catch (_e) {}
  }

  // -------------------------------------------------------------------------
  // 12. QUICK ACTIONS, BULK BAR & MODALS
  // -------------------------------------------------------------------------
  function openMissionInProgress(missionId) {
    if (!missionId) {
      state.progressCat = "missions";
      switchTab("missions");
      return;
    }
    closeDrawer();
    closeModals();
    state.progressCat = "missions";
    state.progressExpandedLimit.missions = true;
    const searchEl = document.getElementById("progress-search-input");
    if (searchEl) searchEl.value = "";
    setListboxValue("filter-progress-status", "", true);
    state.openMissions.add(missionId);
    switchTab("missions");
    setTimeout(() => {
      const el = document.querySelector(`[data-mission-card="${missionId}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function openTaskInBoard(taskId) {
    closeDrawer();
    closeModals();
    switchTab("tasks");
    if (taskId) {
      setTimeout(() => openTaskDrawer(taskId), 40);
    }
  }

  async function openProjectInFinance(projectId) {
    if (!projectId) {
      switchTab("finance");
      return;
    }
    closeDrawer();
    closeModals();
    state.financeViewProjectId = projectId;
    state.projectSubTab = "finance";
    switchTab("finance");
    await loadActiveProjectFinance(projectId);
  }

  function bindQuickActions(root) {
    root.querySelectorAll("[data-open-staff]").forEach((el) => {
      el.onclick = (e) => {
        if (e.target.closest("button:not([data-open-staff])")) return;
        e.stopPropagation();
        openStaffDrawer(el.getAttribute("data-open-staff"));
      };
      if (el.tagName !== "BUTTON") {
        el.onkeydown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
            if (e.target.closest("button")) return;
            e.preventDefault();
            openStaffDrawer(el.getAttribute("data-open-staff"));
          }
        };
      }
    });

    root.querySelectorAll("[data-open-task-drawer]").forEach((el) => {
      el.onclick = (e) => { e.stopPropagation(); openTaskDrawer(el.getAttribute("data-open-task-drawer")); };
    });

    root.querySelectorAll("[data-open-mission]").forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        openMissionInProgress(el.getAttribute("data-open-mission"));
      };
    });

    root.querySelectorAll("[data-open-task-jump]").forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        openTaskInBoard(el.getAttribute("data-open-task-jump"));
      };
    });

    root.querySelectorAll("[data-jump-progress-cat]").forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        closeDrawer();
        state.progressCat = el.getAttribute("data-jump-progress-cat") || "all";
        switchTab("missions");
      };
    });

    root.querySelectorAll("[data-open-rework-modal]").forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        const mid = el.getAttribute("data-open-rework-modal") || "";
        const msn = state.missions.find((x) => x.mission_id === mid);
        openReworkModal({ missionId: mid, projectId: (msn && msn.project_id) || "" });
      };
    });

    root.querySelectorAll("[data-open-rework-for-dept]").forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        const deptId = el.getAttribute("data-open-rework-for-dept") || "13";
        openReworkModal({ targetDeptId: deptId });
      };
    });

    root.querySelectorAll("[data-open-org-sop]").forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        const sub = el.getAttribute("data-open-org-sop") || "sop";
        openOrgSopModal(sub);
      };
    });

    root.querySelectorAll("[data-open-handoff-peer]").forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        const fromId = el.getAttribute("data-open-handoff-peer") || "00";
        openHandoffModal({ actionKind: "CREATE", mode: "PEER_HANDOFF", fromDeptId: fromId });
      };
    });

    root.querySelectorAll("[data-open-handoff-ceo]").forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        const fromId = el.getAttribute("data-open-handoff-ceo") || "00";
        openHandoffModal({ actionKind: "CREATE", mode: "CEO_ESCALATION", fromDeptId: fromId });
      };
    });

    root.querySelectorAll("[data-ceo-reroute-handoff]").forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        const hoId = el.getAttribute("data-ceo-reroute-handoff") || "";
        if (!hoId) return;
        openHandoffModal({ actionKind: "REROUTE", handoffId: hoId });
      };
    });

    root.querySelectorAll("[data-handoff-status]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const [hoId, nextStatus] = String(btn.getAttribute("data-handoff-status") || "").split(":");
        if (!hoId || !nextStatus) return;
        withLock(btn, async () => {
          await api(`/api/handoffs/${encodeURIComponent(hoId)}`, "PATCH", {
            status: nextStatus,
            ceo_note_vi: nextStatus === "COMPLETED" ? "Đã xác nhận hoàn tất yêu cầu chuyển việc." : ""
          });
          await loadEverything();
          if (document.getElementById("inspector-drawer")?.classList.contains("open") && state.activeStaffDrawerDeptId) {
            openStaffDrawer(state.activeStaffDrawerDeptId);
          }
          toast("Đã đánh dấu hoàn tất phiếu chuyển việc.");
        });
      };
    });

    root.querySelectorAll("[data-rework-action]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const [ticketId, nextStatus] = String(btn.getAttribute("data-rework-action") || "").split(":");
        if (!ticketId || !nextStatus) return;
        withLock(btn, async () => {
          const payload = { status: nextStatus };
          if (nextStatus === "FIXED_PENDING_RECHECK") {
            payload.fix_note_vi = "Phòng ban phụ trách đã sửa lỗi và gửi Khối 9 kiểm định lại.";
          } else if (nextStatus === "VERIFIED_CLOSED") {
            payload.recheck_note_vi = "Khối 9 đã kiểm định lại đạt chuẩn 0 lỗi.";
          } else if (nextStatus === "OPEN") {
            payload.recheck_note_vi = "Kiểm lại vẫn còn thiếu sót, đẩy trả phòng phụ trách tiếp tục sửa.";
          }
          await api(`/api/rework/${encodeURIComponent(ticketId)}`, "PATCH", payload);
          await loadEverything();
          if (document.getElementById("inspector-drawer")?.classList.contains("open") && state.activeStaffDrawerDeptId) {
            openStaffDrawer(state.activeStaffDrawerDeptId);
          }
          const msg =
            nextStatus === "FIXED_PENDING_RECHECK" ? "Đã gửi báo sửa xong lên Khối 9 kiểm định lại." :
            nextStatus === "VERIFIED_CLOSED" ? "Khối 9 đã chốt đạt 0 lỗi cho phiếu này." :
            "Đã mở lại và đẩy trả phiếu lỗi về phòng phụ trách sửa tiếp.";
          toast(msg);
        });
      };
    });

    root.querySelectorAll("[data-goto-missions]").forEach((el) => {
      el.onclick = () => { state.progressCat = "missions"; switchTab("missions"); };
    });

    root.querySelectorAll("[data-goto-tab]").forEach((el) => {
      el.onclick = () => switchTab(el.getAttribute("data-goto-tab"));
    });

    root.querySelectorAll("[data-goto-news]").forEach((el) => {
      el.onclick = () => {
        state.newsSubView = el.getAttribute("data-goto-news") || "articles";
        switchTab("news");
      };
    });

    root.querySelectorAll("[data-trigger-learn-all]").forEach((b) => {
      b.onclick = () => triggerLearningScan("all", b);
    });

    root.querySelectorAll("[data-trigger-scan-opps]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        const res = await api("/api/opportunities/scan", "POST", {});
        await loadEverything();
        toast(sanitizeUiVietnamese((res && res.message) || "Đã gửi yêu cầu săn cơ hội kiếm tiền mới."));
      });
    });

    root.querySelectorAll("[data-accept-opp]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        const res = await api(`/api/opportunities/${encodeURIComponent(b.getAttribute("data-accept-opp"))}/accept`, "POST", {});
        await loadEverything();
        state.progressCat = "missions";
        switchTab("missions");
        toast(
          res && res.bridge_online
            ? "Đã chuyển cơ hội sang đội ngũ chuyên gia để triển khai ngay."
            : "Đã xếp cơ hội vào hàng đợi trực tuyến."
        );
      });
    });

    root.querySelectorAll("[data-copy-handoff]").forEach((b) => {
      b.onclick = async () => {
        const m = state.missions.find((x) => x.mission_id === b.getAttribute("data-copy-handoff"));
        if (!m) return;
        const cmd = buildHandoffCommand(m);
        try {
          await navigator.clipboard.writeText(cmd);
          toast("Đã sao chép lệnh điều phối vào bộ nhớ tạm.");
        } catch (_e) {
          toast(cmd);
        }
      };
    });

    root.querySelectorAll("[data-dispatch-task]").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        withLock(b, async () => {
          const tid = b.getAttribute("data-dispatch-task");
          const res = await api(`/api/tasks/${encodeURIComponent(tid)}/dispatch`, "POST", {});
          await loadEverything();
          toast(
            res && res.bridge_online
              ? "Đã giao đầu việc cho đội ngũ chuyên gia xử lý ngay."
              : "Đã đưa đầu việc vào hàng đợi trực tuyến."
          );
        });
      };
    });

    root.querySelectorAll("[data-edit-opp]").forEach((b) => {
      b.onclick = () => {
        const o = state.opportunities.find((x) => x.opp_id === b.getAttribute("data-edit-opp"));
        if (!o) return;
        document.getElementById("opp-modal-title").textContent = "Chỉnh sửa cơ hội kiếm tiền";
        document.getElementById("edit-opp-id").value = o.opp_id;
        document.getElementById("inp-opp-title").value = o.title;
        document.getElementById("inp-opp-cust").value = o.target_customer;
        document.getElementById("inp-opp-price").value = formatDotNumber(o.price_vnd || 399000);
        document.getElementById("inp-opp-margin").value = o.est_margin_pct;
        document.getElementById("inp-opp-pain").value = o.pain_point || o.critique_note || "";
        openModal("modal-opp");
      };
    });

    root.querySelectorAll("[data-del-opp]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        const oid = b.getAttribute("data-del-opp");
        const backup = state.opportunities.find((x) => x.opp_id === oid);
        await api(`/api/opportunities/${encodeURIComponent(oid)}`, "DELETE");
        await loadEverything();
        toast("Đã xóa đề xuất cơ hội.", { entity_type: "opportunity", entity_id: oid, backup });
      });
    });

    root.querySelectorAll("[data-open-proj]").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        openProjectWorkspace(b.getAttribute("data-open-proj"), "overview");
      };
    });

    root.querySelectorAll("[data-open-proj-upgrade]").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        openProjectUpgradeModal(b.getAttribute("data-open-proj-upgrade"));
      };
    });

    root.querySelectorAll("[data-open-proj-finance]").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        openProjectInFinance(b.getAttribute("data-open-proj-finance"));
      };
    });

    root.querySelectorAll("[data-msn-subtab]").forEach((b) => {
      b.onclick = () => {
        const [mid, view] = String(b.getAttribute("data-msn-subtab") || "").split(":");
        if (mid && view) {
          state.missionViewTabs[mid] = view;
          renderProgressTab();
        }
      };
    });

    root.querySelectorAll("[data-read-artifact]").forEach((b) => {
      b.onclick = () => openArtifactDrawer(b.getAttribute("data-read-artifact"));
    });

    root.querySelectorAll("[data-approve-msn]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        const res = await api(`/api/missions/${encodeURIComponent(b.getAttribute("data-approve-msn"))}/decision`, "POST", { decision: "APPROVE" });
        await loadEverything();
        if (res && res.phase === "PRODUCTION") {
          state.progressCat = "missions";
          switchTab("missions");
          toast("Đã duyệt chốt kèo. Đội ngũ đã nhận lệnh bắt đầu sản xuất sản phẩm cuối (Bước 5 đến 8).");
        } else {
          toast("Đã nghiệm thu Sản phẩm Cuối hoàn tất 100%.");
        }
      });
    });

    root.querySelectorAll("[data-reject-msn]").forEach((b) => {
      b.onclick = () => {
        document.getElementById("reject-modal-title").textContent = "Yêu cầu nhân viên làm lại nhiệm vụ";
        document.getElementById("reject-target-kind").value = "mission";
        document.getElementById("reject-target-id").value = b.getAttribute("data-reject-msn");
        document.getElementById("inp-reject-note").value = "";
        openModal("modal-reject");
      };
    });

    root.querySelectorAll("[data-pause-msn]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        await api(`/api/missions/${encodeURIComponent(b.getAttribute("data-pause-msn"))}`, "PATCH", { status: "PAUSED" });
        await loadEverything();
      });
    });

    root.querySelectorAll("[data-resume-msn]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        await api(`/api/missions/${encodeURIComponent(b.getAttribute("data-resume-msn"))}`, "PATCH", { status: "RUNNING" });
        await loadEverything();
      });
    });

    root.querySelectorAll("[data-edit-msn]").forEach((b) => {
      b.onclick = () => {
        const m = state.missions.find((x) => x.mission_id === b.getAttribute("data-edit-msn"));
        if (!m) return;
        document.getElementById("edit-msn-id").value = m.mission_id;
        document.getElementById("inp-msn-title").value = m.title;
        document.getElementById("inp-msn-goal").value = m.goal_prompt || "";
        document.getElementById("inp-msn-auto").checked = Boolean(m.auto_approve);
        openModal("modal-mission");
      };
    });

    root.querySelectorAll("[data-del-msn]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        const mid = b.getAttribute("data-del-msn");
        const backup = state.missions.find((x) => x.mission_id === mid);
        await api(`/api/missions/${encodeURIComponent(mid)}`, "DELETE");
        await loadEverything();
        toast("Đã xóa nhiệm vụ.", { entity_type: "mission", entity_id: mid, backup });
      });
    });

    root.querySelectorAll("[data-sel-task]").forEach((chk) => {
      chk.onchange = () => {
        const tid = chk.getAttribute("data-sel-task");
        if (chk.checked) state.selectedTaskIds.add(tid);
        else state.selectedTaskIds.delete(tid);
        renderTasksTab();
      };
    });

    root.querySelectorAll("[data-approve-task]").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        withLock(b, async () => {
          await api(`/api/tasks/${encodeURIComponent(b.getAttribute("data-approve-task"))}/decision`, "POST", { decision: "APPROVE" });
          closeDrawer();
          await loadEverything();
          toast("Đã hoàn tất công việc.");
        });
      };
    });

    root.querySelectorAll("[data-reject-task]").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        document.getElementById("reject-modal-title").textContent = "Yêu cầu sửa lại công việc";
        document.getElementById("reject-target-kind").value = "task";
        document.getElementById("reject-target-id").value = b.getAttribute("data-reject-task");
        document.getElementById("inp-reject-note").value = "";
        openModal("modal-reject");
      };
    });

    root.querySelectorAll("[data-edit-task]").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        const t = state.tasks.find((x) => x.task_id === b.getAttribute("data-edit-task"));
        if (!t) return;
        closeDrawer();
        document.getElementById("task-modal-title").textContent = "Chỉnh sửa công việc";
        document.getElementById("edit-task-id").value = t.task_id;
        document.getElementById("inp-task-title").value = t.title;
        const wrapDisp = document.getElementById("wrap-task-dispatch-now");
        const chkDisp = document.getElementById("chk-task-dispatch-now");
        const advDet = document.getElementById("task-advanced-details");
        const submitBtn = document.getElementById("btn-submit-task");
        if (wrapDisp) wrapDisp.classList.add("is-hidden");
        if (chkDisp) chkDisp.checked = false;
        if (advDet) advDet.open = true;
        if (submitBtn) submitBtn.textContent = "Lưu thay đổi";
        setListboxValue("inp-task-dept", t.assigned_dept_id || "00", true);
        setListboxValue("inp-task-col", t.kanban_column || "BACKLOG", true);
        setListboxValue("inp-task-proj", t.project_id || "", true);
        setListboxValue("inp-task-prio", t.priority || "HIGH", true);
        document.getElementById("inp-task-desc").value = t.description || "";
        openModal("modal-task");
      };
    });

    root.querySelectorAll("[data-dup-task]").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        withLock(b, async () => {
          await api(`/api/tasks/${encodeURIComponent(b.getAttribute("data-dup-task"))}/duplicate`, "POST", {});
          closeDrawer();
          await loadEverything();
          toast("Đã tạo bản sao công việc.");
        });
      };
    });

    root.querySelectorAll("[data-del-task]").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        withLock(b, async () => {
          const tid = b.getAttribute("data-del-task");
          const backup = state.tasks.find((x) => x.task_id === tid);
          state.selectedTaskIds.delete(tid);
          await api(`/api/tasks/${encodeURIComponent(tid)}`, "DELETE");
          closeDrawer();
          await loadEverything();
          toast("Đã xóa công việc.", { entity_type: "task", entity_id: tid, backup });
        });
      };
    });

    root.querySelectorAll("[data-quick-col-add]").forEach((b) => {
      b.onclick = () => openNewTaskModal(b.getAttribute("data-quick-col-add"));
    });

    root.querySelectorAll("[data-star-news]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        await api(`/api/knowledge/${b.getAttribute("data-star-news")}`, "PATCH", {});
        await loadNews(document.getElementById("news-search-input").value || "");
      });
    });

    root.querySelectorAll("[data-del-news]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        const aid = Number(b.getAttribute("data-del-news"));
        const backup = state.articles.find((x) => Number(x.atom_id) === aid);
        const res = await api(`/api/knowledge/${aid}`, "DELETE");
        await Promise.all([loadNews(document.getElementById("news-search-input").value || ""), loadEverything()]);
        toast("Đã xóa bài báo.", { entity_type: "article", entity_id: res.entity_id || (backup && backup.url_hash), backup });
      });
    });

    root.querySelectorAll("[data-edit-proj]").forEach((b) => {
      b.onclick = () => {
        const p = state.projects.find((x) => x.project_id === b.getAttribute("data-edit-proj"));
        if (!p) return;
        document.getElementById("proj-modal-title").textContent = "Chỉnh sửa dự án";
        document.getElementById("edit-proj-id").value = p.project_id;
        document.getElementById("wrap-proj-slug").classList.add("is-hidden");
        document.getElementById("inp-proj-title").value = p.title;
        document.getElementById("inp-proj-price").value = formatDotNumber(p.expected_price_vnd || 399000);
        setListboxValue("inp-proj-status", p.status || "ACTIVE", true);
        document.getElementById("inp-proj-obj").value = p.objective || "";
        openModal("modal-proj");
      };
    });

    root.querySelectorAll("[data-del-proj]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        const pid = b.getAttribute("data-del-proj");
        const backup = state.projects.find((x) => x.project_id === pid);
        await api(`/api/projects/${encodeURIComponent(pid)}`, "DELETE");
        if (state.financeViewProjectId === pid) state.financeViewProjectId = "";
        if (state.selectedProjectId === pid) {
          state.selectedProjectId = "";
          state.projectDetail = null;
        }
        await loadEverything();
        toast("Đã xóa dự án.", { entity_type: "project", entity_id: pid, backup });
      });
    });
  }

  async function openArtifactDrawer(relPath) {
    document.getElementById("drawer-heading").textContent = relPath.split("/").pop() || "Báo cáo chuyên môn";
    document.getElementById("drawer-body").innerHTML = `<p class="row-meta">Đang tải nội dung báo cáo...</p>`;
    document.getElementById("drawer-backdrop").classList.add("open");
    document.getElementById("inspector-drawer").classList.add("open");
    try {
      let content = "";
      if (state.staticMode) {
        const liveUrl = artifactHref(relPath);
        const r = await fetch(liveUrl, { cache: "no-cache" });
        if (!r.ok) throw new Error("Báo cáo đang đồng bộ lên đám mây, vui lòng mở lại sau vài giây.");
        content = await r.text();
      } else {
        const res = await api(`/api/workspace/file?path=${encodeURIComponent(relPath)}`);
        content = res.content || "";
      }
      document.getElementById("drawer-body").innerHTML = `
        <div class="mono row-meta">Đường dẫn tệp: ${esc(relPath)}</div>
        <div class="rendered-md">${renderCleanMarkdown(content)}</div>
      `;
    } catch (err) {
      document.getElementById("drawer-body").innerHTML = `<p class="text-err">${esc(err.message)}</p>`;
    }
  }

  function updateBulkBar() {
    const bar = document.getElementById("bulk-bar");
    const cnt = state.selectedTaskIds.size;
    document.getElementById("bulk-count-lbl").textContent = `Đã chọn ${cnt} việc`;
    bar.classList.toggle("visible", state.taskBulkMode && cnt > 0 && state.tab === "tasks");
  }

  // -------------------------------------------------------------------------
  // 13. NAVIGATION, LISTBOX SYNC, THEME, COMMAND PALETTE & LIVE STREAM
  // -------------------------------------------------------------------------
  function switchTab(tab) {
    if (!VIEW_TITLES[tab]) return;
    state.tab = tab;
    document.getElementById("view-heading").textContent = VIEW_TITLES[tab];

    document.querySelectorAll(".view-panel").forEach((p) => {
      p.classList.toggle("active", p.id === `view-${tab}`);
    });
    document.querySelectorAll("#side-nav .nav-item, #mobile-nav .mob-btn").forEach((b) => {
      const on = b.getAttribute("data-tab") === tab;
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });

    if (window.location.hash !== `#${tab}`) {
      history.replaceState(null, "", `#${tab}`);
    }
    updateBulkBar();
    renderAllViews();
  }

  function openModal(id) {
    closeModals();
    closeAllListboxes();
    document.getElementById("modal-backdrop").classList.add("open");
    const m = document.getElementById(id);
    if (m) {
      m.classList.add("open");
      const inp = m.querySelector("input:not([type='hidden']), textarea");
      if (inp) setTimeout(() => inp.focus(), 30);
    }
  }

  function closeModals() {
    closeAllListboxes();
    document.getElementById("modal-backdrop").classList.remove("open");
    document.querySelectorAll(".modal.open").forEach((m) => m.classList.remove("open"));
  }

  function openNewTaskModal(defaultCol = "BACKLOG", defaultProj = "") {
    document.getElementById("task-modal-title").textContent = "Giao việc nhanh cho AI";
    document.getElementById("edit-task-id").value = "";
    document.getElementById("form-task").reset();
    const wrapDisp = document.getElementById("wrap-task-dispatch-now");
    const chkDisp = document.getElementById("chk-task-dispatch-now");
    const advDet = document.getElementById("task-advanced-details");
    const submitBtn = document.getElementById("btn-submit-task");
    if (wrapDisp) wrapDisp.classList.remove("is-hidden");
    if (chkDisp) chkDisp.checked = true;
    if (advDet) advDet.open = Boolean(defaultProj);
    if (submitBtn) submitBtn.textContent = "Giao AI làm ngay";
    setListboxValue("inp-task-dept", "AUTO", true);
    setListboxValue("inp-task-col", defaultCol, true);
    setListboxValue("inp-task-prio", "HIGH", true);
    setListboxValue("inp-task-proj", defaultProj, true);
    openModal("modal-task");
  }

  function openReworkModal({ missionId = "", projectId = "", taskId = "", stepOrder = 0, targetDeptId = "13", sourceDeptId = "" } = {}) {
    document.getElementById("form-rework").reset();
    document.getElementById("rework-mission-id").value = missionId;
    document.getElementById("rework-project-id").value = projectId;
    document.getElementById("rework-task-id").value = taskId;
    document.getElementById("rework-step-order").value = String(stepOrder || 0);
    const has53 = state.departments.some((d) => String(d.dept_id).padStart(2, "0") === "53");
    const defaultSrc = sourceDeptId || (has53 ? "53" : "51");
    setListboxValue("inp-rework-source", defaultSrc, true);
    setListboxValue("inp-rework-target", String(targetDeptId || "13").padStart(2, "0"), true);
    setListboxValue("inp-rework-cat", "BUG", true);
    setListboxValue("inp-rework-sev", "HIGH", true);
    openModal("modal-rework");
  }

  function buildFallbackDirectoryPayload() {
    const depts = state.departments.map((d) => ({
      dept_id: d.dept_id,
      code: d.code,
      title_vi: cleanDeptTitleVi(d.dept_id, d.title_vi),
      division_code: d.division_code,
      division_name_vi: DIV_SHORT_NAMES[d.division_code] || d.division_name_vi || d.division_code,
      status: d.status || "IDLE",
      core_strength_vi: `Chuyên trách nghiệp vụ ${cleanDeptTitleVi(d.dept_id, d.title_vi)} trong chuỗi vận hành 9 Khối.`,
      upstream_depts: [],
      downstream_depts: [],
      product_types: ["ALL"]
    }));
    return {
      total_departments: depts.length,
      total_divisions: state.divisions.length || 10,
      sop_rules: FALLBACK_SOP_RULES_VI,
      divisions: state.divisions,
      departments: depts
    };
  }

  function buildFallbackRosterPlan(goalPrompt, productType) {
    const pType = productType && productType !== "AUTO" ? productType : "WEB_APP";
    const divs = DIV_ORDER.map((code, idx) => {
      const list = state.departments
        .filter((d) => d.division_code === code)
        .map((d) => ({ dept_id: d.dept_id, title_vi: cleanDeptTitleVi(d.dept_id, d.title_vi) }));
      return {
        division_code: code,
        division_name_vi: DIV_SHORT_NAMES[code] || code,
        sort_order: idx,
        active_depts: list,
        skipped_depts: [],
        reason_vi: "Huy động đầy đủ theo chế độ dự phòng ngoại tuyến."
      };
    });
    return {
      product_type: pType,
      product_type_label_vi: PRODUCT_TYPE_VI[pType] || PRODUCT_TYPE_VI.GENERAL,
      goal_prompt: goalPrompt,
      all_9_divisions_covered: true,
      active_divisions_count: 9,
      active_depts_count: state.departments.length,
      skipped_depts_count: 0,
      divisions: divs
    };
  }

  function switchOrgSopTab(tabName) {
    state.orgSopTab = tabName === "directory" ? "directory" : "sop";
    document.querySelectorAll("#org-sop-tabs .seg-btn").forEach((b) => {
      const active = b.getAttribute("data-org-tab") === state.orgSopTab;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    document.getElementById("org-panel-sop")?.classList.toggle("is-hidden", state.orgSopTab !== "sop");
    document.getElementById("org-panel-directory")?.classList.toggle("is-hidden", state.orgSopTab !== "directory");
    if (state.orgSopTab === "directory") {
      renderOrgDirectoryList();
    } else {
      renderOrgSopOverview();
    }
  }

  function renderOrgSopOverview() {
    const box = document.getElementById("org-sop-rules-box");
    if (!box) return;
    const dir = state.corporateDirectory || buildFallbackDirectoryPayload();
    const rawRules = Array.isArray(dir.sop_rules) && dir.sop_rules.length ? dir.sop_rules : FALLBACK_SOP_RULES_VI;
    const normalizedRules = rawRules.map((r, i) => {
      if (typeof r === "string") {
        const clean = sanitizeUiVietnamese(r);
        const parts = clean.split(":");
        return {
          title_vi: parts.length > 1 ? parts[0].trim() : `Quy tắc ${i + 1}`,
          detail_vi: parts.length > 1 ? parts.slice(1).join(":").trim() : clean
        };
      }
      return {
        title_vi: sanitizeUiVietnamese(r.title_vi || `Quy tắc ${i + 1}`),
        detail_vi: sanitizeUiVietnamese(r.detail_vi || "")
      };
    });
    box.innerHTML = normalizedRules.map((r) => `
      <article class="org-rule-card">
        <div class="org-rule-title">${esc(r.title_vi)}</div>
        <p class="row-meta">${esc(r.detail_vi)}</p>
      </article>
    `).join("");

    if (state.lastRosterPlan) {
      renderRosterPlanResult(state.lastRosterPlan);
    }
  }

  function renderRosterPlanResult(plan) {
    const box = document.getElementById("roster-plan-result");
    if (!box || !plan) return;
    const divs = Array.isArray(plan.divisions) ? plan.divisions : [];
    const activeDivCount = Number(plan.active_divisions_count || 9);
    const activeDeptCount = Number(plan.active_depts_count || 0);
    const skippedDeptCount = Number(plan.skipped_depts_count || 0);
    const typeLabel = sanitizeUiVietnamese(plan.product_type_label_vi || PRODUCT_TYPE_VI[plan.product_type] || "Tổng hợp");

    box.innerHTML = `
      <div class="roster-summary-banner">
        <div class="stack-xs">
          <div class="action-group">
            <span class="badge badge-done">${ico("shield-check")}<span>Độ phủ: ${activeDivCount}/9 Khối và Ban Điều hành</span></span>
            <span class="badge badge-sync">${esc(typeLabel)}</span>
          </div>
          <p class="row-meta">Kích hoạt <strong>${activeDeptCount} phòng chuyên trách</strong> phù hợp loại sản phẩm, để trống <strong>${skippedDeptCount} phòng</strong> không liên quan để tránh loãng nguồn lực.</p>
        </div>
      </div>
      <div class="roster-div-list">
        ${divs.map((dv) => {
          const activeList = Array.isArray(dv.active_depts) ? dv.active_depts : [];
          const skipList = Array.isArray(dv.skipped_depts) ? dv.skipped_depts : [];
          const divName = DIV_SHORT_NAMES[dv.division_code] || sanitizeUiVietnamese(dv.division_name_vi || dv.division_code);
          return `
            <article class="roster-div-card">
              <div class="roster-div-head">
                <strong>${esc(divName)}</strong>
                <span class="badge badge-done">Chọn ${activeList.length} phòng</span>
              </div>
              ${dv.reason_vi ? `<p class="row-meta">${esc(sanitizeUiVietnamese(dv.reason_vi))}</p>` : ""}
              <div class="roster-chip-row">
                <span class="row-meta">Tham gia:</span>
                ${activeList.map((d) => `<button type="button" class="agent-pill" data-open-staff="${esc(d.dept_id)}" title="${esc(cleanDeptTitleVi(d.dept_id, d.title_vi))}">#${esc(d.dept_id)} ${esc(cleanDeptTitleVi(d.dept_id, d.title_vi))}</button>`).join("")}
              </div>
              ${skipList.length ? `
                <div class="roster-chip-row">
                  <span class="row-meta">Để trống tránh loãng:</span>
                  ${skipList.map((d) => `<span class="roster-skip-pill">#${esc(d.dept_id)} ${esc(cleanDeptTitleVi(d.dept_id, d.title_vi))}</span>`).join("")}
                </div>
              ` : `<span class="row-meta">Khối cốt lõi bắt buộc: huy động đủ 100%, không bỏ trống.</span>`}
            </article>
          `;
        }).join("")}
      </div>
    `;
    bindQuickActions(box);
  }

  async function runPlanRoster(goalPrompt, productType, triggerBtn = null) {
    const exec = async () => {
      let plan;
      try {
        plan = await api("/api/org/plan-roster", "POST", {
          goal_prompt: goalPrompt || "",
          product_type: productType || "AUTO"
        });
      } catch (_e) {
        plan = buildFallbackRosterPlan(goalPrompt || "", productType || "AUTO");
      }
      state.lastRosterPlan = plan;
      renderRosterPlanResult(plan);
    };
    if (triggerBtn) await withLock(triggerBtn, exec);
    else await exec();
  }

  function renderOrgDirectoryList() {
    const listEl = document.getElementById("org-directory-list");
    const metaEl = document.getElementById("dir-count-meta");
    if (!listEl) return;
    const dir = state.corporateDirectory || buildFallbackDirectoryPayload();
    const allDepts = Array.isArray(dir.departments) ? dir.departments : [];
    const q = (document.getElementById("inp-dir-search")?.value || "").trim().toLowerCase();
    const divF = getListboxValue("filter-dir-div") || "";

    const filtered = allDepts.filter((d) => {
      if (divF && d.division_code !== divF) return false;
      if (!q) return true;
      const hay = [
        d.dept_id,
        `#${d.dept_id}`,
        cleanDeptTitleVi(d.dept_id, d.title_vi),
        d.core_strength_vi || "",
        DIV_SHORT_NAMES[d.division_code] || d.division_name_vi || ""
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });

    if (metaEl) metaEl.textContent = `Đang hiển thị ${filtered.length}/${allDepts.length} phòng ban`;

    if (!filtered.length) {
      listEl.innerHTML = `<div class="empty-state"><p>Không tìm thấy phòng ban nào khớp bộ lọc trong danh bạ.</p></div>`;
      return;
    }

    listEl.innerHTML = filtered.map((d) => {
      const cleanName = cleanDeptTitleVi(d.dept_id, d.title_vi);
      const divLabel = DIV_SHORT_NAMES[d.division_code] || sanitizeUiVietnamese(d.division_name_vi || d.division_code);
      const upIds = Array.isArray(d.upstream_depts) ? d.upstream_depts : [];
      const downIds = Array.isArray(d.downstream_depts) ? d.downstream_depts : [];
      const pTypes = (Array.isArray(d.product_types) ? d.product_types : ["ALL"])
        .map((pt) => PRODUCT_TYPE_VI[pt] || sanitizeUiVietnamese(pt));
      return `
        <article class="dir-dept-card">
          <div class="dir-dept-head">
            <div class="action-group">
              <span class="dept-code-pill">#${esc(d.dept_id)}</span>
              <strong>${esc(cleanName)}</strong>
            </div>
            <button type="button" class="btn btn-xs" data-open-staff="${esc(d.dept_id)}">Mở hồ sơ</button>
          </div>
          <div class="action-group">
            <span class="row-meta">${esc(divLabel)}</span>
            ${pTypes.map((lbl) => `<span class="badge badge-idle">${esc(lbl)}</span>`).join("")}
          </div>
          ${d.core_strength_vi ? `<p class="step-summary"><strong>Chuyên môn lõi:</strong> ${esc(sanitizeUiVietnamese(d.core_strength_vi))}</p>` : ""}
          ${upIds.length ? `
            <div class="who-chips">
              <span>Nhận đầu vào từ:</span>
              ${upIds.map((pid) => {
                const nid = String(pid).padStart(2, "0");
                return `<button type="button" class="agent-pill" data-open-staff="${esc(nid)}" title="${esc(deptTitle(nid))}">#${esc(nid)}</button>`;
              }).join("")}
            </div>
          ` : ""}
          ${downIds.length ? `
            <div class="who-chips">
              <span>Bàn giao ngang cho:</span>
              ${downIds.map((pid) => {
                const nid = String(pid).padStart(2, "0");
                return `<button type="button" class="agent-pill" data-open-staff="${esc(nid)}" title="${esc(deptTitle(nid))}">#${esc(nid)}</button>`;
              }).join("")}
            </div>
          ` : ""}
        </article>
      `;
    }).join("");
    bindQuickActions(listEl);
  }

  async function openOrgSopModal(initialTab = "sop") {
    const total = state.departments.length || 54;
    const titleEl = document.getElementById("org-sop-modal-title");
    const dirTabLbl = document.getElementById("lbl-org-tab-dir");
    if (titleEl) titleEl.textContent = `Quy trình Chuẩn 9 Khối và Danh bạ ${total} Phòng ban`;
    if (dirTabLbl) dirTabLbl.textContent = `Danh bạ Năng lực ${total} Phòng`;

    openModal("modal-org-sop");
    switchOrgSopTab(initialTab);

    if (!state.corporateDirectory) {
      try {
        state.corporateDirectory = await api("/api/org/directory");
      } catch (_e) {
        state.corporateDirectory = buildFallbackDirectoryPayload();
      }
    }
    renderOrgSopOverview();
    if (state.orgSopTab === "directory") {
      renderOrgDirectoryList();
    }
    if (!state.lastRosterPlan) {
      const sampleGoal = document.getElementById("inp-roster-goal")?.value.trim() || "Web tiện ích xử lý CCCD và PDF trực tiếp trên trình duyệt";
      await runPlanRoster(sampleGoal, getListboxValue("inp-roster-type") || "AUTO");
    }
  }

  function openHandoffModal({ actionKind = "CREATE", mode = "PEER_HANDOFF", fromDeptId = "00", handoffId = "" } = {}) {
    const form = document.getElementById("form-handoff");
    if (form) form.reset();

    const normFrom = String(fromDeptId || "00").padStart(2, "0");
    document.getElementById("handoff-action-kind").value = actionKind;
    document.getElementById("handoff-edit-id").value = handoffId || "";
    document.getElementById("handoff-mode").value = mode;
    document.getElementById("handoff-from-dept").value = normFrom;

    const titleEl = document.getElementById("handoff-modal-title");
    const ctxEl = document.getElementById("handoff-context-box");
    const wrapTo = document.getElementById("wrap-handoff-to");
    const wrapLocked = document.getElementById("wrap-handoff-locked-ceo");
    const wrapMission = document.getElementById("wrap-handoff-mission");
    const wrapReason = document.getElementById("wrap-handoff-reason");
    const reasonInp = document.getElementById("inp-handoff-reason");
    const payloadLbl = document.getElementById("lbl-handoff-payload");
    const submitBtn = document.getElementById("btn-submit-handoff");

    const allDeptItems = state.departments.map((d) => ({
      value: d.dept_id,
      label: `#${d.dept_id}: ${cleanDeptTitleVi(d.dept_id, d.title_vi)}`
    }));

    if (actionKind === "REROUTE" && handoffId) {
      const ho = (state.deptHandoffs || []).find((x) => x.handoff_id === handoffId);
      const fromId = ho ? String(ho.from_dept_id || "00").padStart(2, "0") : "00";
      titleEl.textContent = "Tổng Giám đốc #00 phân công sang phòng chuyên trách";
      ctxEl.innerHTML = `
        <strong>Phiếu leo thang từ Phòng #${esc(fromId)}: ${esc(deptTitle(fromId))}</strong>
        <span class="row-meta">${esc(sanitizeUiVietnamese((ho && ho.reason_vi) || "Chọn đúng phòng ban để Tổng Giám đốc #00 bàn giao xử lý."))}</span>
      `;
      wrapTo.classList.remove("is-hidden");
      wrapLocked.classList.add("is-hidden");
      wrapMission.classList.add("is-hidden");
      wrapReason.classList.add("is-hidden");
      reasonInp.required = false;
      payloadLbl.textContent = "Chỉ đạo phân xử của Tổng Giám đốc #00";
      submitBtn.textContent = "Xác nhận #00 chuyển tuyến ngay";

      const targetItems = allDeptItems.filter((x) => x.value !== "00");
      setListboxOptions("inp-handoff-to", targetItems.length ? targetItems : allDeptItems, false);
      setListboxValue("inp-handoff-to", (targetItems[0] && targetItems[0].value) || "13", true);
    } else if (mode === "CEO_ESCALATION") {
      titleEl.textContent = "Đẩy lên Tổng Giám đốc #00 xử lý";
      ctxEl.innerHTML = `
        <strong>Phòng gửi yêu cầu: #${esc(normFrom)} ${esc(deptTitle(normFrom))}</strong>
        <span class="row-meta">Dùng khi vấn đề vượt phạm vi chuyên môn, xung đột liên khối hoặc ảnh hưởng ngân sách và kiến trúc.</span>
      `;
      wrapTo.classList.add("is-hidden");
      wrapLocked.classList.remove("is-hidden");
      wrapMission.classList.remove("is-hidden");
      wrapReason.classList.remove("is-hidden");
      reasonInp.required = true;
      payloadLbl.textContent = "Ngữ cảnh và phương án đề xuất để #00 phân xử";
      submitBtn.textContent = "Đẩy lên Tổng Giám đốc #00 ngay";
      setListboxValue("inp-handoff-to", "00", true);
      setListboxValue("inp-handoff-mission", "", true);
    } else {
      titleEl.textContent = "Chuyển việc ngang sang phòng khác";
      ctxEl.innerHTML = `
        <strong>Phòng bàn giao: #${esc(normFrom)} ${esc(deptTitle(normFrom))}</strong>
        <span class="row-meta">Chuyển thẳng sang phòng chuyên trách trong Danh bạ 54 phòng và tự động gửi bản sao nhật ký cho Tổng Giám đốc #00.</span>
      `;
      wrapTo.classList.remove("is-hidden");
      wrapLocked.classList.add("is-hidden");
      wrapMission.classList.remove("is-hidden");
      wrapReason.classList.remove("is-hidden");
      reasonInp.required = true;
      payloadLbl.textContent = "Chi tiết bàn giao cho phòng tiếp nhận";
      submitBtn.textContent = "Chuyển việc ngang ngay";

      const peerChoices = allDeptItems.filter((x) => x.value !== normFrom);
      setListboxOptions("inp-handoff-to", peerChoices.length ? peerChoices : allDeptItems, false);
      const defaultTarget = (peerChoices.find((x) => x.value !== "00") || peerChoices[0] || { value: "13" }).value;
      setListboxValue("inp-handoff-to", defaultTarget, true);
      setListboxValue("inp-handoff-mission", "", true);
    }

    openModal("modal-handoff");
  }

  function populateDynamicListboxes() {
    const deptItems = state.departments.map((d) => ({
      value: d.dept_id,
      label: `#${d.dept_id}: ${cleanDeptTitleVi(d.dept_id, d.title_vi)}`
    }));
    if (deptItems.length) {
      setListboxOptions("inp-task-dept", [{ value: "AUTO", label: "Tự động chọn phòng ban phù hợp" }, ...deptItems], true, "modal-task");
      setListboxOptions("url-dept-select", deptItems, true);
      setListboxOptions("filter-task-dept", [{ value: "", label: "Mọi phòng ban" }, ...deptItems], true);
      setListboxOptions("filter-skill-dept", [{ value: "", label: "Tất cả phòng ban" }, ...deptItems], true);
      setListboxOptions("inp-skill-dept", [{ value: "", label: "Tự động chọn phòng phù hợp" }, ...deptItems], true);

      const priorityOrder = ["53", "51", "52", "49", "48", "47", "46"];
      const sourceItems = [
        ...priorityOrder.map((id) => deptItems.find((x) => x.value === id)).filter(Boolean),
        ...deptItems.filter((x) => !priorityOrder.includes(x.value))
      ];
      setListboxOptions("inp-rework-source", sourceItems, true, "modal-rework");
      setListboxOptions("inp-rework-target", deptItems, true, "modal-rework");
      setListboxOptions("inp-handoff-to", deptItems, true, "modal-handoff");
    }

    const msnHandoffItems = [
      { value: "", label: "Không gắn nhiệm vụ cụ thể" },
      ...state.missions.map((m) => ({ value: m.mission_id, label: sanitizeUiVietnamese(m.title) }))
    ];
    setListboxOptions("inp-handoff-mission", msnHandoffItems, true, "modal-handoff");

    const projTaskItems = [
      { value: "", label: "Không gắn dự án" },
      ...state.projects.map((p) => ({ value: p.project_id, label: sanitizeUiVietnamese(p.title) }))
    ];
    setListboxOptions("inp-task-proj", projTaskItems, true, "modal-task");

    const projFilterItems = [
      { value: "", label: "Tất cả dự án" },
      ...state.projects.map((p) => ({ value: p.project_id, label: sanitizeUiVietnamese(p.title) }))
    ];
    setListboxOptions("filter-task-project", projFilterItems, true);

    const divItems = state.divisions
      .filter((dv) => dv.code !== "exec-board")
      .map((dv) => ({ value: dv.code, label: DIV_SHORT_NAMES[dv.code] || sanitizeUiVietnamese(dv.name_vi) }));
    if (divItems.length) {
      setListboxOptions("inp-hire-div", divItems, true, "modal-hire");
    }
  }

  function renderAllViews() {
    renderCountsAndHeader();
    if (state.tab === "command") renderCommandTab();
    if (state.tab === "projects") renderProjectsTab();
    if (state.tab === "missions") renderProgressTab();
    if (state.tab === "tasks") renderTasksTab();
    if (state.tab === "staff") renderStaffTab();
    if (state.tab === "news") renderNewsTab();
    if (state.tab === "finance") renderFinanceTab();
  }

  async function loadNews(q = "") {
    try {
      const res = await api(`/api/knowledge?q=${encodeURIComponent(q)}&limit=180`);
      state.articles = res.articles || [];
      renderCountsAndHeader();
      if (state.tab === "news") renderNewsTab();
    } catch (_e) {}
  }

  async function loadEverything() {
    const [ov, depts, tasks] = await Promise.all([
      api("/api/overview?limit=40"),
      api("/api/departments"),
      api("/api/tasks")
    ]);
    state.overview = ov || {};
    state.bridge = (ov && ov.bridge) || state.bridge;
    state.orders = (ov && ov.orders) || [];
    state.swarmMessages = (ov && ov.swarm_messages) || [];
    state.divisions = (ov && ov.divisions) || [];
    state.projects = (ov && ov.projects) || [];
    state.missions = (ov && ov.missions) || [];
    state.opportunities = (ov && ov.opportunities) || [];
    state.learningRuns = (ov && ov.learning_runs) || state.learningRuns;
    if (ov && ov.learning_progress) state.learningProgress = ov.learning_progress;
    if (ov && Array.isArray(ov.installed_skills)) state.installedSkills = ov.installed_skills;
    if (ov && Array.isArray(ov.project_ledger)) state.projectLedger = ov.project_ledger;
    if (ov && Array.isArray(ov.rework_tickets)) state.reworkTickets = ov.rework_tickets;
    if (ov && ov.rework_summary) state.reworkSummary = ov.rework_summary;
    if (ov && Array.isArray(ov.media_campaigns)) state.mediaCampaigns = ov.media_campaigns;
    if (ov && Array.isArray(ov.dept_handoffs)) state.deptHandoffs = ov.dept_handoffs;
    if (ov && ov.corporate_directory_summary) state.corporateDirectorySummary = ov.corporate_directory_summary;
    if (ov && ov.finance_summary) state.financeSummary = ov.finance_summary;
    state.departments = (depts && depts.departments) || [];
    state.tasks = (tasks && tasks.tasks) || [];
    state.lastSyncAt = new Date().toISOString();

    if (state.learningProgress && state.learningProgress.running && !state.learningPollTimer) {
      startLearningStatusPolling();
    }
    populateDynamicListboxes();
    renderAllViews();
  }

  async function pollBridgeStatus() {
    if (state.staticMode) return;
    try {
      const b = await api("/api/bridge/status");
      const changed = Boolean(b.online) !== Boolean(state.bridge.online)
        || Number(b.pending_orders_count || 0) !== Number(state.bridge.pending_orders_count || 0)
        || JSON.stringify(b.active_workers || []) !== JSON.stringify(state.bridge.active_workers || []);
      state.bridge = b;
      if (changed) renderCountsAndHeader();
    } catch (_e) {}
  }

  function startLiveStream() {
    if (state.staticMode || !window.EventSource) return;
    if (state.sse) state.sse.close();
    const es = new EventSource(`${API_BASE}/api/events/stream`);
    state.sse = es;
    let debounceTimer = null;
    es.addEventListener("activity", (ev) => {
      let evtType = "";
      try { evtType = JSON.parse(ev.data).event_type || ""; } catch (_e) {}
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadEverything().catch(() => {});
        if (state.tab === "projects" && state.selectedProjectId) {
          loadProjectDetail(state.selectedProjectId).catch(() => {});
        }
        if (state.tab === "finance" && state.financeViewProjectId) {
          loadActiveProjectFinance(state.financeViewProjectId).catch(() => {});
        }
        if (evtType.includes("LEARNING") || evtType.includes("ARTICLE") || state.tab === "news") {
          loadNews(document.getElementById("news-search-input").value || "");
        }
      }, 350);
    });
    es.onerror = () => {
      es.close();
      if (!state.staticMode) setTimeout(startLiveStream, 3500);
    };
  }

  function hasActiveLiveOperations() {
    const hasRunMsn = state.missions.some((m) => m.status === "RUNNING" || m.status === "WAITING_CHAIRMAN");
    const hasRunOrd = (state.orders || []).some((o) => ["PENDING", "CLAIMED", "RUNNING", "IN_PROGRESS"].includes(String(o.status || "").toUpperCase()));
    const hasRunLearn = Boolean(state.learningProgress && state.learningProgress.running);
    return hasRunMsn || hasRunOrd || hasRunLearn;
  }

  function startBackgroundSyncLoop() {
    if (state.bgSyncTimer) clearInterval(state.bgSyncTimer);
    state.bgSyncTimer = setInterval(() => {
      if (document.hidden || state.staticMode) return;
      if (!hasActiveLiveOperations()) return;
      loadEverything().catch(() => {});
    }, 8000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !state.staticMode) {
        loadEverything().catch(() => {});
      }
    });
  }

  function scheduleOnlineReconnect() {
    if (state.reconnectTimer) clearInterval(state.reconnectTimer);
    state.reconnectTimer = setInterval(async () => {
      if (!state.staticMode) return;
      const connected = await detectOnlineEndpoint();
      if (connected) {
        await Promise.all([loadEverything(), loadNews(document.getElementById("news-search-input").value || "")]);
        startLiveStream();
        if (!state.bridgeTimer) state.bridgeTimer = setInterval(pollBridgeStatus, 5000);
        toast("Đã khôi phục kết nối trực tuyến.");
      }
    }, 20000);
  }

  function applyTheme(t) {
    const mode = t === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("titan_theme", mode);

    const btn = document.getElementById("btn-theme");
    const useEl = document.getElementById("theme-icon-use");
    if (btn) {
      btn.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", mode === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
    }
    if (useEl) {
      useEl.setAttribute("href", mode === "dark" ? "#i-sun" : "#i-moon");
    }
    const meta = document.getElementById("meta-theme-color");
    if (meta) {
      const styles = getComputedStyle(document.documentElement);
      const tokenVal = styles.getPropertyValue(mode === "dark" ? "--color-surface-page" : "--color-action-primary").trim();
      if (tokenVal) meta.setAttribute("content", tokenVal);
    }
  }

  async function syncWithCloudVault() {
    const pin = document.getElementById("inp-cloud-pin").value;
    if (!pin || pin.length < 4) {
      throw new Error("Vui lòng nhập mã bảo vệ két tối thiểu 4 ký tự.");
    }
    const creds = await cryptoVault.unlock(pin);
    sessionUnlockedCloud = creds;
    const apiUrl = `https://api.github.com/repos/${creds.repo}/contents/corporate_hq/cloud_state/snapshot.json`;
    const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${creds.token}` };
    const r = await fetch(apiUrl, { headers });
    if (!r.ok) throw new Error(`Kênh đám mây báo mã lỗi ${r.status}. Vui lòng kiểm tra lại khóa truy cập.`);
    const meta = await r.json();
    const remoteSnap = JSON.parse(cryptoVault.b64ToUtf8(meta.content || ""));

    if (!state.staticMode) {
      const merged = await api("/api/sync/snapshot", "POST", { snapshot: remoteSnap });
      await fetch(apiUrl, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `chore(sync): dong bo da thiet bi ${new Date().toISOString()}`,
          content: cryptoVault.utf8ToB64(JSON.stringify(merged.snapshot, null, 2)),
          sha: meta.sha
        })
      });
      await Promise.all([loadEverything(), loadNews()]);
    } else {
      state.missions = remoteSnap.missions || state.missions;
      state.opportunities = remoteSnap.opportunities || state.opportunities;
      state.tasks = remoteSnap.tasks || state.tasks;
      state.projects = remoteSnap.projects || state.projects;
      state.articles = remoteSnap.knowledge_atoms || state.articles;
      state.installedSkills = remoteSnap.installed_skills || state.installedSkills;
      state.projectLedger = remoteSnap.project_ledger || state.projectLedger;
      state.reworkTickets = remoteSnap.rework_tickets || state.reworkTickets;
      saveOfflineViewCache();
      renderAllViews();
    }
    closeModals();
    toast("Đồng bộ đám mây 2 chiều thành công.");
  }

  function renderCmd(q) {
    const term = (q || "").trim().toLowerCase();
    const rows = [];
    state.missions.forEach((m) => {
      if (!term || m.title.toLowerCase().includes(term)) {
        rows.push({ kind: "msn", id: m.mission_id, label: `Nhiệm vụ: ${sanitizeUiVietnamese(m.title)}`, sub: "Tiến độ 8 bước" });
      }
    });
    state.opportunities.forEach((o) => {
      if (term && o.title.toLowerCase().includes(term)) {
        rows.push({ kind: "opp", label: `Cơ hội: ${sanitizeUiVietnamese(o.title)}`, sub: sanitizeUiVietnamese(o.target_customer) });
      }
    });
    state.tasks.forEach((t) => {
      if (term && t.title.toLowerCase().includes(term)) {
        rows.push({ kind: "task", id: t.task_id, label: `Công việc: ${sanitizeUiVietnamese(t.title)}`, sub: COL_LABELS[t.kanban_column] || "" });
      }
    });
    state.projects.forEach((p) => {
      if (term && p.title.toLowerCase().includes(term)) {
        rows.push({ kind: "proj", id: p.project_id, label: `Dự án: ${sanitizeUiVietnamese(p.title)}`, sub: PROJECT_STATUS_LABELS[p.status] || "" });
      }
    });
    state.departments.forEach((d) => {
      const cTitle = cleanDeptTitleVi(d.dept_id, d.title_vi);
      if (!term || `${d.dept_id} ${d.code} ${cTitle}`.toLowerCase().includes(term)) {
        rows.push({ kind: "dept", id: d.dept_id, label: `Phòng #${d.dept_id}: ${cTitle}`, sub: DIV_SHORT_NAMES[d.division_code] || "" });
      }
    });
    state.installedSkills.forEach((sk) => {
      if (term && `${sk.title_vi} ${sk.skill_slug} ${sk.repo_name}`.toLowerCase().includes(term)) {
        rows.push({ kind: "skill", label: `Kỹ năng: ${sanitizeUiVietnamese(sk.title_vi)}`, sub: sk.repo_name || "GitHub" });
      }
    });
    getDeduplicatedArticles().forEach((a) => {
      if (term && a.title.toLowerCase().includes(term)) {
        rows.push({ kind: "news", label: `Báo mới: ${sanitizeUiVietnamese(a.title)}`, sub: CONNECTOR_LABELS[a.source_connector] || "" });
      }
    });

    state.cmdItems = rows.slice(0, 14);
    state.cmdIndex = 0;
    paintCmdList();
  }

  function paintCmdList() {
    const box = document.getElementById("cmd-results");
    if (!state.cmdItems.length) {
      box.innerHTML = `<div class="list-row"><span class="row-meta">Không tìm thấy kết quả phù hợp.</span></div>`;
      return;
    }
    box.innerHTML = state.cmdItems.map((r, idx) => `
      <div class="list-row list-row-pair clickable ${idx === state.cmdIndex ? "cmd-active" : ""}" data-cmd-idx="${idx}">
        <div class="row-main">
          <div class="row-title">${esc(r.label)}</div>
          ${r.sub ? `<div class="row-meta">${esc(r.sub)}</div>` : ""}
        </div>
        <span class="row-meta">Mở</span>
      </div>
    `).join("");

    box.querySelectorAll("[data-cmd-idx]").forEach((el) => {
      el.onclick = () => executeCmdItem(Number(el.getAttribute("data-cmd-idx")));
    });
  }

  function executeCmdItem(idx) {
    const item = state.cmdItems[idx];
    if (!item) return;
    closeModals();
    if (item.kind === "msn") {
      openMissionInProgress(item.id);
    } else if (item.kind === "opp") {
      switchTab("command");
    } else if (item.kind === "task") {
      openTaskInBoard(item.id);
    } else if (item.kind === "proj") {
      openProjectWorkspace(item.id, "overview");
    } else if (item.kind === "news") {
      state.newsSubView = "articles";
      switchTab("news");
    } else if (item.kind === "skill") {
      state.newsSubView = "skills";
      switchTab("news");
    } else if (item.kind === "dept") {
      openStaffDrawer(item.id);
    }
  }

  // -------------------------------------------------------------------------
  // 14. GLOBAL EVENT BINDINGS & INIT
  // -------------------------------------------------------------------------
  function bindGlobalEvents() {
    document.querySelectorAll("#side-nav .nav-item, #mobile-nav .mob-btn").forEach((b) => {
      b.onclick = () => switchTab(b.getAttribute("data-tab"));
    });

    document.getElementById("btn-theme").onclick = () => {
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    };

    // Tab 1 live banner jump
    document.getElementById("btn-live-activity-jump").onclick = (e) => {
      state.progressCat = e.currentTarget.getAttribute("data-jump-pcat") || "all";
      switchTab("missions");
    };

    // Tab 1 Mission Composer
    const promptEl = document.getElementById("mission-prompt-input");
    const errPrompt = document.getElementById("err-mission-prompt");

    document.querySelectorAll("[data-preset]").forEach((chip) => {
      chip.onclick = () => {
        promptEl.value = chip.getAttribute("data-preset");
        promptEl.removeAttribute("aria-invalid");
        errPrompt.textContent = "";
        promptEl.focus();
      };
    });

    promptEl.addEventListener("input", () => {
      if (promptEl.value.trim()) {
        promptEl.removeAttribute("aria-invalid");
        errPrompt.textContent = "";
      }
    });

    promptEl.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        document.getElementById("form-mission-composer").requestSubmit();
      }
    });

    document.getElementById("form-mission-composer").onsubmit = (e) => {
      e.preventDefault();
      const text = promptEl.value.trim();
      if (!text) {
        promptEl.setAttribute("aria-invalid", "true");
        errPrompt.textContent = "Vui lòng nhập mô tả đề bài hoặc chọn một gợi ý nhanh bên dưới.";
        promptEl.focus();
        return;
      }
      promptEl.removeAttribute("aria-invalid");
      errPrompt.textContent = "";
      const btn = document.getElementById("btn-submit-mission");
      withLock(btn, async () => {
        const autoApp = document.getElementById("chk-auto-approve").checked;
        promptEl.value = "";
        const res = await api("/api/missions", "POST", { title: text, goal_prompt: text, auto_approve: autoApp });
        await loadEverything();
        openMissionInProgress(res && res.mission_id);
        toast(
          res && res.bridge_online
            ? "Đã gửi đề bài cho đội ngũ chuyên gia trực tuyến tiếp nhận ngay."
            : "Đã xếp đơn nhiệm vụ vào hàng đợi trực tuyến."
        );
      });
    };

    document.getElementById("btn-scan-opps").onclick = (e) => withLock(e.currentTarget, async () => {
      const res = await api("/api/opportunities/scan", "POST", {});
      await loadEverything();
      toast(sanitizeUiVietnamese((res && res.message) || "Đã gửi yêu cầu săn cơ hội kiếm tiền mới."));
    });

    document.getElementById("btn-add-opp").onclick = () => {
      document.getElementById("opp-modal-title").textContent = "Tự thêm ý tưởng kiếm tiền";
      document.getElementById("edit-opp-id").value = "";
      document.getElementById("form-opp").reset();
      document.getElementById("inp-opp-price").value = "399.000";
      openModal("modal-opp");
    };

    document.querySelectorAll("#opp-tier-filter .seg-btn").forEach((b) => {
      b.onclick = () => {
        state.oppTierFilter = b.getAttribute("data-opp-filter") || "all";
        renderCommandTab();
      };
    });

    document.getElementById("form-opp").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const oid = document.getElementById("edit-opp-id").value;
        const painVal = document.getElementById("inp-opp-pain").value.trim();
        const payload = {
          title: document.getElementById("inp-opp-title").value.trim(),
          target_customer: document.getElementById("inp-opp-cust").value.trim(),
          price_vnd: parseMoneyInput(document.getElementById("inp-opp-price").value, 399000),
          est_margin_pct: Number(document.getElementById("inp-opp-margin").value || 75),
          pain_point: painVal,
          critique_note: painVal
        };
        if (oid) await api(`/api/opportunities/${encodeURIComponent(oid)}`, "PATCH", payload);
        else await api("/api/opportunities", "POST", payload);
        closeModals();
        await loadEverything();
        toast("Đã lưu đề xuất cơ hội.");
      });
    };

    document.getElementById("form-edit-mission").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const mid = document.getElementById("edit-msn-id").value;
        await api(`/api/missions/${encodeURIComponent(mid)}`, "PATCH", {
          title: document.getElementById("inp-msn-title").value.trim(),
          goal_prompt: document.getElementById("inp-msn-goal").value.trim(),
          auto_approve: document.getElementById("inp-msn-auto").checked
        });
        closeModals();
        await loadEverything();
        toast("Đã cập nhật nhiệm vụ.");
      });
    };

    document.getElementById("form-reject").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const kind = document.getElementById("reject-target-kind").value;
        const id = document.getElementById("reject-target-id").value;
        const note = document.getElementById("inp-reject-note").value.trim();
        if (kind === "mission") {
          await api(`/api/missions/${encodeURIComponent(id)}/decision`, "POST", { decision: "REJECT", note });
        } else {
          await api(`/api/tasks/${encodeURIComponent(id)}/decision`, "POST", { decision: "REJECT", note });
        }
        closeModals();
        closeDrawer();
        await loadEverything();
        toast("Đã gửi yêu cầu làm lại cho nhân sự phụ trách.");
      });
    };

    // Tab 2: Progress Categories, Search, Status Filter & Collapse/Expand All
    document.querySelectorAll("#progress-cat-tabs .seg-btn").forEach((b) => {
      b.onclick = () => {
        state.progressCat = b.getAttribute("data-pcat");
        renderProgressTab();
      };
    });

    const progSearch = document.getElementById("progress-search-input");
    if (progSearch) progSearch.oninput = renderProgressTab;
    const progStatus = document.getElementById("filter-progress-status");
    if (progStatus) progStatus.addEventListener("change", renderProgressTab);

    const progToggleAll = document.getElementById("btn-toggle-all-progress");
    if (progToggleAll) {
      progToggleAll.onclick = () => {
        const shouldCollapse = progToggleAll.textContent.includes("Thu gọn");
        if (shouldCollapse) {
          state.openMissions.clear();
          Object.keys(state.progressGroupOpen).forEach((k) => { state.progressGroupOpen[k] = false; });
        } else {
          state.missions.forEach((m) => state.openMissions.add(m.mission_id));
          Object.keys(state.progressGroupOpen).forEach((k) => { state.progressGroupOpen[k] = true; });
        }
        renderProgressTab();
      };
    }

    document.getElementById("btn-prog-scan-news").onclick = (e) => triggerLearningScan("all", e.currentTarget);

    document.getElementById("btn-clear-completed-missions").onclick = (e) => withLock(e.currentTarget, async () => {
      const backups = state.missions.filter((m) => m.status === "COMPLETED");
      if (!backups.length) {
        toast("Hiện không có nhiệm vụ đã hoàn tất nào cần dọn.");
        return;
      }
      const res = await api("/api/missions/bulk", "POST", { action: "clear_completed" });
      await loadEverything();
      const items = backups.map((m) => ({ entity_type: "mission", entity_id: m.mission_id, backup: m }));
      toast(`Đã dọn ${res.affected || backups.length} nhiệm vụ hoàn tất.`, { items });
    });

    document.getElementById("btn-new-mission-tab2").onclick = () => {
      switchTab("command");
      promptEl.focus();
    };

    // Tab 3: Tasks Calm Toolbar, Filter Drawer, Bulk Mode & Form
    document.querySelectorAll("#task-view-mode .seg-btn").forEach((b) => {
      b.onclick = () => {
        state.taskViewMode = b.getAttribute("data-tview");
        renderTasksTab();
      };
    });

    document.getElementById("btn-toggle-task-filters").onclick = (e) => {
      const panel = document.getElementById("task-extra-filters");
      const open = panel.classList.contains("is-hidden");
      panel.classList.toggle("is-hidden", !open);
      e.currentTarget.setAttribute("aria-expanded", open ? "true" : "false");
    };

    document.getElementById("btn-toggle-bulk-mode").onclick = () => {
      state.taskBulkMode = !state.taskBulkMode;
      if (!state.taskBulkMode) state.selectedTaskIds.clear();
      renderTasksTab();
    };

    document.getElementById("filter-task-q").oninput = renderTasksTab;
    document.getElementById("filter-task-project").addEventListener("change", renderTasksTab);
    document.getElementById("filter-task-prio").addEventListener("change", renderTasksTab);
    document.getElementById("filter-task-dept").addEventListener("change", renderTasksTab);
    document.getElementById("btn-quick-task").onclick = () => openNewTaskModal("BACKLOG");
    document.getElementById("btn-add-task-tab3").onclick = () => openNewTaskModal("BACKLOG");

    const chkDispatchNow = document.getElementById("chk-task-dispatch-now");
    if (chkDispatchNow) {
      chkDispatchNow.onchange = () => {
        const isEdit = Boolean(document.getElementById("edit-task-id").value);
        const submitBtn = document.getElementById("btn-submit-task");
        if (!isEdit && submitBtn) {
          submitBtn.textContent = chkDispatchNow.checked ? "Giao AI làm ngay" : "Lưu công việc";
        }
      };
    }

    document.getElementById("form-task").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const tid = document.getElementById("edit-task-id").value;
        const title = document.getElementById("inp-task-title").value.trim();
        const desc = document.getElementById("inp-task-desc").value.trim();
        const rawDept = getListboxValue("inp-task-dept") || "AUTO";
        const dispatchNow = !tid && Boolean(document.getElementById("chk-task-dispatch-now")?.checked);
        const payload = {
          title,
          assigned_dept_id: tid ? (rawDept === "AUTO" ? smartRouteDepartmentLocal(title, desc) : rawDept) : rawDept,
          kanban_column: dispatchNow ? "IN_PROGRESS" : (getListboxValue("inp-task-col") || "BACKLOG"),
          project_id: getListboxValue("inp-task-proj") || null,
          priority: getListboxValue("inp-task-prio") || "HIGH",
          description: desc
        };
        if (dispatchNow) payload.dispatch_now = true;

        let res = null;
        if (tid) {
          res = await api(`/api/tasks/${encodeURIComponent(tid)}`, "PATCH", payload);
        } else {
          res = await api("/api/tasks", "POST", payload);
          // Safe backward compatibility if backend has not yet restarted to v9.0 dispatch_now
          if (dispatchNow && res && res.task_id && !res.dispatched && !state.staticMode) {
            await api(`/api/tasks/${encodeURIComponent(res.task_id)}/dispatch`, "POST", {}).catch(() => {});
          }
        }
        closeModals();
        await loadEverything();
        if (state.tab === "finance" && state.financeViewProjectId) {
          await loadActiveProjectFinance(state.financeViewProjectId);
        }
        if (tid) {
          toast("Đã cập nhật công việc.");
        } else if (dispatchNow) {
          const finalDeptId = (res && res.assigned_dept_id && res.assigned_dept_id !== "AUTO")
            ? res.assigned_dept_id
            : smartRouteDepartmentLocal(title, desc);
          const finalDeptName = sanitizeUiVietnamese((res && res.assigned_dept_title_vi) || deptTitle(finalDeptId));
          toast(`Đã tự giao Phòng #${finalDeptId} (${finalDeptName}) thực hiện ngay.`);
        } else {
          toast("Đã thêm công việc mới vào bảng việc.");
        }
      });
    };

    document.getElementById("btn-bulk-done").onclick = (e) => withLock(e.currentTarget, async () => {
      const ids = Array.from(state.selectedTaskIds);
      await api("/api/tasks/bulk", "POST", { action: "move_column", column: "DONE", task_ids: ids });
      state.selectedTaskIds.clear();
      await loadEverything();
      toast(`Đã đánh dấu xong ${ids.length} việc.`);
    });

    document.getElementById("btn-bulk-delete").onclick = (e) => withLock(e.currentTarget, async () => {
      const ids = Array.from(state.selectedTaskIds);
      const backups = state.tasks.filter((t) => state.selectedTaskIds.has(t.task_id));
      await api("/api/tasks/bulk", "POST", { action: "delete", task_ids: ids });
      state.selectedTaskIds.clear();
      await loadEverything();
      toast(`Đã xóa ${ids.length} công việc.`, {
        items: backups.map((t) => ({ entity_type: "task", entity_id: t.task_id, backup: t }))
      });
    });

    document.getElementById("btn-bulk-clear").onclick = () => {
      state.selectedTaskIds.clear();
      state.taskBulkMode = false;
      renderTasksTab();
    };

    // Tab 4: Staff Search, Division Listbox, Status Filter, Collapse All, Hire
    document.getElementById("staff-search").oninput = renderStaffTab;
    document.getElementById("filter-staff-div").addEventListener("change", renderStaffTab);
    document.querySelectorAll("#staff-status-filter .seg-btn").forEach((b) => {
      b.onclick = () => {
        state.staffStatusFilter = b.getAttribute("data-sstatus");
        renderStaffTab();
      };
    });

    document.getElementById("btn-toggle-all-divs").onclick = () => {
      ensureStaffDivDefaults();
      const anyClosed = DIV_ORDER.some((code) => !state.staffDivOpen[code]);
      DIV_ORDER.forEach((code) => { state.staffDivOpen[code] = anyClosed; });
      renderStaffTab();
    };

    document.getElementById("btn-open-hire").onclick = () => openModal("modal-hire");
    document.getElementById("form-hire").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const res = await api("/api/departments", "POST", {
          division: getListboxValue("inp-hire-div") || "div1-strategy-intel",
          title: document.getElementById("inp-hire-title").value.trim(),
          code: document.getElementById("inp-hire-code").value.trim(),
          mission: document.getElementById("inp-hire-mission").value.trim()
        });
        closeModals();
        document.getElementById("form-hire").reset();
        await loadEverything();
        toast(`Đã tuyển dụng Phòng #${res.dept_id}.`);
        openStaffDrawer(res.dept_id);
      });
    };

    // Tab 5: Live Scan, Sub-view Toggle, URL Reader, Filters & GitHub Skills Acquire
    document.getElementById("btn-scan-news").onclick = (e) => triggerLearningScan("all", e.currentTarget);
    document.getElementById("btn-poll-feeds-tab5").onclick = (e) => triggerLearningScan("all", e.currentTarget);
    document.getElementById("btn-goto-learning-history").onclick = () => {
      state.progressCat = "learning";
      switchTab("missions");
    };

    document.querySelectorAll("#news-subview-tabs .seg-btn").forEach((b) => {
      b.onclick = () => {
        state.newsSubView = b.getAttribute("data-nsub");
        renderNewsTab();
      };
    });

    document.getElementById("form-read-url").onsubmit = (e) => {
      e.preventDefault();
      const btn = document.getElementById("btn-submit-read-url");
      withLock(btn, async () => {
        const url = document.getElementById("url-to-read").value.trim();
        const dept = getListboxValue("url-dept-select") || "01";
        await api("/api/learning/ingest-url", "POST", { url, dept_id: dept });
        document.getElementById("url-to-read").value = "";
        await Promise.all([loadNews(""), loadEverything()]);
        toast("Chuyên gia đã đọc sạch nội dung và lưu bài báo.");
      });
    };

    document.querySelectorAll("#news-star-filter .seg-btn").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll("#news-star-filter .seg-btn").forEach((x) => {
          x.classList.remove("active");
          x.setAttribute("aria-selected", "false");
        });
        b.classList.add("active");
        b.setAttribute("aria-selected", "true");
        state.newsStarFilter = b.getAttribute("data-nfilter");
        renderNewsTab();
      };
    });

    document.getElementById("filter-news-div").addEventListener("change", renderNewsTab);
    let searchT = null;
    document.getElementById("news-search-input").oninput = (e) => {
      clearTimeout(searchT);
      searchT = setTimeout(() => loadNews(e.target.value), 120);
    };

    document.getElementById("skill-search-input").oninput = renderSkillsPanel;
    document.getElementById("filter-skill-div").addEventListener("change", renderSkillsPanel);
    document.getElementById("filter-skill-dept").addEventListener("change", renderSkillsPanel);

    document.getElementById("form-acquire-skill").onsubmit = (e) => {
      e.preventDefault();
      const btn = document.getElementById("btn-acquire-skill");
      const outEl = document.getElementById("skill-acquire-result");
      withLock(btn, async () => {
        const rawInput = document.getElementById("inp-skill-query").value.trim();
        const targetDept = getListboxValue("inp-skill-dept") || "";
        const isUrl = /^https?:\/\/github\.com\//i.test(rawInput);
        const payload = {
          dept_id: targetDept || null,
          query: isUrl ? "" : rawInput,
          repo_url: isUrl ? rawInput : ""
        };
        const res = await api("/api/skills/acquire", "POST", payload);
        document.getElementById("inp-skill-query").value = "";
        await loadEverything();
        const msg = sanitizeUiVietnamese((res && res.summary_vi) || `Đã nạp thành công ${res.acquired_count || 0} kỹ năng mới cho nhân sự.`);
        if (outEl) {
          outEl.textContent = msg;
          outEl.classList.remove("is-hidden");
        }
        toast(msg);
      });
    };

    // Tab 6/7: Projects, Ledger Modal, Doc Modal & Cloud Backup
    document.getElementById("btn-new-proj").onclick = openNewProjectModal;

    document.getElementById("form-proj").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const pid = document.getElementById("edit-proj-id").value;
        const payload = {
          title: document.getElementById("inp-proj-title").value.trim(),
          slug: document.getElementById("inp-proj-slug").value.trim(),
          expected_price_vnd: parseMoneyInput(document.getElementById("inp-proj-price").value, 399000),
          status: getListboxValue("inp-proj-status") || "ACTIVE",
          objective: document.getElementById("inp-proj-obj").value.trim()
        };
        if (pid) {
          await api(`/api/projects/${encodeURIComponent(pid)}`, "PATCH", payload);
          await loadEverything();
          if (state.financeViewProjectId === pid) await loadActiveProjectFinance(pid);
          if (state.selectedProjectId === pid) await loadProjectDetail(pid);
        } else {
          const created = await api("/api/projects", "POST", payload);
          await loadEverything();
          if (created && created.project_id) {
            if (state.tab === "projects") {
              await openProjectWorkspace(created.project_id, "overview");
            } else {
              state.financeViewProjectId = created.project_id;
              renderFinanceTab();
              await loadActiveProjectFinance(created.project_id);
            }
          }
        }
        closeModals();
        toast("Đã lưu thông tin dự án.");
      });
    };

    document.getElementById("form-ledger").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const eid = document.getElementById("edit-ledger-id").value;
        const pid = document.getElementById("edit-ledger-pid").value || state.selectedProjectId || state.financeViewProjectId;
        const amt = Number(document.getElementById("inp-ledger-amount").value);
        if (Number.isNaN(amt) || amt < 0) {
          throw new Error("Số tiền phải là số không âm hợp lệ.");
        }
        const payload = {
          entry_type: getListboxValue("inp-ledger-type") || "EXPENSE",
          is_estimate: getListboxValue("inp-ledger-est") === "1",
          title: document.getElementById("inp-ledger-title").value.trim(),
          amount_vnd: amt,
          entry_date: document.getElementById("inp-ledger-date").value || todayIso(),
          category: document.getElementById("inp-ledger-category").value.trim() || "Vận hành",
          note: document.getElementById("inp-ledger-note").value.trim()
        };
        if (eid) {
          await api(`/api/finance/ledger/${encodeURIComponent(eid)}`, "PATCH", payload);
        } else {
          await api(`/api/projects/${encodeURIComponent(pid)}/finance/ledger`, "POST", payload);
        }
        closeModals();
        await loadEverything();
        if (pid && state.financeViewProjectId === pid) await loadActiveProjectFinance(pid);
        if (pid && state.selectedProjectId === pid) await loadProjectDetail(pid);
        toast(eid ? "Đã cập nhật bút toán tài chính." : "Đã ghi nhận bút toán vào sổ thu chi dự án.");
      });
    };

    document.getElementById("form-rework").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const missionId = document.getElementById("rework-mission-id").value || null;
        const projectId = document.getElementById("rework-project-id").value || null;
        const taskId = document.getElementById("rework-task-id").value || null;
        const stepOrder = Number(document.getElementById("rework-step-order").value || 0);
        const sourceDeptId = getListboxValue("inp-rework-source") || "53";
        const targetDeptId = getListboxValue("inp-rework-target") || "13";
        const sourceRoleType =
          sourceDeptId === "53" ? "DIV9_DEFECT_TRIAGE" :
          sourceDeptId === "51" ? "DIV9_QA_QC" :
          sourceDeptId === "52" ? "DIV9_FEATURE_AUDIT" :
          sourceDeptId === "49" ? "DIV9_UX_SIMPLICITY" : "DIV_INTERNAL_CRITIC";
        const payload = {
          mission_id: missionId,
          project_id: projectId,
          task_id: taskId,
          step_order: stepOrder,
          source_dept_id: sourceDeptId,
          source_role_type: sourceRoleType,
          target_dept_id: targetDeptId,
          defect_category: getListboxValue("inp-rework-cat") || "BUG",
          severity: getListboxValue("inp-rework-sev") || "HIGH",
          title: document.getElementById("inp-rework-title").value.trim(),
          detail_vi: document.getElementById("inp-rework-detail").value.trim()
        };
        await api("/api/rework/bounce", "POST", payload);
        closeModals();
        if (missionId) {
          state.missionViewTabs[missionId] = "rework";
          state.openMissions.add(missionId);
        }
        await loadEverything();
        if (projectId && state.selectedProjectId === projectId) {
          await loadProjectDetail(projectId);
        }
        if (document.getElementById("inspector-drawer")?.classList.contains("open") && state.activeStaffDrawerDeptId) {
          openStaffDrawer(state.activeStaffDrawerDeptId);
        }
        toast(`Đã đẩy trả phiếu sửa lỗi từ Phòng #${sourceDeptId} về Phòng #${targetDeptId} (${deptTitle(targetDeptId)}).`);
      });
    };

    // Modal 12: Quy trình 9 Khối & Danh bạ 54 Phòng ban
    const btnOpenOrgSop = document.getElementById("btn-open-org-sop");
    if (btnOpenOrgSop) {
      btnOpenOrgSop.onclick = () => openOrgSopModal("sop");
    }
    document.querySelectorAll("#org-sop-tabs .seg-btn").forEach((b) => {
      b.onclick = () => switchOrgSopTab(b.getAttribute("data-org-tab"));
    });
    const formPlanRoster = document.getElementById("form-plan-roster");
    if (formPlanRoster) {
      formPlanRoster.onsubmit = (e) => {
        e.preventDefault();
        const goal = document.getElementById("inp-roster-goal")?.value.trim() || "";
        const ptype = getListboxValue("inp-roster-type") || "AUTO";
        runPlanRoster(goal, ptype, document.getElementById("btn-plan-roster"));
      };
    }
    const dirSearch = document.getElementById("inp-dir-search");
    if (dirSearch) dirSearch.oninput = renderOrgDirectoryList;
    const dirDiv = document.getElementById("filter-dir-div");
    if (dirDiv) dirDiv.addEventListener("change", renderOrgDirectoryList);

    // Modal 13: Chuyển việc ngang / Đẩy lên Tổng Giám đốc #00 / Phân công lại
    const formHandoff = document.getElementById("form-handoff");
    if (formHandoff) {
      formHandoff.onsubmit = (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn-submit-handoff");
        withLock(btn, async () => {
          const actionKind = document.getElementById("handoff-action-kind").value || "CREATE";
          const hoId = document.getElementById("handoff-edit-id").value || "";
          const mode = document.getElementById("handoff-mode").value || "PEER_HANDOFF";
          const fromDept = document.getElementById("handoff-from-dept").value || "00";
          const toDept = mode === "CEO_ESCALATION" ? "00" : (getListboxValue("inp-handoff-to") || "00");
          const missionId = getListboxValue("inp-handoff-mission") || null;
          const reasonVi = document.getElementById("inp-handoff-reason").value.trim();
          const payloadVi = document.getElementById("inp-handoff-payload").value.trim();

          if (actionKind === "REROUTE" && hoId) {
            const resolvedTo = getListboxValue("inp-handoff-to") || "";
            if (!resolvedTo) throw new Error("Vui lòng chọn phòng ban cần phân công.");
            await api(`/api/handoffs/${encodeURIComponent(hoId)}`, "PATCH", {
              status: "REROUTED_BY_CEO",
              resolved_to_dept_id: resolvedTo,
              ceo_note_vi: payloadVi || `Tổng Giám đốc #00 phân công sang Phòng #${resolvedTo}.`
            });
            closeModals();
            await loadEverything();
            if (document.getElementById("inspector-drawer")?.classList.contains("open") && state.activeStaffDrawerDeptId) {
              openStaffDrawer(state.activeStaffDrawerDeptId);
            }
            toast(`Tổng Giám đốc #00 đã phân công phiếu sang Phòng #${resolvedTo} (${deptTitle(resolvedTo)}).`);
            return;
          }

          if (!reasonVi) throw new Error("Vui lòng nhập lý do chuyển việc hoặc nội dung cần hỗ trợ.");
          await api("/api/handoffs", "POST", {
            from_dept_id: fromDept,
            to_dept_id: toDept,
            mode,
            reason_vi: reasonVi,
            payload_vi: payloadVi,
            mission_id: missionId
          });
          closeModals();
          await loadEverything();
          if (document.getElementById("inspector-drawer")?.classList.contains("open") && state.activeStaffDrawerDeptId) {
            openStaffDrawer(state.activeStaffDrawerDeptId);
          }
          toast(
            mode === "CEO_ESCALATION"
              ? `Đã đẩy yêu cầu từ Phòng #${fromDept} lên Tổng Giám đốc #00 phân xử.`
              : `Đã chuyển việc ngang từ Phòng #${fromDept} sang Phòng #${toDept} (${deptTitle(toDept)}) và gửi bản sao #00.`
          );
        });
      };
    }

    // Modal 14: Giao 9 Khối nâng cấp dự án
    const formProjUpgrade = document.getElementById("form-project-upgrade");
    if (formProjUpgrade) {
      formProjUpgrade.onsubmit = (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn-submit-upgrade");
        withLock(btn, async () => {
          const pid = document.getElementById("upgrade-project-id").value;
          const goal = document.getElementById("inp-upgrade-goal").value.trim();
          const autoApp = Boolean(document.getElementById("chk-upgrade-auto")?.checked);
          if (!pid) throw new Error("Không xác định được dự án cần nâng cấp.");
          if (!goal) throw new Error("Vui lòng nhập yêu cầu nâng cấp cụ thể cho 9 Khối.");
          const res = await api(`/api/projects/${encodeURIComponent(pid)}/upgrade`, "POST", {
            upgrade_goal: goal,
            auto_approve: autoApp
          });
          closeModals();
          await loadEverything();
          if (state.selectedProjectId === pid) await loadProjectDetail(pid);
          const createdMid = res && res.mission && res.mission.mission_id;
          if (createdMid) {
            openMissionInProgress(createdMid);
          }
          toast("Đã giao 9 Khối khởi chạy nhiệm vụ nâng cấp dự án.");
        });
      };
    }

    // Modal 15: Tạo chiến dịch Video AI (Google Flow / YouTube / TikTok)
    const formMediaCamp = document.getElementById("form-media-campaign");
    if (formMediaCamp) {
      formMediaCamp.onsubmit = (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn-submit-media-campaign");
        withLock(btn, async () => {
          const pid = document.getElementById("media-project-id").value || state.selectedProjectId || "";
          const title = document.getElementById("inp-media-title").value.trim();
          const platform = getListboxValue("inp-media-platform") || "TIKTOK";
          const angle = document.getElementById("inp-media-angle").value.trim();
          const schedule = document.getElementById("inp-media-schedule").value.trim();
          if (!title) throw new Error("Vui lòng nhập tiêu đề chiến dịch Video AI.");
          await api("/api/media/campaigns", "POST", {
            project_id: pid || null,
            title,
            platform,
            angle_vi: angle,
            publish_schedule_vi: schedule
          });
          closeModals();
          await loadEverything();
          if (pid && state.selectedProjectId === pid) {
            state.projectDetailSubTab = "media";
            await loadProjectDetail(pid);
          }
          toast("Khối 5 đã sinh xong kịch bản, câu lệnh Google Flow và ảnh bìa chiến dịch Video AI.");
        });
      };
    }

    document.getElementById("inp-doc-title").oninput = (e) => {
      document.getElementById("inp-doc-filename").value = `${slugifyVi(e.target.value)}.md`;
    };

    document.getElementById("form-doc").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const pid = state.selectedProjectId || state.financeViewProjectId;
        if (!pid) throw new Error("Hãy chọn một dự án trước khi tạo tài liệu.");
        const docTitle = document.getElementById("inp-doc-title").value.trim();
        let fname = document.getElementById("inp-doc-filename").value.trim();
        if (!fname.endsWith(".md")) fname += ".md";
        await api(`/api/projects/${encodeURIComponent(pid)}/files`, "POST", {
          file: fname,
          content: `# ${docTitle}\n\n- **Mục tiêu:** \n- **Kế hoạch triển khai:** \n`
        });
        closeModals();
        state.currentDocFile = fname;
        await loadProjectDocs(pid, true);
        if (state.selectedProjectId === pid) await loadProjectDetail(pid);
        toast("Đã tạo tài liệu mới.");
      });
    };

    document.getElementById("btn-clear-events").onclick = (e) => withLock(e.currentTarget, async () => {
      const res = await api("/api/events", "DELETE");
      toast(`Đã dọn sạch ${res.cleared || 0} dòng nhật ký cũ.`);
    });

    document.getElementById("btn-export-json").onclick = (e) => withLock(e.currentTarget, async () => {
      const snap = await api("/api/sync/snapshot");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" }));
      a.download = `titan-sao-luu-${todayIso()}.json`;
      a.click();
    });

    document.getElementById("btn-cloud-vault").onclick = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("titan_vault_v5") || "null");
        if (saved && saved.repo) document.getElementById("inp-cloud-repo").value = saved.repo;
      } catch (_e) {}
      openModal("modal-cloud");
    };

    document.getElementById("form-cloud").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const repo = document.getElementById("inp-cloud-repo").value.trim();
        const token = document.getElementById("inp-cloud-token").value.trim();
        const pin = document.getElementById("inp-cloud-pin").value;
        if (!repo || !token || pin.length < 4) {
          throw new Error("Vui lòng nhập đủ tên kho lưu trữ, khóa truy cập và mã bảo vệ tối thiểu 4 ký tự.");
        }
        await cryptoVault.save(repo, token, pin);
        document.getElementById("inp-cloud-token").value = "";
        toast("Đã mã hóa AES-256 và cất khóa an toàn trên thiết bị.");
      });
    };

    document.getElementById("btn-cloud-sync-now").onclick = (e) => withLock(e.currentTarget, syncWithCloudVault);

    // Command Palette
    document.getElementById("btn-cmd-palette").onclick = () => { openModal("modal-cmd"); renderCmd(""); };
    const cmdInp = document.getElementById("cmd-input");
    cmdInp.oninput = (e) => renderCmd(e.target.value);
    cmdInp.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        state.cmdIndex = Math.min(state.cmdItems.length - 1, state.cmdIndex + 1);
        paintCmdList();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        state.cmdIndex = Math.max(0, state.cmdIndex - 1);
        paintCmdList();
      } else if (e.key === "Enter" && state.cmdItems.length > 0) {
        e.preventDefault();
        executeCmdItem(state.cmdIndex);
      }
    });

    document.getElementById("drawer-backdrop").onclick = closeDrawer;
    document.getElementById("btn-close-drawer").onclick = closeDrawer;
    document.getElementById("modal-backdrop").onclick = closeModals;
    document.querySelectorAll("[data-close-modal]").forEach((b) => { b.onclick = closeModals; });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openMenu = document.querySelector(".listbox-menu:not([hidden])");
        if (openMenu) {
          e.preventDefault();
          closeAllListboxes();
          return;
        }
        const hasOpen = document.querySelector(".modal.open, .drawer.open");
        if (hasOpen) {
          e.preventDefault();
          e.stopPropagation();
          closeModals();
          closeDrawer();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openModal("modal-cmd");
        renderCmd("");
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b" && state.tab === "tasks") {
        e.preventDefault();
        state.taskViewMode = state.taskViewMode === "grouped" ? "board" : "grouped";
        renderTasksTab();
        return;
      }

      const tag = (e.target && e.target.tagName) || "";
      if (["INPUT", "TEXTAREA"].includes(tag) || e.ctrlKey || e.metaKey || e.altKey) return;

      const order = ["command", "projects", "missions", "tasks", "staff", "news", "finance"];
      if (e.key >= "1" && e.key <= "7") {
        e.preventDefault();
        switchTab(order[Number(e.key) - 1]);
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        openNewTaskModal("BACKLOG");
      } else if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
      }
    }, true);
  }

  async function init() {
    applyTheme(localStorage.getItem("titan_theme") || "light");
    initStaticListboxes();
    bindGlobalEvents();

    const hash = (window.location.hash || "").replace("#", "");
    if (VIEW_TITLES[hash]) state.tab = hash;

    await detectOnlineEndpoint();
    try {
      await Promise.all([loadEverything(), loadNews("")]);
    } catch (_e) {
      await activateOfflineFallback("/api/overview", "GET", null, new Error("Ngoại tuyến")).catch(() => {});
      populateDynamicListboxes();
      renderAllViews();
    }

    switchTab(state.tab);
    startLiveStream();
    startBackgroundSyncLoop();
    if (!state.staticMode) {
      state.bridgeTimer = setInterval(pollBridgeStatus, 5000);
    } else {
      scheduleOnlineReconnect();
    }

    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
