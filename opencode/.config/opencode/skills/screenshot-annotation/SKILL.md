---
name: screenshot-annotation
description: Build and maintain the annotated screenshot pipeline in a docs repo. Crops raw screenshots, writes SVG annotation overlays, renders final PNGs, and syncs the Markdown embeds. Use when asked to add, replace, annotate, or update screenshots for a handbook, guide, or test plan.
---

# Screenshot annotation

Pipeline: `raw/` → `clean/` → `overlays/` → `final/`, with the docs embedding `final/`.

## Layout

Keep the repo's existing folder names and render script. The common shape:

```text
Screenshots/
├── raw/        originals as pasted
├── clean/      cropped, unannotated, full resolution
├── overlays/   editable SVG per image
├── final/      rendered annotated PNGs (docs point here)
└── render-annotations.sh
```

Naming: `<mode>-<screen>-<state>`, for example `multi-comm-testing-passed`.
When a screen is re-shot, replace the existing name in place so doc links survive. Add a new name only for a new state.

## Steps

1. **Crop raw to clean.** Find the window bounds, then crop; never resize.
   ```bash
   magick "raw/<name>-raw.png" -fuzz 8% -trim -format "%wx%h%O\n" info:
   magick "raw/<name>-raw.png" -crop <W>x<H>+<X>+<Y> +repage "clean/<name>.png"
   ```
   Done when the clean image has no desktop, shadow, or rounded-corner background.

2. **Write one overlay per clean image.** Reference `../clean/<name>.png`; let the render script inline it as a data URI. Copy the house style from existing overlays:
   - circles `r=11`, fill `#2563eb`, 11px bold white numeral
   - grey `#64748b` leader lines only when the target needs pointing at
   - legend below the image body; canvas height = image height + `64 + 24 × items + 10`

   ```xml
   <svg viewBox="0 0 W H" width="W" xmlns="http://www.w3.org/2000/svg">
     <rect width="W" height="H" fill="#ffffff"/>
     <image href="../clean/NAME.png" x="0" y="0" width="W" height="IH"/>
     <circle cx="CX" cy="CY" r="11" fill="#2563eb"/>
     <text x="CX" y="CY+4" font-size="11" font-weight="700" fill="#ffffff"
           text-anchor="middle">1</text>
     <text x="24" y="IH+40" font-size="14" font-weight="700">Title</text>
     <!-- legend rows at IH+64, IH+88, ... -->
   </svg>
   ```

3. **Measure coordinates from the clean PNG, not from a preview.** Image previews are rescaled, so eyeballed coordinates land on the wrong control. Draw a 100px grid and read the target off it:
   ```python
   from PIL import Image, ImageDraw
   im = Image.open("clean/<name>.png").convert("RGB"); d = ImageDraw.Draw(im)
   for x in range(0, im.width, 100):
       d.line([(x, 0), (x, im.height)], fill=(255, 0, 0)); d.text((x + 2, 2), str(x), fill=(255, 0, 0))
   for y in range(100, im.height, 100):
       d.line([(0, y), (im.width, y)], fill=(255, 0, 0)); d.text((2, y - 12), str(y), fill=(255, 0, 0))
   im.save("/tmp/grid.png")
   ```
   Put circles in blank space, on a button's empty end, or in the gap beside a field. Keep text, indicators, and checkboxes uncovered.

4. **Render, lint, inspect.** Run the repo's `render-annotations.sh`, then the checker from this skill:
   ```bash
   python3 ~/.config/opencode/skills/screenshot-annotation/scripts/lint_annotations.py
   ```
   It needs Pillow. It flags markers that are out of bounds, below the image, overlapping each other, sitting on text or a coloured control, leader lines that cross text, and legend text that overflows the canvas. Fix every error and every warning, re-render, then view each changed `final/*.png`. Done when the linter is clean and every marker sits on its documented target.

   The linter reads pixels only; it cannot tell whether a blank-looking spot is the *right* control. Confirm the target against the 100px grid and the rendered image.

5. **Sync the docs.** Update or add embeds next to the step that describes the screen. Use real UI labels from the shot, even when the prose is older (`Testing Report`, not `Functional Testing Report`). Then verify:
   ```bash
   grep -rho "Screenshots/final/[a-z0-9.-]*\.png" --include="*.md" . \
     | sort -u | while read p; do test -f "$p" || echo "MISSING $p"; done
   ```
   Delete artifacts for screens no longer referenced; keep unused re-shots out of the tree.

6. **Regenerate the contact sheet** if the repo has one, from the current `final/*.annotated.png`. Done when the sheet contains every current final and no removed screen.

## Split captures

A long document (a report, a worksheet) may arrive as overlapping top/bottom screenshots. Join them at a shared row, not with a blind append:

1. Find table borders by counting dark pixels per row; the same border appears near the bottom of the top shot and near the top of the bottom shot.
2. Crop the top shot up to that border, crop the bottom shot from it, then `magick top.png bottom.png -append clean/<name>.png` and `+repage`.
3. View the seam. Done when the shared row appears exactly once and no row is missing.

## Redaction

Real serials, hostnames, user names, tokens, and local paths can appear. Follow the repo's precedent first. Redact by solid rectangle on the raw copy, then crop and annotate.

## Before commit

- `raw/`, `clean/`, `overlays/`, `final/` names match for every annotated screen.
- No desktop background, no window chrome outside the app frame, full resolution in `clean/`.
- Every final used by a doc, and every doc image exists.
- Overlays stay editable: the source SVG references `../clean/...`, never a data URI.
