#!/usr/bin/env python3
"""Titan AI Corp — High-Throughput SQLite WAL + FTS5 + Stanford 3D Memory & State Engine."""

from __future__ import annotations

import hashlib
import json
import math
import re
import sqlite3
import threading
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DB_PATH = ROOT_DIR / "corporate_hq" / "titan_state.db"
SKILLS_DIR = ROOT_DIR / ".agents" / "skills"

DIVISIONS_SEED: list[tuple[str, str, str, str, int]] = [
    ("exec-board", "Ban Tổng Giám Đốc Điều Hành", "CEO & Chief of Staff", ".agents/skills/titan-ceo-orchestrator/SKILL.md", 0),
    ("div1-strategy-intel", "Khối 1: Chiến lược, Tình báo Thị trường & R&D", "CSO", ".agents/skills/div1-strategy-intel/SKILL.md", 1),
    ("div2-product-design", "Khối 2: Quản trị Sản phẩm & Thiết kế Thương hiệu", "CPO", ".agents/skills/div2-product-design/SKILL.md", 2),
    ("div3-engineering-ai", "Khối 3: Kỹ thuật, Phần mềm, AI & Phần cứng", "CTO", ".agents/skills/div3-engineering-ai/SKILL.md", 3),
    ("div4-qa-cybersecurity", "Khối 4: Kiểm định Chất lượng & An ninh mạng", "CISO & QA", ".agents/skills/div4-qa-cybersecurity/SKILL.md", 4),
    ("div5-media-youtube-studio", "Khối 5: Studio Video AI, YouTube & Tăng trưởng", "CMO", ".agents/skills/div5-media-youtube-studio/SKILL.md", 5),
    ("div6-sales-commercial", "Khối 6: Kinh doanh, Bán hàng & Thành công Khách hàng", "CRO", ".agents/skills/div6-sales-commercial/SKILL.md", 6),
    ("div7-finance-tax-legal", "Khối 7: Tài chính, Kế toán, Thuế & Pháp chế", "CFO & CLO", ".agents/skills/div7-finance-tax-legal/SKILL.md", 7),
    ("div8-data-ops-hr", "Khối 8: Phân tích Số liệu, Quản trị Nội bộ & Nhân sự AI", "COO & CHRO", ".agents/skills/div8-data-ops-hr/SKILL.md", 8),
]


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse_iso_days_ago(iso_str: str | None) -> float:
    if not iso_str:
        return 30.0
    try:
        cleaned = iso_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(cleaned)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        delta_sec = max(0.0, (datetime.now(timezone.utc) - dt).total_seconds())
        return delta_sec / 86400.0
    except Exception:
        return 14.0


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS divisions (
    code TEXT PRIMARY KEY,
    name_vi TEXT NOT NULL,
    c_level_title TEXT NOT NULL,
    skill_path TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS departments (
    dept_id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    division_code TEXT NOT NULL REFERENCES divisions(code),
    title_vi TEXT NOT NULL,
    manager_code TEXT NOT NULL DEFAULT 'ceo',
    status TEXT NOT NULL DEFAULT 'IDLE'
        CHECK(status IN ('IDLE','STUDYING','RESEARCHING_TASK','EXECUTING','IN_QA_REVIEW','WAITING_CHAIRMAN','BLOCKED')),
    current_task_id TEXT,
    handbook_path TEXT NOT NULL,
    handbook_version TEXT NOT NULL DEFAULT '3.0',
    canonical_books TEXT NOT NULL DEFAULT '[]',
    token_budget_monthly INTEGER NOT NULL DEFAULT 500000,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    articles_learned INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    last_heartbeat_at TEXT,
    last_studied_at TEXT,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    objective TEXT NOT NULL DEFAULT '',
    target_market TEXT NOT NULL DEFAULT 'Vietnam & Global',
    current_gate INTEGER NOT NULL DEFAULT 1,
    current_stage INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'PLANNING'
        CHECK(status IN ('PLANNING','ACTIVE','PAUSED','SHIPPED','ARCHIVED')),
    expected_price_vnd REAL NOT NULL DEFAULT 0,
    unit_cost_vnd REAL NOT NULL DEFAULT 0,
    fixed_cost_monthly_vnd REAL NOT NULL DEFAULT 0,
    workspace_path TEXT NOT NULL DEFAULT '',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    task_id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(project_id),
    parent_task_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    assigned_dept_id TEXT NOT NULL REFERENCES departments(dept_id),
    reviewer_dept_id TEXT DEFAULT '20',
    gate_number INTEGER NOT NULL DEFAULT 1,
    stage_number INTEGER NOT NULL DEFAULT 1,
    priority TEXT NOT NULL DEFAULT 'HIGH'
        CHECK(priority IN ('CRITICAL','HIGH','MEDIUM','LOW')),
    kanban_column TEXT NOT NULL DEFAULT 'BACKLOG'
        CHECK(kanban_column IN ('BACKLOG','IN_PROGRESS','QA_SECURITY_REVIEW','WAITING_APPROVAL','DONE','REJECTED')),
    checkout_lock_owner TEXT,
    checkout_locked_at TEXT,
    evidence_level INTEGER NOT NULL DEFAULT 0,
    approval_note TEXT NOT NULL DEFAULT '',
    actor_priority INTEGER NOT NULL DEFAULT 1,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS deliverables (
    deliverable_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(task_id),
    dept_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artifact_type TEXT NOT NULL DEFAULT 'REPORT',
    file_path TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_citations (
    citation_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(task_id),
    dept_id TEXT NOT NULL,
    source_title TEXT NOT NULL,
    source_url TEXT NOT NULL,
    domain TEXT NOT NULL DEFAULT '',
    key_finding TEXT NOT NULL DEFAULT '',
    cited_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_runs (
    run_id TEXT PRIMARY KEY,
    triggered_by TEXT NOT NULL DEFAULT 'CLI',
    scope TEXT NOT NULL DEFAULT 'all',
    sources_queried INTEGER NOT NULL DEFAULT 0,
    new_atoms_added INTEGER NOT NULL DEFAULT 0,
    duplicates_skipped INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'RUNNING',
    started_at TEXT NOT NULL,
    finished_at TEXT,
    error_log TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS knowledge_atoms (
    atom_id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_hash TEXT UNIQUE NOT NULL,
    source_connector TEXT NOT NULL,
    dept_id TEXT NOT NULL,
    division_code TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    published_at TEXT NOT NULL,
    fetched_at TEXT NOT NULL,
    summary_vi TEXT NOT NULL,
    actionable_insight TEXT NOT NULL,
    importance INTEGER NOT NULL DEFAULT 6,
    tags TEXT NOT NULL DEFAULT ''
);

CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_atoms_fts USING fts5(
    title,
    summary_vi,
    actionable_insight,
    tags,
    content='knowledge_atoms',
    content_rowid='atom_id',
    tokenize='unicode61'
);

CREATE TRIGGER IF NOT EXISTS trg_knowledge_ai AFTER INSERT ON knowledge_atoms BEGIN
    INSERT INTO knowledge_atoms_fts(rowid, title, summary_vi, actionable_insight, tags)
    VALUES (new.atom_id, new.title, new.summary_vi, new.actionable_insight, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS trg_knowledge_ad AFTER DELETE ON knowledge_atoms BEGIN
    INSERT INTO knowledge_atoms_fts(knowledge_atoms_fts, rowid, title, summary_vi, actionable_insight, tags)
    VALUES ('delete', old.atom_id, old.title, old.summary_vi, old.actionable_insight, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS trg_knowledge_au AFTER UPDATE ON knowledge_atoms BEGIN
    INSERT INTO knowledge_atoms_fts(knowledge_atoms_fts, rowid, title, summary_vi, actionable_insight, tags)
    VALUES ('delete', old.atom_id, old.title, old.summary_vi, old.actionable_insight, old.tags);
    INSERT INTO knowledge_atoms_fts(rowid, title, summary_vi, actionable_insight, tags)
    VALUES (new.atom_id, new.title, new.summary_vi, new.actionable_insight, new.tags);
END;

CREATE TABLE IF NOT EXISTS reflexions (
    reflexion_id TEXT PRIMARY KEY,
    dept_id TEXT NOT NULL,
    task_id TEXT,
    failure_symptom TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    preventive_rule TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_stream (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_uid TEXT UNIQUE NOT NULL,
    timestamp TEXT NOT NULL,
    actor_dept_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    project_id TEXT,
    task_id TEXT,
    headline_vi TEXT NOT NULL,
    detail_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_dept_div ON departments(division_code);
CREATE INDEX IF NOT EXISTS idx_tasks_proj_col ON tasks(project_id, kanban_column);
CREATE INDEX IF NOT EXISTS idx_tasks_dept ON tasks(assigned_dept_id, kanban_column);
CREATE INDEX IF NOT EXISTS idx_atoms_dept_time ON knowledge_atoms(dept_id, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_atoms_div_time ON knowledge_atoms(division_code, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_citations_task ON task_citations(task_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_task ON deliverables(task_id);
CREATE INDEX IF NOT EXISTS idx_reflexions_dept ON reflexions(dept_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_time ON activity_stream(event_id DESC);
"""


class TitanDatabase:
    """Thread-safe, WAL-tuned SQLite + FTS5 Enterprise State & Memory Engine."""

    def __init__(self, db_path: Path | str = DEFAULT_DB_PATH, skills_dir: Path | None = None) -> None:
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.skills_dir = skills_dir if skills_dir is not None else SKILLS_DIR
        self._local = threading.local()
        self._write_lock = threading.RLock()
        self._subscribers_lock = threading.Lock()
        self._event_listeners: list[Any] = []
        self.initialize()

    def _get_conn(self) -> sqlite3.Connection:
        conn: sqlite3.Connection | None = getattr(self._local, "conn", None)
        if conn is None:
            conn = sqlite3.connect(str(self.db_path), timeout=10.0, isolation_level=None)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.execute("PRAGMA synchronous = NORMAL;")
            conn.execute("PRAGMA busy_timeout = 5000;")
            conn.execute("PRAGMA cache_size = -32000;")
            conn.execute("PRAGMA temp_store = MEMORY;")
            conn.execute("PRAGMA foreign_keys = ON;")
            self._local.conn = conn
        return conn

    @contextmanager
    def immediate_tx(self) -> Iterator[sqlite3.Connection]:
        with self._write_lock:
            conn = self._get_conn()
            conn.execute("BEGIN IMMEDIATE;")
            try:
                yield conn
                conn.execute("COMMIT;")
            except Exception:
                if conn.in_transaction:
                    conn.execute("ROLLBACK;")
                raise

    def close_thread_conn(self) -> None:
        conn: sqlite3.Connection | None = getattr(self._local, "conn", None)
        if conn is not None:
            conn.close()
            self._local.conn = None

    def register_event_listener(self, callback: Any) -> None:
        with self._subscribers_lock:
            self._event_listeners.append(callback)

    def unregister_event_listener(self, callback: Any) -> None:
        with self._subscribers_lock:
            if callback in self._event_listeners:
                self._event_listeners.remove(callback)

    def _notify_listeners(self, event_dict: dict[str, Any]) -> None:
        with self._subscribers_lock:
            listeners = list(self._event_listeners)
        for cb in listeners:
            try:
                cb(event_dict)
            except Exception:
                pass

    def initialize(self) -> None:
        with self._write_lock:
            conn = self._get_conn()
            conn.executescript(SCHEMA_SQL)
        self.sync_divisions_and_roster()

    def sync_divisions_and_roster(self) -> int:
        now = utc_now_iso()
        count = 0
        with self.immediate_tx() as conn:
            for code, name_vi, c_title, s_path, order in DIVISIONS_SEED:
                conn.execute(
                    """
                    INSERT INTO divisions(code, name_vi, c_level_title, skill_path, sort_order)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(code) DO UPDATE SET
                        name_vi=excluded.name_vi,
                        c_level_title=excluded.c_level_title,
                        skill_path=excluded.skill_path,
                        sort_order=excluded.sort_order
                    """,
                    (code, name_vi, c_title, s_path, order),
                )

            # Seed Position 00 (@ceo)
            ceo_md = self.skills_dir / "titan-ceo-orchestrator" / "SKILL.md"
            ceo_rel = ".agents/skills/titan-ceo-orchestrator/SKILL.md"
            conn.execute(
                """
                INSERT INTO departments(
                    dept_id, code, division_code, title_vi, manager_code,
                    handbook_path, handbook_version, canonical_books, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(dept_id) DO UPDATE SET
                    title_vi=excluded.title_vi,
                    handbook_path=excluded.handbook_path
                """,
                (
                    "00",
                    "ceo",
                    "exec-board",
                    "Tổng Giám Đốc & Chánh Văn Phòng (@ceo)",
                    "chairman",
                    ceo_rel if ceo_md.exists() else ceo_rel,
                    "4.0",
                    json.dumps(
                        [
                            "High Output Management (Andy Grove)",
                            "Principles (Ray Dalio)",
                            "Paperclip Control Plane & Obra Superpowers",
                        ],
                        ensure_ascii=False,
                    ),
                    now,
                ),
            )
            count += 1

            # Sync all specialist files 01..N
            if self.skills_dir.is_dir():
                for spec in sorted(self.skills_dir.glob("div*/specialists/*.md")):
                    m = re.match(r"^(\d{2,3})-([a-z0-9-]+)\.md$", spec.name)
                    if not m:
                        continue
                    dept_id, role_code = m.group(1), m.group(2)
                    div_code = spec.parents[1].name
                    raw_text = spec.read_text(encoding="utf-8")
                    first_line = raw_text.splitlines()[0].lstrip("# ").strip() if raw_text else spec.stem
                    clean_title = re.sub(r"^PHÒNG\s+\d+\s*:\s*", "", first_line, flags=re.IGNORECASE)
                    clean_title = re.sub(r"\s*\(`@[a-z0-9-]+`\)\s*$", "", clean_title).strip()
                    books = self._extract_books_from_markdown(raw_text)
                    try:
                        rel_path = str(spec.relative_to(ROOT_DIR)).replace("\\", "/")
                    except ValueError:
                        rel_path = str(spec).replace("\\", "/")

                    conn.execute(
                        """
                        INSERT INTO departments(
                            dept_id, code, division_code, title_vi, manager_code,
                            handbook_path, handbook_version, canonical_books, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(dept_id) DO UPDATE SET
                            code=excluded.code,
                            division_code=excluded.division_code,
                            title_vi=excluded.title_vi,
                            handbook_path=excluded.handbook_path,
                            canonical_books=excluded.canonical_books
                        """,
                        (
                            dept_id,
                            role_code,
                            div_code,
                            clean_title,
                            "ceo",
                            rel_path,
                            "4.0",
                            json.dumps(books, ensure_ascii=False),
                            now,
                        ),
                    )
                    count += 1

            # Recompute articles_learned counters accurately
            conn.execute(
                """
                UPDATE departments
                SET articles_learned = (
                    SELECT COUNT(*) FROM knowledge_atoms ka WHERE ka.dept_id = departments.dept_id
                )
                """
            )
        return count

    @staticmethod
    def _extract_books_from_markdown(md_text: str) -> list[str]:
        books: list[str] = []
        for match in re.finditer(r"\*([^*]{4,80})\*", md_text):
            candidate = match.group(1).strip()
            if candidate and candidate not in books and not candidate.startswith("http"):
                books.append(candidate)
            if len(books) >= 6:
                break
        return books

    def log_event(
        self,
        actor_dept_id: str,
        event_type: str,
        headline_vi: str,
        project_id: str | None = None,
        task_id: str | None = None,
        detail: dict[str, Any] | None = None,
        event_uid: str | None = None,
        conn: sqlite3.Connection | None = None,
    ) -> dict[str, Any]:
        ts = utc_now_iso()
        uid = event_uid or str(uuid.uuid4())
        detail_str = json.dumps(detail or {}, ensure_ascii=False)

        if conn is not None:
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO activity_stream(
                    event_uid, timestamp, actor_dept_id, event_type,
                    project_id, task_id, headline_vi, detail_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (uid, ts, actor_dept_id, event_type, project_id, task_id, headline_vi, detail_str),
            )
            event_id = cur.lastrowid
        else:
            with self.immediate_tx() as tx_conn:
                cur = tx_conn.execute(
                    """
                    INSERT OR IGNORE INTO activity_stream(
                        event_uid, timestamp, actor_dept_id, event_type,
                        project_id, task_id, headline_vi, detail_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (uid, ts, actor_dept_id, event_type, project_id, task_id, headline_vi, detail_str),
                )
                event_id = cur.lastrowid

        event_payload = {
            "event_id": event_id,
            "event_uid": uid,
            "timestamp": ts,
            "actor_dept_id": actor_dept_id,
            "event_type": event_type,
            "project_id": project_id,
            "task_id": task_id,
            "headline_vi": headline_vi,
            "detail": detail or {},
        }
        self._notify_listeners(event_payload)
        return event_payload

    # =========================================================================
    # PROJECTS & 12-STAGE PIPELINE INITIALIZATION
    # =========================================================================
    def create_project(
        self,
        slug: str,
        title: str,
        objective: str = "",
        target_market: str = "Vietnam & Global",
        expected_price_vnd: float = 399000.0,
        unit_cost_vnd: float = 95000.0,
        fixed_cost_monthly_vnd: float = 1500000.0,
        workspace_path: str = "",
        seed_gate1_tasks: bool = True,
    ) -> dict[str, Any]:
        clean_slug = re.sub(r"[^a-z0-9-]+", "-", slug.lower()).strip("-")
        if not clean_slug:
            raise ValueError("Slug dự án không hợp lệ.")
        now = utc_now_iso()
        project_id = f"proj-{clean_slug}"
        ws_path = workspace_path or f"corporate_hq/projects/{clean_slug}"

        # Create physical 8-division folders
        abs_ws = ROOT_DIR / ws_path
        for sub in (
            "01_strategy",
            "02_product_design",
            "03_engineering",
            "04_qa_security",
            "05_media_youtube",
            "06_sales_commercial",
            "07_finance_legal",
            "08_data_ops",
        ):
            (abs_ws / sub).mkdir(parents=True, exist_ok=True)
        brief_md = abs_ws / "PROJECT_BRIEF.md"
        if not brief_md.exists():
            brief_md.write_text(
                f"# DỰ ÁN: {title}\n\n- **Mã dự án:** `{project_id}`\n- **Mục tiêu:** {objective}\n"
                f"- **Thị trường:** {target_market}\n- **Khởi tạo:** {now}\n",
                encoding="utf-8",
            )

        evt_to_emit: dict[str, Any] | None = None
        with self.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO projects(
                    project_id, slug, title, objective, target_market,
                    current_gate, current_stage, status,
                    expected_price_vnd, unit_cost_vnd, fixed_cost_monthly_vnd,
                    workspace_path, version, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 1, 1, 'ACTIVE', ?, ?, ?, ?, 1, ?, ?)
                ON CONFLICT(project_id) DO UPDATE SET
                    title=excluded.title,
                    objective=excluded.objective,
                    target_market=excluded.target_market,
                    expected_price_vnd=excluded.expected_price_vnd,
                    unit_cost_vnd=excluded.unit_cost_vnd,
                    fixed_cost_monthly_vnd=excluded.fixed_cost_monthly_vnd,
                    version=projects.version + 1,
                    updated_at=excluded.updated_at
                """,
                (
                    project_id,
                    clean_slug,
                    title,
                    objective,
                    target_market,
                    expected_price_vnd,
                    unit_cost_vnd,
                    fixed_cost_monthly_vnd,
                    ws_path,
                    now,
                    now,
                ),
            )
            evt_to_emit = self.log_event(
                actor_dept_id="00",
                event_type="PROJECT_CREATED",
                headline_vi=f"Khởi tạo dự án mới: {title} ({target_market})",
                project_id=project_id,
                detail={"slug": clean_slug, "expected_price_vnd": expected_price_vnd},
                conn=conn,
            )

        if seed_gate1_tasks:
            starter_tasks = [
                ("01", "38", 1, 2, "CRITICAL", f"[{title}] Điều tra thị trường, độ khát & quy mô khách sẵn tiền"),
                ("02", "06", 1, 2, "HIGH", f"[{title}] Giải mã tử huyệt tâm lý sợ mất tiền & từ điển khách hàng"),
                ("38", "39", 1, 3, "CRITICAL", f"[{title}] Thẩm định Unit Economics, điểm hòa vốn & kịch bản xấu nhất"),
                ("06", "00", 2, 4, "HIGH", f"[{title}] Chốt đặc tả PRD tinh gọn & luồng UX 3 chạm trình Chủ tịch"),
            ]
            for dept_id, rev_id, gate_no, stage_no, prio, t_title in starter_tasks:
                self.create_task(
                    title=t_title,
                    assigned_dept_id=dept_id,
                    reviewer_dept_id=rev_id,
                    project_id=project_id,
                    gate_number=gate_no,
                    stage_number=stage_no,
                    priority=prio,
                    description=objective,
                )

        return self.get_project(project_id) or {"project_id": project_id, "event": evt_to_emit}

    def get_project(self, project_id: str) -> dict[str, Any] | None:
        conn = self._get_conn()
        row = conn.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,)).fetchone()
        return dict(row) if row else None

    def list_projects(self) -> list[dict[str, Any]]:
        conn = self._get_conn()
        rows = conn.execute(
            """
            SELECT p.*,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id) AS total_tasks,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.kanban_column = 'DONE') AS done_tasks,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.kanban_column = 'WAITING_APPROVAL') AS waiting_tasks
            FROM projects p
            ORDER BY p.updated_at DESC
            """
        ).fetchall()
        return [dict(r) for r in rows]

    # =========================================================================
    # TASKS, PAPERCLIP ATOMIC CHECKOUT & CHAIRMAN GATE APPROVALS
    # =========================================================================
    def create_task(
        self,
        title: str,
        assigned_dept_id: str,
        description: str = "",
        project_id: str | None = None,
        reviewer_dept_id: str = "20",
        gate_number: int = 1,
        stage_number: int = 1,
        priority: str = "HIGH",
        task_id: str | None = None,
    ) -> dict[str, Any]:
        now = utc_now_iso()
        tid = task_id or f"task-{uuid.uuid4().hex[:10]}"
        prio = priority.upper() if priority.upper() in ("CRITICAL", "HIGH", "MEDIUM", "LOW") else "HIGH"
        with self.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO tasks(
                    task_id, project_id, title, description, assigned_dept_id,
                    reviewer_dept_id, gate_number, stage_number, priority,
                    kanban_column, version, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'BACKLOG', 1, ?, ?)
                """,
                (tid, project_id, title, description, assigned_dept_id, reviewer_dept_id, gate_number, stage_number, prio, now, now),
            )
            self.log_event(
                actor_dept_id=assigned_dept_id,
                event_type="TASK_CREATED",
                headline_vi=f"Giao đầu việc mới cho Phòng {assigned_dept_id}: {title}",
                project_id=project_id,
                task_id=tid,
                detail={"priority": prio, "gate": gate_number, "stage": stage_number},
                conn=conn,
            )
        return self.get_task(tid)  # type: ignore[return-value]

    def checkout_task_atomic(self, task_id: str, dept_id: str, worker_token: str | None = None) -> dict[str, Any]:
        """Paperclip-style Atomic Task Checkout: strictly 1 owner wins under high concurrency."""
        owner = worker_token or f"dept-{dept_id}"
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,)).fetchone()
            if not row:
                raise KeyError(f"Task '{task_id}' không tồn tại.")
            existing_lock = row["checkout_lock_owner"]
            if existing_lock is not None and existing_lock != owner:
                return {
                    "acquired": False,
                    "task_id": task_id,
                    "locked_by": existing_lock,
                    "reason": f"Task đang được khóa độc quyền bởi '{existing_lock}'.",
                }
            conn.execute(
                """
                UPDATE tasks
                SET checkout_lock_owner = ?,
                    checkout_locked_at = ?,
                    kanban_column = 'IN_PROGRESS',
                    started_at = COALESCE(started_at, ?),
                    version = version + 1,
                    updated_at = ?
                WHERE task_id = ?
                """,
                (owner, now, now, now, task_id),
            )
            conn.execute(
                """
                UPDATE departments
                SET status = 'EXECUTING',
                    current_task_id = ?,
                    last_heartbeat_at = ?,
                    version = version + 1,
                    updated_at = ?
                WHERE dept_id = ?
                """,
                (task_id, now, now, dept_id),
            )
            self.log_event(
                actor_dept_id=dept_id,
                event_type="TASK_STARTED",
                headline_vi=f"Phòng {dept_id} đã khóa nguyên tử & bắt đầu thi công: {row['title']}",
                project_id=row["project_id"],
                task_id=task_id,
                detail={"owner": owner},
                conn=conn,
            )
        return {"acquired": True, "task_id": task_id, "locked_by": owner, "task": self.get_task(task_id)}

    def add_task_citation(
        self,
        task_id: str,
        dept_id: str,
        source_title: str,
        source_url: str,
        key_finding: str,
    ) -> dict[str, Any]:
        now = utc_now_iso()
        cid = f"cite-{uuid.uuid4().hex[:10]}"
        domain_match = re.search(r"https?://([^/]+)", source_url)
        domain = domain_match.group(1) if domain_match else "web"
        with self.immediate_tx() as conn:
            task_row = conn.execute("SELECT project_id, title FROM tasks WHERE task_id = ?", (task_id,)).fetchone()
            if not task_row:
                raise KeyError(f"Task '{task_id}' không tồn tại.")
            conn.execute(
                """
                INSERT INTO task_citations(
                    citation_id, task_id, dept_id, source_title, source_url, domain, key_finding, cited_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (cid, task_id, dept_id, source_title, source_url, domain, key_finding, now),
            )
            self.log_event(
                actor_dept_id=dept_id,
                event_type="WEB_CITED",
                headline_vi=f"Phòng {dept_id} vừa tham khảo nguồn thực tế ({domain}): {source_title}",
                project_id=task_row["project_id"],
                task_id=task_id,
                detail={"url": source_url, "finding": key_finding, "domain": domain},
                conn=conn,
            )
        return {"citation_id": cid, "task_id": task_id, "source_url": source_url, "domain": domain}

    def submit_deliverable(
        self,
        task_id: str,
        dept_id: str,
        title: str,
        summary: str,
        file_path: str = "",
        artifact_type: str = "REPORT",
        evidence_level: int = 2,
        require_chairman_gate: bool = True,
    ) -> dict[str, Any]:
        now = utc_now_iso()
        did = f"deliv-{uuid.uuid4().hex[:10]}"
        next_col = "WAITING_APPROVAL" if require_chairman_gate else "QA_SECURITY_REVIEW"
        next_dept_state = "WAITING_CHAIRMAN" if require_chairman_gate else "IN_QA_REVIEW"

        with self.immediate_tx() as conn:
            task_row = conn.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,)).fetchone()
            if not task_row:
                raise KeyError(f"Task '{task_id}' không tồn tại.")
            conn.execute(
                """
                INSERT INTO deliverables(
                    deliverable_id, task_id, dept_id, title, artifact_type, file_path, summary, version, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                """,
                (did, task_id, dept_id, title, artifact_type, file_path, summary, now),
            )
            conn.execute(
                """
                UPDATE tasks
                SET kanban_column = ?,
                    evidence_level = ?,
                    checkout_lock_owner = NULL,
                    version = version + 1,
                    updated_at = ?
                WHERE task_id = ?
                """,
                (next_col, max(0, min(5, int(evidence_level))), now, task_id),
            )
            conn.execute(
                """
                UPDATE departments
                SET status = ?,
                    last_heartbeat_at = ?,
                    version = version + 1,
                    updated_at = ?
                WHERE dept_id = ?
                """,
                (next_dept_state, now, now, dept_id),
            )
            evt_type = "GATE_WAITING_CHAIRMAN" if require_chairman_gate else "DELIVERABLE_SUBMITTED"
            self.log_event(
                actor_dept_id=dept_id,
                event_type=evt_type,
                headline_vi=f"Phòng {dept_id} nộp bàn giao '{title}' (Bằng chứng Cấp {evidence_level}) -> {next_col}",
                project_id=task_row["project_id"],
                task_id=task_id,
                detail={"deliverable_id": did, "file_path": file_path, "evidence_level": evidence_level},
                conn=conn,
            )
        return {"deliverable_id": did, "task": self.get_task(task_id)}

    def chairman_decide_task(
        self,
        task_id: str,
        decision: str,
        note: str = "",
        root_cause: str = "",
        preventive_rule: str = "",
    ) -> dict[str, Any]:
        """Chairman APPROVE or REJECT (REJECT automatically triggers Reflexion verbal RL!)."""
        dec = decision.upper().strip()
        if dec not in ("APPROVE", "REJECT"):
            raise ValueError("Decision phải là 'APPROVE' hoặc 'REJECT'.")
        now = utc_now_iso()

        with self.immediate_tx() as conn:
            task_row = conn.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,)).fetchone()
            if not task_row:
                raise KeyError(f"Task '{task_id}' không tồn tại.")
            dept_id = task_row["assigned_dept_id"]

            if dec == "APPROVE":
                conn.execute(
                    """
                    UPDATE tasks
                    SET kanban_column = 'DONE',
                        approval_note = ?,
                        checkout_lock_owner = NULL,
                        actor_priority = 10,
                        completed_at = ?,
                        version = version + 1,
                        updated_at = ?
                    WHERE task_id = ?
                    """,
                    (note or "Chủ tịch đã phê duyệt.", now, now, task_id),
                )
                conn.execute(
                    """
                    UPDATE departments
                    SET status = 'IDLE',
                        current_task_id = NULL,
                        tasks_completed = tasks_completed + 1,
                        version = version + 1,
                        updated_at = ?
                    WHERE dept_id = ?
                    """,
                    (now, dept_id),
                )
                if task_row["project_id"]:
                    conn.execute(
                        """
                        UPDATE projects
                        SET current_gate = MAX(current_gate, ?),
                            current_stage = MAX(current_stage, ?),
                            updated_at = ?
                        WHERE project_id = ?
                        """,
                        (min(5, task_row["gate_number"] + 1), min(12, task_row["stage_number"] + 1), now, task_row["project_id"]),
                    )
                self.log_event(
                    actor_dept_id="00",
                    event_type="CHAIRMAN_APPROVED",
                    headline_vi=f"Chủ tịch PHÊ DUYỆT đầu việc '{task_row['title']}' (Phòng {dept_id})",
                    project_id=task_row["project_id"],
                    task_id=task_id,
                    detail={"note": note},
                    conn=conn,
                )
            else:
                ref_id = f"refl-{uuid.uuid4().hex[:10]}"
                symptom = note or "Chưa đạt yêu cầu nghiệm thu tại cổng kiểm duyệt."
                cause = root_cause or "Chưa đối chiếu đầy đủ tiêu chuẩn đầu ra hoặc thiếu dữ liệu thực chứng."
                rule = preventive_rule or f"Bắt buộc kiểm tra kỹ yêu cầu '{symptom}' trước khi trình ký Cổng {task_row['gate_number']}."
                conn.execute(
                    """
                    INSERT INTO reflexions(reflexion_id, dept_id, task_id, failure_symptom, root_cause, preventive_rule, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (ref_id, dept_id, task_id, symptom, cause, rule, now),
                )
                conn.execute(
                    """
                    UPDATE tasks
                    SET kanban_column = 'IN_PROGRESS',
                        approval_note = ?,
                        checkout_lock_owner = NULL,
                        actor_priority = 10,
                        version = version + 1,
                        updated_at = ?
                    WHERE task_id = ?
                    """,
                    (symptom, now, task_id),
                )
                conn.execute(
                    """
                    UPDATE departments
                    SET status = 'IDLE',
                        current_task_id = NULL,
                        version = version + 1,
                        updated_at = ?
                    WHERE dept_id = ?
                    """,
                    (now, dept_id),
                )
                self.log_event(
                    actor_dept_id=dept_id,
                    event_type="CHAIRMAN_REJECTED",
                    headline_vi=f"Yêu cầu sửa lại '{task_row['title']}' -> Đã ghi Sổ Tự Kiểm Điểm Reflexion cho Phòng {dept_id}",
                    project_id=task_row["project_id"],
                    task_id=task_id,
                    detail={"note": symptom, "reflexion_id": ref_id, "preventive_rule": rule},
                    conn=conn,
                )

        return self.get_task(task_id)  # type: ignore[return-value]

    def transition_task_column(self, task_id: str, column: str, note: str = "") -> dict[str, Any]:
        valid = ("BACKLOG", "IN_PROGRESS", "QA_SECURITY_REVIEW", "WAITING_APPROVAL", "DONE", "REJECTED")
        col = column.upper().strip()
        if col not in valid:
            raise ValueError(f"Cột Kanban không hợp lệ: {column}")
        if col == "DONE":
            return self.chairman_decide_task(task_id, "APPROVE", note=note)
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,)).fetchone()
            if not row:
                raise KeyError(f"Task '{task_id}' không tồn tại.")
            conn.execute(
                """
                UPDATE tasks
                SET kanban_column = ?,
                    approval_note = CASE WHEN ? != '' THEN ? ELSE approval_note END,
                    version = version + 1,
                    updated_at = ?
                WHERE task_id = ?
                """,
                (col, note, note, now, task_id),
            )
            self.log_event(
                actor_dept_id=row["assigned_dept_id"],
                event_type="TASK_TRANSITION",
                headline_vi=f"Chuyển trạng thái '{row['title']}' sang cột {col}",
                project_id=row["project_id"],
                task_id=task_id,
                detail={"column": col, "note": note},
                conn=conn,
            )
        return self.get_task(task_id)  # type: ignore[return-value]

    def get_task(self, task_id: str) -> dict[str, Any] | None:
        conn = self._get_conn()
        row = conn.execute(
            """
            SELECT t.*, d.title_vi AS assigned_dept_title, d.code AS assigned_dept_code,
                   d.division_code AS division_code, p.title AS project_title
            FROM tasks t
            LEFT JOIN departments d ON d.dept_id = t.assigned_dept_id
            LEFT JOIN projects p ON p.project_id = t.project_id
            WHERE t.task_id = ?
            """,
            (task_id,),
        ).fetchone()
        if not row:
            return None
        result = dict(row)
        result["citations"] = [
            dict(c)
            for c in conn.execute(
                "SELECT * FROM task_citations WHERE task_id = ? ORDER BY cited_at DESC", (task_id,)
            ).fetchall()
        ]
        result["deliverables"] = [
            dict(dl)
            for dl in conn.execute(
                "SELECT * FROM deliverables WHERE task_id = ? ORDER BY created_at DESC", (task_id,)
            ).fetchall()
        ]
        return result

    def list_tasks(
        self,
        project_id: str | None = None,
        division_code: str | None = None,
        kanban_column: str | None = None,
        dept_id: str | None = None,
    ) -> list[dict[str, Any]]:
        conn = self._get_conn()
        clauses = ["1=1"]
        params: list[Any] = []
        if project_id:
            clauses.append("t.project_id = ?")
            params.append(project_id)
        if division_code:
            clauses.append("d.division_code = ?")
            params.append(division_code)
        if kanban_column:
            clauses.append("t.kanban_column = ?")
            params.append(kanban_column)
        if dept_id:
            clauses.append("t.assigned_dept_id = ?")
            params.append(dept_id)

        where_sql = " AND ".join(clauses)
        rows = conn.execute(
            f"""
            SELECT t.*, d.title_vi AS assigned_dept_title, d.code AS assigned_dept_code,
                   d.division_code AS division_code, p.title AS project_title,
                   (SELECT COUNT(*) FROM task_citations tc WHERE tc.task_id = t.task_id) AS citations_count,
                   (SELECT COUNT(*) FROM deliverables dl WHERE dl.task_id = t.task_id) AS deliverables_count
            FROM tasks t
            LEFT JOIN departments d ON d.dept_id = t.assigned_dept_id
            LEFT JOIN projects p ON p.project_id = t.project_id
            WHERE {where_sql}
            ORDER BY
                CASE t.priority WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
                t.updated_at DESC
            """,
            params,
        ).fetchall()
        return [dict(r) for r in rows]

    # =========================================================================
    # CONTINUAL LEARNING STORAGE, FTS5 BM25 & STANFORD 3D MEMORY RECALL
    # =========================================================================
    @staticmethod
    def compute_url_hash(url: str, dept_id: str = "") -> str:
        norm = url.strip().lower()
        return hashlib.sha256(f"{dept_id}::{norm}".encode("utf-8")).hexdigest()

    def store_knowledge_atom(
        self,
        source_connector: str,
        dept_id: str,
        division_code: str,
        title: str,
        url: str,
        summary_vi: str,
        actionable_insight: str,
        published_at: str | None = None,
        importance: int = 6,
        tags: str = "",
        emit_event: bool = True,
    ) -> tuple[bool, int | None]:
        """Insert deduplicated Wisdom Atom and update FTS5 index + specialist counter."""
        now = utc_now_iso()
        pub = published_at or now
        url_hash = self.compute_url_hash(url, dept_id)
        imp = max(1, min(10, int(importance)))

        with self.immediate_tx() as conn:
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO knowledge_atoms(
                    url_hash, source_connector, dept_id, division_code,
                    title, url, published_at, fetched_at,
                    summary_vi, actionable_insight, importance, tags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    url_hash,
                    source_connector,
                    dept_id,
                    division_code,
                    title.strip(),
                    url.strip(),
                    pub,
                    now,
                    summary_vi.strip(),
                    actionable_insight.strip(),
                    imp,
                    tags.strip(),
                ),
            )
            if cur.rowcount == 0:
                return False, None
            atom_id = cur.lastrowid
            conn.execute(
                """
                UPDATE departments
                SET articles_learned = articles_learned + 1,
                    last_studied_at = ?,
                    updated_at = ?
                WHERE dept_id = ?
                """,
                (now, now, dept_id),
            )
            if emit_event:
                self.log_event(
                    actor_dept_id=dept_id,
                    event_type="ARTICLE_LEARNED",
                    headline_vi=f"Phòng {dept_id} vừa đọc & đúc kết [{source_connector}]: {title[:90]}",
                    detail={"url": url, "importance": imp, "atom_id": atom_id},
                    conn=conn,
                )
            return True, atom_id

    def search_knowledge_fts(
        self,
        query: str = "",
        dept_id: str | None = None,
        division_code: str | None = None,
        min_importance: int = 1,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        conn = self._get_conn()
        clean_q = re.sub(r'[^\w\sÀ-ỹ-]', " ", query, flags=re.UNICODE).strip()

        if clean_q:
            tokens = [f'"{tok}"*' for tok in clean_q.split() if len(tok) >= 1][:8]
            fts_expr = " OR ".join(tokens)
            clauses = ["knowledge_atoms_fts MATCH ?", "ka.importance >= ?"]
            params: list[Any] = [fts_expr, min_importance]
            if dept_id:
                clauses.append("ka.dept_id = ?")
                params.append(dept_id)
            if division_code:
                clauses.append("ka.division_code = ?")
                params.append(division_code)
            params.append(limit)

            rows = conn.execute(
                f"""
                SELECT ka.*, (-bm25(knowledge_atoms_fts)) AS bm25_raw
                FROM knowledge_atoms_fts
                JOIN knowledge_atoms ka ON ka.atom_id = knowledge_atoms_fts.rowid
                WHERE {' AND '.join(clauses)}
                ORDER BY bm25(knowledge_atoms_fts), ka.importance DESC, ka.fetched_at DESC
                LIMIT ?
                """,
                params,
            ).fetchall()
            return [dict(r) for r in rows]

        clauses = ["ka.importance >= ?"]
        params = [min_importance]
        if dept_id:
            clauses.append("ka.dept_id = ?")
            params.append(dept_id)
        if division_code:
            clauses.append("ka.division_code = ?")
            params.append(division_code)
        params.append(limit)
        rows = conn.execute(
            f"""
            SELECT ka.*, 0.0 AS bm25_raw
            FROM knowledge_atoms ka
            WHERE {' AND '.join(clauses)}
            ORDER BY ka.fetched_at DESC, ka.importance DESC
            LIMIT ?
            """,
            params,
        ).fetchall()
        return [dict(r) for r in rows]

    def recall_stanford_3d(
        self,
        dept_id: str,
        query: str,
        top_k: int = 8,
        w_rec: float = 0.25,
        w_imp: float = 0.30,
        w_rel: float = 0.45,
        decay_lambda: float = 0.05,
    ) -> dict[str, Any]:
        """
        Stanford Generative Agents 3D Retrieval Formula:
        S(m, Q) = w_rec * exp(-lambda * delta_days) + w_imp * (I / 10) + w_rel * BM25_norm(m, Q)
        Plus latest Reflexion preventive rules for this department!
        """
        conn = self._get_conn()
        dept_row = conn.execute("SELECT division_code FROM departments WHERE dept_id = ?", (dept_id,)).fetchone()
        div_code = dept_row["division_code"] if dept_row else None

        fts_hits = self.search_knowledge_fts(query=query, division_code=div_code, limit=40) if query.strip() else []
        recent_dept = self.search_knowledge_fts(query="", dept_id=dept_id, limit=25)

        merged_by_id: dict[int, dict[str, Any]] = {}
        max_bm25 = max((float(h.get("bm25_raw") or 0.0) for h in fts_hits), default=0.0)

        for item in recent_dept:
            merged_by_id[item["atom_id"]] = dict(item)
        for item in fts_hits:
            merged_by_id[item["atom_id"]] = dict(item)

        scored: list[dict[str, Any]] = []
        query_terms = [t.lower() for t in re.findall(r"\w+", query.lower()) if len(t) > 1]

        for atom in merged_by_id.values():
            days_ago = _parse_iso_days_ago(atom.get("published_at") or atom.get("fetched_at"))
            recency_score = math.exp(-decay_lambda * days_ago)
            importance_score = max(0.0, min(1.0, float(atom.get("importance", 5)) / 10.0))

            raw_bm25 = float(atom.get("bm25_raw") or 0.0)
            if max_bm25 > 0 and raw_bm25 > 0:
                rel_score = min(1.0, raw_bm25 / max_bm25)
            elif query_terms:
                haystack = f"{atom['title']} {atom['summary_vi']} {atom['actionable_insight']}".lower()
                matched = sum(1 for t in query_terms if t in haystack)
                rel_score = matched / len(query_terms)
            else:
                rel_score = 0.5

            # Bonus if directly assigned to this exact specialist
            dept_bonus = 0.08 if atom.get("dept_id") == dept_id else 0.0
            total_score = (w_rec * recency_score) + (w_imp * importance_score) + (w_rel * rel_score) + dept_bonus
            atom_copy = dict(atom)
            atom_copy["stanford_score"] = round(total_score, 4)
            atom_copy["recency_component"] = round(recency_score, 4)
            atom_copy["relevance_component"] = round(rel_score, 4)
            scored.append(atom_copy)

        scored.sort(key=lambda x: x["stanford_score"], reverse=True)

        reflexions = [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM reflexions WHERE dept_id = ? ORDER BY created_at DESC LIMIT 5",
                (dept_id,),
            ).fetchall()
        ]
        return {
            "dept_id": dept_id,
            "query": query,
            "top_memories": scored[:top_k],
            "active_reflexions": reflexions,
        }

    # =========================================================================
    # DEPARTMENTS, OVERVIEW TELEMETRY & CFO SIMULATOR
    # =========================================================================
    def list_departments(self, division_code: str | None = None, status: str | None = None) -> list[dict[str, Any]]:
        conn = self._get_conn()
        clauses = ["1=1"]
        params: list[Any] = []
        if division_code:
            clauses.append("d.division_code = ?")
            params.append(division_code)
        if status:
            clauses.append("d.status = ?")
            params.append(status)
        rows = conn.execute(
            f"""
            SELECT d.*, div.name_vi AS division_name_vi, div.c_level_title,
                   t.title AS current_task_title
            FROM departments d
            JOIN divisions div ON div.code = d.division_code
            LEFT JOIN tasks t ON t.task_id = d.current_task_id
            WHERE {' AND '.join(clauses)}
            ORDER BY CAST(d.dept_id AS INTEGER) ASC, d.dept_id ASC
            """,
            params,
        ).fetchall()
        result = []
        for r in rows:
            item = dict(r)
            try:
                item["canonical_books"] = json.loads(item["canonical_books"])
            except Exception:
                item["canonical_books"] = []
            result.append(item)
        return result

    def get_department_detail(self, dept_id: str) -> dict[str, Any] | None:
        conn = self._get_conn()
        row = conn.execute(
            """
            SELECT d.*, div.name_vi AS division_name_vi, div.c_level_title
            FROM departments d
            JOIN divisions div ON div.code = d.division_code
            WHERE d.dept_id = ? OR d.code = ?
            """,
            (dept_id, dept_id),
        ).fetchone()
        if not row:
            return None
        dept = dict(row)
        actual_id = dept["dept_id"]
        try:
            dept["canonical_books"] = json.loads(dept["canonical_books"])
        except Exception:
            dept["canonical_books"] = []

        hb_path = ROOT_DIR / dept["handbook_path"]
        dept["handbook_markdown"] = hb_path.read_text(encoding="utf-8") if hb_path.is_file() else ""
        dept["learned_articles"] = self.search_knowledge_fts(query="", dept_id=actual_id, limit=40)
        dept["tasks"] = self.list_tasks(dept_id=actual_id)
        dept["reflexions"] = [
            dict(rf)
            for rf in conn.execute(
                "SELECT * FROM reflexions WHERE dept_id = ? ORDER BY created_at DESC LIMIT 20",
                (actual_id,),
            ).fetchall()
        ]
        return dept

    def update_department_settings(
        self,
        dept_id: str,
        handbook_markdown: str | None = None,
        token_budget_monthly: int | None = None,
        status: str | None = None,
    ) -> dict[str, Any]:
        now = utc_now_iso()
        detail = self.get_department_detail(dept_id)
        if not detail:
            raise KeyError(f"Không tìm thấy phòng ban '{dept_id}'.")
        actual_id = detail["dept_id"]

        if handbook_markdown is not None and handbook_markdown.strip():
            hb_path = ROOT_DIR / detail["handbook_path"]
            hb_path.parent.mkdir(parents=True, exist_ok=True)
            hb_path.write_text(handbook_markdown, encoding="utf-8")

        with self.immediate_tx() as conn:
            if token_budget_monthly is not None:
                conn.execute(
                    "UPDATE departments SET token_budget_monthly = ?, version = version + 1, updated_at = ? WHERE dept_id = ?",
                    (max(1000, int(token_budget_monthly)), now, actual_id),
                )
            if status is not None:
                conn.execute(
                    "UPDATE departments SET status = ?, version = version + 1, updated_at = ? WHERE dept_id = ?",
                    (status, now, actual_id),
                )
            self.log_event(
                actor_dept_id=actual_id,
                event_type="DEPT_UPDATED",
                headline_vi=f"Cập nhật cấu hình / cẩm nang chuyên môn của Phòng {actual_id} ({detail['title_vi']})",
                conn=conn,
            )
        return self.get_department_detail(actual_id)  # type: ignore[return-value]

    def get_overview_payload(self, events_limit: int = 60) -> dict[str, Any]:
        conn = self._get_conn()
        dept_counts = conn.execute(
            """
            SELECT
                COUNT(*) AS total_depts,
                SUM(CASE WHEN status != 'IDLE' THEN 1 ELSE 0 END) AS active_depts,
                SUM(CASE WHEN status = 'STUDYING' THEN 1 ELSE 0 END) AS studying_depts,
                SUM(tokens_used) AS total_tokens_used,
                SUM(token_budget_monthly) AS total_token_budget
            FROM departments
            """
        ).fetchone()

        task_counts = conn.execute(
            """
            SELECT
                COUNT(*) AS total_tasks,
                SUM(CASE WHEN kanban_column = 'BACKLOG' THEN 1 ELSE 0 END) AS backlog_tasks,
                SUM(CASE WHEN kanban_column = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_tasks,
                SUM(CASE WHEN kanban_column = 'QA_SECURITY_REVIEW' THEN 1 ELSE 0 END) AS qa_tasks,
                SUM(CASE WHEN kanban_column = 'WAITING_APPROVAL' THEN 1 ELSE 0 END) AS waiting_approval_tasks,
                SUM(CASE WHEN kanban_column = 'DONE' THEN 1 ELSE 0 END) AS done_tasks
            FROM tasks
            """
        ).fetchone()

        knowledge_counts = conn.execute(
            """
            SELECT
                COUNT(*) AS total_atoms,
                SUM(CASE WHEN fetched_at >= datetime('now', '-1 day') THEN 1 ELSE 0 END) AS atoms_last_24h
            FROM knowledge_atoms
            """
        ).fetchone()

        divisions = [dict(r) for r in conn.execute("SELECT * FROM divisions ORDER BY sort_order ASC").fetchall()]
        events_raw = conn.execute(
            """
            SELECT e.*, d.title_vi AS actor_title_vi, d.code AS actor_code
            FROM activity_stream e
            LEFT JOIN departments d ON d.dept_id = e.actor_dept_id
            ORDER BY e.event_id DESC
            LIMIT ?
            """,
            (events_limit,),
        ).fetchall()
        events = []
        for ev in events_raw:
            item = dict(ev)
            try:
                item["detail"] = json.loads(item.pop("detail_json", "{}"))
            except Exception:
                item["detail"] = {}
            events.append(item)

        last_run = conn.execute("SELECT * FROM learning_runs ORDER BY started_at DESC LIMIT 1").fetchone()

        return {
            "generated_at": utc_now_iso(),
            "kpis": {
                "total_departments": dept_counts["total_depts"] or 0,
                "active_departments": dept_counts["active_depts"] or 0,
                "studying_departments": dept_counts["studying_depts"] or 0,
                "total_tokens_used": dept_counts["total_tokens_used"] or 0,
                "total_token_budget": dept_counts["total_token_budget"] or 1,
                "total_tasks": task_counts["total_tasks"] or 0,
                "backlog_tasks": task_counts["backlog_tasks"] or 0,
                "in_progress_tasks": task_counts["in_progress_tasks"] or 0,
                "qa_tasks": task_counts["qa_tasks"] or 0,
                "waiting_approval_tasks": task_counts["waiting_approval_tasks"] or 0,
                "done_tasks": task_counts["done_tasks"] or 0,
                "total_knowledge_atoms": knowledge_counts["total_atoms"] or 0,
                "atoms_last_24h": knowledge_counts["atoms_last_24h"] or 0,
            },
            "divisions": divisions,
            "projects": self.list_projects(),
            "recent_events": events,
            "last_learning_run": dict(last_run) if last_run else None,
        }

    def get_events_since(self, last_event_id: int) -> list[dict[str, Any]]:
        conn = self._get_conn()
        rows = conn.execute(
            """
            SELECT e.*, d.title_vi AS actor_title_vi, d.code AS actor_code
            FROM activity_stream e
            LEFT JOIN departments d ON d.dept_id = e.actor_dept_id
            WHERE e.event_id > ?
            ORDER BY e.event_id ASC
            LIMIT 100
            """,
            (last_event_id,),
        ).fetchall()
        out = []
        for ev in rows:
            item = dict(ev)
            try:
                item["detail"] = json.loads(item.pop("detail_json", "{}"))
            except Exception:
                item["detail"] = {}
            out.append(item)
        return out

    @staticmethod
    def simulate_cfo_unit_economics(
        price_per_month: float,
        max_quota_units: int,
        api_cost_per_unit: float,
        avg_usage_ratio: float = 0.60,
        payment_fee_pct: float = 1.5,
        payment_fixed_fee: float = 0.0,
        tax_reserve_pct: float = 7.0,
        fixed_monthly_cost: float = 1500000.0,
    ) -> dict[str, Any]:
        """Deterministic CFO & FP&A Pricing + Worst-Case Stress Calculator (Zero LLM Math!)."""
        price = max(0.0, float(price_per_month))
        quota = max(0, int(max_quota_units))
        unit_api = max(0.0, float(api_cost_per_unit))
        usage = max(0.05, min(1.0, float(avg_usage_ratio)))
        pay_pct = max(0.0, float(payment_fee_pct)) / 100.0
        pay_fix = max(0.0, float(payment_fixed_fee))
        tax_pct = max(0.0, float(tax_reserve_pct)) / 100.0
        fixed_cost = max(0.0, float(fixed_monthly_cost))

        payment_fee = (price * pay_pct) + pay_fix
        tax_reserve = price * tax_pct

        worst_case_api_cost = quota * unit_api
        expected_api_cost = quota * usage * unit_api

        worst_case_cogs = worst_case_api_cost + payment_fee
        expected_cogs = expected_api_cost + payment_fee

        worst_gross_margin_pct = ((price - worst_case_cogs) / price * 100.0) if price > 0 else 0.0
        expected_gross_margin_pct = ((price - expected_cogs) / price * 100.0) if price > 0 else 0.0

        net_profit_per_user_expected = price - expected_cogs - tax_reserve
        net_profit_per_user_worst = price - worst_case_cogs - tax_reserve

        if net_profit_per_user_expected > 0:
            breakeven_customers = math.ceil(fixed_cost / net_profit_per_user_expected)
        else:
            breakeven_customers = -1

        projections = {}
        for tier_users in (10, 50, 200, 500):
            gross_rev = price * tier_users
            total_tax = tax_reserve * tier_users
            total_cogs = expected_cogs * tier_users
            net_cash = gross_rev - total_cogs - total_tax - fixed_cost
            projections[str(tier_users)] = {
                "customers": tier_users,
                "gross_revenue": round(gross_rev, 2),
                "tax_reserve": round(total_tax, 2),
                "total_cogs": round(total_cogs, 2),
                "net_profit": round(net_cash, 2),
            }

        gate1_passed = worst_gross_margin_pct >= 65.0 and net_profit_per_user_worst > 0
        return {
            "price_per_month": round(price, 2),
            "payment_fee": round(payment_fee, 2),
            "tax_reserve_per_user": round(tax_reserve, 2),
            "worst_case_api_cost": round(worst_case_api_cost, 2),
            "expected_api_cost": round(expected_api_cost, 2),
            "worst_gross_margin_pct": round(worst_gross_margin_pct, 2),
            "expected_gross_margin_pct": round(expected_gross_margin_pct, 2),
            "net_profit_per_user_expected": round(net_profit_per_user_expected, 2),
            "net_profit_per_user_worst": round(net_profit_per_user_worst, 2),
            "breakeven_customers": breakeven_customers,
            "gate1_passed": gate1_passed,
            "verdict_vi": (
                "ĐẠT CHUẨN CỔNG 1 (An toàn chống lỗ ngầm kể cả khi khách dùng 100% hạn mức)"
                if gate1_passed
                else "CẢNH BÁO ĐỎ: Biên lợi nhuận kịch bản xấu < 65% — Cần giảm hạn mức hoặc tăng giá!"
            ),
            "projections": projections,
        }
