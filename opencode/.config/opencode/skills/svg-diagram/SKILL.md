---
name: svg-diagram
description: Hand-authored SVG graphics — diagrams, icons, illustrations, charts, and figures. Load this skill whenever you draw, sketch, plot, or visualize anything as SVG, and always before writing SVG XML. Triggers - "draw a diagram", "make an icon", "svg", "illustration", "figure", "chart", "visualize this", "replace this ascii art". Never answer a diagram request with ASCII art or Mermaid prose. Ships a bundled SVG linter, tuned for diagrams. For one-shot generation, prefer invoking it from a subagent so the main context does not carry this skill plus the SVG XML; for multi-round tweaking, use it directly in the main context.
---

# SVG Graphics Conventions

This skill covers hand-authored SVG as a family: diagrams, icons, illustrations, charts, and figures. The name is kept for compatibility; the rules are not limited to diagrams.

Most rules are universal. Sections marked **diagrams only** do not apply to icons or illustrations.

## Choose the graphic mode

| **Mode** | **Examples** | **Apply** |
| --- | --- | --- |
| Diagram | Architecture, flowchart, sequence, lifecycle, org chart, timeline | Layout rules, connector rules, arrowheads, block spacing, title block. |
| Icon | App icon, mark, favicon, badge | Silhouette, safe area, small-size test, export set. Skip connectors and box layout. |
| Illustration | Cover, explainer, poster, spot art | Composition, focal point, negative space, typography, colour. Skip connector math. |
| Chart | Bar, line, scatter, gauge | Diagram layout plus data marks, axes, labels, and legend placement. |

If one SVG mixes modes, apply the stricter rule for each part. Do not force flowchart boxes onto an icon or illustration.

## Output location and referencing

> Visual work goes in SVG, never ASCII art. That rule decides *whether* to draw; this skill covers *how*, starting with where the file lands.

- Put a figure in an `assets/` directory next to the document (e.g. `docs/foo.md` → `docs/assets/foo-arch.svg`).
- Put an icon next to the app assets (e.g. `assets/app-icon.svg`) with its exported PNG and ICO set.
- Reference it from markdown with a relative path, `![title](assets/xxx.svg)`. Do not inline SVG XML.
- When data in the document changes, the corresponding SVG must be updated too. A figure that contradicts the prose beside it is worse than no figure.

## Core principles

### Get it right on the first pass
The first SVG you generate must already satisfy every item in the verification checklist at the end of this document. Do not rely on user feedback to fix basic layout problems (spacing, padding, alignment, viewBox clipping). After generating, walk the checklist yourself and fix anything you find before showing the result.

### No overlapping elements
- Text must not sit on top of boxes or lines
- Lines must not cut through boxes (unless the line is an arrow terminating at that box)
- Keep 10–20px between text and lines
- **For spacing between sibling/adjacent boxes see the "Block spacing" section below** (single standard: ≥25px, 25–30px recommended)
- Put color-key legends outside the diagram body (bottom or side), never overlapping the content area

```xml
<!-- ✅ Correct: label sits beside the line -->
<path d="M35,200 C 35,120 ..." .../>
<text x="55" y="200">Label text</text>  <!-- 20px clearance -->

<!-- ❌ Wrong: label sits on the line -->
<text x="35" y="200">Label text</text>
```

### Visual balance
The left and right halves should carry similar visual weight; add or remove annotation boxes to even them out.

## Layout rules (diagrams only)

### Centering
```
content width = right edge of rightmost element - left edge of leftmost element
left margin   = (viewBox width - content width) / 2
```

**Center the title on the *content* center, not the viewBox center** (they differ whenever the content is asymmetric):

```xml
<!-- content center = (content left edge + content right edge) / 2 -->
<text x="[content center x]" y="[top_padding + font_ascent]" text-anchor="middle">Title</text>
```

Only when the content is left-right symmetric does `content center x = viewBox width / 2`. When it is asymmetric, center the whole group with `<g transform="translate(...)">` and update the title's `x` to the new content center as well.

### Shifting everything after the fact

If you only notice asymmetric left/right (or top/bottom) padding after the SVG is finished, you do not need to touch every coordinate. Wrap the content in one `<g transform="translate(dx, dy)">`:

```xml
<svg viewBox="0 0 800 460" ...>
  <defs>...</defs>
  <g transform="translate(22, 0)">
    <!-- all content here, coordinates unchanged -->
  </g>
</svg>
```

**Computing the offset**: `dx = (right padding - left padding) / 2`, where padding is the distance from the viewBox edge to the nearest content element.
- `dx > 0`: shift content right (use when content sits too far left)
- `dx < 0`: shift content left (use when content sits too far right)

When to use it: the content as a whole is off-center and you do not want to edit every `x` coordinate. Downside: the coordinates in the file no longer equal rendered positions, so later edits require mentally subtracting the offset — if a larger layout rework is coming, fold the offset into the individual coordinates and drop the `<g>`.

### viewBox margins
The title is part of the content, so top and bottom margins are measured from the title:

