#!/usr/bin/env python3
"""
Titan AI Corp v7.0 — Đường hầm Trực tuyến HTTPS 1 Luồng Duy Nhất (`online_tunnel.py`).

Chạy `cloudflared tunnel --url http://127.0.0.1:8765 --no-autoupdate` để mở đường hầm
HTTPS công cộng (`https://<subdomain>.trycloudflare.com`), tự động ghi ra
`corporate_hq/cloud_state/online_endpoint.json` và đẩy lên GitHub để trang duy nhất
https://nguyengiabao100624.github.io/titan-ai-corp/ kết nối trực tuyến tức thì trên
cả Máy tính lẫn Điện thoại 4G.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import queue
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_LOCAL_URL = "http://127.0.0.1:8765"
DEFAULT_ENDPOINT_FILE = ROOT_DIR / "corporate_hq" / "cloud_state" / "online_endpoint.json"
DEFAULT_GH_REPO = "nguyengiabao100624/titan-ai-corp"
DEFAULT_REMOTE_PATH = "corporate_hq/cloud_state/online_endpoint.json"

TRYCLOUDFLARE_RE = re.compile(r"https://([a-zA-Z0-9-]+)\.trycloudflare\.com\b")
RESERVED_SUBDOMAINS = {"api", "www", "update", "status", "docs", "help", "support"}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def find_cloudflared_binary(explicit_path: str | None = None) -> Path:
    """Tìm tệp thực thi cloudflared trong biến môi trường, PATH hoặc thư mục cài đặt Windows."""
    candidates: list[Path] = []
    if explicit_path:
        candidates.append(Path(explicit_path))
    env_path = os.environ.get("TITAN_CLOUDFLARED_PATH", "").strip()
    if env_path:
        candidates.append(Path(env_path))
    which_path = shutil.which("cloudflared")
    if which_path:
        candidates.append(Path(which_path))
    candidates.extend(
        [
            Path(r"C:\Program Files (x86)\cloudflared\cloudflared.exe"),
            Path(r"C:\Program Files\cloudflared\cloudflared.exe"),
            Path.home() / "scoop" / "shims" / "cloudflared.exe",
        ]
    )
    local_app_data = os.environ.get("LOCALAPPDATA", "").strip()
    if local_app_data:
        candidates.append(Path(local_app_data) / "cloudflared" / "cloudflared.exe")

    for candidate in candidates:
        if candidate.is_file():
            return candidate
    raise FileNotFoundError(
        "Không tìm thấy tệp thực thi cloudflared. Vui lòng cài đặt cloudflared vào PATH "
        "hoặc C:\\Program Files (x86)\\cloudflared\\cloudflared.exe."
    )


def find_gh_binary() -> Path | None:
    """Tìm GitHub CLI (`gh`) trong PATH hoặc thư mục cài đặt mặc định trên Windows."""
    which_gh = shutil.which("gh")
    if which_gh:
        return Path(which_gh)
    for candidate in (
        Path(r"C:\Program Files\GitHub CLI\gh.exe"),
        Path(r"C:\Program Files (x86)\GitHub CLI\gh.exe"),
    ):
        if candidate.is_file():
            return candidate
    return None


def detect_github_repo() -> str:
    """Tự động phát hiện kho GitHub từ biến môi trường hoặc cấu hình git remote origin."""
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


def extract_trycloudflare_url(text: str) -> str | None:
    """Bắt đúng địa chỉ HTTPS công cộng dạng https://<subdomain>.trycloudflare.com từ log."""
    for match in TRYCLOUDFLARE_RE.finditer(text or ""):
        sub = match.group(1).lower()
        if sub in RESERVED_SUBDOMAINS:
            continue
        return match.group(0).rstrip("/")
    return None


def write_online_endpoint_file(
    endpoint_path: Path,
    online_api_url: str,
    status: str = "ONLINE",
) -> dict[str, Any]:
    """Ghi nguyên tử tệp cấu hình địa chỉ đường hầm trực tuyến."""
    payload: dict[str, Any] = {
        "online_api_url": online_api_url.rstrip("/") if online_api_url else "",
        "updated_at": utc_now_iso(),
        "status": status.upper().strip(),
    }
    endpoint_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = endpoint_path.with_suffix(f".{os.getpid()}.tmp")
    tmp_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(str(tmp_path), str(endpoint_path))
    return payload


