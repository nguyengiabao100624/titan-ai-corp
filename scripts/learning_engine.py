#!/usr/bin/env python3
"""Titan AI Corp — 8-Connector Live Market, News, arXiv, GitHub & Deep URL Continual Learning Engine."""

from __future__ import annotations

import concurrent.futures
import html
import json
import re
import urllib.parse
import urllib.request
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

from titan_db import ROOT_DIR, TitanDatabase, utc_now_iso

DEFAULT_REGISTRY_PATH = ROOT_DIR / "corporate_hq" / "intel_sources" / "feeds_registry.json"
VAULT_DIR = ROOT_DIR / "corporate_hq" / "knowledge_vault"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "TitanAICorp-ResearchEngine/4.0 (+https://github.com/titan-ai-corp)"
)


def strip_html_tags(raw: str) -> str:
    if not raw:
        return ""
    no_comments = re.sub(r"<!--.*?-->", " ", raw, flags=re.DOTALL)
    no_script = re.sub(r"<(script|style|noscript|svg|iframe)[^>]*>.*?</\1>", " ", no_comments, flags=re.DOTALL | re.IGNORECASE)
    no_tags = re.sub(r"<[^>]+>", " ", no_script)
    unescaped = html.unescape(no_tags)
    return re.sub(r"\s+", " ", unescaped).strip()


def synthesize_actionable_insight(connector: str, title: str, summary: str, tags: str) -> str:
    """Deterministic Fabric-style Wisdom Atom takeaway synthesizer mapped by domain."""
    combined = f"{title} {summary}".lower()
    if any(k in combined for k in ("thuế", "hóa đơn", "nghị định", "pháp luật", "tax")):
        return "Cập nhật ngay vào danh mục kiểm tra tuân thủ thuế & hóa đơn điện tử của Khối 7 trước khi chốt gói cước."
    if any(k in combined for k in ("vulnerability", "cve", "injection", "lừa đảo", "bảo mật", "security")):
        return "Bổ sung mẫu kiểm thử phòng thủ vào Cổng 3 (QA & An ninh mạng) để bảo vệ sản phẩm và dữ liệu khách hàng."
    if any(k in combined for k in ("youtube", "seo", "search", "video", "tiktok", "retention")):
        return "Áp dụng vào quy trình đóng gói Tiêu đề/Thumbnail, kịch bản Hook 3 giây và cấu trúc GEO/SEO của Khối 5."
    if connector == "github_repo":
        return "Đánh giá kiến trúc mã nguồn mở này để tái sử dụng module chuẩn (Voyager Library), rút ngắn 50% thời gian code."
    if connector == "arxiv":
        return "Thử nghiệm kỹ thuật mới trong Phòng AI R&D (04) và Kỹ sư AI (16) nhằm tăng độ chính xác và giảm chi phí token."
    return "Tín hiệu thị trường thực tế: Đối chiếu nhu cầu khách hàng, định giá sản phẩm và kịch bản tiếp cận bán hàng."


def parse_rss_or_atom_xml(xml_text: str, max_items: int = 5) -> list[dict[str, str]]:
    """Parse both RSS 2.0 (<item>) and Atom (<entry>) XML feeds cleanly."""
    items: list[dict[str, str]] = []
    cleaned_xml = xml_text.lstrip("\ufeff \t\r\n")
    root = ET.fromstring(cleaned_xml)

    # 1. Standard RSS 2.0 <item>
    rss_items = root.findall(".//item")
    if rss_items:
        for node in rss_items[:max_items]:
            title = strip_html_tags(node.findtext("title") or "")
            link = (node.findtext("link") or "").strip()
            desc = strip_html_tags(node.findtext("description") or node.findtext("summary") or "")
            pub = (node.findtext("pubDate") or node.findtext("published") or utc_now_iso()).strip()
            if title and link:
                items.append(
                    {
                        "title": title[:220],
                        "url": link,
                        "summary": (desc[:450] if desc else title),
                        "published_at": pub,
                    }
                )
        return items

    # 2. Atom <entry> (arXiv, Google Search Central Blog, etc.)
    ns_atom = "{http://www.w3.org/2005/Atom}"
    entries = root.findall(f".//{ns_atom}entry") or root.findall(".//entry")
    for entry in entries[:max_items]:
        title = strip_html_tags(
            entry.findtext(f"{ns_atom}title") or entry.findtext("title") or ""
        )
        summary = strip_html_tags(
            entry.findtext(f"{ns_atom}summary")
            or entry.findtext(f"{ns_atom}content")
            or entry.findtext("summary")
            or entry.findtext("content")
            or ""
        )
        pub = (
            entry.findtext(f"{ns_atom}published")
            or entry.findtext(f"{ns_atom}updated")
            or entry.findtext("published")
            or utc_now_iso()
        ).strip()
        link = ""
        for link_el in entry.findall(f"{ns_atom}link") + entry.findall("link"):
            href = link_el.attrib.get("href", "").strip()
            rel = link_el.attrib.get("rel", "alternate")
            if href and rel in ("alternate", ""):
                link = href
                break
            if href and not link:
                link = href
        if not link:
            link = (entry.findtext(f"{ns_atom}id") or entry.findtext("id") or "").strip()
        if title and link:
            items.append(
                {
                    "title": title[:220],
                    "url": link,
                    "summary": (summary[:450] if summary else title),
                    "published_at": pub,
                }
            )
    return items


