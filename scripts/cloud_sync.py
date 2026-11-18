#!/usr/bin/env python3
"""Titan AI Corp — Multi-Device Conflict-Free Snapshot Sync & GitHub Cloud Bridge."""

from __future__ import annotations

import base64
import json
import os
import threading
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from titan_db import ROOT_DIR, TitanDatabase, utc_now_iso

DEFAULT_SNAPSHOT_PATH = ROOT_DIR / "corporate_hq" / "cloud_state" / "snapshot.json"
_SNAPSHOT_FILE_LOCK = threading.Lock()


def export_snapshot(db: TitanDatabase) -> dict[str, Any]:
    """Export deterministic, portable state snapshot for GitHub Pages CDN & Multi-Device Sync."""
    conn = db._get_conn()
    projects = [dict(r) for r in conn.execute("SELECT * FROM projects ORDER BY project_id").fetchall()]
    tasks = [dict(r) for r in conn.execute("SELECT * FROM tasks ORDER BY task_id").fetchall()]
    deliverables = [dict(r) for r in conn.execute("SELECT * FROM deliverables ORDER BY deliverable_id").fetchall()]
    citations = [dict(r) for r in conn.execute("SELECT * FROM task_citations ORDER BY citation_id").fetchall()]
    reflexions = [dict(r) for r in conn.execute("SELECT * FROM reflexions ORDER BY reflexion_id").fetchall()]
    atoms = [
        dict(r)
        for r in conn.execute(
            "SELECT * FROM knowledge_atoms ORDER BY fetched_at DESC, atom_id DESC LIMIT 800"
        ).fetchall()
    ]
    events = [
        dict(r)
        for r in conn.execute("SELECT * FROM activity_stream ORDER BY event_id DESC LIMIT 250").fetchall()
    ]
    departments = [dict(r) for r in conn.execute("SELECT * FROM departments ORDER BY dept_id").fetchall()]
    divisions = [dict(r) for r in conn.execute("SELECT * FROM divisions ORDER BY sort_order").fetchall()]
    missions = db.list_missions()
    opportunities = db.list_opportunities()
    tombstones = db.list_tombstones()

    return {
        "schema_version": "5.0",
        "exported_at": utc_now_iso(),
        "divisions": divisions,
        "departments": departments,
        "projects": projects,
        "tasks": tasks,
        "missions": missions,
        "opportunities": opportunities,
        "tombstones": tombstones,
        "deliverables": deliverables,
        "citations": citations,
        "reflexions": reflexions,
        "knowledge_atoms": atoms,
        "activity_stream": events,
    }


def _record_wins(incoming: dict[str, Any], current: dict[str, Any]) -> bool:
    """
    Deterministic conflict resolution across Phone, Tablet, and Workstation:
    1. Higher actor_priority wins (Chairman decision priority=10 beats automated status=1).
    2. Higher version counter wins.
    3. Newer ISO timestamp wins as tie-breaker.
    """
    inc_prio = int(incoming.get("actor_priority", 1) or 1)
    cur_prio = int(current.get("actor_priority", 1) or 1)
    if inc_prio != cur_prio:
        return inc_prio > cur_prio

    inc_ver = int(incoming.get("version", 1) or 1)
    cur_ver = int(current.get("version", 1) or 1)
    if inc_ver != cur_ver:
        return inc_ver > cur_ver

    inc_ts = str(incoming.get("updated_at") or "")
    cur_ts = str(current.get("updated_at") or "")
    return inc_ts > cur_ts


