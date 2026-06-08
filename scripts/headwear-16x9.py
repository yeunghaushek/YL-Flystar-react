#!/usr/bin/env python3
"""Compose HEAD WEAR banner at 16:9 with extended winter background."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SRC = Path(
    "/home/yeunghaushek/.cursor/projects/home-yeunghaushek-Desktop-Codetail-YL-Flystar-react"
    "/assets/head-ce537124-27ad-4579-b647-2907758590a6.png"
)
OUT = Path(__file__).resolve().parents[1] / "public" / "images" / "head-wear-16x9.jpg"

W, H = 1920, 1080


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def winter_gradient(size: tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    top = (232, 244, 252)
    mid = (214, 234, 248)
    bottom = (198, 224, 242)
    for y in range(h):
        t = y / max(h - 1, 1)
        if t < 0.55:
            k = t / 0.55
            r = lerp(top[0], mid[0], k)
            g = lerp(top[1], mid[1], k)
            b = lerp(top[2], mid[2], k)
        else:
            k = (t - 0.55) / 0.45
            r = lerp(mid[0], bottom[0], k)
            g = lerp(mid[1], bottom[1], k)
            b = lerp(mid[2], bottom[2], k)
        row = (int(r), int(g), int(b))
        for x in range(w):
            px[x, y] = row
    return img


def draw_waves(base: Image.Image) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = base.size

    bands = [
        ((255, 255, 255), 0.08, 0, h * 0.22, w, h * 0.38),
        ((200, 225, 245), 0.12, -w * 0.05, h * 0.55, w * 1.05, h * 0.78),
        ((180, 210, 235), 0.10, 0, h * 0.82, w, h),
    ]
    for color, alpha, x0, y0, x1, y1 in bands:
        fill = (*color, int(255 * alpha))
        draw.ellipse([x0, y0, x1, y1], fill=fill)
        draw.ellipse([x0 + w * 0.15, y0 - h * 0.08, x1 + w * 0.1, y1 - h * 0.05], fill=fill)

    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=28))
    base.paste(overlay, (0, 0), overlay)


def draw_snowflakes(base: Image.Image, rng_seed: int = 42) -> None:
    import random

    random.seed(rng_seed)
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = base.size

    def flake(cx: float, cy: float, size: float, opacity: float) -> None:
        arms = 6
        col = (255, 255, 255, int(255 * opacity))
        for i in range(arms):
            ang = math.pi * 2 * i / arms
            x2 = cx + math.cos(ang) * size
            y2 = cy + math.sin(ang) * size
            draw.line([(cx, cy), (x2, y2)], fill=col, width=max(1, int(size * 0.12)))
            for branch in (-0.35, 0.35):
                ba = ang + branch
                bx = cx + math.cos(ang) * size * 0.55
                by = cy + math.sin(ang) * size * 0.55
                bx2 = bx + math.cos(ba) * size * 0.35
                by2 = by + math.sin(ba) * size * 0.35
                draw.line([(bx, by), (bx2, by2)], fill=col, width=1)

    zones = [
        (0.62, 0.98, 0.06, 0.38, 0.05, 0.12),
        (0.70, 0.99, 0.45, 0.88, 0.04, 0.10),
        (0.03, 0.16, 0.20, 0.45, 0.03, 0.08),
    ]
    for x0, x1, y0, y1, smin, smax in zones:
        n = int((x1 - x0) * (y1 - y0) * w * h * 0.000018)
        for _ in range(max(n, 8)):
            cx = random.uniform(x0, x1) * w
            cy = random.uniform(y0, y1) * h
            size = random.uniform(smin, smax) * min(w, h)
            opacity = random.uniform(0.15, 0.45)
            flake(cx, cy, size, opacity)

    base.paste(overlay, (0, 0), overlay)


def draw_bottom_band(base: Image.Image) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = base.size
    draw.rectangle([0, int(h * 0.78), w, h], fill=(210, 232, 248, 90))
    draw.rectangle([0, int(h * 0.84), int(w * 0.42), h], fill=(195, 220, 240, 110))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=6))
    base.paste(overlay, (0, 0), overlay)


def soft_shadow(size: tuple[int, int], radius: int = 18) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([8, 8, size[0] - 8, size[1] - 8], radius=4, fill=200)
    return mask.filter(ImageFilter.GaussianBlur(radius=radius))


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    canvas = winter_gradient((W, H))
    draw_waves(canvas)
    draw_snowflakes(canvas)
    draw_bottom_band(canvas)

    # Editorial left anchor; soft fade on the right into widescreen negative space
    target_h = int(H * 0.90)
    target_w = int(src.width * target_h / src.height)
    collage = src.resize((target_w, target_h), Image.Resampling.LANCZOS)

    feather_w = int(target_w * 0.18)
    mask = Image.new("L", (target_w, target_h), 255)
    for col in range(feather_w):
        alpha = int(255 * (col / feather_w) ** 1.5)
        for row in range(target_h):
            mask.putpixel((target_w - 1 - col, row), alpha)

    x = int(W * 0.04)
    y = (H - target_h) // 2

    canvas.paste(collage, (x, y), mask)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas_rgb = canvas.convert("RGB")
    canvas_rgb.save(OUT, "JPEG", quality=92, optimize=True, subsampling=0)
    print(f"Saved {OUT} ({W}x{H})")


if __name__ == "__main__":
    main()
