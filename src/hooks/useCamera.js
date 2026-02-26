/**
 * useCamera.js
 *
 * Hook that abstracts camera capture into a Promise-based API.
 *
 * Usage:
 *   const { capture } = useCamera();
 *   const dataUrl = await capture();   // opens camera, resolves with base64 image
 *
 * Internally, it creates a hidden <input type="file" capture="environment">
 * and removes it after capture. This avoids keeping a ref on the caller side.
 *
 * Note: On iOS Safari, the file picker opens the camera app directly
 * when `capture="environment"` is set. On Android it opens the camera in-app.
 */

import { useCallback } from 'react';
import { compressImage } from '../utils/imageUtils';

export function useCamera({ maxWidth = 1200, quality = 0.82 } = {}) {
  const capture = useCallback(() => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type    = 'file';
      input.accept  = 'image/*';
      input.capture = 'environment';
      input.style.display = 'none';
      document.body.appendChild(input);

      input.onchange = async () => {
        const file = input.files?.[0];
        document.body.removeChild(input);
        if (!file) { reject(new Error('No file selected')); return; }

        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const compressed = await compressImage(ev.target.result, maxWidth, quality);
            resolve(compressed);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        reject(new Error('Camera cancelled'));
      };

      input.click();
    });
  }, [maxWidth, quality]);

  return { capture };
}
