/**
 * imageUtils.js
 *
 * Helpers for working with image data in the audit app.
 */

/**
 * Compress a base64 image dataUrl to reduce memory usage.
 * Useful before storing photos in context, especially on older phones.
 *
 * @param {string} dataUrl - Original base64 data URL
 * @param {number} maxWidth - Max output width in pixels (default 1200)
 * @param {number} quality  - JPEG quality 0–1 (default 0.82)
 * @returns {Promise<string>} Compressed data URL
 */
export function compressImage(dataUrl, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale  = Math.min(1, maxWidth / img.naturalWidth);
      const width  = Math.round(img.naturalWidth  * scale);
      const height = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Render a photo with its annotation descriptors onto an offscreen canvas
 * and return the composite as a dataUrl.
 *
 * Used if you want to export/share an annotated image.
 *
 * @param {string} photoDataUrl
 * @param {Array}  annotations - same shape as stored in AuditContext
 * @returns {Promise<string>} Composite data URL
 */
export function renderAnnotatedImage(photoDataUrl, annotations) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';

      annotations.forEach(mark => {
        const c = mark.color ?? '#FF3B30';

        if (mark.type === 'ellipse') {
          ctx.strokeStyle = c;
          ctx.lineWidth   = 3;
          ctx.beginPath();
          ctx.ellipse(mark.x, mark.y, mark.rx, mark.ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (mark.type === 'path' && mark.points.length > 1) {
          ctx.strokeStyle = c;
          ctx.lineWidth   = 3;
          ctx.beginPath();
          ctx.moveTo(mark.points[0].x, mark.points[0].y);
          mark.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        } else if (mark.type === 'rect') {
          ctx.strokeStyle = c;
          ctx.lineWidth   = 3;
          ctx.strokeRect(mark.x1, mark.y1, mark.x2 - mark.x1, mark.y2 - mark.y1);
        } else if (mark.type === 'highlight') {
          ctx.globalAlpha = 0.35;
          ctx.fillStyle   = c;
          ctx.fillRect(mark.x1, mark.y1, mark.x2 - mark.x1, mark.y2 - mark.y1);
          ctx.globalAlpha = 1;
        }
      });

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = reject;
    img.src = photoDataUrl;
  });
}
