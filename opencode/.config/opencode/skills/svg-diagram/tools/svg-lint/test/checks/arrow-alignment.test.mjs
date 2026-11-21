// tools/svg-lint/test/checks/arrow-alignment.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arrowAlignment } from '../../lib/checks/arrow-alignment.mjs';
import { lintSource } from '../../lib/lint.mjs';
import { runCheck, codes } from '../helpers/load.mjs';

const DEFS = `<defs>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto" markerUnits="userSpaceOnUse">
    <path d="M0,0 L8,4 L0,8 L2,4 z" fill="#94a3b8"/>
  </marker>
</defs>`;
const WRAP = (body) => `<svg viewBox="0 0 360 200" width="360">
  ${DEFS}
  <rect x="0" y="0" width="360" height="200" fill="#ffffff"/>
  ${body}
</svg>`;
// Target box x=200 y=100 w=100 h=40 → centre (250,120). A line ending 11px short puts
// the painted tip 5px from the wall: horizontal M140,y L189,y; vertical Mx,40 Lx,89.
const target = '<rect x="200" y="100" width="100" height="40" rx="6" fill="#ffffff" stroke="#d8dee6"/>';
const line = (d) => `<path d="${d}" fill="none" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow)"/>`;

test('a horizontal arrow level with the box centre is clean', () => {
  assert.deepEqual(runCheck(arrowAlignment, WRAP(target + line('M140,120 L189,120'))), []);
});

test('a vertical arrow on the box centre is clean', () => {
  assert.deepEqual(runCheck(arrowAlignment, WRAP(target + line('M250,40 L250,89'))), []);
});

test('a horizontal arrow landing off the centre y is reported', () => {
  const findings = runCheck(arrowAlignment, WRAP(target + line('M140,130 L189,130')));
  assert.deepEqual(codes(findings), ['arrow-tip-off-center']);
  assert.equal(findings[0].severity, 'warning');
  assert.equal(findings[0].repair.actual, '130');
  assert.equal(findings[0].repair.expected, '120');
  assert.equal(findings[0].repair.attribute, 'd');
});

test('a vertical arrow landing off the centre x is reported', () => {
  const findings = runCheck(arrowAlignment, WRAP(target + line('M220,40 L220,89')));
  assert.deepEqual(codes(findings), ['arrow-tip-off-center']);
  assert.equal(findings[0].repair.actual, '220');
  assert.equal(findings[0].repair.expected, '250');
});

test('the three-pixel tolerance allows a two-pixel offset but not four', () => {
  assert.deepEqual(runCheck(arrowAlignment, WRAP(target + line('M140,122 L189,122'))), []);
  assert.deepEqual(codes(runCheck(arrowAlignment, WRAP(target + line('M140,124 L189,124')))), ['arrow-tip-off-center']);
});

test('several arrows on one wide box are spread along its wall by design', () => {
  const wide = '<rect x="100" y="100" width="300" height="40" rx="6" fill="#ffffff" stroke="#d8dee6"/>';
  const fan = line('M140,40 L140,89') + line('M250,40 L250,89') + line('M360,40 L360,89');
  assert.deepEqual(runCheck(arrowAlignment, WRAP(wide + fan)), []);
});

test('an arrow into a panel is not measured against the panel centre', () => {
  const panel = `<rect x="100" y="100" width="200" height="100" rx="10" fill="#eef1f5" stroke="#dbe1e8"/>
  <rect x="120" y="140" width="60" height="30" rx="6" fill="#ffffff" stroke="#d8dee6"/>
  <text x="150" y="159" font-size="9" text-anchor="middle" fill="#64748b">Inner</text>`;
  assert.deepEqual(runCheck(arrowAlignment, WRAP(panel + line('M250,40 L250,89'))), []);
});

test('a path without a marker is not an arrow', () => {
  const plain = '<path d="M140,130 L189,130" fill="none" stroke="#94a3b8" stroke-width="1.5"/>';
  assert.deepEqual(runCheck(arrowAlignment, WRAP(target + plain)), []);
});

test('the check is wired into the registry', () => {
  const { findings } = lintSource('align.svg', WRAP(target + line('M140,130 L189,130')));
  assert.deepEqual(
    findings.filter((f) => f.check === 'arrow-alignment').map((f) => f.code),
    ['arrow-tip-off-center'],
  );
});
