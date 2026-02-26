/**
 * App.jsx
 *
 * Top-level screen router. EyEagle v2 has no URL-based routing —
 * screen state is held in memory for speed and simplicity on mobile.
 *
 * Screen stack:
 *   home → area → annotate → (back to area) → review → success
 *
 * Navigation is prop-drilled via `onNavigate` callbacks.
 * If the app grows, replace with a lightweight router or useReducer.
 */

import { useState } from 'react';
import { AuditProvider } from './context/AuditContext';

import HomeScreen     from './screens/HomeScreen/HomeScreen';
import AreaScreen     from './screens/AreaScreen/AreaScreen';
import AnnotateScreen from './screens/AnnotateScreen/AnnotateScreen';
import ReviewScreen   from './screens/ReviewScreen/ReviewScreen';
import SuccessScreen  from './screens/SuccessScreen/SuccessScreen';

import './styles/global.css';

// ── Screen identifiers ────────────────────────────────────────────
const SCREENS = {
  HOME:     'home',
  AREA:     'area',
  ANNOTATE: 'annotate',
  REVIEW:   'review',
  SUCCESS:  'success',
};

export default function App() {
  const [screen, setScreen]         = useState(SCREENS.HOME);
  const [activeAreaId, setActiveAreaId] = useState(null);
  const [activePhotoId, setActivePhotoId] = useState(null); // for annotate screen

  // ── Navigation helpers ────────────────────────────────────────
  const goHome       = () => setScreen(SCREENS.HOME);
  const goArea       = (areaId) => { setActiveAreaId(areaId); setScreen(SCREENS.AREA); };
  const goAnnotate   = (photoId) => { setActivePhotoId(photoId); setScreen(SCREENS.ANNOTATE); };
  const goReview     = () => setScreen(SCREENS.REVIEW);
  const goSuccess    = () => setScreen(SCREENS.SUCCESS);

  return (
    <AuditProvider>
      {screen === SCREENS.HOME && (
        <HomeScreen
          onAreaPress={goArea}
          onReviewPress={goReview}
        />
      )}

      {screen === SCREENS.AREA && (
        <AreaScreen
          areaId={activeAreaId}
          onBack={goHome}
          onAnnotate={goAnnotate}
        />
      )}

      {screen === SCREENS.ANNOTATE && (
        <AnnotateScreen
          areaId={activeAreaId}
          photoId={activePhotoId}
          onBack={() => setScreen(SCREENS.AREA)}
        />
      )}

      {screen === SCREENS.REVIEW && (
        <ReviewScreen
          onBack={goHome}
          onSubmitSuccess={goSuccess}
        />
      )}

      {screen === SCREENS.SUCCESS && (
        <SuccessScreen
          onNewAudit={goHome}
        />
      )}
    </AuditProvider>
  );
}
