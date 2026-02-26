/**
 * AnnotateScreen.jsx
 *
 * Full-screen photo annotation canvas.
 *
 * Responsibilities:
 *  - Render the photo as the canvas background (full-screen, dark backdrop)
 *  - Two annotation tools: Circle (drag to draw ellipse) and Draw (freehand)
 *  - All marks drawn in --annotation red (#FF3B30) per PRD
 *  - Undo button removes the last mark
 *  - Comment input pinned above Save button
 *  - Save → calls saveAnnotations() in context and returns to AreaScreen
 *
 * Implementation note:
 *  Annotation objects stored as:
 *    { type: 'ellipse', x, y, rx, ry }
 *    { type: 'path', points: [{x, y}] }
 *  These are re-drawn on the canvas on every render via useEffect.
 *  The canvas itself is NOT stored — only the annotation descriptors.
 *  On save, the composite image (photo + annotations) is rendered into
 *  a separate offscreen canvas to produce the annotated dataUrl stored
 *  alongside the raw photo. (TODO: implement in phase 2 if needed.)
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { useAudit } from '../../context/AuditContext';
import { getArea }  from '../../data/areas';
import './AnnotateScreen.css';

const TOOL = { CIRCLE: 'circle', DRAW: 'draw' };
const ANNOTATION_COLOR = '#FF3B30';
const LINE_WIDTH = 3;

export default function AnnotateScreen({ areaId, photoId, onBack }) {
  const { audit, saveAnnotations } = useAudit();
  const area   = getArea(areaId);
  const photo  = (audit.areaPhotos[areaId] || []).find(p => p.id === photoId);

  const canvasRef  = useRef(null);
  const imageRef   = useRef(null);   // loaded Image object

  const [tool, setTool]             = useState(TOOL.CIRCLE);
  const [annotations, setAnnotations] = useState(photo?.annotations || []);
  const [comment, setComment]       = useState(photo?.comment || '');
  const [drawing, setDrawing]       = useState(false);
  const [currentMark, setCurrentMark] = useState(null); // in-progress mark

  // ── Draw everything onto canvas ───────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = ANNOTATION_COLOR;
    ctx.lineWidth   = LINE_WIDTH;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    const allMarks = currentMark ? [...annotations, currentMark] : annotations;

    allMarks.forEach(mark => {
      ctx.beginPath();
      if (mark.type === 'ellipse') {
        ctx.ellipse(mark.x, mark.y, mark.rx, mark.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (mark.type === 'path' && mark.points.length > 1) {
        ctx.moveTo(mark.points[0].x, mark.points[0].y);
        mark.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    });
  }, [annotations, currentMark]);

  // ── Load image and set canvas size ───────────────────────────
  useEffect(() => {
    if (!photo) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      redraw();
    };
    img.src = photo.dataUrl;
  }, [photo]); // eslint-disable-line

  useEffect(() => { redraw(); }, [redraw]);

  // ── Pointer helpers ───────────────────────────────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    setDrawing(true);
    const pos = getPos(e);
    if (tool === TOOL.CIRCLE) {
      setCurrentMark({ type: 'ellipse', x: pos.x, y: pos.y, rx: 0, ry: 0, startX: pos.x, startY: pos.y });
    } else {
      setCurrentMark({ type: 'path', points: [pos] });
    }
  };

  const onPointerMove = (e) => {
    if (!drawing || !currentMark) return;
    e.preventDefault();
    const pos = getPos(e);
    if (tool === TOOL.CIRCLE) {
      setCurrentMark(prev => ({
        ...prev,
        rx: Math.abs(pos.x - prev.startX) / 2,
        ry: Math.abs(pos.y - prev.startY) / 2,
        x:  (pos.x + prev.startX) / 2,
        y:  (pos.y + prev.startY) / 2,
      }));
    } else {
      setCurrentMark(prev => ({ ...prev, points: [...prev.points, pos] }));
    }
  };

  const onPointerUp = (e) => {
    if (!drawing || !currentMark) return;
    e.preventDefault();
    // Strip helper fields before storing
    const { startX, startY, ...cleanMark } = currentMark;
    setAnnotations(prev => [...prev, cleanMark]);
    setCurrentMark(null);
    setDrawing(false);
  };

  const undo = () => setAnnotations(prev => prev.slice(0, -1));

  const handleSave = () => {
    saveAnnotations(areaId, photoId, annotations, comment);
    onBack();
  };

  if (!photo) return null;

  return (
    <div className="annotate-screen">

      {/* ── Top bar ── */}
      <div className="annotate-topbar">
        <button className="btn-back-annotate" onClick={onBack}>‹ Back</button>
        <span className="annotate-area-label">{area?.label}</span>
        <button
          className="btn-undo"
          onClick={undo}
          disabled={annotations.length === 0}
        >
          Undo ({annotations.length})
        </button>
      </div>

      {/* ── Canvas ── */}
      <div className="annotate-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="annotate-canvas"
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />
      </div>

      {/* ── Bottom bar: tools + comment + save ── */}
      <div className="annotate-bottombar">
        {/* Tool selector */}
        <div className="tool-row">
          <button
            className={`btn-tool ${tool === TOOL.CIRCLE ? 'active' : ''}`}
            onClick={() => setTool(TOOL.CIRCLE)}
          >
            ⭕ Circle
          </button>
          <button
            className={`btn-tool ${tool === TOOL.DRAW ? 'active' : ''}`}
            onClick={() => setTool(TOOL.DRAW)}
          >
            ✏️ Draw
          </button>
        </div>

        {/* Comment */}
        <textarea
          className="annotate-comment"
          placeholder="Add a comment about this photo…"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={2}
        />

        {/* Save */}
        <button className="btn-save" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
