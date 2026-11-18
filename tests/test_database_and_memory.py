import sys
import tempfile
import threading
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = ROOT_DIR / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from titan_db import TitanDatabase


class TestDatabaseAndMemoryEngine(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.db_path = Path(self._tmp.name) / "test_titan.db"
        self.db = TitanDatabase(db_path=self.db_path)

    def tearDown(self) -> None:
        self.db.close_thread_conn()
        self._tmp.cleanup()

    def test_wal_mode_and_46_positions_synced(self) -> None:
        conn = self.db._get_conn()
        mode = conn.execute("PRAGMA journal_mode;").fetchone()[0]
        self.assertEqual(mode.lower(), "wal")
        depts = self.db.list_departments()
        self.assertGreaterEqual(len(depts), 51)
        ids = {d["dept_id"] for d in depts}
        self.assertIn("00", ids)
        self.assertIn("46", ids)
        self.assertIn("48", ids)
        self.assertIn("50", ids)

    def test_atomic_task_checkout_20_thread_race(self) -> None:
        task = self.db.create_task(
            title="Kiểm thử tranh chấp khóa đồng thời 20 luồng",
            assigned_dept_id="15",
            priority="CRITICAL",
        )
        task_id = task["task_id"]
        barrier = threading.Barrier(20)
        results: list[bool] = []
        results_lock = threading.Lock()

        def contender(idx: int) -> None:
            try:
                barrier.wait(timeout=5.0)
                res = self.db.checkout_task_atomic(task_id, "15", worker_token=f"worker-{idx:02d}")
                with results_lock:
                    results.append(bool(res["acquired"]))
            finally:
                self.db.close_thread_conn()

        threads = [threading.Thread(target=contender, args=(i,)) for i in range(20)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=10.0)

        self.assertEqual(len(results), 20)
        self.assertEqual(results.count(True), 1, "Strictly 1 of 20 contenders may win the atomic checkout lock")
        self.assertEqual(results.count(False), 19)

    def test_fts5_bm25_and_stanford_3d_recall_and_reflexion(self) -> None:
        added1, _ = self.db.store_knowledge_atom(
            source_connector="vn_news",
            dept_id="39",
            division_code="div7-finance-tax-legal",
            title="Quy định mới về hóa đơn điện tử khởi tạo từ máy tính tiền cho hộ kinh doanh",
            url="https://example.vn/thue-hkd-2026",
            summary_vi="Xóa bỏ thuế khoán, bắt buộc kê khai doanh thu thực tế từ máy tính tiền.",
            actionable_insight="Tách riêng tài khoản kinh doanh và trích 7% dự phòng thuế.",
            importance=10,
            tags="thue hoa-don-dien-tu hkd",
        )
        added_dup, _ = self.db.store_knowledge_atom(
            source_connector="vn_news",
            dept_id="39",
            division_code="div7-finance-tax-legal",
            title="Bản trùng lặp",
            url="https://example.vn/thue-hkd-2026",
            summary_vi="...",
            actionable_insight="...",
            importance=5,
        )
        self.assertTrue(added1)
        self.assertFalse(added_dup, "SHA-256 deduplication must reject duplicate URL per department")

        self.db.store_knowledge_atom(
            source_connector="hackernews",
            dept_id="38",
            division_code="div7-finance-tax-legal",
            title="General office coffee machine maintenance note",
            url="https://example.com/coffee",
            summary_vi="Unrelated trivial note.",
            actionable_insight="None.",
            importance=2,
            tags="misc",
        )

        # Trigger a rejection to create a Reflexion verbal RL rule for dept 39
        t = self.db.create_task(title="Soạn hướng dẫn thuế HKD", assigned_dept_id="39")
        self.db.submit_deliverable(t["task_id"], "39", "Bản nháp thuế", "Chưa ghi số nghị định")
        rejected = self.db.chairman_decide_task(
            t["task_id"],
            decision="REJECT",
            note="Thiếu trích dẫn Nghị định 70/2025/NĐ-CP",
            preventive_rule="Luôn trích dẫn rõ số hiệu Nghị định & Thông tư hiện hành.",
        )
        self.assertEqual(rejected["kanban_column"], "IN_PROGRESS")

        recalled = self.db.recall_stanford_3d(dept_id="39", query="hóa đơn điện tử thuế hộ kinh doanh")
        self.assertGreaterEqual(len(recalled["top_memories"]), 1)
        self.assertIn("hóa đơn điện tử", recalled["top_memories"][0]["title"])
        self.assertEqual(len(recalled["active_reflexions"]), 1)
        self.assertIn("Nghị định", recalled["active_reflexions"][0]["preventive_rule"])

    def test_cfo_unit_economics_deterministic_math(self) -> None:
        healthy = TitanDatabase.simulate_cfo_unit_economics(
            price_per_month=399000,
            max_quota_units=100,
            api_cost_per_unit=1200,
            avg_usage_ratio=0.5,
            payment_fee_pct=1.0,
            tax_reserve_pct=7.0,
            fixed_monthly_cost=1500000,
        )
        self.assertTrue(healthy["gate1_passed"])
        self.assertGreaterEqual(healthy["worst_gross_margin_pct"], 65.0)
        self.assertGreater(healthy["breakeven_customers"], 0)

        unsafe = TitanDatabase.simulate_cfo_unit_economics(
            price_per_month=199000,
            max_quota_units=200,
            api_cost_per_unit=1500,
        )
        self.assertFalse(unsafe["gate1_passed"])


if __name__ == "__main__":
    unittest.main()
