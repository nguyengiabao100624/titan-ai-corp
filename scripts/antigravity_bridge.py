#!/usr/bin/env python3
"""
Titan AI Corp v6.0 — Direct Web ↔ Antigravity Swarm Wakeup Bridge.

Run via Antigravity's native `run_command` tool (`python scripts/antigravity_bridge.py wait`):
  1. Pulses a live heartbeat into `bridge_state` every 3 seconds so the Web UI displays
     a live green indicator: "Antigravity: Đang trực chiến".
  2. Polls local SQLite `antigravity_orders` every 1 second AND (optionally) GitHub
     `corporate_hq/cloud_state/remote_inbox.json` every 15 seconds for orders placed
     remotely from the Chairman's Phone via GitHub Pages.
  3. The instant a PENDING order arrives, atomically claims it, prints a structured
     handoff block (`=== ANTIGRAVITY_ORDER_RECEIVED ===`) to stdout, and EXITS (code 0),
     triggering Antigravity's native Reactive Wakeup immediately!
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from cloud_sync import DEFAULT_SNAPSHOT_PATH, save_snapshot_file
from titan_db import DEFAULT_DB_PATH, ROOT_DIR, TitanDatabase, utc_now_iso

DEFAULT_GH_REPO = "nguyengiabao100624/titan-ai-corp"
REMOTE_INBOX_PATH = "corporate_hq/cloud_state/remote_inbox.json"


def _detect_gh_repo() -> str:
    env_repo = os.environ.get("TITAN_GH_REPO", "").strip()
    if env_repo:
        return env_repo
    try:
        out = subprocess.check_output(
            ["git", "remote", "get-url", "origin"],
            cwd=str(ROOT_DIR),
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=5,
        ).strip()
        if "github.com" in out:
            part = out.split("github.com")[-1].lstrip(":/").removesuffix(".git")
            if "/" in part:
                return part
    except Exception:
        pass
    return DEFAULT_GH_REPO


def pull_remote_github_inbox(db: TitanDatabase, repo: str | None = None) -> list[dict[str, Any]]:
    """
    Pull orders queued from Phone/Tablet via GitHub Pages (`corporate_hq/cloud_state/remote_inbox.json`),
    ingest them into local SQLite (`missions` + `antigravity_orders`), and mark them acknowledged on GitHub.
    """
    if not shutil.which("gh"):
        return []
    target_repo = repo or _detect_gh_repo()
    try:
        raw = subprocess.check_output(
            ["gh", "api", f"repos/{target_repo}/contents/{REMOTE_INBOX_PATH}"],
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=12,
        )
        payload = json.loads(raw)
        sha = payload.get("sha")
        content_b64 = payload.get("content", "")
        if not content_b64:
            return []
        inbox_data = json.loads(base64.b64decode(content_b64).decode("utf-8"))
    except Exception:
        return []

    pending_remote = [
        o for o in (inbox_data.get("orders") or [])
        if isinstance(o, dict) and o.get("status", "PENDING") == "PENDING"
    ]
    if not pending_remote:
        return []

    ingested: list[dict[str, Any]] = []
    for ro in pending_remote:
        oid = str(ro.get("order_id") or "").strip()
        otype = str(ro.get("order_type") or "NEW_MISSION").upper().strip()
        title = str(ro.get("title") or "").strip()
        instructions = str(ro.get("instructions") or title).strip()
        src = str(ro.get("source_device") or "mobile-github-pages")
        if not title:
            continue
        if oid and db.get_order(oid):
            ro["status"] = "CLAIMED"
            ro["claimed_at"] = utc_now_iso()
            continue

        mission_id = ro.get("mission_id")
        if otype == "NEW_MISSION" and not mission_id:
            msn = db.create_mission(
                title=title,
                goal_prompt=instructions,
                category=str(ro.get("category") or "MONEY_MAKER"),
                auto_approve=bool(ro.get("auto_approve", False)),
                enqueue_order=False,
                source_device=src,
            )
            mission_id = msn["mission_id"]
        elif otype == "MISSION_REWORK" and mission_id:
            try:
                db.decide_mission(mission_id, "REJECT", note=instructions)
                ro["status"] = "CLAIMED"
                ro["claimed_at"] = utc_now_iso()
                ingested.append({"order_type": "MISSION_REWORK", "mission_id": mission_id, "title": title})
                continue
            except Exception:
                pass
        elif otype == "MISSION_APPROVED" and mission_id:
            try:
                db.decide_mission(mission_id, "APPROVE", note=instructions)
                ro["status"] = "COMPLETED"
                ro["claimed_at"] = utc_now_iso()
                continue
            except Exception:
                pass

        created = db.enqueue_order(
            order_type=otype if otype in ("NEW_MISSION", "MISSION_REWORK", "SCAN_OPPORTUNITIES", "EXECUTE_TASK") else "NEW_MISSION",
            title=title,
            instructions=instructions,
            mission_id=mission_id,
            task_id=ro.get("task_id"),
            source_device=src,
            order_id=oid or None,
        )
        ro["status"] = "CLAIMED"
        ro["claimed_at"] = utc_now_iso()
        ro["local_mission_id"] = mission_id
        ingested.append(created)

    # Acknowledge claimed orders back to GitHub so they are not re-ingested
    if sha:
        inbox_data["updated_at"] = utc_now_iso()
        inbox_data["orders"] = (inbox_data.get("orders") or [])[-30:]
        new_b64 = base64.b64encode(json.dumps(inbox_data, ensure_ascii=False, indent=2).encode("utf-8")).decode("ascii")
        try:
            subprocess.run(
                [
                    "gh", "api", f"repos/{target_repo}/contents/{REMOTE_INBOX_PATH}",
                    "-X", "PUT",
                    "-f", "message=chore(bridge): acknowledge remote mobile orders",
                    "-f", f"content={new_b64}",
                    "-f", f"sha={sha}",
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=15,
                check=False,
            )
        except Exception:
            pass

    if ingested:
        save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
    return ingested


def format_order_handoff(db: TitanDatabase, order: dict[str, Any]) -> dict[str, Any]:
    """Assemble full structured context so Antigravity Coordinator can immediately spin up Swarm workers."""
    mission = db.get_mission(order["mission_id"]) if order.get("mission_id") else None
    task = db.get_task(order["task_id"]) if order.get("task_id") else None
    return {
        "event": "ANTIGRAVITY_ORDER_RECEIVED",
        "received_at": utc_now_iso(),
        "order": order,
        "mission": mission,
        "task": task,
        "reporting_cli": "python scripts/titan_bridge_cli.py",
        "suggested_swarm_playbook": {
            "NEW_MISSION": (
                "PHASE 1 (Steps 1-4): Spawn real Antigravity Swarm workers (`swarm add`): "
                "@researcher (read #01/#02/#03/#50), @cfo (#38/#39), @critic (#46/#47 Pre-Mortem). "
                "Report Steps 1-3 via `titan_bridge_cli.py step-start / step-complete`, then call "
                "`request-proposal-approval` at Step 4 so Chairman reviews & approves launching Phase 2 Production!"
            ),
            "BUILD_PRODUCT": (
                "PHASE 2 FULL PRODUCTION (Steps 5-8): Chairman APPROVED the deal! Spawn full company Swarm: "
                "@builder (read #13/#14/#15/#16/#19 — write REAL runnable app/code/tool inside the linked project folder), "
                "@growth-pack (#25/#26/#32/#33/#40 — build REAL landing page, pricing, sales scripts & legal checklist), "
                "@ux-tester (#48/#49/#20 — open REAL browser and test every button as 5 customer personas), "
                "@critic (#46/#47/#23 — audit bugs/security). Report Steps 5-7 live via `titan_bridge_cli.py`, "
                "then present the finished runnable product at Step 8 via `request-approval`!"
            ),
            "MISSION_REWORK": (
                "Wake or spawn Swarm workers to fix the exact Chairman rejection note in `order.instructions`, "
                "re-verify with @critic (#46/#47) & @ux-tester (#48), and re-submit to Chairman."
            ),
            "SCAN_OPPORTUNITIES": (
                "Spawn @opportunity-hunter (#50) + @critic (#46) + @cfo (#38) to research REAL live market pains "
                "and publish 2–3 vetted opportunities via `python scripts/titan_bridge_cli.py add-opportunity ...`."
            ),
            "EXECUTE_TASK": (
                "Spawn a specialist Swarm worker matching `task.assigned_dept_id` + verifier (#47/#48) to execute the task for real "
                "and submit deliverable via `python scripts/titan_bridge_cli.py`."
            ),
        }.get(order.get("order_type", "NEW_MISSION"), ""),
    }


def wait_for_next_order(
    db: TitanDatabase,
    timeout_sec: int = 900,
    poll_interval_sec: float = 1.0,
    poll_github: bool = True,
    github_interval_sec: float = 15.0,
) -> dict[str, Any] | None:
    """Block efficiently at ~0% CPU until a real Web/Mobile order arrives, then claim & return it."""
    pid = os.getpid()
    deadline = time.monotonic() + max(1, timeout_sec)
    last_hb = 0.0
    last_gh = 0.0
    repo = _detect_gh_repo() if poll_github else ""

    try:
        while True:
            now_mono = time.monotonic()
            if now_mono - last_hb >= 3.0:
                db.set_bridge_heartbeat(
                    online=True,
                    pid=pid,
                    note="Hệ thống điều phối đang trực chiến, sẵn sàng nhận việc tức thì từ máy tính và điện thoại",
                )
                last_hb = now_mono

            if poll_github and (now_mono - last_gh >= github_interval_sec):
                pull_remote_github_inbox(db, repo=repo)
                last_gh = now_mono

            claimed = db.claim_next_pending_order(claimed_by="antigravity-coordinator")
            if claimed:
                db.set_bridge_heartbeat(
                    online=True,
                    pid=pid,
                    note=f"Đang tiếp nhận lệnh {claimed['order_id']}: {claimed['title']}",
                )
                save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
                return format_order_handoff(db, claimed)

            if now_mono >= deadline:
                return None

            time.sleep(min(poll_interval_sec, max(0.05, deadline - time.monotonic())))
    finally:
        db.close_thread_conn()


def main() -> int:
    parser = argparse.ArgumentParser(description="Titan AI Corp v6.0 — Direct Web ↔ Antigravity Swarm Bridge")
    parser.add_argument("--db", default=str(DEFAULT_DB_PATH), help="Path to SQLite database")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_wait = sub.add_parser("wait", help="Listen for next real Web/Mobile order, claim it, print JSON, and exit")
    p_wait.add_argument("--timeout", type=int, default=900, help="Max wait seconds before clean timeout exit")
    p_wait.add_argument("--poll-interval", type=float, default=1.0, help="Local SQLite poll interval (sec)")
    p_wait.add_argument("--no-github", action="store_true", help="Disable GitHub remote_inbox.json polling")

    sub.add_parser("status", help="Show current bridge status and pending orders")
    sub.add_parser("pull-remote", help="One-shot pull of pending orders from GitHub remote_inbox.json")

    args = parser.parse_args()
    db = TitanDatabase(db_path=args.db)

    if args.cmd == "status":
        print(json.dumps({"bridge": db.get_bridge_status(), "pending_orders": db.list_orders(status="PENDING")}, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "pull-remote":
        ing = pull_remote_github_inbox(db)
        print(json.dumps({"ingested_count": len(ing), "orders": ing}, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "wait":
        handoff = wait_for_next_order(
            db=db,
            timeout_sec=args.timeout,
            poll_interval_sec=args.poll_interval,
            poll_github=not args.no_github,
        )
        if handoff:
            print("=== ANTIGRAVITY_ORDER_RECEIVED ===")
            print(json.dumps(handoff, ensure_ascii=False, indent=2))
            return 0
        print(json.dumps({"event": "BRIDGE_WAIT_TIMEOUT", "pending_orders": 0}, ensure_ascii=False))
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
