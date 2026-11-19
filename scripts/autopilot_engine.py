#!/usr/bin/env python3
"""Titan AI Corp v6.0 — True Direct Antigravity Swarm Dispatcher (Zero Fake Simulation)."""

from __future__ import annotations

from typing import Any

from cloud_sync import DEFAULT_SNAPSHOT_PATH, save_snapshot_file
from titan_db import TitanDatabase


class AntigravityBridgeDispatcher:
    """
    Replaces all local simulated templates.
    Every mission, rework, task execution, and money-opportunity scan is queued
    into `antigravity_orders` so the live Antigravity Coordinator spawns REAL
    Swarm workers (`swarm`) and streams verified progress back to the Web UI.
    """

    def __init__(self, db: TitanDatabase, step_delay_sec: float = 0.0) -> None:
        self.db = db
        self.step_delay_sec = step_delay_sec

    def resume_orphaned_missions(self, pool: Any | None = None) -> int:
        """Clean any stale EXECUTING department flags on boot when no bridge is actively running."""
        bridge = self.db.get_bridge_status()
        if not bridge.get("online"):
            with self.db.immediate_tx() as conn:
                conn.execute("UPDATE departments SET status = 'IDLE' WHERE status = 'EXECUTING' AND current_task_id IS NULL")
        return len(self.db.list_orders(status="PENDING"))

    def queue_opportunity_scan(self, source_device: str = "web-local", custom_focus: str = "") -> dict[str, Any]:
        """Enqueue a real money-maker opportunity hunt for Antigravity Swarm (#50 + #46 + #38)."""
        focus = custom_focus.strip() or (
            "Đọc tin tức thị trường & dữ liệu kinh tế thực tế mới nhất, săn 2–3 cơ hội sản phẩm/dịch vụ "
            "dễ thu tiền tại Việt Nam & toàn cầu (lãi gộp >= 65%, hòa vốn <= 10 khách), phản biện thẳng rủi ro (#46) "
            "và kiểm tra độ dễ dùng 3 chạm (#48) trước khi đăng lên bảng Cơ hội."
        )
        order = self.db.enqueue_order(
            order_type="SCAN_OPPORTUNITIES",
            title="Săn cơ hội đẻ ra tiền mới (Phòng #50 + #46 + #38)",
            instructions=focus,
            source_device=source_device,
        )
        save_snapshot_file(self.db, DEFAULT_SNAPSHOT_PATH)
        return order

    def queue_task_execution(self, task_id: str, source_device: str = "web-local") -> dict[str, Any]:
        """Dispatch a specific Kanban task straight to Antigravity Swarm for real execution."""
        task = self.db.get_task(task_id)
        if not task:
            raise KeyError(f"Công việc '{task_id}' không tồn tại.")
        if str(task.get("kanban_column") or "BACKLOG").upper() in ("BACKLOG", "REJECTED"):
            task = self.db.update_task(task_id, kanban_column="IN_PROGRESS")
        order = self.db.enqueue_order(
            order_type="EXECUTE_TASK",
            title=task["title"],
            instructions=(
                f"Thực thi thật đầu việc Kanban `{task_id}` (Phòng #{task['assigned_dept_id']}): "
                f"{task['title']}. Mô tả: {task.get('description') or 'Hoàn thành xuất sắc và qua kiểm định QA #47/#48.'}"
            ),
            task_id=task_id,
            source_device=source_device,
        )
        self.db.reconcile_live_system_state()
        dept_label = task.get("assigned_dept_title") or f"Phòng #{task['assigned_dept_id']}"
        self.db.log_event(
            actor_dept_id=str(task["assigned_dept_id"]),
            event_type="TASK_DISPATCHED",
            headline_vi=f"Đã giao Phòng #{task['assigned_dept_id']} ({dept_label}) thực thi ngay: {task['title']}",
            project_id=task.get("project_id"),
            task_id=task_id,
            detail={"order_id": order["order_id"], "assigned_dept_id": task["assigned_dept_id"]},
        )
        save_snapshot_file(self.db, DEFAULT_SNAPSHOT_PATH)
        return order


# Backward-compatible class alias for server imports
AutonomousMissionEngine = AntigravityBridgeDispatcher