```
title y      = margin + font ascent (≈ font-size × 0.75)
viewBox height = bottom y of content + margin
```

**Recommended margin**: 20–25px

```xml
<!-- Example: 24px serif title at baseline 40, 22px margin -->
<!-- title y = 20 + 16×0.75 ≈ 32 -->
<!-- content bottom 270px, viewBox height = 270 + 25 = 295 -->
<svg viewBox="0 0 680 295" ...>
  <text x="340" y="32" font-size="16">Title</text>
  ...
</svg>
```

### Box layout
- Boxes in the same row differ in size by ≤60px; text is centered (`text-anchor="middle"`)
- Boxes in the same column share a center line
- An outer box fully encloses the inner boxes: `outer size = content size + padding × 2`

### Grouping panels (containers)

Used to group related boxes together (e.g. "Server", "Client", "Employee instances").

**Preferred: soft-tinted panels with hairline borders** (dashed strokes are acceptable only for state semantics — a not-to-scale span, a failure loop):

- Panel fill: `panel` token (primary zone), `panel-nested` (nested zone), or none (outer zones)
- Border: `#dbe1e8`-class hairline, 1px, radius 10–12
- Inner padding: 20px left/right, 30px below the last card
- Title: 10px, weight 600, uppercase, 0.5px letter-spacing, `muted` token, left-aligned to the panel's card column (same x as the inner cards)

**Style consistency**: within one diagram, every grouping panel must share fill, border, radius, padding, and title treatment. Dashed grouping boxes, when used, must likewise share `stroke-dasharray` (6,4), radius, fill, and padding.

**Vertical-centering trap**: compute the group box's vertical position from the combined height of **title + inner content**, not from the box alone. With a title, the top of the box is occupied for roughly 20–25px, and inner boxes start below it:

```xml
<!-- ✅ Group box: title + content laid out as a whole -->
<!-- box top y=100, title takes 20px, inner boxes start at y=125 -->
<rect x="50" y="100" width="200" height="120" rx="10"
      stroke="#94a3b8" stroke-dasharray="6,4" fill="#f8fafc"/>
<text x="60" y="114" font-size="11" fill="#64748b">Server</text>
<!-- inner boxes -->
<rect x="65" y="125" width="170" height="36" rx="6" .../>
<rect x="65" y="170" width="170" height="36" rx="6" .../>
```

**Connectors pointing at a group**: when a connector logically targets a set of elements rather than one of them, terminate it on the group box boundary instead of on a single member. Alternatively, wrap the elements in a grouping box and point the arrow at that box.

### Box dimensions
Derive box height from the font size so there is enough inner padding:

| Content | Height formula | Example (12px font) |
|---------|----------------|---------------------|
| One line | font-size × 3 | 36px |
| Two lines | font-size × 3 + line height | 36 + 18 = 54px |
| Multiple lines | font-size × 3 + (lines - 1) × line height | +18px per extra line |

**Where the formula comes from**: `font-size × 3 = top padding (≈font-size) + glyph height (≈font-size) + bottom padding (≈font-size)`. Scale the same ratio for non-standard font sizes.

**Recommended line height**: font-size × 1.5 (e.g. 18px for a 12px font)

### Vertically centering text in a box (baseline positioning)

In SVG, `<text y=...>` is the **baseline**, not the top of the glyph. To center text optically inside a box:

```
text y = box center y + font-size × 0.35
       = box y + box height/2 + font-size × 0.35
```

The 0.35 factor is an empirical value for "optical glyph center to baseline" (roughly one third of the font size).

**Keep the two factors apart**:
- `font-size × 0.75` (ascent): for elements **positioned from the top**, such as titles (y = top_padding + ascent)
- `font-size × 0.35` (baseline offset): for **vertical centering inside a box**

```xml
<!-- One line: height = 12 × 3 = 36px -->
<rect x="30" y="50" width="110" height="36" rx="6" .../>
<!-- y = 50 + 36/2 + 12×0.35 = 50 + 18 + 4.2 ≈ 72 -->
<text x="85" y="72" ...>Single line</text>

<!-- Two lines: height = 36 + 18 = 54px -->
<rect x="30" y="50" width="110" height="54" rx="6" .../>
<text x="85" y="70" ...>First line</text>
<text x="85" y="88" ...>Second line</text>  <!-- 18px apart -->
```

### Display size
```xml
<svg viewBox="0 0 750 400" width="750" xmlns="http://www.w3.org/2000/svg">
```

| Diagram type | width |
|--------------|-------|
| Simple list | 400px |
| Flowchart | 600–700px |
| Architecture diagram | 700–800px |

## Connector rules (diagrams only)

### Choosing a connector
Use a straight `L` line for co-axial connections; use smooth `C`/`Q` curves whenever the path **turns or routes around** something. Never use right-angle elbows.

```xml
<!-- ✅ Horizontally co-axial: straight line -->
<path d="M190,77 L 320,77" .../>

<!-- ✅ Vertically co-axial: straight line -->
<path d="M130,145 L 130,213" .../>

<!-- ❌ Right-angle elbow for a turn -->
<path d="M100,100 L100,200 L200,200" .../>

<!-- ✅ Smooth curve for a turn -->
<path d="M100,100 C 100,150 150,200 200,200" .../>
```

