/**
 * SuccessScreen.jsx
 *
 * Confirmation screen shown after successful submission.
 *
 * Responsibilities:
 *  - Confirm email was sent and WhatsApp was opened
 *  - Show a brief summary of what was submitted
 *  - "Back to Audits" button → returns to AuditListScreen
 */

import { useAudit } from '../../context/AuditContext';
import './SuccessScreen.css';

export default function SuccessScreen({ onBackToAudits }) {
  const { audit, totalPhotos } = useAudit();

  return (
    <div className="success-screen">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <h1 className="success-title">Audit Submitted</h1>
        <p className="success-body">
          The report has been sent to the team email and WhatsApp is ready to notify the group.
        </p>

        <div className="success-summary">
          <div className="success-row">
            <span className="success-key">Client</span>
            <span className="success-val">{audit.clientName}</span>
          </div>
          <div className="success-row">
            <span className="success-key">Photos</span>
            <span className="success-val">{totalPhotos}</span>
          </div>
          <div className="success-row">
            <span className="success-key">Date</span>
            <span className="success-val">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <button className="btn-new-audit" onClick={onBackToAudits}>
          Back to Audits
        </button>
      </div>
    </div>
  );
}
