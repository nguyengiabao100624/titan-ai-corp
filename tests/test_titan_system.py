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
SCRIPTS_DIR = ROOT_DIR / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import command_center_server
from cloud_sync import export_snapshot, merge_snapshot_into_db
from command_center_server import CommandCenterHandler, ThreadingCommandServer
from learning_engine import (
    DEFAULT_REGISTRY_PATH,
    ContinualLearningEngine,
    parse_github_repos_json,
    parse_hackernews_json,
)
from titan_db import TitanDatabase, smart_route_department


SAMPLE_FEED_XML = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Kinh Te Viet Nam</title>
    <item>
      <title>Cap nhat quy dinh hoa don dien tu cho ho kinh doanh 2026</title>
      <link>https://example.vn/tin-thue-hkd-v8</link>
      <description>Doanh nghiep nho ap dung so thu chi dien tu giam 60% thoi gian doi soat.</description>
      <pubDate>Thu, 19 Nov 2026 09:00:00 +0700</pubDate>
    </item>
  </channel>
</rss>
"""


class TestTitanSystemV8(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.tmp_path = Path(self.tmp_dir.name)
        self.db_path = self.tmp_path / "titan_v8_test.db"
        self.snap_path = self.tmp_path / "snapshot.json"
        self.db = TitanDatabase(db_path=self.db_path)

        self.snap_patch = unittest.mock.patch.object(
            command_center_server, "DEFAULT_SNAPSHOT_PATH", self.snap_path
        )
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
        for slug in ("test-v8-finance",):
            proj_dir = ROOT_DIR / "corporate_hq" / "projects" / slug
            if proj_dir.exists():
                shutil.rmtree(proj_dir, ignore_errors=True)
        self.tmp_dir.cleanup()

    def _req(
        self,
        path: str,
        method: str = "GET",
        body: dict | None = None,
    ) -> tuple[int, dict[str, str], bytes]:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        headers = {"Content-Type": "application/json"} if data is not None else {}
        req = urllib.request.Request(f"{self.base_url}{path}", data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                return resp.status, dict(resp.headers.items()), resp.read()
        except urllib.error.HTTPError as e:
            return e.code, dict(e.headers.items()), e.read()

    def test_01_project_ledger_crud_undo_and_finance_summary(self) -> None:
        st_p, _, raw_p = self._req(
            "/api/projects",
            method="POST",
            body={
                "slug": "test-v8-finance",
                "title": "Dự án Kiểm định Tài chính v8",
                "objective": "Kiểm tra sổ thu chi, dự toán tách bạch và hoàn tác",
                "expected_price_vnd": 300000,
                "unit_cost_vnd": 60000,
                "fixed_cost_monthly_vnd": 1500000,
                "seed_gate1_tasks": False,
            },
        )
        self.assertEqual(st_p, 201)
        pid = json.loads(raw_p.decode("utf-8"))["project_id"]

        # Reject negative amount
        st_bad, _, _ = self._req(
            f"/api/projects/{pid}/finance/ledger",
            method="POST",
            body={
                "entry_type": "EXPENSE",
                "category": "Hạ tầng",
                "title": "Khoản sai âm",
                "amount_vnd": -1000,
            },
        )
        self.assertEqual(st_bad, 400)

        # Create actual REVENUE, EXPENSE, TAX_RESERVE + separate PLAN REVENUE (is_estimate=True)
        st_r, _, raw_r = self._req(
            f"/api/projects/{pid}/finance/ledger",
            method="POST",
            body={
                "entry_type": "REVENUE",
                "category": "Thuê bao tháng",
                "title": "Thu gói tháng 11 từ 20 khách đầu",
                "amount_vnd": 6000000,
                "entry_date": "2026-11-10",
                "is_estimate": False,
            },
        )
        self.assertEqual(st_r, 201)
        rev_id = json.loads(raw_r.decode("utf-8"))["entry_id"]

        st_e, _, raw_e = self._req(
            f"/api/projects/{pid}/finance/ledger",
            method="POST",
            body={
                "entry_type": "EXPENSE",
                "category": "Hạ tầng",
                "title": "Chi phí máy chủ tháng 11",
                "amount_vnd": 1000000,
                "entry_date": "2026-11-12",
                "is_estimate": False,
            },
        )
        self.assertEqual(st_e, 201)
        exp_id = json.loads(raw_e.decode("utf-8"))["entry_id"]

        st_t, _, _ = self._req(
            f"/api/projects/{pid}/finance/ledger",
            method="POST",
            body={
                "entry_type": "TAX_RESERVE",
                "category": "Dự phòng thuế",
                "title": "Trích quỹ thuế 7%",
                "amount_vnd": 420000,
                "entry_date": "2026-11-15",
                "is_estimate": False,
            },
        )
        self.assertEqual(st_t, 201)

        st_plan, _, _ = self._req(
            f"/api/projects/{pid}/finance/ledger",
            method="POST",
            body={
                "entry_type": "REVENUE",
                "category": "Mục tiêu",
                "title": "Kế hoạch doanh thu tháng 12",
                "amount_vnd": 15000000,
                "entry_date": "2026-12-01",
                "is_estimate": True,
            },
        )
        self.assertEqual(st_plan, 201)

        # Update expense via PATCH
        st_patch, _, raw_patch = self._req(
            f"/api/finance/ledger/{exp_id}",
            method="PATCH",
            body={"amount_vnd": 1200000, "note": "Đã bổ sung phí tên miền"},
        )
        self.assertEqual(st_patch, 200)
        self.assertEqual(json.loads(raw_patch.decode("utf-8"))["amount_vnd"], 1200000.0)

        # Verify /api/projects/<pid>/finance & /api/finance/summary
        st_pf, _, raw_pf = self._req(f"/api/projects/{pid}/finance")
        self.assertEqual(st_pf, 200)
        pf = json.loads(raw_pf.decode("utf-8"))
        summary = pf["summary"]
        self.assertEqual(summary["actual_revenue_vnd"], 6000000.0)
        self.assertEqual(summary["actual_expense_vnd"], 1200000.0)
        self.assertEqual(summary["actual_tax_vnd"], 420000.0)
        self.assertEqual(summary["actual_net_profit_vnd"], 4380000.0)
        self.assertEqual(summary["plan_revenue_vnd"], 15000000.0)
        self.assertEqual(summary["gross_margin_pct"], 80.0)
        self.assertEqual(summary["target_100_mrr_vnd"], 30000000.0)
        self.assertGreaterEqual(len(summary["monthly_series"]), 2)
        self.assertGreaterEqual(len(summary["by_category"]), 3)
        self.assertEqual(len(pf["ledger"]), 4)

        st_corp, _, raw_corp = self._req("/api/finance/summary")
        self.assertEqual(st_corp, 200)
        corp = json.loads(raw_corp.decode("utf-8"))
        self.assertEqual(corp["actual_revenue_vnd"], 6000000.0)
        self.assertEqual(corp["plan_revenue_vnd"], 15000000.0)

        # Delete entry + 5-second Undo restore!
        st_del, _, raw_del = self._req(f"/api/finance/ledger/{rev_id}", method="DELETE")
        self.assertEqual(st_del, 200)
        del_res = json.loads(raw_del.decode("utf-8"))
        self.assertEqual(del_res["entity_type"], "ledger")

        st_after_del, _, raw_after_del = self._req(f"/api/finance/summary?project_id={pid}")
        self.assertEqual(st_after_del, 200)
        self.assertEqual(json.loads(raw_after_del.decode("utf-8"))["actual_revenue_vnd"], 0.0)

        st_undo, _, _ = self._req(
            "/api/trash/restore",
            method="POST",
            body={"entity_type": "ledger", "entity_id": rev_id},
        )
        self.assertEqual(st_undo, 200)
        st_after_undo, _, raw_after_undo = self._req(f"/api/finance/summary?project_id={pid}")
        self.assertEqual(st_after_undo, 200)
        self.assertEqual(json.loads(raw_after_undo.decode("utf-8"))["actual_revenue_vnd"], 6000000.0)

    def test_02_installed_skills_upsert_query_dept_detail_and_sync(self) -> None:
        self.db.upsert_installed_skill(
            skill_id="sk-xias-design",
            skill_slug="xias-design-doctrine",
            title_vi="Học thuyết Thiết kế Hệ thống Giao diện",
            repo_name="plugin87/ux-ui-agent-skills",
            source_url="https://github.com/plugin87/ux-ui-agent-skills",
            division_code="div2-product-design",
            dept_ids=["07", "08", "09"],
            category_vi="Thiết kế giao diện",
            summary_vi="Chuẩn token 3 tầng, không emoji và độ tương phản đạt chuẩn truy cập.",
            local_path="corporate_hq/skills_library/xias-design-doctrine/SKILL.md",
        )
        self.db.upsert_installed_skill(
            skill_id="sk-pricing-pro",
            skill_slug="mkt-pricing-strategy",
            title_vi="Chiến lược Định giá Gói thuê bao",
            repo_name="coreyhaines31/marketingskills",
            source_url="https://github.com/coreyhaines31/marketingskills",
            division_code="div7-finance-tax-legal",
            dept_ids=["38", "39"],
            category_vi="Định giá và lợi nhuận",
            summary_vi="Thiết kế bậc giá và biên lợi nhuận gộp an toàn.",
            local_path="corporate_hq/skills_library/mkt-pricing-strategy/SKILL.md",
        )

        st_all, _, raw_all = self._req("/api/skills")
        self.assertEqual(st_all, 200)
        self.assertEqual(len(json.loads(raw_all.decode("utf-8"))["skills"]), 2)

        st_d08, _, raw_d08 = self._req("/api/skills?dept_id=08")
        self.assertEqual(st_d08, 200)
        sk08 = json.loads(raw_d08.decode("utf-8"))["skills"]
        self.assertEqual(len(sk08), 1)
        self.assertEqual(sk08[0]["skill_id"], "sk-xias-design")

        st_q, _, raw_q = self._req("/api/skills?q=thu%C3%AA+bao")
        self.assertEqual(st_q, 200)
        self.assertEqual(len(json.loads(raw_q.decode("utf-8"))["skills"]), 1)

        # Department detail includes installed_skills
        st_det, _, raw_det = self._req("/api/departments/08")
        self.assertEqual(st_det, 200)
        det = json.loads(raw_det.decode("utf-8"))
        self.assertEqual(len(det["installed_skills"]), 1)
        self.assertEqual(det["installed_skills"][0]["skill_slug"], "xias-design-doctrine")

        # Cloud snapshot round-trip preserves installed_skills & project_ledger
        snap = export_snapshot(self.db)
        self.assertEqual(snap["schema_version"], "11.0")
        self.assertEqual(len(snap["installed_skills"]), 2)

        other_db = TitanDatabase(db_path=self.tmp_path / "sync_target.db")
        try:
            merge_snapshot_into_db(other_db, snap)
            self.assertEqual(len(other_db.list_installed_skills()), 2)
        finally:
            other_db.close_thread_conn()

    def test_03_feeds_registry_24_clean_titles_progress_callback_and_status_api(self) -> None:
        reg = json.loads(DEFAULT_REGISTRY_PATH.read_text(encoding="utf-8"))
        total_sources = (
            len(reg.get("rss_feeds", []))
            + len(reg.get("arxiv_queries", []))
            + len(reg.get("github_queries", []))
            + len(reg.get("hackernews_queries", []))
        )
        self.assertGreaterEqual(total_sources, 22, f"Expected >= 22 real sources, found {total_sources}")

        # Verify zero ★ / ▲ / 💬 symbols in parsed titles
        gh = parse_github_repos_json(
            json.dumps(
                {
                    "items": [
                        {
                            "full_name": "obra/superpowers",
                            "html_url": "https://github.com/obra/superpowers",
                            "description": "Structured agent workflow skills",
                            "stargazers_count": 3200,
                            "language": "Markdown",
                        }
                    ]
                }
            )
        )
        self.assertIn("[GitHub 3200 sao]", gh[0]["title"])
        for banned in ("★", "▲", "💬"):
            self.assertNotIn(banned, gh[0]["title"])

        hn = parse_hackernews_json(
            json.dumps(
                {"hits": [{"title": "Show HN: Local-first Finance", "objectID": "42", "points": 210, "num_comments": 55}]}
            )
        )
        self.assertIn("[Hacker News 210 điểm, 55 bình luận]", hn[0]["title"])
        for banned in ("★", "▲", "💬"):
            self.assertNotIn(banned, hn[0]["title"])

        # Test progress_callback + dept:39 scope + 0-new-articles clear summary
        mini_reg = self.tmp_path / "mini_reg.json"
        mini_reg.write_text(
            json.dumps(
                {
                    "rss_feeds": [
                        {
                            "id": "src-thue-1",
                            "connector": "vn_news",
                            "name": "Báo Thuế số 1",
                            "url": "https://mock.vn/thue1.rss",
                            "division_code": "div7-finance-tax-legal",
                            "target_depts": ["39", "37"],
                            "importance": 9,
                            "max_items": 3,
                            "tags": "thue",
                        },
                        {
                            "id": "src-thue-2",
                            "connector": "vn_news",
                            "name": "Báo Thuế số 2",
                            "url": "https://mock.vn/thue2.rss",
                            "division_code": "div7-finance-tax-legal",
                            "target_depts": ["39"],
                            "importance": 8,
                            "max_items": 3,
                            "tags": "thue",
                        },
                    ],
                    "arxiv_queries": [],
                    "github_queries": [],
                    "hackernews_queries": [],
                }
            ),
            encoding="utf-8",
        )
        engine = ContinualLearningEngine(
            db=self.db,
            registry_path=mini_reg,
            vault_dir=self.tmp_path / "vault",
        )
        progress_events: list[dict] = []
        with unittest.mock.patch.object(engine, "_http_get_text", return_value=SAMPLE_FEED_XML):
            r1 = engine.run_learning_cycle(
                scope="dept:39",
                triggered_by="UNIT_TEST",
                progress_callback=progress_events.append,
            )
            self.assertGreaterEqual(len(progress_events), 3)
            self.assertTrue(progress_events[0]["running"])
            self.assertFalse(progress_events[-1]["running"])
            self.assertEqual(progress_events[-1]["sources_done"], 2)
            self.assertEqual(r1["sources_queried"], 2)
            self.assertGreaterEqual(r1["new_atoms_added"], 1)

            # Department 39 returns to IDLE with last_studied_at set
            d39 = self.db.get_department_detail("39")
            self.assertEqual(d39["status"], "IDLE")
            self.assertTrue(bool(d39["last_studied_at"]))

            # Second run -> 0 new atoms, clear Vietnamese message!
            r2 = engine.run_learning_cycle(scope="dept:39", triggered_by="UNIT_TEST")
            self.assertEqual(r2["new_atoms_added"], 0)
            self.assertIn("Nạp mới 0 bài", r2["summary_vi"])
            self.assertIn("dữ liệu đã ở bản mới nhất", r2["summary_vi"])

        # Test /api/learning/run (sync) + /api/learning/status + /api/overview v8 fields
        self.server.learning_engine = engine
        with unittest.mock.patch.object(engine, "_http_get_text", return_value=SAMPLE_FEED_XML):
            st_run, _, raw_run = self._req(
                "/api/learning/run",
                method="POST",
                body={"scope": "dept:39", "wait": True},
            )
            self.assertEqual(st_run, 200)
            self.assertIn("summary_vi", json.loads(raw_run.decode("utf-8")))

        st_ls, _, raw_ls = self._req("/api/learning/status")
        self.assertEqual(st_ls, 200)
        ls = json.loads(raw_ls.decode("utf-8"))
        self.assertFalse(ls["learning_in_progress"])
        self.assertIn("learning_progress", ls)
        self.assertGreaterEqual(len(ls["recent_runs"]), 3)

        st_ov, _, raw_ov = self._req("/api/overview")
        self.assertEqual(st_ov, 200)
        ov = json.loads(raw_ov.decode("utf-8"))
        for key in ("learning_runs", "learning_progress", "installed_skills", "project_ledger", "finance_summary", "orders"):
            self.assertIn(key, ov, f"/api/overview missing v8 field '{key}'")

    def test_04_relative_preview_urls_never_use_localhost(self) -> None:
        # Register project pointing at existing shipped app folder without mutating files
        with self.db.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO projects(
                    project_id, slug, title, objective, target_market,
                    status, expected_price_vnd, unit_cost_vnd, fixed_cost_monthly_vnd,
                    workspace_path, version, created_at, updated_at
                ) VALUES (
                    'proj-so-thu-chi-thue-hkd', 'so-thu-chi-thue-hkd', 'Két Thuế Shop',
                    'Ứng dụng quản lý thuế', 'Việt Nam', 'SHIPPED',
                    249000, 56235, 1500000, 'corporate_hq/projects/so-thu-chi-thue-hkd',
                    1, '2026-11-19T00:00:00Z', '2026-11-19T00:00:00Z'
                )
                """
            )
        summary = self.db.get_project_finance_summary("proj-so-thu-chi-thue-hkd")
        urls = [p["url"] for p in summary["preview_urls"]]
        self.assertIn("./projects/so-thu-chi-thue-hkd/app/index.html", urls)
        self.assertIn("./projects/so-thu-chi-thue-hkd/go-to-market/landing/index.html", urls)
        for u in urls:
            self.assertNotIn("127.0.0.1", u)
            self.assertNotIn("localhost", u)

    def test_05_v9_live_reconcile_department_statuses_and_gate_sync(self) -> None:
        # 1. Queue SCAN_OPPORTUNITIES -> depts 50, 46, 38 become RESEARCHING_TASK + auto task IN_PROGRESS
        st_scan, _, raw_scan = self._req("/api/opportunities/scan", method="POST", body={})
        self.assertEqual(st_scan, 202)
        scan_order_id = json.loads(raw_scan.decode("utf-8"))["order"]["order_id"]

        st_depts, _, raw_depts = self._req("/api/departments")
        self.assertEqual(st_depts, 200)
        depts_by_id = {d["dept_id"]: d for d in json.loads(raw_depts.decode("utf-8"))["departments"]}
        for did in ("50", "46", "38"):
            self.assertEqual(depts_by_id[did]["status"], "RESEARCHING_TASK", f"Dept {did} must be RESEARCHING_TASK")
            self.assertEqual(depts_by_id[did]["current_work_type"], "order")
            self.assertTrue(depts_by_id[did]["current_work_title"])
            self.assertEqual(depts_by_id[did]["current_task_id"], f"auto-{scan_order_id}")

        st_tasks, _, raw_tasks = self._req("/api/tasks")
        self.assertEqual(st_tasks, 200)
        tasks_by_id = {t["task_id"]: t for t in json.loads(raw_tasks.decode("utf-8"))["tasks"]}
        scan_auto_tid = f"auto-{scan_order_id}"
        self.assertIn(scan_auto_tid, tasks_by_id)
        self.assertEqual(tasks_by_id[scan_auto_tid]["kanban_column"], "IN_PROGRESS")
        self.assertTrue(tasks_by_id[scan_auto_tid]["auto_synced"])
        self.assertEqual(tasks_by_id[scan_auto_tid]["linked_order_id"], scan_order_id)

        # Complete SCAN_OPPORTUNITIES -> depts 50, 46, 38 return to IDLE + auto task DONE
        self.db.complete_order(scan_order_id, result_summary="Đã tìm thấy 3 cơ hội mới", status="COMPLETED")
        st_depts2, _, raw_depts2 = self._req("/api/departments")
        self.assertEqual(st_depts2, 200)
        depts2 = {d["dept_id"]: d for d in json.loads(raw_depts2.decode("utf-8"))["departments"]}
        for did in ("50", "46", "38"):
            self.assertEqual(depts2[did]["status"], "IDLE")
            self.assertEqual(depts2[did]["current_work_title"], "")
        self.assertEqual(self.db.get_task(scan_auto_tid)["kanban_column"], "DONE")

        # 2. Create Mission -> dept 00 EXECUTING + step 1 auto task in BACKLOG
        st_m, _, raw_m = self._req("/api/missions", method="POST", body={"title": "Phần mềm quản lý tiệm giặt ủi"})
        self.assertEqual(st_m, 201)
        mid = json.loads(raw_m.decode("utf-8"))["mission_id"]

        d00 = self.db.get_department_detail("00")
        self.assertEqual(d00["status"], "EXECUTING")
        self.assertEqual(d00["current_mission_id"], mid)
        self.assertEqual(self.db.get_task(f"auto-{mid}-s1")["kanban_column"], "BACKLOG")
        self.assertEqual(self.db.get_task(f"auto-{mid}-s1")["linked_mission_id"], mid)

        # 3. Start Step 1 -> lead_dept_ids (01, 02, 03, 50) become EXECUTING + auto task IN_PROGRESS
        self.db.update_mission_step(f"{mid}-s1", status="RUNNING", progress_pct=45, live_activity_text="Đang khảo sát tiệm giặt")
        depts3 = {d["dept_id"]: d for d in self.db.list_departments()}
        for did in ("01", "02", "03", "50"):
            self.assertEqual(depts3[did]["status"], "EXECUTING")
            self.assertEqual(depts3[did]["current_mission_id"], mid)
            self.assertIn("Bước 1", depts3[did]["current_work_title"])
        self.assertEqual(self.db.get_task(f"auto-{mid}-s1")["kanban_column"], "IN_PROGRESS")

        # 4. Present Gate 1 (Step 4 WAITING_APPROVAL) -> dept 00 WAITING_CHAIRMAN -> approve from Tab 3 syncs mission!
        self.db.update_mission_step(f"{mid}-s1", status="DONE", progress_pct=100)
        self.db.update_mission_step(f"{mid}-s4", status="WAITING_APPROVAL", progress_pct=90)
        self.db.update_mission(mid, status="WAITING_CHAIRMAN", phase="PROPOSAL")
        d00_wait = self.db.get_department_detail("00")
        self.assertEqual(d00_wait["status"], "WAITING_CHAIRMAN")
        self.assertEqual(self.db.get_task(f"auto-{mid}-s4")["kanban_column"], "WAITING_APPROVAL")

        st_dec, _, raw_dec = self._req(
            f"/api/tasks/auto-{mid}-s4/decision",
            method="POST",
            body={"decision": "APPROVE", "note": "Chốt triển khai giai đoạn 2"},
        )
        self.assertEqual(st_dec, 200)
        dec_payload = json.loads(raw_dec.decode("utf-8"))
        self.assertEqual(dec_payload["synced_mission"]["phase"], "PRODUCTION")
        self.assertEqual(self.db.get_mission(mid)["phase"], "PRODUCTION")
        self.assertEqual(self.db.get_task(f"auto-{mid}-s4")["kanban_column"], "DONE")
        self.assertEqual(self.db.get_task(f"auto-{mid}-s5")["kanban_column"], "BACKLOG")

        # Clean up auto-created project folder
        auto_pid = dec_payload["synced_mission"].get("project_id")
        if auto_pid:
            auto_p = self.db.get_project(auto_pid)
            if auto_p and auto_p.get("workspace_path"):
                shutil.rmtree(ROOT_DIR / auto_p["workspace_path"], ignore_errors=True)

    def test_06_v9_auto_tasks_respect_tombstone_and_overview_fields(self) -> None:
        st_m, _, raw_m = self._req("/api/missions", method="POST", body={"title": "Kiểm chứng tombstone auto task"})
        self.assertEqual(st_m, 201)
        mid = json.loads(raw_m.decode("utf-8"))["mission_id"]
        auto_tid = f"auto-{mid}-s1"
        self.assertIsNotNone(self.db.get_task(auto_tid))

        # Delete auto task -> must NOT be recreated on subsequent reconcile/overview/tasks reads!
        st_del, _, _ = self._req(f"/api/tasks/{auto_tid}", method="DELETE")
        self.assertEqual(st_del, 200)

        st_ov, _, raw_ov = self._req("/api/overview")
        self.assertEqual(st_ov, 200)
        ov = json.loads(raw_ov.decode("utf-8"))
        self.assertIn("departments", ov)
        self.assertIn("tasks", ov)
        ov_task_ids = {t["task_id"] for t in ov["tasks"]}
        self.assertNotIn(auto_tid, ov_task_ids, "Deleted auto-* task must respect deleted_tombstones!")
        sample_dept = ov["departments"][0]
        for field in ("current_work_title", "current_work_type", "current_mission_id", "current_task_id"):
            self.assertIn(field, sample_dept)

        # Undo restore brings it back cleanly
        st_rest, _, _ = self._req("/api/trash/restore", method="POST", body={"entity_type": "task", "entity_id": auto_tid})
        self.assertEqual(st_rest, 200)
        self.assertIsNotNone(self.db.get_task(auto_tid))

    def test_07_v9_smart_route_department_and_one_tap_dispatch_now(self) -> None:
        self.assertEqual(smart_route_department("Tính thuế và hóa đơn điện tử quý 4"), "39")
        self.assertEqual(smart_route_department("Tối ưu bảng giá bán và điểm hòa vốn"), "38")
        self.assertEqual(smart_route_department("Cải thiện giao diện UI/UX trang chủ"), "08")
        self.assertEqual(smart_route_department("Sửa lỗi web app trên điện thoại"), "13")
        self.assertEqual(smart_route_department("Tích hợp API cổng thanh toán VietQR"), "15")
        self.assertEqual(smart_route_department("Kiểm tra bảo mật chống XSS"), "23")
        self.assertEqual(smart_route_department("Chạy kiểm thử tự động bộ sản phẩm"), "20")
        self.assertEqual(smart_route_department("Chạy quảng cáo Zalo và video bán hàng"), "31")
        self.assertEqual(smart_route_department("Tối ưu SEO bài viết blog"), "30")
        self.assertEqual(smart_route_department("Săn cơ hội ngách thị trường ít đối thủ"), "50")
        self.assertEqual(smart_route_department("Phản biện rủi ro mô hình kinh doanh"), "46")
        self.assertEqual(smart_route_department("Soạn hợp đồng pháp lý và điều khoản"), "40")
        self.assertEqual(smart_route_department("Họp giao ban tổng kết tuần"), "00")

        # 1-Tap POST /api/tasks with assigned_dept_id="AUTO" + dispatch_now=True
        st_t, _, raw_t = self._req(
            "/api/tasks",
            method="POST",
            body={
                "title": "Rà soát quy định thuế hộ kinh doanh mới nhất",
                "assigned_dept_id": "AUTO",
                "dispatch_now": True,
            },
        )
        self.assertEqual(st_t, 201)
        t_res = json.loads(raw_t.decode("utf-8"))
        self.assertEqual(t_res["assigned_dept_id"], "39")
        self.assertTrue(t_res["auto_routed"])
        self.assertTrue(t_res["dispatched"])
        self.assertEqual(t_res["kanban_column"], "IN_PROGRESS")
        self.assertEqual(t_res["order"]["order_type"], "EXECUTE_TASK")
        self.assertTrue(t_res["assigned_dept_title_vi"])

        # Dept 39 is immediately EXECUTING this exact task!
        st_d39, _, raw_d39 = self._req("/api/departments/39")
        self.assertEqual(st_d39, 200)
        d39 = json.loads(raw_d39.decode("utf-8"))
        self.assertEqual(d39["status"], "EXECUTING")
        self.assertEqual(d39["current_task_id"], t_res["task_id"])

        # Dispatching an existing BACKLOG task transitions it to IN_PROGRESS + dept EXECUTING
        st_b, _, raw_b = self._req(
            "/api/tasks",
            method="POST",
            body={"title": "Thiết kế lại nút thanh toán", "assigned_dept_id": "08", "kanban_column": "BACKLOG"},
        )
        self.assertEqual(st_b, 201)
        btid = json.loads(raw_b.decode("utf-8"))["task_id"]
        self.assertEqual(self.db.get_department_detail("08")["status"], "IDLE")

        st_disp, _, raw_disp = self._req(f"/api/tasks/{btid}/dispatch", method="POST", body={})
        self.assertEqual(st_disp, 202)
        disp_res = json.loads(raw_disp.decode("utf-8"))
        self.assertTrue(disp_res["dispatched"])
        self.assertEqual(disp_res["task"]["kanban_column"], "IN_PROGRESS")
        self.assertEqual(self.db.get_department_detail("08")["status"], "EXECUTING")

    def test_08_v10_54_departments_embedded_quality_cells_and_9_div_template(self) -> None:
        depts = self.db.list_departments()
        self.assertEqual(len(depts), 54, f"Expected 54 core departments (00..53), got {len(depts)}")
        by_id = {d["dept_id"]: d for d in depts}
        for did in ("51", "52", "53"):
            self.assertIn(did, by_id)
            self.assertEqual(by_id[did]["division_code"], "div9-critique-ux-lab")
        self.assertEqual(by_id["51"]["title_vi"], "Kiểm định Chất lượng Tổng thể QA và QC")
        self.assertEqual(by_id["52"]["title_vi"], "Kiểm tra Hoàn thiện Chức năng và Rà soát Lỗi")
        self.assertEqual(by_id["53"]["title_vi"], "Tổng hợp Lỗi, Thu thập Phản hồi và Điều phối Trả việc")
        div9_ids = sorted(d["dept_id"] for d in depts if d["division_code"] == "div9-critique-ux-lab")
        self.assertEqual(div9_ids, ["46", "47", "48", "49", "50", "51", "52", "53"])
        self.assertEqual(smart_route_department("Tổng hợp lỗi và điều phối trả việc cho phòng 13"), "53")

        # Every division & department carries 2 embedded quality cells (USER_TESTER & CRITIC)
        divs = self.db.list_divisions()
        self.assertEqual(len(divs), 10)
        for dv in divs:
            codes = {c["code"] for c in dv["embedded_quality_cells"]}
            self.assertEqual(codes, {"USER_TESTER", "CRITIC"})
            self.assertTrue(dv["coordination_rule_vi"])
        for dp in depts:
            codes = {c["code"] for c in dp["embedded_quality_cells"]}
            self.assertEqual(codes, {"USER_TESTER", "CRITIC"})

        # Step 7 & Step 8 include Div 9 quartet (#53, #51, #52, #49)
        steps_by_order = {o: leads for o, _t, leads, _c, _u in TitanDatabase.DEFAULT_8_STEPS_TEMPLATE}
        for did in ("53", "51", "52", "49", "48", "47", "20", "23"):
            self.assertIn(did, steps_by_order[7].split(","))
        for did in ("00", "19", "35", "44", "53", "51", "52"):
            self.assertIn(did, steps_by_order[8].split(","))

        # Core protection for #51, #52 & #53
        for protected_id in ("51", "52", "53"):
            with self.assertRaises(ValueError):
                self.db.delete_department_custom(protected_id)

    def test_09_v10_rework_bounce_back_reopens_done_step_and_zero_defect_gate(self) -> None:
        st_m, _, raw_m = self._req("/api/missions", method="POST", body={"title": "Ứng dụng kiểm định 0 lỗi v10"})
        self.assertEqual(st_m, 201)
        mid = json.loads(raw_m.decode("utf-8"))["mission_id"]

        # Mark Step 5 DONE first to prove bounce-back reopens ALREADY-DONE steps!
        self.db.update_mission_step(f"{mid}-s5", status="DONE", progress_pct=100)
        self.assertEqual(self.db.get_mission(mid)["steps"][4]["status"], "DONE")

        # Bounce defect from #52 -> #13 via HTTP API
        st_bb, _, raw_bb = self._req(
            "/api/rework/bounce",
            method="POST",
            body={
                "mission_id": mid,
                "step_order": 5,
                "source_dept_id": "52",
                "source_role_type": "DIV9_FEATURE_AUDIT",
                "target_dept_id": "13",
                "defect_category": "MISSING_FEATURE",
                "severity": "CRITICAL",
                "title": "Thiếu nút xuất CSV sạch ở màn hình báo cáo",
                "detail_vi": "Đề bài yêu cầu xuất CSV chống công thức nhưng màn hình chưa gắn nút.",
            },
        )
        self.assertEqual(st_bb, 201)
        ticket = json.loads(raw_bb.decode("utf-8"))
        tid = ticket["ticket_id"]
        self.assertEqual(ticket["status"], "OPEN")
        self.assertEqual(ticket["target_dept_id"], "13")
        self.assertEqual(ticket["source_dept_id"], "52")

        # Step 5 must be reopened to RUNNING, auto-rw-* task created in IN_PROGRESS, dept #13 EXECUTING!
        msn_reopened = self.db.get_mission(mid)
        self.assertEqual(msn_reopened["steps"][4]["status"], "RUNNING")
        self.assertEqual(msn_reopened["status"], "RUNNING")

        rw_task = self.db.get_task(f"auto-rw-{tid}")
        self.assertIsNotNone(rw_task)
        self.assertEqual(rw_task["kanban_column"], "IN_PROGRESS")
        self.assertEqual(rw_task["assigned_dept_id"], "13")
        self.assertEqual(rw_task["linked_mission_id"], mid)

        d13 = self.db.get_department_detail("13")
        self.assertEqual(d13["status"], "EXECUTING")
        self.assertEqual(len(d13["rework_tickets"]), 1)

        # Gate 2 MUST BE BLOCKED while ticket is unresolved!
        with self.assertRaises(ValueError) as ctx:
            self.db.request_mission_approval(mid, summary="Cố tình chốt khi còn lỗi")
        self.assertIn("#13", str(ctx.exception))

        # Target dept fixes & requests Div 9 recheck -> auto task QA_SECURITY_REVIEW, #52 IN_QA_REVIEW
        st_rc, _, raw_rc = self._req(
            f"/api/rework/{tid}",
            method="PATCH",
            body={"status": "FIXED_PENDING_RECHECK", "fix_note_vi": "Đã bổ sung nút Xuất CSV an toàn"},
        )
        self.assertEqual(st_rc, 200)
        self.assertEqual(json.loads(raw_rc.decode("utf-8"))["status"], "FIXED_PENDING_RECHECK")
        self.assertEqual(self.db.get_task(f"auto-rw-{tid}")["kanban_column"], "QA_SECURITY_REVIEW")
        self.assertEqual(self.db.get_department_detail("52")["status"], "IN_QA_REVIEW")

        # Still blocked before Div 9 closes ticket!
        with self.assertRaises(ValueError):
            self.db.request_mission_approval(mid, summary="Vẫn chưa kiểm lại xong")

        # Div 9 bounces a second time -> reopen_count == 1
        st_reopen, _, raw_reopen = self._req(
            f"/api/rework/{tid}",
            method="PATCH",
            body={"status": "OPEN", "recheck_note_vi": "Cột ngày bị lệch múi giờ, sửa tiếp"},
        )
        self.assertEqual(st_reopen, 200)
        self.assertEqual(json.loads(raw_reopen.decode("utf-8"))["reopen_count"], 1)

        # Target fixes again -> Div 9 verifies 0 defects (VERIFIED_CLOSED)
        self._req(f"/api/rework/{tid}", method="PATCH", body={"status": "FIXED_PENDING_RECHECK", "fix_note_vi": "Đã sửa múi giờ UTC+7"})
        st_close, _, raw_close = self._req(
            f"/api/rework/{tid}",
            method="PATCH",
            body={"status": "VERIFIED_CLOSED", "recheck_note_vi": "Xác nhận đạt 0 lỗi"},
        )
        self.assertEqual(st_close, 200)
        closed_t = json.loads(raw_close.decode("utf-8"))
        self.assertEqual(closed_t["status"], "VERIFIED_CLOSED")
        self.assertTrue(bool(closed_t["resolved_at"]))
        self.assertEqual(self.db.get_task(f"auto-rw-{tid}")["kanban_column"], "DONE")

        # GET /api/rework + /api/overview show 0 unresolved tickets -> Gate 2 NOW SUCCEEDS!
        st_list, _, raw_list = self._req(f"/api/rework?mission_id={mid}")
        self.assertEqual(st_list, 200)
        rw_payload = json.loads(raw_list.decode("utf-8"))
        self.assertEqual(rw_payload["summary"]["unresolved_count"], 0)
        self.assertTrue(rw_payload["summary"]["by_mission"][mid]["zero_defect_ready"])

        gate_res = self.db.request_mission_approval(mid, summary="Sản phẩm đã đạt chốt 0 lỗi Khối 9")
        self.assertTrue(gate_res["ok"])
        self.assertTrue(gate_res["zero_defect_verified"])
        self.assertEqual(gate_res["status"], "WAITING_CHAIRMAN")

        # Snapshot sync preserves rework_tickets
        snap = export_snapshot(self.db)
        self.assertEqual(len(snap["rework_tickets"]), 1)
        other_db = TitanDatabase(db_path=self.tmp_path / "sync_v10.db")
        try:
            merge_snapshot_into_db(other_db, snap)
            self.assertEqual(len(other_db.list_rework_tickets(mission_id=mid)), 1)
        finally:
            other_db.close_thread_conn()

    def test_10_v10_bridge_cli_bounce_back_and_rework_update(self) -> None:
        import subprocess
        cli = [sys.executable, str(SCRIPTS_DIR / "titan_bridge_cli.py"), "--db", str(self.db_path)]
        # Default source_dept should be #53 (DIV9_DEFECT_TRIAGE)
        bb_proc = subprocess.run(
            cli
            + [
                "bounce-back",
                "--target-dept", "08",
                "--category", "UX_FRICTION",
                "--severity", "HIGH",
                "--title", "Nút thanh toán trên màn hình 390px hơi nhỏ",
                "--detail", "Tăng vùng chạm tối thiểu lên 44px",
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        bb_res = json.loads(bb_proc.stdout)
        self.assertTrue(bb_res["ok"])
        self.assertEqual(bb_res["ticket"]["source_dept_id"], "53")
        self.assertEqual(bb_res["ticket"]["source_role_type"], "DIV9_DEFECT_TRIAGE")
        rw_id = bb_res["ticket"]["ticket_id"]

        upd_proc = subprocess.run(
            cli
            + [
                "rework-update",
                "--ticket-id", rw_id,
                "--status", "VERIFIED_CLOSED",
                "--note", "Đã tăng nút lên 48px, đạt chuẩn di động",
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        upd_res = json.loads(upd_proc.stdout)
        self.assertTrue(upd_res["ok"])
        self.assertEqual(upd_res["ticket"]["status"], "VERIFIED_CLOSED")

    def test_11_v10_plan_9_division_roster_and_org_directory(self) -> None:
        # 1. WEB_APP plan: all 9/9 divisions covered, Div 3 has 12,13,15,19 and SKIPS 14 & 18; Div 9 has all 8 (#46..#53)
        st_web, _, raw_web = self._req(
            "/api/org/plan-roster",
            method="POST",
            body={"goal_prompt": "Xây dựng ứng dụng Web PWA xử lý ảnh CCCD và PDF 100% trên trình duyệt", "product_type": "AUTO"},
        )
        self.assertEqual(st_web, 200)
        web_plan = json.loads(raw_web.decode("utf-8"))
        self.assertEqual(web_plan["product_type"], "WEB_APP")
        self.assertTrue(web_plan["all_9_divisions_covered"])
        self.assertEqual(web_plan["active_divisions_count"], 9)
        web_by_div = {d["division_code"]: d for d in web_plan["divisions"]}
        self.assertEqual(web_by_div["div3-engineering-ai"]["active_dept_ids"], ["12", "13", "15", "19"])
        self.assertIn("14", web_by_div["div3-engineering-ai"]["skipped_dept_ids"])
        self.assertIn("18", web_by_div["div3-engineering-ai"]["skipped_dept_ids"])
        self.assertEqual(
            web_by_div["div9-critique-ux-lab"]["active_dept_ids"],
            ["46", "47", "48", "49", "50", "51", "52", "53"],
        )

        # 2. EMBEDDED_IOT plan: all 9/9 divisions covered, Div 3 activates 12,14,15,18,19!
        st_iot, _, raw_iot = self._req(
            "/api/org/plan-roster",
            method="POST",
            body={"goal_prompt": "Ống nghe thông minh ESP32 phần cứng nhúng IoT kết nối app Android"},
        )
        self.assertEqual(st_iot, 200)
        iot_plan = json.loads(raw_iot.decode("utf-8"))
        self.assertEqual(iot_plan["product_type"], "EMBEDDED_IOT")
        self.assertTrue(iot_plan["all_9_divisions_covered"])
        iot_by_div = {d["division_code"]: d for d in iot_plan["divisions"]}
        self.assertEqual(iot_by_div["div3-engineering-ai"]["active_dept_ids"], ["12", "14", "15", "18", "19"])

        # 3. MEDIA_CHANNEL plan: Div 5 activates all 7 departments (25..31)
        media_plan = self.db.plan_9_division_roster("Xây hệ thống kênh YouTube và video ngắn TikTok tự động")
        self.assertEqual(media_plan["product_type"], "MEDIA_CHANNEL")
        media_by_div = {d["division_code"]: d for d in media_plan["divisions"]}
        self.assertEqual(
            media_by_div["div5-media-youtube-studio"]["active_dept_ids"],
            ["25", "26", "27", "28", "29", "30", "31"],
        )

        # 4. create_mission dynamically tailors Step 5 & Step 6 leads and returns division_roster_plan
        st_m, _, raw_m = self._req(
            "/api/missions",
            method="POST",
            body={"title": "Trạm hồ sơ công dân Web PWA", "goal_prompt": "Công cụ web xử lý PDF CCCD trên trình duyệt"},
        )
        self.assertEqual(st_m, 201)
        msn = json.loads(raw_m.decode("utf-8"))
        self.assertEqual(msn["product_type"], "WEB_APP")
        self.assertTrue(msn["division_roster_plan"]["all_9_divisions_covered"])
        step5_leads = msn["steps"][4]["lead_dept_ids"].split(",")
        self.assertIn("13", step5_leads)
        self.assertIn("15", step5_leads)
        self.assertNotIn("18", step5_leads)
        self.assertNotIn("14", step5_leads)

        # 5. GET /api/org/directory returns full 54 departments + SOP rules + handoff policy + templates
        st_dir, _, raw_dir = self._req("/api/org/directory")
        self.assertEqual(st_dir, 200)
        org_dir = json.loads(raw_dir.decode("utf-8"))
        self.assertEqual(org_dir["total_departments"], 54)
        self.assertEqual(org_dir["total_divisions"], 10)
        self.assertEqual(len(org_dir["departments"]), 54)
        self.assertGreaterEqual(len(org_dir["sop_rules"]), 4)
        self.assertIn("PEER_HANDOFF", org_dir["handoff_policy"])
        self.assertIn("CEO_ESCALATION", org_dir["handoff_policy"])
        self.assertIn("WEB_APP", org_dir["product_roster_templates"])
        self.assertIn("EMBEDDED_IOT", org_dir["product_roster_templates"])

        # 6. Department detail includes peer_directory & recent_handoffs
        st_d13, _, raw_d13 = self._req("/api/departments/13")
        self.assertEqual(st_d13, 200)
        d13 = json.loads(raw_d13.decode("utf-8"))
        self.assertIn("peer_directory", d13)
        self.assertTrue(d13["peer_directory"]["core_strength_vi"])
        self.assertTrue(len(d13["peer_directory"]["downstream_depts"]) > 0)
        self.assertIn("recent_handoffs", d13)

    def test_12_v10_dept_handoffs_peer_ceo_escalation_reroute_and_cli(self) -> None:
        import subprocess
        # 1. PEER_HANDOFF (#13 -> #08): auto-ho-* created in IN_PROGRESS, #08 becomes EXECUTING
        st_ph, _, raw_ph = self._req(
            "/api/handoffs",
            method="POST",
            body={
                "from_dept_id": "13",
                "to_dept_id": "08",
                "mode": "PEER_HANDOFF",
                "reason_vi": "Cần chỉnh bộ token màu nút chính trên màn hình di động",
                "payload_vi": "Đang thiếu biến màu cho trạng thái hover nút xuất PDF",
            },
        )
        self.assertEqual(st_ph, 201)
        ph = json.loads(raw_ph.decode("utf-8"))
        ph_id = ph["handoff_id"]
        self.assertEqual(ph["to_dept_id"], "08")
        self.assertEqual(ph["status"], "OPEN")
        self.assertEqual(self.db.get_task(f"auto-ho-{ph_id}")["kanban_column"], "IN_PROGRESS")
        self.assertEqual(self.db.get_task(f"auto-ho-{ph_id}")["assigned_dept_id"], "08")
        self.assertEqual(self.db.get_department_detail("08")["status"], "EXECUTING")

        # Complete peer handoff -> auto-ho-* moves to DONE, #08 returns to IDLE
        st_ph_done, _, raw_ph_done = self._req(
            f"/api/handoffs/{ph_id}",
            method="PATCH",
            body={"status": "COMPLETED", "ceo_note_vi": "Đã bổ sung token màu đạt chuẩn AA"},
        )
        self.assertEqual(st_ph_done, 200)
        self.assertEqual(json.loads(raw_ph_done.decode("utf-8"))["status"], "COMPLETED")
        self.assertEqual(self.db.get_task(f"auto-ho-{ph_id}")["kanban_column"], "DONE")
        self.assertEqual(self.db.get_department_detail("08")["status"], "IDLE")

        # 2. CEO_ESCALATION from #13 (even if another to_dept_id is sent, backend FORCES to_dept_id = '00'!)
        st_esc, _, raw_esc = self._req(
            "/api/handoffs",
            method="POST",
            body={
                "from_dept_id": "13",
                "to_dept_id": "15",
                "mode": "CEO_ESCALATION",
                "reason_vi": "Phát sinh đổi kiến trúc lưu trữ thanh toán, vượt thẩm quyền tự quyết",
                "payload_vi": "Cần #00 quyết định giữa cổng VietQR tĩnh và webhook tự động",
            },
        )
        self.assertEqual(st_esc, 201)
        esc = json.loads(raw_esc.decode("utf-8"))
        esc_id = esc["handoff_id"]
        self.assertEqual(esc["to_dept_id"], "00", "CEO_ESCALATION must force to_dept_id to #00")
        self.assertEqual(self.db.get_task(f"auto-ho-{esc_id}")["assigned_dept_id"], "00")
        self.assertEqual(self.db.get_department_detail("00")["status"], "EXECUTING")

        # 3. #00 reroutes (REROUTED_BY_CEO) -> #15: auto-ho-* reassigns to #15, #15 EXECUTING, #00 released to IDLE!
        st_rr, _, raw_rr = self._req(
            f"/api/handoffs/{esc_id}",
            method="PATCH",
            body={
                "status": "REROUTED_BY_CEO",
                "resolved_to_dept_id": "15",
                "ceo_note_vi": "Giao Phòng #15 chủ trì cổng VietQR và giữ chi phí 0đ hạ tầng",
            },
        )
        self.assertEqual(st_rr, 200)
        rr = json.loads(raw_rr.decode("utf-8"))
        self.assertEqual(rr["status"], "REROUTED_BY_CEO")
        self.assertEqual(rr["resolved_to_dept_id"], "15")
        self.assertEqual(rr["effective_owner_dept_id"], "15")
        self.assertEqual(self.db.get_task(f"auto-ho-{esc_id}")["assigned_dept_id"], "15")
        self.assertEqual(self.db.get_task(f"auto-ho-{esc_id}")["kanban_column"], "IN_PROGRESS")
        self.assertEqual(self.db.get_department_detail("15")["status"], "EXECUTING")
        self.assertEqual(self.db.get_department_detail("00")["status"], "IDLE")

        # 4. #15 completes rerouted handoff -> DONE & #15 IDLE
        st_fin, _, _ = self._req(f"/api/handoffs/{esc_id}", method="PATCH", body={"status": "COMPLETED"})
        self.assertEqual(st_fin, 200)
        self.assertEqual(self.db.get_task(f"auto-ho-{esc_id}")["kanban_column"], "DONE")
        self.assertEqual(self.db.get_department_detail("15")["status"], "IDLE")

        # 5. GET /api/handoffs & /api/overview & snapshot merge include dept_handoffs + corporate_directory_summary
        st_hl, _, raw_hl = self._req("/api/handoffs?dept_id=15")
        self.assertEqual(st_hl, 200)
        hl = json.loads(raw_hl.decode("utf-8"))
        self.assertEqual(hl["count"], 1)
        self.assertEqual(hl["summary"]["completed_count"], 2)

        st_ov, _, raw_ov = self._req("/api/overview")
        self.assertEqual(st_ov, 200)
        ov = json.loads(raw_ov.decode("utf-8"))
        self.assertIn("dept_handoffs", ov)
        self.assertIn("corporate_directory_summary", ov)
        self.assertEqual(ov["corporate_directory_summary"]["total_departments"], 54)

        snap = export_snapshot(self.db)
        self.assertEqual(len(snap["dept_handoffs"]), 2)
        other_db = TitanDatabase(db_path=self.tmp_path / "sync_handoffs.db")
        try:
            merge_snapshot_into_db(other_db, snap)
            self.assertEqual(len(other_db.list_dept_handoffs()), 2)
        finally:
            other_db.close_thread_conn()

        # 6. Bridge CLI handoff subcommand works end-to-end
        cli = [sys.executable, str(SCRIPTS_DIR / "titan_bridge_cli.py"), "--db", str(self.db_path)]
        cli_proc = subprocess.run(
            cli
            + [
                "handoff",
                "--from-dept", "20",
                "--to-dept", "23",
                "--mode", "PEER_HANDOFF",
                "--reason", "Chuyển kiểm tra cấu hình CSP sang phòng An ninh mạng",
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        cli_res = json.loads(cli_proc.stdout)
        self.assertTrue(cli_res["ok"])
        self.assertEqual(cli_res["handoff"]["from_dept_id"], "20")
        self.assertEqual(cli_res["handoff"]["to_dept_id"], "23")

    def test_13_v11_project_detail_summaries_and_upgrade_mission(self) -> None:
        # Insert real workspace project row in sandbox DB (no disk pollution)
        pid = "proj-so-thu-chi-thue-hkd"
        with self.db.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO projects(
                    project_id, slug, title, objective, target_market,
                    status, expected_price_vnd, unit_cost_vnd, fixed_cost_monthly_vnd,
                    workspace_path, version, created_at, updated_at
                ) VALUES (
                    ?, 'so-thu-chi-thue-hkd', 'Két Thuế Shop',
                    'Quản lý sổ thu chi và dự phòng thuế hộ kinh doanh', 'Việt Nam',
                    'SHIPPED', 249000, 56235, 1500000, 'corporate_hq/projects/so-thu-chi-thue-hkd',
                    1, '2026-11-19T00:00:00Z', '2026-11-19T00:00:00Z'
                )
                """,
                (pid,),
            )
        # Add task, ledger, linked mission & rework ticket
        self.db.create_task("Kiểm tra xuất báo cáo quý", assigned_dept_id="39", project_id=pid, kanban_column="DONE")
        self.db.create_task("Tối ưu biểu đồ dòng tiền", assigned_dept_id="13", project_id=pid, kanban_column="IN_PROGRESS")
        self.db.add_project_ledger_entry(pid, "REVENUE", "Thuê bao", "10 khách đầu tiên", 2490000, is_estimate=False)
        self.db.add_project_ledger_entry(pid, "EXPENSE", "Hạ tầng", "Tên miền", 250000, is_estimate=False)
        linked_m = self.db.create_mission(
            title="Sản xuất Két Thuế Shop v1",
            goal_prompt="Ứng dụng Web SaaS quản lý sổ thu chi hộ kinh doanh",
            project_id=pid,
            enqueue_order=False,
        )
        self.db.update_mission(linked_m["mission_id"], survival_score=91, ux_score=95, expected_margin_pct=82.5)
        rw = self.db.bounce_back_defect(
            target_dept_id="13",
            title="Bổ sung lọc theo quý trong bảng thu chi",
            mission_id=linked_m["mission_id"],
            project_id=pid,
        )

        # GET /api/projects/<pid>/detail returns full v11.0 bundle
        st_det, _, raw_det = self._req(f"/api/projects/{pid}/detail")
        self.assertEqual(st_det, 200)
        det = json.loads(raw_det.decode("utf-8"))
        for key in ("project", "files", "tasks", "missions", "rework_tickets", "finance_summary", "ledger"):
            self.assertIn(key, det)

        proj = det["project"]
        self.assertEqual(proj["preview_urls"]["app_url"], "./projects/so-thu-chi-thue-hkd/app/index.html")
        self.assertEqual(proj["preview_urls"]["landing_url"], "./projects/so-thu-chi-thue-hkd/go-to-market/landing/index.html")
        self.assertGreaterEqual(len(proj["preview_urls"]["links"]), 2)
        for lk in proj["preview_urls"]["links"]:
            self.assertNotIn("localhost", lk["url"])
            self.assertNotIn("127.0.0.1", lk["url"])
        self.assertGreater(proj["files_summary"]["total_files"], 0)
        self.assertGreater(proj["files_summary"]["app_files"], 0)
        self.assertGreaterEqual(proj["tasks_summary"]["total"], 2)
        self.assertGreaterEqual(proj["tasks_summary"]["done"], 1)
        self.assertEqual(proj["rework_summary"]["open_count"], 1)
        self.assertEqual(proj["quality_metrics"]["survival_score"], 91)
        self.assertEqual(proj["quality_metrics"]["ux_score"], 95)
        self.assertTrue(proj["quality_metrics"]["all_9_divisions_covered"])
        self.assertEqual(proj["quality_metrics"]["mission_id"], linked_m["mission_id"])
        self.assertAlmostEqual(proj["finance_brief"]["actual_revenue_vnd"], 2490000.0)
        self.assertAlmostEqual(proj["finance_brief"]["actual_net_profit_vnd"], 2240000.0)
        self.assertGreaterEqual(len(det["rework_tickets"]), 1)
        self.assertEqual(det["rework_tickets"][0]["ticket_id"], rw["ticket_id"])

        # POST /api/projects/<pid>/upgrade launches 9-division upgrade mission & queues bridge order
        st_upg, _, raw_upg = self._req(
            f"/api/projects/{pid}/upgrade",
            method="POST",
            body={
                "upgrade_goal": "Bổ sung quản lý đa chi nhánh và xuất báo cáo thuế tự động cho doanh nghiệp",
                "auto_approve": False,
            },
        )
        self.assertEqual(st_upg, 201)
        upg = json.loads(raw_upg.decode("utf-8"))
        self.assertTrue(upg["ok"])
        self.assertEqual(upg["project_id"], pid)
        self.assertTrue(upg["order_id"])
        upg_m = upg["mission"]
        self.assertEqual(upg_m["project_id"], pid)
        self.assertEqual(upg_m["category"], "PRODUCT_UPGRADE")
        self.assertTrue(upg_m["division_roster_plan"]["all_9_divisions_covered"])
        self.assertEqual(upg_m["division_roster_plan"]["active_divisions_count"], 9)

        # Verify bridge order exists & overview projects include rich fields
        orders = self.db.list_orders(limit=20)
        self.assertTrue(any(o["order_id"] == upg["order_id"] and o["mission_id"] == upg_m["mission_id"] for o in orders))
        st_ov, _, raw_ov = self._req("/api/overview")
        self.assertEqual(st_ov, 200)
        ov = json.loads(raw_ov.decode("utf-8"))
        ov_proj = next(p for p in ov["projects"] if p["project_id"] == pid)
        self.assertIn("preview_urls", ov_proj)
        self.assertIn("files_summary", ov_proj)
        self.assertIn("quality_metrics", ov_proj)

    def test_14_v11_commercial_opportunities_tier_scale_score_cli_and_prune(self) -> None:
        import subprocess
        # 1. Create strategic Flagship Venture via POST /api/opportunities
        st_hi, _, raw_hi = self._req(
            "/api/opportunities",
            method="POST",
            body={
                "title": "Nền tảng Điều hành Xưởng In và Báo giá Tự động Đa Chi nhánh",
                "target_customer": "Chủ xưởng in ấn, quảng cáo và bao bì (15-80 nhân sự)",
                "pain_point": "Báo giá thủ công bằng Excel sai giá vật tư, thất thoát đơn sản xuất và công nợ",
                "proposed_solution": "Workspace đa màn hình tính giá tự động theo khổ giấy, theo dõi xưởng và VietQR công nợ",
                "price_vnd": 790000,
                "est_margin_pct": 88.5,
                "breakeven_users": 3,
                "survival_score": 92,
                "opportunity_tier": "FLAGSHIP_VENTURE",
                "product_scale_score": 93,
                "big_corp_moat_vi": "ERP lớn giá trăm triệu cồng kềnh; giải pháp sâu nghiệp vụ in ấn dùng được sau 5 phút kiểu Linear",
                "zero_cost_stack_vi": "Cloudflare Pages + Workers + D1 miễn phí tới 100 xưởng đầu; nâng cấp 500k/tháng khi doanh thu > 40tr",
            },
        )
        self.assertEqual(st_hi, 201)
        hi = json.loads(raw_hi.decode("utf-8"))
        self.assertEqual(hi["opportunity_tier"], "FLAGSHIP_VENTURE")
        self.assertEqual(hi["opportunity_tier_vi"], "Cơ hội Chiến lược")
        self.assertEqual(hi["product_scale_score"], 93)
        self.assertIn("Linear", hi["big_corp_moat_vi"])
        self.assertIn("Cloudflare", hi["zero_cost_stack_vi"])

        # 2. Create low-tier toy opportunity
        st_lo, _, raw_lo = self._req(
            "/api/opportunities",
            method="POST",
            body={
                "title": "Công cụ đếm số chữ đơn giản 1 trang",
                "target_customer": "Sinh viên",
                "opportunity_tier": "STANDARD",
                "product_scale_score": 45,
            },
        )
        self.assertEqual(st_lo, 201)
        lo_id = json.loads(raw_lo.decode("utf-8"))["opp_id"]

        # 3. Create PLG Platform opportunity via titan_bridge_cli.py add-opportunity
        cli = [sys.executable, str(SCRIPTS_DIR / "titan_bridge_cli.py"), "--db", str(self.db_path)]
        cli_proc = subprocess.run(
            cli
            + [
                "add-opportunity",
                "--title", "Không gian Biểu mẫu và Cổng Hồ sơ Khách hàng Tự động hóa PLG",
                "--customer", "Agency thiết kế, kế toán dịch vụ và tư vấn toàn cầu",
                "--pain", "Thu hồ sơ khách rời rạc qua Zalo/Email tốn 6 giờ/tuần nhắc việc",
                "--solution", "Cổng khách hàng gắn thương hiệu riêng, ký duyệt và thanh toán tự động kiểu Tally",
                "--price", "490000",
                "--margin", "91.0",
                "--breakeven", "2",
                "--survival", "94",
                "--critique", "Điểm quy mô 91/100 vượt chuẩn Hiến pháp Chống Đồ chơi",
                "--ux", "Không gian làm việc 3 cột tốc độ phản hồi dưới 50ms",
                "--tier", "PLG_PLATFORM",
                "--scale-score", "91",
                "--moat", "Nhúng chữ ký số và tự lan truyền qua link cổng khách hàng giống Tally/Calendly",
                "--stack", "0đ Cloudflare Pages + R2 Free tới 10GB; nâng cấp 400k/tháng khi MRR đạt 30tr",
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        cli_res = json.loads(cli_proc.stdout)
        self.assertTrue(cli_res["ok"])
        cli_opp = cli_res["opportunity"]
        self.assertEqual(cli_opp["opportunity_tier"], "PLG_PLATFORM")
        self.assertEqual(cli_opp["product_scale_score"], 91)
        self.assertIn("Tally", cli_opp["big_corp_moat_vi"])
        self.assertIn("Cloudflare", cli_opp["zero_cost_stack_vi"])

        # 4. Strategic filter GET /api/opportunities?tier=STRATEGIC&min_scale_score=85
        st_flt, _, raw_flt = self._req("/api/opportunities?tier=STRATEGIC&min_scale_score=85")
        self.assertEqual(st_flt, 200)
        flt_ids = {o["opp_id"] for o in json.loads(raw_flt.decode("utf-8"))["opportunities"]}
        self.assertIn(hi["opp_id"], flt_ids)
        self.assertIn(cli_opp["opp_id"], flt_ids)
        self.assertNotIn(lo_id, flt_ids)

        # 5. Snapshot round-trip preserves v11.0 opportunity fields
        snap = export_snapshot(self.db)
        self.assertEqual(snap["schema_version"], "11.0")
        other_db = TitanDatabase(db_path=self.tmp_path / "sync_v11_opps.db")
        try:
            merge_snapshot_into_db(other_db, snap)
            synced = {o["opp_id"]: o for o in other_db.list_opportunities()}
            self.assertEqual(synced[hi["opp_id"]]["opportunity_tier"], "FLAGSHIP_VENTURE")
            self.assertEqual(synced[hi["opp_id"]]["product_scale_score"], 93)
            self.assertEqual(synced[cli_opp["opp_id"]]["opportunity_tier"], "PLG_PLATFORM")
        finally:
            other_db.close_thread_conn()

        # 6. DELETE /api/opportunities/prune-low-tier removes low-score STANDARD only
        st_pr, _, raw_pr = self._req("/api/opportunities/prune-low-tier?min_scale_score=85", method="DELETE")
        self.assertEqual(st_pr, 200)
        pr_res = json.loads(raw_pr.decode("utf-8"))
        self.assertIn(lo_id, pr_res["deleted_ids"])
        remaining_ids = {o["opp_id"] for o in self.db.list_opportunities()}
        self.assertIn(hi["opp_id"], remaining_ids)
        self.assertIn(cli_opp["opp_id"], remaining_ids)
        self.assertNotIn(lo_id, remaining_ids)

    def test_15_v11_media_campaigns_api_overview_project_detail_and_sync(self) -> None:
        # Insert project row to bind campaign
        pid = "proj-media-demo"
        with self.db.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO projects(
                    project_id, slug, title, objective, target_market,
                    status, expected_price_vnd, unit_cost_vnd, fixed_cost_monthly_vnd,
                    workspace_path, version, created_at, updated_at
                ) VALUES (
                    ?, 'so-thu-chi-thue-hkd', 'Két Thuế Shop',
                    'Quản lý sổ thu chi hộ kinh doanh', 'Việt Nam',
                    'SHIPPED', 249000, 56235, 1500000, 'corporate_hq/projects/so-thu-chi-thue-hkd',
                    1, '2026-11-19T00:00:00Z', '2026-11-19T00:00:00Z'
                )
                """,
                (pid,),
            )

        # 1. POST /api/media/campaigns -> 201
        st_c, _, raw_c = self._req(
            "/api/media/campaigns",
            method="POST",
            body={
                "project_id": pid,
                "title": "Cảnh báo mất 30% lợi nhuận vì quên trích quỹ thuế",
                "platform": "TIKTOK",
                "angle_vi": "Đánh thẳng nỗi đau chủ shop bán hàng online cuối quý bị hụt tiền nộp thuế",
            },
        )
        self.assertEqual(st_c, 201)
        camp = json.loads(raw_c.decode("utf-8"))
        cid = camp["campaign_id"]
        self.assertEqual(camp["project_id"], pid)
        self.assertEqual(camp["platform"], "TIKTOK")
        self.assertIsInstance(camp["google_flow_scenes"], list)
        self.assertGreaterEqual(len(camp["google_flow_scenes"]), 1)

        # 2. GET /api/media/campaigns?project_id=... & /api/overview & /api/projects/<pid>/detail
        st_l, _, raw_l = self._req(f"/api/media/campaigns?project_id={pid}&platform=TIKTOK")
        self.assertEqual(st_l, 200)
        self.assertEqual(len(json.loads(raw_l.decode("utf-8"))["campaigns"]), 1)

        st_ov, _, raw_ov = self._req("/api/overview")
        self.assertEqual(st_ov, 200)
        ov = json.loads(raw_ov.decode("utf-8"))
        self.assertIn("media_campaigns", ov)
        self.assertTrue(any(c["campaign_id"] == cid for c in ov["media_campaigns"]))
        ov_p = next(p for p in ov["projects"] if p["project_id"] == pid)
        self.assertEqual(ov_p["media_campaigns_count"], 1)

        st_det, _, raw_det = self._req(f"/api/projects/{pid}/detail")
        self.assertEqual(st_det, 200)
        det = json.loads(raw_det.decode("utf-8"))
        self.assertIn("media_campaigns", det)
        self.assertEqual(len(det["media_campaigns"]), 1)

        # 3. PATCH /api/media/campaigns/<id> -> PUBLISHED with publish_url
        st_p, _, raw_p = self._req(
            f"/api/media/campaigns/{cid}",
            method="PATCH",
            body={"status": "PUBLISHED", "publish_url": "https://www.tiktok.com/@titanaicorp/video/123456"},
        )
        self.assertEqual(st_p, 200)
        patched = json.loads(raw_p.decode("utf-8"))
        self.assertEqual(patched["status"], "PUBLISHED")
        self.assertIn("tiktok.com", patched["publish_url"])

        # 4. Snapshot export & merge preserves media_campaigns
        snap = export_snapshot(self.db)
        self.assertIn("media_campaigns", snap)
        self.assertTrue(any(c["campaign_id"] == cid for c in snap["media_campaigns"]))
        other_db = TitanDatabase(db_path=self.tmp_path / "sync_media.db")
        try:
            merge_snapshot_into_db(other_db, snap)
            self.assertEqual(len(other_db.list_media_campaigns(project_id=pid)), 1)
        finally:
            other_db.close_thread_conn()

        # 5. DELETE /api/media/campaigns/<id> -> 200
        st_d, _, raw_d = self._req(f"/api/media/campaigns/{cid}", method="DELETE")
        self.assertEqual(st_d, 200)
        self.assertTrue(json.loads(raw_d.decode("utf-8"))["deleted"])
        self.assertEqual(len(self.db.list_media_campaigns(project_id=pid)), 0)

    def test_16_v111_render_google_flow_video_bridge_order_and_video_files(self) -> None:
        pid = "proj-flow-demo"
        slug = "flow-demo-studio"
        with self.db.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO projects(
                    project_id, slug, title, objective, target_market,
                    status, expected_price_vnd, unit_cost_vnd, fixed_cost_monthly_vnd,
                    workspace_path, version, created_at, updated_at
                ) VALUES (
                    ?, ?, 'Flow Demo Studio',
                    'Ứng dụng minh họa tạo video AI Google Flow', 'Việt Nam',
                    'ACTIVE', 299000, 35000, 0, ?,
                    1, '2026-11-20T00:00:00Z', '2026-11-20T00:00:00Z'
                )
                """,
                (pid, slug, f"corporate_hq/projects/{slug}"),
            )

        # 1. Create campaign via POST /api/media/campaigns
        st_c, _, raw_c = self._req(
            "/api/media/campaigns",
            method="POST",
            body={
                "project_id": pid,
                "title": "Dựng video 60fps trên trình duyệt trong 5 giây",
                "platform": "TIKTOK",
                "angle_vi": "So sánh tốc độ xử lý ngay trên máy không cần upload",
            },
        )
        self.assertEqual(st_c, 201)
        camp = json.loads(raw_c.decode("utf-8"))
        cid = camp["campaign_id"]
        self.assertEqual(camp["google_flow_url"], "https://flow.google.com/")
        self.assertIsInstance(camp["video_files"], list)

        # 2. Trigger POST /api/media/campaigns/<id>/render-flow -> HTTP 202 + RENDER_GOOGLE_FLOW_VIDEO order
        st_rf, _, raw_rf = self._req(
            f"/api/media/campaigns/{cid}/render-flow",
            method="POST",
            body={"source_device": "test-suite"},
        )
        self.assertEqual(st_rf, 202)
        rf = json.loads(raw_rf.decode("utf-8"))
        self.assertTrue(rf["queued"])
        self.assertEqual(rf["campaign_id"], cid)
        self.assertEqual(rf["google_flow_url"], "https://flow.google.com/")
        self.assertEqual(rf["aspect_ratio"], "9:16")
        self.assertEqual(rf["order"]["order_type"], "RENDER_GOOGLE_FLOW_VIDEO")
        self.assertIn(f"corporate_hq/projects/{slug}/media_studio/videos/", rf["order"]["instructions"])
        self.assertEqual(rf["campaign"]["status"], "FLOW_QUEUED")

        # 3. Verify Dept #27 & #25 are EXECUTING + auto-<order_id> task synced to Kanban for #27
        oid = rf["order"]["order_id"]
        auto_tid = f"auto-{oid}"
        t_obj = self.db.get_task(auto_tid)
        self.assertIsNotNone(t_obj)
        self.assertEqual(t_obj["assigned_dept_id"], "27")
        self.assertEqual(t_obj["kanban_column"], "IN_PROGRESS")

        d27 = self.db.get_department_detail("27")
        d25 = self.db.get_department_detail("25")
        self.assertEqual(d27["status"], "EXECUTING")
        self.assertEqual(d25["status"], "EXECUTING")
        self.assertEqual(d27["current_task_id"], auto_tid)
        self.assertIn("Google Flow", d27["current_work_title"])

        # 4. Drop a sample .mp4 clip in isolated temp media_studio/videos/ -> GET /api/media/campaigns detects it!
        vdir = self.tmp_path / "projects" / slug / "media_studio" / "videos"
        vdir.mkdir(parents=True, exist_ok=True)
        clip_path = vdir / f"{cid}_scene01.mp4"
        clip_path.write_bytes(b"\x00\x00\x00\x18ftypmp42" + b"0" * 2048)

        st_l, _, raw_l = self._req(f"/api/media/campaigns?project_id={pid}")
        self.assertEqual(st_l, 200)
        listed = json.loads(raw_l.decode("utf-8"))["campaigns"]
        self.assertEqual(len(listed), 1)
        self.assertEqual(listed[0]["google_flow_url"], "https://flow.google.com/")
        self.assertEqual(len(listed[0]["video_files"]), 1)
        self.assertEqual(listed[0]["video_files"][0]["name"], f"{cid}_scene01.mp4")
        self.assertEqual(listed[0]["video_files"][0]["url"], f"./projects/{slug}/media_studio/videos/{cid}_scene01.mp4")
        self.assertGreater(listed[0]["video_files"][0]["size_kb"], 0.0)

        # Also verify /api/overview reflects video_files & google_flow_url
        st_ov, _, raw_ov = self._req("/api/overview")
        self.assertEqual(st_ov, 200)
        ov_camps = json.loads(raw_ov.decode("utf-8"))["media_campaigns"]
        ov_c = next(c for c in ov_camps if c["campaign_id"] == cid)
        self.assertEqual(ov_c["google_flow_url"], "https://flow.google.com/")
        self.assertEqual(len(ov_c["video_files"]), 1)

        # 5. Complete order -> auto task DONE & #27/#25 return to IDLE
        self.db.complete_order(oid, result_summary="Đã dựng xong video Google Flow", status="COMPLETED")
        self.assertEqual(self.db.get_task(auto_tid)["kanban_column"], "DONE")
        self.assertEqual(self.db.get_department_detail("27")["status"], "IDLE")
        self.assertEqual(self.db.get_department_detail("25")["status"], "IDLE")


if __name__ == "__main__":
    unittest.main()
