/**
 * areas.js
 *
 * Defines all 13 bathroom audit areas.
 * Ordered by safety risk priority (highest first).
 *
 * required: true  → must have ≥1 photo before submission (7 areas)
 * required: false → technician's discretion (6 areas)
 *
 * icon: emoji used on area card (replace with SVG set if needed)
 * hint: one-line guidance shown inside the area screen header
 */

export const AREAS = [
  // ── Required (7) ─────────────────────────────────────────────────
  {
    id: 'floor-surface',
    label: 'Floor Surface',
    icon: '🟫',
    required: true,
    hint: 'Slip is the #1 cause of bathroom injury. Wet tile, no mat, uneven surface.',
  },
  {
    id: 'shower-tub',
    label: 'Shower / Tub Entry',
    icon: '🚿',
    required: true,
    hint: 'Step-over height, wet zone, no support to grab while entering or exiting.',
  },
  {
    id: 'toilet',
    label: 'Toilet Area',
    icon: '🚽',
    required: true,
    hint: 'Getting up and down is high-effort and high-fall-risk. Height, stability, seat, proximity to support.',
  },
  {
    id: 'entry-threshold',
    label: 'Entry & Threshold',
    icon: '🚪',
    required: true,
    hint: 'Raised step into bathroom catches people off guard, especially at night.',
  },
  {
    id: 'lighting',
    label: 'Lighting',
    icon: '💡',
    required: true,
    hint: 'Dim bathrooms at night are directly linked to falls. Brightness, night-light, switch access.',
  },
  {
    id: 'overall-lit',
    label: 'Overall — Lit',
    icon: '☀️',
    required: true,
    hint: 'Baseline photo with lights on. Gives the report full spatial context.',
  },
  {
    id: 'overall-dark',
    label: 'Overall — Dark',
    icon: '🌑',
    required: true,
    hint: 'Shows what the client actually navigates at night. Critical for risk assessment.',
  },

  // ── Optional (6) ─────────────────────────────────────────────────
  {
    id: 'basin-taps',
    label: 'Basin & Taps',
    icon: '🚰',
    required: false,
    hint: 'Leaning forward, wet floor underneath, sharp edges on older fixtures.',
  },
  {
    id: 'walls-corners',
    label: 'Walls & Corners',
    icon: '🧱',
    required: false,
    hint: 'Sharp edges, protruding fixtures, exposed hardware.',
  },
  {
    id: 'drainage',
    label: 'Drainage',
    icon: '💧',
    required: false,
    hint: 'Standing water creates slip risk. Also signals plumbing issues.',
  },
  {
    id: 'electrical',
    label: 'Electrical',
    icon: '⚡',
    required: false,
    hint: 'Sockets or wiring near water sources.',
  },
  {
    id: 'door',
    label: 'Door',
    icon: '↔️',
    required: false,
    hint: 'Inward-opening doors can trap a fallen person. Width matters for mobility aids.',
  },
  {
    id: 'other',
    label: 'Other',
    icon: '📝',
    required: false,
    hint: 'Free-form capture for anything else the technician observes.',
  },
];

// ── Derived helpers ───────────────────────────────────────────────

/** All 7 required area IDs — used to check submission gate. */
export const REQUIRED_AREA_IDS = AREAS
  .filter(a => a.required)
  .map(a => a.id);

/** Look up a single area by ID. */
export const getArea = (id) => AREAS.find(a => a.id === id);
