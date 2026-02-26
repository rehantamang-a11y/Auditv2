/**
 * AuditContext.jsx
 *
 * Single source of truth for a live audit session.
 *
 * Shape of `areaPhotos`:
 * {
 *   [areaId]: [
 *     {
 *       id: string,           // uuid
 *       dataUrl: string,      // base64 image
 *       annotations: [...],   // canvas annotation objects
 *       comment: string,
 *       capturedAt: string,   // ISO timestamp
 *     },
 *     ...
 *   ]
 * }
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { REQUIRED_AREA_IDS } from '../data/areas';

const AuditContext = createContext(null);

// ── Initial state factory ─────────────────────────────────────────
const makeInitialState = () => ({
  clientName: '',
  bathroomType: 'main',   // 'main' | 'ensuite' | 'wetroom' | 'other'
  areaPhotos: {},          // keyed by areaId
});

// ── Provider ─────────────────────────────────────────────────────
export function AuditProvider({ children }) {
  const [audit, setAudit] = useState(makeInitialState);

  // ── Meta setters ─────────────────────────────────────────────
  const setClientName = useCallback((name) =>
    setAudit(prev => ({ ...prev, clientName: name })), []);

  const setBathroomType = useCallback((type) =>
    setAudit(prev => ({ ...prev, bathroomType: type })), []);

  // ── Photo management ─────────────────────────────────────────

  /** Add a newly captured photo to an area. */
  const addPhoto = useCallback((areaId, dataUrl) => {
    const photo = {
      id: crypto.randomUUID(),
      dataUrl,
      annotations: [],
      comment: '',
      capturedAt: new Date().toISOString(),
    };
    setAudit(prev => ({
      ...prev,
      areaPhotos: {
        ...prev.areaPhotos,
        [areaId]: [...(prev.areaPhotos[areaId] || []), photo],
      },
    }));
    return photo.id;
  }, []);

  /** Replace annotations + comment after editing on AnnotateScreen. */
  const saveAnnotations = useCallback((areaId, photoId, annotations, comment) => {
    setAudit(prev => ({
      ...prev,
      areaPhotos: {
        ...prev.areaPhotos,
        [areaId]: prev.areaPhotos[areaId].map(p =>
          p.id === photoId ? { ...p, annotations, comment } : p
        ),
      },
    }));
  }, []);

  /** Delete a photo from an area. */
  const deletePhoto = useCallback((areaId, photoId) => {
    setAudit(prev => ({
      ...prev,
      areaPhotos: {
        ...prev.areaPhotos,
        [areaId]: (prev.areaPhotos[areaId] || []).filter(p => p.id !== photoId),
      },
    }));
  }, []);

  // ── Derived state ────────────────────────────────────────────

  /** IDs of required areas that have at least one photo. */
  const completedRequiredIds = REQUIRED_AREA_IDS.filter(
    id => (audit.areaPhotos[id]?.length ?? 0) > 0
  );

  /** True when all required areas are covered and client name is set. */
  const canSubmit =
    audit.clientName.trim().length > 0 &&
    completedRequiredIds.length === REQUIRED_AREA_IDS.length;

  /** Total photo count across all areas. */
  const totalPhotos = Object.values(audit.areaPhotos)
    .reduce((sum, photos) => sum + photos.length, 0);

  /** Total annotation mark count across all photos. */
  const totalAnnotations = Object.values(audit.areaPhotos)
    .flat()
    .reduce((sum, p) => sum + (p.annotations?.length ?? 0), 0);

  // ── Reset ────────────────────────────────────────────────────
  const resetAudit = useCallback(() => setAudit(makeInitialState()), []);

  return (
    <AuditContext.Provider value={{
      // State
      audit,
      completedRequiredIds,
      canSubmit,
      totalPhotos,
      totalAnnotations,
      // Setters
      setClientName,
      setBathroomType,
      addPhoto,
      saveAnnotations,
      deletePhoto,
      resetAudit,
    }}>
      {children}
    </AuditContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────
export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used inside <AuditProvider>');
  return ctx;
}
