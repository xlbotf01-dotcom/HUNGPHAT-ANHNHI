import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, 
  MousePointer, 
  StickyNote, 
  Square, 
  Circle, 
  Type, 
  Download, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Trash2,
  Plus
} from 'lucide-react';
import { CanvasData, CanvasItem, CanvasStroke, CanvasSticky, CanvasShape, CanvasText, CanvasTool } from '../types';

interface CanvasEditorProps {
  data: CanvasData;
  onChange: (data: CanvasData) => void;
  isFocusMode: boolean;
}

const STICKY_COLORS = [
  '#FEF08A', // Yellow
  '#BAE6FD', // Sky blue
  '#BBF7D0', // Mint green
  '#FBCFE8', // Rose pink
  '#FED7AA', // Peach orange
  '#E9D5FF', // Lavender
];

const PEN_COLORS = [
  '#0F172A', // Slate
  '#2563EB', // Blue
  '#16A34A', // Green
  '#DC2626', // Red
  '#D97706', // Amber
  '#9333EA', // Purple
];

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  data,
  onChange,
  isFocusMode,
}) => {
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');
  const [penColor, setPenColor] = useState('#0F172A');
  const [penSize, setPenSize] = useState(3);
  const [stickyColor, setStickyColor] = useState('#FEF08A');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw strokes onto background HTML5 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom & pan
    ctx.save();
    ctx.scale(data.zoom, data.zoom);
    ctx.translate(data.panX, data.panY);

    // Render strokes
    data.items.forEach((item) => {
      if (item.type === 'stroke') {
        const stroke = item as CanvasStroke;
        if (stroke.points.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    });

    // Render active drawing stroke
    if (isDrawing && currentPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [data.items, data.zoom, data.panX, data.panY, isDrawing, currentPoints, penColor, penSize]);

  // Adjust canvas resolution to element dimensions
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;
    return {
      x: (rawX / data.zoom) - data.panX,
      y: (rawY / data.zoom) - data.panY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (activeTool === 'pen') {
      setIsDrawing(true);
      setCurrentPoints([coords]);
    } else if (activeTool === 'sticky') {
      const newSticky: CanvasSticky = {
        id: `sticky-${Date.now()}`,
        type: 'sticky',
        x: coords.x - 90,
        y: coords.y - 70,
        width: 190,
        height: 150,
        text: 'New Note',
        color: stickyColor,
      };
      onChange({ ...data, items: [...data.items, newSticky] });
      setSelectedItemId(newSticky.id);
      setActiveTool('select');
    } else if (activeTool === 'rect' || activeTool === 'circle') {
      const newShape: CanvasShape = {
        id: `shape-${Date.now()}`,
        type: 'shape',
        shapeType: activeTool,
        x: coords.x - 80,
        y: coords.y - 50,
        width: 160,
        height: 100,
        fillColor: '#FFFFFF',
        strokeColor: '#0F172A',
        label: 'Process Block',
      };
      onChange({ ...data, items: [...data.items, newShape] });
      setSelectedItemId(newShape.id);
      setActiveTool('select');
    } else if (activeTool === 'text') {
      const newText: CanvasText = {
        id: `text-${Date.now()}`,
        type: 'text',
        x: coords.x,
        y: coords.y,
        text: 'Label',
        color: '#0F172A',
        fontSize: 16,
      };
      onChange({ ...data, items: [...data.items, newText] });
      setSelectedItemId(newText.id);
      setActiveTool('select');
    } else if (activeTool === 'select') {
      // Click on background deselects
      if (e.target === canvasRef.current) {
        setSelectedItemId(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (isDrawing) {
      setCurrentPoints((prev) => [...prev, coords]);
    } else if (draggingItem) {
      const newX = coords.x - draggingItem.offsetX;
      const newY = coords.y - draggingItem.offsetY;

      const updated = data.items.map((item) => {
        if (item.id === draggingItem.id) {
          return { ...item, x: newX, y: newY };
        }
        return item;
      });
      onChange({ ...data, items: updated });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPoints.length > 0) {
      const newStroke: CanvasStroke = {
        id: `stroke-${Date.now()}`,
        type: 'stroke',
        points: currentPoints,
        color: penColor,
        size: penSize,
      };
      onChange({ ...data, items: [...data.items, newStroke] });
      setIsDrawing(false);
      setCurrentPoints([]);
    }
    setDraggingItem(null);
  };

  const startDragItem = (e: React.MouseEvent, item: CanvasItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    if ('x' in item && 'y' in item) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDraggingItem({
        id: item.id,
        offsetX: coords.x - item.x,
        offsetY: coords.y - item.y,
      });
    }
  };

  const updateItemText = (id: string, text: string) => {
    const updated = data.items.map((item) => {
      if (item.id === id) {
        if (item.type === 'sticky') return { ...item, text };
        if (item.type === 'shape') return { ...item, label: text };
        if (item.type === 'text') return { ...item, text };
      }
      return item;
    });
    onChange({ ...data, items: updated });
  };

  const deleteSelectedItem = () => {
    if (!selectedItemId) return;
    const updated = data.items.filter((i) => i.id !== selectedItemId);
    onChange({ ...data, items: updated });
    setSelectedItemId(null);
  };

  const handleClearAll = () => {
    if (confirm('Clear everything on this blank canvas?')) {
      onChange({ ...data, items: [] });
      setSelectedItemId(null);
    }
  };

  const handleUndo = () => {
    if (data.items.length === 0) return;
    const updated = [...data.items];
    updated.pop();
    onChange({ ...data, items: updated });
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an export canvas with solid white background and all items
    const expCanvas = document.createElement('canvas');
    expCanvas.width = canvas.width;
    expCanvas.height = canvas.height;
    const ctx = expCanvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, expCanvas.width, expCanvas.height);

    // Draw background strokes
    ctx.drawImage(canvas, 0, 0);

    // Draw DOM elements (stickies, shapes, text)
    data.items.forEach((item) => {
      if (item.type === 'sticky') {
        const s = item as CanvasSticky;
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, s.width, s.height);
        ctx.strokeStyle = '#D1D5DB';
        ctx.strokeRect(s.x, s.y, s.width, s.height);
        ctx.fillStyle = '#111827';
        ctx.font = '14px sans-serif';
        const lines = s.text.split('\n');
        lines.forEach((line, lIdx) => {
          ctx.fillText(line, s.x + 12, s.y + 24 + lIdx * 18);
        });
      } else if (item.type === 'shape') {
        const sh = item as CanvasShape;
        ctx.fillStyle = sh.fillColor;
        ctx.strokeStyle = sh.strokeColor;
        ctx.lineWidth = 2;
        if (sh.shapeType === 'rect') {
          ctx.fillRect(sh.x, sh.y, sh.width, sh.height);
          ctx.strokeRect(sh.x, sh.y, sh.width, sh.height);
        } else {
          ctx.beginPath();
          ctx.arc(sh.x + sh.width / 2, sh.y + sh.height / 2, sh.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        if (sh.label) {
          ctx.fillStyle = '#111827';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(sh.label, sh.x + sh.width / 2, sh.y + sh.height / 2 + 5);
          ctx.textAlign = 'left';
        }
      } else if (item.type === 'text') {
        const t = item as CanvasText;
        ctx.fillStyle = t.color;
        ctx.font = `${t.fontSize}px sans-serif`;
        ctx.fillText(t.text, t.x, t.y + 16);
      }
    });

    const link = document.createElement('a');
    link.download = `${data.title || 'blank-canvas'}.png`;
    link.href = expCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-neutral-100 dark:bg-neutral-950 select-none overflow-hidden transition-colors">
      {/* Canvas Tool Toolbar */}
      {!isFocusMode && (
        <div className="sticky top-[57px] z-20 flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-xs text-xs text-neutral-600 dark:text-neutral-400">
          {/* Tool switchers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTool('select')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTool === 'select' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Select & Move (V)"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Select</span>
            </button>
            <button
              onClick={() => setActiveTool('pen')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTool === 'pen' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Draw Pen (P)"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Pen</span>
            </button>
            <button
              onClick={() => setActiveTool('sticky')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTool === 'sticky' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Sticky Note (S)"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-500" />
              <span>Sticky</span>
            </button>
            <button
              onClick={() => setActiveTool('rect')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTool === 'rect' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Rectangle Box"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Box</span>
            </button>
            <button
              onClick={() => setActiveTool('circle')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTool === 'circle' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Circle Shape"
            >
              <Circle className="w-3.5 h-3.5" />
              <span>Circle</span>
            </button>
            <button
              onClick={() => setActiveTool('text')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTool === 'text' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Text Label"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>

            {/* Separator */}
            <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1.5" />

            {/* Pen Options if active */}
            {activeTool === 'pen' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {PEN_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setPenColor(c)}
                      className={`w-4 h-4 rounded-full border border-black/10 transition-transform ${
                        penColor === c ? 'scale-125 ring-2 ring-neutral-400' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 ml-1 text-xs">
                  <button
                    onClick={() => setPenSize(2)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${penSize === 2 ? 'bg-neutral-200 dark:bg-neutral-700 font-bold' : ''}`}
                  >
                    Fine
                  </button>
                  <button
                    onClick={() => setPenSize(4)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${penSize === 4 ? 'bg-neutral-200 dark:bg-neutral-700 font-bold' : ''}`}
                  >
                    Med
                  </button>
                  <button
                    onClick={() => setPenSize(8)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${penSize === 8 ? 'bg-neutral-200 dark:bg-neutral-700 font-bold' : ''}`}
                  >
                    Thick
                  </button>
                </div>
              </div>
            )}

            {/* Sticky Colors if active */}
            {activeTool === 'sticky' && (
              <div className="flex items-center gap-1">
                {STICKY_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setStickyColor(c)}
                    className={`w-4 h-4 rounded-full border border-black/10 transition-transform ${
                      stickyColor === c ? 'scale-125 ring-2 ring-neutral-400' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action buttons (Undo, Clear, Delete, Zoom, Export) */}
          <div className="flex items-center gap-2">
            {selectedItemId && (
              <button
                onClick={deleteSelectedItem}
                title="Delete selected item"
                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Delete</span>
              </button>
            )}

            <button
              onClick={handleUndo}
              title="Undo last item"
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleClearAll}
              title="Clear entire canvas"
              className="px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-400 text-xs transition-colors"
            >
              Clear
            </button>

            <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />

            {/* Zoom controls */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => onChange({ ...data, zoom: Math.max(0.5, data.zoom - 0.1) })}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] tabular-nums min-w-[36px] text-center">
                {Math.round(data.zoom * 100)}%
              </span>
              <button
                onClick={() => onChange({ ...data, zoom: Math.min(2.0, data.zoom + 0.1) })}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export PNG */}
            <button
              onClick={handleExportPNG}
              className="px-2.5 py-1 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PNG</span>
            </button>
          </div>
        </div>
      )}

      {/* Canvas Viewport */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative flex-1 w-full h-full cursor-crosshair overflow-hidden bg-dot-pattern"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Background stroke canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />

        {/* DOM Interactive Elements (Sticky notes, shapes, text) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `scale(${data.zoom}) translate(${data.panX}px, ${data.panY}px)`,
            transformOrigin: '0 0',
          }}
        >
          {data.items.map((item) => {
            if (item.type === 'sticky') {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => startDragItem(e, item)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    backgroundColor: item.color,
                  }}
                  className={`pointer-events-auto rounded-lg shadow-md p-3 flex flex-col cursor-move transition-shadow ${
                    isSelected ? 'ring-2 ring-neutral-900 shadow-xl' : ''
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-black/10 text-[10px] text-neutral-600">
                    <span className="font-mono">Sticky Note</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange({ ...data, items: data.items.filter((i) => i.id !== item.id) });
                      }}
                      className="hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    value={item.text}
                    onChange={(e) => updateItemText(item.id, e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full flex-1 bg-transparent resize-none outline-none text-xs text-neutral-900 font-sans mt-2"
                    placeholder="Write ideas..."
                  />
                </div>
              );
            }

            if (item.type === 'shape') {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => startDragItem(e, item)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    backgroundColor: item.fillColor,
                    borderColor: item.strokeColor,
                    borderRadius: item.shapeType === 'circle' ? '9999px' : '8px',
                  }}
                  className={`pointer-events-auto border-2 flex items-center justify-center p-2 cursor-move transition-shadow ${
                    isSelected ? 'ring-2 ring-neutral-900 shadow-md' : 'shadow-xs'
                  }`}
                >
                  <input
                    type="text"
                    value={item.label || ''}
                    onChange={(e) => updateItemText(item.id, e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full bg-transparent text-center text-xs font-medium text-neutral-800 outline-none"
                    placeholder="Label..."
                  />
                </div>
              );
            }

            if (item.type === 'text') {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => startDragItem(e, item)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                  }}
                  className={`pointer-events-auto cursor-move ${
                    isSelected ? 'ring-1 ring-neutral-900 rounded px-1' : ''
                  }`}
                >
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateItemText(item.id, e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="bg-transparent text-sm font-semibold text-neutral-900 outline-none"
                    placeholder="Text..."
                  />
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};
