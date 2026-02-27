/**
 * ReviewScreen.jsx
 *
 * Pre-submission summary + submission trigger.
 *
 * Responsibilities:
 *  - Summary strip: client name, bathroom type, date, area count, photo count, mark count
 *  - Area list: each area's thumbnails, annotation count, comments
 *  - "What happens on submit" explainer (email + WhatsApp)
 *  - Submit button: sends email via emailService, then opens WhatsApp link
 *  - Back to Edit button returns to HomeScreen
 *
 * Submission states: idle | submitting | error
 */

import { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { AREAS }    from '../../data/areas';
import { openWhatsApp } from '../../services/whatsappService';
import { submitToSheets } from '../../services/sheetsService';
import Header             from '../../components/Header/Header';
import './ReviewScreen.css';

const BATHROOM_LABELS = {
  main: 'Main Bathroom', ensuite: 'En-suite', wetroom: 'Wet Room', other: 'Other',
};

export default function ReviewScreen({ onBack, onSubmitSuccess }) {
  const { audit, totalPhotos, totalAnnotations, markSubmitted } = useAudit();
  const [uploading, setUploading] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const capturedAreas = AREAS.filter(
    a => (audit.areaPhotos[a.id]?.length ?? 0) > 0
  );

  const areasSummary    = capturedAreas.map(a => a.label).join(', ');
  const commentsSummary = capturedAreas
    .flatMap(a => (audit.areaPhotos[a.id] || []).map(p => p.comment).filter(Boolean))
    .join(' | ');

  const handleSubmit = async () => {
    setUploading(true);

    // Non-blocking Sheets + Drive upload
    try {
      await submitToSheets(audit, {
        totalPhotos,
        totalAnnotations,
        areasSummary,
        commentsSummary,
      });
    } catch (err) {
      console.warn('Sheets upload failed:', err);
    }

    setUploading(false);

    openWhatsApp({ audit, totalPhotos, capturedAreas, date: today });
    markSubmitted();
    onSubmitSuccess();
  };

  return (
    <div className="review-screen">
      <Header title="Review & Submit" onBack={onBack} backLabel="‹ Back to Edit" />

      {/* ── Summary strip ── */}
      <section className="review-summary">
        <div className="summary-row">
          <span className="summary-key">Client</span>
          <span className="summary-val">{audit.clientName}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Bathroom</span>
          <span className="summary-val">{BATHROOM_LABELS[audit.bathroomType]}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Date</span>
          <span className="summary-val">{today}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Areas</span>
          <span className="summary-val">{capturedAreas.length} captured</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Photos</span>
          <span className="summary-val">{totalPhotos}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Issue marks</span>
          <span className="summary-val">{totalAnnotations}</span>
        </div>
      </section>

      {/* ── Area list ── */}
      <section className="review-areas">
        <h2 className="review-section-title">Captured Areas</h2>
        {capturedAreas.map(area => {
          const photos = audit.areaPhotos[area.id] || [];
          const markCount = photos.reduce((s, p) => s + (p.annotations?.length ?? 0), 0);
          const comments  = photos.filter(p => p.comment?.trim()).map(p => p.comment);
          return (
            <div key={area.id} className="review-area-row">
              <div className="review-area-header">
                <span className="review-area-icon">{area.icon}</span>
                <span className="review-area-label">{area.label}</span>
                <span className="review-area-meta">{photos.length} photo{photos.length !== 1 ? 's' : ''}{markCount > 0 ? ` · ${markCount} mark${markCount !== 1 ? 's' : ''}` : ''}</span>
              </div>
              <div className="review-thumbnails">
                {photos.slice(0, 4).map(p => (
                  <img key={p.id} className="review-thumb" src={p.dataUrl} alt="" />
                ))}
                {photos.length > 4 && (
                  <span className="review-thumb-more">+{photos.length - 4}</span>
                )}
              </div>
              {comments.length > 0 && (
                <div className="review-comments">
                  {comments.map((c, i) => <p key={i} className="review-comment">"{c}"</p>)}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ── What happens explainer ── */}
      <section className="review-explainer">
        <h2 className="review-section-title">What happens when you submit</h2>
        <p className="explainer-text">📊 Audit data and photos are saved to the team's Google Sheet and Drive.</p>
        <p className="explainer-text">💬 WhatsApp opens with a summary message — tap Send to notify the group.</p>
      </section>

      {/* ── Submit ── */}
      <div className="review-submit-strip">
        <button
          className="btn-primary btn-submit"
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Submit Audit'}
        </button>
      </div>
    </div>
  );
}
