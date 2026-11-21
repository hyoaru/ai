// tools/svg-lint/lib/checks/box-padding.mjs
// A stack of centred lines inside a dashed grouping box needs even top and bottom padding.
// baseline-offset already checks this for solid content boxes, but skips dashed boxes because
// document.mjs does not bind text to them — so a reviewer note or a callout can be visibly
// top-heavy and the tool stays silent. This check applies the same optical-centre rule to
// those boxes only, and ignores left-aligned group titles, which house style puts at top-left.
import { warning } from '../report.mjs';
import { pointInBBox } from '../geometry.mjs';
import { panelRects } from '../panels.mjs';
import { BASELINE_CENTER_RATIO, groupIntoLines } from '../text-metrics.mjs';

const ID = 'box-padding';
const TOLERANCE = 2;
const round = (v) => Number(v.toFixed(1));

export const boxPadding = {
  id: ID,
  title: 'Text blocks leave even padding inside their box',
  run(doc) {
    const out = [];
    const panels = panelRects(doc);
    for (const rect of doc.groupRects) {
      if (panels.has(rect)) continue;
      const texts = doc.texts.filter((t) => t.container === null && pointInBBox(t.center, rect.bbox));
      if (texts.length === 0) continue;
      // A dashed box holding a left-aligned section name (a sequence-diagram alt frame, a
      // grouped set of members) is a container, not a prose callout. Judging the centring of
      // everything inside it would report the layout house style asks for.
      if (texts.some((t) => t.textAnchor !== 'middle')) continue;
      const lines = groupIntoLines(texts);
      const first = lines[0];
      const last = lines[lines.length - 1];
      const blockFontSize = (first.fontSize + last.fontSize) / 2;
      const mid = (first.y + last.y) / 2;
      const wanted = rect.y + rect.height / 2 + blockFontSize * BASELINE_CENTER_RATIO;
      if (Math.abs(mid - wanted) > TOLERANCE) {
        const shift = round(wanted - mid);
        out.push(warning({
          check: ID, code: 'padding-block-off-center', line: rect.line, column: rect.column,
          message: `Text block in the dashed box is centred on y=${round(mid)}; even top and bottom padding wants y=${round(wanted)}`,
          // No attribute: all the lines inside the box have to move together.
          repair: {
            actual: String(round(mid)),
            expected: String(round(wanted)),
            hint: `shift every text y by ${shift > 0 ? '+' : ''}${shift} to balance top and bottom padding`,
          },
        }));
      }
    }
    return out;
  },
};