| Case | Recommended | Syntax |
|------|-------------|--------|
| Co-axial (horizontal/vertical) | L | `L endx,endy` |
| Simple turn | Q | `Q ctrlx,ctrly endx,endy` |
| S-curve / complex path | C | `C ctrl1x,ctrl1y ctrl2x,ctrl2y endx,endy` |

### Arrow rules
- **Direction comes from the final path segment**: rightward means x increases, downward means y increases
- **Symmetric clearance**: 5px between the arrow and the source box, and the same visual clearance at the target box
- **Centered labels**: `x = (source right edge + target left edge) / 2`, together with `text-anchor="middle"`

**Fixing arrow direction on curved paths**: `orient="auto"` aligns the arrowhead with the tangent at the end of the path. The end tangent of a C/Q curve can be skewed, which makes the arrowhead look crooked. The fix: place the second control point (cp2) so that the direction cp2 → end point is exactly the direction you want the arrowhead to face.

```xml
<!-- ❌ cp2 placed arbitrarily, arrow direction uncontrolled -->
<path d="M100,100 C 100,200 250,200 300,250" marker-end="url(#arrow)"/>

<!-- ✅ cp2 shares x with the end point, tangent naturally points down -->
<path d="M100,100 C 100,200 300,220 300,250" marker-end="url(#arrow)"/>

<!-- ✅ cp2 shares y with the end point, tangent naturally points right -->
<path d="M100,100 C 100,200 270,250 300,250" marker-end="url(#arrow)"/>
```

**Rules for controlling arrow direction**:
| Desired direction | cp2 constraint | Example |
|-------------------|----------------|---------|
| ↓ down | cp2.x = end.x, cp2.y < end.y | `C ...,... ex,ey-20 ex,ey` |
| → right | cp2.y = end.y, cp2.x < end.x | `C ...,... ex-20,ey ex,ey` |
| ← left | cp2.y = end.y, cp2.x > end.x | `C ...,... ex+20,ey ex,ey` |
| ↑ up | cp2.x = end.x, cp2.y > end.y | `C ...,... ex,ey+20 ex,ey` |

**Computing path endpoints** (5px clearance, arrowhead extends 6px past the end of the line):

Core rule: **start 5px away from the source box, end 11px away from the target box** (5px clearance + 6px arrowhead extension).

Because we use `refX="2"` (the notch at the tail of the arrowhead), the tip extends 6px (8-2=6) beyond the end of the line, and the line joins the arrowhead at the center of its notch, so the join reads as continuous.

**Formulas for the four directions**:

| Direction | Start | End |
|-----------|-------|-----|
| → right | source right edge + 5 | target left edge - 11 |
| ← left | source left edge - 5 | target right edge + 11 |
| ↓ down | source bottom edge + 5 | target top edge - 11 |
| ↑ up | source top edge - 5 | target bottom edge + 11 |

```xml
<!-- Rightward arrow →: source right edge 180, target left edge 220 -->
<!-- start: 180+5=185, end: 220-11=209, tip reaches 209+6=215 -->
<path d="M185,70 L 209,70" marker-end="url(#arrow)"/>

<!-- Leftward arrow ←: source left edge 220, target right edge 180 -->
<!-- start: 220-5=215, end: 180+11=191, tip reaches 191-6=185 -->
<path d="M215,70 L 191,70" marker-end="url(#arrow)"/>

<!-- Downward arrow ↓: source bottom 140, target top 170 -->
<!-- start: 140+5=145, end: 170-11=159, tip reaches 159+6=165 -->
<path d="M130,145 L 130,159" marker-end="url(#arrow)"/>

<!-- Upward arrow ↑: source top 170, target bottom 140 -->
<!-- start: 170-5=165, end: 140+11=151, tip reaches 151-6=145 -->
<path d="M130,165 L 130,151" marker-end="url(#arrow)"/>
```

**Bidirectional example** (two boxes with arrows going both up and down):
```xml
<!-- box A bottom=375, box B top=420 -->
<!-- downward arrow: A→B -->
<path d="M320,380 L 320,409" marker-end="url(#arrow)"/>  <!-- 375+5, 420-11 -->
<!-- upward arrow: B→A -->
<path d="M480,415 L 480,386" marker-end="url(#arrow)"/>  <!-- 420-5, 375+11 -->
```

### Routing around obstacles
Keep detour paths at least 20px outside the obstacle's boundary:
```xml
<!-- Gateway right edge=620, detour path runs at x=650 -->
<path d="M600,313 Q 650,313 650,400 Q 650,640 635,685"
      fill="none" stroke="#a855f7" stroke-dasharray="6,4" marker-end="url(#arrow)"/>
```

### Block spacing (**single global standard**)
Spacing between adjacent boxes/blocks is **≥25px, 25–30px recommended**.
Documented exceptions live in "Documented exceptions" below: segmented bar segments may touch, and dense nested columns keep a >=24px rhythm inside their panel.

