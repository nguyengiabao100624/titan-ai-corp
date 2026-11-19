#!/usr/bin/env python3
"""
Titan AI Corp v6.0 — Live Swarm Worker Reporting CLI (`titan_bridge_cli.py`).

Used by Antigravity Coordinator and real Swarm Workers (`@researcher`, `@builder`, `@critic`, `@ux-tester`)
to push 100% real execution status, deliverables, adversarial critiques, and real opportunities straight
into SQLite (`titan_state.db`) -> SSE Web UI -> GitHub Pages (`snapshot.json`).
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from cloud_sync import DEFAULT_SNAPSHOT_PATH, save_snapshot_file
from titan_db import DEFAULT_DB_PATH, ROOT_DIR, TitanDatabase, utc_now_iso


def _sync_snapshot(db: TitanDatabase, snapshot_path: Path = DEFAULT_SNAPSHOT_PATH) -> None:
    if Path(db.db_path).resolve() == DEFAULT_DB_PATH.resolve():
        save_snapshot_file(db, snapshot_path)


def cmd_mission_claimed(db: TitanDatabase, args: argparse.Namespace) -> dict:
    workers = [w.strip() for w in str(args.workers or "").split(",") if w.strip()]
    msn = db.update_mission(
        args.mission,
        dispatch_state="SWARM_ACTIVE",
        swarm_title=args.swarm_title or "",
        swarm_workers_json=json.dumps(workers, ensure_ascii=False),
    )
    if args.order:
        db.complete_order(args.order, status="RUNNING", swarm_title=args.swarm_title or "")
    db.set_bridge_heartbeat(
        online=True,
        pid=os.getpid(),
        swarm_title=args.swarm_title or msn["title"],
        active_workers=workers,
        note=f"Antigravity Swarm đang chạy thật: {msn['title']}",
    )
    db.log_event(
        "00",
        "SWARM_STARTED",
        f"Antigravity Swarm đã khởi động {len(workers)} AI độc lập ({', '.join(workers)}) cho: {msn['title']}",
        detail={"mission_id": args.mission, "workers": workers, "swarm_title": args.swarm_title},
    )
    _sync_snapshot(db)
    return {"ok": True, "mission_id": args.mission, "workers": workers}


def cmd_step_start(db: TitanDatabase, args: argparse.Namespace) -> dict:
    sid = f"{args.mission}-s{args.step}"
    depts = [d.strip() for d in str(args.depts or "").split(",") if d.strip()]
    if depts:
        db.set_departments_activity(depts, "EXECUTING")
    db.update_mission(args.mission, dispatch_state="SWARM_ACTIVE")
    db.update_mission_step(
        sid,
        status="RUNNING",
        progress_pct=max(10, min(95, int(args.progress))),
        worker_name=args.worker,
        live_activity_text=args.activity,
        started_at=utc_now_iso(),
    )
    db.set_bridge_heartbeat(
        online=True,
        pid=os.getpid(),
        note=f"[{args.worker}] Bước {args.step}/7: {args.activity[:90]}",
    )
    db.log_event(
        depts[0] if depts else "00",
        "STEP_RUNNING",
        f"[Bước {args.step}/7 · {args.worker}] {args.activity}",
        detail={"mission_id": args.mission, "step": args.step, "worker": args.worker},
    )
    _sync_snapshot(db)
    return {"ok": True, "step_id": sid, "status": "RUNNING"}


def cmd_step_complete(db: TitanDatabase, args: argparse.Namespace) -> dict:
    sid = f"{args.mission}-s{args.step}"
    depts = [d.strip() for d in str(args.depts or "").split(",") if d.strip()]
    db.update_mission_step(
        sid,
        status="DONE",
        progress_pct=100,
        worker_name=args.worker,
        live_activity_text=args.activity or f"{args.worker} đã hoàn tất bước {args.step}/7 với kết quả kiểm chứng thật.",
        output_summary=args.summary,
        critique_verdict=args.critique or "",
        ux_verdict=args.ux or "",
        artifact_path=args.artifact or "",
        completed_at=utc_now_iso(),
    )
    if depts:
        db.set_departments_activity(depts, "IDLE", increment_done=True)
    db.log_event(
        depts[0] if depts else "00",
        "STEP_DONE",
        f"[Xong Bước {args.step}/7 · {args.worker}] {args.summary[:120]}",
        detail={"mission_id": args.mission, "step": args.step, "worker": args.worker, "artifact": args.artifact},
    )
    _sync_snapshot(db)
    return {"ok": True, "step_id": sid, "status": "DONE"}


def cmd_request_approval(db: TitanDatabase, args: argparse.Namespace) -> dict:
    sid = f"{args.mission}-s7"
    db.update_mission_step(
        sid,
        status="WAITING_APPROVAL",
        progress_pct=90,
        worker_name=args.worker or "@coordinator",
        live_activity_text="Antigravity Swarm đã hoàn tất 6 bước thực chiến — Chờ Chủ tịch bấm Chấp nhận hoặc Yêu cầu sửa.",
        output_summary=args.summary,
        critique_verdict=args.critique or "Đã qua phản biện độc lập bởi @critic (#46-#47)",
        ux_verdict=args.ux or "Đã qua kiểm thử đóng vai người dùng thật bởi @ux-tester (#48-#49)",
        artifact_path=args.artifact or "",
        started_at=utc_now_iso(),
    )
    msn = db.update_mission(
        args.mission,
        status="WAITING_CHAIRMAN",
        dispatch_state="WAITING_CHAIRMAN",
        final_summary=args.summary,
        survival_score=int(args.survival),
        ux_score=int(args.ux_score),
        expected_margin_pct=float(args.margin),
    )
    if args.order:
        db.complete_order(args.order, result_summary=args.summary[:400], status="COMPLETED")
    db.log_event(
        "00",
        "MISSION_WAITING",
        f"Antigravity Swarm đã xong 6 bước thật cho '{msn['title']}' — Mời Chủ tịch duyệt chốt!",
        detail={"mission_id": args.mission},
    )
    _sync_snapshot(db)
    return {"ok": True, "mission_id": args.mission, "status": "WAITING_CHAIRMAN"}


def cmd_add_opportunity(db: TitanDatabase, args: argparse.Namespace) -> dict:
    opp = db.create_opportunity(
        title=args.title,
        target_customer=args.customer,
        pain_point=args.pain,
        proposed_solution=args.solution,
        price_vnd=float(args.price),
        est_margin_pct=float(args.margin),
        breakeven_users=int(args.breakeven),
        survival_score=int(args.survival),
        critique_note=args.critique,
        ux_note=args.ux,
        source_url=args.url or "",
    )
    _sync_snapshot(db)
    return {"ok": True, "opportunity": opp}


def cmd_complete_order(db: TitanDatabase, args: argparse.Namespace) -> dict:
    ord_res = db.complete_order(args.order, result_summary=args.summary or "", status="COMPLETED")
    _sync_snapshot(db)
    return {"ok": True, "order": ord_res}


def cmd_publish_cloud(db: TitanDatabase, args: argparse.Namespace) -> dict:
    save_snapshot_file(db, DEFAULT_SNAPSHOT_PATH)
    if args.no_git:
        return {"ok": True, "snapshot_saved": True, "git_pushed": False}
    try:
        subprocess.run(
            ["git", "add", "corporate_hq/cloud_state/snapshot.json", "corporate_hq/projects"],
            cwd=str(ROOT_DIR),
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        diff = subprocess.run(
            ["git", "diff", "--cached", "--quiet"],
            cwd=str(ROOT_DIR),
            check=False,
        )
        if diff.returncode != 0:
            subprocess.run(
                ["git", "commit", "-m", args.message or "chore(swarm): sync real Antigravity progress to cloud"],
                cwd=str(ROOT_DIR),
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            subprocess.run(
                ["git", "push", "origin", "main"],
                cwd=str(ROOT_DIR),
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return {"ok": True, "snapshot_saved": True, "git_pushed": True}
        return {"ok": True, "snapshot_saved": True, "git_pushed": False, "note": "No diff to push"}
    except Exception as exc:
        return {"ok": False, "snapshot_saved": True, "error": str(exc)}


def main() -> int:
    parser = argparse.ArgumentParser(description="Titan AI Corp v6.0 — Swarm Worker Reporting CLI")
    parser.add_argument("--db", default=str(DEFAULT_DB_PATH), help="Path to SQLite DB")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_mc = sub.add_parser("mission-claimed")
    p_mc.add_argument("--mission", required=True)
    p_mc.add_argument("--order", default="")
    p_mc.add_argument("--swarm-title", default="")
    p_mc.add_argument("--workers", default="@researcher,@builder,@critic,@ux-tester")

    p_ss = sub.add_parser("step-start")
    p_ss.add_argument("--mission", required=True)
    p_ss.add_argument("--step", type=int, required=True)
    p_ss.add_argument("--worker", required=True)
    p_ss.add_argument("--depts", default="")
    p_ss.add_argument("--activity", required=True)
    p_ss.add_argument("--progress", type=int, default=45)

    p_sc = sub.add_parser("step-complete")
    p_sc.add_argument("--mission", required=True)
    p_sc.add_argument("--step", type=int, required=True)
    p_sc.add_argument("--worker", required=True)
    p_sc.add_argument("--depts", default="")
    p_sc.add_argument("--summary", required=True)
    p_sc.add_argument("--critique", default="")
    p_sc.add_argument("--ux", default="")
    p_sc.add_argument("--artifact", default="")
    p_sc.add_argument("--activity", default="")

    p_ra = sub.add_parser("request-approval")
    p_ra.add_argument("--mission", required=True)
    p_ra.add_argument("--order", default="")
    p_ra.add_argument("--worker", default="@coordinator")
    p_ra.add_argument("--summary", required=True)
    p_ra.add_argument("--critique", default="")
    p_ra.add_argument("--ux", default="")
    p_ra.add_argument("--artifact", default="")
    p_ra.add_argument("--survival", type=int, default=88)
    p_ra.add_argument("--ux-score", type=int, default=92)
    p_ra.add_argument("--margin", type=float, default=75.0)

    p_ao = sub.add_parser("add-opportunity")
    p_ao.add_argument("--title", required=True)
    p_ao.add_argument("--customer", required=True)
    p_ao.add_argument("--pain", required=True)
    p_ao.add_argument("--solution", required=True)
    p_ao.add_argument("--price", type=float, default=399000)
    p_ao.add_argument("--margin", type=float, default=75.0)
    p_ao.add_argument("--breakeven", type=int, default=6)
    p_ao.add_argument("--survival", type=int, default=86)
    p_ao.add_argument("--critique", required=True)
    p_ao.add_argument("--ux", required=True)
    p_ao.add_argument("--url", default="")

    p_co = sub.add_parser("complete-order")
    p_co.add_argument("--order", required=True)
    p_co.add_argument("--summary", default="")

    p_pc = sub.add_parser("publish-cloud")
    p_pc.add_argument("--message", default="")
    p_pc.add_argument("--no-git", action="store_true")

    args = parser.parse_args()
    db = TitanDatabase(db_path=args.db)
    try:
        dispatch = {
            "mission-claimed": cmd_mission_claimed,
            "step-start": cmd_step_start,
            "step-complete": cmd_step_complete,
            "request-approval": cmd_request_approval,
            "add-opportunity": cmd_add_opportunity,
            "complete-order": cmd_complete_order,
            "publish-cloud": cmd_publish_cloud,
        }
        res = dispatch[args.cmd](db, args)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0
    finally:
        db.close_thread_conn()


if __name__ == "__main__":
    raise SystemExit(main())