def _gh_get_file_sha(gh_bin: Path, repo: str, remote_path: str, branch: str) -> str | None:
    proc = subprocess.run(
        [str(gh_bin), "api", f"repos/{repo}/contents/{remote_path}?ref={branch}"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=15,
        check=False,
    )
    if proc.returncode != 0:
        return None
    try:
        data = json.loads(proc.stdout)
        sha = data.get("sha")
        return str(sha) if sha else None
    except Exception:
        return None


def push_online_endpoint_to_github(
    endpoint_path: Path,
    repo: str,
    branch: str = "main",
    remote_path: str = DEFAULT_REMOTE_PATH,
) -> dict[str, Any]:
    """
    Đẩy tệp `corporate_hq/cloud_state/online_endpoint.json` lên GitHub qua `gh api`
    (không ảnh hưởng working tree cục bộ), kèm cơ chế dự phòng bằng `git push` cho đúng tệp này.
    """
    raw_bytes = endpoint_path.read_bytes()
    content_b64 = base64.b64encode(raw_bytes).decode("ascii")
    commit_msg = "chore(tunnel): cap nhat dia chi duong ham HTTPS truc tuyen"

    gh_bin = find_gh_binary()
    gh_error = ""
    if gh_bin is not None:
        for attempt in range(2):
            sha = _gh_get_file_sha(gh_bin, repo, remote_path, branch)
            cmd = [
                str(gh_bin),
                "api",
                f"repos/{repo}/contents/{remote_path}",
                "-X",
                "PUT",
                "-f",
                f"message={commit_msg}",
                "-f",
                f"content={content_b64}",
                "-f",
                f"branch={branch}",
            ]
            if sha:
                cmd.extend(["-f", f"sha={sha}"])
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=20,
                check=False,
            )
            if proc.returncode == 0:
                return {
                    "pushed": True,
                    "method": "gh_api",
                    "repo": repo,
                    "branch": branch,
                    "remote_path": remote_path,
                    "error": "",
                }
            gh_error = (proc.stderr or proc.stdout or f"gh api exit {proc.returncode}").strip()
            if "409" not in gh_error and attempt == 0:
                break

    # Dự phòng qua git nếu gh api không khả dụng
    try:
        rel_path = str(endpoint_path.resolve().relative_to(ROOT_DIR.resolve())).replace("\\", "/")
        subprocess.run(
            ["git", "add", "--", rel_path],
            cwd=str(ROOT_DIR),
            check=True,
            capture_output=True,
            timeout=15,
        )
        diff_proc = subprocess.run(
            ["git", "diff", "--cached", "--quiet", "--", rel_path],
            cwd=str(ROOT_DIR),
            check=False,
            timeout=10,
        )
        if diff_proc.returncode != 0:
            subprocess.run(
                ["git", "commit", "-m", commit_msg, "--", rel_path],
                cwd=str(ROOT_DIR),
                check=True,
                capture_output=True,
                timeout=20,
            )
            subprocess.run(
                ["git", "push", "origin", branch],
                cwd=str(ROOT_DIR),
                check=True,
                capture_output=True,
                timeout=30,
            )
        return {
            "pushed": True,
            "method": "git_push",
            "repo": repo,
            "branch": branch,
            "remote_path": remote_path,
            "error": "",
        }
    except Exception as exc:
        combined_err = "; ".join(part for part in (gh_error, str(exc)) if part)
        return {
            "pushed": False,
            "method": "none",
            "repo": repo,
            "branch": branch,
            "remote_path": remote_path,
            "error": combined_err,
        }


def _check_local_server_health(local_url: str) -> tuple[bool, str]:
    health_url = f"{local_url.rstrip('/')}/api/health"
    try:
        req = urllib.request.Request(health_url, method="GET")
        with urllib.request.urlopen(req, timeout=2.5) as resp:
            if resp.status == 200:
                return True, "Máy chủ cục bộ đang hoạt động bình thường."
            return False, f"Mã phản hồi {resp.status}"
    except Exception as exc:
        return False, str(exc)


