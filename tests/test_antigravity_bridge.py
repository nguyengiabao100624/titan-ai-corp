import json
import subprocess
import sys
import tempfile
import threading
import time
import unittest
import urllib.request
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = ROOT_DIR / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import antigravity_bridge
from command_center_server import CommandCenterHandler, ThreadingCommandServer
from titan_db import TitanDatabase


class TestDirectAntigravitySwarmBridge(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.db_path = Path(self.tmp.name) / "bridge_test.db"
        self.db = TitanDatabase(db_path=self.db_path)
        self.server = ThreadingCommandServer(("127.0.0.1", 0), CommandCenterHandler, db=self.db)
        self.port = self.server.server_address[1]
        self.base = f"http://127.0.0.1:{self.port}"
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.shutdown_clean()
        self.db.close_thread_conn()
        self.tmp.cleanup()

    def _post(self, path: str, body: dict) -> dict:
        req = urllib.request.Request(
            f"{self.base}{path}",
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=8) as r:
            return json.loads(r.read().decode("utf-8"))

    def _get(self, path: str) -> dict:
        with urllib.request.urlopen(f"{self.base}{path}", timeout=8) as r:
            return json.loads(r.read().decode("utf-8"))

    def test_live_wakeup_bridge_and_real_swarm_cli_reporting(self) -> None:
        # 1. Start real `antigravity_bridge.py wait` in a subprocess (mimics Antigravity background task)
        proc = subprocess.Popen(
            [
                sys.executable,
                str(SCRIPTS_DIR / "antigravity_bridge.py"),
                "--db",
                str(self.db_path),
                "wait",
                "--timeout",
                "15",
                "--poll-interval",
                "0.15",
                "--no-github",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Wait briefly until bridge heartbeat registers online=True via /api/bridge/status
        online = False
        for _ in range(30):
            st = self._get("/api/bridge/status")
            if st.get("online"):
                online = True
                break
            time.sleep(0.1)
        self.assertTrue(online, "Bridge heartbeat must report online=True while waiting")

        # 2. User submits a real mission on the Web UI -> must immediately wake up bridge subprocess!
        msn = self._post(
            "/api/missions",
            {"title": "Khảo sát ngách dịch vụ bảo trì máy lạnh", "goal_prompt": "Tìm nhu cầu thật & bảng giá cạnh tranh"},
        )
        mid = msn["mission_id"]
        self.assertEqual(msn["dispatch_state"], "QUEUED_FOR_ANTIGRAVITY")
        self.assertTrue(msn["bridge_online"])

        out, err = proc.communicate(timeout=10)
        self.assertEqual(proc.returncode, 0, f"Bridge stderr: {err}")
        self.assertIn("=== ANTIGRAVITY_ORDER_RECEIVED ===", out)
        payload_json = out.split("=== ANTIGRAVITY_ORDER_RECEIVED ===", 1)[1].strip()
        handoff = json.loads(payload_json)
        self.assertEqual(handoff["order"]["order_type"], "NEW_MISSION")
        self.assertEqual(handoff["order"]["mission_id"], mid)
        oid = handoff["order"]["order_id"]

        # 3. Antigravity Coordinator & Swarm Workers report real progress via titan_bridge_cli.py
        cli = [sys.executable, str(SCRIPTS_DIR / "titan_bridge_cli.py"), "--db", str(self.db_path)]
        subprocess.run(
            cli + ["mission-claimed", "--mission", mid, "--order", oid, "--swarm-title", "aircon-niche", "--workers", "@researcher,@critic,@ux-tester"],
            check=True,
            stdout=subprocess.DEVNULL,
        )
        subprocess.run(
            cli + ["step-start", "--mission", mid, "--step", "1", "--worker", "@researcher", "--depts", "01,50", "--activity", "Đang thu thập dữ liệu thị trường thật"],
            check=True,
            stdout=subprocess.DEVNULL,
        )
        subprocess.run(
            cli
            + [
                "step-complete",
                "--mission",
                mid,
                "--step",
                "1",
                "--worker",
                "@researcher",
                "--depts",
                "01,50",
                "--summary",
                "Đã khảo sát 12 đội thợ điện lạnh tại TP.HCM — 80% bỏ quên lịch nhắc bảo trì 6 tháng.",
                "--critique",
                "@critic (#47): Đã xác minh số liệu thực tế.",
                "--ux",
                "@ux-tester (#48): Nhu cầu rõ ràng.",
                "--artifact",
                "corporate_hq/projects/bao-tri-may-lanh/step1_market.md",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
        )
        subprocess.run(
            cli
            + [
                "request-proposal-approval",
                "--mission",
                mid,
                "--order",
                oid,
                "--summary",
                "Đề xuất GĐ 1 hoàn chỉnh từ Antigravity Swarm (Lãi gộp 82.5%, hòa vốn 6 khách).",
                "--survival",
                "91",
                "--ux-score",
                "94",
                "--margin",
                "82.5",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
        )

        # 4. Verify Gate 1 (PROPOSAL) waits for Chairman -> Chairman APPROVES -> Launches Phase 2 BUILD_PRODUCT!
        m_g1 = self._get(f"/api/missions/{mid}")
        self.assertEqual(m_g1["status"], "WAITING_CHAIRMAN")
        self.assertEqual(m_g1["phase"], "PROPOSAL")
        self.assertEqual(m_g1["steps"][0]["worker_name"], "@researcher")
        self.assertEqual(m_g1["steps"][0]["artifact_path"], "corporate_hq/projects/bao-tri-may-lanh/step1_market.md")

        g1_app = self._post(f"/api/missions/{mid}/decision", {"decision": "APPROVE", "note": "Chốt làm sản phẩm thật ngay!"})
        self.assertEqual(g1_app["phase"], "PRODUCTION")
        self.assertEqual(g1_app["status"], "RUNNING")
        self.assertEqual(g1_app["dispatch_state"], "QUEUED_FOR_ANTIGRAVITY")
        self.assertTrue(bool(g1_app.get("project_id")))
        pending_build = self._get("/api/orders?status=PENDING")["orders"]
        self.assertEqual(len(pending_build), 1)
        self.assertEqual(pending_build[0]["order_type"], "BUILD_PRODUCT")

        # Clean up auto-created project folder
        auto_p = self.db.get_project(g1_app["project_id"])
        if auto_p and auto_p.get("workspace_path"):
            import shutil
            shutil.rmtree(ROOT_DIR / auto_p["workspace_path"], ignore_errors=True)

        # 5. Swarm completes Phase 2 (Step 8) -> Chairman requests REWORK -> MISSION_REWORK queued!
        subprocess.run(
            cli
            + [
                "request-approval",
                "--mission",
                mid,
                "--order",
                pending_build[0]["order_id"],
                "--summary",
                "Sản phẩm cuối + bộ bán hàng đã hoàn chỉnh & test trình duyệt thật.",
                "--survival",
                "91",
                "--ux-score",
                "95",
                "--margin",
                "82.5",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
        )
        m_after = self._get(f"/api/missions/{mid}")
        self.assertEqual(m_after["status"], "WAITING_CHAIRMAN")
        self.assertEqual(m_after["phase"], "PRODUCTION")
        self.assertEqual(m_after["survival_score"], 91)

        rej = self._post(f"/api/missions/{mid}/decision", {"decision": "REJECT", "note": "Cần bổ sung kịch bản gọi điện mẫu"})
        self.assertEqual(rej["dispatch_state"], "QUEUED_FOR_ANTIGRAVITY")
        self.assertTrue(rej.get("order_id", "").startswith("ord-"))
        pending = self._get("/api/orders?status=PENDING")["orders"]
        self.assertEqual(len(pending), 1)
        self.assertEqual(pending[0]["order_type"], "MISSION_REWORK")
        self.assertIn("kịch bản gọi điện mẫu", pending[0]["instructions"])


if __name__ == "__main__":
    unittest.main()