Breakdown: 5px start clearance + 11px end clearance and arrowhead extension + ≥6px of visible line + safety margin ≈ 25px. **At least 6px of visible line**, otherwise the arrow degenerates into a dot.

**Stay compact**: do not exceed 30px. Spacing that is too wide (>40px) makes the whole diagram feel loose and the connectors overly long. Aim for 5px / 11px at the two ends and 6–12px of visible line in between.

**Overall density**: when you are done, step back and judge the density — if the content area is clearly small relative to the viewBox (large blank regions), tighten spacing or shrink the viewBox. Common causes: box spacing >30px, viewBox margin >25px, excessive padding inside grouping boxes.

> This is the only block-spacing standard in this document; both "No overlapping elements" and the verification checklist refer back to it.

### Documented exceptions (decoded from DESIGN-TASTE.md)

The spacing and centering laws carry four deliberate exceptions. Each is implemented in
`tools/svg-lint` and each exists because a pattern the eye accepts would otherwise fail the
zero-error bar:

1. **Segmented bars** -- contiguous rect segments that share a y-interval and touch at their
   boundary (timeline stages, buffer vs remaining) are one visual unit divided at the divider
   line. `block-spacing` exempts same-height, same-y rect pairs whose gap is <=2px.
2. **Formula panels and timestamp tables** -- stacks of >=3 left-anchored lines sharing one left
   edge, and rows of >=3 same-baseline texts spread across a panel, are columns/grids by
   design. `baseline-offset` exempts both from the text-anchor=middle law.
3. **Perpendicular arrivals** -- an up-and-over arc whose cp2 shares the tip's x (plumb landing
   on a chord-horizontal arc) legitimately offsets cp2 along the chord's perpendicular.
   `connector-geometry` classifies curves by their arrival tangent (cp2 to tip), not by the
   chord, and stands the level/plumb arm down when the arrival is perpendicular to the chord.
4. **Sequence header cards** -- 180x32 single-line actor headers are legal: the box-height law
   reads as font-size x 2.5 minimum (12px -> 30px) with x3 recommended, not x3 required.
### SVG paint order (z-order)

SVG has no z-index — **elements painted later sit on top**. Order them like this:

```xml
<!-- 1. Bottom layer: background boxes (dashed grouping boxes, swimlanes) -->
<rect ... stroke-dasharray="6,4" fill="#f8fafc"/>

<!-- 2. Middle layer: connectors and arrows -->
<path d="..." marker-end="url(#arrow)"/>

<!-- 3. Top layer: boxes and text -->
<rect ... fill="#dbeafe"/>
<text ...>Label</text>
```

**Common mistake**: painting connectors first and the dashed background box afterwards → the connectors get covered.

**Exception: cross-layer loop-back lines**: connectors that must **span several boxes** — iteration loops, cross-region dashed lines — have to be painted after the boxes (layer 4), otherwise the boxes hide them:

```xml
<!-- 1. background boxes -->
<!-- 2. ordinary connectors -->
<!-- 3. boxes and text -->
<!-- 4. cross-layer loop-back lines (topmost, painted over the boxes) -->
<path d="..." stroke-dasharray="6,4" marker-end="url(#arrow-accent)"/>
```

## Icon rules

App icons and marks are not small diagrams. Remove connectors, boxes, and labels unless they are part of the mark.

- Use a `1024×1024` canvas for an app icon. Keep it square; the rounded-square mask is a platform choice, not a universal rule.
- Keep at least a 10% safe margin. The mark must survive a circular or rounded-square crop.
- Design the silhouette first. If the shape is unclear in one colour, the icon is not finished.
- Use two or three colours. One accent is enough for a mark.
- No stroke thinner than 24px at 1024 scale. Thin detail disappears at 16–32px.
- No small text. A single letterform is fine; words are not.
- Optically centre the mark, not just the geometric bounds.
- Test at 16, 32, 64, and 256px. Drop any detail that turns to noise at 16–32.
- Export SVG plus 1024, 512, and 256 PNG. For Windows, export a multi-size ICO at 16, 24, 32, 48, 64, 128, 256.
- The bundled linter is diagram-oriented. For icons, render at target sizes and inspect. Its palette and connector warnings do not apply.

## Illustration rules

- Establish one focal point and a clear reading order.
- Use a grid. Align edges and baselines even when the composition is loose.
- Negative space is part of the composition, not leftover room.
- Do not import flowchart connectors or node-card layout unless the illustration is explaining a flow.
- Typography rules still apply. A display title can carry more weight than a diagram title, but keep the role scale.
- Check the illustration in grayscale and at 50%. If the hierarchy collapses, the contrast is doing too much work.
- Prefer one strong idea over many decorative details.

## Estimating text width (overflow protection)

Before placing text, estimate its right edge and confirm it does not intrude on neighboring elements:

| Font size | Latin char width (approx.) |
|-----------|---------------------------|
| 8px | 4.5px |
| 9px | 5.0px |
| 10px | 5.5px |
| 11px | 6.0px |
| 12px | 7.0px |
| 14px | 8.0px |
| 16px | 9.0px |
| 24px | 13.0px |

