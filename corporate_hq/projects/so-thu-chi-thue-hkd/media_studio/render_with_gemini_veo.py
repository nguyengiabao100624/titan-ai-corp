#!/usr/bin/env python3
"""Google Flow / Gemini Veo 3.1 Render Bridge for project: so-thu-chi-thue-hkd.

Product: Két Thuế Shop - Sổ thu chi & Cảnh báo ngưỡng thuế HKD/TMĐT

Usage:
  1. Inspect all campaigns and scenes in google_flow_pack.json:
     python render_with_gemini_veo.py --list

  2. Export copy-paste prompt sheet for Google Flow web studio (https://labs.google/fx/tools/flow):
     python render_with_gemini_veo.py --export-flow-prompts

  3. Render real video clips via Google Gemini API (Veo 3.1):
     pip install google-genai
     set GEMINI_API_KEY=your_api_key_here
     python render_with_gemini_veo.py --render --campaign <campaign_id> --scene 1
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

PACK_PATH = Path(__file__).resolve().parent / "google_flow_pack.json"
DEFAULT_MODEL = "veo-3.1-generate-preview"


def load_pack() -> dict[str, Any]:
    if not PACK_PATH.is_file():
        raise FileNotFoundError(f"Missing pack file: {PACK_PATH}")
    return json.loads(PACK_PATH.read_text(encoding="utf-8"))


def cmd_list(pack: dict[str, Any]) -> int:
    print(f"Project: {pack.get('project_title_vi')} ({pack.get('project_slug')})")
    campaigns = pack.get("campaigns") or []
    print(f"Total campaigns: {len(campaigns)}")
    for camp in campaigns:
        scenes = camp.get("google_flow_scenes") or []
        print(
            f"- {camp.get('campaign_id')} | {camp.get('platform')} | "
            f"{camp.get('aspect_ratio')} | {len(scenes)} scenes | {camp.get('title')}"
        )
    return 0


def cmd_export_prompts(pack: dict[str, Any], campaign_id: str | None = None) -> int:
    campaigns = pack.get("campaigns") or []
    if campaign_id:
        campaigns = [c for c in campaigns if c.get("campaign_id") == campaign_id]
    if not campaigns:
        print("No matching campaign found.")
        return 1
    for camp in campaigns:
        print("=" * 72)
        print(f"CAMPAIGN: {camp.get('campaign_id')} | {camp.get('platform')} ({camp.get('aspect_ratio')})")
        print(f"TITLE: {camp.get('title')}")
        print(f"HOOK 3S: {camp.get('hook_3s_vi')}")
        print(f"THUMBNAIL PROMPT: {camp.get('thumbnail_prompt_flow')}")
        print("-" * 72)
        for sc in camp.get("google_flow_scenes") or []:
            print(
                f"[Scene {sc.get('scene_no')} | {sc.get('duration_sec')}s | {sc.get('shot_type')}]"
            )
            print(f"Google Flow Prompt: {sc.get('visual_prompt_flow')}")
            print(f"Voiceover VI: {sc.get('voiceover_vi')}")
            print(f"On-Screen Text: {sc.get('on_screen_text_vi')}")
            print(f"SFX/Music: {sc.get('sfx_music_vi')}")
            print()
    return 0


def cmd_render(
    pack: dict[str, Any],
    campaign_id: str,
    scene_no: int | None,
    model_name: str,
    out_dir: Path,
    dry_run: bool,
) -> int:
    campaigns = [c for c in (pack.get("campaigns") or []) if c.get("campaign_id") == campaign_id]
    if not campaigns:
        print(f"Campaign not found: {campaign_id}")
        return 1
    camp = campaigns[0]
    aspect = str(camp.get("aspect_ratio") or "9:16")
    scenes = camp.get("google_flow_scenes") or []
    if scene_no is not None:
        scenes = [s for s in scenes if int(s.get("scene_no") or 0) == scene_no]
    if not scenes:
        print(f"No matching scenes for campaign {campaign_id}")
        return 1

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if dry_run or not api_key:
        print("[DRY-RUN] GEMINI_API_KEY not set or --dry-run requested.")
        print("Option A (Web UI): Open https://labs.google/fx/tools/flow and paste the prompts below.")
        print("Option B (API): pip install google-genai && set GEMINI_API_KEY=<key> && rerun without --dry-run.")
        for sc in scenes:
            print(
                f"  -> Scene {sc.get('scene_no')} ({aspect}, {sc.get('duration_sec')}s): "
                f"{sc.get('visual_prompt_flow')}"
            )
        return 0

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("Missing package google-genai. Install via: pip install google-genai")
        return 1

    out_dir.mkdir(parents=True, exist_ok=True)
    client = genai.Client(api_key=api_key)
    for sc in scenes:
        sno = int(sc.get("scene_no") or 1)
        prompt = str(sc.get("visual_prompt_flow") or "").strip()
        print(f"Submitting Veo job: {campaign_id} scene {sno} ({aspect}) using {model_name}...")
        op = client.models.generate_videos(
            model=model_name,
            prompt=prompt,
            config=types.GenerateVideosConfig(
                aspect_ratio=aspect,
                number_of_videos=1,
            ),
        )
        while not op.done:
            time.sleep(10)
            op = client.operations.get(op)
        result_videos = getattr(op.response, "generated_videos", None) or []
        if not result_videos:
            print(f"No video returned for scene {sno}.")
            continue
        video_obj = result_videos[0].video
        client.files.download(file=video_obj)
        out_file = out_dir / f"{campaign_id}_scene_{sno:02d}.mp4"
        video_obj.save(str(out_file))
        print(f"Saved: {out_file}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Google Flow / Veo 3.1 Render Helper")
    parser.add_argument("--list", action="store_true", help="List campaigns in google_flow_pack.json")
    parser.add_argument("--export-flow-prompts", action="store_true", help="Print ready-to-paste Google Flow prompts")
    parser.add_argument("--render", action="store_true", help="Render scene(s) via Gemini API Veo 3.1")
    parser.add_argument("--campaign", default="", help="Campaign ID to export or render")
    parser.add_argument("--scene", type=int, default=None, help="Specific scene number to render")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Veo model name")
    parser.add_argument("--out", default="./renders", help="Output directory for rendered MP4 files")
    parser.add_argument("--dry-run", action="store_true", help="Preview payloads without calling remote API")
    args = parser.parse_args()

    pack = load_pack()
    if args.export_flow_prompts:
        return cmd_export_prompts(pack, campaign_id=args.campaign or None)
    if args.render:
        if not args.campaign:
            print("Please specify --campaign <campaign_id>.")
            return 1
        return cmd_render(
            pack=pack,
            campaign_id=args.campaign,
            scene_no=args.scene,
            model_name=args.model,
            out_dir=Path(args.out),
            dry_run=args.dry_run,
        )
    return cmd_list(pack)


if __name__ == "__main__":
    raise SystemExit(main())
