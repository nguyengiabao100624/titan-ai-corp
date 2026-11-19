/* ==========================================================================
   TITAN COMMAND CENTER v5.1 — ZERO-DEFECT AUTONOMOUS ENTERPRISE SPA
   ========================================================================== */
(() => {
  "use strict";

  const VIEW_TITLES = {
    command: "Giao việc & Kiếm tiền",
    missions: "Tiến độ Nhiệm vụ",
    tasks: "Bảng việc chi tiết",
    staff: "Nhân sự chuyên gia",
    news: "Báo mới thị trường",
    finance: "Tài chính & Dự án"
  };

  const COL_LABELS = {
    BACKLOG: "Hàng đợi",
    IN_PROGRESS: "Đang làm",
    QA_SECURITY_REVIEW: "Kiểm định QA",
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
    vn_news: "Báo kinh tế VN",
    google_news: "Google Tin tức",
    creator_seo_pulse: "Tăng trưởng & SEO",
    security_advisory: "Cảnh báo An ninh",
    arxiv: "Nghiên cứu arXiv",
    github_repo: "Mã nguồn mở GitHub",
    hackernews: "Hacker News",
    deep_url: "Bài đọc từ link",
    cloud_sync: "Đồng bộ Đám mây",
    bench_rss: "Bản tin tổng hợp"
  };

  const DIV_SHORT_NAMES = {
    "exec-board": "Điều hành",
    "div9-critique-ux-lab": "Khối 9: Phản biện & Tester",
    "div1-strategy-intel": "Khối 1: Chiến lược",
    "div2-product-design": "Khối 2: Sản phẩm & UX",
    "div3-engineering-ai": "Khối 3: Kỹ thuật & AI",
    "div4-qa-cybersecurity": "Khối 4: An ninh & QA",
    "div5-media-youtube-studio": "Khối 5: Video & Kênh",
    "div6-sales-commercial": "Khối 6: Bán hàng",
    "div7-finance-tax-legal": "Khối 7: Tài chính & Thuế",
    "div8-data-ops-hr": "Khối 8: Vận hành & HR"
  };

  const EXACT_WORD_CASING = {
    "ai": "AI", "ux": "UX", "ui": "UI", "qa": "QA", "cfo": "CFO", "ceo": "CEO",
    "bi": "BI", "hr": "HR", "pm": "PM", "pmo": "PMO", "pr": "PR", "it": "IT",
    "seo": "SEO", "geo": "GEO", "aeo": "AEO", "cro": "CRO", "ctr": "CTR",
    "sdr": "SDR", "fp&a": "FP&A", "r&d": "R&D", "pwa": "PWA", "usd": "USD",
    "vnđ": "VNĐ", "tmđt": "TMĐT", "sme": "SME", "api": "API", "sql": "SQL",
    "pdf": "PDF", "kpi": "KPI", "okr": "OKR", "roi": "ROI", "sla": "SLA",
    "mvp": "MVP", "prd": "PRD", "vip": "VIP", "b2b": "B2B", "b2c": "B2C",
    "iot": "IoT", "saas": "SaaS", "youtube": "YouTube", "tiktok": "TikTok",
    "github": "GitHub", "google": "Google", "zalo": "Zalo", "shopee": "Shopee",
    "facebook": "Facebook", "pre-mortem": "Pre-Mortem"
  };

  const state = {
    tab: "command",
    staticMode: false,
    overview: null,
    bridge: { online: false, mode: "ANTIGRAVITY_SWARM", active_workers: [], pending_orders_count: 0 },
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
    expandedStepIds: new Set(),
    selectedProjectId: "",
    currentDocFile: "",
    docEditMode: false,
    cmdIndex: 0,
    cmdItems: [],
    sse: null,
    bridgeTimer: null
  };

  // -------------------------------------------------------------------------
  // 1. SAFE FORMATTING, VIETNAMESE TYPOGRAPHY & MARKDOWN ENGINE
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

  function vnd(n) {
    return (Number(n) || 0).toLocaleString("vi-VN") + " đ";
  }

  function formatDotNumber(n) {
    return (Math.round(Number(n) || 0)).toLocaleString("vi-VN");
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
      .replace(/đ/g, "d").replace(/Đ/g, "D")
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

  function calmTitle(raw) {
    if (!raw) return "";
    let s = String(raw).replace(/\s*\(@[a-z0-9_-]+\)/gi, "").trim();
    if (!s) return "";
    const lower = s.toLowerCase();
    const base = lower.charAt(0).toUpperCase() + lower.slice(1);
    return base.replace(/(?<![a-zA-ZÀ-ỹ0-9&])([a-zA-ZÀ-ỹ0-9&-]+)(?![a-zA-ZÀ-ỹ0-9&])/g, (match) => {
      const k = match.toLowerCase();
      return EXACT_WORD_CASING[k] || match;
    });
  }

  function deptTitle(deptId) {
    const found = state.departments.find((d) => d.dept_id === deptId);
    return found ? calmTitle(found.title_vi) : `Phòng #${deptId}`;
  }

  function formatInlineMd(rawText) {
    const codeTokens = [];
    const withPlaceholders = String(rawText || "").replace(/`([^`]+)`/g, (_m, inner) => {
      const idx = codeTokens.length;
      codeTokens.push(`<code class="mono" style="background:var(--bg-subtle);padding:1px 5px;border-radius:4px;">${esc(inner)}</code>`);
      return `\u0000CODE${idx}\u0000`;
    });

    let safe = esc(withPlaceholders)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>')
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
    // Strip YAML frontmatter block --- ... ---
    if (body.startsWith("---")) {
      const endFm = body.indexOf("\n---", 3);
      if (endFm !== -1) {
        body = body.slice(endFm + 4);
      }
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
        html += `<h2>${formatInlineMd(calmTitle(line.slice(2)))}</h2>`;
      } else if (line.startsWith("## ") || line.startsWith("### ")) {
        if (inList) { html += "</ul>"; inList = false; }
        html += `<h3>${formatInlineMd(line.replace(/^#+\s*/, ""))}</h3>`;
      } else if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${formatInlineMd(line.replace(/^([-*]|\d+\.)\s*/, ""))}</li>`;
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        html += `<p style="margin:6px 0;">${formatInlineMd(line)}</p>`;
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
    el.innerHTML = `<span>${esc(message)}</span>`;
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
      setTimeout(() => el.remove(), 200);
    }, undoPayload ? 6000 : 3200);
  }

  async function withLock(btnEl, asyncFn) {
    if (btnEl && btnEl.disabled) return;
    if (btnEl) btnEl.disabled = true;
    try {
      await asyncFn();
    } catch (err) {
      toast(err.message || "Đã xảy ra lỗi khi xử lý.");
    } finally {
      if (btnEl) btnEl.disabled = false;
    }
  }

  // -------------------------------------------------------------------------
  // 2. WEBCRYPTO AES-256-GCM VAULT FOR GITHUB 2-WAY CLOUD SYNC
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
      if (!raw) throw new Error("Chưa lưu khóa GitHub trên thiết bị này. Hãy nhập Token và bấm 'Mã hóa & Lưu két' trước.");
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
        throw new Error("Mã PIN mở két không đúng.");
      }
    }
  };

  // -------------------------------------------------------------------------
  // 3. STRICT API LAYER (Separates HTTP 4xx/5xx from Network Static Fallback!)
  // -------------------------------------------------------------------------
  function getLocalFallbackStore() {
    try {
      const raw = localStorage.getItem("titan_v5_cloud_local_store");
      return raw ? JSON.parse(raw) : null;
    } catch (_e) {
      return null;
    }
  }

  function saveLocalFallbackStore() {
    if (!state.staticMode) return;
    try {
      localStorage.setItem("titan_v5_cloud_local_store", JSON.stringify({
        missions: state.missions,
        opportunities: state.opportunities,
        tasks: state.tasks,
        projects: state.projects,
        articles: state.articles
      }));
    } catch (_e) {}
  }

  let API_BASE = "";

  async function detectLocalBridgeHost() {
    if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
      API_BASE = "";
      return true;
    }
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 1400);
      const r = await fetch("http://127.0.0.1:8765/api/health", { signal: ctrl.signal, cache: "no-store" });
      clearTimeout(timer);
      if (r.ok) {
        const j = await r.json();
        if (j && j.status === "ok") {
          API_BASE = "http://127.0.0.1:8765";
          state.staticMode = false;
          try { localStorage.removeItem("titan_v5_cloud_local_store"); } catch (_e) {}
          return true;
        }
      }
    } catch (_e) {}
    return false;
  }

  async function api(path, method = "GET", body = null) {
    if (state.staticMode && path.startsWith("/api/")) {
      return handleStaticFallback(path, method, body);
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
      // Pure network failure (e.g. serverless GitHub Pages on Phone without PC localhost)
      if (path.startsWith("/api/")) {
        return activateAndHandleStaticFallback(path, method, body, networkErr);
      }
      throw networkErr;
    }

    const ct = res.headers.get("content-type") || "";
    // On GitHub Pages, /api/* returns an HTML 404 page instead of JSON API!
    if (res.status === 404 && !ct.includes("application/json") && path.startsWith("/api/")) {
      return activateAndHandleStaticFallback(path, method, body, new Error("Static host"));
    }

    if (!res.ok) {
      let msg = `Lỗi HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j.error || msg;
      } catch (_e) {}
      throw new Error(msg);
    }
    return await res.json();
  }

  async function activateAndHandleStaticFallback(path, method, body, origErr) {
    if (!state.staticMode) {
      for (const snapUrl of ["./cloud_state/snapshot.json", "../corporate_hq/cloud_state/snapshot.json"]) {
        try {
          const sr = await fetch(snapUrl, { cache: "no-cache" });
          if (sr.ok) {
            const snap = await sr.json();
            state.staticMode = true;
            state.bridge = snap.bridge || { online: false, mode: "ANTIGRAVITY_SWARM", active_workers: [], pending_orders_count: 0 };
            state.orders = snap.orders || [];
            state.swarmMessages = snap.swarm_messages || [];
            // Always prefer fresh cloud snapshot from Antigravity Swarm over stale localStorage!
            state.divisions = snap.divisions || [];
            state.departments = snap.departments || [];
            state.missions = snap.missions || [];
            state.opportunities = snap.opportunities || [];
            state.tasks = snap.tasks || [];
            state.projects = snap.projects || [];
            state.articles = snap.knowledge_atoms || [];
            break;
          }
        } catch (_e) {}
      }
    }
    if (!state.staticMode) throw origErr;
    return handleStaticFallback(path, method, body);
  }

  function handleStaticFallback(path, method, body) {
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
        const divLabel = DIV_SHORT_NAMES[d.division_code] || d.division_code;
        return {
          ...d,
          handbook_markdown: d.handbook_markdown || `# ${d.title_vi}\n- Đơn vị: **${divLabel}**`,
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
          schema_version: "6.0",
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

    // Static / Mobile Mode (GitHub Pages): Queue real Antigravity orders (NEVER fake simulated steps!)
    if (method === "POST" && path === "/api/missions") {
      const msn = buildClientMission(body.title || body.goal_prompt, body.auto_approve);
      state.missions.unshift(msn);
      const ord = {
        order_id: `ord-${Date.now().toString(36)}`,
        order_type: "NEW_MISSION",
        mission_id: msn.mission_id,
        title: msn.title,
        instructions: msn.goal_prompt,
        source_device: "mobile-github-pages",
        status: "PENDING",
        created_at: new Date().toISOString()
      };
      state.orders.unshift(ord);
      saveLocalFallbackStore();
      pushRemoteOrderToGitHub(ord).catch(() => {});
      return { ...msn, order_id: ord.order_id, bridge_online: false };
    }
    if (method === "PATCH" && path.startsWith("/api/missions/")) {
      const mid = path.split("/")[3];
      const m = state.missions.find((x) => x.mission_id === mid);
      if (m) {
        Object.assign(m, body);
        if (body.status === "RUNNING") m.dispatch_state = "QUEUED_FOR_ANTIGRAVITY";
      }
      saveLocalFallbackStore();
      return m || {};
    }
    if (method === "POST" && path === "/api/missions/bulk") {
      if (body.action === "clear_completed") {
        const before = state.missions.length;
        state.missions = state.missions.filter((m) => m.status !== "COMPLETED");
        saveLocalFallbackStore();
        return { affected: before - state.missions.length, deleted_ids: [] };
      }
    }
    if (method === "POST" && path === "/api/opportunities") {
      const no = { opp_id: `opp-${Date.now()}`, status: "NEW", breakeven_users: 5, survival_score: 86, ...body };
      state.opportunities.unshift(no);
      saveLocalFallbackStore();
      return no;
    }
    if (method === "PATCH" && path.startsWith("/api/opportunities/")) {
      const oid = path.split("/")[3];
      const o = state.opportunities.find((x) => x.opp_id === oid);
      if (o) Object.assign(o, body);
      saveLocalFallbackStore();
      return o || {};
    }
    if (method === "POST" && path === "/api/opportunities/scan") {
      const ord = {
        order_id: `ord-${Date.now().toString(36)}`,
        order_type: "SCAN_OPPORTUNITIES",
        title: "Săn cơ hội đẻ ra tiền mới (Phòng #50 + #46 + #38)",
        instructions: "Săn 2–3 cơ hội sản phẩm/dịch vụ dễ thu tiền mới nhất cho Chủ tịch.",
        source_device: "mobile-github-pages",
        status: "PENDING",
        created_at: new Date().toISOString()
      };
      state.orders.unshift(ord);
      saveLocalFallbackStore();
      pushRemoteOrderToGitHub(ord).catch(() => {});
      return { queued: true, order: ord, opportunities: state.opportunities, message: "Đã đưa lệnh săn cơ hội thật vào hàng đợi Antigravity!" };
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
          source_device: "mobile-github-pages",
          status: "PENDING",
          created_at: new Date().toISOString()
        };
        state.orders.unshift(ord);
        saveLocalFallbackStore();
        pushRemoteOrderToGitHub(ord).catch(() => {});
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
        source_device: "mobile-github-pages",
        status: "PENDING",
        created_at: new Date().toISOString()
      };
      state.orders.unshift(ord);
      saveLocalFallbackStore();
      pushRemoteOrderToGitHub(ord).catch(() => {});
      return { queued: true, order: ord };
    }
    if (method === "POST" && path === "/api/tasks") {
      const nt = { task_id: `task-${Date.now()}`, kanban_column: body.kanban_column || "BACKLOG", priority: body.priority || "HIGH", ...body };
      state.tasks.unshift(nt);
      saveLocalFallbackStore();
      return nt;
    }
    if (method === "POST" && path.endsWith("/duplicate")) {
      const tid = path.split("/")[3];
      const orig = state.tasks.find((x) => x.task_id === tid);
      if (orig) {
        const copy = { ...orig, task_id: `task-${Date.now()}`, title: `${orig.title} (Bản sao)` };
        state.tasks.unshift(copy);
        saveLocalFallbackStore();
        return copy;
      }
    }
    if (method === "PATCH" && path.startsWith("/api/tasks/")) {
      const tid = path.split("/")[3];
      const t = state.tasks.find((x) => x.task_id === tid);
      if (t) Object.assign(t, body);
      saveLocalFallbackStore();
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
        state.tasks.forEach((t) => { if (ids.has(t.task_id)) { t.kanban_column = body.column; affected += 1; } });
      }
      saveLocalFallbackStore();
      return { affected, deleted_ids: [] };
    }
    if (method === "POST" && path === "/api/projects") {
      const np = { project_id: `proj-${slugifyVi(body.slug || body.title)}`, status: body.status || "ACTIVE", ...body };
      state.projects.unshift(np);
      saveLocalFallbackStore();
      return np;
    }
    if (method === "PATCH" && path.startsWith("/api/projects/")) {
      const pid = path.split("/")[3];
      const p = state.projects.find((x) => x.project_id === pid);
      if (p) Object.assign(p, body);
      saveLocalFallbackStore();
      return p || {};
    }
    if (method === "PATCH" && path.startsWith("/api/knowledge/")) {
      const aid = Number(path.split("/")[3]);
      const a = state.articles.find((x) => Number(x.atom_id) === aid);
      if (a) a.is_starred = a.is_starred ? 0 : 1;
      saveLocalFallbackStore();
      return a || {};
    }
    if (method === "DELETE") {
      const parts = path.split("/");
      if (parts[2] === "tasks") state.tasks = state.tasks.filter((x) => x.task_id !== parts[3]);
      if (parts[2] === "missions") state.missions = state.missions.filter((x) => x.mission_id !== parts[3]);
      if (parts[2] === "opportunities") state.opportunities = state.opportunities.filter((x) => x.opp_id !== parts[3]);
      if (parts[2] === "projects") state.projects = state.projects.filter((x) => x.project_id !== parts[3]);
      if (parts[2] === "knowledge") state.articles = state.articles.filter((x) => Number(x.atom_id) !== Number(parts[3]));
      saveLocalFallbackStore();
      return { deleted: true };
    }
    if (method === "POST" && path.endsWith("/decision")) {
      const parts = path.split("/");
      if (parts[2] === "missions") {
        const m = state.missions.find((x) => x.mission_id === parts[3]);
        if (m) {
          const isProposalGate = (m.phase === "PROPOSAL" && (m.total_steps || 8) >= 8);
          if (body.decision === "APPROVE" && isProposalGate) {
            m.phase = "PRODUCTION";
            m.status = "RUNNING";
            m.dispatch_state = "QUEUED_FOR_ANTIGRAVITY";
            m.current_step_order = 5;
            m.progress_pct = 50;
            m.steps.forEach((s) => {
              if (s.step_order <= 4) s.status = "DONE";
              if (s.step_order === 5) s.live_activity_text = "Đã duyệt chốt kèo! Chờ Antigravity Swarm sản xuất sản phẩm thật...";
            });
            pushRemoteOrderToGitHub({
              order_id: `ord-${Date.now().toString(36)}`,
              order_type: "BUILD_PRODUCT",
              mission_id: m.mission_id,
              title: `[Sản xuất SP cuối] ${m.title}`,
              instructions: body.note || m.goal_prompt || m.title,
              source_device: "mobile-github-pages",
              status: "PENDING",
              created_at: new Date().toISOString()
            }).catch(() => {});
          } else if (body.decision === "APPROVE") {
            m.phase = "DELIVERED";
            m.status = "COMPLETED";
            m.dispatch_state = "COMPLETED";
            m.progress_pct = 100;
            m.steps.forEach((s) => { s.status = "DONE"; });
            pushRemoteOrderToGitHub({
              order_id: `ord-${Date.now().toString(36)}`,
              order_type: "MISSION_APPROVED",
              mission_id: m.mission_id,
              title: m.title,
              instructions: body.note || "Chủ tịch nghiệm thu sản phẩm cuối từ điện thoại",
              source_device: "mobile-github-pages",
              status: "PENDING",
              created_at: new Date().toISOString()
            }).catch(() => {});
          } else {
            const resetFrom = isProposalGate ? 2 : 5;
            m.status = "RUNNING";
            m.dispatch_state = "QUEUED_FOR_ANTIGRAVITY";
            m.progress_pct = isProposalGate ? 15 : 50;
            m.steps.forEach((s) => { if (s.step_order >= resetFrom) { s.status = "PENDING"; s.live_activity_text = `Đã gửi yêu cầu làm lại sang Antigravity: ${body.note || ""}`; } });
            pushRemoteOrderToGitHub({
              order_id: `ord-${Date.now().toString(36)}`,
              order_type: "MISSION_REWORK",
              mission_id: m.mission_id,
              title: `[Làm lại] ${m.title}`,
              instructions: body.note || "Chủ tịch yêu cầu làm lại kỹ hơn",
              source_device: "mobile-github-pages",
              status: "PENDING",
              created_at: new Date().toISOString()
            }).catch(() => {});
          }
        }
        saveLocalFallbackStore();
        return m || {};
      }
      if (parts[2] === "tasks") {
        const t = state.tasks.find((x) => x.task_id === parts[3]);
        if (t) t.kanban_column = body.decision === "APPROVE" ? "DONE" : "IN_PROGRESS";
        saveLocalFallbackStore();
        return t || {};
      }
    }
    return {};
  }

  function buildClientMission(title, autoApprove) {
    const mid = `msn-${Date.now().toString(36)}`;
    const tpl = [
      [1, "[GĐ 1] Săn nhu cầu thật, đối thủ & tâm lý khách trả tiền", "01,02,03,50"],
      [2, "[GĐ 1] Tính vốn, giá bán, thuế & khóa biên lãi gộp >= 65%", "38,39"],
      [3, "[GĐ 1] Hội đồng phản biện Pre-Mortem & chốt kiến trúc sản phẩm", "46,47,06,12"],
      [4, "[GĐ 1] Trình Chủ tịch DUYỆT CHỐT KÈO để bắt đầu sản xuất", "00"],
      [5, "[GĐ 2] Lập trình & Xây dựng Sản phẩm Cuối hoàn chỉnh (Code / Web / App)", "13,14,15,16,17,19"],
      [6, "[GĐ 2] Đóng gói Landing Page, Bảng giá, Video & Kịch bản kiếm 50 khách đầu", "25,26,29,32,33,40"],
      [7, "[GĐ 2] Tester đóng vai 5 nhóm khách hàng dùng thử thật & Phản biện chốt lỗi", "48,49,20,23,47"],
      [8, "[GĐ 2] Bàn giao Sản phẩm Cuối hoàn chỉnh & Kịch bản thu tiền cho Chủ tịch", "00,19,35"]
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
        live_activity_text: ord === 1 ? "Đã xếp hàng chờ cầu nối Antigravity Swarm trên máy tính nhận việc thật..." : "",
        output_summary: "",
        critique_verdict: "",
        ux_verdict: ""
      }))
    };
  }

  // Push remote order from Mobile (GitHub Pages) -> corporate_hq/cloud_state/remote_inbox.json
  let sessionUnlockedGitHub = null;
  async function pushRemoteOrderToGitHub(orderObj) {
    if (!sessionUnlockedGitHub) return false;
    const { repo, token } = sessionUnlockedGitHub;
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
      message: `chore(mobile-order): ${orderObj.title.slice(0, 60)}`,
      content: cryptoVault.utf8ToB64(JSON.stringify(inbox, null, 2))
    };
    if (sha) putBody.sha = sha;
    const pr = await fetch(apiUrl, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(putBody)
    });
    if (pr.ok) {
      toast("Đã bắn thẳng đơn từ Điện thoại lên GitHub → Antigravity máy tính sẽ bắt lệnh sau ~15 giây!");
      return true;
    }
    return false;
  }

  function buildAntigravityHandoffCommand(mission) {
    return `/teamwork Thực thi thật nhiệm vụ "${mission.title}" (Mã: ${mission.mission_id}) theo đúng 7 bước Titan AI Corp, phản biện #46-#47 & test người dùng #48-#49, cập nhật tiến độ về Web qua scripts/titan_bridge_cli.py.`;
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
      saveLocalFallbackStore();
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
  // 4. DEDUPLICATED NEWS HELPER & COUNTERS
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

    document.getElementById("stat-running-missions").textContent = runningM;
    document.getElementById("stat-waiting-approvals").textContent = totalWait;
    document.getElementById("stat-staff-ready").textContent = staffTotal;
    document.getElementById("stat-news-count").textContent = uniqueNewsCount;

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
      document.getElementById("view-heading").textContent = `Nhân sự AI (${staffTotal})`;
    }

    const dot = document.getElementById("live-dot");
    const lbl = document.getElementById("live-label");
    const b = state.bridge || {};
    const pendingOrd = Number(b.pending_orders_count || 0);
    if (state.staticMode) {
      if (sessionUnlockedGitHub) {
        dot.className = "pulse-dot pulse-cloud";
        lbl.textContent = "Đám mây 2 chiều → Antigravity";
      } else {
        dot.className = "pulse-dot pulse-warn";
        lbl.textContent = "Đám mây 24/7 · Chưa nối PAT";
      }
    } else if (b.online) {
      dot.className = "pulse-dot pulse-active";
      const workers = Array.isArray(b.active_workers) ? b.active_workers : [];
      lbl.textContent = workers.length
        ? `Antigravity Swarm (${workers.length} AI đang chạy)`
        : "Antigravity: Đang trực chiến";
    } else {
      dot.className = "pulse-dot pulse-warn";
      lbl.textContent = pendingOrd > 0
        ? `Chờ bật Antigravity (${pendingOrd} lệnh chờ)`
        : "Antigravity: Chờ bật trực chiến";
    }
  }

  // -------------------------------------------------------------------------
  // 5. RENDERERS FOR ALL 6 TABS
  // -------------------------------------------------------------------------
  function renderCommandTab() {
    const waitMissions = state.missions.filter((m) => m.status === "WAITING_CHAIRMAN");
    const waitTasks = state.tasks.filter((t) => t.kanban_column === "WAITING_APPROVAL");
    const wrap = document.getElementById("pending-approvals-section");
    const list = document.getElementById("pending-approvals-list");

    if (!waitMissions.length && !waitTasks.length) {
      wrap.style.display = "none";
    } else {
      wrap.style.display = "block";
      let html = "";
      waitMissions.forEach((m) => {
        const isProposalGate = (m.phase === "PROPOSAL" && (m.total_steps || 8) >= 8);
        const gateSubtitle = isProposalGate
          ? "Cổng 1 · Chờ duyệt chốt kèo để toàn công ty bắt đầu sản xuất sản phẩm thật (Bước 5 → 8)"
          : "Cổng 2 · Sản phẩm cuối đã làm xong & test người dùng thật — Chờ nghiệm thu bàn giao";
        const approveLabel = isProposalGate ? "✓ Duyệt kèo → Sản xuất SP" : "✓ Nghiệm thu Hoàn tất";
        html += `
          <div class="list-row" style="grid-template-columns:minmax(0,1fr) auto;">
            <div style="min-width:0;">
              <div style="font-weight:700;color:var(--text-primary);">${esc(m.title)}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${gateSubtitle}</div>
              ${m.final_summary ? `<div class="step-summary" style="font-size:12px;margin-top:4px;">${esc(m.final_summary.split("\n")[0])}</div>` : ""}
            </div>
            <div class="row-actions">
              <button type="button" class="btn btn-xs" data-goto-missions>Xem chi tiết</button>
              <button type="button" class="btn btn-xs btn-ok" data-approve-msn="${esc(m.mission_id)}">${approveLabel}</button>
              <button type="button" class="btn btn-xs" data-reject-msn="${esc(m.mission_id)}">↺ Sửa lại</button>
              <button type="button" class="btn btn-xs btn-danger-ghost" data-del-msn="${esc(m.mission_id)}">Xóa</button>
            </div>
          </div>
        `;
      });
      waitTasks.forEach((t) => {
        html += `
          <div class="list-row" style="grid-template-columns:minmax(0,1fr) auto;">
            <div style="min-width:0;">
              <div style="font-weight:600;color:var(--text-primary);">${esc(t.title)}</div>
              <div style="font-size:12px;color:var(--text-muted);">Việc lẻ · #${esc(t.assigned_dept_id)} ${esc(deptTitle(t.assigned_dept_id))} trình duyệt</div>
            </div>
            <div class="row-actions">
              <button type="button" class="btn btn-xs btn-ok" data-approve-task="${esc(t.task_id)}">✓ Chấp nhận</button>
              <button type="button" class="btn btn-xs" data-reject-task="${esc(t.task_id)}">↺ Làm lại</button>
              <button type="button" class="btn btn-xs btn-danger-ghost" data-del-task="${esc(t.task_id)}">Xóa</button>
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
      oppGrid.innerHTML = `<div class="panel-box"><p style="color:var(--text-muted);">Chưa có đề xuất nào. Nhấn <strong>Tìm thêm cơ hội mới</strong> để Phòng #50 săn kèo kiếm tiền cho bạn.</p></div>`;
      return;
    }

    oppGrid.innerHTML = visibleOpps.map((o) => {
      const isAccepted = o.status === "ACCEPTED";
      const descText = o.pain_point || o.critique_note || "";
      return `
        <article class="opp-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <h3 class="opp-title">${esc(o.title)}</h3>
            ${isAccepted ? `<span class="badge badge-done">Đã triển khai</span>` : `<span class="badge badge-run">Sẵn sàng</span>`}
          </div>
          <div class="opp-customer">Khách trả tiền: <strong>${esc(o.target_customer)}</strong></div>

          <div class="opp-metrics mono">
            <span>Lãi gộp: <strong style="color:var(--ok-text);">${Number(o.est_margin_pct || 75).toFixed(0)}%</strong></span>
            <span>Hòa vốn: <strong>${o.breakeven_users || 5} khách</strong></span>
            <span>Phản biện: <strong>${o.survival_score || 86}/100</strong></span>
          </div>

          <div class="opp-critique">${esc(descText)}</div>

          <div class="opp-actions">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${isAccepted
                ? `<button type="button" class="btn btn-xs" data-goto-missions>Xem tiến độ →</button>`
                : `<button type="button" class="btn btn-xs btn-primary" data-accept-opp="${esc(o.opp_id)}">✓ Gửi Antigravity làm</button>`
              }
              <button type="button" class="btn btn-xs" data-edit-opp="${esc(o.opp_id)}">Sửa</button>
            </div>
            <button type="button" class="btn btn-xs btn-danger-ghost" data-del-opp="${esc(o.opp_id)}">Xóa</button>
          </div>
        </article>
      `;
    }).join("");

    bindQuickActions(oppGrid);
  }

  const WORKER_VI_MAP = {
    "@researcher": "Trinh sát Thị trường & Đối thủ",
    "@trinh-sat-thi-truong": "Trinh sát Thị trường & Đối thủ",
    "@cfo": "Giám đốc Tài chính & Thuế",
    "@tai-chinh-thue": "Giám đốc Tài chính & Thuế",
    "@critic": "Hội đồng Phản biện Độc lập",
    "@phan-bien-doc-lap": "Hội đồng Phản biện & Bảo mật",
    "@ky-su-san-pham": "Kỹ sư Sản phẩm (Code Web/App)",
    "@doi-ban-hang": "Đội Đóng gói & Bán hàng",
    "@tester-khach-hang": "Tester Đóng vai Khách hàng Thật",
    "@coordinator": "Tổng Điều Phối (CEO)",
    "@dieu-phoi": "Tổng Điều Phối (CEO)"
  };

  function viWorkerLabel(slug) {
    if (!slug) return "";
    const k = String(slug).trim().toLowerCase();
    const key = k.startsWith("@") ? k : `@${k}`;
    return WORKER_VI_MAP[key] || slug;
  }

  function artifactHref(relPath) {
    const clean = String(relPath || "").replace(/^\/+/, "");
    if (clean.startsWith("corporate_hq/projects/")) {
      const sub = clean.slice("corporate_hq/projects/".length);
      return state.staticMode ? `./projects/${sub}` : `${API_BASE}/projects/${sub}`;
    }
    return "";
  }

  const MSG_TYPE_VI = {
    HANDOFF: { label: "Chuyền việc", cls: "badge-run" },
    UPDATE: { label: "Đang xử lý", cls: "badge-idle" },
    CRITIQUE: { label: "Phản biện", cls: "badge-wait" },
    QA_REPORT: { label: "Kiểm thử khách", cls: "badge-wait" },
    DONE: { label: "Hoàn tất", cls: "badge-done" },
    APPROVAL: { label: "Duyệt cổng", cls: "badge-done" }
  };

  function renderSwarmGraphSvg(m) {
    const stepsByOrd = {};
    (m.steps || []).forEach((s) => { stepsByOrd[s.step_order] = s; });
    const colorOf = (ord) => {
      const s = stepsByOrd[ord];
      if (!s) return { fill: "#F1F5F9", stroke: "#CBD5E1", text: "#475569", dot: "#94A3B8", state: "Chờ" };
      if (s.status === "DONE") return { fill: "#ECFDF5", stroke: "#059669", text: "#065F46", dot: "#059669", state: "✓ Xong" };
      if (s.status === "RUNNING") return { fill: "#EFF6FF", stroke: "#2563EB", text: "#1E40AF", dot: "#2563EB", state: "● Đang làm" };
      if (s.status === "WAITING_APPROVAL") return { fill: "#FFFBEB", stroke: "#D97706", text: "#92400E", dot: "#D97706", state: "⚑ Chờ duyệt" };
      return { fill: "#F8FAFC", stroke: "#CBD5E1", text: "#475569", dot: "#94A3B8", state: "○ Chưa tới" };
    };
    const box = (x, y, w, h, ord, line1, line2) => {
      const c = colorOf(ord);
      return `
        <g>
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.6"/>
          <circle cx="${x + 14}" cy="${y + 18}" r="4.5" fill="${c.dot}"/>
          <text x="${x + 24}" y="${y + 22}" font-size="11.5" font-weight="700" fill="${c.text}">${esc(line1)}</text>
          <text x="${x + 12}" y="${y + 40}" font-size="10.5" fill="#475569">${esc(line2)}</text>
          <text x="${x + 12}" y="${y + 56}" font-size="10" font-weight="600" fill="${c.text}">${c.state}</text>
        </g>
      `;
    };
    return `
      <div class="swarm-graph-wrap">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
          Sơ đồ phối hợp trực tiếp giữa các AI chuyên trách — từ <strong>Giai đoạn 1 (Săn kèo &amp; Phản biện)</strong> sang <strong>Giai đoạn 2 (Sản xuất Sản phẩm Cuối &amp; Kiểm thử thật)</strong>:
        </div>
        <svg class="swarm-graph-svg" viewBox="0 0 920 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94A3B8"/>
            </marker>
          </defs>
          <!-- Phase 1 & Phase 2 background regions -->
          <rect x="6" y="6" width="444" height="208" rx="12" fill="none" stroke="#CBD5E1" stroke-dasharray="4 4"/>
          <text x="18" y="24" font-size="11" font-weight="700" fill="#64748B">GIAI ĐOẠN 1 · NGHIÊN CỨU, TÍNH LÃI &amp; CHỐT KÈO</text>
          <rect x="466" y="6" width="448" height="208" rx="12" fill="none" stroke="#0F766E" stroke-dasharray="4 4"/>
          <text x="478" y="24" font-size="11" font-weight="700" fill="#0F766E">GIAI ĐOẠN 2 · SẢN XUẤT SẢN PHẨM CUỐI &amp; BÀN GIAO</text>

          <!-- Phase 1 Nodes -->
          ${box(18, 38, 152, 68, 1, "B1 · Trinh sát Thị trường", "#01, #02, #03, #50")}
          ${box(18, 126, 152, 68, 2, "B2 · Tài chính & Thuế", "#38, #39 (CFO)")}
          ${box(196, 82, 122, 68, 3, "B3 · Phản biện", "#46, #47, #06, #12")}
          ${box(340, 82, 100, 68, 4, "CỔNG 1", "Chủ tịch duyệt")}

          <!-- Phase 2 Nodes -->
          ${box(478, 38, 152, 68, 5, "B5 · Kỹ sư Sản phẩm", "Code App thật (#13-#19)")}
          ${box(478, 126, 152, 68, 6, "B6 · Đội Bán hàng", "Landing & 50 khách đầu")}
          ${box(656, 82, 134, 68, 7, "B7 · Tester & Bảo mật", "#48, #49, #20, #23")}
          ${box(812, 82, 92, 68, 8, "CỔNG 2", "Bàn giao SP")}

          <!-- Arrows -->
          <path d="M 170 72 L 194 106" stroke="#94A3B8" stroke-width="1.6" fill="none" marker-end="url(#arr)"/>
          <path d="M 170 160 L 194 126" stroke="#94A3B8" stroke-width="1.6" fill="none" marker-end="url(#arr)"/>
          <path d="M 318 116 L 338 116" stroke="#94A3B8" stroke-width="1.6" fill="none" marker-end="url(#arr)"/>
          <path d="M 440 116 L 476 72" stroke="#0F766E" stroke-width="1.8" fill="none" marker-end="url(#arr)"/>
          <path d="M 440 116 L 476 160" stroke="#0F766E" stroke-width="1.8" fill="none" marker-end="url(#arr)"/>
          <path d="M 630 72 L 654 106" stroke="#94A3B8" stroke-width="1.6" fill="none" marker-end="url(#arr)"/>
          <path d="M 630 160 L 654 126" stroke="#94A3B8" stroke-width="1.6" fill="none" marker-end="url(#arr)"/>
          <path d="M 790 116 L 810 116" stroke="#0F766E" stroke-width="1.8" fill="none" marker-end="url(#arr)"/>
        </svg>
      </div>
    `;
  }

  function renderSwarmBoardPanel(m, msgs) {
    if (!msgs.length) {
      return `<div style="padding:20px;color:var(--text-muted);font-size:13px;">Chưa có trao đổi nào trong phòng họp cho nhiệm vụ này. Khi đội ngũ AI Antigravity chạy, toàn bộ quá trình báo cáo và phản biện chéo bằng tiếng Việt sẽ hiện trực tiếp tại đây.</div>`;
    }
    return `
      <div class="swarm-feed">
        ${msgs.map((msg) => {
          const mt = MSG_TYPE_VI[msg.msg_type] || MSG_TYPE_VI.UPDATE;
          const artBtn = msg.artifact_path ? renderArtifactChip(msg.artifact_path) : "";
          return `
            <div class="swarm-msg-card type-${esc(msg.msg_type)}">
              <div class="swarm-msg-head">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <strong style="color:var(--text-primary);font-size:13px;">${esc(msg.sender_name_vi || viWorkerLabel(msg.sender_slug))}</strong>
                  <span style="font-size:11.5px;color:var(--text-muted);">→ ${esc(msg.recipient_name_vi || "Toàn đội")}</span>
                  <span class="badge ${mt.cls}">${mt.label}</span>
                </div>
                <span class="mono" style="font-size:11px;color:var(--text-muted);">${esc(shortTime(msg.created_at))}</span>
              </div>
              <div class="swarm-msg-body">${esc(msg.content_vi)}</div>
              ${artBtn}
            </div>
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
          rec.lastNote = s.live_activity_text || `Đang thực thi Bước ${s.step_order}`;
        } else if (s.status === "DONE" && rec.status !== "RUNNING") {
          rec.status = "DONE";
          rec.lastNote = (s.output_summary || `Đã hoàn tất Bước ${s.step_order}`).slice(0, 140);
        }
      }
    });
    msgs.forEach((msg) => {
      const rec = ensure(msg.sender_slug, msg.sender_dept_ids);
      if (rec) rec.lastNote = msg.content_vi.slice(0, 140);
    });
    const members = Array.from(memberMap.values()).sort((a, b) => a.stepOrder - b.stepOrder);
    if (!members.length) {
      return `<div style="padding:20px;color:var(--text-muted);font-size:13px;">Chưa có thành viên AI nào được kích hoạt cho nhiệm vụ này.</div>`;
    }
    return `
      <div class="swarm-member-grid">
        ${members.map((mb) => {
          const stCls = mb.status === "RUNNING" ? "badge-run" : mb.status === "DONE" ? "badge-done" : "badge-idle";
          const stTxt = mb.status === "RUNNING" ? "● Đang làm thật" : mb.status === "DONE" ? "✓ Đã hoàn tất" : "○ Đang trực chờ";
          return `
            <div class="swarm-member-card">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                <strong style="color:var(--text-primary);font-size:13.5px;">${esc(mb.name_vi)}</strong>
                <span class="badge ${stCls}">${stTxt}</span>
              </div>
              ${mb.depts ? `<div class="mono" style="font-size:11px;color:var(--text-muted);">Phòng chuyên trách: #${esc(mb.depts.split(",").join(", #"))}</div>` : ""}
              <div style="font-size:12.5px;color:var(--text-secondary);line-height:1.45;">${esc(mb.lastNote)}</div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderArtifactChip(relPath) {
    const clean = String(relPath || "").trim();
    if (!clean) return "";
    const lower = clean.toLowerCase();
    const liveUrl = artifactHref(clean);
    if (lower.endsWith(".html") || lower.endsWith("/app/") || lower.endsWith("/landing/")) {
      return `<a class="artifact-tag" href="${esc(liveUrl)}" target="_blank" rel="noopener">Mở dùng thử trực tiếp: ${esc(clean.split("/").slice(-2).join("/"))} ↗</a>`;
    }
    return `<button type="button" class="artifact-tag" data-read-artifact="${esc(clean)}">Đọc báo cáo: ${esc(clean.split("/").pop())}</button>`;
  }

  async function openArtifactDrawer(relPath) {
    document.getElementById("drawer-heading").textContent = relPath.split("/").pop() || "Báo cáo chuyên môn";
    document.getElementById("drawer-body").innerHTML = `<div style="color:var(--text-muted);">Đang tải nội dung báo cáo...</div>`;
    document.getElementById("drawer-backdrop").classList.add("open");
    document.getElementById("inspector-drawer").classList.add("open");
    try {
      let content = "";
      if (state.staticMode) {
        const liveUrl = artifactHref(relPath);
        const r = await fetch(liveUrl, { cache: "no-cache" });
        if (!r.ok) throw new Error("Báo cáo đang đồng bộ lên đám mây — mở lại sau vài giây.");
        content = await r.text();
      } else {
        const res = await api(`/api/workspace/file?path=${encodeURIComponent(relPath)}`);
        content = res.content || "";
      }
      document.getElementById("drawer-body").innerHTML = `
        <div class="mono" style="font-size:11.5px;color:var(--text-muted);margin-bottom:10px;">Đường dẫn: ${esc(relPath)}</div>
        <div class="rendered-md">${renderCleanMarkdown(content)}</div>
      `;
    } catch (err) {
      document.getElementById("drawer-body").innerHTML = `<div style="color:var(--danger);">${esc(err.message)}</div>`;
    }
  }

  function renderMissionsTab() {
    const box = document.getElementById("missions-container");
    const list = state.missions.filter((m) => !state.missionFilter || m.status === state.missionFilter);

    if (!list.length) {
      box.innerHTML = `
        <div class="panel-box" style="text-align:center;padding:36px 20px;">
          <h3 style="margin-bottom:6px;">Chưa có nhiệm vụ nào ở mục này</h3>
          <p style="color:var(--text-muted);margin-bottom:14px;">Giao một đề bài mới để xem toàn bộ 7 bước nhân viên tự động thực hiện, phản biện và kiểm thử trực tiếp tại đây.</p>
          <button type="button" class="btn btn-primary" id="btn-empty-start-msn">+ Giao nhiệm vụ tự động ngay</button>
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

      const isProposalGate = (m.phase === "PROPOSAL" && (m.total_steps || 8) >= 8);
      const isProductionPhase = (m.phase === "PRODUCTION");
      const phaseBadge = isProductionPhase
        ? `<span class="badge badge-run">Giai đoạn 2 · Sản xuất Sản phẩm Cuối</span>`
        : m.phase === "DELIVERED"
        ? `<span class="badge badge-done">Đã bàn giao Sản phẩm Cuối</span>`
        : `<span class="badge badge-idle">Giai đoạn 1 · Nghiên cứu &amp; Chốt kèo</span>`;

      const stBadge =
        m.status === "COMPLETED" ? `<span class="badge badge-done">✓ Đã nghiệm thu 100%</span>` :
        (m.status === "WAITING_CHAIRMAN" && isProposalGate) ? `<span class="badge badge-wait">⚑ Chờ duyệt kèo → Sản xuất SP</span>` :
        m.status === "WAITING_CHAIRMAN" ? `<span class="badge badge-wait">⚑ Chờ nghiệm thu Sản phẩm Cuối</span>` :
        m.status === "PAUSED" ? `<span class="badge badge-idle">⏸ Đang tạm dừng</span>` :
        isSwarm ? `<span class="badge badge-run">⚡ Antigravity Swarm · Bước ${m.current_step_order || 1}/${m.total_steps || 8}</span>` :
        isQueued ? `<span class="badge badge-wait">⏳ Đã gửi sang Antigravity</span>` :
        `<span class="badge badge-run">● Bước ${m.current_step_order || 1}/${m.total_steps || 8}</span>`;

      const workerChipsHtml = swarmWorkers.length
        ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">${swarmWorkers.map((w) => `<span class="worker-tag">${esc(viWorkerLabel(w))}</span>`).join("")}</div>`
        : "";

      const msnMsgs = state.swarmMessages.filter((x) => x.mission_id === m.mission_id);
      const activeSubTab = state.missionViewTabs[m.mission_id] || "steps";

      const stepsHtml = (m.steps || []).map((s) => {
        const isDone = s.status === "DONE";
        const isRun = s.status === "RUNNING";
        const isWait = s.status === "WAITING_APPROVAL";
        const nodeCls = isDone ? "done" : isRun ? "running" : isWait ? "waiting" : "pending";
        const nodeSym = isDone ? "✓" : isRun ? "●" : isWait ? "⚑" : s.step_order;

        const whoStateLabel = isDone
          ? `<strong style="color:var(--ok-text);">Đã làm xong:</strong>`
          : isRun
          ? `<strong style="color:var(--run-text);">Đang làm thật ngay lúc này:</strong>`
          : isWait
          ? `<strong style="color:var(--warn-text);">Chờ bạn duyệt:</strong>`
          : `<span>Chờ tới lượt:</span>`;

        const deptChips = (s.lead_depts || []).map((d) =>
          `<span class="agent-pill" data-open-staff="${esc(d.dept_id)}">#${esc(d.dept_id)} ${esc(calmTitle(d.title_vi))}</span>`
        ).join("");
        const workerPill = s.worker_name ? `<span class="worker-tag">${esc(viWorkerLabel(s.worker_name))}</span>` : "";

        return `
          <div class="step-row ${isRun ? "is-running" : ""} ${isWait ? "is-waiting" : ""}">
            <span class="step-node ${nodeCls}">${nodeSym}</span>
            <div class="step-main">
              <div class="step-title-line">
                <span class="step-name">Bước ${s.step_order}. ${esc(s.title)}</span>
                ${workerPill}
              </div>
              <div class="who-chips">
                ${whoStateLabel}
                ${deptChips}
              </div>
              ${(s.live_activity_text && !isDone) ? `<div class="step-summary" style="color:${isRun ? "var(--run-text)" : "var(--text-muted)"};">${esc(s.live_activity_text)}</div>` : ""}
              ${(s.output_summary && (isDone || isWait)) ? `<div class="step-summary">${esc(s.output_summary)}</div>` : ""}
              ${s.artifact_path ? renderArtifactChip(s.artifact_path) : ""}
              ${isDone ? `
                <div class="step-checks">
                  ${s.critique_verdict ? `<span>✓ ${esc(s.critique_verdict)}</span>` : ""}
                  ${s.ux_verdict ? `<span>✓ ${esc(s.ux_verdict)}</span>` : ""}
                </div>
              ` : ""}
            </div>
            <div class="step-time-col mono" style="font-size:11.5px;color:var(--text-muted);">
              ${esc(shortTime(s.completed_at || s.started_at))}
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
              <h3 class="mission-title">${esc(m.title)}</h3>
              ${phaseBadge}
              ${stBadge}
              ${workerChipsHtml}
            </div>

            <div class="progress-wrap">
              <span class="mono" style="font-size:12.5px;font-weight:700;color:var(--text-primary);">${m.progress_pct || 0}%</span>
              <div class="progress-track">
                <div class="progress-fill" style="width:${m.progress_pct || 0}%;"></div>
              </div>

              ${m.project_id ? `<button type="button" class="btn btn-xs" data-open-proj="${esc(m.project_id)}">Mở SP &amp; Mã nguồn →</button>` : ""}
              ${(isQueued && !(state.bridge && state.bridge.online)) ? `<button type="button" class="btn btn-xs" data-copy-ag-cmd="${esc(m.mission_id)}" title="Sao chép lệnh gửi nhanh vào khung chat Antigravity">Copy lệnh</button>` : ""}
              ${m.status === "WAITING_CHAIRMAN" ? `
                <button type="button" class="btn btn-xs btn-ok" data-approve-msn="${esc(m.mission_id)}">${isProposalGate ? "✓ Duyệt kèo → Sản xuất SP" : "✓ Nghiệm thu Hoàn tất"}</button>
                <button type="button" class="btn btn-xs" data-reject-msn="${esc(m.mission_id)}">↺ Gửi lại sửa</button>
              ` : ""}
              ${m.status === "RUNNING" ? `<button type="button" class="btn btn-xs" data-pause-msn="${esc(m.mission_id)}">⏸ Tạm dừng</button>` : ""}
              ${m.status === "PAUSED" ? `<button type="button" class="btn btn-xs btn-primary" data-resume-msn="${esc(m.mission_id)}">▶ Gửi chạy tiếp</button>` : ""}
              <button type="button" class="btn btn-xs" data-edit-msn="${esc(m.mission_id)}">Sửa</button>
              <button type="button" class="btn btn-xs btn-danger-ghost" data-del-msn="${esc(m.mission_id)}">Xóa</button>
            </div>
          </div>
          <div class="swarm-subnav">
            <div class="swarm-tabs">
              <button type="button" class="swarm-tab-btn ${activeSubTab === "steps" ? "active" : ""}" data-msn-subtab="${esc(m.mission_id)}:steps">Tiến độ ${m.total_steps || 8} bước</button>
              <button type="button" class="swarm-tab-btn ${activeSubTab === "board" ? "active" : ""}" data-msn-subtab="${esc(m.mission_id)}:board">Bảng trao đổi (${msnMsgs.length})</button>
              <button type="button" class="swarm-tab-btn ${activeSubTab === "members" ? "active" : ""}" data-msn-subtab="${esc(m.mission_id)}:members">Thành viên</button>
              <button type="button" class="swarm-tab-btn ${activeSubTab === "graph" ? "active" : ""}" data-msn-subtab="${esc(m.mission_id)}:graph">Sơ đồ chuyền việc</button>
            </div>
            <span style="font-size:11.5px;color:var(--text-muted);">Phòng họp trực tiếp · 100% Tiếng Việt</span>
          </div>
          ${bodyHtml}
        </article>
      `;
    }).join("");

    bindQuickActions(box);
  }

  function getFilteredTasks() {
    const q = (document.getElementById("filter-task-q").value || "").trim().toLowerCase();
    const projF = document.getElementById("filter-task-project").value;
    const colF = document.getElementById("filter-task-col").value;
    const prioF = document.getElementById("filter-task-prio").value;
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
      b.classList.toggle("active", b.getAttribute("data-tview") === state.taskViewMode);
    });

    const filtered = getFilteredTasks();
    const listWrap = document.getElementById("tasks-list-wrapper");
    const boardWrap = document.getElementById("tasks-board-wrapper");

    if (state.taskViewMode === "list") {
      listWrap.style.display = "block";
      boardWrap.style.display = "none";
      if (!filtered.length) {
        listWrap.innerHTML = `<div style="padding:28px;text-align:center;color:var(--text-muted);">Không có công việc nào khớp bộ lọc. Nhấn <strong>+ Thêm việc lẻ</strong> để tạo mới.</div>`;
        updateBulkBar();
        return;
      }

      const allSelected = filtered.every((t) => state.selectedTaskIds.has(t.task_id));
      const headRow = `
        <div class="list-row" style="background:var(--bg-subtle);padding:8px 16px;font-size:12px;color:var(--text-muted);">
          <input type="checkbox" id="chk-select-all-tasks" ${allSelected ? "checked" : ""} aria-label="Chọn tất cả việc" />
          <span style="font-weight:600;">Chọn tất cả (${filtered.length} việc)</span>
          <span></span>
          <span></span>
        </div>
      `;

      listWrap.innerHTML = headRow + filtered.map((t) => {
        const checked = state.selectedTaskIds.has(t.task_id) ? "checked" : "";
        const colCls =
          t.kanban_column === "DONE" ? "badge-done" :
          t.kanban_column === "WAITING_APPROVAL" ? "badge-wait" :
          t.kanban_column === "REJECTED" ? "badge-fail" :
          t.kanban_column === "IN_PROGRESS" ? "badge-run" : "badge-idle";
        const dName = calmTitle(t.assigned_dept_title || deptTitle(t.assigned_dept_id));
        return `
          <div class="list-row">
            <input type="checkbox" data-sel-task="${esc(t.task_id)}" ${checked} aria-label="Chọn ${esc(t.title)}" />
            <div style="min-width:0;cursor:pointer;" data-edit-task="${esc(t.task_id)}">
              <div style="font-weight:600;color:var(--text-primary);overflow-wrap:anywhere;${t.kanban_column === "DONE" ? "text-decoration:line-through;opacity:0.65;" : ""}">${esc(t.title)}</div>
              <div style="font-size:12px;color:var(--text-muted);">
                #${esc(t.assigned_dept_id)} ${esc(dName)} · Ưu tiên: ${esc(PRIO_LABELS[t.priority] || "Cao")}
              </div>
            </div>
            <span class="badge ${colCls}">${esc(COL_LABELS[t.kanban_column] || t.kanban_column)}</span>
            <div class="row-actions">
              ${t.kanban_column !== "DONE" ? `<button type="button" class="btn btn-xs" data-dispatch-task="${esc(t.task_id)}" title="Gửi đầu việc này sang Antigravity Swarm làm thật">⚡ Giao AI</button>` : ""}
              ${t.kanban_column !== "DONE" ? `<button type="button" class="btn btn-xs btn-ok" data-approve-task="${esc(t.task_id)}" title="Đánh dấu hoàn tất">✓ Xong</button>` : ""}
              <button type="button" class="btn btn-xs" data-edit-task="${esc(t.task_id)}">Sửa</button>
              <button type="button" class="btn btn-xs hide-sm" data-dup-task="${esc(t.task_id)}">Sao chép</button>
              <button type="button" class="btn btn-xs btn-danger-ghost" data-del-task="${esc(t.task_id)}">Xóa</button>
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
      listWrap.style.display = "none";
      boardWrap.style.display = "grid";
      const cols = ["BACKLOG", "IN_PROGRESS", "QA_SECURITY_REVIEW", "WAITING_APPROVAL", "DONE"];
      boardWrap.innerHTML = cols.map((c) => {
        const colTasks = filtered.filter((t) => c === "IN_PROGRESS" ? (t.kanban_column === "IN_PROGRESS" || t.kanban_column === "REJECTED") : t.kanban_column === c);
        return `
          <div class="k-col" data-drop-col="${c}">
            <div class="k-head">
              <span>${esc(COL_LABELS[c])} (${colTasks.length})</span>
              <button type="button" class="btn btn-xs" data-quick-col-add="${c}" title="Thêm việc vào cột này">+</button>
            </div>
            ${colTasks.map((t) => `
              <div class="k-card" draggable="true" data-drag-task="${esc(t.task_id)}">
                <div style="font-weight:600;color:var(--text-primary);cursor:pointer;overflow-wrap:anywhere;" data-edit-task="${esc(t.task_id)}">
                  ${t.kanban_column === "REJECTED" ? `<span class="badge badge-fail" style="margin-right:4px;">Cần sửa</span>` : ""}${esc(t.title)}
                </div>
                <select class="select" data-move-col-select="${esc(t.task_id)}" style="height:28px;font-size:11.5px;padding:2px 6px;" aria-label="Chuyển cột">
                  ${cols.map((opt) => `<option value="${opt}" ${(t.kanban_column === opt || (t.kanban_column === "REJECTED" && opt === "IN_PROGRESS")) ? "selected" : ""}>${esc(COL_LABELS[opt])}</option>`).join("")}
                </select>
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:var(--text-muted);">
                  <span>#${esc(t.assigned_dept_id)}</span>
                  <div style="display:flex;gap:4px;">
                    <button type="button" class="btn btn-xs" data-edit-task="${esc(t.task_id)}">Sửa</button>
                    <button type="button" class="btn btn-xs btn-danger-ghost" data-del-task="${esc(t.task_id)}">Xóa</button>
                  </div>
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
    boardWrap.querySelectorAll("[data-move-col-select]").forEach((sel) => {
      sel.onchange = async () => {
        const tid = sel.getAttribute("data-move-col-select");
        await api(`/api/tasks/${encodeURIComponent(tid)}`, "PATCH", { kanban_column: sel.value });
        await loadEverything();
      };
    });
  }

  function renderStaffTab() {
    const pillBar = document.getElementById("staff-div-pills");
    const divOrder = [
      "", "div9-critique-ux-lab", "exec-board", "div1-strategy-intel", "div2-product-design",
      "div3-engineering-ai", "div4-qa-cybersecurity", "div5-media-youtube-studio",
      "div6-sales-commercial", "div7-finance-tax-legal", "div8-data-ops-hr"
    ];
    pillBar.innerHTML = divOrder.map((code) => {
      const active = state.staffDivFilter === code ? "active" : "";
      const label = code === "" ? `Tất cả (${state.departments.length})` : (DIV_SHORT_NAMES[code] || code);
      return `<button type="button" class="chip-btn ${active}" data-sdiv="${code}">${esc(label)}</button>`;
    }).join("");

    pillBar.querySelectorAll("[data-sdiv]").forEach((b) => {
      b.onclick = () => { state.staffDivFilter = b.getAttribute("data-sdiv"); renderStaffTab(); };
    });

    const q = (document.getElementById("staff-search").value || "").trim().toLowerCase();
    const filtered = state.departments.filter((d) => {
      if (state.staffDivFilter && d.division_code !== state.staffDivFilter) return false;
      if (q && !`${d.dept_id} ${d.code} ${d.title_vi} ${calmTitle(d.title_vi)}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const grid = document.getElementById("staff-grid");
    if (!filtered.length) {
      grid.innerHTML = `
        <div class="panel-box" style="grid-column:1/-1;text-align:center;padding:28px;">
          <p style="color:var(--text-muted);margin-bottom:10px;">Không tìm thấy chuyên gia nào phù hợp từ khóa.</p>
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
      return `
        <article class="staff-card" data-open-staff="${esc(d.dept_id)}">
          <span class="sq-avatar">#${esc(d.dept_id)}</span>
          <div style="min-width:0;flex:1;">
            <div style="font-weight:700;color:var(--text-primary);font-size:13.5px;">${esc(calmTitle(d.title_vi))}</div>
            <div style="font-size:12px;color:var(--text-muted);margin:2px 0 6px;">${esc(DIV_SHORT_NAMES[d.division_code] || d.division_name_vi || "")}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
              ${busy ? `<span class="badge badge-run">● Đang làm việc</span>` : `<span class="badge badge-idle">○ Sẵn sàng</span>`}
              <span class="mono" style="font-size:11.5px;color:var(--text-muted);">✓ ${d.tasks_completed || 0} việc</span>
            </div>
          </div>
        </article>
      `;
    }).join("");

    bindQuickActions(grid);
  }

  function renderNewsTab() {
    const box = document.getElementById("news-list-box");
    const uniqueList = getDeduplicatedArticles().filter((a) => state.newsStarFilter !== "starred" || Boolean(a.is_starred));

    if (!uniqueList.length) {
      box.innerHTML = `<div style="padding:28px;text-align:center;color:var(--text-muted);">Không có bài báo nào trong mục này.</div>`;
      return;
    }

    box.innerHTML = uniqueList.map((a) => {
      const aid = a.atom_id || a.url_hash;
      const expanded = state.expandedNewsIds.has(String(aid));
      const link = a.url || a.source_url || "#";
      const srcLabel = CONNECTOR_LABELS[a.source_connector] || "Bản tin thị trường";
      const deptsText = (a.dept_list || [a.dept_id]).map((d) => `#${d}`).join(", ");
      return `
        <div class="news-row">
          <div class="news-top">
            <div style="min-width:0;flex:1 1 240px;cursor:pointer;" data-toggle-news="${esc(aid)}">
              <div style="font-weight:600;color:var(--text-primary);font-size:14px;">${esc(a.title)}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
                ${esc(srcLabel)} · Phòng ${esc(deptsText)} · ${esc(shortTime(a.fetched_at))}
              </div>
            </div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;flex-shrink:0;">
              ${a.atom_id ? `<button type="button" class="btn btn-xs" data-star-news="${a.atom_id}" style="${a.is_starred ? "color:var(--warn-text);" : ""}">${a.is_starred ? "★ Đã ghim" : "☆ Ghim"}</button>` : ""}
              <a class="btn btn-xs" href="${esc(link)}" target="_blank" rel="noopener noreferrer">Mở gốc ↗</a>
              ${a.atom_id ? `<button type="button" class="btn btn-xs btn-danger-ghost" data-del-news="${a.atom_id}">Xóa</button>` : ""}
            </div>
          </div>
          ${expanded ? `
            <div style="margin-top:8px;padding:10px 12px;background:var(--bg-subtle);border-radius:8px;font-size:13px;">
              <div>${esc(a.summary_vi || "")}</div>
              ${a.actionable_insight ? `<div style="margin-top:6px;color:var(--accent);font-weight:600;">Ứng dụng kiếm tiền: ${esc(a.actionable_insight)}</div>` : ""}
            </div>
          ` : ""}
        </div>
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

  function updateCfoSliders() {
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
    document.getElementById("bar-cogs").style.width = `${cogsPct}%`;
    document.getElementById("bar-tax").style.width = `${taxPct}%`;
    document.getElementById("bar-profit").style.width = `${profPct}%`;

    const pill = document.getElementById("cfo-status-pill");
    if (worstMargin >= 65) {
      pill.className = "badge badge-done";
      pill.textContent = `An toàn · Biên lãi xấu nhất ${worstMargin.toFixed(0)}%`;
    } else if (worstMargin < 0) {
      pill.className = "badge badge-fail";
      pill.textContent = "Cảnh báo lỗ · Chi phí vượt giá bán";
    } else {
      pill.className = "badge badge-fail";
      pill.textContent = `Cảnh báo · Biên lãi mỏng ${worstMargin.toFixed(0)}% (<65%)`;
    }
    document.getElementById("lbl-breakeven").textContent = breakeven > 0 ? `Hòa vốn: ${breakeven} khách` : "Đang lỗ trên mỗi khách";

    const tiersBox = document.getElementById("cfo-tiers-box");
    tiersBox.innerHTML = [10, 50, 200, 500].map((n) => {
      const net = Math.round(netPerUser * n - fixed);
      return `
        <div class="list-row" style="grid-template-columns:1fr auto;">
          <span>Khi có <strong>${n} khách trả phí</strong></span>
          <span class="mono" style="font-weight:700;color:${net >= 0 ? "var(--ok-text)" : "var(--danger-text)"};">${vnd(net)} / tháng</span>
        </div>
      `;
    }).join("");
  }

  async function renderProjectsSection(preserveDocEditor = true) {
    const pList = document.getElementById("projects-crud-list");
    if (!state.projects.length) {
      pList.innerHTML = `<div style="padding:14px;color:var(--text-muted);">Chưa có dự án. Nhấn "+ Tạo dự án mới".</div>`;
      document.getElementById("project-docs-list").innerHTML = "";
      resetDocViewer();
      return;
    }
    if (!state.selectedProjectId || !state.projects.some((p) => p.project_id === state.selectedProjectId)) {
      state.selectedProjectId = state.projects[0].project_id;
      preserveDocEditor = false;
    }
    pList.innerHTML = state.projects.map((p) => `
      <div class="list-row" style="grid-template-columns:minmax(0,1fr) auto;${p.project_id === state.selectedProjectId ? "background:var(--accent-soft);" : ""}">
        <div style="cursor:pointer;min-width:0;" data-sel-proj="${esc(p.project_id)}">
          <div style="font-weight:700;color:var(--text-primary);overflow-wrap:anywhere;">${esc(p.title)}</div>
          <div class="mono" style="font-size:11.5px;color:var(--text-muted);">${vnd(p.expected_price_vnd)} · ${esc(PROJECT_STATUS_LABELS[p.status] || "Đang chạy")}</div>
        </div>
        <div class="row-actions">
          <button type="button" class="btn btn-xs" data-edit-proj="${esc(p.project_id)}">Sửa</button>
          <button type="button" class="btn btn-xs btn-danger-ghost" data-del-proj="${esc(p.project_id)}">Xóa</button>
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
    document.getElementById("doc-pretty-view").innerHTML = "Chọn hoặc tạo một tài liệu (.md) để xem nội dung tại đây.";
    document.getElementById("doc-pretty-view").style.display = "block";
    document.getElementById("doc-raw-editor").style.display = "none";
  }

  async function loadProjectDocs(pid, keepCurrentFile = true) {
    const dBox = document.getElementById("project-docs-list");
    if (!pid || state.staticMode) {
      dBox.innerHTML = `<div style="padding:12px;color:var(--text-muted);font-size:12.5px;">Tài liệu dự án sẵn sàng trên máy chủ.</div>`;
      return;
    }
    try {
      const res = await api(`/api/projects/${encodeURIComponent(pid)}/files`);
      const files = res.files || [];
      if (!files.length) {
        dBox.innerHTML = `<div style="padding:12px;color:var(--text-muted);">Chưa có tệp nào. Nhấn "+ Tạo tài liệu (.md)".</div>`;
        resetDocViewer();
        return;
      }
      dBox.innerHTML = files.map((f) => `
        <div class="list-row" style="grid-template-columns:1fr auto;cursor:pointer;${f.path === state.currentDocFile ? "background:var(--bg-subtle);" : ""}" data-open-doc="${esc(f.path)}">
          <span class="mono" style="font-size:12.5px;overflow-wrap:anywhere;">${esc(f.path)}</span>
          <span class="mono" style="font-size:11px;color:var(--text-muted);">${Math.max(1, Math.round((f.size_bytes || 0) / 1024))} KB</span>
        </div>
      `).join("");
      dBox.querySelectorAll("[data-open-doc]").forEach((r) => {
        r.onclick = () => openDocFile(pid, r.getAttribute("data-open-doc"));
      });
      const targetPath = (keepCurrentFile && files.some((x) => x.path === state.currentDocFile))
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
      document.getElementById("doc-pretty-view").style.display = "block";
      document.getElementById("doc-raw-editor").style.display = "none";
      document.getElementById("btn-save-doc").style.display = "none";
      document.getElementById("btn-toggle-doc-edit").textContent = "Sửa nội dung";
    } catch (_e) {}
  }

  // -------------------------------------------------------------------------
  // 6. STAFF DRAWER (CLEAN CALM TITLE, SETTINGS EDIT, DISPATCH & RETIRE)
  // -------------------------------------------------------------------------
  async function openStaffDrawer(deptId) {
    document.getElementById("drawer-backdrop").classList.add("open");
    document.getElementById("inspector-drawer").classList.add("open");
    const body = document.getElementById("drawer-body");
    body.innerHTML = `<p style="color:var(--text-muted);">Đang tải hồ sơ...</p>`;

    try {
      const d = await api(`/api/departments/${encodeURIComponent(deptId)}`);
      document.getElementById("drawer-heading").textContent = `#${d.dept_id} · ${calmTitle(d.title_vi)}`;
      const isCustom = Number(d.dept_id) > 50;

      body.innerHTML = `
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px;font-size:12px;color:var(--text-muted);" class="mono">
          <span>Đã hoàn tất: <strong>${d.tasks_completed || 0} việc</strong></span>
          <span>Bài báo đã học: <strong>${(d.learned_articles || []).length}</strong></span>
          <span>Hạn mức Token: <strong>${formatDotNumber(d.token_budget_monthly || 500000)}</strong></span>
        </div>

        <form id="form-staff-quick-task" style="padding:14px;background:var(--bg-subtle);border-radius:10px;margin-bottom:16px;">
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:8px;">Giao việc riêng cho #${esc(d.dept_id)}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <input type="text" class="input" id="inp-direct-task" placeholder="Nhập việc cần nhân viên này làm..." style="flex:1 1 200px;" required />
            <button type="submit" class="btn btn-primary">Giao ngay</button>
          </div>
        </form>

        <details style="margin-bottom:16px;border:1px solid var(--border);border-radius:8px;padding:10px 12px;">
          <summary style="cursor:pointer;font-weight:600;color:var(--text-primary);">Cập nhật chức danh &amp; hạn mức Token tháng</summary>
          <form id="form-staff-meta" style="margin-top:10px;">
            <div class="form-field">
              <label>Chức danh hiển thị</label>
              <input type="text" class="input" id="inp-staff-title" value="${esc(calmTitle(d.title_vi))}" required />
            </div>
            <div class="form-field">
              <label>Hạn mức Token / tháng</label>
              <input type="number" class="input mono" id="inp-staff-budget" value="${d.token_budget_monthly || 500000}" min="1000" step="50000" />
            </div>
            <button type="submit" class="btn btn-xs btn-primary">Lưu thông tin</button>
          </form>
        </details>

        ${(d.reflexions && d.reflexions.length) ? `
          <div style="margin-bottom:18px;">
            <div class="sec-head"><h3 class="sec-title">Sổ rút kinh nghiệm (${d.reflexions.length})</h3></div>
            <div class="hairline-table">
              ${d.reflexions.map((r) => `
                <div class="list-row" style="grid-template-columns:1fr auto;">
                  <div>
                    <div style="font-weight:600;color:var(--danger-text);">${esc(r.failure_symptom)}</div>
                    <div style="font-size:12px;">Quy tắc tránh lặp lại: ${esc(r.preventive_rule)}</div>
                  </div>
                  <button type="button" class="btn btn-xs btn-danger-ghost" data-del-refl="${esc(r.reflexion_id)}">Xóa</button>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <div class="sec-head">
          <h3 class="sec-title">Cẩm nang chuyên môn</h3>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" class="btn btn-xs" id="btn-edit-hb">Chỉnh sửa cẩm nang</button>
            ${isCustom ? `<button type="button" class="btn btn-xs btn-danger-ghost" id="btn-retire-dept">Giải thể phòng này</button>` : ""}
          </div>
        </div>
        <div id="hb-pretty" class="rendered-md">${renderCleanMarkdown(d.handbook_markdown)}</div>
        <div id="hb-edit-wrap" style="display:none;">
          <textarea class="textarea mono" id="hb-textarea" style="min-height:280px;font-size:12.5px;margin-bottom:8px;">${esc(d.handbook_markdown || "")}</textarea>
          <button type="button" class="btn btn-primary" id="btn-save-hb">Lưu cẩm nang</button>
        </div>
      `;

      document.getElementById("form-staff-quick-task").onsubmit = async (e) => {
        e.preventDefault();
        const tval = document.getElementById("inp-direct-task").value.trim();
        if (!tval) return;
        await api("/api/tasks", "POST", { title: tval, assigned_dept_id: d.dept_id, priority: "HIGH" });
        closeDrawer();
        await loadEverything();
        switchTab("tasks");
        toast(`Đã giao việc cho Phòng #${d.dept_id}.`);
      };

      document.getElementById("form-staff-meta").onsubmit = async (e) => {
        e.preventDefault();
        await api(`/api/departments/${encodeURIComponent(d.dept_id)}`, "PATCH", {
          title_vi: document.getElementById("inp-staff-title").value.trim(),
          token_budget_monthly: Number(document.getElementById("inp-staff-budget").value || 500000)
        });
        await loadEverything();
        toast("Đã cập nhật thông tin phòng ban.");
        openStaffDrawer(d.dept_id);
      };

      document.getElementById("btn-edit-hb").onclick = () => {
        const w = document.getElementById("hb-edit-wrap");
        const p = document.getElementById("hb-pretty");
        const open = w.style.display === "none";
        w.style.display = open ? "block" : "none";
        p.style.display = open ? "none" : "block";
      };

      document.getElementById("btn-save-hb").onclick = async () => {
        const md = document.getElementById("hb-textarea").value;
        await api(`/api/departments/${encodeURIComponent(d.dept_id)}`, "PATCH", { handbook_markdown: md });
        toast("Đã lưu cẩm nang chuyên môn.");
        openStaffDrawer(d.dept_id);
      };

      const retireBtn = document.getElementById("btn-retire-dept");
      if (retireBtn) {
        retireBtn.onclick = () => withLock(retireBtn, async () => {
          await api(`/api/departments/${encodeURIComponent(d.dept_id)}`, "DELETE");
          closeDrawer();
          await loadEverything();
          toast(`Đã giải thể phòng #${d.dept_id}.`);
        });
      }

      body.querySelectorAll("[data-del-refl]").forEach((rb) => {
        rb.onclick = async () => {
          await api(`/api/reflexions/${encodeURIComponent(rb.getAttribute("data-del-refl"))}`, "DELETE");
          openStaffDrawer(d.dept_id);
        };
      });
    } catch (e) {
      body.innerHTML = `<p>${esc(e.message)}</p>`;
    }
  }

  function closeDrawer() {
    document.getElementById("drawer-backdrop").classList.remove("open");
    document.getElementById("inspector-drawer").classList.remove("open");
    document.getElementById("drawer-body").innerHTML = "";
  }

  // -------------------------------------------------------------------------
  // 7. UNIFIED QUICK ACTIONS (ZERO window.prompt, FULL UNDO & BATCH UNDO)
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
            ? "Đã chuyển cơ hội sang Antigravity Swarm — Đang khởi động AI làm thật!"
            : "Đã xếp cơ hội vào hàng đợi Antigravity (sẽ tự chạy ngay khi bật Trực chiến)."
        );
      });
    });

    root.querySelectorAll("[data-copy-ag-cmd]").forEach((b) => {
      b.onclick = async () => {
        const m = state.missions.find((x) => x.mission_id === b.getAttribute("data-copy-ag-cmd"));
        if (!m) return;
        const cmd = buildAntigravityHandoffCommand(m);
        try {
          await navigator.clipboard.writeText(cmd);
          toast("Đã sao chép lệnh! Dán vào khung chat Antigravity nếu chưa bật cầu nối trực chiến.");
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
              ? "Đã bắn công việc sang Antigravity Swarm để làm thật!"
              : "Đã đưa công việc vào hàng đợi Antigravity (tự chạy khi bật Trực chiến)."
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
          toast(
            res.bridge_online
              ? "Đã duyệt chốt kèo! Đã phát lệnh BUILD_PRODUCT sang Antigravity Swarm sản xuất sản phẩm cuối (Bước 5 → 8)!"
              : "Đã duyệt chốt kèo & tạo thư mục dự án! Bật trực chiến Antigravity để đội ngũ sản xuất sản phẩm thật ngay."
          );
        } else {
          toast("Đã nghiệm thu sản phẩm cuối hoàn tất 100%! Xem lưu trữ ở Tab Tiến độ → Đã xong & Tab Tài chính.");
        }
      });
    });

    // Clean Modal instead of window.prompt for Reject!
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

    // Clean Modal instead of window.prompt for Edit Mission!
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

    // Tasks Actions
    root.querySelectorAll("[data-sel-task]").forEach((chk) => {
      chk.onchange = () => {
        const tid = chk.getAttribute("data-sel-task");
        if (chk.checked) state.selectedTaskIds.add(tid);
        else state.selectedTaskIds.delete(tid);
        updateBulkBar();
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
        document.getElementById("inp-task-dept").value = t.assigned_dept_id || "00";
        document.getElementById("inp-task-col").value = t.kanban_column || "BACKLOG";
        document.getElementById("inp-task-proj").value = t.project_id || "";
        document.getElementById("inp-task-prio").value = t.priority || "HIGH";
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

    // News Star & Delete + Undo
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

    // Projects Edit & Delete + Undo
    root.querySelectorAll("[data-edit-proj]").forEach((b) => {
      b.onclick = () => {
        const p = state.projects.find((x) => x.project_id === b.getAttribute("data-edit-proj"));
        if (!p) return;
        document.getElementById("proj-modal-title").textContent = "Chỉnh sửa dự án";
        document.getElementById("edit-proj-id").value = p.project_id;
        document.getElementById("wrap-proj-slug").style.display = "none";
        document.getElementById("inp-proj-title").value = p.title;
        document.getElementById("inp-proj-price").value = formatDotNumber(p.expected_price_vnd || 399000);
        document.getElementById("inp-proj-status").value = p.status || "ACTIVE";
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
    if (cnt > 0 && state.tab === "tasks") {
      bar.classList.add("visible");
    } else {
      bar.classList.remove("visible");
    }
  }

  // -------------------------------------------------------------------------
  // 8. NAVIGATION, NON-CLOBBERING DROPDOWNS, COMMAND PALETTE & SYNC
  // -------------------------------------------------------------------------
  function switchTab(tab) {
    if (!VIEW_TITLES[tab]) return;
    state.tab = tab;
    document.getElementById("view-heading").textContent = VIEW_TITLES[tab];

    document.querySelectorAll(".view-panel").forEach((p) => {
      p.classList.toggle("active", p.id === `view-${tab}`);
    });
    document.querySelectorAll("#side-nav .nav-item").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });
    document.querySelectorAll("#mobile-nav .mob-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });

    if (window.location.hash !== `#${tab}`) {
      history.replaceState(null, "", `#${tab}`);
    }
    updateBulkBar();
    renderAllViews();
  }

  function openModal(id) {
    closeModals();
    document.getElementById("modal-backdrop").classList.add("open");
    const m = document.getElementById(id);
    if (m) {
      m.classList.add("open");
      const inp = m.querySelector("input:not([type='hidden']), textarea");
      if (inp) setTimeout(() => inp.focus(), 30);
    }
  }

  function closeModals() {
    document.getElementById("modal-backdrop").classList.remove("open");
    document.querySelectorAll(".modal.open").forEach((m) => m.classList.remove("open"));
  }

  function openNewTaskModal(defaultCol = "BACKLOG") {
    document.getElementById("task-modal-title").textContent = "Thêm công việc mới";
    document.getElementById("edit-task-id").value = "";
    document.getElementById("form-task").reset();
    document.getElementById("inp-task-col").value = defaultCol;
    openModal("modal-task");
  }

  function setSelectOptionsPreservingValue(selectEl, optionsHtml, skipIfModalId = "") {
    if (!selectEl) return;
    if (skipIfModalId) {
      const modalEl = document.getElementById(skipIfModalId);
      if (modalEl && modalEl.classList.contains("open") && selectEl.options.length > 0) return;
    }
    const prev = selectEl.value;
    selectEl.innerHTML = optionsHtml;
    if (prev && Array.from(selectEl.options).some((o) => o.value === prev)) {
      selectEl.value = prev;
    }
  }

  function populateDropdowns() {
    const deptOpts = state.departments
      .map((d) => `<option value="${esc(d.dept_id)}">#${esc(d.dept_id)} · ${esc(calmTitle(d.title_vi))}</option>`)
      .join("");
    setSelectOptionsPreservingValue(document.getElementById("inp-task-dept"), deptOpts, "modal-task");
    setSelectOptionsPreservingValue(document.getElementById("url-dept-select"), deptOpts);

    const projOpts = `<option value="">-- Không gắn dự án --</option>` +
      state.projects.map((p) => `<option value="${esc(p.project_id)}">${esc(p.title)}</option>`).join("");
    setSelectOptionsPreservingValue(document.getElementById("inp-task-proj"), projOpts, "modal-task");

    const filterProjOpts = `<option value="">Tất cả dự án</option>` +
      state.projects.map((p) => `<option value="${esc(p.project_id)}">${esc(p.title)}</option>`).join("");
    setSelectOptionsPreservingValue(document.getElementById("filter-task-project"), filterProjOpts);

    const divOpts = state.divisions
      .filter((dv) => dv.code !== "exec-board")
      .map((dv) => `<option value="${esc(dv.code)}">${esc(dv.name_vi)}</option>`).join("");
    setSelectOptionsPreservingValue(document.getElementById("inp-hire-div"), divOpts, "modal-hire");
  }

  function renderAllViews() {
    renderCountsAndHeader();
    if (state.tab === "command") renderCommandTab();
    if (state.tab === "missions") renderMissionsTab();
    if (state.tab === "tasks") renderTasksTab();
    if (state.tab === "staff") renderStaffTab();
    if (state.tab === "news") renderNewsTab();
    if (state.tab === "finance") {
      updateCfoSliders();
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
    populateDropdowns();
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
      if (!state.staticMode) setTimeout(startLiveStream, 3000);
    };
  }

  function applyTheme(t) {
    const mode = t === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("titan_theme", mode);
    document.getElementById("meta-theme-color").setAttribute("content", mode === "dark" ? "#10141F" : "#0F766E");
    const svg = document.getElementById("theme-icon-svg");
    if (svg) {
      svg.innerHTML = mode === "dark"
        ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  }

  // Real GitHub REST API 2-Way Cloud Sync
  async function syncWithGitHubCloud() {
    const pin = document.getElementById("inp-cloud-pin").value;
    if (!pin || pin.length < 4) {
      throw new Error("Vui lòng nhập Mã PIN mở két (tối thiểu 4 ký tự).");
    }
    const creds = await cryptoVault.unlock(pin);
    sessionUnlockedGitHub = creds;
    const apiUrl = `https://api.github.com/repos/${creds.repo}/contents/corporate_hq/cloud_state/snapshot.json`;
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${creds.token}`
    };
    const r = await fetch(apiUrl, { headers });
    if (!r.ok) throw new Error(`GitHub API trả mã lỗi ${r.status}. Kiểm tra lại quyền Token.`);
    const meta = await r.json();
    const remoteSnap = JSON.parse(cryptoVault.b64ToUtf8(meta.content || ""));

    if (!state.staticMode) {
      const merged = await api("/api/sync/snapshot", "POST", { snapshot: remoteSnap });
      await fetch(apiUrl, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `chore(sync): Command Center multi-device sync ${new Date().toISOString()}`,
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
      saveLocalFallbackStore();
      renderAllViews();
    }
    closeModals();
    toast("Đồng bộ 2 chiều với kho GitHub thành công!");
  }

  // Command Palette (All 6 Entities + Arrow/Enter Navigation)
  function renderCmd(q) {
    const term = (q || "").trim().toLowerCase();
    const rows = [];
    state.missions.forEach((m) => {
      if (!term || m.title.toLowerCase().includes(term)) rows.push({ kind: "msn", label: `Nhiệm vụ: ${m.title}`, sub: "Tiến độ 7 bước" });
    });
    state.opportunities.forEach((o) => {
      if (term && o.title.toLowerCase().includes(term)) rows.push({ kind: "opp", label: `Cơ hội: ${o.title}`, sub: o.target_customer });
    });
    state.tasks.forEach((t) => {
      if (term && t.title.toLowerCase().includes(term)) rows.push({ kind: "task", id: t.task_id, label: `Công việc: ${t.title}`, sub: COL_LABELS[t.kanban_column] || "" });
    });
    state.projects.forEach((p) => {
      if (term && p.title.toLowerCase().includes(term)) rows.push({ kind: "proj", id: p.project_id, label: `Dự án: ${p.title}`, sub: PROJECT_STATUS_LABELS[p.status] || "" });
    });
    state.departments.forEach((d) => {
      const cTitle = calmTitle(d.title_vi);
      if (!term || `${d.dept_id} ${d.code} ${cTitle}`.toLowerCase().includes(term)) {
        rows.push({ kind: "dept", id: d.dept_id, label: `#${d.dept_id} · ${cTitle}`, sub: DIV_SHORT_NAMES[d.division_code] || "" });
      }
    });
    getDeduplicatedArticles().forEach((a) => {
      if (term && a.title.toLowerCase().includes(term)) rows.push({ kind: "news", label: `Báo mới: ${a.title}`, sub: CONNECTOR_LABELS[a.source_connector] || "" });
    });

    state.cmdItems = rows.slice(0, 14);
    state.cmdIndex = 0;
    paintCmdList();
  }

  function paintCmdList() {
    const box = document.getElementById("cmd-results");
    if (!state.cmdItems.length) {
      box.innerHTML = `<div style="padding:14px;color:var(--text-muted);">Không tìm thấy kết quả phù hợp.</div>`;
      return;
    }
    box.innerHTML = state.cmdItems.map((r, idx) => `
      <div class="list-row ${idx === state.cmdIndex ? "cmd-active" : ""}" style="grid-template-columns:1fr auto;cursor:pointer;" data-cmd-idx="${idx}">
        <div style="min-width:0;">
          <div style="font-weight:600;color:var(--text-primary);overflow-wrap:anywhere;">${esc(r.label)}</div>
          ${r.sub ? `<div style="font-size:11.5px;color:var(--text-muted);">${esc(r.sub)}</div>` : ""}
        </div>
        <span style="font-size:12px;color:var(--text-muted);">Mở ↵</span>
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
      document.querySelectorAll("#mission-filter-tabs .seg-btn").forEach((x) => x.classList.toggle("active", x.getAttribute("data-mfilter") === ""));
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
  // 9. EVENT BINDINGS & INITIALIZATION
  // -------------------------------------------------------------------------
  function bindGlobalEvents() {
    document.querySelectorAll("#side-nav .nav-item, #mobile-nav .mob-btn").forEach((b) => {
      b.onclick = () => switchTab(b.getAttribute("data-tab"));
    });

    document.getElementById("btn-theme").onclick = () => {
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    };

    // Tab 1: Mission Composer + Ctrl+Enter
    document.querySelectorAll("[data-preset]").forEach((chip) => {
      chip.onclick = () => {
        const inp = document.getElementById("mission-prompt-input");
        inp.value = chip.getAttribute("data-preset");
        inp.focus();
      };
    });

    document.getElementById("mission-prompt-input").addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        document.getElementById("form-mission-composer").requestSubmit();
      }
    });

    document.getElementById("form-mission-composer").onsubmit = (e) => {
      e.preventDefault();
      const promptEl = document.getElementById("mission-prompt-input");
      const text = promptEl.value.trim();
      if (!text) {
        promptEl.focus();
        return;
      }
      const btn = document.getElementById("btn-submit-mission");
      withLock(btn, async () => {
        const autoApp = document.getElementById("chk-auto-approve").checked;
        promptEl.value = "";
        const res = await api("/api/missions", "POST", { title: text, goal_prompt: text, auto_approve: autoApp });
        await loadEverything();
        switchTab("missions");
        toast(
          res && res.bridge_online
            ? "Đã gửi đề bài thẳng sang Antigravity Swarm — Đội AI thật đang tiếp nhận!"
            : "Đã xếp đơn vào hàng đợi Antigravity — Sẽ tự động chạy thật ngay khi bật Trực chiến."
        );
      });
    };

    document.getElementById("btn-scan-opps").onclick = (e) => withLock(e.currentTarget, async () => {
      const res = await api("/api/opportunities/scan", "POST", {});
      await loadEverything();
      toast((res && res.message) || "Đã gửi lệnh săn cơ hội kiếm tiền thật sang Antigravity Swarm!");
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

    // Edit Mission Modal Submit
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

    // Reject Modal Submit (for both Mission & Task)
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
        toast("Đã gửi yêu cầu làm lại cho nhân viên.");
      });
    };

    // Tab 2: Missions Filter & Clear Completed + Batch Undo
    document.querySelectorAll("#mission-filter-tabs .seg-btn").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll("#mission-filter-tabs .seg-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
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
      document.getElementById("mission-prompt-input").focus();
    };

    // Tab 3: Tasks Filters, View Toggle, Add/Edit, Clear Done & Bulk Delete + Batch Undo
    document.querySelectorAll("#task-view-mode .seg-btn").forEach((b) => {
      b.onclick = () => {
        state.taskViewMode = b.getAttribute("data-tview");
        renderTasksTab();
      };
    });

    document.getElementById("filter-task-q").oninput = renderTasksTab;
    document.getElementById("filter-task-project").onchange = renderTasksTab;
    document.getElementById("filter-task-col").onchange = renderTasksTab;
    document.getElementById("filter-task-prio").onchange = renderTasksTab;
    document.getElementById("btn-quick-task").onclick = () => openNewTaskModal("BACKLOG");
    document.getElementById("btn-add-task-tab3").onclick = () => openNewTaskModal("BACKLOG");

    document.getElementById("form-task").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const tid = document.getElementById("edit-task-id").value;
        const payload = {
          title: document.getElementById("inp-task-title").value.trim(),
          assigned_dept_id: document.getElementById("inp-task-dept").value,
          kanban_column: document.getElementById("inp-task-col").value,
          project_id: document.getElementById("inp-task-proj").value || null,
          priority: document.getElementById("inp-task-prio").value,
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
      toast(`Đã dọn ${res.affected || backups.length} việc đã xong.`, {
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
          division: document.getElementById("inp-hire-div").value,
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

    // Tab 5: News Poll, Read URL & Fast Search
    const pollNews = (e) => withLock(e.currentTarget, async () => {
      const r = await api("/api/learning/run", "POST", { scope: "all" });
      toast(r.message || "Đang cập nhật tin tức thị trường mới...");
    });
    document.getElementById("btn-scan-news").onclick = pollNews;
    document.getElementById("btn-poll-feeds-tab5").onclick = pollNews;

    document.getElementById("form-read-url").onsubmit = (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      withLock(btn, async () => {
        const url = document.getElementById("url-to-read").value.trim();
        const dept = document.getElementById("url-dept-select").value;
        await api("/api/learning/ingest-url", "POST", { url, dept_id: dept });
        document.getElementById("url-to-read").value = "";
        await Promise.all([loadNews(""), loadEverything()]);
        toast("Nhân viên đã đọc sạch nội dung và lưu bài báo.");
      });
    };

    document.querySelectorAll("#news-star-filter .seg-btn").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll("#news-star-filter .seg-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        state.newsStarFilter = b.getAttribute("data-nfilter");
        renderNewsTab();
      };
    });

    let searchT = null;
    document.getElementById("news-search-input").oninput = (e) => {
      clearTimeout(searchT);
      searchT = setTimeout(() => loadNews(e.target.value), 90);
    };

    // Tab 6: CFO Sliders, Projects, Document Modal & Encrypted Cloud Vault
    ["rng-price", "rng-quota", "rng-unit", "rng-fixed"].forEach((id) => {
      document.getElementById(id).oninput = updateCfoSliders;
    });

    document.getElementById("btn-new-proj").onclick = () => {
      document.getElementById("proj-modal-title").textContent = "Tạo dự án mới";
      document.getElementById("edit-proj-id").value = "";
      document.getElementById("wrap-proj-slug").style.display = "flex";
      document.getElementById("form-proj").reset();
      document.getElementById("inp-proj-price").value = "399.000";
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
          status: document.getElementById("inp-proj-status").value,
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

    // Clean Document Modal (Zero window.prompt!)
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
      document.getElementById("doc-pretty-view").style.display = state.docEditMode ? "none" : "block";
      document.getElementById("doc-raw-editor").style.display = state.docEditMode ? "block" : "none";
      document.getElementById("btn-save-doc").style.display = state.docEditMode ? "inline-flex" : "none";
      document.getElementById("btn-toggle-doc-edit").textContent = state.docEditMode ? "Xem bản đẹp" : "Sửa nội dung";
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
      a.download = `titan-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
          throw new Error("Vui lòng nhập đủ Kho GitHub, Token và Mã PIN tối thiểu 4 ký tự.");
        }
        await cryptoVault.save(repo, token, pin);
        document.getElementById("inp-cloud-token").value = "";
        toast("Đã mã hóa AES-256-GCM và cất khóa an toàn trên thiết bị.");
      });
    };

    document.getElementById("btn-cloud-sync-now").onclick = (e) => withLock(e.currentTarget, syncWithGitHubCloud);

    // Command Palette (Ctrl+K) + Arrow/Enter Navigation
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

    // Capture-phase Keyboard Handler so Escape ALWAYS closes Modals/Drawers reliably!
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
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
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || e.ctrlKey || e.metaKey || e.altKey) return;

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
    await detectLocalBridgeHost();
    await Promise.all([loadEverything(), loadNews("")]);
    switchTab(state.tab);
    startLiveStream();
    if (!state.staticMode) {
      state.bridgeTimer = setInterval(pollBridgeStatus, 5000);
    }

    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
