/**
 * AuditContext.jsx
 *
 * Single source of truth for the active audit session.
 * Auto-saves to localStorage on every mutation via storageService.
 *
 * Audit record shape:
 * {
 *   id: string,              // UUID — unique per audit
 *   technicianName: string,
 *   clientName: string,
 *   bathroomType: string,    // 'main' | 'ensuite' | 'wetroom' | 'other'
 *   status: string,          // 'draft' | 'submitted'
 *   createdAt: string,       // ISO
 *   updatedAt: string,       // ISO — stamped by storageService on every save
 *   submittedAt: string|null,// ISO
 *   areaPhotos: {
 *     [areaId]: [
 *       { id, dataUrl, annotations, comment, capturedAt }
 *     ]
 *   }
 * }
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { REQUIRED_AREA_IDS } from '../data/areas';
import { saveAudit } from '../services/storageService';

const AuditContext = createContext(null);

// ── State factory ─────────────────────────────────────────────────
const makeBlankAudit = (technicianName = '') => ({
  id:             crypto.randomUUID(),
  technicianName,
  clientName:     '',
  bathroomType:   'main',
  status:         'draft',
  createdAt:      new Date().toISOString(),
  submittedAt:    null,
  areaPhotos:     {},
});

// ── Provider ──────────────────────────────────────────────────────
export function AuditProvider({ children }) {
  const [audit, setAudit] = useState(() => makeBlankAudit());

  // ── Internal save helper ──────────────────────────────────────
  // Saves the next audit state to localStorage. Called inside setAudit updaters.
  const persist = (next) => {
    if (next.technicianName) saveAudit(next);
    return next;
  };

  // ── Lifecycle ────────────────────────────────────────────────

  /** Start a brand-new audit. Creates a fresh record in localStorage. */
  const startNewAudit = useCallback((technicianName) => {
    const blank = makeBlankAudit(technicianName);
    saveAudit(blank);
    setAudit(blank);
  }, []);

  /** Load a saved audit record into context (for resuming a draft). */
  const loadAudit = useCallback((record) => {
    setAudit(record);
  }, []);

  /** Mark the current audit as submitted and persist the change. */
  const markSubmitted = useCallback(() => {
    setAudit(prev => persist({
      ...prev,
      status:      'submitted',
      submittedAt: new Date().toISOString(),
    }));
  }, []); // eslint-disable-line

  // ── Meta setters ─────────────────────────────────────────────

  const setClientName = useCallback((name) => {
    setAudit(prev => persist({ ...prev, clientName: name }));
  }, []); // eslint-disable-line

  const setBathroomType = useCallback((type) => {
    setAudit(prev => persist({ ...prev, bathroomType: type }));
  }, []); // eslint-disable-line

  // ── Photo management ─────────────────────────────────────────

  /** Add a newly captured photo to an area. Returns the new photo id. */
  const addPhoto = useCallback((areaId, dataUrl) => {
    const photo = {
      id:          crypto.randomUUID(),
      dataUrl,
      annotations: [],
      comment:     '',
      capturedAt:  new Date().toISOString(),
    };
    setAudit(prev => persist({
      ...prev,
      areaPhotos: {
        ...prev.areaPhotos,
        [areaId]: [...(prev.areaPhotos[areaId] || []), photo],
      },
    }));
    return photo.id;
  }, []); // eslint-disable-line

  /** Replace annotations + comment after editing on AnnotateScreen. */
  const saveAnnotations = useCallback((areaId, photoId, annotations, comment) => {
    setAudit(prev => persist({
      ...prev,
      areaPhotos: {
        ...prev.areaPhotos,
        [areaId]: prev.areaPhotos[areaId].map(p =>
          p.id === photoId ? { ...p, annotations, comment } : p
        ),
      },
    }));
  }, []); // eslint-disable-line

  /** Delete a photo from an area. */
  const deletePhoto = useCallback((areaId, photoId) => {
    setAudit(prev => persist({
      ...prev,
      areaPhotos: {
        ...prev.areaPhotos,
        [areaId]: (prev.areaPhotos[areaId] || []).filter(p => p.id !== photoId),
      },
    }));
  }, []); // eslint-disable-line

  // ── Derived state ────────────────────────────────────────────

  const completedRequiredIds = REQUIRED_AREA_IDS.filter(
    id => (audit.areaPhotos[id]?.length ?? 0) > 0
  );

  const canSubmit =
    audit.clientName.trim().length > 0 &&
    completedRequiredIds.length === REQUIRED_AREA_IDS.length;

  const totalPhotos = Object.values(audit.areaPhotos)
    .reduce((sum, photos) => sum + photos.length, 0);

  const totalAnnotations = Object.values(audit.areaPhotos)
    .flat()
    .reduce((sum, p) => sum + (p.annotations?.length ?? 0), 0);

  return (
    <AuditContext.Provider value={{
      audit,
      completedRequiredIds,
      canSubmit,
      totalPhotos,
      totalAnnotations,
      startNewAudit,
      loadAudit,
      markSubmitted,
      setClientName,
      setBathroomType,
      addPhoto,
      saveAnnotations,
      deletePhoto,
    }}>
      {children}
    </AuditContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────
export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used inside <AuditProvider>');
  return ctx;
}
