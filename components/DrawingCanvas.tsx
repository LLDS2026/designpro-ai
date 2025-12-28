
import React, { useRef, useState, useEffect } from 'react';

type Tool = 'line' | 'rect' | 'circle' | 'pen' | 'eraser';

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('line');
  const [color, setColor] = useState('#3b82f6');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to parent container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        drawGrid(ctx, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 0.5;
    const step = 25;

    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const getPos = (e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
      ctx.beginPath();
      ctx.lineWidth = tool === 'eraser' ? 20 : 2;
      ctx.strokeStyle = tool === 'eraser' ? '#1a202c' : color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getPos(e);
    setMousePos(pos);
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !snapshot) return;

    // Restore previous state before drawing preview
    if (tool !== 'pen' && tool !== 'eraser') {
      ctx.putImageData(snapshot, 0, 0);
    }

    ctx.beginPath();
    ctx.lineWidth = tool === 'eraser' ? 20 : 2;
    ctx.strokeStyle = tool === 'eraser' ? '#1a202c' : color;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'line') {
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'rect') {
      ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvas.width, canvas.height);
    }
  };

  return (
    <div className="relative w-full h-full group">
      {/* Tool Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-2 bg-gray-800/80 backdrop-blur border border-gray-700 rounded-xl shadow-xl">
        {(['pen', 'line', 'rect', 'circle', 'eraser'] as Tool[]).map((t) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={`p-2 rounded-lg transition ${tool === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            title={t}
          >
            {t === 'pen' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2}/></svg>}
            {t === 'line' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 19L19 5" strokeWidth={2}/></svg>}
            {t === 'rect' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="14" height="14" x="5" y="5" rx="1" strokeWidth={2}/></svg>}
            {t === 'circle' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="8" strokeWidth={2}/></svg>}
            {t === 'eraser' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 6L6 19M19 19L6 6" strokeWidth={2}/></svg>}
          </button>
        ))}
        <div className="h-px bg-gray-700 my-1" />
        <button onClick={clearCanvas} className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition" title="Clear">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2}/></svg>
        </button>
      </div>

      {/* Color Picker Overlay */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 p-2 bg-gray-800/80 backdrop-blur border border-gray-700 rounded-xl shadow-xl">
        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ffffff'].map(c => (
          <button 
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 transition ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Coordinate Indicator */}
      <div className="absolute bottom-4 right-4 z-10 px-3 py-1 bg-gray-800/80 backdrop-blur border border-gray-700 rounded-lg text-[10px] font-mono text-gray-400">
        X: {Math.round(mousePos.x)} | Y: {Math.round(mousePos.y)}
      </div>

      {/* Export Hint */}
      <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-blue-600/90 text-white rounded-lg text-xs font-bold animate-pulse shadow-lg shadow-blue-900/50">
        語音說：「幫我存到雲端」即可導出
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="block cursor-crosshair bg-gray-900"
      />
    </div>
  );
};

export default DrawingCanvas;
