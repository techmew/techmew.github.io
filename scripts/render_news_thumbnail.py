#!/usr/bin/env python3
"""Render a topic-specific 1200x630 PNG from fixed background, without AI."""
import argparse
import json
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = (
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
)

def font(size):
    for path in FONTS:
        if Path(path).exists():
            return ImageFont.truetype(path, size, index=0)
    raise RuntimeError("Japanese font unavailable. Install fonts-noto-cjk")

def wrap(draw, title, face, limit, maxlines):
    lines, current = [], ""
    for char in re.sub(r"\s+", " ", title).strip():
        next_ = current + char
        if draw.textlength(next_, font=face) <= limit:
            current = next_
        else:
            if current:
                lines.append(current)
            current = char
    if current: lines.append(current)
    return lines if len(lines) <= maxlines else None

def render(manifest, background, outdir):
    spec = json.loads(manifest.read_text(encoding="utf-8"))
    key = str(spec.get("key", ""))
    title = str(spec.get("title", "")).strip()
    tag = str(spec.get("tag", "速報")).strip()[:14]
    checked = str(spec.get("checked_jst", "")).strip()[:35]
    if not re.fullmatch(r"[A-Za-z0-9_-]{8,70}", key):
        raise ValueError("Bad key")
    if not 6 <= len(title) <= 160:
        raise ValueError("Bad title")
    outdir.mkdir(parents=True, exist_ok=True)
    output = outdir / (key + ".png")
    if output.exists():
        print("EXISTS", output)
        return
    image = Image.open(background).convert("RGBA").resize((1200, 630))
    shade = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shade)
    draw.rounded_rectangle((34, 190, 1166, 528), radius=22,
        fill=(3, 9, 24, 237), outline=(250, 56, 75, 250), width=4)
    draw.rectangle((57, 210, 67, 506), fill=(252, 67, 74, 255))
    image = Image.alpha_composite(image, shade)
    draw = ImageDraw.Draw(image)
    draw.text((90, 212), "ひまねこ速報 / " + tag, font=font(26), fill=(255, 198, 199))
    chosen = None
    for size in (69, 65, 61, 57, 53, 49, 45, 41, 37, 33):
        f = font(size)
        lines = wrap(draw, title, f, 1010, 3)
        if lines and len(lines) * (size + 13) <= 215:
            chosen = (f, size, lines)
            break
    if chosen is None:
        f = font(33)
        lines = wrap(draw, title, f, 1010, 4)
        if not lines:
            raise ValueError("Title too long; shorten it")
        chosen = (f, 33, lines)
    f, size, lines = chosen
    y = 266 + max(0, (205 - len(lines) * (size + 13)) // 2)
    for line in lines:
        draw.text((92, y), line, font=f, fill=(255, 255, 255),
            stroke_width=2, stroke_fill=(0, 0, 0))
        y += size + 13
    if checked:
        draw.text((90, 491), "確認：" + checked, font=font(21), fill=(189, 206, 225))
    image.convert("RGB").save(output, "PNG", optimize=True)
    print("CREATED", output, output.stat().st_size)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--base", type=Path,
        default=ROOT / "assets/himaneko-breaking-news-common.png")
    parser.add_argument("--outdir", type=Path,
        default=ROOT / "assets/breaking-thumbnails")
    args = parser.parse_args()
    render(args.manifest, args.base, args.outdir)

if __name__ == "__main__":
    main()
