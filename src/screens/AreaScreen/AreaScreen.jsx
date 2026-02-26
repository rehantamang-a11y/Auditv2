/**
 * AreaScreen.jsx
 *
 * Shows all photos captured for one area and lets the technician add more.
 *
 * Responsibilities:
 *  - Display area label + hint in header
 *  - Show stacked PhotoCard list for all photos in this area
 *  - Camera button triggers device camera (via hidden <input type="file">)
 *  - "Required" warning badge if area has no photos yet
 *  - Edit button on each PhotoCard → navigate to AnnotateScreen
 *  - Delete button on each PhotoCard → remove from context
 */

import { useAudit }   from '../../context/AuditContext';
import { getArea }    from '../../data/areas';
import { useCamera }  from '../../hooks/useCamera';
import PhotoCard      from '../../components/PhotoCard/PhotoCard';
import './AreaScreen.css';

export default function AreaScreen({ areaId, onBack, onAnnotate }) {
  const { audit, addPhoto, deletePhoto } = useAudit();
  const { capture } = useCamera();

  const area   = getArea(areaId);
  const photos = audit.areaPhotos[areaId] || [];

  // ── Camera capture ───────────────────────────────────
  const handleCameraClick = async () => {
    try {
      const dataUrl = await capture();
      const photoId = addPhoto(areaId, dataUrl);
      // Immediately open annotation screen for the new photo
      onAnnotate(photoId);
    } catch {
      // User cancelled — do nothing
    }
  };

  return (
    <div className="area-screen">

      {/* ── Header ── */}
      <header className="area-header">
        <button className="btn-back" onClick={onBack} aria-label="Back">
          ‹ Back
        </button>
        <div className="area-header-text">
          <span className="area-header-label">{area.label}</span>
          <span className="area-header-hint">{area.hint}</span>
        </div>
      </header>

      {/* ── Required warning ── */}
      {area.required && photos.length === 0 && (
        <div className="area-required-warning">
          <span className="required-badge">Required</span>
          At least one photo needed before you can submit.
        </div>
      )}

      {/* ── Photo list ── */}
      <div className="area-photos">
        {photos.map(photo => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onEdit={() => onAnnotate(photo.id)}
            onDelete={() => deletePhoto(areaId, photo.id)}
          />
        ))}
      </div>

      {/* ── Add photo button ── */}
      <div className="area-add-strip">
        <button className="btn-add-photo" onClick={handleCameraClick}>
          <span className="btn-add-icon">📷</span>
          {photos.length === 0 ? 'Take first photo' : 'Add another photo'}
        </button>
      </div>
    </div>
  );
}
