#!/usr/bin/env python3
"""Titan AI Corp — High-Performance Multi-Threaded Command Center Server (24 Endpoints + Gzip + ETag + SSE)."""

from __future__ import annotations

import argparse
import concurrent.futures
import gzip
import hashlib
import http.server
import json
import os
import queue
import re
import socketserver
import sys
import threading
import time
import urllib.parse
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from cloud_sync import DEFAULT_SNAPSHOT_PATH, export_snapshot, merge_snapshot_into_db, save_snapshot_file
from learning_engine import ContinualLearningEngine
from titan_cli import add_department, run_audit
from titan_db import DEFAULT_DB_PATH, ROOT_DIR, TitanDatabase, utc_now_iso

WEB_UI_DIR = SCRIPT_DIR / "web_ui"


class ThreadingCommandServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def __init__(
        self,
        server_address: tuple[str, int],
        handler_cls: type[http.server.BaseHTTPRequestHandler],
        db: TitanDatabase,
        admin_token: str = "",
    ) -> None:
        super().__init__(server_address, handler_cls)
        self.db = db
        self.learning_engine = ContinualLearningEngine(db=db)
        self.bg_pool = concurrent.futures.ThreadPoolExecutor(max_workers=4, thread_name_prefix="titan-bg")
        self.admin_token = admin_token.strip()
        self.sse_queues_lock = threading.Lock()
        self.sse_queues: set[queue.Queue[dict[str, Any]]] = set()
        self.learning_in_progress = False
        self.started_at = time.time()

        self.db.register_event_listener(self._broadcast_sse_event)

    def _broadcast_sse_event(self, event_dict: dict[str, Any]) -> None:
        with self.sse_queues_lock:
            targets = list(self.sse_queues)
        dead: list[queue.Queue[dict[str, Any]]] = []
        for q in targets:
            try:
                q.put_nowait(event_dict)
            except queue.Full:
                dead.append(q)
        if dead:
            with self.sse_queues_lock:
                for dq in dead:
                    self.sse_queues.discard(dq)

    def shutdown_clean(self) -> None:
        self.db.unregister_event_listener(self._broadcast_sse_event)
        self.bg_pool.shutdown(wait=False)
        self.server_close()


