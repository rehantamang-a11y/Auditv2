/**
 * PhotoCard.jsx
 *
 * A single captured photo inside AreaScreen.
 *
 * Shows: thumbnail with annotation overlay, comment text,
 * and Edit / Delete pill buttons.
 */

import './PhotoCard.css';

export default function PhotoCard({ photo, onEdit, onDelete }) {
  const markCount = photo.annotations?.length ?? 0;

  return (
    <div className="photo-card">
      {/* Thumbnail */}
      <div className="photo-thumb-wrap" onClick={onEdit}>
        <img className="photo-thumb" src={photo.dataUrl} alt="Captured" />
        {markCount > 0 && (
          <span className="photo-mark-badge">{markCount} mark{markCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Comment */}
      {photo.comment?.trim() && (
        <p className="photo-comment">"{photo.comment}"</p>
      )}

      {/* Actions */}
      <div className="photo-actions">
        <button className="pill-btn pill-edit" onClick={onEdit}>Edit</button>
        <button className="pill-btn pill-delete" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
