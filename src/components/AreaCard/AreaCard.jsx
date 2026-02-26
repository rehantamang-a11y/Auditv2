/**
 * AreaCard.jsx
 *
 * One cell in the area grid on HomeScreen.
 *
 * States:
 *  - Empty:    icon + label + hint text + optional "Required" tag
 *  - Captured: first photo thumbnail + annotation badge + photo count pill
 */

import './AreaCard.css';

export default function AreaCard({ area, photos, onPress }) {
  const hasPhotos    = photos.length > 0;
  const annotCount   = photos.reduce((s, p) => s + (p.annotations?.length ?? 0), 0);
  const firstPhoto   = photos[0];

  return (
    <button className={`area-card ${hasPhotos ? 'captured' : 'empty'}`} onClick={onPress}>
      {hasPhotos ? (
        <>
          {/* Thumbnail */}
          <img
            className="area-card-thumb"
            src={firstPhoto.dataUrl}
            alt={area.label}
          />
          {/* Overlays */}
          <div className="area-card-overlay">
            <span className="area-card-label-sm">{area.label}</span>
            <div className="area-card-badges">
              <span className="badge badge-photos">{photos.length} 📷</span>
              {annotCount > 0 && (
                <span className="badge badge-marks">{annotCount} ✏️</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <span className="area-card-icon">{area.icon}</span>
          <span className="area-card-label">{area.label}</span>
          {area.required && <span className="area-card-required">Required</span>}
        </>
      )}
    </button>
  );
}
