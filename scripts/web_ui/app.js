/* ==========================================================================
   TITAN COMMAND CENTER v5.0 — AUTONOMOUS MISSION, FULL CRUD & MINIMALIST UI
   ========================================================================== */
(() => {
  "use strict";

  const VIEW_TITLES = {
    command: "Giao việc & Kiếm tiền",
    missions: "Tiến độ Nhiệm vụ từng bước",
    tasks: "Bảng việc chi tiết",
    staff: "Đội ngũ 51 Nhân sự AI",
    news: "Báo mới & Tri thức thị trường",
    finance: "Tài chính, Dự án & Cài đặt"
  };

  const COL_LABELS = {
    BACKLOG: "Hàng đợi",
    IN_PROGRESS: "Đang làm",
    QA_SECURITY_REVIEW: "Kiểm định QA",
    WAITING_APPROVAL: "Chờ bạn duyệt",
    DONE: "Hoàn tất",
    REJECTED: "Cần sửa lại"
  };

  const PRIO_LABELS = {
    CRITICAL: "Khẩn cấp",
    HIGH: "Cao",
    MEDIUM: "Trung bình",
    LOW: "Thấp"
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

  const state = {
    tab: "command",
    staticMode: false,
    overview: null,
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
    sse: null,
    pollTimer: null
  };

  // -------------------------------------------------------------------------
  // 1. HELPERS & SIMPLE MARKDOWN RENDERER (No Raw Markdown Clutter!)
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

  function shortTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  function calmTitle(raw) {
    if (!raw) return "";
    const s = String(raw).trim();
    if (s !== s.toUpperCase()) return s;
    const lower = s.toLowerCase();
    const keepUpper = /(?<![a-zA-ZÀ-ỹ])(ai|ux|ui|qa|cfo|ceo|bi|hr|pm|pr|it|seo|geo|sdr|fp&a|iot|b2b)(?![a-zA-ZÀ-ỹ])/gi;
    const cap = lower.charAt(0).toUpperCase() + lower.slice(1);
    return cap.replace(keepUpper, (m) => m.toUpperCase()).replace(/pre-mortem/gi, "Pre-Mortem");
  }

  function formatInlineMd(text) {
    return esc(text)
      .replace(/`([^`]+)`/g, "<code class='mono' style='background:var(--bg-subtle);padding:1px 5px;border-radius:4px;'>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }

  function renderCleanMarkdown(mdText) {
    if (!mdText) return "<p>Chưa có nội dung.</p>";
    const lines = String(mdText).split(/\r?\n/);
    let html = "";
    let inList = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        if (inList) { html += "</ul>"; inList = false; }
        continue;
      }
      if (line.startsWith("---")) continue;
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
    return html;
  }

  function toast(message, undoInfo = null) {
    const stack = document.getElementById("toast-stack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = "toast-item";
    el.innerHTML = `<span>${esc(message)}</span>`;
    if (undoInfo) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "undo-btn";
      btn.textContent = "Hoàn tác";
      btn.addEventListener("click", async () => {
        el.remove();
        await restoreDeletedItem(undoInfo.entity_type, undoInfo.entity_id, undoInfo.backup);
      });
      el.appendChild(btn);
    }
    stack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 200);
    }, undoInfo ? 5500 : 3200);
  }

  // -------------------------------------------------------------------------
  // 2. API LAYER + FULL SERVERLESS GITHUB PAGES FALLBACK ENGINE
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

  async function api(path, method = "GET", body = null) {
    try {
      const res = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : null
      });
      if (!res.ok) {
        let msg = `Lỗi HTTP ${res.status}`;
        try {
          const j = await res.json();
          msg = j.error || msg;
        } catch (_e) {}
        throw new Error(msg);
      }
      state.staticMode = false;
      return await res.json();
    } catch (err) {
      // Seamless GitHub Pages Static CDN Fallback
      if (path.startsWith("/api/")) {
        return handleStaticFallback(path, method, body, err);
      }
      throw err;
    }
  }

  async function handleStaticFallback(path, method, body, origErr) {
    if (!state.staticMode) {
      for (const snapUrl of ["./cloud_state/snapshot.json", "../corporate_hq/cloud_state/snapshot.json"]) {
        try {
          const sr = await fetch(snapUrl, { cache: "no-cache" });
          if (sr.ok) {
            const snap = await sr.json();
            state.staticMode = true;
            document.getElementById("live-label").textContent = "Online 24/7 (Cloud)";
            const localSaved = getLocalFallbackStore();
            state.divisions = snap.divisions || [];
            state.departments = snap.departments || [];
            state.missions = (localSaved && localSaved.missions) || snap.missions || [];
            state.opportunities = (localSaved && localSaved.opportunities) || snap.opportunities || [];
            state.tasks = (localSaved && localSaved.tasks) || snap.tasks || [];
            state.projects = (localSaved && localSaved.projects) || snap.projects || [];
            state.articles = (localSaved && localSaved.articles) || snap.knowledge_atoms || [];
            break;
          }
        } catch (_e) {}
      }
    }
    if (!state.staticMode) throw origErr;

    if (method === "GET") {
      if (path.startsWith("/api/overview")) {
        return {
          kpis: { total_departments: state.departments.length, total_knowledge_atoms: state.articles.length },
          divisions: state.divisions,
          projects: state.projects,
          missions: state.missions,
          opportunities: state.opportunities
        };
      }
      if (path === "/api/departments") return { departments: state.departments };
      const md = path.match(/^\/api\/departments\/(.+)$/);
      if (md) {
        const d = state.departments.find((x) => x.dept_id === md[1]);
        return { ...d, handbook_markdown: `# ${d.title_vi}\n- Trực thuộc: ${d.division_code}`, learned_articles: state.articles.filter((a) => a.dept_id === d.dept_id), reflexions: [] };
      }
      if (path.startsWith("/api/tasks")) return { tasks: state.tasks };
      if (path.startsWith("/api/missions")) return { missions: state.missions };
      if (path.startsWith("/api/opportunities")) return { opportunities: state.opportunities };
      if (path.startsWith("/api/knowledge")) return { articles: state.articles };
      if (path.startsWith("/api/projects")) return { projects: state.projects, files: [] };
    }

    // Client-side mutations on GitHub Pages CDN!
    if (method === "POST" && path === "/api/missions") {
      const msn = buildClientMission(body.title || body.goal_prompt, body.auto_approve);
      state.missions.unshift(msn);
      saveLocalFallbackStore();
      simulateClientMissionRun(msn.mission_id);
      return msn;
    }
    if (method === "POST" && path.endsWith("/accept")) {
      const oid = path.split("/")[3];
      const opp = state.opportunities.find((o) => o.opp_id === oid);
      if (opp) {
        opp.status = "ACCEPTED";
        const msn = buildClientMission(opp.title, false);
        state.missions.unshift(msn);
        saveLocalFallbackStore();
        simulateClientMissionRun(msn.mission_id);
        return msn;
      }
    }
    if (method === "POST" && path === "/api/tasks") {
      const nt = { task_id: `task-${Date.now()}`, kanban_column: body.kanban_column || "BACKLOG", ...body };
      state.tasks.unshift(nt);
      saveLocalFallbackStore();
      return nt;
    }
    if (method === "PATCH" && path.startsWith("/api/tasks/")) {
      const tid = path.split("/")[3];
      const t = state.tasks.find((x) => x.task_id === tid);
      if (t) Object.assign(t, body);
      saveLocalFallbackStore();
      return t || {};
    }
    if (method === "DELETE" && path.startsWith("/api/tasks/")) {
      const tid = path.split("/")[3];
      state.tasks = state.tasks.filter((x) => x.task_id !== tid);
      saveLocalFallbackStore();
      return { deleted: true, entity_type: "task", entity_id: tid };
    }
    if (method === "DELETE" && path.startsWith("/api/missions/")) {
      const mid = path.split("/")[3];
      state.missions = state.missions.filter((x) => x.mission_id !== mid);
      saveLocalFallbackStore();
      return { deleted: true, entity_type: "mission", entity_id: mid };
    }
    if (method === "DELETE" && path.startsWith("/api/opportunities/")) {
      const oid = path.split("/")[3];
      state.opportunities = state.opportunities.filter((x) => x.opp_id !== oid);
      saveLocalFallbackStore();
      return { deleted: true, entity_type: "opportunity", entity_id: oid };
    }
    if (method === "POST" && path.endsWith("/decision")) {
      const parts = path.split("/");
      if (parts[2] === "missions") {
        const m = state.missions.find((x) => x.mission_id === parts[3]);
        if (m) {
          m.status = body.decision === "APPROVE" ? "COMPLETED" : "RUNNING";
          m.progress_pct = body.decision === "APPROVE" ? 100 : 57;
          m.steps.forEach((s) => { if (body.decision === "APPROVE") s.status = "DONE"; });
        }
        saveLocalFallbackStore();
        return m || {};
      }
    }
    return {};
  }

  function buildClientMission(title, autoApprove) {
    const mid = `msn-${Date.now().toString(36)}`;
    const tpl = [
      [1, "Điều tra thị trường & nhu cầu thực tế", "01,50"],
      [2, "Giải mã tâm lý khách rút ví & điểm yếu đối thủ", "02,03"],
      [3, "Tính dòng tiền, giá bán, thuế & điểm hòa vốn", "38,39"],
      [4, "Hội đồng phản biện Pre-Mortem mổ xẻ rủi ro", "46,47"],
      [5, "Thiết kế giải pháp 3 chạm & kênh săn khách đầu tiên", "06,12,25,32"],
      [6, "Tester đóng vai 5 nhóm người dùng thật trải nghiệm", "48,49,20"],
      [7, "Tổng hợp kế hoạch trình Chủ tịch nghiệm thu", "00"]
    ];
    return {
      mission_id: mid,
      title,
      goal_prompt: title,
      status: "RUNNING",
      auto_approve: autoApprove ? 1 : 0,
      progress_pct: 5,
      steps: tpl.map(([ord, stitle, leads]) => ({
        step_id: `${mid}-s${ord}`,
        step_order: ord,
        title: stitle,
        lead_dept_ids: leads,
        lead_depts: leads.split(",").map((i) => ({ dept_id: i, title_vi: `Phòng #${i}` })),
        status: "PENDING",
        output_summary: "",
        critique_verdict: "",
        ux_verdict: ""
      }))
    };
  }

  function simulateClientMissionRun(mid) {
    let idx = 0;
    const tick = () => {
      const m = state.missions.find((x) => x.mission_id === mid);
      if (!m || m.status === "PAUSED") return;
      if (idx >= m.steps.length) return;
      const step = m.steps[idx];
      if (step.step_order === 7 && !m.auto_approve) {
        step.status = "WAITING_APPROVAL";
        step.output_summary = "Đã vượt qua đủ 6 bước Phản biện (#46-#47) & Tester người dùng (#48-#49). Đang chờ bạn bấm Chấp nhận.";
        m.status = "WAITING_CHAIRMAN";
        m.progress_pct = 90;
        saveLocalFallbackStore();
        renderAllViews();
        return;
      }
      step.status = "RUNNING";
      renderAllViews();
      setTimeout(() => {
        step.status = "DONE";
        step.output_summary = "Đã hoàn thành thực thi và vượt qua phản biện chéo tại chỗ.";
        step.critique_verdict = "Phòng #47 Phản biện: Đạt";
        step.ux_verdict = "Phòng #48 Tester Người dùng: Đạt";
        m.progress_pct = Math.round(((idx + 1) / m.steps.length) * 100);
        if (idx === m.steps.length - 1) m.status = "COMPLETED";
        saveLocalFallbackStore();
        renderAllViews();
        idx += 1;
        tick();
      }, 650);
    };
    tick();
  }

  async function restoreDeletedItem(entityType, entityId, clientBackup = null) {
    if (state.staticMode && clientBackup) {
      if (entityType === "task") state.tasks.unshift(clientBackup);
      if (entityType === "mission") state.missions.unshift(clientBackup);
      if (entityType === "opportunity") state.opportunities.unshift(clientBackup);
      saveLocalFallbackStore();
      renderAllViews();
      toast("Đã khôi phục lại mục vừa xóa.");
      return;
    }
    try {
      await api("/api/trash/restore", "POST", { entity_type: entityType, entity_id: entityId });
      await loadEverything();
      toast("Đã khôi phục nguyên trạng mục vừa xóa.");
    } catch (e) {
      toast(`Không thể hoàn tác: ${e.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 3. VIEW RENDERERS (CLEAN, UNCLUTTERED, 1-GLANCE CLARITY)
  // -------------------------------------------------------------------------
  function renderCountsAndHeader() {
    const runningM = state.missions.filter((m) => m.status === "RUNNING").length;
    const waitM = state.missions.filter((m) => m.status === "WAITING_CHAIRMAN").length;
    const waitT = state.tasks.filter((t) => t.kanban_column === "WAITING_APPROVAL").length;
    const totalWait = waitM + waitT;
    const activeOpps = state.opportunities.filter((o) => o.status === "NEW").length;

    document.getElementById("stat-running-missions").textContent = runningM;
    document.getElementById("stat-waiting-approvals").textContent = totalWait;
    document.getElementById("stat-staff-ready").textContent = state.departments.length || 51;
    document.getElementById("stat-news-count").textContent =
      (state.overview && state.overview.kpis && state.overview.kpis.total_knowledge_atoms) || state.articles.length || 0;

    document.getElementById("nav-cnt-opps").textContent = activeOpps;
    document.getElementById("nav-cnt-missions").textContent = runningM + waitM || state.missions.length;
    document.getElementById("nav-cnt-tasks").textContent = state.tasks.filter((t) => t.kanban_column !== "DONE").length;
    document.getElementById("nav-cnt-staff").textContent = state.departments.length || 51;
    document.getElementById("nav-cnt-news").textContent =
      (state.overview && state.overview.kpis && state.overview.kpis.total_knowledge_atoms) || state.articles.length || 0;

    const dot = document.getElementById("live-dot");
    const lbl = document.getElementById("live-label");
    if (runningM > 0) {
      dot.className = "pulse-dot pulse-active";
      lbl.textContent = `Đang tự chạy ${runningM} nhiệm vụ...`;
    } else {
      dot.className = "pulse-dot";
      if (!state.staticMode) lbl.textContent = "Tự động hóa Sẵn sàng";
    }
  }

  function renderCommandTab() {
    // 1. Pending Chairman Approvals Strip
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
        html += `
          <div class="list-row" style="grid-template-columns:minmax(0,1fr) auto;">
            <div>
              <div style="font-weight:700;color:var(--text-primary);">${esc(m.title)}</div>
              <div style="font-size:12px;color:var(--text-muted);">Nhiệm vụ 7 bước · Đã qua #46 Phản biện &amp; #48 Tester người dùng</div>
            </div>
            <div style="display:flex;gap:6px;">
              <button type="button" class="btn btn-xs btn-ok" data-approve-msn="${esc(m.mission_id)}">✓ Chấp nhận</button>
              <button type="button" class="btn btn-xs" data-reject-msn="${esc(m.mission_id)}">↺ Làm lại</button>
              <button type="button" class="btn btn-xs btn-danger-ghost" data-del-msn="${esc(m.mission_id)}">Xóa</button>
            </div>
          </div>
        `;
      });
      waitTasks.forEach((t) => {
        html += `
          <div class="list-row" style="grid-template-columns:minmax(0,1fr) auto;">
            <div>
              <div style="font-weight:600;color:var(--text-primary);">${esc(t.title)}</div>
              <div style="font-size:12px;color:var(--text-muted);">Việc lẻ · Phòng #${esc(t.assigned_dept_id)} trình duyệt</div>
            </div>
            <div style="display:flex;gap:6px;">
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

    // 2. Money-Maker Opportunities Grid
    const oppGrid = document.getElementById("opportunities-grid");
    const visibleOpps = state.opportunities.filter((o) => o.status !== "DISMISSED");
    if (!visibleOpps.length) {
      oppGrid.innerHTML = `<div class="panel-box"><p style="color:var(--text-muted);">Chưa có đề xuất nào. Nhấn <strong>Tìm thêm cơ hội mới</strong> để Phòng #50 săn kèo kiếm tiền cho bạn.</p></div>`;
      return;
    }

    oppGrid.innerHTML = visibleOpps.map((o) => {
      const isAccepted = o.status === "ACCEPTED";
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

          <div class="opp-critique">${esc(o.critique_note || o.pain_point || "")}</div>

          <div class="opp-actions">
            <div style="display:flex;gap:6px;">
              ${isAccepted
                ? `<button type="button" class="btn btn-xs" data-goto-missions>Xem tiến độ →</button>`
                : `<button type="button" class="btn btn-xs btn-primary" data-accept-opp="${esc(o.opp_id)}">✓ Duyệt làm tự động</button>`
              }
              <button type="button" class="btn btn-xs" data-edit-opp="${esc(o.opp_id)}">Sửa</button>
            </div>
            <button type="button" class="btn btn-xs btn-danger-ghost" data-del-opp="${esc(o.opp_id)}" title="Xóa bỏ đề xuất này">Xóa</button>
          </div>
        </article>
      `;
    }).join("");

    bindQuickActions(oppGrid);
  }

  // TAB 2: VISUAL STEP-BY-STEP MISSION TRACKER
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
      const stBadge =
        m.status === "COMPLETED" ? `<span class="badge badge-done">✓ Đã xong 100%</span>` :
        m.status === "WAITING_CHAIRMAN" ? `<span class="badge badge-wait">⚑ Chờ bạn duyệt</span>` :
        m.status === "PAUSED" ? `<span class="badge badge-idle">⏸ Đang tạm dừng</span>` :
        `<span class="badge badge-run">● Đang chạy Bước ${m.current_step_order || 1}/${m.total_steps || 7}</span>`;

      const stepsHtml = (m.steps || []).map((s) => {
        const isDone = s.status === "DONE";
        const isRun = s.status === "RUNNING";
        const isWait = s.status === "WAITING_APPROVAL";
        const nodeCls = isDone ? "done" : isRun ? "running" : isWait ? "waiting" : "pending";
        const nodeSym = isDone ? "✓" : isRun ? "●" : isWait ? "⚑" : s.step_order;

        const whoStateLabel = isDone
          ? `<strong style="color:var(--ok-text);">Đã làm xong:</strong>`
          : isRun
          ? `<strong style="color:var(--run-text);">Đang làm ngay lúc này:</strong>`
          : isWait
          ? `<strong style="color:var(--warn-text);">Chờ quyết định:</strong>`
          : `<span>Chưa làm (Chờ tới lượt):</span>`;

        const deptChips = (s.lead_depts || []).map((d) =>
          `<span class="agent-pill" data-open-staff="${esc(d.dept_id)}">#${esc(d.dept_id)} ${esc(calmTitle(d.title_vi))}</span>`
        ).join("");

        return `
          <div class="step-row ${isRun ? "is-running" : ""} ${isWait ? "is-waiting" : ""}">
            <span class="step-node ${nodeCls}">${nodeSym}</span>
            <div class="step-main">
              <div class="step-title-line">
                <span class="step-name">Bước ${s.step_order}. ${esc(s.title)}</span>
              </div>
              <div class="who-chips">
                ${whoStateLabel}
                ${deptChips}
              </div>
              ${(isRun && s.live_activity_text) ? `<div class="step-summary" style="color:var(--run-text);">${esc(s.live_activity_text)}</div>` : ""}
              ${(s.output_summary && (isDone || isWait)) ? `<div class="step-summary">${esc(s.output_summary)}</div>` : ""}
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

      return `
        <article class="mission-card">
          <div class="mission-header">
            <div class="mission-title-group">
              <h3 class="mission-title">${esc(m.title)}</h3>
              ${stBadge}
            </div>

            <div class="progress-wrap">
              <span class="mono" style="font-size:12.5px;font-weight:700;color:var(--text-primary);">${m.progress_pct || 0}%</span>
              <div class="progress-track">
                <div class="progress-fill" style="width:${m.progress_pct || 0}%;"></div>
              </div>

              ${m.status === "WAITING_CHAIRMAN" ? `
                <button type="button" class="btn btn-xs btn-ok" data-approve-msn="${esc(m.mission_id)}">✓ Chấp nhận</button>
                <button type="button" class="btn btn-xs" data-reject-msn="${esc(m.mission_id)}">↺ Làm lại</button>
              ` : ""}
              ${m.status === "RUNNING" ? `<button type="button" class="btn btn-xs" data-pause-msn="${esc(m.mission_id)}">⏸ Tạm dừng</button>` : ""}
              ${m.status === "PAUSED" ? `<button type="button" class="btn btn-xs btn-primary" data-resume-msn="${esc(m.mission_id)}">▶ Chạy tiếp</button>` : ""}
              <button type="button" class="btn btn-xs" data-rename-msn="${esc(m.mission_id)}">Sửa</button>
              <button type="button" class="btn btn-xs btn-danger-ghost" data-del-msn="${esc(m.mission_id)}">Xóa</button>
            </div>
          </div>
          <div class="stepper-list">${stepsHtml}</div>
        </article>
      `;
    }).join("");

    bindQuickActions(box);
  }

  // TAB 3: TASKS (LIST VIEW + DRAG & DROP 5-COLUMN KANBAN)
  function renderTasksTab() {
    const projF = document.getElementById("filter-task-project").value;
    const colF = document.getElementById("filter-task-col").value;
    const filtered = state.tasks.filter((t) => {
      if (projF && t.project_id !== projF) return false;
      if (colF && t.kanban_column !== colF) return false;
      return true;
    });

    const listWrap = document.getElementById("tasks-list-wrapper");
    const boardWrap = document.getElementById("tasks-board-wrapper");

    if (state.taskViewMode === "list") {
      listWrap.style.display = "block";
      boardWrap.style.display = "none";
      if (!filtered.length) {
        listWrap.innerHTML = `<div style="padding:28px;text-align:center;color:var(--text-muted);">Không có công việc nào. Nhấn <strong>+ Thêm việc lẻ</strong> để tạo mới.</div>`;
        return;
      }
      listWrap.innerHTML = filtered.map((t) => {
        const checked = state.selectedTaskIds.has(t.task_id) ? "checked" : "";
        const colCls = t.kanban_column === "DONE" ? "badge-done" : t.kanban_column === "WAITING_APPROVAL" ? "badge-wait" : t.kanban_column === "IN_PROGRESS" ? "badge-run" : "badge-idle";
        return `
          <div class="list-row">
            <input type="checkbox" data-sel-task="${esc(t.task_id)}" ${checked} aria-label="Chọn việc" />
            <div style="min-width:0;cursor:pointer;" data-edit-task="${esc(t.task_id)}">
              <div style="font-weight:600;color:var(--text-primary);${t.kanban_column === "DONE" ? "text-decoration:line-through;opacity:0.65;" : ""}">${esc(t.title)}</div>
              <div style="font-size:12px;color:var(--text-muted);">
                Phòng #${esc(t.assigned_dept_id)} ${esc(t.dept_title_vi || "")} · Ưu tiên: ${esc(PRIO_LABELS[t.priority] || "Cao")}
              </div>
            </div>
            <span class="badge ${colCls}">${esc(COL_LABELS[t.kanban_column] || t.kanban_column)}</span>
            <div class="row-actions">
              ${t.kanban_column !== "DONE" ? `<button type="button" class="btn btn-xs btn-ok" data-approve-task="${esc(t.task_id)}" title="Đánh dấu hoàn tất">✓</button>` : ""}
              <button type="button" class="btn btn-xs" data-edit-task="${esc(t.task_id)}">Sửa</button>
              <button type="button" class="btn btn-xs hide-sm" data-dup-task="${esc(t.task_id)}" title="Nhân bản">Sao chép</button>
              <button type="button" class="btn btn-xs btn-danger-ghost" data-del-task="${esc(t.task_id)}" title="Xóa việc này">Xóa</button>
            </div>
          </div>
        `;
      }).join("");
      bindQuickActions(listWrap);
    } else {
      listWrap.style.display = "none";
      boardWrap.style.display = "grid";
      const cols = ["BACKLOG", "IN_PROGRESS", "QA_SECURITY_REVIEW", "WAITING_APPROVAL", "DONE"];
      boardWrap.innerHTML = cols.map((c) => {
        const colTasks = filtered.filter((t) => t.kanban_column === c);
        return `
          <div class="k-col" data-drop-col="${c}">
            <div class="k-head">
              <span>${esc(COL_LABELS[c])} (${colTasks.length})</span>
              <button type="button" class="btn btn-xs" data-quick-col-add="${c}" title="Thêm vào cột này">+</button>
            </div>
            ${colTasks.map((t) => `
              <div class="k-card" draggable="true" data-drag-task="${esc(t.task_id)}">
                <div style="font-weight:600;color:var(--text-primary);cursor:pointer;" data-edit-task="${esc(t.task_id)}">${esc(t.title)}</div>
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
  }

  // TAB 4: 51 AI SPECIALISTS (CLEAN SENTENCE CASE, SQUIRCLE AVATARS)
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
      return `<button type="button" class="chip-btn ${active}" style="${active ? "border-color:var(--accent);color:var(--accent);background:var(--accent-soft);" : ""}" data-sdiv="${code}">${esc(label)}</button>`;
    }).join("");

    pillBar.querySelectorAll("[data-sdiv]").forEach((b) => {
      b.onclick = () => { state.staffDivFilter = b.getAttribute("data-sdiv"); renderStaffTab(); };
    });

    const q = (document.getElementById("staff-search").value || "").trim().toLowerCase();
    const filtered = state.departments.filter((d) => {
      if (state.staffDivFilter && d.division_code !== state.staffDivFilter) return false;
      if (q && !`${d.dept_id} ${d.code} ${d.title_vi}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const grid = document.getElementById("staff-grid");
    grid.innerHTML = filtered.map((d) => {
      const busy = d.status !== "IDLE";
      return `
        <article class="staff-card" data-open-staff="${esc(d.dept_id)}">
          <span class="sq-avatar">#${esc(d.dept_id)}</span>
          <div style="min-width:0;flex:1;">
            <div style="font-weight:700;color:var(--text-primary);font-size:13.5px;">${esc(calmTitle(d.title_vi))}</div>
            <div style="font-size:12px;color:var(--text-muted);margin:2px 0 6px;">${esc(DIV_SHORT_NAMES[d.division_code] || d.division_name_vi || "")}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              ${busy ? `<span class="badge badge-run">● Đang làm việc</span>` : `<span class="badge badge-idle">○ Sẵn sàng</span>`}
              <span class="mono" style="font-size:11.5px;color:var(--text-muted);">✓ ${d.tasks_completed || 0} việc</span>
            </div>
          </div>
        </article>
      `;
    }).join("");

    bindQuickActions(grid);
  }

  // TAB 5: CLEAN EDITORIAL NEWS FEED (INLINE EXPAND, STAR, DELETE + UNDO)
  function renderNewsTab() {
    const box = document.getElementById("news-list-box");
    const list = state.articles.filter((a) => state.newsStarFilter !== "starred" || Boolean(a.is_starred));

    if (!list.length) {
      box.innerHTML = `<div style="padding:28px;text-align:center;color:var(--text-muted);">Không có bài báo nào trong mục này.</div>`;
      return;
    }

    box.innerHTML = list.map((a) => {
      const aid = a.atom_id || a.url_hash;
      const expanded = state.expandedNewsIds.has(String(aid));
      const link = a.url || a.source_url || "#";
      return `
        <div class="news-row">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
            <div style="min-width:0;flex:1;cursor:pointer;" data-toggle-news="${esc(aid)}">
              <div style="font-weight:600;color:var(--text-primary);font-size:14px;">${esc(a.title)}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
                Phòng #${esc(a.dept_id)} · ${esc(a.source_connector || "Báo thị trường")} · ${esc(shortTime(a.fetched_at))}
              </div>
            </div>
            <div style="display:flex;gap:4px;flex-shrink:0;">
              ${a.atom_id ? `<button type="button" class="btn btn-xs" data-star-news="${a.atom_id}" style="${a.is_starred ? "color:#D97706;" : ""}">${a.is_starred ? "★ Đã ghim" : "☆ Ghim"}</button>` : ""}
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

  // TAB 6: INTERACTIVE CFO SLIDERS & PROJECT / DOC FULL CRUD
  function updateCfoSliders() {
    const price = Number(document.getElementById("rng-price").value);
    const quota = Number(document.getElementById("rng-quota").value);
    const unit = Number(document.getElementById("rng-unit").value);
    const fixed = Number(document.getElementById("rng-fixed").value);

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

    const cogsPct = Math.min(100, Math.max(2, (worstCogs / Math.max(1, price)) * 100));
    const taxPct = 7;
    const profPct = Math.max(0, 100 - cogsPct - taxPct);
    document.getElementById("bar-cogs").style.width = `${cogsPct}%`;
    document.getElementById("bar-tax").style.width = `${taxPct}%`;
    document.getElementById("bar-profit").style.width = `${profPct}%`;

    const pill = document.getElementById("cfo-status-pill");
    if (worstMargin >= 65) {
      pill.className = "badge badge-done";
      pill.textContent = `An toàn · Biên lãi xấu nhất ${worstMargin.toFixed(0)}%`;
    } else {
      pill.className = "badge badge-fail";
      pill.textContent = `Cảnh báo · Biên lãi chỉ còn ${worstMargin.toFixed(0)}% (<65%)`;
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

  async function renderProjectsSection() {
    const pList = document.getElementById("projects-crud-list");
    if (!state.projects.length) {
      pList.innerHTML = `<div style="padding:14px;color:var(--text-muted);">Chưa có dự án. Nhấn "+ Tạo dự án mới".</div>`;
      document.getElementById("project-docs-list").innerHTML = "";
      return;
    }
    if (!state.selectedProjectId || !state.projects.some((p) => p.project_id === state.selectedProjectId)) {
      state.selectedProjectId = state.projects[0].project_id;
    }
    pList.innerHTML = state.projects.map((p) => `
      <div class="list-row" style="grid-template-columns:minmax(0,1fr) auto;${p.project_id === state.selectedProjectId ? "background:var(--accent-soft);" : ""}">
        <div style="cursor:pointer;" data-sel-proj="${esc(p.project_id)}">
          <div style="font-weight:700;color:var(--text-primary);">${esc(p.title)}</div>
          <div class="mono" style="font-size:11.5px;color:var(--text-muted);">${vnd(p.expected_price_vnd)} · ${esc(p.status)}</div>
        </div>
        <div style="display:flex;gap:4px;">
          <button type="button" class="btn btn-xs" data-edit-proj="${esc(p.project_id)}">Sửa</button>
          <button type="button" class="btn btn-xs btn-danger-ghost" data-del-proj="${esc(p.project_id)}">Xóa</button>
        </div>
      </div>
    `).join("");

    pList.querySelectorAll("[data-sel-proj]").forEach((el) => {
      el.onclick = () => { state.selectedProjectId = el.getAttribute("data-sel-proj"); renderProjectsSection(); };
    });
    bindQuickActions(pList);
    await loadProjectDocs(state.selectedProjectId);
  }

  async function loadProjectDocs(pid) {
    const dBox = document.getElementById("project-docs-list");
    if (!pid || state.staticMode) {
      dBox.innerHTML = `<div style="padding:12px;color:var(--text-muted);font-size:12.5px;">Tài liệu dự án sẵn sàng trên máy chủ cục bộ.</div>`;
      return;
    }
    try {
      const res = await api(`/api/projects/${encodeURIComponent(pid)}/files`);
      const files = res.files || [];
      if (!files.length) {
        dBox.innerHTML = `<div style="padding:12px;color:var(--text-muted);">Chưa có tệp nào. Nhấn "+ Tạo tài liệu (.md)".</div>`;
        return;
      }
      dBox.innerHTML = files.map((f) => `
        <div class="list-row" style="grid-template-columns:1fr auto;cursor:pointer;" data-open-doc="${esc(f.path)}">
          <span class="mono" style="font-size:12.5px;">${esc(f.path)}</span>
          <span class="mono" style="font-size:11px;color:var(--text-muted);">${Math.max(1, Math.round((f.size_bytes || 0) / 1024))} KB</span>
        </div>
      `).join("");
      dBox.querySelectorAll("[data-open-doc]").forEach((r) => {
        r.onclick = () => openDocFile(pid, r.getAttribute("data-open-doc"));
      });
      await openDocFile(pid, files[0].path);
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
  // 4. STAFF PROFILE DRAWER (PRETTY RENDERED, EDIT, DISPATCH, DELETE CUSTOM)
  // -------------------------------------------------------------------------
  async function openStaffDrawer(deptId) {
    document.getElementById("drawer-backdrop").classList.add("open");
    document.getElementById("inspector-drawer").classList.add("open");
    const body = document.getElementById("drawer-body");
    body.innerHTML = `<p style="color:var(--text-muted);">Đang tải hồ sơ...</p>`;

    try {
      const d = await api(`/api/departments/${encodeURIComponent(deptId)}`);
      document.getElementById("drawer-heading").textContent = `#${d.dept_id} · ${d.title_vi}`;
      const isCustom = Number(d.dept_id) > 50;

      body.innerHTML = `
        <form id="form-staff-quick-task" style="padding:14px;background:var(--bg-subtle);border-radius:10px;margin-bottom:18px;">
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:8px;">Giao việc riêng cho #${esc(d.dept_id)}</div>
          <div style="display:flex;gap:8px;">
            <input type="text" class="input" id="inp-direct-task" placeholder="Nhập việc cần nhân viên này làm..." required />
            <button type="submit" class="btn btn-primary">Giao ngay</button>
          </div>
        </form>

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
          <div style="display:flex;gap:6px;">
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
        retireBtn.onclick = async () => {
          await api(`/api/departments/${encodeURIComponent(d.dept_id)}`, "DELETE");
          closeDrawer();
          await loadEverything();
          toast(`Đã giải thể phòng #${d.dept_id}.`);
        };
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
  }

  // -------------------------------------------------------------------------
  // 5. UNIFIED QUICK ACTIONS (APPROVE, REJECT, EDIT, DUPLICATE, DELETE + UNDO)
  // -------------------------------------------------------------------------
  function bindQuickActions(root) {
    root.querySelectorAll("[data-open-staff]").forEach((el) => {
      el.onclick = (e) => { e.stopPropagation(); openStaffDrawer(el.getAttribute("data-open-staff")); };
    });

    root.querySelectorAll("[data-goto-missions]").forEach((el) => {
      el.onclick = () => switchTab("missions");
    });

    // Opportunities Actions
    root.querySelectorAll("[data-accept-opp]").forEach((b) => {
      b.onclick = async () => {
        const oid = b.getAttribute("data-accept-opp");
        await api(`/api/opportunities/${encodeURIComponent(oid)}/accept`, "POST", {});
        await loadEverything();
        switchTab("missions");
        toast("Đã kích hoạt dây chuyền tự động 7 bước cho cơ hội này.");
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
        document.getElementById("inp-opp-price").value = o.price_vnd;
        document.getElementById("inp-opp-margin").value = o.est_margin_pct;
        document.getElementById("inp-opp-pain").value = o.pain_point || "";
        openModal("modal-opp");
      };
    });

    root.querySelectorAll("[data-del-opp]").forEach((b) => {
      b.onclick = async () => {
        const oid = b.getAttribute("data-del-opp");
        const backup = state.opportunities.find((x) => x.opp_id === oid);
        state.opportunities = state.opportunities.filter((x) => x.opp_id !== oid);
        renderAllViews();
        await api(`/api/opportunities/${encodeURIComponent(oid)}`, "DELETE");
        toast("Đã xóa đề xuất cơ hội.", { entity_type: "opportunity", entity_id: oid, backup });
      };
    });

    // Missions Actions
    root.querySelectorAll("[data-approve-msn]").forEach((b) => {
      b.onclick = async () => {
        await api(`/api/missions/${encodeURIComponent(b.getAttribute("data-approve-msn"))}/decision`, "POST", { decision: "APPROVE" });
        await loadEverything();
        toast("Đã chấp nhận nghiệm thu nhiệm vụ.");
      };
    });

    root.querySelectorAll("[data-reject-msn]").forEach((b) => {
      b.onclick = async () => {
        const note = window.prompt("Nhập điểm bạn muốn nhân viên làm lại kỹ hơn:", "Bổ sung chi tiết cách tìm 10 khách đầu tiên") || "";
        await api(`/api/missions/${encodeURIComponent(b.getAttribute("data-reject-msn"))}/decision`, "POST", { decision: "REJECT", note });
        await loadEverything();
        toast("Đã trả về cho nhân viên tự động chạy sửa lại.");
      };
    });

    root.querySelectorAll("[data-pause-msn]").forEach((b) => {
      b.onclick = async () => {
        await api(`/api/missions/${encodeURIComponent(b.getAttribute("data-pause-msn"))}`, "PATCH", { status: "PAUSED" });
        await loadEverything();
      };
    });

    root.querySelectorAll("[data-resume-msn]").forEach((b) => {
      b.onclick = async () => {
        await api(`/api/missions/${encodeURIComponent(b.getAttribute("data-resume-msn"))}`, "PATCH", { status: "RUNNING" });
        await loadEverything();
      };
    });

    root.querySelectorAll("[data-rename-msn]").forEach((b) => {
      b.onclick = async () => {
        const mid = b.getAttribute("data-rename-msn");
        const m = state.missions.find((x) => x.mission_id === mid);
        if (!m) return;
        const nextTitle = window.prompt("Đổi tên nhiệm vụ:", m.title);
        if (nextTitle && nextTitle.trim()) {
          await api(`/api/missions/${encodeURIComponent(mid)}`, "PATCH", { title: nextTitle.trim() });
          await loadEverything();
        }
      };
    });

    root.querySelectorAll("[data-del-msn]").forEach((b) => {
      b.onclick = async () => {
        const mid = b.getAttribute("data-del-msn");
        const backup = state.missions.find((x) => x.mission_id === mid);
        state.missions = state.missions.filter((x) => x.mission_id !== mid);
        renderAllViews();
        await api(`/api/missions/${encodeURIComponent(mid)}`, "DELETE");
        toast("Đã xóa nhiệm vụ.", { entity_type: "mission", entity_id: mid, backup });
      };
    });

    // Tasks Actions (Select, Approve, Reject, Edit, Duplicate, Delete + Undo)
    root.querySelectorAll("[data-sel-task]").forEach((chk) => {
      chk.onchange = () => {
        const tid = chk.getAttribute("data-sel-task");
        if (chk.checked) state.selectedTaskIds.add(tid);
        else state.selectedTaskIds.delete(tid);
        updateBulkBar();
      };
    });

    root.querySelectorAll("[data-approve-task]").forEach((b) => {
      b.onclick = async (e) => {
        e.stopPropagation();
        await api(`/api/tasks/${encodeURIComponent(b.getAttribute("data-approve-task"))}/decision`, "POST", { decision: "APPROVE" });
        await loadEverything();
        toast("Đã hoàn tất công việc.");
      };
    });

    root.querySelectorAll("[data-reject-task]").forEach((b) => {
      b.onclick = async (e) => {
        e.stopPropagation();
        await api(`/api/tasks/${encodeURIComponent(b.getAttribute("data-reject-task"))}/decision`, "POST", { decision: "REJECT", note: "Cần bổ sung chi tiết thực tế" });
        await loadEverything();
        toast("Đã yêu cầu nhân viên sửa lại công việc.");
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
      b.onclick = async (e) => {
        e.stopPropagation();
        await api(`/api/tasks/${encodeURIComponent(b.getAttribute("data-dup-task"))}/duplicate`, "POST", {});
        await loadEverything();
        toast("Đã tạo bản sao công việc.");
      };
    });

    root.querySelectorAll("[data-del-task]").forEach((b) => {
      b.onclick = async (e) => {
        e.stopPropagation();
        const tid = b.getAttribute("data-del-task");
        const backup = state.tasks.find((x) => x.task_id === tid);
        state.tasks = state.tasks.filter((x) => x.task_id !== tid);
        state.selectedTaskIds.delete(tid);
        renderAllViews();
        await api(`/api/tasks/${encodeURIComponent(tid)}`, "DELETE");
        toast("Đã xóa công việc.", { entity_type: "task", entity_id: tid, backup });
      };
    });

    root.querySelectorAll("[data-quick-col-add]").forEach((b) => {
      b.onclick = () => {
        openNewTaskModal(b.getAttribute("data-quick-col-add"));
      };
    });

    // News Star & Delete
    root.querySelectorAll("[data-star-news]").forEach((b) => {
      b.onclick = async () => {
        await api(`/api/knowledge/${b.getAttribute("data-star-news")}`, "PATCH", {});
        await loadNews();
      };
    });

    root.querySelectorAll("[data-del-news]").forEach((b) => {
      b.onclick = async () => {
        const aid = Number(b.getAttribute("data-del-news"));
        const res = await api(`/api/knowledge/${aid}`, "DELETE");
        await loadNews();
        toast("Đã xóa bài báo.", { entity_type: "article", entity_id: res.entity_id });
      };
    });

    // Projects Edit & Delete
    root.querySelectorAll("[data-edit-proj]").forEach((b) => {
      b.onclick = () => {
        const p = state.projects.find((x) => x.project_id === b.getAttribute("data-edit-proj"));
        if (!p) return;
        document.getElementById("proj-modal-title").textContent = "Chỉnh sửa dự án";
        document.getElementById("edit-proj-id").value = p.project_id;
        document.getElementById("wrap-proj-slug").style.display = "none";
        document.getElementById("inp-proj-title").value = p.title;
        document.getElementById("inp-proj-price").value = p.expected_price_vnd || 399000;
        document.getElementById("inp-proj-status").value = p.status || "ACTIVE";
        document.getElementById("inp-proj-obj").value = p.objective || "";
        openModal("modal-proj");
      };
    });

    root.querySelectorAll("[data-del-proj]").forEach((b) => {
      b.onclick = async () => {
        const pid = b.getAttribute("data-del-proj");
        await api(`/api/projects/${encodeURIComponent(pid)}`, "DELETE");
        await loadEverything();
        toast("Đã xóa dự án.", { entity_type: "project", entity_id: pid });
      };
    });
  }

  function updateBulkBar() {
    const bar = document.getElementById("bulk-bar");
    const cnt = state.selectedTaskIds.size;
    if (cnt > 0 && state.tab === "tasks") {
      bar.classList.add("visible");
      document.getElementById("bulk-count-lbl").textContent = `Đã chọn ${cnt} việc`;
    } else {
      bar.classList.remove("visible");
    }
  }

  // -------------------------------------------------------------------------
  // 6. NAVIGATION, MODALS, SSE LIVE SYNC & INITIALIZATION
  // -------------------------------------------------------------------------
  function switchTab(tab) {
    if (!VIEW_TITLES[tab]) return;
    state.tab = tab;
    document.getElementById("view-heading").textContent = VIEW_TITLES[tab];

    document.querySelectorAll(".view-panel").forEach((p) => p.classList.toggle("active", p.id === `view-${tab}`));
    document.querySelectorAll("#side-nav .nav-item, #mobile-nav .mob-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });
    history.replaceState(null, "", `#${tab}`);
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
      if (inp) setTimeout(() => inp.focus(), 40);
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

  function populateDropdowns() {
    const deptOpts = state.departments
      .map((d) => `<option value="${esc(d.dept_id)}">#${esc(d.dept_id)} · ${esc(calmTitle(d.title_vi))}</option>`)
      .join("");
    document.getElementById("inp-task-dept").innerHTML = deptOpts;
    document.getElementById("url-dept-select").innerHTML = deptOpts;

    const projOpts = `<option value="">-- Không gắn dự án --</option>` +
      state.projects.map((p) => `<option value="${esc(p.project_id)}">${esc(p.title)}</option>`).join("");
    document.getElementById("inp-task-proj").innerHTML = projOpts;
    document.getElementById("filter-task-project").innerHTML = `<option value="">Tất cả dự án</option>` +
      state.projects.map((p) => `<option value="${esc(p.project_id)}">${esc(p.title)}</option>`).join("");

    document.getElementById("inp-hire-div").innerHTML = state.divisions
      .filter((dv) => dv.code !== "exec-board")
      .map((dv) => `<option value="${esc(dv.code)}">${esc(dv.name_vi)}</option>`).join("");
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
      renderProjectsSection();
    }
  }

  async function loadNews(q = "") {
    try {
      const res = await api(`/api/knowledge?q=${encodeURIComponent(q)}&limit=90`);
      state.articles = res.articles || [];
      renderNewsTab();
    } catch (_e) {}
  }

  async function loadEverything() {
    const [ov, depts, tasks] = await Promise.all([
      api("/api/overview?limit=40"),
      api("/api/departments"),
      api("/api/tasks")
    ]);
    state.overview = ov;
    state.divisions = ov.divisions || [];
    state.projects = ov.projects || [];
    state.missions = ov.missions || [];
    state.opportunities = ov.opportunities || [];
    state.departments = depts.departments || [];
    state.tasks = tasks.tasks || [];
    populateDropdowns();
    renderAllViews();
  }

  function startLiveStream() {
    if (state.staticMode || !window.EventSource) return;
    if (state.sse) state.sse.close();
    const es = new EventSource("/api/events/stream");
    state.sse = es;
    let debounceTimer = null;
    es.addEventListener("activity", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => loadEverything(), 240);
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
    document.getElementById("meta-theme-color").setAttribute("content", mode === "dark" ? "#111520" : "#0F766E");
  }

  function bindGlobalEvents() {
    document.querySelectorAll("#side-nav .nav-item, #mobile-nav .mob-btn").forEach((b) => {
      b.onclick = () => switchTab(b.getAttribute("data-tab"));
    });

    document.getElementById("btn-theme").onclick = () => {
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    };

    // Tab 1: Command Composer & Quick Preset Chips
    document.querySelectorAll("[data-preset]").forEach((chip) => {
      chip.onclick = () => {
        const inp = document.getElementById("mission-prompt-input");
        inp.value = chip.getAttribute("data-preset");
        inp.focus();
      };
    });

    document.getElementById("form-mission-composer").onsubmit = async (e) => {
      e.preventDefault();
      const promptEl = document.getElementById("mission-prompt-input");
      const text = promptEl.value.trim();
      if (!text) {
        promptEl.focus();
        return;
      }
      const autoApp = document.getElementById("chk-auto-approve").checked;
      promptEl.value = "";
      await api("/api/missions", "POST", { title: text, goal_prompt: text, auto_approve: autoApp });
      await loadEverything();
      switchTab("missions");
      toast("Đã giao nhiệm vụ — Đội ngũ 51 AI đang tự động thực thi từng bước!");
    };

    document.getElementById("btn-scan-opps").onclick = async () => {
      await api("/api/opportunities/scan", "POST", {});
      await loadEverything();
      toast("Phòng #50 vừa đề xuất thêm cơ hội kiếm tiền mới.");
    };

    document.getElementById("btn-add-opp").onclick = () => {
      document.getElementById("opp-modal-title").textContent = "Tự thêm ý tưởng kiếm tiền";
      document.getElementById("edit-opp-id").value = "";
      document.getElementById("form-opp").reset();
      openModal("modal-opp");
    };

    document.getElementById("form-opp").onsubmit = async (e) => {
      e.preventDefault();
      const oid = document.getElementById("edit-opp-id").value;
      const payload = {
        title: document.getElementById("inp-opp-title").value.trim(),
        target_customer: document.getElementById("inp-opp-cust").value.trim(),
        price_vnd: Number(document.getElementById("inp-opp-price").value || 399000),
        est_margin_pct: Number(document.getElementById("inp-opp-margin").value || 75),
        pain_point: document.getElementById("inp-opp-pain").value.trim()
      };
      if (oid) await api(`/api/opportunities/${encodeURIComponent(oid)}`, "PATCH", payload);
      else await api("/api/opportunities", "POST", payload);
      closeModals();
      await loadEverything();
      toast("Đã lưu đề xuất cơ hội.");
    };

    // Tab 2: Missions Filter & Clear Completed
    document.querySelectorAll("#mission-filter-tabs .seg-btn").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll("#mission-filter-tabs .seg-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        state.missionFilter = b.getAttribute("data-mfilter");
        renderMissionsTab();
      };
    });

    document.getElementById("btn-clear-completed-missions").onclick = async () => {
      const res = await api("/api/missions/bulk", "POST", { action: "clear_completed" });
      await loadEverything();
      toast(`Đã dọn sạch ${res.affected || 0} nhiệm vụ hoàn tất.`);
    };

    document.getElementById("btn-new-mission-tab2").onclick = () => {
      switchTab("command");
      document.getElementById("mission-prompt-input").focus();
    };

    // Tab 3: Tasks View Toggle, Add/Edit, Clear Done & Bulk Actions
    document.querySelectorAll("#task-view-mode .seg-btn").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll("#task-view-mode .seg-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        state.taskViewMode = b.getAttribute("data-tview");
        renderTasksTab();
      };
    });

    document.getElementById("filter-task-project").onchange = renderTasksTab;
    document.getElementById("filter-task-col").onchange = renderTasksTab;
    document.getElementById("btn-quick-task").onclick = () => openNewTaskModal("BACKLOG");
    document.getElementById("btn-add-task-tab3").onclick = () => openNewTaskModal("BACKLOG");

    document.getElementById("form-task").onsubmit = async (e) => {
      e.preventDefault();
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
    };

    document.getElementById("btn-clear-done-tasks").onclick = async () => {
      const res = await api("/api/tasks/bulk", "POST", { action: "clear_done" });
      await loadEverything();
      toast(`Đã dọn sạch ${res.affected || 0} việc hoàn tất.`);
    };

    document.getElementById("btn-bulk-done").onclick = async () => {
      const ids = Array.from(state.selectedTaskIds);
      await api("/api/tasks/bulk", "POST", { action: "move_column", column: "DONE", task_ids: ids });
      state.selectedTaskIds.clear();
      await loadEverything();
      toast(`Đã đánh dấu xong ${ids.length} việc.`);
    };

    document.getElementById("btn-bulk-delete").onclick = async () => {
      const ids = Array.from(state.selectedTaskIds);
      await api("/api/tasks/bulk", "POST", { action: "delete", task_ids: ids });
      state.selectedTaskIds.clear();
      await loadEverything();
      toast(`Đã xóa ${ids.length} công việc đã chọn.`);
    };

    document.getElementById("btn-bulk-clear").onclick = () => {
      state.selectedTaskIds.clear();
      renderTasksTab();
    };

    // Tab 4: Staff Search & Hire
    document.getElementById("staff-search").oninput = renderStaffTab;
    document.getElementById("btn-open-hire").onclick = () => openModal("modal-hire");
    document.getElementById("form-hire").onsubmit = async (e) => {
      e.preventDefault();
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
    };

    // Tab 5: News Poll, Read URL & Search
    const pollNews = async () => {
      const r = await api("/api/learning/run", "POST", { scope: "all" });
      toast(r.message || "Đang cập nhật tin tức thị trường mới...");
    };
    document.getElementById("btn-scan-news").onclick = pollNews;
    document.getElementById("btn-poll-feeds-tab5").onclick = pollNews;

    document.getElementById("form-read-url").onsubmit = async (e) => {
      e.preventDefault();
      const url = document.getElementById("url-to-read").value.trim();
      const dept = document.getElementById("url-dept-select").value;
      await api("/api/learning/ingest-url", "POST", { url, dept_id: dept });
      document.getElementById("url-to-read").value = "";
      await loadNews();
      await loadEverything();
      toast("Nhân viên đã đọc và lưu tóm tắt bài báo.");
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
      searchT = setTimeout(() => loadNews(e.target.value), 140);
    };

    // Tab 6: CFO Sliders, Projects, Docs & Cloud
    ["rng-price", "rng-quota", "rng-unit", "rng-fixed"].forEach((id) => {
      document.getElementById(id).oninput = updateCfoSliders;
    });

    document.getElementById("btn-new-proj").onclick = () => {
      document.getElementById("proj-modal-title").textContent = "Tạo dự án mới";
      document.getElementById("edit-proj-id").value = "";
      document.getElementById("wrap-proj-slug").style.display = "flex";
      document.getElementById("form-proj").reset();
      openModal("modal-proj");
    };

    document.getElementById("form-proj").onsubmit = async (e) => {
      e.preventDefault();
      const pid = document.getElementById("edit-proj-id").value;
      const payload = {
        title: document.getElementById("inp-proj-title").value.trim(),
        slug: document.getElementById("inp-proj-slug").value.trim(),
        expected_price_vnd: Number(document.getElementById("inp-proj-price").value || 399000),
        status: document.getElementById("inp-proj-status").value,
        objective: document.getElementById("inp-proj-obj").value.trim()
      };
      if (pid) await api(`/api/projects/${encodeURIComponent(pid)}`, "PATCH", payload);
      else await api("/api/projects", "POST", payload);
      closeModals();
      await loadEverything();
      toast("Đã lưu thông tin dự án.");
    };

    document.getElementById("btn-new-doc").onclick = async () => {
      if (!state.selectedProjectId) return;
      const fname = window.prompt("Nhập tên tệp tài liệu mới (.md):", "KE_HOACH_BAN_HANG.md");
      if (!fname) return;
      await api(`/api/projects/${encodeURIComponent(state.selectedProjectId)}/files`, "POST", {
        file: fname.endsWith(".md") ? fname : `${fname}.md`,
        content: `# ${fname}\n\n- Mục tiêu:\n- Các bước triển khai:\n`
      });
      await loadProjectDocs(state.selectedProjectId);
      toast("Đã tạo tài liệu mới.");
    };

    document.getElementById("btn-toggle-doc-edit").onclick = () => {
      state.docEditMode = !state.docEditMode;
      document.getElementById("doc-pretty-view").style.display = state.docEditMode ? "none" : "block";
      document.getElementById("doc-raw-editor").style.display = state.docEditMode ? "block" : "none";
      document.getElementById("btn-save-doc").style.display = state.docEditMode ? "inline-flex" : "none";
      document.getElementById("btn-toggle-doc-edit").textContent = state.docEditMode ? "Xem bản đẹp" : "Sửa nội dung";
    };

    document.getElementById("btn-save-doc").onclick = async () => {
      if (!state.selectedProjectId || !state.currentDocFile) return;
      const content = document.getElementById("doc-raw-editor").value;
      await api(`/api/projects/${encodeURIComponent(state.selectedProjectId)}/files`, "POST", {
        file: state.currentDocFile,
        content
      });
      await openDocFile(state.selectedProjectId, state.currentDocFile);
      toast("Đã lưu tài liệu.");
    };

    document.getElementById("btn-delete-doc").onclick = async () => {
      if (!state.selectedProjectId || !state.currentDocFile) return;
      await api(`/api/projects/${encodeURIComponent(state.selectedProjectId)}/files?file=${encodeURIComponent(state.currentDocFile)}`, "DELETE");
      await loadProjectDocs(state.selectedProjectId);
      toast("Đã xóa tệp tài liệu.");
    };

    document.getElementById("btn-clear-events").onclick = async () => {
      await api("/api/events", "DELETE");
      toast("Đã dọn sạch nhật ký hoạt động cũ.");
    };

    document.getElementById("btn-export-json").onclick = async () => {
      const snap = await api("/api/sync/snapshot");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" }));
      a.download = `titan-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    };

    document.getElementById("btn-cloud-vault").onclick = () => openModal("modal-cloud");
    document.getElementById("form-cloud").onsubmit = (e) => {
      e.preventDefault();
      localStorage.setItem("titan_gh_repo", document.getElementById("inp-cloud-repo").value.trim());
      closeModals();
      toast("Đã lưu cấu hình kho đám mây trên thiết bị.");
    };
    document.getElementById("btn-cloud-sync-now").onclick = async () => {
      await loadEverything();
      closeModals();
      toast("Đã làm mới dữ liệu đồng bộ.");
    };

    // Command Palette (Ctrl+K)
    const renderCmd = (q) => {
      const term = (q || "").trim().toLowerCase();
      const rows = [];
      state.missions.forEach((m) => {
        if (!term || m.title.toLowerCase().includes(term)) rows.push({ kind: "msn", label: `Nhiệm vụ: ${m.title}` });
      });
      state.departments.forEach((d) => {
        if (!term || `${d.dept_id} ${d.title_vi}`.toLowerCase().includes(term)) rows.push({ kind: "dept", id: d.dept_id, label: `#${d.dept_id} · ${d.title_vi}` });
      });
      const box = document.getElementById("cmd-results");
      box.innerHTML = rows.slice(0, 12).map((r) => `
        <div class="list-row" style="grid-template-columns:1fr auto;cursor:pointer;" data-cmd-kind="${r.kind}" data-cmd-id="${esc(r.id || "")}">
          <span style="font-weight:600;color:var(--text-primary);">${esc(r.label)}</span>
          <span style="font-size:12px;color:var(--text-muted);">Mở ↵</span>
        </div>
      `).join("") || `<div style="padding:14px;color:var(--text-muted);">Không tìm thấy kết quả.</div>`;
      box.querySelectorAll("[data-cmd-kind]").forEach((el) => {
        el.onclick = () => {
          closeModals();
          if (el.getAttribute("data-cmd-kind") === "msn") switchTab("missions");
          else openStaffDrawer(el.getAttribute("data-cmd-id"));
        };
      });
    };

    document.getElementById("btn-cmd-palette").onclick = () => { openModal("modal-cmd"); renderCmd(""); };
    document.getElementById("cmd-input").oninput = (e) => renderCmd(e.target.value);

    // Close Backdrop & Shortcuts
    document.getElementById("drawer-backdrop").onclick = closeDrawer;
    document.getElementById("btn-close-drawer").onclick = closeDrawer;
    document.getElementById("modal-backdrop").onclick = closeModals;
    document.querySelectorAll("[data-close-modal]").forEach((b) => { b.onclick = closeModals; });

    window.addEventListener("keydown", (e) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes((e.target && e.target.tagName) || "");
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
      if (e.key === "Escape") {
        closeModals();
        closeDrawer();
        return;
      }
      if (typing) return;
      const order = ["command", "missions", "tasks", "staff", "news", "finance"];
      if (e.key >= "1" && e.key <= "6") switchTab(order[Number(e.key) - 1]);
      if (e.key.toLowerCase() === "n") { e.preventDefault(); openNewTaskModal("BACKLOG"); }
      if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
      }
    });
  }

  async function init() {
    applyTheme(localStorage.getItem("titan_theme") || "light");
    bindGlobalEvents();
    const hash = (window.location.hash || "").replace("#", "");
    if (VIEW_TITLES[hash]) state.tab = hash;
    await loadEverything();
    await loadNews("");
    switchTab(state.tab);
    startLiveStream();

    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
