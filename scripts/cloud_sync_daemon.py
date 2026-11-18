#!/usr/bin/env python3
"""Titan AI Corp v4.0 — Bidirectional Workstation <-> GitHub Cloud Sync Daemon."""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from cloud_sync import DEFAULT_SNAPSHOT_PATH, GitHubCloudSyncClient, merge_snapshot_into_db, save_snapshot_file
from titan_db import DEFAULT_DB_PATH, TitanDatabase


def run_sync_cycle(
    db: TitanDatabase,
    client: GitHubCloudSyncClient | None,
    snapshot_path: Path = DEFAULT_SNAPSHOT_PATH,
    push: bool = True,
) -> dict:
    """Export local snapshot and optionally pull+merge+push with GitHub Cloud."""
    save_snapshot_file(db, snapshot_path)
    if client is None:
        return {"local_saved": True, "cloud_synced": False, "reason": "No GITHUB_REPO / GITHUB_TOKEN configured."}

    if push:
        res = client.push_merged_snapshot(db)
        save_snapshot_file(db, snapshot_path)
        return {"local_saved": True, "cloud_synced": True, **res}

    remote = client.pull_remote_snapshot()
    stats = merge_snapshot_into_db(db, remote) if remote else {}
    save_snapshot_file(db, snapshot_path)
    return {"local_saved": True, "cloud_synced": True, "pulled_changes": bool(remote), "merge_stats": stats}


def main() -> int:
    parser = argparse.ArgumentParser(description="Titan AI Corp Two-Way Multi-Device Cloud Sync Bridge")
    parser.add_argument("--repo", default=os.environ.get("TITAN_GITHUB_REPO", ""), help="GitHub owner/repo")
    parser.add_argument("--branch", default=os.environ.get("TITAN_GITHUB_BRANCH", "main"))
    parser.add_argument("--interval", type=int, default=30, help="Polling interval in seconds (min 10)")
    parser.add_argument("--once", action="store_true", help="Run a single sync pass and exit")
    parser.add_argument("--pull-only", action="store_true", help="Only pull & merge remote changes without pushing")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    args = parser.parse_args()

    token = os.environ.get("TITAN_GITHUB_TOKEN") or os.environ.get("GITHUB_TOKEN") or ""
    db = TitanDatabase(db_path=args.db)
    client = GitHubCloudSyncClient(args.repo, token, branch=args.branch) if (args.repo and token) else None

    if args.once:
        result = run_sync_cycle(db, client, push=not args.pull_only)
        print(f"[CLOUD SYNC] {result}", flush=True)
        return 0

    interval = max(10, args.interval)
    print(f"[CLOUD SYNC DAEMON] Active (interval={interval}s, repo={args.repo or 'local-snapshot-only'})", flush=True)
    try:
        while True:
            try:
                res = run_sync_cycle(db, client, push=not args.pull_only)
                if res.get("cloud_synced"):
                    print(f"[CLOUD SYNC] Synced OK: {res.get('merge_stats', {})}", flush=True)
            except Exception as exc:
                print(f"[CLOUD SYNC WARN] {exc}", file=sys.stderr, flush=True)
            finally:
                db.close_thread_conn()
            time.sleep(interval)
    except KeyboardInterrupt:
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
