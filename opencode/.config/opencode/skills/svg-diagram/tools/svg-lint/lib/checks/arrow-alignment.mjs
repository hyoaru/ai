// tools/svg-lint/lib/checks/arrow-alignment.mjs
// arrow-marker enforces 5px clearance at both ends, but a line can stop 5px short and still
// enter the target box well off its centre. This check judges the coordinate perpendicular
// to travel: a horizontal arrow must land level with the target box's centre y, and a
// vertical one must land on its centre x. Fan-out from a panel is exempt because panels
// are not member boxes, the same way arrow-marker treats them as containers.
import { warning } from '../report.mjs';
import { pointInBBox, pointToBBoxDistance, directionAtEnd } from '../geometry.mjs';
import { panelRects } from '../panels.mjs';
import { MARKER_SPECS } from './arrow-marker.mjs';

const ID = 'arrow-alignment';
const SPEC_BY_SIZE = new Map(MARKER_SPECS.map((s) => [s.size, s]));
const TARGET_SEARCH_RADIUS = 40;
// A couple of pixels are rounding, not a visible misalignment: a row of arrows is often
// aligned with a neighbour rather than with the exact centre of a box that spans several rows.
const ALIGN_TOLERANCE = 3;
const round = (v) => Number(v.toFixed(1));

const approaches = (point, step, bbox) => pointToBBoxDistance(
  { x: point.x + step.x, y: point.y + step.y }, bbox,
) < pointToBBoxDistance(point, bbox);

function tipAt(segments, end, advance) {
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const direction = directionAtEnd(segments[i]);
    if (!direction) continue;
    const len = Math.hypot(direction.end.x - direction.start.x, direction.end.y - direction.start.y);
    const step = { x: (direction.end.x - direction.start.x) / len, y: (direction.end.y - direction.start.y) / len };
    return { point: { x: end.x + step.x * advance, y: end.y + step.y * advance }, step };
  }
  return null;
}

export const arrowAlignment = {
  id: ID,
  title: 'Arrows land on the centre line of the box they point at',
  run(doc) {
    const out = [];
    const panels = panelRects(doc);
    const targets = doc.contentRects.filter((r) => !panels.has(r));
    const arrivals = [];

    for (const path of doc.paths) {
      if (path.fill !== 'none' || !path.markerEnd) continue;
      const spec = SPEC_BY_SIZE.get(doc.markers.get(path.markerEnd)?.markerWidth);
      if (!spec || path.segments.some((s) => s.unsupported)) continue;
      const end = path.points.at(-1);
      const tip = tipAt(path.segments, end, spec.tip);
      if (!tip) continue;

      let best = null;
      let bestDistance = Infinity;
      for (const rect of targets) {
        const distance = pointInBBox(tip.point, rect.bbox)
          ? 0 : pointToBBoxDistance(tip.point, rect.bbox);
        if (distance > TARGET_SEARCH_RADIUS || distance >= bestDistance) continue;
        if (!pointInBBox(tip.point, rect.bbox) && !approaches(tip.point, tip.step, rect.bbox)) continue;
        best = rect;
        bestDistance = distance;
      }
      if (!best) continue;

      const horizontal = Math.abs(tip.step.x) >= Math.abs(tip.step.y);
      arrivals.push({
        path,
        target: best,
        horizontal,
        actual: horizontal ? tip.point.y : tip.point.x,
        expected: horizontal ? best.y + best.height / 2 : best.x + best.width / 2,
      });
    }

    // Several arrows landing on one box are a fan-in deliberately spread along its wall;
    // the centre is then not a target for any of them. Only a lone arrival owns the centre.
    const arrivalCounts = new Map();
    for (const a of arrivals) arrivalCounts.set(a.target, (arrivalCounts.get(a.target) ?? 0) + 1);
    for (const a of arrivals) {
      if (arrivalCounts.get(a.target) !== 1 || Math.abs(a.actual - a.expected) <= ALIGN_TOLERANCE) continue;
      out.push(warning({
        check: ID, code: 'arrow-tip-off-center', line: a.path.line, column: a.path.column,
        message: `${a.horizontal ? 'Horizontal' : 'Vertical'} arrow lands at ${a.horizontal ? 'y' : 'x'}=${round(a.actual)}; the target box centre is ${round(a.expected)}`,
        repair: {
          attribute: 'd',
          actual: String(round(a.actual)),
          expected: String(round(a.expected)),
          hint: a.horizontal ? 'end the line level with the target box centre y'
            : 'end the line in line with the target box centre x',
        },
      }));
    }
    return out;
  },
};
