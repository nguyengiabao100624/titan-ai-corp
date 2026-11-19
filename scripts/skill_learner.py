#!/usr/bin/env python3
"""Dong co thu thap, phan bo va hoc ky nang ma nguon mo GitHub cho 51 phong ban Titan AI Corp."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sqlite3
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SCRIPTS_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPTS_DIR.parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

try:
    from titan_db import CANONICAL_DEPT_TITLES_VI, DIVISIONS_SEED, TitanDatabase, utc_now_iso
except ImportError:
    from scripts.titan_db import CANONICAL_DEPT_TITLES_VI, DIVISIONS_SEED, TitanDatabase, utc_now_iso  # type: ignore

DEFAULT_CATALOG_PATH = ROOT_DIR / "corporate_hq" / "intel_sources" / "github_skills_catalog.json"
SKILLS_LIBRARY_DIR = ROOT_DIR / "corporate_hq" / "skills_library"
VAULT_DIR = ROOT_DIR / "corporate_hq" / "knowledge_vault"

USER_AGENT = "TitanAICorp-SkillLearner/8.0 (+https://github.com/titan-ai-corp)"

REQUIRED_CATALOG_KEYS = (
    "skill_id",
    "skill_slug",
    "title_vi",
    "repo_name",
    "source_url",
    "division_code",
    "dept_ids",
    "category_vi",
    "summary_vi",
    "local_path",
)

FALLBACK_INSTALLED_SKILLS_SQL = """
CREATE TABLE IF NOT EXISTS installed_skills (
    skill_id TEXT PRIMARY KEY,
    skill_slug TEXT NOT NULL,
    title_vi TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    source_url TEXT NOT NULL DEFAULT '',
    division_code TEXT NOT NULL DEFAULT 'div1-strategy-intel',
    dept_ids_json TEXT NOT NULL DEFAULT '[]',
    category_vi TEXT NOT NULL DEFAULT 'Chuyên môn',
    summary_vi TEXT NOT NULL DEFAULT '',
    local_path TEXT NOT NULL DEFAULT '',
    installed_at TEXT NOT NULL
);
"""

UNSAFE_CONTENT_PATTERNS = re.compile(
    "|".join(
        [
            r"curl\s+[^\n]*\|\s*(ba)?sh",
            r"wget\s+[^\n]*\|\s*(ba)?sh",
            r"rm\s+-rf\s+/(?:\s|$)",
            r"Invoke-Expression|iex\s*\(",
            r"base64\s+-d\s*\|",
            r"powershell\s+-enc",
        ]
    ),
    re.IGNORECASE,
)

GITHUB_REPO_URL_RE = re.compile(
    r"^https://github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)(?:/.*)?$"
)

DIVISION_DEFAULT_DEPTS: dict[str, list[str]] = {
    "exec-board": ["00"],
    "div1-strategy-intel": ["01", "02", "03", "04", "05"],
    "div2-product-design": ["06", "07", "08", "09", "10", "11"],
    "div3-engineering-ai": ["12", "13", "14", "15", "16", "17", "18", "19"],
    "div4-qa-cybersecurity": ["20", "21", "22", "23", "24"],
    "div5-media-youtube-studio": ["25", "26", "27", "28", "29", "30", "31"],
    "div6-sales-commercial": ["32", "33", "34", "35", "36"],
    "div7-finance-tax-legal": ["37", "38", "39", "40", "41"],
    "div8-data-ops-hr": ["42", "43", "44", "45"],
    "div9-critique-ux-lab": ["46", "47", "48", "49", "50"],
}

DOMAIN_ROUTING_RULES: list[tuple[tuple[str, ...], str, list[str], str]] = [
    (
        ("pricing", "finance", "accounting", "tax", "invoice", "xlsx", "excel", "ledger", "revenue", "budget", "profit"),
        "div7-finance-tax-legal",
        ["38", "37", "39"],
        "Tài chính và Định giá",
    ),
    (
        ("legal", "contract", "policy", "compliance", "privacy", "gdpr", "license", "pdf"),
        "div7-finance-tax-legal",
        ["40", "41", "24"],
        "Pháp chế và Tuân thủ",
    ),
    (
        ("seo", "copywriting", "content", "youtube", "video", "thumbnail", "social", "ads", "cro", "funnel", "marketing"),
        "div5-media-youtube-studio",
        ["30", "26", "31", "25"],
        "Truyền thông và Tăng trưởng",
    ),
    (
        ("sales", "cold email", "outbound", "onboarding", "churn", "retention", "referral", "affiliate", "revops", "lead"),
        "div6-sales-commercial",
        ["32", "33", "35", "36"],
        "Kinh doanh và Chăm sóc",
    ),
    (
        ("design", "ui", "ux", "token", "brand", "css", "tailwind", "figma", "component", "a11y", "accessibility", "theme"),
        "div2-product-design",
        ["08", "07", "10", "13"],
        "Thiết kế Giao diện",
    ),
    (
        ("test", "qa", "playwright", "security", "pentest", "audit", "verify", "verification", "review", "guardrail", "redteam"),
        "div4-qa-cybersecurity",
        ["20", "21", "22", "23"],
        "Kiểm định và An ninh",
    ),
    (
        ("mcp", "agent", "llm", "prompt", "ai", "claude", "rag", "python", "typescript", "architecture", "debug", "tdd", "database", "api", "backend", "frontend", "mobile", "devops"),
        "div3-engineering-ai",
        ["12", "15", "16", "13"],
        "Kỹ thuật và Trí tuệ nhân tạo",
    ),
    (
        ("analytics", "dashboard", "data", "bi", "automation", "workflow", "hr", "training", "comms", "knowledge"),
        "div8-data-ops-hr",
        ["42", "43", "44", "45"],
        "Dữ liệu và Vận hành",
    ),
    (
        ("critique", "grill", "challenge", "friction", "opportunity", "persona", "devil"),
        "div9-critique-ux-lab",
        ["46", "47", "48", "49", "50"],
        "Phản biện và Trải nghiệm",
    ),
    (
        ("market", "competitor", "research", "psychology", "offer", "strategy", "plan", "brainstorm"),
        "div1-strategy-intel",
        ["01", "02", "03", "05"],
        "Chiến lược và Thị trường",
    ),
]


def sanitize_clean_text(text: str) -> str:
    """Loai bo emoji, bieu tuong trang tri va gach ngang dai de giu du lieu sach 100% chuan XIAS."""
    if not text:
        return ""
    cleaned = text.replace("\u2014", " - ").replace("\u2013", " - ")
    cleaned = cleaned.replace("\u2605", "").replace("\u25b2", "").replace("\ufe0f", "").replace("\u200d", "")
    out_chars: list[str] = []
    for ch in cleaned:
        cp = ord(ch)
        if (0x1F300 <= cp <= 0x1FAFF) or (0x2600 <= cp <= 0x27BF):
            continue
        out_chars.append(ch)
    return re.sub(r"[ \t]+", " ", "".join(out_chars)).strip()


def normalize_dept_id(raw: str | None) -> str | None:
    if raw is None:
        return None
    val = str(raw).strip()
    if not val or val.lower() == "all":
        return None
    if val.isdigit():
        return val.zfill(2)
    return val


def slugify_skill_name(raw: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", (raw or "").strip().lower()).strip("-")
    return base[:64] or f"skill-{uuid.uuid4().hex[:8]}"


def is_markdown_safe(content: str) -> bool:
    if not content or len(content) > 400_000:
        return False
    return UNSAFE_CONTENT_PATTERNS.search(content) is None


def parse_skill_markdown(md_text: str, fallback_name: str = "") -> dict[str, str]:
    """Trich xuat ten, mo ta va y chinh tu file SKILL.md hoac README.md."""
    name = fallback_name
    desc = ""
    body = md_text or ""

    if body.startswith("---"):
        parts = body.split("---", 2)
        if len(parts) == 3:
            fm = parts[1]
            body = parts[2]
            m_name = re.search(r"(?m)^name:\s*(.+)$", fm)
            if m_name:
                name = m_name.group(1).strip().strip("\"'")
            m_desc = re.search(r"(?m)^description:\s*(.+)$", fm)
            if m_desc:
                raw_d = m_desc.group(1).strip().strip("\"'")
                if raw_d not in (">", "|", "|-", ">-"):
                    desc = raw_d
                else:
                    # Doc doan mo ta nhieu dong tiep theo
                    lines = fm.splitlines()
                    for idx, ln in enumerate(lines):
                        if ln.strip().startswith("description:"):
                            collected: list[str] = []
                            for sub in lines[idx + 1 : idx + 8]:
                                if sub.startswith(" ") or sub.startswith("\t"):
                                    collected.append(sub.strip())
                                else:
                                    break
                            desc = " ".join(collected).strip()
                            break

    heading = ""
    m_h1 = re.search(r"(?m)^#\s+(.+)$", body)
    if m_h1:
        heading = sanitize_clean_text(m_h1.group(1))

    if not desc:
        paragraphs: list[str] = []
        for ln in body.splitlines():
            s = ln.strip()
            if not s or s.startswith("#") or s.startswith("```") or s.startswith("|") or s.startswith("!["):
                continue
            cleaned_ln = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
            cleaned_ln = re.sub(r"[`*_]", "", cleaned_ln).strip()
            if len(cleaned_ln) >= 25:
                paragraphs.append(cleaned_ln)
            if len(paragraphs) >= 3:
                break
        desc = " ".join(paragraphs)

    return {
        "name": sanitize_clean_text(name or fallback_name or "ky-nang-moi"),
        "heading": heading,
        "description": sanitize_clean_text(desc)[:420],
    }


def infer_domain_routing(text: str, explicit_dept: str | None = None, explicit_div: str | None = None) -> tuple[str, list[str], str]:
    """Xac dinh khoi, danh sach phong ban va nhom chuyen mon phu hop tu noi dung ky nang."""
    lower = (text or "").lower()
    inferred_div = explicit_div or "div3-engineering-ai"
    inferred_depts: list[str] = []
    inferred_cat = "Kỹ năng Chuyên môn"

    for keywords, div_code, depts, cat_vi in DOMAIN_ROUTING_RULES:
        if any(kw in lower for kw in keywords):
            if not explicit_div:
                inferred_div = div_code
            inferred_depts = list(depts)
            inferred_cat = cat_vi
            break

    if explicit_dept:
        if explicit_dept not in inferred_depts:
            inferred_depts = [explicit_dept] + inferred_depts[:2]
        else:
            inferred_depts = [explicit_dept] + [d for d in inferred_depts if d != explicit_dept][:2]
        if not explicit_div:
            for d_code, d_list in DIVISION_DEFAULT_DEPTS.items():
                if explicit_dept in d_list:
                    inferred_div = d_code
                    break
    elif explicit_div and explicit_div in DIVISION_DEFAULT_DEPTS:
        div_depts = DIVISION_DEFAULT_DEPTS[explicit_div]
        matched_in_div = [d for d in inferred_depts if d in div_depts]
        inferred_depts = matched_in_div or div_depts[:3]
    elif not inferred_depts:
        inferred_depts = DIVISION_DEFAULT_DEPTS.get(inferred_div, ["01", "16"])[:3]

    return inferred_div, inferred_depts, inferred_cat


def build_vietnamese_skill_summary(repo_name: str, parsed: dict[str, str], category_vi: str) -> tuple[str, str]:
    """Tao tieu de va tom tat tieng Viet ro rang, sach chuan XIAS cho ky nang moi tai tu GitHub."""
    raw_label = parsed.get("heading") or parsed.get("name") or repo_name
    raw_label = re.sub(r"^(?:Skill|Kỹ năng)\s*:\s*", "", raw_label, flags=re.IGNORECASE).strip()
    title_vi = sanitize_clean_text(f"Kỹ năng {category_vi}: {raw_label}")[:140]
    raw_desc = sanitize_clean_text(parsed.get("description") or "")
    if raw_desc:
        summary_vi = (
            f"Tài liệu kỹ năng thực chiến từ kho mã nguồn mở {repo_name} thuộc nhóm {category_vi}. "
            f"Nội dung cốt lõi: {raw_desc[:320]}"
        )
    else:
        summary_vi = (
            f"Tài liệu hướng dẫn quy trình và chuẩn thực thi từ kho mã nguồn mở {repo_name}, "
            f"đã được kiểm duyệt an toàn và nạp vào kho kỹ năng nhóm {category_vi}."
        )
    return title_vi, sanitize_clean_text(summary_vi)[:480]


def parse_github_repo_url(repo_url: str) -> tuple[str, str] | None:
    cleaned = (repo_url or "").strip().rstrip("/")
    m = GITHUB_REPO_URL_RE.match(cleaned)
    if not m:
        return None
    owner = m.group(1)
    repo = m.group(2)
    if repo.endswith(".git"):
        repo = repo[:-4]
    if not owner or not repo or ".." in owner or ".." in repo:
        return None
    return owner, repo


class SkillAcquisitionEngine:
    """Dong co quan ly, dong bo va thu thap ky nang ma nguon mo GitHub cho 51 phong ban Titan AI Corp."""

    def __init__(
        self,
        db: TitanDatabase | None = None,
        catalog_path: Path = DEFAULT_CATALOG_PATH,
        skills_library_dir: Path = SKILLS_LIBRARY_DIR,
        vault_dir: Path = VAULT_DIR,
        http_timeout: float = 10.0,
    ) -> None:
        self.db = db if db is not None else TitanDatabase()
        self.catalog_path = Path(catalog_path)
        self.skills_library_dir = Path(skills_library_dir)
        self.vault_dir = Path(vault_dir)
        self.http_timeout = float(http_timeout)
        self.skills_library_dir.mkdir(parents=True, exist_ok=True)
        self.vault_dir.mkdir(parents=True, exist_ok=True)
        self._ensure_installed_skills_table(self.db)

    def _ensure_installed_skills_table(self, target_db: Any) -> None:
        """Dam bao bang installed_skills ton tai ngay ca khi titan_db.py chua chay migration v8."""
        try:
            with target_db.immediate_tx() as conn:
                conn.execute(FALLBACK_INSTALLED_SKILLS_SQL)
        except Exception:
            if hasattr(target_db, "_get_conn"):
                conn = target_db._get_conn()
                conn.execute(FALLBACK_INSTALLED_SKILLS_SQL)
                conn.commit()

    def _github_headers(self, accept: str = "application/vnd.github+json") -> dict[str, str]:
        headers = {
            "User-Agent": USER_AGENT,
            "Accept": accept,
            "X-GitHub-Api-Version": "2022-11-28",
        }
        token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN") or ""
        if token.strip():
            headers["Authorization"] = f"Bearer {token.strip()}"
        return headers

    def _http_get_text(self, url: str, accept: str = "*/*", max_bytes: int = 350_000) -> str:
        req = urllib.request.Request(url, headers=self._github_headers(accept=accept), method="GET")
        with urllib.request.urlopen(req, timeout=self.http_timeout) as resp:
            raw = resp.read(max_bytes)
            charset = resp.headers.get_content_charset() or "utf-8"
            return raw.decode(charset, errors="replace")

    def _http_get_json(self, url: str) -> Any:
        text = self._http_get_text(url, accept="application/vnd.github+json", max_bytes=1_500_000)
        return json.loads(text)

    def _upsert_skill(self, target_db: Any, item: dict[str, Any]) -> dict[str, Any]:
        self._ensure_installed_skills_table(target_db)
        dept_ids = [
            d for d in (normalize_dept_id(x) for x in (item.get("dept_ids") or [])) if d
        ]
        if hasattr(target_db, "upsert_installed_skill"):
            return target_db.upsert_installed_skill(
                skill_id=item["skill_id"],
                skill_slug=item["skill_slug"],
                title_vi=sanitize_clean_text(item["title_vi"]),
                repo_name=sanitize_clean_text(item["repo_name"]),
                source_url=item.get("source_url", ""),
                division_code=item.get("division_code", "div1-strategy-intel"),
                dept_ids=dept_ids,
                category_vi=sanitize_clean_text(item.get("category_vi", "Chuyên môn")),
                summary_vi=sanitize_clean_text(item.get("summary_vi", "")),
                local_path=item.get("local_path", ""),
            )

        now = utc_now_iso()
        dept_json = json.dumps(dept_ids, ensure_ascii=False)
        with target_db.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO installed_skills(
                    skill_id, skill_slug, title_vi, repo_name, source_url,
                    division_code, dept_ids_json, category_vi, summary_vi, local_path, installed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(skill_id) DO UPDATE SET
                    skill_slug = excluded.skill_slug,
                    title_vi = excluded.title_vi,
                    repo_name = excluded.repo_name,
                    source_url = excluded.source_url,
                    division_code = excluded.division_code,
                    dept_ids_json = excluded.dept_ids_json,
                    category_vi = excluded.category_vi,
                    summary_vi = excluded.summary_vi,
                    local_path = excluded.local_path,
                    installed_at = excluded.installed_at
                """,
                (
                    item["skill_id"],
                    item["skill_slug"],
                    sanitize_clean_text(item["title_vi"]),
                    sanitize_clean_text(item["repo_name"]),
                    item.get("source_url", ""),
                    item.get("division_code", "div1-strategy-intel"),
                    dept_json,
                    sanitize_clean_text(item.get("category_vi", "Chuyên môn")),
                    sanitize_clean_text(item.get("summary_vi", "")),
                    item.get("local_path", ""),
                    now,
                ),
            )
        out = dict(item)
        out["dept_ids"] = dept_ids
        out["dept_ids_json"] = dept_json
        out["installed_at"] = now
        return out

    def _list_skills_from_db(
        self,
        target_db: Any,
        dept_id: str | None = None,
        division_code: str | None = None,
        query: str = "",
    ) -> list[dict[str, Any]]:
        self._ensure_installed_skills_table(target_db)
        if hasattr(target_db, "list_installed_skills"):
            return target_db.list_installed_skills(
                dept_id=dept_id,
                division_code=division_code,
                query=query,
            )
        conn = target_db._get_conn()
        rows = conn.execute(
            "SELECT * FROM installed_skills ORDER BY installed_at DESC, skill_slug ASC"
        ).fetchall()
        norm_d = normalize_dept_id(dept_id)
        q_low = (query or "").strip().lower()
        results: list[dict[str, Any]] = []
        for r in rows:
            rec = dict(r)
            try:
                parsed_depts = json.loads(rec.get("dept_ids_json") or "[]")
                rec["dept_ids"] = [str(x) for x in parsed_depts] if isinstance(parsed_depts, list) else []
            except Exception:
                rec["dept_ids"] = []
            if division_code and division_code != "all" and rec.get("division_code") != division_code:
                continue
            if norm_d and norm_d not in rec["dept_ids"]:
                continue
            if q_low:
                hay = " ".join(
                    [
                        rec.get("skill_slug", ""),
                        rec.get("title_vi", ""),
                        rec.get("repo_name", ""),
                        rec.get("category_vi", ""),
                        rec.get("summary_vi", ""),
                    ]
                ).lower()
                if q_low not in hay:
                    continue
            results.append(rec)
        return results

    def _existing_skill_ids(self, target_db: Any) -> set[str]:
        return {s["skill_id"] for s in self._list_skills_from_db(target_db)}

    def _get_dept_code_map(self, target_db: Any) -> dict[str, dict[str, str]]:
        mapping: dict[str, dict[str, str]] = {}
        try:
            for d in target_db.list_departments():
                mapping[d["dept_id"]] = {
                    "code": d["code"],
                    "title_vi": d["title_vi"],
                    "division_code": d["division_code"],
                }
        except Exception:
            pass
        if not mapping and self.vault_dir.exists():
            for folder in sorted(self.vault_dir.iterdir()):
                if folder.is_dir() and "-" in folder.name:
                    did, code = folder.name.split("-", 1)
                    mapping[did] = {
                        "code": code,
                        "title_vi": CANONICAL_DEPT_TITLES_VI.get(did, f"Phòng {did}"),
                        "division_code": "div1-strategy-intel",
                    }
        return mapping

    def load_catalog(self) -> list[dict[str, Any]]:
        """Doc danh muc ky nang tu corporate_hq/intel_sources/github_skills_catalog.json."""
        if not self.catalog_path.is_file():
            return []
        raw = json.loads(self.catalog_path.read_text(encoding="utf-8"))
        entries = raw.get("skills", []) if isinstance(raw, dict) else (raw if isinstance(raw, list) else [])
        normalized: list[dict[str, Any]] = []
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            slug = str(entry.get("skill_slug") or "").strip()
            sid = str(entry.get("skill_id") or (f"skl-{slug}" if slug else "")).strip()
            if not sid or not slug:
                continue
            dept_ids = [
                d for d in (normalize_dept_id(x) for x in (entry.get("dept_ids") or [])) if d
            ]
            normalized.append(
                {
                    "skill_id": sid,
                    "skill_slug": slug,
                    "title_vi": sanitize_clean_text(str(entry.get("title_vi") or slug)),
                    "repo_name": sanitize_clean_text(str(entry.get("repo_name") or "github/community")),
                    "source_url": str(entry.get("source_url") or "").strip(),
                    "division_code": str(entry.get("division_code") or "div1-strategy-intel").strip(),
                    "dept_ids": dept_ids,
                    "category_vi": sanitize_clean_text(str(entry.get("category_vi") or "Chuyên môn")),
                    "summary_vi": sanitize_clean_text(str(entry.get("summary_vi") or "")),
                    "local_path": str(entry.get("local_path") or f"corporate_hq/skills_library/{slug}/SKILL.md").replace("\\", "/"),
                }
            )
        return normalized

    def write_department_skills_markdown(self, dept_id: str, target_db: Any = None) -> Path | None:
        """Ghi file learned_skills.md vao corporate_hq/knowledge_vault/<dept_id>-<code>/."""
        db = target_db or self.db
        norm_d = normalize_dept_id(dept_id)
        if not norm_d:
            return None
        dept_map = self._get_dept_code_map(db)
        info = dept_map.get(norm_d)
        if not info:
            return None

        skills = self._list_skills_from_db(db, dept_id=norm_d)
        folder = self.vault_dir / f"{norm_d}-{info['code']}"
        folder.mkdir(parents=True, exist_ok=True)
        out_file = folder / "learned_skills.md"

        title_vi = sanitize_clean_text(info.get("title_vi") or CANONICAL_DEPT_TITLES_VI.get(norm_d, f"Phòng {norm_d}"))
        lines = [
            f"# KHO KỸ NĂNG THỰC CHIẾN CỦA PHÒNG {norm_d}: {title_vi}",
            f"- **Cập nhật lần cuối:** `{utc_now_iso()}`",
            f"- **Tổng số kỹ năng đã nạp:** `{len(skills)}`",
            "",
            "---",
            "",
        ]
        if not skills:
            lines.append("Chưa có kỹ năng nào được gán riêng cho phòng ban này.")
        else:
            for idx, skl in enumerate(skills, start=1):
                stitle = sanitize_clean_text(skl.get("title_vi") or skl.get("skill_slug") or "")
                srepo = sanitize_clean_text(skl.get("repo_name") or "")
                scat = sanitize_clean_text(skl.get("category_vi") or "Chuyên môn")
                ssum = sanitize_clean_text(skl.get("summary_vi") or "")
                surl = skl.get("source_url") or ""
                spath = skl.get("local_path") or ""
                lines.append(f"## {idx}. {stitle}")
                lines.append(f"- **Mã kỹ năng:** `{skl.get('skill_slug', '')}` | **Nhóm chuyên môn:** {scat}")
                lines.append(f"- **Kho nguồn mở:** `{srepo}` | **Liên kết gốc:** {surl}")
                lines.append(f"- **Tài liệu nội bộ:** `{spath}`")
                lines.append(f"- **Tóm tắt ứng dụng:** {ssum}")
                lines.append("")

        out_file.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
        return out_file

    def sync_catalog_to_db(self, db: Any = None) -> dict[str, Any]:
        """Dong bo toan bo danh muc ky nang vao DB va ghi learned_skills.md cho cac phong ban."""
        target_db = db or self.db
        self._ensure_installed_skills_table(target_db)
        catalog = self.load_catalog()

        synced = 0
        touched_depts: set[str] = set()
        for item in catalog:
            self._upsert_skill(target_db, item)
            synced += 1
            for did in item.get("dept_ids", []):
                touched_depts.add(did)

        depts_written = 0
        for did in sorted(touched_depts):
            if self.write_department_skills_markdown(did, target_db=target_db) is not None:
                depts_written += 1

        summary_vi = (
            f"Đã đồng bộ {synced}/{len(catalog)} kỹ năng mã nguồn mở từ 5 kho GitHub "
            f"và cập nhật sổ kỹ năng cho {depts_written} phòng ban."
        )
        return {
            "ok": True,
            "synced": synced,
            "total": len(catalog),
            "departments_updated": depts_written,
            "summary_vi": summary_vi,
        }

    def _store_skill_knowledge_atom(
        self,
        target_db: Any,
        skill: dict[str, Any],
        target_depts: list[str],
    ) -> tuple[int, int]:
        added_cnt = 0
        dup_cnt = 0
        if not hasattr(target_db, "store_knowledge_atom"):
            return 0, 0
        dept_map = self._get_dept_code_map(target_db)
        for did in target_depts:
            div_code = dept_map.get(did, {}).get("division_code") or skill.get("division_code", "div1-strategy-intel")
            url = skill.get("source_url") or f"https://github.com/{skill.get('repo_name', 'titan-ai-corp')}#{skill['skill_slug']}"
            insight = (
                f"Áp dụng quy chuẩn từ kỹ năng {skill['skill_slug']} ({skill['repo_name']}) "
                f"tại {skill['local_path']} vào quy trình tác nghiệp của Phòng {did}."
            )
            try:
                added, _ = target_db.store_knowledge_atom(
                    source_connector="github_skill",
                    dept_id=did,
                    division_code=div_code,
                    title=sanitize_clean_text(f"[Kỹ năng GitHub] {skill['title_vi']}")[:210],
                    url=url,
                    summary_vi=sanitize_clean_text(skill["summary_vi"]),
                    actionable_insight=sanitize_clean_text(insight),
                    published_at=utc_now_iso(),
                    importance=8,
                    tags=f"github-skill {skill['skill_slug']} {skill['repo_name']}",
                    emit_event=False,
                )
                if added:
                    added_cnt += 1
                else:
                    dup_cnt += 1
            except Exception:
                dup_cnt += 1
        return added_cnt, dup_cnt

    def _discover_skill_paths_in_github_repo(self, owner: str, repo: str, limit: int = 8) -> tuple[str, list[str]]:
        """Quet cac file SKILL.md trong repo GitHub qua Trees API (du phong Contents API)."""
        default_branch = "HEAD"
        try:
            repo_meta = self._http_get_json(f"https://api.github.com/repos/{owner}/{repo}")
            if isinstance(repo_meta, dict) and repo_meta.get("default_branch"):
                default_branch = str(repo_meta["default_branch"])
        except Exception:
            default_branch = "HEAD"

        skill_paths: list[str] = []
        try:
            tree = self._http_get_json(
                f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
            )
            for node in (tree.get("tree") or []):
                if node.get("type") != "blob":
                    continue
                p = str(node.get("path") or "")
                if p == "SKILL.md" or p.endswith("/SKILL.md"):
                    if "template/SKILL.md" in p:
                        continue
                    skill_paths.append(p)
        except Exception:
            # Du phong quet thu muc goc va thu muc skills/ qua Contents API
            for sub in ("", "skills"):
                endpoint = f"https://api.github.com/repos/{owner}/{repo}/contents/{sub}".rstrip("/")
                try:
                    entries = self._http_get_json(endpoint)
                    if not isinstance(entries, list):
                        continue
                    for ent in entries:
                        ename = str(ent.get("name") or "")
                        epath = str(ent.get("path") or "")
                        etype = str(ent.get("type") or "")
                        if etype == "file" and ename == "SKILL.md":
                            skill_paths.append(epath)
                        elif etype == "dir" and sub == "skills" and len(skill_paths) < limit:
                            try:
                                sub_entries = self._http_get_json(
                                    f"https://api.github.com/repos/{owner}/{repo}/contents/{epath}"
                                )
                                if isinstance(sub_entries, list):
                                    for se in sub_entries:
                                        if se.get("type") == "file" and se.get("name") == "SKILL.md":
                                            skill_paths.append(str(se.get("path") or ""))
                            except Exception:
                                continue
                except Exception:
                    continue

        if not skill_paths:
            # Neu repo khong co file SKILL.md chuan thi lay README.md lam tai lieu tong quan
            skill_paths = ["README.md"]

        return default_branch, skill_paths[:limit]

    def _acquire_from_repo_url(
        self,
        repo_url: str,
        norm_dept: str | None,
        norm_div: str | None,
        existing_ids: set[str],
    ) -> tuple[list[dict[str, Any]], int, int, int, int, int, set[str], list[str]]:
        parsed_repo = parse_github_repo_url(repo_url)
        if not parsed_repo:
            return (
                [],
                0,
                0,
                1,
                0,
                0,
                set(),
                ["Đường dẫn GitHub không hợp lệ. Vui lòng nhập đúng dạng https://github.com/chu-so-huu/ten-kho."],
            )
        owner, repo = parsed_repo
        repo_name = f"{owner}/{repo}"
        default_branch, paths = self._discover_skill_paths_in_github_repo(owner, repo, limit=8)

        acquired = 0
        updated = 0
        skipped = 0
        new_atoms = 0
        dup_atoms = 0
        touched_depts: set[str] = set()
        results: list[dict[str, Any]] = []
        errors: list[str] = []

        for rel_path in paths:
            raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/{rel_path}"
            try:
                md_text = self._http_get_text(raw_url, accept="text/plain, text/markdown, */*", max_bytes=250_000)
            except Exception as exc:
                skipped += 1
                errors.append(f"Không tải được {rel_path} từ {repo_name}: {exc}")
                continue

            if not is_markdown_safe(md_text):
                skipped += 1
                errors.append(f"Bỏ qua {rel_path} từ {repo_name} do không vượt qua kiểm tra an toàn nội dung.")
                continue

            parent_slug = Path(rel_path).parent.name if "/" in rel_path else repo
            parsed_md = parse_skill_markdown(md_text, fallback_name=parent_slug or repo)
            raw_slug = f"gh-{repo}-{parent_slug}" if parent_slug and parent_slug != repo else f"gh-{owner}-{repo}"
            skill_slug = slugify_skill_name(raw_slug)
            skill_id = f"skl-{skill_slug}"

            routing_hint = f"{repo_name} {rel_path} {parsed_md['name']} {parsed_md['heading']} {parsed_md['description']}"
            div_code, dept_ids, cat_vi = infer_domain_routing(
                routing_hint, explicit_dept=norm_dept, explicit_div=norm_div
            )
            title_vi, summary_vi = build_vietnamese_skill_summary(repo_name, parsed_md, cat_vi)

            dest_dir = self.skills_library_dir / skill_slug
            dest_dir.mkdir(parents=True, exist_ok=True)
            (dest_dir / "SKILL.md").write_text(md_text, encoding="utf-8")
            rel_local = f"corporate_hq/skills_library/{skill_slug}/SKILL.md"
            src_blob_url = f"https://github.com/{owner}/{repo}/blob/{default_branch}/{rel_path}"

            item = {
                "skill_id": skill_id,
                "skill_slug": skill_slug,
                "title_vi": title_vi,
                "repo_name": repo_name,
                "source_url": src_blob_url,
                "division_code": div_code,
                "dept_ids": dept_ids,
                "category_vi": cat_vi,
                "summary_vi": summary_vi,
                "local_path": rel_local,
            }
            saved = self._upsert_skill(self.db, item)
            if skill_id in existing_ids:
                updated += 1
            else:
                acquired += 1
                existing_ids.add(skill_id)

            atom_depts = [norm_dept] if norm_dept else dept_ids[:2]
            a_add, a_dup = self._store_skill_knowledge_atom(self.db, item, atom_depts)
            new_atoms += a_add
            dup_atoms += a_dup
            touched_depts.update(dept_ids)
            results.append(saved)

        return results, acquired, updated, skipped, new_atoms, dup_atoms, touched_depts, errors

    def _search_github_skills_by_query(
        self,
        query: str,
        norm_dept: str | None,
        norm_div: str | None,
        existing_ids: set[str],
    ) -> tuple[list[dict[str, Any]], int, int, int, int, int, set[str], list[str]]:
        q_encoded = urllib.parse.quote_plus(f"{query} agent skill")
        api_url = f"https://api.github.com/search/repositories?q={q_encoded}&sort=stars&per_page=5"

        acquired = 0
        updated = 0
        skipped = 0
        new_atoms = 0
        dup_atoms = 0
        touched_depts: set[str] = set()
        results: list[dict[str, Any]] = []
        errors: list[str] = []

        try:
            payload = self._http_get_json(api_url)
            repos = (payload.get("items") or [])[:5] if isinstance(payload, dict) else []
        except Exception as exc:
            errors.append(f"Tìm kiếm trực tuyến trên GitHub tạm gián đoạn: {exc}")
            return results, acquired, updated, skipped, new_atoms, dup_atoms, touched_depts, errors

        for repo_obj in repos:
            full_name = str(repo_obj.get("full_name") or "").strip()
            html_url = str(repo_obj.get("html_url") or "").strip()
            default_branch = str(repo_obj.get("default_branch") or "main").strip()
            repo_desc = sanitize_clean_text(str(repo_obj.get("description") or ""))
            stars = int(repo_obj.get("stargazers_count") or 0)
            if not full_name or "/" not in full_name:
                skipped += 1
                continue

            owner, repo = full_name.split("/", 1)
            md_text = ""
            fetched_file = "README.md"
            for candidate in ("SKILL.md", "README.md", "readme.md"):
                raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/{candidate}"
                try:
                    content = self._http_get_text(raw_url, accept="text/plain, text/markdown, */*", max_bytes=160_000)
                    if content and is_markdown_safe(content):
                        md_text = content
                        fetched_file = candidate
                        break
                except Exception:
                    continue

            if not md_text:
                md_text = (
                    f"# {full_name}\n\n"
                    f"- Nguồn: {html_url}\n"
                    f"- Mức độ phổ biến: {stars} lượt đánh dấu sao trên GitHub\n\n"
                    f"{repo_desc or 'Kho kỹ năng mã nguồn mở hỗ trợ tự động hóa và tác tử AI.'}\n"
                )

            parsed_md = parse_skill_markdown(md_text, fallback_name=repo)
            if repo_desc and not parsed_md.get("description"):
                parsed_md["description"] = repo_desc

            skill_slug = slugify_skill_name(f"gh-{owner}-{repo}")
            skill_id = f"skl-{skill_slug}"
            routing_hint = f"{query} {full_name} {repo_desc} {parsed_md['description']}"
            div_code, dept_ids, cat_vi = infer_domain_routing(
                routing_hint, explicit_dept=norm_dept, explicit_div=norm_div
            )
            title_vi, summary_vi = build_vietnamese_skill_summary(full_name, parsed_md, cat_vi)
            if stars > 0:
                summary_vi = sanitize_clean_text(f"{summary_vi} (Nguồn GitHub có {stars} lượt đánh dấu sao).")[:480]

            dest_dir = self.skills_library_dir / skill_slug
            dest_dir.mkdir(parents=True, exist_ok=True)
            (dest_dir / "SKILL.md").write_text(md_text, encoding="utf-8")
            rel_local = f"corporate_hq/skills_library/{skill_slug}/SKILL.md"
            src_url = f"https://github.com/{full_name}/blob/{default_branch}/{fetched_file}" if html_url else ""

            item = {
                "skill_id": skill_id,
                "skill_slug": skill_slug,
                "title_vi": title_vi,
                "repo_name": full_name,
                "source_url": src_url or html_url,
                "division_code": div_code,
                "dept_ids": dept_ids,
                "category_vi": cat_vi,
                "summary_vi": summary_vi,
                "local_path": rel_local,
            }
            saved = self._upsert_skill(self.db, item)
            if skill_id in existing_ids:
                updated += 1
            else:
                acquired += 1
                existing_ids.add(skill_id)

            atom_depts = [norm_dept] if norm_dept else dept_ids[:2]
            a_add, a_dup = self._store_skill_knowledge_atom(self.db, item, atom_depts)
            new_atoms += a_add
            dup_atoms += a_dup
            touched_depts.update(dept_ids)
            results.append(saved)

        return results, acquired, updated, skipped, new_atoms, dup_atoms, touched_depts, errors

    def acquire_skills(
        self,
        dept_id: str | None = None,
        division_code: str | None = None,
        query: str = "",
        repo_url: str = "",
    ) -> dict[str, Any]:
        """Thu thap va nap ky nang cho phong ban/khoi theo 3 che do: repo_url, query, hoac danh muc chuan."""
        self._ensure_installed_skills_table(self.db)
        norm_dept = normalize_dept_id(dept_id)
        norm_div = (division_code or "").strip()
        if not norm_div or norm_div.lower() == "all":
            norm_div = None
        clean_query = sanitize_clean_text(query or "")
        clean_repo_url = (repo_url or "").strip()

        dept_map = self._get_dept_code_map(self.db)
        if norm_dept and not norm_div and norm_dept in dept_map:
            norm_div = dept_map[norm_dept].get("division_code")

        scope_label = norm_dept or norm_div or ("repo" if clean_repo_url else ("query" if clean_query else "all"))
        scope = f"skills:{scope_label}"
        run_id = f"skill-{uuid.uuid4().hex[:10]}"
        started_at = utc_now_iso()

        try:
            with self.db.immediate_tx() as conn:
                conn.execute(
                    """
                    INSERT INTO learning_runs(run_id, triggered_by, scope, sources_queried, status, started_at)
                    VALUES (?, 'SKILL_ENGINE', ?, 0, 'RUNNING', ?)
                    """,
                    (run_id, scope, started_at),
                )
        except Exception:
            pass

        existing_ids = self._existing_skill_ids(self.db)
        processed: list[dict[str, Any]] = []
        seen_result_ids: set[str] = set()
        acquired_count = 0
        updated_count = 0
        skipped_count = 0
        new_atoms = 0
        dup_atoms = 0
        sources_queried = 0
        touched_depts: set[str] = set()
        errors: list[str] = []

        # Che do (a): Quet truc tiep tu repo GitHub URL
        if clean_repo_url:
            sources_queried += 1
            r_items, r_acq, r_upd, r_skip, r_add, r_dup, r_depts, r_errs = self._acquire_from_repo_url(
                clean_repo_url, norm_dept, norm_div, existing_ids
            )
            acquired_count += r_acq
            updated_count += r_upd
            skipped_count += r_skip
            new_atoms += r_add
            dup_atoms += r_dup
            touched_depts.update(r_depts)
            errors.extend(r_errs)
            for it in r_items:
                if it["skill_id"] not in seen_result_ids:
                    processed.append(it)
                    seen_result_ids.add(it["skill_id"])

        # Che do (b): Tim trong danh muc chuan va tim them tren GitHub Search API theo tu khoa
        elif clean_query:
            catalog = self.load_catalog()
            sources_queried += 1
            tokens = [t for t in re.split(r"\s+", clean_query.lower()) if len(t) >= 2]
            for entry in catalog:
                hay = " ".join(
                    [
                        entry["skill_slug"],
                        entry["title_vi"],
                        entry["repo_name"],
                        entry["category_vi"],
                        entry["summary_vi"],
                        entry["division_code"],
                    ]
                ).lower()
                if tokens and not any(tok in hay for tok in tokens):
                    continue
                if norm_dept and norm_dept not in entry["dept_ids"]:
                    # Gan bo sung phong ban duoc yeu cau neu trung tu khoa
                    entry = dict(entry)
                    entry["dept_ids"] = [norm_dept] + [d for d in entry["dept_ids"] if d != norm_dept]
                saved = self._upsert_skill(self.db, entry)
                if entry["skill_id"] in existing_ids:
                    updated_count += 1
                else:
                    acquired_count += 1
                    existing_ids.add(entry["skill_id"])
                atom_depts = [norm_dept] if norm_dept else entry["dept_ids"][:2]
                a_add, a_dup = self._store_skill_knowledge_atom(self.db, entry, atom_depts)
                new_atoms += a_add
                dup_atoms += a_dup
                touched_depts.update(entry["dept_ids"])
                if saved["skill_id"] not in seen_result_ids:
                    processed.append(saved)
                    seen_result_ids.add(saved["skill_id"])

            sources_queried += 1
            g_items, g_acq, g_upd, g_skip, g_add, g_dup, g_depts, g_errs = self._search_github_skills_by_query(
                clean_query, norm_dept, norm_div, existing_ids
            )
            acquired_count += g_acq
            updated_count += g_upd
            skipped_count += g_skip
            new_atoms += g_add
            dup_atoms += g_dup
            touched_depts.update(g_depts)
            errors.extend(g_errs)
            for it in g_items:
                if it["skill_id"] not in seen_result_ids:
                    processed.append(it)
                    seen_result_ids.add(it["skill_id"])

        # Che do (c): Nap tu danh muc chuan cho phong ban, khoi hoac toan tap doan
        else:
            catalog = self.load_catalog()
            sources_queried = len(catalog)
            div_dept_set = set(DIVISION_DEFAULT_DEPTS.get(norm_div or "", []))

            for entry in catalog:
                entry_depts = entry.get("dept_ids") or []
                if norm_dept:
                    if norm_dept not in entry_depts:
                        continue
                    atom_depts = [norm_dept]
                elif norm_div:
                    if entry.get("division_code") != norm_div and not (set(entry_depts) & div_dept_set):
                        continue
                    matched_div_depts = [d for d in entry_depts if d in div_dept_set]
                    atom_depts = matched_div_depts[:2] or entry_depts[:2]
                else:
                    atom_depts = entry_depts[:2]

                saved = self._upsert_skill(self.db, entry)
                if entry["skill_id"] in existing_ids:
                    updated_count += 1
                else:
                    acquired_count += 1
                    existing_ids.add(entry["skill_id"])

                a_add, a_dup = self._store_skill_knowledge_atom(self.db, entry, atom_depts)
                new_atoms += a_add
                dup_atoms += a_dup
                touched_depts.update(atom_depts if norm_dept else entry_depts)
                if saved["skill_id"] not in seen_result_ids:
                    processed.append(saved)
                    seen_result_ids.add(saved["skill_id"])

        for did in sorted(touched_depts):
            self.write_department_skills_markdown(did, target_db=self.db)

        finished_at = utc_now_iso()
        ok_flag = True if (processed or not clean_repo_url) else False
        status = "COMPLETED" if ok_flag and not errors else ("COMPLETED" if processed else "PARTIAL_ERROR")
        err_text = "\n".join(errors[:10])

        try:
            with self.db.immediate_tx() as conn:
                conn.execute(
                    """
                    UPDATE learning_runs
                    SET sources_queried = ?,
                        new_atoms_added = ?,
                        duplicates_skipped = ?,
                        status = ?,
                        finished_at = ?,
                        error_log = ?
                    WHERE run_id = ?
                    """,
                    (sources_queried, new_atoms, dup_atoms, status, finished_at, err_text, run_id),
                )
        except Exception:
            pass

        if clean_repo_url:
            target_label = f"kho {clean_repo_url}"
        elif clean_query:
            target_label = f"từ khóa '{clean_query}'"
        elif norm_dept:
            target_label = f"Phòng {norm_dept}"
        elif norm_div:
            target_label = f"Khối {norm_div}"
        else:
            target_label = "toàn bộ 51 phòng ban"

        summary_vi = sanitize_clean_text(
            f"Đã nạp kỹ năng cho {target_label}: thêm mới {acquired_count} kỹ năng, "
            f"cập nhật {updated_count} kỹ năng, bỏ qua {skipped_count} mục, "
            f"ghi mới {new_atoms} tri thức ứng dụng cho {len(touched_depts)} phòng ban."
        )
        if errors and not processed:
            summary_vi = sanitize_clean_text(f"Không thể nạp kỹ năng cho {target_label}: {errors[0]}")

        try:
            if hasattr(self.db, "log_event"):
                self.db.log_event(
                    actor_dept_id=norm_dept or "44",
                    event_type="SKILLS_ACQUIRED",
                    headline_vi=summary_vi[:220],
                    detail={
                        "run_id": run_id,
                        "scope": scope,
                        "acquired_count": acquired_count,
                        "updated_count": updated_count,
                        "skipped_count": skipped_count,
                        "new_atoms_added": new_atoms,
                        "departments_updated": sorted(touched_depts),
                    },
                )
        except Exception:
            pass

        return {
            "ok": ok_flag,
            "run_id": run_id,
            "scope": scope,
            "acquired_count": acquired_count,
            "updated_count": updated_count,
            "skipped_count": skipped_count,
            "new_atoms_added": new_atoms,
            "departments_updated": sorted(touched_depts),
            "skills": processed,
            "errors": errors,
            "summary_vi": summary_vi,
        }