class CommandCenterHandler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt: str, *args: Any) -> None:
        # Quiet logging in unit/stress tests unless TITAN_VERBOSE_HTTP=1
        if os.environ.get("TITAN_VERBOSE_HTTP") == "1":
            super().log_message(fmt, *args)

    @property
    def app_server(self) -> ThreadingCommandServer:
        return self.server  # type: ignore[return-value]

    def _set_common_security_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, If-None-Match")

    def _check_auth_for_mutation(self) -> bool:
        expected = self.app_server.admin_token
        if not expected:
            return True
        auth = self.headers.get("Authorization", "")
        if auth == f"Bearer {expected}":
            return True
        self._send_json({"error": "Unauthorized: Invalid or missing Bearer admin token."}, status=401)
        return False

    def _read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            return {}
        if length > 5_000_000:
            raise ValueError("Payload vượt quá giới hạn 5MB.")
        raw = self.rfile.read(length).decode("utf-8")
        data = json.loads(raw)
        if not isinstance(data, dict):
            raise ValueError("JSON body phải là một Object.")
        return data

    def _send_bytes(
        self,
        raw_bytes: bytes,
        content_type: str,
        status: int = 200,
        enable_etag: bool = True,
        cache_control: str = "no-cache",
        extra_headers: dict[str, str] | None = None,
    ) -> None:
        etag = f'"{hashlib.sha1(raw_bytes).hexdigest()}"' if enable_etag else None
        if etag and status == 200:
            client_etag = self.headers.get("If-None-Match")
            if client_etag == etag:
                self.send_response(304)
                self._set_common_security_headers()
                self.send_header("ETag", etag)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

        accept_enc = self.headers.get("Accept-Encoding", "")
        use_gzip = "gzip" in accept_enc and len(raw_bytes) >= 512
        body = gzip.compress(raw_bytes, compresslevel=5) if use_gzip else raw_bytes

        self.send_response(status)
        self._set_common_security_headers()
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", cache_control)
        if etag:
            self.send_header("ETag", etag)
        if use_gzip:
            self.send_header("Content-Encoding", "gzip")
        if extra_headers:
            for hk, hv in extra_headers.items():
                self.send_header(hk, hv)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, payload: Any, status: int = 200, enable_etag: bool = False) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self._send_bytes(encoded, "application/json; charset=utf-8", status=status, enable_etag=enable_etag)

    def _serve_static_file(
        self,
        file_path: Path,
        content_type: str,
        cache_control: str = "public, max-age=60",
        extra_headers: dict[str, str] | None = None,
    ) -> None:
        if not file_path.is_file():
            self._send_json({"error": f"Không tìm thấy tệp tĩnh: {file_path.name}"}, status=404)
            return
        self._send_bytes(
            file_path.read_bytes(),
            content_type=content_type,
            status=200,
            enable_etag=True,
            cache_control=cache_control,
            extra_headers=extra_headers,
        )

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._set_common_security_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)
        db = self.app_server.db

        try:
            # 01-03: Static UI & PWA Assets
            if path in ("/", "/index.html"):
                self._serve_static_file(WEB_UI_DIR / "index.html", "text/html; charset=utf-8", cache_control="no-cache")
                return
            if path == "/styles.css":
                self._serve_static_file(WEB_UI_DIR / "styles.css", "text/css; charset=utf-8")
                return
            if path == "/app.js":
                self._serve_static_file(WEB_UI_DIR / "app.js", "application/javascript; charset=utf-8")
                return
            if path == "/manifest.webmanifest":
                self._serve_static_file(WEB_UI_DIR / "manifest.webmanifest", "application/manifest+json; charset=utf-8")
                return
            if path == "/sw.js":
                self._serve_static_file(
                    WEB_UI_DIR / "sw.js",
                    "application/javascript; charset=utf-8",
                    cache_control="no-cache",
                    extra_headers={"Service-Worker-Allowed": "/"},
                )
                return
            if path == "/icon.svg":
                self._serve_static_file(WEB_UI_DIR / "icon.svg", "image/svg+xml")
                return
            if path == "/cloud_state/snapshot.json":
                if not DEFAULT_SNAPSHOT_PATH.is_file():
                    save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                self._serve_static_file(DEFAULT_SNAPSHOT_PATH, "application/json; charset=utf-8", cache_control="no-cache")
                return

            # 04: Health & Latency Probe
            if path == "/api/health":
                t0 = time.perf_counter_ns()
                conn = db._get_conn()
                journal = conn.execute("PRAGMA journal_mode;").fetchone()[0]
                dept_cnt = conn.execute("SELECT COUNT(*) FROM departments;").fetchone()[0]
                db_us = round((time.perf_counter_ns() - t0) / 1000.0, 1)
                with self.app_server.sse_queues_lock:
                    sse_cnt = len(self.app_server.sse_queues)
                self._send_json(
                    {
                        "status": "ok",
                        "journal_mode": journal,
                        "departments_registered": dept_cnt,
                        "db_ping_us": db_us,
                        "sse_clients": sse_cnt,
                        "learning_in_progress": self.app_server.learning_in_progress,
                        "uptime_sec": round(time.time() - self.app_server.started_at, 1),
                        "timestamp": utc_now_iso(),
                    }
                )
                return

            # 05: Overview KPI & Live Stream Snapshot (ETag + Gzip)
            if path == "/api/overview":
                limit = int(qs.get("limit", ["60"])[0])
                payload = db.get_overview_payload(events_limit=max(10, min(200, limit)))
                payload["learning_in_progress"] = self.app_server.learning_in_progress
                self._send_json(payload, enable_etag=True)
                return

            # 06: Server-Sent Events (SSE) Stream with Last-Event-ID & Keep-Alive
            if path == "/api/events/stream":
                self._handle_sse_stream(qs)
                return

            # 07: All Departments
            if path == "/api/departments":
                div = qs.get("division", [None])[0]
                status_f = qs.get("status", [None])[0]
                self._send_json({"departments": db.list_departments(division_code=div, status=status_f)}, enable_etag=True)
                return

            # 08: Single Department Brain Inspector
            m_dept = re.match(r"^/api/departments/([a-zA-Z0-9_-]+)$", path)
            if m_dept:
                detail = db.get_department_detail(m_dept.group(1))
                if not detail:
                    self._send_json({"error": "Không tìm thấy phòng ban."}, status=404)
                    return
                self._send_json(detail, enable_etag=True)
                return

            # 11: Projects List
            if path == "/api/projects":
                self._send_json({"projects": db.list_projects()}, enable_etag=True)
                return

            # 13: Project Files Tree & Safe Document Reader
            m_pfiles = re.match(r"^/api/projects/([a-zA-Z0-9_-]+)/files$", path)
            if m_pfiles:
                self._handle_project_files(m_pfiles.group(1), qs)
                return

            # 14: Kanban Tasks Query
            if path == "/api/tasks":
                tid = qs.get("task_id", [None])[0]
                if tid:
                    single = db.get_task(tid)
                    if not single:
                        self._send_json({"error": "Task không tồn tại."}, status=404)
                        return
                    self._send_json(single)
                    return
                proj_id = qs.get("project_id", [None])[0]
                div_code = qs.get("division", [None])[0]
                col = qs.get("column", [None])[0]
                dept_id = qs.get("dept_id", [None])[0]
                self._send_json(
                    {
                        "tasks": db.list_tasks(
                            project_id=proj_id,
                            division_code=div_code,
                            kanban_column=col,
                            dept_id=dept_id,
                        )
                    },
                    enable_etag=True,
                )
                return

            # 20: Full-Text Search Knowledge Vault (FTS5 BM25)
            if path == "/api/knowledge":
                q = qs.get("q", [""])[0]
                dept_id = qs.get("dept_id", [None])[0]
                div_code = qs.get("division", [None])[0]
                min_imp = int(qs.get("min_importance", ["1"])[0])
                limit = max(5, min(200, int(qs.get("limit", ["60"])[0])))
                t0 = time.perf_counter_ns()
                atoms = db.search_knowledge_fts(
                    query=q,
                    dept_id=dept_id,
                    division_code=div_code,
                    min_importance=min_imp,
                    limit=limit,
                )
                elapsed_ms = round((time.perf_counter_ns() - t0) / 1_000_000.0, 2)
                self._send_json({"query": q, "elapsed_ms": elapsed_ms, "count": len(atoms), "articles": atoms})
                return

            # Audit Endpoint
            if path == "/api/audit":
                self._send_json(run_audit())
                return

            # 24: Cloud Sync Snapshot Export
            if path == "/api/sync/snapshot":
                self._send_json(export_snapshot(db), enable_etag=True)
                return

            self._send_json({"error": f"Endpoint không tồn tại: {path}"}, status=404)
        except Exception as exc:
            self._send_json({"error": str(exc)}, status=500)
        finally:
            db.close_thread_conn()

    def do_POST(self) -> None:
        if not self._check_auth_for_mutation():
            return
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        db = self.app_server.db

        try:
            body = self._read_json_body()

            # 10: Hire / Spawn New Specialist Department (#46+)
            if path == "/api/departments":
                division = str(body.get("division", "")).strip()
                code = str(body.get("code", "")).strip()
                title = str(body.get("title", "")).strip()
                mission = str(body.get("mission", "")).strip()
                if not (division and code and title and mission):
                    self._send_json({"error": "Vui lòng nhập đủ Khối, Mã phòng, Tên chức danh và Sứ mệnh."}, status=400)
                    return
                books_raw = body.get("books", [])
                books = books_raw if isinstance(books_raw, list) else [b.strip() for b in str(books_raw).split(",") if b.strip()]
                new_path = add_department(
                    division=division,
                    code=code,
                    title_vi=title,
                    mission=mission,
                    books=books,
                    formula=str(body.get("formula", "")),
                    feeds=str(body.get("feeds", "")),
                    db=db,
                )
                dept_id = new_path.stem.split("-", 1)[0]
                save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                self._send_json({"created": True, "dept_id": dept_id, "department": db.get_department_detail(dept_id)}, status=201)
                return

            # 12: Create New Project
            if path == "/api/projects":
                slug = str(body.get("slug") or body.get("title", "")).strip()
                title = str(body.get("title", "")).strip()
                if not title:
                    self._send_json({"error": "Tên dự án không được để trống."}, status=400)
                    return
                proj = db.create_project(
                    slug=slug,
                    title=title,
                    objective=str(body.get("objective", "")),
                    target_market=str(body.get("target_market", "Vietnam & Global")),
                    expected_price_vnd=float(body.get("expected_price_vnd", 399000)),
                    unit_cost_vnd=float(body.get("unit_cost_vnd", 95000)),
                    fixed_cost_monthly_vnd=float(body.get("fixed_cost_monthly_vnd", 1500000)),
                    seed_gate1_tasks=bool(body.get("seed_gate1_tasks", True)),
                )
                save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                self._send_json(proj, status=201)
                return

            # 15: Create Task
            if path == "/api/tasks":
                title = str(body.get("title", "")).strip()
                dept_id = str(body.get("assigned_dept_id", "00")).strip()
                if not title:
                    self._send_json({"error": "Tiêu đề đầu việc không được để trống."}, status=400)
                    return
                task = db.create_task(
                    title=title,
                    assigned_dept_id=dept_id,
                    description=str(body.get("description", "")),
                    project_id=body.get("project_id") or None,
                    reviewer_dept_id=str(body.get("reviewer_dept_id", "20")),
                    gate_number=int(body.get("gate_number", 1)),
                    stage_number=int(body.get("stage_number", 1)),
                    priority=str(body.get("priority", "HIGH")),
                )
                save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                self._send_json(task, status=201)
                return

            # 16: Atomic Checkout
            m_chk = re.match(r"^/api/tasks/([a-zA-Z0-9_-]+)/checkout$", path)
            if m_chk:
                tid = m_chk.group(1)
                dept_id = str(body.get("dept_id", "00"))
                res = db.checkout_task_atomic(tid, dept_id, worker_token=body.get("worker_token"))
                status_code = 200 if res["acquired"] else 409
                self._send_json(res, status=status_code)
                return

            # 17: Add Live Citation
            m_cite = re.match(r"^/api/tasks/([a-zA-Z0-9_-]+)/cite$", path)
            if m_cite:
                tid = m_cite.group(1)
                url = str(body.get("source_url", "")).strip()
                if not url.startswith(("http://", "https://")):
                    self._send_json({"error": "URL trích dẫn phải bắt đầu bằng http:// hoặc https://."}, status=400)
                    return
                res = db.add_task_citation(
                    task_id=tid,
                    dept_id=str(body.get("dept_id", "01")),
                    source_title=str(body.get("source_title") or url),
                    source_url=url,
                    key_finding=str(body.get("key_finding", "")),
                )
                self._send_json(res, status=201)
                return

            # 18: Submit Deliverable
            m_sub = re.match(r"^/api/tasks/([a-zA-Z0-9_-]+)/submit$", path)
            if m_sub:
                tid = m_sub.group(1)
                res = db.submit_deliverable(
                    task_id=tid,
                    dept_id=str(body.get("dept_id", "00")),
                    title=str(body.get("title", "Báo cáo bàn giao")),
                    summary=str(body.get("summary", "")),
                    file_path=str(body.get("file_path", "")),
                    artifact_type=str(body.get("artifact_type", "REPORT")),
                    evidence_level=int(body.get("evidence_level", 2)),
                    require_chairman_gate=bool(body.get("require_chairman_gate", True)),
                )
                save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                self._send_json(res, status=200)
                return

            # Transition Column
            m_tr = re.match(r"^/api/tasks/([a-zA-Z0-9_-]+)/transition$", path)
            if m_tr:
                tid = m_tr.group(1)
                col = str(body.get("column", "")).strip()
                res = db.transition_task_column(tid, col, note=str(body.get("note", "")))
                save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                self._send_json(res, status=200)
                return

            # 19: Chairman Gate Decision (APPROVE / REJECT -> Reflexion)
            m_dec = re.match(r"^/api/tasks/([a-zA-Z0-9_-]+)/decision$", path)
            if m_dec:
                tid = m_dec.group(1)
                res = db.chairman_decide_task(
                    task_id=tid,
                    decision=str(body.get("decision", "")),
                    note=str(body.get("note", "")),
                    root_cause=str(body.get("root_cause", "")),
                    preventive_rule=str(body.get("preventive_rule", "")),
                )
                save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                self._send_json(res, status=200)
                return

            # 21: Trigger Non-Blocking Background Continual Learning Cycle
            if path == "/api/learning/run":
                scope = str(body.get("scope", "all")).strip()
                wait_sync = bool(body.get("wait", False))
                if wait_sync:
                    res = self._execute_learning_job(scope, "CHAIRMAN_UI_SYNC")
                    self._send_json(res, status=200)
                    return
                if self.app_server.learning_in_progress:
                    self._send_json(
                        {"accepted": False, "message": "Một chu kỳ đọc báo đang chạy nền, vui lòng theo dõi trên dòng sự kiện!"},
                        status=202,
                    )
                    return
                self.app_server.learning_in_progress = True
                self.app_server.bg_pool.submit(self._execute_learning_job, scope, "CHAIRMAN_UI")
                self._send_json(
                    {"accepted": True, "scope": scope, "message": "Đã kích hoạt quét báo chí & nghiên cứu chạy nền không khóa giao diện."},
                    status=202,
                )
                return

            # 22: Deep URL Wisdom Ingestion
            if path == "/api/learning/ingest-url":
                url = str(body.get("url", "")).strip()
                dept_id = str(body.get("dept_id", "01")).strip()
                if not url.startswith(("http://", "https://")):
                    self._send_json({"error": "URL không hợp lệ (phải bắt đầu bằng http:// hoặc https://)."}, status=400)
                    return
                res = self.app_server.learning_engine.ingest_custom_url(
                    url=url,
                    dept_id=dept_id,
                    importance=int(body.get("importance", 8)),
                    custom_note=str(body.get("note", "")),
                )
                save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                self._send_json(res, status=201)
                return

            # 23: CFO Unit Economics & Break-Even Simulator
            if path == "/api/finance/simulate":
                price = float(body.get("price_per_month", 399000))
                quota = int(body.get("max_quota_units", 150))
                api_cost = float(body.get("api_cost_per_unit", 1200))
                if price < 0 or quota < 0 or api_cost < 0:
                    self._send_json({"error": "Thông số tài chính không được là số âm."}, status=400)
                    return
                sim = TitanDatabase.simulate_cfo_unit_economics(
                    price_per_month=price,
                    max_quota_units=quota,
                    api_cost_per_unit=api_cost,
                    avg_usage_ratio=float(body.get("avg_usage_ratio", 0.60)),
                    payment_fee_pct=float(body.get("payment_fee_pct", 1.5)),
                    payment_fixed_fee=float(body.get("payment_fixed_fee", 0.0)),
                    tax_reserve_pct=float(body.get("tax_reserve_pct", 7.0)),
                    fixed_monthly_cost=float(body.get("fixed_monthly_cost", 1500000)),
                )
                self._send_json(sim, status=200)
                return

            # 24: Cloud Multi-Device Snapshot Merge
            if path == "/api/sync/snapshot":
                snapshot = body.get("snapshot", body)
                if not isinstance(snapshot, dict):
                    self._send_json({"error": "Snapshot không hợp lệ."}, status=400)
                    return
                stats = merge_snapshot_into_db(db, snapshot)
                save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                self._send_json({"merged": True, "stats": stats, "snapshot": export_snapshot(db)}, status=200)
                return

            self._send_json({"error": f"Endpoint POST không tồn tại: {path}"}, status=404)
        except KeyError as ke:
            self._send_json({"error": str(ke)}, status=404)
        except ValueError as ve:
            self._send_json({"error": str(ve)}, status=400)
        except Exception as exc:
            self._send_json({"error": str(exc)}, status=500)
        finally:
            db.close_thread_conn()

    def do_PATCH(self) -> None:
        if not self._check_auth_for_mutation():
            return
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        db = self.app_server.db
        try:
            body = self._read_json_body()
            m_dept = re.match(r"^/api/departments/([a-zA-Z0-9_-]+)(?:/handbook)?$", path)
            if m_dept:
                dept_id = m_dept.group(1)
                updated = db.update_department_settings(
                    dept_id=dept_id,
                    handbook_markdown=body.get("handbook_markdown"),
                    token_budget_monthly=body.get("token_budget_monthly"),
                    status=body.get("status"),
                )
                save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                self._send_json(updated, status=200)
                return
            self._send_json({"error": f"Endpoint PATCH không tồn tại: {path}"}, status=404)
        except KeyError as ke:
            self._send_json({"error": str(ke)}, status=404)
        except ValueError as ve:
            self._send_json({"error": str(ve)}, status=400)
        except Exception as exc:
            self._send_json({"error": str(exc)}, status=500)
        finally:
            db.close_thread_conn()

    def _execute_learning_job(self, scope: str, triggered_by: str) -> dict[str, Any]:
        db = self.app_server.db
        try:
            self.app_server.learning_in_progress = True
            result = self.app_server.learning_engine.run_learning_cycle(scope=scope, triggered_by=triggered_by)
            save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
            return result
        finally:
            self.app_server.learning_in_progress = False
            db.close_thread_conn()

    def _handle_project_files(self, project_id: str, qs: dict[str, list[str]]) -> None:
        db = self.app_server.db
        proj = db.get_project(project_id)
        if not proj:
            self._send_json({"error": f"Dự án '{project_id}' không tồn tại."}, status=404)
            return

        proj_root = (ROOT_DIR / proj["workspace_path"]).resolve()
        if not proj_root.is_relative_to(ROOT_DIR.resolve()):
            self._send_json({"error": "Đường dẫn dự án bị từ chối vì lý do bảo mật."}, status=403)
            return

        req_file = qs.get("file", [None])[0]
        if req_file:
            candidate = (proj_root / req_file).resolve()
            if not candidate.is_relative_to(proj_root):
                self._send_json({"error": "Cảnh báo bảo mật: Chặn truy cập leo thư mục trái phép (Path Traversal)!"}, status=403)
                return
            if not candidate.is_file():
                self._send_json({"error": "Tệp không tồn tại."}, status=404)
                return
            content = candidate.read_text(encoding="utf-8", errors="replace")
            self._send_json(
                {
                    "project_id": project_id,
                    "file": req_file,
                    "size_bytes": candidate.stat().st_size,
                    "content": content,
                }
            )
            return

        files_list = []
        if proj_root.is_dir():
            for p in sorted(proj_root.rglob("*")):
                if p.is_file() and p.name != ".gitkeep":
                    rel = str(p.relative_to(proj_root)).replace("\\", "/")
                    files_list.append(
                        {
                            "path": rel,
                            "name": p.name,
                            "size_bytes": p.stat().st_size,
                            "ext": p.suffix.lower(),
                        }
                    )
        self._send_json({"project": proj, "files": files_list})

    def _handle_sse_stream(self, qs: dict[str, list[str]]) -> None:
        last_id_hdr = self.headers.get("Last-Event-ID") or qs.get("since", ["0"])[0]
        try:
            last_id = int(last_id_hdr)
        except ValueError:
            last_id = 0

        self.send_response(200)
        self._set_common_security_headers()
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()

        client_q: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=200)
        with self.app_server.sse_queues_lock:
            self.app_server.sse_queues.add(client_q)

        try:
            # Catch up missed events if Last-Event-ID > 0
            if last_id > 0:
                missed = self.app_server.db.get_events_since(last_id)
                for ev in missed:
                    self._write_sse_frame(ev)

            # Send initial connected handshake
            self.wfile.write(b": connected to Titan Command Center SSE\n\n")
            self.wfile.flush()

            while True:
                try:
                    ev = client_q.get(timeout=15.0)
                    self._write_sse_frame(ev)
                except queue.Empty:
                    self.wfile.write(b": heartbeat\n\n")
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, OSError):
            pass
        finally:
            with self.app_server.sse_queues_lock:
                self.app_server.sse_queues.discard(client_q)

    def _write_sse_frame(self, ev: dict[str, Any]) -> None:
        eid = ev.get("event_id") or 0
        payload = json.dumps(ev, ensure_ascii=False)
        frame = f"id: {eid}\nevent: activity\ndata: {payload}\n\n".encode("utf-8")
        self.wfile.write(frame)
        self.wfile.flush()


def run_server(host: str = "127.0.0.1", port: int = 8765, db_path: Path = DEFAULT_DB_PATH) -> None:
    db = TitanDatabase(db_path=db_path)
    save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
    admin_tok = os.environ.get("TITAN_ADMIN_TOKEN", "")
    srv = ThreadingCommandServer((host, port), CommandCenterHandler, db=db, admin_token=admin_tok)
    print(f"[TITAN COMMAND CENTER v4.0] Live at http://{host}:{port} (SQLite WAL + SSE + PWA Ready)", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        srv.shutdown_clean()


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Start Titan AI Corp Command Center Web Server")
    p.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"))
    p.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8765")))
    p.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    args = p.parse_args()
    run_server(host=args.host, port=args.port, db_path=args.db)
