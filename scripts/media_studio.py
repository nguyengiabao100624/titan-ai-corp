#!/usr/bin/env python3
"""Titan AI Corp - Division 5 Media Studio & Google Flow / Veo 3.1 Video AI Engine.

Manages the `media_campaigns` table, synthesizes production-grade Google Flow / Veo 3.1
scene storyboards, renders high-CTR vector SVG thumbnails (16:9 and 9:16), exports
`google_flow_pack.json` and `render_with_gemini_veo.py` per project, and seeds the
6 flagship campaigns for Titan AI Corp's shipped products.
"""

from __future__ import annotations

import argparse
import json
import py_compile
import re
import sqlite3
import sys
import tempfile
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape as xml_escape

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from titan_db import DEFAULT_DB_PATH, ROOT_DIR, TitanDatabase, utc_now_iso

PROJECTS_DIR = ROOT_DIR / "corporate_hq" / "projects"

VALID_PLATFORMS: tuple[str, ...] = (
    "TIKTOK",
    "YOUTUBE_SHORTS",
    "YOUTUBE_LONG",
    "FACEBOOK_REELS",
    "CROSS_PLATFORM",
)

VALID_STATUSES: tuple[str, ...] = (
    "DRAFT",
    "SCRIPTED",
    "FLOW_READY",
    "RENDERED",
    "PUBLISHED",
)

PLATFORM_ALIASES: dict[str, str] = {
    "TIKTOK": "TIKTOK",
    "TT": "TIKTOK",
    "YOUTUBE_SHORTS": "YOUTUBE_SHORTS",
    "YT_SHORTS": "YOUTUBE_SHORTS",
    "SHORTS": "YOUTUBE_SHORTS",
    "YOUTUBE_LONG": "YOUTUBE_LONG",
    "YOUTUBE": "YOUTUBE_LONG",
    "YT": "YOUTUBE_LONG",
    "YT_LONG": "YOUTUBE_LONG",
    "FACEBOOK_REELS": "FACEBOOK_REELS",
    "FB_REELS": "FACEBOOK_REELS",
    "REELS": "FACEBOOK_REELS",
    "CROSS_PLATFORM": "CROSS_PLATFORM",
    "MULTI": "CROSS_PLATFORM",
    "ALL": "CROSS_PLATFORM",
}

PLATFORM_META: dict[str, dict[str, Any]] = {
    "TIKTOK": {
        "label_vi": "TikTok 9:16",
        "badge": "TIKTOK 9:16",
        "aspect_ratio": "9:16",
        "svg_width": 720,
        "svg_height": 1280,
        "default_schedule_vi": "11:30 va 19:30 Thu 3, Thu 5, Chu Nhat",
        "default_schedule_pretty_vi": "11:30 và 19:30 Thứ 3, Thứ 5, Chủ Nhật",
    },
    "YOUTUBE_SHORTS": {
        "label_vi": "YouTube Shorts 9:16",
        "badge": "YOUTUBE SHORTS 9:16",
        "aspect_ratio": "9:16",
        "svg_width": 720,
        "svg_height": 1280,
        "default_schedule_vi": "12:00 va 20:00 Thu 2, Thu 4, Thu 6",
        "default_schedule_pretty_vi": "12:00 và 20:00 Thứ 2, Thứ 4, Thứ 6",
    },
    "YOUTUBE_LONG": {
        "label_vi": "YouTube Dài 16:9",
        "badge": "YOUTUBE 16:9",
        "aspect_ratio": "16:9",
        "svg_width": 1280,
        "svg_height": 720,
        "default_schedule_vi": "20:00 Thu 6 hang tuan",
        "default_schedule_pretty_vi": "20:00 Thứ 6 hàng tuần",
    },
    "FACEBOOK_REELS": {
        "label_vi": "Facebook Reels 9:16",
        "badge": "FACEBOOK REELS 9:16",
        "aspect_ratio": "9:16",
        "svg_width": 720,
        "svg_height": 1280,
        "default_schedule_vi": "11:45 va 20:30 Thu 3, Thu 5, Thu 7",
        "default_schedule_pretty_vi": "11:45 và 20:30 Thứ 3, Thứ 5, Thứ 7",
    },
    "CROSS_PLATFORM": {
        "label_vi": "Đa nền tảng (YTB / TikTok / Reels)",
        "badge": "ĐA NỀN TẢNG 16:9",
        "aspect_ratio": "16:9",
        "svg_width": 1280,
        "svg_height": 720,
        "default_schedule_vi": "19:30 Thu 4 va Chu Nhat (dong bo da kenh)",
        "default_schedule_pretty_vi": "19:30 Thứ 4 và Chủ Nhật (đồng bộ đa kênh)",
    },
}

STATUS_LABELS_VI: dict[str, str] = {
    "DRAFT": "Bản nháp",
    "SCRIPTED": "Đã xong kịch bản",
    "FLOW_READY": "Sẵn sàng Google Flow",
    "RENDERED": "Đã dựng Video AI",
    "PUBLISHED": "Đã đăng YTB/TikTok",
}

# Match exact rules of XIAS check_no_emoji.py (no emojis/pictographs, no em/en dashes)
EMOJI_RE = re.compile(
    "[\U0001F000-\U0001FAFF"
    "\U00002600-\U000026FF"
    "\U00002700-\U000027BF"
    "\U00002B00-\U00002BFF"
    "\U0000FE0F\U000020E3]"
)
DASH_RE = re.compile("[\u2014\u2013]")

MEDIA_CAMPAIGNS_DDL = """
CREATE TABLE IF NOT EXISTS media_campaigns (
    campaign_id TEXT PRIMARY KEY,
    project_id TEXT,
    title TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'TIKTOK',
    angle_vi TEXT NOT NULL DEFAULT '',
    hook_3s_vi TEXT NOT NULL DEFAULT '',
    script_vi TEXT NOT NULL DEFAULT '',
    google_flow_scenes_json TEXT NOT NULL DEFAULT '[]',
    thumbnail_prompt_flow TEXT NOT NULL DEFAULT '',
    thumbnail_svg_path TEXT NOT NULL DEFAULT '',
    seo_title_vi TEXT NOT NULL DEFAULT '',
    seo_description_vi TEXT NOT NULL DEFAULT '',
    hashtags TEXT NOT NULL DEFAULT '',
    cta_vi TEXT NOT NULL DEFAULT '',
    publish_schedule_vi TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'FLOW_READY',
    publish_url TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_media_campaigns_proj ON media_campaigns(project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_campaigns_platform ON media_campaigns(platform, status);
"""

REQUIRED_SCENE_KEYS: tuple[str, ...] = (
    "scene_no",
    "duration_sec",
    "shot_type",
    "visual_prompt_flow",
    "voiceover_vi",
    "sfx_music_vi",
    "on_screen_text_vi",
)

PROJECT_BRAND_PROFILES: dict[str, dict[str, Any]] = {
    "tram-ho-so-rieng-tu": {
        "project_id": "proj-tram-ho-so-rieng-tu",
        "brand_vi": "HỒ SƠ RIÊNG TƯ",
        "tagline_vi": "6 công cụ CCCD, Ảnh thẻ, PDF chạy 100% trên máy",
        "character_lock_en": (
            "A relatable 27-year-old Vietnamese tech educator wearing a crisp slate-navy crewneck shirt, "
            "natural warm skin tone, neat dark hair, seated at a clean minimalist oak desk with soft key light "
            "from a window on the left and subtle teal rim light, shot on 35mm cinema lens f/2.0."
        ),
        "lighting_palette_en": (
            "Clean modern tech editorial lighting, balanced 5200K daylight key light, deep slate navy shadows, "
            "emerald privacy verification accents, crisp focus on smartphone and laptop screens, zero visual clutter."
        ),
    },
    "so-thu-chi-thue-hkd": {
        "project_id": "proj-so-thu-chi-thue-hkd",
        "brand_vi": "KÉT THUẾ SHOP",
        "tagline_vi": "Sổ thu chi, bóc tách phí sàn và Radar ngưỡng thuế 1 tỷ / 3 tỷ",
        "character_lock_en": (
            "A grounded 32-year-old Vietnamese e-commerce shop owner and business advisor in a clean charcoal polo shirt, "
            "authentic studio-warehouse hybrid backdrop with neatly stacked parcel boxes softly blurred behind, "
            "warm tungsten practical lamp plus crisp 5000K softbox key light, shot on 35mm cinema lens f/2.0."
        ),
        "lighting_palette_en": (
            "High-contrast editorial documentary lighting, warm practical depth in background, razor-sharp focus "
            "on tablet and smartphone tax dashboard UI, emerald safe states and crimson radar alerts."
        ),
    },
}


def sanitize_clean_text(value: Any) -> str:
    """Strip disallowed emoji/pictographs and replace em/en dashes with ASCII hyphens."""
    text = str(value or "")
    text = EMOJI_RE.sub("", text)
    text = DASH_RE.sub("-", text)
    return text


def find_text_violations(text: str, label: str = "text") -> list[str]:
    """Return any emoji, pictograph, em-dash, or en-dash violations found in text."""
    hits: list[str] = []
    for lineno, line in enumerate(text.splitlines(), 1):
        for m in EMOJI_RE.finditer(line):
            hits.append(f"{label}:{lineno}: emoji/pictograph {m.group(0)!r}")
        for m in DASH_RE.finditer(line):
            hits.append(f"{label}:{lineno}: em/en-dash {m.group(0)!r}")
    return hits


def _sanitize_slug(raw: str, fallback: str = "chung-tap-doan") -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "-", str(raw or "").strip().lower()).strip("-_")
    return cleaned or fallback


def _sanitize_campaign_id(raw: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "-", str(raw or "").strip()).strip("-_")
    return cleaned or f"camp-{uuid.uuid4().hex[:8]}"


def _normalize_platform(raw: Any, default: str = "TIKTOK") -> str:
    val = str(raw or "").upper().strip()
    if not val:
        return default
    if val in PLATFORM_ALIASES:
        return PLATFORM_ALIASES[val]
    raise ValueError(
        f"Nền tảng '{raw}' không hợp lệ. Chỉ chấp nhận: {', '.join(VALID_PLATFORMS)}."
    )


def _normalize_status(raw: Any, default: str = "FLOW_READY") -> str:
    val = str(raw or "").upper().strip()
    if not val:
        return default
    if val in VALID_STATUSES:
        return val
    raise ValueError(
        f"Trạng thái '{raw}' không hợp lệ. Chỉ chấp nhận: {', '.join(VALID_STATUSES)}."
    )


def _normalize_scenes(raw_scenes: Any) -> list[dict[str, Any]]:
    """Ensure scenes list conforms cleanly to the 7-field Google Flow / Veo 3.1 contract."""
    if isinstance(raw_scenes, str):
        try:
            raw_scenes = json.loads(raw_scenes)
        except Exception:
            raw_scenes = []
    if not isinstance(raw_scenes, list):
        return []
    normalized: list[dict[str, Any]] = []
    for idx, sc in enumerate(raw_scenes, 1):
        if not isinstance(sc, dict):
            continue
        scene_no = int(sc.get("scene_no") or idx)
        duration = int(sc.get("duration_sec") or 6)
        duration = max(2, min(duration, 120))
        normalized.append(
            {
                "scene_no": scene_no,
                "duration_sec": duration,
                "shot_type": sanitize_clean_text(sc.get("shot_type") or "Medium Shot").strip(),
                "visual_prompt_flow": sanitize_clean_text(sc.get("visual_prompt_flow") or "").strip(),
                "voiceover_vi": sanitize_clean_text(sc.get("voiceover_vi") or "").strip(),
                "sfx_music_vi": sanitize_clean_text(sc.get("sfx_music_vi") or "").strip(),
                "on_screen_text_vi": sanitize_clean_text(sc.get("on_screen_text_vi") or "").strip(),
            }
        )
    return normalized


def _truncate_words(text: str, max_chars: int) -> str:
    clean = sanitize_clean_text(text).strip()
    if len(clean) <= max_chars:
        return clean
    words = clean.split()
    out = ""
    for w in words:
        cand = f"{out} {w}".strip() if out else w
        if len(cand) <= max_chars - 3:
            out = cand
        else:
            break
    return (out or clean[: max_chars - 3]).rstrip(" ,;:-") + "..."


def _wrap_lines(text: str, max_chars: int, max_lines: int = 3) -> list[str]:
    words = sanitize_clean_text(text).strip().split()
    if not words:
        return [""]
    lines: list[str] = []
    idx = 0
    while idx < len(words) and len(lines) < max_lines:
        is_last = len(lines) == max_lines - 1
        current = ""
        while idx < len(words):
            word = words[idx]
            candidate = f"{current} {word}".strip() if current else word
            limit = max_chars - 3 if (is_last and idx < len(words) - 1) else max_chars
            if len(candidate) <= limit or not current:
                current = candidate
                idx += 1
            else:
                break
        if is_last and idx < len(words):
            current = _truncate_words(current + " " + words[idx], max_chars)
        lines.append(current)
    return lines[:max_lines]


def _pick_thumbnail_theme(campaign_id: str, title: str, angle: str, slug: str) -> dict[str, str]:
    blob = f"{campaign_id} {title} {angle} {slug}".lower()
    if "6 cong cu" in blob or "6 công cụ" in blob or "ytlong-6congcu" in blob:
        return {
            "kind": "workspace_suite",
            "bg_start": "#0B1120",
            "bg_end": "#16243E",
            "accent": "#14B8A6",
            "accent_2": "#6366F1",
            "surface": "#121E34",
            "border": "#273C63",
            "metric_badge": "6 CÔNG CỤ HỒ SƠ | MIỄN PHÍ 0Đ",
            "sub_badge": "CCCD | NÉN <= 2MB | ẢNH 3X4 | KÝ PDF",
        }
    if "anh the" in blob or "ảnh thẻ" in blob or "3x4" in blob or "10x15" in blob:
        return {
            "kind": "photo_studio",
            "bg_start": "#0A1429",
            "bg_end": "#13294E",
            "accent": "#38BDF8",
            "accent_2": "#F59E0B",
            "surface": "#10203D",
            "border": "#244270",
            "metric_badge": "80.000Đ -> 3.000Đ / 8 ẢNH",
            "sub_badge": "KHÔNG LOGO BẨN | 300 DPI",
        }
    if "cccd" in blob or ("rieng-tu" in blob and ("wi-fi" in blob or "wifi" in blob or "dau chim" in blob or "dấu chìm" in blob)):
        return {
            "kind": "security_alert",
            "bg_start": "#09101E",
            "bg_end": "#10213A",
            "accent": "#10B981",
            "accent_2": "#EF4444",
            "surface": "#111C30",
            "border": "#223656",
            "metric_badge": "0 BYTE UPLOAD | TẮT WI-FI VẪN CHẠY",
            "sub_badge": "CHUẨN NGHỊ ĐỊNH 13/2023",
        }
    if "tram-ho-so" in blob:
        return {
            "kind": "workspace_suite",
            "bg_start": "#0B1120",
            "bg_end": "#16243E",
            "accent": "#14B8A6",
            "accent_2": "#6366F1",
            "surface": "#121E34",
            "border": "#273C63",
            "metric_badge": "6 CÔNG CỤ HỒ SƠ | MIỄN PHÍ 0Đ",
            "sub_badge": "CHẠY CỤC BỘ 100% TRÊN TRÌNH DUYỆT",
        }
    if "hoan" in blob or "hoàn" in blob or "141" in blob:
        return {
            "kind": "refund_emerald",
            "bg_start": "#071814",
            "bg_end": "#0F3027",
            "accent": "#10B981",
            "accent_2": "#34D399",
            "surface": "#0C241E",
            "border": "#1D5244",
            "metric_badge": "ĐÒI HOÀN +9 ĐẾN 14 TRIỆU",
            "sub_badge": "NGHỊ ĐỊNH 141/2026 | DƯỚI 1 TỶ",
        }
    if "10%" in blob or "trừ nhầm" in blob or "tru nham" in blob or "csv" in blob:
        return {
            "kind": "audit_scanner",
            "bg_start": "#0D1021",
            "bg_end": "#1B1E3B",
            "accent": "#FB923C",
            "accent_2": "#EF4444",
            "surface": "#151933",
            "border": "#303866",
            "metric_badge": "LỆCH 42,5 TRIỆU / 500TR",
            "sub_badge": "SOI FILE CSV SÀN TRONG 10 GIÂY",
        }
    return {
        "kind": "tax_radar_alert",
        "bg_start": "#10121C",
        "bg_end": "#23192D",
        "accent": "#F43F5E",
        "accent_2": "#F59E0B",
        "surface": "#191B2A",
        "border": "#3A2C47",
        "metric_badge": "VÍ 800,7TR | THUẾ 1,02 TỶ",
        "sub_badge": "NĐ 117/2025 & HẠN 30 NGÀY HĐĐT",
    }


