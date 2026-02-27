const SCRIPT_URL = process.env.REACT_APP_APPS_SCRIPT_URL;

/**
 * Submit a completed audit to Google Sheets + Drive via Apps Script.
 * @param {object} audit  — full audit object from AuditContext
 * @param {object} meta   — { totalPhotos, totalAnnotations, areasSummary, commentsSummary }
 */
export async function submitToSheets(audit, meta) {
  if (!SCRIPT_URL) return; // skip silently if not configured

  // Flatten all photos into one array with area label
  const photos = Object.entries(audit.areaPhotos).flatMap(([areaId, photoArr]) =>
    (photoArr || []).map(photo => ({
      areaLabel: areaId,
      dataUrl:   photo.dataUrl,
    }))
  );

  const payload = {
    auditId:          audit.id,
    technicianName:   audit.technicianName,
    clientName:       audit.clientName,
    bathroomType:     audit.bathroomType,
    date:             new Date().toLocaleDateString('en-GB'),
    totalPhotos:      meta.totalPhotos,
    totalAnnotations: meta.totalAnnotations,
    areasSummary:     meta.areasSummary,
    commentsSummary:  meta.commentsSummary,
    photos,
  };

  // mode: 'no-cors' prevents the browser from converting the POST to a GET
  // on the Apps Script redirect. Response is opaque so we can't read it,
  // but the script executes and writes to the Sheet.
  await fetch(SCRIPT_URL, {
    method: 'POST',
    body:   JSON.stringify(payload),
    mode:   'no-cors',
  });
}