def merge_snapshot_into_db(db: TitanDatabase, remote_snapshot: dict[str, Any]) -> dict[str, int]:
    """
    Conflict-Free CRDT-style Record-Level Merge:
    - Projects & Tasks: Per-record version + actor_priority + timestamp resolution (Chairman wins).
    - Deliverables, Citations, Reflexions, Knowledge Atoms, Events: Grow-Only Set Union (0 data loss!).
    """
    stats = {
        "projects_merged": 0,
        "tasks_merged": 0,
        "deliverables_added": 0,
        "citations_added": 0,
        "reflexions_added": 0,
        "atoms_added": 0,
        "events_added": 0,
    }

    with db.immediate_tx() as conn:
        tomb_keys = {
            r["tombstone_key"]
            for r in conn.execute("SELECT tombstone_key FROM deleted_tombstones").fetchall()
        }
        for tb in remote_snapshot.get("tombstones", []):
            tkey = tb.get("tombstone_key")
            etype = tb.get("entity_type")
            eid = tb.get("entity_id")
            if not (tkey and etype and eid):
                continue
            tomb_keys.add(tkey)
            conn.execute(
                "INSERT OR IGNORE INTO deleted_tombstones(tombstone_key, entity_type, entity_id, trash_payload_json, deleted_at) VALUES (?, ?, ?, '{}', ?)",
                (tkey, etype, eid, tb.get("deleted_at") or utc_now_iso()),
            )
            if etype == "task":
                conn.execute("DELETE FROM tasks WHERE task_id = ?", (eid,))
            elif etype == "mission":
                conn.execute("DELETE FROM mission_steps WHERE mission_id = ?", (eid,))
                conn.execute("DELETE FROM missions WHERE mission_id = ?", (eid,))
            elif etype == "opportunity":
                conn.execute("DELETE FROM opportunities WHERE opp_id = ?", (eid,))
            elif etype == "project":
                conn.execute("DELETE FROM projects WHERE project_id = ?", (eid,))
            elif etype == "article":
                conn.execute("DELETE FROM knowledge_atoms WHERE url_hash = ?", (eid,))

        # 1. Projects
        for proj in remote_snapshot.get("projects", []):
            pid = proj.get("project_id")
            if not pid or f"project:{pid}" in tomb_keys:
                continue
            if not pid:
                continue
            existing = conn.execute("SELECT * FROM projects WHERE project_id = ?", (pid,)).fetchone()
            if existing is None:
                conn.execute(
                    """
                    INSERT INTO projects(
                        project_id, slug, title, objective, target_market,
                        current_gate, current_stage, status,
                        expected_price_vnd, unit_cost_vnd, fixed_cost_monthly_vnd,
                        workspace_path, version, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        pid,
                        proj.get("slug", pid),
                        proj.get("title", pid),
                        proj.get("objective", ""),
                        proj.get("target_market", "Vietnam & Global"),
                        int(proj.get("current_gate", 1)),
                        int(proj.get("current_stage", 1)),
                        proj.get("status", "ACTIVE"),
                        float(proj.get("expected_price_vnd", 0)),
                        float(proj.get("unit_cost_vnd", 0)),
                        float(proj.get("fixed_cost_monthly_vnd", 0)),
                        proj.get("workspace_path", f"corporate_hq/projects/{proj.get('slug', pid)}"),
                        int(proj.get("version", 1)),
                        proj.get("created_at") or utc_now_iso(),
                        proj.get("updated_at") or utc_now_iso(),
                    ),
                )
                stats["projects_merged"] += 1
            elif _record_wins(proj, dict(existing)):
                conn.execute(
                    """
                    UPDATE projects
                    SET title=?, objective=?, target_market=?, current_gate=?, current_stage=?,
                        status=?, expected_price_vnd=?, unit_cost_vnd=?, fixed_cost_monthly_vnd=?,
                        version=?, updated_at=?
                    WHERE project_id=?
                    """,
                    (
                        proj.get("title", existing["title"]),
                        proj.get("objective", existing["objective"]),
                        proj.get("target_market", existing["target_market"]),
                        max(int(proj.get("current_gate", 1)), int(existing["current_gate"])),
                        max(int(proj.get("current_stage", 1)), int(existing["current_stage"])),
                        proj.get("status", existing["status"]),
                        float(proj.get("expected_price_vnd", existing["expected_price_vnd"])),
                        float(proj.get("unit_cost_vnd", existing["unit_cost_vnd"])),
                        float(proj.get("fixed_cost_monthly_vnd", existing["fixed_cost_monthly_vnd"])),
                        int(proj.get("version", existing["version"])),
                        proj.get("updated_at") or utc_now_iso(),
                        pid,
                    ),
                )
                stats["projects_merged"] += 1

        # 2. Tasks
        for t in remote_snapshot.get("tasks", []):
            tid = t.get("task_id")
            if not tid or f"task:{tid}" in tomb_keys:
                continue
            existing_t = conn.execute("SELECT * FROM tasks WHERE task_id = ?", (tid,)).fetchone()
            if existing_t is None:
                conn.execute(
                    """
                    INSERT INTO tasks(
                        task_id, project_id, parent_task_id, title, description,
                        assigned_dept_id, reviewer_dept_id, gate_number, stage_number,
                        priority, kanban_column, checkout_lock_owner, checkout_locked_at,
                        evidence_level, approval_note, actor_priority, version,
                        created_at, updated_at, started_at, completed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        tid,
                        t.get("project_id"),
                        t.get("parent_task_id"),
                        t.get("title", "Untitled Task"),
                        t.get("description", ""),
                        t.get("assigned_dept_id", "00"),
                        t.get("reviewer_dept_id", "20"),
                        int(t.get("gate_number", 1)),
                        int(t.get("stage_number", 1)),
                        t.get("priority", "HIGH"),
                        t.get("kanban_column", "BACKLOG"),
                        t.get("checkout_lock_owner"),
                        t.get("checkout_locked_at"),
                        int(t.get("evidence_level", 0)),
                        t.get("approval_note", ""),
                        int(t.get("actor_priority", 1)),
                        int(t.get("version", 1)),
                        t.get("created_at") or utc_now_iso(),
                        t.get("updated_at") or utc_now_iso(),
                        t.get("started_at"),
                        t.get("completed_at"),
                    ),
                )
                stats["tasks_merged"] += 1
            elif _record_wins(t, dict(existing_t)):
                conn.execute(
                    """
                    UPDATE tasks
                    SET title=?, description=?, assigned_dept_id=?, reviewer_dept_id=?,
                        gate_number=?, stage_number=?, priority=?, kanban_column=?,
                        checkout_lock_owner=?, checkout_locked_at=?, evidence_level=?,
                        approval_note=?, actor_priority=?, version=?, updated_at=?,
                        started_at=COALESCE(?, started_at), completed_at=COALESCE(?, completed_at)
                    WHERE task_id=?
                    """,
                    (
                        t.get("title", existing_t["title"]),
                        t.get("description", existing_t["description"]),
                        t.get("assigned_dept_id", existing_t["assigned_dept_id"]),
                        t.get("reviewer_dept_id", existing_t["reviewer_dept_id"]),
                        int(t.get("gate_number", existing_t["gate_number"])),
                        int(t.get("stage_number", existing_t["stage_number"])),
                        t.get("priority", existing_t["priority"]),
                        t.get("kanban_column", existing_t["kanban_column"]),
                        t.get("checkout_lock_owner"),
                        t.get("checkout_locked_at"),
                        max(int(t.get("evidence_level", 0)), int(existing_t["evidence_level"])),
                        t.get("approval_note", existing_t["approval_note"]),
                        int(t.get("actor_priority", existing_t["actor_priority"])),
                        int(t.get("version", existing_t["version"])),
                        t.get("updated_at") or utc_now_iso(),
                        t.get("started_at"),
                        t.get("completed_at"),
                        tid,
                    ),
                )
                stats["tasks_merged"] += 1

        # 3. Grow-Only Sets (Deliverables, Citations, Reflexions, Knowledge Atoms, Events)
        for dl in remote_snapshot.get("deliverables", []):
            if not dl.get("deliverable_id") or not dl.get("task_id"):
                continue
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO deliverables(
                    deliverable_id, task_id, dept_id, title, artifact_type, file_path, summary, version, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    dl["deliverable_id"],
                    dl["task_id"],
                    dl.get("dept_id", "00"),
                    dl.get("title", ""),
                    dl.get("artifact_type", "REPORT"),
                    dl.get("file_path", ""),
                    dl.get("summary", ""),
                    int(dl.get("version", 1)),
                    dl.get("created_at") or utc_now_iso(),
                ),
            )
            stats["deliverables_added"] += cur.rowcount

        for ct in remote_snapshot.get("citations", []):
            if not ct.get("citation_id") or not ct.get("task_id"):
                continue
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO task_citations(
                    citation_id, task_id, dept_id, source_title, source_url, domain, key_finding, cited_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    ct["citation_id"],
                    ct["task_id"],
                    ct.get("dept_id", "00"),
                    ct.get("source_title", ""),
                    ct.get("source_url", ""),
                    ct.get("domain", "web"),
                    ct.get("key_finding", ""),
                    ct.get("cited_at") or utc_now_iso(),
                ),
            )
            stats["citations_added"] += cur.rowcount

        for rf in remote_snapshot.get("reflexions", []):
            if not rf.get("reflexion_id"):
                continue
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO reflexions(
                    reflexion_id, dept_id, task_id, failure_symptom, root_cause, preventive_rule, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    rf["reflexion_id"],
                    rf.get("dept_id", "00"),
                    rf.get("task_id"),
                    rf.get("failure_symptom", ""),
                    rf.get("root_cause", ""),
                    rf.get("preventive_rule", ""),
                    rf.get("created_at") or utc_now_iso(),
                ),
            )
            stats["reflexions_added"] += cur.rowcount

        for ka in remote_snapshot.get("knowledge_atoms", []):
            url = ka.get("url", "")
            dept_id = ka.get("dept_id", "01")
            if not url:
                continue
            u_hash = ka.get("url_hash") or TitanDatabase.compute_url_hash(url, dept_id)
            cur = conn.execute(
                """
                INSERT INTO knowledge_atoms(
                    url_hash, source_connector, dept_id, division_code,
                    title, url, published_at, fetched_at,
                    summary_vi, actionable_insight, importance, tags, is_starred
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(url_hash) DO UPDATE SET
                    is_starred = MAX(knowledge_atoms.is_starred, excluded.is_starred)
                """,
                (
                    u_hash,
                    ka.get("source_connector", "cloud_sync"),
                    dept_id,
                    ka.get("division_code", "div1-strategy-intel"),
                    ka.get("title", ""),
                    url,
                    ka.get("published_at") or utc_now_iso(),
                    ka.get("fetched_at") or utc_now_iso(),
                    ka.get("summary_vi", ""),
                    ka.get("actionable_insight", ""),
                    int(ka.get("importance", 6)),
                    ka.get("tags", ""),
                    int(ka.get("is_starred", 0)),
                ),
            )
            stats["atoms_added"] += cur.rowcount

        for ev in remote_snapshot.get("activity_stream", []):
            uid = ev.get("event_uid")
            if not uid:
                continue
            detail_json = ev.get("detail_json")
            if detail_json is None:
                detail_json = json.dumps(ev.get("detail", {}), ensure_ascii=False)
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO activity_stream(
                    event_uid, timestamp, actor_dept_id, event_type,
                    project_id, task_id, headline_vi, detail_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    uid,
                    ev.get("timestamp") or utc_now_iso(),
                    ev.get("actor_dept_id", "00"),
                    ev.get("event_type", "SYNC"),
                    ev.get("project_id"),
                    ev.get("task_id"),
                    ev.get("headline_vi", ""),
                    detail_json,
                ),
            )
            stats["events_added"] += cur.rowcount

        for opp in remote_snapshot.get("opportunities", []):
            oid = opp.get("opp_id")
            if not oid or f"opportunity:{oid}" in tomb_keys:
                continue
            conn.execute(
                """
                INSERT INTO opportunities(
                    opp_id, title, target_customer, pain_point, proposed_solution,
                    price_vnd, est_margin_pct, breakeven_users, survival_score,
                    critique_note, ux_note, source_url, status, mission_id, version, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(opp_id) DO UPDATE SET
                    title = CASE WHEN excluded.version >= opportunities.version THEN excluded.title ELSE opportunities.title END,
                    target_customer = CASE WHEN excluded.version >= opportunities.version THEN excluded.target_customer ELSE opportunities.target_customer END,
                    pain_point = CASE WHEN excluded.version >= opportunities.version THEN excluded.pain_point ELSE opportunities.pain_point END,
                    proposed_solution = CASE WHEN excluded.version >= opportunities.version THEN excluded.proposed_solution ELSE opportunities.proposed_solution END,
                    price_vnd = CASE WHEN excluded.version >= opportunities.version THEN excluded.price_vnd ELSE opportunities.price_vnd END,
                    est_margin_pct = CASE WHEN excluded.version >= opportunities.version THEN excluded.est_margin_pct ELSE opportunities.est_margin_pct END,
                    status = CASE WHEN excluded.version >= opportunities.version THEN excluded.status ELSE opportunities.status END,
                    mission_id = COALESCE(excluded.mission_id, opportunities.mission_id),
                    version = MAX(opportunities.version, excluded.version),
                    updated_at = MAX(opportunities.updated_at, excluded.updated_at)
                """,
                (
                    oid, opp.get("title", ""), opp.get("target_customer", ""), opp.get("pain_point", ""),
                    opp.get("proposed_solution", ""), float(opp.get("price_vnd", 399000)),
                    float(opp.get("est_margin_pct", 75.0)), int(opp.get("breakeven_users", 5)),
                    int(opp.get("survival_score", 85)), opp.get("critique_note", ""),
                    opp.get("ux_note", ""), opp.get("source_url", ""), opp.get("status", "NEW"),
                    opp.get("mission_id"), int(opp.get("version", 1)),
                    opp.get("created_at") or utc_now_iso(), opp.get("updated_at") or utc_now_iso(),
                ),
            )

        for msn in remote_snapshot.get("missions", []):
            mid = msn.get("mission_id")
            if not mid or f"mission:{mid}" in tomb_keys:
                continue
            conn.execute(
                """
                INSERT OR REPLACE INTO missions(
                    mission_id, title, goal_prompt, category, status, auto_approve,
                    current_step_order, total_steps, progress_pct, final_summary,
                    survival_score, ux_score, expected_margin_pct, version, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    mid, msn.get("title", ""), msn.get("goal_prompt", ""), msn.get("category", "MONEY_MAKER"),
                    msn.get("status", "RUNNING"), int(msn.get("auto_approve", 0)),
                    int(msn.get("current_step_order", 1)), int(msn.get("total_steps", 7)),
                    int(msn.get("progress_pct", 0)), msn.get("final_summary", ""),
                    int(msn.get("survival_score", 85)), int(msn.get("ux_score", 90)),
                    float(msn.get("expected_margin_pct", 74.0)), int(msn.get("version", 1)),
                    msn.get("created_at") or utc_now_iso(), msn.get("updated_at") or utc_now_iso(),
                ),
            )
            for s in msn.get("steps", []):
                conn.execute(
                    """
                    INSERT OR REPLACE INTO mission_steps(
                        step_id, mission_id, step_order, title, lead_dept_ids,
                        critic_dept_id, ux_tester_dept_id, status, progress_pct,
                        live_activity_text, output_summary, critique_verdict, ux_verdict,
                        started_at, completed_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        s["step_id"], mid, int(s["step_order"]), s["title"], s["lead_dept_ids"],
                        s.get("critic_dept_id", "47"), s.get("ux_tester_dept_id", "48"),
                        s["status"], int(s.get("progress_pct", 0)), s.get("live_activity_text", ""),
                        s.get("output_summary", ""), s.get("critique_verdict", ""), s.get("ux_verdict", ""),
                        s.get("started_at"), s.get("completed_at"), s.get("updated_at") or utc_now_iso(),
                    ),
                )

        conn.execute(
            """
            UPDATE departments
            SET articles_learned = (
                SELECT COUNT(*) FROM knowledge_atoms ka WHERE ka.dept_id = departments.dept_id
            ),
            tasks_completed = (
                SELECT COUNT(*) FROM tasks t WHERE t.assigned_dept_id = departments.dept_id AND t.kanban_column = 'DONE'
            )
            """
        )

    return stats


