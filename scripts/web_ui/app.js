/* ==========================================================================
   TITAN AI CORP v4.0 — COMMAND CENTER SPA ENGINE (60FPS, SSE, PWA & CLOUD)
   Zero External Bloat | IndexedDB Cache & Outbox | WebCrypto AES-256-GCM
   ========================================================================== */
(() => {
  "use strict";

  // -------------------------------------------------------------------------
  // 1. STATE & CONSTANTS
  // -------------------------------------------------------------------------
  const TAB_TITLES = {
    overview: "1. Trung Tâm Chỉ Huy Tập Đoàn",
    org: "2. Sơ Đồ 8 Khối & 46 Nhân Sự AI",
    kanban: "3. Bảng Việc Kanban & Cổng Chủ Tịch Duyệt",
    learning: "4. Radar Tự Học Báo Chí & Kho Tri Thức FTS5",
    workflow: "5. Quy Trình Vận Hành 12 Giai Đoạn & Luật RACI",
    projects: "6. Danh Mục Dự Án & Hồ Sơ Bàn Giao",
    finance: "7. Bàn Tính Kinh Tế Đơn Vị CFO & Hòa Vốn",
    hr: "8. Tuyển Nhân Sự AI (#46+) & Cloud 24/7"
  };

  const STATUS_LABELS = {
    IDLE: "○ Chờ lệnh",
    EXECUTING: "▶ Đang làm việc",
    STUDYING: "✦ Đang đọc báo",
    WAITING_CHAIRMAN: "⚑ Chờ Chủ tịch",
    IN_QA_REVIEW: "✓ Đang kiểm định",
    BACKLOG: "○ Hàng đợi",
    IN_PROGRESS: "▶ Đang thi công",
    QA_SECURITY_REVIEW: "⛨ Tòa án QA",
    WAITING_APPROVAL: "⚑ Chờ ký duyệt",
    DONE: "✓ Đã nghiệm thu",
    REJECTED: "✕ Yêu cầu sửa"
  };

  const WORKFLOW_12_STAGES = [
    { step: "GĐ 01", title: "Bắt Tín Hiệu & Khởi Xướng Dự Án", raci: "R: @ceo, 01 | A: @ceo", desc: "Tiếp nhận chỉ đạo Chủ tịch hoặc phát hiện nhu cầu thị trường từ đợt đọc báo sáng, lập cây dự án 8 khối.", gate: false },
    { step: "GĐ 02", title: "Tam Giác Điều Tra: Thị Trường – Tâm Lý – Đối Thủ", raci: "R: 01, 02, 03 | A: @ceo", desc: "Đo quy mô khách có tiền thật, tìm tử huyệt tâm lý và mổ xẻ đánh giá 1-2 sao của đối thủ kèm >=5 link sống.", gate: false },
    { step: "GĐ 03", title: "CỔNG 1: Thẩm Định Kinh Tế Đơn Vị (>=65%) & Thuế", raci: "R: 38, 39, 04, 05 | A: @ceo", desc: "Tính chi phí API kịch bản xấu nhất (100% hạn mức). Biên lợi nhuận gộp <65% bị chặn ngay trước khi code.", gate: true },
    { step: "GĐ 04", title: "CỔNG 2: Đặc Tả PRD, UX 3 Chạm & Giao Diện Dịu Mắt", raci: "R: 06..10 | A: Chủ tịch HĐQT", desc: "Chốt phạm vi MVP tinh gọn, thiết kế luồng di động 3 chạm và trình Chủ tịch phê duyệt trên Web/Điện thoại.", gate: true },
    { step: "GĐ 05", title: "Kiến Trúc C4, Hợp Đồng API & Phân Mảnh Không Xung Đột", raci: "R: 12, 17, 11 | A: @ceo", desc: "Thiết kế cô lập dữ liệu khách hàng (tenant_id), khóa JSON Schema và phân quyền Atomic Checkout.", gate: false },
    { step: "GĐ 06", title: "Chế Tạo Kỹ Thuật Chuẩn TDD (Web/App/Payment/AI)", raci: "R: 13..18 | A: @ceo", desc: "Viết test tự động trước cho luồng thanh toán & hạn mức, tối ưu tốc độ 60FPS và pipeline AI chính xác.", gate: false },
    { step: "GĐ 07", title: "Song Hành Studio Video AI Triệu View & Bộ Bán Hàng", raci: "R: 25..35, 40 | A: @ceo", desc: "Thiết kế trước 3 Thumbnail CTR cao, kịch bản Hook 3s, video khóa khung Đầu-Cuối, bài GEO/SEO & 50 khách mẫu.", gate: false },
    { step: "GĐ 08", title: "CỔNG 3: Tòa Án Kiểm Định Độc Lập 4 Lớp", raci: "R: 20..24, 41 | A: @ceo", desc: "QA phá ca biên, đo chống lag <50ms, bẫy Prompt Injection, quét bảo mật & chính sách bật kiếm tiền.", gate: true },
    { step: "GĐ 09", title: "CỔNG 4: Đưa Lên Cloud 24/7 & Chủ Tịch Nghiệm Thu", raci: "R: 19 | A: Chủ tịch HĐQT", desc: "Triển khai GitHub Cloud / Docker Server 24/7, kiểm tra /api/health xanh mượt trên cả PC và Điện thoại.", gate: true },
    { step: "GĐ 10", title: "Ra Quân: Săn 50 Khách Đầu Bằng Mẫu Riêng & Phễu Video", raci: "R: 32, 33, 34 | A: @ceo", desc: "Gửi sản phẩm mẫu cá nhân hóa cho 50 chủ tiệm mục tiêu để thu tiền tươi đầu tiên và bật kênh USD quốc tế.", gate: false },
    { step: "GĐ 11", title: "Bàn Giao 180 Giây, Giữ Chân Khách & Khoanh Quỹ Thuế", raci: "R: 35..39 | A: @ceo", desc: "Đưa khách mới chạm kết quả dưới 3 phút, đối soát sổ kép từng giao dịch và tách riêng quỹ dự phòng thuế.", gate: false },
    { step: "GĐ 12", title: "CỔNG 5: Chẩn Đoán BI, Kho Vũ Khí Voyager & Nhân Bản", raci: "R: 42..45 | A: Chủ tịch HĐQT", desc: "Tìm khâu rơi khách lớn nhất để tối ưu, đóng gói module tái sử dụng và nâng cấp cẩm nang cho cả 46 vị trí.", gate: true }
  ];

  const ARBITRATION_LAWS = [
    { code: "LUẬT 01", title: "An toàn Pháp lý, Thuế & Bảo mật Thắng Tốc độ (Phòng 23, 24, 39, 41 > 06, 13, 25)", desc: "Nếu Bảo mật, Thuế hoặc Chính sách Nền tảng phất cờ đỏ, lệnh xuất bản bị chặn cứng cho tới khi xử lý triệt để." },
    { code: "LUẬT 02", title: "Toán Học Kinh Tế Đơn Vị Thắng Tính Năng Màu Mè (Phòng 38 > 06, 16)", desc: "Tính năng AI làm biên lợi nhuận gộp kịch bản xấu tụt xuống dưới 65% bắt buộc phải tối ưu lại hoặc chuyển lên gói cao cấp." },
    { code: "LUẬT 03", title: "Người Kiểm Định Độc Lập Tuyệt Đối Với Người Thi Công (Khối 4 != Khối 3 & 5)", desc: "Không phòng ban nào được tự chấm bài của chính mình đạt chuẩn. Mọi bàn giao phải đi qua Khối 4 kiểm tra chéo." },
    { code: "LUẬT 04", title: "Dữ Liệu Đo Đạc Thực Tế Thắng Ý Kiến Cảm Tính (Phòng 01, 42 > Mọi tranh luận)", desc: "Bất đồng về tiêu đề, giá bán hay luồng màn hình được phân xử bằng số liệu thực tế bên ngoài thị trường." },
    { code: "LUẬT 05", title: "Quyết Định Của Chủ Tịch HĐQT Là Tối Thượng (Chairman Override)", desc: "Mọi quyết định Phê duyệt hoặc Bác bỏ từ Chủ tịch trên Web/Điện thoại có trọng số cao nhất và ghi thẳng vào Sổ Reflexion." }
  ];

  const state = {
    activeTab: "overview",
    staticCloudMode: false,
    overview: null,
    departments: [],
    divisions: [],
    tasks: [],
    projects: [],
    articles: [],
    selectedProjectId: "",
    selectedDeptDetail: null,
    activeDrawerSubtab: "handbook",
    sseSource: null,
    lastEventId: 0,
    sseQueueBuffer: [],
    rafScheduled: false,
    searchAbortCtrl: null,
    searchTimer: null,
    deferredInstallPrompt: null,
    outboxCount: 0
  };

  // -------------------------------------------------------------------------
  // 2. SAFE HTML ESCAPING & FORMATTING HELPERS
  // -------------------------------------------------------------------------
  function escapeHtml(val) {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatVnd(num) {
    const n = Number(num) || 0;
    return n.toLocaleString("vi-VN") + " đ";
  }

  function formatShortTime(isoStr) {
    if (!isoStr) return "--:--";
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return String(isoStr).slice(0, 16);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
      " · " + d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  }

  function statusBadgeHtml(st) {
    const key = String(st || "IDLE").toUpperCase();
    const label = STATUS_LABELS[key] || key;
    return `<span class="status-badge status-${escapeHtml(key)}">${escapeHtml(label)}</span>`;
  }

  function showToast(msg) {
    const wrap = document.getElementById("toast-container");
    if (!wrap) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 220);
    }, 3600);
  }

  // -------------------------------------------------------------------------
  // 3. INDEXEDDB CACHE & OFFLINE OUTBOX + WEBCRYPTO AES-256-GCM VAULT
  // -------------------------------------------------------------------------
  const idb = {
    dbPromise: null,
    open() {
      if (this.dbPromise) return this.dbPromise;
      this.dbPromise = new Promise((resolve) => {
        if (!window.indexedDB) {
          resolve(null);
          return;
        }
        const req = window.indexedDB.open("TitanCommandCenterDB", 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains("kv_cache")) {
            db.createObjectStore("kv_cache");
          }
          if (!db.objectStoreNames.contains("pending_mutations")) {
            db.createObjectStore("pending_mutations", { keyPath: "id", autoIncrement: true });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      return this.dbPromise;
    },
    async get(key) {
      const db = await this.open();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction("kv_cache", "readonly");
        const r = tx.objectStore("kv_cache").get(key);
        r.onsuccess = () => resolve(r.result ?? null);
        r.onerror = () => resolve(null);
      });
    },
    async set(key, value) {
      const db = await this.open();
      if (!db) return;
      return new Promise((resolve) => {
        const tx = db.transaction("kv_cache", "readwrite");
        tx.objectStore("kv_cache").put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    },
    async enqueueMutation(item) {
      const db = await this.open();
      if (!db) return;
      return new Promise((resolve) => {
        const tx = db.transaction("pending_mutations", "readwrite");
        tx.objectStore("pending_mutations").add({ ...item, queued_at: new Date().toISOString() });
        tx.oncomplete = () => {
          this.refreshOutboxCount();
          resolve();
        };
        tx.onerror = () => resolve();
      });
    },
    async flushMutations() {
      const db = await this.open();
      if (!db || state.staticCloudMode) return;
      const items = await new Promise((resolve) => {
        const tx = db.transaction("pending_mutations", "readonly");
        const r = tx.objectStore("pending_mutations").getAll();
        r.onsuccess = () => resolve(r.result || []);
        r.onerror = () => resolve([]);
      });
      for (const item of items) {
        try {
          const res = await fetch(item.url, {
            method: item.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.body)
          });
          if (res.ok) {
            await new Promise((resolve) => {
              const tx = db.transaction("pending_mutations", "readwrite");
              tx.objectStore("pending_mutations").delete(item.id);
              tx.oncomplete = () => resolve();
            });
          }
        } catch (_err) {
          break;
        }
      }
      await this.refreshOutboxCount();
    },
    async refreshOutboxCount() {
      const db = await this.open();
      if (!db) return;
      const cnt = await new Promise((resolve) => {
        const tx = db.transaction("pending_mutations", "readonly");
        const r = tx.objectStore("pending_mutations").count();
        r.onsuccess = () => resolve(r.result || 0);
        r.onerror = () => resolve(0);
      });
      state.outboxCount = cnt;
      const el = document.getElementById("sync-status-text");
      if (el) {
        el.textContent = cnt > 0 ? `Chờ mạng (${cnt})` : (state.staticCloudMode ? "GitHub CDN" : "Tức thì");
      }
    }
  };

  // WebCrypto PBKDF2-SHA256 (250k) + AES-256-GCM Vault for GitHub Token
  const cryptoVault = {
    async deriveKey(pin, saltBytes) {
      const enc = new TextEncoder();
      const baseKey = await window.crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]);
      return window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: saltBytes, iterations: 250000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    },
    toBase64(bytes) {
      return btoa(String.fromCharCode(...new Uint8Array(bytes)));
    },
    fromBase64(b64) {
      return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    },
    async saveCredentials(repo, token, pin) {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await this.deriveKey(pin, salt);
      const payload = JSON.stringify({ repo, token });
      const cipher = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(payload));
      await idb.set("cloud_vault_v4", {
        repo,
        salt: this.toBase64(salt),
        iv: this.toBase64(iv),
        cipher: this.toBase64(cipher)
      });
    },
    async unlockCredentials(pin) {
      const record = await idb.get("cloud_vault_v4");
      if (!record) throw new Error("Chưa lưu cấu hình Két Đám Mây trên thiết bị này.");
      const key = await this.deriveKey(pin, this.fromBase64(record.salt));
      const plainBuf = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: this.fromBase64(record.iv) },
        key,
        this.fromBase64(record.cipher)
      );
      return JSON.parse(new TextDecoder().decode(plainBuf));
    }
  };

  // -------------------------------------------------------------------------
  // 4. API CLIENT WITH LATENCY TELEMETRY & GITHUB PAGES STATIC FALLBACK
  // -------------------------------------------------------------------------
  async function apiFetch(path, options = {}) {
    const t0 = performance.now();
    try {
      const res = await fetch(path, {
        ...options,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(options.headers || {})
        }
      });
      const elapsed = Math.round(performance.now() - t0);
      const pingEl = document.getElementById("ping-ms");
      if (pingEl && path.startsWith("/api/")) {
        pingEl.textContent = `${elapsed} ms`;
      }
      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          errMsg = errJson.error || errMsg;
        } catch (_e) {}
        throw new Error(errMsg);
      }
      state.staticCloudMode = false;
      return await res.json();
    } catch (err) {
      // If hosted on static GitHub Pages CDN without local Python server, fall back to ./cloud_state/snapshot.json
      if ((!options.method || options.method === "GET") && path.startsWith("/api/")) {
        const snap = await loadStaticCloudSnapshot();
        if (snap) {
          state.staticCloudMode = true;
          updateConnectionIndicator("warning", "Chế độ Đám mây GitHub CDN");
          return adaptSnapshotToEndpoint(snap, path);
        }
      }
      if (options.method && options.method !== "GET" && !navigator.onLine) {
        await idb.enqueueMutation({ url: path, method: options.method, body: JSON.parse(options.body || "{}") });
        showToast("Đang ngoại tuyến — Lệnh của Chủ tịch đã lưu vào Hàng đợi, sẽ tự đồng bộ khi có mạng!");
        return { offline_queued: true };
      }
      throw err;
    }
  }

  async function loadStaticCloudSnapshot() {
    const candidates = ["./cloud_state/snapshot.json", "../corporate_hq/cloud_state/snapshot.json"];
    for (const url of candidates) {
      try {
        const r = await fetch(url, { cache: "no-cache" });
        if (r.ok) return await r.json();
      } catch (_e) {}
    }
    return await idb.get("latest_snapshot_backup");
  }

  function adaptSnapshotToEndpoint(snap, path) {
    const depts = snap.departments || [];
    const tasks = snap.tasks || [];
    const atoms = snap.knowledge_atoms || [];
    const events = snap.activity_stream || snap.recent_events || [];
    const projects = snap.projects || [];
    const divisions = snap.divisions || [];

    if (path.startsWith("/api/overview")) {
      return {
        kpis: {
          total_departments: depts.length,
          active_departments: depts.filter((d) => d.status !== "IDLE").length,
          total_tokens_used: depts.reduce((s, d) => s + (d.tokens_used || 0), 0),
          total_token_budget: depts.reduce((s, d) => s + (d.token_budget_monthly || 0), 0) || 1,
          total_tasks: tasks.length,
          in_progress_tasks: tasks.filter((t) => t.kanban_column === "IN_PROGRESS").length,
          waiting_approval_tasks: tasks.filter((t) => t.kanban_column === "WAITING_APPROVAL").length,
          done_tasks: tasks.filter((t) => t.kanban_column === "DONE").length,
          total_knowledge_atoms: atoms.length,
          atoms_last_24h: atoms.length
        },
        divisions,
        projects,
        recent_events: events
      };
    }
    if (path === "/api/departments") return { departments: depts };
    const mDept = path.match(/^\/api\/departments\/([a-zA-Z0-9_-]+)$/);
    if (mDept) {
      const id = mDept[1];
      const found = depts.find((d) => d.dept_id === id || d.code === id);
      if (!found) return null;
      return {
        ...found,
        handbook_markdown: found.handbook_markdown || `# ${found.title_vi}\n\n${found.mission}`,
        learned_articles: atoms.filter((a) => a.dept_id === found.dept_id),
        tasks: tasks.filter((t) => t.assigned_dept_id === found.dept_id),
        reflexions: (snap.reflexions || []).filter((r) => r.dept_id === found.dept_id)
      };
    }
    if (path.startsWith("/api/tasks")) return { tasks };
    if (path.startsWith("/api/projects")) return { projects, files: [] };
    if (path.startsWith("/api/knowledge")) return { query: "", elapsed_ms: 1.2, count: atoms.length, articles: atoms };
    if (path.startsWith("/api/audit")) return { passed: true, registered_departments: depts.length };
    return {};
  }

  function updateConnectionIndicator(dotClass, label) {
    const dot = document.getElementById("conn-dot");
    const txt = document.getElementById("conn-text");
    if (dot) dot.className = `dot-indicator ${dotClass || ""}`.trim();
    if (txt) txt.textContent = label;
  }

  // -------------------------------------------------------------------------
  // 5. DETERMINISTIC CFO SIMULATOR (Client + Server Parity)
  // -------------------------------------------------------------------------
  function computeLocalCfo(params) {
    const price = Math.max(0, Number(params.price_per_month) || 0);
    const quota = Math.max(0, Math.floor(Number(params.max_quota_units) || 0));
    const unitApi = Math.max(0, Number(params.api_cost_per_unit) || 0);
    const usage = Math.min(1.0, Math.max(0.05, Number(params.avg_usage_ratio) || 0.6));
    const payPct = Math.max(0, Number(params.payment_fee_pct) || 0) / 100.0;
    const taxPct = Math.max(0, Number(params.tax_reserve_pct) || 0) / 100.0;
    const fixedCost = Math.max(0, Number(params.fixed_monthly_cost) || 0);

    const paymentFee = price * payPct;
    const taxReserve = price * taxPct;
    const worstApi = quota * unitApi;
    const expApi = quota * usage * unitApi;
    const worstCogs = worstApi + paymentFee;
    const expCogs = expApi + paymentFee;

    const worstMargin = price > 0 ? ((price - worstCogs) / price) * 100 : 0;
    const expMargin = price > 0 ? ((price - expCogs) / price) * 100 : 0;
    const netExp = price - expCogs - taxReserve;
    const netWorst = price - worstCogs - taxReserve;
    const breakeven = netExp > 0 ? Math.ceil(fixedCost / netExp) : -1;

    const projections = {};
    [10, 50, 200, 500].forEach((n) => {
      projections[String(n)] = {
        customers: n,
        gross_revenue: price * n,
        tax_reserve: taxReserve * n,
        net_profit: (price - expCogs - taxReserve) * n - fixedCost
      };
    });
    const passed = worstMargin >= 65.0 && netWorst > 0;
    return {
      worst_gross_margin_pct: worstMargin.toFixed(2),
      expected_gross_margin_pct: expMargin.toFixed(2),
      net_profit_per_user_worst: Math.round(netWorst),
      breakeven_customers: breakeven,
      gate1_passed: passed,
      verdict_vi: passed
        ? "ĐẠT CHUẨN CỔNG 1 (An toàn chống lỗ ngầm kể cả khi khách dùng hết 100% hạn mức)"
        : "CẢNH BÁO ĐỎ: Biên lợi nhuận kịch bản xấu < 65% — Cần giảm hạn mức hoặc tăng giá bán!",
      projections
    };
  }

  // -------------------------------------------------------------------------
  // 6. RENDERERS FOR ALL 8 TABS & BRAIN INSPECTOR
  // -------------------------------------------------------------------------
  function renderOverview() {
    if (!state.overview) return;
    const k = state.overview.kpis || {};
    document.getElementById("kpi-total-depts").textContent = k.total_departments ?? 46;
    document.getElementById("kpi-active-depts").textContent =
      `Đang bận: ${k.active_departments ?? 0} vị trí · Đang đọc báo: ${k.studying_departments ?? 0}`;
    document.getElementById("kpi-waiting-gates").textContent = k.waiting_approval_tasks ?? 0;
    document.getElementById("kpi-task-breakdown").textContent =
      `Tổng ${k.total_tasks ?? 0} việc (${k.in_progress_tasks ?? 0} đang làm · ${k.done_tasks ?? 0} xong)`;
    document.getElementById("kpi-total-atoms").textContent = k.total_knowledge_atoms ?? 0;
    document.getElementById("kpi-atoms-24h").textContent = `+${k.atoms_last_24h ?? 0} bài mới thu thập trong 24h qua`;

    const pct = ((Number(k.total_tokens_used || 0) / Math.max(1, Number(k.total_token_budget || 1))) * 100).toFixed(1);
    document.getElementById("kpi-token-pct").textContent = `${pct}%`;
    document.getElementById("kpi-token-detail").textContent =
      `${Number(k.total_tokens_used || 0).toLocaleString("vi-VN")} / ${Number(k.total_token_budget || 0).toLocaleString("vi-VN")}`;

    // Update Sidebar Badges
    document.getElementById("badge-depts").textContent = k.total_departments ?? 46;
    document.getElementById("badge-approvals").textContent = k.waiting_approval_tasks ?? 0;
    document.getElementById("badge-knowledge").textContent = k.total_knowledge_atoms ?? 0;
    document.getElementById("badge-projects").textContent = (state.overview.projects || []).length;

    // Render Divisions Summary
    const divBox = document.getElementById("overview-divisions-list");
    divBox.innerHTML = (state.overview.divisions || []).map((dv) => {
      const cnt = state.departments.filter((d) => d.division_code === dv.code).length;
      return `
        <div class="division-row" data-jump-div="${escapeHtml(dv.code)}">
          <div>
            <div style="font-weight:700;color:var(--text-primary);font-size:13.5px;">${escapeHtml(dv.name_vi)}</div>
            <div class="kpi-sub">${escapeHtml(dv.c_level_title)} · ${escapeHtml(dv.slash_command || "")}</div>
          </div>
          <span class="nav-badge">${cnt || ""} vị trí</span>
        </div>
      `;
    }).join("");

    divBox.querySelectorAll("[data-jump-div]").forEach((row) => {
      row.addEventListener("click", () => {
        document.getElementById("org-division-filter").value = row.getAttribute("data-jump-div");
        switchTab("org");
        renderOrgChart();
      });
    });

    // Last Learning Run Summary
    const lr = state.overview.last_learning_run;
    const lrBadge = document.getElementById("last-learn-badge");
    const lrSum = document.getElementById("last-learn-summary");
    if (lr) {
      lrBadge.textContent = lr.status || "COMPLETED";
      lrSum.innerHTML = `Lần quét gần nhất lúc <strong>${escapeHtml(formatShortTime(lr.started_at))}</strong>: Quét <strong>${lr.sources_polled || 0}</strong> kênh báo chí & khoa học, nạp mới <strong>+${lr.atoms_inserted || 0}</strong> tri thức vào SQLite FTS5.`;
    }

    // Activity Feed (bounded to 200 items in DOM for zero memory leak)
    const feedEl = document.getElementById("live-activity-feed");
    const evs = (state.overview.recent_events || []).slice(0, 120);
    if (evs.length > 0 && evs[0].event_id) {
      state.lastEventId = Math.max(state.lastEventId, Number(evs[0].event_id));
    }
    if (!evs.length) {
      feedEl.innerHTML = `<div class="kpi-sub">Chưa có sự kiện nào. Hãy bấm "+ Giao việc" hoặc "✦ Quét báo mới".</div>`;
    } else {
      feedEl.innerHTML = evs.map(renderFeedItemHtml).join("");
      bindFeedItemClicks(feedEl);
    }
  }

  function renderFeedItemHtml(ev) {
    const actorLabel = ev.actor_dept_id
      ? `#${ev.actor_dept_id} ${ev.actor_title_vi || ev.actor_code || ""}`
      : "Hệ thống Titan";
    return `
      <div class="feed-item" data-open-dept="${escapeHtml(ev.actor_dept_id || "00")}">
        <div class="feed-item-top">
          <span class="feed-actor" style="cursor:pointer;">${escapeHtml(actorLabel)}</span>
          <span class="feed-time">${escapeHtml(formatShortTime(ev.timestamp || ev.created_at))}</span>
        </div>
        <div class="feed-headline">${escapeHtml(ev.headline_vi)}</div>
      </div>
    `;
  }

  function bindFeedItemClicks(container) {
    container.querySelectorAll("[data-open-dept]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-open-dept");
        if (id) openBrainInspector(id);
      });
    });
  }

  function renderOrgChart() {
    const container = document.getElementById("org-chart-container");
    const q = (document.getElementById("org-search-input").value || "").trim().toLowerCase();
    const divF = document.getElementById("org-division-filter").value;
    const stF = document.getElementById("org-status-filter").value;

    const filtered = state.departments.filter((d) => {
      if (divF && d.division_code !== divF) return false;
      if (stF && d.status !== stF) return false;
      if (q) {
        const hay = `${d.dept_id} ${d.code} ${d.title_vi} ${d.title_en} ${d.mission}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (!filtered.length) {
      container.innerHTML = `<div class="card"><div class="kpi-sub">Không tìm thấy phòng ban nào khớp bộ lọc hiện tại.</div></div>`;
      return;
    }

    const groups = new Map();
    filtered.forEach((d) => {
      const k = d.division_code;
      if (!groups.has(k)) {
        groups.set(k, { name: d.division_name_vi || k, clevel: d.c_level_title || "", items: [] });
      }
      groups.get(k).items.push(d);
    });

    let html = "";
    groups.forEach((grp) => {
      html += `
        <div class="org-division-block">
          <div class="org-division-heading">
            <div>
              <h2 class="section-title">${escapeHtml(grp.name)}</h2>
              <div class="kpi-sub">Lãnh đạo khối: ${escapeHtml(grp.clevel)}</div>
            </div>
            <span class="nav-badge">${grp.items.length} chuyên gia</span>
          </div>
          <div class="dept-grid">
            ${grp.items.map((d) => `
              <article class="dept-card" tabindex="0" role="button" data-dept-id="${escapeHtml(d.dept_id)}">
                <div class="dept-card-top">
                  <span class="dept-id-tag">#${escapeHtml(d.dept_id)} · ${escapeHtml(d.code)}</span>
                  ${statusBadgeHtml(d.status)}
                </div>
                <h3 class="dept-name">${escapeHtml(d.title_vi)}</h3>
                <div class="dept-mission">${escapeHtml(d.mission)}</div>
                <div class="dept-meta-footer mono-num">
                  <span>✓ ${d.tasks_completed || 0} việc</span>
                  <span>Soi bộ não →</span>
                </div>
              </article>
            `).join("")}
          </div>
        </div>
      `;
    });
    container.innerHTML = html;

    container.querySelectorAll("[data-dept-id]").forEach((card) => {
      card.addEventListener("click", () => openBrainInspector(card.getAttribute("data-dept-id")));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openBrainInspector(card.getAttribute("data-dept-id"));
        }
      });
    });
  }

  function renderKanban() {
    const cols = ["BACKLOG", "IN_PROGRESS", "QA_SECURITY_REVIEW", "WAITING_APPROVAL", "DONE"];
    const projF = document.getElementById("kanban-project-filter").value;
    const divF = document.getElementById("kanban-division-filter").value;

    const filtered = state.tasks.filter((t) => {
      if (projF && t.project_id !== projF) return false;
      if (divF && t.division_code !== divF) return false;
      return true;
    });

    cols.forEach((col) => {
      const listEl = document.getElementById(`klist-${col}`);
      const cntEl = document.getElementById(`kcount-${col}`);
      const items = filtered.filter((t) => t.kanban_column === col);
      if (cntEl) cntEl.textContent = items.length;
      if (!listEl) return;

      if (!items.length) {
        listEl.innerHTML = `<div class="kpi-sub" style="padding:8px 4px;">Trống (0 đầu việc)</div>`;
        return;
      }

      listEl.innerHTML = items.map((t) => {
        const isWaiting = col === "WAITING_APPROVAL";
        return `
          <div class="task-card ${isWaiting ? "gate-waiting" : ""}">
            <div class="task-meta">
              <span class="dept-id-tag">#${escapeHtml(t.assigned_dept_id)}</span>
              <span class="mono-num">GĐ ${t.stage_number || 1} · Cổng ${t.gate_number || 1}</span>
            </div>
            <div class="task-title">${escapeHtml(t.title)}</div>
            <div class="kpi-sub">${escapeHtml(t.dept_title_vi || "")}</div>
            ${t.approval_note ? `<div class="kpi-sub" style="color:var(--brand-primary);">Ghi chú: ${escapeHtml(t.approval_note)}</div>` : ""}
            <div class="task-actions">
              ${col === "BACKLOG" ? `<button type="button" class="btn btn-sm" data-act-checkout="${escapeHtml(t.task_id)}" data-dept="${escapeHtml(t.assigned_dept_id)}">▶ Nhận khóa làm</button>` : ""}
              ${col === "IN_PROGRESS" ? `<button type="button" class="btn btn-sm btn-primary" data-act-submit="${escapeHtml(t.task_id)}" data-dept="${escapeHtml(t.assigned_dept_id)}">⚑ Trình Cổng Duyệt</button>` : ""}
              ${col === "QA_SECURITY_REVIEW" ? `<button type="button" class="btn btn-sm btn-primary" data-act-to-gate="${escapeHtml(t.task_id)}">Chuyển Chủ tịch duyệt</button>` : ""}
              ${isWaiting ? `<button type="button" class="btn btn-sm btn-success" data-act-decide="${escapeHtml(t.task_id)}">✓ Duyệt / Bác bỏ</button>` : ""}
              <button type="button" class="btn btn-sm" data-open-dept="${escapeHtml(t.assigned_dept_id)}">Hồ sơ NV</button>
            </div>
          </div>
        `;
      }).join("");

      bindKanbanActions(listEl);
    });
  }

  function bindKanbanActions(container) {
    container.querySelectorAll("[data-open-dept]").forEach((b) => {
      b.addEventListener("click", () => openBrainInspector(b.getAttribute("data-open-dept")));
    });

    container.querySelectorAll("[data-act-checkout]").forEach((b) => {
      b.addEventListener("click", async () => {
        const tid = b.getAttribute("data-act-checkout");
        const dept = b.getAttribute("data-dept");
        try {
          await apiFetch(`/api/tasks/${encodeURIComponent(tid)}/checkout`, {
            method: "POST",
            body: JSON.stringify({ dept_id: dept })
          });
          showToast(`Phòng #${dept} đã khóa nguyên tử (Atomic Checkout) và bắt đầu thi công!`);
          await refreshTasksAndOverview();
        } catch (err) {
          showToast(`Lỗi nhận việc: ${err.message}`);
        }
      });
    });

    container.querySelectorAll("[data-act-submit]").forEach((b) => {
      b.addEventListener("click", async () => {
        const tid = b.getAttribute("data-act-submit");
        const dept = b.getAttribute("data-dept");
        try {
          await apiFetch(`/api/tasks/${encodeURIComponent(tid)}/submit`, {
            method: "POST",
            body: JSON.stringify({
              dept_id: dept,
              title: "Hồ sơ bàn giao trình Cổng kiểm soát",
              summary: "Đã hoàn thành kiểm tra tiêu chuẩn đầu ra và đính kèm dữ liệu thực chứng.",
              evidence_level: 3,
              require_chairman_gate: true
            })
          });
          showToast("Đã nộp bàn giao lên Cột 4 — Chờ Chủ tịch ký duyệt!");
          await refreshTasksAndOverview();
        } catch (err) {
          showToast(`Lỗi nộp bàn giao: ${err.message}`);
        }
      });
    });

    container.querySelectorAll("[data-act-to-gate]").forEach((b) => {
      b.addEventListener("click", async () => {
        const tid = b.getAttribute("data-act-to-gate");
        try {
          await apiFetch(`/api/tasks/${encodeURIComponent(tid)}/transition`, {
            method: "POST",
            body: JSON.stringify({ column: "WAITING_APPROVAL" })
          });
          await refreshTasksAndOverview();
        } catch (err) {
          showToast(err.message);
        }
      });
    });

    container.querySelectorAll("[data-act-decide]").forEach((b) => {
      b.addEventListener("click", () => {
        const tid = b.getAttribute("data-act-decide");
        const task = state.tasks.find((x) => x.task_id === tid);
        if (!task) return;
        document.getElementById("decision-task-id").value = tid;
        document.getElementById("decision-task-summary").innerHTML =
          `<strong>[${escapeHtml(tid)}] ${escapeHtml(task.title)}</strong><br/>Phòng thực thi: #${escapeHtml(task.assigned_dept_id)} (${escapeHtml(task.dept_title_vi || "")}) · Cổng kiểm soát số ${task.gate_number || 1}`;
        document.getElementById("decision-note-input").value = "";
        document.getElementById("decision-rule-input").value = "";
        openModal("modal-decision");
      });
    });
  }

  function renderKnowledgeArticles(articles, elapsedMs) {
    state.articles = articles || [];
    const badge = document.getElementById("fts-speed-badge");
    if (badge) {
      badge.textContent = `FTS5: ${elapsedMs ?? 0} ms (${state.articles.length} bài)`;
    }
    const grid = document.getElementById("knowledge-articles-grid");
    if (!state.articles.length) {
      grid.innerHTML = `<div class="card"><div class="kpi-sub">Chưa có bài báo nào khớp truy vấn. Bấm "✦ Quét đồng loạt 8 nguồn báo sống" để nạp tin tức mới nhất!</div></div>`;
      return;
    }
    grid.innerHTML = state.articles.map((a) => {
      const linkUrl = a.url || a.source_url || "#";
      const srcName = a.source_connector || a.source_name || "Web Intel";
      return `
      <article class="article-card">
        <div class="task-meta">
          <span class="dept-id-tag" style="cursor:pointer;" data-open-dept="${escapeHtml(a.dept_id)}">Phòng #${escapeHtml(a.dept_id)}</span>
          <span>${escapeHtml(srcName)} · Quan trọng: <strong>${a.importance || 7}/10</strong></span>
        </div>
        <h3 class="article-title">
          <a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(a.title)} ↗</a>
        </h3>
        <div class="kpi-sub">${escapeHtml((a.summary_vi || "").slice(0, 260))}</div>
        ${a.actionable_insight ? `<div class="article-insight"><strong>Ứng dụng thực chiến:</strong> ${escapeHtml(a.actionable_insight)}</div>` : ""}
        <div class="task-meta mono-num">
          <span>Thu thập: ${escapeHtml(formatShortTime(a.fetched_at))}</span>
          <a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer">Đọc bản gốc →</a>
        </div>
      </article>
    `;
    }).join("");

    bindFeedItemClicks(grid);
  }

  function renderWorkflowTab() {
    const sGrid = document.getElementById("workflow-stages-grid");
    sGrid.innerHTML = WORKFLOW_12_STAGES.map((s) => `
      <div class="stage-card ${s.gate ? "is-gate" : ""}">
        <div class="task-meta">
          <span class="dept-id-tag">${escapeHtml(s.step)}</span>
          ${s.gate ? `<span class="status-badge status-WAITING_CHAIRMAN">Cổng Kiểm Soát Cứng</span>` : `<span class="kpi-sub">Thực thi chuẩn</span>`}
        </div>
        <h3 class="dept-name">${escapeHtml(s.title)}</h3>
        <div class="kpi-sub">${escapeHtml(s.desc)}</div>
        <div class="dept-meta-footer mono-num"><span>${escapeHtml(s.raci)}</span></div>
      </div>
    `).join("");

    const lawBox = document.getElementById("arbitration-laws-list");
    lawBox.innerHTML = ARBITRATION_LAWS.map((lw) => `
      <div class="division-row" style="cursor:default;">
        <div>
          <div style="font-weight:700;color:var(--text-primary);">${escapeHtml(lw.code)} — ${escapeHtml(lw.title)}</div>
          <div class="kpi-sub">${escapeHtml(lw.desc)}</div>
        </div>
      </div>
    `).join("");
  }

  async function renderProjectsTab() {
    const listBox = document.getElementById("projects-list-box");
    if (!state.projects.length) {
      listBox.innerHTML = `<div class="kpi-sub">Chưa có dự án nào. Nhấn "+ Khởi tạo Dự án Mới" để mở cây 8 khối!</div>`;
      return;
    }
    if (!state.selectedProjectId) {
      state.selectedProjectId = state.projects[0].project_id;
    }
    listBox.innerHTML = state.projects.map((p) => `
      <div class="division-row" data-sel-proj="${escapeHtml(p.project_id)}" style="${p.project_id === state.selectedProjectId ? "border-color:var(--brand-primary);background:var(--brand-soft-bg);" : ""}">
        <div>
          <div style="font-weight:700;color:var(--text-primary);">${escapeHtml(p.title)}</div>
          <div class="kpi-sub mono-num">GĐ ${p.current_stage || 1}/12 · Cổng ${p.current_gate || 1}/5 · Giá: ${formatVnd(p.expected_price_vnd)}</div>
        </div>
        <span class="nav-badge">${escapeHtml(p.status)}</span>
      </div>
    `).join("");

    listBox.querySelectorAll("[data-sel-proj]").forEach((el) => {
      el.addEventListener("click", () => {
        state.selectedProjectId = el.getAttribute("data-sel-proj");
        renderProjectsTab();
      });
    });

    await loadProjectFiles(state.selectedProjectId);
  }

  async function loadProjectFiles(projectId) {
    const filesBox = document.getElementById("project-files-list");
    if (!projectId) return;
    try {
      const data = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}/files`);
      const files = data.files || [];
      if (!files.length) {
        filesBox.innerHTML = `<div class="kpi-sub">Thư mục dự án đã sẵn sàng (chưa có tệp báo cáo).</div>`;
        return;
      }
      filesBox.innerHTML = files.map((f) => `
        <div class="division-row" data-read-file="${escapeHtml(f.path)}">
          <span class="mono-num" style="font-size:12px;overflow-wrap:anywhere;">📄 ${escapeHtml(f.path)}</span>
          <span class="kpi-sub mono-num">${Math.max(1, Math.round((f.size_bytes || 0) / 1024))} KB</span>
        </div>
      `).join("");

      filesBox.querySelectorAll("[data-read-file]").forEach((row) => {
        row.addEventListener("click", () => readProjectDocument(projectId, row.getAttribute("data-read-file")));
      });
      await readProjectDocument(projectId, files[0].path);
    } catch (err) {
      filesBox.innerHTML = `<div class="kpi-sub">Không thể tải danh sách tệp: ${escapeHtml(err.message)}</div>`;
    }
  }

  async function readProjectDocument(projectId, filePath) {
    try {
      const doc = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}/files?file=${encodeURIComponent(filePath)}`);
      document.getElementById("doc-reader-title").textContent = `${projectId} / ${filePath}`;
      document.getElementById("doc-reader-meta").textContent = `${doc.size_bytes || 0} bytes`;
      document.getElementById("doc-reader-content").textContent = doc.content || "";
    } catch (err) {
      document.getElementById("doc-reader-content").textContent = `Lỗi đọc tệp: ${err.message}`;
    }
  }

  // -------------------------------------------------------------------------
  // 7. SLIDE-OVER / BOTTOM-SHEET BRAIN INSPECTOR (5 SUBTABS)
  // -------------------------------------------------------------------------
  async function openBrainInspector(deptId) {
    const drawer = document.getElementById("brain-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    drawer.classList.add("open");
    backdrop.classList.add("open");
    document.getElementById("drawer-body-content").innerHTML = `<div class="kpi-sub">Đang nạp Bộ Não Thiên Tài 6 Tầng của Phòng #${escapeHtml(deptId)}...</div>`;

    try {
      const detail = await apiFetch(`/api/departments/${encodeURIComponent(deptId)}`);
      state.selectedDeptDetail = detail;
      document.getElementById("drawer-dept-id").textContent = `#${detail.dept_id} · ${detail.code}`;
      document.getElementById("drawer-dept-title").textContent = detail.title_vi;
      document.getElementById("drawer-dept-div").textContent = detail.division_name_vi || detail.division_code;
      const stEl = document.getElementById("drawer-dept-status");
      stEl.className = `status-badge status-${detail.status}`;
      stEl.textContent = STATUS_LABELS[detail.status] || detail.status;
      renderDrawerSubtab();
    } catch (err) {
      document.getElementById("drawer-body-content").innerHTML = `<div class="kpi-sub">Lỗi tải hồ sơ: ${escapeHtml(err.message)}</div>`;
    }
  }

  function closeBrainInspector() {
    document.getElementById("brain-drawer").classList.remove("open");
    document.getElementById("drawer-backdrop").classList.remove("open");
  }

  function renderDrawerSubtab() {
    const d = state.selectedDeptDetail;
    const body = document.getElementById("drawer-body-content");
    if (!d || !body) return;

    document.querySelectorAll("#drawer-subtabs .subtab-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-subtab") === state.activeDrawerSubtab);
    });

    if (state.activeDrawerSubtab === "handbook") {
      const books = (d.canonical_books || []).join(" · ");
      body.innerHTML = `
        <div class="article-insight" style="margin-bottom:12px;">
          <strong>Sứ mệnh cốt lõi:</strong> ${escapeHtml(d.mission)}<br/>
          ${books ? `<strong>Giáo trình kinh điển:</strong> ${escapeHtml(books)}<br/>` : ""}
          ${d.core_formula ? `<strong>Công thức / Tiêu chuẩn cứng:</strong> <code>${escapeHtml(d.core_formula)}</code>` : ""}
        </div>
        <div class="section-header">
          <span class="kpi-sub mono-num">Tệp gốc: ${escapeHtml(d.handbook_path)}</span>
          <button type="button" class="btn btn-sm btn-primary" id="btn-save-handbook">Lưu cập nhật Cẩm nang</button>
        </div>
        <textarea class="textarea-control mono-num" id="drawer-handbook-editor" style="min-height:360px;font-size:12.5px;">${escapeHtml(d.handbook_markdown || "")}</textarea>
      `;
      document.getElementById("btn-save-handbook").addEventListener("click", async () => {
        const md = document.getElementById("drawer-handbook-editor").value;
        try {
          const updated = await apiFetch(`/api/departments/${encodeURIComponent(d.dept_id)}/handbook`, {
            method: "PATCH",
            body: JSON.stringify({ handbook_markdown: md })
          });
          state.selectedDeptDetail = updated;
          showToast(`Đã lưu Cẩm nang 6 Tầng mới cho Phòng #${d.dept_id}!`);
        } catch (err) {
          showToast(`Lỗi lưu cẩm nang: ${err.message}`);
        }
      });
      return;
    }

    if (state.activeDrawerSubtab === "learned") {
      const arts = d.learned_articles || [];
      if (!arts.length) {
        body.innerHTML = `<div class="kpi-sub">Phòng #${escapeHtml(d.dept_id)} chưa có bài báo riêng. Bấm "✦ Quét báo mới" hoặc dán URL ở Tab 4 để nạp tri thức!</div>`;
        return;
      }
      body.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;">` + arts.map((a) => {
        const linkUrl = a.url || a.source_url || "#";
        const srcName = a.source_connector || a.source_name || "Web Intel";
        return `
        <div class="article-card">
          <div class="task-meta"><span>${escapeHtml(srcName)}</span> <span>${escapeHtml(formatShortTime(a.fetched_at))}</span></div>
          <div class="article-title"><a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(a.title)} ↗</a></div>
          <div class="kpi-sub">${escapeHtml(a.actionable_insight || a.summary_vi || "")}</div>
        </div>
      `;
      }).join("") + `</div>`;
      return;
    }

    if (state.activeDrawerSubtab === "tasks") {
      const tks = d.tasks || [];
      if (!tks.length) {
        body.innerHTML = `<div class="kpi-sub">Chưa có đầu việc nào giao cho Phòng #${escapeHtml(d.dept_id)}. Chuyển sang mục "5. Giao việc ngay" để phát lệnh!</div>`;
        return;
      }
      body.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;">` + tks.map((t) => `
        <div class="task-card">
          <div class="task-meta"><span>${escapeHtml(t.task_id)}</span> ${statusBadgeHtml(t.kanban_column)}</div>
          <div class="task-title">${escapeHtml(t.title)}</div>
          <div class="kpi-sub">${escapeHtml(t.description || "")}</div>
        </div>
      `).join("") + `</div>`;
      return;
    }

    if (state.activeDrawerSubtab === "reflexion") {
      const refs = d.reflexions || [];
      if (!refs.length) {
        body.innerHTML = `<div class="article-insight">Phòng #${escapeHtml(d.dept_id)} hiện có <strong>0</strong> biên bản lỗi tồn đọng. Khi Chủ tịch bấm "Bác bỏ" ở Cổng duyệt, bài học tự kiểm điểm sẽ được khắc vĩnh viễn tại đây!</div>`;
        return;
      }
      body.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;">` + refs.map((r) => `
        <div class="article-card" style="border-left:3px solid var(--state-danger);">
          <div class="task-meta"><span>Biên bản Reflexion</span> <span>${escapeHtml(formatShortTime(r.created_at))}</span></div>
          <div class="task-title">Triệu chứng bị trả về: ${escapeHtml(r.failure_symptom)}</div>
          <div class="kpi-sub"><strong>Nguyên nhân gốc:</strong> ${escapeHtml(r.root_cause)}</div>
          <div class="article-insight"><strong>Luật cấm tái phạm:</strong> ${escapeHtml(r.preventive_rule)}</div>
        </div>
      `).join("") + `</div>`;
      return;
    }

    if (state.activeDrawerSubtab === "dispatch") {
      body.innerHTML = `
        <form id="form-drawer-dispatch">
          <div class="form-row">
            <label class="form-label">Giao đầu việc trực tiếp cho #${escapeHtml(d.dept_id)} (${escapeHtml(d.title_vi)})</label>
            <input type="text" class="input-control" id="dd-title" placeholder="Nhập tên nhiệm vụ cần thực thi ngay..." required />
          </div>
          <div class="form-row">
            <label class="form-label">Yêu cầu chi tiết & Nguồn dữ liệu cần kiểm chứng</label>
            <textarea class="textarea-control" id="dd-desc" placeholder="Mô tả rõ tiêu chí bàn giao..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Giao việc ngay cho Phòng #${escapeHtml(d.dept_id)}</button>
        </form>
      `;
      document.getElementById("form-drawer-dispatch").addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("dd-title").value.trim();
        const desc = document.getElementById("dd-desc").value.trim();
        if (!title) return;
        await createNewTask({ title, description: desc, assigned_dept_id: d.dept_id, priority: "HIGH" });
        const refreshed = await apiFetch(`/api/departments/${encodeURIComponent(d.dept_id)}`);
        state.selectedDeptDetail = refreshed;
        state.activeDrawerSubtab = "tasks";
        renderDrawerSubtab();
      });
    }
  }

  // -------------------------------------------------------------------------
  // 8. REAL-TIME SSE STREAM WITH rAF BATCHING & EXPONENTIAL RECONNECT
  // -------------------------------------------------------------------------
  function connectSseStream() {
    if (state.staticCloudMode || !window.EventSource) return;
    if (state.sseSource) {
      state.sseSource.close();
    }
    const url = `/api/events/stream?since=${state.lastEventId}`;
    const es = new EventSource(url);
    state.sseSource = es;

    es.onopen = () => {
      updateConnectionIndicator("", "Trực tuyến SSE");
    };

    es.addEventListener("activity", (e) => {
      try {
        const ev = JSON.parse(e.data);
        if (ev.event_id) state.lastEventId = Math.max(state.lastEventId, Number(ev.event_id));
        state.sseQueueBuffer.push(ev);
        if (!state.rafScheduled) {
          state.rafScheduled = true;
          window.requestAnimationFrame(flushSseFrameBatch);
        }
      } catch (_err) {}
    });

    es.onerror = () => {
      es.close();
      if (!state.staticCloudMode) {
        updateConnectionIndicator("warning", "Đang nối lại...");
        setTimeout(connectSseStream, 2500);
      }
    };
  }

  function flushSseFrameBatch() {
    state.rafScheduled = false;
    if (!state.sseQueueBuffer.length) return;
    const batch = state.sseQueueBuffer.splice(0, state.sseQueueBuffer.length);

    const feedEl = document.getElementById("live-activity-feed");
    if (feedEl) {
      const frag = document.createElement("div");
      frag.innerHTML = batch.slice().reverse().map(renderFeedItemHtml).join("");
      bindFeedItemClicks(frag);
      while (frag.firstChild) {
        feedEl.insertBefore(frag.firstChild, feedEl.firstChild);
      }
      // Strict DOM hygiene: cap at 200 live rows
      while (feedEl.children.length > 200) {
        feedEl.removeChild(feedEl.lastChild);
      }
    }

    // Refresh lightweight KPIs if learning finished or gate changed
    if (batch.some((ev) => ["LEARNING_COMPLETED", "CHAIRMAN_APPROVED", "CHAIRMAN_REJECTED", "GATE_WAITING_CHAIRMAN", "DEPT_HIRED"].includes(ev.event_type))) {
      refreshAllCoreData();
    }
  }

  // -------------------------------------------------------------------------
  // 9. NAVIGATION, MODALS, SELECT POPULATORS & HOTKEYS
  // -------------------------------------------------------------------------
  function switchTab(tabId) {
    if (!TAB_TITLES[tabId]) return;
    state.activeTab = tabId;
    document.getElementById("topbar-title").textContent = TAB_TITLES[tabId];

    document.querySelectorAll(".tab-panel").forEach((p) => {
      p.classList.toggle("active", p.id === `panel-${tabId}`);
    });
    document.querySelectorAll("#desktop-nav .nav-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll("#mobile-bottom-nav .mob-nav-btn[data-tab]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tabId);
    });

    if (window.location.hash !== `#${tabId}`) {
      history.replaceState(null, "", `#${tabId}`);
    }

    if (tabId === "org") renderOrgChart();
    if (tabId === "kanban") renderKanban();
    if (tabId === "learning" && !state.articles.length) runKnowledgeSearch("");
    if (tabId === "workflow") renderWorkflowTab();
    if (tabId === "projects") renderProjectsTab();
    if (tabId === "finance") runCfoSimulation();
    if (tabId === "hr") loadAuditDiagnostics();
  }

  function openModal(id) {
    closeAllModals();
    document.getElementById("modal-backdrop").classList.add("open");
    const m = document.getElementById(id);
    if (m) {
      m.classList.add("open");
      const firstInput = m.querySelector("input, textarea, select");
      if (firstInput) setTimeout(() => firstInput.focus(), 40);
    }
  }

  function closeAllModals() {
    document.getElementById("modal-backdrop").classList.remove("open");
    document.querySelectorAll(".modal-dialog.open").forEach((m) => m.classList.remove("open"));
  }

  function populateSelectMenus() {
    const divOpts = `<option value="">Tất cả các Khối</option>` +
      state.divisions.map((dv) => `<option value="${escapeHtml(dv.code)}">${escapeHtml(dv.name_vi)}</option>`).join("");
    document.getElementById("org-division-filter").innerHTML = divOpts;
    document.getElementById("kanban-division-filter").innerHTML = divOpts;
    document.getElementById("knowledge-division-filter").innerHTML = divOpts;

    const hireDiv = document.getElementById("hire-division");
    hireDiv.innerHTML = state.divisions
      .filter((dv) => dv.code !== "EXEC")
      .map((dv) => `<option value="${escapeHtml(dv.code)}">${escapeHtml(dv.name_vi)}</option>`).join("");

    const deptOpts = state.departments
      .map((d) => `<option value="${escapeHtml(d.dept_id)}">#${escapeHtml(d.dept_id)} — ${escapeHtml(d.title_vi)}</option>`)
      .join("");
    document.getElementById("task-dept-select").innerHTML = deptOpts;
    document.getElementById("ingest-dept-select").innerHTML = deptOpts;

    const projOpts = state.projects
      .map((p) => `<option value="${escapeHtml(p.project_id)}">${escapeHtml(p.title)}</option>`)
      .join("");
    document.getElementById("kanban-project-filter").innerHTML = `<option value="">Tất cả dự án toàn Tập đoàn</option>` + projOpts;
    document.getElementById("task-project-select").innerHTML = `<option value="">-- Việc chung Tập đoàn --</option>` + projOpts;
  }

  // -------------------------------------------------------------------------
  // 10. DATA LOADERS & MUTATION HANDLERS
  // -------------------------------------------------------------------------
  async function refreshAllCoreData() {
    try {
      const [ov, deptRes, taskRes] = await Promise.all([
        apiFetch("/api/overview?limit=80"),
        apiFetch("/api/departments"),
        apiFetch("/api/tasks")
      ]);
      state.overview = ov;
      state.divisions = ov.divisions || [];
      state.projects = ov.projects || [];
      state.departments = deptRes.departments || [];
      state.tasks = taskRes.tasks || [];

      populateSelectMenus();
      renderOverview();
      if (state.activeTab === "org") renderOrgChart();
      if (state.activeTab === "kanban") renderKanban();
      if (state.activeTab === "projects") renderProjectsTab();

      await idb.set("cached_boot_state_v4", {
        overview: state.overview,
        departments: state.departments,
        tasks: state.tasks
      });
    } catch (err) {
      updateConnectionIndicator("danger", "Ngoại tuyến (Đệm cục bộ)");
    }
  }

  async function refreshTasksAndOverview() {
    const [ov, taskRes, deptRes] = await Promise.all([
      apiFetch("/api/overview?limit=60"),
      apiFetch("/api/tasks"),
      apiFetch("/api/departments")
    ]);
    state.overview = ov;
    state.tasks = taskRes.tasks || [];
    state.departments = deptRes.departments || [];
    renderOverview();
    renderKanban();
    if (state.activeTab === "org") renderOrgChart();
  }

  async function createNewTask(payload) {
    // Optimistic UI update (< 16ms)
    const tempTask = {
      task_id: `temp-${Date.now()}`,
      title: payload.title,
      description: payload.description || "",
      assigned_dept_id: payload.assigned_dept_id || "00",
      kanban_column: "BACKLOG",
      stage_number: payload.stage_number || 1,
      gate_number: payload.gate_number || 1
    };
    state.tasks.unshift(tempTask);
    if (state.activeTab === "kanban") renderKanban();

    try {
      await apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(payload) });
      showToast(`Đã phát lệnh giao việc "${payload.title}" cho Phòng #${payload.assigned_dept_id}!`);
      await refreshTasksAndOverview();
    } catch (err) {
      showToast(`Không thể giao việc: ${err.message}`);
      await refreshTasksAndOverview();
    }
  }

  function runKnowledgeSearch(queryText) {
    if (state.searchAbortCtrl) {
      state.searchAbortCtrl.abort();
    }
    const ctrl = new AbortController();
    state.searchAbortCtrl = ctrl;
    const div = document.getElementById("knowledge-division-filter").value;
    const url = `/api/knowledge?q=${encodeURIComponent(queryText || "")}&division=${encodeURIComponent(div || "")}&limit=80`;

    apiFetch(url, { signal: ctrl.signal })
      .then((res) => renderKnowledgeArticles(res.articles || [], res.elapsed_ms))
      .catch((err) => {
        if (err.name !== "AbortError") {
          renderKnowledgeArticles([], 0);
        }
      });
  }

  async function runCfoSimulation() {
    const payload = {
      price_per_month: Number(document.getElementById("cfo-price").value || 399000),
      max_quota_units: Number(document.getElementById("cfo-quota").value || 100),
      api_cost_per_unit: Number(document.getElementById("cfo-apicost").value || 950),
      avg_usage_ratio: Number(document.getElementById("cfo-usage").value || 0.6),
      payment_fee_pct: Number(document.getElementById("cfo-payfee").value || 1.5),
      tax_reserve_pct: Number(document.getElementById("cfo-tax").value || 7.0),
      fixed_monthly_cost: Number(document.getElementById("cfo-fixed").value || 1500000)
    };
    let sim;
    try {
      sim = state.staticCloudMode
        ? computeLocalCfo(payload)
        : await apiFetch("/api/finance/simulate", { method: "POST", body: JSON.stringify(payload) });
    } catch (_e) {
      sim = computeLocalCfo(payload);
    }

    const badge = document.getElementById("cfo-gate-badge");
    badge.className = `status-badge ${sim.gate1_passed ? "status-DONE" : "status-REJECTED"}`;
    badge.textContent = sim.gate1_passed ? "✓ ĐẠT CỔNG 1 (>=65%)" : "✕ CẢNH BÁO LỖ NGẦM";
    document.getElementById("cfo-verdict-banner").textContent = sim.verdict_vi;
    document.getElementById("cfo-worst-margin").textContent = `${sim.worst_gross_margin_pct}%`;
    document.getElementById("cfo-worst-profit").textContent = `Lãi ròng kịch bản xấu: ${formatVnd(sim.net_profit_per_user_worst)}/khách`;
    document.getElementById("cfo-breakeven").textContent = sim.breakeven_customers > 0 ? `${sim.breakeven_customers} khách` : "Không hòa vốn";
    document.getElementById("cfo-exp-margin").textContent = `Biên kỳ vọng: ${sim.expected_gross_margin_pct}%`;

    const tbody = document.getElementById("cfo-projection-tbody");
    const tiers = ["10", "50", "200", "500"];
    tbody.innerHTML = tiers.map((k) => {
      const row = (sim.projections || {})[k] || { customers: k, gross_revenue: 0, tax_reserve: 0, net_profit: 0 };
      const profitColor = row.net_profit >= 0 ? "var(--state-success)" : "var(--state-danger)";
      return `
        <tr>
          <td><strong>${row.customers} khách trả phí</strong></td>
          <td>${formatVnd(row.gross_revenue)}</td>
          <td>${formatVnd(row.tax_reserve)}</td>
          <td style="font-weight:700;color:${profitColor};">${formatVnd(row.net_profit)}</td>
        </tr>
      `;
    }).join("");
  }

  async function loadAuditDiagnostics() {
    const box = document.getElementById("hr-audit-box");
    try {
      const res = await apiFetch("/api/audit");
      const ok = Boolean(res.passed);
      document.getElementById("badge-audit").textContent = ok ? "OK" : "ERR";
      box.innerHTML = `
        <strong>Kết quả Kiểm toán Toàn Tập đoàn:</strong> ${ok ? "✓ XANH 100% ĐẠT CHUẨN" : "✕ CÓ CẢNH BÁO"}<br/>
        • Số Bộ Não Thiên Tài 6 Tầng đã đăng ký: <strong>${res.registered_departments ?? state.departments.length}</strong> vị trí<br/>
        • Chế độ kết nối hiện tại: <strong>${state.staticCloudMode ? "GitHub Pages Cloud CDN (24/7)" : "Local Multi-Threaded SQLite WAL + Live SSE"}</strong>
      `;
    } catch (err) {
      box.textContent = `Không thể chạy kiểm toán: ${err.message}`;
    }
  }

  // Bidirectional GitHub REST API Cloud Sync directly from Browser / Phone PWA
  async function syncWithGitHubCloud() {
    const pin = document.getElementById("cloud-pin-input").value;
    if (!pin) {
      showToast("Vui lòng nhập Mã PIN Két sắt trên thiết bị để mở khóa đồng bộ GitHub!");
      return;
    }
    try {
      const creds = await cryptoVault.unlockCredentials(pin);
      const apiUrl = `https://api.github.com/repos/${creds.repo}/contents/corporate_hq/cloud_state/snapshot.json`;
      const headers = {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${creds.token}`
      };
      const remoteRes = await fetch(apiUrl, { headers });
      if (!remoteRes.ok) throw new Error(`GitHub API trả mã ${remoteRes.status}`);
      const remoteMeta = await remoteRes.json();
      const decodedJson = JSON.parse(decodeURIComponent(escape(atob((remoteMeta.content || "").replace(/\s/g, "")))));

      if (!state.staticCloudMode) {
        const merged = await apiFetch("/api/sync/snapshot", {
          method: "POST",
          body: JSON.stringify({ snapshot: decodedJson })
        });
        const newContentB64 = btoa(unescape(encodeURIComponent(JSON.stringify(merged.snapshot, null, 2))));
        await fetch(apiUrl, {
          method: "PUT",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `chore(sync): multi-device Command Center sync ${new Date().toISOString()}`,
            content: newContentB64,
            sha: remoteMeta.sha
          })
        });
        await refreshAllCoreData();
      } else {
        await idb.set("latest_snapshot_backup", decodedJson);
        await refreshAllCoreData();
      }
      closeAllModals();
      showToast("Đồng bộ 2 chiều với Đám mây GitHub thành công 100%!");
    } catch (err) {
      showToast(`Lỗi đồng bộ GitHub: ${err.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 11. THEME, PWA SERVICE WORKER & EVENT BINDINGS
  // -------------------------------------------------------------------------
  function applyTheme(theme) {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("titan_theme", t);
    const meta = document.getElementById("meta-theme-color");
    if (meta) meta.setAttribute("content", t === "dark" ? "#0B1120" : "#0D9488");
  }

  function renderCommandPaletteResults(q) {
    const list = document.getElementById("cmd-results-list");
    const term = (q || "").trim().toLowerCase();
    const matches = [];

    state.departments.forEach((d) => {
      if (!term || `${d.dept_id} ${d.code} ${d.title_vi} ${d.mission}`.toLowerCase().includes(term)) {
        matches.push({ type: "dept", id: d.dept_id, label: `Nhân sự #${d.dept_id}: ${d.title_vi}`, sub: d.division_name_vi });
      }
    });
    state.tasks.forEach((t) => {
      if (term && `${t.title} ${t.task_id}`.toLowerCase().includes(term)) {
        matches.push({ type: "task", id: t.task_id, label: `Đầu việc: ${t.title}`, sub: t.kanban_column });
      }
    });

    list.innerHTML = matches.slice(0, 14).map((m) => `
      <div class="division-row" data-cmd-type="${m.type}" data-cmd-id="${escapeHtml(m.id)}">
        <div>
          <div style="font-weight:600;color:var(--text-primary);">${escapeHtml(m.label)}</div>
          <div class="kpi-sub">${escapeHtml(m.sub || "")}</div>
        </div>
        <span class="kpi-sub">Mở ↵</span>
      </div>
    `).join("") || `<div class="kpi-sub">Không tìm thấy mục nào khớp "${escapeHtml(q)}".</div>`;

    list.querySelectorAll("[data-cmd-type]").forEach((row) => {
      row.addEventListener("click", () => {
        const tp = row.getAttribute("data-cmd-type");
        const id = row.getAttribute("data-cmd-id");
        closeAllModals();
        if (tp === "dept") openBrainInspector(id);
        if (tp === "task") switchTab("kanban");
      });
    });
  }

  function bindUiEvents() {
    // Desktop & Mobile Tab Buttons
    document.querySelectorAll("#desktop-nav .nav-btn[data-tab], #mobile-bottom-nav .mob-nav-btn[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
    });

    document.getElementById("btn-mobile-more").addEventListener("click", () => openModal("modal-mobile-more"));
    document.querySelectorAll("[data-mob-jump]").forEach((b) => {
      b.addEventListener("click", () => {
        closeAllModals();
        switchTab(b.getAttribute("data-mob-jump"));
      });
    });

    // Mobile Kanban Horizontal Scroll Snap Pills
    document.querySelectorAll("#mobile-kanban-pills [data-kcol]").forEach((pill) => {
      pill.addEventListener("click", () => {
        const idx = Number(pill.getAttribute("data-kcol") || 0);
        const board = document.getElementById("kanban-board");
        const targetCol = board.children[idx];
        if (targetCol) {
          targetCol.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        }
      });
    });

    // Theme Toggle
    document.getElementById("btn-toggle-theme").addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });

    // Topbar Quick Buttons
    document.getElementById("btn-open-cmd").addEventListener("click", () => {
      openModal("modal-cmd");
      renderCommandPaletteResults("");
    });
    document.getElementById("cmd-search-input").addEventListener("input", (e) => renderCommandPaletteResults(e.target.value));

    const triggerLearn = async () => {
      try {
        const res = await apiFetch("/api/learning/run", { method: "POST", body: JSON.stringify({ scope: "all" }) });
        showToast(res.message || "Đã kích hoạt quét báo chí & nghiên cứu chạy nền!");
      } catch (err) {
        showToast(`Không thể quét trực tiếp: ${err.message}`);
      }
    };
    document.getElementById("btn-trigger-learn").addEventListener("click", triggerLearn);
    document.getElementById("btn-run-all-feeds").addEventListener("click", triggerLearn);

    document.getElementById("btn-new-task").addEventListener("click", () => openModal("modal-task"));
    document.getElementById("btn-kanban-new-task").addEventListener("click", () => openModal("modal-task"));
    document.getElementById("btn-new-project-quick").addEventListener("click", () => openModal("modal-project"));
    document.getElementById("btn-open-new-project").addEventListener("click", () => openModal("modal-project"));
    document.getElementById("btn-open-cloud").addEventListener("click", () => openModal("modal-cloud"));
    document.getElementById("btn-open-cloud-2").addEventListener("click", () => openModal("modal-cloud"));
    document.getElementById("btn-refresh-overview").addEventListener("click", refreshAllCoreData);

    // Close Drawer & Modals
    document.getElementById("btn-close-drawer").addEventListener("click", closeBrainInspector);
    document.getElementById("drawer-backdrop").addEventListener("click", closeBrainInspector);
    document.getElementById("modal-backdrop").addEventListener("click", closeAllModals);
    document.querySelectorAll("[data-close-modal]").forEach((b) => b.addEventListener("click", closeAllModals));

    // Drawer Subtabs
    document.querySelectorAll("#drawer-subtabs .subtab-btn").forEach((b) => {
      b.addEventListener("click", () => {
        state.activeDrawerSubtab = b.getAttribute("data-subtab");
        renderDrawerSubtab();
      });
    });

    // Org & Kanban Filters
    document.getElementById("org-search-input").addEventListener("input", renderOrgChart);
    document.getElementById("org-division-filter").addEventListener("change", renderOrgChart);
    document.getElementById("org-status-filter").addEventListener("change", renderOrgChart);
    document.getElementById("kanban-project-filter").addEventListener("change", renderKanban);
    document.getElementById("kanban-division-filter").addEventListener("change", renderKanban);

    // 120ms Debounced FTS5 Search with AbortController
    document.getElementById("knowledge-search-input").addEventListener("input", (e) => {
      clearTimeout(state.searchTimer);
      const val = e.target.value;
      state.searchTimer = setTimeout(() => runKnowledgeSearch(val), 120);
    });
    document.getElementById("knowledge-division-filter").addEventListener("change", () => {
      runKnowledgeSearch(document.getElementById("knowledge-search-input").value);
    });

    // Deep URL Ingestion Form
    document.getElementById("form-ingest-url").addEventListener("submit", async (e) => {
      e.preventDefault();
      const url = document.getElementById("ingest-url-input").value.trim();
      const deptId = document.getElementById("ingest-dept-select").value;
      try {
        showToast("Đang tải và bóc tách bài viết thực tế...");
        const res = await apiFetch("/api/learning/ingest-url", {
          method: "POST",
          body: JSON.stringify({ url, dept_id: deptId, importance: 9 })
        });
        document.getElementById("ingest-url-input").value = "";
        showToast(`Đã ghi nhớ bài "${res.title || url}" vào bộ não Phòng #${deptId}!`);
        runKnowledgeSearch("");
        refreshAllCoreData();
      } catch (err) {
        showToast(`Lỗi đọc URL: ${err.message}`);
      }
    });

    // Create Task Form
    document.getElementById("form-create-task").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById("task-title-input").value.trim(),
        assigned_dept_id: document.getElementById("task-dept-select").value,
        project_id: document.getElementById("task-project-select").value || null,
        stage_number: Number(document.getElementById("task-stage-input").value || 1),
        gate_number: Number(document.getElementById("task-gate-input").value || 1),
        priority: document.getElementById("task-priority-select").value,
        description: document.getElementById("task-desc-input").value.trim()
      };
      closeAllModals();
      document.getElementById("form-create-task").reset();
      await createNewTask(payload);
    });

    // Create Project Form
    document.getElementById("form-create-project").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById("proj-title-input").value.trim(),
        slug: document.getElementById("proj-slug-input").value.trim(),
        objective: document.getElementById("proj-obj-input").value.trim(),
        expected_price_vnd: Number(document.getElementById("proj-price-input").value || 399000),
        unit_cost_vnd: Number(document.getElementById("proj-cost-input").value || 95000),
        seed_gate1_tasks: true
      };
      try {
        const proj = await apiFetch("/api/projects", { method: "POST", body: JSON.stringify(payload) });
        closeAllModals();
        document.getElementById("form-create-project").reset();
        state.selectedProjectId = proj.project_id;
        showToast(`Đã khởi tạo Dự án "${proj.title}" kèm 4 đầu việc Cổng 1!`);
        await refreshAllCoreData();
        switchTab("kanban");
      } catch (err) {
        showToast(`Lỗi tạo dự án: ${err.message}`);
      }
    });

    // Chairman Gate Approve / Reject
    const submitDecision = async (decision) => {
      const tid = document.getElementById("decision-task-id").value;
      const note = document.getElementById("decision-note-input").value.trim();
      const rule = document.getElementById("decision-rule-input").value.trim();
      try {
        await apiFetch(`/api/tasks/${encodeURIComponent(tid)}/decision`, {
          method: "POST",
          body: JSON.stringify({ decision, note, preventive_rule: rule })
        });
        closeAllModals();
        showToast(
          decision === "APPROVE"
            ? "Chủ tịch đã PHÊ DUYỆT đầu việc!"
            : "Đã BÁC BỎ & tự động ghi bài học vào Sổ Kiểm Điểm Reflexion của phòng ban!"
        );
        await refreshTasksAndOverview();
      } catch (err) {
        showToast(`Lỗi xử lý cổng duyệt: ${err.message}`);
      }
    };
    document.getElementById("btn-confirm-approve").addEventListener("click", () => submitDecision("APPROVE"));
    document.getElementById("btn-confirm-reject").addEventListener("click", () => submitDecision("REJECT"));

    // CFO Simulator Form & Live Input
    document.getElementById("form-cfo-sim").addEventListener("submit", (e) => {
      e.preventDefault();
      runCfoSimulation();
    });
    document.querySelectorAll("#form-cfo-sim input").forEach((inp) => {
      inp.addEventListener("input", runCfoSimulation);
    });

    // Hire New Specialist (#46+)
    document.getElementById("form-hire-dept").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        division: document.getElementById("hire-division").value,
        code: document.getElementById("hire-code").value.trim(),
        title: document.getElementById("hire-title").value.trim(),
        mission: document.getElementById("hire-mission").value.trim(),
        books: document.getElementById("hire-books").value.trim()
      };
      try {
        const res = await apiFetch("/api/departments", { method: "POST", body: JSON.stringify(payload) });
        document.getElementById("form-hire-dept").reset();
        showToast(`Đã tuyển dụng và biên dịch Bộ Não 6 Tầng cho Phòng #${res.dept_id}!`);
        await refreshAllCoreData();
        openBrainInspector(res.dept_id);
      } catch (err) {
        showToast(`Lỗi tuyển nhân sự: ${err.message}`);
      }
    });

    document.getElementById("btn-run-audit").addEventListener("click", loadAuditDiagnostics);

    // Export Snapshot JSON
    document.getElementById("btn-export-snapshot").addEventListener("click", async () => {
      try {
        const snap = await apiFetch("/api/sync/snapshot");
        const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `titan-corp-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
      } catch (err) {
        showToast(`Lỗi xuất snapshot: ${err.message}`);
      }
    });

    // Save Cloud Vault & Trigger Sync
    document.getElementById("form-cloud-config").addEventListener("submit", async (e) => {
      e.preventDefault();
      const repo = document.getElementById("cloud-repo-input").value.trim();
      const token = document.getElementById("cloud-token-input").value.trim();
      const pin = document.getElementById("cloud-pin-input").value;
      if (!repo || !token || pin.length < 4) {
        showToast("Vui lòng nhập kho owner/repo, Token và mã PIN tối thiểu 4 ký tự.");
        return;
      }
      await cryptoVault.saveCredentials(repo, token, pin);
      document.getElementById("cloud-token-input").value = "";
      showToast("Đã mã hóa AES-256-GCM và cất khóa an toàn trên thiết bị này!");
    });
    document.getElementById("btn-sync-github-now").addEventListener("click", syncWithGitHubCloud);

    // Executive Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openModal("modal-cmd");
        renderCommandPaletteResults("");
        return;
      }
      if (e.key === "Escape") {
        closeAllModals();
        closeBrainInspector();
        return;
      }
      if (isTyping) return;

      const tabOrder = ["overview", "org", "kanban", "learning", "workflow", "projects", "finance", "hr"];
      if (e.key >= "1" && e.key <= "8") {
        switchTab(tabOrder[Number(e.key) - 1]);
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        openModal("modal-task");
      } else if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        triggerLearn();
      } else if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
      }
    });

    // Online Recovery & PWA Install Prompt
    window.addEventListener("online", () => {
      showToast("Đã có mạng trở lại — Đang đồng bộ hàng đợi ngoại tuyến...");
      idb.flushMutations().then(refreshAllCoreData);
    });

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      state.deferredInstallPrompt = e;
      const btn = document.getElementById("btn-install-pwa");
      if (btn) {
        btn.style.display = "inline-flex";
        btn.onclick = async () => {
          state.deferredInstallPrompt.prompt();
          state.deferredInstallPrompt = null;
          btn.style.display = "none";
        };
      }
    });
  }

  // -------------------------------------------------------------------------
  // 12. BOOTSTRAP (< 50ms Instant IndexedDB Hydrate + Live Revalidate + SW)
  // -------------------------------------------------------------------------
  async function bootstrap() {
    const savedTheme = localStorage.getItem("titan_theme") || "light";
    applyTheme(savedTheme);
    bindUiEvents();
    renderWorkflowTab();
    runCfoSimulation();

    // Instant cached paint from IndexedDB if available
    const cached = await idb.get("cached_boot_state_v4");
    if (cached && cached.overview) {
      state.overview = cached.overview;
      state.divisions = cached.overview.divisions || [];
      state.projects = cached.overview.projects || [];
      state.departments = cached.departments || [];
      state.tasks = cached.tasks || [];
      populateSelectMenus();
      renderOverview();
    }

    const hashTab = (window.location.hash || "").replace("#", "");
    if (TAB_TITLES[hashTab]) {
      switchTab(hashTab);
    }

    await idb.refreshOutboxCount();
    await refreshAllCoreData();
    connectSseStream();

    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})();