**Estimation formulas**:
- `text-anchor="start"`: right edge ≈ x + char count × char width
- `text-anchor="middle"`: left/right edge ≈ x ± (char count × char width) / 2
- `text-anchor="end"`: left edge ≈ x - char count × char width

Check before placing: text right edge + 10px < left edge of the neighbor to its right.

```xml
<!-- ❌ Text "4K tokens (= mini-batch)" starts at x=274 -->
<!-- 24 chars × 5px ≈ 120px, right edge ≈ 394, intrudes on the box at x=350 -->
<text x="274" y="115" font-size="9">4K tokens (= mini-batch)</text>

<!-- ✅ Moved below the box and centered, intrudes on nothing -->
<text x="154" y="138" font-size="9" text-anchor="middle">4K tokens (= mini-batch)</text>
```

### Edge label placement (measured)

- Horizontal arrow: label 14px above the line, centered on it.
- Vertical arrow: label 15px to the right, vertically centered on the run.
- Label width (chars x ~7px at 10px/1.5px tracking) must fit its gap with >=12px to every border, card, and line. If it cannot fit, widen the gap or drop the label.
## Placing labels on curves

A label describing an arc or curve must not sit on the path itself (the line would run through the text) — put it on the convex or concave side of the curve:

```xml
<!-- ❌ Label at y=218 while the curve passes near y=225: the line cuts the text -->
<text x="350" y="218">Skip Connection</text>
<path d="M82,165 C 82,225 620,225 646,225" .../>

<!-- ✅ Label at y=222, lowest point of the curve at y=260, 38px apart -->
<text x="350" y="222">Skip Connection</text>
<path d="M82,149 C 82,260 600,255 640,255" .../>
```

**Rule**: keep ≥15px between the label and the nearest point on the curve. For a downward-bending curve put the label above it; for an upward-bending curve put it below.

## Coordinate management

### Record boundaries in comments
```xml
<!-- Gateway: x=280, y=55, width=340, height=435, right edge=620, bottom edge=490 -->
<rect x="280" y="55" width="340" height="435" .../>
```

### When you move an element, update in lockstep
1. viewBox dimensions
2. Every arrow to/from that element (start point, end point, control points)
3. Positions of related labels
4. **The dashed background/grouping box that wraps the element** (swimlane, container) — the most commonly missed one
5. Other boxes aligned with it in the same row/column
6. Any other affected elements

## Style rules

### Typography (role-based, font-agnostic)

Use at most two faces: one **display serif** for titles, one **workhorse sans** for everything else. Do not add a third face. Pick the pair once per document set and keep it.

**Every SVG declares its fonts in `<style>`** so text renders with the intended face instead of the renderer default:

```xml
<style>
  text { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; }
  .title { font-family: Georgia, 'Times New Roman', serif; }
</style>
```

Keep the declaration even when every renderer you test has a good default: chat previews and office converters strip attributes first and `<style>` second, and the strip order is not the same everywhere. Use system faces only. Do not load a webfont or an external font file.

#### Roles and scale

| Role | Size | Weight | Case | Color |
|------|------|--------|------|-------|
| Title (display serif) | 24px | 400 | sentence | `ink` |
| Subtitle | 12.5px | 400 | sentence | `secondary` |
| Section / phase name | 18px | 600 | sentence | `ink` |
| Card name / body | 12.5px | 600 / 400 | sentence | `ink` or `secondary` |
| Secondary / annotation | 11px | 400 | sentence | `secondary` |
| Zone / edge label | 10px | 600 | uppercase | `muted` |

- Use five sizes: 24, 18, 12.5, 11, 10. Every size must have a job.
- Section and phase names are the leading words in a card. Set them at 18px; do not leave them at body size inside a large card, and do not let them compete with the 24px title.
- Adjacent roles must differ by at least 1.5px **and** one other axis: weight, color, or case.
- Never use 13px and 14px for different roles. That reads as a mistake.
- Minimum size is 10px, and 10px is for labels only. Body text is 12px or larger.
- If the target repo has a `DESIGN-TASTE.md`, adopt its sizes and faces verbatim.

#### Rhythm

- Body line height: `1.5` (18px at 12px). Compact labels: `1.25`. Title: `1.1`.
- Use one baseline rhythm per block: 18px for body lines, 22px for compact lists, 28px for title blocks.
- Section name to first body line: 24–26px. Do not leave the same 30px gap used above a 24px title.
- Do not stretch 12px text over 22px lines unless the block is deliberately airy. That is the usual cause of “the text looks spaced too far”.
- Space paragraphs by `0.75em–1em`. Do not add first-line indent as well.
- Align baselines across cards in the same row, even when the cards hold different line counts.

#### Weight and tone

- Regular `400` for body; semibold `600` for emphasis, card names, and labels.
- Avoid `700` for long text. Reserve it for a single number or a very short label.
- Never fake bold or italic. If the face lacks the weight, use color or space instead.
- Use weight, color, and space before adding another size.
- On dark surfaces, add leading or one weight step rather than adding tracking.

