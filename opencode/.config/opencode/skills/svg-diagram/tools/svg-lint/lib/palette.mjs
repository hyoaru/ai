// tools/svg-lint/lib/palette.mjs
// The sole numeric source for the house palette, copied verbatim from SKILL.md "Color tokens" and "Arrowhead definitions".
// All check modules must read values from here; writing hex literals inline is not allowed.
//
// Token roles (per DESIGN-TASTE.md): ground, panel, panel-nested, card, hairline, border,
// border-strong, ink, secondary, muted, accent, failure. The example values below are the
// editorial palette; the role structure is what the checks enforce. Legacy entries are kept
// so diagrams written before the token migration still lint.

export const BASE_TEXT = {
  primary: '#0f172a',   // ink
  secondary: '#64748b',
  muted: '#94a3b8',
  legacy_primary: '#1e293b',
};

export const SEMANTIC = [
  // Editorial tokens.
  { name: 'accent', fill: '#e9eef9', stroke: '#1d4ed8', text: '#1d4ed8' },
  { name: 'panel', fill: '#eef1f5', stroke: '#dbe1e8', text: '#64748b' },
  { name: 'panel-nested', fill: '#f1f4f8', stroke: '#dbe1e8', text: '#64748b' },
  { name: 'failure', fill: '#fef2f2', stroke: '#dc2626', text: '#dc2626' },
  // Legacy triples kept for pre-migration diagrams.
  { name: 'input', fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
  { name: 'processing', fill: '#fef3c7', stroke: '#f59e0b', text: '#b45309' },
  { name: 'output', fill: '#d1fae5', stroke: '#22c55e', text: '#166534' },
  { name: 'analysis', fill: '#f3e8ff', stroke: '#a855f7', text: '#6b21a8' },
  { name: 'warning', fill: '#fce7f3', stroke: '#ec4899', text: '#9d174d' },
];

export const ARROW_COLORS = {
  arrow: '#94a3b8',          // hairline (structural)
  'arrow-accent': '#1d4ed8', // data-flow edges
  'arrow-fail': '#dc2626',   // failure paths
  // Legacy ids kept for pre-migration diagrams.
  'arrow-blue': '#3b82f6',
  'arrow-red': '#ef4444',
};

export const GROUP_BOX = {
  fill: '#f8fafc',
  stroke: '#94a3b8',
  dasharray: '6,4',
};

// Cards, borders, panel fills, accent tints and marker inks used by the editorial style.
const TOKEN_EXTRAS = [
  '#ffffff',                       // ground / card fill
  '#d8dee6',                       // border (ordinary cards)
  '#c3ccd8',                       // border-strong (boot chain)
  '#dbe1e8',                       // zone hairline border
  '#c7d5ee',                       // accent-tinted card border
  '#475569',                       // marker ink (accent/fail arrowheads)
  '#2563eb',                       // acquire marker line + dot
  '#1e40af',                       // blue label text on tinted strips
  '#bfdbfe',                       // legacy blue strip border
  '#eff6ff',                       // legacy blue strip fill
  '#fecaca',                       // legacy failure strip border
  '#94a3b8',                       // zone/edge label ink (same as hairline)
  '#0f172a',
];

export const ALLOWED_COLORS = new Set([
  ...Object.values(BASE_TEXT),
  ...SEMANTIC.flatMap((s) => [s.fill, s.stroke, s.text]),
  ...Object.values(ARROW_COLORS),
  GROUP_BOX.fill,
  GROUP_BOX.stroke,
  ...TOKEN_EXTRAS,
  'none',
]);

export const semanticByFill = (hex) => SEMANTIC.find((s) => s.fill === hex);
export const semanticByStroke = (hex) => SEMANTIC.find((s) => s.stroke === hex);
