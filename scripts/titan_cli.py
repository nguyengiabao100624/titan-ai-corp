#!/usr/bin/env python3
"""Titan AI Corp v4.0 — Full Enterprise CLI for Agents, Swarm, Chairman & Cloud Sync."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from cloud_sync import DEFAULT_SNAPSHOT_PATH, export_snapshot, merge_snapshot_into_db, save_snapshot_file
from learning_engine import ContinualLearningEngine
from titan_db import DEFAULT_DB_PATH, ROOT_DIR, SKILLS_DIR, TitanDatabase

HQ_DIR = ROOT_DIR / "corporate_hq"

EXPECTED_DIVISIONS = [
    "titan-ceo-orchestrator",
    "div1-strategy-intel",
    "div2-product-design",
    "div3-engineering-ai",
    "div4-qa-cybersecurity",
    "div5-media-youtube-studio",
    "div6-sales-commercial",
    "div7-finance-tax-legal",
    "div8-data-ops-hr",
]

REQUIRED_6_LAYER_SECTIONS = [
    "Sứ Mệnh Cốt Lõi",
    "Khung Tư Duy",
    "Quy Trình Thực Thi Chuẩn",
    "Hợp Đồng Bàn Giao Đầu Ra",
    "Tự Học Hàng Ngày",
    "Reflexion",
]

PROJECT_SUBFOLDERS = [
    "01_strategy",
    "02_product_design",
    "03_engineering",
    "04_qa_security",
    "05_media_youtube",
    "06_sales_commercial",
    "07_finance_legal",
    "08_data_ops",
]


def _validate_frontmatter(skill_md: Path) -> list[str]:
    errors: list[str] = []
    if not skill_md.is_file():
        return [f"Missing skill file: {skill_md}"]
    content = skill_md.read_text(encoding="utf-8")
    if not content.startswith("---\n"):
        errors.append(f"{skill_md.name}: Missing opening YAML frontmatter '---'")
        return errors
    parts = content.split("---", 2)
    if len(parts) < 3:
        errors.append(f"{skill_md.name}: Missing closing YAML frontmatter '---'")
        return errors
    fm = parts[1]
    expected_name = skill_md.parent.name
    if f"name: {expected_name}" not in fm:
        errors.append(f"{skill_md}: Expected 'name: {expected_name}' in frontmatter")
    if "description:" not in fm:
        errors.append(f"{skill_md}: Missing 'description:' in frontmatter")
    return errors


def run_audit(skills_dir: Path = SKILLS_DIR) -> dict[str, Any]:
    errors: list[str] = []

    for root_doc in ("AGENTS.md", "README.md"):
        if not (ROOT_DIR / root_doc).is_file():
            errors.append(f"Missing root document: {root_doc}")

    valid_skill_packages = 0
    for div_name in EXPECTED_DIVISIONS:
        skill_md = skills_dir / div_name / "SKILL.md"
        fm_errors = _validate_frontmatter(skill_md)
        if fm_errors:
            errors.extend(fm_errors)
        else:
            valid_skill_packages += 1

    # Also verify CEO SKILL.md has 6 layers
    ceo_md = skills_dir / "titan-ceo-orchestrator" / "SKILL.md"
    if ceo_md.is_file():
        ceo_body = ceo_md.read_text(encoding="utf-8")
        for sec in REQUIRED_6_LAYER_SECTIONS:
            if sec not in ceo_body:
                errors.append(f"titan-ceo-orchestrator/SKILL.md: Missing '{sec}'")

    specialist_files = sorted(skills_dir.glob("div*/specialists/*.md"))
    seen_ids: list[int] = []
    for spec in specialist_files:
        m = re.match(r"^(\d{2,3})-([a-z0-9-]+)\.md$", spec.name)
        if not m:
            errors.append(f"Invalid specialist filename format: {spec.name}")
            continue
        dept_num = int(m.group(1))
        if dept_num in seen_ids:
            errors.append(f"Duplicate department number {dept_num:02d}: {spec.name}")
        seen_ids.append(dept_num)

        body = spec.read_text(encoding="utf-8")
        if "// TODO" in body or "# TODO" in body:
            errors.append(f"{spec.name}: Contains banned placeholder TODO")
        for section in REQUIRED_6_LAYER_SECTIONS:
            if section not in body:
                errors.append(f"{spec.name}: Missing required 6-layer section '{section}'")

    if len(specialist_files) < 45:
        errors.append(f"Expected at least 45 specialist departments, found {len(specialist_files)}")

    for hq_doc in (
        HQ_DIR / "CHARTER_AND_ROSTER.md",
        HQ_DIR / "memory" / "DECISION_LOG.md",
        HQ_DIR / "memory" / "LESSONS_LEARNED.md",
        HQ_DIR / "ledger" / "FINANCE_AND_UNIT_ECONOMICS_TEMPLATE.md",
        HQ_DIR / "intel_sources" / "feeds_registry.json",
    ):
        if not hq_doc.is_file():
            errors.append(f"Missing HQ document: {hq_doc.relative_to(ROOT_DIR)}")

    return {
        "passed": len(errors) == 0,
        "skill_packages_count": valid_skill_packages,
        "specialists_count": len(specialist_files),
        "total_positions_including_ceo": len(specialist_files) + (1 if ceo_md.is_file() else 0),
        "department_numbers": sorted(seen_ids),
        "errors": errors,
    }


def list_roster(skills_dir: Path = SKILLS_DIR) -> list[dict[str, str]]:
    roster: list[dict[str, str]] = []
    for spec in sorted(skills_dir.glob("div*/specialists/*.md")):
        first_line = spec.read_text(encoding="utf-8").splitlines()[0].lstrip("# ").strip()
        division = spec.parents[1].name
        roster.append(
            {
                "id": spec.stem.split("-", 1)[0],
                "code": spec.stem,
                "division": division,
                "title": first_line,
                "path": str(spec.relative_to(ROOT_DIR)).replace("\\", "/") if spec.is_relative_to(ROOT_DIR) else str(spec),
            }
        )
    return sorted(roster, key=lambda item: int(item["id"]))


def init_project(slug: str, projects_root: Path | None = None) -> Path:
    clean_slug = re.sub(r"[^a-z0-9-]+", "-", slug.lower()).strip("-")
    if not clean_slug:
        raise ValueError("Project slug must contain alphanumeric characters.")

    base_dir = projects_root if projects_root is not None else (HQ_DIR / "projects")
    project_dir = base_dir / clean_slug
    project_dir.mkdir(parents=True, exist_ok=True)

    for folder in PROJECT_SUBFOLDERS:
        sub = project_dir / folder
        sub.mkdir(parents=True, exist_ok=True)
        gitkeep = sub / ".gitkeep"
        if not gitkeep.exists():
            gitkeep.write_text("", encoding="utf-8")

    brief_file = project_dir / "PROJECT_BRIEF.md"
    if not brief_file.exists():
        brief_file.write_text(
            f"# HỒ SƠ DỰ ÁN: {clean_slug.upper()}\n\n"
            f"- **Ngày khởi tạo:** {date.today().isoformat()}\n"
            "- **Trạng thái Cổng Kiểm Duyệt:** Cổng 1 — Đang thẩm định Thị trường & Tài chính\n\n"
            "## Tiến Độ 5 Cổng Tập Đoàn (Quy Trình 12 Giai Đoạn)\n"
            "- [ ] Cổng 1 (GĐ 01–03): Tình báo Thị trường (`01`–`03`) & Định giá/Thuế (`38`–`39`, Margin >= 65%)\n"
            "- [ ] Cổng 2 (GĐ 04): Đặc tả Sản phẩm (`06`) & Thiết kế UX/UI (`07`–`10`) — Chờ Chủ tịch duyệt\n"
            "- [ ] Cổng 3 (GĐ 05–08): Code TDD (`12`–`18`) + Video AI (`25`–`31`) + Tòa án Kiểm định 4 Lớp (`20`–`24`, `41`)\n"
            "- [ ] Cổng 4 (GĐ 09): Triển khai Online 24/7 (`19`) & Nghiệm thu Chủ tịch\n"
            "- [ ] Cổng 5 (GĐ 10–12): Săn khách (`32`–`36`), Đối soát Sổ Kép (`37`), BI (`42`) & Đúc kết Voyager (`44`)\n",
            encoding="utf-8",
        )
    return project_dir


def add_department(
    division: str,
    code: str,
    title_vi: str,
    mission: str,
    books: list[str] | None = None,
    formula: str = "",
    feeds: str = "",
    skills_root: Path | None = None,
    db: TitanDatabase | None = None,
) -> Path:
    base_skills = skills_root if skills_root is not None else SKILLS_DIR
    div_dir = base_skills / division / "specialists"
    if not div_dir.is_dir():
        raise ValueError(f"Unknown division '{division}'. Expected one of {EXPECTED_DIVISIONS[1:]}")

    existing_nums = [
        int(m.group(1))
        for p in base_skills.glob("div*/specialists/*.md")
        if (m := re.match(r"^(\d{2,3})-", p.name))
    ]
    next_num = (max(existing_nums) + 1) if existing_nums else 46
    clean_code = re.sub(r"[^a-z0-9-]+", "-", code.lower()).strip("-")
    dept_id = f"{next_num:02d}"
    target = div_dir / f"{dept_id}-{clean_code}.md"

    book_list = books or ["Tài liệu chuẩn ngành quốc tế & Nghiên cứu thực chứng cập nhật"]
    books_md = "\n".join(f"- *{b}*" for b in book_list)
    formula_text = formula.strip() or "Đo lường định lượng hiệu quả đầu ra dựa trên dữ liệu kiểm chứng thực tế."
    feeds_text = feeds.strip() or "Google News Chuyên ngành, Báo Kinh tế Việt Nam, arXiv & GitHub Open-Source."
    deliv_name = f"{clean_code.replace('-', '_')}_deliverable.md"

    target.write_text(
        f"# PHÒNG {dept_id}: {title_vi.upper()} (`@{clean_code}`)\n\n"
        f"## 1. Tầng 1 — Sứ Mệnh Cốt Lõi & Ranh Giới Quyền Hạn (`Identity & Jurisdiction`)\n"
        f"- **Mã định danh biên chế:** Phòng `{dept_id}` (`@{clean_code}`) — Trực thuộc Khối `{division}`.\n"
        f"- **Sứ mệnh cốt lõi:** {mission}\n\n"
        f"## 2. Tầng 2 — Khung Tư Duy Kinh Điển & Công Thức Chuyên Ngành (`Canonical Models & Formulas`)\n"
        f"{books_md}\n- {formula_text}\n\n"
        f"## 3. Tầng 3 — Quy Trình Thực Thi Chuẩn Dây Chuyền (`Deterministic Step-by-Step SOP`)\n"
        f"1. Nạp ký ức Stanford: `python scripts/titan_cli.py recall --dept {dept_id} --query \"...\"`.\n"
        f"2. Khóa nhận việc nguyên tử: `python scripts/titan_cli.py task-checkout --task <id> --dept {dept_id}`.\n"
        f"3. Tra cứu thực tế trên mạng và ghi trích dẫn: `python scripts/titan_cli.py cite --task <id> --dept {dept_id} ...`.\n"
        f"4. Thi công hoàn chỉnh và nộp bàn giao qua cổng kiểm định.\n\n"
        f"## 4. Tầng 4 — Hợp Đồng Bàn Giao Đầu Ra (`{deliv_name}`)\n"
        f"- **Tài liệu / Kết quả thực thi hoàn chỉnh kèm trích dẫn nguồn thực tế và cấp độ bằng chứng 1..5.**\n\n"
        f"## 5. Tầng 5 — Dòng Chảy Tự Học Hàng Ngày (`Daily Continual Learning`)\n"
        f"- **Nguồn theo dõi hàng ngày:** {feeds_text}\n\n"
        f"## 6. Tầng 6 — Tự Phản Tư `Reflexion` & Đóng Gói `Voyager` (`Self-Evolution`)\n"
        f"- Tự động ghi nhận bài học sửa sai vào bảng `reflexions` khi có phản hồi từ QA hoặc Chủ tịch.\n",
        encoding="utf-8",
    )

    if db is not None and skills_root is None:
        db.sync_divisions_and_roster()
        db.log_event(
            actor_dept_id="45",
            event_type="DEPT_HIRED",
            headline_vi=f"Phòng Nhân sự AI (45) vừa thành lập Phòng {dept_id}: {title_vi} (@{clean_code})",
            detail={"dept_id": dept_id, "code": clean_code, "division": division},
        )
    return target


def main() -> int:
    parser = argparse.ArgumentParser(description="Titan AI Corp v4.0 Enterprise CLI")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH, help="Path to SQLite state DB")
    sub = parser.add_subparsers(dest="command", required=True)

    p_audit = sub.add_parser("audit", help="Audit all 9 divisions and 46 6-layer Genius Brains")
    p_audit.add_argument("--json", action="store_true")

    sub.add_parser("roster", help="List all active specialist departments")
    sub.add_parser("sync-roster", help="Sync markdown brains into SQLite state DB")

    p_init = sub.add_parser("init-project", help="Initialize an 8-division project folder")
    p_init.add_argument("slug")
    p_init.add_argument("--projects-root", type=Path, default=None)

    p_cproj = sub.add_parser("create-project", help="Create project in both DB and disk with starter Kanban tasks")
    p_cproj.add_argument("--slug", required=True)
    p_cproj.add_argument("--title", required=True)
    p_cproj.add_argument("--objective", default="")
    p_cproj.add_argument("--market", default="Vietnam & Global")

    p_add = sub.add_parser("add-department", help="Spawn a new 6-layer specialist department (#46+)")
    p_add.add_argument("--division", required=True)
    p_add.add_argument("--code", required=True)
    p_add.add_argument("--title", required=True)
    p_add.add_argument("--mission", required=True)
    p_add.add_argument("--skills-root", type=Path, default=None)

    p_chk = sub.add_parser("task-checkout", help="Paperclip Atomic Task Checkout")
    p_chk.add_argument("--task", required=True)
    p_chk.add_argument("--dept", required=True)

    p_cite = sub.add_parser("cite", help="Log live web citation for a task")
    p_cite.add_argument("--task", required=True)
    p_cite.add_argument("--dept", required=True)
    p_cite.add_argument("--title", required=True)
    p_cite.add_argument("--url", required=True)
    p_cite.add_argument("--finding", default="")

    p_sub = sub.add_parser("submit", help="Submit deliverable for a task")
    p_sub.add_argument("--task", required=True)
    p_sub.add_argument("--dept", required=True)
    p_sub.add_argument("--title", required=True)
    p_sub.add_argument("--file", default="")
    p_sub.add_argument("--summary", required=True)
    p_sub.add_argument("--evidence", type=int, default=2)

    p_learn = sub.add_parser("learn", help="Run live continual learning cycle across 8 connectors")
    p_learn.add_argument("--scope", default="all")

    p_url = sub.add_parser("ingest-url", help="Deep-read any URL into a specialist brain")
    p_url.add_argument("--url", required=True)
    p_url.add_argument("--dept", required=True)
    p_url.add_argument("--note", default="")

    p_rec = sub.add_parser("recall", help="Stanford 3D memory & Reflexion recall")
    p_rec.add_argument("--dept", required=True)
    p_rec.add_argument("--query", default="")

    sub.add_parser("sync-snapshot", help="Export portable snapshot to corporate_hq/cloud_state/snapshot.json")
    sub.add_parser("hydrate-snapshot", help="Hydrate SQLite DB from corporate_hq/cloud_state/snapshot.json without losing state")

    args = parser.parse_args()

    if args.command == "audit":
        report = run_audit()
        if args.json:
            print(json.dumps(report, ensure_ascii=False, indent=2))
        else:
            status_str = "PASS" if report["passed"] else "FAIL"
            print(f"[TITAN AI CORP v4.0 AUDIT] Status: {status_str}")
            print(f" - Executive Skill Packages : {report['skill_packages_count']}/9")
            print(f" - Specialist Departments   : {report['specialists_count']}")
            print(f" - Total 6-Layer Brains     : {report['total_positions_including_ceo']}")
            if report["errors"]:
                print(" - Errors:")
                for err in report["errors"]:
                    print(f"   * {err}")
        return 0 if report["passed"] else 1

    if args.command == "roster":
        roster = list_roster()
        print(f"Tổng quân số chuyên gia: {len(roster)} phòng ban (+ 00 @ceo = {len(roster)+1} vị trí)\n")
        for r in roster:
            print(f"[{r['id']}] {r['division']} -> {r['title']} ({r['path']})")
        return 0

    if args.command == "init-project":
        proj_path = init_project(args.slug, args.projects_root)
        if args.projects_root is None:
            db = TitanDatabase(db_path=args.db)
            db.create_project(slug=args.slug, title=args.slug.replace("-", " ").title())
        print(f"Initialized 8-division project workspace at: {proj_path}")
        return 0

    if args.command == "add-department":
        db_inst = TitanDatabase(db_path=args.db) if args.skills_root is None else None
        new_file = add_department(
            args.division,
            args.code,
            args.title,
            args.mission,
            skills_root=args.skills_root,
            db=db_inst,
        )
        print(f"Created new specialist department: {new_file}")
        return 0

    db = TitanDatabase(db_path=args.db)

    if args.command == "sync-roster":
        cnt = db.sync_divisions_and_roster()
        save_snapshot_file(db)
        print(f"Synced {cnt} positions into SQLite & snapshot.")
        return 0

    if args.command == "create-project":
        proj = db.create_project(slug=args.slug, title=args.title, objective=args.objective, target_market=args.market)
        save_snapshot_file(db)
        print(json.dumps(proj, ensure_ascii=False, indent=2))
        return 0

    if args.command == "task-checkout":
        res = db.checkout_task_atomic(args.task, args.dept)
        save_snapshot_file(db)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0 if res["acquired"] else 2

    if args.command == "cite":
        res = db.add_task_citation(args.task, args.dept, args.title, args.url, args.finding)
        save_snapshot_file(db)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.command == "submit":
        res = db.submit_deliverable(
            args.task, args.dept, args.title, args.summary, file_path=args.file, evidence_level=args.evidence
        )
        save_snapshot_file(db)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.command == "learn":
        engine = ContinualLearningEngine(db=db)
        res = engine.run_learning_cycle(scope=args.scope, triggered_by="CLI")
        save_snapshot_file(db)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.command == "ingest-url":
        engine = ContinualLearningEngine(db=db)
        res = engine.ingest_url if hasattr(engine, "ingest_url") else engine.ingest_custom_url
        out = res(args.url, args.dept, custom_note=args.note)
        save_snapshot_file(db)
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return 0

    if args.command == "recall":
        out = db.recall_stanford_3d(dept_id=args.dept, query=args.query)
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return 0

    if args.command == "sync-snapshot":
        p = save_snapshot_file(db)
        print(f"Saved multi-device snapshot: {p}")
        return 0

    if args.command == "hydrate-snapshot":
        from cloud_sync import DEFAULT_SNAPSHOT_PATH, merge_snapshot_into_db
        db.sync_divisions_and_roster()
        if DEFAULT_SNAPSHOT_PATH.is_file():
            snap = json.loads(DEFAULT_SNAPSHOT_PATH.read_text(encoding="utf-8"))
            stats = merge_snapshot_into_db(db, snap)
            print(f"Hydrated SQLite DB from cloud snapshot: {stats}")
        else:
            save_snapshot_file(db)
            print("Initialized fresh cloud snapshot.")
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
