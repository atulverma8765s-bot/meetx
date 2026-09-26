import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Edit3, Eraser, Trash2, Undo } from 'lucide-react';

export const WhiteboardDrawer = ({
  isOpen,
  onClose,
  history,
  onDraw,
  onClear
}) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [color, setColor] = useState('#1a73e8'); // Google Blue
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const colors = [
    '#ffffff', // White
    '#1a73e8', // Blue
    '#ea4335', // Red
    '#34a853', // Green
    '#fbbc04', // Yellow
    '#a142f4', // Purple
  ];

  // Draw a line segment on canvas
  const drawSegment = useCallback((data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(data.x0 * canvas.width, data.y0 * canvas.height);
    ctx.lineTo(data.x1 * canvas.width, data.y1 * canvas.height);
    ctx.strokeStyle = data.isEraser ? '#202124' : data.color;
    ctx.lineWidth = data.isEraser ? data.lineWidth * 3 : data.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }, []);

  // Replay history whenever history changes or drawer opens
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = '#202124';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Replay segments
    history.forEach((seg) => {
      drawSegment(seg);
    });
  }, [isOpen, history, drawSegment]);

  if (!isOpen) return null;

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height
    };
  };

  const handleStart = (e) => {
    isDrawing.current = true;
    const pos = getCoordinates(e);
    lastPos.current = pos;
  };

  const handleMove = (e) => {
    if (!isDrawing.current) return;
    const currentPos = getCoordinates(e);

    const segment = {
      x0: lastPos.current.x,
      y0: lastPos.current.y,
      x1: currentPos.x,
      y1: currentPos.y,
      color,
      lineWidth,
      isEraser
    };

    drawSegment(segment);
    onDraw(segment);
    lastPos.current = currentPos;
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

  return (
    <div className="w-80 md:w-[480px] h-full bg-[#28292c] border-l border-[#3c4043] flex flex-col z-30 shrink-0 select-none">
      {/* Drawer Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#3c4043]">
        <h3 className="text-base font-medium text-white flex items-center gap-2">
          <span>Collaborative Whiteboard</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Whiteboard Controls Toolbar */}
      <div className="px-4 py-3 bg-[#202124] border-b border-[#3c4043] flex items-center justify-between gap-2 overflow-x-auto">
        {/* Pen & Eraser Tools */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsEraser(false)}
            className={`p-2 rounded-lg transition-colors ${
              !isEraser ? 'bg-[#3c4043] text-meet-blue' : 'text-[#9aa0a6] hover:text-white'
            }`}
            title="Pen"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEraser(true)}
            className={`p-2 rounded-lg transition-colors ${
              isEraser ? 'bg-[#3c4043] text-meet-blue' : 'text-[#9aa0a6] hover:text-white'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette (only active if not eraser) */}
        {!isEraser && (
          <div className="flex items-center gap-1.5 shrink-0 px-2 border-x border-[#3c4043]">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        {/* Thickness Selector */}
        <div className="flex items-center gap-1 shrink-0">
          {[2, 4, 8].map((size) => (
            <button
              key={size}
              onClick={() => setLineWidth(size)}
              className={`w-6 h-6 rounded flex items-center justify-center ${
                lineWidth === size ? 'bg-[#3c4043]' : 'hover:bg-[#3c4043]/50'
              }`}
            >
              <div
                className="rounded-full bg-white"
                style={{ width: `${size * 1.5}px`, height: `${size * 1.5}px` }}
              />
            </button>
          ))}
        </div>

        {/* Clear Canvas */}
        <button
          onClick={onClear}
          className="p-2 rounded-lg text-meet-red hover:bg-meet-red/20 transition-colors shrink-0"
          title="Clear Board for Everyone"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Drawing Canvas */}
      <div className="flex-1 p-3 flex items-center justify-center bg-[#1e1f21] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="w-full h-full bg-[#202124] rounded-xl border border-[#3c4043] cursor-crosshair touch-none shadow-inner"
        />
      </div>
    </div>
  );
};