def _build_visual_motif_svg(kind: str, x: int, y: int, w: int, h: int, accent: str, accent_2: str) -> str:
    """Render clean vector editorial graphic motif inside the focal box (zero emojis)."""
    cx = x + w // 2
    cy = y + h // 2
    if kind == "security_alert":
        return f"""
        <g>
          <rect x="{x + 28}" y="{y + 26}" width="{w - 56}" height="{h - 52}" rx="18" fill="#0B1528" stroke="{accent}" stroke-width="2" stroke-opacity="0.55"/>
          <rect x="{x + 56}" y="{y + 54}" width="{(w - 132) // 2}" height="{h - 140}" rx="12" fill="#13233E" stroke="#2D4A78" stroke-width="1.5"/>
          <circle cx="{x + 56 + (w - 132) // 4}" cy="{y + 104}" r="24" fill="{accent}" fill-opacity="0.22" stroke="{accent}" stroke-width="2"/>
          <rect x="{x + 76}" y="{y + 146}" width="{(w - 172) // 2}" height="10" rx="5" fill="#94A3B8" fill-opacity="0.65"/>
          <rect x="{x + 76}" y="{y + 168}" width="{(w - 202) // 2}" height="10" rx="5" fill="#64748B" fill-opacity="0.55"/>
          <line x1="{x + 62}" y1="{y + h - 98}" x2="{x + 48 + (w - 132) // 2}" y2="{y + 68}" stroke="{accent_2}" stroke-width="2.5" stroke-dasharray="8 6" stroke-opacity="0.8"/>
          <rect x="{x + 76 + (w - 132) // 2}" y="{y + 54}" width="{(w - 132) // 2}" height="{h - 140}" rx="12" fill="#0D2624" stroke="{accent}" stroke-width="2"/>
          <path d="M {cx + (w - 132) // 4} {y + 84} L {cx + (w - 132) // 4 + 34} {y + 98} V {y + 132} C {cx + (w - 132) // 4 + 34} {y + 160} {cx + (w - 132) // 4} {y + 178} {cx + (w - 132) // 4} {y + 178} C {cx + (w - 132) // 4} {y + 178} {cx + (w - 132) // 4 - 34} {y + 160} {cx + (w - 132) // 4 - 34} {y + 132} V {y + 98} Z" fill="{accent}" fill-opacity="0.18" stroke="{accent}" stroke-width="2.5"/>
          <path d="M {cx + (w - 132) // 4 - 13} {y + 131} L {cx + (w - 132) // 4 - 3} {y + 141} L {cx + (w - 132) // 4 + 17} {y + 119}" fill="none" stroke="{accent}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="{cx}" y="{y + h - 42}" text-anchor="middle" fill="#E2E8F0" font-size="20" font-weight="700" font-family="Inter, Segoe UI, Arial, sans-serif">CHẾ ĐỘ MÁY BAY: BẬT | DẤU CHÌM A4: ĐÃ KHÓA</text>
        </g>
        """
    if kind == "photo_studio":
        # 4x2 grid of crisp 3x4 ID photo cards inside a 10x15cm print sheet
        sheet_x = x + 44
        sheet_y = y + 36
        sheet_w = w - 88
        sheet_h = h - 98
        gap = 12
        cell_w = (sheet_w - gap * 5) // 4
        cell_h = (sheet_h - gap * 3) // 2
        cells: list[str] = []
        for row_i in range(2):
            for col_i in range(4):
                px = sheet_x + gap + col_i * (cell_w + gap)
                py = sheet_y + gap + row_i * (cell_h + gap)
                pcx = px + cell_w // 2
                cells.append(
                    f'<rect x="{px}" y="{py}" width="{cell_w}" height="{cell_h}" rx="6" fill="#0284C7" stroke="#BAE6FD" stroke-width="1.5"/>'
                    f'<circle cx="{pcx}" cy="{py + int(cell_h * 0.36)}" r="{max(10, cell_w // 5)}" fill="#F8FAFC" fill-opacity="0.92"/>'
                    f'<path d="M {px + 14} {py + cell_h - 6} C {px + 18} {py + int(cell_h * 0.62)} {px + cell_w - 18} {py + int(cell_h * 0.62)} {px + cell_w - 14} {py + cell_h - 6} Z" fill="#0F172A" fill-opacity="0.82"/>'
                )
        return f"""
        <g>
          <rect x="{sheet_x}" y="{sheet_y}" width="{sheet_w}" height="{sheet_h}" rx="14" fill="#F8FAFC" fill-opacity="0.96" stroke="{accent}" stroke-width="2.5"/>
          {''.join(cells)}
          <text x="{cx}" y="{y + h - 22}" text-anchor="middle" fill="{accent_2}" font-size="21" font-weight="800" font-family="Inter, Segoe UI, Arial, sans-serif">KHỔ IN 10X15CM (300 DPI) | 8 ẢNH 3X4 KHÔNG LOGO</text>
        </g>
        """
    if kind == "workspace_suite":
        tools = [
            ("01", "GHÉP CCCD A4", "#10B981"),
            ("02", "NÉN <= 2MB", "#38BDF8"),
            ("03", "ẢNH THẺ 3X4", "#F59E0B"),
            ("04", "KÝ TÊN PDF", "#A78BFA"),
            ("05", "GỘP PDF A4", "#2DD4BF"),
            ("06", "XÓA GPS ẨN", "#F43F5E"),
        ]
        cols = 3
        gap = 14
        card_w = (w - 64 - gap * (cols - 1)) // cols
        card_h = (h - 72 - gap) // 2
        tiles: list[str] = []
        for idx, (num, label, col) in enumerate(tools):
            r = idx // cols
            c = idx % cols
            tx = x + 32 + c * (card_w + gap)
            ty = y + 30 + r * (card_h + gap)
            tiles.append(
                f'<rect x="{tx}" y="{ty}" width="{card_w}" height="{card_h}" rx="12" fill="#0D192E" stroke="{col}" stroke-width="2" stroke-opacity="0.8"/>'
                f'<text x="{tx + 16}" y="{ty + 34}" fill="{col}" font-size="18" font-weight="800" font-family="Inter, Segoe UI, Arial, sans-serif">{num}</text>'
                f'<text x="{tx + 16}" y="{ty + card_h - 22}" fill="#F8FAFC" font-size="18" font-weight="700" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(label)}</text>'
            )
        return f"<g>{''.join(tiles)}</g>"
    if kind == "refund_emerald":
        bar_base = y + h - 68
        return f"""
        <g>
          <rect x="{x + 32}" y="{y + 28}" width="{w - 64}" height="{h - 56}" rx="18" fill="#081F1A" stroke="{accent}" stroke-width="2"/>
          <rect x="{x + 64}" y="{bar_base - 80}" width="84" height="80" rx="8" fill="#1E3A34"/>
          <rect x="{x + 176}" y="{bar_base - 125}" width="84" height="125" rx="8" fill="#145343"/>
          <rect x="{x + 288}" y="{bar_base - 172}" width="84" height="172" rx="8" fill="{accent}"/>
          <line x1="{x + 52}" y1="{bar_base}" x2="{x + w - 52}" y2="{bar_base}" stroke="#2D6A5B" stroke-width="2"/>
          <text x="{x + w - 56}" y="{y + 92}" text-anchor="end" fill="#6EE7B7" font-size="22" font-weight="700" font-family="Inter, Segoe UI, Arial, sans-serif">THUẾ SÀN ĐÃ TRÍCH</text>
          <text x="{x + w - 56}" y="{y + 144}" text-anchor="end" fill="#FFFFFF" font-size="44" font-weight="900" font-family="Inter, Segoe UI, Arial, sans-serif">+9 - 14 TR</text>
          <text x="{cx}" y="{y + h - 38}" text-anchor="middle" fill="#A7F3D0" font-size="19" font-weight="700" font-family="Inter, Segoe UI, Arial, sans-serif">LỌC ĐƠN BOM CSV | ĐỐI SOÁT HOÀN THUẾ HỢP PHÁP</text>
        </g>
        """
    if kind == "audit_scanner":
        return f"""
        <g>
          <rect x="{x + 30}" y="{y + 26}" width="{w - 60}" height="{h - 52}" rx="16" fill="#0F1329" stroke="{accent}" stroke-width="2"/>
          <rect x="{x + 52}" y="{y + 52}" width="{w - 104}" height="44" rx="8" fill="#1E2548"/>
          <text x="{x + 70}" y="{y + 80}" fill="#CBD5E1" font-size="17" font-weight="700" font-family="Inter, Segoe UI, Arial, sans-serif">MÃ ĐƠN CSV | DOANH THU | THUẾ SÀN TRỪ</text>
          <rect x="{x + 52}" y="{y + 108}" width="{w - 104}" height="52" rx="8" fill="#3B1222" stroke="{accent_2}" stroke-width="2"/>
          <text x="{x + 70}" y="{y + 140}" fill="#FCA5A5" font-size="18" font-weight="800" font-family="Inter, Segoe UI, Arial, sans-serif">SP260419006 | TRỪ NHẦM 10% (CHUẨN 1,5%)</text>
          <rect x="{x + 52}" y="{y + 172}" width="{w - 104}" height="48" rx="8" fill="#122B27" stroke="#10B981" stroke-width="1.5"/>
          <text x="{x + 70}" y="{y + 202}" fill="#6EE7B7" font-size="18" font-weight="700" font-family="Inter, Segoe UI, Arial, sans-serif">TỰ LỌC ĐƠN BOM | LƯU CỤC BỘ TRÊN MÁY</text>
        </g>
        """
    # Default: tax_radar_alert
    return f"""
    <g>
      <rect x="{x + 28}" y="{y + 24}" width="{w - 56}" height="{h - 48}" rx="18" fill="#161423" stroke="{accent}" stroke-width="2"/>
      <path d="M {cx - 140} {cy + 44} A 140 140 0 0 1 {cx + 140} {cy + 44}" fill="none" stroke="#2D2945" stroke-width="22" stroke-linecap="round"/>
      <path d="M {cx - 140} {cy + 44} A 140 140 0 0 1 {cx + 115} {cy - 34}" fill="none" stroke="{accent}" stroke-width="22" stroke-linecap="round"/>
      <line x1="{cx}" y1="{cy + 44}" x2="{cx + 96}" y2="{cy - 28}" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
      <circle cx="{cx}" cy="{cy + 44}" r="11" fill="{accent_2}"/>
      <text x="{cx}" y="{cy + 14}" text-anchor="middle" fill="#FFFFFF" font-size="38" font-weight="900" font-family="Inter, Segoe UI, Arial, sans-serif">1,02 TỶ</text>
      <text x="{cx}" y="{y + h - 38}" text-anchor="middle" fill="#FDA4AF" font-size="19" font-weight="800" font-family="Inter, Segoe UI, Arial, sans-serif">VƯỢT NGƯỠNG 1 TỶ | CẢNH BÁO HẠN 30 NGÀY HĐĐT</text>
    </g>
    """


def render_campaign_thumbnail_svg(
    campaign_id: str,
    title: str,
    platform: str,
    angle_vi: str,
    cta_vi: str,
    project_slug: str,
    project_brand_vi: str = "",
) -> str:
    """Render a crisp, high-CTR vector SVG cover tailored to 16:9 or 9:16 aspect ratio."""
    meta = PLATFORM_META.get(platform, PLATFORM_META["TIKTOK"])
    w = int(meta["svg_width"])
    h = int(meta["svg_height"])
    is_vertical = h > w
    theme = _pick_thumbnail_theme(campaign_id, title, angle_vi, project_slug)
    profile_brand = PROJECT_BRAND_PROFILES.get(project_slug, {}).get("brand_vi") or ""
    short_title = sanitize_clean_text(project_brand_vi).split(" - ")[0].strip() if project_brand_vi else ""
    brand_label = sanitize_clean_text(profile_brand or short_title or "TITAN AI STUDIO").upper()
    badge_text = sanitize_clean_text(meta["badge"])
    metric_text = sanitize_clean_text(theme["metric_badge"])
    sub_badge = sanitize_clean_text(theme["sub_badge"])
    cta_clean = _truncate_words(cta_vi or "Trải nghiệm miễn phí ngay trên trình duyệt", 52)

    if is_vertical:
        headline_lines = _wrap_lines(title.upper(), max_chars=21, max_lines=4)
        hl_font = 48 if len(headline_lines) <= 3 else 42
        hl_lh = 58 if len(headline_lines) <= 3 else 52
        hl_start_y = 216
        hl_svg = "".join(
            f'<text x="52" y="{hl_start_y + i * hl_lh}" fill="#FFFFFF" font-size="{hl_font}" '
            f'font-weight="900" font-family="Inter, Plus Jakarta Sans, Segoe UI, Arial, sans-serif">'
            f"{xml_escape(line)}</text>"
            for i, line in enumerate(headline_lines)
        )
        motif_y = hl_start_y + len(headline_lines) * hl_lh + 36
        motif_h = 320
        motif_svg = _build_visual_motif_svg(
            theme["kind"], 44, motif_y, w - 88, motif_h, theme["accent"], theme["accent_2"]
        )
        metric_y = motif_y + motif_h + 38
        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{xml_escape(sanitize_clean_text(title))}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{theme['bg_start']}"/>
      <stop offset="100%" stop-color="{theme['bg_end']}"/>
    </linearGradient>
    <pattern id="dotGrid" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#FFFFFF" fill-opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#bgGrad)"/>
  <rect width="{w}" height="{h}" fill="url(#dotGrid)"/>
  <circle cx="{w - 60}" cy="110" r="220" fill="{theme['accent']}" fill-opacity="0.11"/>
  <circle cx="80" cy="{h - 140}" r="240" fill="{theme['accent_2']}" fill-opacity="0.09"/>
  <rect x="44" y="48" width="276" height="46" rx="10" fill="{theme['accent']}" fill-opacity="0.18" stroke="{theme['accent']}" stroke-width="1.5"/>
  <text x="64" y="78" fill="{theme['accent']}" font-size="20" font-weight="800" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(badge_text)}</text>
  <rect x="{w - 270}" y="48" width="226" height="46" rx="10" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.2"/>
  <text x="{w - 157}" y="78" text-anchor="middle" fill="#F8FAFC" font-size="18" font-weight="800" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(brand_label[:18])}</text>
  <text x="52" y="148" fill="{theme['accent_2']}" font-size="21" font-weight="800" letter-spacing="1.2" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(sub_badge)}</text>
  {hl_svg}
  {motif_svg}
  <rect x="44" y="{metric_y}" width="{w - 88}" height="82" rx="14" fill="{theme['accent']}" fill-opacity="0.18" stroke="{theme['accent']}" stroke-width="2"/>
  <text x="{w // 2}" y="{metric_y + 51}" text-anchor="middle" fill="#FFFFFF" font-size="28" font-weight="900" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(metric_text)}</text>
  <rect x="44" y="{h - 178}" width="{w - 88}" height="68" rx="12" fill="#0B1220" fill-opacity="0.82" stroke="#334155" stroke-width="1.5"/>
  <text x="{w // 2}" y="{h - 136}" text-anchor="middle" fill="#E2E8F0" font-size="20" font-weight="700" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(cta_clean)}</text>
  <line x1="44" y1="{h - 82}" x2="{w - 44}" y2="{h - 82}" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.2"/>
  <text x="48" y="{h - 42}" fill="#94A3B8" font-size="17" font-weight="700" font-family="Inter, Segoe UI, Arial, sans-serif">TITAN AI CORP | STUDIO KHỐI 5</text>
  <text x="{w - 48}" y="{h - 42}" text-anchor="end" fill="{theme['accent']}" font-size="17" font-weight="800" font-family="Inter, Segoe UI, Arial, sans-serif">GOOGLE FLOW / VEO 3.1</text>