def run_preflight_check(
    local_url: str,
    endpoint_path: Path,
    repo: str,
    cloudflared_override: str | None = None,
) -> tuple[int, dict[str, Any]]:
    """Kiểm tra nhanh môi trường sẵn sàng cho đường hầm HTTPS (không mở tiến trình treo)."""
    result: dict[str, Any] = {
        "ok": False,
        "checked_at": utc_now_iso(),
        "cloudflared_found": False,
        "cloudflared_path": "",
        "cloudflared_version": "",
        "gh_found": False,
        "gh_authenticated": False,
        "github_repo": repo,
        "local_url": local_url,
        "local_server_reachable": False,
        "local_server_note": "",
        "endpoint_file": str(endpoint_path),
        "endpoint_dir_writable": False,
    }

    try:
        cf_bin = find_cloudflared_binary(cloudflared_override)
        result["cloudflared_found"] = True
        result["cloudflared_path"] = str(cf_bin)
        ver_proc = subprocess.run(
            [str(cf_bin), "--version"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=10,
            check=False,
        )
        ver_text = (ver_proc.stdout or ver_proc.stderr or "").strip().splitlines()
        result["cloudflared_version"] = ver_text[0] if ver_text else ""
    except FileNotFoundError as exc:
        result["error"] = str(exc)

    gh_bin = find_gh_binary()
    if gh_bin is not None:
        result["gh_found"] = True
        auth_proc = subprocess.run(
            [str(gh_bin), "auth", "status"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=10,
            check=False,
        )
        result["gh_authenticated"] = auth_proc.returncode == 0

    reachable, note = _check_local_server_health(local_url)
    result["local_server_reachable"] = reachable
    result["local_server_note"] = note

    try:
        endpoint_path.parent.mkdir(parents=True, exist_ok=True)
        probe_file = endpoint_path.parent / f".probe_{os.getpid()}.tmp"
        probe_file.write_text("ok", encoding="utf-8")
        probe_file.unlink(missing_ok=True)
        result["endpoint_dir_writable"] = True
    except Exception:
        result["endpoint_dir_writable"] = False

    result["ok"] = bool(result["cloudflared_found"] and result["endpoint_dir_writable"])
    return (0 if result["ok"] else 1), result


def run_tunnel(
    local_url: str = DEFAULT_LOCAL_URL,
    endpoint_path: Path = DEFAULT_ENDPOINT_FILE,
    repo: str = "",
    branch: str = "main",
    remote_path: str = DEFAULT_REMOTE_PATH,
    push_github: bool = True,
    startup_timeout_sec: int = 45,
    cloudflared_override: str | None = None,
    verbose: bool = False,
) -> int:
    """Khởi chạy cloudflared quick tunnel, cập nhật online_endpoint.json, đẩy lên GitHub và giữ kết nối."""
    cf_bin = find_cloudflared_binary(cloudflared_override)
    target_repo = repo or detect_github_repo()

    cmd = [
        str(cf_bin),
        "tunnel",
        "--url",
        local_url,
        "--no-autoupdate",
    ]
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
    )

    line_queue: queue.Queue[str | None] = queue.Queue(maxsize=500)
    stop_requested = threading.Event()

    def _reader() -> None:
        assert proc.stdout is not None
        try:
            for raw_line in proc.stdout:
                try:
                    line_queue.put(raw_line, timeout=2.0)
                except queue.Full:
                    pass
        finally:
            try:
                line_queue.put(None, timeout=1.0)
            except queue.Full:
                pass

    reader_thread = threading.Thread(target=_reader, daemon=True, name="cloudflared-log-reader")
    reader_thread.start()

    def _handle_signal(_signum: int, _frame: Any) -> None:
        stop_requested.set()
        if proc.poll() is None:
            proc.terminate()

    signal.signal(signal.SIGINT, _handle_signal)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, _handle_signal)

    tunnel_url: str | None = None
    recent_logs: list[str] = []
    deadline = time.monotonic() + max(5, startup_timeout_sec)

    try:
        while not stop_requested.is_set():
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                print(
                    "[LỖI] Hết thời gian chờ địa chỉ đường hầm HTTPS từ cloudflared.",
                    file=sys.stderr,
                    flush=True,
                )
                return 2
            try:
                line = line_queue.get(timeout=min(0.5, remaining))
            except queue.Empty:
                if proc.poll() is not None:
                    break
                continue
            if line is None:
                break
            stripped = line.rstrip()
            recent_logs.append(stripped)
            if len(recent_logs) > 40:
                recent_logs.pop(0)
            if verbose:
                print(f"[cloudflared] {stripped}", file=sys.stderr, flush=True)
            found = extract_trycloudflare_url(stripped)
            if found:
                tunnel_url = found
                break

        if not tunnel_url:
            print(
                "[LỖI] Không thu được địa chỉ https://*.trycloudflare.com từ cloudflared.\n"
                + "\n".join(recent_logs[-12:]),
                file=sys.stderr,
                flush=True,
            )
            return 1

        write_online_endpoint_file(endpoint_path, tunnel_url, status="ONLINE")

        if push_github:
            push_res = push_online_endpoint_to_github(
                endpoint_path=endpoint_path,
                repo=target_repo,
                branch=branch,
                remote_path=remote_path,
            )
            if push_res["pushed"]:
                print(
                    f"[ĐỒNG BỘ GITHUB] Đã đẩy địa chỉ trực tuyến lên {target_repo} ({push_res['method']}).",
                    file=sys.stderr,
                    flush=True,
                )
            else:
                print(
                    f"[CẢNH BÁO] Chưa đẩy được online_endpoint.json lên GitHub: {push_res['error']}",
                    file=sys.stderr,
                    flush=True,
                )

        print(f"ONLINE_TUNNEL_READY={tunnel_url}", flush=True)

        # Tiếp tục đọc và xả log để đường hầm mở ổn định lâu dài không bị đầy bộ đệm pipe
        while not stop_requested.is_set():
            try:
                line = line_queue.get(timeout=1.0)
            except queue.Empty:
                if proc.poll() is not None:
                    break
                continue
            if line is None:
                break
            if verbose:
                print(f"[cloudflared] {line.rstrip()}", file=sys.stderr, flush=True)

        return 0 if stop_requested.is_set() else (proc.returncode or 0)
    finally:
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
        if tunnel_url:
            try:
                write_online_endpoint_file(endpoint_path, "", status="OFFLINE")
            except Exception:
                pass


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Titan AI Corp — Đường hầm Trực tuyến HTTPS 1 Luồng Duy Nhất qua Cloudflare Tunnel"
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Kiểm tra sẵn sàng cloudflared, GitHub CLI và thư mục ghi cấu hình rồi thoát ngay",
    )
    parser.add_argument(
        "--local-url",
        default=DEFAULT_LOCAL_URL,
        help="Địa chỉ máy chủ cục bộ cần mở đường hầm (mặc định: http://127.0.0.1:8765)",
    )
    parser.add_argument(
        "--endpoint-file",
        type=Path,
        default=DEFAULT_ENDPOINT_FILE,
        help="Đường dẫn tệp online_endpoint.json",
    )
    parser.add_argument(
        "--repo",
        default="",
        help="Kho GitHub dạng owner/repo để tự động cập nhật online_endpoint.json",
    )
    parser.add_argument(
        "--branch",
        default="main",
        help="Nhánh GitHub cần cập nhật (mặc định: main)",
    )
    parser.add_argument(
        "--no-github",
        action="store_true",
        help="Chỉ ghi tệp cục bộ, không đẩy lên GitHub",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=45,
        help="Thời gian tối đa (giây) chờ địa chỉ trycloudflare.com khi khởi động",
    )
    parser.add_argument(
        "--cloudflared",
        default="",
        help="Đường dẫn tường minh tới tệp thực thi cloudflared",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="In toàn bộ dòng log của cloudflared ra stderr",
    )

    args = parser.parse_args()
    repo = args.repo.strip() or detect_github_repo()

    if args.check:
        code, report = run_preflight_check(
            local_url=args.local_url,
            endpoint_path=args.endpoint_file,
            repo=repo,
            cloudflared_override=args.cloudflared or None,
        )
        print(json.dumps(report, ensure_ascii=False, indent=2), flush=True)
        return code

    return run_tunnel(
        local_url=args.local_url,
        endpoint_path=args.endpoint_file,
        repo=repo,
        branch=args.branch,
        push_github=not args.no_github,
        startup_timeout_sec=args.timeout,
        cloudflared_override=args.cloudflared or None,
        verbose=args.verbose,
    )


if __name__ == "__main__":
    raise SystemExit(main())
