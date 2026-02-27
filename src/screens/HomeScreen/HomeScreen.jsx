/**
 * HomeScreen.jsx
 *
 * The landing screen of a new audit.
 *
 * Responsibilities:
 *  - Client name input + bathroom type selector (meta capture)
 *  - Progress bar showing required areas completed (e.g. 3/7)
 *  - Area grid — "Must Check" section (7 required) above "Also Check" (6 optional)
 *  - Submit / Review button — disabled until all 7 required areas have ≥1 photo
 *    and client name is filled
 *
 * Does NOT own state — reads from AuditContext and fires callbacks.
 */

import { useAudit } from '../../context/AuditContext';
import { AREAS, REQUIRED_AREA_IDS } from '../../data/areas';
import AreaCard    from '../../components/AreaCard/AreaCard';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Header      from '../../components/Header/Header';
import './HomeScreen.css';

const BATHROOM_TYPES = [
  { value: 'main',    label: 'Main Bathroom' },
  { value: 'ensuite', label: 'En-suite' },
  { value: 'wetroom', label: 'Wet Room' },
  { value: 'other',   label: 'Other' },
];

const requiredAreas = AREAS.filter(a => a.required);
const optionalAreas = AREAS.filter(a => !a.required);

export default function HomeScreen({ onAreaPress, onReviewPress, onBack }) {
  const {
    audit,
    setClientName,
    setBathroomType,
    completedRequiredIds,
    canSubmit,
  } = useAudit();

  return (
    <div className="home-screen">

      <Header onBack={onBack} backLabel="‹ Audits" />

      {/* ── Meta inputs ── */}
      <section className="home-meta">
        <div className="meta-field">
          <label className="meta-label" htmlFor="client-name">Client name</label>
          <input
            id="client-name"
            className="meta-input"
            type="text"
            placeholder="e.g. Mrs. Patel"
            value={audit.clientName}
            onChange={e => setClientName(e.target.value)}
          />
        </div>

        <div className="meta-field">
          <label className="meta-label" htmlFor="bathroom-type">Bathroom type</label>
          <select
            id="bathroom-type"
            className="meta-input meta-select"
            value={audit.bathroomType}
            onChange={e => setBathroomType(e.target.value)}
          >
            {BATHROOM_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ── Progress ── */}
      <ProgressBar
        completed={completedRequiredIds.length}
        total={REQUIRED_AREA_IDS.length}
      />

      {/* ── Must Check grid ── */}
      <section className="area-section">
        <h2 className="area-section-title">Must Check</h2>
        <div className="area-grid">
          {requiredAreas.map(area => (
            <AreaCard
              key={area.id}
              area={area}
              photos={audit.areaPhotos[area.id] || []}
              onPress={() => onAreaPress(area.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Also Check grid ── */}
      <section className="area-section">
        <h2 className="area-section-title">Also Check</h2>
        <div className="area-grid">
          {optionalAreas.map(area => (
            <AreaCard
              key={area.id}
              area={area}
              photos={audit.areaPhotos[area.id] || []}
              onPress={() => onAreaPress(area.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Submit strip ── */}
      <div className="home-submit-strip">
        <button
          className="btn-primary btn-submit"
          disabled={!canSubmit}
          onClick={onReviewPress}
        >
          Review & Submit
        </button>
        {!canSubmit && (
          <p className="submit-hint">
            {!audit.clientName.trim()
              ? 'Enter client name to continue'
              : `${REQUIRED_AREA_IDS.length - completedRequiredIds.length} required area(s) still needed`}
          </p>
        )}
      </div>
    </div>
  );
}