def parse_github_repos_json(json_text: str, max_items: int = 4) -> list[dict[str, str]]:
    data = json.loads(json_text)
    out: list[dict[str, str]] = []
    for repo in (data.get("items") or [])[:max_items]:
        full_name = repo.get("full_name", "")
        html_url = repo.get("html_url", "")
        desc = strip_html_tags(repo.get("description") or "Open-source repository")
        stars = repo.get("stargazers_count", 0)
        lang = repo.get("language") or "Multi-lang"
        if full_name and html_url:
            out.append(
                {
                    "title": f"[GitHub ★{stars}] {full_name} ({lang})",
                    "url": html_url,
                    "summary": desc[:420],
                    "published_at": repo.get("updated_at") or utc_now_iso(),
                }
            )
    return out


def parse_hackernews_json(json_text: str, max_items: int = 5) -> list[dict[str, str]]:
    data = json.loads(json_text)
    out: list[dict[str, str]] = []
    for hit in (data.get("hits") or [])[:max_items]:
        title = strip_html_tags(hit.get("title") or "")
        object_id = hit.get("objectID", "")
        url = hit.get("url") or (f"https://news.ycombinator.com/item?id={object_id}" if object_id else "")
        points = hit.get("points") or 0
        comments = hit.get("num_comments") or 0
        if title and url:
            out.append(
                {
                    "title": f"[HN ▲{points} 💬{comments}] {title[:190]}",
                    "url": url,
                    "summary": f"Thảo luận thực tế trên Hacker News ({points} điểm, {comments} bình luận): {title}",
                    "published_at": hit.get("created_at") or utc_now_iso(),
                }
            )
    return out


