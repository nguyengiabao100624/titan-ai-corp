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
    ("exec-board", "Ban Tổng Giám đốc Điều hành", "Tổng Giám đốc", ".agents/skills/titan-ceo-orchestrator/SKILL.md", 0),
    ("div1-strategy-intel", "Khối 1: Chiến lược, Tình báo Thị trường và Nghiên cứu Công nghệ", "Giám đốc Chiến lược", ".agents/skills/div1-strategy-intel/SKILL.md", 1),
    ("div2-product-design", "Khối 2: Quản trị Sản phẩm và Thiết kế Thương hiệu", "Giám đốc Sản phẩm", ".agents/skills/div2-product-design/SKILL.md", 2),
    ("div3-engineering-ai", "Khối 3: Kỹ thuật Phần mềm, Trí tuệ nhân tạo và Phần cứng", "Giám đốc Công nghệ", ".agents/skills/div3-engineering-ai/SKILL.md", 3),
    ("div4-qa-cybersecurity", "Khối 4: Kiểm định Chất lượng và An ninh mạng", "Giám đốc Chất lượng và Bảo mật", ".agents/skills/div4-qa-cybersecurity/SKILL.md", 4),
    ("div5-media-youtube-studio", "Khối 5: Truyền thông Video, Kênh nội dung và Tăng trưởng", "Giám đốc Truyền thông", ".agents/skills/div5-media-youtube-studio/SKILL.md", 5),
    ("div6-sales-commercial", "Khối 6: Kinh doanh, Bán hàng và Chăm sóc Khách hàng", "Giám đốc Kinh doanh", ".agents/skills/div6-sales-commercial/SKILL.md", 6),
    ("div7-finance-tax-legal", "Khối 7: Tài chính, Kế toán, Thuế và Pháp chế", "Giám đốc Tài chính và Pháp chế", ".agents/skills/div7-finance-tax-legal/SKILL.md", 7),
    ("div8-data-ops-hr", "Khối 8: Phân tích Dữ liệu, Vận hành Nội bộ và Nhân sự", "Giám đốc Vận hành và Nhân sự", ".agents/skills/div8-data-ops-hr/SKILL.md", 8),
    ("div9-critique-ux-lab", "Khối 9: Phản biện Độc lập, Kiểm thử Khách hàng và Săn Cơ hội", "Giám đốc Phản biện và Trải nghiệm", ".agents/skills/div9-critique-ux-lab/SKILL.md", 9),
]

CANONICAL_DEPT_TITLES_VI: dict[str, str] = {
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
    "13": "Kỹ thuật Giao diện Trực tuyến",
    "14": "Phát triển Ứng dụng Di động",
    "15": "Kỹ thuật Máy chủ và Cổng Thanh toán",
    "16": "Kỹ sư Trí tuệ nhân tạo và Tự động hóa",
    "17": "Quản trị Cơ sở Dữ liệu",
    "18": "Kỹ thuật Nhúng và Thiết bị Thông minh",
    "19": "Hạ tầng Đám mây và Vận hành Hệ thống",
    "20": "Kiểm thử Phần mềm và Tự động hóa",
    "21": "Kiểm thử Chịu tải, Tốc độ và Ổn định",
    "22": "Kiểm định Độ chuẩn xác và An toàn Trí tuệ nhân tạo",
    "23": "An ninh Mạng và Chống Xâm nhập",
    "24": "Bảo vệ Dữ liệu Cá nhân và Cô lập Khách hàng",
    "25": "Chiến lược Hệ thống Kênh Video và Nội dung Ngắn",
    "26": "Biên kịch Lan truyền và Câu Mở đầu 3 giây",
    "27": "Đạo diễn Hình ảnh và Kỹ xảo Video",
    "28": "Đạo diễn Âm thanh và Lồng tiếng",
    "29": "Thiết kế Ảnh bìa và Tối ưu Tỷ lệ Bấm",
    "30": "Tối ưu Tìm kiếm Trực tuyến và Khám phá Nội dung",
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
    "45": "Tuyển dụng, Đào tạo và Kiểm định Nhân sự",
    "46": "Hội đồng Phản biện Mô hình Kiếm tiền",
    "47": "Thanh tra Phản biện Chéo Quy trình và Phòng ban",
    "48": "Kiểm thử viên đóng vai 5 nhóm Khách hàng thật",
    "49": "Thanh tra Tối giản Thao tác và Diệt Rối mắt",
    "50": "Trinh sát Săn Cơ hội và Thiết kế Sản phẩm Sinh lời",
}

KANBAN_LABELS_VI: dict[str, str] = {
    "BACKLOG": "Chờ triển khai",
    "IN_PROGRESS": "Đang thực hiện",
    "QA_SECURITY_REVIEW": "Kiểm định chất lượng",
    "WAITING_APPROVAL": "Chờ Chủ tịch duyệt",
    "DONE": "Hoàn thành",
    "REJECTED": "Cần chỉnh sửa",
}

ORDER_TYPE_LABELS_VI: dict[str, str] = {
    "NEW_MISSION": "Nhiệm vụ mới",
    "BUILD_PRODUCT": "Sản xuất sản phẩm",
    "MISSION_REWORK": "Chỉnh sửa theo góp ý",
    "MISSION_APPROVED": "Phê duyệt nhiệm vụ",
    "SCAN_OPPORTUNITIES": "Săn cơ hội mới",
    "EXECUTE_TASK": "Thực thi đầu việc",
}

ENTITY_TYPE_LABELS_VI: dict[str, str] = {
    "task": "đầu việc",
    "mission": "nhiệm vụ",
    "opportunity": "cơ hội",
    "project": "dự án",
    "article": "bài viết",
    "doc": "tài liệu",
    "ledger": "bút toán tài chính",
}

LEDGER_TYPE_LABELS_VI: dict[str, str] = {
    "REVENUE": "Doanh thu",
    "EXPENSE": "Chi phí",
    "TAX_RESERVE": "Dự phòng thuế",
}


