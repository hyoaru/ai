// tools/svg-lint/test/checks/box-padding.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boxPadding } from '../../lib/checks/box-padding.mjs';
import { lintSource } from '../../lib/lint.mjs';
import { runCheck, codes } from '../helpers/load.mjs';

const WRAP = (body) => `<svg viewBox="0 0 344 160" width="344">
  <style>text { font-family: system-ui, sans-serif; }</style>
  ${body}
</svg>`;

// Dashed box x=22 y=40 w=300 h=84 → centre y=82; first font 10, last 9 → wanted
// 82 + 0.35 × 9.5 = 85.3. Baselines 67 / 85 / 103 put the block midpoint at 85.
const dashedBox = (baselines) => WRAP(`<rect x="0" y="0" width="344" height="160" fill="#ffffff"/>
  <rect x="22" y="40" width="300" height="84" rx="10" fill="none" stroke="#94a3b8" stroke-dasharray="6,4"/>
  ${baselines.map((y, i) => `<text x="172" y="${y}" font-size="${i === 0 ? 10 : 9}" text-anchor="middle" fill="#64748b">Line ${i}</text>`).join('\n  ')}`);

test('a centred text block in a dashed box is clean', () => {
  assert.deepEqual(runCheck(boxPadding, dashedBox([67, 85, 103])), []);
});

test('a block sitting low reports the wanted midpoint and the signed shift', () => {
  const findings = runCheck(boxPadding, dashedBox([72, 90, 108]));
  assert.deepEqual(codes(findings), ['padding-block-off-center']);
  assert.equal(findings[0].severity, 'warning');
  assert.equal(findings[0].repair.actual, '90');
  assert.equal(findings[0].repair.expected, '85.3');
  assert.match(findings[0].repair.hint, /shift every text y by -4\.7/);
  // Moving every line, not editing one attribute on the box.
  assert.equal(findings[0].repair.attribute, undefined);
});

test('a block sitting high is reported with a positive shift', () => {
  const findings = runCheck(boxPadding, dashedBox([62, 80, 98]));
  assert.deepEqual(codes(findings), ['padding-block-off-center']);
  assert.match(findings[0].repair.hint, /shift every text y by \+5\.3/);
});

test('the two-pixel tolerance forgives a rounded midpoint', () => {
  // midpoint 87.5 against wanted 85.3 → 2.2 reports; 87.2 → 1.9 passes.
  assert.deepEqual(runCheck(boxPadding, dashedBox([69.2, 87.2, 105.2])), []);
  assert.deepEqual(codes(runCheck(boxPadding, dashedBox([69.5, 87.5, 105.5]))), ['padding-block-off-center']);
});

test('a left-aligned group title is a container label, not a prose block', () => {
  const altFrame = WRAP(`<rect x="22" y="40" width="300" height="84" rx="10" fill="#eef1f5" stroke="#dbe1e8" stroke-dasharray="6,4"/>
  <text x="32" y="54" font-size="10" fill="#64748b">alt [errors &gt; 0]</text>
  <text x="172" y="108" font-size="9" text-anchor="middle" fill="#64748b">repair hint</text>`);
  assert.deepEqual(runCheck(boxPadding, altFrame), []);
});

test('a solid box is left to baseline-offset, so it is not double-reported', () => {
  const solid = WRAP(`<rect x="22" y="40" width="300" height="84" rx="8" fill="#ffffff" stroke="#d8dee6"/>
  <text x="172" y="72" font-size="9" text-anchor="middle" fill="#64748b">One</text>
  <text x="172" y="108" font-size="9" text-anchor="middle" fill="#64748b">Two</text>`);
  assert.deepEqual(runCheck(boxPadding, solid), []);
});

test('a dashed box with no text is skipped', () => {
  assert.deepEqual(runCheck(boxPadding, WRAP('<rect x="22" y="40" width="300" height="84" rx="10" fill="none" stroke="#94a3b8" stroke-dasharray="6,4"/>')), []);
});

test('the check is wired into the registry', () => {
  const { findings } = lintSource('padding.svg', dashedBox([72, 90, 108]));
  assert.deepEqual(
    findings.filter((f) => f.check === 'box-padding').map((f) => f.code),
    ['padding-block-off-center'],
  );
});