</svg>
"""
        return svg

    # Horizontal 16:9 YouTube / Cross-Platform layout (1280x720)
    headline_lines = _wrap_lines(title.upper(), max_chars=23, max_lines=3)
    hl_font = 48 if len(headline_lines) <= 3 else 42
    hl_lh = 58
    hl_start_y = 216
    hl_svg = "".join(
        f'<text x="56" y="{hl_start_y + i * hl_lh}" fill="#FFFFFF" font-size="{hl_font}" '
        f'font-weight="900" font-family="Inter, Plus Jakarta Sans, Segoe UI, Arial, sans-serif">'
        f"{xml_escape(line)}</text>"
        for i, line in enumerate(headline_lines)
    )
    motif_svg = _build_visual_motif_svg(
        theme["kind"], 676, 128, 552, 430, theme["accent"], theme["accent_2"]
    )
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{xml_escape(sanitize_clean_text(title))}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{theme['bg_start']}"/>
      <stop offset="100%" stop-color="{theme['bg_end']}"/>
    </linearGradient>
    <pattern id="dotGrid" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#FFFFFF" fill-opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#bgGrad)"/>
  <rect width="{w}" height="{h}" fill="url(#dotGrid)"/>
  <circle cx="1140" cy="110" r="240" fill="{theme['accent']}" fill-opacity="0.11"/>
  <circle cx="140" cy="640" r="210" fill="{theme['accent_2']}" fill-opacity="0.09"/>
  <rect x="56" y="48" width="236" height="44" rx="10" fill="{theme['accent']}" fill-opacity="0.18" stroke="{theme['accent']}" stroke-width="1.5"/>
  <text x="74" y="77" fill="{theme['accent']}" font-size="19" font-weight="800" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(badge_text)}</text>
  <rect x="308" y="48" width="256" height="44" rx="10" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.2"/>
  <text x="436" y="77" text-anchor="middle" fill="#F8FAFC" font-size="18" font-weight="800" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(brand_label[:20])}</text>
  <text x="56" y="148" fill="{theme['accent_2']}" font-size="20" font-weight="800" letter-spacing="1.1" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(sub_badge)}</text>
  {hl_svg}
  <rect x="56" y="424" width="584" height="72" rx="14" fill="{theme['accent']}" fill-opacity="0.18" stroke="{theme['accent']}" stroke-width="2"/>
  <text x="348" y="469" text-anchor="middle" fill="#FFFFFF" font-size="26" font-weight="900" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(metric_text)}</text>
  <rect x="56" y="516" width="584" height="58" rx="12" fill="#0B1220" fill-opacity="0.82" stroke="#334155" stroke-width="1.4"/>
  <text x="348" y="552" text-anchor="middle" fill="#E2E8F0" font-size="18" font-weight="700" font-family="Inter, Segoe UI, Arial, sans-serif">{xml_escape(cta_clean)}</text>
  {motif_svg}
  <line x1="56" y1="636" x2="{w - 56}" y2="636" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.2"/>
  <text x="56" y="676" fill="#94A3B8" font-size="17" font-weight="700" font-family="Inter, Segoe UI, Arial, sans-serif">TITAN AI CORP | STUDIO TRUYỀN THÔNG KHỐI 5 (#25 - #31)</text>
  <text x="{w - 56}" y="676" text-anchor="end" fill="{theme['accent']}" font-size="17" font-weight="800" font-family="Inter, Segoe UI, Arial, sans-serif">GOOGLE FLOW / VEO 3.1 READY</text>
</svg>
"""
    return svg


def _build_render_script_source(project_slug: str, project_title: str) -> str:
    """Generate a clean, runnable Gemini API / Google Flow Veo 3.1 render helper script."""
    clean_slug = sanitize_clean_text(project_slug)
    clean_title = sanitize_clean_text(project_title).replace('"', "'")
    return f'''#!/usr/bin/env python3
"""Google Flow / Gemini Veo 3.1 Render Bridge for project: {clean_slug}.

Product: {clean_title}

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
        raise FileNotFoundError(f"Missing pack file: {{PACK_PATH}}")
    return json.loads(PACK_PATH.read_text(encoding="utf-8"))


def cmd_list(pack: dict[str, Any]) -> int:
    print(f"Project: {{pack.get('project_title_vi')}} ({{pack.get('project_slug')}})")
    campaigns = pack.get("campaigns") or []
    print(f"Total campaigns: {{len(campaigns)}}")
    for camp in campaigns:
        scenes = camp.get("google_flow_scenes") or []
        print(
            f"- {{camp.get('campaign_id')}} | {{camp.get('platform')}} | "
            f"{{camp.get('aspect_ratio')}} | {{len(scenes)}} scenes | {{camp.get('title')}}"
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
        print(f"CAMPAIGN: {{camp.get('campaign_id')}} | {{camp.get('platform')}} ({{camp.get('aspect_ratio')}})")
        print(f"TITLE: {{camp.get('title')}}")
        print(f"HOOK 3S: {{camp.get('hook_3s_vi')}}")
        print(f"THUMBNAIL PROMPT: {{camp.get('thumbnail_prompt_flow')}}")
        print("-" * 72)
        for sc in camp.get("google_flow_scenes") or []:
            print(
                f"[Scene {{sc.get('scene_no')}} | {{sc.get('duration_sec')}}s | {{sc.get('shot_type')}}]"
            )
            print(f"Google Flow Prompt: {{sc.get('visual_prompt_flow')}}")
            print(f"Voiceover VI: {{sc.get('voiceover_vi')}}")
            print(f"On-Screen Text: {{sc.get('on_screen_text_vi')}}")
            print(f"SFX/Music: {{sc.get('sfx_music_vi')}}")
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
        print(f"Campaign not found: {{campaign_id}}")
        return 1
    camp = campaigns[0]
    aspect = str(camp.get("aspect_ratio") or "9:16")
    scenes = camp.get("google_flow_scenes") or []
    if scene_no is not None:
        scenes = [s for s in scenes if int(s.get("scene_no") or 0) == scene_no]
    if not scenes:
        print(f"No matching scenes for campaign {{campaign_id}}")
        return 1

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if dry_run or not api_key:
        print("[DRY-RUN] GEMINI_API_KEY not set or --dry-run requested.")
        print("Option A (Web UI): Open https://labs.google/fx/tools/flow and paste the prompts below.")
        print("Option B (API): pip install google-genai && set GEMINI_API_KEY=<key> && rerun without --dry-run.")
        for sc in scenes:
            print(
                f"  -> Scene {{sc.get('scene_no')}} ({{aspect}}, {{sc.get('duration_sec')}}s): "
                f"{{sc.get('visual_prompt_flow')}}"
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
        print(f"Submitting Veo job: {{campaign_id}} scene {{sno}} ({{aspect}}) using {{model_name}}...")
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
            print(f"No video returned for scene {{sno}}.")
            continue
        video_obj = result_videos[0].video
        client.files.download(file=video_obj)
        out_file = out_dir / f"{{campaign_id}}_scene_{{sno:02d}}.mp4"
        video_obj.save(str(out_file))
        print(f"Saved: {{out_file}}")
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
'''


def _synthesize_auto_campaign_content(
    title: str,
    platform: str,
    angle_vi: str,
    project_title: str,
    project_slug: str,
) -> dict[str, Any]:
    """Auto-generate full Hook 3s, Vietnamese script, Google Flow scenes, SEO, and CTA."""
    meta = PLATFORM_META.get(platform, PLATFORM_META["TIKTOK"])
    aspect = str(meta["aspect_ratio"])
    profile = PROJECT_BRAND_PROFILES.get(project_slug, {})
    char_lock = profile.get(
        "character_lock_en",
        (
            "A sharp 28-year-old Vietnamese product founder in a clean navy shirt seated at a minimalist "
            "studio desk, crisp natural daylight key light, 35mm cinema lens f/2.0, photorealistic editorial style."
        ),
    )
    light_lock = profile.get(
        "lighting_palette_en",
        "High-contrast clean SaaS editorial lighting, balanced 5200K daylight, deep slate accents, crisp UI readability.",
    )
    clean_title = sanitize_clean_text(title).strip()
    clean_angle = sanitize_clean_text(angle_vi).strip() or f"Đánh thẳng nỗi đau thực tế và demo kết quả thật của {project_title or clean_title}."
    hook_3s = f"Dừng lại 3 giây nếu bạn đang gặp đúng vấn đề này: {clean_title}!"
    is_long = platform in ("YOUTUBE_LONG", "CROSS_PLATFORM")

    if is_long:
        scenes = [
            {
                "scene_no": 1,
                "duration_sec": 6,
                "shot_type": "Close-Up Cold Open Hook",
                "visual_prompt_flow": (
                    f"{aspect} widescreen cinema shot. {char_lock} Looking directly into the camera with focused urgency, "
                    f"holding a smartphone showing a clear alert graphic related to '{clean_title}'. Subtle slow dolly-in, "
                    f"{light_lock} Veo 3.1 photorealistic, crisp focus, no distorted text, no watermarks."
                ),
                "voiceover_vi": hook_3s,
                "sfx_music_vi": "Tiếng nhấn trầm mở màn, nhịp synth hiện đại 105 BPM vào nhẹ",
                "on_screen_text_vi": clean_title[:52],
            },
            {
                "scene_no": 2,
                "duration_sec": 8,
                "shot_type": "Split-Screen Problem Breakdown",
                "visual_prompt_flow": (
                    f"{aspect} widescreen editorial B-roll. Split screen comparing a frustrated office worker drowning in "
                    f"messy files and slow web popups on the left versus a calm clean workspace desk on the right. "
                    f"Smooth slider transition, {light_lock} Photorealistic 4K, no gibberish text."
                ),
                "voiceover_vi": f"Nhiều người vẫn mất thời gian và tiền oan mỗi tuần vì {clean_angle}",
                "sfx_music_vi": "Hiệu ứng chuyển cảnh swoosh mềm, nền nhạc nhịp đều tập trung",
                "on_screen_text_vi": "Nỗi đau thực tế & cách xử lý gọn",
            },
            {
                "scene_no": 3,
                "duration_sec": 8,
                "shot_type": "Over-the-Shoulder Live Product Demo",
                "visual_prompt_flow": (
                    f"{aspect} widescreen over-the-shoulder macro shot of hands operating a sleek laptop displaying "
                    f"the clean dark-slate web workspace of {project_title or 'Titan AI product'}. Smooth cursor clicks, "
                    f"crisp emerald confirmation state, shallow depth of field, {light_lock} Veo 3.1 realism."
                ),
                "voiceover_vi": f"Xem thao tác trực tiếp trên {project_title or 'sản phẩm'}: chỉ 3 chạm gọn gàng, xử lý tức thì và minh bạch từng bước.",
                "sfx_music_vi": "Tiếng bấm chuột rõ nét, âm báo hoàn tất nhẹ nhàng",
                "on_screen_text_vi": "Thao tác 3 chạm chạy thật ngay trên máy",
            },
            {
                "scene_no": 4,
                "duration_sec": 6,
                "shot_type": "Motion Data Callout",
                "visual_prompt_flow": (
                    f"{aspect} minimalist motion-design desk scene with floating glass telemetry cards illustrating "
                    f"speed, zero hidden fees, and local privacy protection over a dark architectural backdrop. "
                    f"Subtle parallax camera drift, {light_lock} Clean editorial graphics, no garbled letters."
                ),
                "voiceover_vi": "Kết quả kiểm chứng rõ ràng bằng số liệu thực tế, không quảng cáo phóng đại và không chi phí ẩn.",
                "sfx_music_vi": "Tiếng ting thanh mảnh nhấn số liệu, nâng nhẹ cao trào",
                "on_screen_text_vi": "Minh bạch giá bán & quyền riêng tư",
            },
            {
                "scene_no": 5,
                "duration_sec": 6,
                "shot_type": "Medium Shot CTA Lockup",
                "visual_prompt_flow": (
                    f"{aspect} widescreen medium shot. {char_lock} Smiling confidently at the tidy desk, gesturing "
                    f"cleanly toward the lower-third space for a call-to-action card. Smooth subtle zoom-out, "
                    f"{light_lock} Photorealistic 4K finish, no watermarks."
                ),
                "voiceover_vi": "Bấm đường dẫn bên dưới phần mô tả để trải nghiệm ngay hôm nay và để lại bình luận câu hỏi của bạn.",
                "sfx_music_vi": "Nhạc nền kết gọn với nhịp trống sạch và âm kết ấm",
                "on_screen_text_vi": "Dùng thử ngay ở link dưới mô tả",
            },
        ]
        script_vi = (
            f"[00:00 - 00:15 | Hook 3 giây] {hook_3s}\n"
            f"[00:15 - 01:30 | Phân tích nỗi đau] {clean_angle}\n"
            f"[01:30 - 04:00 | Demo sản phẩm thật] Hướng dẫn từng bước thao tác trực tiếp trên {project_title or 'ứng dụng'} "
            f"kèm đối chiếu kết quả thực tế.\n"
            f"[04:00 - 05:15 | Bảng giá & Minh bạch] Giải đáp câu hỏi thường gặp, phân định rõ bản miễn phí và gói nâng cao.\n"
            f"[05:15 - 06:00 | Kêu gọi hành động] Bấm link dưới phần mô tả để tự kiểm chứng trực tiếp ngay hôm nay."
        )
    else:
        scenes = [
            {
                "scene_no": 1,
                "duration_sec": 5,
                "shot_type": "Extreme Close-Up Hook",
                "visual_prompt_flow": (
                    f"{aspect} vertical 9:16 dynamic hook shot. {char_lock} Leaning slightly forward with expressive "
                    f"eye contact, holding a smartphone facing the viewer in a crisp studio setup. Fast subtle push-in, "
                    f"{light_lock} Veo 3.1 photorealistic quality, sharp focus, no distorted text."
                ),
                "voiceover_vi": hook_3s,
                "sfx_music_vi": "Tiếng bass drop gọn mở đầu 0.3s, nhịp beat 118 BPM bắt tai",
                "on_screen_text_vi": clean_title[:42],
            },
            {
                "scene_no": 2,
                "duration_sec": 7,
                "shot_type": "Problem Close-Up B-Roll",
                "visual_prompt_flow": (
                    f"{aspect} vertical 9:16 overhead close-up shot of a cluttered smartphone screen and paper receipts "
                    f"on a desk, tense red ambient reflection shifting cleanly into calm slate lighting. Handheld micro-motion, "
                    f"{light_lock} Realistic 4K, zero watermarks."
                ),
                "voiceover_vi": clean_angle,
                "sfx_music_vi": "Âm báo cảnh báo nhẹ kết hợp nhịp chuyển cảnh nhanh",
                "on_screen_text_vi": "Đừng để mất thời gian & tiền oan",
            },
            {
                "scene_no": 3,
                "duration_sec": 8,
                "shot_type": "Macro Screen UI Demo",
                "visual_prompt_flow": (
                    f"{aspect} vertical 9:16 crisp macro shot of thumb tapping a clean modern web app interface on a "
                    f"smartphone screen, showing an instant green success indicator and structured output card. "
                    f"Steady gimbal movement, {light_lock} Photorealistic screen clarity."
                ),
                "voiceover_vi": f"Mở ngay {project_title or 'công cụ'} trên trình duyệt: chỉ 3 chạm gọn là xong sạch việc trong vài giây.",
                "sfx_music_vi": "Tiếng chạm giao diện sắc nét + âm thanh hoàn tất thành công",
                "on_screen_text_vi": "3 chạm xong ngay trên điện thoại",
            },
            {
                "scene_no": 4,
                "duration_sec": 6,
                "shot_type": "Medium Shot CTA End-Card",
                "visual_prompt_flow": (
                    f"{aspect} vertical 9:16 medium shot. {char_lock} Giving a reassuring nod while pointing cleanly "
                    f"toward the bottom bio link area, clean studio depth of field. {light_lock} Crisp Veo 3.1 finish."
                ),
                "voiceover_vi": "Lưu lại video này và bấm link ở đầu trang để tự dùng thử miễn phí ngay hôm nay!",
                "sfx_music_vi": "Nhịp kết gọn sắc, tiếng nhấn CTA rõ ràng",
                "on_screen_text_vi": "Lưu video + Bấm link đầu trang",
            },
        ]
        script_vi = (
            f"[00s - 03s | Hook] {hook_3s}\n"
            f"[04s - 14s | Nỗi đau] {clean_angle}\n"
            f"[15s - 28s | Demo 3 chạm] Mở trực tiếp {project_title or 'công cụ'} trên điện thoại, thao tác 3 chạm ra kết quả ngay lập tức.\n"
            f"[29s - 35s | CTA] Lưu video gửi người quen và bấm link dùng thử miễn phí ở đầu trang."
        )

    thumb_prompt = (
        f"High-contrast {aspect} editorial cover frame for '{clean_title}', clean dark slate studio background, "
        f"sharp Vietnamese tech presenter with confident expression beside a sleek UI preview card, emerald and amber "
        f"accent lighting, studio 85mm portrait photography, zero clutter, no garbled text, ready for CTR typography overlay."
    )
    seo_title = clean_title[:70]
    seo_desc = (
        f"{clean_title}. {clean_angle} Trải nghiệm trực tiếp sản phẩm {project_title or 'Titan AI Corp'} "
        f"ngay trên trình duyệt, minh bạch, nhanh gọn và bảo vệ dữ liệu người dùng."
    )
    tag_slug = re.sub(r"[^a-zA-Z0-9]+", "", project_slug.title()) or "TitanAI"
    hashtags = f"#TitanAICorp #{tag_slug} #VideoAI #GoogleFlow #CongCuSoVietNam"
    cta_vi = "Bấm link dùng thử miễn phí ở đầu trang / phần mô tả và lưu video để dùng khi cần!"
    schedule_vi = str(meta["default_schedule_pretty_vi"])

    return {
        "angle_vi": clean_angle,
        "hook_3s_vi": hook_3s,
        "script_vi": script_vi,
        "google_flow_scenes": scenes,
        "thumbnail_prompt_flow": thumb_prompt,
        "seo_title_vi": seo_title,
        "seo_description_vi": seo_desc,
        "hashtags": hashtags,
        "cta_vi": cta_vi,
        "publish_schedule_vi": schedule_vi,
    }