#### Tracking and case

- Title: `0` to `-0.01em`.
- Body: `0`. Never letter-space lowercase body text.
- Uppercase zone labels at 10px: `+0.5px` tracking. Edge labels: `+1.5px`.
- Sentence case for card names, body, annotations, and step text.
- Uppercase only zone/edge labels and short acronyms. No all-caps sentences.
- Do not use fake small caps. Uppercase plus tracking is the only allowed substitute.

#### Alignment and numerals

- Titles and zone labels align left to the content column.
- Center text inside node, state, and metric cards. Left-align lists, tables, and annotations.
- Do not mix centered and left-aligned text inside the same block.
- Right-align numeric table columns. Use `font-variant-numeric: tabular-nums` for tables, metrics, and step numbers.
- Optical vertical center: `y = box center + font-size × 0.35`.
- Do not stretch, condense, or outline text to fit. Shorten the copy or widen the box.

#### Fit and fallback

- A label should be at most `1.2 ×` its card width. Break at phrase boundaries, not mid-phrase.
- Avoid orphan words. If a second line has one short word, rewrite the label.
- Allow 30% expansion for localization. Shorten copy before shrinking type.
- Test at 100%, 50%, and grayscale. Roles must stay recognizable; labels must stay at 10px or above.
- Body text contrast is at least 4.5:1; large text and strokes at least 3:1.

#### Typography checklist

- [ ] At most two faces, one display and one workhorse.
- [ ] Five sizes or fewer, each with a distinct job.
- [ ] Line height is 1.5 for body, not 1.8 or more.
- [ ] Sentence case everywhere except zone and edge labels.
- [ ] Numbers are tabular in tables and metrics.
- [ ] No clipped, orphaned, or manually hyphenated labels.
- [ ] No text smaller than 10px.

### Title block structure

- Title baseline at 40. Subtitle baseline = title + 24 — a tight lockup; the title block reads as one unit.
- First content ink ≥ 16px below the subtitle ink. The title-block margin belongs to the subtitle, not the title.
- If the subtitle-to-content gap exceeds 40px, compress the content up to a 25px gap instead of leaving a void.
- Canvas height = lowest content ink + 25px, recomputed after every shift.
- Never wrap content in `transform="translate()"` groups: file coordinates must equal rendered coordinates. Audits read attributes; hidden transforms hide real clipping. When inheriting a file that has one, unwrap it and fold the offset into the coordinates.
- When editing paths programmatically, preserve command letters (`M`, `L`, `C`, `Q`, `Z`) — rebuilding a `d` string from numbers only yields invalid paths and invisible arrows.

### Color tokens (role-based, palette-agnostic)

Express color as **roles**, not decorations. Any coherent palette works — the relationships (contrast, weight, rarity) are the design. If the target repo has a `DESIGN-TASTE.md`, adopt its tokens verbatim.

| Role | Used for | Example value |
|------|----------|---------------|
| `ground` | page background | `#ffffff` |
| `panel` | primary zone fill | `#eef1f5` |
| `panel-nested` | nested zone fill | `#f1f4f8` |
| `card` | card fill | `#ffffff` |
| `hairline` | structural connectors, muted lines | `#94a3b8` |
| `border` | ordinary card borders | `#d8dee6` |
| `border-strong` | emphasized cards (boot chain) | `#c3ccd8` |
| `ink` | primary text | `#0f172a` |
| `secondary` | secondary text | `#64748b` |
| `muted` | zone/edge labels | `#94a3b8` |
| `accent` | data-flow edges, acquire markers, key verification lines | `#1d4ed8` |
| `failure` | failure paths and labels | `#dc2626` |

Palette discipline:

- **One accent**, used only where meaning lives (data-flow edges, acquire markers, verification highlights). Nothing decorative touches it.
- **Failure is semantic, not decorative**: red, dashed, red labels — it survives the one-accent rule.
- Contrast: body text ≥4.5:1, large text and strokes ≥3:1 against their fill. Never encode meaning by color alone — add a label or shape difference so it survives grayscale.
- Zones are soft-tinted panels with hairline borders — prefer tint over dashed strokes for grouping. Dashed strokes remain acceptable for state semantics (a not-to-scale span, a failure loop).

### Accessibility and output portability

Screen readers and non-browser renderers are first-class consumers. Both fail silently, so verify them by hand.

```xml
<svg width="800" height="500" viewBox="0 0 800 500" role="img" aria-labelledby="d-title">
  <title id="d-title">Request flow from gateway to billing</title>
  <desc>Gateway forwards auth, then billing charges, then webhook fires.</desc>
```