def save_snapshot_file(db: TitanDatabase, path: Path = DEFAULT_SNAPSHOT_PATH) -> Path:
    with _SNAPSHOT_FILE_LOCK:
        path.parent.mkdir(parents=True, exist_ok=True)
        snap = export_snapshot(db)
        tmp_path = path.with_suffix(f".{threading.get_ident()}.tmp")
        tmp_path.write_text(json.dumps(snap, ensure_ascii=False, indent=2), encoding="utf-8")
        os.replace(str(tmp_path), str(path))
        return path


class GitHubCloudSyncClient:
    """Two-way state sync over GitHub Contents REST API with ETag & optimistic SHA locking."""

    def __init__(
        self,
        repo_full_name: str,
        token: str,
        branch: str = "main",
        remote_path: str = "corporate_hq/cloud_state/snapshot.json",
    ) -> None:
        self.repo = repo_full_name.strip("/")
        self.token = token.strip()
        self.branch = branch
        self.remote_path = remote_path.lstrip("/")
        self._last_etag: str | None = None
        self._last_sha: str | None = None

    def _headers(self) -> dict[str, str]:
        h = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "TitanAICorp-CloudSync/4.0",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h

    def pull_remote_snapshot(self) -> dict[str, Any] | None:
        url = f"https://api.github.com/repos/{self.repo}/contents/{self.remote_path}?ref={self.branch}"
        headers = self._headers()
        if self._last_etag:
            headers["If-None-Match"] = self._last_etag

        req = urllib.request.Request(url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                self._last_etag = resp.headers.get("ETag")
                payload = json.loads(resp.read().decode("utf-8"))
                self._last_sha = payload.get("sha")
                raw_b64 = payload.get("content", "")
                decoded = base64.b64decode(raw_b64).decode("utf-8")
                return json.loads(decoded)
        except urllib.error.HTTPError as e:
            if e.code in (304, 404):
                return None
            raise

    def push_merged_snapshot(self, db: TitanDatabase, commit_message: str = "chore(sync): multi-device state sync") -> dict[str, Any]:
        remote = self.pull_remote_snapshot()
        merge_stats = {}
        if remote:
            merge_stats = merge_snapshot_into_db(db, remote)

        merged_payload = export_snapshot(db)
        encoded = base64.b64encode(
            json.dumps(merged_payload, ensure_ascii=False, indent=2).encode("utf-8")
        ).decode("ascii")

        body: dict[str, Any] = {
            "message": commit_message,
            "content": encoded,
            "branch": self.branch,
        }
        if self._last_sha:
            body["sha"] = self._last_sha

        url = f"https://api.github.com/repos/{self.repo}/contents/{self.remote_path}"
        req = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={**self._headers(), "Content-Type": "application/json"},
            method="PUT",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            res_json = json.loads(resp.read().decode("utf-8"))
            self._last_sha = res_json.get("content", {}).get("sha")
            return {"pushed": True, "sha": self._last_sha, "merge_stats": merge_stats}
