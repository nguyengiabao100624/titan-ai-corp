import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = ROOT_DIR / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from learning_engine import (
    ContinualLearningEngine,
    extract_webpage_wisdom,
    parse_github_repos_json,
    parse_hackernews_json,
    parse_rss_or_atom_xml,
)
from titan_db import TitanDatabase

SAMPLE_RSS = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>VnExpress Kinh Doanh</title>
    <item>
      <title>Hộ kinh doanh chuyển sang hóa đơn điện tử từ máy tính tiền</title>
      <link>https://vnexpress.net/ho-kinh-doanh-hoa-don-1.html</link>
      <description>&lt;p&gt;Nhu cầu phần mềm kế toán đơn giản tăng mạnh trên toàn quốc.&lt;/p&gt;</description>
      <pubDate>Thu, 19 Nov 2026 01:00:00 +0700</pubDate>
    </item>
  </channel>
</rss>
"""

SAMPLE_ATOM = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2611.12345v1</id>
    <published>2026-11-18T12:00:00Z</published>
    <title>Memory-Centric Continual Learning for Autonomous Agents</title>
    <summary>A hierarchical reflection architecture improving multi-agent reliability.</summary>
    <link href="http://arxiv.org/abs/2611.12345v1" rel="alternate" type="text/html"/>
  </entry>
</feed>
"""


class TestContinualLearningEngine(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        tmp_path = Path(self._tmp.name)
        self.db = TitanDatabase(db_path=tmp_path / "learn_test.db")
        self.vault_dir = tmp_path / "vault"
        self.reg_path = tmp_path / "registry.json"
        self.reg_path.write_text(
            json.dumps(
                {
                    "rss_feeds": [
                        {
                            "id": "mock-rss",
                            "connector": "vn_news",
                            "url": "https://mock.local/rss.xml",
                            "division_code": "div7-finance-tax-legal",
                            "target_depts": ["39"],
                            "importance": 9,
                            "max_items": 5,
                            "tags": "thue hkd",
                        },
                        {
                            "id": "broken-rss",
                            "connector": "vn_news",
                            "url": "https://broken.local/timeout.xml",
                            "division_code": "div1-strategy-intel",
                            "target_depts": ["01"],
                            "importance": 7,
                        },
                    ],
                    "arxiv_queries": [
                        {
                            "id": "mock-arxiv",
                            "connector": "arxiv",
                            "query": "cat:cs.AI",
                            "division_code": "div3-engineering-ai",
                            "target_depts": ["16"],
                            "importance": 8,
                            "max_results": 3,
                        }
                    ],
                    "github_queries": [],
                    "hackernews_queries": [],
                }
            ),
            encoding="utf-8",
        )
        self.engine = ContinualLearningEngine(
            db=self.db,
            registry_path=self.reg_path,
            vault_dir=self.vault_dir,
        )

    def tearDown(self) -> None:
        self.db.close_thread_conn()
        self._tmp.cleanup()

    def test_parsers_rss_atom_github_hn_and_html(self) -> None:
        rss = parse_rss_or_atom_xml(SAMPLE_RSS)
        self.assertEqual(len(rss), 1)
        self.assertIn("hóa đơn điện tử", rss[0]["title"])
        self.assertNotIn("<p>", rss[0]["summary"])

        atom = parse_rss_or_atom_xml(SAMPLE_ATOM)
        self.assertEqual(len(atom), 1)
        self.assertIn("Continual Learning", atom[0]["title"])

        gh = parse_github_repos_json(
            json.dumps(
                {
                    "items": [
                        {
                            "full_name": "paperclipai/paperclip",
                            "html_url": "https://github.com/paperclipai/paperclip",
                            "description": "Open-source orchestration for AI companies",
                            "stargazers_count": 12400,
                            "language": "TypeScript",
                        }
                    ]
                }
            )
        )
        self.assertEqual(len(gh), 1)
        self.assertIn("paperclipai/paperclip", gh[0]["title"])

        hn = parse_hackernews_json(
            json.dumps(
                {"hits": [{"title": "Show HN: Fast SQLite SaaS", "objectID": "99", "points": 180, "num_comments": 45}]}
            )
        )
        self.assertEqual(len(hn), 1)
        self.assertIn("Show HN", hn[0]["title"])

        web = extract_webpage_wisdom(
            "<html><head><title>Báo Cáo Thị Trường 2026</title></head>"
            "<body><p>Doanh thu phần mềm ngách cho cửa hàng vật liệu xây dựng tăng trưởng vượt bậc năm 2026.</p></body></html>",
            "https://example.vn/bao-cao",
        )
        self.assertEqual(web["title"], "Báo Cáo Thị Trường 2026")
        self.assertIn("vật liệu xây dựng", web["summary"])

    def test_resilient_learning_cycle_and_deduplication(self) -> None:
        def fake_get(url: str, accept: str = "*/*") -> str:
            if "broken.local" in url:
                raise TimeoutError("Simulated network timeout")
            if "arxiv.org" in url:
                return SAMPLE_ATOM
            return SAMPLE_RSS

        with patch.object(self.engine, "_http_get_text", side_effect=fake_get):
            res1 = self.engine.run_learning_cycle(scope="all", triggered_by="UNIT_TEST")
            self.assertEqual(res1["new_atoms_added"], 2)
            self.assertEqual(len(res1["errors"]), 1, "Broken feed must be isolated without crashing other feeds")

            # Run second time -> must deduplicate 100%
            res2 = self.engine.run_learning_cycle(scope="all", triggered_by="UNIT_TEST")
            self.assertEqual(res2["new_atoms_added"], 0)
            self.assertEqual(res2["duplicates_skipped"], 2)

        # Verify markdown digest file written on disk
        digest_files = list(self.vault_dir.glob("39-*/latest_digest.md"))
        self.assertEqual(len(digest_files), 1)
        self.assertIn("hóa đơn điện tử", digest_files[0].read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