- **`<title>` is mandatory**, first child of `<svg>`. Add `role="img"` and `aria-labelledby` pointing at its id. Add `<desc>` when the structure is not obvious from the title.
- Keep text as real `<text>` elements, never outlined to paths, so it stays selectable, searchable, and screen-reader readable.
- Contrast: body text ≥4.5:1, large text and strokes ≥3:1 against their fill. Never encode meaning by color alone — add a label or shape difference so it survives grayscale.
- Scaled-up diagrams: add `vector-effect="non-scaling-stroke"` to connectors and borders, else stroke widths grow with the scale factor.
- Dark mode: only when the document has one. Use `currentColor` for text and strokes, or add `@media (prefers-color-scheme: dark)` swapping the background, text, and border tokens. Never hardcode pure `#000` or `#fff`.

Renderer compatibility — order of trust is presentation attributes > inline `<style>` > external CSS:

| Renderer | Constraint |
|----------|-----------|
| Browser | Everything works |
| resvg | Solid filters, no webfonts, no external resources |
| librsvg (Linux tools, GNOME) | Older versions ignore `<style>` — critical styling must also be a presentation attribute |
| Office / chat previews | Often strips `<style>` and filters — keep a plain-attribute fallback |

Never use `<foreignObject>`; it is the least supported feature in SVG.

## Arrowhead definitions (diagrams only)

Use a notched arrowhead rather than a plain triangle — it reads better:

```xml
<defs>
  <!-- Structural arrow: fill with the `hairline` token (markerUnits="userSpaceOnUse" is mandatory) -->
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto" markerUnits="userSpaceOnUse">
    <path d="M0,0 L8,4 L0,8 L2,4 z" fill="#94a3b8"/>
  </marker>
  <!-- Accent arrow: fill with the `accent` token — data-flow edges only -->
  <marker id="arrow-accent" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto" markerUnits="userSpaceOnUse">
    <path d="M0,0 L8,4 L0,8 L2,4 z" fill="#1d4ed8"/>
  </marker>
  <!-- Failure arrow: fill with the `failure` token — failure paths only -->
  <marker id="arrow-fail" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto" markerUnits="userSpaceOnUse">
    <path d="M0,0 L8,4 L0,8 L2,4 z" fill="#dc2626"/>
  </marker>
</defs>
```

**Arrow roles** (fills come from the color tokens, not a fixed set):

| ID | Token | Use |
|----|-------|-----|
| `arrow` | `hairline` | Structural connection |
| `arrow-accent` | `accent` | Data-flow edge — the edges that tell the story |
| `arrow-fail` | `failure` | Failure path |

Do not add per-category arrow colors (orange/green/purple); category meaning belongs in labels and zone titles, not in arrow hue.

**Key parameters**:
- `orient="auto"` rotates the arrowhead to follow the path direction
- `markerUnits="userSpaceOnUse"` **must be declared explicitly**, otherwise the default `strokeWidth` scales the arrowhead with line thickness (at stroke-width=2 the arrow doubles in size and blows past the intended clearance)
- `refX="2"` aligns the end of the line with the center of the arrowhead's tail notch, so the join looks natural
- `refY="4"` centers it vertically (arrow height 8, midpoint 4)
- The arrow path `M0,0 L8,4 L0,8 L2,4 z` forms the notched shape, with the tip at x=8
- The tip extends 6px (8-2=6) beyond the end of the line, so the end point is computed as `target edge - 11`

**Arrows on thick lines**: when stroke-width > 1.5 (e.g. heavy dashed lines), an 8×8 arrowhead looks too small. Define a proportionally larger marker:

```xml
<!-- Large failure arrow for thick lines (1.5×): tip extends 12-3=9px -->
<marker id="arrow-red-lg" markerWidth="12" markerHeight="12" refX="3" refY="6"
        orient="auto" markerUnits="userSpaceOnUse">
  <path d="M0,0 L12,6 L0,12 L3,6 z" fill="#dc2626"/>
</marker>
```

| Line stroke-width | Marker size | refX | Tip extension | End point formula |
|-------------------|-------------|------|---------------|-------------------|
| ≤ 1.5 | 8×8 | 2 | 6px | target edge - 11 |
| 1.5 ~ 2.5 | 12×12 | 3 | 9px | target edge - 14 |
| > 2.5 | 16×16 | 4 | 12px | target edge - 17 |

## XML special characters (high risk, always check)

SVG is XML, so special characters in text **must** be escaped or the entire SVG fails to render:

| Character | Escape | Example |
|-----------|--------|---------|
| `&` | `&amp;` | `Validate &amp; Sanitize` |
| `<` | `&lt;` | `x &lt; 10` |
| `>` | `&gt;` | `x &gt; 0` |
| `"` | `&quot;` | inside attributes |
| `'` | `&apos;` | inside attributes |

```xml
<!-- ❌ Wrong: unescaped & -->
<text>Load & Save</text>

<!-- ✅ Correct: escaped -->
<text>Load &amp; Save</text>
```

### Escaping when generating SVG programmatically

When generating SVG from Python/JS, text coming from external sources (CSV, database, API) must be escaped before it is concatenated into the SVG:

```python
def svg_escape(text):
    return str(text).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')

# ❌ Splicing external data directly ("Research&Development" → XML parse failure, image won't render)
svg += f'<text>{team_name}</text>'

# ✅ Escape first
svg += f'<text>{svg_escape(team_name)}</text>'
```

