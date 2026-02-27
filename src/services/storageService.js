/**
 * storageService.js
 *
 * All localStorage reads and writes for EyEagle v2.
 * Keeps storage logic out of components and context.
 *
 * Keys:
 *   eyeagle:user   — { name, password } (plain text for MVP — replaced by Firebase Auth later)
 *   eyeagle:audits — AuditRecord[]
 *
 * Note: localStorage has a ~5MB limit. Base64 photos are ~150–300KB each after compression.
 * Practical limit is ~15–30 photos across all stored audits. Firebase Storage removes
 * this limit in a later phase.
 */

const KEYS = {
  USER:   'eyeagle:user',
  AUDITS: 'eyeagle:audits',
};

// ── User / Auth ───────────────────────────────────────────────────

/** Returns stored credentials or null. */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.USER));
  } catch {
    return null;
  }
}

/** Saves technician credentials. Plain text for now — Firebase Auth replaces this. */
export function saveUser(name, password) {
  localStorage.setItem(KEYS.USER, JSON.stringify({ name, password }));
}

/** Removes credentials (logout). Audits remain in storage. */
export function clearUser() {
  localStorage.removeItem(KEYS.USER);
}

// ── Audits ────────────────────────────────────────────────────────

/** Returns all stored audits or an empty array. */
export function getAudits() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.AUDITS)) || [];
  } catch {
    return [];
  }
}

/**
 * Upserts an audit record by id.
 * Stamps updatedAt on every save.
 * New records are prepended (newest first).
 */
export function saveAudit(audit) {
  const audits = getAudits();
  const record = { ...audit, updatedAt: new Date().toISOString() };
  const idx = audits.findIndex(a => a.id === audit.id);
  if (idx >= 0) {
    audits[idx] = record;
  } else {
    audits.unshift(record);
  }
  try {
    localStorage.setItem(KEYS.AUDITS, JSON.stringify(audits));
  } catch (e) {
    // Storage full — log and continue. App still works, just not persisted.
    console.warn('EyEagle: localStorage full, audit not saved.', e);
  }
}

/** Removes a single audit by id. */
export function deleteAudit(id) {
  const audits = getAudits().filter(a => a.id !== id);
  localStorage.setItem(KEYS.AUDITS, JSON.stringify(audits));
}