def run_self_check() -> int:
    """Tu kiem chung cu phap, danh muc 10 khoi / 51 phong ban, chong emoji/em-dash va thu nghiem DB tam."""
    errors: list[str] = []

    if not DEFAULT_CATALOG_PATH.is_file():
        print(f"[LOI] Khong tim thay file danh muc: {DEFAULT_CATALOG_PATH}")
        return 1

    raw_catalog_text = DEFAULT_CATALOG_PATH.read_text(encoding="utf-8")
    if "\u2014" in raw_catalog_text or "\u2013" in raw_catalog_text:
        errors.append("Phat hien ky tu gach ngang dai (em-dash hoac en-dash) trong github_skills_catalog.json.")
    for ch in raw_catalog_text:
        cp = ord(ch)
        if (0x1F300 <= cp <= 0x1FAFF) or (0x2600 <= cp <= 0x27BF):
            errors.append(f"Phat hien ky tu emoji/pictograph U+{cp:04X} trong github_skills_catalog.json.")
            break

    self_src_text = Path(__file__).read_text(encoding="utf-8")
    if "\u2014" in self_src_text or "\u2013" in self_src_text:
        errors.append("Phat hien ky tu gach ngang dai trong scripts/skill_learner.py.")

    raw_json = json.loads(raw_catalog_text)
    entries = raw_json.get("skills", []) if isinstance(raw_json, dict) else raw_json
    if not isinstance(entries, list) or len(entries) < 35:
        errors.append(f"So luong ky nang trong catalog qua it: {len(entries) if isinstance(entries, list) else 0} (yeu cau toi thieu 35).")

    expected_divs = {d[0] for d in DIVISIONS_SEED}
    found_divs: set[str] = set()
    expected_depts = {f"{i:02d}" for i in range(51)}
    found_depts: set[str] = set()
    missing_files: list[str] = []

    for idx, entry in enumerate(entries):
        for key in REQUIRED_CATALOG_KEYS:
            if key not in entry:
                errors.append(f"Muc thu {idx} thieu truong bat buoc '{key}'.")
        found_divs.add(str(entry.get("division_code") or ""))
        for did in entry.get("dept_ids") or []:
            found_depts.add(str(did))
        lp = ROOT_DIR / str(entry.get("local_path") or "")
        if not lp.is_file():
            missing_files.append(str(entry.get("local_path") or ""))

    if found_divs != expected_divs:
        errors.append(f"Chua phu du 10 khoi: thieu {sorted(expected_divs - found_divs)}")
    if found_depts != expected_depts:
        errors.append(f"Chua phu du 51 phong ban: thieu {sorted(expected_depts - found_depts)}")
    if missing_files:
        errors.append(f"Thieu {len(missing_files)} tep SKILL.md trong skills_library: {missing_files[:5]}")

    # Thu nghiem dong bo & nap ky nang tren DB tam va thu muc vault tam
    with tempfile.TemporaryDirectory(prefix="titan_skill_check_") as tmp_dir:
        tmp_path = Path(tmp_dir)
        tmp_db = TitanDatabase(db_path=tmp_path / "test_skills.db")
        tmp_vault = tmp_path / "vault"
        engine = SkillAcquisitionEngine(db=tmp_db, vault_dir=tmp_vault)

        loaded = engine.load_catalog()
        if len(loaded) != len(entries):
            errors.append(f"load_catalog() tra ve {len(loaded)} thay vi {len(entries)}.")

        sync_res = engine.sync_catalog_to_db()
        if not sync_res.get("ok") or sync_res.get("synced") != len(entries):
            errors.append(f"sync_catalog_to_db() khong hop le: {sync_res}")
        if sync_res.get("departments_updated") != 51:
            errors.append(f"sync_catalog_to_db() chi cap nhat {sync_res.get('departments_updated')}/51 phong ban.")

        # Kiem tra cac file learned_skills.md vua tao sach chuan
        vault_files = list(tmp_vault.rglob("learned_skills.md"))
        if len(vault_files) != 51:
            errors.append(f"So tep learned_skills.md tao ra la {len(vault_files)}, yeu cau 51.")
        for vf in vault_files[:5]:
            vt = vf.read_text(encoding="utf-8")
            if "\u2014" in vt or "\u2013" in vt:
                errors.append(f"Phat hien gach ngang dai trong {vf.name}")

        acq_dept = engine.acquire_skills(dept_id="08")
        if not acq_dept.get("ok") or not acq_dept.get("skills"):
            errors.append(f"acquire_skills(dept_id='08') that bai: {acq_dept}")

        acq_div = engine.acquire_skills(division_code="div7-finance-tax-legal")
        if not acq_div.get("ok") or not acq_div.get("skills"):
            errors.append(f"acquire_skills(division_code='div7-finance-tax-legal') that bai: {acq_div}")

        # Kiem tra bao ve URL khong hop le
        bad_repo = engine.acquire_skills(repo_url="http://localhost:8080/evil/repo")
        if bad_repo.get("ok") is not False:
            errors.append("acquire_skills() phai tu choi repo_url khong phai GitHub HTTPS.")

        if hasattr(tmp_db, "close_thread_conn"):
            tmp_db.close_thread_conn()

    if errors:
        print("[THAT BAI] Phat hien loi trong qua trinh kiem chung:")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("[DAT] Kiem chung scripts/skill_learner.py va github_skills_catalog.json thanh cong 100%:")
    print(f"  - Tong so ky nang trong danh muc: {len(entries)}")
    print(f"  - Do phu Khoi: {len(found_divs)}/10 Khoi")
    print(f"  - Do phu Phong ban: {len(found_depts)}/51 Phong ban (00 den 50)")
    print(f"  - Tep SKILL.md hop le trong skills_library: {len(entries)}/{len(entries)}")
    print("  - Kiem tra sach chuan (0 emoji, 0 em-dash, 0 en-dash): DAT")
    print("  - Kiem thu sync_catalog_to_db(), acquire_skills() va bao ve repo_url tren DB tam: DAT")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Dong co hoc va quan ly ky nang GitHub cho Titan AI Corp v8.0")
    parser.add_argument("--check", action="store_true", help="Tu kiem chung danh muc, cu phap va mo phong nap DB tam")
    parser.add_argument("--sync", action="store_true", help="Dong bo toan bo danh muc ky nang vao DB chinh va kho tri thuc 51 phong ban")
    parser.add_argument("--acquire", action="store_true", help="Chay thu thap ky nang theo phong ban, khoi, tu khoa hoac repo URL")
    parser.add_argument("--dept", default=None, help="Ma phong ban (vi du: 08)")
    parser.add_argument("--division", default=None, help="Ma khoi (vi du: div5-media-youtube-studio)")
    parser.add_argument("--query", default="", help="Tu khoa tim kiem ky nang")
    parser.add_argument("--repo-url", default="", help="Lien ket kho GitHub (https://github.com/owner/repo)")
    args = parser.parse_args()

    if args.check:
        return run_self_check()

    db = TitanDatabase()
    try:
        engine = SkillAcquisitionEngine(db=db)
        if args.sync:
            res = engine.sync_catalog_to_db()
            print(json.dumps(res, ensure_ascii=False, indent=2))
            return 0 if res.get("ok") else 1
        if args.acquire:
            res = engine.acquire_skills(
                dept_id=args.dept,
                division_code=args.division,
                query=args.query,
                repo_url=args.repo_url,
            )
            print(json.dumps(res, ensure_ascii=False, indent=2))
            return 0 if res.get("ok") else 1
        parser.print_help()
        return 0
    finally:
        if hasattr(db, "close_thread_conn"):
            db.close_thread_conn()


if __name__ == "__main__":
    raise SystemExit(main())