def _build_default_seed_campaigns() -> list[dict[str, Any]]:
    """Return the 6 flagship Video AI Google Flow campaigns for the 2 shipped products."""
    hsrt_char = PROJECT_BRAND_PROFILES["tram-ho-so-rieng-tu"]["character_lock_en"]
    hsrt_light = PROJECT_BRAND_PROFILES["tram-ho-so-rieng-tu"]["lighting_palette_en"]
    kts_char = PROJECT_BRAND_PROFILES["so-thu-chi-thue-hkd"]["character_lock_en"]
    kts_light = PROJECT_BRAND_PROFILES["so-thu-chi-thue-hkd"]["lighting_palette_en"]

    return [
        # --- PROJECT 1: HO SO RIENG TU (3 campaigns: TikTok, YouTube Shorts, YouTube Long) ---
        {
            "campaign_id": "camp-hsrt-tiktok-cccd",
            "project_id": "proj-tram-ho-so-rieng-tu",
            "title": "Tắt Wi-Fi vẫn ghép 2 mặt CCCD đóng dấu chìm chống lừa đảo trong 5 giây",
            "platform": "TIKTOK",
            "angle_vi": (
                "Đánh thẳng nỗi sợ lộ ảnh 2 mặt CCCD trơn qua Zalo hoặc web nước ngoài bị kẻ gian lấy vay nợ đen. "
                "Chứng minh bằng mắt thật: bật Chế độ Máy bay ngay trên điện thoại mà Hồ Sơ Riêng Tư vẫn ghép 2 mặt "
                "CCCD lên trang A4 và đóng dấu chìm nghiêng chống lạm dụng, 0 byte tải lên mạng theo Nghị định 13/2023/NĐ-CP."
            ),
            "hook_3s_vi": (
                "Dừng ngay việc gửi ảnh 2 mặt CCCD trơn qua Zalo hay tải lên web nước ngoài kẻo bị kẻ gian lợi dụng vay nợ đen!"
            ),
            "script_vi": (
                "[00s - 03s | Hook 3 giây] Dừng ngay việc gửi ảnh 2 mặt CCCD trơn qua Zalo hay tải lên web nước ngoài kẻo bị kẻ gian lợi dụng vay nợ đen!\n"
                "[04s - 10s | Chứng minh ngoại tuyến] Nhìn thanh trạng thái điện thoại này: mình vừa bật Chế độ Máy bay, tắt sạch Wi-Fi lẫn 4G nhưng trang Hồ Sơ Riêng Tư vẫn chạy bình thường 100%.\n"
                "[11s - 22s | Demo 3 chạm #cccd] Chọn ảnh mặt trước và mặt sau CCCD mẫu, chạm 1 nút đóng dòng dấu chìm nghiêng: Chỉ dùng thuê nhà ngày hôm nay, không có giá trị vay vốn. Bấm xuất ngay 1 trang PDF A4 chuẩn in, xong trong 5 giây và bấm nút Đỏ xóa sạch RAM tức thì.\n"
                "[23s - 28s | CTA] Hoàn toàn miễn phí 0đ, không chèn logo, 0 byte gửi ra ngoài. Lưu video này và gửi ngay vào nhóm Zalo gia đình cho bố mẹ cùng biết nhé!"
            ),
            "google_flow_scenes": [
                {
                    "scene_no": 1,
                    "duration_sec": 5,
                    "shot_type": "Extreme Close-Up Hook",
                    "visual_prompt_flow": (
                        f"9:16 vertical cinematic close-up. {hsrt_char} Holding up a modern smartphone toward the lens "
                        f"showing a blurred sample ID card graphic with a crisp red warning ring, urgent yet trustworthy "
                        f"expression. Quick smooth push-in camera move, {hsrt_light} Veo 3.1 photorealistic 4K, no garbled text."
                    ),
                    "voiceover_vi": "Dừng ngay việc gửi ảnh 2 mặt CCCD trơn qua Zalo hay tải lên web nước ngoài kẻo bị kẻ gian lợi dụng vay nợ đen!",
                    "sfx_music_vi": "Tiếng bass nhấn cảnh báo 0.3s, nhịp điện tử sạch 116 BPM mở vào",
                    "on_screen_text_vi": "Đừng gửi ảnh CCCD trơn lên web lạ!",
                },
                {
                    "scene_no": 2,
                    "duration_sec": 6,
                    "shot_type": "Macro Status Bar Airplane Mode Proof",
                    "visual_prompt_flow": (
                        f"9:16 vertical macro top-down shot of a thumb swiping down a smartphone quick-settings panel "
                        f"and tapping Airplane Mode ON, Wi-Fi and cellular icons turning off cleanly, then switching back "
                        f"to a dark-slate browser workspace that stays active. Razor-sharp focus, {hsrt_light} Photorealistic."
                    ),
                    "voiceover_vi": "Mở Hồ Sơ Riêng Tư xong, bạn cứ bật hẳn Chế độ Máy bay tắt sạch Wi-Fi mà trang vẫn chạy 100% trên máy.",
                    "sfx_music_vi": "Tiếng công tắc gạt click rõ ràng + hiệu ứng không khí yên tĩnh",
                    "on_screen_text_vi": "Bật Chế độ Máy bay -> Vẫn chạy 100%",
                },
                {
                    "scene_no": 3,
                    "duration_sec": 10,
                    "shot_type": "Over-the-Shoulder Live Tool Demo",
                    "visual_prompt_flow": (
                        f"9:16 vertical over-the-shoulder shot of hands on smartphone tapping two placeholder ID cards "
                        f"into a clean A4 layout grid, subtle diagonal protective watermark appearing across the card "
                        f"layout, followed by an emerald green PDF download confirmation badge. Smooth micro-pan, {hsrt_light}"
                    ),
                    "voiceover_vi": "Chọn 2 mặt CCCD, chạm 1 nút đóng dấu chìm ghi rõ mục đích và ngày gửi, xuất ngay trang A4 rõ nét rồi bấm Xóa sạch bộ nhớ.",
                    "sfx_music_vi": "3 tiếng chạm giao diện nhịp nhàng + âm báo hoàn tất xanh dịu",
                    "on_screen_text_vi": "Đóng dấu chìm + Xuất A4 trong 5 giây",
                },
                {
                    "scene_no": 4,
                    "duration_sec": 7,
                    "shot_type": "Medium Shot Trust CTA",
                    "visual_prompt_flow": (
                        f"9:16 vertical medium shot. {hsrt_char} Calm confident smile, holding the phone casually at chest "
                        f"height with an emerald security shield glow subtly reflected on the desk surface, gesturing cleanly "
                        f"toward the bio link area. Smooth slow pull-back, {hsrt_light} Veo 3.1 4K clean finish."
                    ),
                    "voiceover_vi": "Miễn phí 0đ, 0 byte tải lên mạng. Lưu video và gửi ngay vào nhóm Zalo gia đình cho cả nhà cùng dùng nhé!",
                    "sfx_music_vi": "Nhạc nền kết gọn dứt khoát với hợp âm sáng",
                    "on_screen_text_vi": "0đ Miễn phí | Gửi nhóm Zalo gia đình",
                },
            ],
            "thumbnail_prompt_flow": (
                "9:16 vertical high-contrast YouTube Shorts / TikTok cover photography. Vietnamese tech creator in slate "
                "crewneck holding smartphone with Airplane Mode icon visible and a crisp glowing emerald privacy shield, "
                "deep obsidian navy studio background, dramatic rim light, space at top for bold Vietnamese CTR headline."
            ),
            "seo_title_vi": "Cách ghép 2 mặt CCCD vào 1 trang A4 và đóng dấu chìm chống lừa đảo (tắt Wi-Fi vẫn chạy)",
            "seo_description_vi": (
                "Hướng dẫn ghép 2 mặt CCCD lên trang A4 và chèn dấu chìm ghi rõ mục đích chống vay nợ đen ngay trên trình duyệt "
                "bằng Hồ Sơ Riêng Tư. Xử lý 100% cục bộ trên máy, bật Chế độ Máy bay vẫn chạy, 0 byte tải lên máy chủ ngoài, "
                "miễn phí 0đ không chèn logo, tuân thủ nguyên tắc bảo vệ dữ liệu cá nhân Nghị định 13/2023/NĐ-CP."
            ),
            "hashtags": "#HoSoRiengTu #GhepCCCD #DongDauChimCCCD #ChongLuaDao #CongCuOffline #TitanAICorp",
            "cta_vi": "Bấm link Hồ Sơ Riêng Tư ở đầu trang, bật Chế độ Máy bay để tự kiểm chứng miễn phí 0đ!",
            "publish_schedule_vi": "11:30 và 20:00 Thứ 3, Thứ 5, Chủ Nhật (TikTok + Ghim đầu trang)",
            "status": "FLOW_READY",
            "publish_url": "",
        },
        {
            "campaign_id": "camp-hsrt-shorts-anhthe",
            "project_id": "proj-tram-ho-so-rieng-tu",
            "title": "Tự làm 8 ảnh thẻ 3x4 chuẩn in 10x15cm hết 3.000đ, không dính logo bẩn",
            "platform": "YOUTUBE_SHORTS",
            "angle_vi": (
                "So sánh trực diện nỗi đau chụp ảnh thẻ ngoài tiệm mất 80.000đ hoặc dùng web AI nước ngoài bị dán logo "
                "giữa mặt ép trả thẻ quốc tế 200.000đ với Hồ Sơ Riêng Tư: tự chụp trước tường sáng, đổi nền xanh/trắng "
                "ngay trên máy và dàn sẵn tờ 8 ảnh 3x4 (hoặc 4 ảnh 4x6) khổ 10x15cm 300 DPI đi rửa hết đúng 3.000đ."
            ),
            "hook_3s_vi": (
                "Đừng tốn 80 nghìn ra tiệm chụp ảnh thẻ hay mất 200 nghìn gỡ logo web ngoại nữa, tự dàn 8 ảnh 3x4 in hết đúng 3 nghìn đồng!"
            ),
            "script_vi": (
                "[00s - 03s | Hook 3 giây] Đừng tốn 80 nghìn ra tiệm chụp ảnh thẻ hay mất 200 nghìn gỡ logo web ngoại nữa, tự dàn 8 ảnh 3x4 in hết đúng 3 nghìn đồng!\n"
                "[04s - 12s | Chạm nỗi đau] Mùa nộp hồ sơ xin việc, thực tập hay hộ chiếu mà lên mấy web ngoại chỉnh xong nó đóng cái logo to đùng giữa mặt bắt nạp tiền rất ức chế.\n"
                "[13s - 24s | Demo #idphoto] Bạn cứ đứng trước tường sáng tự chụp bằng điện thoại, mở mục Ảnh thẻ trên Hồ Sơ Riêng Tư, chọn cỡ 3x4 hoặc 4x6, bấm đổi nền xanh dương hoặc trắng ngay trên máy. Xuất 1 ảnh đơn miễn phí 0đ không logo, hoặc xuất tờ dàn sẵn 8 ảnh khổ 10x15cm 300 DPI mang ra tiệm rửa ảnh hết đúng 3.000đ.\n"
                "[25s - 30s | CTA] Xử lý hoàn toàn trên điện thoại, ảnh mặt bạn không gửi lên máy chủ nào cả. Bấm link ở phần mô tả lưu dùng cả năm nhé!"
            ),
            "google_flow_scenes": [
                {
                    "scene_no": 1,
                    "duration_sec": 6,
                    "shot_type": "Split-Screen Price Shock Hook",
                    "visual_prompt_flow": (
                        f"9:16 vertical cinematic shot. {hsrt_char} Holding a crisp glossy 10x15cm photo print sheet "
                        f"showing eight neat blue-background 3x4 passport photos, smiling with energetic curiosity in a "
                        f"bright modern studio desk setting. Crisp 35mm depth of field, {hsrt_light} Veo 3.1 photorealistic."
                    ),
                    "voiceover_vi": "Đừng tốn 80 nghìn ra tiệm chụp ảnh thẻ hay mất 200 nghìn gỡ logo web ngoại nữa, tự dàn 8 ảnh 3x4 in hết đúng 3 nghìn đồng!",
                    "sfx_music_vi": "Tiếng máy ảnh chụp tách gọn + nhịp pop nhẹ trẻ trung 120 BPM",
                    "on_screen_text_vi": "80.000đ -> 3.000đ cho 8 ảnh thẻ 3x4",
                },
                {
                    "scene_no": 2,
                    "duration_sec": 7,
                    "shot_type": "Portrait Capture Transformation",
                    "visual_prompt_flow": (
                        "9:16 vertical shot of a 22-year-old Vietnamese university student standing against a bright "
                        "plain indoor wall taking a neat front-facing portrait with a smartphone. Clean soft window light "
                        "eliminating harsh shadows, realistic natural skin tone, 50mm lens f/2.0, cinematic clarity."
                    ),
                    "voiceover_vi": "Chỉ cần đứng trước tường sáng tự chụp một tấm chân dung bằng điện thoại, không cần chỉnh sửa phức tạp.",
                    "sfx_music_vi": "Tiếng bấm màn trập sắc + chuyển cảnh mượt",
                    "on_screen_text_vi": "Bước 1: Chụp ảnh trước tường sáng",
                },
                {
                    "scene_no": 3,
                    "duration_sec": 10,
                    "shot_type": "Macro Canvas UI Transformation",
                    "visual_prompt_flow": (
                        f"9:16 vertical close-up on smartphone screen running a minimalist web app. Portrait background "
                        f"cleanly switches to crisp ID-photo cobalt blue, then locks into a 4x2 grid of 8 neat 3x4 photos "
                        f"with thin cut guidelines on a 10x15cm white sheet. Sharp screen focus, {hsrt_light}"
                    ),
                    "voiceover_vi": "Vào mục Ảnh thẻ trên Hồ Sơ Riêng Tư, chọn cỡ 3x4, đổi nền xanh dương hoặc trắng hộ chiếu, bấm xuất tờ dàn 8 ảnh 10x15cm chuẩn 300 DPI không dính logo.",
                    "sfx_music_vi": "Hiệu ứng chuyển nền mềm + tiếng tải tệp hoàn tất",
                    "on_screen_text_vi": "Bước 2: Đổi nền + Dàn 8 ảnh 10x15cm",
                },
                {
                    "scene_no": 4,
                    "duration_sec": 7,
                    "shot_type": "Medium Shot Student Result CTA",
                    "visual_prompt_flow": (
                        f"9:16 vertical medium shot. {hsrt_char} Placing the crisp printed 8-photo sheet next to a job "
                        f"application folder on the oak desk, giving a relaxed thumbs-up gesture toward the camera. "
                        f"Warm daylight rim light, {hsrt_light} Photorealistic 4K."
                    ),
                    "voiceover_vi": "Gửi tiệm in 1 tấm hết 3.000đ. Sinh viên và gia đình lưu ngay link bên dưới để dùng cả năm miễn phí không logo nhé!",
                    "sfx_music_vi": "Nhạc nền khép lại gọn tươi, nhấn âm thanh lưu video",
                    "on_screen_text_vi": "Miễn phí 0đ không logo | Link dưới mô tả",
                },
            ],
            "thumbnail_prompt_flow": (
                "9:16 vertical bright high-contrast cover shot. Clean white 10x15cm photo print sheet displaying 8 sharp "
                "cobalt-blue 3x4 ID photos held in foreground over deep cobalt studio background, crisp amber price comparison "
                "accent zone, commercial editorial lighting, zero watermark, photorealistic."
            ),
            "seo_title_vi": "Cách tự làm ảnh thẻ 3x4, 4x6 đổi nền xanh và dàn 8 ảnh khổ 10x15cm không logo",
            "seo_description_vi": (
                "Tự tạo ảnh thẻ 3x4 và 4x6 ngay trên điện thoại với Hồ Sơ Riêng Tư: đổi nền xanh dương/trắng hộ chiếu, "
                "dàn sẵn 8 ảnh 3x4 hoặc 4 ảnh 4x6 trên khổ 10x15cm 300 DPI mang đi in hết 3.000đ. Ảnh đơn miễn phí 0đ không "
                "logo bản quyền, xử lý 100% cục bộ không gửi ảnh khuôn mặt lên máy chủ ngoài."
            ),
            "hashtags": "#AnhThe3x4 #DanAnh10x15 #HoSoRiengTu #MeoSinhVien #XinViec2026 #YouTubeShorts",
            "cta_vi": "Dùng miễn phí 0đ không logo ở link ghim bình luận và chia sẻ vào nhóm lớp sinh viên!",
            "publish_schedule_vi": "12:00 và 19:30 Thứ 2, Thứ 4, Thứ 6 (YouTube Shorts + Cross-post Reels)",
            "status": "FLOW_READY",
            "publish_url": "",
        },
        {
            "campaign_id": "camp-hsrt-ytlong-6congcu",
            "project_id": "proj-tram-ho-so-rieng-tu",
            "title": "Hướng dẫn 6 công cụ xử lý hồ sơ online 100% ngoại tuyến: CCCD, nén dưới 2MB, ký PDF",
            "platform": "YOUTUBE_LONG",
            "angle_vi": (
                "Video hướng dẫn toàn diện chuẩn SEO/GEO cho công dân Việt Nam hay nộp Cổng Dịch vụ công, BHXH, hộ chiếu, "
                "xin việc: chứng minh kiến trúc Zero-Upload tắt mạng vẫn chạy đủ 6 công cụ (#cccd, #compress, #idphoto, "
                "#sign, #merge, #exif), giải thích trung thực gói 0đ lõi vs gói 15.000đ trả lẻ và 59.000đ/năm VietQR."
            ),
            "hook_3s_vi": (
                "11 giờ đêm nộp Cổng Dịch vụ công bị báo lỗi vượt quá 2 MB, lại ngại tải ảnh CCCD lên web nước ngoài? "
                "Đây là 1 trang web tắt Wi-Fi vẫn giải quyết gọn trọn 6 việc giấy tờ!"
            ),
            "script_vi": (
                "[00:00 - 00:25 | Mở đầu & Tự kiểm chứng tắt Wi-Fi] 11 giờ đêm nộp hồ sơ bị báo lỗi quá 2 MB mà sợ tải giấy tờ lên web lạ? Hôm nay mình sẽ thử ngắt hẳn Wi-Fi trên máy tính để kiểm chứng trọn bộ 6 công cụ của Hồ Sơ Riêng Tư.\n"
                "[00:25 - 01:30 | Công cụ 1: Ghép 2 mặt CCCD + Dấu chìm] Ghép chuẩn tỷ lệ ISO/IEC 7810 lên A4, chèn chữ nghiêng ghi rõ mục đích và ngày gửi chống lạm dụng vay vốn.\n"
                "[01:30 - 02:35 | Công cụ 2: Nén ảnh/PDF chuẩn 2MB / 5MB] Demo nén tài liệu 8,66 MB xuống đúng 1,90 MB bằng tìm kiếm nhị phân mà số định danh vẫn sắc nét.\n"
                "[02:35 - 03:45 | Công cụ 3 & 4: Ảnh thẻ 3x4 dàn 10x15cm & Ký tên tay PDF] Đổi nền xanh/trắng 300 DPI không logo và ký nét mực xanh bút bi trực tiếp lên đơn PDF không cần máy in.\n"
                "[03:45 - 04:55 | Công cụ 5 & 6: Gộp nhiều ảnh thành PDF A4 & Gỡ sạch GPS EXIF] Xoay trang, xóa trang có hoàn tác 5 giây và rửa sạch tọa độ nhà riêng ẩn trong ảnh trước khi gửi.\n"
                "[04:55 - 06:00 | Bảng giá trung thực & Pháp lý NĐ 13/2023] 6 công cụ lõi miễn phí 0đ mãi mãi không logo; gói gia đình 59.000đ/năm chuyển khoản VietQR 1 lần, không tự gia hạn ngầm. Link trải nghiệm ở ngay mô tả."
            ),
            "google_flow_scenes": [
                {
                    "scene_no": 1,
                    "duration_sec": 8,
                    "shot_type": "Widescreen Studio Cold Open",
                    "visual_prompt_flow": (
                        f"16:9 widescreen cinematic tech review intro. {hsrt_char} Seated at a sleek dark oak desk at night "
                        f"with warm desk lamp accent, looking at a laptop displaying a red 'File > 2MB' upload alert, then "
                        f"confidently flipping the Wi-Fi switch OFF to introduce the offline web toolkit. Smooth slider move, "
                        f"{hsrt_light} Veo 3.1 4K photorealistic."
                    ),
                    "voiceover_vi": "11 giờ đêm nộp Cổng Dịch vụ công bị báo lỗi vượt quá 2 MB, lại sợ tải ảnh CCCD lên web nước ngoài? Đây là 1 trang web tắt Wi-Fi vẫn chạy trọn 6 việc giấy tờ!",
                    "sfx_music_vi": "Nhạc nền công nghệ editorial nhẹ nhàng 100 BPM, tiếng click công tắc tắt mạng",
                    "on_screen_text_vi": "6 Công cụ Hồ sơ: Tắt Wi-Fi vẫn chạy",
                },
                {
                    "scene_no": 2,
                    "duration_sec": 8,
                    "shot_type": "Macro UI Feature 1 - CCCD Watermark",
                    "visual_prompt_flow": (
                        f"16:9 widescreen clean over-the-shoulder capture of a laptop browser showing a refined dark-slate "
                        f"workspace placing front and back sample ID cards onto an A4 sheet with a subtle diagonal protective "
                        f"watermark. Crisp screen legibility, shallow depth of field, {hsrt_light}"
                    ),
                    "voiceover_vi": "Công cụ 1: Ghép 2 mặt CCCD lên chung 1 trang A4 đúng chuẩn tỷ lệ, kèm dòng dấu chìm ghi rõ mục đích và ngày gửi.",
                    "sfx_music_vi": "Hiệu ứng quét tài liệu sạch + tiếng xuất PDF",
                    "on_screen_text_vi": "1. Ghép 2 mặt CCCD A4 + Dấu chìm",
                },
                {
                    "scene_no": 3,
                    "duration_sec": 8,
                    "shot_type": "Before/After Data Compression Graphic",
                    "visual_prompt_flow": (
                        f"16:9 widescreen editorial motion showcase on a dark architectural desk surface. Left glass card "
                        f"shows a heavy 8.66MB scan pulsing amber, smoothly compressing into a crisp emerald right card "
                        f"at 1.90MB while keeping document details razor sharp. Slow dolly right, {hsrt_light} Zero garbled text."
                    ),
                    "voiceover_vi": "Công cụ 2: Nén ảnh và PDF theo đúng mốc 500 KB, 2 MB hoặc 5 MB của Cổng Dịch vụ công. Tệp 8,66 MB tự ép xuống 1,90 MB trong 3 giây mà chữ vẫn đọc rõ từng số.",
                    "sfx_music_vi": "Âm thanh nén khí điện tử tinh gọn + tiếng ting xác nhận xanh",
                    "on_screen_text_vi": "2. Nén 8,66 MB -> 1,90 MB chuẩn Dịch vụ công",
                },
                {
                    "scene_no": 4,
                    "duration_sec": 8,
                    "shot_type": "Split-Screen ID Photo & Pen Signature",
                    "visual_prompt_flow": (
                        f"16:9 widescreen split-screen studio demo. Left side displays a 10x15cm sheet of eight crisp blue "
                        f"3x4 ID photos; right side shows a stylus smoothly drawing a blue ballpoint signature onto a clean "
                        f"A4 PDF form on a tablet. Crisp macro lighting, {hsrt_light} Photorealistic 4K."
                    ),
                    "voiceover_vi": "Công cụ 3 và 4: Tự tạo ảnh thẻ 3x4, 4x6 dàn tờ in 10x15cm không logo, và ký tên tay mực xanh bút bi trực tiếp lên đơn PDF mà không cần máy in.",
                    "sfx_music_vi": "Tiếng bút ký mượt mà trên mặt kính + nhịp nền ổn định",
                    "on_screen_text_vi": "3. Ảnh thẻ 3x4 không logo | 4. Ký tay lên PDF",
                },
                {
                    "scene_no": 5,
                    "duration_sec": 8,
                    "shot_type": "Privacy Shield EXIF & Multi-Page PDF",
                    "visual_prompt_flow": (
                        f"16:9 widescreen studio macro shot of a smartphone photo gallery card showing hidden GPS pin "
                        f"coordinates dissolving cleanly into an emerald zero-metadata verified badge, beside a neat stack "
                        f"of 3 merged A4 PDF pages. Smooth orbital camera drift, {hsrt_light}"
                    ),
                    "voiceover_vi": "Công cụ 5 và 6: Gộp nhiều ảnh chụp thành 1 tệp PDF A4 có hoàn tác 5 giây, và xóa sạch tọa độ GPS nhà riêng ẩn trong ảnh trước khi gửi cho người lạ.",
                    "sfx_music_vi": "Hiệu ứng quét sạch dữ liệu nhẹ nhàng, tạo cảm giác an toàn",
                    "on_screen_text_vi": "5. Gộp PDF A4 | 6. Xóa sạch tọa độ GPS",
                },
                {
                    "scene_no": 6,
                    "duration_sec": 8,
                    "shot_type": "Widescreen Presenter Summary & CTA",
                    "visual_prompt_flow": (
                        f"16:9 widescreen medium shot. {hsrt_char} Calmly closing the laptop slightly while gesturing "
                        f"toward clean space for end-screen cards, warm studio bokeh in background, trustworthy tech-review "
                        f"authority. Slow pull-back, {hsrt_light} Veo 3.1 cinema quality."
                    ),
                    "voiceover_vi": "Cả 6 công cụ lõi đều miễn phí 0đ và không chèn logo. Gói gia đình 59.000đ/năm chỉ khi bạn cần in 300 DPI và xử lý hàng loạt 20 tệp. Link mở dùng thử ở ngay dưới mô tả!",
                    "sfx_music_vi": "Nhạc nền hạ xuống mượt mà với hợp âm kết tin cậy",
                    "on_screen_text_vi": "0đ Lõi | 59.000đ/năm Gia đình | Link bên dưới",
                },
            ],
            "thumbnail_prompt_flow": (
                "16:9 widescreen high-CTR YouTube cover photo. Confident Vietnamese tech reviewer on left in clean slate "
                "crewneck holding smartphone with Airplane Mode ON, right side displaying a crisp dark-mode bento grid "
                "of 6 glowing utility badges (ID card, 2MB compressor, 3x4 photo, signature, PDF merge, GPS shield), "
                "studio teal and indigo lighting, sharp commercial clarity."
            ),
            "seo_title_vi": "Hồ Sơ Riêng Tư: 6 công cụ xử lý CCCD, nén PDF 2MB, ảnh thẻ 3x4 ngoại tuyến 100%",
            "seo_description_vi": (
                "Hướng dẫn chi tiết 6 công cụ xử lý hồ sơ trực tuyến chạy 100% trên trình duyệt, tắt Wi-Fi vẫn hoạt động "
                "của Hồ Sơ Riêng Tư: (1) Ghép 2 mặt CCCD lên A4 đóng dấu chìm; (2) Nén ảnh và PDF dưới 2MB/5MB nộp Cổng "
                "Dịch vụ công; (3) Tạo ảnh thẻ 3x4/4x6 dàn 10x15cm 300 DPI không logo; (4) Ký tên tay lên PDF; (5) Gộp ảnh "
                "thành PDF A4; (6) Xóa tọa độ GPS EXIF. Miễn phí 0đ bản lõi, tuân thủ Nghị định 13/2023/NĐ-CP."
            ),
            "hashtags": "#HoSoRiengTu #DichVuCong #NenPDF2MB #GhepCCCD #KyTenPDF #XoaGPS #TitanAICorp",
            "cta_vi": "Mở link dùng thử miễn phí ở phần mô tả và kiểm chứng ngay bằng Chế độ Máy bay!",
            "publish_schedule_vi": "20:00 Thứ 6 hàng tuần (YouTube Dài 16:9 + Cắt 3 clip Shorts)",
            "status": "FLOW_READY",
            "publish_url": "",
        },
        # --- PROJECT 2: KET THUE SHOP (3 campaigns: TikTok, YouTube Shorts, Facebook Reels) ---
        {
            "campaign_id": "camp-kts-tiktok-bayphisan",
            "project_id": "proj-so-thu-chi-thue-hkd",
            "title": "Bẫy phí sàn 20%: Ví về 800 triệu nhưng thuế đã vượt 1,02 tỷ dính hạn 30 ngày HĐĐT",
            "platform": "TIKTOK",
            "angle_vi": (
                "Chạm thẳng điểm mù chết người của chủ shop Shopee/TikTok Shop theo Nghị định 117/2025 và Nghị định 70/2025: "
                "nhìn biến động số dư ngân hàng mới về 800,7 triệu nên chủ quan, nhưng doanh thu tính thuế (GMV chưa trừ 20% "
                "phí sàn) đã cán mốc 1,02 tỷ, kích hoạt hạn 30 ngày đăng ký hóa đơn điện tử máy tính tiền để tránh phạt 5 đến 10 triệu."
            ),
            "hook_3s_vi": (
                "Chủ shop Shopee, TikTok nào thấy tiền về ngân hàng cả năm mới 800 triệu mà nghĩ chưa tới mốc 1 tỷ là sắp mất oan 5 đến 10 triệu tiền phạt rồi đó!"
            ),
            "script_vi": (
                "[00s - 03s | Hook 3 giây] Chủ shop Shopee, TikTok nào thấy tiền về ngân hàng cả năm mới 800 triệu mà nghĩ chưa tới mốc 1 tỷ là sắp mất oan 5 đến 10 triệu tiền phạt rồi đó!\n"
                "[04s - 16s | Căn cứ luật rõ ràng] Theo Nghị định 117/2025, doanh thu tính thuế là tổng giá trị đơn hàng khách thanh toán, tuyệt đối không được trừ 18% đến 25% phí sàn, phí thanh toán hay voucher. Nghĩa là ví bạn nhận 800,7 triệu, nhưng doanh thu gốc sàn báo đã vượt 1,02 tỷ.\n"
                "[17s - 31s | Demo Két Thuế Shop] Xem trên Máy tính 10 giây của Két Thuế Shop: gõ 1,02 tỷ và phí sàn 20%. Tiền về ví đúng 800,7 triệu nhưng thanh Radar bật đỏ lập tức: đã vượt mốc 1 tỷ, cần đăng ký hóa đơn điện tử khởi tạo từ máy tính tiền trong 30 ngày theo Nghị định 70.\n"
                "[32s - 40s | CTA] Đừng đoán mò bằng số dư tài khoản nữa. Bấm link máy tính miễn phí 10 giây ở đầu trang để kiểm tra shop mình ngay tối nay nhé!"
            ),
            "google_flow_scenes": [
                {
                    "scene_no": 1,
                    "duration_sec": 6,
                    "shot_type": "Close-Up Warehouse Hook",
                    "visual_prompt_flow": (
                        f"9:16 vertical cinematic close-up. {kts_char} Looking sharply into the camera while holding a "
                        f"smartphone displaying a banking alert in a busy Vietnamese e-commerce packing room with neatly "
                        f"stacked parcel boxes behind. Punchy quick zoom-in, {kts_light} Veo 3.1 photorealistic 4K."
                    ),
                    "voiceover_vi": "Chủ shop Shopee, TikTok nào thấy tiền về ngân hàng cả năm mới 800 triệu mà nghĩ chưa tới mốc 1 tỷ là sắp mất oan 5 đến 10 triệu tiền phạt rồi đó!",
                    "sfx_music_vi": "Tiếng cảnh báo trầm 0.4s + nhịp trống nhanh tạo sự chú ý",
                    "on_screen_text_vi": "Ví về 800tr nhưng thuế đã 1,02 tỷ!",
                },
                {
                    "scene_no": 2,
                    "duration_sec": 8,
                    "shot_type": "Editorial Split Graphic - GMV vs Bank Net",
                    "visual_prompt_flow": (
                        f"9:16 vertical clean editorial motion visual over a dark charcoal desk. A stacked glowing bar splits "
                        f"cleanly into three layered segments: red top slice for 20 percent marketplace fees, amber sliver for "
                        f"withheld tax, and muted bottom block for net bank payout. Crisp architectural depth, {kts_light}"
                    ),
                    "voiceover_vi": "Nghị định 117/2025 quy định doanh thu tính thuế là tổng đơn khách trả, không trừ 20% phí sàn. Ví về 800,7 triệu thì doanh thu tính thuế đã là 1,02 tỷ rồi.",
                    "sfx_music_vi": "Tiếng tách lớp dữ liệu sắc nét, giữ nhịp tension đều",
                    "on_screen_text_vi": "GMV tính thuế KHÔNG trừ 20% phí sàn",
                },
                {
                    "scene_no": 3,
                    "duration_sec": 10,
                    "shot_type": "Macro Tablet Radar 1B Demo",
                    "visual_prompt_flow": (
                        f"9:16 vertical over-the-shoulder macro shot of hands operating a sleek dark-mode tax dashboard on "
                        f"a tablet. A semicircular red progress radar sweeps past the 100 percent threshold marker with a "
                        f"crisp 30-day e-invoice alert banner appearing below. Razor-sharp UI focus, {kts_light}"
                    ),
                    "voiceover_vi": "Nhìn trên Két Thuế Shop nè: nhập 1,02 tỷ, phí sàn 20%, Radar lập tức báo đỏ quá mốc 1 tỷ và đếm ngược hạn 30 ngày đăng ký hóa đơn điện tử máy tính tiền.",
                    "sfx_music_vi": "Tiếng còi radar nhẹ tinh tế + tiếng kéo thanh trượt",
                    "on_screen_text_vi": "Radar 1 tỷ báo hạn 30 ngày HĐĐT",
                },
                {
                    "scene_no": 4,
                    "duration_sec": 8,
                    "shot_type": "Desk Privacy & Compliance Reassurance",
                    "visual_prompt_flow": (
                        f"9:16 vertical medium close-up of the shop owner reviewing clean printed summary sheets beside a "
                        f"laptop showing a green Local-First lock icon, calm relieved posture under warm practical lighting. "
                        f"Smooth slow slide, {kts_light} Photorealistic 4K."
                    ),
                    "voiceover_vi": "Toàn bộ số liệu kiểm tra lưu riêng tư ngay trên máy bạn, tính đúng nộp đủ để buôn bán an tâm quanh năm.",
                    "sfx_music_vi": "Nhịp nhạc dịu lại sang tông tin cậy và chuyên nghiệp",
                    "on_screen_text_vi": "Lưu cục bộ trên máy | Tính đúng nộp đủ",
                },
                {
                    "scene_no": 5,
                    "duration_sec": 6,
                    "shot_type": "Medium Shot Direct CTA",
                    "visual_prompt_flow": (
                        f"9:16 vertical medium shot. {kts_char} Pointing clearly toward the lower bio link space with a "
                        f"focused reassuring expression, neatly organized e-commerce studio softly lit behind. {kts_light}"
                    ),
                    "voiceover_vi": "Bấm link Máy tính thuế 10 giây miễn phí ở đầu trang, không cần đăng nhập để kiểm tra khoảng cách tới vạch đỏ 1 tỷ ngay tối nay!",
                    "sfx_music_vi": "Nhịp kết sắc gọn với âm báo nhấn nút CTA",
                    "on_screen_text_vi": "Kiểm tra miễn phí 10 giây ở đầu trang",
                },
            ],
            "thumbnail_prompt_flow": (
                "9:16 vertical high-urgency cover frame. Vietnamese e-commerce shop owner holding smartphone showing a "
                "glowing red semicircular 1.02B tax radar gauge over a dimly lit parcel warehouse backdrop, crisp crimson "
                "and amber accent lighting, clean upper zone reserved for bold Vietnamese headline."
            ),
            "seo_title_vi": "Bẫy phí sàn 20% Shopee TikTok: Ví về 800 triệu nhưng thuế đã vượt 1,02 tỷ (NĐ 117 & NĐ 70)",
            "seo_description_vi": (
                "Giải thích bẫy phí sàn 20% khiến chủ shop Shopee/TikTok Shop tưởng chưa chạm mốc 1 tỷ nhưng GMV tính thuế "
                "đã vượt 1,02 tỷ theo Nghị định 117/2025 và dính hạn 30 ngày đăng ký hóa đơn điện tử máy tính tiền theo "
                "Nghị định 70/2025. Kiểm tra nhanh miễn phí bằng Máy tính 10 giây trên Két Thuế Shop (lưu cục bộ trên máy)."
            ),
            "hashtags": "#KetThueShop #ThueShopee #ThueTikTokShop #HoKinhDoanh2026 #HoaDonDienTu #TitanAICorp",
            "cta_vi": "Bấm link Máy tính thuế 10 giây miễn phí ở đầu trang, không cần đăng nhập!",
            "publish_schedule_vi": "11:30 và 19:30 Thứ 3, Thứ 5, Chủ Nhật (TikTok + Ghim bình luận link Máy tính 10s)",
            "status": "FLOW_READY",
            "publish_url": "",
        },
        {
            "campaign_id": "camp-kts-shorts-hoanthue",
            "project_id": "proj-so-thu-chi-thue-hkd",
            "title": "Doanh thu dưới 1 tỷ năm 2026: Cách đối soát đòi hoàn 9 đến 14 triệu thuế sàn trừ thừa",
            "platform": "YOUTUBE_SHORTS",
            "angle_vi": (
                "Bảo vệ quyền lợi hợp pháp của chủ shop vừa và nhỏ dưới mốc 1 tỷ/năm theo Nghị định 141/2026/NĐ-CP: "
                "sàn TMĐT vẫn khấu trừ 1,5% ngay trên từng đơn thành công; hướng dẫn thả tệp CSV vào Két Thuế Shop để tự "
                "loại đơn hủy/bom hàng và gom bảng đối soát minh bạch làm hồ sơ đòi hoàn thuế nộp thừa cuối năm."
            ),
            "hook_3s_vi": (
                "Bán hàng cả năm dưới 1 tỷ nhưng Shopee, TikTok vẫn trừ đều 1,5% thuế từng đơn? Bạn đang bỏ quên 9 đến 14 triệu tiền hoàn thuế hợp pháp đó!"
            ),
            "script_vi": (
                "[00s - 03s | Hook 3 giây] Bán hàng cả năm dưới 1 tỷ nhưng Shopee, TikTok vẫn trừ đều 1,5% thuế từng đơn? Bạn đang bỏ quên 9 đến 14 triệu tiền hoàn thuế hợp pháp đó!\n"
                "[04s - 15s | Quyền lợi hợp pháp NĐ 141/2026] Từ 2026, Nghị định 141 nâng ngưỡng miễn thuế GTGT và TNCN lên 1 tỷ đồng một năm. Nhưng sàn đâu biết cả năm bạn bán tổng bao nhiêu nên cứ có đơn là sàn tự trích 1,5% tại nguồn. Cuối năm khoản đó trở thành thuế nộp thừa và bạn hoàn toàn có quyền đối soát đề nghị hoàn lại.\n"
                "[16s - 30s | Demo thả CSV Két Thuế Shop] Ví dụ shop bán 600 triệu trên sàn cộng 250 triệu ngoài Facebook, tổng 850 triệu dưới mốc 1 tỷ. Thả tệp CSV Shopee/TikTok vào Két Thuế Shop: app tự gạt sạch đơn bom hàng và tính đúng 9 triệu tiền sàn đang giữ hộ, xuất bảng đối soát rõ từng đồng.\n"
                "[31s - 38s | CTA] Kiểm tra xem sàn đang tạm giữ bao nhiêu triệu của shop bạn ngay ở link Máy tính 10 giây miễn phí dưới phần mô tả!"
            ),
            "google_flow_scenes": [
                {
                    "scene_no": 1,
                    "duration_sec": 6,
                    "shot_type": "Medium Close-Up Positive Financial Hook",
                    "visual_prompt_flow": (
                        f"9:16 vertical cinematic shot. {kts_char} Holding a tablet glowing softly with an emerald green "
                        f"recoverable-tax vault card inside a bright tidy boutique retail desk, warm reassuring expression. "
                        f"Smooth slow dolly-in, {kts_light} Veo 3.1 photorealistic 4K."
                    ),
                    "voiceover_vi": "Bán hàng cả năm dưới 1 tỷ nhưng Shopee, TikTok vẫn trừ đều 1,5% thuế từng đơn? Bạn đang bỏ quên 9 đến 14 triệu tiền hoàn thuế hợp pháp đó!",
                    "sfx_music_vi": "Âm báo tiền về êm tai + nhịp acoustic hiện đại tích cực 112 BPM",
                    "on_screen_text_vi": "Dưới 1 tỷ: Đừng bỏ quên 9 - 14tr hoàn thuế!",
                },
                {
                    "scene_no": 2,
                    "duration_sec": 9,
                    "shot_type": "Clean Visual Explainer - 1.5% Withholding",
                    "visual_prompt_flow": (
                        "9:16 vertical tabletop editorial animation feel (photorealistic studio lighting). Crisp translucent "
                        "order cards flowing across a dark green-slate desk, small 1.5 percent emerald coins neatly accumulating "
                        "into a transparent glass savings vault labeled cleanly with geometric balance lines. No garbled text."
                    ),
                    "voiceover_vi": "Theo Nghị định 141/2026, doanh thu năm từ 1 tỷ trở xuống được miễn thuế, nhưng sàn vẫn tự trừ 1,5% từng đơn. Cuối năm khoản thuế nộp thừa này được quyền lập hồ sơ đòi hoàn hợp pháp.",
                    "sfx_music_vi": "Tiếng xu rơi nhẹ đều đặn + nhạc nền trong trẻo",
                    "on_screen_text_vi": "NĐ 141/2026: Thuế sàn trừ thừa được hoàn",
                },
                {
                    "scene_no": 3,
                    "duration_sec": 12,
                    "shot_type": "Over-the-Shoulder CSV Filter Demo",
                    "visual_prompt_flow": (
                        f"9:16 vertical over-the-shoulder close-up of hands dragging a CSV spreadsheet file into the clean "
                        f"Két Thuế Shop web app on a laptop. Cancelled return orders smoothly fade out while an emerald "
                        f"summary card highlights 9.0M VND recoverable tax. Sharp screen contrast, {kts_light}"
                    ),
                    "voiceover_vi": "Chỉ cần thả tệp CSV Shopee hoặc TikTok vào Két Thuế Shop: app tự lọc sạch đơn bom hàng và tổng hợp bảng đối soát từng đồng để bạn đối chiếu trên eTax Mobile.",
                    "sfx_music_vi": "Tiếng kéo thả mượt + âm xác nhận lọc sạch đơn bom",
                    "on_screen_text_vi": "Thả file CSV -> Lọc đơn bom -> Ra bảng đối soát",
                },
                {
                    "scene_no": 4,
                    "duration_sec": 8,
                    "shot_type": "Medium Shot Empowering CTA",
                    "visual_prompt_flow": (
                        f"9:16 vertical medium shot. {kts_char} Smiling warmly with laptop open showing green safe dashboard, "
                        f"gesturing cleanly toward the pinned description link. Balanced studio lighting, {kts_light}"
                    ),
                    "voiceover_vi": "Thử ngay trên Máy tính 10 giây miễn phí ở link dưới mô tả để biết chính xác sàn đang giữ hộ bao nhiêu triệu của shop bạn nhé!",
                    "sfx_music_vi": "Hợp âm kết sáng ấm, gọn gàng",
                    "on_screen_text_vi": "Thử Máy tính 10 giây miễn phí bên dưới",
                },
            ],
            "thumbnail_prompt_flow": (
                "9:16 vertical clean financial-editorial cover shot. Confident Vietnamese shop owner beside an emerald-glowing "
                "glass vault graphic and crisp CSV spreadsheet cards on deep forest-slate background, warm rim lighting, "
                "generous top safe-zone for Vietnamese CTR headline."
            ),
            "seo_title_vi": "Cách đối soát đòi hoàn 9 đến 14 triệu thuế sàn Shopee TikTok trừ thừa dưới mốc 1 tỷ (NĐ 141/2026)",
            "seo_description_vi": (
                "Hướng dẫn chủ shop và hộ kinh doanh có tổng doanh thu năm dưới 1 tỷ đồng theo Nghị định 141/2026/NĐ-CP "
                "cách lọc đơn hủy/bom hàng từ tệp CSV Shopee, TikTok Shop và lập bảng đối soát tiền thuế sàn khấu trừ thừa "
                "bằng Két Thuế Shop. Minh bạch, lưu cục bộ trên máy, kèm miễn trừ pháp lý đầy đủ."
            ),
            "hashtags": "#HoanThue2026 #NghiDinh141 #KetThueShop #ChuShopShopee #HoKinhDoanh #YouTubeShorts",
            "cta_vi": "Bấm link Máy tính 10 giây miễn phí dưới mô tả để kiểm tra số tiền thuế sàn đang giữ hộ!",
            "publish_schedule_vi": "12:00 và 20:00 Thứ 2, Thứ 4, Thứ 6 (YouTube Shorts + Cross-post TikTok)",
            "status": "FLOW_READY",
            "publish_url": "",
        },
        {
            "campaign_id": "camp-kts-reels-trunham10pct",
            "project_id": "proj-so-thu-chi-thue-hkd",
            "title": "Còi báo sàn trừ nhầm 10% thuế thay vì 1,5%: Soi file CSV Shopee/TikTok trong 10 giây",
            "platform": "FACEBOOK_REELS",
            "angle_vi": (
                "Phát hiện lỗi cài sai danh mục ngành hàng khiến sàn TMĐT khấu trừ mức trần 10% thay vì 1,5% phân phối "
                "hàng hóa (bán 500 triệu bị trích 50 triệu thay vì 7,5 triệu, lệch 42,5 triệu tiền tươi), kết hợp demo "
                "3 chạm chốt sổ 11h đêm và công khai minh bạch bảng giá CFO Standard 249.000đ/tháng (150 lượt AI đọc hóa đơn) "
                "và Pro 399.000đ/tháng (300 lượt AI)."
            ),
            "hook_3s_vi": (
                "Cài sai đúng 1 dòng danh mục trên sàn là Shopee, TikTok trừ thẳng 10% thuế thay vì 1,5%, bán 500 triệu bị giữ oan tới 42,5 triệu tiền mặt!"
            ),
            "script_vi": (
                "[00s - 03s | Hook 3 giây] Cài sai đúng 1 dòng danh mục trên sàn là Shopee, TikTok trừ thẳng 10% thuế thay vì 1,5%, bán 500 triệu bị giữ oan tới 42,5 triệu tiền mặt!\n"
                "[04s - 15s | Chạm nỗi đau thực tế] Theo Nghị định 117/2025, bán lẻ hàng hóa chỉ chịu tổng 1,5%. Nhưng nếu gian hàng bị xếp nhóm không xác định được hàng hóa hay dịch vụ, hệ thống có thể khấu trừ mức trần 10%. Ngồi soi bằng Excel mấy nghìn dòng lúc 11 giờ đêm rất dễ bỏ sót.\n"
                "[16s - 31s | Demo Còi đỏ CSV + 3 chạm chốt sổ] Thả file CSV tháng vừa rồi vào Két Thuế Shop: hễ đơn nào sàn trừ vượt quá 105% mức chuẩn ngành là app bật còi đỏ chỉ rõ từng mã đơn ngay trong 10 giây. Đơn ngoài sàn Facebook thì ghi nhanh đúng 3 chạm, nhìn thẳng 3 con số: Tiền thực về, Két cất thuế và Tiền được phép xài.\n"
                "[32s - 40s | Minh bạch giá & CTA] Dùng thử ngay với 15 đơn mẫu thật miễn phí, gói Standard chỉ 249 nghìn/tháng kèm 150 lượt AI đọc hóa đơn giấy. Bấm link dưới bình luận kiểm tra file tháng này của shop bạn ngay!"
            ),
            "google_flow_scenes": [
                {
                    "scene_no": 1,
                    "duration_sec": 6,
                    "shot_type": "Late-Night Desk Tension Hook",
                    "visual_prompt_flow": (
                        f"9:16 vertical cinematic shot at a shop owner's desk at 11 PM. {kts_char} Illuminated by warm desk "
                        f"lamp and laptop screen showing dense spreadsheet rows, raising one hand with sharp focus toward "
                        f"camera to warn fellow sellers. Tight 35mm framing, {kts_light} Veo 3.1 photorealistic."
                    ),
                    "voiceover_vi": "Cài sai đúng 1 dòng danh mục trên sàn là Shopee, TikTok trừ thẳng 10% thuế thay vì 1,5%, bán 500 triệu bị giữ oan tới 42,5 triệu tiền mặt!",
                    "sfx_music_vi": "Tiếng còi cảnh báo gọn + nhịp điện tử kịch tính 118 BPM",
                    "on_screen_text_vi": "Trừ nhầm 10% vs 1,5% -> Lệch 42,5 triệu!",
                },
                {
                    "scene_no": 2,
                    "duration_sec": 10,
                    "shot_type": "Macro CSV Red-Flag Scanner Demo",
                    "visual_prompt_flow": (
                        f"9:16 vertical macro screen shot on laptop running Két Thuế Shop. A clean dark-slate CSV preview "
                        f"table highlights two anomalous order rows in crisp red alert pills while normal rows remain calm "
                        f"slate, instantly computing the exact over-withheld gap. Crisp editorial focus, {kts_light}"
                    ),
                    "voiceover_vi": "Thả file CSV Shopee hoặc TikTok vào Két Thuế Shop: bất kỳ đơn nào sàn trừ vượt mức chuẩn ngành đều bật còi đỏ chỉ đích danh từng mã đơn trong 10 giây.",
                    "sfx_music_vi": "Âm thanh quét radar 2 tiếng bíp ngắn rõ ràng",
                    "on_screen_text_vi": "Còi đỏ bắt đúng từng mã đơn trừ nhầm",
                },
                {
                    "scene_no": 3,
                    "duration_sec": 12,
                    "shot_type": "One-Hand Mobile 3-Tap Ledger Demo",
                    "visual_prompt_flow": (
                        f"9:16 vertical close-up of a shop owner's thumb effortlessly tapping a clean mobile web app showing "
                        f"three large bold financial metric cards (Net Received, Tax Vault, Safe-to-Spend) in high-contrast "
                        f"dark mode. Effortless 3-tap interaction, {kts_light} Photorealistic 4K."
                    ),
                    "voiceover_vi": "Tối muộn đóng đơn xong chỉ cần 3 chạm ghi doanh thu ngoài sàn là thấy ngay 3 con số lớn: Tiền thực về, Két cất thuế và Tiền được phép xài. Dữ liệu nằm gọn trên máy bạn.",
                    "sfx_music_vi": "3 tiếng chạm nhẹ mượt mà + nền nhạc dịu tạo cảm giác nhẹ nhõm",
                    "on_screen_text_vi": "3 chạm chốt sổ | 3 con số rõ như ban ngày",
                },
                {
                    "scene_no": 4,
                    "duration_sec": 8,
                    "shot_type": "Medium Shot Transparent Offer CTA",
                    "visual_prompt_flow": (
                        f"9:16 vertical medium shot. {kts_char} Relaxed confident expression closing the workday cleanly "
                        f"beside neatly taped parcels, gesturing smoothly toward the comment link zone. Warm professional "
                        f"studio depth, {kts_light}"
                    ),
                    "voiceover_vi": "Bấm link dưới bình luận để thử ngay với 15 đơn mẫu thật, rồi thả file tháng gần nhất của shop bạn lên soi miễn phí nhé!",
                    "sfx_music_vi": "Nhạc nền kết sắc nét, dứt khoát",
                    "on_screen_text_vi": "Thử 15 đơn mẫu miễn phí | Link bình luận",
                },
            ],
            "thumbnail_prompt_flow": (
                "9:16 vertical high-contrast Facebook Reels cover image. Late-night Vietnamese e-commerce founder examining "
                "a glowing dark-mode CSV audit table where red alert highlights '10% vs 1.5%' discrepancy, deep midnight "
                "indigo backdrop with amber-crimson accent lighting, clear upper headline zone."
            ),
            "seo_title_vi": "Cảnh báo sàn Shopee TikTok trừ nhầm 10% thuế: Cách soi file CSV trong 10 giây bằng Két Thuế Shop",
            "seo_description_vi": (
                "Hướng dẫn chủ shop Shopee và TikTok Shop phát hiện nhanh các đơn hàng bị sàn khấu trừ nhầm mức trần 10% "
                "thay vì 1,5% bán lẻ hàng hóa bằng công cụ lọc CSV tự động trên Két Thuế Shop. Kèm tính năng ghi nhanh "
                "3 chạm, lưu riêng tư trên máy, gói Standard 249.000đ/tháng (150 lượt AI đọc hóa đơn) và Pro 399.000đ/tháng "
                "(300 lượt AI). Tuyệt đối không tư vấn lách thuế."
            ),
            "hashtags": "#KetThueShop #SoiFileCSV #ShopeeSellerVN #TikTokShopVN #ThuChiHoKinhDoanh #FacebookReels",
            "cta_vi": "Bấm link dưới bình luận thử ngay 15 đơn mẫu thật và soi file CSV tháng vừa rồi của shop bạn!",
            "publish_schedule_vi": "11:45 và 20:30 Thứ 3, Thứ 5, Thứ 7 (Facebook Reels + Chia sẻ 15 Nhóm Chủ shop)",
            "status": "FLOW_READY",
            "publish_url": "",
        },
    ]


