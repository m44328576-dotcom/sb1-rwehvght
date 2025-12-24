import { useEffect, useRef, useState } from 'react';
import { supabase, Pixel } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PixelGridProps {
  onPixelClick: (pixel: Pixel | null) => void;
}

export function PixelGrid({ onPixelClick }: PixelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<Map<number, Pixel>>(new Map());
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { user } = useAuth();

  const GRID_SIZE = 1000;
  const PIXEL_SIZE = 10;

  useEffect(() => {
    loadPixelData();
  }, []);

  const loadPixelData = async () => {
    const { data, error } = await supabase
      .from('pixels')
      .select('*')
      .limit(1000);

    if (error) {
      console.error('Error loading pixels:', error);
      return;
    }

    const pixelMap = new Map<number, Pixel>();
    data?.forEach((pixel) => {
      pixelMap.set(pixel.id, pixel as Pixel);
    });
    setPixels(pixelMap);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const pixelId = y * GRID_SIZE + x + 1;
        const pixel = pixels.get(pixelId);

        if (pixel?.owner_id) {
          if (pixel.content_type === 'nft') {
            ctx.fillStyle = '#8b5cf6';
          } else if (pixel.content_type === 'ad') {
            ctx.fillStyle = '#3b82f6';
          } else {
            ctx.fillStyle = '#10b981';
          }
        } else {
          ctx.fillStyle = '#1e293b';
        }

        if (pixel?.is_for_sale) {
          ctx.fillStyle = '#f59e0b';
        }

        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE - 0.5, PIXEL_SIZE - 0.5);
      }
    }

    ctx.restore();
  }, [pixels, zoom, offset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    const pixelX = Math.floor(x / PIXEL_SIZE);
    const pixelY = Math.floor(y / PIXEL_SIZE);

    if (pixelX >= 0 && pixelX < GRID_SIZE && pixelY >= 0 && pixelY < GRID_SIZE) {
      const pixelId = pixelY * GRID_SIZE + pixelX + 1;
      const pixel = pixels.get(pixelId);

      if (pixel) {
        onPixelClick(pixel);
      } else {
        const newPixel: Pixel = {
          id: pixelId,
          x: pixelX,
          y: pixelY,
          owner_id: null,
          current_price: 1.0,
          purchase_price: 1.0,
          content_type: 'empty',
          content_url: null,
          nft_token_id: null,
          is_for_sale: true,
          times_sold: 0,
          last_sale_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        onPixelClick(newPixel);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * delta)));
  };

  return (
    <div className="relative w-full h-full bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      <div className="absolute top-4 right-4 bg-slate-800 bg-opacity-90 rounded-lg p-4 shadow-lg">
        <div className="text-white space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-800 rounded"></div>
            <span className="text-sm">متاح للشراء</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-sm">معروض للبيع</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-sm">مملوك</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">إعلان</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-violet-500 rounded"></div>
            <span className="text-sm">NFT</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-slate-800 bg-opacity-90 rounded-lg p-2 shadow-lg">
        <div className="text-white text-sm">
          التكبير: {(zoom * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
