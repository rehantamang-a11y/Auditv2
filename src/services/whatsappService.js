/**
 * whatsappService.js
 *
 * Opens WhatsApp with a pre-filled audit summary message via wa.me deep link.
 *
 * The technician taps Send manually — this cannot auto-send.
 * No API or cost involved.
 *
 * Setup:
 *  Set REACT_APP_WHATSAPP_NUMBER in .env to the team group number
 *  in international format without + (e.g. 447911123456).
 *
 *  If you use a group link instead of a number, swap the wa.me URL
 *  for the group invite link — deep links don't support group chats directly.
 */

const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER;

/**
 * @param {{ audit, totalPhotos, capturedAreas, date }} params
 */
export function openWhatsApp({ audit, totalPhotos, capturedAreas, date }) {
  const areaList = capturedAreas.map(a => `• ${a.label}`).join('\n');

  const message = [
    `*EyEagle Audit — ${audit.clientName}*`,
    `📅 ${date}`,
    `🛁 ${audit.bathroomType}`,
    `📷 ${totalPhotos} photo(s) across ${capturedAreas.length} area(s)`,
    '',
    '*Areas covered:*',
    areaList,
    '',
    'Full report sent to team email.',
  ].join('\n');

  const encoded = encodeURIComponent(message);
  const url = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}