class MediaStudioEngine:
    """Division 5 Media Studio & Google Flow / Veo 3.1 Campaign Engine."""

    def __init__(
        self,
        db: TitanDatabase | None = None,
        projects_root: Path | None = None,
    ) -> None:
        self.db = db if db is not None else TitanDatabase(DEFAULT_DB_PATH)
        if projects_root is not None:
            self.projects_root = Path(projects_root).resolve()
        else:
            # Isolate temporary test databases so unit tests never overwrite production media_studio packs
            try:
                is_default_db = self.db.db_path.resolve() == DEFAULT_DB_PATH.resolve()
            except Exception:
                is_default_db = False
            if is_default_db:
                self.projects_root = PROJECTS_DIR.resolve()
            else:
                self.projects_root = (self.db.db_path.resolve().parent / "projects").resolve()
        self.ensure_table()

    def ensure_table(self) -> None:
        with self.db._write_lock:
            self.db._get_conn().executescript(MEDIA_CAMPAIGNS_DDL)

    def _resolve_project_info(self, project_id: str | None) -> tuple[str, str]:
        """Return (project_slug, project_title) safely for any project_id."""
        pid = str(project_id or "").strip()
        if pid:
            conn = self.db._get_conn()
            try:
                row = conn.execute(
                    "SELECT slug, title, workspace_path FROM projects WHERE project_id = ?",
                    (pid,),
                ).fetchone()
                if row:
                    slug = _sanitize_slug(str(row["slug"] or ""))
                    title = sanitize_clean_text(row["title"] or slug)
                    return slug, title
            except sqlite3.OperationalError:
                pass
            for slug_key, prof in PROJECT_BRAND_PROFILES.items():
                if prof.get("project_id") == pid:
                    return slug_key, str(prof.get("brand_vi") or slug_key)
            derived = pid[5:] if pid.startswith("proj-") else pid
            return _sanitize_slug(derived), sanitize_clean_text(pid)
        return "chung-tap-doan", "Titan AI Corp"

    def _safe_media_dir(self, project_slug: str) -> Path:
        slug = _sanitize_slug(project_slug)
        base = self.projects_root.resolve()
        target = (base / slug / "media_studio").resolve()
        if not target.is_relative_to(base):
            raise ValueError("Chặn truy cập đường dẫn ngoài thư mục dự án.")
        return target

    def _logical_svg_path(self, project_slug: str, campaign_id: str) -> str:
        slug = _sanitize_slug(project_slug)
        cid = _sanitize_campaign_id(campaign_id)
        return f"corporate_hq/projects/{slug}/media_studio/thumbnails/{cid}.svg"

    def _disk_svg_path(self, project_slug: str, campaign_id: str) -> Path:
        media_dir = self._safe_media_dir(project_slug)
        cid = _sanitize_campaign_id(campaign_id)
        thumb_dir = (media_dir / "thumbnails").resolve()
        target = (thumb_dir / f"{cid}.svg").resolve()
        if not target.is_relative_to(media_dir):
            raise ValueError("Đường dẫn ảnh bìa SVG không hợp lệ.")
        return target

    def _write_campaign_thumbnail(
        self,
        campaign: dict[str, Any],
        project_slug: str,
        project_title: str,
    ) -> str:
        cid = _sanitize_campaign_id(str(campaign["campaign_id"]))
        svg_disk = self._disk_svg_path(project_slug, cid)
        svg_disk.parent.mkdir(parents=True, exist_ok=True)
        svg_xml = render_campaign_thumbnail_svg(
            campaign_id=cid,
            title=str(campaign.get("title") or ""),
            platform=str(campaign.get("platform") or "TIKTOK"),
            angle_vi=str(campaign.get("angle_vi") or ""),
            cta_vi=str(campaign.get("cta_vi") or ""),
            project_slug=project_slug,
            project_brand_vi=project_title,
        )
        svg_disk.write_text(svg_xml, encoding="utf-8")
        return self._logical_svg_path(project_slug, cid)

    def _enrich_row(self, row: dict[str, Any]) -> dict[str, Any]:
        item = dict(row)
        scenes = _normalize_scenes(item.get("google_flow_scenes_json"))
        item["google_flow_scenes"] = scenes
        platform = str(item.get("platform") or "TIKTOK").upper().strip()
        status = str(item.get("status") or "FLOW_READY").upper().strip()
        meta = PLATFORM_META.get(platform, PLATFORM_META["TIKTOK"])
        item["platform"] = platform
        item["status"] = status
        item["platform_label_vi"] = meta["label_vi"]
        item["status_label_vi"] = STATUS_LABELS_VI.get(status, status)
        item["aspect_ratio"] = meta["aspect_ratio"]
        item["scenes_count"] = len(scenes)
        item["total_duration_sec"] = sum(int(s.get("duration_sec") or 0) for s in scenes)
        svg_rel = str(item.get("thumbnail_svg_path") or "").strip()
        if svg_rel.startswith("corporate_hq/projects/"):
            item["thumbnail_web_url"] = "./projects/" + svg_rel[len("corporate_hq/projects/"):]
        else:
            item["thumbnail_web_url"] = svg_rel
        return item

    def export_project_media_pack(self, project_id: str | None) -> dict[str, Any]:
        """Export google_flow_pack.json and render_with_gemini_veo.py for a project."""
        slug, proj_title = self._resolve_project_info(project_id)
        media_dir = self._safe_media_dir(slug)
        media_dir.mkdir(parents=True, exist_ok=True)
        (media_dir / "thumbnails").mkdir(parents=True, exist_ok=True)

        campaigns = self.list_campaigns(project_id=project_id)
        profile = PROJECT_BRAND_PROFILES.get(slug, {})
        pack_payload = {
            "schema_version": "1.0",
            "studio_division": "div5-media-youtube-studio",
            "departments": ["25", "26", "27", "28", "29", "30", "31"],
            "project_id": project_id or "",
            "project_slug": slug,
            "project_title_vi": sanitize_clean_text(proj_title),
            "generated_at": utc_now_iso(),
            "google_flow_studio_url": "https://labs.google/fx/tools/flow",
            "recommended_veo_model": "veo-3.1-generate-preview",
            "visual_consistency_bible": {
                "character_lock_en": sanitize_clean_text(
                    profile.get(
                        "character_lock_en",
                        "Consistent Vietnamese product founder in clean navy attire, 35mm cinema lens f/2.0.",
                    )
                ),
                "lighting_palette_en": sanitize_clean_text(
                    profile.get(
                        "lighting_palette_en",
                        "Balanced 5200K daylight key light, deep slate background, crisp screen clarity.",
                    )
                ),
                "anti_ai_slop_ratio": "40% real product UI demo + 40% locked-consistency Google Flow clips + 20% crisp data graphics",
            },
            "campaigns_count": len(campaigns),
            "campaigns": [
                {
                    "campaign_id": c["campaign_id"],
                    "title": c["title"],
                    "platform": c["platform"],
                    "platform_label_vi": c["platform_label_vi"],
                    "aspect_ratio": c["aspect_ratio"],
                    "status": c["status"],
                    "angle_vi": c["angle_vi"],
                    "hook_3s_vi": c["hook_3s_vi"],
                    "script_vi": c["script_vi"],
                    "google_flow_scenes": c["google_flow_scenes"],
                    "thumbnail_prompt_flow": c["thumbnail_prompt_flow"],
                    "thumbnail_svg_path": c["thumbnail_svg_path"],
                    "thumbnail_web_url": c["thumbnail_web_url"],
                    "seo_title_vi": c["seo_title_vi"],
                    "seo_description_vi": c["seo_description_vi"],
                    "hashtags": c["hashtags"],
                    "cta_vi": c["cta_vi"],
                    "publish_schedule_vi": c["publish_schedule_vi"],
                    "publish_url": c["publish_url"],
                }
                for c in campaigns
            ],
        }
        pack_path = media_dir / "google_flow_pack.json"
        pack_path.write_text(json.dumps(pack_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        render_path = media_dir / "render_with_gemini_veo.py"
        render_path.write_text(_build_render_script_source(slug, proj_title), encoding="utf-8")

        if hasattr(self.db, "invalidate_project_scan_cache"):
            try:
                self.db.invalidate_project_scan_cache(slug)
            except Exception:
                pass

        return {
            "project_slug": slug,
            "pack_path": f"corporate_hq/projects/{slug}/media_studio/google_flow_pack.json",
            "render_script_path": f"corporate_hq/projects/{slug}/media_studio/render_with_gemini_veo.py",
            "campaigns_count": len(campaigns),
        }

    def list_campaigns(
        self,
        project_id: str | None = None,
        platform: str | None = None,
        status: str | None = None,
    ) -> list[dict[str, Any]]:
        self.ensure_table()
        clauses = ["1=1"]
        params: list[Any] = []
        if project_id:
            clauses.append("project_id = ?")
            params.append(str(project_id).strip())
        if platform:
            clauses.append("UPPER(platform) = ?")
            params.append(_normalize_platform(platform))
        if status:
            clauses.append("UPPER(status) = ?")
            params.append(_normalize_status(status))
        rows = self.db._get_conn().execute(
            f"SELECT * FROM media_campaigns WHERE {' AND '.join(clauses)} ORDER BY updated_at DESC, created_at DESC",
            params,
        ).fetchall()
        return [self._enrich_row(dict(r)) for r in rows]

    def get_campaign(self, campaign_id: str) -> dict[str, Any] | None:
        self.ensure_table()
        row = self.db._get_conn().execute(
            "SELECT * FROM media_campaigns WHERE campaign_id = ?",
            (str(campaign_id).strip(),),
        ).fetchone()
        return self._enrich_row(dict(row)) if row else None

    def create_campaign(self, data: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(data, dict):
            raise ValueError("Dữ liệu tạo chiến dịch phải là đối tượng JSON.")
        title = sanitize_clean_text(data.get("title") or "").strip()
        if not title:
            raise ValueError("Tiêu đề chiến dịch Video AI không được để trống.")

        self.ensure_table()
        cid = _sanitize_campaign_id(str(data.get("campaign_id") or f"camp-{uuid.uuid4().hex[:8]}"))
        project_id = str(data.get("project_id") or "").strip() or None
        platform = _normalize_platform(data.get("platform"), default="TIKTOK")
        status = _normalize_status(data.get("status"), default="FLOW_READY")
        slug, proj_title = self._resolve_project_info(project_id)

        raw_angle = sanitize_clean_text(data.get("angle_vi") or "").strip()
        auto = _synthesize_auto_campaign_content(
            title=title,
            platform=platform,
            angle_vi=raw_angle,
            project_title=proj_title,
            project_slug=slug,
        )

        angle_vi = raw_angle or auto["angle_vi"]
        hook_3s_vi = sanitize_clean_text(data.get("hook_3s_vi") or "").strip() or auto["hook_3s_vi"]
        script_vi = sanitize_clean_text(data.get("script_vi") or "").strip() or auto["script_vi"]
        scenes = _normalize_scenes(data.get("google_flow_scenes") or data.get("google_flow_scenes_json"))
        if not scenes:
            scenes = auto["google_flow_scenes"]
        scenes_json = json.dumps(scenes, ensure_ascii=False)
        thumbnail_prompt_flow = (
            sanitize_clean_text(data.get("thumbnail_prompt_flow") or "").strip()
            or auto["thumbnail_prompt_flow"]
        )
        seo_title_vi = sanitize_clean_text(data.get("seo_title_vi") or "").strip() or auto["seo_title_vi"]
        seo_description_vi = (
            sanitize_clean_text(data.get("seo_description_vi") or "").strip()
            or auto["seo_description_vi"]
        )
        hashtags = sanitize_clean_text(data.get("hashtags") or "").strip() or auto["hashtags"]
        cta_vi = sanitize_clean_text(data.get("cta_vi") or "").strip() or auto["cta_vi"]
        publish_schedule_vi = (
            sanitize_clean_text(data.get("publish_schedule_vi") or "").strip()
            or auto["publish_schedule_vi"]
        )
        publish_url = sanitize_clean_text(data.get("publish_url") or "").strip()

        thumb_svg_path = str(data.get("thumbnail_svg_path") or "").strip()
        if not thumb_svg_path:
            thumb_svg_path = self._write_campaign_thumbnail(
                campaign={
                    "campaign_id": cid,
                    "title": title,
                    "platform": platform,
                    "angle_vi": angle_vi,
                    "cta_vi": cta_vi,
                },
                project_slug=slug,
                project_title=proj_title,
            )

        now = utc_now_iso()
        with self.db.immediate_tx() as conn:
            conn.execute(
                """
                INSERT INTO media_campaigns(
                    campaign_id, project_id, title, platform, angle_vi, hook_3s_vi, script_vi,
                    google_flow_scenes_json, thumbnail_prompt_flow, thumbnail_svg_path,
                    seo_title_vi, seo_description_vi, hashtags, cta_vi, publish_schedule_vi,
                    status, publish_url, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    cid,
                    project_id,
                    title,
                    platform,
                    angle_vi,
                    hook_3s_vi,
                    script_vi,
                    scenes_json,
                    thumbnail_prompt_flow,
                    thumb_svg_path,
                    seo_title_vi,
                    seo_description_vi,
                    hashtags,
                    cta_vi,
                    publish_schedule_vi,
                    status,
                    publish_url,
                    now,
                    now,
                ),
            )
            if hasattr(self.db, "log_event"):
                self.db.log_event(
                    actor_dept_id="27",
                    event_type="MEDIA_CAMPAIGN_CREATED",
                    headline_vi=f"Khối 5 Studio tạo chiến dịch Video AI ({platform}): {title}",
                    project_id=project_id,
                    detail={"campaign_id": cid, "platform": platform, "scenes": len(scenes)},
                    conn=conn,
                )

        pack_info = self.export_project_media_pack(project_id)
        created = self.get_campaign(cid)
        if not created:
            raise RuntimeError(f"Không thể đọc lại chiến dịch vừa tạo: {cid}")
        created["google_flow_pack_path"] = pack_info["pack_path"]
        created["render_script_path"] = pack_info["render_script_path"]
        return created

    def update_campaign(self, campaign_id: str, patch: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(patch, dict):
            raise ValueError("Dữ liệu cập nhật chiến dịch phải là đối tượng JSON.")
        self.ensure_table()
        cid = str(campaign_id).strip()
        existing = self.get_campaign(cid)
        if not existing:
            raise KeyError(f"Chiến dịch '{cid}' không tồn tại.")

        allowed_text_fields = {
            "project_id",
            "title",
            "angle_vi",
            "hook_3s_vi",
            "script_vi",
            "thumbnail_prompt_flow",
            "thumbnail_svg_path",
            "seo_title_vi",
            "seo_description_vi",
            "hashtags",
            "cta_vi",
            "publish_schedule_vi",
            "publish_url",
        }
        updates: dict[str, Any] = {}
        for key, val in patch.items():
            if val is None:
                continue
            if key == "platform":
                updates["platform"] = _normalize_platform(val)
            elif key == "status":
                updates["status"] = _normalize_status(val)
            elif key in ("google_flow_scenes", "google_flow_scenes_json"):
                scenes = _normalize_scenes(val)
                updates["google_flow_scenes_json"] = json.dumps(scenes, ensure_ascii=False)
            elif key in allowed_text_fields:
                cleaned = sanitize_clean_text(val).strip()
                if key == "title" and not cleaned:
                    raise ValueError("Tiêu đề chiến dịch Video AI không được để trống.")
                updates[key] = cleaned or (None if key == "project_id" else "")

        merged = dict(existing)
        merged.update(updates)
        old_project_id = existing.get("project_id")
        new_project_id = merged.get("project_id")
        slug, proj_title = self._resolve_project_info(new_project_id)

        regen_thumb = bool(
            {"title", "platform", "angle_vi", "cta_vi", "project_id"} & set(updates.keys())
        ) or not self._disk_svg_path(slug, cid).is_file()
        if regen_thumb and "thumbnail_svg_path" not in updates:
            updates["thumbnail_svg_path"] = self._write_campaign_thumbnail(
                campaign=merged,
                project_slug=slug,
                project_title=proj_title,
            )

        now = utc_now_iso()
        with self.db.immediate_tx() as conn:
            if updates:
                col_sql = ", ".join(f"{col} = ?" for col in updates)
                conn.execute(
                    f"UPDATE media_campaigns SET {col_sql}, updated_at = ? WHERE campaign_id = ?",
                    [*updates.values(), now, cid],
                )
            if hasattr(self.db, "log_event"):
                self.db.log_event(
                    actor_dept_id="27",
                    event_type="MEDIA_CAMPAIGN_UPDATED",
                    headline_vi=(
                        f"Khối 5 Studio cập nhật chiến dịch ({merged['status']}): {merged['title']}"
                    ),
                    project_id=new_project_id,
                    detail={"campaign_id": cid, "fields": sorted(updates.keys())},
                    conn=conn,
                )

        if old_project_id and old_project_id != new_project_id:
            self.export_project_media_pack(old_project_id)
        pack_info = self.export_project_media_pack(new_project_id)
        updated = self.get_campaign(cid)
        if not updated:
            raise KeyError(f"Chiến dịch '{cid}' không tồn tại.")
        updated["google_flow_pack_path"] = pack_info["pack_path"]
        updated["render_script_path"] = pack_info["render_script_path"]
        return updated

    def delete_campaign(self, campaign_id: str) -> dict[str, Any]:
        self.ensure_table()
        cid = str(campaign_id).strip()
        existing = self.get_campaign(cid)
        if not existing:
            raise KeyError(f"Chiến dịch '{cid}' không tồn tại.")
        project_id = existing.get("project_id")
        slug, _ = self._resolve_project_info(project_id)

        with self.db.immediate_tx() as conn:
            conn.execute("DELETE FROM media_campaigns WHERE campaign_id = ?", (cid,))
            if hasattr(self.db, "log_event"):
                self.db.log_event(
                    actor_dept_id="27",
                    event_type="MEDIA_CAMPAIGN_DELETED",
                    headline_vi=f"Khối 5 Studio xóa chiến dịch Video AI: {existing['title']}",
                    project_id=project_id,
                    detail={"campaign_id": cid},
                    conn=conn,
                )

        svg_disk = self._disk_svg_path(slug, cid)
        if svg_disk.is_file():
            try:
                svg_disk.unlink()
            except OSError:
                pass

        self.export_project_media_pack(project_id)
        return {
            "deleted": True,
            "campaign_id": cid,
            "project_id": project_id,
            "title": existing["title"],
        }

    def ensure_all_project_assets(self, force_regenerate: bool = False) -> list[dict[str, Any]]:
        """Ensure every campaign in DB has a crisp SVG thumbnail and every project has fresh pack + script."""
        campaigns = self.list_campaigns()
        touched_projects: dict[str | None, tuple[str, str]] = {}
        for camp in campaigns:
            pid = camp.get("project_id")
            slug, proj_title = self._resolve_project_info(pid)
            touched_projects[pid] = (slug, proj_title)
            svg_disk = self._disk_svg_path(slug, camp["campaign_id"])
            expected_rel = self._logical_svg_path(slug, camp["campaign_id"])
            if force_regenerate or not svg_disk.is_file() or camp.get("thumbnail_svg_path") != expected_rel:
                self._write_campaign_thumbnail(camp, slug, proj_title)
                if camp.get("thumbnail_svg_path") != expected_rel:
                    with self.db.immediate_tx() as conn:
                        conn.execute(
                            "UPDATE media_campaigns SET thumbnail_svg_path = ? WHERE campaign_id = ?",
                            (expected_rel, camp["campaign_id"]),
                        )
        packs: list[dict[str, Any]] = []
        for pid in touched_projects:
            packs.append(self.export_project_media_pack(pid))
        return packs

    def seed_default_campaigns_if_empty(self) -> dict[str, Any]:
        """Seed 6 complete Google Flow / YouTube / TikTok campaigns if table is empty."""
        self.ensure_table()
        existing = self.list_campaigns()
        if existing:
            packs = self.ensure_all_project_assets()
            return {
                "seeded": False,
                "created_count": 0,
                "total_campaigns": len(existing),
                "packs_exported": packs,
                "campaigns": self.list_campaigns(),
            }

        created: list[dict[str, Any]] = []
        for spec in _build_default_seed_campaigns():
            created.append(self.create_campaign(spec))
        packs = self.ensure_all_project_assets()
        return {
            "seeded": True,
            "created_count": len(created),
            "total_campaigns": len(created),
            "packs_exported": packs,
            "campaigns": self.list_campaigns(),
        }

    def run_self_check(self) -> dict[str, Any]:
        """Run full schema, asset, XML/SVG, JSON, syntax, no-emoji/no-dash, and isolated CRUD checks."""
        errors: list[str] = []
        checked_files: list[str] = []

        self.ensure_table()
        campaigns = self.list_campaigns()
        if len(campaigns) < 6:
            errors.append(f"Expected at least 6 media campaigns, found {len(campaigns)}.")

        by_proj: dict[str, int] = {}
        for c in campaigns:
            pid = str(c.get("project_id") or "")
            by_proj[pid] = by_proj.get(pid, 0) + 1
            if c["platform"] not in VALID_PLATFORMS:
                errors.append(f"{c['campaign_id']}: invalid platform {c['platform']}")
            if c["status"] not in VALID_STATUSES:
                errors.append(f"{c['campaign_id']}: invalid status {c['status']}")
            scenes = c.get("google_flow_scenes")
            if not isinstance(scenes, list) or len(scenes) < 3:
                errors.append(f"{c['campaign_id']}: expected >= 3 Google Flow scenes.")
            else:
                for sc in scenes:
                    for req_k in REQUIRED_SCENE_KEYS:
                        if req_k not in sc or sc[req_k] in ("", None):
                            errors.append(f"{c['campaign_id']}: scene missing '{req_k}'")

            # Verify zero emoji / em-dash / en-dash across every DB column
            for field_name, field_val in c.items():
                if isinstance(field_val, str):
                    errors.extend(find_text_violations(field_val, f"db:{c['campaign_id']}.{field_name}"))

            # Verify SVG exists, parses cleanly as XML, and is emoji/dash free
            slug, _ = self._resolve_project_info(pid)
            svg_disk = self._disk_svg_path(slug, c["campaign_id"])
            if not svg_disk.is_file():
                errors.append(f"{c['campaign_id']}: missing SVG file at {svg_disk}")
            else:
                svg_text = svg_disk.read_text(encoding="utf-8")
                checked_files.append(str(svg_disk))
                errors.extend(find_text_violations(svg_text, str(svg_disk)))
                try:
                    root_el = ET.fromstring(svg_text)
                    if not root_el.tag.endswith("svg"):
                        errors.append(f"{svg_disk}: root XML tag is not <svg>")
                except ET.ParseError as pe:
                    errors.append(f"{svg_disk}: invalid SVG XML ({pe})")

        for required_pid in ("proj-tram-ho-so-rieng-tu", "proj-so-thu-chi-thue-hkd"):
            if by_proj.get(required_pid, 0) < 3:
                errors.append(
                    f"Project {required_pid}: expected >= 3 campaigns, found {by_proj.get(required_pid, 0)}"
                )
            slug, _ = self._resolve_project_info(required_pid)
            media_dir = self._safe_media_dir(slug)
            pack_file = media_dir / "google_flow_pack.json"
            render_file = media_dir / "render_with_gemini_veo.py"
            if not pack_file.is_file():
                errors.append(f"Missing pack JSON: {pack_file}")
            else:
                pack_raw = pack_file.read_text(encoding="utf-8")
                checked_files.append(str(pack_file))
                errors.extend(find_text_violations(pack_raw, str(pack_file)))
                try:
                    parsed_pack = json.loads(pack_raw)
                    if len(parsed_pack.get("campaigns") or []) < 3:
                        errors.append(f"{pack_file}: expected >= 3 campaigns inside pack")
                except json.JSONDecodeError as je:
                    errors.append(f"{pack_file}: invalid JSON ({je})")
            if not render_file.is_file():
                errors.append(f"Missing render script: {render_file}")
            else:
                render_raw = render_file.read_text(encoding="utf-8")
                checked_files.append(str(render_file))
                errors.extend(find_text_violations(render_raw, str(render_file)))
                try:
                    py_compile.compile(str(render_file), doraise=True)
                except py_compile.PyCompileError as pce:
                    errors.append(f"{render_file}: syntax error ({pce})")

        # Verify scripts/media_studio.py itself is 100% free of emoji and em/en dashes
        self_path = Path(__file__).resolve()
        checked_files.append(str(self_path))
        errors.extend(find_text_violations(self_path.read_text(encoding="utf-8"), str(self_path)))

        # Isolated CRUD round-trip test on a temporary SQLite DB (zero side effects on production DB)
        crud_ok = False
        with tempfile.TemporaryDirectory(prefix="titan_media_check_") as tmpdir:
            tmp_root = Path(tmpdir)
            tmp_db = TitanDatabase(db_path=tmp_root / "check.db")
            try:
                tmp_engine = MediaStudioEngine(db=tmp_db, projects_root=tmp_root / "projects")
                c_new = tmp_engine.create_campaign(
                    {
                        "project_id": "proj-tram-ho-so-rieng-tu",
                        "title": "Test nhanh auto-gen Google Flow 3 chạm",
                        "platform": "YOUTUBE_LONG",
                        "angle_vi": "Kiểm chứng tự sinh phân cảnh Google Flow và ảnh bìa 16:9",
                    }
                )
                assert len(c_new["google_flow_scenes"]) >= 4, "auto-gen scenes failed"
                assert (tmp_root / "projects" / "tram-ho-so-rieng-tu" / "media_studio" / "thumbnails" / f"{c_new['campaign_id']}.svg").is_file()
                c_upd = tmp_engine.update_campaign(
                    c_new["campaign_id"],
                    {"status": "PUBLISHED", "publish_url": "https://youtube.com/watch?v=demo123"},
                )
                assert c_upd["status"] == "PUBLISHED", "update status failed"
                listed = tmp_engine.list_campaigns(project_id="proj-tram-ho-so-rieng-tu", status="PUBLISHED")
                assert len(listed) == 1, "filtered list failed"
                del_res = tmp_engine.delete_campaign(c_new["campaign_id"])
                assert del_res["deleted"] is True, "delete failed"
                assert len(tmp_engine.list_campaigns()) == 0, "table not empty after delete"
                crud_ok = True
            except Exception as exc:
                errors.append(f"Isolated CRUD check failed: {exc}")
            finally:
                tmp_db.close_thread_conn()

        return {
            "passed": len(errors) == 0,
            "total_campaigns": len(campaigns),
            "by_project": by_proj,
            "checked_files_count": len(checked_files),
            "crud_roundtrip_passed": crud_ok,
            "errors": errors,
        }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Titan AI Corp - Division 5 Media Studio & Google Flow / Veo 3.1 CLI"
    )
    parser.add_argument("--db", default=str(DEFAULT_DB_PATH), help="Path to titan_state.db")
    parser.add_argument("--seed", action="store_true", help="Seed 6 flagship Video AI campaigns if empty")
    parser.add_argument("--check", action="store_true", help="Run full quality, asset, and no-emoji/no-dash check")
    parser.add_argument("--export-packs", action="store_true", help="Regenerate SVG thumbnails and Google Flow packs")
    parser.add_argument("--list", action="store_true", help="List campaigns currently stored in DB")
    parser.add_argument("--project", default="", help="Optional project_id filter for --list")
    parser.add_argument("--json", action="store_true", help="Print output as JSON")
    args = parser.parse_args(argv)

    db = TitanDatabase(db_path=Path(args.db))
    try:
        engine = MediaStudioEngine(db=db)
        report: dict[str, Any] = {}

        if args.seed:
            seed_res = engine.seed_default_campaigns_if_empty()
            report["seed"] = {
                "seeded": seed_res["seeded"],
                "created_count": seed_res["created_count"],
                "total_campaigns": seed_res["total_campaigns"],
                "packs_exported": seed_res["packs_exported"],
            }

        if args.export_packs:
            report["packs_exported"] = engine.ensure_all_project_assets(force_regenerate=True)

        if args.list or (not args.seed and not args.check and not args.export_packs):
            camps = engine.list_campaigns(project_id=args.project or None)
            report["campaigns"] = [
                {
                    "campaign_id": c["campaign_id"],
                    "project_id": c["project_id"],
                    "platform": c["platform"],
                    "status": c["status"],
                    "scenes_count": c["scenes_count"],
                    "thumbnail_svg_path": c["thumbnail_svg_path"],
                    "title": c["title"],
                }
                for c in camps
            ]

        exit_code = 0
        if args.check:
            chk = engine.run_self_check()
            report["check"] = chk
            if not chk["passed"]:
                exit_code = 1

        if args.json:
            print(json.dumps(report, ensure_ascii=False, indent=2))
        else:
            if "seed" in report:
                s = report["seed"]
                print(
                    f"[SEED] seeded={s['seeded']} created={s['created_count']} total={s['total_campaigns']}"
                )
            if "campaigns" in report:
                print(f"[LIST] {len(report['campaigns'])} campaign(s):")
                for c in report["campaigns"]:
                    print(
                        f"  - {c['campaign_id']} [{c['platform']}] ({c['status']}, {c['scenes_count']} scenes): {c['title']}"
                    )
            if "check" in report:
                chk = report["check"]
                if chk["passed"]:
                    print(
                        f"[CHECK PASS] {chk['total_campaigns']} campaigns, "
                        f"{chk['checked_files_count']} files verified, "
                        f"CRUD={chk['crud_roundtrip_passed']}, 0 emoji, 0 em/en-dash."
                    )
                else:
                    print(f"[CHECK FAIL] {len(chk['errors'])} error(s):")
                    for err in chk["errors"]:
                        print(f"  x {err}")
        return exit_code
    finally:
        db.close_thread_conn()


if __name__ == "__main__":
    raise SystemExit(main())
