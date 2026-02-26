/**
 * ProgressBar.jsx
 *
 * Horizontal progress bar showing required areas completed.
 * e.g. "4 / 7 required areas" with a filled track.
 */

import './ProgressBar.css';

export default function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const done = completed === total;

  return (
    <div className="progress-wrap">
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${done ? 'done' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="progress-label">
        {completed} / {total} required areas
        {done && <span className="progress-done-tag"> ✓ All done</span>}
      </span>
    </div>
  );
}
