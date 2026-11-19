/* ==========================================================================
   TRUNG TAM DIEU HANH TITAN v7.0 (XIAS v3.1.1 ATLAS CONSOLE)
   100% Tieng Viet, 0 emoji, 0 <select> mac dinh, 1 luong truc tuyen duy nhat
   ========================================================================== */
(() => {
  "use strict";

  const VIEW_TITLES = {
    command: "Giao việc",
    missions: "Tiến độ",
    tasks: "Bảng việc",
    staff: "Nhân sự",
    news: "Báo mới",
    finance: "Tài chính và Giá bán"
  };

  const COL_LABELS = {
    BACKLOG: "Hàng đợi",
    IN_PROGRESS: "Đang làm",
    QA_SECURITY_REVIEW: "Kiểm định chất lượng",
    WAITING_APPROVAL: "Chờ bạn duyệt",
    REJECTED: "Cần sửa lại",
    DONE: "Hoàn tất"
  };

  const PRIO_LABELS = {
    CRITICAL: "Khẩn cấp",
    HIGH: "Cao",
    MEDIUM: "Trung bình",
    LOW: "Thấp"
  };

  const PROJECT_STATUS_LABELS = {
    ACTIVE: "Đang chạy",
    PLANNING: "Đang lập kế hoạch",
    PAUSED: "Tạm dừng",
    SHIPPED: "Đã ra mắt",
    ARCHIVED: "Lưu trữ"
  };

  const CONNECTOR_LABELS = {
    vn_news: "Báo kinh tế Việt Nam",
    google_news: "Tin tức tổng hợp",
    creator_seo_pulse: "Xu hướng tăng trưởng",
    security_advisory: "Cảnh báo an ninh",
    arxiv: "Nghiên cứu công nghệ",
    github_repo: "Mã nguồn mở",
    hackernews: "Diễn đàn công nghệ",
    deep_url: "Bài đọc từ liên kết",
    cloud_sync: "Đồng bộ đám mây",
    bench_rss: "Bản tin tổng hợp"
  };

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
    "@cfo": "Chuyên gia Tài chính và Giá bán",
    "@tai-chinh-thue": "Chuyên gia Tài chính và Thuế",
    "@critic": "Hội đồng Phản biện Rủi ro",
    "@phan-bien-doc-lap": "Hội đồng Phản biện và An ninh",
    "@ky-su-san-pham": "Kỹ sư Phát triển Sản phẩm",
    "@doi-ban-hang": "Đội Đóng gói và Bán hàng",
    "@tester-khach-hang": "Kiểm thử viên Khách hàng thật",
    "@kien-truc-giao-dien": "Kiến trúc sư Giao diện",
    "@ket-noi-truc-tuyen": "Kỹ sư Kết nối Trực tuyến",
    "@coordinator": "Tổng Điều phối",
    "@dieu-phoi": "Tổng Điều phối"
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
    missionFilter: "",
    taskViewMode: "list",
    staffDivFilter: "",
    newsStarFilter: "all",
    selectedTaskIds: new Set(),
    expandedNewsIds: new Set(),
    selectedProjectId: "",
    currentDocFile: "",
    docEditMode: false,
    cmdIndex: 0,
    cmdItems: [],
    sse: null,
    bridgeTimer: null,
    reconnectTimer: null
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
    return (Number(n) || 0).toLocaleString("vi-VN") + " đ";
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

  function sanitizeUiVietnamese(raw) {
    if (!raw) return "";
    let s = String(raw);
    s = s.replace(/[\u2014\u2013]/g, ": ");
    s = s.replace(/\s*\(@[a-z0-9_-]+\)/gi, "");
    s = s.replace(/\s*\((?:PM|UX|UI|PMO|CRO|FP&A|BI|CTR|SEO\s*\/\s*GEO\s*\/\s*AEO|OUTBOUND SDR|HIGH-TICKET[^)]*|RETENTION[^)]*)\)/gi, "");
    const replacements = [
      [/Antigravity Swarm/gi, "Đội ngũ Chuyên gia Titan"],
      [/Antigravity/gi, "Hệ thống Titan"],
      [/Pre-Mortem/gi, "Phản biện rủi ro"],
      [/BUILD_PRODUCT/g, "Sản xuất sản phẩm cuối"],
      [/Code\s*\/\s*Web\s*\/\s*App/gi, "Ứng dụng Web và Di động"],
      [/Landing Page/gi, "Trang giới thiệu bán hàng"],
      [/Tester đóng vai/gi, "Kiểm thử viên đóng vai"],
      [/\bTester\b/gi, "Kiểm thử khách hàng"],
      [/\bCFO\b/g, "Tài chính và Giá bán"],
      [/\bQA\b/g, "Kiểm định chất lượng"],
      [/\bPAT\b/g, "khóa truy cập"],
      [/\bKPI\b/g, "chỉ số"],
      [/\bCSV\b/g, "bảng dữ liệu"],
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

  function viWorkerLabel(slug) {
    if (!slug) return "";
    const k = String(slug).trim().toLowerCase();
    const key = k.startsWith("@") ? k : `@${k}`;
    if (WORKER_VI_MAP[key]) return WORKER_VI_MAP[key];
    return sanitizeUiVietnamese(String(slug).replace(/^@/, "").replace(/-/g, " "));
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

  // Non-dimming Loading State with accessible spinner
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

    const colOptionsAll = [
      { value: "", label: "Mọi trạng thái" },
      { value: "BACKLOG", label: COL_LABELS.BACKLOG },
      { value: "IN_PROGRESS", label: COL_LABELS.IN_PROGRESS },
      { value: "QA_SECURITY_REVIEW", label: COL_LABELS.QA_SECURITY_REVIEW },
      { value: "WAITING_APPROVAL", label: COL_LABELS.WAITING_APPROVAL },
      { value: "REJECTED", label: COL_LABELS.REJECTED },
      { value: "DONE", label: COL_LABELS.DONE }
    ];
    const colOptionsTask = colOptionsAll.slice(1);

    const prioOptionsAll = [
      { value: "", label: "Mọi độ ưu tiên" },
      { value: "CRITICAL", label: PRIO_LABELS.CRITICAL },
      { value: "HIGH", label: PRIO_LABELS.HIGH },
      { value: "MEDIUM", label: PRIO_LABELS.MEDIUM },
      { value: "LOW", label: PRIO_LABELS.LOW }
    ];
    const prioOptionsTask = prioOptionsAll.slice(1);

    const projStatusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label }));

    setListboxOptions("filter-task-col", colOptionsAll, false);
    setListboxOptions("inp-task-col", colOptionsTask, false);
    setListboxOptions("filter-task-prio", prioOptionsAll, false);
    setListboxOptions("inp-task-prio", prioOptionsTask, false);
    setListboxValue("inp-task-prio", "HIGH", true);
    setListboxOptions("inp-proj-status", projStatusOptions, false);

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
  // 3. WEBCRYPTO AES-256-GCM ENCRYPTED CLOUD SYNC VAULT
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
  // 4. SINGLE ONLINE FLOW (online_endpoint.json -> DIRECT -> SNAPSHOT FALLBACK)
  // -------------------------------------------------------------------------
  function saveOfflineViewCache() {
    if (!state.staticMode) return;
    try {
      localStorage.setItem("titan_v7_offline_cache", JSON.stringify({
        missions: state.missions,
        opportunities: state.opportunities,
        tasks: state.tasks,
        projects: state.projects,
        articles: state.articles
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
    // 1. Auto-discover public HTTPS bridge from cloud_state/online_endpoint.json
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

    // 2. Check same-origin online API (when opened directly via live backend address)
    if (await probeHealthEndpoint("", 2000)) {
      API_BASE = "";
      state.staticMode = false;
      state.onlineSource = "DIRECT";
      return true;
    }

    // 3. Fallback to latest published snapshot (read/queue mode until online bridge resumes)
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
            state.lastSyncAt = snap.exported_at || new Date().toISOString();
            break;
          }
        } catch (_e) {}
      }
    }
    if (!state.staticMode) throw origErr;
    return handleOfflineFallback(path, method, body);
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
          swarm_messages: state.swarmMessages
        };
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
          schema_version: "7.0",
          bridge: state.bridge,
          divisions: state.divisions,
          departments: state.departments,
          projects: state.projects,
          tasks: state.tasks,
          missions: state.missions,
          opportunities: state.opportunities,
          orders: state.orders,
          knowledge_atoms: state.articles
        };
      }
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
      if (m) {
        Object.assign(m, body);
        if (body.status === "RUNNING") m.dispatch_state = "QUEUED_FOR_ANTIGRAVITY";
      }
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
          if (ids.has(t.task_id)) {
            t.kanban_column = body.column;
            affected += 1;
          }
        });
      }
      saveOfflineViewCache();
      return { affected, deleted_ids: [] };
    }
    if (method === "POST" && path === "/api/projects") {
      const np = { project_id: `proj-${slugifyVi(body.slug || body.title)}`, status: body.status || "ACTIVE", ...body };
      state.projects.unshift(np);
      saveOfflineViewCache();
      return np;
    }
    if (method === "PATCH" && path.startsWith("/api/projects/")) {
      const pid = path.split("/")[3];
      const p = state.projects.find((x) => x.project_id === pid);
      if (p) Object.assign(p, body);
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
      if (parts[2] === "projects") state.projects = state.projects.filter((x) => x.project_id !== parts[3]);
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
            m.phase = "PRODUCTION";
            m.status = "RUNNING";
            m.dispatch_state = "QUEUED_FOR_ANTIGRAVITY";
            m.current_step_order = 5;
            m.progress_pct = 50;
            m.steps.forEach((s) => {
              if (s.step_order <= 4) s.status = "DONE";
              if (s.step_order === 5) s.live_activity_text = "Đã duyệt kèo. Đang chờ đội ngũ chuyên gia bắt đầu sản xuất sản phẩm.";
            });
            pushRemoteOrderToCloud({
              order_id: `ord-${Date.now().toString(36)}`,
              order_type: "BUILD_PRODUCT",
              mission_id: m.mission_id,
              title: `[Sản xuất sản phẩm cuối] ${m.title}`,
              instructions: body.note || m.goal_prompt || m.title,
              source_device: "web-online",
              status: "PENDING",
              created_at: new Date().toISOString()
            }).catch(() => {});
          } else if (body.decision === "APPROVE") {
            m.phase = "DELIVERED";
            m.status = "COMPLETED";
            m.dispatch_state = "COMPLETED";
            m.progress_pct = 100;
            m.steps.forEach((s) => { s.status = "DONE"; });
            pushRemoteOrderToCloud({
              order_id: `ord-${Date.now().toString(36)}`,
              order_type: "MISSION_APPROVED",
              mission_id: m.mission_id,
              title: m.title,
              instructions: body.note || "Đã nghiệm thu sản phẩm cuối.",
              source_device: "web-online",
              status: "PENDING",
              created_at: new Date().toISOString()
            }).catch(() => {});
          } else {
            const resetFrom = isProposalGate ? 2 : 5;
            m.status = "RUNNING";
            m.dispatch_state = "QUEUED_FOR_ANTIGRAVITY";
            m.progress_pct = isProposalGate ? 15 : 50;
            m.steps.forEach((s) => {
              if (s.step_order >= resetFrom) {
                s.status = "PENDING";
                s.live_activity_text = `Đã gửi yêu cầu chỉnh sửa lại: ${body.note || ""}`;
              }
            });
            pushRemoteOrderToCloud({
              order_id: `ord-${Date.now().toString(36)}`,
              order_type: "MISSION_REWORK",
              mission_id: m.mission_id,
              title: `[Làm lại] ${m.title}`,
              instructions: body.note || "Yêu cầu bổ sung và hoàn thiện kỹ hơn",
              source_device: "web-online",
              status: "PENDING",
              created_at: new Date().toISOString()
            }).catch(() => {});
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
      mission_id: mid,
      title,
      goal_prompt: title,
      status: "RUNNING",
      phase: "PROPOSAL",
      project_id: "",
      dispatch_state: "QUEUED_FOR_ANTIGRAVITY",
      swarm_title: "",
      swarm_workers_json: "[]",
      auto_approve: autoApprove ? 1 : 0,
      current_step_order: 1,
      total_steps: 8,
      progress_pct: 0,
      steps: tpl.map(([ord, stitle, leads]) => ({
        step_id: `${mid}-s${ord}`,
        step_order: ord,
        title: stitle,
        lead_dept_ids: leads,
        lead_depts: leads.split(",").map((i) => ({ dept_id: i, title_vi: deptTitle(i) })),
        status: "PENDING",
        worker_name: "",
        artifact_path: "",
        live_activity_text: ord === 1 ? "Đã xếp hàng chờ đội ngũ trực tuyến tiếp nhận và triển khai." : "",
        output_summary: "",
        critique_verdict: "",
        ux_verdict: ""
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
      if (undoPayload.entity_type === "doc" && state.selectedProjectId) {
        await loadProjectDocs(state.selectedProjectId);
      }
      toast("Đã khôi phục nguyên trạng mục vừa xóa.");
    } catch (e) {
      toast(`Không thể hoàn tác: ${e.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 5. DEDUPLICATED NEWS HELPER & HEADER COUNTS
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

  function renderCountsAndHeader() {
    const runningM = state.missions.filter((m) => m.status === "RUNNING").length;
    const waitM = state.missions.filter((m) => m.status === "WAITING_CHAIRMAN").length;
    const waitT = state.tasks.filter((t) => t.kanban_column === "WAITING_APPROVAL").length;
    const totalWait = waitM + waitT;
    const activeOpps = state.opportunities.filter((o) => o.status === "NEW").length;
    const staffTotal = state.departments.length || 51;
    const uniqueNewsCount = getDeduplicatedArticles().length;

    const avgPct = state.missions.length
      ? Math.round(state.missions.reduce((acc, m) => acc + Number(m.progress_pct || 0), 0) / state.missions.length)
      : 0;

    document.getElementById("stat-running-missions").textContent = runningM;
    document.getElementById("stat-waiting-approvals").textContent = totalWait;
    document.getElementById("stat-staff-ready").textContent = staffTotal;
    document.getElementById("stat-news-count").textContent = uniqueNewsCount;

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

    const busyStaff = state.departments.filter((d) => d.status !== "IDLE").length;
    const readyPct = Math.round(((staffTotal - busyStaff) / Math.max(1, staffTotal)) * 100);
    const sideSummary = document.getElementById("sidebar-staff-summary");
    const sideFill = document.getElementById("sidebar-readiness-fill");
    if (sideSummary) {
      sideSummary.textContent = busyStaff > 0
        ? `${busyStaff} phòng đang xử lý, ${staffTotal - busyStaff} phòng sẵn sàng`
        : `${staffTotal} phòng chuyên gia sẵn sàng nhận đề bài`;
    }
    if (sideFill) sideFill.style.inlineSize = `${Math.max(10, readyPct)}%`;

    const navOpps = document.getElementById("nav-cnt-opps");
    navOpps.textContent = totalWait > 0 ? totalWait : activeOpps;
    navOpps.classList.toggle("warn", totalWait > 0);

    const navMsn = document.getElementById("nav-cnt-missions");
    const activeMsnCount = runningM + waitM;
    navMsn.textContent = activeMsnCount > 0 ? activeMsnCount : state.missions.length;
    navMsn.classList.toggle("warn", activeMsnCount > 0);

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
  // 6. TAB 1: GIAO VIEC (DECISION QUEUE + ASYMMETRIC OPPORTUNITIES)
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
  // 7. TAB 2: TIEN DO & PHONG HOP TRUC TIEP (4 CHE DO 100% TIENG VIET)
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

  function renderSwarmMembersPanel(m, msgs) {
    const memberMap = new Map();
    const ensure = (slug, depts = "") => {
      const norm = String(slug || "").trim();
      if (!norm) return null;
      const vi = viWorkerLabel(norm);
      if (!memberMap.has(vi)) {
        memberMap.set(vi, { slug: norm, name_vi: vi, depts, status: "PENDING", lastNote: "Đang chờ tới lượt phân công.", stepOrder: 99 });
      }
      return memberMap.get(vi);
    };
    let declared = [];
    try { declared = JSON.parse(m.swarm_workers_json || "[]"); } catch (_e) {}
    declared.forEach((w) => ensure(w));
    (m.steps || []).forEach((s) => {
      if (!s.worker_name) return;
      const rec = ensure(s.worker_name, s.lead_dept_ids);
      if (rec) {
        rec.depts = rec.depts || s.lead_dept_ids;
        rec.stepOrder = Math.min(rec.stepOrder, s.step_order);
        if (s.status === "RUNNING") {
          rec.status = "RUNNING";
          rec.lastNote = sanitizeUiVietnamese(s.live_activity_text || `Đang thực thi Bước ${s.step_order}`);
        } else if (s.status === "DONE" && rec.status !== "RUNNING") {
          rec.status = "DONE";
          rec.lastNote = sanitizeUiVietnamese(s.output_summary || `Đã hoàn tất Bước ${s.step_order}`).slice(0, 140);
        }
      }
    });
    msgs.forEach((msg) => {
      const rec = ensure(msg.sender_slug, msg.sender_dept_ids);
      if (rec) rec.lastNote = sanitizeUiVietnamese(msg.content_vi || "").slice(0, 140);
    });
    const members = Array.from(memberMap.values()).sort((a, b) => a.stepOrder - b.stepOrder);
    if (!members.length) {
      return `<div class="room-feed"><p class="row-meta">Chưa có thành viên chuyên trách nào được kích hoạt cho nhiệm vụ này.</p></div>`;
    }
    return `
      <div class="room-member-grid">
        ${members.map((mb) => {
          const stCls = mb.status === "RUNNING" ? "badge-run" : mb.status === "DONE" ? "badge-done" : "badge-idle";
          const stIcon = mb.status === "RUNNING" ? "activity" : mb.status === "DONE" ? "check" : "clock";
          const stTxt = mb.status === "RUNNING" ? "Đang xử lý" : mb.status === "DONE" ? "Đã hoàn tất" : "Đang trực chờ";
          return `
            <article class="room-member-card">
              <div class="opp-head">
                <strong>${esc(mb.name_vi)}</strong>
                <span class="badge ${stCls}">${ico(stIcon)}<span>${stTxt}</span></span>
              </div>
              ${mb.depts ? `<div class="mono row-meta">Phòng chuyên trách: #${esc(mb.depts.split(",").join(", #"))}</div>` : ""}
              <p class="row-meta">${esc(mb.lastNote)}</p>
            </article>
          `;
        }).join("")}
      </div>
    `;
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

  function renderMissionsTab() {
    const box = document.getElementById("missions-container");
    const list = state.missions.filter((m) => !state.missionFilter || m.status === state.missionFilter);

    if (!list.length) {
      box.innerHTML = `
        <div class="empty-state">
          <h3>Chưa có nhiệm vụ nào ở mục này</h3>
          <p>Giao một đề bài mới để theo dõi toàn bộ 8 bước thực thi, phản biện rủi ro và kiểm thử khách hàng trực tiếp tại đây.</p>
          <button type="button" class="btn btn-primary" id="btn-empty-start-msn">${ico("plus")}<span>Giao nhiệm vụ mới ngay</span></button>
        </div>
      `;
      const b = document.getElementById("btn-empty-start-msn");
      if (b) b.onclick = () => { switchTab("command"); document.getElementById("mission-prompt-input").focus(); };
      return;
    }

    box.innerHTML = list.map((m) => {
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

      const workerChipsHtml = swarmWorkers.length
        ? `<div class="chip-row">${swarmWorkers.map((w) => `<span class="worker-tag">${esc(viWorkerLabel(w))}</span>`).join("")}</div>`
        : "";

      const msnMsgs = state.swarmMessages.filter((x) => x.mission_id === m.mission_id);
      const activeSubTab = state.missionViewTabs[m.mission_id] || "steps";

      const stepsHtml = (m.steps || []).map((s) => {
        const isDone = s.status === "DONE";
        const isRun = s.status === "RUNNING";
        const isWait = s.status === "WAITING_APPROVAL";
        const nodeCls = isDone ? "done" : isRun ? "running" : isWait ? "waiting" : "pending";
        const nodeInner = isDone ? ico("check") : isRun ? ico("activity") : isWait ? ico("flag") : String(s.step_order);

        const whoStateLabel = isDone
          ? `<strong class="text-ok">Đã hoàn tất:</strong>`
          : isRun
          ? `<strong>Đang triển khai:</strong>`
          : isWait
          ? `<strong>Chờ bạn duyệt:</strong>`
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
              <div class="who-chips">
                ${whoStateLabel}
                ${deptChips}
              </div>
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
        activeSubTab === "members" ? renderSwarmMembersPanel(m, msnMsgs) :
        activeSubTab === "graph" ? renderSwarmGraphSvg(m) :
        `<div class="stepper-list">${stepsHtml}</div>`;

      return `
        <article class="mission-card">
          <div class="mission-header">
            <div class="mission-title-group">
              <h3 class="mission-title">${esc(sanitizeUiVietnamese(m.title))}</h3>
              <div class="mission-badges">
                ${phaseBadge}
                ${stBadge}
              </div>
              ${workerChipsHtml}
            </div>

            <div class="progress-row">
              <span class="mono doc-name-label">${m.progress_pct || 0}%</span>
              <div class="progress-track">
                <div class="progress-fill" style="inline-size:${m.progress_pct || 0}%;"></div>
              </div>

              <div class="action-group">
                ${m.project_id ? `<button type="button" class="btn btn-xs" data-open-proj="${esc(m.project_id)}"><span>Mở sản phẩm và tài liệu</span>${ico("arrow-right")}</button>` : ""}
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
                ${ico("users")}<span>Thành viên</span>
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
    }).join("");

    bindQuickActions(box);
  }

  // -------------------------------------------------------------------------
  // 8. TAB 3: BANG VIEC (DANH SACH + BANG 5 COT + CUSTOM LISTBOX)
  // -------------------------------------------------------------------------
  function getFilteredTasks() {
    const q = (document.getElementById("filter-task-q").value || "").trim().toLowerCase();
    const projF = getListboxValue("filter-task-project");
    const colF = getListboxValue("filter-task-col");
    const prioF = getListboxValue("filter-task-prio");
    return state.tasks.filter((t) => {
      if (projF && t.project_id !== projF) return false;
      if (colF && t.kanban_column !== colF) return false;
      if (prioF && t.priority !== prioF) return false;
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

    const filtered = getFilteredTasks();
    const listWrap = document.getElementById("tasks-list-wrapper");
    const boardWrap = document.getElementById("tasks-board-wrapper");

    if (state.taskViewMode === "list") {
      listWrap.classList.remove("is-hidden");
      boardWrap.classList.add("is-hidden");
      if (!filtered.length) {
        listWrap.innerHTML = `<div class="empty-state"><p>Không có công việc nào khớp bộ lọc. Nhấn <strong>Thêm việc lẻ</strong> để tạo mới.</p></div>`;
        updateBulkBar();
        return;
      }

      const allSelected = filtered.every((t) => state.selectedTaskIds.has(t.task_id));
      const headRow = `
        <div class="list-row list-row-task list-row-head">
          <input type="checkbox" id="chk-select-all-tasks" ${allSelected ? "checked" : ""} aria-label="Chọn tất cả công việc" />
          <span>Chọn tất cả (${filtered.length} việc)</span>
          <span class="hide-sm">Trạng thái</span>
          <span class="hide-sm">Thao tác</span>
        </div>
      `;

      listWrap.innerHTML = headRow + filtered.map((t) => {
        const checked = state.selectedTaskIds.has(t.task_id) ? "checked" : "";
        const colCls =
          t.kanban_column === "DONE" ? "badge-done" :
          t.kanban_column === "WAITING_APPROVAL" ? "badge-wait" :
          t.kanban_column === "REJECTED" ? "badge-fail" :
          t.kanban_column === "IN_PROGRESS" ? "badge-run" : "badge-idle";
        const dName = cleanDeptTitleVi(t.assigned_dept_id, t.assigned_dept_title || deptTitle(t.assigned_dept_id));
        return `
          <div class="list-row list-row-task ${checked ? "is-selected" : ""}">
            <input type="checkbox" data-sel-task="${esc(t.task_id)}" ${checked} aria-label="Chọn ${esc(t.title)}" />
            <div class="row-main clickable" data-edit-task="${esc(t.task_id)}">
              <div class="row-title ${t.kanban_column === "DONE" ? "is-done" : ""}">${esc(sanitizeUiVietnamese(t.title))}</div>
              <div class="row-meta">Phòng #${esc(t.assigned_dept_id)} (${esc(dName)}), Ưu tiên: ${esc(PRIO_LABELS[t.priority] || "Cao")}</div>
            </div>
            <span class="badge ${colCls}">${esc(COL_LABELS[t.kanban_column] || t.kanban_column)}</span>
            <div class="row-actions">
              ${t.kanban_column !== "DONE" ? `<button type="button" class="btn btn-xs" data-dispatch-task="${esc(t.task_id)}" title="Giao đội ngũ chuyên gia xử lý">${ico("cpu")}<span>Giao AI</span></button>` : ""}
              ${t.kanban_column !== "DONE" ? `<button type="button" class="btn btn-xs btn-primary" data-approve-task="${esc(t.task_id)}" title="Đánh dấu hoàn tất">${ico("check")}<span>Xong</span></button>` : ""}
              <button type="button" class="btn btn-xs" data-edit-task="${esc(t.task_id)}">Sửa</button>
              <button type="button" class="btn btn-xs hide-sm" data-dup-task="${esc(t.task_id)}">Sao chép</button>
              <button type="button" class="btn btn-xs btn-destructive" data-del-task="${esc(t.task_id)}">${ico("trash")}<span>Xóa</span></button>
            </div>
          </div>
        `;
      }).join("");

      const selAll = document.getElementById("chk-select-all-tasks");
      if (selAll) {
        selAll.onchange = () => {
          filtered.forEach((t) => {
            if (selAll.checked) state.selectedTaskIds.add(t.task_id);
            else state.selectedTaskIds.delete(t.task_id);
          });
          renderTasksTab();
        };
      }
      bindQuickActions(listWrap);
    } else {
      listWrap.classList.add("is-hidden");
      boardWrap.classList.remove("is-hidden");
      const cols = ["BACKLOG", "IN_PROGRESS", "QA_SECURITY_REVIEW", "WAITING_APPROVAL", "DONE"];
      const colOpts = cols.map((opt) => ({ value: opt, label: COL_LABELS[opt] }));

      boardWrap.innerHTML = cols.map((c) => {
        const colTasks = filtered.filter((t) =>
          c === "IN_PROGRESS"
            ? (t.kanban_column === "IN_PROGRESS" || t.kanban_column === "REJECTED")
            : t.kanban_column === c
        );
        return `
          <div class="k-col" data-drop-col="${c}">
            <div class="k-head">
              <span>${esc(COL_LABELS[c])} (${colTasks.length})</span>
              <button type="button" class="btn btn-xs" data-quick-col-add="${c}" aria-label="Thêm việc vào cột ${esc(COL_LABELS[c])}">${ico("plus")}</button>
            </div>
            ${colTasks.map((t) => {
              const curCol = t.kanban_column === "REJECTED" ? "IN_PROGRESS" : t.kanban_column;
              const dynId = `kcol-${t.task_id}`;
              return `
                <div class="k-card" draggable="true" data-drag-task="${esc(t.task_id)}">
                  <div class="row-title clickable" data-edit-task="${esc(t.task_id)}">
                    ${t.kanban_column === "REJECTED" ? `<span class="badge badge-fail">Cần sửa</span> ` : ""}${esc(sanitizeUiVietnamese(t.title))}
                  </div>
                  <div class="listbox-field listbox-compact" data-dynamic-listbox="${esc(dynId)}" data-move-task="${esc(t.task_id)}" data-current-col="${esc(curCol)}">
                    <input type="hidden" value="${esc(curCol)}" />
                    <button type="button" class="listbox-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="lb-${esc(dynId)}" aria-label="Chuyển cột trạng thái">
                      <span class="listbox-value">${esc(COL_LABELS[curCol] || curCol)}</span>
                      ${ico("chevron-down", "ico-xs listbox-chevron")}
                    </button>
                    <ul class="listbox-menu" id="lb-${esc(dynId)}" role="listbox" tabindex="-1" hidden></ul>
                  </div>
                  <div class="k-card-foot">
                    <span class="mono">Phòng #${esc(t.assigned_dept_id)}</span>
                    <div class="action-group">
                      <button type="button" class="btn btn-xs" data-edit-task="${esc(t.task_id)}">Sửa</button>
                      <button type="button" class="btn btn-xs btn-destructive" data-del-task="${esc(t.task_id)}">Xóa</button>
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `;
      }).join("");

      boardWrap.querySelectorAll("[data-dynamic-listbox]").forEach((wrap) => {
        const dynId = wrap.getAttribute("data-dynamic-listbox");
        const tid = wrap.getAttribute("data-move-task");
        const curCol = wrap.getAttribute("data-current-col");
        const ctrl = setupListboxElement(wrap, dynId, async (newCol) => {
          await api(`/api/tasks/${encodeURIComponent(tid)}`, "PATCH", { kanban_column: newCol });
          await loadEverything();
        });
        if (ctrl) {
          ctrl.setOptions(colOpts, false);
          ctrl.setValue(curCol, true);
        }
      });

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

  // -------------------------------------------------------------------------
  // 9. TAB 4: NHAN SU (51 PHONG BAN + INSPECTOR DRAWER)
  // -------------------------------------------------------------------------
  function renderStaffTab() {
    const pillBar = document.getElementById("staff-div-pills");
    const divOrder = [
      "", "div9-critique-ux-lab", "exec-board", "div1-strategy-intel", "div2-product-design",
      "div3-engineering-ai", "div4-qa-cybersecurity", "div5-media-youtube-studio",
      "div6-sales-commercial", "div7-finance-tax-legal", "div8-data-ops-hr"
    ];
    pillBar.innerHTML = divOrder.map((code) => {
      const on = state.staffDivFilter === code;
      const label = code === "" ? `Tất cả (${state.departments.length})` : (DIV_SHORT_NAMES[code] || code);
      return `<button type="button" class="chip-btn ${on ? "active" : ""}" aria-pressed="${on ? "true" : "false"}" data-sdiv="${code}">${esc(label)}</button>`;
    }).join("");

    pillBar.querySelectorAll("[data-sdiv]").forEach((b) => {
      b.onclick = () => { state.staffDivFilter = b.getAttribute("data-sdiv"); renderStaffTab(); };
    });

    const q = (document.getElementById("staff-search").value || "").trim().toLowerCase();
    const filtered = state.departments.filter((d) => {
      if (state.staffDivFilter && d.division_code !== state.staffDivFilter) return false;
      const cleanName = cleanDeptTitleVi(d.dept_id, d.title_vi);
      if (q && !`${d.dept_id} ${d.code} ${d.title_vi} ${cleanName}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const grid = document.getElementById("staff-grid");
    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state opp-card-lead">
          <p>Không tìm thấy phòng chuyên gia nào phù hợp từ khóa tìm kiếm.</p>
          <button type="button" class="btn btn-xs" id="btn-reset-staff-filter">Xóa bộ lọc</button>
        </div>
      `;
      document.getElementById("btn-reset-staff-filter").onclick = () => {
        document.getElementById("staff-search").value = "";
        state.staffDivFilter = "";
        renderStaffTab();
      };
      return;
    }

    grid.innerHTML = filtered.map((d) => {
      const busy = d.status !== "IDLE";
      const cleanName = cleanDeptTitleVi(d.dept_id, d.title_vi);
      const divName = DIV_SHORT_NAMES[d.division_code] || sanitizeUiVietnamese(d.division_name_vi || "");
      return `
        <button type="button" class="staff-card" data-open-staff="${esc(d.dept_id)}">
          <span class="sq-avatar">#${esc(d.dept_id)}</span>
          <span class="staff-info">
            <span class="row-title">${esc(cleanName)}</span>
            <span class="row-meta">${esc(divName)}</span>
            <span class="staff-foot">
              ${busy
                ? `<span class="badge badge-run">${ico("activity")}<span>Đang xử lý</span></span>`
                : `<span class="badge badge-idle">${ico("check")}<span>Sẵn sàng</span></span>`
              }
              <span class="mono row-meta">${d.tasks_completed || 0} việc xong</span>
            </span>
          </span>
        </button>
      `;
    }).join("");

    bindQuickActions(grid);
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

      body.innerHTML = `
        <div class="drawer-stats mono">
          <span>Đã hoàn tất: <strong>${d.tasks_completed || 0} việc</strong></span>
          <span>Bài báo đã học: <strong>${(d.learned_articles || []).length}</strong></span>
          <span>Hạn mức xử lý tháng: <strong>${formatDotNumber(d.token_budget_monthly || 500000)}</strong></span>
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
          <form id="form-staff-meta" class="form-stack">
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
  // 10. TAB 5: BAO MOI THI TRUONG
  // -------------------------------------------------------------------------
  function renderNewsTab() {
    const box = document.getElementById("news-list-box");
    const uniqueList = getDeduplicatedArticles().filter((a) => state.newsStarFilter !== "starred" || Boolean(a.is_starred));

    if (!uniqueList.length) {
      box.innerHTML = `<div class="empty-state"><p>Không có bài báo nào trong mục này.</p></div>`;
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

  // -------------------------------------------------------------------------
  // 11. TAB 6: TAI CHINH VA GIA BAN + DU AN & TRINH SOAN TAI LIEU
  // -------------------------------------------------------------------------
  function updateFinanceSliders() {
    const price = Number(document.getElementById("rng-price").value);
    const quota = Number(document.getElementById("rng-quota").value);
    const unit = Number(document.getElementById("rng-unit").value);
    const fixed = Number(document.getElementById("rng-fixed").value);

    try {
      localStorage.setItem("titan_cfo_sliders", JSON.stringify({ price, quota, unit, fixed }));
    } catch (_e) {}

    document.getElementById("lbl-cfo-price").textContent = vnd(price);
    document.getElementById("lbl-cfo-quota").textContent = `${quota} lượt`;
    document.getElementById("lbl-cfo-unit").textContent = vnd(unit);
    document.getElementById("lbl-cfo-fixed").textContent = vnd(fixed);

    const payFee = price * 0.015;
    const tax = price * 0.07;
    const worstCogs = quota * unit + payFee;
    const expCogs = quota * 0.6 * unit + payFee;
    const worstMargin = price > 0 ? ((price - worstCogs) / price) * 100 : 0;
    const netPerUser = price - expCogs - tax;
    const breakeven = netPerUser > 0 ? Math.ceil(fixed / netPerUser) : -1;

    const cogsPct = Math.min(93, Math.max(2, (worstCogs / Math.max(1, price)) * 100));
    const taxPct = 7;
    const profPct = Math.max(0, 100 - cogsPct - taxPct);
    document.getElementById("bar-cogs").style.inlineSize = `${cogsPct}%`;
    document.getElementById("bar-tax").style.inlineSize = `${taxPct}%`;
    document.getElementById("bar-profit").style.inlineSize = `${profPct}%`;

    const pill = document.getElementById("cfo-status-pill");
    if (worstMargin >= 65) {
      pill.className = "badge badge-done";
      pill.textContent = `An toàn: Biên lãi xấu nhất ${worstMargin.toFixed(0)}%`;
    } else if (worstMargin < 0) {
      pill.className = "badge badge-fail";
      pill.textContent = "Cảnh báo lỗ: Chi phí vượt giá bán";
    } else {
      pill.className = "badge badge-fail";
      pill.textContent = `Cảnh báo: Biên lãi mỏng ${worstMargin.toFixed(0)}% (dưới 65%)`;
    }
    document.getElementById("lbl-breakeven").textContent = breakeven > 0 ? `Hòa vốn: ${breakeven} khách` : "Đang lỗ trên mỗi khách";

    const tiersBox = document.getElementById("cfo-tiers-box");
    tiersBox.innerHTML = [10, 50, 200, 500].map((n) => {
      const net = Math.round(netPerUser * n - fixed);
      return `
        <div class="list-row list-row-pair">
          <span>Khi có <strong>${n} khách trả phí</strong></span>
          <span class="mono ${net >= 0 ? "text-ok" : "text-err"}"><strong>${vnd(net)} / tháng</strong></span>
        </div>
      `;
    }).join("");
  }

  async function renderProjectsSection(preserveDocEditor = true) {
    const pList = document.getElementById("projects-crud-list");
    if (!state.projects.length) {
      pList.innerHTML = `<div class="list-row"><span class="row-meta">Chưa có dự án. Nhấn Tạo dự án mới để khởi tạo.</span></div>`;
      document.getElementById("project-docs-list").innerHTML = "";
      resetDocViewer();
      return;
    }
    if (!state.selectedProjectId || !state.projects.some((p) => p.project_id === state.selectedProjectId)) {
      state.selectedProjectId = state.projects[0].project_id;
      preserveDocEditor = false;
    }
    pList.innerHTML = state.projects.map((p) => `
      <div class="list-row list-row-pair ${p.project_id === state.selectedProjectId ? "is-selected" : ""}">
        <div class="row-main clickable" data-sel-proj="${esc(p.project_id)}">
          <div class="row-title">${esc(sanitizeUiVietnamese(p.title))}</div>
          <div class="mono row-meta">${vnd(p.expected_price_vnd)}, ${esc(PROJECT_STATUS_LABELS[p.status] || "Đang chạy")}</div>
        </div>
        <div class="row-actions">
          <button type="button" class="btn btn-xs" data-edit-proj="${esc(p.project_id)}">Sửa</button>
          <button type="button" class="btn btn-xs btn-destructive" data-del-proj="${esc(p.project_id)}">Xóa</button>
        </div>
      </div>
    `).join("");

    pList.querySelectorAll("[data-sel-proj]").forEach((el) => {
      el.onclick = () => {
        state.selectedProjectId = el.getAttribute("data-sel-proj");
        state.currentDocFile = "";
        state.docEditMode = false;
        renderProjectsSection(false);
      };
    });
    bindQuickActions(pList);

    if (!(preserveDocEditor && state.docEditMode)) {
      await loadProjectDocs(state.selectedProjectId, preserveDocEditor);
    }
  }

  function resetDocViewer() {
    state.currentDocFile = "";
    state.docEditMode = false;
    document.getElementById("doc-current-name").textContent = "Chưa chọn tài liệu";
    document.getElementById("doc-editor-actions").hidden = true;
    document.getElementById("doc-pretty-view").innerHTML = "Chọn hoặc tạo một tài liệu mới để xem nội dung tại đây.";
    document.getElementById("doc-pretty-view").classList.remove("is-hidden");
    document.getElementById("doc-raw-editor").classList.add("is-hidden");
  }

  async function loadProjectDocs(pid, keepCurrentFile = true) {
    const dBox = document.getElementById("project-docs-list");
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
      document.getElementById("doc-current-name").textContent = filePath;
      document.getElementById("doc-editor-actions").hidden = false;
      document.getElementById("doc-raw-editor").value = doc.content || "";
      document.getElementById("doc-pretty-view").innerHTML = renderCleanMarkdown(doc.content || "");
      document.getElementById("doc-pretty-view").classList.remove("is-hidden");
      document.getElementById("doc-raw-editor").classList.add("is-hidden");
      document.getElementById("btn-save-doc").classList.add("is-hidden");
      document.getElementById("btn-toggle-doc-edit").textContent = "Sửa nội dung";
    } catch (_e) {}
  }

  // -------------------------------------------------------------------------
  // 12. QUICK ACTIONS, BULK BAR & MODALS
  // -------------------------------------------------------------------------
  function bindQuickActions(root) {
    root.querySelectorAll("[data-open-staff]").forEach((el) => {
      el.onclick = (e) => { e.stopPropagation(); openStaffDrawer(el.getAttribute("data-open-staff")); };
    });

    root.querySelectorAll("[data-goto-missions]").forEach((el) => {
      el.onclick = () => switchTab("missions");
    });

    root.querySelectorAll("[data-accept-opp]").forEach((b) => {
      b.onclick = () => withLock(b, async () => {
        const res = await api(`/api/opportunities/${encodeURIComponent(b.getAttribute("data-accept-opp"))}/accept`, "POST", {});
        await loadEverything();
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
      b.onclick = () => {
        state.selectedProjectId = b.getAttribute("data-open-proj");
        switchTab("finance");
      };
    });

    root.querySelectorAll("[data-msn-subtab]").forEach((b) => {
      b.onclick = () => {
        const [mid, view] = String(b.getAttribute("data-msn-subtab") || "").split(":");
        if (mid && view) {
          state.missionViewTabs[mid] = view;
          renderMissionsTab();
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
        await loadEverything();
        toast("Đã xóa dự án.", { entity_type: "project", entity_id: pid, backup });
      });
    });
  }

  function updateBulkBar() {
    const bar = document.getElementById("bulk-bar");
    const cnt = state.selectedTaskIds.size;
    document.getElementById("bulk-count-lbl").textContent = `Đã chọn ${cnt} việc`;
    bar.classList.toggle("visible", cnt > 0 && state.tab === "tasks");
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

  function openNewTaskModal(defaultCol = "BACKLOG") {
    document.getElementById("task-modal-title").textContent = "Thêm công việc mới";
    document.getElementById("edit-task-id").value = "";
    document.getElementById("form-task").reset();
    setListboxValue("inp-task-col", defaultCol, true);
    setListboxValue("inp-task-prio", "HIGH", true);
    setListboxValue("inp-task-proj", "", true);
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
    if (state.tab === "missions") renderMissionsTab();
    if (state.tab === "tasks") renderTasksTab();
    if (state.tab === "staff") renderStaffTab();
    if (state.tab === "news") renderNewsTab();
    if (state.tab === "finance") {
      updateFinanceSliders();
      renderProjectsSection(true);
    }
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
    state.overview = ov;
    state.bridge = ov.bridge || state.bridge;
    state.orders = ov.orders || [];
    state.swarmMessages = ov.swarm_messages || [];
    state.divisions = ov.divisions || [];
    state.projects = ov.projects || [];
    state.missions = ov.missions || [];
    state.opportunities = ov.opportunities || [];
    state.departments = depts.departments || [];
    state.tasks = tasks.tasks || [];
    state.lastSyncAt = new Date().toISOString();
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
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${creds.token}`
    };
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
      state.missionFilter = "";
      document.querySelectorAll("#mission-filter-tabs .seg-btn").forEach((x) => {
        const on = x.getAttribute("data-mfilter") === "";
        x.classList.toggle("active", on);
        x.setAttribute("aria-selected", on ? "true" : "false");
      });
      switchTab("missions");
    } else if (item.kind === "opp") {
      switchTab("command");
    } else if (item.kind === "task") {
      switchTab("tasks");
    } else if (item.kind === "proj") {
      state.selectedProjectId = item.id;
      switchTab("finance");
    } else if (item.kind === "news") {
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

    // Tab 1: Mission Composer + inline validation
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
        await loadEverything();
        toast("Đã gửi yêu cầu làm lại cho nhân sự phụ trách.");
      });
    };

    // Tab 2: Missions filters & cleanup
    document.querySelectorAll("#mission-filter-tabs .seg-btn").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll("#mission-filter-tabs .seg-btn").forEach((x) => {
          x.classList.remove("active");
          x.setAttribute("aria-selected", "false");
        });
        b.classList.add("active");
        b.setAttribute("aria-selected", "true");
        state.missionFilter = b.getAttribute("data-mfilter");
        renderMissionsTab();
      };
    });

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

    // Tab 3: Tasks filters, view switch, CRUD, bulk actions
    document.querySelectorAll("#task-view-mode .seg-btn").forEach((b) => {
      b.onclick = () => {
        state.taskViewMode = b.getAttribute("data-tview");
        renderTasksTab();
      };
    });

    document.getElementById("filter-task-q").oninput = renderTasksTab;
    document.getElementById("filter-task-project").addEventListener("change", renderTasksTab);
    document.getElementById("filter-task-col").addEventListener("change", renderTasksTab);
    document.getElementById("filter-task-prio").addEventListener("change", renderTasksTab);
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
        toast(tid ? "Đã cập nhật công việc." : "Đã thêm công việc mới.");
      });
    };

    document.getElementById("btn-clear-done-tasks").onclick = (e) => withLock(e.currentTarget, async () => {
      const backups = state.tasks.filter((t) => t.kanban_column === "DONE");
      if (!backups.length) {
        toast("Hiện không có công việc đã xong nào cần dọn.");
        return;
      }
      const res = await api("/api/tasks/bulk", "POST", { action: "clear_done" });
      await loadEverything();
      toast(`Đã dọn ${res.affected || backups.length} công việc đã xong.`, {
        items: backups.map((t) => ({ entity_type: "task", entity_id: t.task_id, backup: t }))
      });
    });

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
      renderTasksTab();
    };

    // Tab 4: Staff Search & Hire
    document.getElementById("staff-search").oninput = renderStaffTab;
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

    // Tab 5: News Poll, Read URL, Star filter & Search
    const pollNews = (e) => withLock(e.currentTarget, async () => {
      const r = await api("/api/learning/run", "POST", { scope: "all" });
      toast(sanitizeUiVietnamese(r.message || "Đang cập nhật tin tức thị trường mới."));
    });
    document.getElementById("btn-scan-news").onclick = pollNews;
    document.getElementById("btn-poll-feeds-tab5").onclick = pollNews;

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

    let searchT = null;
    document.getElementById("news-search-input").oninput = (e) => {
      clearTimeout(searchT);
      searchT = setTimeout(() => loadNews(e.target.value), 120);
    };

    // Tab 6: Finance Sliders, Projects, Document Editor & Cloud Vault
    ["rng-price", "rng-quota", "rng-unit", "rng-fixed"].forEach((id) => {
      document.getElementById(id).oninput = updateFinanceSliders;
    });

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
        if (pid) await api(`/api/projects/${encodeURIComponent(pid)}`, "PATCH", payload);
        else {
          const created = await api("/api/projects", "POST", payload);
          if (created && created.project_id) state.selectedProjectId = created.project_id;
        }
        closeModals();
        await loadEverything();
        toast("Đã lưu thông tin dự án.");
      });
    };

    document.getElementById("inp-doc-title").oninput = (e) => {
      document.getElementById("inp-doc-filename").value = `${slugifyVi(e.target.value)}.md`;
    };

    document.getElementById("btn-new-doc").onclick = () => {
      if (!state.selectedProjectId) {
        toast("Hãy tạo hoặc chọn một dự án trước khi thêm tài liệu.");
        return;
      }
      document.getElementById("form-doc").reset();
      openModal("modal-doc");
    };

    document.getElementById("form-doc").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const docTitle = document.getElementById("inp-doc-title").value.trim();
        let fname = document.getElementById("inp-doc-filename").value.trim();
        if (!fname.endsWith(".md")) fname += ".md";
        await api(`/api/projects/${encodeURIComponent(state.selectedProjectId)}/files`, "POST", {
          file: fname,
          content: `# ${docTitle}\n\n- **Mục tiêu:** \n- **Kế hoạch triển khai:** \n`
        });
        closeModals();
        state.currentDocFile = fname;
        await loadProjectDocs(state.selectedProjectId, true);
        toast("Đã tạo tài liệu mới.");
      });
    };

    document.getElementById("btn-toggle-doc-edit").onclick = () => {
      state.docEditMode = !state.docEditMode;
      document.getElementById("doc-pretty-view").classList.toggle("is-hidden", state.docEditMode);
      document.getElementById("doc-raw-editor").classList.toggle("is-hidden", !state.docEditMode);
      document.getElementById("btn-save-doc").classList.toggle("is-hidden", !state.docEditMode);
      document.getElementById("btn-toggle-doc-edit").textContent = state.docEditMode ? "Xem bản trình bày" : "Sửa nội dung";
    };

    document.getElementById("btn-save-doc").onclick = (e) => withLock(e.currentTarget, async () => {
      if (!state.selectedProjectId || !state.currentDocFile) return;
      const content = document.getElementById("doc-raw-editor").value;
      await api(`/api/projects/${encodeURIComponent(state.selectedProjectId)}/files`, "POST", {
        file: state.currentDocFile,
        content
      });
      await openDocFile(state.selectedProjectId, state.currentDocFile);
      toast("Đã lưu tài liệu.");
    });

    document.getElementById("btn-delete-doc").onclick = (e) => withLock(e.currentTarget, async () => {
      if (!state.selectedProjectId || !state.currentDocFile) return;
      const deletedFile = state.currentDocFile;
      const res = await api(`/api/projects/${encodeURIComponent(state.selectedProjectId)}/files?file=${encodeURIComponent(deletedFile)}`, "DELETE");
      state.currentDocFile = "";
      await loadProjectDocs(state.selectedProjectId, false);
      toast(`Đã xóa tệp ${deletedFile}.`, res.entity_id ? { entity_type: "doc", entity_id: res.entity_id } : null);
    });

    document.getElementById("btn-clear-events").onclick = (e) => withLock(e.currentTarget, async () => {
      const res = await api("/api/events", "DELETE");
      toast(`Đã dọn sạch ${res.cleared || 0} dòng nhật ký cũ.`);
    });

    document.getElementById("btn-export-json").onclick = (e) => withLock(e.currentTarget, async () => {
      const snap = await api("/api/sync/snapshot");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" }));
      a.download = `titan-sao-luu-${new Date().toISOString().slice(0, 10)}.json`;
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

    // Keyboard shortcuts (Escape, Ctrl+K, Ctrl+B, 1-6, N, D)
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
        state.taskViewMode = state.taskViewMode === "list" ? "board" : "list";
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
    try {
      const savedSliders = JSON.parse(localStorage.getItem("titan_cfo_sliders") || "null");
      if (savedSliders) {
        if (savedSliders.price) document.getElementById("rng-price").value = savedSliders.price;
        if (savedSliders.quota) document.getElementById("rng-quota").value = savedSliders.quota;
        if (savedSliders.unit) document.getElementById("rng-unit").value = savedSliders.unit;
        if (savedSliders.fixed !== undefined) document.getElementById("rng-fixed").value = savedSliders.fixed;
      }
    } catch (_e) {}

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
