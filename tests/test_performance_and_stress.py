import concurrent.futures
import json
import sys
import tempfile
import threading
import time
import unittest
import unittest.mock
import urllib.request
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT_DIR / "scripts"
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import command_center_server
from command_center_server import CommandCenterHandler, ThreadingCommandServer
from titan_db import TitanDatabase, utc_now_iso


def percentile(sorted_vals: list[float], pct: float) -> float:
    if not sorted_vals:
        return 0.0
    idx = min(len(sorted_vals) - 1, max(0, int(round((pct / 100.0) * (len(sorted_vals) - 1)))))
    return sorted_vals[idx]


class TestPerformanceLatencyAndStressSLAs(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.tmp_path = Path(self.tmp_dir.name)
        self.db_path = self.tmp_path / "stress_bench.db"
        self.snap_path = self.tmp_path / "snapshot.json"
        self.db = TitanDatabase(db_path=self.db_path)

        # Seed 1,200 Knowledge Atoms + 600 Activity Events for realistic heavy load!
        now = utc_now_iso()
        with self.db.immediate_tx() as conn:
            for i in range(1200):
                dept_num = f"{(i % 45) + 1:02d}"
                url = f"https://intel.titan-bench.local/article-{i}"
                u_hash = TitanDatabase.compute_url_hash(url, dept_num)
                conn.execute(
                    """
                    INSERT INTO knowledge_atoms(
                        url_hash, source_connector, dept_id, division_code,
                        title, url, published_at, fetched_at,
                        summary_vi, actionable_insight, importance, tags
                    ) VALUES (?, 'bench_rss', ?, 'div1-strategy-intel', ?, ?, ?, ?, ?, ?, ?, 'benchmark,ai,saas')
                    """,
                    (
                        u_hash,
                        dept_num,
                        f"Báo cáo phân tích thị trường rèm cửa & nội thất số {i}",
                        url,
                        now,
                        now,
                        f"Tổng hợp xu hướng chuyển đổi số ngành nội thất, thuế thương mại điện tử và tác tử AI kỳ {i}.",
                        f"Áp dụng quy trình 3 chạm chốt đơn nhanh gấp đôi cho cửa hàng {i}.",
                        (i % 5) + 6,
                    ),
                )
            for j in range(600):
                conn.execute(
                    """
                    INSERT INTO activity_stream(event_uid, timestamp, actor_dept_id, event_type, headline_vi, detail_json)
                    VALUES (?, ?, '01', 'BENCH_EVENT', ?, '{}')
                    """,
                    (f"bench-ev-{j}", now, f"Sự kiện kiểm thử chịu tải tốc độ cao số {j}"),
                )

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
        self.tmp_dir.cleanup()

    def test_sla02_sla04_and_sla06_latency_and_40_concurrent_clients(self) -> None:
        # SLA-04: Direct FTS5 BM25 Search over 1,200 Vietnamese + English articles (< 12ms)
        fts_latencies_ms: list[float] = []
        queries = ["rèm cửa nội thất", "thuế thương mại", "chốt đơn 3 chạm", "ai saas", "chuyển đổi số"]
        for i in range(50):
            q = queries[i % len(queries)]
            t0 = time.perf_counter_ns()
            hits = self.db.search_knowledge_fts(query=q, limit=40)
            elapsed_ms = (time.perf_counter_ns() - t0) / 1_000_000.0
            self.assertGreater(len(hits), 0)
            fts_latencies_ms.append(elapsed_ms)

        fts_latencies_ms.sort()
        fts_p95 = percentile(fts_latencies_ms, 95)
        self.assertLess(fts_p95, 12.0, f"SLA-04 violated: FTS5 p95={fts_p95:.2f}ms >= 12ms")

        # Warm up 3 HTTP calls
        for _ in range(3):
            urllib.request.urlopen(f"{self.base_url}/api/health", timeout=5).read()

        # SLA-02: 200 HTTP GET /api/overview calls (p95 < 45ms, p99 < 100ms)
        http_latencies_ms: list[float] = []
        for _ in range(200):
            t0 = time.perf_counter_ns()
            with urllib.request.urlopen(
                urllib.request.Request(f"{self.base_url}/api/overview?limit=60", headers={"Accept-Encoding": "gzip"}),
                timeout=5,
            ) as resp:
                self.assertEqual(resp.status, 200)
                _ = resp.read()
            http_latencies_ms.append((time.perf_counter_ns() - t0) / 1_000_000.0)

        http_latencies_ms.sort()
        p50 = percentile(http_latencies_ms, 50)
        p95 = percentile(http_latencies_ms, 95)
        p99 = percentile(http_latencies_ms, 99)
        print(
            f"\n[BENCHMARK SLA REPORT] 1,200 Articles | FTS5 p95={fts_p95:.2f}ms | HTTP /api/overview p50={p50:.2f}ms, p95={p95:.2f}ms, p99={p99:.2f}ms",
            flush=True,
        )
        self.assertLess(p95, 45.0, f"SLA-02 violated: HTTP overview p95={p95:.2f}ms >= 45ms")
        self.assertLess(p99, 100.0, f"SLA-02 violated: HTTP overview p99={p99:.2f}ms >= 100ms")

        # SLA-06: Non-blocking UI responsiveness while slow background learning job runs
        def slow_network_simulation(*_args, **_kwargs):
            time.sleep(0.35)
            return {"status": "COMPLETED", "atoms_inserted": 5}

        with unittest.mock.patch.object(self.server.learning_engine, "run_learning_cycle", side_effect=slow_network_simulation):
            req_learn = urllib.request.Request(
                f"{self.base_url}/api/learning/run",
                data=b'{"scope":"all"}',
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req_learn, timeout=5) as r_learn:
                self.assertEqual(r_learn.status, 202)

            # Immediately hit /api/overview 10 times WHILE background learning is sleeping 350ms!
            bg_pings = []
            for _ in range(10):
                t0 = time.perf_counter_ns()
                with urllib.request.urlopen(f"{self.base_url}/api/overview?limit=30", timeout=5) as r_ov:
                    self.assertEqual(r_ov.status, 200)
                    _ = r_ov.read()
                bg_pings.append((time.perf_counter_ns() - t0) / 1_000_000.0)
            bg_pings.sort()
            self.assertLess(percentile(bg_pings, 95), 45.0, "UI blocked during background learning!")

        # 40 Concurrent Parallel Threads Stress Burst (Zero 500s, Zero SQLite Locked!)
        def worker_hit(idx: int) -> int:
            ep = "/api/departments" if idx % 2 == 0 else "/api/knowledge?q=n%E1%BB%99i+th%E1%BA%A5t"
            with urllib.request.urlopen(f"{self.base_url}{ep}", timeout=8) as r:
                _ = r.read()
                return r.status

        with concurrent.futures.ThreadPoolExecutor(max_workers=40) as pool:
            statuses = list(pool.map(worker_hit, range(80)))
        self.assertTrue(all(s == 200 for s in statuses))


if __name__ == "__main__":
    unittest.main()
