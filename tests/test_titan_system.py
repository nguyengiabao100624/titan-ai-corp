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
from titan_db import TitanDatabase


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
        self.assertEqual(snap["schema_version"], "8.0")
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


if __name__ == "__main__":
    unittest.main()
