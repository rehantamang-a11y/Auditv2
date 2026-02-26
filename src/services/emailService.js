/**
 * emailService.js
 *
 * Sends the audit report email via EmailJS.
 *
 * Setup:
 *  1. Create an EmailJS account at https://emailjs.com
 *  2. Create an email service (Gmail recommended)
 *  3. Create a template. The template receives these variables:
 *       {{client_name}}, {{bathroom_type}}, {{date}},
 *       {{area_count}}, {{photo_count}}, {{mark_count}},
 *       {{areas_summary}}  — plain-text breakdown per area
 *  4. Fill in .env with REACT_APP_EMAILJS_* values
 *
 * Note: EmailJS free tier = 200 emails/month.
 * Photos are NOT attached (EmailJS free tier doesn't support attachments).
 * Photos remain on the device; report is text-based.
 */

import emailjs from '@emailjs/browser';

const SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

/**
 * @param {{ audit, totalPhotos, totalAnnotations, date }} params
 * @returns {Promise<void>}
 * @throws {Error} if email fails
 */
export async function sendAuditEmail({ audit, totalPhotos, totalAnnotations, date }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error('EmailJS is not configured. Check your .env file.');
  }

  // Build a plain-text summary of captured areas
  const areasSummary = Object.entries(audit.areaPhotos)
    .filter(([, photos]) => photos.length > 0)
    .map(([areaId, photos]) => {
      const marks    = photos.reduce((s, p) => s + (p.annotations?.length ?? 0), 0);
      const comments = photos.filter(p => p.comment?.trim()).map(p => `  • ${p.comment}`).join('\n');
      return [
        `${areaId.toUpperCase()} — ${photos.length} photo(s), ${marks} mark(s)`,
        comments,
      ].filter(Boolean).join('\n');
    })
    .join('\n\n');

  const templateParams = {
    client_name:   audit.clientName,
    bathroom_type: audit.bathroomType,
    date,
    area_count:    Object.values(audit.areaPhotos).filter(p => p.length > 0).length,
    photo_count:   totalPhotos,
    mark_count:    totalAnnotations,
    areas_summary: areasSummary || 'No areas captured.',
  };

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
}
