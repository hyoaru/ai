---
name: image-manipulation-image-magick
description: Process and manipulate images using ImageMagick. Supports resizing, format conversion, batch processing, and retrieving image metadata. Use when working with images, creating thumbnails, resizing wallpapers, or performing batch image operations.
compatibility: Requires ImageMagick on PATH as `magick` (7.x) or `convert` (6.x).
---

# Image Manipulation with ImageMagick

ImageMagick 7 uses `magick`; ImageMagick 6 uses `convert`, `identify` and `mogrify`
as separate commands. Detect once, then use the variable:

```bash
if command -v magick >/dev/null; then IM=magick; else IM=convert; fi
command -v "$IM" >/dev/null || { echo "ImageMagick not found"; exit 1; }
```

## Resolve the binary

Never assume the name. On Debian/Ubuntu install with `apt install imagemagick`;
on macOS with `brew install imagemagick`. If `magick` is missing and `convert`
exists, the system is on 6.x.

## Identify

```bash
# Dimensions
magick identify -format "%wx%h\n" image.jpg

# One line per file
for img in images/*; do
  magick identify -format "%f: %wx%h\n" "$img"
done

# Full metadata
magick identify -verbose image.jpg
```

## Resize and convert

```bash
# Fit inside a box, keep aspect ratio
magick input.jpg -resize 427x240 output.jpg

# Exact size, ignore aspect ratio
magick input.jpg -resize 427x240! output.jpg

# Minimum size, keep aspect ratio
magick input.jpg -resize 427x240^ output.jpg

# Format conversion
magick input.png output.webp
```

Resize flags: `!` forces exact dimensions, `^` fills the box, no flag fits inside.
Add `>` or `<` to resize only when larger or only when smaller.

## Batch

```bash
mkdir -p thumbnails
for img in images/*; do
  [ -f "$img" ] || continue
  magick "$img" -resize 427x240 "thumbnails/$(basename "$img")"
done
```

Filter by dimensions before processing:

```bash
for img in images/*; do
  read -r w h < <(magick identify -format "%w %h" "$img")
  if [ "$w" -gt 1920 ] || [ "$h" -gt 1080 ]; then
    magick "$img" -resize 1920x1080 "out/$(basename "$img")"
  fi
done
```

In-place, no output directory, no shell loop:

```bash
mogrify -resize 427x240 thumbnails/*.jpg
```

`mogrify` overwrites its inputs. Copy first, or test on one file.

## Wallpapers

```bash
# Fill a 2560x1440 screen, crop overflow
magick wallpaper.jpg -resize 2560x1440^ -gravity center -extent 2560x1440 out.png
```

## Rules

1. Quote every path; image names contain spaces.
2. Check dimensions before a heavy batch.
3. Prefer `mogrify` for bulk in-place edits; prefer `magick` when writing elsewhere.
4. Never overwrite originals without a copy, unless the user asked for in-place.

## Limits

- Large batches are memory-hungry; process in chunks.
- Some formats need extra delegates (HEIC, RAW, AVIF). Check `magick -list format`.
- Vector output (SVG, PDF) rasterises; unrelated to `svg-diagram`, which authors SVG.
