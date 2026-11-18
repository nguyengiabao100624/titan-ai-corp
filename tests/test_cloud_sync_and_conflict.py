import sys
import tempfile
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = ROOT_DIR / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from cloud_sync import export_snapshot, merge_snapshot_into_db
from titan_db import TitanDatabase


class TestCloudSyncAndMultiDeviceConflict(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.phone_db = TitanDatabase(db_path=Path(self._tmp.name) / "phone_device.db")
        self.laptop_db = TitanDatabase(db_path=Path(self._tmp.name) / "laptop_workstation.db")

    def tearDown(self) -> None:
        self.phone_db.close_thread_conn()
        self.laptop_db.close_thread_conn()
        self._tmp.cleanup()

    def test_bidirectional_multi_device_merge_zero_data_loss(self) -> None:
        # 1. Start from shared baseline project & task T1
        proj = self.laptop_db.create_project(
            slug="rem-cua-ai",
            title="App Ướm Mẫu Rèm Cửa",
            objective="Chốt cọc tại nhà khách trong 10 giây",
            seed_gate1_tasks=False,
        )
        t1 = self.laptop_db.create_task(
            title="Thiết kế màn hình 3 nút bấm",
            assigned_dept_id="08",
            project_id=proj["project_id"],
            task_id="task-shared-001",
        )
        self.laptop_db.submit_deliverable(t1["task_id"], "08", "UI Design Tokens", "28 biến màu dịu mắt")

        # Sync initial baseline from Laptop -> Phone
        baseline_snap = export_snapshot(self.laptop_db)
        merge_snapshot_into_db(self.phone_db, baseline_snap)

        # 2. Simulate offline divergent edits on BOTH devices simultaneously!
        # On Phone (4G outside): Chairman APPROVES T1 AND creates a new urgent Task T-Phone
        self.phone_db.chairman_decide_task("task-shared-001", "APPROVE", note="Duyệt trên iPhone ngoài đường")
        self.phone_db.create_task(
            title="Quay 3 kịch bản Shorts Trước/Sau",
            assigned_dept_id="26",
            project_id=proj["project_id"],
            task_id="task-from-phone-002",
        )

        # Meanwhile on Laptop at home: Agents learn 3 new articles AND create Task T-Laptop
        for idx in range(3):
            self.laptop_db.store_knowledge_atom(
                source_connector="arxiv",
                dept_id="16",
                division_code="div3-engineering-ai",
                title=f"Multi-Image Inpainting Paper #{idx}",
                url=f"https://arxiv.org/abs/2611.000{idx}",
                summary_vi="Giữ nguyên cấu trúc phòng khi thay vật liệu.",
                actionable_insight="Áp dụng Reference Attention.",
                importance=9,
            )
        self.laptop_db.create_task(
            title="Viết API VietQR tự động",
            assigned_dept_id="15",
            project_id=proj["project_id"],
            task_id="task-from-laptop-003",
        )

        # 3. Merge Phone -> Laptop, then Laptop -> Phone
        phone_snap = export_snapshot(self.phone_db)
        merge_snapshot_into_db(self.laptop_db, phone_snap)

        laptop_merged_snap = export_snapshot(self.laptop_db)
        merge_snapshot_into_db(self.phone_db, laptop_merged_snap)

        # 4. Assert 100% convergence & zero data loss on both devices!
        for device_name, db_inst in (("Laptop", self.laptop_db), ("Phone", self.phone_db)):
            t1_final = db_inst.get_task("task-shared-001")
            self.assertIsNotNone(t1_final, device_name)
            self.assertEqual(t1_final["kanban_column"], "DONE", f"{device_name} must preserve Chairman APPROVE")
            self.assertIn("iPhone", t1_final["approval_note"])

            self.assertIsNotNone(db_inst.get_task("task-from-phone-002"), device_name)
            self.assertIsNotNone(db_inst.get_task("task-from-laptop-003"), device_name)

            learned = db_inst.search_knowledge_fts(query="Inpainting", dept_id="16")
            self.assertEqual(len(learned), 3, f"{device_name} must have all 3 learned papers")


if __name__ == "__main__":
    unittest.main()