def clean_department_title_vi(raw_title: str) -> str:
    """Chuẩn hóa tên phòng ban tiếng Việt sạch, loại bỏ mã vai trò và cụm tiếng Anh thừa trong ngoặc."""
    text = re.sub(r"^PHÒNG\s+#?\d+\s*:\s*", "", raw_title.strip(), flags=re.IGNORECASE)
    text = re.sub(r"\s*\(`?@[a-z0-9-]+`?\)\s*$", "", text, flags=re.IGNORECASE)
    text = re.sub(
        r"\s*\((?:PM|UX|UI|PMO|CTR|CRO|BI|FP&A|SEO\s*/\s*GEO\s*/\s*AEO|OUTBOUND\s+SDR|HIGH-TICKET\s*&\s*SAAS\s+CLOSER|RETENTION\s*&\s*UPSELL|YOUTUBE\s*/\s*TIKTOK\s*/\s*OPEN-SOURCE)\)\s*",
        " ",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(r"\s+", " ", text).strip()
    return text


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

CREATE TABLE IF NOT EXISTS missions (
    mission_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    goal_prompt TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'MONEY_MAKER',
    status TEXT NOT NULL DEFAULT 'RUNNING'
        CHECK(status IN ('RUNNING','PAUSED','WAITING_CHAIRMAN','COMPLETED','REJECTED')),
    auto_approve INTEGER NOT NULL DEFAULT 0,
    current_step_order INTEGER NOT NULL DEFAULT 1,
    total_steps INTEGER NOT NULL DEFAULT 7,
    progress_pct INTEGER NOT NULL DEFAULT 0,
    final_summary TEXT NOT NULL DEFAULT '',
    survival_score INTEGER NOT NULL DEFAULT 85,
    ux_score INTEGER NOT NULL DEFAULT 90,
    expected_margin_pct REAL NOT NULL DEFAULT 74.0,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mission_steps (
    step_id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL REFERENCES missions(mission_id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    lead_dept_ids TEXT NOT NULL,
    critic_dept_id TEXT NOT NULL DEFAULT '47',
    ux_tester_dept_id TEXT NOT NULL DEFAULT '48',
    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK(status IN ('PENDING','RUNNING','DONE','WAITING_APPROVAL','FAILED')),
    progress_pct INTEGER NOT NULL DEFAULT 0,
    live_activity_text TEXT NOT NULL DEFAULT '',
    output_summary TEXT NOT NULL DEFAULT '',
    critique_verdict TEXT NOT NULL DEFAULT '',
    ux_verdict TEXT NOT NULL DEFAULT '',
    started_at TEXT,
    completed_at TEXT,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS opportunities (
    opp_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    target_customer TEXT NOT NULL,
    pain_point TEXT NOT NULL DEFAULT '',
    proposed_solution TEXT NOT NULL DEFAULT '',
    price_vnd REAL NOT NULL DEFAULT 399000,
    est_margin_pct REAL NOT NULL DEFAULT 75.0,
    breakeven_users INTEGER NOT NULL DEFAULT 5,
    survival_score INTEGER NOT NULL DEFAULT 86,
    critique_note TEXT NOT NULL DEFAULT '',
    ux_note TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'NEW'
        CHECK(status IN ('NEW','ACCEPTED','DISMISSED')),
    mission_id TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deleted_tombstones (
    tombstone_key TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    trash_payload_json TEXT NOT NULL DEFAULT '{}',
    deleted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS antigravity_orders (
    order_id TEXT PRIMARY KEY,
    order_type TEXT NOT NULL
        CHECK(order_type IN ('NEW_MISSION','BUILD_PRODUCT','MISSION_REWORK','MISSION_APPROVED','SCAN_OPPORTUNITIES','EXECUTE_TASK')),
    mission_id TEXT,
    task_id TEXT,
    title TEXT NOT NULL,
    instructions TEXT NOT NULL DEFAULT '',
    source_device TEXT NOT NULL DEFAULT 'web-local',
    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK(status IN ('PENDING','CLAIMED','RUNNING','COMPLETED','CANCELLED')),
    claimed_by TEXT NOT NULL DEFAULT '',
    swarm_title TEXT NOT NULL DEFAULT '',
    result_summary TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bridge_state (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS swarm_messages (
    msg_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id TEXT NOT NULL,
    sender_slug TEXT NOT NULL,
    sender_name_vi TEXT NOT NULL,
    sender_dept_ids TEXT NOT NULL DEFAULT '',
    recipient_name_vi TEXT NOT NULL DEFAULT 'Toàn đội',
    msg_type TEXT NOT NULL DEFAULT 'UPDATE'
        CHECK(msg_type IN ('HANDOFF','UPDATE','CRITIQUE','QA_REPORT','DONE','APPROVAL')),
    content_vi TEXT NOT NULL,
    artifact_path TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_ledger (
    entry_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    entry_type TEXT NOT NULL CHECK(entry_type IN ('REVENUE','EXPENSE','TAX_RESERVE')),
    category TEXT NOT NULL DEFAULT 'Vận hành',
    title TEXT NOT NULL,
    amount_vnd REAL NOT NULL DEFAULT 0,
    is_estimate INTEGER NOT NULL DEFAULT 0,
    entry_date TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS installed_skills (
    skill_id TEXT PRIMARY KEY,
    skill_slug TEXT NOT NULL,
    title_vi TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    source_url TEXT NOT NULL DEFAULT '',
    division_code TEXT NOT NULL DEFAULT 'div1-strategy-intel',
    dept_ids_json TEXT NOT NULL DEFAULT '[]',
    category_vi TEXT NOT NULL DEFAULT 'Chuyên môn',
    summary_vi TEXT NOT NULL DEFAULT '',
    local_path TEXT NOT NULL DEFAULT '',
    installed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mission_steps_order ON mission_steps(mission_id, step_order ASC);
CREATE INDEX IF NOT EXISTS idx_opps_status ON opportunities(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ag_orders_status ON antigravity_orders(status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_swarm_msgs_msn ON swarm_messages(mission_id, msg_id DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_proj_date ON project_ledger(project_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_skills_div ON installed_skills(division_code, installed_at DESC);
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
            migrations = [
                "ALTER TABLE knowledge_atoms ADD COLUMN is_starred INTEGER NOT NULL DEFAULT 0;",
                "ALTER TABLE missions ADD COLUMN dispatch_state TEXT NOT NULL DEFAULT 'QUEUED_FOR_ANTIGRAVITY';",
                "ALTER TABLE missions ADD COLUMN swarm_title TEXT NOT NULL DEFAULT '';",
                "ALTER TABLE missions ADD COLUMN swarm_workers_json TEXT NOT NULL DEFAULT '[]';",
                "ALTER TABLE missions ADD COLUMN phase TEXT NOT NULL DEFAULT 'PROPOSAL';",
                "ALTER TABLE missions ADD COLUMN project_id TEXT NOT NULL DEFAULT '';",
                "ALTER TABLE mission_steps ADD COLUMN worker_name TEXT NOT NULL DEFAULT '';",
                "ALTER TABLE mission_steps ADD COLUMN artifact_path TEXT NOT NULL DEFAULT '';",
            ]
            for stmt in migrations:
                try:
                    conn.execute(stmt)
                except sqlite3.OperationalError:
                    pass
            # Upgrade antigravity_orders CHECK constraint if created before BUILD_PRODUCT existed
            ord_ddl = conn.execute(
                "SELECT sql FROM sqlite_master WHERE type='table' AND name='antigravity_orders'"
            ).fetchone()
            if ord_ddl and "BUILD_PRODUCT" not in (ord_ddl["sql"] or ""):
                old_rows = [dict(r) for r in conn.execute("SELECT * FROM antigravity_orders").fetchall()]
                conn.execute("DROP TABLE antigravity_orders;")
                conn.execute(
                    """
                    CREATE TABLE antigravity_orders (
                        order_id TEXT PRIMARY KEY,
                        order_type TEXT NOT NULL
                            CHECK(order_type IN ('NEW_MISSION','BUILD_PRODUCT','MISSION_REWORK','MISSION_APPROVED','SCAN_OPPORTUNITIES','EXECUTE_TASK')),
                        mission_id TEXT,
                        task_id TEXT,
                        title TEXT NOT NULL,
                        instructions TEXT NOT NULL DEFAULT '',
                        source_device TEXT NOT NULL DEFAULT 'web-local',
                        status TEXT NOT NULL DEFAULT 'PENDING'
                            CHECK(status IN ('PENDING','CLAIMED','RUNNING','COMPLETED','CANCELLED')),
                        claimed_by TEXT NOT NULL DEFAULT '',
                        swarm_title TEXT NOT NULL DEFAULT '',
                        result_summary TEXT NOT NULL DEFAULT '',
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    );
                    """
                )
                conn.execute("CREATE INDEX IF NOT EXISTS idx_ag_orders_status ON antigravity_orders(status, created_at ASC);")
                for r in old_rows:
                    conn.execute(
                        """
                        INSERT INTO antigravity_orders(
                            order_id, order_type, mission_id, task_id, title, instructions,
                            source_device, status, claimed_by, swarm_title, result_summary, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            r["order_id"], r["order_type"], r.get("mission_id"), r.get("task_id"),
                            r["title"], r.get("instructions", ""), r.get("source_device", "web-local"),
                            r.get("status", "PENDING"), r.get("claimed_by", ""), r.get("swarm_title", ""),
                            r.get("result_summary", ""), r["created_at"], r["updated_at"],
                        ),
                    )
        self.sync_divisions_and_roster()
        self.seed_default_opportunities_if_empty()
        self.seed_default_project_ledger_if_empty()

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

            # Seed Position 00 (Tổng Giám đốc)
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
                    CANONICAL_DEPT_TITLES_VI["00"],
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
                    clean_title = CANONICAL_DEPT_TITLES_VI.get(dept_id) or clean_department_title_vi(first_line)
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

            # Chuẩn hóa tên bước nhiệm vụ cũ và ghi chú cơ hội sang 100% tiếng Việt chuẩn
            step_title_by_order = {order: stitle for order, stitle, _, _, _ in self.DEFAULT_8_STEPS_TEMPLATE}
            legacy_step_markers = ("Pre-Mortem", "Code / Web / App", "Landing Page", "Tester đóng vai")
            for s_order, clean_stitle in step_title_by_order.items():
                for marker in legacy_step_markers:
                    conn.execute(
                        "UPDATE mission_steps SET title = ? WHERE step_order = ? AND title LIKE ?",
                        (clean_stitle, s_order, f"%{marker}%"),
                    )
            conn.execute(
                "UPDATE opportunities SET ux_note = REPLACE(ux_note, 'Tester Người dùng', 'Kiểm thử Khách hàng') WHERE ux_note LIKE '%Tester Người dùng%'"
            )
            conn.execute(
                "UPDATE swarm_messages SET sender_name_vi = 'Tổng Điều phối Điều hành' WHERE sender_name_vi = 'Tổng Điều Phối (CEO)'"
            )
            conn.execute(
                "UPDATE swarm_messages SET sender_name_vi = 'Kỹ sư Xây dựng Sản phẩm' WHERE sender_name_vi LIKE '%Code Web/App%'"
            )
            conn.execute(
                "UPDATE swarm_messages SET sender_name_vi = 'Kiểm thử viên Khách hàng thật' WHERE sender_name_vi LIKE 'Tester %'"
            )

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
        status: str = "ACTIVE",
    ) -> dict[str, Any]:
        clean_slug = re.sub(r"[^a-z0-9-]+", "-", slug.lower()).strip("-")
        if not clean_slug:
            raise ValueError("Slug dự án không hợp lệ.")
        now = utc_now_iso()
        proj_status = status.upper() if status.upper() in ("PLANNING", "ACTIVE", "PAUSED", "SHIPPED", "ARCHIVED") else "ACTIVE"
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
                ) VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?, ?, 1, ?, ?)
                ON CONFLICT(project_id) DO UPDATE SET
                    title=excluded.title,
                    objective=excluded.objective,
                    target_market=excluded.target_market,
                    status=excluded.status,
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
                    proj_status,
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
                ("01", "38", 1, 2, "CRITICAL", f"[{title}] Điều tra thị trường, độ khát và quy mô khách sẵn tiền"),
                ("02", "06", 1, 2, "HIGH", f"[{title}] Giải mã tâm lý sợ mất tiền và từ điển khách hàng"),
                ("38", "39", 1, 3, "CRITICAL", f"[{title}] Thẩm định hiệu quả kinh tế đơn vị, điểm hòa vốn và kịch bản xấu nhất"),
                ("06", "00", 2, 4, "HIGH", f"[{title}] Chốt đặc tả sản phẩm tinh gọn và luồng trải nghiệm 3 chạm trình Chủ tịch"),
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
        kanban_column: str = "BACKLOG",
    ) -> dict[str, Any]:
        now = utc_now_iso()
        tid = task_id or f"task-{uuid.uuid4().hex[:10]}"
        prio = priority.upper() if priority.upper() in ("CRITICAL", "HIGH", "MEDIUM", "LOW") else "HIGH"
        col = kanban_column.upper() if kanban_column.upper() in ("BACKLOG", "IN_PROGRESS", "QA_SECURITY_REVIEW", "WAITING_APPROVAL", "DONE", "REJECTED") else "BACKLOG"
        comp_at = now if col == "DONE" else None
        with self.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO tasks(
                    task_id, project_id, title, description, assigned_dept_id,
                    reviewer_dept_id, gate_number, stage_number, priority,
                    kanban_column, completed_at, version, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                """,
                (tid, project_id, title, description, assigned_dept_id, reviewer_dept_id, gate_number, stage_number, prio, col, comp_at, now, now),
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
            next_col_vi = KANBAN_LABELS_VI.get(next_col, next_col)
            self.log_event(
                actor_dept_id=dept_id,
                event_type=evt_type,
                headline_vi=f"Phòng {dept_id} nộp bàn giao '{title}' (Bằng chứng Cấp {evidence_level}) -> {next_col_vi}",
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
                    headline_vi=f"Yêu cầu sửa lại '{task_row['title']}' -> Đã ghi Sổ Tự Kiểm điểm rút kinh nghiệm cho Phòng {dept_id}",
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
            col_vi = KANBAN_LABELS_VI.get(col, col)
            self.log_event(
                actor_dept_id=row["assigned_dept_id"],
                event_type="TASK_TRANSITION",
                headline_vi=f"Chuyển trạng thái '{row['title']}' sang cột {col_vi}",
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
        skill_counts: dict[str, int] = {}
        for sk_row in conn.execute("SELECT dept_ids_json FROM installed_skills").fetchall():
            try:
                d_ids = json.loads(sk_row["dept_ids_json"] or "[]")
                if isinstance(d_ids, list):
                    for did in d_ids:
                        key = str(did).strip()
                        if key:
                            skill_counts[key] = skill_counts.get(key, 0) + 1
            except Exception:
                pass

        result = []
        for r in rows:
            item = dict(r)
            try:
                item["canonical_books"] = json.loads(item["canonical_books"])
            except Exception:
                item["canonical_books"] = []
            item["skills_count"] = skill_counts.get(item["dept_id"], 0)
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
        dept["installed_skills"] = self.list_installed_skills(dept_id=actual_id)
        dept["skills_count"] = len(dept["installed_skills"])
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
        title_vi: str | None = None,
    ) -> dict[str, Any]:
        now = utc_now_iso()
        detail = self.get_department_detail(dept_id)
        if not detail:
            raise KeyError(f"Không tìm thấy phòng ban '{dept_id}'.")
        actual_id = detail["dept_id"]

        hb_path = ROOT_DIR / detail["handbook_path"]
        if handbook_markdown is not None and handbook_markdown.strip():
            hb_path.parent.mkdir(parents=True, exist_ok=True)
            hb_path.write_text(handbook_markdown, encoding="utf-8")
        elif title_vi is not None and title_vi.strip() and hb_path.is_file():
            existing_md = hb_path.read_text(encoding="utf-8")
            updated_md = re.sub(
                r"^#\s+(PHÒNG|VỊ TRÍ)\s+#?\d+:\s*([^\n(]+)",
                lambda m: f"# {m.group(1)} {actual_id}: {title_vi.strip()} ",
                existing_md,
                count=1,
                flags=re.MULTILINE | re.IGNORECASE,
            )
            hb_path.write_text(updated_md, encoding="utf-8")

        with self.immediate_tx() as conn:
            if title_vi is not None and title_vi.strip():
                conn.execute(
                    "UPDATE departments SET title_vi = ?, version = version + 1, updated_at = ? WHERE dept_id = ?",
                    (title_vi.strip(), now, actual_id),
                )
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
        learning_runs = self.list_learning_runs(limit=20)
        installed_skills = self.list_installed_skills()
        project_ledger = self.list_project_ledger()
        finance_summary = self.get_corporate_finance_summary()
        latest_stamp_row = conn.execute(
            """
            SELECT MAX(ts) AS max_ts FROM (
                SELECT MAX(updated_at) AS ts FROM departments
                UNION ALL SELECT MAX(updated_at) AS ts FROM tasks
                UNION ALL SELECT MAX(updated_at) AS ts FROM projects
                UNION ALL SELECT MAX(updated_at) AS ts FROM missions
                UNION ALL SELECT MAX(updated_at) AS ts FROM opportunities
                UNION ALL SELECT MAX(updated_at) AS ts FROM antigravity_orders
                UNION ALL SELECT MAX(updated_at) AS ts FROM bridge_state
                UNION ALL SELECT MAX(created_at) AS ts FROM swarm_messages
                UNION ALL SELECT MAX(timestamp) AS ts FROM activity_stream
                UNION ALL SELECT MAX(fetched_at) AS ts FROM knowledge_atoms
                UNION ALL SELECT MAX(created_at) AS ts FROM project_ledger
                UNION ALL SELECT MAX(installed_at) AS ts FROM installed_skills
                UNION ALL SELECT MAX(COALESCE(finished_at, started_at)) AS ts FROM learning_runs
            )
            """
        ).fetchone()
        state_stamp = (latest_stamp_row["max_ts"] if latest_stamp_row and latest_stamp_row["max_ts"] else "2026-01-01T00:00:00Z")

        return {
            "generated_at": state_stamp,
            "bridge": self.get_bridge_status(),
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
                "total_installed_skills": len(installed_skills),
            },
            "divisions": divisions,
            "projects": self.list_projects(),
            "missions": self.list_missions(),
            "opportunities": self.list_opportunities(),
            "orders": self.list_orders(limit=30),
            "swarm_messages": self.list_swarm_messages(limit=80),
            "recent_events": events,
            "last_learning_run": dict(last_run) if last_run else None,
            "learning_runs": learning_runs,
            "learning_progress": {
                "running": False,
                "run_id": (last_run["run_id"] if last_run else ""),
                "scope": (last_run["scope"] if last_run else "all"),
                "sources_done": (int(last_run["sources_queried"]) if last_run else 0),
                "sources_total": (int(last_run["sources_queried"]) if last_run else 0),
                "current_source_vi": "",
                "new_atoms_added": (int(last_run["new_atoms_added"]) if last_run else 0),
                "duplicates_skipped": (int(last_run["duplicates_skipped"]) if last_run else 0),
                "errors_count": 0,
                "touched_depts": [],
                "started_at": (last_run["started_at"] if last_run else ""),
                "finished_at": (last_run["finished_at"] or "" if last_run else ""),
                "summary_vi": "",
            },
            "installed_skills": installed_skills,
            "project_ledger": project_ledger,
            "finance_summary": finance_summary,
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

    # =========================================================================
    # V6.1: 2-PHASE FULL-LIFECYCLE PIPELINE (GĐ 1: CHỐT KÈO → GĐ 2: SẢN XUẤT RA SẢN PHẨM CUỐI)
    # =========================================================================
    DEFAULT_8_STEPS_TEMPLATE: list[tuple[int, str, str, str, str]] = [
        (1, "[GĐ 1] Săn nhu cầu thật, đối thủ và tâm lý khách trả tiền", "01,02,03,50", "47", "49"),
        (2, "[GĐ 1] Tính vốn, giá bán, thuế và khóa biên lãi gộp >= 65%", "38,39", "46", "49"),
        (3, "[GĐ 1] Hội đồng phản biện rủi ro trước triển khai và chốt kiến trúc sản phẩm", "46,47,06,12", "47", "48"),
        (4, "[GĐ 1] Trình Chủ tịch duyệt chốt phương án để bắt đầu sản xuất", "00", "46", "48"),
        (5, "[GĐ 2] Lập trình và xây dựng sản phẩm cuối hoàn chỉnh", "13,14,15,16,17,19", "47", "49"),
        (6, "[GĐ 2] Đóng gói trang bán hàng, bảng giá, video và kịch bản kiếm 50 khách đầu", "25,26,29,32,33,40", "47", "48"),
        (7, "[GĐ 2] Kiểm thử viên đóng vai 5 nhóm khách hàng dùng thử thật và phản biện chốt lỗi", "48,49,20,23,47", "47", "48"),
        (8, "[GĐ 2] Bàn giao sản phẩm cuối hoàn chỉnh và kịch bản thu tiền cho Chủ tịch", "00,19,35", "46", "48"),
    ]
    DEFAULT_7_STEPS_TEMPLATE = DEFAULT_8_STEPS_TEMPLATE

    def _record_tombstone(self, conn: sqlite3.Connection, entity_type: str, entity_id: str, payload: dict[str, Any]) -> None:
        tkey = f"{entity_type}:{entity_id}"
        conn.execute(
            """
            INSERT INTO deleted_tombstones(tombstone_key, entity_type, entity_id, trash_payload_json, deleted_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(tombstone_key) DO UPDATE SET
                trash_payload_json=excluded.trash_payload_json,
                deleted_at=excluded.deleted_at
            """,
            (tkey, entity_type, entity_id, json.dumps(payload, ensure_ascii=False), utc_now_iso()),
        )

    def _clear_tombstone(self, conn: sqlite3.Connection, entity_type: str, entity_id: str) -> None:
        conn.execute("DELETE FROM deleted_tombstones WHERE tombstone_key = ?", (f"{entity_type}:{entity_id}",))

    def list_tombstones(self) -> list[dict[str, Any]]:
        conn = self._get_conn()
        rows = conn.execute("SELECT tombstone_key, entity_type, entity_id, deleted_at FROM deleted_tombstones").fetchall()
        return [dict(r) for r in rows]

    def seed_default_opportunities_if_empty(self) -> None:
        conn = self._get_conn()
        cnt = conn.execute("SELECT COUNT(*) FROM opportunities").fetchone()[0]
        tomb_cnt = conn.execute("SELECT COUNT(*) FROM deleted_tombstones WHERE entity_type = 'opportunity'").fetchone()[0]
        if cnt > 0 or tomb_cnt > 0:
            return
        now = utc_now_iso()
        seeds = [
            (
                "opp-rem-cua-3cham",
                "Công cụ ướm mẫu rèm & sàn gỗ thật vào phòng khách — Báo giá PDF 10 giây",
                "Chủ cửa hàng rèm cửa, sàn gỗ, giấy dán tường (399.000đ/tháng)",
                "Mang quyển mẫu vải nặng tới nhà khách vẫn khó hình dung, khách lưỡng lự về hỏi ý kiến gia đình rồi im luôn.",
                "Chụp ảnh cửa sổ trên Zalo/Web -> chạm chọn mã vải thật trong kho -> xuất ảnh phòng đã lắp rèm kèm báo giá chuẩn kích thước.",
                399000, 74.7, 5, 88,
                "Phòng #46 Phản biện: Không bán cho khách lẻ mua 1 lần; bán thuê bao tháng cho chủ tiệm để chốt 10-30 đơn/tháng.",
                "Phòng #48 Kiểm thử Khách hàng: Chủ tiệm 48 tuổi thao tác đúng 3 chạm trên điện thoại, không cần gõ chữ phức tạp.",
                "https://vnexpress.net/kinh-doanh",
            ),
            (
                "opp-tro-ly-thue-hkd",
                "Sổ thu chi và Cảnh báo ngưỡng thuế tự động cho Hộ kinh doanh và Chủ cửa hàng trực tuyến",
                "Chủ cửa hàng trực tuyến và Hộ kinh doanh cá thể (249.000đ/tháng)",
                "Sợ bị truy thu, phạt chậm nộp do quy định hóa đơn điện tử và khấu trừ thuế sàn thương mại điện tử mới thay đổi liên tục.",
                "Đồng bộ đơn hàng và sao kê -> tự bóc tách phần trăm dự phòng thuế vào két riêng, cảnh báo trước khi chạm ngưỡng.",
                249000, 82.5, 8, 91,
                "Phòng #46 Phản biện: Tuyệt đối không tư vấn lách luật; định vị là công cụ tính đúng và khoanh quỹ an toàn ngủ ngon.",
                "Phòng #48 Kiểm thử Khách hàng: Giao diện chỉ hiện 3 con số bằng tiếng Việt bình dân (Tiền về - Tiền cất đóng thuế - Tiền xài được).",
                "https://cafef.vn",
            ),
            (
                "opp-anh-menu-quan-an",
                "Biến ảnh chụp món ăn bằng điện thoại thành Bộ thực đơn và Video ngắn kéo khách địa phương",
                "Chủ quán ăn, tiệm bánh, quán cà phê mở mới (299.000đ/gói hoặc thuê bao)",
                "Thuê thợ chụp ảnh món ăn tốn 3-5 triệu/lần, tự chụp bằng điện thoại thì tối và kém hấp dẫn trên ứng dụng giao đồ ăn.",
                "Tải ảnh món thật -> làm sáng chuẩn phòng chụp giữ nguyên 100% kết cấu món thật (không bịa sai món) và ghép khung giá in ấn ngay.",
                299000, 78.2, 6, 84,
                "Phòng #46 Phản biện: Bắt buộc giữ nguyên hình dáng món ăn thật của quán để khách nhận đồ không khiếu nại sai thực tế.",
                "Phòng #48 Kiểm thử Khách hàng: Có nút so sánh Trước/Sau và tải tệp nét cao gửi nhà in chỉ bằng 1 chạm.",
                "https://vneconomy.vn",
            ),
        ]
        with self.immediate_tx() as wconn:
            for item in seeds:
                wconn.execute(
                    """
                    INSERT OR IGNORE INTO opportunities(
                        opp_id, title, target_customer, pain_point, proposed_solution,
                        price_vnd, est_margin_pct, breakeven_users, survival_score,
                        critique_note, ux_note, source_url, status, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?)
                    """,
                    (*item, now, now),
                )

    def list_opportunities(self, status: str | None = None) -> list[dict[str, Any]]:
        conn = self._get_conn()
        if status:
            rows = conn.execute(
                "SELECT * FROM opportunities WHERE status = ? ORDER BY survival_score DESC, updated_at DESC",
                (status.upper(),),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM opportunities ORDER BY CASE status WHEN 'NEW' THEN 0 WHEN 'ACCEPTED' THEN 1 ELSE 2 END, survival_score DESC, updated_at DESC").fetchall()
        return [dict(r) for r in rows]

    def create_opportunity(
        self,
        title: str,
        target_customer: str,
        pain_point: str = "",
        proposed_solution: str = "",
        price_vnd: float = 399000,
        est_margin_pct: float = 75.0,
        breakeven_users: int = 5,
        survival_score: int = 85,
        critique_note: str = "",
        ux_note: str = "",
        source_url: str = "",
        opp_id: str | None = None,
    ) -> dict[str, Any]:
        now = utc_now_iso()
        oid = opp_id or f"opp-{uuid.uuid4().hex[:8]}"
        with self.immediate_tx() as conn:
            self._clear_tombstone(conn, "opportunity", oid)
            conn.execute(
                """
                INSERT INTO opportunities(
                    opp_id, title, target_customer, pain_point, proposed_solution,
                    price_vnd, est_margin_pct, breakeven_users, survival_score,
                    critique_note, ux_note, source_url, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?)
                """,
                (
                    oid, title, target_customer, pain_point, proposed_solution,
                    float(price_vnd), float(est_margin_pct), int(breakeven_users), int(survival_score),
                    critique_note or "Phòng #46 đã rà soát sơ bộ tính khả thi thương mại.",
                    ux_note or "Phòng #48 yêu cầu thiết kế tối đa 3 chạm trên điện thoại.",
                    source_url, now, now,
                ),
            )
            self.log_event("50", "OPPORTUNITY_CREATED", f"Phòng #50 đề xuất cơ hội kiếm tiền mới: {title}", conn=conn)
        row = self._get_conn().execute("SELECT * FROM opportunities WHERE opp_id = ?", (oid,)).fetchone()
        return dict(row)

    def update_opportunity(self, opp_id: str, **fields: Any) -> dict[str, Any]:
        allowed = {
            "title", "target_customer", "pain_point", "proposed_solution",
            "price_vnd", "est_margin_pct", "breakeven_users", "survival_score",
            "critique_note", "ux_note", "source_url", "status",
        }
        updates = {k: v for k, v in fields.items() if k in allowed and v is not None}
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            cur = conn.execute("SELECT * FROM opportunities WHERE opp_id = ?", (opp_id,)).fetchone()
            if not cur:
                raise KeyError(f"Cơ hội '{opp_id}' không tồn tại.")
            if updates:
                cols = ", ".join(f"{k} = ?" for k in updates)
                conn.execute(
                    f"UPDATE opportunities SET {cols}, version = version + 1, updated_at = ? WHERE opp_id = ?",
                    [*updates.values(), now, opp_id],
                )
        return dict(self._get_conn().execute("SELECT * FROM opportunities WHERE opp_id = ?", (opp_id,)).fetchone())

    def delete_opportunity(self, opp_id: str) -> dict[str, Any]:
        with self.immediate_tx() as conn:
            row = conn.execute("SELECT * FROM opportunities WHERE opp_id = ?", (opp_id,)).fetchone()
            if not row:
                raise KeyError(f"Cơ hội '{opp_id}' không tồn tại.")
            payload = dict(row)
            self._record_tombstone(conn, "opportunity", opp_id, payload)
            conn.execute("DELETE FROM opportunities WHERE opp_id = ?", (opp_id,))
            self.log_event("00", "OPPORTUNITY_DELETED", f"Đã xóa đề xuất cơ hội: {payload['title']}", conn=conn)
        return {"deleted": True, "entity_type": "opportunity", "entity_id": opp_id, "title": payload["title"]}

    # -------------------------------------------------------------------------
    # MISSIONS & 7-STEP VISUAL PIPELINE TRACKER
    # -------------------------------------------------------------------------
    def _dept_short_map(self) -> dict[str, str]:
        conn = self._get_conn()
        return {r["dept_id"]: r["title_vi"] for r in conn.execute("SELECT dept_id, title_vi FROM departments").fetchall()}

    def _enrich_mission_steps(self, steps: list[dict[str, Any]], dept_map: dict[str, str]) -> list[dict[str, Any]]:
        out = []
        for s in steps:
            ids = [x.strip() for x in str(s.get("lead_dept_ids", "")).split(",") if x.strip()]
            s["lead_depts"] = [{"dept_id": i, "title_vi": dept_map.get(i, f"Phòng {i}")} for i in ids]
            s["critic_title_vi"] = dept_map.get(s.get("critic_dept_id", "47"), "Thanh tra Phản biện")
            s["ux_tester_title_vi"] = dept_map.get(s.get("ux_tester_dept_id", "48"), "Kiểm thử viên Khách hàng")
            out.append(s)
        return out

    def list_missions(self, status: str | None = None) -> list[dict[str, Any]]:
        conn = self._get_conn()
        dept_map = self._dept_short_map()
        if status:
            m_rows = conn.execute("SELECT * FROM missions WHERE status = ? ORDER BY created_at DESC", (status.upper(),)).fetchall()
        else:
            m_rows = conn.execute("SELECT * FROM missions ORDER BY created_at DESC").fetchall()
        missions = []
        for mr in m_rows:
            m = dict(mr)
            s_rows = conn.execute(
                "SELECT * FROM mission_steps WHERE mission_id = ? ORDER BY step_order ASC",
                (m["mission_id"],),
            ).fetchall()
            steps = self._enrich_mission_steps([dict(sr) for sr in s_rows], dept_map)
            m["steps"] = steps
            m["done_steps_count"] = sum(1 for s in steps if s["status"] == "DONE")
            m["running_step"] = next((s for s in steps if s["status"] in ("RUNNING", "WAITING_APPROVAL")), None)
            m["pending_steps_count"] = sum(1 for s in steps if s["status"] == "PENDING")
            missions.append(m)
        return missions

    def get_mission(self, mission_id: str) -> dict[str, Any] | None:
        conn = self._get_conn()
        mr = conn.execute("SELECT * FROM missions WHERE mission_id = ?", (mission_id,)).fetchone()
        if not mr:
            return None
        dept_map = self._dept_short_map()
        m = dict(mr)
        s_rows = conn.execute("SELECT * FROM mission_steps WHERE mission_id = ? ORDER BY step_order ASC", (mission_id,)).fetchall()
        steps = self._enrich_mission_steps([dict(sr) for sr in s_rows], dept_map)
        m["steps"] = steps
        m["done_steps_count"] = sum(1 for s in steps if s["status"] == "DONE")
        m["running_step"] = next((s for s in steps if s["status"] in ("RUNNING", "WAITING_APPROVAL")), None)
        m["pending_steps_count"] = sum(1 for s in steps if s["status"] == "PENDING")
        return m

    def create_mission(
        self,
        title: str,
        goal_prompt: str = "",
        category: str = "MONEY_MAKER",
        auto_approve: bool = False,
        mission_id: str | None = None,
        enqueue_order: bool = True,
        source_device: str = "web-local",
    ) -> dict[str, Any]:
        now = utc_now_iso()
        mid = mission_id or f"msn-{uuid.uuid4().hex[:8]}"
        order_id: str | None = None
        with self.immediate_tx() as conn:
            self._clear_tombstone(conn, "mission", mid)
            conn.execute(
                """
                INSERT INTO missions(
                    mission_id, title, goal_prompt, category, status, auto_approve,
                    current_step_order, total_steps, progress_pct, dispatch_state,
                    swarm_title, swarm_workers_json, phase, project_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 'RUNNING', ?, 1, ?, 0, 'QUEUED_FOR_ANTIGRAVITY', '', '[]', 'PROPOSAL', '', ?, ?)
                """,
                (mid, title, goal_prompt or title, category, 1 if auto_approve else 0, len(self.DEFAULT_8_STEPS_TEMPLATE), now, now),
            )
            for order, stitle, leads, critic, ux_tester in self.DEFAULT_8_STEPS_TEMPLATE:
                sid = f"{mid}-s{order}"
                init_note = (
                    "Đã gửi đề bài sang hệ thống điều phối AI, chờ đội ngũ chuyên gia nhận việc..."
                    if order == 1
                    else ""
                )
                conn.execute(
                    """
                    INSERT INTO mission_steps(
                        step_id, mission_id, step_order, title, lead_dept_ids,
                        critic_dept_id, ux_tester_dept_id, status, progress_pct,
                        live_activity_text, worker_name, artifact_path, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', 0, ?, '', '', ?)
                    """,
                    (sid, mid, order, stitle, leads, critic, ux_tester, init_note, now),
                )
            if enqueue_order:
                order_id = f"ord-{uuid.uuid4().hex[:8]}"
                conn.execute(
                    """
                    INSERT INTO antigravity_orders(
                        order_id, order_type, mission_id, task_id, title, instructions,
                        source_device, status, created_at, updated_at
                    ) VALUES (?, 'NEW_MISSION', ?, NULL, ?, ?, ?, 'PENDING', ?, ?)
                    """,
                    (order_id, mid, title, goal_prompt or title, source_device, now, now),
                )
            self.log_event(
                "00",
                "ORDER_QUEUED",
                f"Đã gửi nhiệm vụ sang hệ thống điều phối AI: {title}",
                detail={"mission_id": mid, "order_id": order_id},
                conn=conn,
            )
        msn = self.get_mission(mid)  # type: ignore[return-value]
        if msn is not None and order_id:
            msn["order_id"] = order_id
        return msn  # type: ignore[return-value]

    def accept_opportunity_into_mission(
        self, opp_id: str, auto_approve: bool = False, source_device: str = "web-local"
    ) -> dict[str, Any]:
        conn = self._get_conn()
        opp = conn.execute("SELECT * FROM opportunities WHERE opp_id = ?", (opp_id,)).fetchone()
        if not opp:
            raise KeyError(f"Cơ hội '{opp_id}' không tồn tại.")
        opp_d = dict(opp)
        msn = self.create_mission(
            title=opp_d["title"],
            goal_prompt=f"Khách hàng: {opp_d['target_customer']}. Nỗi đau: {opp_d['pain_point']}. Giải pháp: {opp_d['proposed_solution']}",
            category="MONEY_MAKER",
            auto_approve=auto_approve,
            enqueue_order=True,
            source_device=source_device,
        )
        with self.immediate_tx() as wconn:
            wconn.execute(
                "UPDATE opportunities SET status = 'ACCEPTED', mission_id = ?, version = version + 1, updated_at = ? WHERE opp_id = ?",
                (msn["mission_id"], utc_now_iso(), opp_id),
            )
        return msn

    def update_mission(self, mission_id: str, **fields: Any) -> dict[str, Any]:
        allowed = {
            "title", "goal_prompt", "status", "auto_approve", "final_summary",
            "survival_score", "ux_score", "expected_margin_pct",
            "dispatch_state", "swarm_title", "swarm_workers_json", "phase", "project_id",
        }
        updates = {k: v for k, v in fields.items() if k in allowed and v is not None}
        if "auto_approve" in updates:
            updates["auto_approve"] = 1 if bool(updates["auto_approve"]) else 0
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            row = conn.execute("SELECT * FROM missions WHERE mission_id = ?", (mission_id,)).fetchone()
            if not row:
                raise KeyError(f"Nhiệm vụ '{mission_id}' không tồn tại.")
            if updates:
                cols = ", ".join(f"{k} = ?" for k in updates)
                conn.execute(
                    f"UPDATE missions SET {cols}, version = version + 1, updated_at = ? WHERE mission_id = ?",
                    [*updates.values(), now, mission_id],
                )
        return self.get_mission(mission_id)  # type: ignore[return-value]

    def update_mission_step(self, step_id: str, **fields: Any) -> None:
        allowed = {
            "status", "progress_pct", "live_activity_text", "output_summary",
            "critique_verdict", "ux_verdict", "started_at", "completed_at",
            "worker_name", "artifact_path",
        }
        updates = {k: v for k, v in fields.items() if k in allowed and v is not None}
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            srow = conn.execute("SELECT * FROM mission_steps WHERE step_id = ?", (step_id,)).fetchone()
            if not srow:
                return
            mid = srow["mission_id"]
            if updates:
                cols = ", ".join(f"{k} = ?" for k in updates)
                conn.execute(
                    f"UPDATE mission_steps SET {cols}, updated_at = ? WHERE step_id = ?",
                    [*updates.values(), now, step_id],
                )
            all_steps = conn.execute("SELECT * FROM mission_steps WHERE mission_id = ? ORDER BY step_order ASC", (mid,)).fetchall()
            total = max(1, len(all_steps))
            total_prog = sum(
                100 if r["status"] == "DONE" else int(r["progress_pct"] or 0)
                for r in all_steps
            )
            overall_pct = min(100, int(round(total_prog / total)))
            active = next((r["step_order"] for r in all_steps if r["status"] != "DONE"), total)
            conn.execute(
                "UPDATE missions SET progress_pct = ?, current_step_order = ?, version = version + 1, updated_at = ? WHERE mission_id = ?",
                (overall_pct, active, now, mid),
            )

    def decide_mission(self, mission_id: str, decision: str, note: str = "") -> dict[str, Any]:
        """
        2-Phase Chairman Decision Gate:
        - Gate 1 (phase == 'PROPOSAL'):
            APPROVE -> Locks proposal (Steps 1–4 DONE), auto-scaffolds a real Project workspace,
                       transitions mission into phase='PRODUCTION' (Steps 5–8), and dispatches
                       a REAL `BUILD_PRODUCT` order to Antigravity Swarm so the full company builds
                       and tests the actual final product!
            REJECT  -> Reworks Steps 2–4 via `MISSION_REWORK` order.
        - Gate 2 (phase == 'PRODUCTION'):
            APPROVE -> Accepts finished product (Steps 1–8 DONE, phase='DELIVERED', status='COMPLETED',
                       linked project='SHIPPED').
            REJECT  -> Sends finished product back to Swarm Steps 5–8 via `MISSION_REWORK` order.
        """
        dec = decision.upper().strip()
        if dec not in ("APPROVE", "REJECT"):
            raise ValueError("Quyết định phải là APPROVE hoặc REJECT.")
        now = utc_now_iso()
        emitted_order_id: str | None = None
        mrow_pre = self._get_conn().execute("SELECT * FROM missions WHERE mission_id = ?", (mission_id,)).fetchone()
        if not mrow_pre:
            raise KeyError(f"Nhiệm vụ '{mission_id}' không tồn tại.")

        current_phase = str(mrow_pre["phase"] or "PROPOSAL").upper()
        total_steps = int(mrow_pre["total_steps"] or 8)
        is_proposal_gate = (current_phase == "PROPOSAL" and total_steps >= 8)

        # If approving Gate 1 (Proposal -> Production), auto-create real Project folder if not yet linked!
        linked_project_id = str(mrow_pre["project_id"] or "")
        linked_workspace = ""
        if dec == "APPROVE" and is_proposal_gate and not linked_project_id:
            slug_base = re.sub(r"[^a-z0-9]+", "-", mrow_pre["title"].lower()).strip("-")[:36] or mission_id
            proj = self.create_project(
                slug=f"{slug_base}-{mission_id[-4:]}",
                title=mrow_pre["title"],
                objective=mrow_pre["goal_prompt"] or mrow_pre["title"],
                status="ACTIVE",
                seed_gate1_tasks=False,
            )
            linked_project_id = proj["project_id"]
            linked_workspace = proj["workspace_path"]
        elif linked_project_id:
            existing_p = self.get_project(linked_project_id)
            if existing_p:
                linked_workspace = existing_p.get("workspace_path", "")

        with self.immediate_tx() as conn:
            mrow = conn.execute("SELECT * FROM missions WHERE mission_id = ?", (mission_id,)).fetchone()
            if not mrow:
                raise KeyError(f"Nhiệm vụ '{mission_id}' không tồn tại.")

            if dec == "APPROVE" and is_proposal_gate:
                # GATE 1 APPROVED -> LAUNCH FULL PRODUCTION PHASE 2 (BUILD_PRODUCT)!
                conn.execute(
                    "UPDATE mission_steps SET status = 'DONE', progress_pct = 100, completed_at = COALESCE(completed_at, ?), updated_at = ? WHERE mission_id = ? AND step_order <= 4",
                    (now, now, mission_id),
                )
                conn.execute(
                    "UPDATE mission_steps SET status = 'PENDING', progress_pct = 0, live_activity_text = ? WHERE mission_id = ? AND step_order = 5",
                    (f"Chủ tịch đã duyệt chốt phương án. Đang chuyển sang đội ngũ sản xuất sản phẩm thật tại `{linked_workspace}`...", mission_id),
                )
                conn.execute(
                    """
                    UPDATE missions
                    SET status = 'RUNNING', phase = 'PRODUCTION', dispatch_state = 'QUEUED_FOR_ANTIGRAVITY',
                        project_id = ?, current_step_order = 5, progress_pct = 50,
                        version = version + 1, updated_at = ?
                    WHERE mission_id = ?
                    """,
                    (linked_project_id, now, mission_id),
                )
                emitted_order_id = f"ord-{uuid.uuid4().hex[:8]}"
                build_instr = (
                    f"Chủ tịch ĐÃ DUYỆT CHỐT KÈO '{mrow['title']}' — BẮT ĐẦU GIAI ĐOẠN 2 SẢN XUẤT SẢN PHẨM CUỐI THẬT 100%!\n"
                    f"• Thư mục dự án: {linked_workspace} (project_id={linked_project_id})\n"
                    f"• Phương án đã duyệt: {mrow['final_summary'] or mrow['goal_prompt']}\n"
                    f"• Chỉ đạo thêm của Chủ tịch: {note or 'Làm hoàn chỉnh ra sản phẩm chạy được thật, bộ bán hàng thật và test trình duyệt thật rồi trình Bước 8.'}"
                )
                conn.execute(
                    """
                    INSERT INTO antigravity_orders(
                        order_id, order_type, mission_id, task_id, title, instructions,
                        source_device, status, created_at, updated_at
                    ) VALUES (?, 'BUILD_PRODUCT', ?, NULL, ?, ?, 'web-local', 'PENDING', ?, ?)
                    """,
                    (emitted_order_id, mission_id, f"[Sản xuất SP cuối] {mrow['title']}", build_instr, now, now),
                )
                self.log_event(
                    "00",
                    "PRODUCTION_LAUNCHED",
                    f"Chủ tịch duyệt chốt phương án '{mrow['title']}' -> Đã phát lệnh sản xuất sản phẩm cuối!",
                    detail={"mission_id": mission_id, "project_id": linked_project_id, "order_id": emitted_order_id},
                    conn=conn,
                )
            elif dec == "APPROVE":
                # GATE 2 APPROVED -> FINAL PRODUCT ACCEPTED & SHIPPED!
                conn.execute(
                    "UPDATE mission_steps SET status = 'DONE', progress_pct = 100, completed_at = COALESCE(completed_at, ?), updated_at = ? WHERE mission_id = ?",
                    (now, now, mission_id),
                )
                summary = mrow["final_summary"]
                if note:
                    summary = f"{summary}\n• Ghi chú nghiệm thu sản phẩm của Chủ tịch: {note}".strip()
                conn.execute(
                    "UPDATE missions SET status = 'COMPLETED', phase = 'DELIVERED', dispatch_state = 'COMPLETED', progress_pct = 100, final_summary = ?, version = version + 1, updated_at = ? WHERE mission_id = ?",
                    (summary, now, mission_id),
                )
                if linked_project_id:
                    conn.execute("UPDATE projects SET status = 'SHIPPED', updated_at = ? WHERE project_id = ?", (now, linked_project_id))
                conn.execute(
                    "UPDATE antigravity_orders SET status = 'COMPLETED', result_summary = 'Chủ tịch đã nghiệm thu sản phẩm cuối 100%', updated_at = ? WHERE mission_id = ? AND status IN ('PENDING','CLAIMED','RUNNING')",
                    (now, mission_id),
                )
                self.log_event("00", "MISSION_APPROVED", f"Chủ tịch NGHIỆM THU SẢN PHẨM CUỐI hoàn tất 100%: {mrow['title']}", conn=conn)
            else:
                reason = note or "Chủ tịch yêu cầu chỉnh sửa và hoàn thiện kỹ hơn."
                ref_id = f"refl-{uuid.uuid4().hex[:8]}"
                conn.execute(
                    "INSERT INTO reflexions(reflexion_id, dept_id, failure_symptom, root_cause, preventive_rule, created_at) VALUES (?, '00', ?, 'Chưa thỏa mãn kỳ vọng Chủ tịch', ?, ?)",
                    (ref_id, reason, f"Bắt buộc khắc phục yêu cầu '{reason}' trước khi trình lại.", now),
                )
                reset_from = 2 if is_proposal_gate else 5
                reset_pct = 15 if is_proposal_gate else 50
                conn.execute(
                    "UPDATE mission_steps SET status = 'PENDING', progress_pct = 0, live_activity_text = ? WHERE mission_id = ? AND step_order >= ?",
                    (f"Đã gửi yêu cầu làm lại cho đội ngũ thực thi: {reason}", mission_id, reset_from),
                )
                conn.execute(
                    "UPDATE missions SET status = 'RUNNING', dispatch_state = 'QUEUED_FOR_ANTIGRAVITY', current_step_order = ?, progress_pct = ?, version = version + 1, updated_at = ? WHERE mission_id = ?",
                    (reset_from, reset_pct, now, mission_id),
                )
                emitted_order_id = f"ord-{uuid.uuid4().hex[:8]}"
                conn.execute(
                    """
                    INSERT INTO antigravity_orders(
                        order_id, order_type, mission_id, task_id, title, instructions,
                        source_device, status, created_at, updated_at
                    ) VALUES (?, 'MISSION_REWORK', ?, NULL, ?, ?, 'web-local', 'PENDING', ?, ?)
                    """,
                    (emitted_order_id, mission_id, f"[Làm lại GĐ {1 if is_proposal_gate else 2}] {mrow['title']}", reason, now, now),
                )
                self.log_event(
                    "47",
                    "MISSION_REJECTED",
                    f"Đã gửi yêu cầu sửa lại (từ Bước {reset_from}) cho đội ngũ thực thi: {mrow['title']}",
                    detail={"mission_id": mission_id, "order_id": emitted_order_id, "reason": reason},
                    conn=conn,
                )
        res = self.get_mission(mission_id)  # type: ignore[return-value]
        if res is not None and emitted_order_id:
            res["order_id"] = emitted_order_id
        return res  # type: ignore[return-value]

    def delete_mission(self, mission_id: str) -> dict[str, Any]:
        full = self.get_mission(mission_id)
        if not full:
            raise KeyError(f"Nhiệm vụ '{mission_id}' không tồn tại.")
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            self._record_tombstone(conn, "mission", mission_id, full)
            conn.execute(
                "UPDATE antigravity_orders SET status = 'CANCELLED', updated_at = ? WHERE mission_id = ? AND status IN ('PENDING','CLAIMED','RUNNING')",
                (now, mission_id),
            )
            conn.execute("DELETE FROM mission_steps WHERE mission_id = ?", (mission_id,))
            conn.execute("DELETE FROM missions WHERE mission_id = ?", (mission_id,))
            self.log_event("00", "MISSION_DELETED", f"Đã xóa nhiệm vụ: {full['title']}", conn=conn)
        return {"deleted": True, "entity_type": "mission", "entity_id": mission_id, "title": full["title"]}

    # -------------------------------------------------------------------------
    # ANTIGRAVITY DIRECT SWARM BRIDGE (ORDERS QUEUE + LIVE HEARTBEAT)
    # -------------------------------------------------------------------------
    def enqueue_order(
        self,
        order_type: str,
        title: str,
        instructions: str = "",
        mission_id: str | None = None,
        task_id: str | None = None,
        source_device: str = "web-local",
        order_id: str | None = None,
    ) -> dict[str, Any]:
        otype = order_type.upper().strip()
        if otype not in ("NEW_MISSION", "BUILD_PRODUCT", "MISSION_REWORK", "MISSION_APPROVED", "SCAN_OPPORTUNITIES", "EXECUTE_TASK"):
            raise ValueError(f"Loại lệnh không hợp lệ: {otype}")
        now = utc_now_iso()
        oid = order_id or f"ord-{uuid.uuid4().hex[:8]}"
        with self.immediate_tx() as conn:
            conn.execute(
                """
                INSERT OR IGNORE INTO antigravity_orders(
                    order_id, order_type, mission_id, task_id, title, instructions,
                    source_device, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
                """,
                (oid, otype, mission_id, task_id, title.strip(), instructions.strip() or title.strip(), source_device, now, now),
            )
            otype_vi = ORDER_TYPE_LABELS_VI.get(otype, otype)
            self.log_event(
                "00",
                "ORDER_QUEUED",
                f"Đã chuyển lệnh ({otype_vi}) sang hệ thống điều phối AI: {title.strip()}",
                detail={"order_id": oid, "order_type": otype, "mission_id": mission_id, "task_id": task_id},
                conn=conn,
            )
        row = self._get_conn().execute("SELECT * FROM antigravity_orders WHERE order_id = ?", (oid,)).fetchone()
        return dict(row)

    def list_orders(self, status: str | None = None, limit: int = 30) -> list[dict[str, Any]]:
        conn = self._get_conn()
        if status:
            rows = conn.execute(
                "SELECT * FROM antigravity_orders WHERE status = ? ORDER BY created_at DESC LIMIT ?",
                (status.upper(), limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM antigravity_orders ORDER BY created_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [dict(r) for r in rows]

    def get_order(self, order_id: str) -> dict[str, Any] | None:
        row = self._get_conn().execute("SELECT * FROM antigravity_orders WHERE order_id = ?", (order_id,)).fetchone()
        return dict(row) if row else None

    def claim_next_pending_order(self, claimed_by: str = "antigravity-coordinator") -> dict[str, Any] | None:
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            row = conn.execute(
                "SELECT * FROM antigravity_orders WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 1"
            ).fetchone()
            if not row:
                return None
            oid = row["order_id"]
            conn.execute(
                "UPDATE antigravity_orders SET status = 'CLAIMED', claimed_by = ?, updated_at = ? WHERE order_id = ?",
                (claimed_by, now, oid),
            )
            if row["mission_id"]:
                conn.execute(
                    "UPDATE missions SET dispatch_state = 'SWARM_ACTIVE', version = version + 1, updated_at = ? WHERE mission_id = ?",
                    (now, row["mission_id"]),
                )
            self.log_event(
                "00",
                "ORDER_CLAIMED",
                f"Hệ thống điều phối AI đã tiếp nhận lệnh: {row['title']}",
                detail={"order_id": oid, "mission_id": row["mission_id"], "claimed_by": claimed_by},
                conn=conn,
            )
        return self.get_order(oid)

    def complete_order(
        self,
        order_id: str,
        result_summary: str = "",
        status: str = "COMPLETED",
        swarm_title: str = "",
    ) -> dict[str, Any]:
        st = status.upper().strip()
        if st not in ("RUNNING", "COMPLETED", "CANCELLED"):
            raise ValueError(f"Trạng thái lệnh không hợp lệ: {st}")
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            row = conn.execute("SELECT * FROM antigravity_orders WHERE order_id = ?", (order_id,)).fetchone()
            if not row:
                raise KeyError(f"Đơn hàng '{order_id}' không tồn tại.")
            conn.execute(
                "UPDATE antigravity_orders SET status = ?, result_summary = COALESCE(NULLIF(?, ''), result_summary), swarm_title = COALESCE(NULLIF(?, ''), swarm_title), updated_at = ? WHERE order_id = ?",
                (st, result_summary, swarm_title, now, order_id),
            )
        return self.get_order(order_id)  # type: ignore[return-value]

    def set_bridge_heartbeat(
        self,
        online: bool = True,
        pid: int | None = None,
        swarm_title: str | None = None,
        active_workers: list[str] | None = None,
        note: str = "",
    ) -> dict[str, Any]:
        now = utc_now_iso()
        existing = self.get_bridge_status()
        payload = {
            "online_flag": bool(online),
            "pid": pid if pid is not None else existing.get("pid"),
            "swarm_title": swarm_title if swarm_title is not None else existing.get("swarm_title", ""),
            "active_workers": active_workers if active_workers is not None else existing.get("active_workers", []),
            "note": note or existing.get("note", ""),
            "last_heartbeat_at": now if online else "",
        }
        with self.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO bridge_state(key, value_json, updated_at)
                VALUES ('antigravity_bridge', ?, ?)
                ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
                """,
                (json.dumps(payload, ensure_ascii=False), now),
            )
        return self.get_bridge_status()

    def get_bridge_status(self, stale_after_sec: int = 25) -> dict[str, Any]:
        conn = self._get_conn()
        row = conn.execute("SELECT value_json, updated_at FROM bridge_state WHERE key = 'antigravity_bridge'").fetchone()
        pending_cnt = conn.execute("SELECT COUNT(*) FROM antigravity_orders WHERE status = 'PENDING'").fetchone()[0]
        active_cnt = conn.execute("SELECT COUNT(*) FROM antigravity_orders WHERE status IN ('CLAIMED','RUNNING')").fetchone()[0]
        if not row:
            return {
                "online": False,
                "mode": "ANTIGRAVITY_SWARM",
                "pid": None,
                "swarm_title": "",
                "active_workers": [],
                "note": "Chưa bật cầu nối điều phối trực tuyến",
                "last_heartbeat_at": "",
                "pending_orders_count": int(pending_cnt),
                "active_orders_count": int(active_cnt),
            }
        try:
            data = json.loads(row["value_json"])
        except Exception:
            data = {}
        hb_str = str(data.get("last_heartbeat_at") or "")
        is_online = False
        if bool(data.get("online_flag")) and hb_str:
            try:
                hb_dt = datetime.fromisoformat(hb_str.replace("Z", "+00:00"))
                age_sec = (datetime.now(timezone.utc) - hb_dt).total_seconds()
                is_online = age_sec <= stale_after_sec
            except Exception:
                is_online = False
        return {
            "online": is_online,
            "mode": "ANTIGRAVITY_SWARM",
            "pid": data.get("pid"),
            "swarm_title": str(data.get("swarm_title") or ""),
            "active_workers": list(data.get("active_workers") or []),
            "note": str(data.get("note") or ""),
            "last_heartbeat_at": hb_str,
            "pending_orders_count": int(pending_cnt),
            "active_orders_count": int(active_cnt),
        }

    def set_departments_activity(self, dept_ids: list[str], status: str, increment_done: bool = False) -> None:
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            for did in dept_ids:
                if status == "IDLE":
                    busy_step = conn.execute(
                        "SELECT 1 FROM mission_steps WHERE status = 'RUNNING' AND (',' || lead_dept_ids || ',') LIKE ?",
                        (f"%,{did},%",),
                    ).fetchone()
                    if increment_done:
                        conn.execute(
                            "UPDATE departments SET tasks_completed = tasks_completed + 1, updated_at = ? WHERE dept_id = ?",
                            (now, did),
                        )
                    if not busy_step:
                        conn.execute(
                            "UPDATE departments SET status = CASE WHEN current_task_id IS NULL THEN 'IDLE' ELSE status END, last_heartbeat_at = ?, updated_at = ? WHERE dept_id = ?",
                            (now, now, did),
                        )
                else:
                    conn.execute(
                        "UPDATE departments SET status = ?, last_heartbeat_at = ?, updated_at = ? WHERE dept_id = ?",
                        (status, now, now, did),
                    )

    # -------------------------------------------------------------------------
    # VIETNAMESE LIVE SWARM ROOM (BẢNG TRAO ĐỔI TRỰC TIẾP 100% TIẾNG VIỆT)
    # -------------------------------------------------------------------------
    def post_swarm_message(
        self,
        mission_id: str,
        sender_slug: str,
        sender_name_vi: str,
        content_vi: str,
        recipient_name_vi: str = "Toàn đội",
        sender_dept_ids: str = "",
        msg_type: str = "UPDATE",
        artifact_path: str = "",
    ) -> dict[str, Any]:
        mtype = msg_type.upper().strip()
        if mtype not in ("HANDOFF", "UPDATE", "CRITIQUE", "QA_REPORT", "DONE", "APPROVAL"):
            mtype = "UPDATE"
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            cur = conn.execute(
                """
                INSERT INTO swarm_messages(
                    mission_id, sender_slug, sender_name_vi, sender_dept_ids,
                    recipient_name_vi, msg_type, content_vi, artifact_path, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    mission_id,
                    sender_slug.strip() or "@dieu-phoi",
                    sender_name_vi.strip() or "Tổng Điều Phối",
                    sender_dept_ids.strip(),
                    recipient_name_vi.strip() or "Toàn đội",
                    mtype,
                    content_vi.strip(),
                    artifact_path.strip(),
                    now,
                ),
            )
            msg_id = int(cur.lastrowid)
            first_dept = sender_dept_ids.split(",")[0].strip() if sender_dept_ids else "00"
            self.log_event(
                first_dept or "00",
                "SWARM_MSG",
                f"[{sender_name_vi} → {recipient_name_vi}] {content_vi[:120]}",
                detail={"mission_id": mission_id, "msg_id": msg_id, "msg_type": mtype},
                conn=conn,
            )
        row = self._get_conn().execute("SELECT * FROM swarm_messages WHERE msg_id = ?", (msg_id,)).fetchone()
        return dict(row)

    def list_swarm_messages(self, mission_id: str | None = None, limit: int = 80) -> list[dict[str, Any]]:
        conn = self._get_conn()
        if mission_id:
            rows = conn.execute(
                "SELECT * FROM swarm_messages WHERE mission_id = ? ORDER BY msg_id ASC LIMIT ?",
                (mission_id, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM (SELECT * FROM swarm_messages ORDER BY msg_id DESC LIMIT ?) ORDER BY msg_id ASC",
                (limit,),
            ).fetchall()
        return [dict(r) for r in rows]

    def bulk_missions_action(self, action: str, mission_ids: list[str] | None = None) -> dict[str, Any]:
        act = action.lower().strip()
        conn = self._get_conn()
        if act == "clear_completed":
            ids = [r["mission_id"] for r in conn.execute("SELECT mission_id FROM missions WHERE status = 'COMPLETED'").fetchall()]
        else:
            ids = list(mission_ids or [])
        affected = 0
        deleted_ids: list[str] = []
        for mid in ids:
            try:
                if act in ("delete", "clear_completed"):
                    self.delete_mission(mid)
                    deleted_ids.append(mid)
                    affected += 1
                elif act == "approve":
                    self.decide_mission(mid, "APPROVE")
                    affected += 1
            except KeyError:
                pass
        return {"action": act, "affected": affected, "deleted_ids": deleted_ids}

    # -------------------------------------------------------------------------
    # FULL CRUD, DUPLICATE, BULK & UNDO FOR TASKS, PROJECTS, KNOWLEDGE & EVENTS
    # -------------------------------------------------------------------------
    def update_task(self, task_id: str, **fields: Any) -> dict[str, Any]:
        allowed = {
            "title", "description", "assigned_dept_id", "project_id",
            "reviewer_dept_id", "gate_number", "stage_number", "priority",
            "kanban_column", "approval_note",
        }
        updates = {k: v for k, v in fields.items() if k in allowed and v is not None}
        if "priority" in updates:
            p = str(updates["priority"]).upper()
            updates["priority"] = p if p in ("CRITICAL", "HIGH", "MEDIUM", "LOW") else "HIGH"
        if "kanban_column" in updates:
            c = str(updates["kanban_column"]).upper()
            if c not in ("BACKLOG", "IN_PROGRESS", "QA_SECURITY_REVIEW", "WAITING_APPROVAL", "DONE", "REJECTED"):
                raise ValueError(f"Cột không hợp lệ: {c}")
            updates["kanban_column"] = c
            if c == "DONE":
                updates["completed_at"] = utc_now_iso()
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,)).fetchone()
            if not row:
                raise KeyError(f"Đầu việc '{task_id}' không tồn tại.")
            was_done = row["kanban_column"] == "DONE"
            if updates:
                if updates.get("kanban_column") == "DONE":
                    updates["checkout_lock_owner"] = None
                cols = ", ".join(f"{k} = ?" for k in updates)
                conn.execute(
                    f"UPDATE tasks SET {cols}, actor_priority = 5, version = version + 1, updated_at = ? WHERE task_id = ?",
                    [*updates.values(), now, task_id],
                )
                if updates.get("kanban_column") == "DONE" and not was_done:
                    target_dept = updates.get("assigned_dept_id") or row["assigned_dept_id"]
                    conn.execute(
                        "UPDATE departments SET tasks_completed = tasks_completed + 1, status = CASE WHEN current_task_id = ? THEN 'IDLE' ELSE status END, current_task_id = CASE WHEN current_task_id = ? THEN NULL ELSE current_task_id END WHERE dept_id = ?",
                        (task_id, task_id, target_dept),
                    )
        return self.get_task(task_id)  # type: ignore[return-value]

    def delete_task(self, task_id: str) -> dict[str, Any]:
        full = self.get_task(task_id)
        if not full:
            raise KeyError(f"Đầu việc '{task_id}' không tồn tại.")
        with self.immediate_tx() as conn:
            self._record_tombstone(conn, "task", task_id, full)
            conn.execute("UPDATE departments SET status = 'IDLE', current_task_id = NULL WHERE current_task_id = ?", (task_id,))
            conn.execute("DELETE FROM task_citations WHERE task_id = ?", (task_id,))
            conn.execute("DELETE FROM deliverables WHERE task_id = ?", (task_id,))
            conn.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))
            self.log_event("00", "TASK_DELETED", f"Đã xóa đầu việc: {full['title']}", conn=conn)
        return {"deleted": True, "entity_type": "task", "entity_id": task_id, "title": full["title"]}

    def duplicate_task(self, task_id: str) -> dict[str, Any]:
        orig = self.get_task(task_id)
        if not orig:
            raise KeyError(f"Đầu việc '{task_id}' không tồn tại.")
        return self.create_task(
            title=f"{orig['title']} (Bản sao)",
            assigned_dept_id=orig["assigned_dept_id"],
            description=orig.get("description", ""),
            project_id=orig.get("project_id"),
            reviewer_dept_id=orig.get("reviewer_dept_id") or "20",
            gate_number=int(orig.get("gate_number") or 1),
            stage_number=int(orig.get("stage_number") or 1),
            priority=orig.get("priority") or "HIGH",
        )

    def bulk_tasks_action(
        self,
        action: str,
        task_ids: list[str] | None = None,
        column: str | None = None,
        assigned_dept_id: str | None = None,
    ) -> dict[str, Any]:
        act = action.lower().strip()
        conn = self._get_conn()
        if act == "clear_done":
            ids = [r["task_id"] for r in conn.execute("SELECT task_id FROM tasks WHERE kanban_column = 'DONE'").fetchall()]
        else:
            ids = list(task_ids or [])
        affected = 0
        deleted_ids: list[str] = []
        for tid in ids:
            try:
                if act in ("delete", "clear_done"):
                    self.delete_task(tid)
                    deleted_ids.append(tid)
                    affected += 1
                elif act == "move_column" and column:
                    self.update_task(tid, kanban_column=column)
                    affected += 1
                elif act == "assign_dept" and assigned_dept_id:
                    self.update_task(tid, assigned_dept_id=assigned_dept_id)
                    affected += 1
                elif act == "approve":
                    self.chairman_decide_task(tid, "APPROVE")
                    affected += 1
            except KeyError:
                pass
        return {"action": act, "affected": affected, "deleted_ids": deleted_ids}

    def update_project(self, project_id: str, **fields: Any) -> dict[str, Any]:
        allowed = {"title", "objective", "target_market", "status", "expected_price_vnd", "unit_cost_vnd", "fixed_cost_monthly_vnd"}
        updates = {k: v for k, v in fields.items() if k in allowed and v is not None}
        now = utc_now_iso()
        with self.immediate_tx() as conn:
            row = conn.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,)).fetchone()
            if not row:
                raise KeyError(f"Dự án '{project_id}' không tồn tại.")
            if updates:
                cols = ", ".join(f"{k} = ?" for k in updates)
                conn.execute(
                    f"UPDATE projects SET {cols}, version = version + 1, updated_at = ? WHERE project_id = ?",
                    [*updates.values(), now, project_id],
                )
        return self.get_project(project_id)  # type: ignore[return-value]

    def delete_project(self, project_id: str, delete_tasks: bool = True) -> dict[str, Any]:
        proj = self.get_project(project_id)
        if not proj:
            raise KeyError(f"Dự án '{project_id}' không tồn tại.")
        tasks_in_proj = self.list_tasks(project_id=project_id)
        ledger_in_proj = self.list_project_ledger(project_id=project_id)
        backup = {"project": proj, "tasks": tasks_in_proj, "ledger": ledger_in_proj}
        with self.immediate_tx() as conn:
            self._record_tombstone(conn, "project", project_id, backup)
            if delete_tasks:
                for t in tasks_in_proj:
                    tid = t["task_id"]
                    conn.execute("DELETE FROM task_citations WHERE task_id = ?", (tid,))
                    conn.execute("DELETE FROM deliverables WHERE task_id = ?", (tid,))
                conn.execute("DELETE FROM tasks WHERE project_id = ?", (project_id,))
            else:
                conn.execute("UPDATE tasks SET project_id = NULL WHERE project_id = ?", (project_id,))
            conn.execute("DELETE FROM project_ledger WHERE project_id = ?", (project_id,))
            conn.execute("DELETE FROM projects WHERE project_id = ?", (project_id,))
            self.log_event("00", "PROJECT_DELETED", f"Đã xóa dự án: {proj['title']}", conn=conn)
        return {"deleted": True, "entity_type": "project", "entity_id": project_id, "title": proj["title"]}

    def toggle_star_knowledge(self, atom_id: int, is_starred: bool | None = None) -> dict[str, Any]:
        with self.immediate_tx() as conn:
            row = conn.execute("SELECT * FROM knowledge_atoms WHERE atom_id = ?", (int(atom_id),)).fetchone()
            if not row:
                raise KeyError(f"Bài báo #{atom_id} không tồn tại.")
            next_val = (0 if row["is_starred"] else 1) if is_starred is None else (1 if is_starred else 0)
            conn.execute("UPDATE knowledge_atoms SET is_starred = ? WHERE atom_id = ?", (next_val, int(atom_id)))
            updated = conn.execute("SELECT * FROM knowledge_atoms WHERE atom_id = ?", (int(atom_id),)).fetchone()
        return dict(updated)

    def delete_knowledge_atom(self, atom_id: int) -> dict[str, Any]:
        with self.immediate_tx() as conn:
            row = conn.execute("SELECT * FROM knowledge_atoms WHERE atom_id = ?", (int(atom_id),)).fetchone()
            if not row:
                raise KeyError(f"Bài báo #{atom_id} không tồn tại.")
            payload = dict(row)
            self._record_tombstone(conn, "article", str(payload["url_hash"]), payload)
            conn.execute("DELETE FROM knowledge_atoms WHERE atom_id = ?", (int(atom_id),))
            conn.execute(
                "UPDATE departments SET articles_learned = (SELECT COUNT(*) FROM knowledge_atoms ka WHERE ka.dept_id = ?) WHERE dept_id = ?",
                (payload["dept_id"], payload["dept_id"]),
            )
        return {"deleted": True, "entity_type": "article", "entity_id": str(payload["url_hash"]), "title": payload["title"]}

    def delete_department_custom(self, dept_id: str) -> dict[str, Any]:
        num = int(dept_id) if dept_id.isdigit() else 0
        if 0 <= num <= 50:
            raise ValueError("51 vị trí cốt lõi (00..50) được bảo vệ không thể xóa; chỉ có thể giải thể phòng tuyển thêm (#51+).")
        detail = self.get_department_detail(dept_id)
        if not detail:
            raise KeyError(f"Phòng '{dept_id}' không tồn tại.")
        hb_path = ROOT_DIR / detail["handbook_path"]
        if hb_path.is_file() and hb_path.resolve().is_relative_to(ROOT_DIR.resolve()):
            hb_path.unlink(missing_ok=True)
        with self.immediate_tx() as conn:
            conn.execute("UPDATE tasks SET assigned_dept_id = '00' WHERE assigned_dept_id = ?", (dept_id,))
            conn.execute("DELETE FROM departments WHERE dept_id = ?", (dept_id,))
            self.log_event("45", "DEPT_REMOVED", f"Đã giải thể phòng chuyên gia tùy chỉnh #{dept_id} ({detail['title_vi']})", conn=conn)
        return {"deleted": True, "dept_id": dept_id}

    def delete_reflexion(self, reflexion_id: str) -> dict[str, Any]:
        with self.immediate_tx() as conn:
            conn.execute("DELETE FROM reflexions WHERE reflexion_id = ?", (reflexion_id,))
        return {"deleted": True, "reflexion_id": reflexion_id}

    def clear_activity_events(self) -> dict[str, Any]:
        with self.immediate_tx() as conn:
            cur = conn.execute("DELETE FROM activity_stream")
        return {"cleared": cur.rowcount}

    def restore_from_trash(self, entity_type: str, entity_id: str) -> dict[str, Any]:
        tkey = f"{entity_type}:{entity_id}"
        conn = self._get_conn()
        trow = conn.execute("SELECT * FROM deleted_tombstones WHERE tombstone_key = ?", (tkey,)).fetchone()
        if not trow:
            raise KeyError("Không tìm thấy dữ liệu hoàn tác cho mục này.")
        data = json.loads(trow["trash_payload_json"])
        now = utc_now_iso()

        with self.immediate_tx() as wconn:
            if entity_type == "task":
                wconn.execute(
                    """
                    INSERT OR REPLACE INTO tasks(
                        task_id, project_id, title, description, assigned_dept_id,
                        reviewer_dept_id, gate_number, stage_number, priority,
                        kanban_column, approval_note, version, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        data["task_id"], data.get("project_id"), data["title"], data.get("description", ""),
                        data.get("assigned_dept_id", "00"), data.get("reviewer_dept_id", "20"),
                        int(data.get("gate_number", 1)), int(data.get("stage_number", 1)),
                        data.get("priority", "HIGH"), data.get("kanban_column", "BACKLOG"),
                        data.get("approval_note", ""), int(data.get("version", 1)) + 1,
                        data.get("created_at", now), now,
                    ),
                )
            elif entity_type == "mission":
                wconn.execute(
                    """
                    INSERT OR REPLACE INTO missions(
                        mission_id, title, goal_prompt, category, status, auto_approve,
                        current_step_order, total_steps, progress_pct, final_summary,
                        survival_score, ux_score, expected_margin_pct, version, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        data["mission_id"], data["title"], data.get("goal_prompt", ""),
                        data.get("category", "MONEY_MAKER"), data.get("status", "RUNNING"),
                        int(data.get("auto_approve", 0)), int(data.get("current_step_order", 1)),
                        int(data.get("total_steps", 7)), int(data.get("progress_pct", 0)),
                        data.get("final_summary", ""), int(data.get("survival_score", 85)),
                        int(data.get("ux_score", 90)), float(data.get("expected_margin_pct", 74.0)),
                        int(data.get("version", 1)) + 1, data.get("created_at", now), now,
                    ),
                )
                for s in data.get("steps", []):
                    wconn.execute(
                        """
                        INSERT OR REPLACE INTO mission_steps(
                            step_id, mission_id, step_order, title, lead_dept_ids,
                            critic_dept_id, ux_tester_dept_id, status, progress_pct,
                            live_activity_text, output_summary, critique_verdict, ux_verdict,
                            started_at, completed_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            s["step_id"], data["mission_id"], int(s["step_order"]), s["title"],
                            s["lead_dept_ids"], s.get("critic_dept_id", "47"), s.get("ux_tester_dept_id", "48"),
                            s["status"], int(s.get("progress_pct", 0)), s.get("live_activity_text", ""),
                            s.get("output_summary", ""), s.get("critique_verdict", ""), s.get("ux_verdict", ""),
                            s.get("started_at"), s.get("completed_at"), now,
                        ),
                    )
            elif entity_type == "opportunity":
                wconn.execute(
                    """
                    INSERT OR REPLACE INTO opportunities(
                        opp_id, title, target_customer, pain_point, proposed_solution,
                        price_vnd, est_margin_pct, breakeven_users, survival_score,
                        critique_note, ux_note, source_url, status, mission_id, version, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        data["opp_id"], data["title"], data["target_customer"], data.get("pain_point", ""),
                        data.get("proposed_solution", ""), float(data.get("price_vnd", 399000)),
                        float(data.get("est_margin_pct", 75.0)), int(data.get("breakeven_users", 5)),
                        int(data.get("survival_score", 85)), data.get("critique_note", ""),
                        data.get("ux_note", ""), data.get("source_url", ""), data.get("status", "NEW"),
                        data.get("mission_id"), int(data.get("version", 1)) + 1, data.get("created_at", now), now,
                    ),
                )
            elif entity_type == "project":
                p = data["project"]
                wconn.execute(
                    """
                    INSERT OR REPLACE INTO projects(
                        project_id, slug, title, objective, target_market, current_gate, current_stage,
                        status, expected_price_vnd, unit_cost_vnd, fixed_cost_monthly_vnd,
                        workspace_path, version, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        p["project_id"], p["slug"], p["title"], p.get("objective", ""),
                        p.get("target_market", "Vietnam"), int(p.get("current_gate", 1)),
                        int(p.get("current_stage", 1)), p.get("status", "ACTIVE"),
                        float(p.get("expected_price_vnd", 399000)), float(p.get("unit_cost_vnd", 95000)),
                        float(p.get("fixed_cost_monthly_vnd", 1500000)), p.get("workspace_path", ""),
                        int(p.get("version", 1)) + 1, p.get("created_at", now), now,
                    ),
                )
                for t in data.get("tasks", []):
                    wconn.execute(
                        """
                        INSERT OR IGNORE INTO tasks(
                            task_id, project_id, title, description, assigned_dept_id,
                            reviewer_dept_id, gate_number, stage_number, priority,
                            kanban_column, version, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            t["task_id"], p["project_id"], t["title"], t.get("description", ""),
                            t.get("assigned_dept_id", "00"), t.get("reviewer_dept_id", "20"),
                            int(t.get("gate_number", 1)), int(t.get("stage_number", 1)),
                            t.get("priority", "HIGH"), t.get("kanban_column", "BACKLOG"), 1,
                            t.get("created_at", now), now,
                        ),
                    )
                for lg in data.get("ledger", []):
                    wconn.execute(
                        """
                        INSERT OR IGNORE INTO project_ledger(
                            entry_id, project_id, entry_type, category, title,
                            amount_vnd, is_estimate, entry_date, note, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            lg["entry_id"], p["project_id"], lg["entry_type"],
                            lg.get("category", "Vận hành"), lg["title"],
                            float(lg.get("amount_vnd", 0)), int(lg.get("is_estimate", 0)),
                            lg.get("entry_date", now[:10]), lg.get("note", ""),
                            lg.get("created_at", now),
                        ),
                    )
            elif entity_type == "ledger":
                wconn.execute(
                    """
                    INSERT OR REPLACE INTO project_ledger(
                        entry_id, project_id, entry_type, category, title,
                        amount_vnd, is_estimate, entry_date, note, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        data["entry_id"], data["project_id"], data["entry_type"],
                        data.get("category", "Vận hành"), data["title"],
                        float(data.get("amount_vnd", 0)), int(data.get("is_estimate", 0)),
                        data.get("entry_date", now[:10]), data.get("note", ""),
                        data.get("created_at", now),
                    ),
                )
            elif entity_type == "article":
                wconn.execute(
                    """
                    INSERT OR IGNORE INTO knowledge_atoms(
                        url_hash, source_connector, dept_id, division_code, title, url,
                        published_at, fetched_at, summary_vi, actionable_insight, importance, tags, is_starred
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        data["url_hash"], data["source_connector"], data["dept_id"], data["division_code"],
                        data["title"], data["url"], data["published_at"], data["fetched_at"],
                        data["summary_vi"], data["actionable_insight"], int(data.get("importance", 6)),
                        data.get("tags", ""), int(data.get("is_starred", 0)),
                    ),
                )
                wconn.execute(
                    "UPDATE departments SET articles_learned = (SELECT COUNT(*) FROM knowledge_atoms ka WHERE ka.dept_id = ?) WHERE dept_id = ?",
                    (data["dept_id"], data["dept_id"]),
                )
            elif entity_type == "doc":
                doc_path = (ROOT_DIR / data["full_rel_path"]).resolve()
                if doc_path.is_relative_to(ROOT_DIR.resolve()):
                    doc_path.parent.mkdir(parents=True, exist_ok=True)
                    doc_path.write_text(data.get("content", ""), encoding="utf-8")
            self._clear_tombstone(wconn, entity_type, entity_id)
            etype_vi = ENTITY_TYPE_LABELS_VI.get(entity_type, entity_type)
            self.log_event("00", "ITEM_RESTORED", f"Đã hoàn tác khôi phục {etype_vi} vừa xóa", conn=wconn)
        return {"restored": True, "entity_type": entity_type, "entity_id": entity_id}

    def restore_batch_from_trash(self, items: list[dict[str, str]]) -> dict[str, Any]:
        restored = 0
        for item in items:
            try:
                self.restore_from_trash(str(item.get("entity_type", "")), str(item.get("entity_id", "")))
                restored += 1
            except KeyError:
                pass
        return {"restored": True, "count": restored}

    # =========================================================================
    # V8.0: LEARNING HISTORY, INSTALLED GITHUB SKILLS & PER-PROJECT FINANCE LEDGER
    # =========================================================================
    def list_learning_runs(self, limit: int = 20) -> list[dict[str, Any]]:
        conn = self._get_conn()
        safe_limit = max(1, min(100, int(limit)))
        rows = conn.execute(
            "SELECT * FROM learning_runs ORDER BY started_at DESC LIMIT ?",
            (safe_limit,),
        ).fetchall()
        return [dict(r) for r in rows]

    @staticmethod
    def _normalize_dept_ids(dept_ids: list[str] | tuple[str, ...] | set[str] | str | None) -> list[str]:
        if dept_ids is None:
            return []
        if isinstance(dept_ids, str):
            raw = dept_ids.strip()
            if raw.startswith("["):
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, list):
                        dept_ids = parsed
                    else:
                        dept_ids = [raw]
                except Exception:
                    dept_ids = [x.strip() for x in raw.split(",") if x.strip()]
            else:
                dept_ids = [x.strip() for x in raw.split(",") if x.strip()]
        seen: list[str] = []
        for item in dept_ids:
            s = str(item).strip()
            if not s:
                continue
            if s.isdigit() and len(s) < 2:
                s = s.zfill(2)
            if s not in seen:
                seen.append(s)
        return seen

    def upsert_installed_skill(
        self,
        skill_id: str,
        skill_slug: str,
        title_vi: str,
        repo_name: str,
        source_url: str = "",
        division_code: str = "div1-strategy-intel",
        dept_ids: list[str] | str | None = None,
        category_vi: str = "Chuyên môn",
        summary_vi: str = "",
        local_path: str = "",
        installed_at: str | None = None,
    ) -> dict[str, Any]:
        sid = str(skill_id).strip()
        if not sid:
            raise ValueError("Mã kỹ năng skill_id không được để trống.")
        norm_depts = self._normalize_dept_ids(dept_ids)
        dept_json = json.dumps(norm_depts, ensure_ascii=False)
        ts = installed_at or utc_now_iso()
        with self.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO installed_skills(
                    skill_id, skill_slug, title_vi, repo_name, source_url,
                    division_code, dept_ids_json, category_vi, summary_vi, local_path, installed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(skill_id) DO UPDATE SET
                    skill_slug = excluded.skill_slug,
                    title_vi = excluded.title_vi,
                    repo_name = excluded.repo_name,
                    source_url = excluded.source_url,
                    division_code = excluded.division_code,
                    dept_ids_json = excluded.dept_ids_json,
                    category_vi = excluded.category_vi,
                    summary_vi = excluded.summary_vi,
                    local_path = excluded.local_path,
                    installed_at = excluded.installed_at
                """,
                (
                    sid,
                    str(skill_slug).strip() or sid,
                    str(title_vi).strip() or str(skill_slug).strip(),
                    str(repo_name).strip() or "github",
                    str(source_url).strip(),
                    str(division_code).strip() or "div1-strategy-intel",
                    dept_json,
                    str(category_vi).strip() or "Chuyên môn",
                    str(summary_vi).strip(),
                    str(local_path).strip(),
                    ts,
                ),
            )
        row = self._get_conn().execute("SELECT * FROM installed_skills WHERE skill_id = ?", (sid,)).fetchone()
        out = dict(row)
        out["dept_ids"] = norm_depts
        return out

    def list_installed_skills(
        self,
        dept_id: str | None = None,
        division_code: str | None = None,
        query: str = "",
    ) -> list[dict[str, Any]]:
        conn = self._get_conn()
        clauses = ["1=1"]
        params: list[Any] = []
        if division_code and division_code.strip() and division_code.strip() != "all":
            clauses.append("division_code = ?")
            params.append(division_code.strip())

        rows = conn.execute(
            f"SELECT * FROM installed_skills WHERE {' AND '.join(clauses)} ORDER BY installed_at DESC, skill_slug ASC",
            params,
        ).fetchall()

        norm_target_dept = ""
        if dept_id and dept_id.strip() and dept_id.strip() != "all":
            raw_d = dept_id.strip()
            norm_target_dept = raw_d.zfill(2) if raw_d.isdigit() and len(raw_d) < 2 else raw_d
        q_lower = (query or "").strip().lower()

        result: list[dict[str, Any]] = []
        for r in rows:
            item = dict(r)
            try:
                parsed = json.loads(item.get("dept_ids_json") or "[]")
                item["dept_ids"] = [str(x).strip() for x in parsed] if isinstance(parsed, list) else []
            except Exception:
                item["dept_ids"] = []
            if norm_target_dept and norm_target_dept not in item["dept_ids"]:
                continue
            if q_lower:
                haystack = " ".join(
                    [
                        item.get("title_vi", ""),
                        item.get("skill_slug", ""),
                        item.get("repo_name", ""),
                        item.get("category_vi", ""),
                        item.get("summary_vi", ""),
                    ]
                ).lower()
                if q_lower not in haystack:
                    continue
            result.append(item)
        return result

    def seed_default_project_ledger_if_empty(self) -> None:
        conn = self._get_conn()
        cnt = conn.execute("SELECT COUNT(*) FROM project_ledger").fetchone()[0]
        tomb_cnt = conn.execute("SELECT COUNT(*) FROM deleted_tombstones WHERE entity_type = 'ledger'").fetchone()[0]
        if cnt > 0 or tomb_cnt > 0:
            return

        existing_ids = {r["project_id"] for r in conn.execute("SELECT project_id FROM projects").fetchall()}
        if not existing_ids:
            return

        now = utc_now_iso()
        today = now[:10]
        plan_seeds: list[tuple[str, str, str, str, str, float, int, str, str]] = []

        if "proj-so-thu-chi-thue-hkd" in existing_ids:
            plan_seeds.extend(
                [
                    (
                        "led-plan-hkd-infra",
                        "proj-so-thu-chi-thue-hkd",
                        "EXPENSE",
                        "Hạ tầng và tên miền",
                        "Dự toán chi phí hạ tầng máy chủ, tên miền và chứng chỉ bảo mật tháng đầu",
                        450000.0,
                        1,
                        today,
                        "Kế hoạch dự toán ban đầu (chưa phát sinh thu chi thực tế)",
                    ),
                    (
                        "led-plan-hkd-ai",
                        "proj-so-thu-chi-thue-hkd",
                        "EXPENSE",
                        "Vận hành AI",
                        "Dự toán chi phí xử lý AI theo hạn mức 50 khách đầu (gói 249.000đ)",
                        1050000.0,
                        1,
                        today,
                        "Tính theo kịch bản trung bình 60% hạn mức sử dụng",
                    ),
                    (
                        "led-plan-hkd-launch",
                        "proj-so-thu-chi-thue-hkd",
                        "EXPENSE",
                        "Kiểm định và ra mắt",
                        "Dự toán kiểm định chất lượng, nội dung giới thiệu và tiếp cận 50 khách đầu",
                        1500000.0,
                        1,
                        today,
                        "Kế hoạch dự toán cho giai đoạn mở bán đợt 1",
                    ),
                    (
                        "led-plan-hkd-rev",
                        "proj-so-thu-chi-thue-hkd",
                        "REVENUE",
                        "Thuê bao gói cơ bản",
                        "Mục tiêu doanh thu dự toán 50 chủ shop đầu tiên (249.000đ/tháng)",
                        12450000.0,
                        1,
                        today,
                        "Kế hoạch dự toán mục tiêu, tách biệt hoàn toàn với doanh thu thực tế",
                    ),
                    (
                        "led-plan-hkd-tax",
                        "proj-so-thu-chi-thue-hkd",
                        "TAX_RESERVE",
                        "Dự phòng thuế",
                        "Dự phòng thuế theo kế hoạch 7% trên doanh thu mục tiêu 50 khách",
                        871500.0,
                        1,
                        today,
                        "Trích dự phòng tuân thủ nghĩa vụ thuế hộ kinh doanh",
                    ),
                ]
            )

        if "proj-rem-cua-ai" in existing_ids:
            plan_seeds.extend(
                [
                    (
                        "led-plan-rem-infra",
                        "proj-rem-cua-ai",
                        "EXPENSE",
                        "Hạ tầng và xử lý ảnh",
                        "Dự toán chi phí máy chủ ảnh và xử lý ướm mẫu AI tháng đầu",
                        1500000.0,
                        1,
                        today,
                        "Kế hoạch dự toán hạ tầng cơ bản",
                    ),
                    (
                        "led-plan-rem-mkt",
                        "proj-rem-cua-ai",
                        "EXPENSE",
                        "Tiếp cận khách hàng",
                        "Dự toán chi phí tiếp cận chủ tiệm rèm cửa và sàn gỗ đợt đầu",
                        1200000.0,
                        1,
                        today,
                        "Kế hoạch dự toán thử nghiệm bán hàng",
                    ),
                    (
                        "led-plan-rem-rev",
                        "proj-rem-cua-ai",
                        "REVENUE",
                        "Thuê bao cửa hàng",
                        "Mục tiêu doanh thu dự toán 30 cửa hàng tháng đầu (399.000đ/tháng)",
                        11970000.0,
                        1,
                        today,
                        "Kế hoạch dự toán mục tiêu (thực thu hiện tại = 0đ)",
                    ),
                    (
                        "led-plan-rem-tax",
                        "proj-rem-cua-ai",
                        "TAX_RESERVE",
                        "Dự phòng thuế",
                        "Dự phòng thuế theo kế hoạch 7% trên doanh thu mục tiêu 30 cửa hàng",
                        837900.0,
                        1,
                        today,
                        "Quỹ dự phòng thuế theo kế hoạch",
                    ),
                ]
            )

        if not plan_seeds:
            return

        with self.immediate_tx() as wconn:
            for item in plan_seeds:
                wconn.execute(
                    """
                    INSERT OR IGNORE INTO project_ledger(
                        entry_id, project_id, entry_type, category, title,
                        amount_vnd, is_estimate, entry_date, note, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (*item, now),
                )

    def list_project_ledger(self, project_id: str | None = None) -> list[dict[str, Any]]:
        conn = self._get_conn()
        if project_id:
            rows = conn.execute(
                """
                SELECT pl.*, p.title AS project_title, p.slug AS project_slug
                FROM project_ledger pl
                LEFT JOIN projects p ON p.project_id = pl.project_id
                WHERE pl.project_id = ?
                ORDER BY pl.entry_date DESC, pl.created_at DESC
                """,
                (project_id,),
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT pl.*, p.title AS project_title, p.slug AS project_slug
                FROM project_ledger pl
                LEFT JOIN projects p ON p.project_id = pl.project_id
                ORDER BY pl.entry_date DESC, pl.created_at DESC
                """
            ).fetchall()
        out: list[dict[str, Any]] = []
        for r in rows:
            item = dict(r)
            item["is_estimate"] = bool(item.get("is_estimate"))
            out.append(item)
        return out

    def add_project_ledger_entry(
        self,
        project_id: str,
        entry_type: str,
        category: str,
        title: str,
        amount_vnd: float,
        entry_date: str | None = None,
        note: str = "",
        is_estimate: bool = False,
        entry_id: str | None = None,
    ) -> dict[str, Any]:
        proj = self.get_project(project_id)
        if not proj:
            raise KeyError(f"Dự án '{project_id}' không tồn tại.")
        etype = str(entry_type or "").upper().strip()
        if etype not in ("REVENUE", "EXPENSE", "TAX_RESERVE"):
            raise ValueError("Loại bút toán phải là REVENUE, EXPENSE hoặc TAX_RESERVE.")
        clean_title = str(title or "").strip()
        if not clean_title:
            raise ValueError("Nội dung bút toán không được để trống.")
        amt = float(amount_vnd)
        if amt < 0:
            raise ValueError("Số tiền bút toán không được là số âm.")
        now = utc_now_iso()
        edate = str(entry_date or "").strip() or now[:10]
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", edate):
            edate = now[:10]
        eid = str(entry_id).strip() if entry_id else f"led-{uuid.uuid4().hex[:10]}"
        cat = str(category or "").strip() or "Vận hành"
        est_flag = 1 if bool(is_estimate) else 0

        with self.immediate_tx() as conn:
            self._clear_tombstone(conn, "ledger", eid)
            conn.execute(
                """
                INSERT INTO project_ledger(
                    entry_id, project_id, entry_type, category, title,
                    amount_vnd, is_estimate, entry_date, note, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (eid, project_id, etype, cat, clean_title, round(amt, 2), est_flag, edate, str(note or "").strip(), now),
            )
            etype_vi = LEDGER_TYPE_LABELS_VI.get(etype, etype)
            mode_vi = "Dự toán" if est_flag else "Thực tế"
            self.log_event(
                actor_dept_id="37",
                event_type="LEDGER_ADDED",
                headline_vi=f"Ghi sổ {etype_vi} ({mode_vi}) cho '{proj['title']}': {clean_title} ({int(round(amt)):,}đ)",
                project_id=project_id,
                detail={"entry_id": eid, "entry_type": etype, "amount_vnd": round(amt, 2), "is_estimate": bool(est_flag)},
                conn=conn,
            )
        row = self._get_conn().execute(
            """
            SELECT pl.*, p.title AS project_title, p.slug AS project_slug
            FROM project_ledger pl
            LEFT JOIN projects p ON p.project_id = pl.project_id
            WHERE pl.entry_id = ?
            """,
            (eid,),
        ).fetchone()
        res = dict(row)
        res["is_estimate"] = bool(res.get("is_estimate"))
        return res

    def update_project_ledger_entry(self, entry_id: str, **fields: Any) -> dict[str, Any]:
        allowed = {"entry_type", "category", "title", "amount_vnd", "is_estimate", "entry_date", "note"}
        updates: dict[str, Any] = {}
        for k, v in fields.items():
            if k not in allowed or v is None:
                continue
            if k == "entry_type":
                et = str(v).upper().strip()
                if et not in ("REVENUE", "EXPENSE", "TAX_RESERVE"):
                    raise ValueError("Loại bút toán phải là REVENUE, EXPENSE hoặc TAX_RESERVE.")
                updates[k] = et
            elif k == "amount_vnd":
                amt = float(v)
                if amt < 0:
                    raise ValueError("Số tiền bút toán không được là số âm.")
                updates[k] = round(amt, 2)
            elif k == "is_estimate":
                updates[k] = 1 if bool(v) else 0
            elif k == "title":
                t = str(v).strip()
                if not t:
                    raise ValueError("Nội dung bút toán không được để trống.")
                updates[k] = t
            elif k == "entry_date":
                ed = str(v).strip()
                if re.match(r"^\d{4}-\d{2}-\d{2}$", ed):
                    updates[k] = ed
            else:
                updates[k] = str(v).strip()

        with self.immediate_tx() as conn:
            cur = conn.execute("SELECT * FROM project_ledger WHERE entry_id = ?", (entry_id,)).fetchone()
            if not cur:
                raise KeyError(f"Bút toán tài chính '{entry_id}' không tồn tại.")
            if updates:
                cols = ", ".join(f"{k} = ?" for k in updates)
                conn.execute(
                    f"UPDATE project_ledger SET {cols} WHERE entry_id = ?",
                    [*updates.values(), entry_id],
                )
        row = self._get_conn().execute(
            """
            SELECT pl.*, p.title AS project_title, p.slug AS project_slug
            FROM project_ledger pl
            LEFT JOIN projects p ON p.project_id = pl.project_id
            WHERE pl.entry_id = ?
            """,
            (entry_id,),
        ).fetchone()
        res = dict(row)
        res["is_estimate"] = bool(res.get("is_estimate"))
        return res

    def delete_project_ledger_entry(self, entry_id: str) -> dict[str, Any]:
        with self.immediate_tx() as conn:
            row = conn.execute("SELECT * FROM project_ledger WHERE entry_id = ?", (entry_id,)).fetchone()
            if not row:
                raise KeyError(f"Bút toán tài chính '{entry_id}' không tồn tại.")
            payload = dict(row)
            self._record_tombstone(conn, "ledger", entry_id, payload)
            conn.execute("DELETE FROM project_ledger WHERE entry_id = ?", (entry_id,))
            self.log_event(
                actor_dept_id="37",
                event_type="LEDGER_DELETED",
                headline_vi=f"Đã xóa bút toán tài chính: {payload['title']}",
                project_id=payload["project_id"],
                conn=conn,
            )
        return {
            "deleted": True,
            "entity_type": "ledger",
            "entity_id": entry_id,
            "project_id": payload["project_id"],
            "title": payload["title"],
        }

    @staticmethod
    def _discover_project_preview_urls(slug: str, workspace_path: str = "") -> list[dict[str, str]]:
        """Tìm ứng dụng và trang bán hàng đã sản xuất trong corporate_hq/projects/<slug>/ bằng đường dẫn tương đối."""
        previews: list[dict[str, str]] = []
        base_dir = ROOT_DIR / "corporate_hq" / "projects" / slug
        if not base_dir.is_dir() and workspace_path:
            alt = ROOT_DIR / workspace_path
            if alt.is_dir():
                base_dir = alt
        if not base_dir.is_dir():
            return previews

        if (base_dir / "app" / "index.html").is_file():
            previews.append(
                {
                    "label": "Mở ứng dụng trực tiếp",
                    "url": f"./projects/{slug}/app/index.html",
                    "kind": "app",
                }
            )
        elif (base_dir / "index.html").is_file():
            previews.append(
                {
                    "label": "Mở sản phẩm trực tiếp",
                    "url": f"./projects/{slug}/index.html",
                    "kind": "app",
                }
            )
        if (base_dir / "go-to-market" / "landing" / "index.html").is_file():
            previews.append(
                {
                    "label": "Mở trang bán hàng",
                    "url": f"./projects/{slug}/go-to-market/landing/index.html",
                    "kind": "landing",
                }
            )
        return previews

    def get_project_finance_summary(self, project_id: str) -> dict[str, Any]:
        proj = self.get_project(project_id)
        if not proj:
            raise KeyError(f"Dự án '{project_id}' không tồn tại.")

        conn = self._get_conn()
        ledger = self.list_project_ledger(project_id=project_id)

        actual_rev = 0.0
        actual_exp = 0.0
        actual_tax = 0.0
        plan_rev = 0.0
        plan_exp = 0.0
        plan_tax = 0.0

        monthly_map: dict[str, dict[str, Any]] = {}
        cat_map: dict[tuple[str, str], dict[str, Any]] = {}

        for row in ledger:
            amt = float(row.get("amount_vnd") or 0.0)
            etype = str(row.get("entry_type") or "EXPENSE").upper()
            is_est = bool(row.get("is_estimate"))
            month = str(row.get("entry_date") or "")[:7] or utc_now_iso()[:7]
            cat = str(row.get("category") or "Vận hành")

            m_bucket = monthly_map.setdefault(
                month,
                {
                    "month": month,
                    "revenue": 0.0,
                    "expense": 0.0,
                    "tax": 0.0,
                    "profit": 0.0,
                    "plan_revenue": 0.0,
                    "plan_expense": 0.0,
                    "plan_tax": 0.0,
                    "plan_profit": 0.0,
                },
            )
            c_bucket = cat_map.setdefault(
                (cat, etype),
                {
                    "category": cat,
                    "entry_type": etype,
                    "amount_vnd": 0.0,
                    "actual_vnd": 0.0,
                    "plan_vnd": 0.0,
                },
            )
            c_bucket["amount_vnd"] += amt
            if is_est:
                c_bucket["plan_vnd"] += amt
                if etype == "REVENUE":
                    plan_rev += amt
                    m_bucket["plan_revenue"] += amt
                elif etype == "EXPENSE":
                    plan_exp += amt
                    m_bucket["plan_expense"] += amt
                elif etype == "TAX_RESERVE":
                    plan_tax += amt
                    m_bucket["plan_tax"] += amt
            else:
                c_bucket["actual_vnd"] += amt
                if etype == "REVENUE":
                    actual_rev += amt
                    m_bucket["revenue"] += amt
                elif etype == "EXPENSE":
                    actual_exp += amt
                    m_bucket["expense"] += amt
                elif etype == "TAX_RESERVE":
                    actual_tax += amt
                    m_bucket["tax"] += amt

        monthly_series: list[dict[str, Any]] = []
        for m_key in sorted(monthly_map.keys()):
            b = monthly_map[m_key]
            b["revenue"] = round(b["revenue"], 2)
            b["expense"] = round(b["expense"], 2)
            b["tax"] = round(b["tax"], 2)
            b["profit"] = round(b["revenue"] - b["expense"] - b["tax"], 2)
            b["plan_revenue"] = round(b["plan_revenue"], 2)
            b["plan_expense"] = round(b["plan_expense"], 2)
            b["plan_tax"] = round(b["plan_tax"], 2)
            b["plan_profit"] = round(b["plan_revenue"] - b["plan_expense"] - b["plan_tax"], 2)
            monthly_series.append(b)

        by_category = sorted(
            [
                {
                    "category": v["category"],
                    "entry_type": v["entry_type"],
                    "amount_vnd": round(v["amount_vnd"], 2),
                    "actual_vnd": round(v["actual_vnd"], 2),
                    "plan_vnd": round(v["plan_vnd"], 2),
                }
                for v in cat_map.values()
            ],
            key=lambda x: x["amount_vnd"],
            reverse=True,
        )

        price = float(proj.get("expected_price_vnd") or 0.0)
        unit_cost = float(proj.get("unit_cost_vnd") or 0.0)
        fixed_cost = float(proj.get("fixed_cost_monthly_vnd") or 0.0)
        gross_margin_pct = round(((price - unit_cost) / price * 100.0), 2) if price > 0 else 0.0
        net_per_user = price - unit_cost - (price * 0.07)
        breakeven_customers = math.ceil(fixed_cost / net_per_user) if (net_per_user > 0 and fixed_cost > 0) else (0 if fixed_cost == 0 else -1)
        target_100_mrr = round(price * 100.0, 2)

        t_row = conn.execute(
            """
            SELECT COUNT(*) AS total_tasks,
                   SUM(CASE WHEN kanban_column = 'DONE' THEN 1 ELSE 0 END) AS done_tasks
            FROM tasks
            WHERE project_id = ?
            """,
            (project_id,),
        ).fetchone()
        tasks_total = int(t_row["total_tasks"] or 0)
        tasks_done = int(t_row["done_tasks"] or 0)

        m_rows = conn.execute(
            "SELECT progress_pct FROM missions WHERE project_id = ?",
            (project_id,),
        ).fetchall()
        missions_count = len(m_rows)
        if tasks_total > 0:
            progress_pct = int(round((tasks_done / tasks_total) * 100))
        elif missions_count > 0:
            progress_pct = int(round(sum(int(r["progress_pct"] or 0) for r in m_rows) / missions_count))
        elif str(proj.get("status", "")).upper() == "SHIPPED":
            progress_pct = 100
        else:
            progress_pct = 0

        return {
            "project_id": proj["project_id"],
            "slug": proj["slug"],
            "title": proj["title"],
            "status": proj["status"],
            "target_market": proj["target_market"],
            "expected_price_vnd": round(price, 2),
            "unit_cost_vnd": round(unit_cost, 2),
            "fixed_cost_monthly_vnd": round(fixed_cost, 2),
            "actual_revenue_vnd": round(actual_rev, 2),
            "actual_expense_vnd": round(actual_exp, 2),
            "actual_tax_vnd": round(actual_tax, 2),
            "actual_net_profit_vnd": round(actual_rev - actual_exp - actual_tax, 2),
            "plan_revenue_vnd": round(plan_rev, 2),
            "plan_expense_vnd": round(plan_exp, 2),
            "plan_tax_vnd": round(plan_tax, 2),
            "plan_net_profit_vnd": round(plan_rev - plan_exp - plan_tax, 2),
            "gross_margin_pct": gross_margin_pct,
            "breakeven_customers": breakeven_customers,
            "target_100_mrr_vnd": target_100_mrr,
            "monthly_series": monthly_series,
            "by_category": by_category,
            "tasks_total": tasks_total,
            "tasks_done": tasks_done,
            "progress_pct": progress_pct,
            "missions_count": missions_count,
            "preview_urls": self._discover_project_preview_urls(proj["slug"], proj.get("workspace_path", "")),
        }

    def get_corporate_finance_summary(self) -> dict[str, Any]:
        projects = self.list_projects()
        per_project = [self.get_project_finance_summary(p["project_id"]) for p in projects]
        actual_rev = round(sum(p["actual_revenue_vnd"] for p in per_project), 2)
        actual_exp = round(sum(p["actual_expense_vnd"] for p in per_project), 2)
        actual_tax = round(sum(p["actual_tax_vnd"] for p in per_project), 2)
        plan_rev = round(sum(p["plan_revenue_vnd"] for p in per_project), 2)
        plan_exp = round(sum(p["plan_expense_vnd"] for p in per_project), 2)
        plan_tax = round(sum(p["plan_tax_vnd"] for p in per_project), 2)
        target_mrr = round(sum(p["target_100_mrr_vnd"] for p in per_project), 2)

        return {
            "total_projects": len(per_project),
            "shipped_projects": sum(1 for p in per_project if p["status"] == "SHIPPED"),
            "active_projects": sum(1 for p in per_project if p["status"] == "ACTIVE"),
            "actual_revenue_vnd": actual_rev,
            "actual_expense_vnd": actual_exp,
            "actual_tax_vnd": actual_tax,
            "actual_net_profit_vnd": round(actual_rev - actual_exp - actual_tax, 2),
            "plan_revenue_vnd": plan_rev,
            "plan_expense_vnd": plan_exp,
            "plan_tax_vnd": plan_tax,
            "plan_net_profit_vnd": round(plan_rev - plan_exp - plan_tax, 2),
            "target_100_mrr_vnd": target_mrr,
            "projects": per_project,
        }