**High-risk data sources**: team names (contain `&`), requirement descriptions (contain `<>`), user input, file names

## Troubleshooting

| Problem | What to check |
|---------|---------------|
| Elements overlap | Text-to-line clearance ≥10px; does a detour path cross a boundary? |
| Arrowhead invisible | Block spacing below 25px — increase it |
| Label off-center | Confirm `text-anchor="middle"` and x = center of the gap |
| Arrow points the wrong way | Check the direction of the final path segment (x/y increasing or decreasing) |
| XML parse error | Check whether `&` `<` `>` in text are escaped |
| Content clipped at the bottom | viewBox height too small; it must equal the bottom edge of the lowest element + 25px |
| Dashed group box off-center after adding a title | Vertical centering must use the combined "title + content" height — see "Dashed grouping boxes" |
| Too much blank space overall | Check whether box spacing >30px or viewBox margin >25px |

## Verification checklist

### All SVG

- [ ] `width` attribute present; viewBox matches the content.
- [ ] `<title>` is the first child, with `role="img"` and matching `aria-labelledby`.
- [ ] Special characters escaped (`&` → `&amp;`, `<` → `&lt;`).
- [ ] No `<foreignObject>`.
- [ ] Body text ≥4.5:1 contrast, large text and strokes ≥3:1, meaning survives grayscale.
- [ ] Text is real `<text>`, not outlined paths, and stays at 10px or above.
- [ ] Fonts are declared in `<style>` and use system faces.
- [ ] Every element sits inside the visible viewBox.
- [ ] No clipped text and no unexplained `<g transform>` offsets.

### Diagrams

- [ ] No overlapping elements (text, boxes, lines).
- [ ] No text right edge intrudes on a neighbor (estimated from character widths).
- [ ] ≥15px between a curve label and the nearest point on the curve.
- [ ] Symmetric arrow clearance at both ends (5px), visible line segment ≥6px.
- [ ] Markers declare `markerUnits="userSpaceOnUse"`.
- [ ] Thick lines (stroke-width > 1.5) use the enlarged marker.
- [ ] Connectors use C/Q curves, no right angles.
- [ ] Labels centered (`text-anchor="middle"`).
- [ ] Detour paths stay outside obstacles.
- [ ] Block spacing ≥25px (25–30px recommended).
- [ ] Title centered, boxes in a row similar in size.
- [ ] Box heights sufficient (one line ≥ font-size × 3).
- [ ] Top and bottom viewBox margins comparable (20–25px, measured from the top of the title).
- [ ] Left and right viewBox padding symmetric.
- [ ] Diagrams that will be scaled declare `vector-effect="non-scaling-stroke"`.
- [ ] Every connector has a clear meaning.
- [ ] Grouping panels styled consistently (fill, border, radius, padding, title treatment).
- [ ] No large blank regions; viewBox hugs the content.
- [ ] Title block: subtitle = title + 24; first content ink ≥16px below subtitle.
- [ ] Canvas height = lowest content ink + 25px.
- [ ] One accent token, used only for data-flow edges and semantic emphasis.
- [ ] Scripted path edits preserve command letters (`M`, `L`, `C`, `Q`, `Z`).

### Icons and illustrations

- [ ] The mark still reads at 16px and 32px.
- [ ] A 10% safe margin survives a rounded-square or circular crop.
- [ ] The silhouette works in one colour.
- [ ] Two or three colours; no stroke thinner than 24px at 1024 scale.
- [ ] No text besides a single letterform.
- [ ] The mark is optically centred, not only geometrically centred.
- [ ] Detail that turns to noise at 16–32px is removed.
- [ ] SVG, 1024/512/256 PNG, and ICO 16–256 exported when the target is an app icon.
- [ ] The illustration has one focal point and a clear reading order.
- [ ] Grayscale and 50% renders keep the hierarchy.

## Editing workflow

### 1. Collect: gather the full set before touching anything

When you receive a request to modify an SVG, **do not start editing immediately**. First judge:

- The user gave **one** change → reply "anything else you want adjusted?" to get the full list in one go
- The user gave **several** changes → move to execution and apply them all at once

Goal: fewer round trips, so you are not re-emitting the whole SVG for every single tweak.

### 2. Execute: apply everything at once, with a change list

Once all edits are done, print the change list first, then show the final SVG:

```
Change list:
1. Title spacing 20px → 30px
2. Box A fill #dbeafe → #f3e8ff
3. Connector L1 path adjusted (routes around the new box)
```

**Do not show the diagram after each individual edit** — the user only needs the final result.

### 3. Layout tweaks: understand the intent and adjust dependents

When the user says "move box A 20px to the right", do not mechanically change box A's `x` alone. Handle the dependents too:

- Every arrow path to/from box A
- Alignment with the other boxes in box A's row
- The position of box A's text labels
- The size of the outer/background box wrapping box A

**Spacing/alignment requests** ("make it tighter", "left-align it", "center it") → read the overall intent and adjust all related elements in one pass, so the user does not have to iterate pixel by pixel.
