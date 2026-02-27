/**
 * AnnotateScreen.jsx
 *
 * Full-screen photo annotation canvas.
 *
 * Responsibilities:
 *  - Render the photo as the canvas background (full-screen, dark backdrop)
 *  - Four annotation tools: Circle, Square (rect), Draw (freehand), Highlight
 *  - Marks drawn in user-selected color (5-swatch palette, red default)
 *  - Undo button removes the last mark
 *  - Comment input pinned above Save button
 *  - Save → calls saveAnnotations() in context and returns to AreaScreen
 *
 * Annotation objects stored as:
 *   { type: 'ellipse',   x, y, rx, ry,        color }
 *   { type: 'path',      points: [{x,y}...],   color }
 *   { type: 'rect',      x1, y1, x2, y2,       color }
 *   { type: 'highlight', x1, y1, x2, y2,       color }
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { useAudit } from '../../context/AuditContext';
import { getArea }  from '../../data/areas';
import './AnnotateScreen.css';

const TOOL = { CIRCLE: 'circle', RECT: 'rect', DRAW: 'draw', HIGHLIGHT: 'highlight' };

const PALETTE = [
  { id: 'red',    hex: '#FF3B30' },
  { id: 'yellow', hex: '#FFCC00' },
  { id: 'blue',   hex: '#007AFF' },
  { id: 'green',  hex: '#34C759' },
  { id: 'white',  hex: '#FFFFFF' },
];

const LINE_WIDTH = 3;

export default function AnnotateScreen({ areaId, photoId, onBack }) {
  const { audit, saveAnnotations } = useAudit();
  const area   = getArea(areaId);
  const photo  = (audit.areaPhotos[areaId] || []).find(p => p.id === photoId);

  const canvasRef  = useRef(null);
  const imageRef   = useRef(null);   // loaded Image object

  const [tool, setTool]               = useState(TOOL.CIRCLE);
  const [color, setColor]             = useState(PALETTE[0].hex);
  const [annotations, setAnnotations] = useState(photo?.annotations || []);
  const [comment, setComment]         = useState(photo?.comment || '');
  const [drawing, setDrawing]         = useState(false);
  const [currentMark, setCurrentMark] = useState(null); // in-progress mark

  // ── Draw everything onto canvas ───────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';

    const allMarks = currentMark ? [...annotations, currentMark] : annotations;

    allMarks.forEach(mark => {
      const c = mark.color ?? '#FF3B30';

      if (mark.type === 'ellipse') {
        ctx.strokeStyle = c;
        ctx.lineWidth   = LINE_WIDTH;
        ctx.beginPath();
        ctx.ellipse(mark.x, mark.y, mark.rx, mark.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (mark.type === 'path' && mark.points.length > 1) {
        ctx.strokeStyle = c;
        ctx.lineWidth   = LINE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(mark.points[0].x, mark.points[0].y);
        mark.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } else if (mark.type === 'rect') {
        ctx.strokeStyle = c;
        ctx.lineWidth   = LINE_WIDTH;
        ctx.strokeRect(mark.x1, mark.y1, mark.x2 - mark.x1, mark.y2 - mark.y1);
      } else if (mark.type === 'highlight') {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle   = c;
        ctx.fillRect(mark.x1, mark.y1, mark.x2 - mark.x1, mark.y2 - mark.y1);
        ctx.globalAlpha = 1;
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
      setCurrentMark({ type: 'ellipse', x: pos.x, y: pos.y, rx: 0, ry: 0,
                       startX: pos.x, startY: pos.y, color });
    } else if (tool === TOOL.RECT || tool === TOOL.HIGHLIGHT) {
      setCurrentMark({ type: tool === TOOL.RECT ? 'rect' : 'highlight',
                       x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y,
                       startX: pos.x, startY: pos.y, color });
    } else {
      setCurrentMark({ type: 'path', points: [pos], color });
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
    } else if (tool === TOOL.RECT || tool === TOOL.HIGHLIGHT) {
      setCurrentMark(prev => ({ ...prev, x2: pos.x, y2: pos.y }));
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

      {/* ── Bottom bar: tools + color + comment + save ── */}
      <div className="annotate-bottombar">
        {/* Tool selector */}
        <div className="tool-row">
          <button className={`btn-tool ${tool === TOOL.CIRCLE    ? 'active' : ''}`} onClick={() => setTool(TOOL.CIRCLE)}>⭕ Circle</button>
          <button className={`btn-tool ${tool === TOOL.RECT      ? 'active' : ''}`} onClick={() => setTool(TOOL.RECT)}>▢ Square</button>
          <button className={`btn-tool ${tool === TOOL.DRAW      ? 'active' : ''}`} onClick={() => setTool(TOOL.DRAW)}>✏️ Draw</button>
          <button className={`btn-tool ${tool === TOOL.HIGHLIGHT ? 'active' : ''}`} onClick={() => setTool(TOOL.HIGHLIGHT)}>⬛ Hi-lite</button>
        </div>

        {/* Color palette */}
        <div className="color-row">
          {PALETTE.map(p => (
            <button
              key={p.id}
              className={`btn-color ${color === p.hex ? 'active' : ''}`}
              style={{ background: p.hex }}
              onClick={() => setColor(p.hex)}
              aria-label={p.id}
            />
          ))}
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
