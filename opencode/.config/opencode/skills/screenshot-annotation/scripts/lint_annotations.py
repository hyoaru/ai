#!/usr/bin/env python3
"""Lint screenshot annotation overlays: marker bounds, legend fit, covered UI."""
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageStat

NS = "{http://www.w3.org/2000/svg}"
EDGE_THRESHOLD = 60
TEXT_EDGE_FRACTION = 0.10
TEXT_STDDEV = 30
SAT_FRACTION = 0.20
CHAR_WIDTH = 6.6


def lint(svg_path):
    errors = warnings = 0
    root = ET.parse(svg_path).getroot()
    width = int(float(root.get("width") or root.get("viewBox").split()[2]))
    image_el = root.find(f"{NS}image")
    if image_el is None:
        print(f"{svg_path.name}:1: ERROR no <image> element")
        return 1, 0
    ih = int(float(image_el.get("height")))
    iw = int(float(image_el.get("width")))
    href = image_el.get("href") or image_el.get(f"{{http://www.w3.org/1999/xlink}}href")
    clean = (svg_path.parent / href).resolve()
    if not clean.exists():
        print(f"{svg_path.name}:1: ERROR image not found: {href}")
        return 1, 0
    img = Image.open(clean).convert("RGB")
    if img.size != (iw, ih):
        print(f"{svg_path.name}:1: ERROR image is {img.size[0]}x{img.size[1]}, overlay says {iw}x{ih}")
        errors += 1
    gray = img.convert("L")
    edges = gray.filter(ImageFilter.FIND_EDGES)

    for i, circle in enumerate(root.iter(f"{NS}circle"), 1):
        cx = float(circle.get("cx", 0))
        cy = float(circle.get("cy", 0))
        r = float(circle.get("r", 0))
        if r > 20:
            continue  # legend numeral, not a marker
        if cy + r > ih:
            if cx < 60:
                continue  # legend bullet
            errors += 1
            print(f"{svg_path.name}:{i}: ERROR marker {i} below image at ({cx:.0f},{cy:.0f})")
            continue
        if cx - r < 0 or cx + r > iw or cy - r < 0:
            errors += 1
            print(f"{svg_path.name}:{i}: ERROR marker {i} out of bounds at ({cx:.0f},{cy:.0f})")
            continue

        box = (int(cx - r), int(cy - r), int(cx + r) + 1, int(cy + r) + 1)
        w, h = box[2] - box[0], box[3] - box[1]
        mask = Image.new("L", (w, h), 0)
        ImageDraw.Draw(mask).ellipse((r - 0.5, r - 0.5, r + 1.5, r + 1.5), fill=255)
        mask_data = list(mask.getdata())
        covered = sum(1 for m in mask_data if m)
        edge_frac = sum(1 for p, m in zip(edges.crop(box).getdata(), mask_data)
                        if m and p > EDGE_THRESHOLD) / covered
        stddev = ImageStat.Stat(gray.crop(box), mask).stddev[0]
        sat = sum(1 for px, m in zip(img.crop(box).getdata(), mask_data)
                  if m and max(px) - min(px) > 80)
        sat_frac = sat / covered

        if edge_frac > TEXT_EDGE_FRACTION or stddev > TEXT_STDDEV:
            warnings += 1
            print(f"{svg_path.name}:{i}: WARN marker {i} at ({cx:.0f},{cy:.0f}) may cover a label"
                  f" (edges {edge_frac:.2f}, std {stddev:.0f})")
        if sat_frac > SAT_FRACTION:
            warnings += 1
            print(f"{svg_path.name}:{i}: WARN marker {i} at ({cx:.0f},{cy:.0f}) covers a coloured control"
                  f" ({sat_frac:.2f})")

    numerals = []
    for text in root.iter(f"{NS}text"):
        if text.get("class") == "n" and text.text and text.text.strip().isdigit():
            numerals.append((float(text.get("x", 0)), float(text.get("y", 0))))
    for circle in root.iter(f"{NS}circle"):
        if float(circle.get("r", 0)) > 20:
            continue
        cx, cy = float(circle.get("cx", 0)), float(circle.get("cy", 0))
        if not any(abs(x - cx) <= 2 and abs(y - (cy + 4)) <= 3 for x, y in numerals):
            warnings += 1
            print(f"{svg_path.name}: marker at ({cx:.0f},{cy:.0f}) has no centred numeral")

    markers = []
    for i, circle in enumerate(root.iter(f"{NS}circle"), 1):
        r = float(circle.get("r", 0))
        if r > 20:
            continue
        cx, cy = float(circle.get("cx", 0)), float(circle.get("cy", 0))
        if cy + r > ih and cx < 60:
            continue
        markers.append((i, cx, cy, r))
    for a in range(len(markers)):
        for b in range(a + 1, len(markers)):
            _, ax, ay, ar = markers[a]
            _, bx, by, br = markers[b]
            if ((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5 < ar + br + 2:
                warnings += 1
                print(f"{svg_path.name}: markers {markers[a][0]} and {markers[b][0]} overlap")

    for line in root.iter(f"{NS}line"):
        if line.get("stroke") == "#e2e8f0":
            continue
        x1, y1 = float(line.get("x1", 0)), float(line.get("y1", 0))
        x2, y2 = float(line.get("x2", 0)), float(line.get("y2", 0))
        dist = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
        if dist < 60:
            continue
        steps = int(dist)
        dark = 0
        samples = 0
        for s in range(16, steps - 16, 2):
            t = s / dist
            x, y = int(x1 + (x2 - x1) * t), int(y1 + (y2 - y1) * t)
            block = gray.crop((max(0, x - 2), max(0, y - 2), min(iw, x + 3), min(ih, y + 3)))
            samples += 1
            if sum(1 for p in block.getdata() if p < 140) >= 4:
                dark += 1
        if samples and dark >= 8 and dark / samples > 0.15:
            warnings += 1
            print(f"{svg_path.name}: leader from ({x1:.0f},{y1:.0f}) to ({x2:.0f},{y2:.0f}) crosses text"
                  f" ({dark / samples:.2f})")

    for text in root.iter(f"{NS}text"):
        if text.get("class") != "legend":
            continue
        x = float(text.get("x", 0))
        est = x + len(text.text or "") * CHAR_WIDTH
        if est > width - 8:
            warnings += 1
            print(f"{svg_path.name}: legend overflows canvas by {est - width + 8:.0f}px: {text.text!r}")

    return errors, warnings


def main():
    args = sys.argv[1:]
    if args and args[0] in ("-h", "--help"):
        print("usage: lint_annotations.py [overlay.svg ...]")
        print("default: overlays/*.annotations.svg under the current directory")
        return 0
    paths = [Path(p) for p in args]
    if not paths:
        paths = sorted(Path(".").glob("overlays/*.annotations.svg"))
    errors = warnings = 0
    for path in paths:
        e, w = lint(path)
        errors += e
        warnings += w
    print(f"\n{len(paths)} overlay(s): {errors} error(s), {warnings} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
