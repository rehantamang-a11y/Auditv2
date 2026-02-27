/**
 * App.jsx
 *
 * Top-level screen router. EyEagle v2 has no URL-based routing —
 * screen state is held in memory for speed and simplicity on mobile.
 *
 * Screen stack:
 *   login → audit_list → home → area → annotate → review → success → audit_list
 *
 * On load: checks localStorage for a logged-in user.
 * If found → audit_list. If not → login.
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuditProvider }         from './context/AuditContext';

import LoginScreen      from './screens/LoginScreen/LoginScreen';
import AuditListScreen  from './screens/AuditListScreen/AuditListScreen';
import HomeScreen       from './screens/HomeScreen/HomeScreen';
import AreaScreen       from './screens/AreaScreen/AreaScreen';
import AnnotateScreen   from './screens/AnnotateScreen/AnnotateScreen';
import ReviewScreen     from './screens/ReviewScreen/ReviewScreen';
import SuccessScreen    from './screens/SuccessScreen/SuccessScreen';

import './styles/global.css';

// ── Screen identifiers ────────────────────────────────────────────
const SCREENS = {
  LOGIN:      'login',
  AUDIT_LIST: 'audit_list',
  HOME:       'home',
  AREA:       'area',
  ANNOTATE:   'annotate',
  REVIEW:     'review',
  SUCCESS:    'success',
};

// ── Inner router (has access to AuthContext) ──────────────────────
function AppRouter() {
  const { user } = useAuth();

  const [screen, setScreen]             = useState(user ? SCREENS.AUDIT_LIST : SCREENS.LOGIN);
  const [activeAreaId, setActiveAreaId] = useState(null);
  const [activePhotoId, setActivePhotoId] = useState(null);

  // ── Navigation helpers ────────────────────────────────────────
  const goLogin      = () => setScreen(SCREENS.LOGIN);
  const goAuditList  = () => setScreen(SCREENS.AUDIT_LIST);
  const goHome       = () => setScreen(SCREENS.HOME);
  const goArea       = (areaId)  => { setActiveAreaId(areaId);   setScreen(SCREENS.AREA); };
  const goAnnotate   = (photoId) => { setActivePhotoId(photoId); setScreen(SCREENS.ANNOTATE); };
  const goReview     = () => setScreen(SCREENS.REVIEW);
  const goSuccess    = () => setScreen(SCREENS.SUCCESS);

  return (
    <AuditProvider>
      {screen === SCREENS.LOGIN && (
        <LoginScreen onLogin={goAuditList} />
      )}

      {screen === SCREENS.AUDIT_LIST && (
        <AuditListScreen
          onNewAudit={goHome}
          onResumeAudit={goHome}
          onLogout={goLogin}
        />
      )}

      {screen === SCREENS.HOME && (
        <HomeScreen
          onAreaPress={goArea}
          onReviewPress={goReview}
          onBack={goAuditList}
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
          onBackToAudits={goAuditList}
        />
      )}
    </AuditProvider>
  );
}

// ── Root ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
