import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
CLI_PATH = ROOT_DIR / "scripts" / "titan_cli.py"

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
    "div9-critique-ux-lab",
]


class TestTitanAICorpArchitecture(unittest.TestCase):
    def test_root_constitution_pwa_and_cloud_workflows_exist(self) -> None:
        required_files = [
            ROOT_DIR / "AGENTS.md",
            ROOT_DIR / "README.md",
            ROOT_DIR / "Dockerfile",
            ROOT_DIR / "render.yaml",
            ROOT_DIR / "scripts" / "web_ui" / "index.html",
            ROOT_DIR / "scripts" / "web_ui" / "styles.css",
            ROOT_DIR / "scripts" / "web_ui" / "app.js",
            ROOT_DIR / "scripts" / "web_ui" / "manifest.webmanifest",
            ROOT_DIR / "scripts" / "web_ui" / "sw.js",
            ROOT_DIR / ".github" / "workflows" / "deploy_command_center.yml",
            ROOT_DIR / ".github" / "workflows" / "autonomous_learning_cron.yml",
            ROOT_DIR / ".github" / "workflows" / "ci_quality_and_stress_gate.yml",
        ]
        for fpath in required_files:
            self.assertTrue(fpath.is_file(), f"Missing required system file: {fpath}")

        self.assertGreater(len((ROOT_DIR / "AGENTS.md").read_text(encoding="utf-8")), 1500)
        self.assertGreater(len((ROOT_DIR / "README.md").read_text(encoding="utf-8")), 1200)

    def test_all_nine_skill_packages_have_valid_frontmatter(self) -> None:
        skills_root = ROOT_DIR / ".agents" / "skills"
        for skill_dir_name in EXPECTED_DIVISIONS:
            skill_md = skills_root / skill_dir_name / "SKILL.md"
            self.assertTrue(skill_md.is_file(), f"Missing {skill_md}")
            content = skill_md.read_text(encoding="utf-8")
            self.assertTrue(content.startswith("---\n"), f"Invalid frontmatter start in {skill_md}")
            parts = content.split("---", 2)
            self.assertEqual(len(parts), 3, f"Missing closing frontmatter delimiter in {skill_md}")
            frontmatter = parts[1]
            self.assertIn(f"name: {skill_dir_name}", frontmatter)
            self.assertIn("description:", frontmatter)

    def test_all_54_six_layer_genius_brains_pass_sla01(self) -> None:
        skills_root = ROOT_DIR / ".agents" / "skills"
        specialist_files = sorted(skills_root.glob("div*/specialists/*.md"))
        self.assertEqual(
            len(specialist_files),
            53,
            f"Expected exactly 53 specialist handbooks, found {len(specialist_files)}",
        )

        ceo_text = (skills_root / "titan-ceo-orchestrator" / "SKILL.md").read_text(encoding="utf-8")
        for layer_idx in range(1, 7):
            self.assertIn(f"tầng {layer_idx}", ceo_text.lower(), f"CEO brain missing Tầng {layer_idx}")

        seen_numbers = set()
        for spec_file in specialist_files:
            prefix = spec_file.stem.split("-", 1)[0]
            self.assertTrue(prefix.isdigit(), f"Invalid numeric prefix in {spec_file.name}")
            seen_numbers.add(int(prefix))

            text = spec_file.read_text(encoding="utf-8")
            self.assertGreater(len(text), 1200, f"6-Layer Genius Brain too thin: {spec_file.name}")
            self.assertNotIn("TODO:", text, f"Forbidden placeholder TODO in {spec_file.name}")
            for layer_idx in range(1, 7):
                self.assertIn(f"tầng {layer_idx}", text.lower(), f"Missing Tầng {layer_idx} in {spec_file.name}")

        self.assertEqual(seen_numbers, set(range(1, 54)))

    def test_cli_audit_and_project_scaffolding(self) -> None:
        audit_proc = subprocess.run(
            [sys.executable, str(CLI_PATH), "audit", "--json"],
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        report = json.loads(audit_proc.stdout)
        self.assertTrue(report["passed"])
        self.assertEqual(report["skill_packages_count"], 10)
        self.assertEqual(report["specialists_count"], 53)

        with tempfile.TemporaryDirectory() as tmp_dir:
            temp_db = Path(tmp_dir) / "sandbox.db"
            init_proc = subprocess.run(
                [
                    sys.executable,
                    str(CLI_PATH),
                    "--db",
                    str(temp_db),
                    "init-project",
                    "rem-cua-ai-demo",
                    "--projects-root",
                    tmp_dir,
                ],
                cwd=str(ROOT_DIR),
                capture_output=True,
                text=True,
                encoding="utf-8",
                check=True,
            )
            self.assertIn("rem-cua-ai-demo", init_proc.stdout)
            project_dir = Path(tmp_dir) / "rem-cua-ai-demo"
            self.assertTrue((project_dir / "PROJECT_BRIEF.md").is_file())
            self.assertTrue((project_dir / "01_strategy").is_dir())
            self.assertTrue((project_dir / "04_qa_security").is_dir())
            self.assertTrue((project_dir / "07_finance_legal").is_dir())

            fake_skills = Path(tmp_dir) / "skills_sandbox"
            (fake_skills / "div1-strategy-intel" / "specialists").mkdir(parents=True)
            add_proc = subprocess.run(
                [
                    sys.executable,
                    str(CLI_PATH),
                    "--db",
                    str(temp_db),
                    "add-department",
                    "--division",
                    "div1-strategy-intel",
                    "--code",
                    "real-estate-scout",
                    "--title",
                    "Chuyên gia Bất động sản",
                    "--mission",
                    "Phân tích thị trường nhà đất và pháp lý quy hoạch.",
                    "--skills-root",
                    str(fake_skills),
                ],
                cwd=str(ROOT_DIR),
                capture_output=True,
                text=True,
                encoding="utf-8",
                check=True,
            )
            self.assertIn("46-real-estate-scout.md", add_proc.stdout)
            self.assertTrue(
                (
                    fake_skills
                    / "div1-strategy-intel"
                    / "specialists"
                    / "46-real-estate-scout.md"
                ).is_file()
            )


if __name__ == "__main__":
    unittest.main()
