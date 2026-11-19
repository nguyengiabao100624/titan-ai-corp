/* ==========================================================================
   TRUNG TAM DIEU HANH TITAN v8.0 (XIAS v3.1.1 ATLAS CONSOLE)
   100% Tieng Viet, 0 emoji, 0 <select> goc, 1 luong truc tuyen duy nhat
   ========================================================================== */
(() => {
  "use strict";

  const VIEW_TITLES = {
    command: "Giao việc",
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
    ACTIVE: "Đang triển khai",
    PAUSED: "Tạm dừng",
    SHIPPED: "Đã ra mắt",
    ARCHIVED: "Lưu trữ"
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
    "div9-critique-ux-lab": "Khối 9: Phản biện và Kiểm thử khách hàng",
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
    "50": "Trinh sát Cơ hội và Thiết kế Sản phẩm Sinh lời"
  };

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
    "Kiến trúc sư Giao diện": "Thiết kế hệ thống giao diện, bố cục đáp ứng và kiểm định trải nghiệm.",
    "Kỹ sư Kết nối Trực tuyến": "Vận hành máy chủ, cơ sở dữ liệu và đồng bộ trực tuyến đa thiết bị.",
    "Chuyên gia Kho Kỹ năng": "Sưu tầm, kiểm duyệt và huấn luyện bộ kỹ năng chuyên môn cho phòng ban."
  };

  const MSG_TYPE_VI = {
    HANDOFF: { label: "Chuyền việc", cls: "badge-run", icon: "arrow-right" },
    UPDATE: { label: "Đang xử lý", cls: "badge-idle", icon: "clock" },
    CRITIQUE: { label: "Phản biện rủi ro", cls: "badge-wait", icon: "shield-check" },
    QA_REPORT: { label: "Kiểm thử khách hàng", cls: "badge-wait", icon: "check-square" },
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
    financeSummary: null,
    activeProjectFinance: null,
    progressCat: "all",
    missionFilter: "",
    taskViewMode: "grouped",
    taskBulkMode: false,
    taskGroupOpen: { WAITING_APPROVAL: true, ACTIVE: true, PENDING: true, DONE: false },
    staffStatusFilter: "",
    staffDivOpen: null,
    newsSubView: "articles",
    newsStarFilter: "all",
    financeViewProjectId: "",
    projectSubTab: "finance",
    selectedTaskIds: new Set(),
    expandedNewsIds: new Set(),
    currentDocFile: "",
    docEditMode: false,
    cmdIndex: 0,
    cmdItems: [],
    sse: null,
    bridgeTimer: null,
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
      [/\bQA\b/g, "Kiểm định chất lượng"],
      [/\bPAT\b/g, "khóa truy cập"],
      [/\bKPI\b/g, "chỉ số"],
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
    if (st === "WORKING" || st === "BUSY" || st === "RUNNING" || st === "ACTIVE") return "WORKING";
    return "IDLE";
  }

  function deptStatusMeta(raw) {
    const norm = normalizeDeptStatus(raw);
    if (norm === "WORKING") return { norm, label: "Đang làm việc", cls: "badge-run", icon: "activity" };
    if (norm === "STUDYING") return { norm, label: "Đang học", cls: "badge-study", icon: "book-open" };
    if (norm === "BLOCKED") return { norm, label: "Đang bị chặn", cls: "badge-fail", icon: "alert-circle" };
    return { norm: "IDLE", label: "Sẵn sàng", cls: "badge-idle", icon: "check" };
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
    setListboxOptions("filter-news-div", divFilterOptions, false);
    setListboxOptions("filter-skill-div", divFilterOptions, false);
    setListboxOptions("inp-ledger-type", [
      { value: "REVENUE", label: "Doanh thu (Thu)" },
      { value: "EXPENSE", label: "Chi phí (Chi)" },
      { value: "TAX_RESERVE", label: "Dự phòng thuế (Thuế)" }
    ], false);
    setListboxOptions("inp-ledger-est", [
      { value: "0", label: "Thực tế phát sinh" },
      { value: "1", label: "Kế hoạch dự toán" }
    ], false);

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
          finance_summary: computeCorporateFinanceFallback()
        };
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
          project_ledger: state.projectLedger
        };
      }
    }

    // Offline mutations with safe local state update
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
      const nt = { task_id: `task-${Date.now()}`, kanban_column: body.kanban_column || "BACKLOG", priority: body.priority || "HIGH", ...body };
      state.tasks.unshift(nt);
      saveOfflineViewCache();
      return nt;
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
      if (undoPayload.entity_type === "doc" && state.financeViewProjectId) {
        await loadProjectDocs(state.financeViewProjectId);
      }
      if (undoPayload.entity_type === "ledger" && state.financeViewProjectId) {
        await loadActiveProjectFinance(state.financeViewProjectId);
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
    const staffTotal = state.departments.length || 51;
    const uniqueNewsCount = getDeduplicatedArticles().length;
    const skillsCount = state.installedSkills.length;

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
      const taskOrd = activeOrders.find((o) => o.order_type === "EXECUTE_TASK");
      if (learningRunning) {
        const lp = state.learningProgress;
        actBanner.classList.remove("is-hidden");
        actText.textContent = `Đang quét báo mới (${lp.sources_done || 0}/${lp.sources_total || 24}): ${sanitizeUiVietnamese(lp.current_source_vi || "Đang xử lý nguồn tin...")}`;
        actBtn.setAttribute("data-jump-pcat", "learning");
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

    const busyStaff = state.departments.filter((d) => normalizeDeptStatus(d.status) !== "IDLE").length;
    const readyPct = Math.round(((staffTotal - busyStaff) / Math.max(1, staffTotal)) * 100);
    const sideSummary = document.getElementById("sidebar-staff-summary");
    const sideFill = document.getElementById("sidebar-readiness-fill");
    if (sideSummary) {
      sideSummary.textContent = busyStaff > 0
        ? `${busyStaff} phòng đang hoạt động, ${staffTotal - busyStaff} phòng sẵn sàng`
        : `${staffTotal} phòng chuyên gia sẵn sàng nhận đề bài`;
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
              <button type="button" class="btn btn-xs" data-goto-missions>Xem chi tiết</button>
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
    const visibleOpps = state.opportunities.filter((o) => o.status !== "DISMISSED");
    if (!visibleOpps.length) {
      oppGrid.innerHTML = `
        <div class="empty-state opp-card-lead">
          <p>Chưa có đề xuất cơ hội nào. Nhấn <strong>Săn cơ hội mới</strong> để Phòng #50 tìm kiếm và phân tích cho bạn.</p>
        </div>
      `;
      return;
    }

    oppGrid.innerHTML = visibleOpps.map((o, idx) => {
      const isAccepted = o.status === "ACCEPTED";
      const isLead = idx === 0 && visibleOpps.length >= 2;
      const descText = sanitizeUiVietnamese(o.pain_point || o.critique_note || "");
      return `
        <article class="opp-card ${isLead ? "opp-card-lead" : ""}">
          <div class="opp-head">
            <div>
              ${isLead ? `<p class="eyebrow">Cơ hội nổi bật nhất</p>` : ""}
              <h3 class="opp-title">${esc(sanitizeUiVietnamese(o.title))}</h3>
            </div>
            ${isAccepted
              ? `<span class="badge badge-done">${ico("check")}<span>Đã triển khai</span></span>`
              : `<span class="badge badge-run">${ico("compass")}<span>Sẵn sàng</span></span>`
            }
          </div>

          <p class="row-meta">Khách trả tiền: <strong>${esc(sanitizeUiVietnamese(o.target_customer))}</strong></p>

          <div class="opp-metrics mono">
            <span>Biên lãi gộp: <strong class="opp-metric-ok">${Number(o.est_margin_pct || 75).toFixed(0)}%</strong></span>
            <span>Hòa vốn: <strong>${o.breakeven_users || 5} khách</strong></span>
            <span>Điểm phản biện: <strong>${o.survival_score || 86}/100</strong></span>
          </div>

          <p class="opp-critique">${esc(descText)}</p>

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

  function renderSwarmGraphSvg(m) {
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
    return `
      <div class="room-graph-wrap">
        <p class="row-meta">Sơ đồ phối hợp chuyền việc giữa các nhóm chuyên gia từ Giai đoạn 1 (Nghiên cứu và Chốt kèo) sang Giai đoạn 2 (Sản xuất Sản phẩm Cuối và Kiểm thử khách hàng).</p>
        <svg class="room-graph-svg" viewBox="0 0 940 220" role="img" aria-label="Sơ đồ chuyền việc 8 bước của nhiệm vụ">
          <title>Sơ đồ chuyền việc 8 bước</title>
          <desc>Giai đoạn 1 gồm nghiên cứu thị trường, tài chính và giá bán, phản biện rủi ro, cổng duyệt 1. Giai đoạn 2 gồm kỹ sư sản phẩm, đóng gói bán hàng, kiểm thử khách hàng và bàn giao.</desc>
          <defs>
            <marker id="${graphId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path class="graph-arrow-fill" d="M 0 1 L 10 5 L 0 9 z" />
            </marker>
          </defs>
          <rect class="graph-zone" x="6" y="6" width="454" height="208" rx="12" />
          <text class="graph-zone-title" x="18" y="24">GIAI ĐOẠN 1: NGHIÊN CỨU, TÍNH LÃI VÀ CHỐT KÈO</text>
          <rect class="graph-zone graph-zone-active" x="476" y="6" width="458" height="208" rx="12" />
          <text class="graph-zone-title graph-zone-title-active" x="488" y="24">GIAI ĐOẠN 2: SẢN XUẤT SẢN PHẨM CUỐI VÀ BÀN GIAO</text>

          ${box(18, 38, 154, 68, 1, "Bước 1: Trinh sát", "#01, #02, #03, #50")}
          ${box(18, 126, 154, 68, 2, "Bước 2: Tài chính", "#38, #39")}
          ${box(196, 82, 130, 68, 3, "Bước 3: Phản biện", "#46, #47, #06")}
          ${box(348, 82, 100, 68, 4, "Cổng 1", "Duyệt chốt kèo")}

          ${box(488, 38, 154, 68, 5, "Bước 5: Sản phẩm", "#13 đến #19")}
          ${box(488, 126, 154, 68, 6, "Bước 6: Bán hàng", "Trang bán, 50 khách")}
          ${box(666, 82, 134, 68, 7, "Bước 7: Kiểm thử", "#48, #49, #20")}
          ${box(822, 82, 100, 68, 8, "Cổng 2", "Bàn giao cuối")}

          <path class="graph-edge" d="M 172 72 L 194 106" marker-end="url(#${graphId})" />
          <path class="graph-edge" d="M 172 160 L 194 126" marker-end="url(#${graphId})" />
          <path class="graph-edge" d="M 326 116 L 346 116" marker-end="url(#${graphId})" />
          <path class="graph-edge-active" d="M 448 116 L 486 72" marker-end="url(#${graphId})" />
          <path class="graph-edge-active" d="M 448 116 L 486 160" marker-end="url(#${graphId})" />
          <path class="graph-edge" d="M 642 72 L 664 106" marker-end="url(#${graphId})" />
          <path class="graph-edge" d="M 642 160 L 664 126" marker-end="url(#${graphId})" />
          <path class="graph-edge-active" d="M 800 116 L 820 116" marker-end="url(#${graphId})" />
        </svg>
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

  function renderSwarmMembersPanel(m, msgs, prebuiltMembers = null) {
    const members = prebuiltMembers || buildMissionMembersList(m, msgs);
    if (!members.length) {
      return `<div class="room-feed"><p class="row-meta">Chưa có thành viên chuyên trách nào được kích hoạt cho nhiệm vụ này.</p></div>`;
    }
    return `
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
    `;
  }

  function buildMissionCardHtml(m) {
    let swarmWorkers = [];
    try { swarmWorkers = JSON.parse(m.swarm_workers_json || "[]"); } catch (_e) {}
    const isQueued = m.status === "RUNNING" && m.dispatch_state === "QUEUED_FOR_ANTIGRAVITY";
    const isSwarm = m.status === "RUNNING" && m.dispatch_state === "SWARM_ACTIVE";

    const isProposalGate = m.phase === "PROPOSAL" && (m.total_steps || 8) >= 8;
    const isProductionPhase = m.phase === "PRODUCTION";
    const phaseBadge = isProductionPhase
      ? `<span class="badge badge-run">${ico("layers")}<span>Giai đoạn 2: Sản xuất Sản phẩm Cuối</span></span>`
      : m.phase === "DELIVERED"
      ? `<span class="badge badge-done">${ico("check")}<span>Đã bàn giao Sản phẩm Cuối</span></span>`
      : `<span class="badge badge-idle">${ico("compass")}<span>Giai đoạn 1: Nghiên cứu và Chốt kèo</span></span>`;

    const stBadge =
      m.status === "COMPLETED" ? `<span class="badge badge-done">${ico("check")}<span>Đã nghiệm thu hoàn tất</span></span>` :
      (m.status === "WAITING_CHAIRMAN" && isProposalGate) ? `<span class="badge badge-wait">${ico("flag")}<span>Chờ duyệt kèo -> Sản xuất sản phẩm</span></span>` :
      m.status === "WAITING_CHAIRMAN" ? `<span class="badge badge-wait">${ico("flag")}<span>Chờ nghiệm thu Sản phẩm Cuối</span></span>` :
      m.status === "PAUSED" ? `<span class="badge badge-idle">${ico("pause")}<span>Đang tạm dừng</span></span>` :
      isSwarm ? `<span class="badge badge-run">${ico("activity")}<span>Đang thực thi: Bước ${m.current_step_order || 1}/${m.total_steps || 8}</span></span>` :
      isQueued ? `<span class="badge badge-wait">${ico("clock")}<span>Đã đưa vào hàng đợi trực tuyến</span></span>` :
      `<span class="badge badge-run">${ico("activity")}<span>Bước ${m.current_step_order || 1}/${m.total_steps || 8}</span></span>`;

    const uniqueWorkerNames = Array.from(new Set(swarmWorkers.map((w) => viWorkerLabel(w)).filter(Boolean)));
    const workerChipsHtml = uniqueWorkerNames.length
      ? `<div class="chip-row">${uniqueWorkerNames.map((w) => `<span class="worker-tag">${esc(w)}</span>`).join("")}</div>`
      : "";

    const msnMsgs = state.swarmMessages.filter((x) => x.mission_id === m.mission_id);
    const msnMembers = buildMissionMembersList(m, msnMsgs);
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
      activeSubTab === "graph" ? renderSwarmGraphSvg(m) :
      `<div class="stepper-list">${stepsHtml}</div>`;

    return `
      <article class="mission-card">
        <div class="mission-header">
          <div class="mission-title-group">
            <h3 class="mission-title">${esc(sanitizeUiVietnamese(m.title))}</h3>
            <div class="mission-badges">${phaseBadge}${stBadge}</div>
            ${workerChipsHtml}
          </div>

          <div class="progress-row">
            <span class="mono doc-name-label">${m.progress_pct || 0}%</span>
            <div class="progress-track">
              <div class="progress-fill" style="inline-size:${m.progress_pct || 0}%;"></div>
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
              ${ico("layers")}<span>Tiến độ ${m.total_steps || 8} bước</span>
            </button>
            <button type="button" class="seg-btn ${activeSubTab === "board" ? "active" : ""}" role="tab" aria-selected="${activeSubTab === "board" ? "true" : "false"}" data-msn-subtab="${esc(m.mission_id)}:board">
              ${ico("message-square")}<span>Bảng trao đổi (${msnMsgs.length})</span>
            </button>
            <button type="button" class="seg-btn ${activeSubTab === "members" ? "active" : ""}" role="tab" aria-selected="${activeSubTab === "members" ? "true" : "false"}" data-msn-subtab="${esc(m.mission_id)}:members">
              ${ico("users")}<span>Đội ngũ tham gia (${msnMembers.length})</span>
            </button>
            <button type="button" class="seg-btn ${activeSubTab === "graph" ? "active" : ""}" role="tab" aria-selected="${activeSubTab === "graph" ? "true" : "false"}" data-msn-subtab="${esc(m.mission_id)}:graph">
              ${ico("git-branch")}<span>Sơ đồ chuyền việc</span>
            </button>
          </div>
          <span class="room-caption">Phòng họp trực tiếp: 100% Tiếng Việt</span>
        </div>

        ${bodyHtml}
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

  function renderLearningRunsSectionHtml(limit = 20) {
    const runs = (state.learningRuns || []).slice(0, limit);
    const liveHtml = renderLearningProgressCardHtml();
    if (!runs.length && !liveHtml) {
      return `
        <div class="empty-state">
          <h3>Chưa có đợt học tri thức hoặc nạp kỹ năng nào</h3>
          <p>Nhấn Quét báo mới ngay để 51 phòng chuyên gia tự đọc 24 nguồn tin thị trường và ghi nhận kết quả tại đây.</p>
          <button type="button" class="btn btn-primary" data-trigger-learn-all>${ico("refresh-cw")}<span>Quét báo mới ngay</span></button>
        </div>
      `;
    }
    return `
      <div class="section-block">
        ${liveHtml}
        <div class="sec-head">
          <h2 class="sec-title">Lịch sử Học tri thức và Kỹ năng (${runs.length})</h2>
          <button type="button" class="btn btn-xs btn-primary" data-trigger-learn-all>${ico("refresh-cw")}<span>Quét báo mới ngay</span></button>
        </div>
        ${runs.length ? `
          <div class="hairline-list">
            ${runs.map((r) => {
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
        ` : ""}
      </div>
    `;
  }

  function renderOrdersSectionHtml(orderType, title, emptyMsg, actionHtml) {
    const items = (state.orders || []).filter((o) => o.order_type === orderType);
    if (!items.length) {
      return `
        <div class="empty-state">
          <h3>${esc(title)}</h3>
          <p>${esc(emptyMsg)}</p>
          ${actionHtml}
        </div>
      `;
    }
    return `
      <div class="section-block">
        <div class="sec-head">
          <h2 class="sec-title">${esc(title)} (${items.length})</h2>
          ${actionHtml}
        </div>
        <div class="hairline-list">
          ${items.map((o) => {
            const st = ORDER_STATUS_VI[String(o.status || "PENDING").toUpperCase()] || ORDER_STATUS_VI.PENDING;
            const detail = sanitizeUiVietnamese(o.result_summary || o.instructions || "");
            return `
              <div class="list-row">
                <div class="row-main">
                  <div class="action-group">
                    <span class="badge ${st.cls}">${ico(st.icon)}<span>${st.label}</span></span>
                    <span class="mono row-meta">${esc(shortDate(o.created_at))} ${esc(shortTime(o.created_at))}</span>
                  </div>
                  <div class="row-title">${esc(sanitizeUiVietnamese(o.title || o.order_id))}</div>
                  ${detail ? `<div class="row-meta">${esc(detail)}</div>` : ""}
                </div>
                <div class="row-actions">
                  ${orderType === "SCAN_OPPORTUNITIES"
                    ? `<button type="button" class="btn btn-xs" data-goto-tab="command">Xem cơ hội</button>`
                    : `<button type="button" class="btn btn-xs" data-goto-tab="tasks">Mở bảng việc</button>`
                  }
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderProgressTab() {
    const oppOrders = (state.orders || []).filter((o) => o.order_type === "SCAN_OPPORTUNITIES");
    const taskOrders = (state.orders || []).filter((o) => o.order_type === "EXECUTE_TASK");
    const runningM = state.missions.filter((m) => m.status === "RUNNING").length;
    const activeOrdersCnt = (state.orders || []).filter((o) => ["PENDING", "RUNNING", "IN_PROGRESS"].includes(String(o.status || "").toUpperCase())).length;
    const learningRunning = Boolean(state.learningProgress && state.learningProgress.running);
    const totalActive = runningM + activeOrdersCnt + (learningRunning ? 1 : 0);

    document.getElementById("prog-hero-active").textContent = totalActive;
    document.getElementById("prog-cnt-missions").textContent = state.missions.length;
    document.getElementById("prog-cnt-opps").textContent = oppOrders.length;
    document.getElementById("prog-cnt-learning").textContent = state.learningRuns.length;

    const noteEl = document.getElementById("prog-hero-note");
    if (noteEl) {
      noteEl.textContent = totalActive > 0
        ? `Đang có ${totalActive} hoạt động chạy trực tuyến (${runningM} dự án 8 bước, ${activeOrdersCnt} lệnh xử lý${learningRunning ? ", 1 đợt quét báo mới" : ""}).`
        : "Tất cả luồng xử lý hiện đã ổn định. Xem chi tiết từng nhóm bên dưới.";
    }

    document.querySelectorAll("#progress-cat-tabs .seg-btn").forEach((b) => {
      const on = b.getAttribute("data-pcat") === state.progressCat;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });

    const subFilterRow = document.getElementById("mission-filter-tabs");
    const subFilterAct = document.getElementById("mission-subfilter-actions");
    const showMissionFilters = state.progressCat === "missions";
    subFilterRow.classList.toggle("is-hidden", !showMissionFilters);
    subFilterAct.classList.toggle("is-hidden", !(state.progressCat === "missions" || state.progressCat === "all"));

    const box = document.getElementById("progress-content-container");
    const filteredMissions = state.missions.filter((m) => !state.missionFilter || m.status === state.missionFilter);

    if (state.progressCat === "missions") {
      if (!filteredMissions.length) {
        box.innerHTML = `
          <div class="empty-state">
            <h3>Chưa có dự án 8 bước nào ở trạng thái này</h3>
            <p>Giao một đề bài mới để xem toàn bộ 8 bước thực thi, phản biện rủi ro và kiểm thử khách hàng trực tiếp tại đây.</p>
            <button type="button" class="btn btn-primary" data-goto-tab="command">${ico("plus")}<span>Giao nhiệm vụ mới</span></button>
          </div>
        `;
      } else {
        box.innerHTML = filteredMissions.map(buildMissionCardHtml).join("");
      }
    } else if (state.progressCat === "opps") {
      box.innerHTML = renderOrdersSectionHtml(
        "SCAN_OPPORTUNITIES",
        "Đợt săn cơ hội kiếm tiền",
        "Chưa có đợt săn cơ hội nào gần đây. Bấm nút bên dưới để Phòng #50 và #46 quét cơ hội mới.",
        `<button type="button" class="btn btn-xs btn-primary" data-trigger-scan-opps>${ico("compass")}<span>Săn cơ hội mới</span></button>`
      );
    } else if (state.progressCat === "learning") {
      box.innerHTML = renderLearningRunsSectionHtml(25);
    } else if (state.progressCat === "tasks") {
      box.innerHTML = renderOrdersSectionHtml(
        "EXECUTE_TASK",
        "Đầu việc lẻ giao chuyên gia",
        "Chưa có đầu việc lẻ nào được giao chạy tự động. Mở Bảng việc và bấm Giao AI làm trên một công việc bất kỳ.",
        `<button type="button" class="btn btn-xs btn-primary" data-goto-tab="tasks">${ico("check-square")}<span>Mở bảng việc</span></button>`
      );
    } else {
      // Unified real-time feed: Live learning + Recent orders + Learning runs + 8-step missions
      const parts = [];
      const liveCard = renderLearningProgressCardHtml();
      if (liveCard) parts.push(liveCard);

      if (oppOrders.length) {
        parts.push(renderOrdersSectionHtml(
          "SCAN_OPPORTUNITIES",
          "Đợt săn cơ hội gần đây",
          "",
          `<button type="button" class="btn btn-xs" data-trigger-scan-opps>${ico("compass")}<span>Săn cơ hội mới</span></button>`
        ));
      }
      if (state.missions.length) {
        parts.push(`
          <div class="section-block">
            <div class="sec-head">
              <h2 class="sec-title">Dự án 8 bước (${state.missions.length})</h2>
            </div>
            <div class="mission-list">${state.missions.map(buildMissionCardHtml).join("")}</div>
          </div>
        `);
      }
      if (taskOrders.length) {
        parts.push(renderOrdersSectionHtml(
          "EXECUTE_TASK",
          "Đầu việc giao AI gần đây",
          "",
          `<button type="button" class="btn btn-xs" data-goto-tab="tasks">Xem bảng việc</button>`
        ));
      }
      if (state.learningRuns.length) {
        parts.push(renderLearningRunsSectionHtml(5));
      }
      if (!parts.length) {
        parts.push(`
          <div class="empty-state">
            <h3>Chưa có hoạt động nào đang chạy</h3>
            <p>Giao một nhiệm vụ mới, săn cơ hội hoặc quét báo mới để theo dõi tiến độ toàn tập đoàn tại đây.</p>
            <button type="button" class="btn btn-primary" data-goto-tab="command">${ico("plus")}<span>Bắt đầu giao việc</span></button>
          </div>
        `);
      }
      box.innerHTML = parts.join("");
    }

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
              const metaLine = `${projectTitle(t.project_id)}, Phòng #${t.assigned_dept_id}, Ưu tiên ${PRIO_LABELS[t.priority] || "Cao"}`;
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
        </div>
        <p class="row-meta">Dự án: <strong>${esc(projectTitle(t.project_id))}</strong></p>
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
    if (state.staffDivOpen !== null) return;
    state.staffDivOpen = {};
    let anyActive = false;
    DIV_ORDER.forEach((code) => {
      const hasBusy = state.departments.some((d) => d.division_code === code && normalizeDeptStatus(d.status) !== "IDLE");
      if (hasBusy) {
        state.staffDivOpen[code] = true;
        anyActive = true;
      } else {
        state.staffDivOpen[code] = false;
      }
    });
    if (!anyActive) {
      state.staffDivOpen["exec-board"] = true;
      state.staffDivOpen["div9-critique-ux-lab"] = true;
    }
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
          <p>Thử đổi từ khóa tìm kiếm hoặc bỏ lọc trạng thái để xem đầy đủ 51 phòng ban.</p>
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

      return `
        <div class="acc-card">
          <button type="button" class="acc-trigger" aria-expanded="${isOpen ? "true" : "false"}" data-toggle-div="${esc(code)}">
            <span class="acc-trigger-left">
              <span>${esc(divName)}</span>
              <span class="badge badge-idle">${members.length} phòng</span>
              ${workingCnt > 0 ? `<span class="badge badge-run">${ico("activity")}<span>${workingCnt} đang làm</span></span>` : ""}
              ${studyingCnt > 0 ? `<span class="badge badge-study">${ico("book-open")}<span>${studyingCnt} đang học</span></span>` : ""}
            </span>
            <span class="acc-trigger-right">${ico("chevron-down", "ico-sm acc-chevron")}</span>
          </button>
          <div class="acc-panel ${isOpen ? "open" : ""}" data-div-panel="${esc(code)}">
            <div class="acc-inner">
              <div class="acc-body">
                <div class="division-staff-grid">
                  ${members.map((d) => {
                    const st = deptStatusMeta(d.status);
                    const cleanName = cleanDeptTitleVi(d.dept_id, d.title_vi);
                    const skCnt = skillsCountForDept(d.dept_id);
                    const artCnt = Number(d.articles_learned || 0);
                    return `
                      <button type="button" class="staff-card" data-open-staff="${esc(d.dept_id)}">
                        <span class="sq-avatar">#${esc(d.dept_id)}</span>
                        <span class="staff-info">
                          <span class="row-title">${esc(cleanName)}</span>
                          <span class="staff-foot">
                            <span class="badge ${st.cls}">${ico(st.icon)}<span>${st.label}</span></span>
                          </span>
                          <span class="mono row-meta">${artCnt} bài đã học, ${skCnt} kỹ năng GitHub</span>
                        </span>
                      </button>
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
    document.getElementById("drawer-backdrop").classList.add("open");
    document.getElementById("inspector-drawer").classList.add("open");
    const body = document.getElementById("drawer-body");
    body.innerHTML = `<p class="row-meta">Đang tải hồ sơ phòng chuyên gia...</p>`;

    try {
      const d = await api(`/api/departments/${encodeURIComponent(deptId)}`);
      const cleanName = cleanDeptTitleVi(d.dept_id, d.title_vi);
      document.getElementById("drawer-heading").textContent = `Phòng #${d.dept_id}: ${cleanName}`;
      const isCustom = Number(d.dept_id) > 50;
      const st = deptStatusMeta(d.status);
      const deptSkills = Array.isArray(d.installed_skills) && d.installed_skills.length
        ? d.installed_skills
        : state.installedSkills.filter((sk) => parseDeptIdsJson(sk.dept_ids_json || sk.dept_ids).includes(d.dept_id));

      body.innerHTML = `
        <div class="action-group">
          <span class="badge ${st.cls}">${ico(st.icon)}<span>${st.label}</span></span>
          <span class="mono row-meta">Hoàn tất: <strong>${d.tasks_completed || 0} việc</strong></span>
          <span class="mono row-meta">Bài học: <strong>${(d.learned_articles || []).length}</strong></span>
          <span class="mono row-meta">Kỹ năng: <strong>${deptSkills.length}</strong></span>
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
        const deptsCnt = Array.isArray(last.touched_depts) ? last.touched_depts.length : (Number(last.touched_depts_count) || 51);
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
                  <td><button type="button" class="btn btn-xs btn-primary" data-manage-proj="${esc(p.project_id)}">Quản lý dự án</button></td>
                </tr>
              `).join("") : `<tr><td colspan="8" class="row-meta">Chưa có dự án nào. Bấm Tạo dự án mới ở góc trên bên phải.</td></tr>`}
            </tbody>
          </table>
        </div>
      `;

      body.querySelectorAll("[data-manage-proj]").forEach((btn) => {
        btn.onclick = async () => {
          const pid = btn.getAttribute("data-manage-proj");
          state.financeViewProjectId = pid;
          state.projectSubTab = "finance";
          renderFinanceTab();
          await loadActiveProjectFinance(pid);
        };
      });
      return;
    }

    // Specific Project Workspace (4 Sub-Tabs)
    const data = state.activeProjectFinance || computeProjectFinanceFallback(state.financeViewProjectId);
    if (!data || !data.project) {
      state.financeViewProjectId = "";
      renderFinanceTab();
      return;
    }

    const p = data.project;
    const s = data.summary || {};
    const ledger = data.ledger || [];
    const pTasks = data.tasks || state.tasks.filter((t) => t.project_id === p.project_id);
    const pMissions = data.missions || state.missions.filter((m) => m.project_id === p.project_id);
    const previews = Array.isArray(s.preview_urls) ? s.preview_urls : [];
    const statusLbId = `proj-status-live-${p.project_id}`;

    let subBodyHtml = "";
    if (state.projectSubTab === "finance") {
      const actNet = Number(s.actual_net_profit_vnd || 0);
      subBodyHtml = `
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
    } else if (state.projectSubTab === "overview") {
      subBodyHtml = `
        <div class="split-2">
          <div class="card stack-sm">
            <h3 class="sec-title">Mục tiêu và Thị trường mục tiêu</h3>
            <p class="step-summary">${esc(sanitizeUiVietnamese(p.objective || "Chưa cập nhật mục tiêu chi tiết cho dự án này."))}</p>
            ${s.target_market ? `<p class="row-meta">Thị trường mục tiêu: <strong>${esc(sanitizeUiVietnamese(s.target_market))}</strong></p>` : ""}
            <p class="row-meta">Giá bán mục tiêu: <strong class="mono">${esc(vnd(s.expected_price_vnd || p.expected_price_vnd || 0))} / tháng</strong></p>
          </div>
          <div class="card stack-sm">
            <h3 class="sec-title">Nhiệm vụ 8 bước liên kết (${pMissions.length})</h3>
            ${pMissions.length ? `
              <div class="hairline-list">
                ${pMissions.map((m) => `
                  <div class="list-row">
                    <div class="row-main">
                      <div class="row-title">${esc(sanitizeUiVietnamese(m.title))}</div>
                      <div class="row-meta">Tiến độ: ${m.progress_pct || 0}%, Giai đoạn: ${m.phase === "DELIVERED" ? "Đã bàn giao" : m.phase === "PRODUCTION" ? "Sản xuất sản phẩm" : "Nghiên cứu chốt kèo"}</div>
                    </div>
                    <button type="button" class="btn btn-xs" data-goto-missions>Mở phòng họp</button>
                  </div>
                `).join("")}
              </div>
            ` : `<p class="row-meta">Chưa có nhiệm vụ 8 bước gắn với dự án này.</p>`}
          </div>
        </div>
      `;
    } else if (state.projectSubTab === "tasks") {
      subBodyHtml = `
        <div class="section-block">
          <div class="sec-head">
            <h3 class="sec-title">Công việc thuộc dự án (${pTasks.length})</h3>
            <button type="button" class="btn btn-xs btn-primary" id="btn-add-task-for-proj">${ico("plus")}<span>Giao việc cho dự án này</span></button>
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
          ` : `<div class="empty-state"><p>Dự án này chưa có công việc nào. Nhấn Giao việc cho dự án này để bắt đầu.</p></div>`}
        </div>
      `;
    } else {
      // Sub-tab 4: Tài liệu và Sản phẩm
      subBodyHtml = `
        <div class="stack-md">
          ${previews.length ? `
            <div class="preview-cards-grid">
              ${previews.map((pv) => {
                const href = typeof pv === "string" ? pv : (pv.url || pv.href || "");
                const label = typeof pv === "string"
                  ? (pv.includes("landing") ? "Mở Trang giới thiệu bán hàng" : "Mở Ứng dụng dùng thử trực tiếp")
                  : sanitizeUiVietnamese(pv.label || "Mở sản phẩm trực tiếp");
                const safeHref = href.startsWith("./") || href.startsWith("/") ? (state.staticMode ? href : `${API_BASE}${href.replace(/^\./, "")}`) : href;
                return `
                  <div class="preview-card">
                    <div class="row-main">
                      <div class="row-title">${esc(label)}</div>
                      <div class="mono row-meta">${esc(href)}</div>
                    </div>
                    <a class="btn btn-xs btn-primary" href="${esc(safeHref)}" target="_blank" rel="noopener noreferrer">${ico("external-link")}<span>Mở dùng thử</span></a>
                  </div>
                `;
              }).join("")}
            </div>
          ` : ""}

          <div class="card stack-md">
            <div class="sec-head">
              <h3 class="sec-title">Cây tệp tài liệu dự án</h3>
              <button type="button" class="btn btn-xs btn-primary" id="btn-new-doc">${ico("file-text")}<span>Tạo tài liệu mới</span></button>
            </div>
            <div class="split-2">
              <div class="hairline-list" id="project-docs-list"></div>
              <div class="stack-sm">
                <div class="sec-head">
                  <span class="doc-name-label" id="doc-current-name">Chưa chọn tài liệu</span>
                  <div class="action-group" id="doc-editor-actions" hidden>
                    <button type="button" class="btn btn-xs" id="btn-toggle-doc-edit">Sửa nội dung</button>
                    <button type="button" class="btn btn-xs btn-primary is-hidden" id="btn-save-doc">Lưu tài liệu</button>
                    <button type="button" class="btn btn-xs btn-destructive" id="btn-delete-doc">${ico("trash")}<span>Xóa tệp</span></button>
                  </div>
                </div>
                <div id="doc-pretty-view" class="doc-viewer rendered-md">Chọn một tệp tài liệu bên trái để đọc hoặc chỉnh sửa.</div>
                <textarea id="doc-raw-editor" class="textarea mono doc-editor is-hidden" aria-label="Trình soạn thảo tài liệu"></textarea>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    body.innerHTML = `
      <div class="card stack-md">
        <div class="toolbar-row">
          <div class="row-main">
            <h2 class="mission-title">${esc(sanitizeUiVietnamese(p.title))}</h2>
            <p class="row-meta">Tiến độ công việc: <strong>${s.tasks_done || 0}/${s.tasks_total || 0} việc (${s.progress_pct || 0}%)</strong></p>
          </div>
          <div class="action-group">
            <div class="listbox-field listbox-inline listbox-compact" data-dynamic-listbox="${esc(statusLbId)}">
              <input type="hidden" value="${esc(p.status || "ACTIVE")}" />
              <button type="button" class="listbox-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="lb-${esc(statusLbId)}" aria-label="Đổi trạng thái dự án">
                <span class="listbox-value">${esc(PROJECT_STATUS_LABELS[p.status] || "Đang triển khai")}</span>
                ${ico("chevron-down", "ico-xs listbox-chevron")}
              </button>
              <ul class="listbox-menu" id="lb-${esc(statusLbId)}" role="listbox" tabindex="-1" hidden></ul>
            </div>
            ${previews.slice(0, 1).map((pv) => {
              const href = typeof pv === "string" ? pv : (pv.url || pv.href || "");
              const safeHref = href.startsWith("./") || href.startsWith("/") ? (state.staticMode ? href : `${API_BASE}${href.replace(/^\./, "")}`) : href;
              return `<a class="btn btn-xs btn-primary" href="${esc(safeHref)}" target="_blank" rel="noopener noreferrer">${ico("external-link")}<span>Mở sản phẩm</span></a>`;
            }).join("")}
            <button type="button" class="btn btn-xs" data-edit-proj="${esc(p.project_id)}">${ico("pencil")}<span>Sửa dự án</span></button>
            <button type="button" class="btn btn-xs btn-destructive" data-del-proj="${esc(p.project_id)}">${ico("trash")}<span>Xóa dự án</span></button>
          </div>
        </div>

        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress_pct || 0}">
          <div class="progress-fill" style="inline-size:${Math.max(2, s.progress_pct || 0)}%;"></div>
        </div>

        <div class="segmented" role="tablist" aria-label="Phân mục quản trị dự án">
          <button type="button" class="seg-btn ${state.projectSubTab === "finance" ? "active" : ""}" role="tab" aria-selected="${state.projectSubTab === "finance" ? "true" : "false"}" data-proj-subtab="finance">Báo cáo Tài chính</button>
          <button type="button" class="seg-btn ${state.projectSubTab === "overview" ? "active" : ""}" role="tab" aria-selected="${state.projectSubTab === "overview" ? "true" : "false"}" data-proj-subtab="overview">Tổng quan và Cột mốc</button>
          <button type="button" class="seg-btn ${state.projectSubTab === "tasks" ? "active" : ""}" role="tab" aria-selected="${state.projectSubTab === "tasks" ? "true" : "false"}" data-proj-subtab="tasks">Công việc dự án (${pTasks.length})</button>
          <button type="button" class="seg-btn ${state.projectSubTab === "docs" ? "active" : ""}" role="tab" aria-selected="${state.projectSubTab === "docs" ? "true" : "false"}" data-proj-subtab="docs">Tài liệu và Sản phẩm</button>
        </div>
      </div>

      ${subBodyHtml}
    `;

    // Bind project status listbox
    const stWrap = body.querySelector(`[data-dynamic-listbox="${statusLbId}"]`);
    if (stWrap) {
      const ctrl = setupListboxElement(stWrap, statusLbId, async (newStatus) => {
        await api(`/api/projects/${encodeURIComponent(p.project_id)}`, "PATCH", { status: newStatus });
        await loadEverything();
        await loadActiveProjectFinance(p.project_id);
        toast(`Đã chuyển trạng thái dự án sang ${PROJECT_STATUS_LABELS[newStatus] || newStatus}.`);
      });
      if (ctrl) {
        ctrl.setOptions(Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label })), false);
        ctrl.setValue(p.status || "ACTIVE", true);
      }
    }

    body.querySelectorAll("[data-proj-subtab]").forEach((btn) => {
      btn.onclick = () => {
        state.projectSubTab = btn.getAttribute("data-proj-subtab");
        renderFinanceTabBody();
      };
    });

    if (state.projectSubTab === "finance") {
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
    } else if (state.projectSubTab === "tasks") {
      const addTaskProjBtn = document.getElementById("btn-add-task-for-proj");
      if (addTaskProjBtn) addTaskProjBtn.onclick = () => openNewTaskModal("BACKLOG", p.project_id);
    } else if (state.projectSubTab === "docs") {
      bindDocEditorEvents(p.project_id);
      loadProjectDocs(p.project_id, true);
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

  async function loadProjectDocs(pid, keepCurrentFile = true) {
    const dBox = document.getElementById("project-docs-list");
    if (!dBox) return;
    if (!pid || state.staticMode) {
      dBox.innerHTML = `<div class="list-row"><span class="row-meta">Tài liệu dự án sẽ tải tự động khi kênh trực tuyến đang mở.</span></div>`;
      return;
    }
    try {
      const res = await api(`/api/projects/${encodeURIComponent(pid)}/files`);
      const files = res.files || [];
      if (!files.length) {
        dBox.innerHTML = `<div class="list-row"><span class="row-meta">Chưa có tệp tài liệu nào. Nhấn Tạo tài liệu mới.</span></div>`;
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
      if (pvEl) { pvEl.innerHTML = renderCleanMarkdown(doc.content || ""); pvEl.classList.remove("is-hidden"); }
      if (saveEl) saveEl.classList.add("is-hidden");
      if (togEl) togEl.textContent = "Sửa nội dung";
    } catch (_e) {}
  }

  // -------------------------------------------------------------------------
  // 12. QUICK ACTIONS, BULK BAR & MODALS
  // -------------------------------------------------------------------------
  function bindQuickActions(root) {
    root.querySelectorAll("[data-open-staff]").forEach((el) => {
      el.onclick = (e) => { e.stopPropagation(); openStaffDrawer(el.getAttribute("data-open-staff")); };
    });

    root.querySelectorAll("[data-open-task-drawer]").forEach((el) => {
      el.onclick = (e) => { e.stopPropagation(); openTaskDrawer(el.getAttribute("data-open-task-drawer")); };
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
      b.onclick = async () => {
        const pid = b.getAttribute("data-open-proj");
        state.financeViewProjectId = pid;
        state.projectSubTab = "finance";
        switchTab("finance");
        await loadActiveProjectFinance(pid);
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
    document.getElementById("task-modal-title").textContent = "Thêm công việc mới";
    document.getElementById("edit-task-id").value = "";
    document.getElementById("form-task").reset();
    setListboxValue("inp-task-col", defaultCol, true);
    setListboxValue("inp-task-prio", "HIGH", true);
    setListboxValue("inp-task-proj", defaultProj, true);
    openModal("modal-task");
  }

  function populateDynamicListboxes() {
    const deptItems = state.departments.map((d) => ({
      value: d.dept_id,
      label: `#${d.dept_id}: ${cleanDeptTitleVi(d.dept_id, d.title_vi)}`
    }));
    if (deptItems.length) {
      setListboxOptions("inp-task-dept", deptItems, true, "modal-task");
      setListboxOptions("url-dept-select", deptItems, true);
      setListboxOptions("filter-task-dept", [{ value: "", label: "Mọi phòng ban" }, ...deptItems], true);
      setListboxOptions("filter-skill-dept", [{ value: "", label: "Tất cả phòng ban" }, ...deptItems], true);
      setListboxOptions("inp-skill-dept", [{ value: "", label: "Tự động chọn phòng phù hợp" }, ...deptItems], true);
    }

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
        loadEverything();
        if (evtType.includes("LEARNING") || evtType.includes("ARTICLE") || state.tab === "news") {
          loadNews(document.getElementById("news-search-input").value || "");
        }
      }, 240);
    });
    es.onerror = () => {
      es.close();
      if (!state.staticMode) setTimeout(startLiveStream, 3500);
    };
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
        rows.push({ kind: "msn", label: `Nhiệm vụ: ${sanitizeUiVietnamese(m.title)}`, sub: "Tiến độ 8 bước" });
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
      state.progressCat = "missions";
      switchTab("missions");
    } else if (item.kind === "opp") {
      switchTab("command");
    } else if (item.kind === "task") {
      switchTab("tasks");
      openTaskDrawer(item.id);
    } else if (item.kind === "proj") {
      state.financeViewProjectId = item.id;
      state.projectSubTab = "finance";
      switchTab("finance");
      loadActiveProjectFinance(item.id);
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
        state.progressCat = "missions";
        switchTab("missions");
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

    // Tab 2: Progress Categories & Mission Filters
    document.querySelectorAll("#progress-cat-tabs .seg-btn").forEach((b) => {
      b.onclick = () => {
        state.progressCat = b.getAttribute("data-pcat");
        renderProgressTab();
      };
    });

    document.querySelectorAll("#mission-filter-tabs .chip-btn").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll("#mission-filter-tabs .chip-btn").forEach((x) => {
          x.classList.remove("active");
          x.setAttribute("aria-selected", "false");
        });
        b.classList.add("active");
        b.setAttribute("aria-selected", "true");
        state.missionFilter = b.getAttribute("data-mfilter");
        renderProgressTab();
      };
    });

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

    document.getElementById("form-task").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const tid = document.getElementById("edit-task-id").value;
        const payload = {
          title: document.getElementById("inp-task-title").value.trim(),
          assigned_dept_id: getListboxValue("inp-task-dept") || "00",
          kanban_column: getListboxValue("inp-task-col") || "BACKLOG",
          project_id: getListboxValue("inp-task-proj") || null,
          priority: getListboxValue("inp-task-prio") || "HIGH",
          description: document.getElementById("inp-task-desc").value.trim()
        };
        if (tid) await api(`/api/tasks/${encodeURIComponent(tid)}`, "PATCH", payload);
        else await api("/api/tasks", "POST", payload);
        closeModals();
        await loadEverything();
        if (state.tab === "finance" && state.financeViewProjectId) {
          await loadActiveProjectFinance(state.financeViewProjectId);
        }
        toast(tid ? "Đã cập nhật công việc." : "Đã thêm công việc mới.");
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

    // Tab 6: Projects, Ledger Modal, Doc Modal & Cloud Backup
    document.getElementById("btn-new-proj").onclick = () => {
      document.getElementById("proj-modal-title").textContent = "Tạo dự án mới";
      document.getElementById("edit-proj-id").value = "";
      document.getElementById("wrap-proj-slug").classList.remove("is-hidden");
      document.getElementById("form-proj").reset();
      document.getElementById("inp-proj-price").value = "399.000";
      setListboxValue("inp-proj-status", "ACTIVE", true);
      openModal("modal-proj");
    };

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
        } else {
          const created = await api("/api/projects", "POST", payload);
          await loadEverything();
          if (created && created.project_id) {
            state.financeViewProjectId = created.project_id;
            state.projectSubTab = "finance";
            renderFinanceTab();
            await loadActiveProjectFinance(created.project_id);
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
        const pid = document.getElementById("edit-ledger-pid").value || state.financeViewProjectId;
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
        if (pid) await loadActiveProjectFinance(pid);
        toast(eid ? "Đã cập nhật bút toán tài chính." : "Đã ghi nhận bút toán vào sổ thu chi dự án.");
      });
    };

    document.getElementById("inp-doc-title").oninput = (e) => {
      document.getElementById("inp-doc-filename").value = `${slugifyVi(e.target.value)}.md`;
    };

    document.getElementById("form-doc").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const pid = state.financeViewProjectId;
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

      const order = ["command", "missions", "tasks", "staff", "news", "finance"];
      if (e.key >= "1" && e.key <= "6") {
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