def extract_webpage_wisdom(html_text: str, url: str) -> dict[str, str]:
    """Deep URL Reader: extract clean title & core article summary from arbitrary HTML (zero script leakage)."""
    sanitized_html = re.sub(
        r"<(script|style|noscript|svg|iframe)[^>]*>.*?</\1>",
        " ",
        html_text or "",
        flags=re.DOTALL | re.IGNORECASE,
    )
    title_match = re.search(r"<title[^>]*>(.*?)</title>", sanitized_html, flags=re.DOTALL | re.IGNORECASE)
    raw_title = strip_html_tags(title_match.group(1)) if title_match else url

    meta_desc = ""
    meta_match = re.search(
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',
        sanitized_html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if meta_match:
        meta_desc = strip_html_tags(meta_match.group(1))

    paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", sanitized_html, flags=re.DOTALL | re.IGNORECASE)
    clean_paras = []
    for p in paragraphs:
        txt = strip_html_tags(p)
        if len(txt) >= 50 and not any(tok in txt for tok in ("function(", "typeof ", "window.", "document.getElement")):
            clean_paras.append(txt)
    body_excerpt = " ".join(clean_paras[:5])[:600]
    summary = (f"{meta_desc} — {body_excerpt}".strip(" —")) if (meta_desc or body_excerpt) else strip_html_tags(sanitized_html)[:500]

    return {
        "title": (raw_title or url)[:220],
        "url": url,
        "summary": summary[:550] or "Tài liệu chuyên khảo trực tuyến đã được thu thập.",
        "published_at": utc_now_iso(),
    }


class ContinualLearningEngine:
    """Executes daily multi-source intelligence gathering and updates each specialist's vault."""

    def __init__(
        self,
        db: TitanDatabase,
        registry_path: Path = DEFAULT_REGISTRY_PATH,
        vault_dir: Path = VAULT_DIR,
        http_timeout: float = 8.0,
    ) -> None:
        self.db = db
        self.registry_path = registry_path
        self.vault_dir = vault_dir
        self.vault_dir.mkdir(parents=True, exist_ok=True)
        self.http_timeout = http_timeout

    def _http_get_text(self, url: str, accept: str = "*/*") -> str:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": accept},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=self.http_timeout) as resp:
            raw_bytes = resp.read(750_000)  # Cap at 750KB for safety & speed
            charset = resp.headers.get_content_charset() or "utf-8"
            return raw_bytes.decode(charset, errors="replace")

    def _fetch_single_job(self, job: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, str]], str | None]:
        jtype = job["job_type"]
        cfg = job["config"]
        try:
            if jtype == "rss":
                xml_body = self._http_get_text(cfg["url"], accept="application/rss+xml, application/xml, text/xml, */*")
                parsed = parse_rss_or_atom_xml(xml_body, max_items=int(cfg.get("max_items", 5)))
                return cfg, parsed, None

            if jtype == "arxiv":
                q = cfg["query"]
                max_r = int(cfg.get("max_results", 4))
                url = f"http://export.arxiv.org/api/query?search_query={q}&sortBy=submittedDate&sortOrder=descending&max_results={max_r}"
                xml_body = self._http_get_text(url, accept="application/atom+xml, text/xml")
                parsed = parse_rss_or_atom_xml(xml_body, max_items=max_r)
                return cfg, parsed, None

            if jtype == "github":
                q = urllib.parse.quote_plus(cfg["query"])
                max_r = int(cfg.get("max_results", 4))
                url = f"https://api.github.com/search/repositories?q={q}&sort=updated&order=desc&per_page={max_r}"
                json_body = self._http_get_text(url, accept="application/vnd.github+json")
                parsed = parse_github_repos_json(json_body, max_items=max_r)
                return cfg, parsed, None

            if jtype == "hackernews":
                q = urllib.parse.quote_plus(cfg["query"])
                max_r = int(cfg.get("max_results", 5))
                url = f"https://hn.algolia.com/api/v1/search_by_date?query={q}&tags=story&hitsPerPage={max_r}"
                json_body = self._http_get_text(url, accept="application/json")
                parsed = parse_hackernews_json(json_body, max_items=max_r)
                return cfg, parsed, None

            return cfg, [], f"Unknown job_type: {jtype}"
        except Exception as exc:
            return cfg, [], f"{cfg.get('id', 'source')}: {exc}"

    def run_learning_cycle(self, scope: str = "all", triggered_by: str = "CLI") -> dict[str, Any]:
        run_id = f"learn-{uuid.uuid4().hex[:10]}"
        started = utc_now_iso()
        registry = json.loads(self.registry_path.read_text(encoding="utf-8"))

        jobs: list[dict[str, Any]] = []
        for item in registry.get("rss_feeds", []):
            if scope in ("all", item["connector"], item["division_code"], item["id"]):
                jobs.append({"job_type": "rss", "config": item})
        for item in registry.get("arxiv_queries", []):
            if scope in ("all", "arxiv", item["division_code"], item["id"]):
                jobs.append({"job_type": "arxiv", "config": item})
        for item in registry.get("github_queries", []):
            if scope in ("all", "github_repo", item["division_code"], item["id"]):
                jobs.append({"job_type": "github", "config": item})
        for item in registry.get("hackernews_queries", []):
            if scope in ("all", "hackernews", item["division_code"], item["id"]):
                jobs.append({"job_type": "hackernews", "config": item})

        with self.db.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO learning_runs(run_id, triggered_by, scope, sources_queried, status, started_at)
                VALUES (?, ?, ?, ?, 'RUNNING', ?)
                """,
                (run_id, triggered_by, scope, len(jobs), started),
            )

        self.db.log_event(
            actor_dept_id="44",
            event_type="LEARNING_CYCLE_STARTED",
            headline_vi=f"Bắt đầu chu kỳ đọc báo, nghiên cứu arXiv & quét thị trường ({len(jobs)} kênh trực tuyến)",
            detail={"run_id": run_id, "scope": scope, "triggered_by": triggered_by},
        )

        new_atoms = 0
        dup_skipped = 0
        errors: list[str] = []
        touched_depts: set[str] = set()

        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            futures = [pool.submit(self._fetch_single_job, job) for job in jobs]
            for fut in concurrent.futures.as_completed(futures):
                cfg, articles, err = fut.result()
                if err:
                    errors.append(err)
                    continue

                connector = cfg.get("connector", "web")
                div_code = cfg.get("division_code", "div1-strategy-intel")
                importance = int(cfg.get("importance", 7))
                tags = cfg.get("tags", "")
                target_depts = cfg.get("target_depts") or ["01"]

                for art in articles:
                    insight = synthesize_actionable_insight(connector, art["title"], art["summary"], tags)
                    # Route primary copy to primary lead department, and secondary high-signal copies
                    for idx, dept_id in enumerate(target_depts[:2]):
                        added, _ = self.db.store_knowledge_atom(
                            source_connector=connector,
                            dept_id=dept_id,
                            division_code=div_code,
                            title=art["title"],
                            url=art["url"],
                            summary_vi=art["summary"],
                            actionable_insight=insight,
                            published_at=art.get("published_at"),
                            importance=importance,
                            tags=tags,
                            emit_event=(idx == 0 and new_atoms < 18),
                        )
                        if added:
                            new_atoms += 1
                            touched_depts.add(dept_id)
                        else:
                            dup_skipped += 1

        for dept_id in touched_depts:
            self.write_department_digest_markdown(dept_id)

        finished = utc_now_iso()
        status = "COMPLETED" if (new_atoms > 0 or not errors or len(errors) < len(jobs)) else "PARTIAL_ERROR"
        err_text = "\n".join(errors[:15])

        with self.db.immediate_tx() as conn:
            conn.execute(
                """
                UPDATE learning_runs
                SET new_atoms_added = ?,
                    duplicates_skipped = ?,
                    status = ?,
                    finished_at = ?,
                    error_log = ?
                WHERE run_id = ?
                """,
                (new_atoms, dup_skipped, status, finished, err_text, run_id),
            )

        self.db.log_event(
            actor_dept_id="44",
            event_type="LEARNING_CYCLE_COMPLETED",
            headline_vi=(
                f"Hoàn tất chu kỳ học tập: Nạp {new_atoms} tri thức mới vào {len(touched_depts)} phòng ban "
                f"(Bỏ qua {dup_skipped} tin trùng)"
            ),
            detail={
                "run_id": run_id,
                "new_atoms_added": new_atoms,
                "duplicates_skipped": dup_skipped,
                "errors_count": len(errors),
            },
        )

        return {
            "run_id": run_id,
            "status": status,
            "sources_queried": len(jobs),
            "new_atoms_added": new_atoms,
            "duplicates_skipped": dup_skipped,
            "departments_updated": sorted(touched_depts),
            "errors": errors,
        }

    def ingest_custom_url(self, url: str, dept_id: str, importance: int = 8, custom_note: str = "") -> dict[str, Any]:
        """Deep URL Reader: Chairman or Agent feeds any live article/doc URL directly into a specialist brain."""
        dept = self.db.get_department_detail(dept_id)
        if not dept:
            raise KeyError(f"Không tìm thấy phòng ban '{dept_id}'.")

        html_body = self._http_get_text(url)
        extracted = extract_webpage_wisdom(html_body, url)
        insight = custom_note.strip() or synthesize_actionable_insight(
            "deep_url", extracted["title"], extracted["summary"], "chairman-curated"
        )
        added, atom_id = self.db.store_knowledge_atom(
            source_connector="deep_url",
            dept_id=dept["dept_id"],
            division_code=dept["division_code"],
            title=extracted["title"],
            url=url,
            summary_vi=extracted["summary"],
            actionable_insight=insight,
            published_at=extracted["published_at"],
            importance=importance,
            tags="deep-url curated",
            emit_event=True,
        )
        self.write_department_digest_markdown(dept["dept_id"])
        return {
            "added": added,
            "atom_id": atom_id,
            "dept_id": dept["dept_id"],
            "title": extracted["title"],
            "summary": extracted["summary"],
            "actionable_insight": insight,
        }

    def write_department_digest_markdown(self, dept_id: str) -> Path:
        """Persist human- & agent-readable daily digest markdown file in knowledge_vault/<dept_id>/."""
        dept = self.db.get_department_detail(dept_id)
        if not dept:
            raise KeyError(dept_id)
        folder = self.vault_dir / f"{dept['dept_id']}-{dept['code']}"
        folder.mkdir(parents=True, exist_ok=True)
        digest_file = folder / "latest_digest.md"

        articles = dept.get("learned_articles", [])[:20]
        lines = [
            f"# SỔ TRI THỨC CẬP NHẬT HÀNG NGÀY — PHÒNG {dept['dept_id']}: {dept['title_vi']}",
            f"- **Cập nhật lần cuối:** `{utc_now_iso()}`",
            f"- **Tổng số tài liệu/bài báo đã nạp:** `{dept['articles_learned']}`\n",
            "---\n",
        ]
        for idx, art in enumerate(articles, 1):
            lines.append(f"### {idx}. [{art['title']}]({art['url']})")
            lines.append(f"- **Nguồn:** `{art['source_connector']}` | **Độ quan trọng:** `{art['importance']}/10` | **Thu thập:** `{art['fetched_at']}`")
            lines.append(f"- **Tóm tắt cốt lõi:** {art['summary_vi']}")
            lines.append(f"- **Ứng dụng thực chiến:** {art['actionable_insight']}\n")

        digest_file.write_text("\n".join(lines), encoding="utf-8")
        return digest_file
