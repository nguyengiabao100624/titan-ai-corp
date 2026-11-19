import gzip
import json
import shutil
import sys
import tempfile
import threading
import unittest
import unittest.mock
import urllib.error
import urllib.request
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT_DIR / "scripts"
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import command_center_server
from command_center_server import CommandCenterHandler, ThreadingCommandServer
from titan_cli import add_department as real_add_department
from titan_db import TitanDatabase


class TestCommandCenterAPIAndSecurity(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.tmp_path = Path(self.tmp_dir.name)
        self.db_path = self.tmp_path / "api_test.db"
        self.snap_path = self.tmp_path / "snapshot.json"
        self.sandbox_skills = self.tmp_path / "skills_sandbox"
        (self.sandbox_skills / "div5-media-youtube-studio" / "specialists").mkdir(parents=True, exist_ok=True)

        self.db = TitanDatabase(db_path=self.db_path)

        # Patch DEFAULT_SNAPSHOT_PATH so tests never mutate production snapshot
        self.snap_patch = unittest.mock.patch.object(command_center_server, "DEFAULT_SNAPSHOT_PATH", self.snap_path)
        self.snap_patch.start()

        self.server = ThreadingCommandServer(("127.0.0.1", 0), CommandCenterHandler, db=self.db)
        self.port = self.server.server_address[1]
        self.base_url = f"http://127.0.0.1:{self.port}"
        self.server_thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.server_thread.start()

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.shutdown_clean()
        self.db.close_thread_conn()
        self.snap_patch.stop()
        # Clean up any sandboxed test project directories created under corporate_hq/projects/
        for base in (ROOT_DIR / "projects", ROOT_DIR / "corporate_hq" / "projects"):
            test_proj_dir = base / "test-saas-api-suite"
            if test_proj_dir.exists():
                shutil.rmtree(test_proj_dir, ignore_errors=True)
        self.tmp_dir.cleanup()

    def _req(
        self,
        path: str,
        method: str = "GET",
        body: dict | None = None,
        headers: dict[str, str] | None = None,
    ) -> tuple[int, dict[str, str], bytes]:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req_headers = dict(headers or {})
        if data is not None:
            req_headers.setdefault("Content-Type", "application/json")
        req = urllib.request.Request(f"{self.base_url}{path}", data=data, headers=req_headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                return resp.status, dict(resp.headers.items()), resp.read()
        except urllib.error.HTTPError as e:
            return e.code, dict(e.headers.items()), e.read()

    def test_01_static_pwa_gzip_and_etag_304(self) -> None:
        # Static UI & PWA endpoints
        for route in ("/", "/styles.css", "/app.js", "/manifest.webmanifest", "/sw.js", "/icon.svg"):
            status, hdrs, raw = self._req(route, headers={"Accept-Encoding": "gzip"})
            self.assertEqual(status, 200, f"Failed static route {route}")
            if hdrs.get("Content-Encoding") == "gzip":
                raw = gzip.decompress(raw)
            self.assertGreater(len(raw), 50)

        # Overview with Gzip + Strong ETag -> 304 Not Modified (SLA-07)
        st1, hdr1, body1 = self._req("/api/overview", headers={"Accept-Encoding": "gzip"})
        self.assertEqual(st1, 200)
        self.assertEqual(hdr1.get("Content-Encoding"), "gzip")
        etag = hdr1.get("ETag")
        self.assertTrue(etag and etag.startswith('"'))
        ov = json.loads(gzip.decompress(body1).decode("utf-8"))
        self.assertEqual(ov["kpis"]["total_departments"], 51)

        st2, _hdr2, body2 = self._req("/api/overview", headers={"If-None-Match": etag})
        self.assertEqual(st2, 304)
        self.assertEqual(len(body2), 0)

    def test_02_full_task_checkout_citation_reject_reflexion_and_approve_lifecycle(self) -> None:
        # 1. Create Project (seeds 4 Gate 1 tasks)
        st_p, _, raw_p = self._req(
            "/api/projects",
            method="POST",
            body={
                "slug": "test-saas-api-suite",
                "title": "Test SaaS API Suite",
                "objective": "Kiểm định vòng đời dự án 12 bước",
                "expected_price_vnd": 499000,
                "unit_cost_vnd": 99000,
            },
        )
        self.assertEqual(st_p, 201)
        proj = json.loads(raw_p.decode("utf-8"))
        self.assertEqual(proj["project_id"], "proj-test-saas-api-suite")

        # 2. Create Task
        st_t, _, raw_t = self._req(
            "/api/tasks",
            method="POST",
            body={
                "title": "Điều tra đối thủ phần mềm rèm cửa",
                "assigned_dept_id": "03",
                "project_id": "proj-test-saas-api-suite",
                "gate_number": 1,
                "stage_number": 2,
            },
        )
        self.assertEqual(st_t, 201)
        tid = json.loads(raw_t.decode("utf-8"))["task_id"]

        # 3. Atomic Checkout (first wins 200, rival gets 409)
        st_c1, _, _ = self._req(f"/api/tasks/{tid}/checkout", method="POST", body={"dept_id": "03", "worker_token": "agent-03-a"})
        self.assertEqual(st_c1, 200)
        st_c2, _, _ = self._req(f"/api/tasks/{tid}/checkout", method="POST", body={"dept_id": "02", "worker_token": "agent-02-b"})
        self.assertEqual(st_c2, 409)

        # 4. Add Live Citation
        st_cite, _, _ = self._req(
            f"/api/tasks/{tid}/cite",
            method="POST",
            body={
                "dept_id": "03",
                "source_title": "Báo cáo thị trường nội thất VN",
                "source_url": "https://vnexpress.net/kinh-doanh",
                "key_finding": "Khách ngại đặt rèm vì không hình dung được màu vải thật.",
            },
        )
        self.assertEqual(st_cite, 201)

        # 5. Submit Deliverable -> WAITING_APPROVAL
        st_sub, _, raw_sub = self._req(
            f"/api/tasks/{tid}/submit",
            method="POST",
            body={
                "dept_id": "03",
                "title": "Bảng mổ xẻ 15 đối thủ",
                "summary": "Đầy đủ điểm yếu 1-2 sao",
                "evidence_level": 3,
                "require_chairman_gate": True,
            },
        )
        self.assertEqual(st_sub, 200)
        self.assertEqual(json.loads(raw_sub.decode("utf-8"))["task"]["kanban_column"], "WAITING_APPROVAL")

        # 6. Chairman REJECT -> Generates Reflexion & moves back to IN_PROGRESS
        st_rej, _, raw_rej = self._req(
            f"/api/tasks/{tid}/decision",
            method="POST",
            body={
                "decision": "REJECT",
                "note": "Thiếu bảng giá chi tiết của 3 đối thủ lớn nhất",
                "preventive_rule": "Luôn thu thập đủ bảng giá niêm yết của top 3 đối thủ.",
            },
        )
        self.assertEqual(st_rej, 200)
        self.assertEqual(json.loads(raw_rej.decode("utf-8"))["kanban_column"], "IN_PROGRESS")

        # Verify Reflexion is stored in Department #03 Brain Inspector
        st_d3, _, raw_d3 = self._req("/api/departments/03")
        self.assertEqual(st_d3, 200)
        d3 = json.loads(raw_d3.decode("utf-8"))
        self.assertGreaterEqual(len(d3["reflexions"]), 1)
        self.assertIn("top 3 đối thủ", d3["reflexions"][0]["preventive_rule"])

        # 7. Resubmit & Chairman APPROVE -> DONE
        self._req(f"/api/tasks/{tid}/submit", method="POST", body={"dept_id": "03", "title": "Bản bổ sung đủ giá", "require_chairman_gate": True})
        st_app, _, raw_app = self._req(f"/api/tasks/{tid}/decision", method="POST", body={"decision": "APPROVE", "note": " Xuất sắc!"})
        self.assertEqual(st_app, 200)
        self.assertEqual(json.loads(raw_app.decode("utf-8"))["kanban_column"], "DONE")

    def test_03_cfo_math_sla10_security_sla09_and_hire_dept_46(self) -> None:
        # SLA-10 Exact CFO Math Verification
        st_fin, _, raw_fin = self._req(
            "/api/finance/simulate",
            method="POST",
            body={
                "price_per_month": 400000,
                "max_quota_units": 100,
                "api_cost_per_unit": 1000,
                "avg_usage_ratio": 0.5,
                "payment_fee_pct": 2.0,
                "tax_reserve_pct": 7.0,
                "fixed_monthly_cost": 1500000,
            },
        )
        self.assertEqual(st_fin, 200)
        fin = json.loads(raw_fin.decode("utf-8"))
        # Worst COGS = 100*1000 + 8000 = 108,000 => Worst Gross Margin = (400,000 - 108,000)/400,000 = 73.0%
        self.assertEqual(fin["worst_gross_margin_pct"], 73.0)
        self.assertTrue(fin["gate1_passed"])

        # SLA-09 Negative Finance Guard -> 400
        st_neg, _, _ = self._req("/api/finance/simulate", method="POST", body={"price_per_month": -5000, "max_quota_units": 10, "api_cost_per_unit": 100})
        self.assertEqual(st_neg, 400)

        # SLA-09 Path Traversal Attack Guard -> 403
        self._req("/api/projects", method="POST", body={"slug": "test-saas-api-suite", "title": "SecProj"})
        st_trav, _, _ = self._req("/api/projects/proj-test-saas-api-suite/files?file=../../AGENTS.md")
        self.assertEqual(st_trav, 403)

        # Hire Department #46 in isolated skills_root
        def sandboxed_add_dept(**kwargs):
            kwargs["skills_root"] = self.sandbox_skills
            return real_add_department(**kwargs)

        with unittest.mock.patch.object(command_center_server, "add_department", side_effect=sandboxed_add_dept):
            st_h, _, raw_h = self._req(
                "/api/departments",
                method="POST",
                body={
                    "division": "div5-media-youtube-studio",
                    "code": "podcast-voice-director",
                    "title": "Đạo Diễn Podcast & Giọng Đọc AI",
                    "mission": "Sản xuất chuỗi podcast chuyển đổi cao.",
                },
            )
            self.assertEqual(st_h, 201)
            hired = json.loads(raw_h.decode("utf-8"))
            self.assertTrue(hired["created"])

    def test_04_v6_direct_antigravity_dispatch_full_crud_and_undo(self) -> None:
        # 1. Request Real Opportunity Scan -> Queues SCAN_OPPORTUNITIES order for Antigravity Swarm (202, zero fake rows)
        st_scan, _, raw_scan = self._req("/api/opportunities/scan", method="POST", body={})
        self.assertEqual(st_scan, 202)
        scan_res = json.loads(raw_scan.decode("utf-8"))
        self.assertTrue(scan_res["queued"])
        self.assertEqual(scan_res["order"]["order_type"], "SCAN_OPPORTUNITIES")
        opps = scan_res["opportunities"]
        self.assertGreaterEqual(len(opps), 2)
        oid = opps[0]["opp_id"]

        # 2. Accept Opportunity -> Creates Mission in QUEUED_FOR_ANTIGRAVITY + Enqueues real NEW_MISSION order (no fake steps!)
        st_acc, _, raw_acc = self._req(f"/api/opportunities/{oid}/accept", method="POST", body={})
        self.assertEqual(st_acc, 201)
        msn = json.loads(raw_acc.decode("utf-8"))
        mid = msn["mission_id"]
        self.assertEqual(msn["dispatch_state"], "QUEUED_FOR_ANTIGRAVITY")
        self.assertEqual(msn["done_steps_count"], 0)
        self.assertTrue(msn.get("order_id", "").startswith("ord-"))

        # Approve Mission -> 100% COMPLETED
        st_mdec, _, raw_mdec = self._req(f"/api/missions/{mid}/decision", method="POST", body={"decision": "APPROVE"})
        self.assertEqual(st_mdec, 200)
        self.assertEqual(json.loads(raw_mdec.decode("utf-8"))["status"], "COMPLETED")

        # Delete Mission & Restore via 5-Second Undo!
        st_mdel, _, _ = self._req(f"/api/missions/{mid}", method="DELETE")
        self.assertEqual(st_mdel, 200)
        st_404, _, _ = self._req(f"/api/missions/{mid}")
        self.assertEqual(st_404, 404)

        st_rest, _, _ = self._req("/api/trash/restore", method="POST", body={"entity_type": "mission", "entity_id": mid})
        self.assertEqual(st_rest, 200)
        st_back, _, raw_back = self._req(f"/api/missions/{mid}")
        self.assertEqual(st_back, 200)
        self.assertEqual(len(json.loads(raw_back.decode("utf-8"))["steps"]), 7)

        # 3. Task Full CRUD + Dispatch to Antigravity + Undo + Bulk Restore
        _, _, raw_t = self._req("/api/tasks", method="POST", body={"title": "Việc gốc cần sửa xóa", "assigned_dept_id": "48"})
        tid = json.loads(raw_t.decode("utf-8"))["task_id"]

        st_disp, _, raw_disp = self._req(f"/api/tasks/{tid}/dispatch", method="POST", body={})
        self.assertEqual(st_disp, 202)
        self.assertEqual(json.loads(raw_disp.decode("utf-8"))["order"]["order_type"], "EXECUTE_TASK")

        st_patch, _, raw_patch = self._req(f"/api/tasks/{tid}", method="PATCH", body={"title": "Việc đã sửa gọn", "kanban_column": "IN_PROGRESS"})
        self.assertEqual(st_patch, 200)
        self.assertEqual(json.loads(raw_patch.decode("utf-8"))["title"], "Việc đã sửa gọn")

        st_dup, _, raw_dup = self._req(f"/api/tasks/{tid}/duplicate", method="POST", body={})
        self.assertEqual(st_dup, 201)
        dup_id = json.loads(raw_dup.decode("utf-8"))["task_id"]

        # Delete Task & Undo Restore
        self._req(f"/api/tasks/{tid}", method="DELETE")
        self.assertEqual(self._req(f"/api/tasks?task_id={tid}")[0], 404)
        self._req("/api/trash/restore", method="POST", body={"entity_type": "task", "entity_id": tid})
        self.assertEqual(self._req(f"/api/tasks?task_id={tid}")[0], 200)

        # Bulk Delete both tasks + Batch Restore via items[]
        st_bulk, _, raw_bulk = self._req("/api/tasks/bulk", method="POST", body={"action": "delete", "task_ids": [tid, dup_id]})
        self.assertEqual(st_bulk, 200)
        bulk_res = json.loads(raw_bulk.decode("utf-8"))
        self.assertEqual(bulk_res["affected"], 2)
        self.assertEqual(len(bulk_res["deleted_ids"]), 2)

        st_brest, _, raw_brest = self._req(
            "/api/trash/restore",
            method="POST",
            body={"items": [{"entity_type": "task", "entity_id": x} for x in bulk_res["deleted_ids"]]},
        )
        self.assertEqual(st_brest, 200)
        self.assertEqual(json.loads(raw_brest.decode("utf-8"))["count"], 2)

    def test_05_v51_custom_kanban_col_project_status_doc_undo_and_dept_title(self) -> None:
        # 1. Create Project with custom PLANNING status
        st_p, _, raw_p = self._req(
            "/api/projects",
            method="POST",
            body={
                "slug": "test-saas-api-suite",
                "title": "Dự Án Thử Nghiệm V5.1",
                "status": "PLANNING",
                "expected_price_vnd": 299000,
            },
        )
        self.assertEqual(st_p, 201)
        proj = json.loads(raw_p.decode("utf-8"))
        self.assertEqual(proj["status"], "PLANNING")
        self.assertEqual(proj["expected_price_vnd"], 299000)

        # 2. Create Task directly into IN_PROGRESS column
        st_t, _, raw_t = self._req(
            "/api/tasks",
            method="POST",
            body={
                "title": "Việc tạo thẳng ở cột Đang làm",
                "assigned_dept_id": "16",
                "kanban_column": "IN_PROGRESS",
            },
        )
        self.assertEqual(st_t, 201)
        self.assertEqual(json.loads(raw_t.decode("utf-8"))["kanban_column"], "IN_PROGRESS")

        # 3. Create Markdown file -> Delete with Tombstone -> Undo Restore!
        st_f, _, _ = self._req(
            "/api/projects/proj-test-saas-api-suite/files",
            method="POST",
            body={"file": "ke-hoach-v51.md", "content": "# Kế hoạch V5.1\nNội dung chuẩn."},
        )
        self.assertEqual(st_f, 200)

        st_df, _, raw_df = self._req(
            "/api/projects/proj-test-saas-api-suite/files?file=ke-hoach-v51.md",
            method="DELETE",
        )
        self.assertEqual(st_df, 200)
        tomb_id = json.loads(raw_df.decode("utf-8"))["entity_id"]
        self.assertEqual(tomb_id, "proj-test-saas-api-suite:ke-hoach-v51.md")

        st_rf, _, _ = self._req(
            "/api/trash/restore",
            method="POST",
            body={"entity_type": "doc", "entity_id": tomb_id},
        )
        self.assertEqual(st_rf, 200)
        st_gf, _, raw_gf = self._req("/api/projects/proj-test-saas-api-suite/files?file=ke-hoach-v51.md")
        self.assertEqual(st_gf, 200)
        self.assertIn("Nội dung chuẩn.", json.loads(raw_gf.decode("utf-8"))["content"])

        # 4. Department title_vi edit in isolated temp handbook
        tmp_hb = self.tmp_path / "dept_03_temp.md"
        tmp_hb.write_text("# Phòng #03: Tên Cũ\n\nNội dung sổ tay.\n", encoding="utf-8")
        with self.db.immediate_tx() as conn:
            conn.execute("UPDATE departments SET handbook_path = ? WHERE dept_id = '03'", (str(tmp_hb),))
        st_dept, _, raw_dept = self._req(
            "/api/departments/03",
            method="PATCH",
            body={"title_vi": "Tình Báo Đối Thủ Cấp Cao"},
        )
        self.assertEqual(st_dept, 200)
        self.assertEqual(json.loads(raw_dept.decode("utf-8"))["title_vi"], "Tình Báo Đối Thủ Cấp Cao")
        self.assertIn("Tình Báo Đối Thủ Cấp Cao", tmp_hb.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
